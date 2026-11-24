/* TASTE: seven evolving word systems. Independent random state keeps foreground timing intact. */
(function (root) {
  'use strict';
  const MODES = ['redaction', 'mosaic', 'vortex', 'receipts', 'swarm', 'automata', 'rain'];
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
      const requested = options.mode || params.get('background');
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
      this.time = 0; this.lastPaint = null;
      this.speed = this.range(0.65, 1.3);
      this.phase = this.range(0, TAU);
      this.spacing = this.range(12, 20);
      this.focusX = this.range(340, 620);
      this.frequency = this.range(0.006, 0.015);
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
            this.items.push({x, y, width, word, phase: this.range(0, TAU), row});
            x += width;
          }
        }
      } else if (this.mode === 'mosaic') {
        this.message = this.pick(PHRASES) + ' / ' + this.pick(PHRASES) + ' / ';
        this.tile = Math.floor(this.range(11, 17));
      } else if (this.mode === 'vortex') {
        for (let i = 0; i < 1500; i++) this.items.push({angle: this.range(0, TAU), y: this.range(-1.5, 1.5), radius: this.range(0.82, 1.18), lane: this.random() < 0.5 ? -1 : 1, word: this.pick(WORDS)});
      } else if (this.mode === 'receipts') {
        for (let x = -40; x < W; x += this.range(95, 170)) {
          this.items.push({x, width: this.range(80, 145), offset: this.range(0, H), speed: this.range(15, 40), phase: this.range(0, TAU), phrase: this.pick(PHRASES)});
        }
      } else if (this.mode === 'swarm') {
        for (let i = 0; i < 560; i++) this.items.push({x: this.range(0, W), y: this.range(0, H), life: this.range(0, 12), word: this.pick(WORDS), speed: this.range(10, 32)});
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
      if (this.lastPaint === null || now - this.lastPaint >= 1000 / 30) {
        const dt = this.lastPaint === null ? 1 / 30 : Math.min(0.1, (now - this.lastPaint) / 1000);
        this.time += dt * this.speed;
        this.lastPaint = now;
        const c = this.ctx;
        c.globalAlpha = 1; c.fillStyle = '#0019ff';
        if (this.mode === 'swarm') c.globalAlpha = 0.23;
        c.fillRect(0, 0, W, H); c.globalAlpha = 1;
        c.textBaseline = 'top'; c.font = '10px monospace';
        this[this.mode](dt * this.speed);
        c.globalAlpha = 1;
      }
      target.save(); target.imageSmoothingEnabled = false;
      target.drawImage(this.canvas, 0, 0, width, height); target.restore();
    }
    redaction() {
      const c = this.ctx, t = this.time;
      for (const [i, item] of this.items.entries()) {
        const reveal = Math.sin(item.x * this.frequency + item.y * 0.021 + t * 0.8 + this.phase) + Math.sin(item.phase + t * 1.1);
        if (reveal < -0.4) continue;
        const x = item.x + Math.sin(item.row * 8 + Math.floor(t * 3)) * (reveal > 1 ? 7 : 0);
        const ink = this.hash(i) > 0.93 ? INKS[3 + (i % 2)] : INKS[i % 3];
        c.globalAlpha = 0.35 + Math.max(0, reveal) * 0.2;
        if (reveal > 0.8) {
          c.fillStyle = ink; c.fillRect(x, item.y, item.width - 2, 11);
          c.fillStyle = '#001257';
        } else c.fillStyle = ink;
        c.fillText(item.word, x + 2, item.y + 1);
      }
    }
    mosaic() {
      const c = this.ctx, t = this.time, size = this.tile;
      c.font = `${size - 1}px monospace`;
      for (let row = -1; row < H / size + 1; row++) for (let col = -1; col < W / (size * 0.66) + 1; col++) {
        const x = col * size * 0.66, y = row * size;
        const wave = Math.sin(x * this.frequency + y * 0.019 + t * 0.5 + this.phase) + Math.cos(y * 0.037 - t * 0.7);
        if (wave < 0.1 || this.hash(row * 701 + col) < 0.12) continue;
        const index = row * 137 + col, flash = Math.floor(t * 2 + this.hash(row) * 3);
        const accent = this.hash(index + flash) > 0.94;
        c.globalAlpha = 0.3 + Math.min(1, wave) * 0.28;
        c.fillStyle = accent ? INKS[3 + (col & 1)] : INKS[wrap(index, 3)];
        c.fillRect(x, y, size * 0.66 - 1, size - 1);
        c.fillStyle = '#0019a0';
        c.fillText(this.message[wrap(index + Math.floor(t * 2), this.message.length)], x, y);
      }
    }
    vortex() {
      const c = this.ctx, t = this.time, projected = [];
      for (const p of this.items) {
        const y = wrap(p.y + t * 0.11 + 1.5, 3) - 1.5;
        const a = p.angle + t * 0.35 + y * (1.5 + Math.sin(t * 0.2));
        const radius = (85 + 60 * Math.sin(y * 2 + t * 0.35 + this.phase)) * p.radius;
        const z = Math.cos(a) * radius, scale = 500 / (500 - z);
        projected.push({x: W / 2 + p.lane * (this.focusX * 0.55) + (Math.sin(a) * radius + Math.sin(y * 2 + t * 0.3) * 80) * scale,
          y: H / 2 + y * 220 * scale, z, scale, word: p.word});
      }
      projected.sort((a, b) => a.z - b.z);
      for (const p of projected) {
        c.font = `${Math.max(4, 6 * p.scale)}px monospace`;
        c.globalAlpha = 0.22 + (p.z + 220) / 700;
        c.fillStyle = '#dae6ff'; c.fillText(p.word, p.x, p.y);
      }
    }
    receipts() {
      const c = this.ctx, t = this.time;
      for (const [i, strip] of this.items.entries()) {
        c.save(); c.beginPath(); c.rect(strip.x, 0, strip.width, H); c.clip();
        for (let row = -3; row < 42; row++) {
          const y = wrap(row * 17 + strip.offset + t * strip.speed, H + 48) - 24;
          const tear = Math.sin(y * 0.035 + t + strip.phase);
          if (tear < -0.65) continue;
          const shift = tear > 0.7 ? Math.sin(Math.floor(t * 4) + row) * 25 : 0;
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
    swarm(dt) {
      const c = this.ctx, t = this.time;
      c.font = '7px monospace';
      for (const [i, p] of this.items.entries()) {
        const angle = Math.sin(p.x * this.frequency + t * 0.16) * 2 + Math.cos(p.y * 0.012 - t * 0.22 + this.phase) * 2;
        p.x = wrap(p.x + Math.cos(angle) * p.speed * dt, W);
        p.y = wrap(p.y + Math.sin(angle) * p.speed * dt, H);
        p.life -= dt;
        if (p.life <= 0) { p.x = this.range(0, W); p.y = this.range(0, H); p.life = this.range(6, 14); p.word = this.pick(WORDS); }
        c.globalAlpha = 0.36; c.fillStyle = i % 37 === 0 ? '#d5ff38' : '#cedbff';
        c.fillText(p.word, p.x, p.y);
      }
    }
    automata() {
      const c = this.ctx, t = this.time, generation = Math.floor(t * 7);
      while (this.generation < generation) { this.stepCells(); this.generation++; }
      c.font = '8px monospace';
      for (let row = 0; row < this.history.length; row++) for (let col = 0; col < this.columns; col++) {
        if (!this.history[row][col]) continue;
        const x = col * 10, y = row * 10 + (t * 7 % 1) * 10;
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
          const y = wrap(stream.y + t * stream.speed - k * 8, H + stream.length) - stream.length;
          c.globalAlpha = stream.alpha * (1 - k * 8 / stream.length);
          c.fillStyle = k === 0 ? '#d5ff38' : '#dce3ff';
          const offset = wrap(k * 3 + Math.floor(t * 0.4), stream.word.length);
          c.fillText((stream.word + stream.word).slice(offset, offset + 3), stream.x, y);
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
