# Build index.html = template.html with sim.js inlined at /*SIM*/
import os
d = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(d, 'template.html'), encoding='utf-8').read()
s = open(os.path.join(d, 'sim.js'), encoding='utf-8').read()
open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(t.replace('/*SIM*/', s))
print('built index.html')
