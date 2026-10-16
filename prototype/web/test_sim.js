// v0.2 acceptance tests for sim.js (GDD §8 items 1, 3, 5, 6). Run: node test_sim.js
const P = require('./sim.js');
const { M, createRound, RX } = P;
let fail = 0;
function ok(cond, msg) { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; }

// script = [[frame, action, ...args]]; returns {R, events}
function play(seed, script, frames, opt) {
  const R = createRound(Object.assign({ seed, pours: 4, matches: 2, target: 1e9, mods: {} }, opt || {}));
  const events = [];
  R.onRx = (L, type, p, g) => events.push([R.frame, L.id, L.kind, type, p, g]);
  let P0 = null;
  for (let f = 0; f < frames; f++) {
    for (const s of script) if (s[0] === f) {
      if (s[1] === 'pour') P0 = R.startPour(s[2], s[3]);
      if (s[1] === 'match') R.strike(s[2], s[3]);
      if (s[1] === 'lid') R.toggleLid();
    }
    R.tick();
  }
  return { R, events };
}
function hash(arr) { let h = 2166136261; for (const e of arr) for (const v of String(e)) { h ^= v.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

const t0 = Date.now();
// 1. determinism of src sequence
const scr = [[0, 'pour', M.OIL, 60], [40, 'pour', M.SULFUR, 90], [90, 'pour', M.WATER, 120], [200, 'match', 70, 100]];
const a = play(7, scr, 900), b = play(7, scr, 900);
ok(hash(a.events) === hash(b.events) && a.events.length > 100, `決定性：兩次事件序列 hash 相同 (${a.events.length} 事件, ${hash(a.events)})`);

// 2. oil laid first, then match => all burns credited to match ledger
const c = play(3, [[0, 'pour', M.OIL, 80], [260, 'match', 80, 100]], 900);
const burns = c.events.filter(e => e[3] === 'burn');
const matchL = c.R.order.find(L => L.kind === 'match');
ok(burns.length > 200 && burns.every(e => e[1] === matchL.id), `先倒油→火柴：燃燒 ${burns.length} 次全部記在火柴帳 #${matchL.id}`);

// 3. ledger sum equals round gold (exact)
const d = play(11, [[0, 'pour', M.SULFUR, 50], [30, 'pour', M.OIL, 100], [70, 'pour', M.WATER, 80], [140, 'match', 60, 78], [160, 'pour', M.LAVA, 120]], 1500);
d.R.closeAll();
const sum = d.R.closedLog.reduce((s, L) => s + L.result.gold, 0);
ok(sum === d.R.gold && sum > 0, `帳本加總 ${sum} = 回合金 ${d.R.gold}`);

// 4. sulfur chain lights 3+ elements: sulfur on water, match => blue flame (fire), fume (air), acid rain (water)
const e = play(5, [[0, 'pour', M.WATER, 80], [70, 'pour', M.SULFUR, 80], [180, 'match', 80, 74]], 1500);
const mL = e.R.order.find(L => L.kind === 'match');
e.R.closeAll();
console.log('   硫磺帳:', JSON.stringify(mL.counts), 'lit', mL.result.lit.join(''), 'gold', mL.result.gold);
ok(mL.result.nLit >= 3, `硫磺浮水＋火柴點亮 ${mL.result.nLit} 元素`);

// 5. lid builds pressure and pops
const f = play(9, [[0, 'pour', M.OIL, 80], [60, 'pour', M.WATER, 60], [120, 'lid'], [130, 'match', 80, 76]], 1500, {});
const pops = f.R.order.reduce((s, L) => s + (L.counts.lidpop || 0), 0);
console.log('   爆蓋 events', pops, 'lid now', f.R.S.lid);
ok(pops > 0, '蓋蓋子＋點火會爆蓋');

// 6. pour concurrently while previous still flowing
const g = play(2, [[0, 'pour', M.SAND, 40], [10, 'pour', M.WATER, 80], [20, 'pour', M.LAVA, 120]], 600);
ok(g.R.order.length >= 3 && g.R.pours === 1, '流動中可連續倒（3 倒同時進行）');

// perf
const t1 = Date.now();
const h = play(1, scr, 600);
console.log('perf: 600 frames(×3 steps) ms', Date.now() - t1, '→ per frame', ((Date.now() - t1) / 600).toFixed(2), 'ms');
console.log('total ms', Date.now() - t0, fail ? `FAILURES ${fail}` : 'ALL PASS');
process.exitCode = fail ? 1 : 0;
