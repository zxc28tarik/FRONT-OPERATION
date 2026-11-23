'use strict';
// V35 deterministic scenarios. Run: node tests/bot_ai_v35_regression.cjs
function runBotAiV35Regression(html){
 const results=[],ok=(yes,title)=>{if(!yes)throw Error('V35 FAIL: '+title);results.push(title)};
 const between=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);if(i<0||j<i)throw Error('Missing source '+a);return html.slice(i,j)};
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 scripts.forEach(m=>new Function(m[1]));
 ok(scripts.length===3,'All three game scripts still parse');
 const config=between('      const BOT_DIFFICULTY_SEQUENCE = ','      const NAV_NODES = ');
 const p=new Function(config+'\nreturn {spawn:chooseBotDifficultyForSpawn,profile:getBotSkillProfile,reset:()=>{botLifeSequence=0},counter:()=>botLifeSequence}')();
 const all=Array.from({length:90},()=>p.spawn());
 const count=(arr,d)=>arr.filter(x=>x===d).length;
 for(let g=0;g<6;g++){
  const five=all.slice(g*5,g*5+5),expert=g%3===2;
  ok(count(five,'normal')===(expert?2:3)&&count(five,'hard')===2&&
   count(five,'expert')===(expert?1:0),'Five-life group '+(g+1)+' keeps 3 Normal 2 Hard (Expert replaces Normal)');
 }
 for(let g=0;g<6;g++){
  const fifteen=all.slice(g*15,g*15+15);
  ok(count(fifteen,'normal')===8&&count(fifteen,'hard')===6&&count(fifteen,'expert')===1,
   'Fifteen-life group '+(g+1)+' contains exactly one Expert');
 }
 ok(count(all.slice(0,5),'normal')===3&&count(all.slice(0,5),'hard')===2,
  'Blue team starts with three Normal and two Hard bots');
 ok(count(all.slice(5,10),'normal')===3&&count(all.slice(5,10),'hard')===2,
  'First five Red team bots also contain three Normal and two Hard');
 ok(all.slice(0,14).every(x=>x!=='expert')&&all[14]==='expert',
  'Expert replaces Normal on life 15 of each 15-life block');
 p.reset();ok(p.counter()===0&&p.spawn()==='normal','New match resets the life cycle');
 const skill=['normal','hard','expert'].map(d=>p.profile({difficulty:d}));
 ok(skill.every(x=>x.aimSettleSec===0.34),
  'Normal, Hard and Expert all have equal medium aim-settle of 0.34 sec');
 ok(skill[0].reactionScale>skill[1].reactionScale&&skill[1].reactionScale>skill[2].reactionScale,
  'Reaction delay is ordered Normal > Hard > Expert');
 ok(skill[0].accuracyScale<skill[1].accuracyScale&&skill[1].accuracyScale<skill[2].accuracyScale&&
  skill[2].accuracyScale<1.3,'Precision increases modestly without a large advantage');
 ok(p.profile({difficulty:'invalid'})===skill[0],'Unknown difficulty falls back to Normal');
 const reactionSrc=between('      function computeReactionDelay(','      function scoreEnemyCandidate(');
 const reaction=new Function('getBotSkillProfile',reactionSrc+'\nreturn computeReactionDelay;')(p.profile);
 const del=['normal','hard','expert'].map(d=>reaction({difficulty:d,classId:'assault',alertTimer:0},{dist:20,angleRad:0.5}));
 ok(del[0]>del[1]&&del[1]>del[2]&&del[2]>0.1,'Reaction time scales on identical threats');
 const aimSrc=between('          const bestEnemy = bot.visibleEnemy;','          if (!bestEnemy) {');
 const tick=new Function('bot','dt','getBotSkillProfile','isBotAimAligned',
  aimSrc+'\nreturn {ready:isAimSettled,reacted:isReactionReady,elapsed:bot.aimSettleTimer};');
 for(const difficulty of ['normal','hard','expert']){
  const bot={difficulty,visibleEnemy:{eye:{x:0,y:1,z:12}},
   reactionTimer:0.6,reactionRequired:0.1,aimSettleTimer:0};
  const outcomes=Array.from({length:4},()=>tick(bot,0.10,p.profile,()=>true).ready);
  ok(outcomes.join(',')==='false,false,false,true',difficulty+' needs medium aim dwell before shooting');
  tick(bot,0.01,p.profile,()=>false);
  ok(bot.aimSettleTimer===0,difficulty+' loses aim lock after excessive turning');
  bot.visibleEnemy=null;tick(bot,0.1,p.profile,()=>true);
  ok(bot.aimSettleTimer===0,difficulty+' cannot aim at invisible targets');
  bot.visibleEnemy={eye:{x:0,y:1,z:12}};bot.reactionTimer=0;
  tick(bot,0.1,p.profile,()=>true);
  ok(bot.aimSettleTimer===0,difficulty+' cannot accumulate aim before reacting');
 }
 ok((html.match(/difficulty: chooseBotDifficultyForSpawn\(\)/g)||[]).length===2,
  'Both bot teams receive difficulty at creation');
 ok(html.includes('bot.difficulty = chooseBotDifficultyForSpawn();')&&
  html.includes('botLifeSequence = 0;'),'Every respawn counts and a new match restarts cycle');
 ok(html.includes('isReactionReady && isAimSettled && canShootFromStance && fireLaneClear')&&
  html.includes('isReactionReady && isAimSettled && bot.abilityCooldown <= 0'),
  'Guns and offensive class abilities both require medium settled aim');
 ok(html.includes('skill.accuracyScale')&&
  html.includes('Math.min(0.75, classAcc * distFactor * targetEvasion *'),
  'Shot precision uses skill profile and is capped');
 ok(html.includes('const dmg = Math.round(bw.damage * 0.72);')&&
  html.includes('bot.fireTimer = (60 / bw.rpm) *'),
  'Existing damage and fire rate remain unchanged');
 ok((html.match(/aimSettleTimer: 0,/g)||[]).length===2&&
  html.includes('bot.aimSettleTimer = 0;'),'Aim timers initialize for both teams and on respawn');
 ok(html.includes("const CLASS_ORDER = ['assault', 'medic', 'engineer', 'sniper', 'heavy'];"),
  'Expert is difficulty, not new soldier class');
 return results;
}
module.exports={runBotAiV35Regression};
if(require.main===module){
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 const checks=runBotAiV35Regression(html);
 console.log('BOT AI V35 PASS ('+checks.length+' checks)');
 checks.forEach(c=>console.log('  ✓ '+c));
}
