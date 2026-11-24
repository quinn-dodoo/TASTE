// SPDX-License-Identifier: GPL-3.0-only
function createSurface(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function clipCanvas(ctx, width, height) {
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
}

function strokeWord(ctx, word, color, width, x = 0, y = 0) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.strokeText(word, x, y);
}

function fitWord(ctx, word, width, height, fallbackDescent = 1) {
  const metrics = ctx.measureText(word);
  const ascent = metrics.actualBoundingBoxAscent || 135;
  const descent = metrics.actualBoundingBoxDescent || fallbackDescent;
  ctx.scale(width / Math.max(1, metrics.width), height / (ascent + descent));
  return (ascent - descent) / 2;
}
