// Subtle moving blue-white clouds, underneath the code rain.
const BLUE_NOISE_ENABLED = true;
const BLUE_NOISE_OPACITY = 0.12;
const BLUE_NOISE_SPEED = 0.18;
let blueNoiseCloud, blueNoiseNextFrame = 0;
function drawBlueNoise() {
  if (!BLUE_NOISE_ENABLED) return;
  if (!blueNoiseCloud) {
    blueNoiseCloud = document.createElement('canvas');
    blueNoiseCloud.width = 240; blueNoiseCloud.height = 135;
  }
  const time = artTime * 0.001 * BLUE_NOISE_SPEED;
  if (artTime >= blueNoiseNextFrame) {
    const cloudCtx = blueNoiseCloud.getContext('2d');
    const field = cloudCtx.createImageData(240, 135);
    for (let y = 0; y < 135; y++) {
      for (let x = 0; x < 240; x++) {
        const value = noise(x * 0.018 + time * 0.3, y * 0.018, time);
        const mist = Math.max(0, Math.min(1, (value - 0.2) * 1.8));
        const i = (y * 240 + x) * 4;
        field.data[i] = mist * 255;
        field.data[i + 1] = 25 + mist * 230;
        field.data[i + 2] = 255;
        field.data[i + 3] = 255;
      }
    }
    cloudCtx.putImageData(field, 0, 0);
    blueNoiseNextFrame = artTime + 70;
  }
  const ctx = drawingContext;
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = BLUE_NOISE_OPACITY;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(blueNoiseCloud, 0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}

// Consumption Code Rain — sizes are internal canvas pixels; speeds are px/second.
const CODE_RAIN_ENABLED = true;
const CODE_RAIN_FONT_MIN = 7;
const CODE_RAIN_FONT_MAX = 10;
const CODE_RAIN_LINE_SPACING = 10;
const CODE_RAIN_DENSITY = 0.87;
const CODE_RAIN_CLUSTER_MIN = 16;
const CODE_RAIN_CLUSTER_MAX = 23;
const CODE_RAIN_WIDTH_MIN = 18;
const CODE_RAIN_WIDTH_MAX = 48;
const CODE_RAIN_LENGTH_MIN = 130;
const CODE_RAIN_LENGTH_MAX = 760;
const CODE_RAIN_SPEED_MIN = 45;
const CODE_RAIN_SPEED_MAX = 130;
const CODE_RAIN_OPACITY = 0.9;
const CODE_RAIN_MUTATION_INTERVAL = 1600;
const CODE_RAIN_PHRASE_INTERVAL = 5500;
const CODE_RAIN_COLORS = ['#F4F2FF', '#F4F2FF', '#E7E1FF', '#D4CAFF', '#BCC5FF'];
const CODE_RAIN_PHRASES = [
  'BUY BUY BUY', 'WANT MORE', 'NEED MORE', 'ADD TO CART', 'CONSUME',
  'DESIRE', 'PURCHASE COMPLETE', 'JUST ONE MORE', 'NEW DESIRE DETECTED',
  'SATISFACTION EXPIRED', 'BUY AGAIN', 'REPEAT PURCHASE', 'MORE MORE MORE',
  'WHAT AM I WITHOUT...', 'DO YOU HAVE A TASTE?', 'WHO AM I WITHOUT IT?',
  'DO I OWN IT?', 'OR DOES IT OWN ME?', 'YOU ARE WHAT YOU CONSUME',
  'THE THINGS YOU OWN END UP OWNING YOU', 'IS THIS REALLY ME?',
  'IDENTITY LOADING', 'SELF WORTH = ?', 'WHO DEFINES ME?', 'WHAT DEFINES YOU?',
  'OWNED', 'WANT != NEED', 'SDG_12: RESPONSIBLE_CONSUMPTION', 'REPAIR > REPLACE'
];
const CODE_RAIN_VARIABLES = ['desire', 'identity', 'selfWorth', 'ownership', 'purchaseCount', 'need', 'want', 'waste', 'resources'];
let codeRainStreams = [];
const rainRandom = (a, b) => a + Math.random() * (b - a);
const rainPick = list => list[Math.floor(Math.random() * list.length)];
function makeConsumptionLine() {
  const variable = rainPick(CODE_RAIN_VARIABLES);
  const number = Math.floor(rainRandom(0, 10000)).toString().padStart(4, '0');
  return rainPick([
    () => rainPick(CODE_RAIN_PHRASES),
    () => `${variable} += ${number}; // OWNED`,
    () => `if(want>need){buy(${number});}`,
    () => `while(desire){consume();}`,
    () => `cart.push(${variable});`,
    () => `SYS_${rainPick(['OWNED','ID_LOST','ERR_SELF','PURCHASE_OK','LOOP_ACTIVE'])}_${number}`,
    () => `${variable}=[want,need,identity];`,
    () => `status="${rainPick(CODE_RAIN_PHRASES)}";`,
    () => `satisfaction *= 0.5; / ${number}`,
    () => `${rainPick(['BUY ','MORE_','OWNED/','DESIRE>']).repeat(Math.floor(rainRandom(2, 7)))}`,
    () => `DESIRE.EXE >> ${variable}:${number}`,
    () => `// ${rainPick(CODE_RAIN_PHRASES)} ...`
  ])();
}
function paintRainRow(stream, rowIndex) {
  const ctx = stream.ctx, row = stream.rows[rowIndex];
  const top = rowIndex * stream.lineHeight;
  ctx.clearRect(0, top, stream.canvas.width, stream.lineHeight);
  ctx.save(); ctx.beginPath(); ctx.rect(0, top, stream.canvas.width, stream.lineHeight); ctx.clip();
  ctx.font = `${stream.font}px monospace`;
  ctx.textBaseline = 'top'; ctx.fillStyle = row.color; ctx.globalAlpha = row.alpha;
  if (row.visible) ctx.fillText(row.text, row.indent, top);
  ctx.restore();
}
function initCodeRain() {
  codeRainStreams = [];
  const clusters = Math.floor(rainRandom(CODE_RAIN_CLUSTER_MIN, CODE_RAIN_CLUSTER_MAX + 1));
  for (let cluster = 0; cluster < clusters; cluster++) {
    const centre = rainRandom(0, CANVAS_W);
    const start = rainRandom(0, 1800);
    const count = Math.floor(rainRandom(6, 13));
    let x = centre - count * 7;
    for (let n = 0; n < count; n++) {
      const depth = Math.floor(rainRandom(0, 3));
      const font = rainRandom(CODE_RAIN_FONT_MIN, CODE_RAIN_FONT_MAX);
      const width = Math.round(rainRandom(CODE_RAIN_WIDTH_MIN, CODE_RAIN_WIDTH_MAX));
      const lineHeight = CODE_RAIN_LINE_SPACING;
      const length = rainRandom(CODE_RAIN_LENGTH_MIN, CODE_RAIN_LENGTH_MAX);
      const rowCount = Math.ceil((length + rainRandom(180, 650)) / lineHeight);
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = rowCount * lineHeight;
      const stream = { canvas, ctx: canvas.getContext('2d'), x: Math.round(x), font, lineHeight,
        y: (start + rainRandom(-200, 200) + canvas.height * 2) % canvas.height,
        speed: rainRandom(CODE_RAIN_SPEED_MIN + depth * 15, CODE_RAIN_SPEED_MAX - (2 - depth) * 20),
        alpha: [0.32, 0.62, 1][depth], depth, rows: [],
        nextMutation: rainRandom(800, 3200), nextPhrase: rainRandom(3500, 8000) };
      const chars = Math.max(3, Math.floor(width / (font * 0.61)));
      let fragment = '';
      for (let row = 0; row < rowCount; row++) {
        if (!fragment.length) fragment = makeConsumptionLine();
        const text = fragment.slice(0, chars); fragment = fragment.slice(chars);
        // The empty tail and short internal gaps move WITH the strand.
        const visible = row * lineHeight < length && Math.random() < CODE_RAIN_DENSITY;
        stream.rows.push({text, indent: 0, color: rainPick(CODE_RAIN_COLORS),
          alpha: rainRandom(0.75, 1), visible});
        paintRainRow(stream, row);
      }
      codeRainStreams.push(stream);
      x += rainRandom(7, 17);
    }
  }
  codeRainStreams.sort((a,b) => a.depth - b.depth);
}
function drawCodeRain(dt) {
  if (!CODE_RAIN_ENABLED) return;
  if (!codeRainStreams.length) initCodeRain();
  const ctx = drawingContext;
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = false;
  for (const stream of codeRainStreams) {
    // Persistent position, positive velocity: physical travel, never a paused window.
    stream.y += stream.speed * Math.max(0, dt);
    stream.y %= stream.canvas.height;
    if (artTime >= stream.nextMutation) {
      const index = Math.floor(rainRandom(0, stream.rows.length));
      stream.rows[index].text = stream.rows[index].text.replace(/\d/, () => String(Math.floor(Math.random()*10)));
      paintRainRow(stream, index);
      stream.nextMutation = artTime + CODE_RAIN_MUTATION_INTERVAL * rainRandom(0.8, 1.5);
    }
    if (artTime >= stream.nextPhrase) {
      // Replace only an offscreen row, so visible fragments remain trackable.
      const index = Math.floor(rainRandom(0, stream.rows.length));
      const y = (stream.y + index * stream.lineHeight) % stream.canvas.height;
      if (y > CANVAS_H && y < stream.canvas.height - stream.lineHeight) {
        stream.rows[index].text = makeConsumptionLine().slice(0, Math.max(3, Math.floor(stream.canvas.width / (stream.font * 0.61))));
        paintRainRow(stream, index);
      }
      stream.nextPhrase = artTime + CODE_RAIN_PHRASE_INTERVAL * rainRandom(0.8, 1.5);
    }
    ctx.globalAlpha = CODE_RAIN_OPACITY * stream.alpha;
    for (let y = stream.y - stream.canvas.height; y < CANVAS_H; y += stream.canvas.height) {
      ctx.drawImage(stream.canvas, stream.x, y);
    }
  }
  ctx.restore();
}

// OWNED — generative artwork. Page layout is in style.css and script.js.
// Adjust the settings below, then reload. Images load from the images/ folder.
// Topmost kinetic typography — adjust here.
const SHOW_TASTE_TYPE = true;
const TASTE_OPACITY = 1;       // 0–1; lower reveals more of the photos
const TASTE_BLEND = 'source-over';  // 'multiply', 'overlay', or 'source-over'
const TASTE_SPEED = 1.4;           // higher = faster font, word and slice changes
const TASTE_REST_MIN = 80;      // Uneven text-free pauses, milliseconds
const TASTE_REST_MAX = 650;
const TASTE_STEP_MIN = 80;      // English words appear one at a time
const TASTE_STEP_MAX = 150;
let lastTasteRest = 0;
let tasteBurstActive = false, tasteRestUntil = 0, tasteBurstUntil = 0;
let tasteAccumulationBurst = true;
let tasteAccumulationColors = [];
let tasteAccumulationWord = 'TASTE!';
const TASTE_ERROR_CHANCE = 0.3;
const TASTE_ERROR_COPIES = 8;
let tasteErrorBurst = false, tasteErrorCopies = [], tasteErrorBorder = '#FFFF00';
const TASTE_FULL_HOLD_MIN = 120; // Hold the completed poster before clearing
const TASTE_FULL_HOLD_MAX = 240;
let tasteAccumulationStepMs = 180, tasteAccumulationInk = '#f40220';
const TASTE_SIZE = 1;            // overall typography scale
const TASTE_WORDS = ['TASTE!', 'VỊ GIÁC', 'GOÛT', 'SABOR', 'GUSTO', 'GESCHMACK', '味覚', 'テイスト', '미각', '味觉'];
const JAPANESE_FONT = '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
const DISPLAY_STYLES = ['title', 'outline', 'led', 'neon', 'neon'];
const tasteDotCache = new Map();
const TASTE_FONTS = ['Impact, sans-serif', 'Arial Black, sans-serif',
  'Helvetica, sans-serif', 'Arial, sans-serif', 'Verdana, sans-serif'];
let tasteCanvas, tasteContext, tasteCards = [], tasteLayoutAt = 0, tastePaintAt = 0;
let tasteSlices = [];
let tasteScene = 'stretch', tasteSceneStarted = 0;
const TASTE_COLORS = ['#FF0026', '#FF7B30', '#FF00B8', '#39FF14', '#FFFF00'];
// Repeated entries favour red, hot pink and neon green for accumulating posters.
const TASTE_POSTER_COLORS = ['#FF0026', '#FF0026', '#FF0026', '#FF00B8', '#FF00B8', '#FF00B8', '#39FF14', '#39FF14', '#39FF14', '#FFFF00', '#FF7B30'];
const TASTE_NEON_BLUE = '#0019ff'; // Only occasional neon faces, never ordinary text.

const CANVAS_W = 1920, CANVAS_H = 1080;
const SEED = null;                // null = new artwork each reload
// Timing values are milliseconds. Multiplier 3 is the tuned default.
const GLITCH_SPEED_MULTIPLIER = 3;
const OBJECT_REPOSITION_MIN = 180;
const OBJECT_REPOSITION_MAX = 300;
const POINTER_INTERVAL = 480;
const POINTER_HIDE_DURATION = 45;
const OBJECT_JUMP_DISTANCE = 360; // Prefer a clearly separated new position.
const POINTER_BOX_MIN = 38, POINTER_BOX_MAX = 84;
const OBJECT_SIZE_MIN = 170; // Longest edge, in canvas pixels.
const OBJECT_SIZE_MAX = 320;
const timed = ms => ms * 3 / Math.max(0.1, GLITCH_SPEED_MULTIPLIER);
const MAX_OBJECTS = 8;
const PALETTE = ['#FFFF00', '#FF00B8', '#173BFF', '#FF1616', '#00FF20', '#000000', '#FFFFFF'];
const TONGUE_PATH = 'images/Tongue.PNG'; // Show only the real mouth image.
const OBJECT_PATHS = [
  'images/IMG_0460.PNG',
  'images/IMG_0477.PNG',
  'images/IMG_0478.PNG',
  'images/IMG_0479.PNG',
  'images/IMG_0480.PNG',
  'images/IMG_0481.PNG',
  'images/IMG_0482.PNG',
  'images/IMG_0483.PNG',
  'images/IMG_0484.PNG',
  'images/IMG_0485.PNG',
  'images/IMG_0486.PNG',
  'images/IMG_0487.PNG',
  'images/IMG_0488.PNG',
  'images/IMG_0489.PNG',
  'images/IMG_0490.PNG',
  'images/IMG_0491.PNG',
  'images/IMG_0492.PNG',
  'images/IMG_0493.PNG',
  'images/IMG_0494.PNG',
  'images/IMG_0495.PNG',
  'images/IMG_0496.PNG',
  'images/IMG_0497.PNG',
  'images/IMG_0498.PNG',
  'images/IMG_0499.PNG',
  'images/IMG_0500.PNG',
  'images/IMG_0501.PNG',
  'images/IMG_0502.PNG',
  'images/IMG_0503.PNG',
  'images/IMG_0504.PNG',
  'images/IMG_0505.PNG',
  'images/IMG_0506.PNG',
  'images/IMG_0507.PNG',
  'images/IMG_0508.PNG',
  'images/IMG_0509.PNG',
  'images/IMG_0510.PNG'
];
// Normalized coordinates in the supplied tongue image, before cropping.
// Anchors are sampled inside this polygon; no coordinate interpolation.
const TONGUE_REGION = [[0.35,0.48],[0.65,0.48],[0.62,0.78],[0.55,0.86],[0.45,0.86],[0.35,0.78]];

let objectAssetPool = [];
let stage, objects = [], pointers = [], tongueAsset = null;
let artTime = 0;
const pick = values => values[Math.floor(random(values.length))];

function setup() {
  pixelDensity(1);
  stage = createCanvas(CANVAS_W, CANVAS_H);
  stage.elt.id = 'owned-collage';
  stage.parent('artwork');
  stage.elt.setAttribute('aria-label', 'OWNED: animated consumption collage');
  frameRate(60);
  noSmooth();
  if (SEED !== null) { randomSeed(SEED); noiseSeed(SEED); }
  fitCanvasToWindow();
  arrangeObjects([]);
  // Callback loading works in p5 1.x and 2.x. Fallbacks animate while loading.
  loadAssets();
}

function draw() {
  artTime = millis();
  background('#0019FF');
  drawBlueNoise();
  drawCodeRain(Math.max(0, deltaTime) / 1000);
  updateObjects();
  drawObjects();
  drawTongue();
  updatePointers();
  drawPointers();
  if (SHOW_TASTE_TYPE) { drawTasteTypography(); }
}

// Missing assets resolve to null; a failed file never stops the whole artwork.
function fetchAsset(path, isTongue = false) {
  if (!path) { return Promise.resolve(null); }
  return new Promise(resolve => {
    let finished = false;
    const timeout = setTimeout(() => { finished = true; resolve(null); }, 12000);
    loadImage(path, img => {
      if (finished) { return; }
      finished = true; clearTimeout(timeout);
      try { resolve(prepareAsset(img, isTongue)); } catch (err) { console.warn(path, err); resolve(null); }
    }, () => { finished = true; clearTimeout(timeout); resolve(null); });
  });
}

async function loadAssets() {
  const tongueJob = fetchAsset(TONGUE_PATH, true).then(asset => { tongueAsset = asset; });
  // Three workers keep large original PNGs from decoding all at once.
  let cursor = 0;
  const loaded = [];
  async function worker() {
    while (cursor < OBJECT_PATHS.length) {
      const path = OBJECT_PATHS[cursor++];
      const asset = await fetchAsset(path);
      if (asset) {
        loaded.push(asset);
        objectAssetPool = loaded.slice();
        if (loaded.length === 1 || loaded.length === MAX_OBJECTS) { arrangeObjects(loaded); }
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), tongueJob]);
  objectAssetPool = loaded;
  arrangeObjects(loaded);
}

function prepareAsset(img, isTongue) {
  const factor = Math.min(1, (isTongue ? 1000 : 650) / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * factor); canvas.height = Math.round(img.height * factor);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img.canvas, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data, cw = canvas.width, ch = canvas.height;
  let minX = cw, minY = ch, maxX = 0, maxY = 0;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      if (data[(y * cw + x) * 4 + 3] > 100) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }
  }
  if (minX > maxX) { return null; }
  if (isTongue) { return { canvas }; }
  const crop = document.createElement('canvas');
  crop.width = maxX - minX + 1; crop.height = maxY - minY + 1;
  crop.getContext('2d').drawImage(canvas, minX, minY, crop.width, crop.height, 0, 0, crop.width, crop.height);
  // Find a solid, non-white pixel near the centre for the diagram endpoint.
  let bestDistance = Infinity, endX = 0.5, endY = 0.5;
  for (let y = minY; y <= maxY; y += 2) {
    for (let x = minX; x <= maxX; x += 2) {
      const pos = (y * cw + x) * 4;
      const nx = (x - minX) / crop.width, ny = (y - minY) / crop.height;
      const distanceSq = (nx - 0.5) ** 2 + (ny - 0.5) ** 2;
      if (data[pos + 3] > 200 && Math.min(data[pos], data[pos + 1], data[pos + 2]) < 220 && distanceSq < bestDistance) {
        bestDistance = distanceSq; endX = nx; endY = ny;
      }
    }
  }
  return { canvas: crop, endX, endY };
}

function arrangeObjects(assets) {
  const shuffled = [...assets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const count = assets.length ? Math.min(MAX_OBJECTS, assets.length) : 6;
  objects = [];
  for (let i = 0; i < count; i++) {
    const obj = { asset: shuffled[i] || null, x: NaN, y: NaN, w: 1, h: 1,
      nextMove: artTime + random(OBJECT_REPOSITION_MIN, OBJECT_REPOSITION_MAX),
      visible: true, showAt: 0, phase: random(TWO_PI), symbol: i % 3 };
    randomizeObjectLayout(obj);
    objects.push(obj);
  }
  pointers = objects.map((obj, i) => ({ current: randomAnchor(), boxSize: random(POINTER_BOX_MIN, POINTER_BOX_MAX), label: String(Math.floor(random(1, 36))), objectIndex: i, visible: true, showAt: 0, changeAt: artTime + random(300, POINTER_INTERVAL) }));
}

// Each cutout gets its own size. Square-root weighting favours larger images.
function randomizeObjectLayout(obj) {
  const ratio = obj.asset ? obj.asset.canvas.width / obj.asset.canvas.height : 1.2;
  const longEdge = OBJECT_SIZE_MIN + Math.sqrt(random()) * (OBJECT_SIZE_MAX - OBJECT_SIZE_MIN);
  obj.w = ratio >= 1 ? longEdge : longEdge * ratio;
  obj.h = ratio >= 1 ? longEdge / ratio : longEdge;
  let best = null, bestScore = -Infinity;
  // Sample both sides and prefer the least crowded position. All edges stay inside.
  for (let attempt = 0; attempt < 100; attempt++) {
    const leftSide = random() < 0.5;
    const leftEdge = leftSide ? 20 : 1280;
    const rightEdge = leftSide ? 640 : CANVAS_W - 20;
    const px = random(leftEdge + obj.w / 2, rightEdge - obj.w / 2);
    const py = random(20 + obj.h / 2, CANVAS_H - 20 - obj.h / 2);
    let score = Number.isFinite(obj.x) && Math.hypot(px - obj.x, py - obj.y) < OBJECT_JUMP_DISTANCE ? -4 : 0;
    for (const other of objects) {
      if (other === obj) { continue; }
      const overlapW = Math.max(0, (obj.w + other.w) / 2 + 12 - Math.abs(px - other.x));
      const overlapH = Math.max(0, (obj.h + other.h) / 2 + 12 - Math.abs(py - other.y));
      score -= overlapW * overlapH / Math.min(obj.w * obj.h, other.w * other.h);
    }
    if (score > bestScore) { bestScore = score; best = { x: Math.round(px), y: Math.round(py) }; }
    if (score === 0) { break; }
  }
  obj.x = best.x; obj.y = best.y;
}

function updateObjects() {
  for (let index = 0; index < objects.length; index++) {
    const obj = objects[index];
    if (!obj.visible && artTime >= obj.showAt) { obj.visible = true; }
    if (artTime < obj.nextMove) { continue; }
    obj.visible = false;
    obj.showAt = artTime + random(35, 65);
    obj.nextMove = artTime + random(OBJECT_REPOSITION_MIN, OBJECT_REPOSITION_MAX);
    if (objectAssetPool.length) {
      const unused = objectAssetPool.filter(asset => !objects.some(other => other !== obj && other.asset === asset));
      obj.asset = pick(unused.length ? unused : objectAssetPool);
    }
    randomizeObjectLayout(obj);

    for (const pointer of pointers) {
      if (pointer.objectIndex === index) {
        pointer.visible = false; pointer.showAt = obj.showAt + POINTER_HIDE_DURATION;
        pointer.changeAt = pointer.showAt;
      }
    }
  }
}

// Yellow paper with dark halftone ink; only the surrounding cutouts use this.
const OBJECT_HALFTONE_DOT_SIZE = 4; // Larger number = coarser printed dots.
const OBJECT_HALFTONE_YELLOW = '#FFFF00';
const objectHalftoneCache = new WeakMap();

function getObjectHalftone(asset) {
  if (objectHalftoneCache.has(asset)) { return objectHalftoneCache.get(asset); }
  const source = asset.canvas;
  const print = document.createElement('canvas');
  const ratio = 320 / Math.max(source.width, source.height);
  print.width = Math.max(1, Math.round(source.width * ratio));
  print.height = Math.max(1, Math.round(source.height * ratio));
  const ctx = print.getContext('2d');
  ctx.drawImage(source, 0, 0, print.width, print.height);
  const sample = ctx.getImageData(0, 0, print.width, print.height).data;
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = OBJECT_HALFTONE_YELLOW;
  ctx.fillRect(0, 0, print.width, print.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#111126';
  const step = OBJECT_HALFTONE_DOT_SIZE;
  for (let y = step / 2; y < print.height; y += step) {
    for (let x = step / 2; x < print.width; x += step) {
      const i = (Math.floor(y) * print.width + Math.floor(x)) * 4;
      if (sample[i + 3] < 10) { continue; }
      const light = (sample[i] * 0.2126 + sample[i + 1] * 0.7152 + sample[i + 2] * 0.0722) / 255;
      const radius = step * 0.64 * Math.sqrt(1 - light);
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Clip printed dots to the original transparent silhouette.
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(source, 0, 0, print.width, print.height);
  ctx.globalCompositeOperation = 'source-over';
  objectHalftoneCache.set(asset, print);
  return print;
}

function drawObjects() {
  for (const obj of objects) {
    if (!obj.visible) { continue; }
    const ox = Math.round(obj.x - obj.w / 2), oy = Math.round(obj.y - obj.h / 2);
    // Draw the transparent cutout directly over the glitch layers.
    if (obj.asset) { drawingContext.drawImage(getObjectHalftone(obj.asset), ox, oy, obj.w, obj.h); }
    else { drawObjectFallback(obj); }
  }
}

function drawObjectFallback(obj) {
  push(); translate(obj.x, obj.y); rectMode(CENTER); stroke('#000'); strokeWeight(5);
  fill(PALETTE[(obj.symbol + 1) % 5]);
  if (obj.symbol === 0) {
    rect(0, 20, 125, 105); noFill(); rect(0, -40, 65, 55);
  } else if (obj.symbol === 1) {
    rect(0, 0, 160, 100); fill('#fff'); rect(15, 0, 66, 66); fill('#000'); rect(15, 0, 36, 36);
  } else {
    rect(-45, 0, 65, 45); rect(45, 0, 65, 45); line(-12, 0, 12, 0);
  }
  pop();
}

function tongueTransform() {
  // A stable subject also keeps markers completely stationary between replacements.
  const tongueH = 1080;
  const tongueW = tongueAsset ? tongueH * tongueAsset.canvas.width / tongueAsset.canvas.height : tongueH;
  return { x: 960, y: 530, size: tongueH, w: tongueW, h: tongueH };
}

function drawTongue() {
  // Wait for the real image; do not show a temporary illustrated mouth.
  if (!tongueAsset) { return; }
  const pose = tongueTransform();
  drawingContext.drawImage(tongueAsset.canvas, pose.x - pose.w / 2, pose.y - pose.h / 2, pose.w, pose.h);
}

function randomAnchor() {
  // Convex combinations of adjacent polygon vertices and its centre stay inside.
  const edge = Math.floor(random(TONGUE_REGION.length));
  const a = TONGUE_REGION[edge], b = TONGUE_REGION[(edge + 1) % TONGUE_REGION.length];
  const u = Math.sqrt(random()), v = random();
  // Inset anchors so the outline boxes stay on the tongue surface.
  const inset = u * 0.82;
  return { x: (1 - inset) * 0.50 + inset * ((1 - v) * a[0] + v * b[0]),
    y: (1 - inset) * 0.67 + inset * ((1 - v) * a[1] + v * b[1]) };
}

function updatePointers() {
  for (const pointer of pointers) {
    if (pointer.visible && artTime >= pointer.changeAt) {
      pointer.visible = false; pointer.showAt = artTime + POINTER_HIDE_DURATION;
    }
    if (!pointer.visible && artTime >= pointer.showAt) {
      const available = objects.map((obj, i) => i).filter(i => objects[i].visible && i !== pointer.objectIndex);
      if (!available.length) { continue; }
      pointer.objectIndex = pick(available);
      pointer.current = randomAnchor();
      pointer.boxSize = random(POINTER_BOX_MIN, POINTER_BOX_MAX);
      pointer.label = String(Math.floor(random(1, 36)));
      pointer.visible = random() > 0.12;
      pointer.showAt = artTime + POINTER_HIDE_DURATION;
      pointer.changeAt = artTime + timed(POINTER_INTERVAL * random(0.8, 1.2));

    }
  }
}

function drawPointers() {
  if (!tongueAsset) { return; }
  const pose = tongueTransform();
  const ctx = drawingContext;
  ctx.save();
  ctx.strokeStyle = '#FFFF00';
  ctx.fillStyle = '#FFFF00';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  for (const pointer of pointers) {
    const obj = objects[pointer.objectIndex];
    if (!pointer.visible || !obj.visible) { continue; }
    const ax = pose.x + (pointer.current.x - 0.5) * pose.w;
    const ay = pose.y + (pointer.current.y - 0.5) * pose.h;
    const bx = obj.x + ((obj.asset ? obj.asset.endX : 0.5) - 0.5) * obj.w;
    const by = obj.y + ((obj.asset ? obj.asset.endY : 0.5) - 0.5) * obj.h;
    const half = pointer.boxSize / 2;
    // Connect at the box edge rather than running through its centre.
    const reach = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(ax + (bx - ax) * half / reach, ay + (by - ay) * half / reach);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.fillRect(bx - 2, by - 2, 4, 4);
    // Reference-inspired tracking box: transparent square, diagonal X and ID.
    ctx.lineWidth = 2.8;
    ctx.strokeRect(ax - half, ay - half, pointer.boxSize, pointer.boxSize);
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ax - half, ay - half); ctx.lineTo(ax + half, ay + half);
    ctx.moveTo(ax + half, ay - half); ctx.lineTo(ax - half, ay + half);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillText(pointer.label, ax + half + 4, ay - half);
  }
  ctx.restore();
}

// Each card keeps its own clock: abrupt typographic edits, never a fixed loop.
function mutateTasteCard(card) {
  card.word = pick(TASTE_WORDS);
  card.displayStyle = pick(DISPLAY_STYLES);
  card.useDisplayStyle = random() < 0.5;
  card.face = pick(['Impact, sans-serif', 'Arial Black, sans-serif', ...TASTE_FONTS]);
  card.mode = pick(['solid', 'outline', 'outline', 'echo']);
  const blueNeon = card.useDisplayStyle && card.displayStyle === 'neon' && random() < 0.2;
  card.ink = blueNeon ? TASTE_NEON_BLUE : pick(TASTE_COLORS);
  card.secondary = pick(TASTE_COLORS.filter(ink => ink !== card.ink));
  card.slant = 'normal';
  card.weight = pick([700, 900, 900]);
  card.size = 180;
  card.phase = random(TWO_PI);
  card.shift = 0; // Stretch around the centre; never move the whole word sideways.
  card.next = artTime + random(380, 700) / Math.max(0.1, TASTE_SPEED);
}

function layoutTasteScene() {
  // One centred headline: never mix different languages within a frame.
  tasteScene = 'stretch';
  tasteSceneStarted = artTime;
  tasteCards = [{ x: 960, y: 540, w: 1880, h: 1000 }];
  for (const card of tasteCards) { mutateTasteCard(card); }
  tasteLayoutAt = artTime + random(1200, 1900) / Math.max(0.1, TASTE_SPEED);
}

function paintTasteCard(ctx, card, index) {
  if (artTime >= card.next) { mutateTasteCard(card); }
  const word = card.repeated || card.word;
  // Stepped rhythmic squeezing repeats inside each randomly generated composition.
  const beat = Math.floor((artTime - tasteSceneStarted) * 0.012 * TASTE_SPEED);
  const wave = Math.sin(beat * 0.95 + card.phase);
  const tall = tasteScene === 'columns' || (tasteScene === 'stretch' && beat % 8 < 4);
  const targetW = card.w * (tall ? 0.65 + 0.18 * wave : 1 + 0.12 * wave) * TASTE_SIZE;
  const targetH = card.h * (tall ? 1.15 + 0.18 * wave : 0.65 + 0.22 * wave) * TASTE_SIZE;
  if (card.useDisplayStyle) {
    paintDisplayTaste(ctx, card, word, targetW, targetH);
    return;
  }
  ctx.save(); ctx.translate(card.x + card.shift, card.y);
  ctx.font = `${card.slant} ${card.weight} 180px ${card.face}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const metrics = ctx.measureText(word);
  const ascent = metrics.actualBoundingBoxAscent || 135;
  const descent = metrics.actualBoundingBoxDescent || 20;
  ctx.scale(targetW / Math.max(metrics.width, 1), targetH / (ascent + descent));
  const baseline = (ascent - descent) / 2;
  ctx.lineWidth = 2.4; ctx.fillStyle = card.ink; ctx.strokeStyle = card.ink;
  if (card.mode === 'outline' || (tasteScene === 'overprint' && index % 2 === 0)) {
    ctx.strokeText(word, 0, baseline);

  } else {
    ctx.fillStyle = card.ink; ctx.fillText(word, 0, baseline);

  }
  ctx.restore();
}

// Shared title-card / sign treatments for every language, with Japanese font fallback.
// The reference lettering is not copied or used as an image.
function getTasteDots(word) {
  if (tasteDotCache.has(word)) { return tasteDotCache.get(word); }
  const surface = document.createElement('canvas');
  const glyphContext = surface.getContext('2d');
  glyphContext.font = `900 180px ${JAPANESE_FONT}`;
  const textWidth = glyphContext.measureText(word).width;
  surface.width = Math.ceil(textWidth + 80); surface.height = 240;
  glyphContext.font = `900 180px ${JAPANESE_FONT}`;
  glyphContext.textAlign = 'center'; glyphContext.textBaseline = 'middle';
  glyphContext.fillStyle = '#fff'; glyphContext.fillText(word, surface.width / 2, 120);
  const rgba = glyphContext.getImageData(0, 0, surface.width, 240).data;
  const dots = [];
  for (let y = 8; y < 232; y += 7) {
    for (let x = 8; x < surface.width - 8; x += 7) {
      if (rgba[(y * surface.width + x) * 4 + 3] > 90) { dots.push([x - surface.width / 2, y - 120]); }
    }
  }
  const result = { dots, width: textWidth };
  tasteDotCache.set(word, result);
  return result;
}

function paintDisplayTaste(ctx, card, word, targetW, targetH) {
  ctx.save(); ctx.translate(card.x, card.y);
  ctx.font = `900 180px ${JAPANESE_FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const wordWidth = Math.max(1, ctx.measureText(word).width);
  // Limit distortion enough to keep the Japanese characters recognisable.
  const glyphH = Math.min(targetH, targetW * 0.66);
  ctx.scale(targetW / (wordWidth + 65), glyphH / 230);
  ctx.lineJoin = 'miter'; ctx.miterLimit = 2;
  if (card.displayStyle === 'neon') {
    // Bright tube borders with a dark outer edge and coloured halo.
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#160622'; ctx.lineWidth = 20;
    ctx.strokeText(word, 0, 0);
    ctx.shadowColor = card.secondary; ctx.shadowBlur = 22;
    ctx.strokeStyle = card.secondary; ctx.lineWidth = 13;
    ctx.strokeText(word, 0, 0);
    ctx.shadowBlur = 8;
    ctx.strokeStyle = card.secondary; ctx.lineWidth = 6;
    ctx.strokeText(word, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = card.ink;
    ctx.fillText(word, 0, 0);
    ctx.strokeStyle = card.secondary; ctx.lineWidth = 1.5;
    ctx.strokeText(word, 0, 0);
  } else if (card.displayStyle === 'led') {
    const grid = getTasteDots(word);
    const scanRow = Math.floor(artTime / 80) % 34;
    for (const dot of grid.dots) {
      ctx.fillStyle = Math.floor((dot[1] + 120) / 7) === scanRow ? card.secondary : card.ink;
      ctx.fillRect(dot[0] - 2.5, dot[1] - 2.5, 5, 5);
    }
  } else {
    // Offset extrusion, contrasting keyline and a heavy, upright face.
    ctx.strokeStyle = '#180747'; ctx.lineWidth = 15;
    ctx.strokeText(word, 10, 9);
    ctx.strokeStyle = card.secondary; ctx.lineWidth = 11;
    ctx.strokeText(word, 0, 0);
    ctx.strokeStyle = card.ink; ctx.lineWidth = 3;
    ctx.strokeText(word, 0, 0);
    if (card.displayStyle === 'title') {
      ctx.fillStyle = card.ink; ctx.fillText(word, 0, 0);
    }
    // Short speed lines stay attached to the lettering, not to a backdrop.
    ctx.fillStyle = card.secondary;
    ctx.fillRect(-wordWidth / 2 - 24, -70, 75, 4);
    ctx.fillRect(wordWidth / 2 - 50, 70, 85, 4);
  }
  ctx.restore();
}

function updateTasteRhythm() {
  if (tasteBurstActive && artTime >= tasteBurstUntil) {
    tasteBurstActive = false;
    // No lettering, slices or ghost images survive a rest.
    // Mostly quick gaps, with occasional longer beats; avoid similar consecutive rests.
    let restMs = TASTE_REST_MIN;
    for (let attempt = 0; attempt < 8; attempt++) {
      restMs = TASTE_REST_MIN + Math.pow(random(), 2) * (TASTE_REST_MAX - TASTE_REST_MIN);
      if (Math.abs(restMs - lastTasteRest) >= 70) { break; }
    }
    lastTasteRest = restMs;
    tasteRestUntil = artTime + restMs;
  }
  if (!tasteBurstActive) {
    if (artTime < tasteRestUntil) { return false; }
    tasteBurstActive = true;
    const burstChoice = random();
    tasteErrorBurst = burstChoice < TASTE_ERROR_CHANCE;
    tasteAccumulationBurst = !tasteErrorBurst && burstChoice < 0.65;
    tasteAccumulationWord = pick(TASTE_WORDS);

    tasteSceneStarted = artTime;

    tasteAccumulationColors = [];
    if (tasteAccumulationBurst || tasteErrorBurst) {
      tasteAccumulationInk = pick(TASTE_POSTER_COLORS.filter(ink => ink !== tasteAccumulationInk));
    }
    tasteAccumulationStepMs = random(TASTE_STEP_MIN, TASTE_STEP_MAX) / Math.max(0.1, TASTE_SPEED);
    tasteBurstUntil = artTime + (tasteAccumulationBurst ? tasteAccumulationStepMs * 6 + random(TASTE_FULL_HOLD_MIN, TASTE_FULL_HOLD_MAX) : random(1300, 2100));
    if (tasteErrorBurst) {
      tasteErrorBorder = pick(TASTE_COLORS.filter(ink => ink !== tasteAccumulationInk));
      const direction = random() < 0.5 ? -1 : 1;
      tasteErrorCopies = Array.from({ length: TASTE_ERROR_COPIES }, (_, i) => ({
        x: 960 + direction * (i - 3.5) * 68 + random(-35, 35),
        y: 540 + (i - 3.5) * 68 + random(-20, 20)
      }));
      tasteBurstUntil = artTime + tasteAccumulationStepMs * TASTE_ERROR_COPIES + random(180, 320);
    }
    tasteLayoutAt = 0; tastePaintAt = 0;
  }
  return true;
}

function paintAccumulatingTaste(ctx) {
  const visibleCount = Math.min(6, 1 + Math.floor((artTime - tasteSceneStarted) / tasteAccumulationStepMs));
  // Every word in this accumulating poster shares one colour until the burst clears.
  while (tasteAccumulationColors.length < visibleCount) {
    tasteAccumulationColors.push(tasteAccumulationInk);
  }

  for (let slot = 0; slot < visibleCount; slot++) {
    const cx = 480 + (slot % 2) * 960;
    const cy = 180 + Math.floor(slot / 2) * 360;
    ctx.save(); ctx.translate(cx, cy);
    ctx.font = '900 180px Impact, Arial Narrow, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const metrics = ctx.measureText(tasteAccumulationWord);
    const ascent = metrics.actualBoundingBoxAscent || 135;
    const descent = metrics.actualBoundingBoxDescent || 1;
    ctx.scale(860 * TASTE_SIZE / metrics.width, 320 * TASTE_SIZE / (ascent + descent));
    ctx.fillStyle = tasteAccumulationColors[slot];
    ctx.fillText(tasteAccumulationWord, 0, (ascent - descent) / 2);
    ctx.restore();
  }
}

// Copies arrive like cascading error dialogs; previous copies remain fixed.
function paintErrorTaste(ctx) {
  const count = Math.min(TASTE_ERROR_COPIES,
    1 + Math.floor((artTime - tasteSceneStarted) / tasteAccumulationStepMs));
  for (let i = 0; i < count; i++) {
    const copy = tasteErrorCopies[i];
    ctx.save(); ctx.translate(copy.x, copy.y);
    ctx.font = `900 180px Impact, "Arial Black", ${JAPANESE_FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const metrics = ctx.measureText(tasteAccumulationWord);
    const ascent = metrics.actualBoundingBoxAscent || 135;
    const descent = metrics.actualBoundingBoxDescent || 1;
    ctx.scale(1120 / Math.max(1, metrics.width), 310 / (ascent + descent));
    const baseline = (ascent - descent) / 2;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#160622'; ctx.lineWidth = 14;
    ctx.strokeText(tasteAccumulationWord, 5, baseline + 5);
    ctx.strokeStyle = tasteErrorBorder; ctx.lineWidth = 7;
    ctx.strokeText(tasteAccumulationWord, 0, baseline);
    ctx.fillStyle = tasteAccumulationInk;
    ctx.fillText(tasteAccumulationWord, 0, baseline);
    ctx.restore();
  }
}

function drawTasteTypography() {
  if (!updateTasteRhythm()) { return; }
  if (!tasteCanvas) {
    tasteCanvas = document.createElement('canvas');
    tasteCanvas.width = CANVAS_W; tasteCanvas.height = CANVAS_H;
    tasteContext = tasteCanvas.getContext('2d');
  }
  if (!tasteErrorBurst && !tasteAccumulationBurst && artTime >= tasteLayoutAt) {
    layoutTasteScene(); tastePaintAt = 0;
  }
  if (artTime >= tastePaintAt) {
    const ctx = tasteContext;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.save();
    // Full-canvas typography, stretched around the centre of the artwork.
    ctx.beginPath(); ctx.rect(0, 0, CANVAS_W, CANVAS_H); ctx.clip();
    if (tasteErrorBurst) { paintErrorTaste(ctx); }
    else if (tasteAccumulationBurst) { paintAccumulatingTaste(ctx); }
    else { tasteCards.forEach((card, index) => paintTasteCard(ctx, card, index)); }
    ctx.restore();
    tasteSlices = [];
    for (let i = 0; i < ((tasteAccumulationBurst || tasteErrorBurst) ? 2 : 7); i++) {
      tasteSlices.push({ y: Math.floor(random(130, 930)), h: pick([6, 10, 18, 28]),
        dx: Math.floor(random(-110, 110)), skip: random() < 0.2 });
    }
    tasteSlices.sort((a, b) => a.y - b.y);
    tastePaintAt = artTime + random(55, 100) / Math.max(0.1, TASTE_SPEED);

  }
  const ctx = drawingContext;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, CANVAS_W, CANVAS_H); ctx.clip();
  const hasNeon = !tasteErrorBurst && !tasteAccumulationBurst && tasteCards.some(card => card.useDisplayStyle && card.displayStyle === 'neon');
  // Let neon emit bright colour instead of darkening it with multiply.
  ctx.globalCompositeOperation = hasNeon ? 'source-over' : TASTE_BLEND;
  ctx.globalAlpha = hasNeon ? 1 : TASTE_OPACITY;
  // Render the type in slices, shifting only the type, never the photos beneath.
  let cursorY = 0;
  for (const slice of tasteSlices) {
    if (slice.y < cursorY) { continue; }
    if (slice.y > cursorY) {
      ctx.drawImage(tasteCanvas, 0, cursorY, CANVAS_W, slice.y - cursorY,
        0, cursorY, CANVAS_W, slice.y - cursorY);
    }
    if (!slice.skip) {
      ctx.drawImage(tasteCanvas, 0, slice.y, CANVAS_W, slice.h,
        slice.dx, slice.y, CANVAS_W, slice.h);
    }
    cursorY = slice.y + slice.h;
  }
  if (cursorY < CANVAS_H) {
    ctx.drawImage(tasteCanvas, 0, cursorY, CANVAS_W, CANVAS_H - cursorY,
      0, cursorY, CANVAS_W, CANVAS_H - cursorY);
  }
  ctx.restore();
}
