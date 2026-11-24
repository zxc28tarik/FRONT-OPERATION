'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      function botVisualGait('),b=html.indexOf('      // V58:',a);
const gait=new Function(html.slice(a,b)+'\nreturn botVisualGait;')();
const f=gait(Math.PI/2,4,1,0,0,'assault'),back=gait(Math.PI/2,4,-1,0,0,'assault'),side=gait(Math.PI/2,4,0,1,0,'assault');
assert(f.leftHip>0&&f.rightHip<0);assert.equal(back.leftHip,-f.leftHip);assert.equal(side.leftHip,0);assert(side.leftSide>side.rightSide);
assert(gait(Math.PI/2,4,1,0,0,'heavy').leftHip<f.leftHip);
assert(gait(Math.PI/2,4,1,0,1,'assault').leftHip<f.leftHip);
assert(gait(Math.PI/2,4,1,0,1,'assault').leftKnee>f.leftKnee);
for(const phase of [0,1,2,3,4,5,6])for(const speed of [0,1,2,4,6])for(const cls of ['assault','sniper','heavy','medic','engineer']){
 const p=gait(phase,speed,.7,.7,.4,cls);assert(Object.values(p).every(Number.isFinite));assert(p.leftKnee>=0&&p.rightKnee>=0);
}
console.log('V103 gait PASS: forward/reverse/lateral, crouch, class weighting, bounded finite angles');
