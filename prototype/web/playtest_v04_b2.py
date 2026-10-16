# B2 verification: python3 playtest_v04_b2.py  (needs playwright + chromium). Screenshots go to docs/design/playtests/v04_b2/
# Plays the round-1 tutorial (water, lava, oil, match) and captures the scoring animation stages + layout gaps.
import asyncio, json, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'docs', 'design', 'playtests', 'v04_b2') + '/'
URL = 'file://' + os.path.join(HERE, 'index.html') + '?seed=' + os.environ.get('SEED', '77')
ONLY_FULL = bool(os.environ.get('ONLY_FULL'))
os.makedirs(OUT, exist_ok=True)
res = {}
async def boot(b, w, h):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, locale='zh-TW')
    pg = await ctx.new_page(); errs = []
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') and 'fonts.g' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    await pg.add_init_script('''(() => { const real = performance.now.bind(performance); let paused = false, frozen = 0, off = 0;
      performance.now = () => paused ? frozen : real() - off;
      window.__pause = () => { if (!paused) { frozen = real() - off; paused = true; } };
      window.__resume = () => { if (paused) { off = real() - frozen; paused = false; } }; })()''')
    await pg.goto(URL, wait_until='commit')
    await pg.wait_for_function('window.__game && window.__game.G')
    return ctx, pg, errs
async def drag(pg, f, t, steps=12):
    await pg.mouse.move(*f); await pg.mouse.down()
    for i in range(1, steps + 1):
        await pg.mouse.move(f[0] + (t[0] - f[0]) * i / steps, f[1] + (t[1] - f[1]) * i / steps); await pg.wait_for_timeout(16)
    await pg.mouse.up()
async def pour(pg, mat, cx, cy):
    i = await pg.evaluate('m => __game.G.hand.indexOf(m)', mat)
    if i < 0: return False
    f = await pg.evaluate('i => __game.slotClient(i)', i); t = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [cx, cy])
    await drag(pg, f, [t[0], t[1] + 22]); return True
TALLY = '''() => { const T = __game.fx.tally; if (!T) return null; const trig = T.chips.filter(c => c.kind === "trig").length;
  return { landed: T.landed, chips: T.chips.length, trig, multShown: !!T.multShown, multVal: T.multVal, elem: T.res.elem, chain: T.res.chain, chainMerged: !!T.chainMerged, goldShown: !!T.goldShown, spawned: !!T.spawned, gold: T.res.gold, base: T.base,
           rows: T.res.rows.map(r => r.type + ":" + r.trig + "/" + r.vol) }; }'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx, pg, errs = await boot(b, 390, 844)
        await pg.wait_for_timeout(2300)
        M = await pg.evaluate('__game.M')
        # layout gaps: beaker top vs goal bar bottom, beaker bottom vs hand top (logical px)
        res['layout'] = await pg.evaluate('''() => { const L = __game.L; return { goalBottom: L.goal.y + L.goal.h, beakerTop: L.by, beakerBottom: L.by + L.bh, handTop: L.handY, pipY: L.pipY, cp: L.cp, cpy: L.cpy }; }''')
        lo = res['layout']; res['gap_top'] = round(lo['beakerTop'] - lo['goalBottom'], 1); res['gap_bottom'] = round(lo['handTop'] - lo['beakerBottom'], 1)
        await pg.screenshot(path=OUT + 'a_layout_start.png')
        await pour(pg, M['WATER'], 50, 40); await pg.wait_for_timeout(900)
        await pour(pg, M['LAVA'], 50, 40); await pg.wait_for_timeout(900)
        await pour(pg, M['OIL'], 40, 40); await pg.wait_for_timeout(1500)
        res['tut'] = await pg.evaluate('__game.G.tut')
        await pg.screenshot(path=OUT + 'b_after_pours.png')
        fuel = await pg.evaluate('({x:__game.G.fuelX,y:__game.G.fuelY})')
        ft = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', [fuel['x'] or 50, fuel['y'] or 90])
        await pg.evaluate('__game.ui.set.anim = 0.35')  # slow the scoring animation 3x so every stage can be captured
        mb = await pg.evaluate("__game.btnClient('match')")
        await drag(pg, mb, [ft[0], ft[1] + 22])
        # a tutorial follower's natural continuation: 4th pour = sulfur, then the 2nd match on it
        await pg.wait_for_timeout(5000)
        await pour(pg, M['SULFUR'], 60, 40); await pg.wait_for_timeout(2500)
        sc = await pg.evaluate("""() => { const S = __game.R.S, W = S.W, H = S.H, M = __game.M; const c = [];
            for (let y = 15; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { const p = y * W + x; if (S.t[p] === M.SULFUR && S.life[p] === 0 && S.t[p - W] === M.E) c.push([x, y]); }
            return c.length ? c[c.length >> 1] : null; }""")
        if sc:
            t = await pg.evaluate('([x,y]) => __game.cellClient(x,y)', sc); mb = await pg.evaluate("__game.btnClient('match')")
            await drag(pg, mb, [t[0], t[1] + 22])
        for k in range(120):
            await pg.wait_for_timeout(250)
            if await pg.evaluate("__game.R.status() !== 'play' || __game.mode !== 'play'"): break
        res['tutorial_full_gold'] = await pg.evaluate('__game.R.gold'); res['tutorial_full_status'] = await pg.evaluate('__game.R.status()')
        if ONLY_FULL:
            print(json.dumps({'seed': URL[-3:], 'full': res['tutorial_full_gold'], 'status': res['tutorial_full_status']})); await b.close(); return
        # let the real tallies drain, then replay a synthetic ledger (trigger + volume + chain) once for the 6-stage capture
        await pg.wait_for_timeout(3000)
        for k in range(300):
            if not await pg.evaluate('!!__game.fx.tally || __game.fx.tallyQ.length > 0'): break
            await pg.wait_for_timeout(100)
        res['gold_real'] = await pg.evaluate('__game.R.gold')
        await pg.evaluate("""() => { const r = PDSim.scoreLedger({ counts: { quench: 120, acidrain: 90, solidify: 60, burn: 200 }, evs: {}, resN: {}, maxGen: 3 }, {});
            __game.fx.tallyQ.push({ Lg: { uid: -1 }, res: r, cx: 50, cy: 70 }); }""")
        got = {}
        for k in range(1500):
            await pg.wait_for_timeout(15)
            T = await pg.evaluate(TALLY)
            if not T: continue
            s = None
            if T['spawned']: s = '6_gold_to_bar'
            elif T['goldShown']: s = '5_gold_total'
            elif T['chainMerged']: s = '4b_chain_merged'
            elif T['multShown']: s = '4_mult_chain_pop'
            elif T['landed'] >= T['chips']: s = '3_volume_landed'
            elif T['landed'] >= T['trig']: s = '2_trigger_landed'
            elif T['landed'] == 0: s = '1_chips_fly'
            if s and s not in got:
                got[s] = T; await pg.evaluate('__pause()'); await pg.screenshot(path=OUT + 'c_score_' + s + '.png'); await pg.evaluate('__resume()')
            if '6_gold_to_bar' in got: break
        res['stages'] = {k: got[k] for k in sorted(got)}
        await pg.wait_for_timeout(2500)
        res['gold'] = await pg.evaluate('__game.R.gold'); res['target'] = await pg.evaluate('__game.R.target')
        await pg.screenshot(path=OUT + 'd_after_score.png')
        res['viol'] = await pg.evaluate('window.__textViolations.length'); res['errs'] = errs
        await ctx.close()
        # wide window layout check (desktop 1366x768) for gaps
        ctx, pg, errs = await boot(b, 1366, 768); await pg.wait_for_timeout(2300)
        lo = await pg.evaluate('''() => { const L = __game.L; return { top: L.by - (L.goal.y + L.goal.h), bottom: L.handY - (L.by + L.bh) }; }''')
        res['desktop_gaps'] = lo; await pg.screenshot(path=OUT + 'e_desktop.png'); await ctx.close()
        ctx, pg, errs = await boot(b, 360, 640); await pg.wait_for_timeout(2300)
        lo = await pg.evaluate('''() => { const L = __game.L; return { top: L.by - (L.goal.y + L.goal.h), bottom: L.handY - (L.by + L.bh) }; }''')
        res['small_gaps'] = lo; await pg.screenshot(path=OUT + 'e_360x640.png'); await ctx.close()
        await b.close()
    print(json.dumps(res, ensure_ascii=False, indent=1))
asyncio.run(main())
