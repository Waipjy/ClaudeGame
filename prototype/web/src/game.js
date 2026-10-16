(function () {
"use strict";
const { W, H, M, KIND, RX, RXK, RULES, createRound, scoreLedger, ptsOf, mulberry32 } = window.PDSim;
const ICP = 3;           // ink-layer pixels per cell (fixed); on screen it is scaled to L.cp
const LW = 390;          // logical width; logical height follows the window (600..880)

// ---- text guard: nothing in this game draws text. Any fillText / strokeText is a violation (digits go through drawNum). ----
for (const k of ["fillText", "strokeText"]) {
  const o = CanvasRenderingContext2D.prototype[k];
  CanvasRenderingContext2D.prototype[k] = function (t) { window.__textViolations.push(String(t)); console.error("text-violation: " + t); return o.apply(this, arguments); };
}

// ---------------- content ----------------
const ARCANA = [
  { id: "pyro", price: 5 }, { id: "tower", price: 6 }, { id: "glass", price: 6 }, { id: "demolition", price: 6 }, { id: "greenhouse", price: 5 },
  { id: "alkahest", price: 5 }, { id: "nozzle", price: 7 }, { id: "hotplate", price: 5 }, { id: "spare", price: 7 }, { id: "magma", price: 5 },
  { id: "freezer", price: 5 }, { id: "matchbox", price: 5 }, { id: "thickglass", price: 6 }, { id: "ashes", price: 6 },
  { id: "scorched", price: 9, rare: true }, { id: "popritual", price: 9, rare: true },
];
const ACT_COL = ["#3b3228", "#efe9d8", "#d4a62a", "#b8381e"];
const ACT_TINT = [[0.96, 0.95, 0.93], [1, 1, 1], [1, 0.97, 0.88], [1, 0.93, 0.90]];
const TARGETS = [20000, 30000, 45000, 65000, 90000, 120000, 160000, 210000, 270000, 350000, 450000, 600000];
const START_DECK = [M.SAND, M.SAND, M.WATER, M.WATER, M.OIL, M.EMBER, M.SULFUR, M.LAVA];
const FIRST_HAND = [M.WATER, M.LAVA, M.OIL, M.SULFUR];
const FIRST_DRAW = [M.SAND, M.EMBER, M.SAND, M.WATER];
const SHOP_VIALS = [M.ACID, M.POWDER, M.ICE, M.SEED, M.LAVA, M.OIL, M.WATER, M.SULFUR, M.SAND, M.EMBER];
const HAND = 4, BASE_POURS = 4, BASE_MATCHES = 2, MAX_ARC = 5;
const FLAMMABLE = [M.OIL, M.PLANT, M.SEED, M.SULFUR, M.POWDER];
const DISCOVER = { burn: [M.OIL, M.EMBER], blueflame: [M.SULFUR, M.EMBER], blast: [M.POWDER, M.EMBER], quench: [M.WATER, M.EMBER], condense: [M.WATER, M.WATER],
  melt: [M.ICE, M.LAVA], freeze: [M.WATER, M.ICE], acidrain: [M.SULFUR, M.WATER], solidify: [M.LAVA, M.WATER], vitrify: [M.SAND, M.LAVA], dissolve: [M.ACID, M.SAND],
  bake: [M.LAVA, M.SAND], bloom: [M.SEED, M.WATER], boil: [M.WATER, M.LAVA], fume: [M.SULFUR, M.EMBER], lidpop: [M.EMBER, M.EMBER] };
// what a falling material does to what it lands on (used for the ghost preview only)
const PRE = {
  [M.LAVA]: { [M.WATER]: ["solidify", "steam"], [M.ICE]: ["melt", "solidify"], [M.SAND]: ["vitrify"], [M.MUD]: ["bake"], [M.OIL]: ["burn"], [M.PLANT]: ["burn"], [M.SEED]: ["burn"], [M.SULFUR]: ["blueflame"], [M.POWDER]: ["blast"] },
  [M.WATER]: { [M.SEED]: ["bloom"], [M.PLANT]: ["bloom"], [M.ICE]: ["freeze"], [M.FIRE]: ["quench", "steam"], [M.LAVA]: ["solidify", "steam"] },
  [M.ACID]: { [M.SAND]: ["dissolve"], [M.STONE]: ["dissolve"], [M.GLASS]: ["dissolve"], [M.ICE]: ["dissolve"], [M.PLANT]: ["dissolve"], [M.SEED]: ["dissolve"], [M.POWDER]: ["dissolve"], [M.MUD]: ["dissolve"] },
  [M.OIL]: { [M.FIRE]: ["burn"], [M.LAVA]: ["burn"] },
  [M.POWDER]: { [M.FIRE]: ["blast"], [M.LAVA]: ["blast"] },
  [M.ICE]: { [M.WATER]: ["freeze"], [M.LAVA]: ["melt"], [M.FIRE]: ["melt"] },
  [M.SEED]: { [M.WATER]: ["bloom"], [M.LAVA]: ["burn"], [M.FIRE]: ["burn"] },
  [M.SAND]: { [M.LAVA]: ["vitrify"], [M.ACID]: ["dissolve"] },
  [M.EMBER]: { [M.OIL]: ["burn"], [M.SULFUR]: ["blueflame"], [M.POWDER]: ["blast"], [M.SEED]: ["burn"], [M.PLANT]: ["burn"] },
  [M.SULFUR]: { [M.FIRE]: ["blueflame"], [M.LAVA]: ["blueflame"] },
};

// ---------------- state ----------------
const canvas = document.getElementById("view");
const ctx = canvas.getContext("2d");
let DPR = Math.min(2, window.devicePixelRatio || 1);
let G = null, R = null, L = null;
const QS = new URLSearchParams(location.search);
const tintC = document.createElement("canvas"); tintC.width = W; tintC.height = H;
const tctx = tintC.getContext("2d");
const softC = document.createElement("canvas"); softC.width = W / 2; softC.height = H / 2; const sctx = softC.getContext("2d");
const tintImg = tctx.createImageData(W, H);
const inkC = document.createElement("canvas"); inkC.width = W * ICP; inkC.height = H * ICP; const ictx = inkC.getContext("2d");
const inkImg = ictx.createImageData(W * ICP, H * ICP), ink32 = new Uint32Array(inkImg.data.buffer);
let bgC = null, bgS = null, WASH_BLUR = !QS.has("noblur");
const fx = { floats: [], buckets: new Map(), chains: [], gold: [], tallyQ: [], tally: null, lidFly: null, shake: 0, disc: [], coins: [], bump: {} };
const meta = new Map();
const seen = new Set();
let mode = "play"; // play | shop | lose | win
let soundOn = true, AC = null, lastBeep = {};
const ptr = { x: -1, y: -1, down: false, type: "mouse", inside: false };
let D = null; // active drag
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeIn = t => t * t * t, easeOut = t => 1 - Math.pow(1 - t, 3);
const backOut = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const NOW = () => performance.now();

/*GLYPHS*/
/*CORE*/

// ---------------- layout ----------------
function layout() {
  const iw = window.innerWidth, ih = window.innerHeight;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  let sc = Math.min(iw / LW, (ih * 0.5625 * 1.0001) / LW);
  if (ih / sc < 600) sc = ih / 600;
  const Hl = Math.min(880, ih / sc);
  const cssW = LW * sc, cssH = Hl * sc;
  canvas.style.width = cssW + "px"; canvas.style.height = cssH + "px";
  canvas.width = Math.round(cssW * DPR); canvas.height = Math.round(cssH * DPR);
  const bx = 8, rightW = 60;
  const availTop = 72, availBot = Hl - 214;
  const cp = Math.min((LW - bx - 12 - rightW) / W, (availBot - availTop) / H);
  const bw = W * cp, bh = H * cp, by = availTop + (availBot - availTop - bh) / 2;
  const rx0 = bx + bw + 8, rcx = rx0 + (LW - 8 - rx0) / 2;
  L = { sc, Hl, cssW, cssH, cp, bx, by, bw, bh, rx0, rcx, rw: LW - 8 - rx0,
        handY: Hl - 186, handH: 106, actY: Hl - 72, actH: 60, pipY: Hl - 208 };
  L.slot = i => { const w = (LW - 16 - 18) / 4; return { x: 8 + i * (w + 6), y: L.handY, w, h: L.handH }; };
  L.btn = { match: { x: 8, y: L.actY, w: 118, h: L.actH }, lid: { x: 136, y: L.actY, w: 118, h: L.actH }, seal: { x: 264, y: L.actY, w: 118, h: L.actH }, sound: { x: 236, y: 0, w: 44, h: 44 } };
  // right column
  L.dial = { cx: rcx, cy: by + 40, r: Math.min(26, L.rw / 2 + 2) };
  L.elY = i => by + 78 + i * 25;
  L.baseY = by + 188; L.multY = by + 207;
  const fTop = by + 226, fBot = by + bh;
  const fr = Math.min(L.rw / 2 + 1, (fBot - fTop) * 0.34);
  L.flask = { cx: rcx, r: fr, neckW: fr * 0.28, neckTop: fTop, cy: fBot - fr - 2, bottom: fBot - 2 };
  L.shopOY = Math.max(0, (Hl - 693) * 0.4);
  buildBg();
}
const toLogical = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / L.sc, (e.clientY - r.top) / L.sc]; };
const cellX = cx => L.bx + (cx + 0.5) * L.cp, cellY = cy => L.by + (cy + 0.5) * L.cp;
const pxToCell = (x, y) => [Math.floor((x - L.bx) / L.cp), Math.floor((y - L.by) / L.cp)];
const inRect = (x, y, r, pad) => { pad = pad || 0; return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad; };
function clientOf(lx, ly) { const r = canvas.getBoundingClientRect(); return [r.left + lx * L.sc, r.top + ly * L.sc]; }

// ---------------- static background ----------------
function wobbleRect(g, x, y, w, h, seed, lw) {
  const r = mulberry32(seed); const j = () => (r() - 0.5) * 1.6;
  g.beginPath(); g.moveTo(x + j(), y + j()); g.lineTo(x + w + j(), y + j()); g.lineTo(x + w + j(), y + h + j()); g.lineTo(x + j(), y + h + j()); g.lineTo(x + j() - 0.5, y + j() - 1); g.lineWidth = lw || 1.4; g.stroke();
}
function buildBg() {
  if (!paperTile) { paperTile = makePaperTile(); document.body.style.backgroundImage = `url(${paperTile.toDataURL()})`; }
  bgC = document.createElement("canvas"); bgC.width = canvas.width; bgC.height = canvas.height;
  const g = bgC.getContext("2d"); g.setTransform(DPR * L.sc, 0, 0, DPR * L.sc, 0, 0);
  g.fillStyle = g.createPattern(paperTile, "repeat"); g.fillRect(0, 0, LW, L.Hl);
  const tint = ACT_TINT[G ? Math.min(3, Math.floor(G.round / 3)) : 0];
  g.globalCompositeOperation = "multiply"; g.fillStyle = `rgb(${tint[0] * 255},${tint[1] * 255},${tint[2] * 255})`; g.fillRect(0, 0, LW, L.Hl); g.globalCompositeOperation = "source-over";
  const r0 = mulberry32(99 + (G ? G.round : 0));
  for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(140,96,48,${0.03 + r0() * 0.05})`; g.beginPath(); g.arc(r0() * LW, r0() * L.Hl, 2 + r0() * 8, 0, 7); g.fill(); }
  bgS = document.createElement("canvas"); bgS.width = bgC.width; bgS.height = bgC.height; bgS.getContext("2d").drawImage(bgC, 0, 0);
  g.strokeStyle = INK; g.fillStyle = INK; g.lineCap = "round"; g.lineJoin = "round";
  const { bx, by, bw, bh, cp } = L;
  // beaker glass: double wall with hatching, thick base, little spout
  const ix = bx + cp, iw = bw - 2 * cp, iy = by, ih = bh - cp;
  g.lineWidth = 2.2; g.beginPath(); g.moveTo(ix - 3, iy - 6); g.lineTo(ix - 3, iy + ih + 3); g.lineTo(ix + iw + 3, iy + ih + 3); g.lineTo(ix + iw + 3, iy - 6); g.stroke();
  g.lineWidth = 0.8; g.beginPath(); g.moveTo(ix - 7, iy - 4); g.lineTo(ix - 7, iy + ih + 7); g.lineTo(ix + iw + 7, iy + ih + 7); g.lineTo(ix + iw + 7, iy - 4); g.stroke();
  g.save(); g.globalAlpha = 0.5; g.lineWidth = 0.7;
  for (let y = iy; y < iy + ih; y += 5) { g.beginPath(); g.moveTo(ix - 7, y); g.lineTo(ix - 3, y + 2.5); g.stroke(); g.beginPath(); g.moveTo(ix + iw + 3, y); g.lineTo(ix + iw + 7, y + 2.5); g.stroke(); }
  g.restore();
  g.lineWidth = 1.6; g.beginPath(); g.moveTo(ix - 9, iy - 6); g.lineTo(ix - 3, iy - 6); g.moveTo(ix + iw + 3, iy - 6); g.lineTo(ix + iw + 9, iy - 8); g.stroke();
  for (let i = 1; i <= 7; i++) { const y = iy + ih - i * (ih / 8); g.lineWidth = i % 2 ? 1 : 1.6; g.beginPath(); g.moveTo(ix + iw - (i % 2 ? 7 : 12), y); g.lineTo(ix + iw, y); g.stroke(); }
  // hand slots and buttons
  g.strokeStyle = "rgba(42,28,18,.75)";
  for (let i = 0; i < HAND; i++) { const s = L.slot(i); wobbleRect(g, s.x, s.y, s.w, s.h, 10 + i, 1.2); }
  for (const k of ["match", "lid", "seal"]) { const b = L.btn[k]; wobbleRect(g, b.x, b.y, b.w, b.h, 30 + k.length, 1.5); }
  // dial frame
  const d = L.dial; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.arc(d.cx, d.cy, d.r, Math.PI, 0); g.lineTo(d.cx + d.r, d.cy + 4); g.lineTo(d.cx - d.r, d.cy + 4); g.closePath(); g.stroke();
  for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; g.lineWidth = i % 2 ? 0.8 : 1.3; g.beginPath(); g.moveTo(d.cx + Math.cos(a) * d.r * 0.78, d.cy + Math.sin(a) * d.r * 0.78); g.lineTo(d.cx + Math.cos(a) * d.r * 0.95, d.cy + Math.sin(a) * d.r * 0.95); g.stroke(); }
  g.fillStyle = "rgba(184,56,30,.35)"; g.beginPath(); g.arc(d.cx, d.cy, d.r * 0.74, Math.PI * 1.8, Math.PI * 2); g.lineTo(d.cx, d.cy); g.closePath(); g.fill();
  // hatch shading in flask drawn dynamically
}
function flaskPath(g) {
  const f = L.flask; g.beginPath();
  g.moveTo(f.cx - f.neckW, f.neckTop); g.lineTo(f.cx - f.neckW, f.cy - f.r * 0.88);
  g.arc(f.cx, f.cy, f.r, -Math.PI / 2 - 0.34, Math.PI * 1.5 + 0.34, true); g.lineTo(f.cx + f.neckW, f.neckTop);
}
function flaskY(frac) { const f = L.flask; return f.bottom - Math.min(1.02, frac) * (f.bottom - f.neckTop - 10); }

// ---------------- audio ----------------
const NOTE = { burn: 196, blueflame: 233, quench: 392, solidify: 131, dissolve: 523, blast: 82, vitrify: 659, melt: 440, freeze: 784, bloom: 330, condense: 587, boil: 247, acidrain: 698, bake: 165, fume: 294, lidpop: 60 };
function ensureAudio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === "suspended") AC.resume().catch(() => {}); }
function tone(f, dur, type, vol, slide) {
  if (!soundOn || !AC) return;
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type || "triangle"; o.frequency.value = f;
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), AC.currentTime + dur);
  g.gain.setValueAtTime(vol || 0.05, AC.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
  o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + dur + 0.02);
}
function sfx(type, force) {
  if (!soundOn || !AC) return;
  const n = NOW(); if (!force && n - (lastBeep[type] || 0) < 110) return; lastBeep[type] = n;
  const big = type === "blast" || type === "lidpop";
  tone((NOTE[type] || 300) * (0.95 + Math.random() * 0.1), big ? 0.3 : 0.08, big ? "sawtooth" : "triangle", big ? 0.15 : 0.035);
}
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

// ---------------- game flow ----------------
function newGame(seed) {
  G = { seed: seed || ((Math.random() * 1e9) | 0), round: 0, money: 4, shownMoney: 4, deck: START_DECK.slice(), arc: [], draw: [], hand: [], disc: [], sel: -1, matchMode: false,
        pourP: null, holding: false, shopItems: [], reroll: 1, displayGold: 0, ended: false, tut: 0, lidUsed: false, idleSince: NOW(), pourN: 0, shake: {}, lineFlash: 0, reachedFlag: false, slideIn: {} };
  G.rng = mulberry32(G.seed);
  startRound();
}
function mods() { const o = {}; for (const c of G.arc) o[c] = true; return o; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (G.rng() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function startRound() {
  mode = "play";
  const md = mods();
  R = createRound({ seed: G.seed + G.round * 101, mods: md, pours: BASE_POURS + (md.spare ? 1 : 0), matches: BASE_MATCHES + (md.matchbox ? 1 : 0), target: TARGETS[G.round], lidMax: md.thickglass ? 1120 : 800 });
  R.onOpen = onOpen; R.onClose = onClose; R.onRx = onRx; R.S.onLidPop = onLidPop;
  if (G.round === 0) { G.hand = FIRST_HAND.slice(); G.draw = FIRST_DRAW.slice().reverse(); G.disc = []; G.tut = 0; }
  else { G.tut = 9; G.draw = shuffle(G.deck.slice()); G.hand = []; G.disc = []; while (G.hand.length < HAND && G.draw.length) G.hand.push(G.draw.pop()); }
  G.sel = -1; G.matchMode = false; G.pourP = null; G.holding = false; G.displayGold = 0; G.ended = false; G.reachedFlag = false; G.lidUsed = false; G.pourN = 0; G.idleSince = NOW();
  fx.floats = []; fx.buckets.clear(); fx.chains = []; fx.gold = []; fx.tallyQ = []; fx.tally = null; fx.lidFly = null; fx.disc = []; fx.coins = [];
  meta.clear(); gasHist.length = 0; D = null;
  for (let i = 0; i < HAND; i++) G.slideIn[i] = NOW() + i * 70;
  buildBg();
}
// tutorial: which vials may be used right now (round 1 only). 0 water, 1 lava, 2 oil/sulfur, 3 match (oil/sulfur still ok), 9 free
function slotAllowed(i) {
  const m = G.hand[i]; if (m === undefined) return false;
  if (G.tut >= 9) return true;
  if (G.tut === 0) return m === M.WATER;
  if (G.tut === 1) return m === M.LAVA;
  return m === M.OIL || m === M.SULFUR;
}
function matchAllowed() { return R.matches > 0 && (G.tut >= 3); }
function lidAllowed() { return G.tut >= 9; }
function sealAllowed() { return G.tut >= 9; }
function advanceTut(ev, mat) {
  if (G.tut === 0 && ev === "pour" && mat === M.WATER) G.tut = 1;
  else if (G.tut === 1 && ev === "pour" && mat === M.LAVA) G.tut = 2;
  else if (G.tut === 2 && ev === "pour" && mat === M.OIL) G.tut = 3;
  else if (G.tut === 3 && (ev === "match" || ev === "fire")) G.tut = 9;
  G.idleSince = NOW();
}

// ---------------- ledger callbacks ----------------
function onOpen(Lg) { meta.set(Lg.uid, { sx: 0, sy: 0, sn: 0, genPos: [] }); }
function onRx(Lg, type, p, g) {
  const m = meta.get(Lg.uid); if (!m) return;
  const x = p % W, y = (p / W) | 0;
  m.sx += x; m.sy += y; m.sn++;
  const gp = m.genPos[g] || (m.genPos[g] = { x: 0, y: 0, n: 0 });
  gp.x += x; gp.y += y; gp.n++;
  if (gp.n === 1 && g >= 2 && m.genPos[g - 1] && Math.hypot(m.genPos[g - 1].x / m.genPos[g - 1].n - x, m.genPos[g - 1].y / m.genPos[g - 1].n - y) < 40) {
    const pp = m.genPos[g - 1]; fx.chains.push({ g, from: [pp.x / pp.n, pp.y / pp.n], toRef: gp, born: NOW() }); if (fx.chains.length > 6) fx.chains.shift();
  }
  let b = null;
  for (const bb of fx.buckets.values()) {
    if (bb.uid !== Lg.uid || bb.type !== type) continue;
    const dx = bb.x / bb.n - x, dy = bb.y / bb.n - y;
    if (dx * dx + dy * dy < 20 * 20 || fx.buckets.size + fx.floats.length >= 12) { b = bb; break; }
  }
  if (!b) { b = { uid: Lg.uid, type, n: 0, x: 0, y: 0, t0: NOW() }; fx.buckets.set(fx.bucketId = (fx.bucketId || 0) + 1, b); }
  b.n++; b.x += x; b.y += y;
  if (type === "blast" || type === "lidpop") fx.shake = Math.min(7, fx.shake + (type === "lidpop" ? 1.2 : 0.5));
  sfx(type);
}
function flushBuckets(now) {
  for (const [k, b] of fx.buckets) {
    if (now - b.t0 < 450) continue;
    fx.buckets.delete(k);
    if (b.n < 3 && fx.floats.length >= 4 && b.type !== "lidpop") continue;
    const val = b.n * ptsOf(b.type, R.mods);
    const fw = 16 + numWidth("+" + fmt(val), 10) / L.cp * 1.0; // cells
    let fx0 = b.x / b.n, fy0 = b.y / b.n, placed = false;
    for (let tries = 0; tries < 8; tries++) {
      let hit = false;
      for (const o of fx.floats) { const oy = o.y - (now - o.born) / 1000 * 30 / L.cp; if (Math.abs(o.x - fx0) < (fw + o.w) / 2 && Math.abs(oy - fy0) < 6) { hit = true; break; } }
      if (!hit) { placed = true; break; } fy0 -= 6;
    }
    if (!placed && b.type !== "lidpop" && b.type !== "blast") continue;
    const first = !seen.has(b.type); seen.add(b.type);
    fx.floats.push({ type: b.type, val, w: fw, x: clamp(fx0, fw / 2, W - fw / 2), y: Math.max(8, fy0), born: now, big: b.type === "lidpop" || b.type === "blast" });
    if (first) fx.disc.push({ type: b.type, x: clamp(fx0, 14, W - 14), y: Math.max(14, fy0 - 10), born: now });
  }
  while (fx.floats.length > 12) fx.floats.shift();
}
function onClose(Lg) {
  const m = meta.get(Lg.uid);
  if (G.tut === 3 && Lg.result.rows.some(r => r.type === 'burn' || r.type === 'blueflame' || r.type === 'blast')) advanceTut('fire');
  if (Lg.result.gold <= 0) return;
  fx.tallyQ.push({ Lg, res: Lg.result, cx: m && m.sn ? m.sx / m.sn : (Lg.x || W / 2), cy: m && m.sn ? m.sy / m.sn : H / 2 });
}
function onLidPop() { fx.lidFly = { born: NOW(), vx: (R.S.rnd() - 0.5) * 6 }; fx.shake = 9; sfx("lidpop", true); buzz(60); }

// ---- scoring animation, in calculation order (Balatro): base numbers fly to the element column, x multiplier lands, they collide into gold, gold sand flows into the receiver ----
function startTally(now) {
  const q = fx.tallyQ.shift(); if (!q) return;
  const res = q.res, rows = res.rows.slice();
  if (res.stale) rows.push({ type: "stale", sub: res.stale });
  const chips = rows.slice(0, 6); if (rows.length > 6) chips[5] = { type: rows[5].type, sub: rows.slice(5).reduce((a, r) => a + r.sub, 0) };
  const elOf = r => (RX[r.type] ? RX[r.type].el : []);
  fx.tally = { t0: now, res, cx: q.cx, cy: q.cy, chips, elOf, k: fx.tallyQ.length > 1 ? 1.7 : 1, base: 0, shown: 0, landed: 0, phase: 0, lit: [0, 0, 0, 0], pop: [0, 0, 0, 0], multPop: 0, goldPop: 0, spawned: false };
}
const T_STAGGER = 110, T_FLY = 350;
function updateTally(now) {
  if (!fx.tally && fx.tallyQ.length) startTally(now);
  const T = fx.tally; if (!T) return;
  const t = (now - T.t0) * T.k;
  const B = { x: L.rcx, y: L.baseY }, Mx = { x: L.rcx, y: L.multY };
  T.chips.forEach((c, i) => {
    if (!c.done && t >= i * T_STAGGER + T_FLY) {
      c.done = true; T.base += c.sub; T.landed++; T.basePop = now;
      for (const e of T.elOf(c)) { T.lit[e] = 1; T.pop[e] = now; }
      tone(330 * Math.pow(2, i / 12 * 1.0 * 2), 0.09, "triangle", 0.05);
    }
  });
  const tA = (T.chips.length - 1) * T_STAGGER + T_FLY;
  if (t >= tA + 150 && !T.multShown) { T.multShown = true; T.multPop = now; for (let e = 0; e < 4; e++) if (T.res.lit[e]) { T.lit[e] = 1; T.pop[e] = now; } tone(180, 0.18, "square", 0.04); }
  const tC = tA + 150 + 520;
  if (t >= tC + 260 && !T.goldShown) {
    T.goldShown = true; T.goldPop = now;
    fx.shake = Math.max(fx.shake, Math.min(7, 1.2 + Math.log10(Math.max(10, T.res.gold) / 100) * 1.4));
    tone(220, 0.35, "sawtooth", 0.06, 2.2); tone(440, 0.4, "triangle", 0.05); buzz(25);
  }
  if (T.goldShown && !T.spawned && t >= tC + 260 + 450) { T.spawned = true; T.spawnAt = now; spawnGold(T); }
  if (T.spawned && now - T.spawnAt > 450) fx.tally = null;
}
function tallyGeom(T, now) { // positions of everything at time now
  const t = (now - T.t0) * T.k;
  const tA = (T.chips.length - 1) * T_STAGGER + T_FLY, tC = tA + 150 + 520;
  const C = { x: L.bx + L.bw * 0.5, y: L.by + L.bh * 0.3 };
  return { t, tA, tC, C };
}
function spawnGold(T) {
  const gold = T.res.gold;
  const k = clamp(Math.round(gold / (R.target / 28)), 8, 44);
  const now = NOW(), C = { x: L.bx + L.bw * 0.5, y: L.by + L.bh * 0.3 };
  for (let i = 0; i < k; i++) fx.gold.push({ x0: C.x + (Math.random() - 0.5) * 30, y0: C.y + (Math.random() - 0.5) * 12, born: now + i * 22, v: gold / k, done: false, dur: 800 + Math.random() * 250, spread: (Math.random() - 0.5) });
  if (gold >= 0) tone(520, 0.12, "triangle", 0.04);
}

// ---------------- input ----------------
function dropCol(tipX) { return clamp(Math.round((tipX - L.bx) / L.cp - 0.5), 5, W - 6); }
function tipOf() { const off = ptr.type === "touch" || ptr.type === "pen" ? 66 : 22; return { x: D.x, y: D.y - off, off }; }
function inBeakerTip(tx, ty) { return tx >= L.bx - 6 && tx <= L.bx + L.bw + 6 && ty >= L.by - 24 && ty <= L.by + L.bh; }
function hitSlot(x, y) { for (let i = 0; i < HAND; i++) if (inRect(x, y, L.slot(i), 2)) return i; return -1; }
function nudge(key) { G.shake[key] = NOW(); }

canvas.addEventListener("contextmenu", e => e.preventDefault());
canvas.addEventListener("pointermove", e => {
  const [x, y] = toLogical(e); ptr.x = x; ptr.y = y; ptr.type = e.pointerType || "mouse"; ptr.inside = true;
  if (D) { D.x = x; D.y = y; if (Math.hypot(x - D.sx, y - D.sy) > 9) D.moved = true; D.vx = (D.vx || 0) * 0.7 + (e.movementX || 0) * 0.3; }
  if (G && G.pourP && G.holding && mode === "play") { const [cx] = pxToCell(x, y); R.aim(G.pourP, clamp(cx, 5, W - 6)); }
});
canvas.addEventListener("pointerleave", () => { ptr.inside = false; });
canvas.addEventListener("pointerdown", e => {
  ensureAudio();
  const [x, y] = toLogical(e); ptr.x = x; ptr.y = y; ptr.down = true; ptr.type = e.pointerType || "mouse"; ptr.inside = true;
  try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
  G.idleSince = NOW();
  if (mode !== "play") return screenDown(x, y);
  if (G.ended) return;
  if (inRect(x, y, L.btn.sound, 2)) { soundOn = !soundOn; ensureAudio(); tone(660, 0.1); return; }
  // right click = quick match strike (desktop)
  if (e.button === 2) { const [cx, cy] = pxToCell(x, y); if (matchAllowed() && cx > 0 && cx < W - 1) strikeAt(cx, clamp(cy, 1, H - 3)); return; }
  const i = hitSlot(x, y);
  if (i >= 0 && G.hand[i] !== undefined) {
    if (!slotAllowed(i) || R.pours <= 0 || R.S.lid) { nudge("s" + i); return; }
    D = { kind: "vial", slot: i, m: G.hand[i], sx: x, sy: y, x, y, moved: false, vx: 0, t0: NOW() }; return;
  }
  if (inRect(x, y, L.btn.match, 2)) { if (!matchAllowed()) { nudge("match"); return; } D = { kind: "match", sx: x, sy: y, x, y, moved: false, vx: 0, t0: NOW() }; return; }
  if (inRect(x, y, L.btn.lid, 2)) { if (!lidAllowed()) { nudge("lid"); return; } D = { kind: "lid", sx: x, sy: y, x, y, moved: false }; return; }
  if (inRect(x, y, L.btn.seal, 2)) { if (!sealAllowed()) { nudge("seal"); return; } D = { kind: "seal", sx: x, sy: y, x, y, moved: false }; return; }
  // beaker tap with a selected vial / match mode
  const [cx, cy] = pxToCell(x, y);
  if (cx > 0 && cx < W - 1 && cy >= -6 && cy < H - 1) {
    if (G.matchMode) { strikeAt(cx, clamp(cy, 1, H - 3)); return; }
    if (G.sel >= 0 && G.hand[G.sel] !== undefined && slotAllowed(G.sel)) { pourFromSlot(G.sel, clamp(cx, 5, W - 6), true); }
  }
});
function finishDrag(e) {
  ptr.down = false; G.holding = false;
  if (!D) return;
  const d = D; D = null;
  if (mode !== "play") return;
  if (d.kind === "vial") {
    const tipOff = ptr.type === "touch" || ptr.type === "pen" ? 66 : 22, tx = d.x, ty = d.y - tipOff;
    if (d.moved && inBeakerTip(tx, ty)) pourFromSlot(d.slot, dropCol(tx), false);
    else if (!d.moved || Math.hypot(d.x - d.sx, d.y - d.sy) < 12) { G.sel = G.sel === d.slot ? -1 : d.slot; G.matchMode = false; tone(500, 0.05); }
  } else if (d.kind === "match") {
    const tipOff = ptr.type === "touch" || ptr.type === "pen" ? 66 : 22, tx = d.x, ty = d.y - tipOff;
    if (d.moved && inBeakerTip(tx, ty)) { const [cx, cy] = pxToCell(tx, ty); strikeAt(clamp(cx, 2, W - 3), clamp(cy, 1, H - 3)); }
    else if (!d.moved) { G.matchMode = !G.matchMode; G.sel = -1; tone(700, 0.05); }
  } else if (d.kind === "lid") { if (!d.moved || Math.hypot(d.x - d.sx, d.y - d.sy) < 14) toggleLid(); }
  else if (d.kind === "seal") { if (Math.hypot(d.x - d.sx, d.y - d.sy) < 14) seal(); }
}
canvas.addEventListener("pointerup", finishDrag); canvas.addEventListener("pointercancel", () => { D = null; ptr.down = false; G.holding = false; });
window.addEventListener("keydown", e => {
  if (!G || mode !== "play") { if (e.key === "Enter") screenDown(-1, -1, true); return; }
  if (e.key >= "1" && e.key <= "4") { const i = +e.key - 1; if (G.hand[i] !== undefined && slotAllowed(i)) { G.sel = G.sel === i ? -1 : i; G.matchMode = false; } }
  else if (e.key === "f" || e.key === "F") { if (matchAllowed()) { G.matchMode = !G.matchMode; G.sel = -1; } }
  else if (e.key === " ") { e.preventDefault(); if (lidAllowed()) toggleLid(); }
  else if (e.key === "Enter") { e.preventDefault(); if (sealAllowed()) seal(); }
  else if (e.key === "Escape") { G.sel = -1; G.matchMode = false; }
});
function pourFromSlot(i, col, hold) {
  const mat = G.hand[i];
  const P = R.startPour(mat, col); if (!P) return;
  G.pourP = P; G.holding = hold;
  G.disc.push(G.hand.splice(i, 1)[0]);
  if (G.draw.length === 0 && G.disc.length && G.round > 0) G.draw = shuffle(G.disc.splice(0));
  if (G.draw.length) { G.hand.splice(i, 0, G.draw.pop()); G.slideIn[i] = NOW(); }
  G.sel = -1; G.pourN++; P.anim = NOW(); P.vm = mat;
  advanceTut("pour", mat);
  tone(300, 0.2, "sine", 0.05, 0.6); buzz(12);
}
function strikeAt(x, y) {
  if (R.matches <= 0) { nudge("match"); return; }
  R.strike(clamp(x, 2, W - 3), clamp(y, 1, H - 3));
  G.matchMode = false; fx.strike = { x, y, born: NOW() };
  advanceTut("match"); sfx("burn", true); tone(1200, 0.06, "square", 0.03); buzz(15);
}
function toggleLid() { if (G.ended) return; R.toggleLid(); G.lidUsed = true; tone(R.S.lid ? 140 : 220, 0.15, "square", 0.05); G.lidAnim = NOW(); }
function seal() { if (G.ended) return; R.closeAll(); tone(300, 0.2, "sine", 0.05, 0.5); }

// ---------------- previews (ghost) ----------------
function colContact(col, half) {
  const S = R.S; let best = H - 1;
  for (let dx = -half; dx <= half; dx++) {
    const x = col + dx; if (x < 1 || x >= W - 1) continue;
    for (let y = 0; y < H - 1; y++) { const m = S.t[y * W + x]; if (m !== M.E && (KIND[m] !== 3 || m === M.FIRE)) { if (y < best) best = y; break; } }
  }
  return best;
}
function previewVial(m, col) {
  const S = R.S, half = 4, cy = colContact(col, half);
  const tally = {};
  for (let dx = -half; dx <= half; dx++) for (let dy = 0; dy < 4; dy++) {
    const x = col + dx, y = cy + dy; if (x < 1 || x >= W - 1 || y >= H - 1) continue;
    const t = S.t[y * W + x]; if (t !== M.E) tally[t] = (tally[t] || 0) + 1;
  }
  const items = [], table = PRE[m] || {};
  for (const k of Object.keys(tally)) { const rxs = table[k]; if (!rxs) continue; for (const r of rxs) if (!items.find(i => i.type === r)) items.push({ type: r, n: tally[k] }); }
  for (const it of items) it.est = RX[it.type] ? ptsOf(it.type, R.mods) * clamp(it.n * 3, 3, 120) : 0;
  return { col, cy, half, items: items.slice(0, 3) };
}
function previewMatch(cx, cy) {
  const S = R.S, r = 3, cells = []; let blast = false, water = false;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (dx * dx + dy * dy > r * r) continue; const x = cx + dx, y = cy + dy; if (x < 1 || x >= W - 1 || y < 0 || y >= H - 1) continue;
    const m = S.t[y * W + x]; if (FLAMMABLE.includes(m)) cells.push([x, y]); if (m === M.POWDER) blast = true; if (m === M.WATER) water = true;
  }
  return { cx, cy, cells, blast, water };
}
const gasHist = [];
function predictFrac() {
  const S = R.S; let slope = 0;
  if (gasHist.length > 4) slope = Math.max(0, (gasHist[gasHist.length - 1].g - gasHist[0].g) / Math.max(1, gasHist[gasHist.length - 1].f - gasHist[0].f));
  return clamp((S.gas + slope * 180) / S.lidMax, 0, 1);
}

// ---------------- rendering ----------------
function renderBeakerLayers() {
  renderBeaker();
}
function drawBeakerLayers(now) {
  const { cp, bx, by, bw, bh } = L;
  const sk = fx.shake > 0.3 ? fx.shake : 0; fx.shake *= 0.86;
  ctx.save();
  if (sk) ctx.translate((Math.random() - 0.5) * sk, (Math.random() - 0.5) * sk);
  ctx.imageSmoothingEnabled = true; ctx.globalCompositeOperation = "multiply";
  if (WASH_BLUR) {
    sctx.clearRect(0, 0, W / 2, H / 2); sctx.imageSmoothingEnabled = true; sctx.drawImage(tintC, 0, 0, W / 2, H / 2);
    ctx.globalAlpha = 0.8; ctx.drawImage(softC, 0.5, 0, W / 2 - 1, H / 2 - 0.5, bx + cp + 0.8, by + 1, bw - 2 * cp, bh - cp); ctx.globalAlpha = 0.55;
  }
  ctx.drawImage(tintC, 1, 0, W - 2, H - 1, bx + cp + 0.6, by + 0.6, bw - 2 * cp, bh - cp);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  ctx.imageSmoothingEnabled = false; ctx.drawImage(inkC, 0, 0, W * ICP, H * ICP, bx, by, bw, bh);
  ctx.imageSmoothingEnabled = true;
  ctx.restore();
}

function focusLedger() {
  let best = null;
  for (const Lg of R.order) if (!Lg.closed && Lg.n > 0 && (!best || Lg.lastF > best.lastF)) best = Lg;
  return best;
}

function drawTopBar(now) {
  const act = Math.min(3, Math.floor(G.round / 3));
  for (let i = 0; i < 4; i++) {
    const cur = i === act, x = 20 + i * 22, y = 22, r = cur ? 8.5 : 5.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.globalAlpha = i > act ? 0.45 : 1; ctx.fillStyle = ACT_COL[i]; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = cur ? 2 : 1.2; ctx.stroke(); ctx.globalAlpha = 1;
  }
  const rr = G.round % 3;
  for (let i = 0; i < 3; i++) { const x = 118 + i * 17; ctx.beginPath(); ctx.arc(x, 22, 4.5, 0, 7); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke(); if (i <= rr) { ctx.fillStyle = i === rr ? "#b8381e" : INK; ctx.fill(); } }
  // sound + coins
  const sb = L.btn.sound; drawSpeaker(ctx, sb.x + 22, 22, 9, soundOn);
  const mny = Math.round(G.shownMoney); const bump = fx.bump.coin ? clamp(1 - (now - fx.bump.coin) / 400, 0, 1) : 0;
  drawCoin(ctx, 380 - numWidth(String(mny), 14) - 14, 22, 9 + bump * 2);
  drawNum(ctx, String(mny), 380, 22, 14, { align: "r", color: bump && fx.bump.bad ? "#b8381e" : COL.gold, halo: true, wt: 0.9 });
  // arcana badges row (above the beaker)
  for (let i = 0; i < MAX_ARC; i++) {
    const x = L.bx + 14 + i * 30, y = 52;
    if (i < G.arc.length) { const a = ARCANA.find(q => q.id === G.arc[i]); drawBadge(ctx, a.id, x, y, 12, a.rare); }
    else { ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.setLineDash([2, 3]); ctx.strokeStyle = "rgba(42,28,18,.3)"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); }
  }
}

function wigAngle(key, now) { // occasional staggered wiggle for interactive things
  let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  const period = 4200 + (Math.abs(h) % 2200), ph = ((now + Math.abs(h) * 7) % period) / period;
  return ph > 0.9 ? Math.sin((ph - 0.9) * 10 * Math.PI * 2) * 0.06 * (1 - (ph - 0.9) * 10) : 0;
}
function nudgeOff(key, now) { const t = G.shake[key]; if (!t) return 0; const a = (now - t) / 320; return a > 1 ? 0 : Math.sin(a * Math.PI * 6) * 4 * (1 - a); }
function hoverLift(rect, key) { return ptr.inside && !ptr.down && ptr.type === "mouse" && inRect(ptr.x, ptr.y, rect) ? 1 : 0; }

function drawHand_(now) {
  const tut = G.tut < 9;
  for (let i = 0; i < HAND; i++) {
    const s = L.slot(i), m = G.hand[i];
    if (m === undefined) { ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(42,28,18,.28)"; ctx.lineWidth = 1; ctx.strokeRect(s.x + 6, s.y + 6, s.w - 12, s.h - 12); ctx.restore(); continue; }
    const allowed = slotAllowed(i) && R.pours > 0 && !G.ended;
    const sel = G.sel === i, dragging = D && D.kind === "vial" && D.slot === i;
    const si = G.slideIn[i] ? clamp((now - G.slideIn[i]) / 320, 0, 1) : 1;
    const lift = (sel ? 10 : 0) + hoverLift(s) * 8 + (1 - backOut(si)) * -26 * 0 + (1 - easeOut(si)) * 30;
    const dx = nudgeOff("s" + i, now);
    ctx.save();
    ctx.translate(s.x + s.w / 2 + dx, s.y + s.h / 2 - lift);
    ctx.rotate(wigAngle("v" + i, now) * (allowed ? 1 : 0));
    ctx.globalAlpha = si < 1 ? easeOut(si) : 1;
    if (dragging && D.moved) ctx.globalAlpha = 0.28;
    if (tut && allowed && G.tut < 3 && !dragging) { // required piece breathes
      const k = (Math.sin(now / 280) + 1) / 2;
      ctx.beginPath(); ctx.ellipse(0, 6, 38 + k * 4, 50 + k * 4, 0, 0, 7); ctx.strokeStyle = `rgba(184,56,30,${0.25 + k * 0.4})`; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (sel) { ctx.beginPath(); ctx.ellipse(0, 6, 40, 52, 0, 0, 7); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke(); }
    drawVial(ctx, m, -26, -44, 52, 90, { dim: !allowed });
    ctx.restore();
  }
}
function drawButtons(now) {
  const bm = L.btn.match, bl = L.btn.lid, bs = L.btn.seal;
  // match
  const ma = matchAllowed(), mOn = G.matchMode || (D && D.kind === "match");
  ctx.save(); ctx.translate(bm.x + bm.w / 2 + nudgeOff("match", now), bm.y + bm.h / 2 - hoverLift(bm) * 4);
  ctx.rotate(wigAngle("match", now) * (ma ? 1 : 0)); ctx.globalAlpha = ma ? 1 : 0.35;
  if (mOn) { ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke(); }
  if (G.tut === 3 && ma && !mOn) { const k = (Math.sin(now / 240) + 1) / 2; ctx.beginPath(); ctx.arc(0, 0, 30 + k * 4, 0, 7); ctx.strokeStyle = `rgba(184,56,30,${0.3 + k * 0.5})`; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
  const dragging = D && D.kind === "match" && D.moved;
  if (R.matches > 0) { ctx.globalAlpha *= dragging ? 0.3 : 1; drawMatch(ctx, -6, 2, 19, false, R.matches); }
  ctx.restore();
  drawNum(ctx, String(R.matches), bm.x + bm.w - 18, bm.y + bm.h - 14, 13, { align: "c", color: INK, halo: true });
  // lid
  const la = lidAllowed(), lOn = R.S.lid;
  ctx.save(); ctx.translate(bl.x + bl.w / 2 + nudgeOff("lid", now), bl.y + bl.h / 2 - hoverLift(bl) * 4); ctx.rotate(wigAngle("lid", now) * (la ? 1 : 0)); ctx.globalAlpha = la ? 1 : 0.35;
  if (lOn) { ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke(); }
  drawLid(ctx, 0, -2, 22, lOn); ctx.restore();
  // seal
  const sa = sealAllowed(), pulse = R.status() === "wait";
  ctx.save(); ctx.translate(bs.x + bs.w / 2 + nudgeOff("seal", now), bs.y + bs.h / 2 - hoverLift(bs) * 4); ctx.globalAlpha = sa ? 1 : 0.35;
  if (pulse) { const k = (Math.sin(now / 220) + 1) / 2; ctx.beginPath(); ctx.arc(0, 0, 29 + k * 3, 0, 7); ctx.strokeStyle = `rgba(184,56,30,${0.3 + k * 0.5})`; ctx.lineWidth = 2.4; ctx.stroke(); }
  drawHourglass(ctx, 0, 0, 17); ctx.restore();
  // pips (remaining pours) + draw pile
  const total = BASE_POURS + (R.mods.spare ? 1 : 0);
  for (let i = 0; i < total; i++) drawPip(ctx, 12 + i * 20, L.pipY, 14, 20, i >= R.pours);
  drawPip(ctx, 312, L.pipY, 11, 16, false);
  drawNum(ctx, String(G.draw.length), 350, L.pipY + 10, 12, { align: "c", color: "#5a4532" });
}

function drawElements(now, T) {
  const focus = focusLedger();
  const fr = T ? null : (focus ? scoreLedger(focus, R.mods) : null);
  for (let e = 0; e < 4; e++) {
    const on = T ? T.lit[e] : (fr && fr.lit[e]);
    const pop = T && T.pop[e] ? clamp(1 - (now - T.pop[e]) / 300, 0, 1) : 0;
    drawEl(ctx, e, L.rcx, L.elY(e), 9, !!on, false, pop);
  }
  // ghost preview: elements this pour would newly light
  if (G.preview) {
    const lit = fr ? fr.lit : [0, 0, 0, 0], pulseK = (Math.sin(now / 160) + 1) / 2;
    for (const it of G.preview.items) if (RX[it.type]) for (const e of RX[it.type].el) if (!lit[e]) { ctx.save(); ctx.globalAlpha = 0.5 + pulseK * 0.5; drawEl(ctx, e, L.rcx, L.elY(e), 11, false, true, 0); ctx.restore(); }
  }
  // base and multiplier numbers
  if (T) {
    const bp = T.basePop ? clamp(1 - (now - T.basePop) / 200, 0, 1) : 0;
    if (T.landed) drawNum(ctx, fmt(T.base), L.rcx, L.baseY, 12 + bp * 3, { color: INK, halo: true, wt: 0.9 });
    if (T.multShown) { const mp = clamp(1 - (now - T.multPop) / 260, 0, 1); drawNum(ctx, "×" + T.res.elem, L.rcx, L.multY, 13 + mp * 6, { color: "#b8381e", halo: true, wt: 1 }); }
  } else if (fr && fr.matter > 0) {
    drawNum(ctx, fmt(fr.matter), L.rcx, L.baseY, 12, { color: INK, halo: true, wt: 0.9 });
    drawNum(ctx, "×" + fr.elem, L.rcx, L.multY, 13, { color: "#b8381e", halo: true, wt: 1 });
  }
}

function drawDial(now) {
  const d = L.dial, S = R.S, frac = clamp(S.gas / S.lidMax, 0, 1);
  ctx.save(); ctx.globalAlpha = S.lid ? 1 : 0.5;
  const a = Math.PI + frac * Math.PI + (S.lid && frac > 0.85 ? Math.sin(now / 40) * 0.04 : 0);
  ctx.beginPath(); ctx.moveTo(d.cx, d.cy); ctx.lineTo(d.cx + Math.cos(a) * d.r * 0.85, d.cy + Math.sin(a) * d.r * 0.85); ctx.strokeStyle = frac > 0.8 && S.lid ? "#b8381e" : INK; ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.stroke();
  ctx.beginPath(); ctx.arc(d.cx, d.cy, 3, 0, 7); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
  if (G.lidHover || (D && D.kind === "lid") || (ptr.inside && ptr.type === "mouse" && inRect(ptr.x, ptr.y, L.btn.lid))) {
    const pf = predictFrac(), pa = Math.PI + pf * Math.PI;
    ctx.save(); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(d.cx, d.cy); ctx.lineTo(d.cx + Math.cos(pa) * d.r * 0.9, d.cy + Math.sin(pa) * d.r * 0.9); ctx.strokeStyle = "#b8381e"; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
  }
}

function drawLidOnBeaker(now) {
  const { bx, by, bw, cp } = L, S = R.S;
  const lidY = by - 7;
  if (S.lid) {
    const drop = G.lidAnim ? clamp((now - G.lidAnim) / 220, 0, 1) : 1, yy = lidY - (1 - backOut(drop)) * 24;
    ctx.save(); ctx.translate(bx + bw / 2, yy);
    ctx.fillStyle = "#a8774a"; ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
    ctx.fillRect(-bw / 2 - 2, -4, bw + 4, 9); ctx.strokeRect(-bw / 2 - 2, -4, bw + 4, 9);
    ctx.globalAlpha = 0.5; ctx.lineWidth = 0.7; for (let x = -bw / 2; x < bw / 2; x += 6) { ctx.beginPath(); ctx.moveTo(x, -4); ctx.lineTo(x + 3, 5); ctx.stroke(); } ctx.globalAlpha = 1;
    ctx.fillStyle = INK; ctx.fillRect(-8, -9, 16, 5); ctx.restore();
  }
  if (fx.lidFly) {
    const t = (now - fx.lidFly.born) / 1000;
    if (t > 1.6) fx.lidFly = null;
    else { ctx.save(); ctx.translate(bx + bw / 2 + fx.lidFly.vx * t * 50, lidY - t * 240 + t * t * 220); ctx.rotate(t * 5 * Math.sign(fx.lidFly.vx || 1)); ctx.globalAlpha = Math.max(0, 1 - t / 1.6); ctx.fillStyle = "#a8774a"; ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.fillRect(-bw / 4, -4, bw / 2, 9); ctx.strokeRect(-bw / 4, -4, bw / 2, 9); ctx.restore(); }
  }
}

function drawFloats(now) {
  const { cp } = L;
  for (let i = fx.floats.length - 1; i >= 0; i--) {
    const f = fx.floats[i], age = (now - f.born) / 1000;
    if (age > 1.35) { fx.floats.splice(i, 1); continue; }
    const rise = age < 0.4 ? easeOut(age / 0.4) * 22 : 22 + (age - 0.4) * 5;
    const x = L.bx + f.x * cp, y = L.by + f.y * cp - rise;
    const a = age < 1.0 ? 1 : 1 - (age - 1.0) / 0.35, sc = f.big ? 1.35 : 1;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(sc, sc);
    const nw = numWidth("+" + fmt(f.val), 10);
    ctx.fillStyle = "rgba(239,228,200,.85)"; ctx.beginPath(); ctx.ellipse(0, 0, (nw + 18) / 2 + 3, 10, 0, 0, 7); ctx.fill();
    drawRx(ctx, f.type, -nw / 2 - 2, 0, 7); drawNum(ctx, "+" + fmt(f.val), 9, 0, 10, { color: INK, align: "c", wt: 0.85 });
    ctx.restore();
  }
  // first-time discovery: the two inputs collide into the result (0.6 s)
  for (let i = fx.disc.length - 1; i >= 0; i--) {
    const d = fx.disc[i], age = (now - d.born) / 600;
    if (age > 1.2) { fx.disc.splice(i, 1); continue; }
    const x = L.bx + d.x * cp, y = L.by + d.y * cp, pair = DISCOVER[d.type] || [M.SAND, M.SAND];
    ctx.save(); ctx.translate(x, y);
    if (age < 0.6) {
      const k = easeIn(age / 0.6), off = 30 * (1 - k);
      for (const [j, m] of pair.entries()) { const px = (j ? 1 : -1) * off; ctx.beginPath(); ctx.arc(px, 0, 10, 0, 7); ctx.fillStyle = "rgba(239,228,200,.95)"; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke(); ctx.save(); ctx.translate(px, 0); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 1.3; SYM[m](ctx, 5); ctx.restore(); }
    } else { const k = (age - 0.6) / 0.6; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(0, 0, 14 + k * 12, 0, 7); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); drawRx(ctx, d.type, 0, -k * 12, 11 + (1 - k) * 4); }
    ctx.restore();
  }
}
function drawChains(now) {
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
  for (let i = fx.chains.length - 1; i >= 0; i--) {
    const c = fx.chains[i], age = (now - c.born) / 1000;
    if (age > 3) { fx.chains.splice(i, 1); continue; }
    const tx = c.toRef.x / c.toRef.n, ty = c.toRef.y / c.toRef.n;
    const x0 = L.bx + c.from[0] * L.cp, y0 = L.by + c.from[1] * L.cp, x1 = L.bx + tx * L.cp, y1 = L.by + ty * L.cp;
    const k = Math.min(1, age / 0.35); ctx.globalAlpha = Math.max(0, 1 - Math.max(0, age - 2.1));
    ctx.setLineDash([6, 3]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2 + (y1 - y0) * 0.15, (y0 + y1) / 2 - (x1 - x0) * 0.15, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x0, y0, 2.5, 0, 7); ctx.fillStyle = INK; ctx.fill();
    if (k >= 1) { ctx.beginPath(); ctx.arc(x1, y1, 8, 0, 7); ctx.fillStyle = "rgba(239,228,200,.9)"; ctx.fill(); ctx.stroke(); drawNum(ctx, String(c.g), x1, y1, 9, { color: INK }); }
    ctx.globalAlpha = 1;
  }
}

function drawPours(now) {
  const { cp, bx, by } = L;
  for (const P of R.active) {
    const x = bx + (P.x + 0.5) * cp, col = VCOL[P.m] || "#888";
    // tilted vial over the rim
    const age = (now - (P.anim || now)) / 1000, tilt = Math.min(1, age / 0.18) * 2.2;
    ctx.save(); ctx.translate(x + 18, by - 34); ctx.rotate(tilt); ctx.globalAlpha = 0.95; drawVial(ctx, P.m, -14, -24, 28, 48, {}); ctx.restore();
    ctx.strokeStyle = col; ctx.globalAlpha = 0.8; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -now / 12;
    ctx.beginPath(); ctx.moveTo(x + 3, by - 24); ctx.lineTo(x, by + 6 * cp); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
}

function drawPreview(now) {
  G.preview = null;
  let tip = null, kind = null, mat = 0;
  if (D && D.moved && (D.kind === "vial" || D.kind === "match")) { const t = tipOf(); tip = { x: D.x, y: D.y - t.off }; kind = D.kind; mat = D.m; }
  else if (ptr.inside && ptr.type === "mouse" && !ptr.down && !D) {
    if (G.matchMode) { tip = { x: ptr.x, y: ptr.y }; kind = "match"; }
    else if (G.sel >= 0 && G.hand[G.sel] !== undefined) { tip = { x: ptr.x, y: ptr.y }; kind = "vial"; mat = G.hand[G.sel]; }
  }
  if (!tip || !inBeakerTip(tip.x, tip.y)) return;
  const { cp, bx, by } = L;
  if (kind === "vial") {
    const col = dropCol(tip.x), pv = previewVial(mat, col); G.preview = pv;
    const x = cellX(col), yEnd = by + pv.cy * cp, hw = 4.5 * cp;
    ctx.save();
    ctx.fillStyle = "rgba(168,119,74,.16)"; ctx.fillRect(x - hw, by, hw * 2, Math.max(2, yEnd - by));
    ctx.strokeStyle = INK; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -now / 40;
    ctx.beginPath(); ctx.moveTo(x - hw, by); ctx.lineTo(x - hw, yEnd); ctx.moveTo(x + hw, by); ctx.lineTo(x + hw, yEnd); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(x, yEnd, hw, 3.5, 0, 0, 7); ctx.stroke(); ctx.restore();
    // carried vial (kept clear of the finger)
    if (D && D.moved) { ctx.save(); ctx.translate(D.x, D.y - 66 + 8); ctx.rotate(clamp((D.vx || 0) * 0.03, -0.5, 0.5)); ctx.globalAlpha = 0.92; drawVial(ctx, mat, -22, -38, 44, 76, {}); ctx.restore(); }
    // result symbols, at least 60px above the finger
    const fingerY = D ? D.y : ptr.y;
    const iy = Math.min(yEnd - 22, fingerY - 70), n = pv.items.length;
    pv.items.forEach((it, i) => {
      const ix = clamp(x + (i - (n - 1) / 2) * 44, L.bx + 24, L.bx + L.bw - 24), bob = Math.sin(now / 260 + i) * 2;
      ctx.save(); ctx.globalAlpha = 0.92; ctx.translate(ix, Math.max(by + 12, iy) + bob);
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.fillStyle = "rgba(239,228,200,.88)"; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]);
      drawRx(ctx, it.type, 0, 0, 10);
      if (it.est) drawNum(ctx, "+" + fmt(it.est), 0, 26, 9, { color: "rgba(42,28,18,.55)", halo: true, wt: 0.8 });
      ctx.restore();
    });
  } else if (kind === "match") {
    const [cx, cy] = pxToCell(tip.x, tip.y), pm = previewMatch(cx, cy); G.preview = { items: pm.cells.length ? [{ type: "burn" }] : [] };
    const x = cellX(cx), y = cellY(cy), r = 3.5 * cp;
    ctx.save(); ctx.strokeStyle = "#b8381e"; ctx.lineWidth = 1.6; ctx.setLineDash([3, 3]); ctx.lineDashOffset = -now / 50; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    const k = (Math.sin(now / 90) + 1) / 2; ctx.fillStyle = `rgba(232,117,47,${0.35 + k * 0.4})`; ctx.strokeStyle = "#e8752f";
    for (const [fx_, fy_] of pm.cells) { ctx.fillRect(L.bx + fx_ * cp - 0.5, L.by + fy_ * cp - 0.5, cp + 1, cp + 1); }
    if (!pm.cells.length) { ctx.strokeStyle = "rgba(42,28,18,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke(); }
    if (pm.blast) { drawRx(ctx, "blast", x, y - r - 14, 11); }
    else if (pm.water && pm.cells.length < 3) { drawRx(ctx, "steam", x, y - r - 12, 9); }
    ctx.restore();
    if (D && D.moved) { drawMatch(ctx, D.x, D.y - 60, 16, true, 1); }
  }
}

function drawFlask(now) {
  const f = L.flask, cap = R.target * 1.5;
  // flight of gold sand
  for (const p of fx.gold) {
    if (p.done) continue;
    const t = (now - p.born) / p.dur; if (t < 0) continue;
    if (t >= 1) { p.done = true; G.displayGold += p.v; continue; }
    const P0 = [p.x0, p.y0], P1 = [p.x0 + 70 + p.spread * 30, p.y0 - 60], P2 = [f.cx - 40 + p.spread * 20, f.neckTop - 50], P3 = [f.cx + p.spread * 3, f.neckTop - 4];
    let x, y;
    if (t < 0.78) { const k = t / 0.78, u = 1 - k; x = u * u * u * P0[0] + 3 * u * u * k * P1[0] + 3 * u * k * k * P2[0] + k * k * k * P3[0]; y = u * u * u * P0[1] + 3 * u * u * k * P1[1] + 3 * u * k * k * P2[1] + k * k * k * P3[1]; }
    else { const k = (t - 0.78) / 0.22; x = P3[0]; y = P3[1] + (flaskY(G.displayGold / cap) - P3[1]) * k * k; }
    ctx.fillStyle = COL.gold; ctx.beginPath(); ctx.arc(x, y, 2.1, 0, 7); ctx.fill(); ctx.fillStyle = COL.goldHi; ctx.fillRect(x - 0.6, y - 0.9, 1.2, 1.2);
  }
  fx.gold = fx.gold.filter(p => !p.done);
  if (!fx.gold.length && !fx.tally && !fx.tallyQ.length) G.displayGold = R.gold;
  const lvl = flaskY(G.displayGold / cap);
  ctx.save(); flaskPath(ctx); ctx.clip();
  ctx.fillStyle = "rgba(246,238,214,.45)"; ctx.fillRect(f.cx - f.r - 2, f.neckTop, f.r * 2 + 4, f.bottom - f.neckTop + 4);
  if (G.displayGold > 0) {
    ctx.fillStyle = COL.gold; ctx.fillRect(f.cx - f.r - 2, lvl, f.r * 2 + 4, f.bottom - lvl + 2);
    ctx.fillStyle = COL.goldHi; for (let i = 0; i < 40; i++) { const sx = f.cx - f.r + ((i * 53) % (f.r * 2)), sy = lvl + ((i * 37) % Math.max(1, f.bottom - lvl)); if (((i + (now >> 8)) % 5) === 0) ctx.fillRect(sx, sy, 1.4, 1.4); }
    ctx.strokeStyle = "rgba(42,28,18,.5)"; ctx.lineWidth = 0.7; for (let y = lvl + 3; y < f.bottom; y += 4) { ctx.beginPath(); ctx.moveTo(f.cx - f.r, y); ctx.lineTo(f.cx + f.r, y); ctx.stroke(); }
  }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 2; flaskPath(ctx); ctx.stroke();
  ctx.save(); flaskPath(ctx); ctx.clip(); ctx.globalAlpha = 0.35; ctx.lineWidth = 0.7; for (let y = f.neckTop; y < f.bottom; y += 5) { ctx.beginPath(); ctx.moveTo(f.cx + f.r * 0.55, y); ctx.lineTo(f.cx + f.r, y + 3); ctx.stroke(); } ctx.restore();
  // gold line (target)
  const gy = flaskY(R.target / cap), reached = G.displayGold >= R.target;
  if (reached && !G.reachedFlag) { G.reachedFlag = true; G.lineFlash = now; tone(110, 0.4, "sine", 0.08); tone(880, 0.25, "triangle", 0.05); }
  const fl = G.lineFlash ? (now - G.lineFlash) / 900 : 2, flash = fl < 1 ? (Math.floor(fl * 4) % 2 === 0 ? 1 : 0) : 0;
  ctx.strokeStyle = reached ? "#a87814" : "#b8381e"; ctx.lineWidth = flash ? 4 : 2.2; ctx.setLineDash([5, 3]);
  ctx.beginPath(); ctx.moveTo(f.cx - f.r - 5, gy); ctx.lineTo(f.cx + f.r + 5, gy); ctx.stroke(); ctx.setLineDash([]);
  drawNum(ctx, fmt(R.target), f.cx, gy - 9, 10, { color: reached ? COL.gold : "#b8381e", halo: true, wt: 0.9 });
  drawNum(ctx, fmt(G.displayGold), f.cx, f.bottom + 12, 11, { color: COL.gold, halo: true, wt: 0.95 });
}

function drawTallyFx(now) {
  const T = fx.tally; if (!T) return;
  const { t, tA, tC, C } = tallyGeom(T, now);
  const from = { x: cellX(T.cx), y: cellY(T.cy) }, B = { x: L.rcx, y: L.baseY }, Mx = { x: L.rcx, y: L.multY };
  T.chips.forEach((c, i) => {
    if (c.done) return;
    const k = (t - i * T_STAGGER) / T_FLY; if (k < 0) return;
    const e = easeIn(clamp(k, 0, 1)), x = from.x + (B.x - from.x) * e, y = from.y + (B.y - from.y) * e - Math.sin(e * Math.PI) * 24;
    ctx.save(); ctx.translate(x, y);
    if (c.type !== "stale") drawRx(ctx, c.type, -numWidth(fmt(c.sub), 10) / 2 - 3, 0, 6.5);
    drawNum(ctx, fmt(c.sub), 6, 0, 10, { color: INK, halo: true, wt: 0.9 }); ctx.restore();
  });
  if (T.multShown && !T.goldShown) {
    const k = clamp((t - (tC)) / 260, 0, 1), e = easeIn(k);
    if (k > 0) {
      const bx_ = B.x + (C.x - 24 - B.x) * e, by_ = B.y + (C.y - B.y) * e, mx_ = Mx.x + (C.x + 24 - Mx.x) * e, my_ = Mx.y + (C.y - Mx.y) * e;
      ctx.save(); ctx.globalAlpha = 1;
      drawNum(ctx, fmt(T.base), bx_, by_, 16, { color: INK, halo: true, wt: 0.95 }); drawNum(ctx, "×" + T.res.elem, mx_, my_, 18, { color: "#b8381e", halo: true, wt: 1 }); ctx.restore();
    }
  }
  if (T.goldShown) {
    const a = clamp((now - T.goldPop) / 200, 0, 1), sc = 1.5 - 0.5 * backOut(a), fade = T.spawned ? 1 - clamp((now - T.spawnAt) / 450, 0, 1) : 1;
    const gs = 24 * sc * (T.res.gold >= 100000 ? 1.15 : 1);
    ctx.save(); ctx.globalAlpha = fade; drawNum(ctx, fmt(T.res.gold), C.x, C.y, gs, { color: COL.gold, halo: "#2a1c12", wt: 1.0 }); drawNum(ctx, fmt(T.res.gold), C.x, C.y, gs, { color: COL.goldHi, wt: 0.55 });
    ctx.restore();
  }
}

function drawTutHand(now) {
  if (G.tut >= 9 || D || G.ended) return;
  if (now - G.idleSince < 4000) return;
  const loop = 3000, t = ((now - G.idleSince - 4000) % loop) / loop;
  let from, to, kind = "vial", mat = null;
  if (G.tut <= 2) {
    const want = G.tut === 0 ? M.WATER : G.tut === 1 ? M.LAVA : M.OIL, i = G.hand.indexOf(want); if (i < 0) return;
    const s = L.slot(i); from = [s.x + s.w / 2, s.y + s.h / 2]; to = [want === M.OIL ? L.bx + L.bw * 0.2 : L.bx + L.bw * 0.5, L.by + L.bh * 0.55]; mat = want;
  } else {
    const b = L.btn.match; from = [b.x + b.w / 2, b.y + b.h / 2]; kind = "match";
    to = [G.fuelX != null && G.fuelX > 0 ? cellX(G.fuelX) : L.bx + L.bw * 0.5, G.fuelY != null && G.fuelY > 0 ? cellY(G.fuelY) + 66 : L.by + L.bh * 0.7];
  }
  let k = t < 0.15 ? 0 : t < 0.65 ? (t - 0.15) / 0.5 : 1; k = k * k * (3 - 2 * k);
  const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k - (kind === "vial" ? 0 : 0) * 0;
  ctx.save();
  if (t >= 0.65 && t < 0.9 && kind === "vial") { // ghost beam where it will land
    const hw = 4.5 * L.cp, cx = to[0], yE = L.by + colContact(dropCol(cx), 4) * L.cp; ctx.fillStyle = "rgba(168,119,74,.18)"; ctx.fillRect(cx - hw, L.by, hw * 2, yE - L.by);
  }
  if (t < 0.9) { ctx.globalAlpha = 0.9; if (kind === "vial") drawVial(ctx, mat, x - 22, y - 70, 44, 76, {}); else drawMatch(ctx, x, y - 66, 16, t >= 0.65, 1); }
  drawHand(ctx, x, y, 0.85, t > 0.15 && t < 0.65);
  ctx.restore();
}

function drawCursorHint(now) { // pressed-state ring under finger/mouse
  if (!ptr.inside || !ptr.down) return;
  ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 14, 0, 7); ctx.strokeStyle = "rgba(42,28,18,.3)"; ctx.lineWidth = 1.5; ctx.stroke();
}

// ---------------- screens: shop / lose / win ----------------
function shopLayout() {
  const oy = L.shopOY;
  return { oy, badge: i => ({ x: 195 + (i - 2) * 56, y: 100 + oy * 0.5, r: 22 }),
    deckY: 150 + oy * 0.5, shelf1: 292 + oy, board1: 352 + oy, shelf2: 424 + oy, board2: 486 + oy, rowY: 566 + oy,
    item: (r, i) => ({ x: i ? 285 : 105, y: r === 0 ? 292 + oy : 424 + oy, w: 110, h: 100 }),
    reroll: { x: 105, y: L.Hl - 110, r: 34 }, exit: { x: 285, y: L.Hl - 110, r: 34 } };
}
function rollShop() {
  const vials = shuffle(SHOP_VIALS.slice()).slice(0, 2).map(m => ({ kind: "vial", m, price: 3, born: NOW() }));
  const pool = ARCANA.filter(c => !G.arc.includes(c.id) && (!c.rare || G.round >= 2));
  const arc = shuffle(pool.slice()).slice(0, 2).map(c => ({ kind: "arc", c, price: c.price, born: NOW() }));
  G.shopItems = [...vials, ...arc]; G.shopT = NOW();
}
function enterShop(earned) {
  mode = "shop"; G.round++; G.reroll = 1; rollShop();
  G.shownMoney = G.money - earned; fx.coins = [];
  for (let i = 0; i < Math.min(12, earned * 2); i++) fx.coins.push({ born: NOW() + 250 + i * 90, x0: L.flask.cx, y0: L.flask.cy, v: earned / Math.min(12, earned * 2) });
  buildBg();
}
function drawShop(now) {
  const S = shopLayout();
  // coins flying in
  for (const c of fx.coins) { const t = (now - c.born) / 700; if (t < 0 || c.done) continue; if (t >= 1) { c.done = true; G.shownMoney += c.v; fx.bump.coin = now; continue; } const e = easeIn(t); drawCoin(ctx, c.x0 + (352 - c.x0) * e, c.y0 + (22 - c.y0) * e - Math.sin(e * Math.PI) * 60, 8); }
  fx.coins = fx.coins.filter(c => !c.done);
  // owned arcana slots
  for (let i = 0; i < MAX_ARC; i++) { const b = S.badge(i); if (i < G.arc.length) { const a = ARCANA.find(q => q.id === G.arc[i]); drawBadge(ctx, a.id, b.x, b.y, b.r, a.rare); } else { ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 3, 0, 7); ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(42,28,18,.35)"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]); } }
  // deck, as a row of small vials
  const per = 12, w = 26, x0 = 195 - (Math.min(per, G.deck.length) - 1) * w / 2;
  G.deck.forEach((m, i) => { const r = Math.floor(i / per), c = i % per, rowN = Math.min(per, G.deck.length - r * per), xx = 195 - (rowN - 1) * w / 2 + c * w; drawVial(ctx, m, xx - 9, S.deckY + r * 42 - 14, 18, 30, {}); });
  // shelves
  ctx.strokeStyle = INK; ctx.lineCap = "round";
  for (const by_ of [S.board1, S.board2]) { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(30, by_); ctx.lineTo(360, by_); ctx.stroke(); ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5; for (let x = 34; x < 356; x += 7) { ctx.beginPath(); ctx.moveTo(x, by_ + 3); ctx.lineTo(x - 4, by_ + 9); ctx.stroke(); } ctx.globalAlpha = 1; }
  G.shopItems.forEach((it, i) => {
    if (it.bought) return;
    const r = it.kind === "vial" ? 0 : 1, idx = it.kind === "vial" ? i : i - 2, p = S.item(r, idx);
    const drop = clamp((now - it.born - idx * 90) / 300, 0, 1), dy = (1 - backOut(drop)) * -40 * 0 + (1 - easeOut(drop)) * -50;
    const hov = ptr.inside && ptr.type === "mouse" && inRect(ptr.x, ptr.y, { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h });
    const afford = G.money >= it.price, wob = wigAngle("i" + i, now) * (afford ? 1 : 0);
    ctx.save(); ctx.globalAlpha = easeOut(drop); ctx.translate(p.x + nudgeOff("i" + i, now), p.y + dy - (hov ? 6 : 0)); ctx.rotate(wob);
    if (it.kind === "vial") drawVial(ctx, it.m, -22, -42, 44, 76, {}); else drawBadge(ctx, it.c.id, 0, -8, 36, it.c.rare);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = easeOut(drop);
    drawCoin(ctx, p.x - 14, p.y + 49, 7.5); drawNum(ctx, String(it.price), p.x + 12, p.y + 49, 13, { color: afford ? INK : "#b8381e", halo: true, wt: 0.95 }); ctx.restore();
  });
  // reroll + exit
  const rr = S.reroll, ex = S.exit, rAfford = G.money >= G.reroll;
  ctx.save(); ctx.translate(rr.x + nudgeOff("reroll", now), rr.y - 8); ctx.globalAlpha = rAfford ? 1 : 0.45; drawReroll(ctx, 0, 0, 22); ctx.restore();
  drawCoin(ctx, rr.x - 12, rr.y + 32, 7); drawNum(ctx, String(G.reroll), rr.x + 8, rr.y + 32, 12, { color: rAfford ? INK : "#b8381e", halo: true });
  const pulse = 1 + Math.sin(now / 300) * 0.04;
  ctx.save(); ctx.translate(ex.x, ex.y); ctx.scale(pulse, pulse); drawDoor(ctx, 0, 0, 26); ctx.restore();
}
function screenDown(x, y, key) {
  if (mode === "shop") {
    if (key) return exitShop();
    const S = shopLayout();
    if (inRect(x, y, L.btn.sound, 2)) { soundOn = !soundOn; return; }
    if (Math.hypot(x - S.exit.x, y - S.exit.y) < S.exit.r + 8) return exitShop();
    if (Math.hypot(x - S.reroll.x, y - S.reroll.y) < S.reroll.r + 8) {
      if (G.money < G.reroll) { nudge("reroll"); fx.bump = { coin: NOW(), bad: true }; return; }
      G.money -= G.reroll; G.shownMoney = G.money; G.reroll++; rollShop(); tone(400, 0.1); return;
    }
    G.shopItems.forEach((it, i) => {
      if (it.bought) return;
      const r = it.kind === "vial" ? 0 : 1, idx = it.kind === "vial" ? i : i - 2, p = S.item(r, idx);
      if (!inRect(x, y, { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h + 20 })) return;
      if (G.money < it.price || (it.kind === "arc" && G.arc.length >= MAX_ARC)) { nudge("i" + i); fx.bump = { coin: NOW(), bad: true }; tone(120, 0.15, "square", 0.04); return; }
      G.money -= it.price; G.shownMoney = G.money; it.bought = true;
      if (it.kind === "vial") G.deck.push(it.m); else G.arc.push(it.c.id);
      tone(660, 0.08); tone(990, 0.12); buzz(15); fx.bump = { coin: NOW() };
    });
    return;
  }
  if (mode === "lose" || mode === "win") { if (key || Math.hypot(x - 195, y - (L.Hl - 120)) < 56) { newGame(); } }
}
function exitShop() { startRound(); }
function drawEndScreen(now) {
  ctx.fillStyle = "rgba(60,44,28,.35)"; ctx.fillRect(0, 0, LW, L.Hl);
  const win = mode === "win", cx = 195, cy = L.Hl * 0.4;
  // a big flask showing how far the gold got
  const k = Math.min(1, now - G.endT > 0 ? (now - G.endT) / 800 : 0), frac = win ? 1 : clamp(R.gold / R.target, 0, 1) * 2 / 3;
  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.moveTo(-18, -110); ctx.lineTo(-18, -50); ctx.arc(0, 20, 86, -Math.PI / 2 - 0.34, Math.PI * 1.5 + 0.34, true); ctx.lineTo(18, -110);
  ctx.save(); ctx.clip(); ctx.fillStyle = "rgba(246,238,214,.55)"; ctx.fillRect(-100, -120, 200, 240);
  const ly = 106 - (216 * frac * easeOut(k)); ctx.fillStyle = COL.gold; ctx.fillRect(-100, ly, 200, 200);
  ctx.strokeStyle = "rgba(42,28,18,.4)"; ctx.lineWidth = 0.8; for (let y = ly + 4; y < 108; y += 5) { ctx.beginPath(); ctx.moveTo(-90, y); ctx.lineTo(90, y); ctx.stroke(); }
  ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  const gl = 106 - 216 * (2 / 3); ctx.setLineDash([7, 4]); ctx.strokeStyle = win ? COL.gold : "#b8381e"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-98, gl); ctx.lineTo(98, gl); ctx.stroke(); ctx.setLineDash([]);
  if (!win) { ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-10, 40); ctx.lineTo(8, 58); ctx.lineTo(-4, 74); ctx.lineTo(14, 96); ctx.moveTo(8, 58); ctx.lineTo(30, 66); ctx.stroke(); }
  ctx.restore();
  drawNum(ctx, fmt(R.gold) + "/" + fmt(R.target), cx, cy + 150, 20, { color: win ? COL.gold : "#b8381e", halo: true, wt: 0.95 });
  const pulse = 1 + Math.sin(now / 280) * 0.05;
  ctx.save(); ctx.translate(cx, L.Hl - 120); ctx.scale(pulse, pulse); ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fillStyle = "rgba(239,228,200,.95)"; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(); drawRestart(ctx, 0, 0, 20); ctx.restore();
}

// ---------------- main loop ----------------
let lastT = NOW(), acc = 0, frameN = 0;
window.__perf = { frames: 0, simMs: 0, drawMs: 0 };
let slowAcc = 0, slowN = 0;
function loop(now) {
  const dt = Math.min(100, now - lastT); lastT = now;
  if (WASH_BLUR && mode === "play") { slowAcc += dt; if (++slowN === 120) { if (slowAcc / slowN > 21) WASH_BLUR = false; slowAcc = 0; slowN = 0; } }
  if (G && R && mode === "play" && !G.ended) {
    acc += dt;
    const waiting = R.pours === 0 && R.matches === 0 && R.active.length === 0;
    const speed = waiting ? 3 : 1;
    let n = 0; const t0 = performance.now();
    while (acc >= 1000 / 60 && n < 4) { R.tick(speed); acc -= 1000 / 60; n++; if (R.frame % 6 === 0) { gasHist.push({ f: R.frame, g: R.S.gas }); if (gasHist.length > 12) gasHist.shift(); } }
    if (acc > 100) acc = 0;
    window.__perf.simMs += performance.now() - t0;
    flushBuckets(now); updateTally(now);
    checkEnd(now);
  } else if (G && R && mode === "play") { updateTally(now); }
  if (G && R) {
    const t1 = performance.now();
    if (G.shownMoney !== G.money && mode === "play") G.shownMoney = G.money;
    renderBeaker();
    ctx.setTransform(DPR * L.sc, 0, 0, DPR * L.sc, 0, 0);
    const bgUse = mode === "shop" ? bgS : bgC;
    ctx.drawImage(bgUse, 0, 0, bgUse.width / (DPR * L.sc), bgUse.height / (DPR * L.sc));
    if (mode === "shop") { drawTopBar(now); drawShop(now); }
    else {
      drawBeakerLayers(now);
      drawLidOnBeaker(now); drawPours(now); drawFloats(now); drawChains(now);
      drawPreview(now);
      drawDial(now);
      drawElements(now, fx.tally);
      drawFlask(now); drawTallyFx(now);
      drawHand_(now); drawButtons(now); drawTopBar(now);
      drawTutHand(now); drawCursorHint(now);
      if (mode === "lose" || mode === "win") drawEndScreen(now);
    }
    window.__perf.drawMs += performance.now() - t1; window.__perf.frames++; frameN++;
  }
  requestAnimationFrame(loop);
}
function checkEnd(now) {
  const st = R.status();
  if ((st === "win" || st === "lose") && !G.ending) {
    G.ended = true; G.sel = -1; G.matchMode = false; D = null; G.ending = true;
    const wait = () => {
      if (fx.gold.length || fx.tally || fx.tallyQ.length) return setTimeout(wait, 200);
      setTimeout(() => { G.ending = false; st === "win" ? roundClear() : (mode = "lose", G.endT = NOW(), tone(110, 0.6, "sawtooth", 0.06, 0.5)); }, 800);
    };
    wait();
  }
}
function roundClear() {
  const target = TARGETS[G.round], over = Math.min(3, Math.floor((R.gold - target) / target * 2));
  const earned = 3 + R.pours + Math.max(0, over);
  G.money += earned;
  if (G.round === TARGETS.length - 1) { mode = "win"; G.endT = NOW(); return; }
  tone(523, 0.15); tone(784, 0.3);
  enterShop(earned);
}

// ---------------- boot ----------------
window.addEventListener("resize", () => { layout(); });
buildPatterns();
layout();
newGame(+QS.get("seed") || 0);
if (QS.has("icons")) { window.__iconsOnly = true; }
requestAnimationFrame(loop);
window.__game = {
  get G() { return G; }, get R() { return R; }, get L() { return L; }, get mode() { return mode; }, get fx() { return fx; }, get D() { return D; }, M,
  clientOf, cellClient: (cx, cy) => clientOf(cellX(cx), cellY(cy)), slotClient: i => { const s = L.slot(i); return clientOf(s.x + s.w / 2, s.y + s.h / 2); },
  btnClient: k => { const b = L.btn[k]; return clientOf(b.x + b.w / 2, b.y + b.h / 2); }, shopPos: () => { const S = shopLayout(); return { items: G.shopItems.map((it, i) => { const r = it.kind === 'vial' ? 0 : 1, idx = it.kind === 'vial' ? i : i - 2; return S.item(r, idx); }), reroll: S.reroll, exit: S.exit }; }, setSound: v => { soundOn = v; },
  drawIcons: () => drawIconSheet(),
};
function drawIconSheet() {
  const mats = [M.SAND, M.WATER, M.OIL, M.LAVA, M.ACID, M.POWDER, M.ICE, M.SEED, M.EMBER, M.SULFUR];
  const rxs = RXK.concat(["steam"]);
  const cw = 720, ch = 560, c = document.createElement("canvas"); c.width = cw * 2; c.height = ch * 2; const g = c.getContext("2d"); g.scale(2, 2);
  const draw = (gg, oy) => {
    gg.save(); gg.translate(0, oy);
    mats.forEach((m, i) => drawVial(gg, m, 20 + i * 70, 20, 52, 88, {}));
    rxs.forEach((r, i) => { const x = 40 + (i % 9) * 76, y = 160 + Math.floor(i / 9) * 70; gg.beginPath(); gg.arc(x, y, 26, 0, 7); gg.fillStyle = "rgba(239,228,200,.9)"; gg.fill(); gg.strokeStyle = INK; gg.lineWidth = 1; gg.stroke(); drawRx(gg, r, x, y, 17); });
    for (let e = 0; e < 4; e++) drawEl(gg, e, 40 + e * 60, 320, 14, true, false, 0);
    drawMatch(gg, 300, 320, 20, false, 2); drawLid(gg, 360, 322, 22, true); drawLid(gg, 420, 322, 22, false); drawHourglass(gg, 480, 322, 18); drawCoin(gg, 530, 322, 12); drawReroll(gg, 580, 322, 18); drawDoor(gg, 640, 322, 18);
    ARCANA.forEach((a, i) => drawBadge(gg, a.id, 40 + i * 42, 380, 18, a.rare));
    drawNum(gg, "0123456789×+−=/%.,k", 20, 430, 22, {});
    gg.restore();
  };
  g.fillStyle = "#e3d6b4"; g.fillRect(0, 0, cw, ch); draw(g, 0);
  return c;
}
})();
