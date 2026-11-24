// SPDX-License-Identifier: GPL-3.0-only
let objects = [];

function arrangeObjects(assets) {
  const shuffled = shuffleAssets(assets);
  const count = assets.length ? Math.min(MAX_OBJECTS, assets.length) : 6;
  objects = [];
  for (let i = 0; i < count; i++) objects.push(createObject(shuffled[i], i));
  pointers = objects.map((_, index) => createPointer(index));
}

function shuffleAssets(assets) {
  const shuffled = [...assets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createObject(asset, index) {
  const object = {
    asset: asset || null,
    x: NaN,
    y: NaN,
    w: 1,
    h: 1,
    nextMove: artTime + random(OBJECT_REPOSITION_MIN, OBJECT_REPOSITION_MAX),
    visible: true,
    showAt: 0,
    symbol: index % 3,
  };
  randomizeObjectLayout(object);
  return object;
}

function randomizeObjectLayout(object) {
  resizeObject(object);
  let best = null,
    bestScore = -Infinity;
  for (let attempt = 0; attempt < 100; attempt++) {
    const position = sampleObjectPosition(object);
    const score = scoreObjectPosition(object, position);
    if (score > bestScore) {
      bestScore = score;
      best = position;
    }
    if (score === 0) break;
  }
  object.x = Math.round(best.x);
  object.y = Math.round(best.y);
}

function resizeObject(object) {
  const ratio = object.asset ? object.asset.canvas.width / object.asset.canvas.height : 1.2;
  const edge = OBJECT_SIZE_MIN + Math.sqrt(random()) * (OBJECT_SIZE_MAX - OBJECT_SIZE_MIN);
  object.w = ratio >= 1 ? edge : edge * ratio;
  object.h = ratio >= 1 ? edge / ratio : edge;
}

function sampleObjectPosition(object) {
  const leftSide = random() < 0.5;
  const left = leftSide ? 20 : 1280,
    right = leftSide ? 640 : CANVAS_W - 20;
  return {
    x: random(left + object.w / 2, right - object.w / 2),
    y: random(20 + object.h / 2, CANVAS_H - 20 - object.h / 2),
  };
}

function scoreObjectPosition(object, { x, y }) {
  let score = Number.isFinite(object.x) && Math.hypot(x - object.x, y - object.y) < OBJECT_JUMP_DISTANCE ? -4 : 0;
  for (const other of objects) {
    if (other === object) continue;
    const overlapW = Math.max(0, (object.w + other.w) / 2 + 12 - Math.abs(x - other.x));
    const overlapH = Math.max(0, (object.h + other.h) / 2 + 12 - Math.abs(y - other.y));
    score -= (overlapW * overlapH) / Math.min(object.w * object.h, other.w * other.h);
  }
  return score;
}

function updateObjects() {
  objects.forEach((object, index) => {
    if (!object.visible && artTime >= object.showAt) object.visible = true;
    if (artTime >= object.nextMove) moveObject(object, index);
  });
}

function moveObject(object, index) {
  object.visible = false;
  object.showAt = artTime + random(35, 65);
  object.nextMove = artTime + random(OBJECT_REPOSITION_MIN, OBJECT_REPOSITION_MAX);
  if (objectAssetPool.length) object.asset = pickObjectAsset(object);
  randomizeObjectLayout(object);
  hideObjectPointers(index, object.showAt);
}

function pickObjectAsset(object) {
  const unused = objectAssetPool.filter((asset) => !objects.some((other) => other !== object && other.asset === asset));
  return pick(unused.length ? unused : objectAssetPool);
}

const OBJECT_HALFTONE_DOT_SIZE = 4; // Larger number = coarser printed dots.
const OBJECT_HALFTONE_YELLOW = '#FFFF00';
const objectHalftoneCache = new WeakMap();

function getObjectHalftone(asset) {
  if (objectHalftoneCache.has(asset)) return objectHalftoneCache.get(asset);
  const source = asset.canvas,
    ratio = 320 / Math.max(source.width, source.height);
  const print = createSurface(
    Math.max(1, Math.round(source.width * ratio)),
    Math.max(1, Math.round(source.height * ratio)),
  );
  paintHalftone(print, source);
  objectHalftoneCache.set(asset, print);
  return print;
}

function paintHalftone(print, source) {
  const ctx = print.getContext('2d');
  ctx.drawImage(source, 0, 0, print.width, print.height);
  const sample = ctx.getImageData(0, 0, print.width, print.height).data;
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = OBJECT_HALFTONE_YELLOW;
  ctx.fillRect(0, 0, print.width, print.height);
  ctx.globalCompositeOperation = 'source-over';
  paintHalftoneDots(ctx, print, sample);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(source, 0, 0, print.width, print.height);
  ctx.globalCompositeOperation = 'source-over';
}

function paintHalftoneDots(ctx, print, sample) {
  const step = OBJECT_HALFTONE_DOT_SIZE;
  ctx.fillStyle = '#111126';
  for (let y = step / 2; y < print.height; y += step) {
    for (let x = step / 2; x < print.width; x += step) {
      const i = (Math.floor(y) * print.width + Math.floor(x)) * 4;
      if (sample[i + 3] < 10) continue;
      const light = (sample[i] * 0.2126 + sample[i + 1] * 0.7152 + sample[i + 2] * 0.0722) / 255;
      ctx.beginPath();
      ctx.arc(x, y, step * 0.64 * Math.sqrt(1 - light), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawObjects() {
  for (const obj of objects) {
    if (!obj.visible) {
      continue;
    }
    const ox = Math.round(obj.x - obj.w / 2),
      oy = Math.round(obj.y - obj.h / 2);
    if (obj.asset) {
      drawingContext.drawImage(getObjectHalftone(obj.asset), ox, oy, obj.w, obj.h);
    } else {
      drawObjectFallback(obj);
    }
  }
}

function drawObjectFallback(obj) {
  push();
  translate(obj.x, obj.y);
  rectMode(CENTER);
  stroke('#000');
  strokeWeight(5);
  fill(PALETTE[(obj.symbol + 1) % 5]);
  if (obj.symbol === 0) {
    rect(0, 20, 125, 105);
    noFill();
    rect(0, -40, 65, 55);
  } else if (obj.symbol === 1) {
    rect(0, 0, 160, 100);
    fill('#fff');
    rect(15, 0, 66, 66);
    fill('#000');
    rect(15, 0, 36, 36);
  } else {
    rect(-45, 0, 65, 45);
    rect(45, 0, 65, 45);
    line(-12, 0, 12, 0);
  }
  pop();
}
