import fs from 'node:fs';
import assert from 'node:assert/strict';
const s=fs.readFileSync('index.html','utf8');
const start=s.indexOf('                  const rallyKey =');
const end=s.indexOf('                if (bot.alertPos && bot.alertTimer > 0) {',start);
assert(start>=0&&end>start,'real bot squad movement block found');
const snippet=s.slice(start,end).replace(/\n\s*}\n\s*$/,'\n');
assert(snippet.includes('FO_BOT02_BEGIN rally-path-release'));
assert(snippet.includes('FO_BOT02_BEGIN rally-path-preserve'));
const fn=new Function('bot','squadLeaderId','squadRallyPos','squadMembers',
 'chooseBotFormationPoint','isPositionWalkable','isBotDirectWalkingLineClear',
 'selectBotRallyWaypoint','setBotState','NAV_NODES','assignBotTacticalGoal',
 'THREE','dt','nowSec','droneSystem','foBotPlan','isFoBombMode',
 'let behaviorHint="ADVANCE",lookOwner="ROUTE",moveTargetPos=null,moveSpeed=4.8,targetCrouch=0,desiredUpperYaw=0;'
 +snippet+';return {moveTargetPos,moveSpeed,behaviorHint,rallyGoalNode:bot.rallyGoalNode};');
const nodes=Array.from({length:30},(_,i)=>({x:i,y:0,z:0,tag:'ordinary'}));
let cases=0;
for(const mode of ['blocked-after-stuck','blocked-slot','unrelated-tactical-route','no-rally-owner','clear-slot']){
 let assign=0,clear=0;
 const blocked=mode!=='clear-slot';
 const prior=mode==='no-rally-owner'?-1:mode==='unrelated-tactical-route'?7:4;
 const stuck=['blocked-after-stuck','unrelated-tactical-route','no-rally-owner'].includes(mode)?1:0;
 const bot={id:'member',team:'blue',squadId:0,classId:'heavy',stuckFailures:stuck,rallyGoalNode:prior,
  path:[3,4],pathIndex:0,goalNode:8,stateTimer:0,pos:{x:0,y:0,z:0,distanceTo:()=>12}};
 const actual=fn(bot,{blue_0:'leader'},{blue_0:{x:12,y:0,z:0}},{blue_0:[{id:'leader'},bot]},
 ()=>({x:9,y:0,z:0}),()=>true,()=>{clear++;return !blocked},
 (b,p)=>{b.rallyGoalNode=-1;return {x:p.x,y:p.y,z:p.z}},()=>{},nodes,
 ()=>{assign++;bot.path=[8];bot.pathIndex=0},
 {Vector3:class{constructor(x,y,z){this.x=x;this.y=y;this.z=z}}},
 .05,0,{getRemainingCharges:()=>0},{orders:new Map()},()=>false);
 const replace=mode==='blocked-after-stuck'||mode==='blocked-slot';
 assert.equal(assign,replace?1:0,'assigned own route only when abandoned rally owns path: '+mode);
 assert.equal(actual.rallyGoalNode,-1,'release rally owner: '+mode);
 assert.equal(actual.moveTargetPos.x,replace?8:mode==='clear-slot'?9:3,'movement target: '+mode);
 assert.deepEqual(bot.path,replace?[8]:[3,4],'do not overwrite independent path: '+mode);
 if(mode==='blocked-slot'||mode==='clear-slot')assert.equal(clear,1);
 cases++;
}
assert(s.includes('isFoBombMode()')&&s.includes('isFoRescueMode()'));
console.log('BOT02 squad route ownership PASS',{cases});
