/* TASTE: seven evolving word systems. Independent random state keeps foreground timing intact. */
(function (root) {
  'use strict';
  const MODES = ['redaction', 'mosaic', 'shards', 'receipts', 'scatter', 'automata', 'rain'];
  const WORDS = ['WANT', 'NEED', 'MORE', 'OWNED', 'DESIRE', 'BUY', 'REPEAT', 'IDENTITY', 'CONSUME', 'REPAIR', 'REPLACE', 'ENOUGH?', 'SELF', 'WASTE', 'TASTE'];
  const PHRASES = ['YOU ARE WHAT YOU CONSUME', 'THE THINGS YOU OWN END UP OWNING YOU', 'WANT IS NOT NEED', 'SATISFACTION EXPIRED', 'ADD TO CART / REMOVE YOURSELF', 'WHO AM I WITHOUT IT?', 'DESIRE IS A LOOP', 'REPAIR > REPLACE', 'NEW LOOK / SAME HUNGER'];
  const INKS = ['#dce3ff', '#7daaff', '#aec3ff', '#d5ff38', '#ff567e'];
  const W = 960, H = 540, TAU = Math.PI * 2;
  const wrap = (n, m) => ((n % m) + m) % m;
  function randomSource(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6D2B79F5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  function chooseMode(random, previous, requested) {
    if (MODES.includes(requested)) return requested;
    const choices = MODES.filter(mode => mode !== previous);
    return choices[Math.floor(random() * choices.length)];
  }
  class TasteBackground {
    constructor(options = {}) {
      const params = new URLSearchParams(root.location ? root.location.search : '');
      const inputMode = options.mode || params.get('background');
      const requested = ({vortex: 'shards', swarm: 'scatter'})[inputMode] || inputMode;
      const querySeed = params.get('seed');
      const freshSeed = () => root.crypto.getRandomValues(new Uint32Array(1))[0];
      this.seed = options.seed ?? (querySeed !== null && /^\d{1,10}$/.test(querySeed) ? Number(querySeed) >>> 0 : freshSeed());
      this.random = randomSource(this.seed);
      let previous;
      try { previous = root.sessionStorage.getItem('taste-background'); } catch (_) { /* Private browsing can disable storage. */ }
      this.mode = chooseMode(this.random, previous, requested);
      try { root.sessionStorage.setItem('taste-background', this.mode); } catch (_) { /* Random selection still works. */ }
      this.canvas = document.createElement('canvas');
      this.canvas.width = W; this.canvas.height = H;
      this.ctx = this.canvas.getContext('2d');
      this.time = 0; this.lastPaint = null; this.nextJump = 0; this.beat = -1;
      this.sliceCanvas = document.createElement('canvas');
      this.sliceCanvas.width = W; this.sliceCanvas.height = H;
      this.sliceContext = this.sliceCanvas.getContext('2d');
      this.speed = this.range(0.65, 1.3);
      this.spacing = this.range(12, 20);
      this.items = [];
      this.initialize();
    }
    range(a, b) { return a + this.random() * (b - a); }
    pick(list) { return list[Math.floor(this.random() * list.length)]; }
    hash(n) {
      let h = Math.imul((n | 0) ^ this.seed, 1597334677);
      h = Math.imul(h ^ h >>> 16, 2246822507);
      return ((h ^ h >>> 13) >>> 0) / 4294967296;
    }
    initialize() {
      if (this.mode === 'redaction') {
        for (let y = -16, row = 0; y < H + 30; y += this.spacing, row++) {
          let x = this.range(-90, 0);
          while (x < W) {
            const word = this.pick(WORDS), width = word.length * 6 + 8;
            this.items.push({x, y, width, word, row});
            x += width;
          }
        }
      } else if (this.mode === 'mosaic') {
        this.message = this.pick(PHRASES) + ' / ' + this.pick(PHRASES) + ' / ';
        this.tile = Math.floor(this.range(11, 17));
      } else if (this.mode === 'shards') {
        for (let i = 0; i < 32; i++) this.items.push({width: this.range(90, 230), rows: Math.floor(this.range(3, 10)), phrase: this.pick(PHRASES)});
      } else if (this.mode === 'receipts') {
        for (let x = -40; x < W; x += this.range(95, 170)) {
          this.items.push({x, width: this.range(80, 145), offset: this.range(0, H), phase: this.range(0, TAU), phrase: this.pick(PHRASES)});
        }
      } else if (this.mode === 'scatter') {
        for (let i = 0; i < 480; i++) this.items.push({x: this.range(0, W), y: this.range(0, H), word: this.pick(WORDS)});
      } else if (this.mode === 'automata') {
        this.columns = 96; this.rows = 54; this.generation = -1;
        this.rule = this.pick([30, 90, 110, 150]);
        this.cells = Array.from({length: this.columns}, () => this.random() < 0.25 ? 1 : 0);
        this.history = [];
        for (let i = 0; i < this.rows; i++) this.stepCells();
      } else {
        for (let i = 0; i < 125; i++) this.items.push({x: this.range(0, W), y: this.range(0, H), speed: this.range(18, 65), length: this.range(90, 300), word: this.pick(PHRASES), alpha: this.range(0.25, 0.7)});
      }
    }
    stepCells() {
      const cells = this.cells, n = cells.length;
      this.cells = cells.map((cell, i) => (this.rule >> (cells[(i + n - 1) % n] * 4 + cell * 2 + cells[(i + 1) % n])) & 1);
      // A new desire enters the system; patterns keep evolving instead of settling empty.
      if (this.random() < 0.28) this.cells[Math.floor(this.random() * n)] ^= 1;
      this.history.unshift(this.cells);
      this.history.length = Math.min(this.rows, this.history.length);
    }
    draw(target, width, height, now) {
      // Cache an exact frame, then cut to the next one. No interpolation or trails.
      if (this.lastPaint === null || now >= this.nextJump) {
        this.beat++;
        this.time = this.beat * 0.31;
        this.lastPaint = now;
        const hold = this.beat % 11 === 7 ? 165 : 48 + this.hash(this.beat * 971) * 62;
        this.nextJump = now + hold / this.speed;
        const c = this.ctx;
        c.globalAlpha = 1; c.fillStyle = '#0019ff';
        c.fillRect(0, 0, W, H);
        c.textBaseline = 'top'; c.font = '10px monospace';
        this[this.mode]();
        c.globalAlpha = 1;
        this.cutStrips();
      }
      target.save(); target.imageSmoothingEnabled = false;
      target.drawImage(this.canvas, 0, 0, width, height); target.restore();
    }
    cutStrips() {
      // Copy from the current frame only: displaced strips never leave a ghost.
      const c = this.ctx, tick = this.beat * 2017;
      this.sliceContext.drawImage(this.canvas, 0, 0);
      for (let i = 0; i < 5; i++) {
        const y = Math.floor(this.hash(tick + i * 7) * (H - 28));
        const height = 3 + Math.floor(this.hash(tick + i * 7 + 1) * 22);
        const shift = Math.round((this.hash(tick + i * 7 + 2) - 0.5) * 360);
        c.fillStyle = '#0019ff'; c.fillRect(0, y, W, height);
        c.drawImage(this.sliceCanvas, 0, y, W, height, shift, y, W, height);
      }
    }
    redaction() {
      const c = this.ctx, beat = this.beat;
      const sparse = Math.floor(beat / 6) % 3 === 1;
      for (const [i, item] of this.items.entries()) {
        const group = Math.floor(item.x / 140) + Math.floor(item.y / 55) * 11;
        const state = this.hash(group * 379 + beat * 151);
        if (state < (sparse ? 0.65 : 0.18) || this.hash(i + beat * 109) < 0.14) continue;
        const x = Math.round(item.x + (this.hash(item.row * 37 + beat * 71) - 0.5) * 105);
        const y = Math.round(item.y);
        const ink = this.hash(i + beat * 29) > 0.94 ? INKS[3 + (i % 2)] : INKS[i % 3];
        c.globalAlpha = state > 0.65 ? 0.8 : 0.5;
        if (state > 0.5) {
          c.fillStyle = ink; c.fillRect(x, y, item.width - 2, 11);
          c.fillStyle = '#001257';
        } else c.fillStyle = ink;
        c.fillText(item.word, x + 2, y + 1);
      }
    }
    mosaic() {
      const c = this.ctx, beat = this.beat;
      const size = this.tile + (Math.floor(beat / 5) % 3 === 0 ? 3 : 0);
      const dense = Math.floor(beat / 5) % 3 === 0;
      c.font = `${size - 1}px monospace`;
      for (let row = 0; row < H / size; row++) for (let col = -12; col < W / (size * 0.66) + 12; col++) {
        const group = Math.floor(col / 9) + Math.floor(row / 4) * 97;
        const block = this.hash(group * 337 + beat * 139);
        if (block < (dense ? 0.15 : 0.56) || this.hash(row * 701 + col + beat * 17) < 0.08) continue;
        const shift = Math.round((this.hash(row * 59 + beat * 103) - 0.5) * 18) * size * 0.66;
        const x = Math.round(col * size * 0.66 + shift), y = row * size;
        const index = row * 137 + col, accent = this.hash(group + beat * 41) > 0.92;
        c.globalAlpha = block > 0.8 ? 0.8 : 0.55;
        c.fillStyle = accent ? INKS[3 + (col & 1)] : INKS[wrap(index, 3)];
        c.fillRect(x, y, size * 0.66 - 1, size - 1);
        c.fillStyle = '#00127c';
        c.fillText(this.message[wrap(index + beat * 13, this.message.length)], x, y);
      }
    }
    shards() {
      const c = this.ctx, beat = this.beat;
      c.font = '9px monospace';
      // Flat paragraph fragments snap to a new broken grid, never a 3D spiral.
      for (const [i, fragment] of this.items.entries()) {
        const key = i * 977 + beat * 211;
        if (this.hash(key) < 0.2) continue;
        const x = Math.floor(this.hash(key + 1) * W / 24) * 24 - 48;
        const y = Math.floor(this.hash(key + 2) * H / 12) * 12;
        c.save(); c.beginPath(); c.rect(x, y, fragment.width, fragment.rows * 11); c.clip();
        for (let row = 0; row < fragment.rows; row++) {
          c.globalAlpha = 0.55 + this.hash(key + row + 3) * 0.3;
          c.fillStyle = row === 0 && i % 7 === 0 ? '#d5ff38' : '#dce3ff';
          const shift = this.hash(key + row * 17) > 0.7 ? 36 : 0;
          c.fillText(fragment.phrase + ' / ' + fragment.phrase, x - shift, y + row * 11);
        }
        c.restore();
      }
    }
    receipts() {
      const c = this.ctx, t = this.time;
      for (const [i, strip] of this.items.entries()) {
        c.save(); c.beginPath(); c.rect(strip.x, 0, strip.width, H); c.clip();
        for (let row = -3; row < 42; row++) {
          const y = Math.round(wrap(row * 17 + strip.offset + this.beat * 34, H + 48) - 24);
          const tear = Math.sin(y * 0.035 + t + strip.phase);
          if (tear < -0.65) continue;
          const shift = Math.round((this.hash(i * 311 + row + this.beat * 67) - 0.5) * 90);
          c.globalAlpha = 0.28 + (tear + 1) * 0.15;
          c.fillStyle = row % 9 === 0 ? '#d5ff38' : '#bfd1ff';
          c.fillRect(strip.x + shift, y, strip.width - 3, 14);
          c.fillStyle = '#00149f'; c.font = '9px monospace';
          const text = row % 9 === 0 ? `TOTAL: ${String(Math.floor(t) + i * 73).padStart(5, '0')}` : strip.phrase;
          c.fillText(text, strip.x + shift + 3, y + 2);
        }
        c.restore();
      }
    }
    scatter() {
      const c = this.ctx, beat = this.beat;
      c.font = '8px monospace';
      for (const [i, p] of this.items.entries()) {
        const key = i * 131 + beat * 997;
        if (this.hash(key) < 0.24) continue;
        const x = Math.round(wrap(p.x + (this.hash(key + 1) - 0.5) * 270, W));
        const y = Math.round(wrap(p.y + (this.hash(key + 2) - 0.5) * 130, H));
        c.globalAlpha = i % 3 === 0 ? 0.85 : 0.55;
        c.fillStyle = i % 37 === 0 ? '#d5ff38' : '#dce3ff';
        c.fillText(beat % 4 === 0 ? WORDS[(i + beat) % WORDS.length] : p.word, x, y);
      }
    }
    automata() {
      const c = this.ctx, generation = this.beat * 3;
      while (this.generation < generation) { this.stepCells(); this.generation++; }
      c.font = '8px monospace';
      for (let row = 0; row < this.history.length; row++) for (let col = 0; col < this.columns; col++) {
        if (!this.history[row][col]) continue;
        const x = col * 10, y = row * 10;
        c.globalAlpha = 0.2 + (1 - row / this.rows) * 0.4;
        c.fillStyle = row % 17 === 0 ? '#d5ff38' : '#bfccff';
        if ((col + row) % 5 === 0) c.fillRect(x, y, 8, 8);
        else c.fillText('WANTMORE'[(row + col) % 8], x, y);
      }
    }
    rain() {
      const c = this.ctx, t = this.time;
      c.font = '6px monospace';
      for (const stream of this.items) {
        for (let k = 0; k < stream.length / 8; k++) {
          const y = Math.round(wrap(stream.y + this.beat * stream.speed * 0.8 - k * 8, H + stream.length) - stream.length);
          c.globalAlpha = stream.alpha * (1 - k * 8 / stream.length);
          c.fillStyle = k === 0 ? '#d5ff38' : '#dce3ff';
          const offset = wrap(k * 3 + Math.floor(t * 0.4), stream.word.length);
          c.fillText((stream.word + stream.word).slice(offset, offset + 3), Math.round(stream.x + (this.hash(Math.floor(stream.x) + this.beat * 17) - 0.5) * 45), y);
        }
      }
    }
  }
  TasteBackground.MODES = MODES;
  TasteBackground.randomSource = randomSource;
  TasteBackground.chooseMode = chooseMode;
  root.TasteBackground = TasteBackground;
  if (typeof module !== 'undefined') module.exports = TasteBackground;
})(globalThis);
