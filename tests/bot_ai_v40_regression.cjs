'use strict';
// FRONT OPERATION V40 — telemetry integrity and deterministic 600-second accumulator stress.
// Run: node tests/bot_ai_v40_regression.cjs
function runBotAiV40Regression(html) {
 const checks=[];
 const expect=(condition,label)=>{if(!condition)throw Error('V40 FAIL: '+label);checks.push(label)};
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 scripts.forEach(m=>new Function(m[1]));
 expect(scripts.length===3,'Three original game scripts parse');
 const start=html.indexOf('      // V40: In-memory telemetry only.');
 const end=html.indexOf('      let botLifeSequence = 0;',start);
 if(start<0||end<start)throw Error('V40 telemetry module not found');
 const code=html.slice(start,end);
 const api=new Function(code+'\nreturn {FIELDS:BOT_METRIC_FIELDS,state:BOT_METRICS,'+
   'reset:resetBotMetrics,record:recordBotMetric,shot:recordBotShot,'+
   'sample:sampleBotMetrics,snapshot:getBotMetricsSnapshot};')();
 const bot=(id,team,cls,difficulty,x=0,z=0)=>({
   id,team,classId:cls,difficulty,alive:true,visibleEnemy:null,
   pos:{x,y:0,z}
 });
 const teamBlue=[
   bot('blue_0','blue','assault','normal',-12,0),
   bot('blue_1','blue','medic','hard',-6,0),
   bot('blue_2','blue','engineer','normal',0,0),
   bot('blue_3','blue','sniper','hard',6,0),
   bot('blue_4','blue','heavy','normal',12,0)
 ];
 const teamRed=[
   bot('red_0','red','assault','hard',-12,30),
   bot('red_1','red','medic','normal',-6,30),
   bot('red_2','red','engineer','hard',0,30),
   bot('red_3','red','sniper','normal',6,30),
   bot('red_4','red','heavy','hard',12,30),
   bot('red_5','red','assault','normal',15,30)
 ];
 const bots=teamBlue.concat(teamRed);
 api.reset();
 expect(api.state.seconds===0&&api.state.samples===0&&
   !Object.keys(api.state.actors).length,'Fresh match initializes clean telemetry');
 bots.forEach(x=>api.record(x,'spawns'));
 expect(api.state.teams.blue.spawns===5&&api.state.teams.red.spawns===6,
   'Spawn accounting reflects original 5 bot allies plus six adversaries');
 expect(api.state.difficulty.normal.spawns===6&&api.state.difficulty.hard.spawns===5,
   'Initial spawn distribution attributed to actual difficulty values');
 expect(api.state.classes.assault.spawns===3,'Class accounting respects assault slots');
 api.record(bot('blue_0','blue','assault','expert'),'spawns');
 expect(api.state.difficulty.expert.spawns===1,
   'Later expert lives get independent statistics, not a new soldier class');
 api.shot(teamBlue[0],true);
 api.shot(teamBlue[0],false);
 api.shot(teamBlue[1],true);
 api.shot(teamBlue[2],false,true);
 api.shot(teamBlue[2],true,true);
 expect(api.state.teams.blue.shots===3&&api.state.teams.blue.hits===2,
   'Infantry shots and hits are counted exactly');
 expect(api.state.teams.blue.droneShots===2&&api.state.teams.blue.droneHits===1,
   'Drone-target shots are tracked separately from infantry accuracy');
 api.record(teamBlue[0],'stuckRecoveries');
 api.record(teamBlue[0],'heard');
 api.record(teamBlue[0],'heardArrived');
 api.record(teamBlue[0],'flankStarts');
 api.record(teamBlue[0],'sightings');
 api.record(teamBlue[1],'heardInterrupted');
 api.record(teamBlue[0],'kills');
 api.record(teamBlue[0],'deaths');
 expect(api.state.actors.blue_0.stuckRecoveries===1&&
   api.state.actors.blue_0.heard===1&&
   api.state.actors.blue_0.heardArrived===1&&
   api.state.actors.blue_0.flankStarts===1,
   'Navigation failure and acoustic response tracked by individual bot');
 expect(api.state.difficulty.normal.kills===1&&
   api.state.difficulty.normal.deaths===1,
   'Kill/death attribution follows current life skill');
 const snapshot=api.snapshot();
 expect(snapshot.difficulty.normal.accuracy===0.5 &&
   snapshot.classes.medic.accuracy===1,
   'Shot accuracy is calculated per difficulty and class');
 expect(snapshot.teams.blue.droneAccuracy===0.5,
   'Drone accuracy has its own denominator');
 expect(snapshot.actors.blue_0.kd===1,
   'Kills/deaths ratio uses real death denominator');
 expect(snapshot.difficulty.expert.accuracy===null &&
   snapshot.difficulty.expert.kd===null,
   'No shots/deaths display unavailable ratios as null, not fake 0 or Infinity');
 snapshot.actors.blue_0.shots=999;
 expect(api.state.actors.blue_0.shots===2,
   'Export is a defensive snapshot and cannot modify game telemetry');
 api.record(teamBlue[0],'fakeField');
 expect(!('fakeField' in api.state.actors.blue_0),
   'Unknown stat keys cannot pollute metric buckets');
 api.sample(-2,bots);
 api.sample(Infinity,bots);
 expect(api.state.seconds===0,'Invalid sample dt cannot advance match clock');
 api.sample(0.05,bots);
 expect(api.state.seconds===0&&api.state.samples===0,
   'Sampling does not record a fake second from a short frame');
 for(let k=1;k<20;k++)api.sample(.05,bots);
 expect(api.state.seconds===1,'Exactly one complete second creates one sample');
 expect(api.state.actors.blue_0.aliveSeconds===1,
   'Alive time accumulates as observed second count');
 expect(api.state.spread.blue.observations===1&&api.state.spread.red.observations===1,
   'Both squads are sampled independently');
 expect(api.snapshot().spread.blue.meanRadius>0 &&
   api.snapshot().spread.red.meanRadius>0,
   'Team formation spread has meaningful radius');
 teamBlue[1].pos.x=teamBlue[0].pos.x+0.5;
 teamBlue[1].pos.z=teamBlue[0].pos.z;
 for(let k=0;k<20;k++)api.sample(.05,bots);
 expect(api.state.spread.blue.closePairs>=1,
   'Too-close friendly pair detection captures real crowding');
 teamBlue[1].pos.y=4;
 const closeBefore=api.state.spread.blue.closePairs;
 for(let k=0;k<20;k++)api.sample(.05,bots);
 expect(api.state.spread.blue.closePairs===closeBefore,
   'Teammates on a different floor do not count as crowding');
 teamBlue[0].visibleEnemy={id:'red_0'};
 teamBlue[2].alive=false;
 for(let k=0;k<20;k++)api.sample(.05,bots);
 expect(api.state.actors.blue_0.engagedSeconds===1 &&
   api.state.actors.blue_2.aliveSeconds===3,
   'Engagement and dead soldier exposure seconds are not confused');
 teamBlue[0].visibleEnemy=null;
 teamBlue[2].alive=true;
 const before=api.state.seconds;
 // Ten minutes of deterministic TELEMETRY sampling. This is not an
 // actual ten-minute Chromium game or rendered performance benchmark.
 for(let i=0;i<12000;i++)api.sample(.05,bots);
 expect(api.state.seconds===before+600,
   '600 simulated seconds of counters complete without overflow');
 expect(api.state.samples===before+600,
   'Every second has one metric sample even during ten-minute stress');
 expect(api.state.recent.length===20,
   'Recent history remains bounded to last twenty samples');
 expect(api.state.spread.red.observations===before+600,
   'Long-run squad separation statistics do not drift or stop updating');
 expect(api.state.actors.blue_0.aliveSeconds===before+600,
   'Long-run individual exposure seconds accumulate consistently');
 expect(Number.isFinite(api.snapshot().spread.blue.meanRadius)&&
   Number.isFinite(api.snapshot().teams.blue.accuracy),
   'No NaN or Infinity in long-run exported telemetry');
 const old=api.snapshot();
 api.reset();
 expect(api.state.seconds===0&&api.state.recent.length===0 &&
   api.state.spread.blue.observations===0&&
   !Object.keys(api.state.difficulty).length,
   'New match resets ALL counters, group aggregates and recent samples');
 expect(old.seconds>600,'Reset does not mutate previously exported snapshots');
 api.record(teamBlue[0],'spawns');
 expect(api.state.actors.blue_0.spawns===1,'New match starts counting first bot from one');
 expect(html.includes("recordBotMetric(b, 'spawns');")&&
   html.includes("recordBotMetric(bot, 'spawns');"),
   'Actual initial and respawn flows account for difficulty-specific bot lives');
 expect(html.includes("recordBotMetric(bot, 'deaths');")&&
   html.includes("recordBotMetric(killerBot, 'kills');"),
   'Player/bot deaths and eliminations feed real-match counters');
 expect((html.match(/recordBotShot\(bot, hitSuccess/g)||[]).length===2,
   'Infantry and anti-drone hits account for actual fired rounds');
 expect(html.includes('recordBotMetric(bot, \'stuckRecoveries\');') &&
   html.includes('recordBotMetric(bot,\'heardArrived\');') &&
   html.includes('recordBotMetric(bot,\'flankStarts\');'),
   'Real movement, sound and tactical events feed telemetry');
 expect(html.includes('sampleBotMetrics(dt,bots);'),
   'Real bot update samples team dispersion at one-second cadence');
 expect(html.includes('botMetrics: getBotMetricsSnapshot(),') &&
   html.includes("location.hostname === '127.0.0.1'"),
   'Read-only QA export exists only in localhost game session');
 expect(!code.includes('fetch(')&&!code.includes('localStorage')&&
   !code.includes('document.getElementById'),
   'Metrics neither upload data nor alter persistent storage or player HUD');
 expect(html.includes('return index % 15 === 14') &&
   (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
   '3 Normal/2 Hard plus each 15th Expert and medium aim untouched');
 return checks;
}
module.exports={runBotAiV40Regression};
if(require.main===module){
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 const checks=runBotAiV40Regression(html);
 console.log('BOT AI V40 PASS ('+checks.length+' checks)');
 checks.forEach(label=>console.log('  ✓ '+label));
}
