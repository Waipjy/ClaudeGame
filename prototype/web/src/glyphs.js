// ---------------- glyphs: digits + every icon, all hand-drawn on canvas (no fonts, no emoji) ----------------
const INK = "#2a1c12", PAPER = "#efe4c8";
const COL = { sand: "#d9b46a", water: "#5b8fae", oil: "#c98a2e", lava: "#c43c24", acid: "#8db04a", powder: "#4a4440", ice: "#a9d0d4",
  seed: "#7f9a3a", ember: "#d9582a", sulfur: "#e3cf47", stone: "#8c8478", mud: "#8a6a45", gold: "#c8961e", goldHi: "#f0d27a",
  fire: "#b8381e", blue: "#3553b8", steam: "#b7bcb8", smoke: "#9a9088", glass: "#bcd6d9", plant: "#5f8a3c" };
const ELC = ["#b8381e", "#2e5e8c", "#5e6a2a", "#6a5f8e"];
window.__textViolations = [];

// ---- digits: strokes in a 4 x 6 box ----
const GLYPH = {
  "0": g => { g.moveTo(3.8, 3); g.ellipse(2, 3, 1.8, 2.9, 0, 0, Math.PI * 2); },
  "1": g => { g.moveTo(1, 1.4); g.lineTo(2.4, 0); g.lineTo(2.4, 6); g.moveTo(1, 6); g.lineTo(3.8, 6); },
  "2": g => { g.moveTo(0.3, 1.7); g.bezierCurveTo(0.2, -0.6, 3.8, -0.6, 3.7, 1.7); g.bezierCurveTo(3.6, 3.2, 0.5, 4.6, 0.2, 6); g.lineTo(3.9, 6); },
  "3": g => { g.moveTo(0.4, 0.5); g.bezierCurveTo(1.2, -0.3, 3.8, -0.2, 3.6, 1.5); g.bezierCurveTo(3.5, 2.7, 2.4, 2.9, 1.6, 2.9); g.bezierCurveTo(2.8, 2.9, 4, 3.4, 3.8, 4.6); g.bezierCurveTo(3.6, 6.4, 0.9, 6.5, 0.2, 5.4); },
  "4": g => { g.moveTo(3, 6); g.lineTo(3, 0); g.lineTo(0.2, 4.2); g.lineTo(4, 4.2); },
  "5": g => { g.moveTo(3.6, 0); g.lineTo(0.8, 0); g.lineTo(0.5, 2.8); g.bezierCurveTo(1.5, 2.2, 3.9, 2.4, 3.8, 4.4); g.bezierCurveTo(3.7, 6.4, 0.9, 6.5, 0.2, 5.4); },
  "6": g => { g.moveTo(3.5, 0.2); g.bezierCurveTo(1, 0.6, 0.2, 2.5, 0.2, 4.1); g.bezierCurveTo(0.2, 6.5, 3.8, 6.5, 3.8, 4.3); g.bezierCurveTo(3.8, 2.4, 0.9, 2.3, 0.3, 4.1); },
  "7": g => { g.moveTo(0.2, 0); g.lineTo(3.8, 0); g.lineTo(1.4, 6); },
  "8": g => { g.moveTo(3.5, 1.5); g.ellipse(2, 1.5, 1.5, 1.45, 0, 0, Math.PI * 2); g.moveTo(3.8, 4.4); g.ellipse(2, 4.4, 1.8, 1.6, 0, 0, Math.PI * 2); },
  "9": g => { g.save(); g.translate(4, 6); g.rotate(Math.PI); GLYPH["6"](g); g.restore(); },
  "×": g => { g.moveTo(0.6, 1.7); g.lineTo(3.4, 4.5); g.moveTo(3.4, 1.7); g.lineTo(0.6, 4.5); },
  "+": g => { g.moveTo(2, 1.4); g.lineTo(2, 4.6); g.moveTo(0.4, 3); g.lineTo(3.6, 3); },
  "-": g => { g.moveTo(0.4, 3); g.lineTo(3.6, 3); },
  "−": g => { g.moveTo(0.4, 3); g.lineTo(3.6, 3); },
  "=": g => { g.moveTo(0.5, 2.2); g.lineTo(3.5, 2.2); g.moveTo(0.5, 3.8); g.lineTo(3.5, 3.8); },
  "/": g => { g.moveTo(3.4, 0); g.lineTo(0.6, 6); },
  "%": g => { g.moveTo(1.9, 1.2); g.ellipse(1.1, 1.2, 0.8, 0.9, 0, 0, Math.PI * 2); g.moveTo(3.7, 4.8); g.ellipse(2.9, 4.8, 0.8, 0.9, 0, 0, Math.PI * 2); g.moveTo(3.5, 0); g.lineTo(0.5, 6); },
  ".": g => { g.moveTo(0.9, 5.7); g.lineTo(0.92, 5.7); },
  ",": g => { g.moveTo(2.2, 5.3); g.lineTo(1.6, 6.7); },
  "k": g => { g.moveTo(0.7, 0); g.lineTo(0.7, 6); g.moveTo(3.4, 1.9); g.lineTo(0.7, 3.9); g.moveTo(1.7, 3.3); g.lineTo(3.7, 6); },
};
const ADV = { "1": 4, ".": 2.2, ",": 2.4, "-": 4.4, "−": 4.4, "k": 4.6 };
function numWidth(str, size) { let w = 0; const s = size / 6; for (const ch of String(str)) w += (ADV[ch] || 5) * s; return w - 0.8 * s; }
// size = glyph height in logical px. opt: color, align (l/c/r), halo (paper outline), wt (stroke weight, in 1/6 size units)
function drawNum(g, str, x, y, size, opt) {
  opt = opt || {};
  str = String(str);
  for (const ch of str) if (!GLYPH[ch]) { window.__textViolations.push(ch); console.error("text-violation: " + ch); return; }
  const s = size / 6, w = numWidth(str, size);
  let x0 = opt.align === "r" ? x - w : opt.align === "c" || !opt.align ? x - w / 2 : x;
  const y0 = opt.base === "top" ? y : y - size / 2;
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  const pass = (col, lw) => {
    g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
    let cx = x0;
    for (const ch of str) { g.save(); g.translate(cx, y0); g.scale(s, s); const m = g.getTransform(); GLYPH[ch](g); g.restore(); cx += (ADV[ch] || 5) * s; }
    g.stroke();
  };
  // path points are baked in at construction time, so the stroke width is set in device space here
  const lw = Math.max(1.1, (opt.wt || 0.72) * s);
  if (opt.halo) pass(opt.halo === true ? PAPER : opt.halo, lw + Math.max(2.2, s * 1.2));
  pass(opt.color || INK, lw);
  g.restore();
}
function fmt(n) {
  n = Math.round(n);
  if (n < 10000) return String(n);
  const k = n / 1000;
  return (k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")) + "k";
}

// ---- tiny helpers ----
function wash(g, col, a) { g.save(); g.globalAlpha = a == null ? 0.78 : a; g.fillStyle = col; g.fill(); g.restore(); }
function ink(g, lw) { g.strokeStyle = INK; g.lineWidth = lw || 1.4; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); }
function tri(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }

// ---- element triangles (alchemical signs) ----
function drawEl(g, e, x, y, s, on, dashed, pop) {
  const up = e === 0 || e === 3, bar = e >= 2, k = pop ? 1 + pop * 0.35 : 1;
  g.save(); g.translate(x, y); g.scale(k, k);
  g.beginPath();
  if (up) { g.moveTo(0, -s); g.lineTo(s * 0.95, s * 0.7); g.lineTo(-s * 0.95, s * 0.7); } else { g.moveTo(-s * 0.95, -s * 0.7); g.lineTo(s * 0.95, -s * 0.7); g.lineTo(0, s); }
  g.closePath();
  if (on) wash(g, ELC[e], 0.85);
  g.strokeStyle = on ? INK : "rgba(42,28,18,.42)"; g.lineWidth = on ? 1.8 : 1.2;
  if (dashed) g.setLineDash([3, 2.5]);
  g.stroke(); g.setLineDash([]);
  if (bar) { const yy = up ? s * 0.16 : -s * 0.16, hw = up ? s * 0.55 : s * 0.55; g.beginPath(); g.moveTo(-hw - s * 0.2, yy); g.lineTo(hw + s * 0.2, yy); g.stroke(); }
  g.restore();
}

// ---- material vials: silhouette (unique per material) + symbol ----
const SIL = {
  [M.SAND]: g => { g.moveTo(.36, .08); g.lineTo(.64, .08); g.lineTo(.6, .26); g.bezierCurveTo(1.08, .34, 1.02, 1.0, .5, 1.0); g.bezierCurveTo(-.02, 1.0, -.08, .34, .4, .26); g.closePath(); },
  [M.WATER]: g => { g.moveTo(.4, .03); g.lineTo(.6, .03); g.lineTo(.6, .32); g.bezierCurveTo(.99, .4, .99, .99, .5, .99); g.bezierCurveTo(.01, .99, .01, .4, .4, .32); g.closePath(); },
  [M.OIL]: g => { g.moveTo(.42, .01); g.lineTo(.58, .01); g.lineTo(.58, .27); g.bezierCurveTo(.8, .31, .8, .38, .8, .46); g.lineTo(.8, .94); g.quadraticCurveTo(.8, .99, .74, .99); g.lineTo(.26, .99); g.quadraticCurveTo(.2, .99, .2, .94); g.lineTo(.2, .46); g.bezierCurveTo(.2, .38, .2, .31, .42, .27); g.closePath(); },
  [M.LAVA]: g => { g.moveTo(.2, .1); g.lineTo(.8, .1); g.lineTo(.8, .2); g.bezierCurveTo(1.04, .4, 1.04, .94, .8, .99); g.lineTo(.2, .99); g.bezierCurveTo(-.04, .94, -.04, .4, .2, .2); g.closePath(); },
  [M.ACID]: g => { g.moveTo(.38, .02); g.lineTo(.62, .02); g.lineTo(.62, .26); g.lineTo(.92, .34); g.lineTo(.92, .99); g.lineTo(.08, .99); g.lineTo(.08, .34); g.lineTo(.38, .26); g.closePath(); },
  [M.POWDER]: g => { g.moveTo(.22, .1); g.lineTo(.78, .1); g.bezierCurveTo(1.02, .3, 1.02, .78, .78, .98); g.lineTo(.22, .98); g.bezierCurveTo(-.02, .78, -.02, .3, .22, .1); g.closePath(); },
  [M.ICE]: g => { g.moveTo(.5, .02); g.lineTo(.95, .26); g.lineTo(.95, .74); g.lineTo(.5, .99); g.lineTo(.05, .74); g.lineTo(.05, .26); g.closePath(); },
  [M.SEED]: g => { g.moveTo(.5, .12); g.lineTo(.3, .0); g.lineTo(.36, .2); g.lineTo(.42, .3); g.bezierCurveTo(.0, .38, -.02, .99, .5, .99); g.bezierCurveTo(1.02, .99, 1.0, .38, .58, .3); g.lineTo(.64, .2); g.lineTo(.7, .0); g.closePath(); },
  [M.EMBER]: g => { g.moveTo(.06, .42); g.lineTo(.94, .42); g.lineTo(.94, .99); g.lineTo(.06, .99); g.closePath(); },
  [M.SULFUR]: g => { g.moveTo(.42, .03); g.lineTo(.58, .03); g.lineTo(.58, .38); g.bezierCurveTo(1.02, .44, 1.02, .97, .5, .97); g.bezierCurveTo(-.02, .97, -.02, .44, .42, .38); g.closePath(); },
};
const SYMC = { [M.SAND]: [.5, .66], [M.WATER]: [.5, .68], [M.OIL]: [.5, .66], [M.LAVA]: [.5, .6], [M.ACID]: [.5, .66], [M.POWDER]: [.5, .55], [M.ICE]: [.5, .52], [M.SEED]: [.5, .68], [M.EMBER]: [.5, .76], [M.SULFUR]: [.5, .68] };
const VCOL = { [M.SAND]: COL.sand, [M.WATER]: COL.water, [M.OIL]: COL.oil, [M.LAVA]: COL.lava, [M.ACID]: COL.acid, [M.POWDER]: COL.powder, [M.ICE]: COL.ice, [M.SEED]: COL.seed, [M.EMBER]: COL.ember, [M.SULFUR]: COL.sulfur };
const SYM = {
  [M.SAND]: (g, s) => { for (const [x, y] of [[-.5, .4], [.5, .4], [0, -.45]]) { g.beginPath(); g.arc(x * s, y * s, s * .24, 0, 7); g.fillStyle = INK; g.fill(); } },
  [M.WATER]: (g, s) => { g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(-s * .5, -s * .8, 0, 0); g.quadraticCurveTo(s * .5, s * .8, s, 0); g.stroke(); g.beginPath(); g.moveTo(-s * .7, s * .55); g.quadraticCurveTo(-s * .35, 0, 0, s * .55); g.quadraticCurveTo(s * .35, s * 1.1, s * .7, s * .55); g.stroke(); },
  [M.OIL]: (g, s) => { g.beginPath(); g.moveTo(0, -s * .9); g.bezierCurveTo(s * .7, -s * .1, s * .6, s * .5, 0, s * .5); g.bezierCurveTo(-s * .6, s * .5, -s * .7, -s * .1, 0, -s * .9); g.stroke(); g.beginPath(); g.moveTo(-s * .8, s * .95); g.lineTo(s * .8, s * .95); g.stroke(); },
  [M.LAVA]: (g, s) => { for (const dx of [-.6, 0, .6]) { g.beginPath(); g.moveTo(dx * s, s * .8); g.lineTo((dx - .2) * s, s * .2); g.lineTo((dx + .15) * s, -s * .2); g.lineTo(dx * s, -s * .85); g.stroke(); } },
  [M.ACID]: (g, s) => { g.beginPath(); g.arc(0, 0, s * .8, 0.6, Math.PI * 2 - 0.6); g.stroke(); g.beginPath(); g.arc(s * .8, 0, s * .32, Math.PI * .5, Math.PI * 1.5); g.stroke(); },
  [M.POWDER]: (g, s) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * .4 : s * .95; g[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.stroke(); },
  [M.ICE]: (g, s) => { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(Math.cos(a) * s, Math.sin(a) * s); g.lineTo(-Math.cos(a) * s, -Math.sin(a) * s); g.stroke(); } g.beginPath(); g.arc(0, 0, s * .45, 0, 7); g.stroke(); },
  [M.SEED]: (g, s) => { g.beginPath(); g.moveTo(0, s * .9); g.lineTo(0, -s * .1); g.stroke(); for (const d of [-1, 1]) { g.beginPath(); g.moveTo(0, -s * .1); g.quadraticCurveTo(d * s * .9, -s * .1, d * s * .9, -s * .9); g.quadraticCurveTo(d * s * .1, -s * .8, 0, -s * .1); g.stroke(); } },
  [M.EMBER]: (g, s) => { g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * .2, -s * .5, s * .8, -s * .1, s * .6, s * .45); g.bezierCurveTo(s * .45, s * .95, -s * .45, s * .95, -s * .6, s * .4); g.bezierCurveTo(-s * .75, -s * .05, -s * .25, -s * .35, 0, -s); g.closePath(); g.stroke(); },
  [M.SULFUR]: (g, s) => { tri(g, [[0, -s], [s * .7, -s * .15], [-s * .7, -s * .15]]); g.stroke(); g.beginPath(); g.moveTo(0, -s * .15); g.lineTo(0, s * .95); g.moveTo(-s * .45, s * .5); g.lineTo(s * .45, s * .5); g.stroke(); },
};
// draw a vial in box (x,y,w,h). opt: dim, filled(0..1 liquid level), halo
function drawVial(g, m, x, y, w, h, opt) {
  opt = opt || {};
  g.save(); g.translate(x, y); g.scale(w, h);
  g.beginPath(); SIL[m](g);
  g.save(); g.clip();
  g.fillStyle = "rgba(246,238,214,.8)"; g.fillRect(-.2, -.2, 1.4, 1.4);
  g.globalAlpha = opt.dim ? 0.35 : 0.72; g.fillStyle = VCOL[m]; g.fillRect(-.2, m === M.EMBER ? .44 : .36, 1.4, 1);
  g.globalAlpha = opt.dim ? 0.2 : 0.55; g.strokeStyle = INK; g.lineWidth = 0.9 / Math.min(w, h);
  const step = 3.2 / h;
  for (let yy = .42; yy < 1.02; yy += step) { g.beginPath(); g.moveTo(-.1, yy); g.lineTo(1.1, yy); g.stroke(); }
  g.restore();
  g.beginPath(); SIL[m](g);
  g.setTransform(g.getTransform()); // keep
  g.restore();
  // outline in device scale
  g.save(); g.translate(x, y); g.scale(w, h); g.beginPath(); SIL[m](g); g.restore();
  g.strokeStyle = opt.dim ? "rgba(42,28,18,.4)" : INK; g.lineWidth = opt.lw || 1.5; g.lineJoin = "round"; g.stroke();
  // cork / lid detail for some
  g.save();
  if (m === M.EMBER) { // small tin box with a curved fuse and a spark at its end
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x + w * .06, y + h * .56); g.lineTo(x + w * .94, y + h * .56); g.stroke();
    g.lineCap = "round"; g.lineWidth = Math.max(1.3, w * .045); g.beginPath(); g.moveTo(x + w * .5, y + h * .42); g.bezierCurveTo(x + w * .5, y + h * .22, x + w * .86, y + h * .3, x + w * .76, y + h * .1); g.stroke();
    const sx = x + w * .76, sy = y + h * .08, sr = Math.min(w, h) * .13; g.lineWidth = Math.max(1.2, w * .04);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(sx - Math.cos(a) * sr, sy - Math.sin(a) * sr); g.lineTo(sx + Math.cos(a) * sr, sy + Math.sin(a) * sr); g.strokeStyle = i % 2 ? INK : "#d9582a"; g.stroke(); }
  }
  if (m === M.SEED) { // cord around the neck with a knot
    g.strokeStyle = INK; g.lineWidth = Math.max(1.3, w * .04); g.lineCap = "round";
    g.beginPath(); g.moveTo(x + w * .36, y + h * .3); g.lineTo(x + w * .64, y + h * .3); g.stroke();
    g.beginPath(); g.moveTo(x + w * .5, y + h * .3); g.quadraticCurveTo(x + w * .3, y + h * .36, x + w * .36, y + h * .43); g.moveTo(x + w * .5, y + h * .3); g.quadraticCurveTo(x + w * .72, y + h * .36, x + w * .64, y + h * .43); g.stroke();
    g.beginPath(); g.arc(x + w * .5, y + h * .3, Math.max(1.3, w * .045), 0, 7); g.fillStyle = INK; g.fill();
  }
  if (m === M.POWDER) { g.strokeStyle = INK; g.lineWidth = 1; for (const f of [.28, .8]) { g.beginPath(); g.moveTo(x + w * .03, y + h * f); g.lineTo(x + w * .97, y + h * f); g.stroke(); } }
  g.restore();
  // symbol
  const sc = SYMC[m], s = Math.min(w, h) * (m === M.EMBER ? .2 : .2);
  g.save(); g.translate(x + w * sc[0], y + h * sc[1]);
  g.globalAlpha = opt.dim ? 0.5 : 1;
  g.lineCap = "round"; g.lineJoin = "round";
  g.strokeStyle = PAPER; g.lineWidth = 4.2; g.fillStyle = PAPER; SYM[m](g, s);
  g.strokeStyle = INK; g.lineWidth = Math.max(1.3, w * 0.035); g.fillStyle = INK; SYM[m](g, s);
  g.restore();
}

// ---- reaction result icons (centered, half-size s) ----
function flame(g, s, col) {
  g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * .2, -s * .5, s * .85, -s * .1, s * .65, s * .45); g.bezierCurveTo(s * .5, s * .95, -s * .5, s * .95, -s * .65, s * .4); g.bezierCurveTo(-s * .8, -s * .05, -s * .25, -s * .35, 0, -s);
  g.closePath(); wash(g, col, .9); ink(g, 1.3);
  g.beginPath(); g.moveTo(0, s * .15); g.bezierCurveTo(s * .3, s * .35, s * .25, s * .7, 0, s * .72); g.bezierCurveTo(-s * .3, s * .7, -s * .3, s * .35, 0, s * .15); wash(g, "#f0b443", .95);
}
function drop(g, x, y, s, col) { g.beginPath(); g.moveTo(x, y - s); g.bezierCurveTo(x + s * .8, y, x + s * .7, y + s * .8, x, y + s * .8); g.bezierCurveTo(x - s * .7, y + s * .8, x - s * .8, y, x, y - s); wash(g, col, .85); ink(g, 1.1); }
function cloud(g, s, col) { g.beginPath(); g.moveTo(-s * .8, s * .2); g.bezierCurveTo(-s * 1.1, -s * .3, -s * .4, -s * .6, -s * .2, -s * .4); g.bezierCurveTo(0, -s * .9, s * .7, -s * .7, s * .6, -s * .1); g.bezierCurveTo(s * 1.1, -s * .1, s * 1.1, s * .3, s * .7, s * .3); g.lineTo(-s * .7, s * .3); g.closePath(); wash(g, col, .85); ink(g, 1.2); }
function wavy(g, x, y, s, n) { for (let i = 0; i < n; i++) { const dx = x + (i - (n - 1) / 2) * s * .55; g.beginPath(); g.moveTo(dx, y + s * .9); g.bezierCurveTo(dx + s * .4, y + s * .4, dx - s * .4, y, dx, y - s * .3); g.bezierCurveTo(dx + s * .35, y - s * .6, dx - s * .2, y - s * .8, dx, y - s); g.stroke(); } }
const RXICON = {
  burn: (g, s) => flame(g, s, COL.fire),
  blueflame: (g, s) => { // hollow outline flame + three short ticks + a sulfur mark in the middle
    g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * .2, -s * .5, s * .85, -s * .1, s * .65, s * .45); g.bezierCurveTo(s * .5, s * .95, -s * .5, s * .95, -s * .65, s * .4); g.bezierCurveTo(-s * .8, -s * .05, -s * .25, -s * .35, 0, -s); g.closePath();
    wash(g, "#f2ead2", .75); ink(g, 1.6); g.strokeStyle = COL.blue; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = COL.blue; g.lineWidth = 1.1; for (const dx of [-.32, 0, .32]) { g.beginPath(); g.moveTo(dx * s, -s * .38 + Math.abs(dx) * s * .5); g.lineTo(dx * s, -s * .08 + Math.abs(dx) * s * .4); g.stroke(); }
    g.save(); g.translate(0, s * .42); g.strokeStyle = INK; g.lineWidth = 1.1; const q = s * .26; tri(g, [[0, -q], [q * .8, q * .2], [-q * .8, q * .2]]); g.stroke(); g.beginPath(); g.moveTo(0, q * .2); g.lineTo(0, q * 1.1); g.moveTo(-q * .5, q * .7); g.lineTo(q * .5, q * .7); g.stroke(); g.restore();
  },
  blast: (g, s) => { g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? s * .5 : s; g[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); wash(g, "#e8752f", .92); ink(g, 1.3); g.beginPath(); g.arc(0, 0, s * .3, 0, 7); wash(g, "#f0d27a", .95); },
  steam: (g, s) => { g.strokeStyle = "#6c726e"; g.lineWidth = 1.6; g.lineCap = "round"; wavy(g, 0, 0, s, 3); },
  quench: (g, s) => { g.strokeStyle = "#6c726e"; g.lineWidth = 1.5; wavy(g, -s * .15, -s * .1, s * .85, 3); drop(g, s * .5, s * .5, s * .38, COL.water); },
  condense: (g, s) => { cloud(g, s * .9, "#d8dcd6"); for (const dx of [-.4, 0, .4]) { drop(g, dx * s, s * .78, s * .2, COL.water); } },
  melt: (g, s) => { tri(g, [[-s * .7, -s * .6], [s * .7, -s * .6], [s * .7, s * .15], [-s * .7, s * .15]]); wash(g, COL.ice, .85); ink(g, 1.3); g.beginPath(); g.moveTo(-s * .3, -s * .3); g.lineTo(0, -s * .1); g.stroke(); drop(g, 0, s * .62, s * .26, COL.water); },
  freeze: (g, s) => { g.lineWidth = 1.8; g.strokeStyle = "#4f8d97"; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(Math.cos(a) * s, Math.sin(a) * s); g.lineTo(-Math.cos(a) * s, -Math.sin(a) * s); g.stroke(); for (const d of [-1, 1]) { g.beginPath(); const bx = Math.cos(a) * s * .6 * d, by = Math.sin(a) * s * .6 * d; g.moveTo(bx, by); g.lineTo(bx + Math.cos(a + 2.2 * d) * s * .3, by + Math.sin(a + 2.2 * d) * s * .3); g.stroke(); } } },
  acidrain: (g, s) => { cloud(g, s * .9, COL.acid); for (const dx of [-.4, 0, .4]) { g.beginPath(); g.moveTo(dx * s, s * .55); g.lineTo(dx * s - s * .1, s * .95); ink(g, 1.4); } g.beginPath(); g.arc(s * .35, -s * .1, s * .16, 0, 7); g.fillStyle = INK; g.fill(); },
  solidify: (g, s) => { tri(g, [[-s * .9, s * .6], [-s * .6, -s * .3], [-s * .1, -s * .8], [s * .5, -s * .55], [s * .9, s * .1], [s * .7, s * .7]]); wash(g, COL.stone, .85); ink(g, 1.4); g.beginPath(); g.moveTo(-s * .1, -s * .8); g.lineTo(-s * .05, s * .2); g.lineTo(s * .7, s * .7); g.moveTo(-s * .6, -s * .3); g.lineTo(-s * .05, s * .2); ink(g, 1); },
  vitrify: (g, s) => { tri(g, [[0, -s], [s * .85, -s * .2], [s * .4, s * .9], [-s * .4, s * .9], [-s * .85, -s * .2]]); wash(g, COL.glass, .8); ink(g, 1.4); g.beginPath(); g.moveTo(-s * .85, -s * .2); g.lineTo(s * .85, -s * .2); g.moveTo(-s * .3, -s * .2); g.lineTo(-s * .4, s * .9); g.moveTo(s * .3, -s * .2); g.lineTo(s * .4, s * .9); ink(g, 1); },
  dissolve: (g, s) => { g.beginPath(); g.moveTo(-s * .8, -s * .8); g.lineTo(s * .8, -s * .8); g.lineTo(s * .8, s * .1); g.arc(s * .55, s * .1, s * .25, 0, Math.PI, false); g.lineTo(s * .05, s * .1); g.arc(-s * .15, s * .1, s * .2, 0, Math.PI, false); g.lineTo(-s * .8, s * .1); g.closePath(); wash(g, COL.sand, .8); ink(g, 1.4); drop(g, s * .55, s * .72, s * .2, COL.acid); drop(g, -s * .15, s * .6, s * .16, COL.acid); },
  bake: (g, s) => { g.beginPath(); g.moveTo(-s * .5, -s * .8); g.lineTo(s * .5, -s * .8); g.bezierCurveTo(s * 1.1, -s * .3, s * 1.0, s * .85, s * .5, s * .9); g.lineTo(-s * .5, s * .9); g.bezierCurveTo(-s * 1.0, s * .85, -s * 1.1, -s * .3, -s * .5, -s * .8); g.closePath(); wash(g, "#b0623a", .88); ink(g, 1.4); g.beginPath(); g.moveTo(-s * .8, 0); g.lineTo(s * .8, 0); g.moveTo(0, -s * .8); g.lineTo(0, 0); g.moveTo(-s * .4, 0); g.lineTo(-s * .4, s * .9); g.moveTo(s * .4, 0); g.lineTo(s * .4, s * .9); ink(g, 1); },
  bloom: (g, s) => { g.beginPath(); g.moveTo(0, s * .95); g.lineTo(0, -s * .1); ink(g, 1.6); for (const d of [-1, 1]) { g.beginPath(); g.moveTo(0, s * .25); g.quadraticCurveTo(d * s * 1.0, s * .2, d * s * .9, -s * .5); g.quadraticCurveTo(d * s * .1, -s * .35, 0, s * .25); wash(g, COL.plant, .9); ink(g, 1.3); } g.beginPath(); g.moveTo(0, -s * .1); g.quadraticCurveTo(s * .45, -s * .6, 0, -s * 1.0); g.quadraticCurveTo(-s * .45, -s * .6, 0, -s * .1); wash(g, "#8fbf4c", .95); ink(g, 1.2); },
  boil: (g, s) => { for (const [x, y, r] of [[-.35, .55, .3], [.35, .15, .4], [-.15, -.45, .28], [.45, -.75, .16]]) { g.beginPath(); g.arc(x * s, y * s, r * s, 0, 7); wash(g, "#cfe0e4", .6); ink(g, 1.3); } },
  fume: (g, s) => { g.strokeStyle = "#a89a2a"; g.lineWidth = 2.2; g.lineCap = "round"; wavy(g, 0, 0, s, 3); g.strokeStyle = INK; g.lineWidth = .9; wavy(g, 0, 0, s, 3); },
  lidpop: (g, s) => { g.beginPath(); g.ellipse(0, s * .55, s * .95, s * .26, 0, 0, 7); wash(g, "#a8774a", .95); ink(g, 1.4); g.beginPath(); g.moveTo(-s * .12, s * .3); g.lineTo(-s * .12, s * .12); g.lineTo(s * .12, s * .12); g.lineTo(s * .12, s * .3); ink(g, 1.2); for (const dx of [-.5, 0, .5]) { g.beginPath(); g.moveTo(dx * s, -s * .15); g.lineTo(dx * s, -s * .95); g.moveTo(dx * s - s * .2, -s * .65); g.lineTo(dx * s, -s * .95); g.lineTo(dx * s + s * .2, -s * .65); ink(g, 1.5); } },
};
function drawRx(g, type, x, y, s) { g.save(); g.translate(x, y); g.lineCap = "round"; g.lineJoin = "round"; (RXICON[type] || RXICON.burn)(g, s); g.restore(); }

// ---- tool and UI icons ----
function drawMatch(g, x, y, s, lit, count) {
  g.save(); g.translate(x, y); g.lineCap = "round"; g.lineJoin = "round";
  const n = Math.max(1, Math.min(4, count || 1));
  for (let i = 0; i < n; i++) {
    g.save(); g.rotate(-0.5 + (i - (n - 1) / 2) * 0.28); g.translate((i - (n - 1) / 2) * s * .22, 0);
    g.beginPath(); g.moveTo(0, -s * .55); g.lineTo(0, s * 1.0); g.strokeStyle = "#a8774a"; g.lineWidth = s * .22; g.stroke(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    g.beginPath(); g.ellipse(0, -s * .65, s * .22, s * .3, 0, 0, 7); wash(g, lit ? "#f0b443" : "#b8381e", 1); ink(g, 1.2);
    g.restore();
  }
  g.restore();
}
function drawLid(g, x, y, s, closed) {
  g.save(); g.translate(x, y + (closed ? s * .25 : 0));
  g.beginPath(); g.ellipse(0, 0, s * .95, s * .32, 0, 0, 7); wash(g, "#a8774a", .95); ink(g, 1.5);
  g.beginPath(); g.moveTo(-s * .2, -s * .1); g.quadraticCurveTo(0, -s * .62, s * .2, -s * .1); ink(g, 1.5);
  if (closed) { g.beginPath(); g.moveTo(-s * .95, s * .5); g.lineTo(s * .95, s * .5); ink(g, 1.4); } else { g.save(); g.globalAlpha = .55; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(-s * .95, s * .62); g.lineTo(s * .95, s * .62); ink(g, 1.2); g.restore(); }
  g.restore();
}
function drawHourglass(g, x, y, s) {
  g.save(); g.translate(x, y); g.rotate(Math.PI);
  g.beginPath(); g.moveTo(-s * .65, -s); g.lineTo(s * .65, -s); g.lineTo(s * .08, 0); g.lineTo(s * .65, s); g.lineTo(-s * .65, s); g.lineTo(-s * .08, 0); g.closePath(); wash(g, "rgba(246,238,214,.9)", 1); ink(g, 1.5);
  g.beginPath(); g.moveTo(-s * .4, -s * .85); g.lineTo(s * .4, -s * .85); g.lineTo(0, -s * .3); g.closePath(); wash(g, COL.sand, .9);
  g.beginPath(); g.moveTo(-s * .5, s * .95); g.lineTo(0, s * .2); g.lineTo(s * .5, s * .95); g.closePath(); wash(g, COL.sand, .9);
  g.beginPath(); g.moveTo(-s * .8, -s); g.lineTo(s * .8, -s); g.moveTo(-s * .8, s); g.lineTo(s * .8, s); ink(g, 2);
  g.restore();
}
function drawCoin(g, x, y, r, a) {
  g.save(); g.globalAlpha = a == null ? 1 : a; g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = COL.gold; g.fill(); ink(g, 1.4);
  g.beginPath(); g.arc(x, y, r * .62, 0, 7); g.strokeStyle = "rgba(42,28,18,.7)"; g.lineWidth = 1; g.stroke();
  g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .22, 0, 7); g.fillStyle = COL.goldHi; g.fill(); g.restore();
}
function drawSpeaker(g, x, y, s, on) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-s * .8, -s * .3); g.lineTo(-s * .3, -s * .3); g.lineTo(s * .2, -s * .8); g.lineTo(s * .2, s * .8); g.lineTo(-s * .3, s * .3); g.lineTo(-s * .8, s * .3); g.closePath(); wash(g, "#a8957a", .8); ink(g, 1.5);
  if (on) { for (const k of [.5, .95]) { g.beginPath(); g.arc(s * .2, 0, s * k, -0.8, 0.8); ink(g, 1.5); } }
  else { g.beginPath(); g.moveTo(s * .45, -s * .5); g.lineTo(s * 1.0, s * .5); g.moveTo(s * 1.0, -s * .5); g.lineTo(s * .45, s * .5); ink(g, 1.8); }
  g.restore();
}
function drawRestart(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.beginPath(); g.arc(0, 0, s * .8, -2.5, 3.6); g.strokeStyle = col || INK; g.lineWidth = s * .26; g.lineCap = "round"; g.stroke();
  g.beginPath(); g.moveTo(s * .55, -s * .95); g.lineTo(s * 1.0, -s * .35); g.lineTo(s * .2, -s * .3); g.closePath(); g.fillStyle = col || INK; g.fill(); g.restore();
}
function drawDoor(g, x, y, s) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.rect(-s * .9, -s, s * 1.2, s * 2); wash(g, "#a8774a", .9); ink(g, 1.6);
  g.beginPath(); g.arc(s * .05, s * .1, s * .08, 0, 7); g.fillStyle = INK; g.fill();
  g.beginPath(); g.moveTo(s * .55, 0); g.lineTo(s * 1.15, 0); g.moveTo(s * .9, -s * .3); g.lineTo(s * 1.2, 0); g.lineTo(s * .9, s * .3); ink(g, 2.2);
  g.restore();
}
function drawReroll(g, x, y, s) {
  g.save(); g.translate(x, y);
  for (const d of [0, Math.PI]) { g.save(); g.rotate(d); g.beginPath(); g.arc(0, 0, s * .75, -2.6, -0.3); ink(g, 2.2); g.beginPath(); g.moveTo(s * .55, -s * .95); g.lineTo(s * .95, -s * .25); g.lineTo(s * .3, -s * .35); g.closePath(); g.fillStyle = INK; g.fill(); g.restore(); }
  g.restore();
}
function drawPip(g, x, y, w, h, used) {
  g.save(); g.globalAlpha = used ? .28 : 1; g.beginPath(); g.moveTo(x + w * .38, y); g.lineTo(x + w * .62, y); g.lineTo(x + w * .62, y + h * .3); g.bezierCurveTo(x + w * 1.05, y + h * .4, x + w * 1.0, y + h, x + w * .5, y + h); g.bezierCurveTo(x, y + h, x - w * .05, y + h * .4, x + w * .38, y + h * .3); g.closePath(); g.fillStyle = used ? "rgba(0,0,0,0)" : "rgba(168,119,74,.8)"; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke(); g.restore();
}
function drawHand(g, x, y, k, press) { // fingertip at (x,y), pointing up
  g.save(); g.translate(x, y); g.scale(k, k); g.globalAlpha = .88; g.lineJoin = "round"; g.lineCap = "round";
  g.beginPath(); g.moveTo(-5, 7); g.quadraticCurveTo(-5, -1, 0, -1); g.quadraticCurveTo(5, -1, 5, 7); g.lineTo(5, 22);
  g.lineTo(12, 22); g.quadraticCurveTo(17, 22, 17, 27); g.lineTo(17, 44); g.quadraticCurveTo(17, 54, 7, 56); g.lineTo(-9, 56); g.quadraticCurveTo(-16, 54, -16, 44); g.lineTo(-16, 31); g.quadraticCurveTo(-21, 25, -17, 21); g.quadraticCurveTo(-13, 20, -9, 26); g.lineTo(-5, 28); g.closePath();
  g.fillStyle = "#f1e3c6"; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.6; g.stroke();
  g.beginPath(); g.moveTo(1, 30); g.lineTo(1, 38); g.moveTo(8, 30); g.lineTo(8, 38); g.lineWidth = 1; g.stroke();
  g.restore();
}
function drawSkull(g) {}
// ---- v0.4 icons: gear, book, dice, mud, gold, arrow, cross, six trait marks ----
function drawGear(g, x, y, s) {
  g.save(); g.translate(x, y); g.beginPath();
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = (i % 4 < 2) ? s : s * .76; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); wash(g, "#a8957a", .85); ink(g, 1.5); g.beginPath(); g.arc(0, 0, s * .32, 0, 7); wash(g, "rgba(246,238,214,.95)", 1); ink(g, 1.3); g.restore();
}
function drawBook(g, x, y, s) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-s * .8, -s * .85); g.lineTo(s * .7, -s * .85); g.lineTo(s * .7, s * .85); g.lineTo(-s * .8, s * .85); g.closePath(); wash(g, "#8a5a38", .9); ink(g, 1.5);
  g.beginPath(); g.moveTo(-s * .5, -s * .85); g.lineTo(-s * .5, s * .85); ink(g, 1.2);
  g.beginPath(); g.moveTo(-s * .2, -s * .35); g.lineTo(s * .45, -s * .35); g.moveTo(-s * .2, -s * .05); g.lineTo(s * .45, -s * .05); g.strokeStyle = PAPER; g.lineWidth = 1.2; g.stroke();
  g.restore();
}
function drawDice(g, x, y, s) {
  g.save(); g.translate(x, y); g.rotate(-.18);
  g.beginPath(); g.moveTo(-s * .7, -s * .9); g.lineTo(s * .7, -s * .9); g.quadraticCurveTo(s * .95, -s * .9, s * .95, -s * .65); g.lineTo(s * .95, s * .65); g.quadraticCurveTo(s * .95, s * .9, s * .7, s * .9); g.lineTo(-s * .7, s * .9); g.quadraticCurveTo(-s * .95, s * .9, -s * .95, s * .65); g.lineTo(-s * .95, -s * .65); g.quadraticCurveTo(-s * .95, -s * .9, -s * .7, -s * .9); g.closePath();
  wash(g, "rgba(246,238,214,.95)", 1); ink(g, 1.6);
  for (const [px, py] of [[-.5, -.5], [.5, -.5], [0, 0], [-.5, .5], [.5, .5]]) { g.beginPath(); g.arc(px * s, py * s, s * .16, 0, 7); g.fillStyle = INK; g.fill(); }
  g.restore();
}
function drawMud(g, x, y, s) {
  g.save(); g.translate(x, y); g.beginPath(); g.moveTo(-s, s * .6); g.bezierCurveTo(-s * 1.1, -s * .2, -s * .4, -s * .9, s * .1, -s * .7); g.bezierCurveTo(s * .8, -s * .8, s * 1.15, s * .1, s * .9, s * .6); g.closePath(); wash(g, COL.mud, .95); ink(g, 1.4);
  g.fillStyle = "rgba(42,28,18,.55)"; for (const [px, py] of [[-.35, .1], [.25, -.2], [.35, .3]]) { g.beginPath(); g.arc(px * s, py * s, s * .1, 0, 7); g.fill(); } g.restore();
}
function drawGoldPile(g, x, y, s) {
  g.save(); g.translate(x, y); g.beginPath(); g.moveTo(-s, s * .7); g.lineTo(-s * .35, -s * .1); g.lineTo(0, -s * .75); g.lineTo(s * .4, -s * .05); g.lineTo(s, s * .7); g.closePath(); wash(g, COL.gold, .95); ink(g, 1.4);
  g.fillStyle = COL.goldHi; for (const [px, py] of [[-.1, -.25], [.3, .2], [-.45, .35]]) { g.beginPath(); g.arc(px * s, py * s, s * .1, 0, 7); g.fill(); } g.restore();
}
function drawArrow(g, x, y, s) { g.save(); g.translate(x, y); g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.moveTo(s * .45, -s * .5); g.lineTo(s, 0); g.lineTo(s * .45, s * .5); ink(g, 1.6); g.restore(); }
function drawCross(g, x, y, s, col) { g.save(); g.translate(x, y); g.beginPath(); g.moveTo(-s, -s); g.lineTo(s, s); g.moveTo(s, -s); g.lineTo(-s, s); g.strokeStyle = col || "#b8381e"; g.lineWidth = 2; g.lineCap = "round"; g.stroke(); g.restore(); }
const TRAITS = ["burst", "sustain", "chain", "break", "residue", "catalyst"];
function drawTrait(g, name, x, y, s) { // fixed shape marks, readable at 16px without colour
  g.save(); g.translate(x, y); g.lineCap = "round"; g.lineJoin = "round"; g.fillStyle = INK;
  if (name === "burst") { g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, r = i % 2 ? s * .42 : s; g[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); wash(g, "#e8752f", .9); ink(g, 1.4); }
  else if (name === "sustain") { for (const dy of [-.6, 0, .6]) { g.beginPath(); g.moveTo(-s, dy * s); g.quadraticCurveTo(-s * .5, dy * s - s * .45, 0, dy * s); g.quadraticCurveTo(s * .5, dy * s + s * .45, s, dy * s); ink(g, 1.6); } }
  else if (name === "chain") { for (const dx of [-.42, .42]) { g.beginPath(); g.ellipse(dx * s, 0, s * .6, s * .42, 0, 0, 7); ink(g, 1.7); } }
  else if (name === "break") { g.beginPath(); g.rect(-s * .85, -s * .85, s * 1.7, s * 1.7); wash(g, "rgba(246,238,214,.95)", 1); ink(g, 1.5); g.beginPath(); g.moveTo(-s * .1, -s * .85); g.lineTo(s * .15, -s * .3); g.lineTo(-s * .2, s * .1); g.lineTo(s * .2, s * .85); ink(g, 1.6); }
  else if (name === "residue") { g.beginPath(); g.rect(-s * .8, -s * .85, s * 1.6, s * 1.4); wash(g, COL.stone, .85); ink(g, 1.5); g.beginPath(); g.moveTo(-s, s * .9); g.lineTo(s, s * .9); ink(g, 2); }
  else if (name === "catalyst") { g.beginPath(); g.arc(0, 0, s * .85, 0, 7); ink(g, 1.7); g.beginPath(); g.arc(0, 0, s * .22, 0, 7); g.fill(); }
  g.restore();
}
// ---- arcana badges: a reaction icon + a modifier number ----
const ARC_ICON = {
  pyro: ["burn", "+2"], tower: ["quench", "×3"], glass: ["vitrify", "+1"], demolition: ["blast", "+12"], greenhouse: ["bloom", "×3"],
  alkahest: ["dissolve", "%"], nozzle: ["vial", "×1.5"], hotplate: ["boil", "+1"], spare: ["vial", "+1"], magma: ["solidify", "+20"],
  freezer: ["freeze", "×10"], matchbox: ["match", "+1"], thickglass: ["lidpop", "×2"], ashes: ["burn", "="], scorched: ["burn", "×2"], popritual: ["lidpop", "×3"],
};
function drawBadge(g, id, x, y, r, rare, dim) {
  const [ic, tag] = ARC_ICON[id];
  g.save(); g.translate(x, y); g.globalAlpha = dim ? .4 : 1;
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = "rgba(246,238,214,.92)"; g.fill();
  g.strokeStyle = rare ? COL.gold : INK; g.lineWidth = rare ? 2.6 : 1.6; g.stroke();
  if (rare) { g.beginPath(); g.arc(0, 0, r - 3, 0, 7); g.lineWidth = 1; g.strokeStyle = INK; g.stroke(); }
  if (ic === "vial") drawVial(g, M.WATER, -r * .32, -r * .55, r * .64, r * 1.0, {});
  else if (ic === "match") drawMatch(g, 0, -r * .05, r * .5, false, 1);
  else drawRx(g, ic, 0, -r * .08, r * .5);
  g.restore();
  g.save(); g.translate(x, y);
  if (tag && r >= 12) { const tw = numWidth(tag, r * .5) + 4; g.beginPath(); g.rect(r * .85 - tw, r * .45, tw, r * .6); g.fillStyle = "rgba(246,238,214,.95)"; g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); drawNum(g, tag, r * .85 - tw / 2, r * .75, r * .42, { color: "#b8381e" }); }
  g.restore();
}
