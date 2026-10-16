// B1: string table lint. Run: node test_strings.js
const STR = require('./src/strings.js');
let fail = 0;
const bad = (m) => { console.log('FAIL ' + m); fail++; };
const cjk = s => (s.match(/[㐀-鿿豈-﫿]/g) || []).length;
const strip = s => s.replace(/\{\d\}/g, '');
const kz = Object.keys(STR.zh).sort(), ke = Object.keys(STR.en).sort();
if (kz.join() !== ke.join()) { bad('zh/en key sets differ: ' + kz.filter(k => !(k in STR.en)).concat(ke.filter(k => !(k in STR.zh))).join(',')); }
for (const [lang, tbl] of Object.entries(STR)) for (const [k, v0] of Object.entries(tbl)) {
  const v = strip(v0);
  if (/[。！？；：.!?;:]/.test(v)) bad(`${lang}.${k} has forbidden punctuation: ${v0}`);
  if (lang === 'zh' && k !== 'lang.en' && cjk(v) > 6) bad(`zh.${k} too long (${cjk(v)}): ${v0}`);
  if (lang === 'zh' && k !== 'lang.en' && v.replace(/[㐀-鿿]/g, '').replace(/[\d\s×+−=/%≈–→]/g, '').length) bad(`zh.${k} has stray chars: ${v0}`);
  if (lang === 'en' && v.length > 14) bad(`en.${k} too long (${v.length}): ${v0}`);
  if (/\n/.test(v)) bad(`${lang}.${k} multi-line`);
}
// game.js must not contain CJK literals (strings.js is the only place)
const fs = require('fs');
const game = fs.readFileSync(__dirname + '/src/game.js', 'utf8').split('\n');
game.forEach((l, i) => { if (/[㐀-鿿]/.test(l.replace(/\/\/.*$/, ''))) bad(`game.js:${i + 1} has CJK literal`); });
console.log(fail ? 'FAILURES ' + fail : 'OK ' + kz.length + ' keys');
process.exit(fail ? 1 : 0);
