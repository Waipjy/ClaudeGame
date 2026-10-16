// B3 preview estimator (V04_SPEC §5). Shared by the browser (inlined into game.js) and node (calibrate_preview.js). Pure: reads sim state, never writes it.
// estimatePour / estimateMatch / estimateLid return { items, lo, hi, mult }: gold range for ONE new ledger (what the player gets credited for this action).
(function (root) {
  const P = root.PDSim || (typeof require !== 'undefined' ? require('../sim.js') : null);
  const { W, H, M, KIND, DEN, RX, RULES, scoreLedger } = P;
  const HALF = 4, ROWS = 4, BFS_CAP = 2000;

  // ---------- sensing the beaker ----------
  function colContact(S, col, half) { // first non-empty (or fire) cell under columns col-half..col+half
    let best = H - 1;
    for (let dx = -half; dx <= half; dx++) {
      const x = col + dx; if (x < 1 || x >= W - 1) continue;
      for (let y = 0; y < H - 1; y++) { const m = S.t[y * W + x]; if (m !== M.E && (KIND[m] !== 3 || m === M.FIRE)) { if (y < best) best = y; break; } }
    }
    return best;
  }
  const seen = new Uint32Array(W * H), queue = new Int32Array(BFS_CAP + 8);
  let gen = 0;
  function blockSize(S, seeds, mat) { // same-material 4-neighbour block containing the seed cells, capped
    gen++; let qh = 0, qt = 0; const t = S.t;
    for (const p of seeds) if (seen[p] !== gen) { seen[p] = gen; queue[qt++] = p; }
    while (qh < qt && qt < BFS_CAP) {
      const p = queue[qh++], x = p % W;
      for (let i = 0; i < 4; i++) {
        const q = i === 0 ? p - W : i === 1 ? p + W : i === 2 ? (x > 1 ? p - 1 : -1) : (x < W - 2 ? p + 1 : -1);
        if (q < 0 || q >= W * H || seen[q] === gen || t[q] !== mat) continue; seen[q] = gen; queue[qt++] = q; if (qt >= BFS_CAP) break;
      }
    }
    return qt;
  }
  function contactInfo(S, col) { // materials in the 9 x 4 patch under the contact face + size of the block each belongs to
    const cy = colContact(S, col, HALF), seeds = {}, tally = {};
    for (let dx = -HALF; dx <= HALF; dx++) for (let dy = 0; dy < ROWS; dy++) {
      const x = col + dx, y = cy + dy; if (x < 1 || x >= W - 1 || y >= H - 1) continue;
      const p = y * W + x, m = S.t[p]; if (m === M.E) continue;
      tally[m] = (tally[m] || 0) + 1; (seeds[m] || (seeds[m] = [])).push(p);
    }
    const vol = {}; for (const m in seeds) vol[m] = blockSize(S, seeds[m], +m);
    return { col, cy, tally, vol };
  }
  function census(S) { // whole-beaker counts per material (index 23 = burning sulfur)
    const c = new Int32Array(24), t = S.t, life = S.life;
    for (let p = 0; p < W * H; p++) { const m = t[p]; c[m]++; if (m === M.SULFUR && life[p] > 0) c[23]++; }
    return c;
  }
  function matchInfo(S, cx, cy) { // a match: what is in its 3-radius disc, and the size of the blocks it touches
    const r = 3, seeds = {}, tally = {};
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const x = cx + dx, y = cy + dy; if (x < 1 || x >= W - 1 || y < 0 || y >= H - 1) continue;
      const p = y * W + x, m = S.t[p]; if (m === M.E || (KIND[m] === 3 && m !== M.FIRE)) continue;
      tally[m] = (tally[m] || 0) + 1; (seeds[m] || (seeds[m] = [])).push(p);
    }
    const vol = {}; for (const m in seeds) vol[m] = blockSize(S, seeds[m], +m);
    return { cx, cy, tally, vol };
  }

  // ---------- reaction pairs (poured A meets B) : [A, B, reaction, conv, qty]  qty: 'A' = scales with the pour (B is a source that keeps going), 'min' = min(pour, whole-beaker B) ----------
  // conv = cells of reaction events per unit quantity, medians from bot data (calibrate_preview.js prints them again); see CONV below for the final numbers
  const PAIRS = [
    [M.EMBER, M.OIL, 'burn', 1.0, 'min'], [M.EMBER, M.SEED, 'burn', 0.8, 'min'], [M.EMBER, M.PLANT, 'burn', 0.8, 'min'], [M.EMBER, M.SULFUR, 'blueflame', 0.93, 'min'],
    [M.EMBER, M.POWDER, 'blast', 0.05, 'min'], [M.EMBER, M.WATER, 'quench', 0.65, 'min'], [M.EMBER, M.ICE, 'melt', 0.5, 'min'],
    [M.LAVA, M.OIL, 'burn', 1.0, 'min'], [M.LAVA, M.SEED, 'burn', 1.0, 'min'], [M.LAVA, M.PLANT, 'burn', 1.0, 'min'], [M.LAVA, M.SULFUR, 'blueflame', 1.0, 'min'], [M.LAVA, M.POWDER, 'blast', 0.05, 'min'],
    [M.LAVA, M.WATER, 'solidify', 0.1, 'min'], [M.LAVA, M.SAND, 'vitrify', 0.05, 'min'], [M.LAVA, M.MUD, 'bake', 0.054, 'min'], [M.LAVA, M.ICE, 'melt', 1.0, 'min'],
    [M.OIL, M.FIRE, 'burn', 1.0, 'A'], [M.OIL, M.LAVA, 'burn', 1.0, 'A'], [M.SEED, M.FIRE, 'burn', 0.7, 'A'], [M.SEED, M.LAVA, 'burn', 1.0, 'A'],
    [M.SULFUR, M.FIRE, 'blueflame', 0.8, 'A'], [M.SULFUR, M.LAVA, 'blueflame', 1.0, 'A'], [M.POWDER, M.FIRE, 'blast', 0.07, 'A'], [M.POWDER, M.LAVA, 'blast', 0.07, 'A'],
    [M.WATER, M.FIRE, 'quench', 0.012, 'A'], [M.SEED, M.WATER, 'bloom', 0.8, 'min'], [M.WATER, M.EMBER, 'quench', 0.3, 'min'], [M.WATER, M.LAVA, 'solidify', 0.14, 'A'], [M.WATER, M.SEED, 'bloom', 0.45, 'min'], [M.WATER, M.PLANT, 'bloom', 0.5, 'min'], [M.WATER, M.ICE, 'freeze', 0.6, 'min'],
    [M.ICE, M.LAVA, 'melt', 1.0, 'min'], [M.ICE, M.FIRE, 'melt', 0.5, 'A'], [M.ICE, M.WATER, 'freeze', 1.0, 'min'],
    [M.SAND, M.LAVA, 'vitrify', 0.9, 'min'], [M.SAND, M.ACID, 'dissolve', 1.26, 'min'],
    [M.ACID, M.SAND, 'dissolve', 1.0, 'min'], [M.ACID, M.ICE, 'dissolve', 1.0, 'min'], [M.ACID, M.SEED, 'dissolve', 1.0, 'min'], [M.ACID, M.PLANT, 'dissolve', 1.0, 'min'],
    [M.ACID, M.POWDER, 'dissolve', 1.0, 'min'], [M.ACID, M.MUD, 'dissolve', 1.0, 'min'], [M.ACID, M.STONE, 'dissolve', 1.0, 'min'], [M.ACID, M.GLASS, 'dissolve', 1.0, 'min'],
    [M.ICE, M.ACID, 'dissolve', 1.0, 'min'], [M.SEED, M.ACID, 'dissolve', 1.0, 'min'], [M.POWDER, M.ACID, 'dissolve', 1.0, 'min'],
  ];
  const RULEOF = {}; PAIRS.forEach((p, i) => { (RULEOF[p[0]] || (RULEOF[p[0]] = {}))[p[1]] = p; });
  // pairs of vial materials for the codex / hand tips (A + B -> reaction), order-free, only combos a player can make from the shop
  const COMBOS = [['burn', M.EMBER, M.OIL], ['burn', M.LAVA, M.OIL], ['burn', M.EMBER, M.SEED], ['blueflame', M.EMBER, M.SULFUR], ['blueflame', M.LAVA, M.SULFUR], ['blast', M.EMBER, M.POWDER], ['blast', M.LAVA, M.POWDER],
    ['quench', M.EMBER, M.WATER], ['melt', M.LAVA, M.ICE], ['melt', M.EMBER, M.ICE], ['freeze', M.WATER, M.ICE], ['acidrain', M.SULFUR, M.WATER], ['solidify', M.LAVA, M.WATER], ['vitrify', M.LAVA, M.SAND],
    ['dissolve', M.ACID, M.SAND], ['dissolve', M.ACID, M.ICE], ['dissolve', M.ACID, M.SEED], ['dissolve', M.ACID, M.POWDER], ['bake', M.LAVA, M.MUD], ['bloom', M.WATER, M.SEED]];

  // what a pour does when nothing reacts: sinks / floats / stacks (V04_SPEC §3.2, last paragraph)
  function physicsKind(m, x) {
    if (m === M.EMBER) return 'delay';
    const kx = KIND[x];
    if (kx === 2) { if (m === M.SULFUR) return 'float'; return DEN[m] > DEN[x] ? 'sink' : DEN[m] < DEN[x] ? 'float' : 'stack'; }
    if (kx === 1 || kx === 4) return 'stack';
    return 'stack';
  }

  // ---------- the estimate, from features only (so node can replay recorded pours) ----------
  // interval factors on the central estimate (tuned by calibrate_preview.js; the scoring numbers are never touched)
  const CONV = { lo: 0.35, hi: 3, reach: 0.7, wet: 40 };
  // cascade ratios: secondary reactions per primary one when water is in the beaker (least-squares fit on bot ledgers, calibrate_preview.js --fit)
  const CASCADE = { condensePerSolid: 0.05, condensePerBoil: 0.06, boilPerWater: 0.17, quenchPerBurn: 0.12, fumePerBlue: 0.27, rainPerBlue: 0.42, dissolvePerBlue: 0.48 };
  const pr10 = (v, up) => up ? Math.ceil(v / 10) * 10 : Math.floor(v / 10) * 10;
  const scoreOf = (counts, maxGen, mods) => scoreLedger({ counts, evs: counts, resN: {}, maxGen }, mods);
  const baseOf = (rx, n, mods) => scoreLedger({ counts: { [rx]: n }, evs: { [rx]: n }, resN: {}, maxGen: 1 }, mods).matter;
  const add = (o, k, v) => { if (v > 0) o[k] = (o[k] || 0) + v; };

  // secondary reactions that follow from the primary ones (burning sulfur near water makes acid rain, fire next to water quenches ...)
  function cascade(c, glob) {
    const wet = glob[M.WATER] + glob[M.STEAM] > CONV.wet, o = Object.assign({}, c);
    if (wet) add(o, 'quench', CASCADE.quenchPerBurn * (c.burn || 0));
    if (c.boil) add(o, 'condense', CASCADE.condensePerBoil * c.boil);
    if (c.solidify) add(o, 'condense', CASCADE.condensePerSolid * c.solidify);
    if (c.blueflame) { add(o, 'fume', CASCADE.fumePerBlue * c.blueflame); if (wet) { add(o, 'acidrain', CASCADE.rainPerBlue * c.blueflame); add(o, 'dissolve', CASCADE.dissolvePerBlue * c.blueflame); } }
    return o;
  }
  function depthOf(c) { return 1 + (c.quench || c.fume ? 1 : 0) + (c.acidrain ? 1 : 0) + (c.dissolve && c.acidrain ? 1 : 0); }
  // one scenario (lo or hi): primary counts scaled by k, then cascade, then the real scoring formula
  function scenario(prim, k, glob, mods, extra) {
    const c = {}; for (const r in prim) c[r] = prim[r] * k;
    if (extra) for (const r in extra) add(c, r, extra[r] * k);
    const full = cascade(c, glob);
    return scoreOf(full, depthOf(full) + (k > 1 && (full.quench || full.acidrain) ? 1 : 0), mods);
  }
  function finish(items, prim, reach, glob, mods) {
    const lo = scenario(prim, CONV.lo, glob, mods), hi = scenario(prim, CONV.hi, glob, mods, reach);
    for (const it of items) { it.lo = baseOf(it.rx, it.n * CONV.lo, mods); it.hi = baseOf(it.rx, it.n * CONV.hi, mods); }
    const lg = pr10(lo.gold, false), hg = Math.max(lg, pr10(hi.gold, true));
    return { items, lo: lg, hi: hg, mult: hi.elem, lit: hi.lit };
  }
  function primaryOf(m, tally, glob, amount, mods) {
    const items = [], prim = {}, reach = {};
    for (const xs of Object.keys(tally)) {
      const x = +xs, rule = RULEOF[m] && RULEOF[m][x]; if (!rule) continue;
      const rx = rule[2], n = rule[3] * (rule[4] === 'A' ? amount : Math.min(amount, glob[x])); if (n <= 0) continue;
      add(prim, rx, n); items.push({ kind: 'rx', a: m, b: x, rx, trait: RX[rx].trait, n });
    }
    if (m === M.WATER && mods.hotplate) { const n = CASCADE.boilPerWater * amount; add(prim, 'boil', n); items.push({ kind: 'rx', a: m, b: M.MUD, rx: 'boil', trait: RX.boil.trait, n }); }
    // partners that are in the beaker but not under the pour: a flowing pour may still reach them (adds to the high end only)
    for (const xs in RULEOF[m] || {}) {
      const x = +xs, rule = RULEOF[m][x]; if (tally[x] || glob[x] <= 0 || x === M.FIRE || !(KIND[m] === 2 || KIND[x] === 2 || m === M.EMBER)) continue;
      add(reach, rule[2], CONV.reach * rule[3] * (rule[4] === 'A' ? amount : Math.min(amount, glob[x])));
    }
    return { items, prim, reach };
  }
  function estimateFromFeatures(m, info, glob, amount, mods) {
    const { items, prim, reach } = primaryOf(m, info.tally, glob, amount, mods);
    if (!items.length) {
      let dom = 0, dn = 0; for (const x in info.tally) if (info.tally[x] > dn) { dn = info.tally[x]; dom = +x; }
      const ex = Object.keys(reach).length ? finish([], {}, reach, glob, mods) : { lo: 0, hi: 0, mult: 1, lit: [0, 0, 0, 0] };
      ex.items = [dom ? { kind: physicsKind(m, dom), a: m, b: dom, lo: 0, hi: 0 } : { kind: 'stack', a: m, b: M.MUD, lo: 0, hi: 0 }];
      return ex;
    }
    return finish(items, prim, reach, glob, mods);
  }

  // ---------- live entry points ----------
  let cache = { key: '', val: null };
  function cached(key, fn) { if (cache.key === key) return cache.val; const v = fn(); cache = { key, val: v }; return v; }
  function estimatePour(S, mods, m, col, amount, frameKey) {
    return cached('p' + m + ':' + col + ':' + frameKey, () => {
      const info = contactInfo(S, col), v = estimateFromFeatures(m, info, census(S), amount, mods);
      v.col = col; v.cy = info.cy; v.info = info; return v;
    });
  }
  const FLAM = [M.OIL, M.SULFUR, M.SEED, M.PLANT, M.POWDER];
  const MATCH_RULES = { [M.OIL]: ["burn", 1.0], [M.PLANT]: ['burn', 0.8], [M.SEED]: ['burn', 0.8], [M.SULFUR]: ["blueflame", 0.59], [M.POWDER]: ['blast', 0.015] };
  function matchFromFeatures(info, glob, mods) {
    const items = [], prim = {};
    for (const xs of Object.keys(info.tally)) {
      const x = +xs, r = MATCH_RULES[x]; if (!r) continue;
      const n = r[1] * glob[x]; if (n <= 0) continue;
      add(prim, r[0], n); items.push({ kind: 'rx', a: -1, b: x, rx: r[0], trait: RX[r[0]].trait, n });
    }
    if (!items.length) return { items: [], lo: 0, hi: 0, mult: 1, lit: [0, 0, 0, 0] };
    return finish(items, prim, {}, glob, mods);
  }
  function estimateMatch(S, mods, cx, cy, frameKey) {
    return cached('m' + cx + ':' + cy + ':' + frameKey, () => { const info = matchInfo(S, cx, cy), v = matchFromFeatures(info, census(S), mods); v.info = info; return v; });
  }
  // lid: will the gas reach the cap within `secs` seconds (slope in cells per R.frame)? then the burst is worth about trig + vol*cap/100, times a multiplier of at least air + 1
  function estimateLid(S, mods, slope, secs) {
    const will = S.lid && (S.gas + Math.max(0, slope) * 60 * (secs || 3)) >= S.lidMax;
    const v = P.rxVals('lidpop', mods), base = v.trig + v.vol * S.lidMax / RULES.VOL_DIV, lo = pr10(base * 2, false);
    return { will, lo };
  }

  const api = { colContact, blockSize, contactInfo, matchInfo, census, estimateFromFeatures, matchFromFeatures, estimatePour, estimateMatch, estimateLid,
    PAIRS, COMBOS, CONV, HALF, ROWS, BFS_CAP, physicsKind, FLAM };
  if (typeof module !== 'undefined') module.exports = api; else root.PDEst = api;
})(typeof window !== 'undefined' ? window : this);
