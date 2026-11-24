import fs from 'node:fs';
import path from 'node:path';
const seeds=[471001,471002,471003];
const load=(mode,variant,seed)=>JSON.parse(fs.readFileSync(path.join('test-artifacts',mode==='marien'?'front-operation-bot-stress':'front-operation-bomb-full',variant+'-'+seed,'report.json'),'utf8'));
const summary={status:'PASS',baseline:'V53',candidate:'V62 / V63 test harness',seeds,limitation:'Accelerated Chromium simulation with passive human slot; same initial seeds, divergent later random streams. Not rendered FPS or human playtest.',modes:{}};
const sum=(rows,key)=>rows.reduce((n,r)=>n+(r[key]||0),0);
const ratio=(n,d)=>d?Math.round(n/d*10000)/10000:null;
for(const mode of ['marien','bomb']){
 const rows=[];
 for(const seed of seeds){
  const pair={seed};
  for(const variant of ['baseline','candidate']){
   const r=load(mode,variant,seed);
   if(r.status!=='PASS'||r.seed!==seed||r.variant!==variant||r.pageErrors?.length)throw Error('Failed '+mode+' '+variant+' '+seed);
   pair[variant]=mode==='marien'?{
     seconds:r.simulatedSec,shots:r.botShots,hits:r.botHits,stuck:r.totalStuckRecoveries,
     blueSpread:r.blueSpread,redSpread:r.redSpread,closePairs:(r.behavior.meanClosePairs.blue+r.behavior.meanClosePairs.red)/2,
     targetSwitches:r.behavior.targetSwitches,acquisitions:r.behavior.targetAcquisitions,
     movingSeconds:r.behavior.movingSeconds,engagedSeconds:r.behavior.engagedSeconds,
     coverSelections:r.coverLifecycle.selections,coverArrivals:r.coverLifecycle.arrivals,coverAbandons:r.coverLifecycle.abandons,
     coverOrphanSeconds:r.coverLifecycle.orphanSeconds,coverStalled:r.coverLifecycle.stalledApproaches,
     normal:r.byDifficulty.normal,hard:r.byDifficulty.hard,expert:r.byDifficulty.expert
   }:{
     seconds:r.elapsed,actorSeconds:r.actorSeconds,shots:r.shots,hits:r.hits,stuck:r.stuck,
     planted:r.plantedAt!==null?1:0,reason:r.reason,site:r.site,plantedAt:r.plantedAt,
     blueSpread:r.spread.blue.meanRadius,redSpread:r.spread.red.meanRadius,
     closePairs:(r.spread.blue.meanClosePairs+r.spread.red.meanClosePairs)/2
   };
  }
  rows.push(pair);
 }
 const aggregate=side=>{
   const v=rows.map(r=>r[side]);
   const s=Object.fromEntries(['seconds','shots','hits','stuck'].map(k=>[k,sum(v,k)]));
   s.accuracy=ratio(s.hits,s.shots);s.stuckPerMinute=ratio(s.stuck*60,s.seconds);
   s.blueSpread=ratio(sum(v,'blueSpread'),v.length);s.redSpread=ratio(sum(v,'redSpread'),v.length);
   s.meanClosePairs=ratio(sum(v,'closePairs'),v.length);
   if(mode==='marien'){
    for(const k of ['targetSwitches','acquisitions','movingSeconds','engagedSeconds','coverSelections','coverArrivals','coverAbandons','coverOrphanSeconds','coverStalled'])s[k]=sum(v,k);
    s.coverArrivalRate=ratio(s.coverArrivals,s.coverSelections);
    s.switchesPerAcquisition=ratio(s.targetSwitches,s.acquisitions);
    s.difficulty=Object.fromEntries(['normal','hard','expert'].map(k=>{const x=v.map(r=>r[k]);return [k,{shots:sum(x,'shots'),hits:sum(x,'hits'),accuracy:ratio(sum(x,'hits'),sum(x,'shots')),spawns:sum(x,'spawns')}];}));
   }else{s.actorSeconds=sum(v,'actorSeconds');s.stuckPer100ActorSec=ratio(s.stuck*100,s.actorSeconds);s.plants=sum(v,'planted');s.outcomes=v.map(r=>r.reason);}
   return s;
 };
 const baseline=aggregate('baseline'),candidate=aggregate('candidate');
 const delta=Object.fromEntries(Object.keys(baseline).filter(k=>typeof baseline[k]==='number'&&typeof candidate[k]==='number').map(k=>[k,Math.round((candidate[k]-baseline[k])*10000)/10000]));
 // Review signals are NOT proof of quality; a passive-player match can have no planting.
 const review=[];
 if(candidate.stuckPerMinute>baseline.stuckPerMinute*1.1)review.push('stuck rate increased >10%');
 if(candidate.meanClosePairs>baseline.meanClosePairs*1.1)review.push('close-pair rate increased >10%');
 if(mode==='marien'&&candidate.coverArrivalRate<baseline.coverArrivalRate-.1)review.push('cover arrival rate fell >10 percentage points');
 if(mode==='bomb'&&candidate.plants<baseline.plants)review.push('fewer natural plants');
 summary.modes[mode]={baseline,candidate,delta,review,bySeed:rows};
}
fs.mkdirSync('test-artifacts/v63-comparison',{recursive:true});
fs.writeFileSync('test-artifacts/v63-comparison/report.json',JSON.stringify(summary,null,2));
console.log('V63 COMPARISON '+JSON.stringify(summary));
