'use strict';
function runBotAiV36Regression(html) {
  const out=[];
  const ok=(good,why)=>{if(!good)throw Error('V36 FAIL: '+why);out.push(why)};
  const st=html.indexOf('      // V36: A persistent lateral dodge');
  const en=html.indexOf('      function updateBots(dt) {',st);
  if(st<0||en<=st)throw Error('V36 helper not found');
  const helpers=html.slice(st,en);
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  scripts.forEach(m=>new Function(m[1]));
  ok(scripts.length===3,'Original three inline game scripts compile');
  class V {constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}}
  const bot={id:'blue_0',team:'blue',alive:true,pos:new V(),strafeDir:1,moveVelX:0,moveVelZ:0};
  const ally={id:'blue_1',team:'blue',alive:true,pos:new V(20,0,20)};
  const player={team:'blue',alive:false,pos:new V(20,0,20)};
  const bots=[bot,ally];
  let walk=()=>true;
  const functions=new Function('THREE','bots','player','isPositionWalkable',
    helpers+'\nreturn {chooseBotCombatStrafeGoal,computeBotSteeringVelocity}')( {Vector3:V},
    bots,player,(...args)=>walk(...args));
  const pick=functions.chooseBotCombatStrafeGoal,move=functions.computeBotSteeringVelocity;
  let p=pick(bot,0);
  ok(p?.x===2.35&&p.z===0,'Concrete 2.35 m sidestep destination is selected');
  ok(bot.pos.x===0,'Selecting a destination does not teleport the soldier');
  walk=x=>x<=0;bot.strafeDir=1;p=pick(bot,0);
  ok(p?.x===-2.35,'Blocked preferred side selects a safe opposite side');
  walk=()=>false;bot.strafeDir=1;
  ok(pick(bot,0)===null,'Fully blocked corridor rejects sidestep');
  walk=()=>true;ally.pos=new V(2.35,0,0);bot.strafeDir=1;p=pick(bot,0);
  ok(p?.x<0,'Friendly soldier blocks occupied sidestep destination');
  ally.pos.y=4;bot.strafeDir=1;p=pick(bot,0);
  ok(p?.x>0,'Friendly soldier on another floor does not block destination');
  ally.pos.y=0;ally.team='red';bot.strafeDir=1;p=pick(bot,0);
  ok(p?.x>0,'Enemies do not count as friendly route occupancy');
  ally.team='blue';ally.alive=false;bot.strafeDir=1;p=pick(bot,0);
  ok(p?.x>0,'Dead teammates do not block active route');
  ally.alive=true;ally.pos=new V(20,0,20);
  player.alive=true;player.pos=new V(2.35,0,0);bot.strafeDir=1;p=pick(bot,0);
  ok(p?.x<0,'Live teammate player has right-of-way');
  player.pos.y=4;bot.strafeDir=1;p=pick(bot,0);
  ok(p?.x>0,'Player on upper floor cannot block lower-floor sidestep');
  player.alive=false;walk=x=>Math.abs(x)<1.1;bot.strafeDir=1;
  ok(pick(bot,0)===null,'Sampled route checks reject obstacles between start and goal');
  walk=()=>true;bot.moveVelX=0;bot.moveVelZ=0;
  const dest=new V(10,0,0);
  let v=move(bot,dest,5,5,0,.08);
  ok(v.x>0&&v.x<=1.001&&v.z===0,'Acceleration starts below class sprint speed');
  for(let i=0;i<20;i++)move(bot,dest,5,5,0,.08);
  ok(bot.moveVelX>=4.9&&bot.moveVelX<=5.01,'Sustained movement reaches but does not exceed 5m/s');
  v=move(bot,new V(-10,0,0),5,-5,0,.08);
  ok(v.x>0&&v.x<5,'Reversing direction brakes momentum before running backwards');
  for(let i=0;i<10;i++)move(bot,null,0,0,0,.08);
  ok(bot.moveVelX===0,'Idle soldier comes to a full stop');
  bot.pos.x=9.5;bot.moveVelX=0;
  for(let i=0;i<20;i++)move(bot,dest,5,5,0,.08,false);
  const slow=bot.moveVelX;bot.moveVelX=0;
  for(let i=0;i<20;i++)move(bot,dest,5,5,0,.08,true);
  ok(slow<3&&bot.moveVelX>=4.9,'Final waypoint slows, intermediate waypoint keeps flow');
  bot.moveVelX=0;bot.moveVelZ=0;
  v=move(bot,null,0,1,0,.08);
  ok(v.x>0&&v.x<=1,'Collision avoidance may nudge stationary soldier without sprinting');
  bot.moveVelX=0;bot.moveVelZ=0;bot.pos.x=0;
  v=move(bot,dest,5,5,0,.9);
  ok(v.x<=1.001,'Large dt spike is clamped for stable acceleration');
  bot.moveVelX=Number.NaN;bot.moveVelZ=Infinity;
  v=move(bot,dest,5,5,0,.08);
  ok(Number.isFinite(v.x)&&Number.isFinite(v.z),'Nonfinite stale velocity recovers safely');
  ok(bot.pos.x===0,'Steering never modifies bot coordinates directly');
  const respawn=html.slice(html.indexOf('      function respawnBot(bot) {'),
    html.indexOf('      // =========================================================================\n      // 10B.',html.indexOf('      function respawnBot(bot) {')));
  ok(respawn.includes('bot.moveVelX = 0;')&&respawn.includes('bot.moveVelZ = 0;')&&
    respawn.includes('bot.combatStrafeGoal = null;'),'Respawning resets speed and combat intent');
  ok((html.match(/moveVelX: 0,/g)||[]).length===2 &&
    (html.match(/combatStrafeGoal: null,/g)||[]).length===2,
    'Blue and Red bot slots both initialize movement memory');
  ok(html.includes('if (activeBotDrone) {\n            bot.moveVelX = 0;'),
    'Drone operator is held stationary during flight');
  ok(html.includes('const steer = computeBotSteeringVelocity(')&&
    html.includes('bot.pos.x += steer.x * dt;')&&
    html.includes('resolveHorizontalCollision(bot.pos, 0.42, 1.7);'),
    'Steering is integrated into existing real-world collision resolver');
  ok(html.includes('const isIntermediateWaypoint = !!(navNode && moveTargetPos'),
    'A-star path waypoints distinguish intermediate/terminal approach');
  ok(html.includes('bot.moveVelX = vx;')&&html.includes('bot.moveVelZ = vz;'),
    'Velocity is reconciled after wall collisions');
  ok(html.includes('Math.atan2(bot.moveVelX, bot.moveVelZ)')&&
    html.includes('bot.mesh.upperBody.position.y = 0.93;'),
    'Leg turn and breathing pose stay consistent with real motion');
  ok(html.includes('chooseBotCombatStrafeGoal(bot, desiredUpperYaw)')&&
    html.includes('const changedThreat = bot.combatStrafeTargetId !== bot.targetId;'),
    'Combat sidestep goal persists over multiple frames');
  ok(html.includes('aimSettleSec: 0.34')&&html.includes('isReactionReady && isAimSettled'),
    'Medium aim settle and firing gates remain unchanged');
  return out;
}
module.exports={runBotAiV36Regression};
if(require.main===module){
  const fs=require('node:fs'),path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const checks=runBotAiV36Regression(html);
  console.log('BOT AI V36 PASS ('+checks.length+' checks)');
  checks.forEach(name=>console.log('  ✓ '+name));
}
