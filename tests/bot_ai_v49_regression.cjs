'use strict';
// V49: Target changes cannot cancel a physically progressing A* cover
// detour unless the new enemy exposes that cover or threatens at close range.
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
let checks=0;
const ok=(pass,label)=>{if(!pass)throw Error('V49 FAIL: '+label);checks++;console.log('  ✓ '+label);};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
scripts.forEach(x=>new Function(x[1]));
ok(scripts.length===3,'Original three inline scripts are valid');
const start=html.indexOf('      // V47: Reacquiring a target should not discard');
const end=html.indexOf('      function updateBotPerception(bot, dt, targetClaimCounts)',start);
ok(start>0 && end>start,'Live V47/V49 target cover policy is isolatable');
class V {constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}}
let concealed=true;
const nodes=[{x:15,y:0,z:0},{x:50,y:0,z:0}];
const make=(now)=>new Function('botAiClockSec','THREE','NAV_NODES','hasLineOfSight',
  html.slice(start,end)+'\nreturn isCoverSafeForNewVisibleTarget;')(
  now,{Vector3:V},nodes,()=>!concealed);
const bot=()=>({
  id:'blue_2',pos:new V(0,0,0),coverNode:0,coverPhase:'MOVE_TO_COVER',
  targetId:'red_0',aimSettleTimer:.19,path:[0],pathIndex:0,
  _coverAudit:{node:0,arrived:false,since:0,lastProgressAt:1.1,routeLastProgressAt:6.7,routeBestDistance:8}
});
const enemy={id:'red_1',pos:new V(25,0,0),eye:new V(25,1.45,0)};
ok(make(7)(bot(),enemy),'Near-arrival A* detour may briefly outlive V47 6.2s cap');
ok(make(7)(bot(),enemy),'Repeated safe decision is stable, not a single-frame exception');
let b=bot();make(7)(b,enemy);
ok(b.coverNode===0&&b.targetId==='red_0'&&b.aimSettleTimer===.19,
  'Safety helper never changes target or the user-approved aim system');
b=bot();b._coverAudit.routeLastProgressAt=4.5;
ok(!make(7)(b,enemy),'Stalled A* progress cannot extend cover commitment');
b=bot();b._coverAudit.routeLastProgressAt=6.0;
ok(make(7.1)(b,enemy),'Fresh A* progress and near arrival allow a one-second grace');
b=bot();b._coverAudit.routeLastProgressAt=7.0;
ok(!make(7.2)(b,enemy),'Hard 7.2-second cap ends even recent route progress');
b=bot();b._coverAudit.routeBestDistance=14;
ok(!make(7)(b,enemy),'Distant cover may not use the near-arrival grace');
b=bot();b._coverAudit.routeBestDistance=14;
b._coverAudit.routeLastProgressAt=5.3;
ok(make(5.5)(b,enemy),'Attached progressing route is held within original 6.2s budget');
b=bot();b.path=[1];
ok(!make(7)(b,enemy),'Route to another objective cannot prolong old cover');
b=bot();b.stuckFailures=1;
ok(!make(7)(b,enemy),'An active collision failure overrides route commitment');
b=bot();b.unstuckTimer=0.4;
ok(!make(7)(b,enemy),'Wall escape movement is never interrupted by cover stickiness');
b=bot();b.blockedNode=3;b.blockedNodeTimer=2;
ok(!make(7)(b,enemy),'Recently blocked A-star waypoint releases old cover');
b=bot();b.blockedNode=3;b.blockedNodeTimer=0;
ok(make(7)(b,enemy),'Expired blocked node cannot cause false cover cancellation');
b=bot();delete b._coverAudit.routeLastProgressAt;
ok(!make(7)(b,enemy),'Missing V48 route evidence preserves conservative V47 expiry');
b=bot();b._coverAudit.routeLastProgressAt=Number.NaN;
ok(!make(7)(b,enemy),'Nonfinite route evidence cannot prolong cover use');
b=bot();b._coverAudit.routeLastProgressAt=10;
ok(!make(7)(b,enemy),'Future progress timestamps cannot fake route advancement');
// A future time never originates in the real monotonic bot clock;
// it must not be accepted as proof of forward movement.
const guard=html.slice(start,end);
ok(guard.includes('age < 6.2 || (age < 7.2 && nearlyArrived)')&&
   guard.includes('routeAttached')&&guard.includes('routeLastProgressAt'),
   'Bounded original budget plus near-arrival exception requires attached route');
concealed=false;
ok(!make(7)(bot(),enemy),'Exposed crouch cover is abandoned despite progress');
concealed=true;
ok(!make(7)(bot(),{...enemy,pos:new V(7,0,0)}),
  'Enemy inside nine metres overrides A* commitment');
b=bot();b.coverNode=404;
ok(!make(7)(b,enemy),'Invalid cover index cannot be retained');
b=bot();b.coverPhase='NONE';
ok(!make(7)(b,enemy),'Inactive cover cannot be retained');
b=bot();b._coverAudit.node=1;
ok(make(7)(b,enemy),'Audit from previous node cannot block newly assigned safe cover');
b=bot();b._coverAudit=null;
ok(make(7)(b,enemy),'No cover audit preserves prior V47 safety behavior');
ok(html.includes("recordBotMetric(bot,'coverRouteRetentions')") &&
   html.includes("recordBotMetric(bot,'coverTargetReevaluations')"),
   'Live gameplay counts saves and re-evaluations without new HUD');
ok(html.includes("'coverRouteRetentions','coverTargetReevaluations'") &&
   html.includes('version: 49, seconds: 0'),'V49 telemetry fields are registered');
ok(html.includes('function findBestCoverNode(botPos, threatPos, bot = null) {')&&
   !html.includes('function findBestCoverNode(botPos, threatPos, bot = null, excludedNodes'), 'V20 approved cover-finder signature remains');
ok((html.match(/aimSettleSec: 0\.34/g)||[]).length===3 &&
   html.includes('return index % 15 === 14'),
   'All three 0.34s aim profiles and Expert substitution remain');
console.log('BOT AI V49 PASS ('+checks+' checks)');
