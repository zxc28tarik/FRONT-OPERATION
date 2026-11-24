'use strict';
// V47: safe-cover retention when the visible enemy changes or is reacquired.
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
let checks=0;
const ok=(yes,name)=>{if(!yes)throw Error('V47 TARGET COVER FAIL: '+name);checks++;console.log('  ✓ '+name);};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
scripts.forEach(s=>new Function(s[1]));
ok(scripts.length===3,'The original three game scripts parse');
const from=html.indexOf('      // V47: Reacquiring a target should not discard');
const to=html.indexOf('      function updateBotPerception(bot, dt, targetClaimCounts)',from);
ok(from>0&&to>from,'Actual cover-retention helper extracted from gameplay');
class Vec{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}}
let obstructed=true;
const nodes=[{x:-6,y:0,z:3},{x:14,y:0,z:8}];
const preserve=new Function('botAiClockSec','THREE','NAV_NODES','hasLineOfSight',
  html.slice(from,to)+'\nreturn isCoverSafeForNewVisibleTarget;')(
  4,{Vector3:Vec},nodes,()=>!obstructed);
const bot={
  pos:new Vec(0,0,0),coverNode:0,coverPhase:'MOVE_TO_COVER',
  targetId:'enemy_1',targetLockTimer:1.7,aimSettleTimer:0.21
};
const enemy={id:'enemy_2',pos:new Vec(25,0,0),eye:new Vec(25,1.45,0)};
ok(preserve(bot,enemy),'Cover retained when crouched position is concealed from the newly seen enemy');
ok(bot.coverNode===0&&bot.targetId==='enemy_1',
  'Helper does not modify cover, target ID or aim timing');
obstructed=false;
ok(!preserve(bot,enemy),'Fully exposed crouched location forces replacement');
obstructed=true;
ok(!preserve(bot,{...enemy,pos:new Vec(8.9,0,0)}),
  'Threat closer than nine metres overrides old cover');
ok(preserve(bot,{...enemy,pos:new Vec(9,0,0)}),
  'At exactly nine metres, protected cover may be retained');
bot.coverNode=-1;
ok(!preserve(bot,enemy),'No assigned cover must be re-evaluated');
bot.coverNode=0;bot.coverPhase='NONE';
ok(!preserve(bot,enemy),'Inactive cover phase cannot preserve a stale node');
bot.coverPhase='PEEK_FIRE';
ok(preserve(bot,enemy),'Active peek cover can be retained against concealed target');
bot.coverPhase='CROUCH_HOLD';
ok(preserve(bot,enemy),'Crouched cover can be retained against concealed target');
bot.coverPhase='MOVE_TO_COVER';
ok(!preserve(bot,null),'Missing new enemy requires conservative replacement');
ok(!preserve(bot,{id:'invalid'}),'Missing enemy geometry requires conservative replacement');
bot._coverAudit={node:0,arrived:false,since:1,lastProgressAt:1};
ok(!preserve(bot,enemy),'Unproductive approach cannot retain old cover indefinitely');
bot._coverAudit.lastProgressAt=3.7;
ok(preserve(bot,enemy),'Recently progressing approach can retain covered destination');
bot._coverAudit.since=-3;
ok(!preserve(bot,enemy),'Seven-second stale approach expires even if recent movement occurs');
bot._coverAudit.node=1;
ok(preserve(bot,enemy),'Audit for another node cannot falsely invalidate current cover');
delete bot._coverAudit;
bot.coverNode=99;
ok(!preserve(bot,enemy),'Unknown cover node cannot be trusted');
bot.coverNode=0;
ok(!preserve(null,enemy),'Missing soldier never yields false safe-cover claim');
const perception=html.slice(to,html.indexOf('      // =========================================================================\n      // 11.',to));
ok(perception.includes("if (!isCoverSafeForNewVisibleTarget(bot,bestCand)) {")&&
  perception.includes("recordBotMetric(bot,'coverRetentions');"),
  'Live target replacement condition uses actual cover safety and measures retention');
ok(perception.includes('bot.coverNode = -1;')&&
  perception.includes("bot.coverPhase = 'NONE';"),
  'Unsafe cover retains original reset behavior');
ok(perception.includes('bot.targetLockTimer = 2.4;') &&
  perception.includes('bot.aimSettleTimer = 0;') &&
  perception.includes('resetBotAimTracking(bot);'),
  'Original target lock and medium aim reset remain unchanged');
ok(html.includes("'coverRetentions'")&&
  html.includes('function shouldKeepApproachingCover(bot, threatPos, nowSec)'),
  'Cover retention, progress commitment and original aim system are integrated');
ok(html.includes('return index % 15 === 14') &&
  (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
  'Difficulty cycle and all three medium aim durations stay unchanged');
console.log('BOT AI V47 TARGET COVER PASS ('+checks+' checks)');
