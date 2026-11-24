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
let resultValue    = null;     // the current result (m): size, or distance in distance mode
let resultRange    = null;     // unknown camera: [low, high] of the result (m)
let solvedRange    = null;     // distance mode with an unknown camera: [near, far] (m), the ring is a band
let objectRing     = false;    // distance-mode map ring placed (drawn by renderMarks)
let exifFocal    = null;   // focal length from the photo's EXIF (mm): wins over the database's
let exifGPS      = null;
let loadSeq      = 0;      // bumped per photo, so a late EXIF read of an earlier photo is dropped
let autosaveDb = null, autosaveTimer = null, autosaveReady = false, autosaveWarned = false;   // AUTOSAVE below
let autosaveOwner = !navigator.locks;

const CUSTOM_IDX = CAMERA_DB.findIndex(c => c.brand === '—');

// Presets, shown first in the camera list: typical values when the exact model is not known.
// Phone sensors are typical current 4:3 ones; focal_length = eq × sensor_w / 36, as in camera-db.js.
// "Unknown" has no values: the result is a range over 24–35 mm equivalent (unknownCam).
const PRESETS = [
  { label: 'Phone · main camera (24 mm eq)',      sensor_w: 8.2,  sensor_h: 6.15, focal_length: 5.47, focal_length_eq: 24 },
  { label: 'Phone · ultrawide (13 mm eq)',        sensor_w: 5.6,  sensor_h: 4.2,  focal_length: 2.02, focal_length_eq: 13 },
  { label: 'Phone · telephoto 3× (77 mm eq)',     sensor_w: 4.0,  sensor_h: 3.0,  focal_length: 8.56, focal_length_eq: 77 },
  { label: 'APS-C camera (enter the lens focal length)',      sensor_w: 23.5, sensor_h: 15.6, focal_length: null },
  { label: 'Full-frame camera (enter the lens focal length)', sensor_w: 36.0, sensor_h: 24.0, focal_length: null },
  { label: 'Unknown camera (range for 24–35 mm eq)', sensor_w: null, sensor_h: null, focal_length: null, unknown: true },
].map(p => ({ brand: 'Preset', confidence: 'preset', ...p }));
const PRESET_START = CAMERA_DB.length;
CAMERA_DB.push(...PRESETS);
const UNKNOWN_IDX = CAMERA_DB.findIndex(c => c.unknown);
const UNKNOWN_EQ  = [24, 35];   // the 35 mm equivalents an unknown camera is computed for
let unknownCam = false;

let map          = null;
let gpsMarker    = null;
let mapPtA       = null;   // {lat, lng}
let mapPtB       = null;
let currentTile  = 'dark';
let camIdx       = null;   // CAMERA_DB entry in use, for the optics slot
let resetBtn     = null;   // map control: clear the map points (made in initMap)

/* ─── IMAGE LOAD ─────────────────────────────────────────────── */
// HEIC (iPhone) cannot be decoded by most browsers: say so rather than "could not load"
const isHeic = file => /^image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name || '');

function loadImage(file, name = file.name) {
  if (isHeic(file)) {
    showToast('HEIC photos cannot be opened in the browser. Export it as JPEG (keeps the EXIF) and drop that.');
    return;
  }
  openPhotoInTab(file, name || 'Photo');
}

// Decodes a photo file into an Image (resolves null when it cannot be read)
function decodeImage(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload  = () => { URL.revokeObjectURL(url); resolve(im); };
    im.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    im.src = url;
  });
}

// The canvas is drawn in CSS pixels (viewW × viewH); its backing store is scaled by the
// device pixel ratio so the photo stays sharp on high-DPI screens.
let viewW = 0, viewH = 0;

const fitScale = () => Math.min(viewW / img.naturalWidth, viewH / img.naturalHeight) * 0.92;

// A photo loaded while its panel has no size (photo side hidden, window below the minimum)
// is fitted once the panel has one
let needsFit = false;

function fitImage() {
  needsFit = !viewW || !viewH;
  if (needsFit) return;
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
  if (g && isFinite(g.latitude) && isFinite(g.longitude)) {
    exifGPS = { lat: g.latitude, lng: g.longitude };
    showExifGps(exifGPS, true);
  }

  compute();
  updateDiagram();
}

// The photo's GPS: in the EXIF card (click copies), as a marker, and the GPS button.
// fly: go there (a photo just opened); a tab switched back to keeps the map where it is.
function showExifGps(gps, fly) {
  const gpsEl = document.getElementById('exif-gps-val');
  gpsEl.textContent = `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`;
  gpsEl.classList.add('has-data', 'clickable');
  gpsEl.onclick = copyGPS;
  document.getElementById('btn-exif').classList.add('has-data');
  if (gpsMarker) gpsMarker.remove();
  gpsMarker = null;
  if (map) {
    const el = document.createElement('div');
    el.className = 'gps-marker';
    el.title = 'Where the photo was taken (EXIF)';
    gpsMarker = new maplibregl.Marker({ element: el }).setLngLat([gps.lng, gps.lat]).addTo(map);
  }
  syncGpsButton();
  if (fly) { stopSpin(); flyToGPS(); }   // the flight also stops the spin
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
  if (!file) return;
  if (file.type.startsWith('image/') || isHeic(file) || !file.type) loadImage(file);   // no type: let the decoder decide
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

// Browse opens the file picker (the screen itself is not a click target, as in TracePoint)
document.getElementById('btn-browse').addEventListener('click', () => fileInput.click());

let photoName = null;   // the shown tab's name

/* ─── PHOTO TABS ─────────────────────────────────────────────── */
// Several photos side by side (ported from TracePoint's sessions). Each tab keeps its photo
// file and, while it is not shown, a snapshot of everything measured on it (captureState).
// The shown tab lives in the global state above. A photo dropped or pasted while one is
// open opens in a new tab. Double-click a name to rename it.
let tabs = [];
let activeTab = 0;
let tabSeq = 0;
const newTabId = () => `t${Date.now().toString(36)}${(tabSeq++).toString(36)}`;
const emptyTab = () => ({ id: newTabId(), name: null, file: null, img: null, state: null });
tabs.push(emptyTab());

const INPUT_IDS = ['sensor-w-input', 'sensor-h-input', 'focal-length-input', 'distance-input', 'known-size-input'];
const EXIF_IDS  = ['exif-camera-val', 'exif-focal-val', 'exif-size-val', 'exif-gps-val'];
const SOURCES   = ['source-exif', 'source-db', 'source-manual'];

// Everything that belongs to the shown photo, as plain data (also what autosave writes)
function captureState() {
  const $ = id => document.getElementById(id);
  const inputs = {};
  INPUT_IDS.forEach(id => {
    const el = $(id);
    inputs[id] = { v: el.value, src: SOURCES.find(c => el.classList.contains(c)) || '' };
  });
  const exifCells = {};
  EXIF_IDS.forEach(id => { exifCells[id] = $(id).classList.contains('has-data') ? $(id).textContent : null; });
  return {
    markA, markB, solveMode, unknownCam, sensorW, sensorH, focalLength, distance, knownSize,
    camLabel: camIdx !== null ? CAMERA_DB[camIdx].label : null,
    exifFocal, exifGPS, exifCells, exifEq: $('exif-focal-eq').textContent, inputs,
    mapPtA, mapPtB, objectRing,
    view: img && viewW ? { scale, offsetX, offsetY, viewW, viewH } : null,
    hasResult: resultValue !== null
  };
}

// Puts a snapshot back (the photo itself is already in img)
function applyState(s) {
  const $ = id => document.getElementById(id);
  markA = s.markA || null; markB = s.markB || null;
  pixelSpan = markA && markB ? Math.hypot(markB.x - markA.x, markB.y - markA.y) : null;
  $('pixel-span-input').value = pixelSpan !== null ? Math.round(pixelSpan) : '';
  $('span-source').textContent = pixelSpan !== null ? 'from canvas' : 'click two points on photo';
  $('btn-reset-marks').disabled = pixelSpan === null && !markA;

  sensorW = s.sensorW ?? null; sensorH = s.sensorH ?? null; focalLength = s.focalLength ?? null;
  distance = s.distance ?? null; knownSize = s.knownSize ?? null;
  exifFocal = s.exifFocal ?? null;
  INPUT_IDS.forEach(id => {
    const saved = s.inputs?.[id];
    $(id).value = saved?.v ?? '';
    SOURCES.forEach(c => $(id).classList.remove(c));
    if (saved?.src) $(id).classList.add(saved.src);
  });
  updateSensorSourceBadges();

  const idx = s.camLabel ? CAMERA_DB.findIndex(c => c.label === s.camLabel) : -1;
  if (idx >= 0) setCameraLabel(idx); else clearCameraSelection();
  unknownCam = !!s.unknownCam;

  let anyExif = false;
  EXIF_IDS.forEach(id => {
    const t = s.exifCells?.[id];
    $(id).textContent = t ?? '—';
    $(id).classList.toggle('has-data', t != null);
    if (t != null) anyExif = true;
  });
  $('exif-focal-eq').textContent = s.exifEq || '';
  $('btn-exif').classList.toggle('has-data', anyExif);
  exifGPS = s.exifGPS || null;
  if (exifGPS) showExifGps(exifGPS, false);
  syncGpsButton();

  solveMode = s.solveMode === 'distance' ? 'distance' : 'size';
  updateModeUI();
  mapPtA = s.mapPtA || null; mapPtB = s.mapPtB || null; objectRing = !!s.objectRing;

  const v = s.view;
  if (v && v.viewW === viewW && v.viewH === viewH) { scale = v.scale; offsetX = v.offsetX; offsetY = v.offsetY; needsFit = false; }
  else fitImage();
  compute();
  renderMarks();
}

// The camera list's label for an entry, without loading its values
function setCameraLabel(idx) {
  const trigger = document.getElementById('camera-trigger');
  trigger.textContent = CAMERA_DB[idx].label;
  camIdx = idx;
  trigger.classList.add('has-selection');
  document.querySelectorAll('#camera-panel [data-idx]').forEach(el =>
    el.classList.toggle('selected', parseInt(el.dataset.idx, 10) === idx));
}

// Shows tab t: its photo (decoded once, then kept) and its state, or the drop screen when empty.
// A photo shown for the first time has its EXIF read.
async function showTab(t) {
  const seq = ++loadSeq;
  resetPhotoState();
  img = null;
  photoName = t.name;
  if (!t.file) {
    overlay.classList.remove('hidden');
    drawCanvas();
    compute();
    renderTabs();
    return;
  }
  const im = t.img || await decodeImage(t.file);
  if (seq !== loadSeq) return;   // another tab was chosen meanwhile
  if (!im) {
    showToast('Could not open this file: it is not an image the browser can read, or it is damaged.');
    closeTab(tabs.indexOf(t), true);
    return;
  }
  t.img = im;
  img = im;
  overlay.classList.add('hidden');
  stopSpin();
  resizeCanvas();
  if (t.state) applyState(t.state);
  else { fitImage(); compute(); readExif(t.file, seq); }
  t.state = null;   // the shown tab's state is the live one
  drawCanvas();
  renderTabs();
  scheduleAutosave();
}

function switchTab(i) {
  if (i === activeTab || !tabs[i]) return;
  if (tabs[activeTab]) tabs[activeTab].state = captureState();
  activeTab = i;
  showTab(tabs[i]);
}

// A new photo: into the shown tab if that one is empty, else into a new tab
function openPhotoInTab(file, name) {
  let t = tabs[activeTab];
  if (t.file) {
    t.state = captureState();
    t = emptyTab();
    tabs.push(t);
    activeTab = tabs.length - 1;
  }
  t.file = file; t.name = name; t.img = null; t.state = null;
  autosavePutImage(t);
  showTab(t);
}

// "+" and N: a new empty tab, always (as in TracePoint)
function addTab() {
  tabs[activeTab].state = tabs[activeTab].file ? captureState() : null;
  tabs.push(emptyTab());
  activeTab = tabs.length - 1;
  showTab(tabs[activeTab]);
  scheduleAutosave();
}

// ×: the tab goes, with its photo and its saved copy. The last one leaves an empty tab and the
// globe goes back to turning.
function closeTab(i, quiet = false) {
  if (!tabs[i]) return;
  tabs.splice(i, 1);
  const wasActive = i === activeTab;
  if (!tabs.length) tabs.push(emptyTab());
  if (i < activeTab || activeTab >= tabs.length) activeTab = Math.max(0, activeTab - 1);
  if (wasActive) showTab(tabs[activeTab]); else renderTabs();
  if (!tabs.some(t => t.file) && map) { showWholeGlobe(); map.once('moveend', startIdleSpin); }
  if (!quiet) scheduleAutosave();
}

function renameTab(i, nameEl) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'photo-name-edit';
  input.value = tabs[i].name || '';
  input.setAttribute('aria-label', 'Photo name');
  nameEl.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const finish = keep => {
    if (done) return;
    done = true;
    const v = input.value.trim();
    if (keep && v) { tabs[i].name = v; if (i === activeTab) photoName = v; scheduleAutosave(); }
    tabsKey = null;
    renderTabs();
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
    e.stopPropagation();
  });
  input.addEventListener('click', e => e.stopPropagation());
  input.addEventListener('blur', () => finish(true));
}

let tabsKey = null;   // what the strip shows now: rebuilt only when that changes
function renderTabs() {
  const liveState = resultBar.classList.contains('has-result') ? 'result' : img ? 'loaded' : '';
  const dotOf = (t, i) => i === activeTab ? liveState : t.state?.hasResult ? 'result' : t.file ? 'loaded' : '';
  if (tabs[activeTab]) tabs[activeTab].name = photoName;
  const key = tabs.map((t, i) => `${t.id}:${t.name}:${dotOf(t, i)}`).join('|') + `#${activeTab}`;
  if (key === tabsKey) return;
  tabsKey = key;
  const wrap = document.getElementById('photo-tabs');
  wrap.innerHTML = '';
  tabs.forEach((t, i) => {
    const tab = document.createElement('div');
    tab.className = 'photo-tab' + (i === activeTab ? ' active' : '');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(i === activeTab));
    tab.tabIndex = i === activeTab ? 0 : -1;
    tab.title = (t.name || `Photo ${i + 1}: no photo yet`) + (t.file ? ' · double-click the name to rename' : '');
    const dot = document.createElement('span');
    const state = dotOf(t, i);
    dot.className = 'photo-dot' + (state ? ' ' + state : '');
    const name = document.createElement('span');
    name.className = 'photo-name';
    name.textContent = t.name || `Photo ${i + 1}`;
    tab.append(dot, name);
    tab.addEventListener('click', () => switchTab(i));
    tab.addEventListener('keydown', e => {
      if (e.target !== tab || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      e.preventDefault();
      const j = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      switchTab(j);
      wrap.querySelectorAll('.photo-tab')[j]?.focus();
    });
    if (t.file) name.addEventListener('dblclick', e => { e.stopPropagation(); renameTab(i, name); });
    if (t.file || tabs.length > 1) {
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'photo-tab-close';
      close.textContent = '×';
      close.title = 'Close this photo';
      close.setAttribute('aria-label', `Close ${t.name || 'this tab'}`);
      close.addEventListener('click', e => { e.stopPropagation(); closeTab(i); });
      tab.appendChild(close);
    }
    wrap.appendChild(tab);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'photo-tab-add';
  add.title = 'New photo';
  add.setAttribute('aria-label', 'New photo');
  add.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  add.addEventListener('click', addTab);
  wrap.appendChild(add);
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
document.getElementById('btn-demo').addEventListener('click', loadDemo);
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadImage(fileInput.files[0]);
  fileInput.value = '';
});

// A mark under the pointer (within MARK_HIT screen px), B first since it is drawn on top
const MARK_HIT = 12;
function markAt(e) {
  if (!img) return null;
  const rect = canvas.getBoundingClientRect();
  const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  for (const [key, m] of [['B', markB], ['A', markA]]) {
    if (!m) continue;
    const c = imgToCanvas(m);
    if (Math.hypot(c.x - p.x, c.y - p.y) <= MARK_HIT) return key;
  }
  return null;
}

// Dragging a mark moves it (clamped to the photo); the span and result follow live.
// Move and release are watched on the window, so the drag goes on past the canvas edge.
let dragMark = null;
function moveMarkTo(e) {
  const rect = canvas.getBoundingClientRect();
  const ip = canvasToImg(e.clientX - rect.left, e.clientY - rect.top);
  ip.x = Math.min(img.naturalWidth,  Math.max(0, ip.x));
  ip.y = Math.min(img.naturalHeight, Math.max(0, ip.y));
  if (dragMark === 'A') markA = ip; else markB = ip;
  if (markA && markB) computePixelSpan();
  requestDraw();
}
window.addEventListener('mousemove', e => { if (dragMark) moveMarkTo(e); });
window.addEventListener('mouseup', () => {
  if (!dragMark) return;
  dragMark = null;
  canvas.style.cursor = '';
  updateGuide();
});

canvas.addEventListener('mousedown', e => {
  if (e.button !== 0 && e.button !== 1) return;
  if (e.button === 1) e.preventDefault(); // suppress autoscroll cursor
  if (e.button === 0) {
    dragMark = markAt(e);
    if (dragMark) { e.preventDefault(); canvas.style.cursor = 'grabbing'; return; }
  }
  panStart = { x: e.clientX, y: e.clientY };
  hasDragged = false;
});
canvas.addEventListener('mousemove', e => {
  if (!dragMark && !(e.buttons & 5)) canvas.style.cursor = markAt(e) ? 'grab' : '';
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
  if (dragMark) return;   // the end of a mark drag, not a click (the window handler ends it)
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
  if (!unknownCam && (sensorW === null || focalLength === null))
    return { idx: 1, hint: 'Pick the camera above, or enter sensor width and focal length' };
  if (pixelSpan === null)
    return { idx: 2, hint: markA ? 'Click the other end of the object'
                                 : 'Click both ends of the object · scroll to zoom, drag to pan' };
  if (solveMode === 'distance') {
    if (knownSize === null || solvedDistance === null) return { idx: 3, hint: "Enter the object's real size above" };
    if (mapPtA === null) return { idx: 3, hint: 'Click where the object is on the map to draw the ring' };
    return { idx: GUIDE_STEPS.length, hint: solvedRange ? 'The camera stood somewhere in this band' : 'The camera stood somewhere on this ring', cls: 'done' };
  }
  if (distance === null) return { idx: 3, hint: 'Enter the distance above, or click camera then object on the map' };
  return { idx: GUIDE_STEPS.length, hint: 'R resets the marks · N turns the map north and flat', cls: 'muted' };
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
  updateDiagram();
  scheduleAutosave();

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
  unknownCam = false;
  trigger.classList.remove('has-selection');
  document.querySelectorAll('#camera-panel [data-idx]').forEach(el => el.classList.remove('selected'));
}

function selectCamera(idx) {
  const cam = CAMERA_DB[idx];
  if (!cam) return;

  const trigger = document.getElementById('camera-trigger');
  trigger.textContent = cam.label;
  camIdx = idx;
  unknownCam = !!cam.unknown;
  trigger.classList.add('has-selection');
  document.querySelectorAll('#camera-panel [data-idx]').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.idx, 10) === idx);
  });

  if (cam.sensor_w === null) {
    document.getElementById('sensor-w-input').value = '';
    document.getElementById('sensor-h-input').value = '';
    setInputSource('sensor-w-input', '');
    setInputSource('sensor-h-input', '');
    if (!cam.unknown) document.getElementById('sensor-w-input').focus();   // Custom: type them
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
  filterInput.setAttribute('aria-label', 'Filter cameras');
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
    // While filtering, only matching models show: the presets step aside
    panel.querySelectorAll('.cam-preset, .cam-presets-hdr').forEach(el => { el.style.display = q ? 'none' : ''; });
    panel.querySelectorAll('.cam-category-hdr:not(.cam-presets-hdr)').forEach(hdr => {
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

  // Presets first: most photos come from a phone's main camera, and the camera is often unknown
  const presetHdr = document.createElement('div');
  presetHdr.className = 'cam-category-hdr cam-presets-hdr';
  presetHdr.textContent = 'Presets';
  panel.appendChild(presetHdr);
  CAMERA_DB.forEach((cam, i) => {
    if (cam.brand !== 'Preset') return;
    const el = document.createElement('div');
    el.className = 'cam-custom cam-preset';
    el.textContent = cam.label;
    el.dataset.idx = i;
    el.addEventListener('click', () => { selectCamera(i); closeCameraPanel(); });
    panel.appendChild(el);
  });
  const specificHdr = document.createElement('div');
  specificHdr.className = 'cam-category-hdr cam-presets-hdr';
  specificHdr.textContent = 'Specific model…';
  panel.appendChild(specificHdr);

  // Custom entry at the top of the specific models
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
    if (cam.brand === '—' || cam.brand === 'Preset') return;
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
  updateModeUI();
  resetMapPoints();
  compute();
  updateDiagram();
  scheduleAutosave();
}
// The toggle and the fields that follow the mode (also used when a tab is shown again)
function updateModeUI() {
  const distMode = solveMode === 'distance';
  document.querySelectorAll('.solve-btn').forEach(b =>
    b.classList.toggle('active-solve', b.dataset.mode === solveMode));
  document.getElementById('distance-field').style.display   = distMode ? 'none' : '';
  document.getElementById('known-size-field').style.display = distMode ? '' : 'none';
  document.getElementById('dist-size-label').textContent    = distMode ? 'Known size' : 'Distance';
  document.getElementById('known-source').textContent       = distMode ? "the object's real size" : 'type it, or click the map';
  document.getElementById('result-label').textContent       = distMode ? 'Distance to object' : 'Real-world size';
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
    '?': { cls: '',         text: '? estimated' },
    preset: { cls: '',      text: 'typical values' }
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
  if (unknownCam) setFact('fact-eq', `${UNKNOWN_EQ[0]}–${UNKNOWN_EQ[1]} mm?`);
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
  const haveCamera = unknownCam || (sensorW !== null && focalLength !== null);
  if (!img || !haveCamera || pixelSpan === null) {
    solvedDistance = null; solvedRange = null; clearResult(); return;
  }
  solvedDistance = null; solvedRange = null;   // set only on a valid distance-mode result below
  // Pinhole: a span s on the sensor is s / f of the distance, whatever its angle on the photo
  // (Δx and Δy each times the pitch, then Pythagoras, is the span times the pitch).
  // real_size = distance × k, so distance = real_size / k.
  // Unknown camera: k for a 24 mm and a 35 mm equivalent lens, so the answer is a range.
  // A 35 mm equivalent f₃₅ spans the photo's diagonal with the full-frame diagonal: k = span × 43.27 / (f₃₅ × diagonal px).
  let kLo, kHi;
  if (unknownCam) {
    const diagPx = Math.hypot(img.naturalWidth, img.naturalHeight);
    kHi = pixelSpan * FF_DIAG / (UNKNOWN_EQ[0] * diagPx);   // wide lens: more metres per pixel
    kLo = pixelSpan * FF_DIAG / (UNKNOWN_EQ[1] * diagPx);
  } else {
    const pitch = pixelPitch();
    kLo = kHi = pixelSpan * pitch / focalLength;
  }

  let lo, hi;
  if (solveMode === 'distance') {
    if (knownSize === null || !(kLo > 0)) { clearResult(); return; }
    lo = knownSize / kHi; hi = knownSize / kLo;
  } else {
    if (distance === null) { clearResult(); return; }
    lo = distance * kLo; hi = distance * kHi;
  }
  const value = (lo + hi) / 2;
  if (!isFinite(hi) || !(lo > 0)) { clearResult(); return; }
  resultValue = value;
  resultRange = unknownCam ? [lo, hi] : null;
  if (solveMode === 'distance') { solvedDistance = value; solvedRange = resultRange; }

  // One unit for both ends of a range, chosen by the larger
  const km = hi >= 1000;
  const num = v => km ? (v / 1000).toFixed(2) : v >= 100 ? v.toFixed(1) : v >= 10 ? v.toFixed(2) : v.toFixed(3);
  valEl.textContent  = resultRange ? `${num(lo)}–${num(hi)}` : num(value);
  unitEl.textContent = km ? 'km' : 'm';
  // Under the result: only a note when the camera is unknown
  document.getElementById('result-eq').textContent = resultRange ? `camera unknown: ${UNKNOWN_EQ[0]}–${UNKNOWN_EQ[1]} mm equivalent` : '';
  resultBar.classList.add('has-result');
  resultBar.classList.toggle('is-range', !!resultRange);
  renderTabs();
  updateOptics();
  updateGuide();
  refreshObjectRing();
}

function clearResult() {
  resultValue = null;
  resultRange = null;
  resultBar.classList.remove('is-range');
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
  const sizeMode = solveMode === 'size';
  const hasResult = resultValue !== null;
  const hasPixels = pixelSpan !== null, hasFocal = unknownCam || focalLength !== null, hasSensor = unknownCam || sensorW !== null;
  const hasD      = sizeMode ? distance !== null : hasResult;
  const hasObject = sizeMode ? hasResult : knownSize !== null;
  const allSet    = hasResult;
  const fmtMm = v => `${+v.toFixed(2)} mm`;

  // Which part the next step asks for (the same order as the step guide)
  const idx = guideStatus().idx;
  const next = idx === 0 || idx === 2 ? 'px' : idx === 1 ? 'camera' : idx === 3 ? (sizeMode ? 'd' : 'object') : null;

  const part = (ids, state) => ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('lit',     state === 'known');
    el.classList.toggle('result',  state === 'result');
    el.classList.toggle('unknown', state === 'unknown');
    el.classList.toggle('next',    state === 'next');
  });
  const state = (known, name, isUnknown = false) =>
    isUnknown ? (known ? 'result' : 'unknown') : known ? 'known' : next === name ? 'next' : '';

  part(['seg-sensor', 'diag-lbl-sensor'], state(hasSensor, 'camera'));
  part(['seg-focal', 'diag-lbl-f'],       state(hasFocal,  'camera'));
  part(['seg-pixels', 'diag-lbl-px'],     state(hasPixels, 'px'));
  part(['seg-distance', 'diag-lbl-d'],    state(hasD, 'd', !sizeMode));
  part(['seg-object', 'diag-lbl-object'], state(hasObject, 'object', sizeMode));
  // Solved: the whole diagram is the measurement, so all of it turns red (not red and white mixed)
  document.getElementById('diagram-svg').classList.toggle('solved', allSet);
  // The light path: lit once there is a result
  ['seg-pinhole', 'ray-tl', 'ray-bl', 'ray-tr', 'ray-br'].forEach(id => part([id], allSet ? 'result' : ''));

  const label = (id, text) => { document.getElementById(id).textContent = text; };
  label('diag-lbl-sensor', unknownCam ? 'sensor ?' : hasSensor ? `sensor ${fmtMm(sensorW)}` : 'sensor');
  label('diag-lbl-f',      unknownCam ? 'f ?' : hasFocal ? `f = ${fmtMm(focalLength)}` : 'f');
  label('diag-lbl-px',     hasPixels ? `px = ${Math.round(pixelSpan)}` : 'px');
  label('diag-lbl-d',      sizeMode ? (hasD ? `D = ${fmtLength(distance)}` : 'D')
                                    : (hasResult ? `D = ${fmtResult()}` : 'D = ?'));
  label('diag-lbl-object', sizeMode ? (hasResult ? `size = ${fmtResult()}` : 'size = ?')
                                    : (hasObject ? `size = ${fmtLength(knownSize)}` : 'size'));
}

// The result for labels: one length, or "6.1–8.9 m" for an unknown camera
function fmtResult() {
  if (!resultRange) return fmtLength(resultValue);
  const [lo, hi] = resultRange.map(fmtLength);
  return lo.split(' ')[1] === hi.split(' ')[1] ? `${lo.split(' ')[0]}–${hi}` : `${lo}–${hi}`;
}

// A length for labels: 8.42 m, 312 m, 1.25 km
function fmtLength(m) {
  return m >= 1000 ? `${+(m / 1000).toFixed(2)} km`
       : m >= 100  ? `${Math.round(m)} m`
       : m >= 10   ? `${+m.toFixed(1)} m`
       :             `${+m.toFixed(2)} m`;
}

// Clicking a part of the diagram goes to its input, where there is one
function diagramAction(partName) {
  if (partName === 'camera') {
    if (sensorW === null || camIdx === null) document.getElementById('camera-trigger').click();
    else document.getElementById('focal-length-input').focus();
  } else if (partName === 'px') {
    if (!img) fileInput.click();
  } else if (partName === 'd' && solveMode === 'size') {
    document.getElementById('distance-input').focus();
  } else if (partName === 'object' && solveMode === 'distance') {
    document.getElementById('known-size-input').focus();
  }
}
{
  const PARTS = { camera: ['seg-sensor', 'seg-focal', 'diag-lbl-sensor', 'diag-lbl-f'], px: ['seg-pixels', 'diag-lbl-px'],
                  d: ['seg-distance', 'diag-lbl-d'], object: ['seg-object', 'diag-lbl-object'] };
  Object.entries(PARTS).forEach(([name, ids]) => ids.forEach(id => {
    const el = document.getElementById(id);
    const targets = [el];
    if (el.tagName === 'line') {   // a 2 px line is hard to hit: a wide invisible twin takes the click
      const hit = el.cloneNode();
      hit.removeAttribute('id');
      hit.setAttribute('class', 'diag-hit');
      el.after(hit);
      targets.push(hit);
    }
    targets.forEach(t => {
      t.classList.add('diag-part');
      t.addEventListener('click', e => { e.stopPropagation(); diagramAction(name); });
    });
  }));
}

/* ─── RESET / NEW IMAGE ──────────────────────────────────────── */
function jumpToCustom() {
  if (CUSTOM_IDX < 0) return;
  const trigger = document.getElementById('camera-trigger');
  if (trigger.textContent === CAMERA_DB[CUSTOM_IDX].label) return;
  trigger.textContent = CAMERA_DB[CUSTOM_IDX].label;
  camIdx = CUSTOM_IDX;
  unknownCam = false;
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

// N: the map back to north up and looking straight down (as N in TracePoint)
function northMap() {
  if (!map) return;
  stopSpin();
  map.easeTo({ bearing: 0, pitch: 0, duration: 500 });
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
      paint: { 'line-color': '#e63946', 'line-width': 2, 'line-opacity': 0.8, 'line-dasharray': [3.5, 2] } });    setTileSet(currentTile);
    renderMarks();
  });

  map.on('click', e => {
    if (e.originalEvent?.target?.closest?.('.map-pt')) return;   // a click on a point (or the end of its drag) places nothing
    const p = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    if (isFinite(p.lat) && isFinite(p.lng)) handleMapClick(p);
  });
  map.on('contextmenu', e => { e.preventDefault(); showMapMenu(e); });
  map.on('click', hideMapMenu);
  map.on('movestart', e => { if (!e.spin) hideMapMenu(); if (!e.spin && spinRaf) stopSpin(); });
  map.on('move', updateMapView);
  map.on('moveend', e => { if (!e.spin) scheduleAutosave(); });
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
  scheduleAutosave();
  const src = map && map.getSource('sa-marks');
  if (!src) return;
  const features = [];
  if (objectRing && mapPtA && solvedDistance !== null) {
    // An unknown camera gives a band: the outer ring with the inner one as its hole
    const rings = solvedRange
      ? [ringCoords(mapPtA, solvedRange[1]), ringCoords(mapPtA, solvedRange[0]).reverse()]
      : [ringCoords(mapPtA, solvedDistance)];
    features.push({ type: 'Feature', properties: { kind: 'ring' }, geometry: { type: 'Polygon', coordinates: rings } });
  }
  if (mapPtA && mapPtB) {
    features.push({ type: 'Feature', properties: { kind: 'line' },
      geometry: { type: 'LineString', coordinates: [[mapPtA.lng, mapPtA.lat], [mapPtB.lng, mapPtB.lat]] } });
  }
  src.setData({ type: 'FeatureCollection', features });
  syncPointMarkers();
}

// The map points as draggable markers: A (the camera in size mode, the object in distance
// mode) and B (the object). Above the photo's GPS marker, so a point set on it stays on top
// and can be grabbed. Dragging updates the line, the distance or the ring as it moves.
const pointMarkers = { A: null, B: null };
let pointDragging = null;

function syncPointMarkers() {
  if (!map) return;
  const want = { A: mapPtA, B: mapPtB };
  for (const key of ['A', 'B']) {
    const p = want[key];
    let m = pointMarkers[key];
    if (!p) { if (m) { m.remove(); pointMarkers[key] = null; } continue; }
    if (!m) {
      const el = document.createElement('div');
      el.className = 'map-pt';
      m = new maplibregl.Marker({ element: el, draggable: true }).setLngLat([p.lng, p.lat]).addTo(map);
      m.on('dragstart', () => { pointDragging = key; });
      m.on('drag', () => movePoint(key, m.getLngLat()));
      m.on('dragend', () => { pointDragging = null; movePoint(key, m.getLngLat()); updateGuide(); });
      pointMarkers[key] = m;
    } else if (pointDragging !== key) {
      m.setLngLat([p.lng, p.lat]);
    }
    const role = key === 'B' || solveMode === 'distance' ? 'object' : 'camera';
    m.getElement().dataset.role = role;
    m.getElement().title = `The ${role} · drag to move`;
  }
}

function movePoint(key, ll) {
  const p = { lat: ll.lat, lng: ll.lng };
  if (key === 'A') mapPtA = p; else mapPtB = p;
  if (solveMode === 'size' && mapPtA && mapPtB) setDistance(distM(mapPtA, mapPtB));
  renderMarks();
}

// Clicking cycles: place the camera (A) → place the object (B) + measure → a third click starts over.
function handleMapClick(p) {
  if (solveMode === 'distance') { placeObjectRing(p); return; }
  if (mapPtA && mapPtB) clearMapPoints();
  setMapPoint(mapPtA ? 'object' : 'camera', p);
}

// Size mode: put the camera (A) or the object (B) at p; with both, their distance is D.
// Used by clicks, the right-click menu and pasted coordinates.
function setMapPoint(which, p) {
  if (which === 'camera') mapPtA = p; else mapPtB = p;
  if (mapPtA && mapPtB) setDistance(distM(mapPtA, mapPtB));
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
  const ring = ringCoords({ lat: p.lat, lng: 0 }, solvedRange ? solvedRange[1] : solvedDistance);
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
  const ready = img !== null && (unknownCam || (sensorW !== null && focalLength !== null)) && pixelSpan !== null;
  let text = '', cls = '';
  if (solveMode === 'distance') {
    if (objectRing && mapPtA && solvedDistance !== null) {
      text = solvedRange
        ? `The camera stood somewhere in this band · ${formatMapDist(solvedRange[0])} to ${formatMapDist(solvedRange[1])}`
        : `The camera stood somewhere on this ring · r = ${formatMapDist(solvedDistance)}`;
      cls = 'done';
    } else if (solvedDistance !== null) {
      text = 'Click where the object is to draw the ring';
    }
  } else if (mapPtA && mapPtB) {
    text = `Camera → object · ${formatMapDist(distM(mapPtA, mapPtB))}`; cls = 'muted';
  } else if (mapPtA) {
    text = "Now click the object's position";
  } else if (mapPtB) {
    text = 'Now click where the camera stood';
  } else if (ready && distance === null) {
    text = 'Click where the camera stood, then the object';
  }
  el.textContent = text;
  el.className = 'step-hint' + (cls ? ' ' + cls : '');
  if (resetBtn) resetBtn.disabled = !mapPtA && !mapPtB;
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
  else if (!a.axis && !b.axis && Math.abs(a.v) > 90 && Math.abs(b.v) <= 90) [a, b] = [b, a];   // plainly lng first
  return validLatLng(a.v, b.v);
}

function validLatLng(lat, lng) {
  if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

// Coordinates in any form people paste: plain text (above), or a link from a map service.
// Ported from TracePoint's parser (formats after briatlon's coordinatePaste.js).
function parseCoordinates(text) {
  const s = String(text || '').trim();
  if (!s || s.length > 2000) return null;
  if (/^https?:\/\//i.test(s)) {
    const known = parseCoordinateUrl(s);
    if (known !== undefined) return known;
    const m = s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/) ||
              s.match(/[?&](?:q|ll|query|center)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i);
    return m ? validLatLng(+m[1], +m[2]) : null;
  }
  return parseCoordInput(s);
}

// A link from a known map service, read by that service's rules (Yandex writes longitude
// first). undefined: not a service known here, the generic rules get their turn.
function parseCoordinateUrl(s) {
  let url;
  try { url = new URL(s.replace(/\\&/g, '&')); } catch (err) { return null; }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const q = url.searchParams, hash = new URLSearchParams(url.hash.slice(1));
  const NUM = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  const pair = (t, sep = ',', lngFirst = false) => {
    const m = (t || '').match(new RegExp(`^\\s*(${NUM})\\s*${sep}\\s*(${NUM})\\s*$`));
    return m ? validLatLng(+m[lngFirst ? 2 : 1], +m[lngFirst ? 1 : 2]) : null;
  };
  if (host === 'maps.apple.com') return pair(q.get('coordinate') ?? q.get('ll') ?? q.get('q'));
  if (host === 'bing.com')       return pair(q.get('cp'), '~');
  if (/^yandex\.[a-z.]+$/.test(host)) return pair(q.get('ll'), ',', true);
  if (host === 'openstreetmap.org' || host === 'osm.org') {
    if (q.has('mlat') && q.has('mlon')) return pair(`${q.get('mlat')},${q.get('mlon')}`);
    const view = hash.get('map')?.split('/');   // #map=zoom/lat/lng
    return view?.length === 3 ? pair(`${view[1]},${view[2]}`) : null;
  }
  if (host === 'earth.google.com') {
    const m = url.pathname.match(/^\/web\/search\/([^/]+)/);
    if (m) { try { const p = pair(decodeURIComponent(m[1])); if (p) return p; } catch (err) { /* not a pair */ } }
  }
  if (q.has('lat') && (q.has('lon') || q.has('lng'))) return pair(`${q.get('lat')},${q.get('lon') ?? q.get('lng')}`);
  return undefined;
}

// Short links carry no coordinates; reading them would mean asking their server where they lead
function isShortMapLink(text) {
  const m = String(text || '').trim().match(/^https?:\/\/([^/?#]+)(\/[^?#]*)?/i);
  if (!m) return false;
  const host = m[1].toLowerCase().replace(/^www\./, '');
  return ['maps.app.goo.gl', 'goo.gl', 'g.co', 'maps.apple', 'binged.it', 'bit.ly', 't.co', 'tinyurl.com'].includes(host) ||
         (/^yandex\./.test(host) && /^\/maps\/-\//.test(m[2] || ''));
}
const SHORT_LINK_NOTE = "Short links can't be read here. Open it and copy the full address.";
const COORD_HELP = 'Enter coordinates as 52.520, 13.405, 52°32\'43.8"N 13°13\'11.6"E or a map link';

// A typed or pasted point. Size mode: the camera (or the object, once the camera is placed);
// distance mode: the object, and the ring goes around it. Returns whether it was placed.
function placePastedPoint(p) {
  stopSpin();
  if (solveMode === 'distance') return placeObjectRing(p);
  if (mapPtA && mapPtB) clearMapPoints();
  setMapPoint(mapPtA ? 'object' : 'camera', p);
  map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 14), essential: true });
  return true;
}

document.getElementById('coord-input').addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  const p = parseCoordinates(this.value);
  if (!p) { showToast(isShortMapLink(this.value) ? SHORT_LINK_NOTE : COORD_HELP); return; }
  if (placePastedPoint(p)) this.value = '';   // kept when there is nothing to place it for yet
});

/* ─── PASTE ANYWHERE ─────────────────────────────────────────── */
// Ctrl+V outside text fields: an image opens as the photo, text with coordinates places a
// point. An image wins over text ("Copy image" on a web page carries both). Only what is
// pasted is read, on the paste itself: the page never reads the clipboard on its own.
document.addEventListener('paste', e => {
  const t = e.target;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
  const image = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/'));
  if (image) {
    e.preventDefault();
    loadImage(image, 'Pasted photo');
    showToast('A pasted image has no EXIF: pick the camera, or a preset, above.', 'success');
    return;
  }
  const text = e.clipboardData && e.clipboardData.getData('text');
  if (!text || !text.trim()) return;
  e.preventDefault();
  const p = parseCoordinates(text);
  if (!p) { showToast(isShortMapLink(text) ? SHORT_LINK_NOTE : 'No image or coordinates found in the clipboard.'); return; }
  placePastedPoint(p);
});

/* ─── MAP RIGHT-CLICK MENU ───────────────────────────────────── */
// As in TracePoint and ShadowFinder. MapLibre fires 'contextmenu' only for a right-click
// without drag, so right-drag still rotates. The links are plain hrefs: nothing is sent
// anywhere until one is clicked.
const MAP_LINKS = [
  ['Google Maps',   (la, ln) => `https://www.google.com/maps/search/?api=1&query=${la},${ln}`],
  ['Bing Maps',     (la, ln, z) => `https://www.bing.com/maps?cp=${la}~${ln}&lvl=${z}&sp=point.${la}_${ln}_Pin`],
  ['OpenStreetMap', (la, ln, z) => `https://www.openstreetmap.org/?mlat=${la}&mlon=${ln}#map=${z}/${la}/${ln}`],
  ['Google Earth',  (la, ln) => `https://earth.google.com/web/@${la},${ln},0a,2000d,35y,0h,0t,0r`]
];
let mapMenu = null;

function hideMapMenu() { if (mapMenu) mapMenu.style.display = 'none'; }

function showMapMenu(e) {
  const p  = { lat: e.lngLat.lat, lng: e.lngLat.lng };
  const la = p.lat.toFixed(6), ln = p.lng.toFixed(6);
  const z  = Math.round(map.getZoom()) + 1;   // the other services count zoom in 256 px tiles
  if (!mapMenu) {
    mapMenu = document.createElement('div');
    mapMenu.className = 'map-ctx-menu';
    mapMenu.setAttribute('role', 'menu');
    map.getContainer().appendChild(mapMenu);
  }
  mapMenu.innerHTML = '';
  const add = (tag, cls, text) => {
    const n = document.createElement(tag);
    n.className = cls;
    n.textContent = text;
    if (tag === 'button') { n.type = 'button'; n.setAttribute('role', 'menuitem'); }
    mapMenu.appendChild(n);
    return n;
  };
  add('div', 'map-ctx-head', `${la}, ${ln}`);
  add('button', 'map-ctx-item', 'Copy coordinates').onclick = () => {
    hideMapMenu();
    navigator.clipboard.writeText(`${la}, ${ln}`)
      .then(() => showToast('Coordinates copied.', 'success', 1800))
      .catch(() => showToast('Could not copy to clipboard.'));
  };
  if (solveMode === 'size') {
    add('button', 'map-ctx-item', 'The camera stood here').onclick = () => { hideMapMenu(); setMapPoint('camera', p); };
    add('button', 'map-ctx-item', 'The object is here').onclick = () => { hideMapMenu(); setMapPoint('object', p); };
  } else {
    add('button', 'map-ctx-item', 'The object is here (draw the ring)').onclick = () => { hideMapMenu(); placeObjectRing(p); };
  }
  add('div', 'map-ctx-divider', '');
  MAP_LINKS.forEach(([label, url]) => {
    const a = add('a', 'map-ctx-item', `Open in ${label}`);
    a.href = url(la, ln, z);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('role', 'menuitem');
    a.onclick = hideMapMenu;
  });
  // At the click, flipped so it stays inside the map
  const box = map.getContainer().getBoundingClientRect();
  mapMenu.style.display = 'block';
  const w = mapMenu.offsetWidth, h = mapMenu.offsetHeight;
  mapMenu.style.left = `${Math.max(0, e.point.x + w > box.width  ? e.point.x - w : e.point.x)}px`;
  mapMenu.style.top  = `${Math.max(0, e.point.y + h > box.height ? e.point.y - h : e.point.y)}px`;
}
document.addEventListener('mousedown', e => { if (mapMenu && !mapMenu.contains(e.target)) hideMapMenu(); });


function setBasemap(tile) {
  if (!map || tile === currentTile || !TILE_SETS[tile]) return;
  currentTile = tile;
  setTileSet(tile);
  document.querySelectorAll('.tile-btn').forEach(b => b.classList.toggle('active-tile', b.dataset.tile === tile));
  scheduleAutosave();
}
document.querySelectorAll('.tile-btn').forEach(btn => btn.addEventListener('click', () => setBasemap(btn.dataset.tile)));

/* ─── KEYBOARD ───────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
  // Ctrl/Cmd+R and +N are the browser's (reload, new window): they must not wipe the work first
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code !== 'Escape' && document.getElementById('help-card').style.display !== 'none') return;
  // By key position (e.code), not by letter: R and N stay where they are on German or French layouts
  // A key used here is claimed (preventDefault), else the browser also takes it: Firefox's
  // "search when you start typing" would open its find bar with the letter in it
  switch (e.code) {
    case 'KeyR': e.preventDefault(); resetMarks(); break;
    case 'KeyN': e.preventDefault(); northMap();   break;
    case 'Escape':
      document.getElementById('help-card').style.display = 'none';
      hideMapMenu();
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
// (back to the default 60:40), arrow keys (Shift = bigger steps); the chevrons hide the map or the photo.
// Split and hidden state are remembered in this browser.
const workspace = document.getElementById('workspace');
const splitter  = document.getElementById('pane-splitter');
const SPLIT_KEY = 'sa-split';
const HIDDEN_KEY = 'sa-hidden-side';   // "map", "photo" or empty
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

// One side may be hidden: 'map', 'photo' or null. Each chevron hides its side, or brings it
// back when the other one is hidden.
let hiddenSide = null;
function setHiddenSide(side, save = true) {
  hiddenSide = side;
  workspace.classList.toggle('map-collapsed', side === 'map');
  workspace.classList.toggle('photo-collapsed', side === 'photo');
  document.getElementById('app').classList.toggle('map-collapsed', side === 'map');
  const label = (id, text, title) => {
    const b = document.getElementById(id);
    b.textContent = text; b.title = title; b.setAttribute('aria-label', title);
  };
  label('btn-map-collapse',   side === 'map'   ? '‹' : '›', side === 'map'   ? 'Show map'   : 'Hide map');
  label('btn-photo-collapse', side === 'photo' ? '›' : '‹', side === 'photo' ? 'Show photo' : 'Hide photo');
  if (save) storageSet(HIDDEN_KEY, side || '');
}

const mapHidden = () => hiddenSide !== null;   // either side hidden: nothing to drag

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
document.getElementById('btn-map-collapse').addEventListener('click', () => setHiddenSide(hiddenSide ? null : 'map'));
document.getElementById('btn-photo-collapse').addEventListener('click', () => setHiddenSide(hiddenSide ? null : 'photo'));

splitter.setAttribute('aria-valuemin', SPLIT_MIN);
splitter.setAttribute('aria-valuemax', SPLIT_MAX);
{
  const saved = parseFloat(storageGet(SPLIT_KEY));
  setSplit(isFinite(saved) ? saved : SPLIT_DEFAULT, false);
  const side = storageGet(HIDDEN_KEY) ?? (storageGet('sa-map-hidden') === '1' ? 'map' : '');   // older key
  setHiddenSide(side === 'map' || side === 'photo' ? side : null, false);
}

/* ─── AUTOSAVE ───────────────────────────────────────────────── */
// A refresh keeps the work (ported from TracePoint): IndexedDB "siliconaperture", key "state"
// holds the tabs with what was measured on each, the map view and the basemap; key
// "img:<tab id>" holds each tab's photo file. Nothing leaves the browser. Closing a tab
// deletes its saved copy. Only one browser tab writes (the one holding the Web Lock); a second
// one restores the saved work but keeps its changes to itself until the first is closed.
const AUTOSAVE_STORE = 'autosave';
const AUTOSAVE_LOCK  = 'siliconaperture-autosave';

function claimAutosave() {
  if (!navigator.locks) return Promise.resolve();
  const hold = () => new Promise(() => {});   // never settles: the lock lasts as long as the page
  return new Promise(resolve => {
    navigator.locks.request(AUTOSAVE_LOCK, { ifAvailable: true }, lock => {
      if (!lock) { resolve(); return; }
      autosaveOwner = true;
      resolve();
      return hold();
    }).catch(() => { autosaveOwner = true; resolve(); });
  }).then(() => {
    if (autosaveOwner) return;
    showToast('SiliconAperture is open in another tab. Changes here are not saved until that tab is closed.');
    navigator.locks.request(AUTOSAVE_LOCK, () => {
      autosaveOwner = true;
      if (autosaveReady) { tabs.forEach(autosavePutImage); autosaveWrite(); }
      return hold();
    }).catch(() => {});
  });
}

function openAutosaveDb() {
  if (!autosaveDb) autosaveDb = new Promise((resolve, reject) => {
    const req = indexedDB.open('siliconaperture', 1);
    req.onupgradeneeded = () => req.result.createObjectStore(AUTOSAVE_STORE);
    req.onsuccess = () => {
      // Another page deleting or upgrading the database must not wait on this one
      req.result.onversionchange = () => { req.result.close(); autosaveDb = null; };
      resolve(req.result);
    };
    req.onblocked = () => reject(new Error('autosave database blocked by another tab'));
    req.onerror   = () => reject(req.error);
  });
  return autosaveDb;
}

// One transaction on the store; resolves with the result of the request fn returns (if any)
function autosaveTx(mode, fn) {
  return openAutosaveDb().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(AUTOSAVE_STORE, mode);
    const req = fn(tx.objectStore(AUTOSAVE_STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = tx.onabort = () => reject(tx.error);
  }));
}

function autosaveFailed() {
  if (autosaveWarned) return;
  autosaveWarned = true;
  showToast('Autosave failed: browser storage is full or blocked.');
}

function scheduleAutosave() {
  if (!autosaveReady || !autosaveOwner) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(autosaveWrite, 400);
}

function autosaveWrite() {
  clearTimeout(autosaveTimer);
  autosaveTimer = null;
  if (!autosaveReady || !autosaveOwner) return;
  const c = map ? map.getCenter() : null;
  const data = {
    v: 1,
    active: activeTab,
    tabs: tabs.map((t, i) => ({ id: t.id, name: t.name, hasFile: !!t.file,
                                state: i === activeTab ? (t.file ? captureState() : null) : t.state })),
    map: c ? { center: [c.lng, c.lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() } : null,
    basemap: currentTile
  };
  const keep = new Set(tabs.filter(t => t.file).map(t => 'img:' + t.id));
  const json = tabs.some(t => t.file) ? JSON.stringify(data) : null;
  autosaveTx('readwrite', store => {
    if (json) store.put(json, 'state'); else store.delete('state');
    store.getAllKeys().onsuccess = e => {
      const have = new Set(e.target.result);
      have.forEach(k => { if (k !== 'state' && !keep.has(k)) store.delete(k); });   // photos of closed tabs
      tabs.forEach(t => { if (t.file && !have.has('img:' + t.id)) store.put(t.file, 'img:' + t.id); });
    };
  }).catch(autosaveFailed);
}

function autosavePutImage(t) {
  if (!autosaveReady || !autosaveOwner || !t.file) return;
  autosaveTx('readwrite', store => { store.put(t.file, 'img:' + t.id); }).catch(autosaveFailed);
}

// Runs once at start: puts the saved tabs, map view and basemap back
async function autosaveRestore() {
  await claimAutosave();
  let data = null;
  try {
    const json = await autosaveTx('readonly', store => store.get('state'));
    data = json ? JSON.parse(json) : null;
  } catch (err) { autosaveReady = true; return; }   // no IndexedDB here: work without autosave
  try {
    if (data && Array.isArray(data.tabs)) {
      const restored = [];
      for (const td of data.tabs) {
        if (!td || typeof td.id !== 'string' || !td.hasFile) continue;
        const file = await autosaveTx('readonly', store => store.get('img:' + td.id));
        if (file instanceof Blob) restored.push({ id: td.id, name: td.name ?? null, file, img: null, state: td.state || null });
      }
      if (restored.length) {
        const activeId = data.tabs[data.active]?.id;
        tabs = restored;
        activeTab = Math.max(0, tabs.findIndex(t => t.id === activeId));
        await mapReady;
        stopSpin();
        if (data.map) map.jumpTo({ center: data.map.center, zoom: data.map.zoom, bearing: data.map.bearing, pitch: data.map.pitch });
        if (TILE_SETS[data.basemap]) setBasemap(data.basemap);
        await showTab(tabs[activeTab]);
      }
    }
  } catch (err) {
    tabs = [emptyTab()]; activeTab = 0;
    showTab(tabs[0]);
    showToast('The saved work could not be restored. Starting fresh.');
  }
  autosaveReady = true;
  if (autosaveOwner) autosaveWrite();   // tidies photos the saved state no longer lists
}

// Leaving or hiding the page writes what is still pending
document.addEventListener('visibilitychange', () => { if (document.hidden && autosaveTimer) autosaveWrite(); });
window.addEventListener('pagehide', () => { if (autosaveTimer) autosaveWrite(); });

/* ─── RESIZE ─────────────────────────────────────────────────── */
// Panels change size with the window and with the divider: follow both.
new ResizeObserver(() => {
  resizeCanvas();
  if (img && needsFit) fitImage();
  drawCanvas();
}).observe(container);
new ResizeObserver(() => { if (map) map.resize(); }).observe(document.getElementById('map-container'));

/* ─── INIT ───────────────────────────────────────────────────── */
populateCameraDropdown();
renderTabs();
resizeCanvas();
initMap();
updateGuide();
autosaveRestore();
