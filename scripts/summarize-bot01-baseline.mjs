import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const modes=['deathmatch','bomb','rescue'],seeds=[471001,471002,471003,831017,831031];
const sum=(a,k)=>a.reduce((n,x)=>n+(x[k]||0),0),ratio=(n,d)=>d?Math.round(n/d*10000)/10000:null;
const median=a=>{const v=a.slice().sort((x,y)=>x-y);return v.length?ratio(v[Math.floor((v.length-1)/2)]+v[Math.ceil((v.length-1)/2)],2):null;};
const rows=[];for(const mode of modes)for(const seed of seeds){const file='test-artifacts/bot01/'+mode+'-'+seed+'/report.json';try{const r=JSON.parse(fs.readFileSync(file));assert.equal(r.mode,mode);assert.equal(r.seed,seed);rows.push(r);}catch(e){rows.push({mode,seed,status:'FAIL',error:String(e)});}}
function metrics(matches){
 const a=matches.flatMap(r=>r.actors),s=matches.flatMap(r=>Object.values(r.stats.actors));
 const gate={},pairs={},reversals={},contexts={},navigation={};
 for(const x of a){
   for(const [k,v] of Object.entries(x.gateSec))gate[k]=(gate[k]||0)+v;
   for(const [k,v] of Object.entries(x.transitionPairs||{}))pairs[k]=(pairs[k]||0)+v;
   for(const [k,v] of Object.entries(x.rapidReversePairs||{}))reversals[k]=(reversals[k]||0)+v;
   for(const [k,v] of Object.entries(x.transitionContexts||{}))contexts[k]=(contexts[k]||0)+v;
   for(const [k,v] of Object.entries(x.navResetPairs||{}))navigation[k]=(navigation[k]||0)+v;
 }
 const alive=sum(a,'aliveSec'),visible=sum(a,'visibleSec'),contacts=sum(a,'contacts');
 return {matches:matches.length,aliveSec:ratio(alive,1),movingFraction:ratio(sum(a,'movingSec'),alive),quietNonMissionIdleFraction:ratio(sum(a,'quietNonMissionIdleSec'),alive),
 visibleSec:ratio(visible,1),shots:sum(s,'shots'),hits:sum(s,'hits'),accuracy:ratio(sum(s,'hits'),sum(s,'shots')),
 directShots:sum(a,'shots'),directShotsPerVisibleSec:ratio(sum(a,'shots'),visible),transitionsPer100AliveSec:ratio(sum(a,'transitions')*100,alive),
 transitionPairs:Object.fromEntries(Object.entries(pairs).sort((a,b)=>b[1]-a[1]).slice(0,20)),
 rapidReversalsPer100AliveSec:ratio(sum(a,'rapidReversals')*100,alive),
 rapidReversePairs:Object.fromEntries(Object.entries(reversals).sort((a,b)=>b[1]-a[1]).slice(0,20)),
 transitionContexts:contexts,
 navResetsOnKindChangePer100AliveSec:ratio(sum(a,'navResetsOnKindChange')*100,alive),
 navResetPairs:Object.fromEntries(Object.entries(navigation).sort((a,b)=>b[1]-a[1]).slice(0,20)),
 routeProgressClears:sum(a,'routeProgressClears'),stuckClockClears:sum(a,'stuckClockClears'),
 unstuckClears:sum(a,'unstuckClears'),passageClears:sum(a,'passageClears'),
 stuckPer100AliveSec:ratio(sum(s,'stuckRecoveries')*100,alive),coverSecondsPer100AliveSec:ratio((sum(s,'coverApproachSeconds')+sum(s,'coverHoldSeconds'))*100,alive),
 contactCount:contacts,contactFiredFraction:ratio(sum(a,'contactsFired'),contacts),laneContactFiredFraction:ratio(sum(a,'contactsWithLaneFired'),sum(a,'contactsWithLane')),
 medianFirstShotSec:median(a.flatMap(x=>x.latency)),medianLaneToShotSec:median(a.flatMap(x=>x.laneLatency)),
 gateFractions:Object.fromEntries(Object.entries(gate).map(([k,v])=>[k,ratio(v,visible)]))};
}

function stuckDiagnostics(matches){
 const totals={state:{},classId:{},route:{},trigger:{}},sampleRoute={},sampleClear={},sampleMovement={},sampleClass={},sampleLocal={},hotspots={};
 let sampled=0;
 const bump=(o,k,n=1)=>{o[k]=(o[k]||0)+n;};
 for(const report of matches){
   const data=report.stats||{},breakdown=data.stuckBreakdown||{};
   for(const field of Object.keys(totals))
     for(const [key,count] of Object.entries(breakdown[field]||{}))
       bump(totals[field],key,count);
   for(const context of data.stuckContexts||[]){
     sampled++;
     const k=context.classId||'unknown',motion=context.motion||{};
     bump(sampleClass,k);
     bump(sampleRoute,motion.route||'unknown');
     bump(sampleClear,context.probeClear===true?'walkable':context.probeClear===false?'blocked':'unknown');
     bump(sampleLocal,motion.local||'none');
     const move=motion.actualMoved,p=motion.forwardProgress;
     const mode=typeof move==='number'&&typeof p==='number'&&move>=.55&&p<.275?'moved_without_route_progress':typeof move==='number'&&move<.55?'no_displacement':'other';
     bump(sampleMovement,mode);
     const pos=context.position||{};
     if(Number.isFinite(pos.x)&&Number.isFinite(pos.z))
       bump(hotspots,String(Math.round(pos.x/5)*5)+','+String(Math.round(pos.z/5)*5));
   }
 }
 const eventCount=Object.values(totals.classId).reduce((n,v)=>n+v,0);
 const top=(obj,n=12)=>Object.fromEntries(Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n));
 return {eventCount,breakdown:{state:top(totals.state),classId:top(totals.classId),route:top(totals.route),trigger:top(totals.trigger)},
   sampledContexts:sampled,sampleRoute:top(sampleRoute),sampleClear:top(sampleClear),sampleMovement:top(sampleMovement),
   sampleClass:top(sampleClass),sampleLocal:top(sampleLocal),sampleHotspots:top(hotspots,10),
   note:'Contexts are bounded per match and are not representative of every recovery. Breakdown covers all recorded recoveries.'};
}

const reference=process.env.BOT01_REFERENCE||'V344';
const configuredBlob=process.env.BOT01_EXPECTED_BLOB;
const currentGame=configuredBlob==='current'?fs.readFileSync('index.html','utf8'):null;
const expectedBlob=currentGame!==null
  ?createHash('sha1').update('blob '+Buffer.byteLength(currentGame)+'\0').update(currentGame).digest('hex')
  :(configuredBlob||'969432fb88c61b824ee6836df40006a64cdd3065');
for(const r of rows)if(r.status==='PASS')assert.equal(r.blob,expectedBlob,'match source identity');
const report={reference,blob:expectedBlob,completed:rows.filter(r=>r.status==='PASS').length,expected:15,modes:{},failures:rows.filter(r=>r.status!=='PASS').map(r=>({mode:r.mode,seed:r.seed,error:r.error}))};
for(const mode of modes){const r=rows.filter(x=>x.mode===mode&&x.status==='PASS');report.modes[mode]={...metrics(r),stuckDiagnostics:stuckDiagnostics(r),checkpoint60:metrics(r.map(x=>x.checkpoint)),outcomes:r.map(x=>({seed:x.seed,elapsed:x.elapsed,winner:x.winner,score:[x.scoreBlue,x.scoreRed],plantedAt:x.plantedAt,firstPickupAt:x.firstPickupAt,firstSavedAt:x.firstSavedAt,objective:x.objective})),byClass:Object.fromEntries(['assault','medic','engineer','sniper','heavy'].map(c=>[c,metrics(r.map(x=>({...x,actors:x.actors.filter(a=>a.classId===c),stats:{actors:Object.fromEntries(Object.entries(x.stats.actors).filter(([id])=>x.actors.some(a=>a.id===id&&a.classId===c)))}})))]))};}
fs.mkdirSync('test-artifacts/bot01',{recursive:true});fs.writeFileSync('test-artifacts/bot01/summary.json',JSON.stringify(report,null,2));
console.log('BOT01_SUMMARY '+JSON.stringify(report));if(report.completed!==15)process.exitCode=1;
