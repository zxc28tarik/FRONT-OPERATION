'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      function botVisualStance('),b=html.indexOf('      function botVisualCombatPose(',a);
const stance=new Function(html.slice(a,b)+'\nreturn botVisualStance;')();
assert.equal(stance('assault',0,5,0,0,false).carry,0);
assert(stance('assault',0,5,0,0,true).carry>.95);
assert(stance('heavy',0,5,0,0,true).carry<stance('assault',0,5,0,0,true).carry);
assert(stance('heavy',0,0,0,0,true).stanceWidth>stance('sniper',0,0,0,0,true).stanceWidth);
const left=stance('assault',0,0,0,-4,true),right=stance('assault',0,0,0,4,true);
assert(left.turnLeft>left.turnRight&&right.turnRight>right.turnLeft);
assert.equal(stance('assault',0,0,1,4,true).turnRight,0);
for(const role of ['assault','heavy','sniper','medic','engineer'])for(const speed of [0,1,3,5,7])for(const crouch of [0,.5,1])for(const turn of [-9,-1,0,1,9]){
 assert(Object.values(stance(role,1,speed,crouch,turn,true)).every(Number.isFinite));
}
assert(html.includes('const quietCarry=!bestEnemy&&!foPriorityCombat&&!bot.botReload&&!(bot.muzzleTimer>0)'));
console.log('V122–V124 visual stance PASS: class profiles, carry gates, turning and crouch');
