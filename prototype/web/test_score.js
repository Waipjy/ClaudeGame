// B2 scoring tests (V04_SPEC §9 B2). Run: node test_score.js
const P = require('./sim.js');
const { M, createRound, scoreLedger, RX } = P;
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
// hand-built ledgers: counts = cells, evs = events, resN = destroyed residue cells, maxGen
const L = (counts, o) => Object.assign({ counts, evs: {}, resN: {}, maxGen: 1 }, o || {});

// 1. one ledger per trait, expected values computed by hand (V04_SPEC §4.2: volume = vol x cells / 100)
// burst: 3 explosions -> trig 12*3=36, vol 0; el fire+air => mult 1+2=3 => 108
let r = scoreLedger(L({ blast: 3 }, { evs: { blast: 3 } }));
ok(r.matter === 36 && r.elem === 3 && r.gold === 108, `爆發：3 次爆炸 matter ${r.matter} x${r.elem} = ${r.gold} (期望 36 x3 = 108)`);
// burst trigger capped at 5 events per ledger: 9 explosions -> 12*5 = 60
r = scoreLedger(L({ blast: 9 }, { evs: { blast: 9 } }));
ok(r.trigSum === 60, `爆發觸發最多算 5 次 (${r.trigSum}，期望 60)`);
// sustain: burn 200 cells -> trig 0; vol 2*200/100 = 4; fire => x2 => 8
r = scoreLedger(L({ burn: 200 }));
ok(r.matter === 4 && r.elem === 2 && r.gold === 8, `持續：燃燒 200 格 matter ${r.matter} x${r.elem} = ${r.gold} (期望 4 x2 = 8)`);
// chain: quench 50 cells maxGen 3: trig 10 + 2*50/100=1 => 11; lit water+air => 1+2+min(3,2)=5 => 55
r = scoreLedger(L({ quench: 50 }, { maxGen: 3 }));
ok(r.matter === 11 && r.chain === 2 && r.elem === 5 && r.gold === 55, `連鎖：淬熄 50 格 gen3 matter ${r.matter} x${r.elem} (chain +${r.chain}) = ${r.gold} (期望 11 x5 = 55)`);
// chain bonus capped at +3 and absent without chain-trait reaction
r = scoreLedger(L({ quench: 50 }, { maxGen: 9 }));
ok(r.chain === 3, `連鎖加成上限 +3 (${r.chain})`);
r = scoreLedger(L({ burn: 100 }, { maxGen: 6 }));
ok(r.chain === 0, `無連鎖型反應則無連鎖加成 (${r.chain})`);
// break: dissolve 100 cells, 50 of them residue: trig 10 + 2*(100 + 2*50)/100 = 10 + 4 = 14; earth => x2 => 28
r = scoreLedger(L({ dissolve: 100 }, { resN: { dissolve: 50 } }));
ok(r.matter === 14 && r.gold === 28, `破壞：溶蝕 100 格含 50 殘渣 matter ${r.matter} = ${r.gold} (期望 14 → 28)`);
// residue: solidify 100 cells: 20 + 3*100/100 = 23; earth => x2 => 46
r = scoreLedger(L({ solidify: 100 }));
ok(r.matter === 23 && r.gold === 46, `殘渣：凝岩 100 格 matter ${r.matter} = ${r.gold} (期望 23 → 46)`);
// catalyst: condense 100 cells: no trigger, vol 1*100/100 = 1; water => x2 => 2 ; and still lights its element
r = scoreLedger(L({ condense: 100 }));
ok(r.trigSum === 0 && r.matter === 1 && r.nLit === 1 && r.gold === 2, `觸媒：凝結 100 格 matter ${r.matter} 點亮 ${r.nLit} = ${r.gold} (期望 1 x2 = 2)`);
// trigger needs n >= 3 (non burst)
r = scoreLedger(L({ solidify: 2 }));
ok(r.trigSum === 0, `n<3 沒有觸發分 (${r.trigSum})`);
// diminishing returns above 240 cells: 1240 burn -> eff 240+500=740 -> 2*7.4 = 14.8 -> 15
r = scoreLedger(L({ burn: 1240 }));
ok(r.matter === 15, `有效格數遞減：燃燒 1240 格 matter ${r.matter} (期望 15)`);
// lidpop: 1 event, 300 gas cells: 50 + 1*300/100 = 53; air => x2 = 106
r = scoreLedger(L({ lidpop: 300 }, { evs: { lidpop: 1 } }));
ok(r.matter === 53 && r.gold === 106, `爆蓋：1 次 300 氣體 matter ${r.matter} = ${r.gold} (期望 53 → 106)`);
// trigger share: a typical tutorial ledger (water + sulfur fire) -> trigger points are a large part of the base
r = scoreLedger(L({ quench: 120, acidrain: 600, fume: 300 }, { maxGen: 3 }));
ok(r.trigSum / r.matter >= 0.3 && r.trigSum / r.matter <= 0.7, `觸發分占基礎分 ${(r.trigSum / r.matter * 100).toFixed(0)}%（期望 30–70%）`);
// charms
r = scoreLedger(L({ burn: 200 }), { pyro: true });
ok(r.matter === 8, `烈火：燃燒每 100 格 +2 → 200 格 matter ${r.matter} (期望 8)`);
r = scoreLedger(L({ solidify: 100 }), { magma: true });
ok(r.matter === 43, `岩漿心：凝岩觸發 +20 matter ${r.matter} (期望 43)`);
r = scoreLedger(L({ quench: 50 }), { tower: true });
ok(r.matter === 10 + 3, `冷凝塔：淬熄量分 x3 matter ${r.matter} (期望 13)`);
r = scoreLedger(L({ blast: 2 }, { evs: { blast: 2 } }), { demolition: true });
ok(r.trigSum === 48, `拆除：爆炸觸發 +12 → 2 次 ${r.trigSum} (期望 48)`);

// 2. lava poured into water (fixed seed) -> solidify trigger 20 appears in the ledger
function play(seed, script, frames) {
  const R = createRound({ seed, pours: 4, matches: 2, target: 1e9, mods: {} });
  for (let f = 0; f < frames; f++) {
    for (const s of script) if (s[0] === f && s[1] === 'pour') R.startPour(s[2], s[3]);
    R.tick();
  }
  R.closeAll();
  return R;
}
const Rl = play(21, [[0, 'pour', M.WATER, 50], [60, 'pour', M.LAVA, 50]], 700);
const solid = Rl.closedLog.map(l => l.result.rows.find(x => x.type === 'solidify')).filter(Boolean);
console.log('   凝岩 rows:', JSON.stringify(solid.map(x => ({ n: x.n, trig: x.trig, vol: x.vol }))));
ok(solid.length > 0 && solid.some(x => x.trig === 20), '熔岩倒進水裡：凝岩觸發分 20');

// 3. acid on residue cell scores 3x the volume of acid on plain sand (sim-level unit test)
function dissolveVol(mat, markRes) {
  const R = createRound({ seed: 5, pours: 0, matches: 0, target: 1e9, mods: {} });
  const S = R.S, W = P.W, H = P.H;
  S.reset();
  // clear the mud, build a floor of walls under a single test column
  for (let p = 0; p < W * H; p++) if (S.t[p] === M.MUD) S.t[p] = M.E;
  const x = 50, y = 100;
  const P1 = (y + 1) * W + x, Pc = y * W + x;
  S.t[P1] = M.WALL;
  S.t[Pc] = mat; if (markRes) S.res[Pc] = 1;
  S.t[Pc - W - 1] = M.WALL; S.t[Pc - W + 1] = M.WALL; S.t[Pc - 1] = M.WALL; S.t[Pc + 1] = M.WALL;
  S.t[Pc - W] = M.ACID; S.src[Pc - W] = 1; S.src[Pc] = 1;
  const Lg = { id: 1, kind: 'pour', counts: {}, evs: {}, resN: {}, maxGen: 0, n: 0, lastF: 0, openF: 0, closed: false };
  R.ledgers.set(1, Lg); R.order.push(Lg);
  let got = 0;
  for (let i = 0; i < 400 && !(Lg.counts.dissolve >= 1); i++) { S.step(); }
  return scoreLedger(Lg, {}).rows.find(r => r.type === 'dissolve');
}
const dPlain = dissolveVol(M.SAND, false), dRes = dissolveVol(M.STONE, true);
console.log('   溶蝕 plain:', JSON.stringify(dPlain), 'residue:', JSON.stringify(dRes));
ok(dPlain && dRes && Math.abs(dRes.volRaw - 3 * dPlain.volRaw) < 1e-9, `酸溶蝕殘渣格量分 ${dRes && dRes.volRaw} = 3 x 普通沙 ${dPlain && dPlain.volRaw}`);
console.log(fail ? 'FAILURES ' + fail : 'ALL PASS');
process.exitCode = fail ? 1 : 0;
