# Build index.html = template.html + sim.js + src/strings.js + src/glyphs.js + src/core_render.js + src/game.js (all inlined)
import os
d = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(d, p), encoding='utf-8').read()
game = rd('src/game.js').replace('/*STRINGS*/', rd('src/strings.js')).replace('/*GLYPHS*/', rd('src/glyphs.js')).replace('/*CORE*/', rd('src/core_render.js'))
html = rd('template.html').replace('/*SIM*/', rd('sim.js')).replace('/*GAMEJS*/', game)
open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(html)
print('built index.html', len(html))
