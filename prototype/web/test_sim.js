const {createSim,M,RX}=require('./sim.js');
function run(seq,seed=1,mods={}){
  const S=createSim(seed,mods); const out=[];
  for(const [m,x] of seq){
    S.resetCounts(); let left=420, f=0, quiet=0;
    while(true){
      if(left>0){ left-=S.pour(m,x,8); }
      S.step(); S.step(); f++;
      if(left<=0 && f>40 && S.frame-(S.lastEventFrame||0)>150) break;
      if(f>420) break;
    }
    let chips=0; for(const k in S.counts) chips+=S.counts[k]*RX[k].pts;
    const types=Object.keys(S.counts).length;
    out.push({m:Object.keys(M).find(k=>M[k]===m),chips,mult:Math.max(1,types),score:chips*Math.max(1,types),counts:S.counts,frames:f});
  }
  return out;
}
module.exports={run};
if(require.main===module){
const t0=Date.now();
const tests={
 'lava then water':[[M.LAVA,40],[M.WATER,40]],
 'oil then fire':[[M.OIL,40],[M.EMBER,40]],
 'powder then fire':[[M.POWDER,40],[M.EMBER,40]],
 'sand,lava,water,fire':[[M.SAND,40],[M.LAVA,40],[M.WATER,40],[M.EMBER,40]],
 'oil,water,fire':[[M.OIL,40],[M.WATER,40],[M.EMBER,40]],
 'seed,water,fire':[[M.SEED,40],[M.WATER,40],[M.EMBER,40]],
 'ice,lava':[[M.ICE,40],[M.LAVA,40]],
 'sand,acid':[[M.SAND,40],[M.ACID,40]],
 'starter typical':[[M.SAND,25],[M.WATER,55],[M.OIL,40],[M.EMBER,40]],
};
for(const [k,seq] of Object.entries(tests)){
  const r=run(seq);
  console.log(k.padEnd(22), r.map(o=>`${o.m}:${o.chips}x${o.mult}=${o.score} [${Object.entries(o.counts).map(([a,b])=>a+':'+b).join(' ')}] f${o.frames}`).join(' | '));
}
console.log('ms',Date.now()-t0);
}
