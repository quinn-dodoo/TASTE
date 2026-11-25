// SPDX-License-Identifier: GPL-3.0-only
// AI-assisted test code: check artwork loading, layout, typography and pointer behaviour.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
let seed = 19,
  now = 0,
  drawingCalls = 0;
const setupCalls = [];
const storage = new Map();

function random(min = 1, max) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const value = seed / 4294967296;
  return max === undefined ? value * min : min + value * (max - min);
}

function opaquePixels(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) data.set([20, 40, 60, 255], i);
  return { data, width, height };
}

function makeContext() {
  return new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
        if (key === 'measureText')
          return (text) => ({ width: text.length * 90, actualBoundingBoxAscent: 135, actualBoundingBoxDescent: 20 });
        if (key === 'getImageData') return (_x, _y, width, height) => opaquePixels(width, height);
        return (...args) => {
          drawingCalls++;
          args
            .filter((value) => typeof value === 'number')
            .forEach((value) => assert(Number.isFinite(value), `${key}: invalid coordinate`));
        };
      },
    },
  );
}

function makeCanvas() {
  const context = makeContext();
  return { width: 2, height: 2, dataset: {}, setAttribute() {}, getContext: () => context };
}

const sandbox = {
  console,
  URLSearchParams,
  setTimeout,
  clearTimeout,
  Uint32Array,
  crypto: {
    getRandomValues: (values) => {
      values[0] = 8101;
      return values;
    },
  },
  sessionStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
  location: { search: '?background=mosaic&seed=8101' },
  document: { createElement: makeCanvas },
  random,
  TWO_PI: Math.PI * 2,
  drawingContext: makeContext(),
  createCanvas: (width, height) => {
    setupCalls.push(['canvas', width, height]);
    return { elt: makeCanvas(), parent() {} };
  },
  pixelDensity: (value) => setupCalls.push(['density', value]),
  loadImage: (_path, success) => success({ width: 2, height: 2, canvas: makeCanvas() }),
  millis: () => now,
};
for (const name of [
  'frameRate',
  'noSmooth',
  'randomSeed',
  'noiseSeed',
  'fitCanvasToWindow',
])
  sandbox[name] = () => {};
const context = vm.createContext(sandbox);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script defer src="([^"?]+)/g)].map((match) => match[1]);
for (const file of scripts.filter((file) => !['p5.min.js', 'script.js'].includes(file))) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}

async function testArtwork() {
  context.setup();
  assert.equal(vm.runInContext('objects.length', context), 0);
  assert.equal(vm.runInContext('pointers.length', context), 0);
  context.draw();
  for (let tick = 0; tick < 100; tick++) await Promise.resolve();
  assert.deepEqual(setupCalls.slice(0, 2), [
    ['canvas', 1920, 1080],
    ['density', 1],
  ]);
  const scenes = new Set();
  for (let frame = 0; frame < 900; frame++) {
    now = frame * 40;
    context.draw();
    vm.runInContext(
      `
      for (const object of objects) {
        if (object.x - object.w / 2 < 19 || object.x + object.w / 2 > 1901) throw Error('Object outside horizontal bounds');
        if (object.y - object.h / 2 < 19 || object.y + object.h / 2 > 1061) throw Error('Object outside vertical bounds');
      }
      for (const pointer of pointers) {
        if (+pointer.label < 1 || +pointer.label > 35) throw Error('Pointer label out of range');
        if (!objects[pointer.objectIndex]) throw Error('Missing pointer target');
      }
    `,
      context,
    );
    scenes.add(
      vm.runInContext('tasteErrorBurst ? "error" : tasteAccumulationBurst ? "accumulation" : "headline"', context),
    );
  }
  assert.equal(scenes.size, 3);
  assert(drawingCalls > 0);
  assert.equal(vm.runInContext('objectAssetPool.length', context), 35);
  assert.equal(context.findOpaqueBounds({ data: new Uint8ClampedArray(16), width: 2, height: 2 }), null);
  context.loadImage = (_path, _success, failure) => failure();
  await context.loadAssets();
  assert.equal(vm.runInContext('objects.length', context), 0);
  assert.equal(vm.runInContext('pointers.length', context), 0);
  context.draw();
  console.log(
    'PASS artwork: 1920×1080 setup, 35 assets, all three type scenes, object bounds, pointer IDs, finite drawing coordinates, empty/loading/failed-image states',
  );
}
testArtwork().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
