'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      function botVisualCombatPose('),b=html.indexOf('      function updateBots(dt)',a);
const api=new Function(html.slice(a,b)+'\nreturn {pose:botVisualCombatPose,fall:botVisualFall};')();
assert.equal(api.pose(0,0,0,'assault').reload,0);
assert.equal(api.pose(.055,0,0,'sniper').kick,1);
assert(api.pose(.055,0,0,'heavy').kick<1);
assert.equal(api.pose(0,2,2,'assault').reload,0);
assert(api.pose(0,1,2,'assault').reload>.9&&api.pose(0,1,2,'assault').swap>.9);
assert.equal(api.pose(0,0,2,'assault').reload,0);
assert.equal(api.fall(0,1).drop,0);
assert.equal(api.fall(1,1).drop,.45);
assert(api.fall(.5,-1).roll<0&&api.fall(.5,1).knee>0);
for(let i=0;i<=100;i++){
 const p=api.pose(i*.001,2-i*.02,2,'assault');
 assert(Object.values(p).every(v=>Number.isFinite(v)&&v>=0&&v<=1));
}
console.log('V114–V116 visual curves PASS');
