# B3 verification: python3 playtest_v04_b3.py  (needs playwright + chromium). Screenshots go to docs/design/playtests/v04_b3/
# Checks the drag preview card (content, never under the finger / cursor / carried vial, never outside the canvas), the goal-bar estimate segment,
# the hand tip card, the codex panel (fresh = 0/16, found after the tutorial round, survives reload) and that a dead localStorage does not break anything.
import asyncio, json, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'docs', 'design', 'playtests', 'v04_b3') + '/'
URL = 'file://' + os.path.join(HERE, 'index.html') + '?seed=77'
os.makedirs(OUT, exist_ok=True)
res = {'fail': []}
def check(c, m):
    if not c: res['fail'].append(m)
    print(('PASS ' if c else 'FAIL ') + m)
async def boot(b, w, h, init=None, url=URL, touch=False):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, locale='zh-TW')
    if init: await ctx.add_init_script(init)
    pg = await ctx.new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') and 'fonts.g' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    await pg.goto(url, wait_until='commit')
    await pg.wait_for_function('window.__game && window.__game.G')
    return ctx, pg, errs
async def pev(pg, typ, x, y, ptype):
    await pg.evaluate('([t,x,y,pt]) => document.getElementById("view").dispatchEvent(new PointerEvent(t, {clientX:x, clientY:y, pointerId:7, pointerType:pt, isPrimary:true, bubbles:true, button:0, buttons:t==="pointerup"?0:1}))', [typ, x, y, ptype])
async def hold(pg, f, t, ptype='mouse', steps=10):
    """press at f, drag to t and keep holding (no release)."""
    if ptype == 'mouse':
        await pg.mouse.move(*f); await pg.mouse.down()
        for i in range(1, steps + 1):
            await pg.mouse.move(f[0] + (t[0] - f[0]) * i / steps, f[1] + (t[1] - f[1]) * i / steps); await pg.wait_for_timeout(16)
    else:
        await pev(pg, 'pointerdown', f[0], f[1], ptype)
        for i in range(1, steps + 1):
            await pev(pg, 'pointermove', f[0] + (t[0] - f[0]) * i / steps, f[1] + (t[1] - f[1]) * i / steps, ptype); await pg.wait_for_timeout(16)
async def move_to(pg, t, ptype='mouse'):
    if ptype == 'mouse': await pg.mouse.move(*t, steps=3)
    else: await pev(pg, 'pointermove', t[0], t[1], ptype)
async def release_away(pg, ptype='mouse'):
    """drop the vial back on the hand (outside the beaker) so nothing is poured."""
    L = await pg.evaluate('({x: __game.L.bx + 10, y: __game.L.handY + 50})')
    c = await pg.evaluate('([x,y]) => __game.clientOf(x,y)', [L['x'], L['y']])
    await move_to(pg, c, ptype)
    if ptype == 'mouse': await pg.mouse.up()
    else: await pev(pg, 'pointerup', c[0], c[1], ptype)
async def pour(pg, mat, cx, cy):
    i = await pg.evaluate('m => __game.G.hand.indexOf(m)', mat)
    if i < 0: return False
    f = await pg.evaluate('i => __game.slotClient(i)', i); t = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [cx, cy])
    await hold(pg, f, [t[0], t[1] + 22]); await pg.mouse.up(); return True
def inside(c, r): return c['x'] >= 0 and c['y'] >= 0 and c['x'] + c['w'] <= r['LW'] and c['y'] + c['h'] <= r['Hl']
def hit(a, b): return a['x'] < b['x'] + b['w'] and a['x'] + a['w'] > b['x'] and a['y'] < b['y'] + b['h'] and a['y'] + a['h'] > b['y']
async def set_hand(pg, idx, mat):
    await pg.evaluate('([i,m]) => { __game.G.hand[i] = m; __game.G.tut = 9; }', [idx, mat])
async def sweep(pg, name, ptype, mats, cols, rows):
    """hold each material at a grid of positions over the beaker and verify the card geometry every time"""
    M = await pg.evaluate('__game.M'); n = 0; bad = []
    for mat in mats:
        await set_hand(pg, 0, M[mat])
        s0 = await pg.evaluate('__game.slotClient(0)')
        for fy in rows:
            for fx in cols:
                t = await pg.evaluate('([fx,fy]) => __game.clientOf(__game.L.bx + __game.L.bw * fx, __game.L.by + __game.L.bh * fy)', [fx, fy])
                # finger position: for touch the tip is 66px above the finger, for mouse 22px
                off = 66 if ptype != 'mouse' else 22
                await hold(pg, s0, [t[0], t[1] + off], ptype, steps=4); await pg.wait_for_timeout(60)
                pv = await pg.evaluate('__game.preview')
                if pv['card']:
                    n += 1
                    ok = inside(pv['card'], pv) and not any(hit(pv['card'], a) for a in pv['avoid'])
                    if not ok: bad.append({'mat': mat, 'at': [fx, fy], 'card': pv['card'], 'avoid': pv['avoid']})
                await release_away(pg, ptype); await pg.wait_for_timeout(30)
    check(n > 0 and not bad, f'{name}: preview card inside the canvas and clear of finger/vial in {n} spots ({len(bad)} bad)')
    if bad: print(json.dumps(bad[:3]))
    return n, bad
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---------- A. 390x844 mouse: water, then lava hovering over it ----------
        ctx, pg, errs = await boot(b, 390, 844)
        await pg.wait_for_timeout(1500)
        M = await pg.evaluate('__game.M')
        res['fresh_codex'] = await pg.evaluate('__game.codex')
        check(res['fresh_codex']['rx'] == [], 'fresh save: no reactions discovered')
        await pg.evaluate('__game.G.tut = 9')
        await pour(pg, M['WATER'], 50, 40); await pg.wait_for_timeout(2200)
        i = await pg.evaluate('m => __game.G.hand.indexOf(m)', M['LAVA'])
        if i < 0: await set_hand(pg, 0, M['LAVA']); i = 0
        f = await pg.evaluate('i => __game.slotClient(i)', i); t = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [50, 40])
        await hold(pg, f, [t[0], t[1] + 22]); await pg.wait_for_timeout(120)
        pv = await pg.evaluate('__game.preview'); res['unknown_preview'] = pv
        await pg.screenshot(path=OUT + 'a_390_lava_on_water_unknown.png')
        await release_away(pg)
        await pg.evaluate("__game.discoverRx('solidify'); __game.noteMat(%d)" % M['LAVA'])
        await hold(pg, f, [t[0], t[1] + 22]); await pg.wait_for_timeout(120)
        pv = await pg.evaluate('__game.preview'); res['known_preview'] = pv
        check(pv['card'] is not None and pv['est'] is not None and pv['est']['hi'] > pv['est']['lo'], 'lava on water: card with a range and goal-bar estimate')
        await pg.screenshot(path=OUT + 'b_390_lava_on_water_known.png')
        await release_away(pg)
        # sand on the water: sinks
        await set_hand(pg, 1, M['SAND'])
        f = await pg.evaluate('i => __game.slotClient(i)', 1)
        await hold(pg, f, [t[0], t[1] + 22]); await pg.wait_for_timeout(120)
        await pg.screenshot(path=OUT + 'c_390_sand_on_water_sinks.png')
        await release_away(pg)
        # hand tip card (mouse hover 300 ms)
        s0 = await pg.evaluate('__game.slotClient(2)'); await pg.mouse.move(*s0); await pg.wait_for_timeout(450)
        res['tip'] = await pg.evaluate('__game.ui.tip'); check(res['tip'] == 'v2', 'hovering a vial 300 ms opens its tip card')
        await pg.screenshot(path=OUT + 'd_390_vial_tip.png')
        await pg.mouse.move(5, 5)
        # geometry sweeps
        await sweep(pg, '390x844 mouse', 'mouse', ['LAVA', 'SAND', 'WATER'], [0.1, 0.5, 0.9], [0.02, 0.2, 0.5, 0.85])
        await sweep(pg, '390x844 touch', 'touch', ['LAVA', 'WATER'], [0.08, 0.5, 0.92], [0.02, 0.2, 0.5, 0.85])
        res['err_a'] = errs[:]
        await ctx.close()
        # ---------- B. fresh powder near fire: '?' ----------
        ctx, pg, errs = await boot(b, 390, 844); await pg.wait_for_timeout(1200)
        M = await pg.evaluate('__game.M')
        await pg.evaluate('''() => { const S = __game.R.S, W = S.W, M = __game.M; __game.G.tut = 9; __game.G.hand[0] = M.POWDER;
            for (let y = 70; y < 80; y++) for (let x = 45; x < 55; x++) S.t[y * W + x] = M.FIRE; }''')
        f = await pg.evaluate('i => __game.slotClient(i)', 0); t = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [50, 40])
        await hold(pg, f, [t[0], t[1] + 22]); await pg.wait_for_timeout(120)
        await pg.screenshot(path=OUT + 'e_390_powder_near_fire_unknown.png')
        res['powder_preview'] = await pg.evaluate('__game.preview')
        await release_away(pg)
        await ctx.close()
        # ---------- C. 1366x768 desktop ----------
        ctx, pg, errs = await boot(b, 1366, 768); await pg.wait_for_timeout(1200)
        M = await pg.evaluate('__game.M')
        await pg.evaluate("__game.G.tut = 9; __game.discoverRx('solidify')")
        await pour(pg, M['WATER'], 50, 40); await pg.wait_for_timeout(2200)
        await set_hand(pg, 0, M['LAVA'])
        f = await pg.evaluate('i => __game.slotClient(i)', 0); t = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [50, 40])
        await hold(pg, f, [t[0], t[1] + 22]); await pg.wait_for_timeout(120)
        await pg.screenshot(path=OUT + 'f_1366_lava_on_water.png')
        await release_away(pg)
        await sweep(pg, '1366x768 mouse', 'mouse', ['LAVA', 'SAND', 'WATER'], [0.1, 0.5, 0.9], [0.02, 0.2, 0.5, 0.85])
        res['err_c'] = errs[:]
        await ctx.close()
        # ---------- D. codex: fresh 0/16, tutorial round 1, reload ----------
        ctx, pg, errs = await boot(b, 390, 844); await pg.wait_for_timeout(1200)
        bk = await pg.evaluate('__game.clientOf(86, 16)'); await pg.mouse.click(*bk); await pg.wait_for_timeout(250)
        check(await pg.evaluate('__game.codex.open'), 'book button opens the codex')
        await pg.screenshot(path=OUT + 'g_codex_fresh_0of16.png')
        cl = await pg.evaluate('__game.clientOf(364, 30)'); await pg.mouse.click(*cl); await pg.wait_for_timeout(200)
        check(not await pg.evaluate('__game.codex.open'), 'close button closes it')
        M = await pg.evaluate('__game.M')
        await pour(pg, M['WATER'], 50, 40); await pg.wait_for_timeout(900)
        await pour(pg, M['LAVA'], 50, 40); await pg.wait_for_timeout(900)
        await pour(pg, M['OIL'], 40, 40); await pg.wait_for_timeout(1500)
        fuel = await pg.evaluate('({x:__game.G.fuelX,y:__game.G.fuelY})')
        ft = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [fuel['x'] or 50, fuel['y'] or 90])
        mb = await pg.evaluate("__game.btnClient('match')")
        await hold(pg, mb, [ft[0], ft[1] + 22]); await pg.mouse.up()
        for k in range(160):
            await pg.wait_for_timeout(250)
            if await pg.evaluate("__game.R.status() !== 'play' || __game.mode !== 'play'"): break
        await pg.wait_for_timeout(2500)
        c = await pg.evaluate('__game.codex'); res['codex_after_r1'] = c
        check('solidify' in c['rx'] and 'burn' in c['rx'], 'after tutorial round 1 the codex has solidify and burn: ' + ','.join(c['rx']))
        check(c['dot'], 'red dot on the book until the codex is opened')
        await pg.screenshot(path=OUT + 'h_390_book_dot_after_round1.png')
        await pg.mouse.click(*bk); await pg.wait_for_timeout(250)
        await pg.screenshot(path=OUT + 'i_codex_after_round1.png')
        check(not (await pg.evaluate('__game.codex.dot')), 'opening the codex clears the red dot')
        await pg.evaluate('__game.setCodexTab(1)'); await pg.wait_for_timeout(100); await pg.screenshot(path=OUT + 'j_codex_materials.png')
        await pg.evaluate('__game.setCodexTab(2)'); await pg.wait_for_timeout(100); await pg.screenshot(path=OUT + 'k_codex_charms.png')
        stored = await pg.evaluate('localStorage.getItem("pd.codex")'); res['stored'] = stored
        await pg.reload(); await pg.wait_for_function('window.__game && window.__game.G'); await pg.wait_for_timeout(500)
        c2 = await pg.evaluate('__game.codex'); check(set(c2['rx']) == set(c['rx']), 'discoveries survive a reload (%d reactions)' % len(c2['rx']))
        res['err_d'] = errs[:]
        await ctx.close()
        # ---------- E. storage that throws everywhere: the game still works ----------
        dead = "Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } });"
        ctx, pg, errs = await boot(b, 390, 844, init=dead); await pg.wait_for_timeout(1200)
        M = await pg.evaluate('__game.M')
        await pour(pg, M['WATER'], 50, 40); await pg.wait_for_timeout(900); await pour(pg, M['LAVA'], 50, 40); await pg.wait_for_timeout(2500)
        bk = await pg.evaluate('__game.clientOf(86, 16)'); await pg.mouse.click(*bk); await pg.wait_for_timeout(250)
        c = await pg.evaluate('__game.codex'); check(c['open'] and 'solidify' in c['rx'], 'storage blocked: codex still opens and records in memory (%s)' % ','.join(c['rx']))
        check(not errs, 'storage blocked: no console errors ' + str(errs[:2]))
        await pg.screenshot(path=OUT + 'l_codex_storage_blocked.png')
        await ctx.close()
        await b.close()
    json.dump(res, open(OUT + 'results.json', 'w'), ensure_ascii=False, indent=1)
    print('FAILS:', res['fail'])
asyncio.run(main())
