const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const Background = require('../backgrounds.js');
let digest;
const ctx = new Proxy({}, {get: (_, key) => (...args) => {
 for (const value of args) if (typeof value === 'number') assert(Number.isFinite(value), `${key}: non-finite coordinate`);
 digest?.update(JSON.stringify([key, ...args]));
}});
global.document = {createElement: () => ({getContext: () => ctx})};
global.sessionStorage = {getItem: () => null, setItem: () => {}};
function render(mode, seed) {
 const engine = new Background({mode, seed});
 digest = createHash('sha256');
 for (let frame=0;frame<180;frame++) engine.draw(ctx,1920,1080,frame*34);
 const result = digest.digest('hex');digest=null;
 if (mode === 'automata') assert(engine.history.length <= engine.rows);
 return result;
}
for (const mode of Background.MODES) {
 const first = render(mode,8101);
 assert.equal(render(mode,8101),first,`${mode} should reproduce a seed`);
 assert.notEqual(render(mode,8102),first,`${mode} should vary with the seed`);
 const engine = new Background({mode,seed:8101});
 digest=createHash('sha256');engine.draw(ctx,1920,1080,0);const a=digest.digest('hex');
 digest=createHash('sha256');engine.draw(ctx,1920,1080,200);const b=digest.digest('hex');digest=null;
 assert.notEqual(a,b,`${mode} must evolve without a reload`);
 console.log(`PASS ${mode}: finite geometry, seed variation, reproducibility, evolution`);
}
const random=Background.randomSource(44);let previous;const seen=new Set();
for(let i=0;i<1000;i++){
 const mode=Background.chooseMode(random,previous,'invalid');assert.notEqual(mode,previous);seen.add(mode);previous=mode;
}
assert.equal(seen.size,7);
console.log('PASS reload selection: no consecutive repeats, all seven reachable');
