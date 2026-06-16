/* ═══════════════════════════════════════════════════════════════
   SiliconAperture — script.js
   Single-image photogrammetry using the pinhole camera model.
   Formula: real_size = distance × tan( px_span/img_w × sensor_w/focal_len )
   ═══════════════════════════════════════════════════════════════ */

/* ─── DOM REFS ───────────────────────────────────────────────── */
const canvas     = document.getElementById('image-canvas');
const ctx        = canvas.getContext('2d');
const container  = document.getElementById('image-container');
const overlay    = document.getElementById('drop-overlay');
const fileInput  = document.getElementById('file-input');
const resultBar  = document.getElementById('result-bar');
const valEl      = document.getElementById('result-value');
const unitEl     = document.getElementById('result-unit');

/* ─── TOAST ──────────────────────────────────────────────────── */
const toastCounts = new Map();
const TOAST_DURATION = 5500;
const TOAST_MAX_STACK = 3;

function updateSensorSourceBadges() {
  const active = new Set();
  ['sensor-w-input', 'sensor-h-input', 'focal-length-input'].forEach(id => {
    const cl = document.getElementById(id).classList;
    if (cl.contains('source-exif'))   active.add('exif');
    if (cl.contains('source-db'))     active.add('db');
    if (cl.contains('source-manual')) active.add('custom');
  });
  ['exif', 'db', 'custom'].forEach(t => {
    document.getElementById('src-' + t).classList.toggle('active', active.has(t));
  });
}

function setInputSource(id, type) {
  const el = document.getElementById(id);
  el.classList.remove('source-exif', 'source-db', 'source-manual');
  if (type) el.classList.add('source-' + type);
  updateSensorSourceBadges();
}

function showToast(msg, type = 'error', duration = TOAST_DURATION) {
  const count = toastCounts.get(msg) || 0;
  if (count >= TOAST_MAX_STACK) return;
  toastCounts.set(msg, count + 1);

  const item = document.createElement('div');
  item.className = 'toast-item' + (type === 'success' ? ' toast-success' : '');

  const span = document.createElement('span');
  span.textContent = msg;

  const btn = document.createElement('button');
  btn.className = 'toast-close';
  btn.setAttribute('aria-label', 'Dismiss');
  btn.textContent = '×';
  btn.onclick = () => dismissToast(item, msg);

  item.appendChild(span);
  item.appendChild(btn);
  document.getElementById('toast-container').appendChild(item);
  requestAnimationFrame(() => item.classList.add('toast-visible'));
  setTimeout(() => dismissToast(item, msg), duration);
}

function dismissToast(item, msg) {
  if (!item.isConnected) return;
  item.classList.add('toast-hiding');
  item.addEventListener('transitionend', () => {
    item.remove();
    const n = toastCounts.get(msg) || 1;
    if (n <= 1) toastCounts.delete(msg);
    else toastCounts.set(msg, n - 1);
  }, { once: true });
}

/* ─── STATE ──────────────────────────────────────────────────── */
let img   = null;
let markA = null;   // {x, y} in image pixel space
let markB = null;
let scale   = 1;
let offsetX = 0;
let offsetY = 0;
let panStart  = null;
let hasDragged = false;
const DRAG_THRESHOLD = 4;

let sensorW      = null;
let sensorH      = null;
let focalLength  = null;
let pixelSpan = null;
let pixelDx   = null;
let pixelDy   = null;
let distance     = null;
let exifHasFocalLength = false;
let exifGPS      = null;

const CUSTOM_IDX = CAMERA_DB.findIndex(c => c.brand === '—');

let map          = null;
let gpsMarker    = null;
let mapPtA       = null;
let mapPtB       = null;
let mapLine      = null;
let mapMarkers   = [];
let currentTile  = 'esri';
const tileLayers = {};

/* ─── IMAGE LOAD ─────────────────────────────────────────────── */
function loadImage(file) {
  const url = URL.createObjectURL(file);
  const newImg = new Image();
  newImg.onload = () => {
    URL.revokeObjectURL(url);
    img = newImg;
    resizeCanvas();
    fitImage();
    drawCanvas();
    overlay.classList.add('hidden');
    updateStepBar();
    document.getElementById('btn-new-image').disabled = false;
    readExif(file);
  };
  newImg.onerror = () => { URL.revokeObjectURL(url); showToast('Could not load image.'); };
  newImg.src = url;
}

function fitImage() {
  scale   = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight) * 0.92;
  offsetX = (canvas.width  - img.naturalWidth  * scale) / 2;
  offsetY = (canvas.height - img.naturalHeight * scale) / 2;
}

function resizeCanvas() {
  const r = container.getBoundingClientRect();
  canvas.width  = r.width;
  canvas.height = r.height;
}

/* ─── EXIF ───────────────────────────────────────────────────── */
async function readExif(file) {
  if (typeof exifr === 'undefined') return;

  // Run both parses concurrently; gps() is a dedicated path that
  // avoids the pick/GPS IFD conflict that breaks combined parsing.
  const [tags, gps] = await Promise.allSettled([
    exifr.parse(file, {
      pick: [
        'Make', 'Model', 'FocalLength', 'FocalLengthIn35mmFormat',
        'ExifImageWidth', 'ExifImageHeight', 'ImageWidth', 'ImageHeight'
      ]
    }),
    exifr.gps(file)
  ]);

  const t = tags.status === 'fulfilled' ? tags.value : null;
  const g = gps.status  === 'fulfilled' ? gps.value  : null;

  if (!t && !g) return;

  if (t) {
    const camera = [t.Make, t.Model].filter(Boolean).join(' ').trim();
    if (camera) {
      setExifCell('exif-camera-val', camera);
      autoSelectCamera(t.Make, t.Model);
    }

    if (t.FocalLength) {
      exifHasFocalLength = true;
      focalLength = t.FocalLength;
      setExifCell('exif-focal-val', t.FocalLength.toFixed(1) + ' mm');
      document.getElementById('focal-length-input').value = t.FocalLength.toFixed(2);
      setInputSource('focal-length-input', 'exif');
    }
    if (t.FocalLengthIn35mmFormat) {
      const eqEl = document.getElementById('exif-focal-eq');
      eqEl.textContent = `≈ ${Math.round(t.FocalLengthIn35mmFormat)} mm eq`;
    }

    const w = t.ExifImageWidth  || t.ImageWidth;
    const h = t.ExifImageHeight || t.ImageHeight;
    if (w && h) setExifCell('exif-size-val', `${w} × ${h}`);
  }

  // exifr.gps() returns { latitude, longitude } in decimal degrees, or undefined
  if (g && g.latitude !== undefined && g.longitude !== undefined) {
    exifGPS = { lat: g.latitude, lng: g.longitude };
    const gpsEl = document.getElementById('exif-gps-val');
    gpsEl.textContent = `${g.latitude.toFixed(5)}, ${g.longitude.toFixed(5)}`;
    gpsEl.classList.add('has-data', 'clickable');
    gpsEl.onclick = goToGPS;
    // Mark and zoom immediately — map is always initialised at this point
    if (gpsMarker) gpsMarker.remove();
    gpsMarker = L.circleMarker([g.latitude, g.longitude], {
      radius: 7, color: '#e63946', fillColor: '#e63946', fillOpacity: 0.85, weight: 2,
      interactive: false, className: 'gps-pulse-marker'
    }).addTo(map);
    map.setView([g.latitude, g.longitude], 16);
  }

  compute();
  updateDiagram();
}

/* ─── CAMERA AUTOCOMPLETE FROM EXIF ─────────────────────────── */
const BRAND_MAP = {
  apple: 'Apple', samsung: 'Samsung', google: 'Google',
  oneplus: 'OnePlus', xiaomi: 'Xiaomi', dji: 'DJI',
  htc: 'HTC', nokia: 'Nokia',
  sony: 'Sony', canon: 'Canon', nikon: 'Nikon',
  fujifilm: 'Fujifilm', fuji: 'Fujifilm',
  panasonic: 'Panasonic', olympus: 'OM System',
  'om digital': 'OM System', 'om system': 'OM System',
  gopro: 'GoPro', hasselblad: 'Hasselblad', 'phase one': 'Phase One',
};

// Words that distinguish variants within a model line (Pro, Max, Plus…).
// If the label contains one of these but the EXIF model string doesn't,
// it's penalised so a base model doesn't wrongly match a Pro/Max entry.
const VARIANT_WORDS = new Set(['pro', 'max', 'plus', 'ultra', 'fold', 'mini', 'xr', 'xs', 'classic']);

function autoSelectCamera(make, model) {
  const normMake  = (make  || '').toLowerCase();
  const normModel = (model || '').toLowerCase();

  let brand = null;
  for (const [key, val] of Object.entries(BRAND_MAP)) {
    if (normMake.includes(key)) { brand = val; break; }
  }
  if (!brand) return;

  // Keep single-char tokens (e.g. the "7" in "Pixel 7") — that was the bug.
  const modelWords = normModel.split(/[\s\-\/,_]+/).filter(w => /[a-z0-9]/i.test(w));
  const modelSet   = new Set(modelWords);
  if (!modelWords.length) return;

  let bestIdx = -1, bestScore = -Infinity;

  CAMERA_DB.forEach((cam, i) => {
    if (cam.brand !== brand || cam.sensor_w === null) return;
    const normLabel  = cam.label.toLowerCase();
    const matchCount = modelWords.filter(w => normLabel.includes(w)).length;
    if (matchCount === 0) return;

    // Penalise label variant words that the EXIF model doesn't mention.
    const labelWords     = normLabel.split(/[\s\-\/,]+/).filter(w => /[a-z0-9]/i.test(w));
    const extraVariants  = labelWords.filter(w => VARIANT_WORDS.has(w) && !modelSet.has(w)).length;
    const score          = matchCount * 10 - extraVariants;

    if (score > bestScore) { bestScore = score; bestIdx = i; }
  });

  // Require at least one real word match (score ≥ 0 after variant penalty).
  if (bestIdx < 0 || bestScore < 0) return;
  selectCamera(bestIdx);
}

function setExifCell(id, text) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.classList.add('has-data');
}

/* ─── CANVAS DRAW ────────────────────────────────────────────── */
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!img) return;
  ctx.drawImage(img, offsetX, offsetY, img.naturalWidth * scale, img.naturalHeight * scale);

  if (markA && markB) {
    const a = imgToCanvas(markA);
    const b = imgToCanvas(markB);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = 'rgba(230, 57, 70, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  if (markA) drawMark(imgToCanvas(markA), 'A');
  if (markB) drawMark(imgToCanvas(markB), 'B');
}

function drawMark(pt, label) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#e63946';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = 'bold 10px system-ui';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, pt.x, pt.y);
  ctx.restore();
}

function imgToCanvas(pt)      { return { x: pt.x * scale + offsetX, y: pt.y * scale + offsetY }; }
function canvasToImg(cx, cy)  { return { x: (cx - offsetX) / scale, y: (cy - offsetY) / scale  }; }

/* ─── CANVAS INTERACTION ─────────────────────────────────────── */
container.addEventListener('dragover', e => {
  e.preventDefault();
  overlay.classList.add('drag-active');
});
container.addEventListener('dragleave', () => overlay.classList.remove('drag-active'));
container.addEventListener('drop', e => {
  e.preventDefault();
  overlay.classList.remove('drag-active');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
  else showToast('Please drop an image file.');
});

overlay.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadImage(fileInput.files[0]);
  fileInput.value = '';
});

canvas.addEventListener('mousedown', e => {
  if (e.button !== 0 && e.button !== 1) return;
  if (e.button === 1) e.preventDefault(); // suppress autoscroll cursor
  panStart = { x: e.clientX, y: e.clientY };
  hasDragged = false;
});
canvas.addEventListener('mousemove', e => {
  if (!panStart || !(e.buttons & 5)) return; // 1=left, 4=middle
  const dx = e.clientX - panStart.x;
  const dy = e.clientY - panStart.y;
  if (!hasDragged && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
  hasDragged = true;
  offsetX += dx;
  offsetY += dy;
  panStart = { x: e.clientX, y: e.clientY };
  drawCanvas();
});
canvas.addEventListener('mouseup', e => {
  if (e.button === 0 && !hasDragged) handleCanvasClick(e);
  if (e.button === 0 || e.button === 1) panStart = null;
});
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const factor = e.deltaY > 0 ? 0.88 : 1 / 0.88;
  offsetX = mx - (mx - offsetX) * factor;
  offsetY = my - (my - offsetY) * factor;
  scale *= factor;
  drawCanvas();
}, { passive: false });

function handleCanvasClick(e) {
  if (!img) return;
  const rect = canvas.getBoundingClientRect();
  const ip = canvasToImg(e.clientX - rect.left, e.clientY - rect.top);
  if (ip.x < 0 || ip.x > img.naturalWidth || ip.y < 0 || ip.y > img.naturalHeight) return;

  if (!markA) {
    markA = ip;
    updateStepBar();
  } else if (!markB) {
    markB = ip;
    computePixelSpan();
  }
  drawCanvas();
}

function computePixelSpan() {
  if (!markA || !markB) { pixelSpan = null; pixelDx = null; pixelDy = null; return; }
  pixelDx   = markB.x - markA.x;
  pixelDy   = markB.y - markA.y;
  pixelSpan = Math.hypot(pixelDx, pixelDy);
  document.getElementById('pixel-span-input').value = Math.round(pixelSpan);
  document.getElementById('span-source').textContent = 'from canvas';
  document.getElementById('btn-reset-marks').disabled = false;
  compute();
  updateDiagram();
}

/* ─── STEP CHAIN ─────────────────────────────────────────────── */
function updateStepBar() {
  const s1 = img !== null;
  const s2 = sensorW !== null && focalLength !== null;
  const s3 = pixelSpan !== null;
  const s4 = distance !== null;

  [
    { id: 'step-photo',  done: s1,       active: !s1 },
    { id: 'step-sensor', done: s2,       active: s1 && !s2 },
    { id: 'step-mark',   done: s3,       active: s2 && !s3 },
    { id: 'step-dist',   done: s4,       active: s3 && !s4 },
  ].forEach(({ id, done, active }) => {
    const el = document.getElementById(id);
    el.classList.toggle('done',   done);
    el.classList.toggle('active', active && !done);
  });

  document.getElementById('pixel-readout').textContent = s3 ? Math.round(pixelSpan) + ' px' : '';
}

/* ─── CUSTOM CAMERA DROPDOWN ─────────────────────────────────── */
function closeCameraPanel() {
  const panel = document.getElementById('camera-panel');
  if (panel) panel.classList.remove('open');
}

function clearCameraSelection() {
  const trigger = document.getElementById('camera-trigger');
  trigger.textContent = '— select camera / phone —';
  trigger.classList.remove('has-selection');
  document.querySelectorAll('#camera-panel [data-idx]').forEach(el => el.classList.remove('selected'));
}

function selectCamera(idx) {
  const cam = CAMERA_DB[idx];
  if (!cam) return;

  const trigger = document.getElementById('camera-trigger');
  trigger.textContent = cam.label;
  trigger.classList.add('has-selection');
  document.querySelectorAll('#camera-panel [data-idx]').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.idx, 10) === idx);
  });

  if (cam.sensor_w === null) {
    document.getElementById('sensor-w-input').value = '';
    document.getElementById('sensor-h-input').value = '';
    setInputSource('sensor-w-input', '');
    setInputSource('sensor-h-input', '');
    document.getElementById('sensor-w-input').focus();
    sensorW = null; sensorH = null;
  } else {
    document.getElementById('sensor-w-input').value = cam.sensor_w;
    document.getElementById('sensor-h-input').value = cam.sensor_h ?? '';
    setInputSource('sensor-w-input', 'db');
    setInputSource('sensor-h-input', 'db');
    sensorW = cam.sensor_w;
    sensorH = cam.sensor_h ?? null;
  }

  if (cam.focal_length !== null) {
    document.getElementById('focal-length-input').value = cam.focal_length;
    setInputSource('focal-length-input', 'db');
    focalLength = cam.focal_length;
  }

  compute();
  updateDiagram();
}

function populateCameraDropdown() {
  const trigger = document.getElementById('camera-trigger');

  // Panel lives in <body> to avoid overflow clipping inside the controls panel
  const panel = document.createElement('div');
  panel.id = 'camera-panel';
  document.body.appendChild(panel);

  // Custom entry at top
  if (CUSTOM_IDX >= 0) {
    const el = document.createElement('div');
    el.className = 'cam-custom';
    el.textContent = CAMERA_DB[CUSTOM_IDX].label;
    el.dataset.idx = CUSTOM_IDX;
    el.addEventListener('click', () => { selectCamera(CUSTOM_IDX); closeCameraPanel(); });
    panel.appendChild(el);
  }

  // Group by brand (DB order = newest first within each brand)
  const byBrand = {};
  CAMERA_DB.forEach((cam, i) => {
    if (cam.brand === '—') return;
    if (!byBrand[cam.brand]) byBrand[cam.brand] = [];
    byBrand[cam.brand].push({ cam, i });
  });

  const CATEGORIES = {
    'Smartphones': ['Apple', 'Google', 'HTC', 'Nokia', 'OnePlus', 'Samsung', 'Xiaomi'],
    'Cameras':     ['Canon', 'DJI', 'Fujifilm', 'GoPro', 'Hasselblad', 'Nikon', 'OM System', 'Panasonic', 'Phase One', 'Sony'],
  };

  Object.entries(CATEGORIES).forEach(([catName, brands]) => {
    const catHdr = document.createElement('div');
    catHdr.className = 'cam-category-hdr';
    catHdr.textContent = catName;
    panel.appendChild(catHdr);

    brands.forEach(brand => {
      const entries = byBrand[brand];
      if (!entries) return;

      const brandEl  = document.createElement('div');
      brandEl.className = 'cam-brand';

      const brandRow = document.createElement('div');
      brandRow.className = 'cam-brand-row';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = brand;
      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'cam-arrow';
      arrowSpan.textContent = '›';
      brandRow.appendChild(nameSpan);
      brandRow.appendChild(arrowSpan);
      brandRow.addEventListener('click', () => brandEl.classList.toggle('open'));

      const modelsEl = document.createElement('div');
      modelsEl.className = 'cam-models';
      entries.forEach(({ cam, i }) => {
        const modelEl = document.createElement('div');
        modelEl.className = 'cam-model';
        modelEl.textContent = cam.label;
        modelEl.dataset.idx = i;
        modelEl.addEventListener('click', () => { selectCamera(i); closeCameraPanel(); });
        modelsEl.appendChild(modelEl);
      });

      brandEl.appendChild(brandRow);
      brandEl.appendChild(modelsEl);
      panel.appendChild(brandEl);
    });
  });

  // Open / close
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    if (panel.classList.contains('open')) {
      closeCameraPanel();
    } else {
      const r = trigger.getBoundingClientRect();
      panel.style.top   = (r.bottom + 3) + 'px';
      panel.style.left  = r.left + 'px';
      panel.style.width = r.width + 'px';
      panel.classList.add('open');
      // Scroll the selected item into view
      const sel = panel.querySelector('[data-idx].selected');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
  });

  panel.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', closeCameraPanel);
  window.addEventListener('resize', closeCameraPanel);
}

document.getElementById('sensor-w-input').addEventListener('input', function () {
  sensorW = parseFloat(this.value) || null;
  setInputSource('sensor-w-input', sensorW ? 'manual' : '');
  jumpToCustom();
  compute(); updateDiagram();
});
document.getElementById('sensor-h-input').addEventListener('input', function () {
  sensorH = parseFloat(this.value) || null;
  setInputSource('sensor-h-input', sensorH ? 'manual' : '');
  jumpToCustom();
});
document.getElementById('focal-length-input').addEventListener('input', function () {
  focalLength = parseFloat(this.value) || null;
  setInputSource('focal-length-input', focalLength ? 'manual' : '');
  compute(); updateDiagram();
});
document.getElementById('distance-input').addEventListener('input', function () {
  distance = parseFloat(this.value) || null;
  compute(); updateDiagram();
});

/* ─── COMPUTE ────────────────────────────────────────────────── */
function compute() {
  if (!img || sensorW === null || focalLength === null || pixelSpan === null || distance === null) {
    clearResult(); return;
  }
  const sh     = sensorH ?? sensorW * img.naturalHeight / img.naturalWidth;
  const real_x = distance * Math.tan(Math.abs(pixelDx) / img.naturalWidth  * (sensorW / focalLength));
  const real_y = distance * Math.tan(Math.abs(pixelDy) / img.naturalHeight * (sh       / focalLength));
  const realSize = Math.hypot(real_x, real_y);
  if (!isFinite(realSize) || realSize <= 0) { clearResult(); return; }

  if (realSize >= 1000) {
    valEl.textContent  = (realSize / 1000).toFixed(2);
    unitEl.textContent = 'km';
  } else {
    valEl.textContent  = realSize >= 100 ? realSize.toFixed(1)
                       : realSize >= 10  ? realSize.toFixed(2)
                       :                   realSize.toFixed(3);
    unitEl.textContent = 'm';
  }

  let eqStr;
  if (Math.abs(pixelDy) < 1) {
    eqStr = `${distance} m × tan( ${Math.round(Math.abs(pixelDx))}px / ${img.naturalWidth}px × ${sensorW}mm / ${focalLength}mm )`;
  } else if (Math.abs(pixelDx) < 1) {
    eqStr = `${distance} m × tan( ${Math.round(Math.abs(pixelDy))}px / ${img.naturalHeight}px × ${sh.toFixed(2)}mm / ${focalLength}mm )`;
  } else {
    eqStr = `√( ${real_x.toFixed(3)}² + ${real_y.toFixed(3)}² ) m`;
  }
  document.getElementById('result-eq').textContent = eqStr;
  resultBar.classList.add('has-result');
  updateStepBar();
}

function clearResult() {
  document.getElementById('result-value').textContent  = '—';
  document.getElementById('result-unit').textContent   = 'm';
  document.getElementById('result-eq').textContent     = '';
  document.getElementById('result-bar').classList.remove('has-result');
  updateStepBar();
}

/* ─── DIAGRAM ────────────────────────────────────────────────── */
function updateDiagram() {
  const hasPixels = pixelSpan  !== null;
  const hasDist   = distance   !== null;
  const hasFocal  = focalLength !== null;
  const hasSensor = sensorW    !== null;
  const allSet    = hasPixels && hasDist && hasFocal && hasSensor && img;

  setLit('seg-object',      hasPixels);
  setLit('seg-pixels',      hasPixels);
  setLit('seg-distance',    hasDist);
  setLit('seg-focal',       hasFocal);
  setLit('seg-sensor',      hasSensor);
  setLit('seg-pinhole',     allSet);
  setLit('ray-tl',          allSet);
  setLit('ray-bl',          allSet);
  setLit('ray-tr',          allSet);
  setLit('ray-br',          allSet);
  setLit('diag-lbl-sensor', hasSensor);
  setLit('diag-lbl-px',     hasPixels);
  setLit('diag-lbl-f',      hasFocal);
  setLit('diag-lbl-d',      hasDist);
  setLit('diag-lbl-object', hasPixels);

  const resultLbl = document.getElementById('diag-lbl-result');
  if (resultLbl) resultLbl.style.display = allSet ? '' : 'none';
}

function setLit(id, on) {
  document.getElementById(id)?.classList.toggle('lit', on);
}

/* ─── RESET / NEW IMAGE ──────────────────────────────────────── */
function jumpToCustom() {
  if (CUSTOM_IDX < 0) return;
  const trigger = document.getElementById('camera-trigger');
  if (trigger.textContent === CAMERA_DB[CUSTOM_IDX].label) return;
  trigger.textContent = CAMERA_DB[CUSTOM_IDX].label;
  trigger.classList.add('has-selection');
  document.querySelectorAll('#camera-panel [data-idx]').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.idx, 10) === CUSTOM_IDX);
  });
}

function resetMarks() {
  markA = null; markB = null; pixelSpan = null; pixelDx = null; pixelDy = null;
  document.getElementById('pixel-span-input').value = '';
  document.getElementById('span-source').textContent = 'click two points on photo';
  document.getElementById('btn-reset-marks').disabled = true;
  drawCanvas();
  updateStepBar();
  compute();
  updateDiagram();
}

function newImage() {
  img = null;
  resetMarks();
  exifHasFocalLength = false; exifGPS = null;
  focalLength = null; sensorW = null; sensorH = null; distance = null;
  if (gpsMarker) { gpsMarker.remove(); gpsMarker = null; }
  resetMapPoints();
  document.getElementById('map-dist-val').textContent = 'camera position → object position';
  if (map) map.setView([30, 0], 1);

  ['exif-camera-val', 'exif-focal-val', 'exif-size-val', 'exif-gps-val'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '—';
    el.classList.remove('has-data', 'clickable');
    el.onclick = null;
  });

  document.getElementById('focal-length-input').value = '';
  setInputSource('focal-length-input', '');
  document.getElementById('exif-focal-eq').textContent = '';
  document.getElementById('sensor-w-input').value     = '';
  setInputSource('sensor-w-input', '');
  setInputSource('sensor-h-input', '');
  document.getElementById('sensor-h-input').value     = '';
  clearCameraSelection();
  document.getElementById('distance-input').value     = '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlay.classList.remove('hidden');
  updateStepBar();
  compute();
  updateDiagram();
}

document.getElementById('btn-reset-marks').addEventListener('click', resetMarks);
document.getElementById('btn-new-image').addEventListener('click', newImage);

/* ─── MAP INIT / INTERACTION ─────────────────────────────────── */
function initMap() {
  map = L.map('map-container', { zoomControl: true }).setView([30, 0], 1);

  tileLayers.esri = L.layerGroup([
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri', maxZoom: 20 }
    ),
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { attribution: '', maxZoom: 20 }
    )
  ]);
  tileLayers.osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '© OpenStreetMap contributors', maxZoom: 19 }
  );
  tileLayers.carto = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution: '© Carto', maxZoom: 20 }
  );

  tileLayers[currentTile].addTo(map);
  map.on('click', handleMapClick);
}

// Clicking cycles: place A → place B + measure → third click resets and places new A.
function handleMapClick(e) {
  if (mapPtA && mapPtB) {
    resetMapPoints();
    distance = null;
    document.getElementById('distance-input').value = '';
    compute();
    document.getElementById('map-dist-val').textContent = 'camera position → object position';
  }

  const marker = L.circleMarker(e.latlng, {
    radius: 6, color: '#e63946', fillColor: '#e63946', fillOpacity: 1, weight: 2
  }).addTo(map);
  mapMarkers.push(marker);

  if (!mapPtA) {
    mapPtA = e.latlng;
    document.getElementById('map-dist-val').textContent = 'now click the object\'s position';
  } else {
    mapPtB = e.latlng;
    if (mapLine) { mapLine.remove(); mapLine = null; }
    mapLine = L.polyline([mapPtA, mapPtB], {
      color: '#e63946', weight: 2, dashArray: '7 4', opacity: 0.8
    }).addTo(map);
    const d = mapPtA.distanceTo(mapPtB);
    setDistance(d);
    document.getElementById('map-dist-val').textContent = formatMapDist(d);
  }
}

function setDistance(d) {
  distance = d;
  document.getElementById('distance-input').value = d.toFixed(1);
  compute();
  updateDiagram();
}

function resetMapPoints() {
  mapMarkers.forEach(m => m.remove());
  mapMarkers = [];
  if (mapLine) { mapLine.remove(); mapLine = null; }
  mapPtA = null; mapPtB = null;
}

function formatMapDist(d) {
  return d >= 1000 ? (d / 1000).toFixed(2) + ' km' : d.toFixed(1) + ' m';
}

function goToGPS() {
  if (!exifGPS) return;
  const text = `${exifGPS.lat.toFixed(5)}, ${exifGPS.lng.toFixed(5)}`;
  navigator.clipboard.writeText(text).then(
    () => showToast('Coordinates copied.', 'success', 1800),
    () => {}
  );
}

function parseSingleCoord(s) {
  s = s.trim();
  const leadM = s.match(/^([NSEW])\s*/i);
  if (leadM) s = s.slice(leadM[0].length);
  const leadDir = leadM ? leadM[1].toUpperCase() : '';

  // DMS: 52°32'43.8"N  or  52° 32' 43.8 N
  const dms = s.match(/^(\d+)\s*[°d]\s*(\d+)\s*['’ʼ]\s*(\d+(?:[.,]\d+)?)\s*[""”]?\s*([NSEW]?)$/i);
  if (dms) {
    const dir = leadDir + dms[4].toUpperCase();
    let v = parseInt(dms[1], 10) + parseInt(dms[2], 10) / 60 + parseFloat(dms[3].replace(',', '.')) / 3600;
    return /[SW]/.test(dir) ? -v : v;
  }
  // DM: 52°32.567'N
  const dm = s.match(/^(\d+)\s*[°d]\s*(\d+(?:[.,]\d+)?)\s*['’ʼ]?\s*([NSEW]?)$/i);
  if (dm) {
    const dir = leadDir + dm[3].toUpperCase();
    let v = parseInt(dm[1], 10) + parseFloat(dm[2].replace(',', '.')) / 60;
    return /[SW]/.test(dir) ? -v : v;
  }
  // Plain decimal with optional trailing direction
  const trailM = s.match(/([NSEW])\s*$/i);
  const dir = leadDir + (trailM ? trailM[1].toUpperCase() : '');
  const v = parseFloat(s.replace(',', '.'));
  if (!isFinite(v)) return NaN;
  return /[SW]/.test(dir) ? -Math.abs(v) : v;
}

function parseCoordInput(raw) {
  raw = raw.trim();
  // DMS path: extract two tokens that contain °
  if (/°/.test(raw)) {
    const tokens = raw.match(/[NSEW]?\s*\d+\s*°[^°]*/gi) || [];
    if (tokens.length >= 2) {
      const lat = parseSingleCoord(tokens[0]);
      const lng = parseSingleCoord(tokens[1]);
      if (isFinite(lat) && isFinite(lng)) return { lat, lng };
    }
  }
  // Decimal fallback: split on whitespace/comma
  const parts = raw.split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isFinite(lat) && isFinite(lng)) return { lat, lng };
  }
  return null;
}

document.getElementById('coord-input').addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  const parsed = parseCoordInput(this.value);
  if (!parsed) { showToast('Enter coordinates as: 52.520, 13.405 or 52°32\'43.8"N 13°13\'11.6"E'); return; }
  const { lat, lng } = parsed;
  if (!isFinite(lat) || !isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    showToast('Coordinates out of range.');
    return;
  }
  const latlng = L.latLng(lat, lng);
  if (mapPtA) resetMapPoints();
  const marker = L.circleMarker(latlng, {
    radius: 6, color: '#e63946', fillColor: '#e63946', fillOpacity: 1, weight: 2
  }).addTo(map);
  mapMarkers.push(marker);
  mapPtA = latlng;
  map.setView(latlng, Math.max(map.getZoom(), 14));
  document.getElementById('map-dist-val').textContent = "now click the object's position";
  showToast('Point A placed — now click the object\'s position.', 'success', 2500);
  this.value = '';
});

document.getElementById('btn-map-reset-pts').addEventListener('click', () => {
  resetMapPoints();
  distance = null;
  document.getElementById('distance-input').value = '';
  document.getElementById('map-dist-val').textContent = 'camera position → object position';
  compute();
  updateDiagram();
  updateStepBar();
});

document.querySelectorAll('.tile-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const tile = this.dataset.tile;
    if (!map || tile === currentTile) return;
    tileLayers[currentTile].remove();
    tileLayers[tile].addTo(map);
    currentTile = tile;
    document.querySelectorAll('.tile-btn').forEach(b => b.classList.toggle('active-tile', b === this));
  });
});

/* ─── KEYBOARD ───────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key.toUpperCase() !== 'ESCAPE' && document.getElementById('help-card').style.display !== 'none') return;
  switch (e.key.toUpperCase()) {
    case 'R': resetMarks(); break;
    case 'N': newImage();   break;
    case 'ESCAPE':
      document.getElementById('help-card').style.display = 'none';
      break;
  }
});

document.getElementById('btn-help').addEventListener('click', () => {
  document.getElementById('help-card').style.display = 'flex';
});
document.getElementById('btn-help-close').addEventListener('click', () => {
  document.getElementById('help-card').style.display = 'none';
});
document.getElementById('help-card').addEventListener('click', function (e) {
  if (e.target === this) this.style.display = 'none';
});

/* ─── RESIZE ─────────────────────────────────────────────────── */
window.addEventListener('resize', () => {
  if (!img) return;
  resizeCanvas();
  drawCanvas();
});

/* ─── INIT ───────────────────────────────────────────────────── */
populateCameraDropdown();
resizeCanvas();
initMap();
updateStepBar();
