'use strict';
// FRONT OPERATION V37 — observed tracking & readable fire; no WebGL dependency.
function runBotAiV37Regression(html){
  const passed=[],ok=(yes,why)=>{if(!yes)throw Error('V37 FAIL: '+why);passed.push(why)};
  const start=html.indexOf('      // V37: Track only visible');
  const end=html.indexOf('      // V33: Keep upper-body aim',start);
  if(start<0||end<=start)throw Error('V37 tracker source not found');
  const source=html.slice(start,end);
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  scripts.forEach(m=>new Function(m[1]));
  ok(scripts.length===3,'Three original game scripts still parse');
  class Vec3{
    constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
    clone(){return new Vec3(this.x,this.y,this.z)}
    copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
    set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
    subVectors(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this}
    length(){return Math.hypot(this.x,this.y,this.z)}
    multiplyScalar(n){this.x*=n;this.y*=n;this.z*=n;return this}
    lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this}
    addScaledVector(v,t){this.x+=v.x*t;this.y+=v.y*t;this.z+=v.z*t;return this}
    distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z)}
  }
  let random=0.15;
  const fakeMath=Object.create(Math);
  fakeMath.random=()=>random;
  const api=new Function('THREE','Math',source+
    '\nreturn {resetBotAimTracking,updateBotAimTracking,getBotAimTrackingFactor,getBotVisibleMissPoint}')(
    {Vector3:Vec3},fakeMath);
  const bot={difficulty:'normal',aimSettleTimer:0.22};
  const first={id:'red_1',eye:new Vec3(0,1.45,12)};
  let aim=api.updateBotAimTracking(bot,first,0.05);
  ok(aim!==first.eye&&aim.distanceTo(first.eye)===0,'Initial visible target snapshot is copied, not aliased');
  ok(bot.aimTrackTargetId==='red_1'&&bot.aimTrackSampleTimer===0.12,
    'Target acquisition initializes bounded observation cadence');
  ok(bot.aimTrackVelocity.length()===0,'First sighting never invents target velocity');
  first.eye.x=1.2;
  api.updateBotAimTracking(bot,first,0.06);
  aim=api.updateBotAimTracking(bot,first,0.06);
  ok(bot.aimTrackSeenEye.x===1.2,'Confirmed visible movement updates observed position');
  ok(bot.aimTrackVelocity.x>0 && bot.aimTrackVelocity.x<7.01,
    'Observed strafing estimates physically capped horizontal speed');
  ok(aim.x>0 && aim.x<2.3,'Lead smoothly follows moving opponent instead of instantly snapping');
  ok(api.getBotAimTrackingFactor(bot,first.eye)<1,
    'Lag behind moving target reduces hit probability');
  bot.aimTrackPoint.copy(first.eye);
  ok(api.getBotAimTrackingFactor(bot,first.eye)===1,
    'Properly tracked static target has no extra aim penalty');
  const frozen=bot.aimTrackPoint.clone();
  api.updateBotAimTracking(bot,null,0.04);
  ok(bot.aimTrackTargetId===null&&bot.aimTrackPoint===null&&
    bot.aimTrackSeenEye===null,'Loss of line-of-sight clears live tracking state');
  ok(frozen.x===1.2,'Previously sampled aim point does not mutate after sight is lost');

  const newEnemy={id:'red_2',eye:new Vec3(-4,1.45,10)};
  aim=api.updateBotAimTracking(bot,newEnemy,0.01);
  ok(bot.aimTrackTargetId==='red_2'&&aim.x===-4&&bot.aimTrackVelocity.length()===0,
    'Different target starts a fresh track without inherited lead');
  bot.aimTrackSeenEye.set(-4,1.45,10);bot.aimTrackPoint.set(-4,1.45,10);
  bot.aimTrackSampleTimer=0;bot.aimTrackElapsed=0.12;
  const teleport={id:'red_2',eye:new Vec3(40,1.45,10)};
  bot.aimSettleTimer=0.34;
  aim=api.updateBotAimTracking(bot,teleport,0.02);
  ok(aim.x===40&&bot.aimTrackVelocity.length()===0,
    'Observed teleport resets prediction rather than extrapolating the jump');
  ok(bot.aimSettleTimer===0,'Target teleport forces medium aim dwell to restart');
  const stable={id:'red_2',eye:new Vec3(40,1.45,10)};
  api.updateBotAimTracking(bot,stable,0.08);
  ok(bot.aimTrackPoint.x===40,'Stationary target remains still after reacquisition');
  stable.eye.x=40.18;
  api.updateBotAimTracking(bot,stable,0.08);
  ok(bot.aimTrackVelocity.x>0&&bot.aimTrackVelocity.x<7,
    'Small observed movement cannot generate unlimited tracking velocity');

  const botEye=new Vec3(0,1.45,0),target=new Vec3(0,1.45,15);
  random=0.1;
  let miss=api.getBotVisibleMissPoint(botEye,target,new Vec3(40,1.45,15),15);
  ok(Math.hypot(miss.x-target.x,miss.z-target.z)>=0.98,
    'Right-angle miss clears the target body despite extreme stale prediction');
  random=0.85;
  const other=api.getBotVisibleMissPoint(botEye,target,new Vec3(-40,1.45,15),15);
  ok(Math.hypot(other.x-target.x,other.z-target.z)>=0.98,
    'Opposite-side miss also clears the target body');
  ok(miss.x*other.x<0,'Miss tracers can deviate on either side of the opponent');
  ok(target.x===0&&target.z===15,'Tracer construction never modifies target eye coordinates');
  random=0.5;
  miss=api.getBotVisibleMissPoint(botEye,target,null,30);
  ok(Number.isFinite(miss.x)&&Number.isFinite(miss.y)&&Number.isFinite(miss.z),
    'Miss tracer safely handles missing tracked point');
  const resetBot={aimTrackTargetId:'red',aimTrackPoint:new Vec3(3,0,0),
    aimTrackSeenEye:new Vec3(3,0,0),aimTrackVelocity:new Vec3(1,0,0),
    aimTrackSampleTimer:0.2,aimTrackElapsed:1};
  api.resetBotAimTracking(resetBot);
  ok(resetBot.aimTrackTargetId===null&&resetBot.aimTrackPoint===null&&
    resetBot.aimTrackSampleTimer===0&&resetBot.aimTrackElapsed===0,
    'Reset method clears tracked target and cached velocity state');

  ok(!source.includes('getLiveEntitySnapshot(')&&
    !source.includes('getSharedTeamSighting('),
    'Aim tracker has no route to hidden enemy positions or squad intel coordinates');
  ok(html.includes('const trackedEnemyEye = updateBotAimTracking(bot, bestEnemy, dt);')&&
    html.includes('desiredUpperYaw = Math.atan2(trackedEnemyEye.x - bot.pos.x, trackedEnemyEye.z - bot.pos.z);'),
    'Live upper-body aim follows observed smoothed target, not exact instantaneous target');
  ok(html.includes('getBotAimTrackingFactor(bot, bestEnemy.eye)')&&
    html.includes('skill.accuracyScale * trackingFactor * movementFactor * burstFactor'),
    'Actual shot probability uses tracking error, movement and burst stability');
  ok(html.includes('getBotVisibleMissPoint(botEye, bestEnemy.eye, trackedEnemyEye, distToEnemy)')&&
    html.includes('? bestEnemy.eye.clone()'),
    'Visual shot endpoint agrees with actual hit/miss outcome');
  ok((html.match(/aimTrackTargetId: null,/g)||[]).length===2&&
    html.includes('resetBotAimTracking(bot);'),
    'Both bot teams and respawn/perception paths reset target tracking');
  ok(html.includes("if (isReactionReady && isAimSettled && canShootFromStance && fireLaneClear && aimAligned")&&
    html.includes('isBotFireLaneClear(bot, bestEnemy.eye)'),
    'Previously approved reaction, medium aim, safe fire lane requirements remain');
  ok(html.includes('const dmg = Math.round(bw.damage * 0.72);')&&
    html.includes("bot.fireTimer = (60 / bw.rpm) *"),
    'Original weapon damage and firing-rate equations are unchanged');
  ok(html.includes('aimSettleSec: 0.34')&&
    (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
    'Normal, Hard and Expert all retain medium 0.34 second aim dwell');
  ok(html.includes('return index % 15 === 14')&&
    html.includes("const BOT_DIFFICULTY_SEQUENCE = ['normal', 'hard', 'normal', 'hard', 'normal']"),
    'User-approved 3 Normal 2 Hard and fifteenth-Expert schedule remains');
  return passed;
}
module.exports={runBotAiV37Regression};
if(require.main===module){
  const fs=require('node:fs'),path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const checks=runBotAiV37Regression(html);
  console.log('BOT AI V37 PASS ('+checks.length+' checks)');
  checks.forEach(x=>console.log('  ✓ '+x));
}
