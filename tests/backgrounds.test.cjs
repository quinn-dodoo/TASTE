const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const Background = require('../backgrounds.js');
let digest;
const ctx = new Proxy(
  {},
  {
    get:
      (_, key) =>
      (...args) => {
        for (const value of args)
          if (typeof value === 'number') assert(Number.isFinite(value), `${key}: non-finite coordinate`);
        digest?.update(JSON.stringify([key, ...args]));
      },
  },
);
global.document = { createElement: () => ({ getContext: () => ctx }) };
global.sessionStorage = { getItem: () => null, setItem: () => {} };
function render(mode, seed) {
  const engine = new Background({ mode, seed });
  digest = createHash('sha256');
  for (let frame = 0; frame < 180; frame++) engine.draw(ctx, 1920, 1080, frame * 34);
  const result = digest.digest('hex');
  digest = null;
  if (mode === 'automata') assert(engine.history.length <= engine.rows);
  return result;
}
for (const mode of Background.MODES) {
  const first = render(mode, 8101);
  assert.equal(render(mode, 8101), first, `${mode} should reproduce a seed`);
  assert.notEqual(render(mode, 8102), first, `${mode} should vary with the seed`);
  const engine = new Background({ mode, seed: 8101 });
  digest = createHash('sha256');
  engine.draw(ctx, 1920, 1080, 0);
  const a = digest.digest('hex');
  digest = createHash('sha256');
  engine.draw(ctx, 1920, 1080, 200);
  const b = digest.digest('hex');
  digest = null;
  assert.notEqual(a, b, `${mode} must evolve without a reload`);
  console.log(`PASS ${mode}: finite geometry, seed variation, reproducibility, evolution`);
}
const random = Background.randomSource(44);
let previous;
const seen = new Set();
for (let i = 0; i < 1000; i++) {
  const mode = Background.chooseMode(random, previous, 'invalid');
  assert.notEqual(mode, previous);
  seen.add(mode);
  previous = mode;
}
assert.equal(seen.size, 7);
console.log('PASS reload selection: no consecutive repeats, all seven reachable');
// A held frame must be identical until the next cut, with an opaque reset on each cut.
for (const mode of Background.MODES) {
  const clears = [];
  global.document = {
    createElement: () => ({
      getContext: () =>
        new Proxy(
          {},
          {
            get: (target, key) =>
              key in target
                ? target[key]
                : (...args) => {
                    if (key === 'fillRect' && args.join(',') === '0,0,960,540') clears.push(target.globalAlpha);
                  },
          },
        ),
    }),
  };
  const engine = new Background({ mode, seed: 8101 });
  engine.draw(ctx, 1920, 1080, 0);
  const beat = engine.beat,
    deadline = engine.nextJump;
  engine.draw(ctx, 1920, 1080, deadline - 0.01);
  assert.equal(engine.beat, beat, `${mode}: must hold without smooth motion`);
  assert.equal(clears.length, 1, `${mode}: cached frame must not be repainted`);
  engine.draw(ctx, 1920, 1080, deadline);
  assert.equal(engine.beat, beat + 1, `${mode}: must jump at deadline`);
  assert.deepEqual(clears, [1, 1], `${mode}: no translucent trail accumulation`);
  engine.draw(ctx, 1920, 1080, 600000);
  assert.equal(engine.beat, beat + 2, `${mode}: no catch-up burst after returning to the tab`);
}
assert(!Background.MODES.includes('vortex'));
assert(!Background.MODES.includes('swarm'));
assert.equal(new Background({ mode: 'vortex', seed: 1 }).mode, 'shards');
assert.equal(new Background({ mode: 'swarm', seed: 1 }).mode, 'scatter');
console.log('PASS hard cuts: exact frame holds, opaque resets, no tornado/flow modes, old links supported');
