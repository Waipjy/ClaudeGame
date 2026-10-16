const { chromium } = require('/tmp/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + path.join(__dirname, 'index.html') + '?seed=4242');
  await pg.waitForTimeout(1200);
  await pg.screenshot({ path: '/tmp/claude-0/shots_v03/smoke.png' });
  console.log(JSON.stringify(errs.slice(0, 8)));
  await b.close();
})();
