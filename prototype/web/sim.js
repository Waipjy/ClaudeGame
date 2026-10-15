// Pour Decisions — falling-sand simulation core (prototype). Pure, deterministic given seed.
// Used by the browser prototype (inlined) and by node for headless balance tests.
(function (root) {
  const W = 80, H = 64;
  const M = { E:0, SAND:1, WATER:2, OIL:3, FIRE:4, LAVA:5, STONE:6, STEAM:7, ACID:8, POWDER:9, ICE:10, GLASS:11, SEED:12, PLANT:13, SMOKE:14, WALL:15, EMBER:16 };
  const KIND = [];   // 0 empty 1 powder 2 liquid 3 gas 4 solid
  const DEN = [];
  function def(id, kind, den) { KIND[id] = kind; DEN[id] = den; }
  def(M.E,0,0); def(M.SAND,1,6); def(M.WATER,2,3); def(M.OIL,2,2); def(M.FIRE,3,0.2);
  def(M.LAVA,2,5); def(M.STONE,4,9); def(M.STEAM,3,0.1); def(M.ACID,2,3.5); def(M.POWDER,1,5.5);
  def(M.ICE,1,4); def(M.GLASS,4,9); def(M.SEED,1,5); def(M.PLANT,4,9); def(M.SMOKE,3,0.05); def(M.WALL,4,99); def(M.EMBER,1,1);

  // reaction types: id -> base points
  const RX = {
    burn:     { pts: 2 },  // 燃燒
    quench:   { pts: 3 },  // 淬熄
    solidify: { pts: 8 },  // 凝岩
    dissolve: { pts: 3 },  // 溶蝕
    blast:    { pts: 12 }, // 爆炸
    vitrify:  { pts: 6 },  // 熔玻
    melt:     { pts: 3 },  // 融冰
    freeze:   { pts: 2 },  // 結凍
    bloom:    { pts: 3 },  // 萌芽
    condense: { pts: 1 },  // 凝結
    boil:     { pts: 2 },  // 沸騰
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function createSim(seed, mods) {
    const N = W * H;
    const t = new Uint8Array(N), life = new Uint8Array(N), shade = new Uint8Array(N),
          stamp = new Uint16Array(N), flash = new Uint8Array(N);
    const rnd = mulberry32(seed >>> 0);
    const S = { W, H, t, life, shade, flash, frame: 0, activity: 0, counts: {}, mods: mods || {}, onEvent: null };

    function reset() {
      t.fill(0); life.fill(0); flash.fill(0);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x;
        if (x === 0 || x === W - 1 || y === H - 1) t[p] = M.WALL;
        shade[p] = (rnd() * 255) | 0;
      }
      S.counts = {};
    }
    S.reset = reset;
    S.resetCounts = () => { S.counts = {}; };

    function emit(type, p) {
      S.lastEventFrame = S.frame;
      S.counts[type] = (S.counts[type] || 0) + 1;
      flash[p] = 255;
      if (S.onEvent) S.onEvent(type, p);
    }
    function set(p, m, l) { t[p] = m; life[p] = l || 0; stamp[p] = S.frame & 0xffff; S.activity++; }
    function swap(p, q) {
      const a = t[p]; t[p] = t[q]; t[q] = a;
      const b = life[p]; life[p] = life[q]; life[q] = b;
      const c = shade[p]; shade[p] = shade[q]; shade[q] = c;
      stamp[q] = S.frame & 0xffff; stamp[p] = S.frame & 0xffff;
      S.activity++;
    }
    function gasLife(m) {
      if (m === M.FIRE) return 12 + ((rnd() * 18) | 0);
      if (m === M.STEAM) return 60 + ((rnd() * 80) | 0);
      if (m === M.SMOKE) return 40 + ((rnd() * 40) | 0);
      return 0;
    }

    function explode(cx, cy) {
      const r = 4 + (S.mods.demolition ? 2 : 0);
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 1 || x >= W - 1 || y < 0 || y >= H - 1) continue;
        const q = y * W + x, m = t[q];
        if (m === M.WALL) continue;
        if (m === M.WATER) { set(q, M.STEAM, gasLife(M.STEAM)); continue; }
        if (dx * dx + dy * dy <= 4 || m === M.POWDER || m === M.OIL || m === M.PLANT || m === M.SEED || m === M.E)
          set(q, M.FIRE, gasLife(M.FIRE));
        else if ((m === M.STONE || m === M.GLASS || m === M.ICE) && rnd() < 0.5) set(q, M.E);
      }
      emit('blast', cy * W + cx);
    }

    // returns true if cell p was consumed/changed (skip movement)
    function react(x, y, p, c) {
      const nb = [p - W, p + W, p - 1, p + 1];
      if (c === M.EMBER) {
        if (life[p] > 0) life[p]--;
        if (life[p] === 0) { set(p, M.FIRE, gasLife(M.FIRE)); return true; }
      }
      if (c === M.FIRE || c === M.EMBER) {
        for (let i = 0; i < 4; i++) {
          const q = nb[i], m = t[q];
          if (m === M.OIL) { set(q, M.FIRE, 30 + ((rnd() * 30) | 0)); emit('burn', q); }
          else if (m === M.PLANT || (m === M.SEED && rnd() < 0.5)) { set(q, M.FIRE, 25 + ((rnd() * 20) | 0)); emit('burn', q); }
          else if (m === M.POWDER) { explode(q % W, (q / W) | 0); return true; }
          else if (m === M.ICE && rnd() < 0.15) { set(q, M.WATER); emit('melt', q); }
          else if (m === M.WATER) { set(q, M.STEAM, gasLife(M.STEAM)); set(p, M.STEAM, gasLife(M.STEAM)); emit('quench', q); return true; }
        }
        return c === M.FIRE ? false : false;
      }
      if (c === M.LAVA) {
        for (let i = 0; i < 4; i++) {
          const q = nb[i], m = t[q];
          if (m === M.WATER) { set(p, M.STONE); set(q, M.STEAM, gasLife(M.STEAM)); emit('solidify', p); return true; }
          if (m === M.ICE && rnd() < 0.3) { set(q, M.WATER); emit('melt', q); if (rnd() < 0.15) { set(p, M.STONE); emit('solidify', p); return true; } }
          else if (m === M.SAND && rnd() < 0.04) { set(q, M.GLASS); emit('vitrify', q); }
          else if (m === M.OIL || m === M.PLANT || m === M.SEED) { set(q, M.FIRE, gasLife(M.FIRE) + 20); emit('burn', q); }
          else if (m === M.POWDER) { explode(q % W, (q / W) | 0); }
          else if (m === M.E && i === 0 && rnd() < 0.004) { set(q, M.FIRE, gasLife(M.FIRE)); }
        }
        return false;
      }
      if (c === M.ACID) {
        for (let i = 0; i < 4; i++) {
          const q = nb[i], m = t[q];
          if ((m === M.SAND || m === M.STONE || m === M.GLASS || m === M.ICE || m === M.PLANT || m === M.SEED || m === M.POWDER) && rnd() < 0.2) {
            set(q, rnd() < 0.3 ? M.SMOKE : M.E, gasLife(M.SMOKE)); emit('dissolve', q);
            if (!(S.mods.alkahest && rnd() < 0.7) && rnd() < 0.5) { set(p, M.E); return true; }
          }
        }
        return false;
      }
      if (c === M.WATER) {
        if (S.mods.hotplate && y === H - 2 && rnd() < 0.03) { set(p, M.STEAM, gasLife(M.STEAM)); emit('boil', p); return true; }
        for (let i = 0; i < 4; i++) {
          const q = nb[i], m = t[q];
          if (m === M.ICE && rnd() < (S.mods.freezer ? 0.03 : 0.003)) { set(p, M.ICE); emit('freeze', p); return true; }
          if (m === M.SEED) { set(q, M.PLANT); emit('bloom', q); if (rnd() < 0.5) { set(p, M.E); return true; } }
          if (m === M.PLANT && rnd() < (S.mods.greenhouse ? 0.06 : 0.02)) { set(p, M.PLANT); emit('bloom', p); return true; }
        }
        return false;
      }
      if (c === M.ICE && S.mods.hotplate && y === H - 2 && rnd() < 0.02) { set(p, M.WATER); emit('melt', p); return true; }
      return false;
    }

    function canDisplace(c, m) {
      if (m === M.E) return true;
      const k = KIND[m];
      if (k === 2 || k === 3) return DEN[m] < DEN[c];
      return false;
    }

    function update(x, y, p, c) {
      if (react(x, y, p, c)) return;
      const k = KIND[c];
      if (k === 1) { // powder
        const b = p + W;
        if (canDisplace(c, t[b])) { swap(p, b); return; }
        const d = rnd() < 0.5 ? -1 : 1;
        if (canDisplace(c, t[b + d])) { swap(p, b + d); return; }
        if (canDisplace(c, t[b - d])) { swap(p, b - d); return; }
      } else if (k === 2) { // liquid
        if (c === M.LAVA && rnd() < 0.5) return;
        const b = p + W;
        if (canDisplace(c, t[b])) { swap(p, b); return; }
        const d = rnd() < 0.5 ? -1 : 1;
        if (canDisplace(c, t[b + d])) { swap(p, b + d); return; }
        if (canDisplace(c, t[b - d])) { swap(p, b - d); return; }
        if (c === M.LAVA && rnd() < 0.6) return;
        const disp = c === M.LAVA ? 1 : 3;
        for (const dd of [d, -d]) {
          let q = p;
          for (let s = 1; s <= disp; s++) {
            const n = p + dd * s;
            if (canDisplace(c, t[n])) q = n; else break;
          }
          if (q !== p) { swap(p, q); return; }
        }
      } else if (k === 3) { // gas
        if (life[p] > 0) life[p]--;
        if (life[p] === 0) {
          if (c === M.STEAM && rnd() < 0.35) { set(p, M.WATER); emit('condense', p); }
          else if (c === M.FIRE && rnd() < 0.3) set(p, M.SMOKE, gasLife(M.SMOKE));
          else set(p, M.E);
          return;
        }
        if (c === M.FIRE && rnd() < 0.45) return;
        if (y <= 1) { if (rnd() < 0.5) set(p, M.E); return; }
        const u = p - W;
        const gasOk = (m) => m === M.E || (KIND[m] === 3 && DEN[m] > DEN[c]);
        if (gasOk(t[u]) && rnd() < 0.85) { swap(p, u); return; }
        const d = rnd() < 0.5 ? -1 : 1;
        if (gasOk(t[u + d])) { swap(p, u + d); return; }
        if (gasOk(t[p + d])) { swap(p, p + d); return; }
      }
    }

    S.step = function () {
      S.frame++;
      const fs = S.frame & 0xffff;
      S.activity = 0;
      for (let p = 0; p < N; p++) if (flash[p]) flash[p] = flash[p] > 40 ? flash[p] - 40 : 0;
      for (let y = H - 2; y >= 0; y--) {
        const ltr = (S.frame + y) & 1;
        for (let i = 1; i < W - 1; i++) {
          const x = ltr ? i : W - 1 - i;
          const p = y * W + x, c = t[p];
          if (c === M.E || c === M.WALL || c === M.STONE || c === M.GLASS || c === M.PLANT) {
            continue;
          }
          if (stamp[p] === fs) continue;
          update(x, y, p, c);
        }
      }
    };

    // pour `n` cells of material m around column x (called once per frame while pouring)
    S.pour = function (m, x, n) {
      let placed = 0;
      for (let i = 0; i < n * 3 && placed < n; i++) {
        const px = Math.max(1, Math.min(W - 2, x + Math.round((rnd() - 0.5) * 5)));
        const py = (rnd() * 3) | 0;
        const p = py * W + px;
        if (t[p] === M.E || KIND[t[p]] === 3) { set(p, m, m === M.EMBER ? 70 + ((rnd() * 60) | 0) : 0); placed++; }
      }
      return placed;
    };
    S.rnd = rnd;
    reset();
    return S;
  }

  const api = { W, H, M, KIND, RX, createSim, mulberry32 };
  if (typeof module !== 'undefined') module.exports = api; else root.PDSim = api;
})(this);
