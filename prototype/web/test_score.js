// B2 scoring tests (V04_SPEC §9 B2). Run: node test_score.js
const P = require('./sim.js');
const { M, createRound, scoreLedger, RX } = P;
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
// hand-built ledgers: counts = cells, evs = events, resN = destroyed residue cells, maxGen
const L = (counts, o) => Object.assign({ counts, evs: {}, resN: {}, maxGen: 1 }, o || {});

// 1. one ledger per trait, expected values computed by hand
// burst: 3 explosions -> trig 40*3=120, vol 0; el fire+air => mult 1+2=3 => 360
let r = scoreLedger(L({ blast: 3 }, { evs: { blast: 3 } }));
ok(r.matter === 120 && r.elem === 3 && r.gold === 360, `爆發：3 次爆炸 matter ${r.matter} x${r.elem} = ${r.gold} (期望 120 x3 = 360)`);
// sustain: burn 100 cells -> no trigger? n>=3 but trig 0; vol 4*100/10 = 40; fire => x2 => 80
r = scoreLedger(L({ burn: 100 }));
ok(r.matter === 40 && r.elem === 2 && r.gold === 80, `持續：燃燒 100 格 matter ${r.matter} x${r.elem} = ${r.gold} (期望 40 x2 = 80)`);
// chain: quench 50 cells maxGen 3: trig 5 + 2*50/10=10 => 15; lit water+air => 1+2+min(3,2)=5 => 75
r = scoreLedger(L({ quench: 50 }, { maxGen: 3 }));
ok(r.matter === 15 && r.chain === 2 && r.elem === 5 && r.gold === 75, `連鎖：淬熄 50 格 gen3 matter ${r.matter} x${r.elem} (chain +${r.chain}) = ${r.gold} (期望 15 x5 = 75)`);
// chain bonus capped at +3 and absent without chain-trait reaction
r = scoreLedger(L({ quench: 50 }, { maxGen: 9 }));
ok(r.chain === 3, `連鎖加成上限 +3 (${r.chain})`);
r = scoreLedger(L({ burn: 100 }, { maxGen: 6 }));
ok(r.chain === 0, `無連鎖型反應則無連鎖加成 (${r.chain})`);
// break: dissolve 20 cells, 5 of them residue: trig 5 + 2*(20 + 2*5)/10 = 5 + 6 = 11; earth => x2 => 22
r = scoreLedger(L({ dissolve: 20 }, { resN: { dissolve: 5 } }));
ok(r.matter === 11 && r.gold === 22, `破壞：溶蝕 20 格含 5 殘渣 matter ${r.matter} = ${r.gold} (期望 11 → 22)`);
// residue: solidify 12 cells: 20 + 4*12/10=4.8->5 => 25; earth => x2 => 50
r = scoreLedger(L({ solidify: 12 }));
ok(r.matter === 25 && r.gold === 50, `殘渣：凝岩 12 格 matter ${r.matter} = ${r.gold} (期望 25 → 50)`);
// catalyst: condense 30 cells: no trigger, vol 1*30/10 = 3; water => x2 => 6 ; and still lights its element
r = scoreLedger(L({ condense: 30 }));
ok(r.trigSum === 0 && r.matter === 3 && r.nLit === 1 && r.gold === 6, `觸媒：凝結 30 格 matter ${r.matter} 點亮 ${r.nLit} = ${r.gold} (期望 3 x2 = 6)`);
// trigger needs n >= 3 (non burst)
r = scoreLedger(L({ solidify: 2 }));
ok(r.trigSum === 0, `n<3 沒有觸發分 (${r.trigSum})`);
// diminishing returns above 240 cells: 340 burn -> eff 240+50=290 -> 4*29 = 116
r = scoreLedger(L({ burn: 340 }));
ok(r.matter === 116, `有效格數遞減：燃燒 340 格 matter ${r.matter} (期望 116)`);
// lidpop: 1 event, 80 gas cells: 150 + 1*80/10 = 158; air => x2 = 316; thickglass x2 => (300+16)=316 *2 ...
r = scoreLedger(L({ lidpop: 80 }, { evs: { lidpop: 1 } }));
ok(r.matter === 158 && r.gold === 316, `爆蓋：1 次 80 氣體 matter ${r.matter} = ${r.gold} (期望 158 → 316)`);
// charms
r = scoreLedger(L({ burn: 100 }), { pyro: true });
ok(r.matter === 70, `烈火：燃燒每 10 格 +3 → 100 格 matter ${r.matter} (期望 70)`);
r = scoreLedger(L({ solidify: 12 }), { magma: true });
ok(r.matter === 45, `岩漿心：凝岩觸發 +20 matter ${r.matter} (期望 45)`);
r = scoreLedger(L({ quench: 50 }), { tower: true });
ok(r.matter === 5 + 30, `冷凝塔：淬熄量分 x3 matter ${r.matter} (期望 35)`);

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
