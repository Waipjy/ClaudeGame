# B1 verification: python3 playtest_v04_b1.py  (needs playwright + chromium). Screenshots go to docs/design/playtests/v04_b1/
import asyncio, json, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'docs', 'design', 'playtests', 'v04_b1') + '/'
URL = 'file://' + os.path.join(HERE, 'index.html') + '?seed=77'
os.makedirs(OUT, exist_ok=True)
res = {}
async def boot(b, w, h, touch=False, locale='zh-TW', url=URL):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, locale=locale, has_touch=touch, is_mobile=touch)
    pg = await ctx.new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') and 'fonts.g' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    await pg.goto(url, wait_until='commit')
    await pg.wait_for_function('window.__game && window.__game.G')
    return ctx, pg, errs
async def drag(pg, f, t, steps=12, release=True):
    await pg.mouse.move(*f); await pg.mouse.down()
    for i in range(1, steps + 1):
        await pg.mouse.move(f[0] + (t[0] - f[0]) * i / steps, f[1] + (t[1] - f[1]) * i / steps); await pg.wait_for_timeout(16)
    if release: await pg.mouse.up()
async def pour(pg, mat, cx, cy):
    i = await pg.evaluate('m => __game.G.hand.indexOf(m)', mat)
    if i < 0: return False
    f = await pg.evaluate('i => __game.slotClient(i)', i); t = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [cx, cy])
    await drag(pg, f, [t[0], t[1] + 22]); return True
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---- A. start screens, 390x844 ----
        ctx, pg, errs = await boot(b, 390, 844)
        await pg.wait_for_timeout(80); await pg.screenshot(path=OUT + 'a1_start_0s.png')
        await pg.evaluate('__game.showCard()'); await pg.wait_for_timeout(450); await pg.screenshot(path=OUT + 'a2_roundcard_2s.png')
        res['card_visible_at_0.45s'] = await pg.evaluate('__game.ui.card')
        res['goalRect'] = await pg.evaluate('__game.ui.goalRect')
        res['goalNum'] = await pg.evaluate('__game.ui.goalNum')
        await pg.wait_for_timeout(900)
        res['card_gone_after_1.6s'] = not await pg.evaluate('__game.ui.card')
        M = await pg.evaluate('__game.M')
        await pg.evaluate('''() => { window.__peak = 0; setInterval(() => { const S = __game.R.S, W = S.W, H = S.H, M = __game.M, gas = [M.FIRE, M.STEAM, M.SMOKE, M.FUME, 0]; let top = H; for (let y = 0; y < H; y++) { let n = 0; for (let x = 1; x < W - 1; x++) if (!gas.includes(S.t[y * W + x])) n++; if (n >= 20) { top = y; break; } } window.__peak = Math.max(window.__peak, Math.round((H - top) / H * 100)); }, 100); }''')
        # tutorial: water, lava, oil then match
        await pour(pg, M['WATER'], 50, 40); await pg.wait_for_timeout(900)
        await pour(pg, M['LAVA'], 50, 40); await pg.wait_for_timeout(900)
        await pour(pg, M['OIL'], 40, 40); await pg.wait_for_timeout(1500)
        await pour(pg, M['SAND'], 60, 40); await pg.wait_for_timeout(1500)
        res['tut_after_pours'] = await pg.evaluate('__game.G.tut')
        await pg.screenshot(path=OUT + 'a3_after_three_pours.png')

        fuel = await pg.evaluate('({x:__game.G.fuelX,y:__game.G.fuelY})')
        ft = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [fuel['x'] or 50, fuel['y'] or 90])
        mb = await pg.evaluate("__game.btnClient('match')")
        await drag(pg, mb, [ft[0], ft[1] + 22])
        for k in range(14):
            await pg.wait_for_timeout(250)
            if k == 5: await pg.screenshot(path=OUT + 'a4_scoring_gold_to_bar.png')
        await pg.wait_for_timeout(4000)
        res['gold_after_match'] = await pg.evaluate('__game.R.gold')
        res['displayGold'] = await pg.evaluate('__game.G.displayGold')
        await pg.screenshot(path=OUT + 'a5_after_first_burn.png')
        # fill height: highest non-empty cell vs beaker height
        res['fill_pct'] = await pg.evaluate('''() => { const S = __game.R.S, W = S.W, H = S.H, M = __game.M, gas = [M.FIRE, M.STEAM, M.SMOKE, M.FUME, 0]; let top = H; for (let y = 0; y < H; y++) { let n = 0; for (let x = 1; x < W - 1; x++) if (!gas.includes(S.t[y * W + x])) n++; if (n >= 20) { top = y; break; } } return Math.round((H - top) / H * 100); }''')
        res['peak_fill_pct'] = await pg.evaluate('window.__peak')
        res['viol_play'] = await pg.evaluate('window.__textViolations.length')
        # hover tips (mouse)
        for key, name in (('match', 'point'), ('lid', 'lid'), ('seal', 'end')):
            c = await pg.evaluate(f"__game.btnClient('{key}')")
            await pg.mouse.move(c[0], c[1]); await pg.wait_for_timeout(450)
            res['tip_' + key] = await pg.evaluate('__game.ui.tip')
            if key in ('match', 'lid'): await pg.screenshot(path=OUT + f'c_hover_{name}.png')
        await pg.mouse.move(5, 300)
        # multiplier hover
        L = await pg.evaluate('({x:__game.L.rx0*__game.L.sc, y:__game.L.elY(0)*__game.L.sc})')
        await pg.mouse.move(L['x'] + 20, L['y']); await pg.wait_for_timeout(450); res['tip_el0'] = await pg.evaluate('__game.ui.tip')
        await pg.screenshot(path=OUT + 'c_hover_mult.png'); await pg.mouse.move(5, 300)
        # ---- settings: anim 2x + English, reload persists ----
        await pg.mouse.click(30, 20); await pg.wait_for_timeout(200)
        res['settings_open'] = await pg.evaluate('__game.ui.settingsOpen')
        await pg.screenshot(path=OUT + 'd1_settings.png')
        # anim row y=130+74 ; seg x0 = 390-24-62*3
        await pg.mouse.click(390 - 24 - 62 * 3 + 62 * 2.5, 130 + 74); await pg.wait_for_timeout(100)
        await pg.mouse.click(390 - 24 - 88 * 0.5, 130 + 74 * 2); await pg.wait_for_timeout(150)  # English
        res['set_after_click'] = await pg.evaluate('__game.ui.set')
        await pg.screenshot(path=OUT + 'd2_settings_english.png')
        await pg.mouse.click(390 - 32, 26); await pg.wait_for_timeout(150)
        await pg.reload(wait_until='commit'); await pg.wait_for_function('window.__game && window.__game.G'); await pg.wait_for_timeout(300)
        res['set_after_reload'] = await pg.evaluate('__game.ui.set')
        await pg.wait_for_timeout(500); await pg.screenshot(path=OUT + 'd3_english_ingame.png')
        # round-card in english
        # ---- lose screen ----
        await pg.evaluate("__game.G.tut = 9")
        sb = await pg.evaluate("__game.btnClient('seal')"); await pg.mouse.click(*sb)
        for k in range(40):
            await pg.wait_for_timeout(300)
            if (await pg.evaluate('__game.mode')) != 'play': break
        await pg.wait_for_timeout(1500); res['mode_end'] = await pg.evaluate('__game.mode')
        await pg.screenshot(path=OUT + 'e_lose.png')
        res['viol_lose'] = await pg.evaluate('window.__textViolations.length')
        res['errs_a'] = errs
        await ctx.close()
        # ---- B. shop (force a win by scripting gold) ----
        ctx, pg, errs = await boot(b, 390, 844)
        await pg.evaluate("localStorage.clear()")
        await pg.evaluate("__game.G.tut = 9; __game.R.gold = 99999; __game.G.displayGold = 99999;")
        await pg.evaluate("__game.G.money = 12")
        sb = await pg.evaluate("__game.btnClient('seal')"); await pg.mouse.click(*sb)
        for k in range(60):
            await pg.wait_for_timeout(300)
            if (await pg.evaluate('__game.mode')) == 'shop': break
        await pg.wait_for_timeout(1800); res['mode_shop'] = await pg.evaluate('__game.mode')
        await pg.screenshot(path=OUT + 'f_shop.png')
        S = await pg.evaluate('__game.shopPos()')
        it = S['items'][2]; await pg.mouse.move(it['x'], it['y']); await pg.wait_for_timeout(450)
        res['tip_shop'] = await pg.evaluate('__game.ui.tip'); await pg.screenshot(path=OUT + 'f_shop_tip.png')
        res['viol_shop'] = await pg.evaluate('window.__textViolations.length')
        # buy the first vial by a plain click, then leave the shop
        await pg.mouse.move(5, 300)
        m0 = await pg.evaluate('__game.G.money'); d0 = await pg.evaluate('__game.G.deck.length')
        p0 = S['items'][0]; await pg.mouse.click(p0['x'], p0['y']); await pg.wait_for_timeout(300)
        res['buy'] = {'money': [m0, await pg.evaluate('__game.G.money')], 'deck': [d0, await pg.evaluate('__game.G.deck.length')]}
        ex = S['exit']; await pg.mouse.click(ex['x'], ex['y'] - 8); await pg.wait_for_timeout(400)
        res['after_exit'] = await pg.evaluate('({mode: __game.mode, round: __game.G.round, card: __game.ui.card})')
        await pg.wait_for_timeout(500); await pg.screenshot(path=OUT + 'h_round2_card.png')
        res['errs_b'] = errs
        await ctx.close()
        # ---- C. touch long-press tip + 360x640 ----
        ctx, pg, errs = await boot(b, 360, 640, touch=True)
        await pg.wait_for_timeout(2300)
        await pg.screenshot(path=OUT + 'g_360x640.png')
        cdp = await ctx.new_cdp_session(pg)
        c = await pg.evaluate("__game.btnClient('match')")
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': c[0], 'y': c[1], 'id': 1}]})
        await pg.wait_for_timeout(600)
        res['tip_touch_match'] = await pg.evaluate('__game.ui.tip')
        await pg.screenshot(path=OUT + 'c_longpress_match.png')
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        await pg.wait_for_timeout(200)
        res['match_mode_after_longpress'] = await pg.evaluate('__game.G.matchMode')
        res['errs_c'] = errs
        await ctx.close()
        # ---- D. tutorial demo-hand labels: beat 1 (pour) then beat 3 (ignite) ----
        ctx, pg, errs = await boot(b, 390, 844)
        await pg.wait_for_timeout(4300)
        for k in range(4):
            await pg.screenshot(path=OUT + f'a3_tutorial_hand_pour_{k}.png'); await pg.wait_for_timeout(350)
        await pg.evaluate('__game.G.tut = 3; __game.G.idleSince = performance.now()'); await pg.evaluate("__game.G.hand.splice(0,1,__game.M.OIL)")
        await pg.wait_for_timeout(4300)
        for k in range(4):
            await pg.screenshot(path=OUT + f'a3_tutorial_hand_ignite_{k}.png'); await pg.wait_for_timeout(350)
        await pg.evaluate('__game.G.tut = 0')
        await ctx.close()
        await b.close()
    print(json.dumps(res, ensure_ascii=False, indent=1))
asyncio.run(main())
