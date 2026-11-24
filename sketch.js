// SPDX-License-Identifier: GPL-3.0-only
let artTime = 0;
let generativeBackground;
const pick = (values) => values[Math.floor(random(values.length))];

function setup() {
  createStage();
  pixelDensity(1);
  frameRate(60);
  noSmooth();
  if (SEED !== null) {
    randomSeed(SEED);
    noiseSeed(SEED);
  }
  fitCanvasToWindow();
  arrangeObjects([]);
  loadAssets();
}

function createStage() {
  const stage = createCanvas(CANVAS_W, CANVAS_H);
  stage.elt.id = 'owned-collage';
  stage.parent('artwork');
  stage.elt.setAttribute('aria-label', 'TASTE: animated consumption collage');
  generativeBackground = new TasteBackground();
  stage.elt.dataset.background = generativeBackground.mode;
  stage.elt.dataset.seed = String(generativeBackground.seed);
}

function draw() {
  artTime = millis();
  generativeBackground.draw(drawingContext, CANVAS_W, CANVAS_H, artTime);
  updateObjects();
  drawObjects();
  drawTongue();
  updatePointers();
  drawPointers();
  if (SHOW_TASTE_TYPE) drawTasteTypography();
}
