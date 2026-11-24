import fs from 'node:fs';
import path from 'node:path';
const seeds=[471001,471002,471003,831017,831031,831047];
const versions=['v53','v65','v70','v71e','candidate'];
const load=(mode,variant,seed)=>JSON.parse(fs.readFileSync(path.join('test-artifacts',mode==='marien'?'front-operation-bot-stress':'front-operation-bomb-full',variant+'-'+seed,'report.json'),'utf8'));
const summary={status:'PASS',versions,seeds,heldOutSeeds:seeds.slice(3),limitation:'Accelerated Chromium simulation with passive human slot; same initial seeds, divergent later random streams. Not rendered FPS or human playtest.',modes:{}};
const sum=(rows,key)=>rows.reduce((n,r)=>n+(r[key]||0),0);
const ratio=(n,d)=>d?Math.round(n/d*10000)/10000:null;
for(const mode of ['marien','bomb']){
 const rows=[];
 for(const seed of seeds){
  const pair={seed};
  for(const variant of versions){
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
 const aggregate=(side,subset=rows)=>{
   const v=subset.map(r=>r[side]);
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
 const all=Object.fromEntries(versions.map(v=>[v,aggregate(v)]));
 const heldOut=Object.fromEntries(versions.map(v=>[v,aggregate(v,rows.filter(r=>seeds.slice(3).includes(r.seed)))]));
 const review={};
 for(const label of versions.filter(v=>v!=='candidate')){
   const baseline=all[label],candidate=all.candidate,flags=[];
   if(candidate.stuckPerMinute>baseline.stuckPerMinute*1.1)flags.push('stuck rate increased >10%');
   if(candidate.meanClosePairs>baseline.meanClosePairs*1.1)flags.push('close-pair rate increased >10%');
   if(mode==='marien'&&candidate.coverArrivalRate<baseline.coverArrivalRate-.1)flags.push('cover arrival rate fell >10 percentage points');
   if(mode==='marien'&&candidate.switchesPerAcquisition>baseline.switchesPerAcquisition*1.1)flags.push('target switches per acquisition increased >10%');
   if(mode==='marien'&&candidate.accuracy<baseline.accuracy-.01)flags.push('accuracy fell >1 percentage point');
   if(mode==='bomb'&&candidate.plants<baseline.plants)flags.push('fewer natural plants');
   review[label]=flags;
 }
 summary.modes[mode]={all,heldOut,review,bySeed:rows};
}
fs.mkdirSync('test-artifacts/v72-comparison',{recursive:true});
fs.writeFileSync('test-artifacts/v72-comparison/report.json',JSON.stringify(summary,null,2));
console.log('V72 COMPARISON '+JSON.stringify(summary));
