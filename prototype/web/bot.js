const {createSim,M,RX}=require('./sim.js');
const {mulberry32}=require('./sim.js');
function playRound(seed,deck,smart){
  const r=mulberry32(seed*7+3); const S=createSim(seed,{});
  const d=[...deck].sort(()=>r()-0.5); const hand=d.splice(0,4); let total=0;
  for(let k=0;k<4;k++){
    let pick;
    if(smart){ // simple heuristic: setups first, ember last
      const order=[M.OIL,M.SEED,M.POWDER,M.ICE,M.LAVA,M.SAND,M.WATER,M.ACID,M.EMBER];
      hand.sort((a,b)=>order.indexOf(a)-order.indexOf(b)); pick=hand.shift();
    } else pick=hand.splice((r()*hand.length)|0,1)[0];
    if(d.length) hand.push(d.shift());
    const x=15+((r()*50)|0);
    S.resetCounts(); let left=420,f=0;
    while(true){ if(left>0) left-=S.pour(pick,x,8); S.step();S.step();f++;
      if(left<=0&&f>40&&S.frame-(S.lastEventFrame||0)>150)break; if(f>420)break;}
    let chips=0; for(const q in S.counts) chips+=S.counts[q]*RX[q].pts;
    total+=chips*Math.max(1,Object.keys(S.counts).length);
  }
  return total;
}
const deck=[M.SAND,M.SAND,M.WATER,M.WATER,M.OIL,M.EMBER,M.EMBER,M.LAVA];
for(const smart of [false,true]){
  const res=[]; for(let s=1;s<=40;s++) res.push(playRound(s,deck,smart));
  res.sort((a,b)=>a-b);
  const pct=q=>res[Math.floor(q*(res.length-1))];
  console.log(smart?'heuristic':'random   ','p10',pct(.1),'p25',pct(.25),'median',pct(.5),'p75',pct(.75),'p90',pct(.9));
}
