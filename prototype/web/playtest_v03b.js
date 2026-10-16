// Usage: node playtest_v03b.js <shop|lose|lid>   (mobile 390x844 touch)
const { chromium } = require('/tmp/node_modules/playwright');
const path = require('path');
const persona = process.argv[2] || 'shop', OUT = '/tmp/claude-0/shots_v03/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + path.join(__dirname, 'index.html') + '?seed=77'); await pg.waitForTimeout(700);
  const shot = n => pg.screenshot({ path: OUT + `${persona}_${n}.png` });
  const cdp = await ctx.newCDPSession(pg);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  const tap = async (x, y) => { await touch('touchStart', x, y); await sleep(60); await touch('touchEnd'); };
  async function drag(from, to, release = true) { await touch('touchStart', from[0], from[1]); for (let i = 1; i <= 12; i++) { await touch('touchMove', from[0] + (to[0] - from[0]) * i / 12, from[1] + (to[1] - from[1]) * i / 12); await sleep(16); } if (release) await touch('touchEnd'); }
  const ev = (f, a) => pg.evaluate(f, a);
  const M = await ev(() => __game.M), sc = await ev(() => __game.L.sc);
  const pour = async (mat, cx, cy) => { const i = await ev(m => __game.G.hand.indexOf(m), mat); if (i < 0) return false; const f = await ev(i => __game.slotClient(i), i), t = await ev(([x, y]) => __game.cellClient(x, y), [cx, cy]); await drag(f, [t[0], t[1] + 66 * sc]); return true; };
  const out = { persona };
  await ev(() => { __game.G.tut = 9; });
  if (persona === 'lid') {
    await pour(M.WATER, 50, 60); await sleep(500); await pour(M.OIL, 50, 40); await sleep(900); await pour(M.SULFUR, 30, 40); await sleep(900);
    const mb = await ev(() => __game.btnClient('lid')); await tap(...mb); await sleep(300);
    out.lid = await ev(() => __game.R.S.lid);
    const fuel = await ev(() => ({ x: __game.G.fuelX, y: __game.G.fuelY })); const ft = await ev(([x, y]) => __game.cellClient(x, y), [fuel.x, fuel.y]);
    const m2 = await ev(() => __game.btnClient('match')); await drag(m2, [ft[0], ft[1] + 66 * sc]);
    await sleep(2500); await shot('a_lid_pressure'); await sleep(5000); await shot('b_later');
    out.gas = await ev(() => __game.R.S.gas); out.st = await ev(() => ({ lid: __game.R.S.lid, st: __game.R.status() }));
  } else if (persona === 'lose') {
    await pour(M.WATER, 50, 60); await sleep(900);
    const sb = await ev(() => __game.btnClient('seal')); await tap(...sb);
    for (let k = 0; k < 40; k++) { await sleep(300); if ((await ev(() => __game.mode)) !== 'play') break; }
    await sleep(1400); await shot('a_lose'); out.mode = await ev(() => __game.mode);
    await tap(195 * sc, (await ev(() => __game.L.Hl)) * sc - 120 * sc); await sleep(500); out.after = await ev(() => ({ mode: __game.mode, round: __game.G.round, tut: __game.G.tut }));
  } else if (persona === 'shop') {
    // win round 1 by script: water, lava, oil (burns), sulfur, match
    await ev(() => { __game.G.tut = 9; });
    await pour(M.WATER, 50, 60); await sleep(900); await pour(M.OIL, 50, 40); await sleep(900); await pour(M.SULFUR, 50, 40); await sleep(2600);
    const fuel = await ev(() => ({ x: __game.G.fuelX, y: __game.G.fuelY })); const ft = await ev(([x, y]) => __game.cellClient(x, y), [fuel.x, fuel.y]);
    const m2 = await ev(() => __game.btnClient('match')); await drag(m2, [ft[0], ft[1] + 66 * sc]);
    for (let k = 0; k < 80; k++) { await sleep(400); if ((await ev(() => __game.mode)) !== 'play') break; }
    await sleep(2200); out.mode = await ev(() => __game.mode); out.dbg = await ev(() => ({pours: __game.R.pours, matches: __game.R.matches, gold: __game.R.gold, st: __game.R.status(), open: __game.R.openLedgers().length, fuel: [__game.G.fuelX, __game.G.fuelY], tally: !!__game.fx.tally, q: __game.fx.tallyQ.length, ended: __game.G.ended})); await shot('a_shop');
    if (out.mode === 'shop') {
      const S = await ev(() => __game.shopPos()); out.money0 = await ev(() => __game.G.money);
      const items = await ev(() => __game.G.shopItems.map(i => ({ k: i.kind, p: i.price })));
      out.items = items;
      // tap first vial, then try the arcana
      const p0 = S.items[0]; await tap(p0.x * sc, p0.y * sc); await sleep(400);
      const p1 = S.items[2]; await tap(p1.x * sc, p1.y * sc); await sleep(400);
      out.money1 = await ev(() => __game.G.money); out.deck = await ev(() => __game.G.deck.length); out.arc = await ev(() => __game.G.arc.length);
      await shot('b_bought');
      await tap(S.reroll.x * sc, S.reroll.y * sc); await sleep(500);
      await tap(S.exit.x * sc, S.exit.y * sc); await sleep(1000);
      out.next = await ev(() => ({ mode: __game.mode, round: __game.G.round, tut: __game.G.tut, hand: __game.G.hand.length, target: __game.R.target }));
      await shot('c_round2');
    }
  }
  out.text = await pg.evaluate(() => document.body.innerText.replace(/\s/g, '')); out.violations = await pg.evaluate(() => window.__textViolations); out.errs = errs;
  out.perf = await pg.evaluate(() => ({ sim: __perf.simMs / __perf.frames, draw: __perf.drawMs / __perf.frames }));
  console.log(JSON.stringify(out)); await b.close();
})();
