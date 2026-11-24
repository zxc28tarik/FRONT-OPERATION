'use strict';
// V48: Route-aware cover progress and reachable-stalled-cover recovery.
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let tests=0;
const ok=(pass,label)=>{if(!pass)throw Error('V48 FAIL: '+label);tests++;console.log('  ✓ '+label);};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
scripts.forEach(s=>new Function(s[1]));
ok(scripts.length===3,'Three original inline scripts remain valid JavaScript');
ok(html.includes('function findBestCoverNode(botPos, threatPos, bot = null) {') &&
 !html.includes('function findBestCoverNode(botPos, threatPos, bot = null, excludedNodes'),
 'Approved V20 cover finder retains original public signature');
const nav=[
 {x:0,y:0,z:0},{x:4,y:0,z:0},
 {x:0,y:0,z:-10},{x:10,y:0,z:-10},{x:10,y:0,z:0}
];
const begin=html.indexOf('      // V48: Euclidean proximity can INCREASE');
const end=html.indexOf('      // Locate the worst A* recovery hotspots',begin);
ok(begin>0&&end>begin,'V48 progress module is connected to V47 cover observer');
const meters={coverEvents:[],coverAbandonReasons:{}},counters={};
const audit=new Function('NAV_NODES','BOT_METRICS','recordBotMetric',
 html.slice(begin,end)+'\nreturn {remaining:getBotCoverRemainingDistance,observe:observeBotCoverLifecycle};')(
 nav,meters,(bot,key)=>{counters[key]=(counters[key]||0)+1;});
const soldier={id:'blue_4',team:'blue',classId:'heavy',
 pos:{x:0,y:0,z:0},alive:true,state:'TAKE_COVER',
 coverNode:4,coverPhase:'MOVE_TO_COVER',path:[0,2,3,4],
 pathIndex:1,teamFlankGoalNode:-1,visibleEnemy:{pos:{x:22,z:0}}};
const initial=audit.remaining(soldier,4);
ok(initial>Math.hypot(nav[4].x-soldier.pos.x,nav[4].z-soldier.pos.z)*2,
 'A-star remaining distance includes necessary wall detours');
audit.observe(soldier,1);
soldier.pos.z=-2;
const after=audit.remaining(soldier,4);
ok(after<initial-1.9,'Moving around wall decreases actual remaining path');
ok(Math.hypot(soldier.pos.x-10,soldier.pos.z)>10,
 'That same correct movement can increase straight-line cover distance');
audit.observe(soldier,2);
ok( soldier._coverAudit.routeLastProgressAt===2 &&
 soldier._coverAudit.lastProgressAt===1 &&
 soldier._coverAudit.routeBestDistance<initial,
 'V48 route diagnostic credits detour but preserves V47 decision clock');
for(let i=0;i<10;i++){soldier.pos.z=-2-(i+1)*.5;audit.observe(soldier,3+i*.5);}
ok((counters.coverStalledApproaches||0)===0,
 'Steady progress avoids the six-second false stall detector');
soldier.path=[0,1,4];soldier.pathIndex=3;
ok(audit.remaining(soldier,4)===Math.hypot(10-soldier.pos.x,0-soldier.pos.z),
 'Exhausted or unrelated routes conservatively fall back to direct distance');
soldier.path=[0,2];soldier.pathIndex=1;
ok(audit.remaining(soldier,4)===Math.hypot(10-soldier.pos.x,0-soldier.pos.z),
 'Active non-cover path never masquerades as cover progress');
const from=html.indexOf('      // V48: Keep the V20-approved cover scoring');
const to=html.indexOf('      function setBotState(bot, nextState',from);
ok(from>0&&to>from,'Emergency alternate selector and recovery are in game source');
let walk=true,hasCover=true;
class V {constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}clone(){return new V(this.x,this.y,this.z);}}
const vecNodes=nav.map(n=>new V(n.x,n.y,n.z));
const ops={};
const api=new Function('THREE','NAV_NODES','botAiClockSec',
 'findNearestNavNode','isBotDirectWalkingLineClear','hasLineOfSight',
 'findPathAStar','getCoverOccupancyCount','recordBotMetric',
 html.slice(from,to)+'\nreturn {select:selectAlternativeReachableCover,recover:recoverBotStalledCover};')(
 {Vector3:V},vecNodes,8,
 ()=>0,()=>walk,(_from,to)=>!hasCover,
 (origin,node)=>node===1?[1]:node===2?[0,2]:node===3?[0,2,3]:[0,4],
 ()=>0,(_bot,name)=>{ops[name]=(ops[name]||0)+1;}
 );
const b={id:'red_4',team:'red',classId:'heavy',hp:100,
 pos:new V(0,0,0),alive:true,coverNode:1,
 coverPhase:'MOVE_TO_COVER',teamFlankGoalNode:-1,
 visibleEnemy:{id:'blue_0',pos:new V(22,0,0)},
 _coverAudit:{node:1,arrived:false,since:0,lastProgressAt:0,routeLastProgressAt:0},
 coverRecoveryUntil:0,coverSearchCooldown:0,stuckFailures:1,
 blockedNode:-1,coverAvoidNode:-1,coverAvoidUntil:0,
 path:[0,1],pathIndex:0};
const movingDespiteCoverDelay={...b,stuckFailures:0,
 _coverAudit:{...b._coverAudit,routeLastProgressAt:4}};
ok(api.recover(movingDespiteCoverDelay,8)===false,
 'Cover-goal delay alone cannot trigger recovery without a genuine physical stall');
let choice=api.select(b,b.visibleEnemy.pos,1);
ok(choice&&choice.node!==1&&choice.route[0]===0,
 'Alternative excludes previously failed cover and keeps genuine A-star origin');
ok(choice.route.at(-1)===choice.node && typeof choice.partial==='boolean',
 'Chosen alternative has verified route endpoint and concealment type');
ok(api.recover(b,8)===true && b.coverNode===choice.node &&
 b.path.at(-1)===b.coverNode,
 'Stalled soldier switches to reachable cover without wall-clipping');
ok((ops.coverStallReroutes||0)===1&&b.stuckFailures===0,
 'Successful recovery counted once and clears prior stuck failures');
ok(b.coverRecoveryUntil>8 && b.coverCommitTimer===2.6,
 'New route receives bounded commitment and replan cooldown');
const prior=b.coverNode;
ok(api.recover(b,8.1)===false&&b.coverNode===prior,
 'Fresh route cannot thrash in the following frame');
const c={...b,pos:new V(0,0,0),coverNode:1,
 _coverAudit:{node:1,arrived:false,since:7,lastProgressAt:7},
 coverRecoveryUntil:0,teamFlankGoalNode:-1};
ok(api.recover(c,8)===false,
 'Approaches younger than 3.6s are never rerouted');
const e={...c,_coverAudit:{node:1,arrived:false,since:0,lastProgressAt:0,routeLastProgressAt:0},
 teamFlankGoalNode:3};
ok(api.recover(e,8)===false,
 'Emergency cover recovery does not override a coordinated flank');
const longDeadEnd={...c,_coverAudit:{node:1,arrived:false,since:0,
 lastProgressAt:0,routeLastProgressAt:0},stuckFailures:0,
 coverRecoveryUntil:0,teamFlankGoalNode:-1};
ok(api.recover(longDeadEnd,8)===true &&
 longDeadEnd.coverNode!==1 &&
 (ops.coverStallReroutes||0)>=2,
 'Seven-second route dead end can reroute without a V40 physical collision');
const noEnemy={...c,_coverAudit:{node:1,arrived:false,since:0,lastProgressAt:0,routeLastProgressAt:0},
 visibleEnemy:null};
ok(api.recover(noEnemy,8)===false,
 'No confirmed visible enemy means no clairvoyant cover selection');
walk=false;
ok(api.select(c,c.visibleEnemy.pos,1)===null,
 'Unreachable ground origin must not initiate unsafe alternative route');
walk=true;hasCover=false;
const fallback={...c,_coverAudit:{node:1,arrived:false,since:0,lastProgressAt:0,routeLastProgressAt:0},
 coverRecoveryUntil:0,stuckFailures:3};
ok(api.recover(fallback,8)===true &&
 fallback.coverNode===-1 && fallback.coverPhase==='NONE',
 'With no concealed alternatives, soldier releases impossible cover');
ok((ops.coverStallFallbacks||0)===1 &&
 fallback.coverSearchCooldown>=2,'Safe fallback is metered and throttled');
ok(html.includes('recoverBotStalledCover(bot,nowSec);') &&
 html.includes('observeBotCoverLifecycle(bot,nowSec);'),
 'Live update invokes both the original audit and V48 recovery');
ok(html.includes("recordBotMetric(bot,'coverRouteRejected')") &&
 html.includes("recordBotMetric(bot,'coverStallReroutes')"),
 'Route failures and successful recoveries have real telemetry counters');
ok((html.match(/aimSettleSec: 0\.34/g)||[]).length===3 &&
 html.includes('return index % 15 === 14'),
 'All three skills retain medium aim and fifteen-life Expert cycle');
console.log('BOT AI V48 PASS ('+tests+' checks)');
