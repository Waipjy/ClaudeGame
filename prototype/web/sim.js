// Pour Decisions《爆鍋煉金》— falling-sand simulation core + round rules (prototype v0.2).
// Pure and deterministic given seed + inputs. Used by the browser prototype (inlined) and by node (tests / bots).
(function (root) {
  const W = 100, H = 150;
  const M = { E:0, SAND:1, WATER:2, OIL:3, FIRE:4, LAVA:5, STONE:6, STEAM:7, ACID:8, POWDER:9, ICE:10, GLASS:11,
              SEED:12, PLANT:13, SMOKE:14, WALL:15, EMBER:16, MUD:17, SULFUR:18, FUME:19 };
  const KIND = [], DEN = [];  // kind: 0 empty 1 powder 2 liquid 3 gas 4 solid
  function def(id, kind, den) { KIND[id] = kind; DEN[id] = den; }
  def(M.E,0,0); def(M.SAND,1,6); def(M.WATER,2,3); def(M.OIL,2,2); def(M.FIRE,3,0.2);
  def(M.LAVA,2,5); def(M.STONE,4,9); def(M.STEAM,3,0.1); def(M.ACID,2,3.5); def(M.POWDER,1,5.5);
  def(M.ICE,1,4); def(M.GLASS,4,9); def(M.SEED,1,5); def(M.PLANT,4,9); def(M.SMOKE,3,0.05); def(M.WALL,4,99);
  def(M.EMBER,1,1); def(M.MUD,1,7); def(M.SULFUR,1,2.5); def(M.FUME,3,0.08);

  // Elements: 0 fire 1 water 2 earth 3 air
  const EL = ["fire", "water", "earth", "air"];
  // reaction types — pts = base 物質 per event, el = elements lit (GDD §4)
  const RX = {
    burn:      { pts: 2,  el: [0] },     // 燃燒
    blueflame: { pts: 3,  el: [0] },     // 藍焰（硫磺）
    blast:     { pts: 12, el: [0, 3] },  // 爆炸
    quench:    { pts: 3,  el: [1, 3] },  // 淬熄
    condense:  { pts: 1,  el: [1] },     // 凝結
    melt:      { pts: 3,  el: [1] },     // 融冰
    freeze:    { pts: 2,  el: [1] },     // 結凍
    acidrain:  { pts: 2,  el: [1] },     // 酸雨（硫煙＋水/蒸氣）
    solidify:  { pts: 8,  el: [2] },     // 凝岩
    vitrify:   { pts: 6,  el: [2] },     // 熔玻
    dissolve:  { pts: 3,  el: [2] },     // 溶蝕
    bake:      { pts: 4,  el: [2] },     // 燒陶（泥＋熔岩）
    bloom:     { pts: 3,  el: [2] },     // 萌芽
    boil:      { pts: 2,  el: [3] },     // 沸騰
    fume:      { pts: 1,  el: [3] },     // 硫煙
    lidpop:    { pts: 30, el: [3] },     // 爆蓋
  };
  const RXK = Object.keys(RX);            // index+1 is stored per cell as "produced by"
  const RXI = {}; RXK.forEach((k, i) => RXI[k] = i + 1);

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const MUD_ROWS = 8;

  function createSim(seed, mods) {
    const N = W * H;
    const t = new Uint8Array(N), life = new Uint8Array(N), shade = new Uint8Array(N),
          stamp = new Uint16Array(N), flash = new Uint8Array(N),
          src = new Uint8Array(N), gen = new Uint8Array(N), rk = new Uint8Array(N);
    const rnd = mulberry32(seed >>> 0);
    const S = { W, H, t, life, shade, flash, src, gen, rk, frame: 0, gas: 0, lid: false, lidMax: 800,
                mods: mods || {}, onEvent: null, onLidPop: null, lastEventFrame: 0 };

    function reset() {
      t.fill(0); life.fill(0); flash.fill(0); src.fill(0); gen.fill(0); rk.fill(0);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x;
        if (x === 0 || x === W - 1 || y === H - 1) t[p] = M.WALL;
        else if (y >= H - 1 - MUD_ROWS) t[p] = M.MUD;
        shade[p] = (rnd() * 255) | 0;
      }
    }
    S.reset = reset;

    // ---- attribution context (GDD §3.2) ----
    let cS = 0, cG = 0, cK = 0;
    function ev(type, p, q) {
      const sp = src[p], sq = q >= 0 ? src[q] : sp;
      const s = sp > sq ? sp : sq;
      const other = sp > sq ? sq : sp;
      const k = RXI[type];
      let g = rk[p] ? gen[p] + (rk[p] !== k ? 1 : 0) : 0;
      if (q >= 0) { const g2 = rk[q] ? gen[q] + (rk[q] !== k ? 1 : 0) : 0; if (g2 > g) g = g2; }
      if (g < 1) g = 1; if (g > 7) g = 7;
      cS = s; cG = g; cK = k;
      const stale = q >= 0 && other > 0 && s - other >= 2 ? 1 : 0;
      S.lastEventFrame = S.frame;
      flash[p] = 255;
      if (S.onEvent) S.onEvent(type, q >= 0 ? q : p, s, g, stale);
    }
    function setP(p, m, l) { t[p] = m; life[p] = l || 0; src[p] = cS; gen[p] = cG; rk[p] = cK; stamp[p] = S.frame & 0xffff; }
    function swap(p, q) {
      let a = t[p]; t[p] = t[q]; t[q] = a;
      a = life[p]; life[p] = life[q]; life[q] = a;
      a = shade[p]; shade[p] = shade[q]; shade[q] = a;
      a = src[p]; src[p] = src[q]; src[q] = a;
      a = gen[p]; gen[p] = gen[q]; gen[q] = a;
      a = rk[p]; rk[p] = rk[q]; rk[q] = a;
      stamp[q] = S.frame & 0xffff; stamp[p] = S.frame & 0xffff;
    }
    function clearCell(p) { t[p] = M.E; life[p] = 0; src[p] = 0; gen[p] = 0; rk[p] = 0; }
    function gasLife(m) {
      if (m === M.FIRE) return 12 + ((rnd() * 18) | 0);
      if (m === M.STEAM) return 90 + ((rnd() * 90) | 0);
      if (m === M.SMOKE) return 50 + ((rnd() * 50) | 0);
      if (m === M.FUME) return 110 + ((rnd() * 80) | 0);
      return 0;
    }

    function explode(cx, cy, r0) {
      const r = (r0 || 7) + (S.mods.demolition ? 3 : 0);
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 > r * r) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 1 || x >= W - 1 || y < 0 || y >= H - 1) continue;
        const q = y * W + x, m = t[q];
        if (m === M.WALL) continue;
        if (m === M.WATER) { setP(q, M.STEAM, gasLife(M.STEAM)); continue; }
        if (d2 <= 9 || m === M.POWDER || m === M.OIL || m === M.PLANT || m === M.SEED || m === M.SULFUR || m === M.E || KIND[m] === 3)
          setP(q, M.FIRE, gasLife(M.FIRE));
        else if ((m === M.STONE || m === M.GLASS || m === M.ICE || m === M.MUD) && rnd() < 0.45) clearCell(q);
      }
    }
    function blastAt(q, p) { ev('blast', p, q); explode(q % W, (q / W) | 0); }

    function igniteSulfur(q, p) { ev('blueflame', p, q); life[q] = 90 + ((rnd() * 60) | 0); src[q] = cS; gen[q] = cG; rk[q] = cK; }

    // returns true if cell p was consumed/changed (skip movement)
    function react(x, y, p, c) {
      const nb0 = p - W, nb1 = p + W, nb2 = p - 1, nb3 = p + 1;
      if (c === M.EMBER) {
        if (life[p] > 0) life[p]--;
        if (life[p] === 0) { t[p] = M.FIRE; life[p] = gasLife(M.FIRE); return true; }
      }
      if (c === M.FIRE || c === M.EMBER) {
        for (let i = 0; i < 4; i++) {
          const q = i === 0 ? nb0 : i === 1 ? nb1 : i === 2 ? nb2 : nb3, m = t[q];
          if (m === M.OIL) { ev('burn', p, q); setP(q, M.FIRE, 30 + ((rnd() * 30) | 0)); }
          else if (m === M.PLANT || (m === M.SEED && rnd() < 0.5)) { ev('burn', p, q); setP(q, M.FIRE, 25 + ((rnd() * 20) | 0)); }
          else if (m === M.SULFUR && life[q] === 0 && rnd() < 0.5) igniteSulfur(q, p);
          else if (m === M.POWDER) { blastAt(q, p); return true; }
          else if (m === M.ICE && rnd() < 0.15) { ev('melt', p, q); setP(q, M.WATER); }
          else if (m === M.WATER) { ev('quench', p, q); setP(q, M.STEAM, gasLife(M.STEAM)); setP(p, M.STEAM, gasLife(M.STEAM)); return true; }
        }
        return false;
      }
      if (c === M.SULFUR && life[p] > 0) { // burning sulfur: slow blue flame, gives off fume
        life[p]--;
        for (let i = 0; i < 4; i++) {
          const q = i === 0 ? nb0 : i === 1 ? nb1 : i === 2 ? nb2 : nb3, m = t[q];
          if (m === M.SULFUR && life[q] === 0 && rnd() < 0.06) igniteSulfur(q, p);
          else if (m === M.OIL && rnd() < 0.3) { ev('burn', p, q); setP(q, M.FIRE, 30 + ((rnd() * 30) | 0)); }
          else if (m === M.PLANT && rnd() < 0.2) { ev('burn', p, q); setP(q, M.FIRE, 25 + ((rnd() * 20) | 0)); }
          else if (m === M.POWDER) { blastAt(q, p); return true; }
          else if (m === M.WATER && rnd() < 0.02) { ev('acidrain', p, q); setP(q, M.ACID); }
        }
        if (t[nb0] === M.E && rnd() < 0.05) { ev('fume', p, -1); setP(nb0, M.FUME, gasLife(M.FUME)); }
        if (life[p] === 0) { clearCell(p); if (rnd() < 0.5) { t[p] = M.SMOKE; life[p] = gasLife(M.SMOKE); } return true; }
        return false;
      }
      if (c === M.FUME) {
        for (let i = 0; i < 4; i++) {
          const q = i === 0 ? nb0 : i === 1 ? nb1 : i === 2 ? nb2 : nb3, m = t[q];
          if ((m === M.WATER && rnd() < 0.15) || (m === M.STEAM && rnd() < 0.15)) {
            ev('acidrain', p, q); setP(q, M.ACID); clearCell(p); return true;
          }
        }
        return false;
      }
      if (c === M.LAVA) {
        for (let i = 0; i < 4; i++) {
          const q = i === 0 ? nb0 : i === 1 ? nb1 : i === 2 ? nb2 : nb3, m = t[q];
          if (m === M.WATER) { ev('solidify', p, q); setP(p, M.STONE); setP(q, M.STEAM, gasLife(M.STEAM)); return true; }
          if (m === M.ICE && rnd() < 0.3) { ev('melt', p, q); setP(q, M.WATER); if (rnd() < 0.15) { ev('solidify', p, q); setP(p, M.STONE); return true; } }
          else if (m === M.SAND && rnd() < 0.04) { ev('vitrify', p, q); setP(q, M.GLASS); }
          else if (m === M.MUD && rnd() < 0.03) { ev('bake', p, q); setP(q, M.STONE); }
          else if (m === M.OIL || m === M.PLANT || m === M.SEED) { ev('burn', p, q); setP(q, M.FIRE, gasLife(M.FIRE) + 20); }
          else if (m === M.SULFUR && life[q] === 0) igniteSulfur(q, p);
          else if (m === M.POWDER) { blastAt(q, p); }
          else if (m === M.E && i === 0 && rnd() < 0.003) { t[q] = M.FIRE; life[q] = gasLife(M.FIRE); src[q] = src[p]; gen[q] = gen[p]; rk[q] = rk[p]; }
        }
        return false;
      }
      if (c === M.ACID) {
        for (let i = 0; i < 4; i++) {
          const q = i === 0 ? nb0 : i === 1 ? nb1 : i === 2 ? nb2 : nb3, m = t[q];
          if ((m === M.SAND || m === M.STONE || m === M.GLASS || m === M.ICE || m === M.PLANT || m === M.SEED || m === M.POWDER || m === M.MUD) && rnd() < 0.2) {
            ev('dissolve', p, q);
            if (rnd() < 0.3) setP(q, M.SMOKE, gasLife(M.SMOKE)); else clearCell(q);
            if (!(S.mods.alkahest && rnd() < 0.7) && rnd() < 0.5) { clearCell(p); return true; }
          }
        }
        return false;
      }
      if (c === M.WATER) {
        if (S.mods.hotplate && t[p + W] === M.MUD && rnd() < 0.01) { ev('boil', p, -1); setP(p, M.STEAM, gasLife(M.STEAM)); return true; }
        for (let i = 0; i < 4; i++) {
          const q = i === 0 ? nb0 : i === 1 ? nb1 : i === 2 ? nb2 : nb3, m = t[q];
          if (m === M.ICE && rnd() < (S.mods.freezer ? 0.03 : 0.003)) { ev('freeze', q, p); setP(p, M.ICE); return true; }
          if (m === M.SEED) { ev('bloom', p, q); setP(q, M.PLANT); if (rnd() < 0.5) { clearCell(p); return true; } }
          if (m === M.PLANT && rnd() < (S.mods.greenhouse ? 0.06 : 0.02)) { ev('bloom', q, p); setP(p, M.PLANT); return true; }
        }
        return false;
      }
      if (c === M.ICE && S.mods.hotplate && t[p + W] === M.MUD && rnd() < 0.02) { ev('melt', p, -1); setP(p, M.WATER); return true; }
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
        // sulfur floats as a raft: on a liquid surface it creeps sideways instead of piling up
        if (c === M.SULFUR && KIND[t[b]] === 2 && rnd() < 0.6) {
          const s1 = p + d; if (t[s1] === M.E && t[s1 + W] !== M.E) { swap(p, s1); return; }
        }
      } else if (k === 2) { // liquid
        if (c === M.LAVA && rnd() < 0.5) return;
        const b = p + W;
        if (canDisplace(c, t[b])) { swap(p, b); return; }
        const d = rnd() < 0.5 ? -1 : 1;
        if (canDisplace(c, t[b + d])) { swap(p, b + d); return; }
        if (canDisplace(c, t[b - d])) { swap(p, b - d); return; }
        if (c === M.LAVA && rnd() < 0.6) return;
        const disp = c === M.LAVA ? 1 : 4;
        for (let side = 0; side < 2; side++) {
          const dd = side ? -d : d;
          let q = p;
          for (let s = 1; s <= disp; s++) { const n = p + dd * s; if (canDisplace(c, t[n])) q = n; else break; }
          if (q !== p) { swap(p, q); return; }
        }
      } else if (k === 3) { // gas
        S.gas++;
        if (life[p] > 0) life[p]--;
        if (life[p] === 0) {
          if (c === M.STEAM && rnd() < 0.35) { ev('condense', p, -1); setP(p, M.WATER); }
          else if (c === M.FIRE && rnd() < 0.3) { t[p] = M.SMOKE; life[p] = gasLife(M.SMOKE); }
          else clearCell(p);
          return;
        }
        if (c === M.FIRE && rnd() < 0.45) return;
        const top = S.lid ? 2 : 0;
        if (y <= top + 1) { if (!S.lid && rnd() < 0.5) clearCell(p); else if (S.lid) { const d = rnd() < 0.5 ? -1 : 1; if (t[p + d] === M.E) swap(p, p + d); } return; }
        const u = p - W;
        const tu = t[u];
        if ((tu === M.E || (KIND[tu] === 3 && DEN[tu] > DEN[c])) && rnd() < 0.85) { swap(p, u); return; }
        const d = rnd() < 0.5 ? -1 : 1;
        const a = t[u + d]; if (a === M.E || (KIND[a] === 3 && DEN[a] > DEN[c])) { swap(p, u + d); return; }
        const b = t[p + d]; if (b === M.E || (KIND[b] === 3 && DEN[b] > DEN[c])) { swap(p, p + d); return; }
      }
    }

    S.step = function () {
      S.frame++;
      const fs = S.frame & 0xffff;
      S.gas = 0;
      for (let p = 0; p < N; p++) if (flash[p]) flash[p] = flash[p] > 30 ? flash[p] - 30 : 0;
      for (let y = H - 2; y >= 0; y--) {
        const ltr = (S.frame + y) & 1;
        for (let i = 1; i < W - 1; i++) {
          const x = ltr ? i : W - 1 - i;
          const p = y * W + x, c = t[p];
          if (c === M.E || c === M.WALL || c === M.STONE || c === M.GLASS || c === M.PLANT) continue;
          if (c === M.MUD && t[p + W] !== M.E) continue; // resting mud: cheap skip
          if (stamp[p] === fs) continue;
          update(x, y, p, c);
        }
      }
      if (S.lid && S.gas > S.lidMax) S.popLid();
    };

    // Lid pops: every gas cell near the top is blown, top band explodes. Credited to the src owning most gas.
    S.popLid = function () {
      const tally = new Map();
      for (let p = W; p < N - W; p++) if (KIND[t[p]] === 3 && src[p]) tally.set(src[p], (tally.get(src[p]) || 0) + 1);
      let best = 0, bn = -1; for (const [s, n] of tally) if (n > bn || (n === bn && s > best)) { best = s; bn = n; }
      S.lid = false;
      const gasN = S.gas;
      const pops = Math.max(1, Math.round(gasN / 40));
      // give the pop a dedicated context
      cS = best; cG = 2; cK = RXI.lidpop;
      for (let i = 0; i < pops; i++) {
        S.lastEventFrame = S.frame;
        const x = 4 + ((i * 37) % (W - 8));
        if (S.onEvent) S.onEvent('lidpop', 3 * W + x, best, 2, 0);
      }
      for (let i = 0; i < 6; i++) explode(10 + ((i * (W - 20) / 5) | 0), 4, 6);
      for (let p = W; p < 20 * W; p++) if (KIND[t[p]] === 3 && t[p] !== M.FIRE) clearCell(p);
      if (S.onLidPop) S.onLidPop(gasN, best);
    };

    // pour `n` cells of material m around column x (once per frame while pouring), tagged with src
    S.pour = function (m, x, n, s) {
      if (S.lid) return 0;
      let placed = 0;
      for (let i = 0; i < n * 3 && placed < n; i++) {
        const px = Math.max(1, Math.min(W - 2, x + Math.round((rnd() - 0.5) * 9)));
        const py = (rnd() * 4) | 0;
        const p = py * W + px;
        if (t[p] === M.E || KIND[t[p]] === 3) {
          t[p] = m; life[p] = m === M.EMBER ? 70 + ((rnd() * 60) | 0) : 0;
          src[p] = s || 0; gen[p] = 0; rk[p] = 0; stamp[p] = S.frame & 0xffff;
          placed++;
        }
      }
      return placed;
    };
    // match: fire in a small disc; flammables inside catch directly
    S.ignite = function (x, y, s) {
      const r = 3;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const xx = x + dx, yy = y + dy;
        if (xx < 1 || xx >= W - 1 || yy < 0 || yy >= H - 1) continue;
        const p = yy * W + xx, m = t[p];
        if (m === M.E || KIND[m] === 3 || m === M.OIL || m === M.PLANT || m === M.SEED || m === M.SULFUR) {
          if (m === M.SULFUR) { t[p] = M.SULFUR; life[p] = 100; }
          else { t[p] = M.FIRE; life[p] = 20 + ((rnd() * 15) | 0); }
          src[p] = s; gen[p] = 0; rk[p] = 0; flash[p] = 255;
        }
      }
    };
    S.count = function (m) { let n = 0; for (let p = 0; p < N; p++) if (t[p] === m) n++; return n; };
    S.rnd = rnd;
    reset();
    return S;
  }

  // =================== round rules: pours, matches, lid, ledgers (GDD §3) ===================
  const RULES = {
    POUR_AMOUNT: 1600, POUR_RATE: 26, STEPS: 3,
    LEDGER_QUIET: 60, LEDGER_MAX: 300, MAX_OPEN: 3,
    DIMINISH_AT: 240, STALE_PTS: 1,
  };

  function ptsOf(type, mods) {
    let p = RX[type].pts;
    mods = mods || {};
    if ((type === 'burn' || type === 'blueflame') && mods.pyro) p += 3;
    if (type === 'blast' && mods.demolition) p += 12;
    if (type === 'bloom' && mods.greenhouse) p += 2;
    if (type === 'solidify' && mods.magma) p += 8;
    if (type === 'freeze' && mods.freezer) p += 3;
    if ((type === 'quench' || type === 'condense' || type === 'boil') && mods.tower) p *= 3;
    if (type === 'lidpop' && mods.thickglass) p *= 2;
    return p;
  }

  // 一本帳的金 = 物質 × 元素 × 秘方 (GDD §4). Returns a breakdown in display order.
  function scoreLedger(L, mods) {
    mods = mods || {};
    const rows = [];
    let matter = 0;
    const lit = [0, 0, 0, 0];
    const keys = Object.keys(L.counts).sort((a, b) => RXI[a] - RXI[b]);
    for (const k of keys) {
      const n = L.counts[k];
      if (!n) continue;
      const pts = ptsOf(k, mods);
      const eff = n <= RULES.DIMINISH_AT ? n : RULES.DIMINISH_AT + (n - RULES.DIMINISH_AT) / 2;
      const sub = Math.round(eff * pts);
      rows.push({ type: k, n, pts, sub, halved: n > RULES.DIMINISH_AT });
      matter += sub;
      for (const e of RX[k].el) lit[e] = 1;
    }
    const stale = L.stale * RULES.STALE_PTS;
    matter += stale;
    let nLit = lit[0] + lit[1] + lit[2] + lit[3];
    if (mods.ashes && lit[0] && !lit[2] && L.counts.burn) { lit[2] = 1; nLit++; }
    const chain = Math.floor(L.maxGen / 2);
    const four = nLit === 4 ? 2 : 0;
    let elemMods = 0;
    if (mods.glass && L.counts.vitrify) elemMods += Math.floor(L.counts.vitrify / 40);
    const elem = matter > 0 ? 1 + nLit + chain + four + elemMods : 1;
    const arcana = [];
    if (mods.scorched && (L.counts.burn || 0) + (L.counts.blueflame || 0) >= 800) arcana.push({ id: 'scorched', x: 2 });
    if (mods.popritual && L.counts.lidpop) arcana.push({ id: 'popritual', x: 3 });
    let arc = 1; for (const a of arcana) arc *= a.x;
    const gold = Math.round(matter * elem * arc);
    return { rows, stale, matter, lit, nLit, chain, four, elemMods, elem, arcana, arc, gold };
  }

  function createRound(opt) {
    const mods = opt.mods || {};
    const S = createSim(opt.seed >>> 0, mods);
    if (opt.lidMax) S.lidMax = opt.lidMax;
    const R = {
      S, mods, frame: 0, pours: opt.pours, matches: opt.matches, target: opt.target,
      nextId: 1, active: [], ledgers: new Map(), order: [], gold: 0, closedLog: [],
      onOpen: null, onClose: null, onRx: null, lidPops: 0, firstActionFrame: -1,
      pourAmount: Math.round(RULES.POUR_AMOUNT * (mods.nozzle ? 1.5 : 1)),
    };
    let after = null;
    function openLedger(kind, m, x, y) {
      // enforce max open (excluding aftermath)
      const open = R.order.filter(L => !L.closed && L.kind !== 'after');
      if (kind !== 'after' && open.length >= RULES.MAX_OPEN) close(open[0], 'forced');
      const L = { id: kind === 'after' ? 0 : R.nextId++, kind, m, x, y, openF: R.frame, lastF: R.frame, counts: {},
                  stale: 0, maxGen: 0, n: 0, closed: false, result: null, uid: R.order.length + 1 };
      if (kind !== 'after') R.ledgers.set(L.id, L);
      R.order.push(L);
      if (R.onOpen) R.onOpen(L);
      return L;
    }
    function close(L, why) {
      if (L.closed) return;
      L.closed = true; L.closeF = R.frame; L.why = why;
      L.result = scoreLedger(L, mods);
      R.gold += L.result.gold;
      R.closedLog.push(L);
      if (L === after) after = null;
      if (R.onClose) R.onClose(L);
    }
    S.onEvent = function (type, p, s, g, stale) {
      let L = R.ledgers.get(s);
      if (!L || L.closed) {
        if (!after) after = openLedger('after', -1, p % W, (p / W) | 0);
        L = after;
      }
      L.counts[type] = (L.counts[type] || 0) + 1;
      L.n++; L.lastF = R.frame; if (stale) L.stale++;
      if (g > L.maxGen) L.maxGen = g;
      if (R.onRx) R.onRx(L, type, p, g);
    };
    R.canPour = () => R.pours > 0 && !S.lid;
    R.startPour = function (m, x) {
      if (!R.canPour()) return null;
      if (R.firstActionFrame < 0) R.firstActionFrame = R.frame;
      R.pours--;
      const L = openLedger('pour', m, x, 0);
      const P = { id: L.id, m, x, left: R.pourAmount, L };
      R.active.push(P);
      return P;
    };
    R.aim = function (P, x) { if (P) { P.x = x; P.L.x = x; } };
    R.strike = function (x, y) {
      if (R.matches <= 0) return null;
      if (R.firstActionFrame < 0) R.firstActionFrame = R.frame;
      R.matches--;
      const L = openLedger('match', -1, x, y);
      S.ignite(x, y, L.id);
      return L;
    };
    R.toggleLid = function () { S.lid = !S.lid; return S.lid; };
    R.openLedgers = () => R.order.filter(L => !L.closed);
    R.tick = function (speed) {
      const n = speed || 1;
      for (let k = 0; k < n; k++) {
        R.frame++;
        for (const P of R.active) if (P.left > 0) P.left -= S.pour(P.m, P.x, Math.min(RULES.POUR_RATE, P.left), P.id);
        R.active = R.active.filter(P => P.left > 0 && !(S.lid));
        for (let i = 0; i < RULES.STEPS; i++) S.step();
        for (const L of R.order) {
          if (L.closed) continue;
          const pouring = R.active.some(P => P.L === L);
          if (pouring) continue;
          if (R.frame - L.lastF >= RULES.LEDGER_QUIET || R.frame - L.openF >= RULES.LEDGER_MAX) close(L, 'quiet');
        }
      }
    };
    R.closeAll = function () { for (const L of R.order) if (!L.closed) close(L, 'sealed'); R.active = []; R.sealed = true; };
    R.allClosed = () => R.order.every(L => L.closed) && R.active.length === 0;
    // round state: 'play' | 'win' | 'lose' | 'wait' (pours spent, matches left, below target)
    R.status = function () {
      if (!R.allClosed()) return 'play';
      if (R.gold >= R.target) return 'win';
      if (R.sealed) return 'lose';
      if (R.pours > 0) return 'play';
      if (R.matches > 0) return 'wait';
      return 'lose';
    };
    return R;
  }

  const api = { W, H, M, KIND, DEN, RX, RXK, EL, RULES, createSim, createRound, scoreLedger, ptsOf, mulberry32, MUD_ROWS };
  if (typeof module !== 'undefined') module.exports = api; else root.PDSim = api;
})(this);
