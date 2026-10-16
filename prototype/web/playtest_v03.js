// Usage: node playtest_v03.js <persona: follow|idle|desktop|text> [tag]
const { chromium } = require('/tmp/node_modules/playwright');
const path = require('path');
const persona = process.argv[2] || 'follow', tag = process.argv[3] || persona;
const OUT = '/tmp/claude-0/shots_v03/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const desktop = persona === 'desktop';
  const ctx = await b.newContext(desktop ? { viewport: { width: 1366, height: 768 } } : { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + path.join(__dirname, 'index.html') + '?seed=4242');
  await pg.waitForTimeout(800);
  const shot = n => pg.screenshot({ path: OUT + `${tag}_${n}.png` });
  const cdp = await ctx.newCDPSession(pg);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  async function drag(from, to, hold = 0, release = true, steps = 14) {
    if (desktop) { await pg.mouse.move(from[0], from[1]); await pg.mouse.down(); for (let i = 1; i <= steps; i++) { await pg.mouse.move(from[0] + (to[0] - from[0]) * i / steps, from[1] + (to[1] - from[1]) * i / steps); await sleep(16); } await sleep(hold); if (release) await pg.mouse.up(); return; }
    await touch('touchStart', from[0], from[1]);
    for (let i = 1; i <= steps; i++) { await touch('touchMove', from[0] + (to[0] - from[0]) * i / steps, from[1] + (to[1] - from[1]) * i / steps); await sleep(16); }
    await sleep(hold); if (release) await touch('touchEnd');
  }
  const up = async () => desktop ? pg.mouse.up() : touch('touchEnd');
  const g = fn => pg.evaluate(fn);
  const slotOf = m => pg.evaluate(m => __game.G.hand.indexOf(m), m);
  const M = await g(() => __game.M);
  // finger sits OFF below the target (tip = finger - 66 touch / 22 mouse)
  const OFF = desktop ? 22 : 66;
  const pourAt = async (mat, cx, cy, hold = 0) => {
    const i = await slotOf(mat); if (i < 0) return false;
    const from = await pg.evaluate(i => __game.slotClient(i), i), to = await pg.evaluate(([cx, cy]) => __game.cellClient(cx, cy), [cx, cy]);
    const sc = await g(() => __game.L.sc);
    await drag(from, [to[0], to[1] + OFF * sc], hold); return true;
  };
  const status = () => pg.evaluate(() => ({ tut: __game.G.tut, pours: __game.R.pours, matches: __game.R.matches, gold: __game.R.gold, st: __game.R.status(), mode: __game.mode, round: __game.G.round }));
  const out = { persona, errs: [] };
  if (persona === 'follow' || persona === 'desktop') {
    await pourAt(M.WATER, 50, 60); await sleep(600);
    // hold over the water with lava to capture ghost preview
    const i = await slotOf(M.LAVA); const from = await pg.evaluate(i => __game.slotClient(i), i), to = await pg.evaluate(() => __game.cellClient(50, 100));
    const sc = await g(() => __game.L.sc);
    await drag(from, [to[0], to[1] + OFF * sc], 500, false); await shot('a_ghost_lava'); await up();
    await sleep(2500); await shot('b_after_lava');
    await pourAt(M.OIL, 22, 60); await sleep(1500);
    await pourAt(M.SULFUR, 22, 60); await sleep(2500);
    // match drag with preview
    const fuel = await g(() => ({ x: __game.G.fuelX, y: __game.G.fuelY }));
    const mb = await pg.evaluate(() => __game.btnClient('match')), ft = await pg.evaluate(([x, y]) => __game.cellClient(x, y), [fuel.x, fuel.y]);
    const sc2 = await g(() => __game.L.sc);
    await drag(mb, [ft[0], ft[1] + OFF * sc2], 400, false); await shot('c_match_preview'); await up();
    for (let k = 0; k < 6; k++) { await sleep(700); if (k === 1) await shot('d_scoring1'); if (k === 3) await shot('d_scoring2'); }
    let st; for (let k = 0; k < 60; k++) { st = await status(); if (st.mode !== 'play') break; await sleep(500); }
    await sleep(1200); await shot('e_after'); out.st = await status();
  } else if (persona === 'idle') {
    await sleep(2000); await shot('a_2s'); await sleep(4300); await shot('b_6s'); await sleep(2000); await shot('c_8s'); await sleep(2200); out.st = await status();
  }
  out.text = await pg.evaluate(() => document.body.innerText.replace(/\s/g, ''));
  out.violations = await pg.evaluate(() => window.__textViolations);
  out.errs = errs;
  out.fps = await pg.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); else res(n / 1.5); }; requestAnimationFrame(f); }));
  console.log(JSON.stringify(out));
  await b.close();
})();
