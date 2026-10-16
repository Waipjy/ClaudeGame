// Automated "first-time player" playtest with Playwright. Usage: node playtest.js <tag> [width] [height]
const { chromium } = require('/tmp/node_modules/playwright');
const path = require('path');
const tag = process.argv[2] || 'r1', Wd = +process.argv[3] || 1920, Hd = +process.argv[4] || 1080;
const OUT = '/tmp/claude-0/shots_v02/';
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ proxy });
  const pg = await b.newPage({ viewport: { width: Wd, height: Hd } });
  const errs = [];
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + path.join(__dirname, 'index.html') + '?seed=12345');
  await pg.waitForTimeout(1500);
  const shot = async n => { await pg.screenshot({ path: OUT + `${tag}_${Wd}_${n}.png` }); };
  await shot('00_intro');
  await pg.keyboard.press('Enter');
  await pg.waitForTimeout(400);
  const cell = async (cx, cy) => pg.evaluate(([cx, cy]) => { const c = document.getElementById('view').getBoundingClientRect(), L = __game.L; return [c.left + L.bx + (cx + .5) * L.cp, c.top + L.by + (cy + .5) * L.cp]; }, [cx, cy]);
  const handIdx = async m => pg.evaluate(m => __game.G.hand.indexOf(m), m);
  const M = await pg.evaluate(() => __game.M);
  const pick = async m => { const i = await handIdx(m); if (i < 0) return false; await pg.keyboard.press(String(i + 1)); return true; };
  const pourAt = async (cx, holdMs, dx) => { let [x, y] = await cell(cx, 4); await pg.mouse.move(x, y); await pg.mouse.down(); for (let k = 0; k < 10; k++) { await pg.mouse.move(x + (dx || 0) * k / 10, y); await pg.waitForTimeout(holdMs / 10); } await pg.mouse.up(); };
  const t0 = Date.now();
  await shot('01_start');
  await pick(M.WATER); await pg.waitForTimeout(200);
  let [hx, hy] = await cell(70, 10); await pg.mouse.move(hx, hy); await pg.waitForTimeout(250);
  await shot('02_selected');
  const firstAct = Date.now() - t0;
  await pourAt(60, 500, 120);
  // immediately pour sulfur while water still flows
  await pick(M.SULFUR); await pourAt(80, 300, 0);
  await pg.waitForTimeout(250); await shot('03_flowing');
  await pg.waitForTimeout(1300); await shot('04_match_hint');
  await pg.keyboard.press('f'); await pg.waitForTimeout(100);
  const fuel = await pg.evaluate(() => [__game.G.fuelX, __game.G.fuelY]);
  let [mx, my] = await cell(fuel[0], fuel[1]); await pg.mouse.move(mx, my); await pg.waitForTimeout(300);
  await shot('05_match_hover');
  await pg.mouse.down(); await pg.mouse.up();
  await pg.waitForTimeout(1600); await shot('06_burning');
  await pg.waitForTimeout(1500); await shot('07_ledger');
  // oil + lid
  await pick(M.OIL); await pourAt(110, 300, -20);
  await pg.waitForTimeout(800);
  await pg.keyboard.press(' '); await pg.waitForTimeout(300); await shot('08_lid');
  // second match into oil
  const f2 = await pg.evaluate(() => { const S = __game.R.S; for (let p = 0; p < S.W * S.H; p++) if (S.t[p] === __game.M.OIL) return [p % S.W, (p / S.W) | 0]; return null; });
  if (f2) { const [ox, oy] = await cell(f2[0], f2[1]); await pg.mouse.click(ox, oy, { button: 'right' }); }
  let popped = false;
  for (let i = 0; i < 30; i++) { await pg.waitForTimeout(200); if (!(await pg.evaluate(() => __game.R.S.lid))) { popped = true; break; } }
  await pg.waitForTimeout(150); await shot('09_pop');
  if (!popped) await pg.keyboard.press(' ');
  // last vial
  const rest = await pg.evaluate(() => __game.G.hand.slice());
  await pg.keyboard.press('1'); await pourAt(40, 300, 40);
  await pg.waitForTimeout(1200); await shot('10_last');
  const st = {};
  for (let i = 0; i < 60; i++) { await pg.waitForTimeout(250); const s = await pg.evaluate(() => ({ st: __game.R.status(), ov: !document.getElementById('overlay').hidden, gold: __game.R.gold, t: __game.R.target })); Object.assign(st, s); if (s.ov) break; if (s.st === 'wait') { await pg.keyboard.press('Enter'); } }
  await pg.waitForTimeout(400); await shot('11_end');
  const perf = await pg.evaluate(() => { const p = window.__perf; return { fps: null, simMsPerFrame: (p.simMs / p.frames).toFixed(2), drawMsPerFrame: (p.drawMs / p.frames).toFixed(2), frames: p.frames }; });
  const lay = await pg.evaluate(() => ({ cp: __game.L.cp, docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight, popped: 0 }));
  console.log(JSON.stringify({ tag, Wd, Hd, firstActMs: firstAct, popped, status: st, perf, lay, errs }, null, 1));
  // if shop: buy first item and start next round
  if (st.ov) { await pg.keyboard.press('Enter'); await pg.waitForTimeout(600); await shot('12_round2'); }
  await b.close();
})();
