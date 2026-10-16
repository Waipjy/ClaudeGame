// Balance bots for v0.2 rules (continuous flow + ledgers + matches + lid). Run: node bot.js [rounds]
const P = require('./sim.js');
const { M, createRound, mulberry32, W, H } = P;

const START_DECK = [M.SAND, M.SAND, M.WATER, M.WATER, M.OIL, M.EMBER, M.SULFUR, M.LAVA];
const FIRST_HAND = [M.WATER, M.SULFUR, M.OIL, M.LAVA]; // round-1 tutorial opening (template.html uses the same)

function findCell(S, mats, r) {
  // a fuel cell on an exposed surface (empty/gas above), resting (y>12); pick the middle one deterministically
  const c = [];
  for (let p = 13 * W; p < W * H; p++) if (mats.includes(S.t[p]) && S.life[p] === 0) { const u = S.t[p - W]; if (u === M.E || P.KIND[u] === 3) c.push(p); }
  if (!c.length) return null;
  const p = c[(c.length * (0.3 + r() * 0.4)) | 0];
  return [p % W, (p / W) | 0];
}

// policy: 'random' | 'naive' (one at a time, never uses match/lid) | 'smart'
function playRound(seed, policy, opt) {
  opt = opt || {};
  const r = mulberry32(seed * 7919 + 13);
  const R = createRound({ seed, pours: 4, matches: 2, target: 1e12, mods: opt.mods || {} });
  let deck = START_DECK.slice();
  let hand, draw;
  if (opt.tutorial) { hand = FIRST_HAND.slice(); draw = [M.SAND, M.EMBER, M.SAND, M.WATER]; }
  else { draw = deck.sort(() => r() - 0.5); hand = draw.splice(0, 4); }
  const order = [M.WATER, M.SULFUR, M.OIL, M.SEED, M.POWDER, M.SAND, M.ICE, M.ACID, M.LAVA, M.EMBER];
  let nextAt = 0, f = 0, locked = 0, idle = 0, matchPlan = [];
  let lastPour = null;
  while (f < 4000) {
    const st = R.status();
    if (R.pours === 0 && R.matches === 0 && R.active.length === 0 && !R.allClosed()) idle++;
    if (R.pours === 0 && R.active.length === 0) {
      if (policy !== 'naive' && R.matches > 0 && matchPlan.length === 0) {
        // strike on flammable stuff
        const c = findCell(R.S, [M.SULFUR, M.OIL, M.PLANT, M.POWDER], r);
        if (c) R.strike(c[0], c[1]);
        else R.matches = 0;
      }
      if (st !== 'play' && R.allClosed()) break;
      if (R.allClosed() && R.matches === 0) break;
      if (R.allClosed() && policy === 'naive') break;
      locked++;
    }
    if (f >= nextAt && R.canPour() && hand.length) {
      let i;
      if (policy === 'random') i = (r() * hand.length) | 0;
      else { hand.sort((a, b) => order.indexOf(a) - order.indexOf(b)); i = 0; }
      const m = hand.splice(i, 1)[0];
      if (draw.length) hand.push(draw.shift());
      let x;
      if (policy === 'smart') x = lastPour ? lastPour + ((r() - 0.5) * 30) | 0 : 50 + ((r() * 60) | 0);
      else x = 15 + ((r() * (W - 30)) | 0);
      x = Math.max(8, Math.min(W - 9, x)); lastPour = x;
      R.startPour(m, x);
      if (policy === 'random') nextAt = f + ((r() * 150) | 0);
      else if (policy === 'naive') nextAt = Infinity; // waits for ledger to close
      else nextAt = f + (R.pours === 1 ? 140 : 75);
      if (policy === 'random' && R.matches > 0 && r() < 0.5) matchPlan.push(f + ((r() * 200) | 0));
    }
    if (policy === 'naive' && R.allClosed()) nextAt = f;
    if (policy === 'smart' && R.pours === 1 && R.matches === 2 && R.active.length === 0 && f === nextAt - 1) {
      const c = findCell(R.S, [M.SULFUR, M.OIL, M.PLANT], r); if (c) R.strike(c[0], c[1]);
    }
    for (let k = matchPlan.length - 1; k >= 0; k--) if (matchPlan[k] === f) {
      matchPlan.splice(k, 1); R.strike(15 + ((r() * (W - 30)) | 0), 30 + ((r() * 65) | 0));
    }
    R.tick(); f++;
  }
  R.closeAll();
  return { gold: R.gold, frames: f, locked, idle, ledgers: R.closedLog.length, firstAct: R.firstActionFrame };
}

if (require.main === module) {
  const n = +process.argv[2] || 30;
  const t0 = Date.now();
  for (const tut of [true, false]) for (const pol of ['random', 'naive', 'smart']) {
    const res = [], idles = []; let fr = 0;
    for (let s = 1; s <= n; s++) { const o = playRound(s, pol, { tutorial: tut }); res.push(o.gold); idles.push(o.idle / 3 / 60); fr += o.frames; }
    idles.sort((a, b) => a - b);
    res.sort((a, b) => a - b);
    const q = x => res[Math.floor(x * (res.length - 1))];
    console.log((tut ? '第1回合(教學手牌) ' : '隨機手牌         ') + pol.padEnd(7), 'p10', q(.1), 'p25', q(.25), 'med', q(.5), 'p75', q(.75), 'p90', q(.9),
      '| 平均回合秒數', (fr / n / 60).toFixed(1), '| 無事可做(×3快轉後) 中位', idles[idles.length >> 1].toFixed(1) + 's 最多', idles[idles.length - 1].toFixed(1) + 's',
      '| 過第1回合金線 20000：', (res.filter(g => g >= 20000).length / n * 100).toFixed(0) + '%');
  }
  console.log('ms', Date.now() - t0);
}
module.exports = { playRound, START_DECK, FIRST_HAND };
