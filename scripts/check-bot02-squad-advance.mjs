import fs from 'node:fs';
import assert from 'node:assert/strict';
const s=fs.readFileSync('index.html','utf8');
const start=s.indexOf('                  const rallyKey =');
const end=s.indexOf('                  if (!moveTargetPos && moveSpeed > 0) {',start);
assert(start>=0&&end>start,'actual squad movement code exists');
const snippet=s.slice(start,end);
assert(snippet.includes('FO_BOT02_BEGIN rally-advance'));
assert(!snippet.includes("behaviorHint='SUPPORT'"),'squad movement is not Medic support');
assert(snippet.includes('FO_BOT02_BEGIN rally-stuck-fallback'));
assert(snippet.includes('FO_BOT02_BEGIN rally-direct-clear'));
assert(snippet.includes('bot.stuckFailures>0'));

const simulate=new Function('bot','squadLeaderId','squadRallyPos','squadMembers',
 'chooseBotFormationPoint','selectBotRallyWaypoint','isPositionWalkable','isBotDirectWalkingLineClear','setBotState','THREE',
 'let behaviorHint="ADVANCE",moveTargetPos=null,moveSpeed=5.3;'+snippet+
 ';return {behaviorHint,moveTargetPos,moveSpeed};');
let cases=0;
for(const classId of ['assault','medic','heavy','sniper','engineer'])
for(const distance of [5,8,20,29])
for(const validSlot of [true,false])
for(const leaderSelf of [true,false])
for(const stuck of [0,1,2])
for(const directClear of [true,false]){
 const states=[];let rallyCalls=0,clearCalls=0;
 const bot={id:'member',team:'blue',squadId:0,classId,
   pos:{distanceTo:()=>distance,y:0},rallyGoalNode:2,stuckFailures:stuck};
 const leader={id:'leader',pos:{x:0,y:0,z:0}};
 const result=simulate(bot,{blue_0:leaderSelf?'member':'leader'},
   {blue_0:{x:0,y:0,z:0}},{blue_0:[leader,bot]},
   ()=>validSlot?{x:9,y:0,z:5}:null,
   (b,p)=>{rallyCalls++;return {x:p.x,y:p.y,z:p.z};},()=>true,()=>{clearCalls++;return directClear;},
   (b,state)=>states.push(state),{Vector3:class {constructor(x,y,z){this.x=x;this.y=y;this.z=z;}}});
 const eligible=!leaderSelf&&stuck===0&&!['sniper','engineer'].includes(classId)&&distance>6.5&&distance<28;
 const slotClearRequired=classId==='heavy'||classId==='assault';
 const pursuing=eligible&&validSlot&&(!slotClearRequired||directClear);
 assert.equal(result.behaviorHint,'ADVANCE');
 assert.equal(states.length,eligible?1:0);
 if(eligible){assert.equal(states[0],'ADVANCE');assert.equal(!!result.moveTargetPos,pursuing);}
 else assert.equal(result.moveTargetPos,null);
 assert.equal(rallyCalls,pursuing?1:0,'only blocked Heavy/Assault slots must yield to tactical route');
 assert.equal(clearCalls,eligible&&validSlot&&slotClearRequired?1:0,'Medic must retain V351 path without clearance probe');
 if(pursuing)assert.equal(result.moveSpeed,distance<10?3.2:4.6);
 if(eligible&&validSlot&&slotClearRequired&&!directClear)assert.equal(bot.rallyGoalNode,2,'blocked formation keeps route owner until tactical fallback');
 cases++;
}
const a=s.indexOf('      const BOT_BEHAVIOR_PRIORITY='),b=s.indexOf('      function resolveBotLocalMovement(',a);
assert(a>=0&&b>a);
const choose=new Function(s.slice(a,b)+';return selectBotBehaviorPlan;')();
let priority=0;
for(const kind of ['ENGAGE','MISSION','RETREAT','COVER','DRONE']){
 const bot={pos:{x:0,y:0,z:0},legYaw:0,lastCheckPos:{copy(){}},stuckTimer:0};
 const p=choose(bot,[{kind:'ADVANCE',target:{x:1,y:0,z:0},speed:4},
   {kind,target:{x:2,y:0,z:0},speed:kind==='DRONE'?0:3}],3);
 assert.equal(p.kind,kind);
 priority++;
}
assert(s.includes("if (injuredAlly) {\n                  behaviorHint='SUPPORT';"),
 'actual Medic patient support must remain separate');
assert(s.includes('isFoBombMode()')&&s.includes('isFoRescueMode()'),'objective modes preserved');
console.log('BOT02 squad ADVANCE PASS',{formationCases:cases,combatAndMissionPriority:priority});
