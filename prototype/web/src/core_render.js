let paperTile = null;
function makeNoise(seed, P) {
  P = P || 64;
  const r = mulberry32(seed), g = new Float32Array(P * P);
  for (let i = 0; i < g.length; i++) g[i] = r();
  const w = v => ((v % P) + P) % P;
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = g[w(yi) * P + w(xi)], b = g[w(yi) * P + w(xi + 1)], c = g[w(yi + 1) * P + w(xi)], d = g[w(yi + 1) * P + w(xi + 1)];
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
function makePaperTile() {
  const S = 512, c = document.createElement("canvas"); c.width = S; c.height = S;
  const g = c.getContext("2d"), im = g.createImageData(S, S), d = im.data;
  const n1 = makeNoise(7, 8), n3 = makeNoise(5, 32), n2 = makeNoise(11, 128), n4 = makeNoise(13, 256);
  const r0 = mulberry32(99);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const f = n1(x / 64, y / 64) * 0.5 + n3(x / 16, y / 16) * 0.3 + n2(x / 4, y / 4) * 0.2;
    const fiber = n4(x / 2, y / 24) > 0.9 ? -5 : 0; // faint laid lines
    const v = 224 + f * 18 + fiber + (r0() - 0.5) * 5;
    const i = (y * S + x) * 4;
    d[i] = v; d[i + 1] = v - 12; d[i + 2] = v - 40; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return c;
}
// ---- engraving patterns ----
let PAT = null; // per material: Uint8Array 12x12 ink mask (0/1)
const TINT = {}, TINTA = {};
function tint(m, hx, a) { TINT[m] = hex(hx); TINTA[m] = a; }
tint(M.MUD, "#8a6a45", 0.6); tint(M.SAND, "#d9b46a", 0.75); tint(M.WATER, "#6f9bb0", 0.55); tint(M.OIL, "#6e4a5e", 0.65);
tint(M.FIRE, "#d2452b", 0.9); tint(M.EMBER, "#d9582a", 1); tint(M.LAVA, "#c43c24", 0.92); tint(M.STONE, "#8c8478", 0.7);
tint(M.STEAM, "#e9e4d8", 0.0); tint(M.ACID, "#8db04a", 0.65); tint(M.POWDER, "#3c3430", 0.75); tint(M.ICE, "#cfe3e6", 0.55);
tint(M.GLASS, "#bcd6d9", 0.45); tint(M.SEED, "#8a8a3a", 0.75); tint(M.PLANT, "#5f8a3c", 0.75); tint(M.SMOKE, "#9a9088", 0.25);
tint(M.SULFUR, "#e3cf47", 0.85); tint(M.FUME, "#d9cc5a", 0.3);
const FIRE_RAMP = ["#b8301c", "#d2452b", "#e8752f", "#f0b443"].map(hex);
const BLUE = hex("#3553b8"), BLUE2 = hex("#4a69c8");
function buildPatterns() {
  PAT = [];
  const T = 12;
  const mk = f => { const a = new Uint8Array(T * T); for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) a[y * T + x] = f(x, y) ? 1 : 0; return a; };
  const h = (x, y) => { let v = (x * 374761393 + y * 668265263) | 0; v = (v ^ (v >>> 13)) * 1274126177; return ((v ^ (v >>> 16)) >>> 0) / 4294967296; };
  PAT[M.WATER] = mk((x, y) => y % 3 === 0 && h(x >> 2, y) > 0.18);
  PAT[M.OIL] = mk((x, y) => ((y + Math.round(Math.sin(x * Math.PI / 3) * 1.2)) % 4 + 4) % 4 === 0);
  PAT[M.STONE] = mk((x, y) => (x + y) % 4 === 0 || (x - y + 12) % 4 === 0);
  PAT[M.ACID] = mk((x, y) => (x - y + 12) % 3 === 0);
  PAT[M.ICE] = mk((x, y) => (x + 2 * y) % 6 === 0);
  PAT[M.GLASS] = mk((x, y) => (x - y + 12) % 6 === 0 && x % 12 < 7);
  PAT[M.PLANT] = mk((x, y) => x % 3 === 0 && h(x, y >> 1) > 0.25);
  PAT[M.SULFUR] = mk((x, y) => x % 3 === 0 && y % 3 === 0);
  PAT[M.LAVA] = mk((x, y) => (x + 2 * y) % 7 === 0 && h(x, y) > 0.4);
  PAT[M.MUD] = mk((x, y) => (h(x, y) > 0.84) || (y % 4 === 0 && h(x >> 1, y) > 0.62));
  PAT[M.POWDER] = mk((x, y) => h(x + 3, y + 5) > 0.42);
  PAT[M.SMOKE] = mk((x, y) => h(x + 9, y + 1) > 0.88);
  PAT[M.FUME] = mk((x, y) => h(x + 1, y + 9) > 0.86);
  PAT[M.STEAM] = mk((x, y) => (x + y * 5) % 11 === 0);
  PAT[M.SAND] = null; PAT[M.SEED] = null; // per-cell stipple
}

function renderBeaker() {
  const S = R.S, t = S.t, life = S.life, sh = S.shade, fl = S.flash;
  const td = tintImg.data;
  let sulfur = 0, oil = 0, water = 0, fxs = -1, fys = 0, fd = 1e9;
  for (let p = 0, i = 0; p < W * H; p++, i += 4) {
    const m = t[p];
    let a = 0, c = null;
    if (m === M.E || m === M.WALL) { td[i + 3] = 0; continue; }
    if (m === M.FIRE) { c = FIRE_RAMP[Math.min(3, (life[p] / 9) | 0)]; a = 0.92; }
    else if (m === M.SULFUR && life[p] > 0) { c = ((sh[p] + S.frame) & 7) < 3 ? BLUE2 : BLUE; a = 0.95; }
    else if (m === M.LAVA && ((sh[p] + (S.frame >> 1)) & 31) < 4) { c = FIRE_RAMP[3]; a = 0.95; }
    else { c = TINT[m]; a = TINTA[m]; }
    if (m === M.SULFUR) { sulfur++; if (life[p] === 0 && t[p - W] === M.E) { const dd = Math.abs((p % W) - W / 2); if (dd < fd) { fd = dd; fxs = p % W; fys = (p / W) | 0; } } }
    if (m === M.WATER) water++;
    if (m === M.OIL) { oil++; if (sulfur < 1 && t[p - W] === M.E) { const dd = Math.abs((p % W) - W / 2); if (dd < fd) { fd = dd; fxs = p % W; fys = (p / W) | 0; } } }
    let r = c[0], g = c[1], b = c[2];
    const v = ((sh[p] & 15) - 7) * 1.6; r += v; g += v; b += v;
    if (fl[p]) { const f = fl[p] / 255 * 0.55; r += (240 - r) * f; g += (196 - g) * f; b += (90 - b) * f; a = Math.max(a, f + 0.3); }
    td[i] = r; td[i + 1] = g; td[i + 2] = b; td[i + 3] = a * 255;
  }
  G.sulfurCells = sulfur; G.oilCells = oil; G.waterCells = water;
  if (fxs >= 0) { G.fuelX = fxs; G.fuelY = fys + 1; } else { G.fuelX = null; G.fuelY = null; }
  tctx.putImageData(tintImg, 0, 0);

  // ink layer
  const cp = ICP, bw = W * ICP, bh = H * ICP, T = 12;
  const INK = 0xff121c2a; // ABGR little-endian: rgb(42,28,18)
  const INK_SOFT = 0x99121c2a, INK_GREY = 0x88505a66, INK_OCHRE = 0xaa2a6a7a;
  const buf = ink32;
  for (let cy = 0; cy < H - 1; cy++) {
    const rowBase = cy * W;
    for (let cx = 1; cx < W - 1; cx++) {
      const p = rowBase + cx, m = t[p];
      const px0 = cx * cp, py0 = cy * cp;
      if (m === M.E || m === M.FIRE || (m === M.SULFUR && life[p] > 0) || m === M.EMBER) {
        // clear cell
        for (let ly = 0; ly < cp; ly++) { const o = (py0 + ly) * bw + px0; for (let lx = 0; lx < cp; lx++) buf[o + lx] = 0; }
        if (m === M.EMBER) buf[(py0 + (cp >> 1)) * bw + px0 + (cp >> 1)] = INK;
        continue;
      }
      const gasCell = KIND[m] === 3;
      // contours: edge where neighbour differs in class (non-gas)
      const cls = gasCell ? 0 : m;
      const up = t[p - W], dn = t[p + W], lf = t[p - 1], rt = t[p + 1];
      const cu = cy > 0 && !gasCell && (KIND[up] === 3 ? 0 : up === M.WALL ? m : up) !== cls;
      const cd = !gasCell && dn !== M.WALL && (KIND[dn] === 3 ? 0 : dn) !== cls && KIND[m] !== 2;
      const cl = !gasCell && lf !== M.WALL && (KIND[lf] === 3 ? 0 : lf) !== cls && KIND[m] !== 2;
      const cr = !gasCell && rt !== M.WALL && (KIND[rt] === 3 ? 0 : rt) !== cls && KIND[m] !== 2;
      const pat = PAT[m];
      const col = m === M.STEAM || m === M.SMOKE ? INK_GREY : m === M.FUME ? INK_OCHRE : m === M.GLASS || m === M.ICE ? INK_SOFT : INK;
      const s = sh[p];
      for (let ly = 0; ly < cp; ly++) {
        const yy = py0 + ly, o = yy * bw + px0, prow = (yy % T) * T;
        for (let lx = 0; lx < cp; lx++) {
          let on = 0;
          if ((cu && ly === 0) || (cd && ly === cp - 1) || (cl && lx === 0) || (cr && lx === cp - 1)) on = 2;
          else if (pat) on = pat[prow + ((px0 + lx) % T)];
          else if (m === M.SAND) on = ((lx * 3 + ly * 5 + s) % 7 === 0) ? 1 : 0;
          else if (m === M.SEED) on = (lx >= 1 && lx <= 2 && ly >= 1 && ly <= 2) ? 1 : 0;
          buf[o + lx] = on ? (on === 2 ? INK : col) : 0;
        }
      }
    }
  }
  ictx.putImageData(inkImg, 0, 0);
}

