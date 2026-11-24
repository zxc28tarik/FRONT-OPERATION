'use strict';
// V47: actual cover lifecycle regression, using game function unchanged.
const fs = require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
let n=0;
const ok=(expr,description)=>{
  if(!expr)throw Error('V47 FAIL: '+description);
  n++;console.log('  ✓ '+description);
};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
scripts.forEach(x=>new Function(x[1]));
ok(scripts.length===3,'All three original game scripts remain valid JavaScript');
const start=html.indexOf('      // V47: Observe actual cover-node selection');
const end=html.indexOf('      // Locate the worst A* recovery hotspots',start);
ok(start>0 && end>start,'Actual V47 cover observer isolated from source');
const counters={},reasons={},events=[];
const metrics={coverEvents:events,coverAbandonReasons:reasons};
const nodes=[{x:0,y:0,z:0},{x:10,y:0,z:0},{x:20,y:0,z:0}];
const obs=new Function('BOT_METRICS','NAV_NODES','recordBotMetric',
 html.slice(start,end)+'\nreturn observeBotCoverLifecycle;')(
 metrics,nodes,(bot,field)=>{counters[field]=(counters[field]||0)+1;});
const bot={
 id:'red_4',classId:'heavy',team:'red',alive:true,state:'TAKE_COVER',
 coverNode:-1,coverPhase:'NONE',pos:{x:0,y:0,z:0},
 visibleEnemy:{pos:{x:15,z:0}},teamFlankGoalNode:-1
};
const count=key=>counters[key]||0;
obs(bot,0);
ok(count('coverAssignments')===0,'No cover selection recorded without a destination');
bot.coverNode=1;bot.coverPhase='MOVE_TO_COVER';obs(bot,1);
ok(count('coverAssignments')===1,'Choosing a cover node records one selection');
ok(events.at(-1).type==='selected'&&events.at(-1).node===1,
 'Selection event identifies exact cover node');
obs(bot,1.2);obs(bot,1.8);
ok(count('coverAssignments')===1,'Same cover choice across frames does not double count');
bot.pos.x=5;obs(bot,2);
ok(count('coverArrivals')===0,'Moving part way is not cover arrival');
bot.pos.x=9.1;obs(bot,3);
ok(count('coverArrivals')===1&&events.at(-1).type==='arrived',
 'Entering 1.45-metre cover radius records a real arrival');
obs(bot,4);
ok(count('coverArrivals')===1,'Standing at same cover does not generate repeat arrivals');
bot.coverNode=-1;bot.coverPhase='NONE';bot.state='ADVANCE';obs(bot,4.5);
ok(count('coverAbandons')===0,'Leaving a cover after arrival is not an abandoned attempt');
bot.pos.x=0;bot.coverNode=2;bot.state='TAKE_COVER';obs(bot,5);
ok(count('coverAssignments')===2,'A second destination counts as a new choice');
bot.pos.x=1;obs(bot,6);
obs(bot,12.5);
ok(count('coverStalledApproaches')===1,'Six seconds without meaningful progress triggers one stuck approach observation');
obs(bot,14);
ok(count('coverStalledApproaches')===1,'Long unchanged stalemate is counted once, not every update');
bot.coverNode=-1;bot.state='SUPPORT_ALLY';obs(bot,15);
ok(count('coverAbandons')===1 && reasons.role_change===1,
 'Leaving before arrival records a role-change abandon reason');
ok(events.some(e=>e.type==='abandoned'&&e.reason==='role_change'&&e.node===2),
 'Abandon event references previous unfinished node');
bot.coverNode=1;bot.state='TAKE_COVER';bot.pos.x=0;obs(bot,16);
bot.coverNode=2;obs(bot,17);
ok(count('coverReassignments')===1,'Switching directly between unfinished cover nodes is tracked');
ok(reasons.reassignment===1 && count('coverAbandons')===2,
 'Reassignment closes previous unfinished approach rather than losing it');
bot.alive=false;bot.coverNode=2;obs(bot,18);
ok(count('coverAbandons')===3 && reasons.death===1,
 'Death closes uncompleted cover journey once');
obs(bot,19);
ok(count('coverAbandons')===3,'Dead bot cannot repeatedly abandon same cover');
bot.alive=true;bot.coverNode=0;bot.pos.x=0;obs(bot,20);
ok(count('coverArrivals')===2,
 'Already-standing-at-cover registers immediate real arrival');
const priorReassignments=count('coverReassignments'),priorAbandons=count('coverAbandons');
bot.coverNode=1;obs(bot,20.5);
ok(count('coverReassignments')===priorReassignments&&count('coverAbandons')===priorAbandons,
 'New cover after completed arrival is not an interrupted approach');
for(let i=0;i<160;i++){
  bot.coverNode=i%2?1:2;
  bot.pos.x=-15;
  obs(bot,21+i);
}
ok(events.length===90,'In-memory cover-event history is bounded at 90 records');
ok(Object.values(counters).every(Number.isFinite),
 'Counters remain finite after many repeated decisions');
ok(Object.values(reasons).reduce((a,b)=>a+b,0)===count('coverAbandons'),
 'Abandon reason totals match abandoned-approach count');
ok(html.includes('observeBotCoverLifecycle(bot,nowSec);'),
 'Live updateBots calls original cover lifecycle observer');
ok((html.match(/observeBotCoverLifecycle\(bot,nowSec\);/g)||[]).length===4,
 'Observer covers alive movement, death/respawn and drone skip');
ok(html.includes("recordBotMetric(bot,'coverOrphanSeconds')"),
 'Old cover phase without assigned node can be diagnosed');
ok(html.includes('BOT_METRICS.coverEvents.length>90') &&
 html.includes('BOT_METRICS.coverAbandonReasons[reason]'),
 'Cover journal and reason counters use bounded RAM only');
ok(html.includes('return index % 15 === 14') &&
 (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
 'Bot difficulty distribution and medium aim settling are unchanged');
console.log('BOT AI V47 PASS ('+n+' checks)');
