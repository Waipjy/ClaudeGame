// Persona 2: a clumsy first-timer at 1366x768 — clicks before selecting, pours lava first, tries pouring with lid on,
// wastes a match into air, ignores hints until the 'wait' state. Usage: node playtest2.js <tag> [w] [h]
const { chromium } = require('/tmp/node_modules/playwright');
const path = require('path');
const tag = process.argv[2] || 'p2', Wd = +process.argv[3] || 1366, Hd = +process.argv[4] || 768;
const OUT = '/tmp/claude-0/shots_v02/';
(async () => {
  const b = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const pg = await b.newPage({ viewport: { width: Wd, height: Hd } });
  const errs = [];
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + path.join(__dirname, 'index.html') + '?seed=777');
  await pg.waitForTimeout(1200);
  const shot = async n => pg.screenshot({ path: OUT + `${tag}_${Wd}_${n}.png` });
  await pg.click('#go');
  const cell = async (cx, cy) => pg.evaluate(([cx, cy]) => { const c = document.getElementById('view').getBoundingClientRect(), L = __game.L; return [c.left + L.bx + (cx + .5) * L.cp, c.top + L.by + (cy + .5) * L.cp]; }, [cx, cy]);
  const M = await pg.evaluate(() => __game.M);
  const clickHand = async m => { const i = await pg.evaluate(m => __game.G.hand.indexOf(m), m); if (i < 0) return false; await pg.click(`#hand > :nth-child(${i + 1})`); return true; };
  // 1. click beaker without selecting
  let [x, y] = await cell(80, 40); await pg.mouse.click(x, y); await pg.waitForTimeout(200); await shot('a_noselect');
  // 2. lava first, by clicking the card
  await clickHand(M.LAVA); [x, y] = await cell(50, 3); await pg.mouse.move(x, y); await pg.mouse.down(); await pg.waitForTimeout(300); await pg.mouse.up();
  await pg.waitForTimeout(900); await shot('b_lava');
  // 3. lid on, then try to pour water
  await pg.click('#tLid'); await clickHand(M.WATER); [x, y] = await cell(55, 3); await pg.mouse.click(x, y); await pg.waitForTimeout(250); await shot('c_lid_block');
  await pg.click('#tLid'); [x, y] = await cell(55, 3); await pg.mouse.move(x, y); await pg.mouse.down(); await pg.waitForTimeout(200); await pg.mouse.up();
  await pg.waitForTimeout(1500); await shot('d_solidify');
  // 4. waste a match into the air
  await pg.click('#tMatch'); [x, y] = await cell(120, 20); await pg.mouse.move(x, y); await pg.waitForTimeout(200); await shot('e_match_air'); await pg.mouse.click(x, y);
  // 5. pour the rest quickly
  for (let k = 0; k < 2; k++) { await pg.keyboard.press('1'); [x, y] = await cell(30 + k * 60, 3); await pg.mouse.move(x, y); await pg.mouse.down(); await pg.waitForTimeout(150); await pg.mouse.up(); await pg.waitForTimeout(300); }
  await pg.waitForTimeout(2500); await shot('f_after_pours');
  const s1 = await pg.evaluate(() => ({ st: __game.R.status(), pours: __game.R.pours, m: __game.R.matches, gold: __game.R.gold, note: document.getElementById('note').hidden ? '' : document.getElementById('noteText').textContent }));
  // wait for end
  let st;
  for (let i = 0; i < 60; i++) { await pg.waitForTimeout(250); st = await pg.evaluate(() => ({ st: __game.R.status(), ov: !document.getElementById('overlay').hidden, note: document.getElementById('note').hidden ? '' : document.getElementById('noteText').textContent, gold: __game.R.gold })); if (st.ov || st.st === 'wait') break; }
  await shot('g_wait_or_end');
  if (st.st === 'wait') { await pg.keyboard.press('Enter'); for (let i = 0; i < 30; i++) { await pg.waitForTimeout(200); if (await pg.evaluate(() => !document.getElementById('overlay').hidden)) break; } await pg.waitForTimeout(300); await shot('h_end'); }
  console.log(JSON.stringify({ tag, s1, st, errs }, null, 1));
  await b.close();
})();
