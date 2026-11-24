// SPDX-License-Identifier: GPL-3.0-only
let pointers = [];

function tongueTransform() {
  const tongueH = 1080;
  const tongueW = tongueAsset ? (tongueH * tongueAsset.canvas.width) / tongueAsset.canvas.height : tongueH;
  return { x: 960, y: 530, w: tongueW, h: tongueH };
}

function drawTongue() {
  if (!tongueAsset) {
    return;
  }
  const pose = tongueTransform();
  drawingContext.drawImage(tongueAsset.canvas, pose.x - pose.w / 2, pose.y - pose.h / 2, pose.w, pose.h);
}

function randomAnchor() {
  const edge = Math.floor(random(TONGUE_REGION.length));
  const a = TONGUE_REGION[edge],
    b = TONGUE_REGION[(edge + 1) % TONGUE_REGION.length];
  const u = Math.sqrt(random()),
    v = random();
  const inset = u * 0.82;
  return {
    x: (1 - inset) * 0.5 + inset * ((1 - v) * a[0] + v * b[0]),
    y: (1 - inset) * 0.67 + inset * ((1 - v) * a[1] + v * b[1]),
  };
}

function updatePointers() {
  for (const pointer of pointers) {
    if (pointer.visible && artTime >= pointer.changeAt) {
      pointer.visible = false;
      pointer.showAt = artTime + POINTER_HIDE_DURATION;
    }
    if (!pointer.visible && artTime >= pointer.showAt) replacePointer(pointer);
  }
}

function replacePointer(pointer) {
  const available = objects.map((_, i) => i).filter((i) => objects[i].visible && i !== pointer.objectIndex);
  if (!available.length) return;
  pointer.objectIndex = pick(available);
  pointer.current = randomAnchor();
  pointer.boxSize = random(POINTER_BOX_MIN, POINTER_BOX_MAX);
  pointer.label = String(Math.floor(random(1, 36)));
  pointer.visible = random() > 0.12;
  pointer.showAt = artTime + POINTER_HIDE_DURATION;
  pointer.changeAt = artTime + timed(POINTER_INTERVAL * random(0.8, 1.2));
}

function createPointer(index) {
  return {
    current: randomAnchor(),
    boxSize: random(POINTER_BOX_MIN, POINTER_BOX_MAX),
    label: String(Math.floor(random(1, 36))),
    objectIndex: index,
    visible: true,
    showAt: 0,
    changeAt: artTime + random(300, POINTER_INTERVAL),
  };
}

function hideObjectPointers(index, showAt) {
  for (const pointer of pointers) {
    if (pointer.objectIndex !== index) continue;
    pointer.visible = false;
    pointer.showAt = showAt + POINTER_HIDE_DURATION;
    pointer.changeAt = pointer.showAt;
  }
}

function drawPointers() {
  if (!tongueAsset) return;
  const ctx = drawingContext,
    pose = tongueTransform();
  ctx.save();
  ctx.strokeStyle = '#FFFF00';
  ctx.fillStyle = '#FFFF00';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  for (const pointer of pointers) {
    const object = objects[pointer.objectIndex];
    if (pointer.visible && object.visible) drawPointer(ctx, pointer, object, pose);
  }
  ctx.restore();
}

function drawPointer(ctx, pointer, object, pose) {
  const ax = pose.x + (pointer.current.x - 0.5) * pose.w;
  const ay = pose.y + (pointer.current.y - 0.5) * pose.h;
  const bx = object.x + ((object.asset ? object.asset.endX : 0.5) - 0.5) * object.w;
  const by = object.y + ((object.asset ? object.asset.endY : 0.5) - 0.5) * object.h;
  drawConnector(ctx, ax, ay, bx, by, pointer.boxSize / 2);
  drawTrackingBox(ctx, pointer, ax, ay);
}

function drawConnector(ctx, ax, ay, bx, by, half) {
  const reach = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(ax + ((bx - ax) * half) / reach, ay + ((by - ay) * half) / reach);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.fillRect(bx - 2, by - 2, 4, 4);
}

function drawTrackingBox(ctx, pointer, x, y) {
  const half = pointer.boxSize / 2;
  ctx.lineWidth = 2.8;
  ctx.strokeRect(x - half, y - half, pointer.boxSize, pointer.boxSize);
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x - half, y - half);
  ctx.lineTo(x + half, y + half);
  ctx.moveTo(x + half, y - half);
  ctx.lineTo(x - half, y + half);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillText(pointer.label, x + half + 4, y - half);
}
