// B3 calibration (V04_SPEC §5.4): replay bot rounds, ask the live estimator before every pour / match, compare with the ledger's real gold.
//   node calibrate_preview.js [pours=200] [--seed0=1] [--policy=smart|random] [--quiet]
// Prints interval hit rate (target >= 70%), share above the upper bound (target <= 15%), and actual/estimated medians per reaction (these feed the `conv` column of PAIRS in src/estimate.js).
// The scoring numbers are never touched here; only the interval factors (CONV.lo / CONV.hi / CONV.reach) and the conv column are tuned.
const P = require('./sim.js');
const E = require('./src/estimate.js');
const args = process.argv.slice(2), flag = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const target = +args.find(x => /^\d+$/.test(x)) || 200, seed0 = +flag('seed0', 1), policy = flag('policy', 'smart');
const orig = P.createRound; let cur = null;
P.createRound = function (opt) {
  const R = orig(opt), sp = R.startPour, st = R.strike;
  R.startPour = function (m, x) {
    const est = E.estimatePour(R.S, R.mods, m, x, R.pourAmount, Math.random());
    const Pp = sp.call(R, m, x); if (Pp) Pp.L.est = est; return Pp;
  };
  R.strike = function (x, y) {
    const est = E.estimateMatch(R.S, R.mods, x, y, Math.random());
    const Lg = st.call(R, x, y); if (Lg) Lg.est = est; return Lg;
  };
  cur = R; return R;
};
const bot = require('./bot.js');
const NAMES = ['E','SAND','WATER','OIL','FIRE','LAVA','STONE','STEAM','ACID','POWDER','ICE','GLASS','SEED','PLANT','SMOKE','WALL','EMBER','MUD','SULFUR','FUME'];
const S = { pour: { n: 0, hit: 0, above: 0, below: 0, nt: 0, hitNt: 0 }, match: { n: 0, hit: 0, above: 0, below: 0, nt: 0, hitNt: 0 } };
const ratio = {};
let rounds = 0;
const want = (k) => S.pour.n < target;
for (let s = seed0; S.pour.n < target; s++) for (let k = 0; k < 9 && S.pour.n < target; k++) {
  bot.playRoundK(s, policy, k); rounds++;
  for (const L of cur.closedLog) {
    if (!L.est || (L.kind !== 'pour' && L.kind !== 'match')) continue;
    const e = L.est, g = L.result.gold, T = S[L.kind];
    T.n++; const ok = g >= e.lo && g <= e.hi; if (ok) T.hit++; else if (g > e.hi) T.above++; else T.below++;
    if (e.hi > 0 || g > 0) { T.nt++; if (ok) T.hitNt++; }
    const byrx = {}; for (const it of e.items) if (it.kind === 'rx') byrx[it.rx] = (byrx[it.rx] || 0) + 1;
    for (const it of e.items) if (it.kind === 'rx' && byrx[it.rx] === 1 && it.n > 0) { const key = (it.a >= 0 ? NAMES[it.a] : 'match') + '>' + NAMES[it.b] + ' ' + it.rx; (ratio[key] = ratio[key] || []).push((L.counts[it.rx] || 0) / it.n); }
  }
}
const pct = (a, b) => b ? (a / b * 100).toFixed(1) + '%' : 'n/a';
for (const kind of ['pour', 'match']) { const T = S[kind];
  console.log(`${kind.padEnd(5)} n=${T.n} 命中 ${pct(T.hit, T.n)} 高於上限 ${pct(T.above, T.n)} 低於下限 ${pct(T.below, T.n)} | 非零(估計或實際>0) n=${T.nt} 命中 ${pct(T.hitNt, T.nt)}`); }
if (!args.includes('--quiet')) {
  console.log('actual/estimated count medians (n>=4), 1.00 = perfectly calibrated:');
  for (const [k, v] of Object.entries(ratio).sort()) if (v.length >= 4) { v.sort((a, b) => a - b); console.log('  ' + k.padEnd(26), String(v.length).padStart(3), v[v.length >> 1].toFixed(2)); }
}
console.log(`rounds ${rounds}, CONV ${JSON.stringify(E.CONV)}`);
const ok = S.pour.hit / S.pour.n >= 0.7 && S.pour.above / S.pour.n <= 0.15;
console.log(ok ? 'PASS (命中 >= 70%, 高於上限 <= 15%)' : 'FAIL');
process.exit(ok ? 0 : 1);
