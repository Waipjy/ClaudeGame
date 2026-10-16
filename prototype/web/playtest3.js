// Persona 3: never ignites anything -> 'wait' prompt -> seal -> lose screen. Also round-2 shop flow. Usage: node playtest3.js <tag> [w] [h]
const { chromium } = require('/tmp/node_modules/playwright');
const path = require('path');
const tag = process.argv[2] || 'p3', Wd = +process.argv[3] || 1920, Hd = +process.argv[4] || 1080;
const OUT = '/tmp/claude-0/shots_v02/';
(async () => {
  const b = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const pg = await b.newPage({ viewport: { width: Wd, height: Hd } });
  const errs = [];
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + path.join(__dirname, 'index.html') + '?seed=4242');
  await pg.waitForTimeout(1000);
  const shot = async n => pg.screenshot({ path: OUT + `${tag}_${Wd}_${n}.png` });
  await pg.keyboard.press('Enter');
  const cell = async (cx, cy) => pg.evaluate(([cx, cy]) => { const c = document.getElementById('view').getBoundingClientRect(), L = __game.L; return [c.left + L.bx + (cx + .5) * L.cp, c.top + L.by + (cy + .5) * L.cp]; }, [cx, cy]);
  const M = await pg.evaluate(() => __game.M);
  const order = [M.WATER, M.OIL, M.SULFUR, M.SAND, M.WATER, M.SAND];
  for (const m of order) {
    const i = await pg.evaluate(m => __game.G.hand.indexOf(m), m); if (i < 0) continue;
    if ((await pg.evaluate(() => __game.R.pours)) === 0) break;
    await pg.keyboard.press(String(i + 1)); const [x, y] = await cell(40 + i * 25, 3);
    await pg.mouse.move(x, y); await pg.mouse.down(); await pg.waitForTimeout(100); await pg.mouse.up(); await pg.waitForTimeout(700);
  }
  let st;
  for (let i = 0; i < 40; i++) { await pg.waitForTimeout(250); st = await pg.evaluate(() => ({ st: __game.R.status(), note: document.getElementById('note').hidden ? '' : document.getElementById('noteText').textContent, gold: __game.R.gold })); if (st.st === 'wait') break; }
  await pg.waitForTimeout(500); await shot('a_wait');
  await pg.keyboard.press('Enter');
  for (let i = 0; i < 30; i++) { await pg.waitForTimeout(200); if (await pg.evaluate(() => !document.getElementById('overlay').hidden)) break; }
  await pg.waitForTimeout(300); await shot('b_lose');
  const txt = await pg.evaluate(() => document.getElementById('overlay').innerText);
  // perf sample: 3 s of a busy beaker after restart
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
  const fps = await pg.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(n / 2); }; requestAnimationFrame(f); }));
  console.log(JSON.stringify({ tag, st, txt: txt.slice(0, 200), fps, errs }, null, 1));
  await b.close();
})();
