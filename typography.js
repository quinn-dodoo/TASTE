// Student direction: oversized multilingual type, bright colours and sharp changes in rhythm => text fitting, display treatments, burst timing and canvas compositing.
const SHOW_TASTE_TYPE = true;
const TASTE_OPACITY = 1;
const TASTE_BLEND = 'source-over';
const TASTE_SPEED = 1.4;
const TASTE_REST_MIN = 80;
const TASTE_REST_MAX = 650;
const TASTE_STEP_MIN = 80;
const TASTE_STEP_MAX = 150;
let lastTasteRest = 0;
let tasteBurstActive = false,
  tasteRestUntil = 0,
  tasteBurstUntil = 0;
let tasteAccumulationBurst = true;
let tasteAccumulationWord = 'TASTE!';
const TASTE_ERROR_CHANCE = 0.3;
const TASTE_ERROR_COPIES = 8;
let tasteErrorBurst = false,
  tasteErrorCopies = [],
  tasteErrorBorder = '#FFFF00';
const TASTE_FULL_HOLD_MIN = 120;
const TASTE_FULL_HOLD_MAX = 240;
let tasteAccumulationStepMs = 180,
  tasteAccumulationInk = '#f40220';
const TASTE_SIZE = 1;
const TASTE_WORDS = ['TASTE!', 'VỊ GIÁC', 'GOÛT', 'SABOR', 'GUSTO', 'GESCHMACK', '味覚', 'テイスト', '미각', '味觉'];
const JAPANESE_FONT = '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
const DISPLAY_STYLES = ['title', 'outline', 'led', 'neon', 'neon'];
const tasteDotCache = new Map();
const TASTE_FONTS = [
  'Impact, sans-serif',
  'Arial Black, sans-serif',
  'Helvetica, sans-serif',
  'Arial, sans-serif',
  'Verdana, sans-serif',
];
let tasteCanvas,
  tasteContext,
  tasteCards = [],
  tasteLayoutAt = 0,
  tastePaintAt = 0;
let tasteSlices = [];
let tasteSceneStarted = 0;
const TASTE_COLORS = ['#FF0026', '#FF7B30', '#FF00B8', '#39FF14', '#FFFF00'];
const TASTE_POSTER_COLORS = [
  '#FF0026',
  '#FF0026',
  '#FF0026',
  '#FF00B8',
  '#FF00B8',
  '#FF00B8',
  '#39FF14',
  '#39FF14',
  '#39FF14',
  '#FFFF00',
  '#FF7B30',
];
const TASTE_NEON_BLUE = '#0019ff';

// Student direction: change language, colour and type treatment between bursts => Random array choices build each card; its timer controls when those choices change.
function mutateTasteCard(card) {
  card.word = pick(TASTE_WORDS);
  card.displayStyle = pick(DISPLAY_STYLES);
  card.useDisplayStyle = random() < 0.5;
  card.face = pick(['Impact, sans-serif', 'Arial Black, sans-serif', ...TASTE_FONTS]);
  card.mode = pick(['solid', 'outline', 'outline', 'solid']);
  const blueNeon = card.useDisplayStyle && card.displayStyle === 'neon' && random() < 0.2;
  card.ink = blueNeon ? TASTE_NEON_BLUE : pick(TASTE_COLORS);
  card.secondary = pick(TASTE_COLORS.filter((ink) => ink !== card.ink));
  card.weight = pick([700, 900, 900]);
  card.phase = random(TWO_PI);
  card.next = artTime + random(380, 700) / Math.max(0.1, TASTE_SPEED);
}

function layoutTasteScene() {
  tasteSceneStarted = artTime;
  tasteCards = [{ x: 960, y: 540, w: 1880, h: 1000 }];
  for (const card of tasteCards) {
    mutateTasteCard(card);
  }
  tasteLayoutAt = artTime + random(1200, 1900) / Math.max(0.1, TASTE_SPEED);
}

function paintTasteCard(ctx, card) {
  if (artTime >= card.next) mutateTasteCard(card);
  const { width, height } = tasteCardSize(card);
  if (card.useDisplayStyle) paintDisplayTaste(ctx, card, card.word, width, height);
  else paintPlainTaste(ctx, card, width, height);
}

// Student direction: the type stretches in abrupt steps.
// AI-assisted: calculate width and height from a stepped beat, then fit the glyphs to that area.
function tasteCardSize(card) {
  const beat = Math.floor((artTime - tasteSceneStarted) * 0.012 * TASTE_SPEED);
  const wave = Math.sin(beat * 0.95 + card.phase),
    tall = beat % 8 < 4;
  return {
    width: card.w * (tall ? 0.65 + 0.18 * wave : 1 + 0.12 * wave) * TASTE_SIZE,
    height: card.h * (tall ? 1.15 + 0.18 * wave : 0.65 + 0.22 * wave) * TASTE_SIZE,
  };
}

function paintPlainTaste(ctx, card, width, height) {
  ctx.save();
  ctx.translate(card.x, card.y);
  ctx.font = `normal ${card.weight} 180px ${card.face}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const baseline = fitWord(ctx, card.word, width, height, 20);
  ctx.lineWidth = 2.4;
  ctx.fillStyle = card.ink;
  ctx.strokeStyle = card.ink;
  if (card.mode === 'outline') ctx.strokeText(card.word, 0, baseline);
  else ctx.fillText(card.word, 0, baseline);
  ctx.restore();
}

// AI-assisted: sample a rendered glyph into a cached dot grid for the LED treatment.
function getTasteDots(word) {
  if (tasteDotCache.has(word)) return tasteDotCache.get(word);
  const surface = createSurface(1, 240),
    ctx = surface.getContext('2d');
  ctx.font = `900 180px ${JAPANESE_FONT}`;
  surface.width = Math.ceil(ctx.measureText(word).width + 80);
  ctx.font = `900 180px ${JAPANESE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(word, surface.width / 2, 120);
  const dots = sampleGlyphDots(ctx, surface.width);
  tasteDotCache.set(word, dots);
  return dots;
}

function sampleGlyphDots(ctx, width) {
  const rgba = ctx.getImageData(0, 0, width, 240).data,
    dots = [];
  for (let y = 8; y < 232; y += 7) {
    for (let x = 8; x < width - 8; x += 7) {
      if (rgba[(y * width + x) * 4 + 3] > 90) dots.push([x - width / 2, y - 120]);
    }
  }
  return dots;
}

// Student direction: bold colour contrasts and layered outlines on the large lettering => Size the text, then build its treatment with strokes, shadows or sampled dots.
function paintDisplayTaste(ctx, card, word, targetW, targetH) {
  ctx.save();
  ctx.translate(card.x, card.y);
  ctx.font = `900 180px ${JAPANESE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const wordWidth = Math.max(1, ctx.measureText(word).width);
  ctx.scale(targetW / (wordWidth + 65), Math.min(targetH, targetW * 0.66) / 230);
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 2;
  if (card.displayStyle === 'neon') paintNeonTaste(ctx, card, word);
  else if (card.displayStyle === 'led') paintLedTaste(ctx, card, word);
  else paintTitleTaste(ctx, card, word, wordWidth);
  ctx.restore();
}

function paintNeonTaste(ctx, card, word) {
  ctx.lineJoin = 'round';
  strokeWord(ctx, word, '#160622', 20);
  ctx.shadowColor = card.secondary;
  ctx.shadowBlur = 22;
  strokeWord(ctx, word, card.secondary, 13);
  ctx.shadowBlur = 8;
  strokeWord(ctx, word, card.secondary, 6);
  ctx.shadowBlur = 0;
  ctx.fillStyle = card.ink;
  ctx.fillText(word, 0, 0);
  strokeWord(ctx, word, card.secondary, 1.5);
}

function paintLedTaste(ctx, card, word) {
  const scanRow = Math.floor(artTime / 80) % 34;
  for (const dot of getTasteDots(word)) {
    ctx.fillStyle = Math.floor((dot[1] + 120) / 7) === scanRow ? card.secondary : card.ink;
    ctx.fillRect(dot[0] - 2.5, dot[1] - 2.5, 5, 5);
  }
}

function paintTitleTaste(ctx, card, word, width) {
  strokeWord(ctx, word, '#180747', 15, 10, 9);
  strokeWord(ctx, word, card.secondary, 11);
  strokeWord(ctx, word, card.ink, 3);
  if (card.displayStyle === 'title') {
    ctx.fillStyle = card.ink;
    ctx.fillText(word, 0, 0);
  }
  ctx.fillStyle = card.secondary;
  ctx.fillRect(-width / 2 - 24, -70, 75, 4);
  ctx.fillRect(width / 2 - 50, 70, 85, 4);
}

// Student direction: bursts of type with pauses that reveal the mouth and objects.
// AI-assisted: manage headline, accumulation and error-stack states with separate timers.
function updateTasteRhythm() {
  if (tasteBurstActive && artTime >= tasteBurstUntil) finishTasteBurst();
  if (!tasteBurstActive && artTime < tasteRestUntil) return false;
  if (!tasteBurstActive) startTasteBurst();
  return true;
}

function finishTasteBurst() {
  tasteBurstActive = false;
  let restMs = TASTE_REST_MIN;
  for (let attempt = 0; attempt < 8; attempt++) {
    restMs = TASTE_REST_MIN + Math.pow(random(), 2) * (TASTE_REST_MAX - TASTE_REST_MIN);
    if (Math.abs(restMs - lastTasteRest) >= 70) break;
  }
  lastTasteRest = restMs;
  tasteRestUntil = artTime + restMs;
}

function startTasteBurst() {
  tasteBurstActive = true;
  const choice = random();
  tasteErrorBurst = choice < TASTE_ERROR_CHANCE;
  tasteAccumulationBurst = !tasteErrorBurst && choice < 0.65;
  tasteAccumulationWord = pick(TASTE_WORDS);
  tasteSceneStarted = artTime;
  if (tasteAccumulationBurst || tasteErrorBurst) {
    tasteAccumulationInk = pick(TASTE_POSTER_COLORS.filter((ink) => ink !== tasteAccumulationInk));
  }
  setTasteBurstTiming();
  tasteLayoutAt = 0;
  tastePaintAt = 0;
}

function setTasteBurstTiming() {
  tasteAccumulationStepMs = random(TASTE_STEP_MIN, TASTE_STEP_MAX) / Math.max(0.1, TASTE_SPEED);
  const duration = tasteAccumulationBurst
    ? tasteAccumulationStepMs * 6 + random(TASTE_FULL_HOLD_MIN, TASTE_FULL_HOLD_MAX)
    : random(1300, 2100);
  tasteBurstUntil = artTime + duration;
  if (tasteErrorBurst) startErrorTaste();
}

// Stagger repeated copies and reveal them one at a time.
function startErrorTaste() {
  tasteErrorBorder = pick(TASTE_COLORS.filter((ink) => ink !== tasteAccumulationInk));
  const direction = random() < 0.5 ? -1 : 1;
  tasteErrorCopies = Array.from({ length: TASTE_ERROR_COPIES }, (_, i) => ({
    x: 960 + direction * (i - 3.5) * 68 + random(-35, 35),
    y: 540 + (i - 3.5) * 68 + random(-20, 20),
  }));
  tasteBurstUntil = artTime + tasteAccumulationStepMs * TASTE_ERROR_COPIES + random(180, 320);
}

function paintAccumulatingTaste(ctx) {
  const count = Math.min(6, 1 + Math.floor((artTime - tasteSceneStarted) / tasteAccumulationStepMs));
  for (let slot = 0; slot < count; slot++) paintTasteSlot(ctx, slot);
}

function paintTasteSlot(ctx, slot) {
  ctx.save();
  ctx.translate(480 + (slot % 2) * 960, 180 + Math.floor(slot / 2) * 360);
  ctx.font = '900 180px Impact, Arial Narrow, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const baseline = fitWord(ctx, tasteAccumulationWord, 860 * TASTE_SIZE, 320 * TASTE_SIZE);
  ctx.fillStyle = tasteAccumulationInk;
  ctx.fillText(tasteAccumulationWord, 0, baseline);
  ctx.restore();
}

function paintErrorTaste(ctx) {
  const count = Math.min(TASTE_ERROR_COPIES, 1 + Math.floor((artTime - tasteSceneStarted) / tasteAccumulationStepMs));
  for (let i = 0; i < count; i++) paintErrorCopy(ctx, tasteErrorCopies[i]);
}

function paintErrorCopy(ctx, copy) {
  ctx.save();
  ctx.translate(copy.x, copy.y);
  ctx.font = `900 180px Impact, "Arial Black", ${JAPANESE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const baseline = fitWord(ctx, tasteAccumulationWord, 1120, 310);
  ctx.lineJoin = 'round';
  strokeWord(ctx, tasteAccumulationWord, '#160622', 14, 5, baseline + 5);
  strokeWord(ctx, tasteAccumulationWord, tasteErrorBorder, 7, 0, baseline);
  ctx.fillStyle = tasteAccumulationInk;
  ctx.fillText(tasteAccumulationWord, 0, baseline);
  ctx.restore();
}

// Render the text scene to a separate canvas before compositing it over the collage.
function drawTasteTypography() {
  if (!updateTasteRhythm()) return;
  if (!tasteCanvas) {
    tasteCanvas = createSurface(CANVAS_W, CANVAS_H);
    tasteContext = tasteCanvas.getContext('2d');
  }
  if (!tasteErrorBurst && !tasteAccumulationBurst && artTime >= tasteLayoutAt) {
    layoutTasteScene();
    tastePaintAt = 0;
  }
  if (artTime >= tastePaintAt) repaintTaste();
  compositeTaste(drawingContext);
}

function repaintTaste() {
  const ctx = tasteContext;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.save();
  clipCanvas(ctx, CANVAS_W, CANVAS_H);
  if (tasteErrorBurst) paintErrorTaste(ctx);
  else if (tasteAccumulationBurst) paintAccumulatingTaste(ctx);
  else tasteCards.forEach((card) => paintTasteCard(ctx, card));
  ctx.restore();
  createTasteSlices();
  tastePaintAt = artTime + random(55, 100) / Math.max(0.1, TASTE_SPEED);
}

// Student direction: cut, shift or omit canvas strips while keeping the rest of the text aligned.
function createTasteSlices() {
  tasteSlices = [];
  const count = tasteAccumulationBurst || tasteErrorBurst ? 2 : 7;
  for (let i = 0; i < count; i++) {
    tasteSlices.push({
      y: Math.floor(random(130, 930)),
      h: pick([6, 10, 18, 28]),
      dx: Math.floor(random(-110, 110)),
      skip: random() < 0.2,
    });
  }
  tasteSlices.sort((a, b) => a.y - b.y);
}

function compositeTaste(ctx) {
  ctx.save();
  clipCanvas(ctx, CANVAS_W, CANVAS_H);
  const hasNeon =
    !tasteErrorBurst &&
    !tasteAccumulationBurst &&
    tasteCards.some((card) => card.useDisplayStyle && card.displayStyle === 'neon');
  ctx.globalCompositeOperation = hasNeon ? 'source-over' : TASTE_BLEND;
  ctx.globalAlpha = hasNeon ? 1 : TASTE_OPACITY;
  drawTasteSlices(ctx);
  ctx.restore();
}

function drawTasteSlices(ctx) {
  let cursorY = 0;
  for (const slice of tasteSlices) {
    if (slice.y < cursorY) continue;
    if (slice.y > cursorY) copyTasteStrip(ctx, cursorY, slice.y - cursorY);
    if (!slice.skip) copyTasteStrip(ctx, slice.y, slice.h, slice.dx);
    cursorY = slice.y + slice.h;
  }
  if (cursorY < CANVAS_H) copyTasteStrip(ctx, cursorY, CANVAS_H - cursorY);
}

function copyTasteStrip(ctx, y, height, shift = 0) {
  ctx.drawImage(tasteCanvas, 0, y, CANVAS_W, height, shift, y, CANVAS_W, height);
}
