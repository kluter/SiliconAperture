/* ═══════════════════════════════════════════════════════════════
   SiliconAperture — script.js
   Single-image photogrammetry using the pinhole camera model.
   Formula (pinhole, object facing the camera): real_size = distance × span_on_sensor / focal_len,
   per image axis with the sensor side that axis lies along, combined with Pythagoras.
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

// Fades out, then goes. Once per toast (× and the timer may both call this), and not only on
// transitionend: a hidden container (small window) or no transition never fires it.
const TOAST_FADE_MS = 450;
function dismissToast(item, msg) {
  if (!item.isConnected || item.classList.contains('toast-hiding')) return;
  item.classList.add('toast-hiding');
  let done = false;
  const remove = () => {
    if (done) return;
    done = true;
    item.remove();
    const n = toastCounts.get(msg) || 1;
    if (n <= 1) toastCounts.delete(msg);
    else toastCounts.set(msg, n - 1);
  };
  item.addEventListener('transitionend', remove, { once: true });
  setTimeout(remove, TOAST_FADE_MS + 100);
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
let pixelSpan = null;   // marked span on the photo, in image pixels
let distance     = null;
let solveMode      = 'size';   // 'size' | 'distance'
let knownSize      = null;     // distance-mode input: real-world size of the marked span (m)
let solvedDistance = null;     // distance-mode output (m), for the map ring
let objectRing     = false;    // distance-mode map ring placed (drawn by renderMarks)
let exifFocal    = null;   // focal length from the photo's EXIF (mm): wins over the database's
let exifGPS      = null;
let loadSeq      = 0;      // bumped per photo, so a late EXIF read of an earlier photo is dropped

const CUSTOM_IDX = CAMERA_DB.findIndex(c => c.brand === '—');

let map          = null;
let gpsMarker    = null;
let mapPtA       = null;   // {lat, lng}
let mapPtB       = null;
let currentTile  = 'dark';
let camIdx       = null;   // CAMERA_DB entry in use, for the optics slot
let resetBtn     = null;   // map control: clear the map points (made in initMap)

/* ─── IMAGE LOAD ─────────────────────────────────────────────── */
function loadImage(file) {
  const seq = ++loadSeq;
  const url = URL.createObjectURL(file);
  const newImg = new Image();
  newImg.onload = () => {
    URL.revokeObjectURL(url);
    if (seq !== loadSeq) return;   // another photo was dropped (or N pressed) while this one decoded
    // A new photo is a new scene: nothing of the previous photo carries over
    resetPhotoState();
    img = newImg;
    resizeCanvas();
    fitImage();
    drawCanvas();
    overlay.classList.add('hidden');
    stopSpin();
    photoName = file.name || 'Pasted photo';
    compute();
    updateDiagram();
    readExif(file, seq);
  };
  newImg.onerror = () => {
    URL.revokeObjectURL(url);
    if (seq === loadSeq) showToast('Could not load image.');
  };
  newImg.src = url;
}

// The canvas is drawn in CSS pixels (viewW × viewH); its backing store is scaled by the
// device pixel ratio so the photo stays sharp on high-DPI screens.
let viewW = 0, viewH = 0;

const fitScale = () => Math.min(viewW / img.naturalWidth, viewH / img.naturalHeight) * 0.92;

function fitImage() {
  scale   = fitScale();
  offsetX = (viewW - img.naturalWidth  * scale) / 2;
  offsetY = (viewH - img.naturalHeight * scale) / 2;
}

function resizeCanvas() {
  const r = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  viewW = r.width;
  viewH = r.height;
  canvas.width  = Math.round(r.width  * dpr);
  canvas.height = Math.round(r.height * dpr);
  canvas.style.width  = r.width  + 'px';
  canvas.style.height = r.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingQuality = 'high';
}

// The size of one photo pixel on the sensor (mm). Pixels are square, and the sensor's long
// side lies along the photo's long side whichever way the photo is turned (portrait or
// landscape). A photo cropped to another aspect (16:9, 1:1) still fills the sensor along one
// side: the smaller of the two ratios is that side. Without a sensor height, the photo's
// own aspect stands in for the sensor's.
function pixelPitch() {
  if (!img || sensorW === null) return null;
  const longPx  = Math.max(img.naturalWidth, img.naturalHeight);
  const shortPx = Math.min(img.naturalWidth, img.naturalHeight);
  const b = sensorH ?? sensorW * shortPx / longPx;
  const longMm = Math.max(sensorW, b), shortMm = Math.min(sensorW, b);
  return Math.min(longMm / longPx, shortMm / shortPx);
}

/* ─── EXIF ───────────────────────────────────────────────────── */
async function readExif(file, seq) {
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

  if (seq !== loadSeq) return;   // a newer photo (or N) came first: this EXIF is not for it

  const t = tags.status === 'fulfilled' ? tags.value : null;
  const g = gps.status  === 'fulfilled' ? gps.value  : null;

  if (!t && !g) return;

  if (t) {
    const f   = typeof t.FocalLength === 'number' && t.FocalLength > 0 ? t.FocalLength : null;
    const f35 = typeof t.FocalLengthIn35mmFormat === 'number' && t.FocalLengthIn35mmFormat > 0 ? t.FocalLengthIn35mmFormat : null;
    exifFocal = f;   // before the camera match, so selectCamera keeps it

    const camera = [t.Make, t.Model].filter(Boolean).join(' ').trim();
    if (camera) {
      setExifCell('exif-camera-val', camera);
      autoSelectCamera(t.Make, t.Model);
    }

    if (f) {
      focalLength = f;
      setExifCell('exif-focal-val', f.toFixed(1) + ' mm');
      document.getElementById('focal-length-input').value = f.toFixed(2);
      setInputSource('focal-length-input', 'exif');
    }
    if (f35) {
      document.getElementById('exif-focal-eq').textContent = `≈ ${Math.round(f35)} mm eq`;
    }
    if (f && f35) applyExifSensor(f, f35);

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
    gpsEl.onclick = copyGPS;
    document.getElementById('btn-exif').classList.add('has-data');
    // Mark it and fly there from wherever the globe is (the flight also stops the spin)
    if (gpsMarker) gpsMarker.remove();
    if (map) {
      const el = document.createElement('div');
      el.className = 'gps-marker';
      el.title = 'Where the photo was taken (EXIF)';
      gpsMarker = new maplibregl.Marker({ element: el }).setLngLat([g.longitude, g.latitude]).addTo(map);
    }
    stopSpin();
    syncGpsButton();
    flyToGPS();
  }

  compute();
  updateDiagram();
}

// The 35 mm equivalent says how much of the sensor this photo covers, with the lens it was
// taken with: diagonal = f × 43.27 mm (full-frame diagonal) ÷ f35. The database holds the
// main camera only, so a telephoto or ultrawide shot, or a digital crop, does not fit it.
// Keep the database entry when it agrees with the photo; otherwise use the EXIF sensor.
const FF_DIAG = Math.hypot(36, 24);
const EXIF_SENSOR_TOLERANCE = 0.06;   // f35 is a whole number of mm: about ±2 % at 24 mm, plus conventions

function applyExifSensor(f, f35) {
  if (!img) return;
  const W = img.naturalWidth, H = img.naturalHeight, diagPx = Math.hypot(W, H);
  const diag = f * FF_DIAG / f35;
  const longMm  = diag * Math.max(W, H) / diagPx;
  const shortMm = diag * Math.min(W, H) / diagPx;
  if (!(longMm > 1 && longMm < 60)) return;   // implausible tags

  const dbPitch = pixelPitch();
  if (dbPitch !== null && Math.abs(dbPitch / (longMm / Math.max(W, H)) - 1) <= EXIF_SENSOR_TOLERANCE) return;

  const dbCam = camIdx !== null && camIdx !== CUSTOM_IDX ? CAMERA_DB[camIdx] : null;
  sensorW = +longMm.toFixed(2);
  sensorH = +shortMm.toFixed(2);
  document.getElementById('sensor-w-input').value = sensorW;
  document.getElementById('sensor-h-input').value = sensorH;
  setInputSource('sensor-w-input', 'exif');
  setInputSource('sensor-h-input', 'exif');
  if (dbCam) {
    clearCameraSelection();
    showToast(`This photo does not match the ${dbCam.label} main camera (another lens, or a crop). ` +
              'Sensor size taken from its 35 mm equivalent instead.', 'success');
  }
}

/* ─── CAMERA AUTOCOMPLETE FROM EXIF ─────────────────────────── */
const BRAND_MAP = {
  apple: 'Apple', asus: 'Asus', google: 'Google',
  honor: 'Honor', htc: 'HTC', huawei: 'Huawei',
  lg: 'LG', meizu: 'Meizu', motorola: 'Motorola',
  nokia: 'Nokia', nothing: 'Nothing', nubia: 'nubia',
  oneplus: 'OnePlus', oppo: 'Oppo', realme: 'Realme',
  samsung: 'Samsung', sharp: 'Sharp', vivo: 'vivo',
  xiaomi: 'Xiaomi', redmi: 'Xiaomi', poco: 'Xiaomi',
  dji: 'DJI', sony: 'Sony', canon: 'Canon', nikon: 'Nikon',
  fujifilm: 'Fujifilm', fuji: 'Fujifilm',
  panasonic: 'Panasonic', olympus: 'OM System',
  'om digital': 'OM System', 'om system': 'OM System',
  gopro: 'GoPro', hasselblad: 'Hasselblad', 'phase one': 'Phase One',
  leica: 'Leica', pentax: 'Pentax', ricoh: 'Ricoh', sigma: 'Sigma', blackmagic: 'Blackmagic',
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
  // Pentax bodies are made by Ricoh Imaging and say so in Make; the model still says PENTAX
  if (brand === 'Ricoh' && normModel.includes('pentax')) brand = 'Pentax';
  if (!brand) return;

  // Whole words only: a substring test let "7" match "iPhone 17" and "8" match "(2018)".
  const words = s => s.split(/[\s\-\/,_()]+/).filter(w => /[a-z0-9]/i.test(w));
  const modelWords = words(normModel);
  const modelSet   = new Set(modelWords);
  if (!modelWords.length) return;
  // Every number in the model name (7, 15, s24, 2nd…) has to be in the label
  const modelNumbers = modelWords.filter(w => /\d/.test(w));

  let bestIdx = -1, bestScore = -Infinity;

  CAMERA_DB.forEach((cam, i) => {
    if (cam.brand !== brand || cam.sensor_w === null) return;
    const normLabel = cam.label.toLowerCase();
    const labelSet  = new Set(words(normLabel));
    if (!modelNumbers.every(w => labelSet.has(w))) return;
    const matchCount = modelWords.filter(w => labelSet.has(w)).length;
    if (matchCount === 0) return;

    // Penalise variant words (Pro, Max…) the EXIF model doesn't mention. A label lists
    // alternatives with "/" ("iPhone 15 / 15 Plus"): the best-fitting alternative counts.
    const extraVariants = Math.min(...normLabel.split('/').map(alt =>
      words(alt).filter(w => VARIANT_WORDS.has(w) && !modelSet.has(w)).length));
    const score = matchCount * 10 - extraVariants * 3;

    if (score > bestScore) { bestScore = score; bestIdx = i; }
  });

  if (bestIdx < 0 || bestScore <= 0) return;
  selectCamera(bestIdx);
}

function setExifCell(id, text) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.classList.add('has-data');
  document.getElementById('btn-exif').classList.add('has-data');
}

/* ─── CANVAS DRAW ────────────────────────────────────────────── */
function drawCanvas() {
  ctx.clearRect(0, 0, viewW, viewH);
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

// Pan and zoom draw at most once per frame, however many events arrive
let drawRaf = 0;
function requestDraw() {
  if (drawRaf) return;
  drawRaf = requestAnimationFrame(() => { drawRaf = 0; drawCanvas(); });
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
// Leaving for a child element (the drop message, the buttons) is not leaving the photo
container.addEventListener('dragleave', e => {
  if (!container.contains(e.relatedTarget)) overlay.classList.remove('drag-active');
});
container.addEventListener('drop', e => {
  e.preventDefault();
  overlay.classList.remove('drag-active');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
  else showToast('Please drop an image file.');
});
// A file dropped anywhere else must not make the browser open it (and leave the app)
const isFileDrag = e => e.dataTransfer && [...e.dataTransfer.types].includes('Files');
window.addEventListener('dragover', e => {
  if (!isFileDrag(e) || container.contains(e.target)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'none';   // no "copy" cursor where a drop does nothing
});
window.addEventListener('drop', e => { if (isFileDrag(e)) e.preventDefault(); });

overlay.addEventListener('click', () => fileInput.click());

/* ─── PHOTO TABS ─────────────────────────────────────────────── */
// The header's tab strip, styled as in ShadowFinder and TracePoint. For now there is one photo:
// its tab names the file, the dot turns red with a result, × and "+" both start over with a new
// photo. Several photos side by side is the "Image tabs" issue.
let photoName = null;
let tabsKey = null;   // what the strip shows now: rebuilt only when that changes
function renderTabs() {
  const state = resultBar.classList.contains('has-result') ? 'result' : img ? 'loaded' : '';
  const key = `${photoName}|${state}`;
  if (key === tabsKey) return;
  tabsKey = key;
  const wrap = document.getElementById('photo-tabs');
  wrap.innerHTML = '';
  const tab = document.createElement('div');
  tab.className = 'photo-tab active';
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-selected', 'true');
  tab.title = photoName || 'No photo yet';
  const dot = document.createElement('span');
  dot.className = 'photo-dot' + (state ? ' ' + state : '');
  const name = document.createElement('span');
  name.className = 'photo-name';
  name.textContent = photoName || 'New photo';
  tab.append(dot, name);
  if (img) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'photo-tab-close';
    close.textContent = '×';
    close.title = 'Close this photo';
    close.setAttribute('aria-label', 'Close this photo');
    close.addEventListener('click', newImage);
    tab.appendChild(close);
  }
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'photo-tab-add';
  add.title = 'New photo (N)';
  add.setAttribute('aria-label', 'New photo');
  add.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  add.addEventListener('click', newImage);
  wrap.append(tab, add);
}

/* ─── DEMO ───────────────────────────────────────────────────── */
// A demo photo with its EXIF (camera, focal length, GPS), loaded like a dropped file.
// As in ShadowFinder: the marks are for the user to set.
const DEMO_FILE = 'SiliconAperture_Demo.jpg';
function loadDemo() {
  fetch('assets/' + DEMO_FILE)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
    .then(blob => {
      loadImage(new File([blob], DEMO_FILE, { type: 'image/jpeg' }));
      showToast('Demo loaded with its EXIF. Click both ends of the object, then measure the distance on the map.', 'success');
    })
    .catch(() => showToast('Could not load the demo image.'));
}
document.getElementById('btn-demo').addEventListener('click', e => {
  e.stopPropagation();   // not the overlay's browse click
  loadDemo();
});
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
  requestDraw();
});
canvas.addEventListener('mouseup', e => {
  if (e.button === 0 && !hasDragged) handleCanvasClick(e);
  if (e.button === 0 || e.button === 1) panStart = null;
});
// Zoom follows how far the wheel moved: one mouse notch (~100 px) is 12 %, a trackpad's many
// small events add up to the same, rather than 12 % each. From a quarter of the fitted size
// up to 64 screen pixels per photo pixel.
const WHEEL_LINE_PX = 33, WHEEL_PAGE_PX = 800, MAX_ZOOM = 64;
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  if (!img) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const px = e.deltaY * (e.deltaMode === 1 ? WHEEL_LINE_PX : e.deltaMode === 2 ? WHEEL_PAGE_PX : 1);
  const target = Math.min(MAX_ZOOM, Math.max(fitScale() / 4, scale * 0.88 ** (px / 100)));
  const factor = target / scale;
  offsetX = mx - (mx - offsetX) * factor;
  offsetY = my - (my - offsetY) * factor;
  scale = target;
  requestDraw();
}, { passive: false });

function handleCanvasClick(e) {
  if (!img) return;
  const rect = canvas.getBoundingClientRect();
  const ip = canvasToImg(e.clientX - rect.left, e.clientY - rect.top);
  if (ip.x < 0 || ip.x > img.naturalWidth || ip.y < 0 || ip.y > img.naturalHeight) return;

  if (!markA) {
    markA = ip;
    updateGuide();
  } else if (!markB) {
    markB = ip;
    computePixelSpan();
  }
  drawCanvas();
}

function computePixelSpan() {
  if (!markA || !markB) { pixelSpan = null; return; }
  pixelSpan = Math.hypot(markB.x - markA.x, markB.y - markA.y);
  document.getElementById('pixel-span-input').value = Math.round(pixelSpan);
  document.getElementById('span-source').textContent = 'from canvas';
  document.getElementById('btn-reset-marks').disabled = false;
  compute();
  updateDiagram();
}

/* ─── STEP GUIDE ─────────────────────────────────────────────── */
// The steps as icons down the right edge of the photo, the current one lit; the hint at the
// bottom of the photo says what to do next (as in TracePoint and ShadowFinder).
const GUIDE_STEPS = [
  { title: 'Add a photo',
    icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>' },
  { title: 'Pick the camera, or enter sensor and focal length',
    icon: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>' },
  { title: 'Mark both ends of the object on the photo',
    icon: '<path d="M6 18L18 6" stroke-dasharray="2.5 2.5"/><circle cx="5" cy="19" r="2.2" fill="currentColor"/><circle cx="19" cy="5" r="2.2" fill="currentColor"/>' },
  { title: 'The known value: distance or size, typed or from the map',
    icon: '<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>' },
];

function guideStatus() {
  if (!img) return { idx: 0, hint: '' };   // the drop overlay already says it
  if (sensorW === null || focalLength === null)
    return { idx: 1, hint: 'Pick the camera above, or enter sensor width and focal length' };
  if (pixelSpan === null)
    return { idx: 2, hint: markA ? 'Click the other end of the object'
                                 : 'Click both ends of the object · scroll to zoom, drag to pan' };
  if (solveMode === 'distance') {
    if (knownSize === null || solvedDistance === null) return { idx: 3, hint: "Enter the object's real size above" };
    if (mapPtA === null) return { idx: 3, hint: 'Click where the object is on the map to draw the ring' };
    return { idx: GUIDE_STEPS.length, hint: 'The camera stood somewhere on this ring', cls: 'done' };
  }
  if (distance === null) return { idx: 3, hint: 'Enter the distance above, or click camera then object on the map' };
  return { idx: GUIDE_STEPS.length, hint: 'R resets the marks · N starts over', cls: 'muted' };
}

function buildGuide() {
  const g = document.getElementById('guide');
  g.innerHTML = '<div class="guide-rail"><div class="guide-rail-fill"></div></div>';
  GUIDE_STEPS.forEach((st, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'guide-step';
    b.title = st.title;
    b.setAttribute('aria-label', st.title);
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${st.icon}</svg>`;
    b.addEventListener('click', e => { e.stopPropagation(); guideAction(i); });
    g.appendChild(b);
  });
}

// Clicking the current step does it where it can.
function guideAction(i) {
  if (i !== guideStatus().idx) return;
  if (i === 0) fileInput.click();
  else if (i === 1) document.getElementById('camera-trigger').click();
  else if (i === 3 && solveMode === 'size') document.getElementById('distance-input').focus();
  else if (i === 3 && knownSize === null) document.getElementById('known-size-input').focus();
}

function updateGuide() {
  const { idx, hint, cls } = guideStatus();
  document.querySelectorAll('#guide .guide-step').forEach((b, i) => {
    b.classList.toggle('done', i < idx);
    b.classList.toggle('current', i === idx);
  });
  document.querySelector('#guide .guide-rail-fill').style.height =
    `${Math.min(1, idx / (GUIDE_STEPS.length - 1)) * 100}%`;
  const h = document.getElementById('image-hint');
  h.textContent = hint;
  h.className = 'step-hint' + (cls ? ' ' + cls : '');

  // Mark the input the current step waits for.
  let awaitId = null;
  if      (idx === 1) awaitId = 'camera-trigger';
  else if (idx === 3 && solveMode === 'size') awaitId = 'distance-input';
  else if (idx === 3 && knownSize === null)   awaitId = 'known-size-input';
  ['camera-trigger', 'pixel-span-input', 'distance-input', 'known-size-input'].forEach(id =>
    document.getElementById(id).classList.toggle('awaiting', id === awaitId));

  updateMapHint();
}
buildGuide();

/* ─── CUSTOM CAMERA DROPDOWN ─────────────────────────────────── */
function closeCameraPanel() {
  const panel = document.getElementById('camera-panel');
  if (panel) panel.classList.remove('open');
}

function clearCameraSelection() {
  const trigger = document.getElementById('camera-trigger');
  trigger.textContent = '— select camera / phone —';
  camIdx = null;
  trigger.classList.remove('has-selection');
  document.querySelectorAll('#camera-panel [data-idx]').forEach(el => el.classList.remove('selected'));
}

function selectCamera(idx) {
  const cam = CAMERA_DB[idx];
  if (!cam) return;

  const trigger = document.getElementById('camera-trigger');
  trigger.textContent = cam.label;
  camIdx = idx;
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

  // The photo's own focal length wins (it is the lens actually used); else the database's.
  // An interchangeable-lens body has none: the previous camera's must not linger.
  const fInput = document.getElementById('focal-length-input');
  if (exifFocal !== null) {
    focalLength = exifFocal;
    fInput.value = exifFocal.toFixed(2);
    setInputSource('focal-length-input', 'exif');
  } else if (cam.focal_length !== null) {
    focalLength = cam.focal_length;
    fInput.value = cam.focal_length;
    setInputSource('focal-length-input', 'db');
  } else if (fInput.classList.contains('source-db')) {
    focalLength = null;
    fInput.value = '';
    setInputSource('focal-length-input', '');
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

  // Filter input (sticky at top)
  const filterInput = document.createElement('input');
  filterInput.type = 'text';
  filterInput.id = 'cam-filter';
  filterInput.placeholder = 'Filter cameras…';
  filterInput.autocomplete = 'off';
  filterInput.spellcheck = false;
  panel.appendChild(filterInput);

  function applyFilter(q) {
    q = q.toLowerCase().trim();
    panel.querySelectorAll('.cam-brand').forEach(brandEl => {
      let visible = 0;
      brandEl.querySelectorAll('.cam-model').forEach(modelEl => {
        const show = !q || modelEl.querySelector('span').textContent.toLowerCase().includes(q);
        modelEl.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      brandEl.style.display = visible ? '' : 'none';
      if (q && visible) brandEl.classList.add('open');
      else if (!q) brandEl.classList.remove('open');
    });
    panel.querySelectorAll('.cam-category-hdr').forEach(hdr => {
      let next = hdr.nextElementSibling;
      let anyVisible = false;
      while (next && !next.classList.contains('cam-category-hdr')) {
        if (next.classList.contains('cam-brand') && next.style.display !== 'none') anyVisible = true;
        next = next.nextElementSibling;
      }
      hdr.style.display = anyVisible ? '' : 'none';
    });
  }

  filterInput.addEventListener('input', () => applyFilter(filterInput.value));
  filterInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { filterInput.value = ''; applyFilter(''); }
  });
  filterInput.addEventListener('click', e => e.stopPropagation());

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
    'Smartphones': ['Apple', 'Asus', 'Google', 'Honor', 'HTC', 'Huawei', 'LG', 'Meizu', 'Motorola', 'Nokia', 'Nothing', 'nubia', 'OnePlus', 'Oppo', 'Realme', 'Samsung', 'Sharp', 'vivo', 'Xiaomi'],
    'Cameras':     ['Blackmagic', 'Canon', 'DJI', 'Fujifilm', 'GoPro', 'Hasselblad', 'Leica', 'Nikon', 'OM System', 'Panasonic', 'Pentax', 'Phase One', 'Ricoh', 'Sigma', 'Sony'],
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
      brandRow.addEventListener('click', () => {
        const wasOpen = brandEl.classList.contains('open');
        brandEl.classList.toggle('open');
        if (!wasOpen) {
          requestAnimationFrame(() => {
            panel.scrollTop = brandEl.offsetTop - filterInput.offsetHeight;
          });
        }
      });

      const modelsEl = document.createElement('div');
      modelsEl.className = 'cam-models';
      entries.forEach(({ cam, i }) => {
        const modelEl = document.createElement('div');
        modelEl.className = 'cam-model';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = cam.label;
        const badge = document.createElement('span');
        if (cam.confidence === '✓') {
          badge.className = 'cam-conf cam-conf--ok';
          badge.textContent = 'confirmed';
        } else if (cam.confidence === '~') {
          badge.className = 'cam-conf cam-conf--inferred';
          badge.textContent = 'unconfirmed';
        } else if (cam.confidence === '?') {
          badge.className = 'cam-conf cam-conf--unknown';
          badge.textContent = 'missing data';
        }
        modelEl.appendChild(nameSpan);
        if (badge.className) modelEl.appendChild(badge);
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
      // The trigger is narrow in the input strip; give the list room and keep it on screen.
      const r = trigger.getBoundingClientRect();
      const w = Math.max(r.width, 320);
      panel.style.top   = (r.bottom + 3) + 'px';
      panel.style.left  = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
      panel.style.width = w + 'px';
      panel.classList.add('open');
      panel.scrollTop = 0;
      filterInput.value = '';
      applyFilter('');
      filterInput.focus();
    }
  });

  panel.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', closeCameraPanel);
  window.addEventListener('resize', closeCameraPanel);
}

// A typed value counts only if it is a positive number (the inputs' min is not enforced on typing)
function positiveValue(input) {
  const v = parseFloat(input.value);
  input.classList.toggle('invalid', input.value.trim() !== '' && !(v > 0 && isFinite(v)));
  return v > 0 && isFinite(v) ? v : null;
}

document.getElementById('sensor-w-input').addEventListener('input', function () {
  sensorW = positiveValue(this);
  setInputSource('sensor-w-input', sensorW ? 'manual' : '');
  jumpToCustom();
  compute(); updateDiagram();
});
document.getElementById('sensor-h-input').addEventListener('input', function () {
  sensorH = positiveValue(this);
  setInputSource('sensor-h-input', sensorH ? 'manual' : '');
  jumpToCustom();
  compute(); updateDiagram();
});
document.getElementById('focal-length-input').addEventListener('input', function () {
  focalLength = positiveValue(this);
  setInputSource('focal-length-input', focalLength ? 'manual' : '');
  compute(); updateDiagram();
});
document.getElementById('distance-input').addEventListener('input', function () {
  distance = positiveValue(this);
  compute(); updateDiagram();
});
document.getElementById('known-size-input').addEventListener('input', function () {
  knownSize = positiveValue(this);
  compute(); updateDiagram();
});

/* ─── SOLVE MODE (size ⇄ distance) ───────────────────────────── */
function applyMode() {
  const distMode = solveMode === 'distance';
  document.querySelectorAll('.solve-btn').forEach(b =>
    b.classList.toggle('active-solve', b.dataset.mode === solveMode));
  document.getElementById('distance-field').style.display   = distMode ? 'none' : '';
  document.getElementById('known-size-field').style.display = distMode ? '' : 'none';
  document.getElementById('dist-size-label').textContent    = distMode ? 'Known size' : 'Distance';
  document.getElementById('known-source').textContent       = distMode ? "the object's real size" : 'type it, or click the map';
  document.getElementById('result-label').textContent       = distMode ? 'Distance to object' : 'Real-world size';
  resetMapPoints();
  compute();
  updateDiagram();
}
document.querySelectorAll('.solve-btn').forEach(btn => {
  btn.addEventListener('click', () => { solveMode = btn.dataset.mode; applyMode(); });
});
applyMode();

/* ─── OPTICS ─────────────────────────────────────────────────── */
// What the camera values mean, in the bar's optics slot. Uses the same small-angle model as
// compute(): one pixel spans (sensor / f) / image width radians.
// Crop factor is width-based (36 mm / sensor width), as camera-db.js derives focal lengths.

function setFact(id, text) {
  const el = document.getElementById(id);
  el.textContent = text ?? '—';
  el.classList.toggle('has-data', text != null);
  el.title = text ?? '';
}

function updateOptics() {
  const DB_CONF = {
    '✓': { cls: 'ok',       text: '✓ confirmed' },
    '~': { cls: 'inferred', text: '~ unconfirmed' },
    '?': { cls: '',         text: '? estimated' }
  };
  const deg = rad => (rad * 180 / Math.PI).toFixed(1) + '°';
  const fov = mm => deg(2 * Math.atan(mm / 2 / focalLength));
  const pitch = pixelPitch();
  // Without a sensor height, the photo's aspect stands in for the sensor's (landscape)
  const sh  = sensorH ?? (sensorW !== null && img
    ? sensorW * Math.min(img.naturalWidth, img.naturalHeight) / Math.max(img.naturalWidth, img.naturalHeight)
    : null);
  const haveLens = sensorW !== null && focalLength !== null;

  // With a photo: the photo's own field of view, across × down, as it is turned and cropped
  setFact('fact-fov', !haveLens ? null
    : pitch !== null ? `${fov(img.naturalWidth * pitch)} × ${fov(img.naturalHeight * pitch)}`
    : fov(sensorW) + (sh !== null ? ` × ${fov(sh)}` : ''));
  setFact('fact-sensor', sensorW !== null ? `${sensorW} × ${sh !== null ? +sh.toFixed(2) : '?'} mm` : null);
  setFact('fact-crop', sensorW !== null ? `${(36 / sensorW).toFixed(2)}×` : null);
  setFact('fact-eq', haveLens ? `${Math.round(focalLength * 36 / sensorW)} mm` : null);
  setFact('fact-photo', img
    ? `${img.naturalWidth} × ${img.naturalHeight}`
    : null);

  // One pixel of marking error, on the ground at the distance in play (or 100 m before there is one)
  const D = solveMode === 'distance' ? solvedDistance : distance;
  const atD = D ?? 100;
  document.getElementById('fact-px-lbl').textContent = `1 px @ ${formatMapDist(atD).replace('.0 m', ' m')}`;
  if (haveLens && pitch !== null) {
    const m = atD * pitch / focalLength;
    setFact('fact-px', m >= 1 ? `${m.toFixed(2)} m` : m >= 0.01 ? `${(m * 100).toFixed(1)} cm` : `${(m * 1000).toFixed(1)} mm`);
  } else setFact('fact-px', null);

  const dbEl = document.getElementById('optics-db');
  const cam  = camIdx !== null && camIdx !== CUSTOM_IDX ? CAMERA_DB[camIdx] : null;
  const conf = cam ? DB_CONF[cam.confidence] : null;
  dbEl.textContent = conf ? conf.text : '';
  dbEl.className = 'optics-db' + (conf && conf.cls ? ' ' + conf.cls : '');
}

/* ─── COMPUTE ────────────────────────────────────────────────── */
function compute() {
  if (!img || sensorW === null || focalLength === null || pixelSpan === null) {
    solvedDistance = null; clearResult(); return;
  }
  solvedDistance = null;   // set only on a valid distance-mode result below
  // Pinhole: a span s on the sensor is s / f of the distance, whatever its angle on the photo
  // (Δx and Δy each times the pitch, then Pythagoras, is the span times the pitch).
  // real_size = distance × k, so distance = real_size / k.
  const pitch  = pixelPitch();
  const spanMm = pixelSpan * pitch;
  const k      = spanMm / focalLength;
  const spanTxt = `${Math.round(pixelSpan)} px × ${(pitch * 1000).toFixed(2)} µm`;

  let value, eqStr;
  if (solveMode === 'distance') {
    if (knownSize === null || !(k > 0)) { clearResult(); return; }
    value = solvedDistance = knownSize / k;
    eqStr = `${knownSize} m × ${focalLength} mm ÷ (${spanTxt})`;
  } else {
    if (distance === null) { clearResult(); return; }
    value = distance * k;
    eqStr = `${distance} m × (${spanTxt}) ÷ ${focalLength} mm`;
  }

  if (!isFinite(value) || value <= 0) { solvedDistance = null; clearResult(); return; }

  if (value >= 1000) {
    valEl.textContent  = (value / 1000).toFixed(2);
    unitEl.textContent = 'km';
  } else {
    valEl.textContent  = value >= 100 ? value.toFixed(1)
                       : value >= 10  ? value.toFixed(2)
                       :                value.toFixed(3);
    unitEl.textContent = 'm';
  }
  document.getElementById('result-eq').textContent = eqStr;
  document.getElementById('result-eq').title = eqStr;
  resultBar.classList.add('has-result');
  renderTabs();
  updateOptics();
  updateGuide();
  refreshObjectRing();
}

function clearResult() {
  document.getElementById('result-value').textContent  = '—';
  document.getElementById('result-unit').textContent   = 'm';
  document.getElementById('result-eq').textContent     = '';
  document.getElementById('result-bar').classList.remove('has-result');
  renderTabs();
  updateOptics();
  updateGuide();
}

/* ─── DIAGRAM ────────────────────────────────────────────────── */
function updateDiagram() {
  const hasPixels = pixelSpan  !== null;
  const hasDist   = (solveMode === 'distance') ? solvedDistance !== null : distance !== null;
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
  if (resultLbl) resultLbl.style.display = (allSet && solveMode === 'size') ? '' : 'none';
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
  camIdx = CUSTOM_IDX;
  trigger.classList.add('has-selection');
  document.querySelectorAll('#camera-panel [data-idx]').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.idx, 10) === CUSTOM_IDX);
  });
}

// The marks only, state and inputs; the caller recomputes
function clearMarks() {
  markA = null; markB = null; pixelSpan = null;
  document.getElementById('pixel-span-input').value = '';
  document.getElementById('span-source').textContent = 'click two points on photo';
  document.getElementById('btn-reset-marks').disabled = true;
}

function resetMarks() {
  clearMarks();
  drawCanvas();
  compute();        // also updates the guide, tabs and optics
  updateDiagram();
}

// Everything that belongs to one photo: marks, EXIF, camera, the known value and the map
// points. Shared by "new photo" and by loading a photo over another one. The caller recomputes.
function resetPhotoState() {
  clearMarks();
  exifFocal = null; exifGPS = null;
  syncGpsButton();
  focalLength = null; sensorW = null; sensorH = null; distance = null;
  knownSize = null; solvedDistance = null;
  if (gpsMarker) { gpsMarker.remove(); gpsMarker = null; }
  resetMapPoints();

  ['exif-camera-val', 'exif-focal-val', 'exif-size-val', 'exif-gps-val'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '—';
    el.classList.remove('has-data', 'clickable');
    el.onclick = null;
  });
  document.getElementById('btn-exif').classList.remove('has-data');
  document.getElementById('exif-focal-eq').textContent = '';

  ['focal-length-input', 'sensor-w-input', 'sensor-h-input', 'distance-input', 'known-size-input'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.classList.remove('invalid');
  });
  ['focal-length-input', 'sensor-w-input', 'sensor-h-input'].forEach(id => setInputSource(id, ''));
  clearCameraSelection();
}

function newImage() {
  loadSeq++;   // a photo still decoding, or its EXIF, is no longer wanted
  img = null;
  photoName = null;
  resetPhotoState();
  if (map) { showWholeGlobe(); map.once('moveend', startIdleSpin); }   // spin again once back on the whole globe

  drawCanvas();
  overlay.classList.remove('hidden');
  compute();
  updateDiagram();
}

document.getElementById('btn-reset-marks').addEventListener('click', resetMarks);

/* ─── MAP (MapLibre globe, as in ShadowFinder) ───────────────── */
// MapLibre GL is bundled in vendor/ and exposed as window.maplibregl by js/maplibre-global.js.
// A globe in space that turns slowly until you touch it. Marks, the measured line and the
// ring are one GeoJSON source (sa-marks) drawn by four layers; renderMarks() rebuilds it.

const START_LAT  = 20;    // fresh view: the globe tipped a little toward the north, where most land is
const CAMERA_FOV = 10;    // narrow lens: the globe looks nearly orthographic, the whole hemisphere shows
const EARTH_R    = 6371000;
const RING_STEPS = 128;

const TILE_SETS = {
  dark: [
    { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', attribution: 'Powered by Esri · Esri, TomTom, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors, and the GIS User Community', maxzoom: 16 },
    { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', maxzoom: 16 }
  ],
  esri: [
    { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Powered by Esri · Esri, Maxar, Earthstar Geographics, and the GIS User Community', maxzoom: 19 },
    { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', opacity: 0.7, maxzoom: 19 }
  ],
  osm: [
    { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap contributors', maxzoom: 19 }
  ]
};

let mapReady = Promise.resolve();
let activeBaseIds = [];

function initMap() {
  map = new maplibregl.Map({
    container: 'map-container',
    style: {
      version: 8,
      projection: { type: 'globe' },
      sources: {},
      layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#111' } }]
    },
    center: [0, START_LAT],
    zoom: 1.4,
    attributionControl: { compact: true },
    // Right-drag (or Ctrl+drag) rotates and tilts. As in TracePoint: aroundCenter false makes a
    // horizontal drag plain bearing (MapLibre's default hybrid mode wobbles near the centre line),
    // and half of MapLibre's default speed (0.8°/px is twitchy).
    aroundCenter: false,
    rotateSpeed: 0.4
  });
  mapReady = new Promise(resolve => map.once('load', resolve));
  map.setVerticalFieldOfView(CAMERA_FOV);
  map.addControl(new maplibregl.NavigationControl({ showZoom: false, showCompass: true, visualizePitch: true }), 'top-right');
  document.getElementById('map-container').classList.add('space');
  paintStarfield();

  mapReady.then(() => {
    map.jumpTo({ zoom: globeFitZoom() });
    map.addSource('sa-marks', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    const kind = k => ['==', ['get', 'kind'], k];
    map.addLayer({ id: 'sa-ring-fill', type: 'fill', source: 'sa-marks', filter: kind('ring'),
      paint: { 'fill-color': '#e63946', 'fill-opacity': 0.06 } });
    map.addLayer({ id: 'sa-ring-line', type: 'line', source: 'sa-marks', filter: kind('ring'),
      paint: { 'line-color': '#e63946', 'line-width': 2, 'line-opacity': 0.85, 'line-dasharray': [3.5, 2] } });
    map.addLayer({ id: 'sa-line', type: 'line', source: 'sa-marks', filter: kind('line'),
      paint: { 'line-color': '#e63946', 'line-width': 2, 'line-opacity': 0.8, 'line-dasharray': [3.5, 2] } });
    map.addLayer({ id: 'sa-pts', type: 'circle', source: 'sa-marks', filter: kind('pt'),
      paint: { 'circle-radius': 6, 'circle-color': '#e63946', 'circle-stroke-width': 2, 'circle-stroke-color': '#1a0a0b' } });
    setTileSet(currentTile);
    renderMarks();
  });

  map.on('click', e => {
    const p = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    if (isFinite(p.lat) && isFinite(p.lng)) handleMapClick(p);
  });
  map.on('movestart', e => { if (!e.spin && spinRaf) stopSpin(); });
  map.on('move', updateMapView);
  map.on('load', updateMapView);
  // Top left, each in its own box: back to the photo's GPS above Let it spin (as ShadowFinder's
  // Centre on the ring). The GPS button stays visible, greyed out until a photo brings GPS.
  gpsBtn = mapButton('sa-gps-btn', 'Fly to where the photo was taken (EXIF GPS)',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/></svg>');
  gpsBtn.disabled = true;
  gpsBtn.addEventListener('click', flyToGPS);
  addSpinButton();
  // Top right under the compass: clear the points (and the distance or ring they gave). Greyed out with no points.
  resetBtn = mapButton('sa-reset-btn', 'Clear the map points',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><polyline points="3 3.5 3.5 8.5 8.5 8"/></svg>', 'top-right');
  resetBtn.disabled = true;
  resetBtn.addEventListener('click', clearMapPoints);
  startIdleSpin();
}

// The map slot's live view: zoom, bearing (compass style, 0–359°) and tilt
let mapViewRaf = 0;
function updateMapView() {
  if (mapViewRaf || !map) return;
  mapViewRaf = requestAnimationFrame(() => {   // at most once per frame, the spin moves every frame
    mapViewRaf = 0;
    const set = (id, v) => { const el = document.getElementById(id); el.textContent = v; el.classList.add('has-data'); };
    set('view-zoom',    map.getZoom().toFixed(1));
    set('view-bearing', `${Math.round(((map.getBearing() % 360) + 360) % 360) % 360}°`);
    set('view-tilt',    `${Math.round(map.getPitch())}°`);
  });
}

// A button of its own on the map, top left unless a corner is given
function mapButton(cls, label, svg, corner = 'top-left') {
  let btn;
  map.addControl({
    onAdd() {
      const wrap = document.createElement('div');
      wrap.className = 'maplibregl-ctrl maplibregl-ctrl-group';
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sa-map-btn ' + cls;
      btn.title = label;
      btn.setAttribute('aria-label', label);
      btn.innerHTML = svg;
      wrap.appendChild(btn);
      return wrap;
    },
    onRemove() {}
  }, corner);
  return btn;
}

let gpsBtn = null;
function flyToGPS() {
  if (!exifGPS || !map) return;
  stopSpin();
  map.flyTo({ center: [exifGPS.lng, exifGPS.lat], zoom: 16, bearing: 0, pitch: 0, duration: 3500, essential: true });
}
function syncGpsButton() { if (gpsBtn) gpsBtn.disabled = !exifGPS; }

// The zoom at which the whole globe fits the pane with ~40 px to spare, centred on `lat`.
// MapLibre keeps the scale at the centre as on a Mercator map, so the globe's radius is
// 512·2^z / (2π·cos lat) px; seen from the camera its edge is at cam·tan(asin(R / (cam + R))).
function globeFitZoom(lat = map.getCenter().lat) {
  const H = map.getContainer().clientHeight, W = map.getContainer().clientWidth;
  if (!H || !W) return map.getZoom();   // map hidden (or the app, below the minimum window): no size to fit
  const target = Math.max(80, Math.min(H - 80, W - 80) / 2);
  const cam = 0.5 * H / Math.tan(CAMERA_FOV / 2 * Math.PI / 180);
  const t = target / cam, k = t / Math.sqrt(1 + t * t);
  const R = k * cam / (1 - k);
  const cosLat = Math.cos(Math.min(89, Math.abs(lat)) * Math.PI / 180);
  const z = Math.log2(2 * Math.PI * R * cosLat / 512);
  return isFinite(z) ? z : map.getZoom();
}

// Back to the whole globe, upright, around the current longitude
function showWholeGlobe() {
  if (!map) return;
  map.easeTo({ center: [map.getCenter().lng, START_LAT], zoom: globeFitZoom(START_LAT), bearing: 0, pitch: 0 });
}

// A starfield tile for the space behind the globe: seeded, so it is the same on every load
function paintStarfield() {
  const S = 600, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  let seed = 20240414;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 260; i++) {
    const x = rnd() * S, y = rnd() * S, big = rnd() < 0.06;
    const r = big ? 0.9 + rnd() * 0.6 : 0.35 + rnd() * 0.45;
    const a = (big ? 0.7 + rnd() * 0.3 : 0.25 + rnd() * 0.45) * 0.82;
    const tint = rnd();
    g.fillStyle = tint < 0.12 ? `rgba(255,220,170,${a})` : tint < 0.24 ? `rgba(180,200,255,${a})` : `rgba(255,255,255,${a})`;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  document.getElementById('map-container').style.setProperty('--stars', `url(${c.toDataURL()})`);
}

async function setTileSet(id) {
  const set = TILE_SETS[id] || TILE_SETS.dark;
  await mapReady;
  activeBaseIds.forEach(lid => { map.removeLayer(lid); map.removeSource(lid); });
  activeBaseIds = [];
  // Basemap layers go under the marks
  const beforeId = map.getLayer('sa-ring-fill') ? 'sa-ring-fill' : undefined;
  set.forEach((l, i) => {
    const lid = `base-${id}-${i}`;
    map.addSource(lid, { type: 'raster', tiles: [l.url], tileSize: 256, maxzoom: l.maxzoom, attribution: l.attribution || '' });
    map.addLayer({ id: lid, type: 'raster', source: lid, paint: { 'raster-opacity': l.opacity ?? 1 } }, beforeId);
    activeBaseIds.push(lid);
  });
}

/* ─── SPIN ─── */
// The globe turns slowly eastward while the app is open and untouched (no photo, no map
// points). The first click, key, scroll, paste or drop anywhere stops it; so does any map
// move that is not the spin itself. The button top left starts it again. Never with reduced motion.
const SPIN_DEG_PER_SEC = 3;   // one turn in two minutes
const SPIN_STOP_EVENTS = ['pointerdown', 'keydown', 'wheel', 'paste', 'drop'];
let spinRaf = 0, spinBtn = null;

const isSpinning = () => !!spinRaf;
function syncSpinButton() {
  if (!spinBtn) return;
  const on = isSpinning();
  spinBtn.classList.toggle('active', on);
  spinBtn.setAttribute('aria-pressed', String(on));
  spinBtn.title = on ? 'Stop the globe' : 'Let it spin';
}
function onIdleInput(e) { if (!e.target.closest?.('.sa-spin-btn')) stopSpin(); }

function runSpin() {
  let last = performance.now();
  const step = now => {
    const dt = Math.min(0.1, (now - last) / 1000);   // no jump after the tab was in the background
    last = now;
    spinRaf = requestAnimationFrame(step);
    // Map hidden (collapsed, or the small-window notice): keep the turn, skip the redraw
    if (!map.getContainer().clientWidth) return;
    const c = map.getCenter();
    // zoomed in, the turn slows with the zoom so the surface does not race past
    const speed = SPIN_DEG_PER_SEC * Math.min(1, 2 ** (globeFitZoom(c.lat) - map.getZoom()));
    map.jumpTo({ center: [((c.lng - speed * dt + 540) % 360) - 180, c.lat] }, { spin: true });
  };
  spinRaf = requestAnimationFrame(step);
  syncSpinButton();
}
function stopSpin() {
  cancelAnimationFrame(spinRaf);
  spinRaf = 0;
  SPIN_STOP_EVENTS.forEach(t => document.removeEventListener(t, onIdleInput, true));
  syncSpinButton();
}
async function startIdleSpin() {
  const still = () => img === null && mapPtA === null && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!still()) return;
  await mapReady;
  if (!still() || isSpinning()) return;
  SPIN_STOP_EVENTS.forEach(t => document.addEventListener(t, onIdleInput, { capture: true, passive: true }));
  runSpin();
}

function addSpinButton() {
  // a globe, and under it an arrow running left to right, the way its surface turns
  spinBtn = mapButton('sa-spin-btn', 'Let it spin',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="10.5" r="6"/><ellipse cx="12" cy="10.5" rx="2.6" ry="6"/><path d="M6 10.5h12"/>' +
    '<path d="M4 17.5c4.5 3.2 11.5 3.2 16 0"/><polyline points="16.5 17.8 20 17.5 18.5 20.7"/></svg>');
  spinBtn.addEventListener('click', () => {
    if (isSpinning()) { stopSpin(); return; }
    stopSpin(); runSpin();
  });
  syncSpinButton();
}

/* ─── MARKS ─── */
// Great-circle distance in metres
function distM(a, b) {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// The ring: every point `radius` metres from `c` along the ground, as [lng, lat] pairs
function ringCoords(c, radius) {
  const r = Math.PI / 180, d = radius / EARTH_R;
  const lat1 = c.lat * r, lng1 = c.lng * r;
  const pts = [];
  for (let i = 0; i <= RING_STEPS; i++) {
    const brg = 2 * Math.PI * i / RING_STEPS;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brg));
    const lng2 = lng1 + Math.atan2(Math.sin(brg) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
    pts.push([lng2 / r, lat2 / r]);
  }
  return pts;
}

function renderMarks() {
  updateMapHint();
  const src = map && map.getSource('sa-marks');
  if (!src) return;
  const features = [];
  const pt = p => ({ type: 'Feature', properties: { kind: 'pt' }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } });
  if (objectRing && mapPtA && solvedDistance !== null) {
    features.push({ type: 'Feature', properties: { kind: 'ring' },
      geometry: { type: 'Polygon', coordinates: [ringCoords(mapPtA, solvedDistance)] } });
  }
  if (mapPtA && mapPtB) {
    features.push({ type: 'Feature', properties: { kind: 'line' },
      geometry: { type: 'LineString', coordinates: [[mapPtA.lng, mapPtA.lat], [mapPtB.lng, mapPtB.lat]] } });
  }
  if (mapPtA) features.push(pt(mapPtA));
  if (mapPtB) features.push(pt(mapPtB));
  src.setData({ type: 'FeatureCollection', features });
}

// Clicking cycles: place A → place B + measure → third click resets and places new A.
function handleMapClick(p) {
  if (solveMode === 'distance') { placeObjectRing(p); return; }
  if (mapPtA && mapPtB) {
    resetMapPoints();
    distance = null;
    document.getElementById('distance-input').value = '';
    compute();
  }
  if (!mapPtA) {
    mapPtA = p;
  } else {
    mapPtB = p;
    const d = distM(mapPtA, mapPtB);
    setDistance(d);
  }
  renderMarks();
  updateGuide();
}

function setDistance(d) {
  distance = d;
  document.getElementById('distance-input').value = d.toFixed(1);
  compute();
  updateDiagram();
}

// Distance mode: one click places the object; the ring of radius = solved distance
// is the set of all points the camera could be standing at.
function placeObjectRing(p) {
  if (solvedDistance === null) {
    showToast('Solve the distance first: mark the object on the photo and enter its known size.');
    return false;
  }
  resetMapPoints();
  mapPtA = p;
  objectRing = true;
  renderMarks();
  // Fit the ring as if it sat at longitude 0, then centre on the real point: a ring across
  // the antimeridian would otherwise span the whole world in min/max longitude.
  const ring = ringCoords({ lat: p.lat, lng: 0 }, solvedDistance);
  const lngs = ring.map(c => c[0]), lats = ring.map(c => c[1]);
  const cam = map.cameraForBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 30 });
  if (cam) map.easeTo({ center: [p.lng, cam.center.lat ?? p.lat], zoom: cam.zoom, bearing: 0, essential: true });
  updateGuide();
  return true;
}

// Keep the ring in sync when the solved distance changes (e.g. known size edited).
function refreshObjectRing() {
  if (solveMode !== 'distance' || !objectRing || mapPtA === null || solvedDistance === null) return;
  renderMarks();
}

function resetMapPoints() {
  objectRing = false;
  mapPtA = null; mapPtB = null;
  renderMarks();
}

function formatMapDist(d) {
  return d >= 1000 ? (d / 1000).toFixed(2) + ' km' : d.toFixed(1) + ' m';
}

// The map's own hint: a pill at the bottom of the map, like the photo's. It says what the map
// wants next (red), or what it measured; it is empty while the map has nothing to do.
// Called from renderMarks() and updateGuide(), so it follows every change of state.
function updateMapHint() {
  const el = document.getElementById('map-hint-text');
  const ready = img !== null && sensorW !== null && focalLength !== null && pixelSpan !== null;
  let text = '', cls = '';
  if (solveMode === 'distance') {
    if (objectRing && mapPtA && solvedDistance !== null) {
      text = `The camera stood somewhere on this ring · r = ${formatMapDist(solvedDistance)}`; cls = 'done';
    } else if (solvedDistance !== null) {
      text = 'Click where the object is to draw the ring';
    }
  } else if (mapPtA && mapPtB) {
    text = `Camera → object · ${formatMapDist(distM(mapPtA, mapPtB))}`; cls = 'muted';
  } else if (mapPtA) {
    text = "Now click the object's position";
  } else if (ready && distance === null) {
    text = 'Click where the camera stood, then the object';
  }
  el.textContent = text;
  el.className = 'step-hint' + (cls ? ' ' + cls : '');
  if (resetBtn) resetBtn.disabled = !mapPtA;
}

// The map's reset button (top left on the map): clears the points and the distance they gave
function clearMapPoints() {
  resetMapPoints();
  if (solveMode === 'size') {
    distance = null;
    document.getElementById('distance-input').value = '';
  }
  compute();
  updateDiagram();
  updateGuide();
}

// Clicking the GPS value in the EXIF card copies it
function copyGPS() {
  if (!exifGPS) return;
  const text = `${exifGPS.lat.toFixed(5)}, ${exifGPS.lng.toFixed(5)}`;
  navigator.clipboard.writeText(text).then(
    () => showToast('Coordinates copied.', 'success', 1800),
    () => {}
  );
}

// One coordinate: decimal or degrees/minutes/seconds, with the hemisphere letter before or
// after it (or a minus sign). Groups: lead letter, d, m, s | d, m, s, trailing letter.
const COORD_BODY = String.raw`(-?\d+(?:\.\d+)?)\s*(?:°|º|d(?![a-z]))?\s*(?:(\d+(?:\.\d+)?)\s*')?\s*(?:(\d+(?:\.\d+)?)\s*")?`;
const COORD_RE   = new RegExp(String.raw`(?<![a-z])([NSEW])\s*${COORD_BODY}|${COORD_BODY}\s*([NSEW](?![a-z]))?`, 'gi');

// "52.520, 13.405", "33.9S 151.2E", "N 52.5 E 13.4", 52°32'43.8"N 13°13'11.6"E, "52,52 13,405" …
// Returns { lat, lng } or null. A hemisphere letter decides the axis, so "13.4E 52.5N" works too.
function parseCoordInput(raw) {
  let s = raw.trim()
    .replace(/[′’ʼ‘]/g, "'").replace(/[″”“]/g, '"').replace(/''/g, '"');
  // Decimal commas ("52,52 13,405"), when something else separates the two numbers
  if (/\d,\d/.test(s) && /[\s;]/.test(s)) s = s.replace(/(\d),(\d)/g, '$1.$2');

  const coords = [];
  for (const m of s.matchAll(COORD_RE)) {
    const [d, min, sec, letter] = m[1] ? [m[2], m[3], m[4], m[1]] : [m[5], m[6], m[7], m[8]];
    const mm = min ? parseFloat(min) : 0, ss = sec ? parseFloat(sec) : 0;
    if (mm >= 60 || ss >= 60) return null;
    const dir = (letter || '').toUpperCase();
    let v = Math.abs(parseFloat(d)) + mm / 60 + ss / 3600;
    if (d.startsWith('-') || dir === 'S' || dir === 'W') v = -v;
    coords.push({ v, axis: dir === 'N' || dir === 'S' ? 'lat' : dir === 'E' || dir === 'W' ? 'lng' : null });
    if (coords.length === 2) break;
  }
  if (coords.length < 2) return null;
  let [a, b] = coords;
  if (a.axis && a.axis === b.axis) return null;            // two latitudes, or two longitudes
  if (a.axis === 'lng' || b.axis === 'lat') [a, b] = [b, a]; // written longitude first
  return { lat: a.v, lng: b.v };
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
  stopSpin();
  // Distance mode: the pasted point is the object, so the ring goes around it
  if (solveMode === 'distance') {
    if (placeObjectRing({ lat, lng })) this.value = '';   // kept when there is no distance yet
    return;
  }
  this.value = '';
  resetMapPoints();
  mapPtA = { lat, lng };
  renderMarks();
  map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 14), essential: true });
  updateGuide();
});


document.querySelectorAll('.tile-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const tile = this.dataset.tile;
    if (!map || tile === currentTile) return;
    currentTile = tile;
    setTileSet(tile);
    document.querySelectorAll('.tile-btn').forEach(b => b.classList.toggle('active-tile', b === this));
  });
});

/* ─── KEYBOARD ───────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
  // Ctrl/Cmd+R and +N are the browser's (reload, new window): they must not wipe the work first
  if (!e.key || e.ctrlKey || e.metaKey || e.altKey) return;
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

/* ─── PHOTO / MAP DIVIDER ────────────────────────────────────── */
// --split on #workspace is the photo panel's share of the width. Drag, double-click
// (back to the default 60:40), arrow keys (Shift = bigger steps); the chevron hides the map.
// Split and hidden state are remembered in this browser.
const workspace = document.getElementById('workspace');
const splitter  = document.getElementById('pane-splitter');
const SPLIT_KEY = 'sa-split';
const MAP_HIDDEN_KEY = 'sa-map-hidden';
const SPLIT_DEFAULT = 60, SPLIT_MIN = 30, SPLIT_MAX = 80;   // photo share; the map gets the rest
let splitPct  = SPLIT_DEFAULT;

function storageGet(key)      { try { return localStorage.getItem(key); } catch (err) { return null; } }
function storageSet(key, val) { try { localStorage.setItem(key, val); } catch (err) { /* storage off: not remembered */ } }

function setSplit(pct, save = true) {
  splitPct = Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, pct));
  document.getElementById('app').style.setProperty('--split', splitPct + '%');
  splitter.setAttribute('aria-valuenow', Math.round(splitPct));
  if (save) storageSet(SPLIT_KEY, splitPct.toFixed(1));
}

function setMapHidden(hidden, save = true) {
  workspace.classList.toggle('map-collapsed', hidden);
  document.getElementById('app').classList.toggle('map-collapsed', hidden);
  const btn = document.getElementById('btn-map-collapse');
  btn.textContent = hidden ? '‹' : '›';
  btn.title = hidden ? 'Show map' : 'Hide map';
  btn.setAttribute('aria-label', btn.title);
  if (save) storageSet(MAP_HIDDEN_KEY, hidden ? '1' : '0');
}

const mapHidden = () => workspace.classList.contains('map-collapsed');

splitter.addEventListener('pointerdown', e => {
  if (e.button !== 0 || e.target.closest('.splitter-chevron') || mapHidden()) return;
  e.preventDefault();
  splitter.setPointerCapture(e.pointerId);
  splitter.classList.add('dragging');
  document.body.classList.add('splitter-dragging');
});
splitter.addEventListener('pointermove', e => {
  if (!splitter.hasPointerCapture(e.pointerId)) return;
  const r = workspace.getBoundingClientRect();
  setSplit((e.clientX - r.left) / r.width * 100, false);
});
splitter.addEventListener('lostpointercapture', () => {
  splitter.classList.remove('dragging');
  document.body.classList.remove('splitter-dragging');
  setSplit(splitPct);
});
splitter.addEventListener('dblclick', e => {
  if (e.target.closest('.splitter-chevron') || mapHidden()) return;
  setSplit(SPLIT_DEFAULT);
});
splitter.addEventListener('keydown', e => {
  if (mapHidden() || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
  e.preventDefault();
  const step = e.shiftKey ? 10 : 2;
  setSplit(splitPct + (e.key === 'ArrowRight' ? step : -step));
});
document.getElementById('btn-map-collapse').addEventListener('click', () => setMapHidden(!mapHidden()));

splitter.setAttribute('aria-valuemin', SPLIT_MIN);
splitter.setAttribute('aria-valuemax', SPLIT_MAX);
{
  const saved = parseFloat(storageGet(SPLIT_KEY));
  setSplit(isFinite(saved) ? saved : SPLIT_DEFAULT, false);
  setMapHidden(storageGet(MAP_HIDDEN_KEY) === '1', false);
}

/* ─── RESIZE ─────────────────────────────────────────────────── */
// Panels change size with the window and with the divider: follow both.
new ResizeObserver(() => { resizeCanvas(); drawCanvas(); }).observe(container);
new ResizeObserver(() => { if (map) map.resize(); }).observe(document.getElementById('map-container'));

/* ─── INIT ───────────────────────────────────────────────────── */
populateCameraDropdown();
renderTabs();
resizeCanvas();
initMap();
updateGuide();
