'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      function botVisualGroundMotion('),b=html.indexOf('      function botVisualCombatPose(',a);
const motion=new Function(html.slice(a,b)+'\nreturn botVisualGroundMotion;')();
const flat=motion(1,4,1,0,0,0,'assault'),up=motion(1,4,1,0,0,.5,'assault'),down=motion(1,4,1,0,0,-.5,'assault');
assert(up.rightKnee>flat.rightKnee);assert(up.leftHip>flat.leftHip);assert(down.leftHip<flat.leftHip);
assert.equal(motion(1,0,1,0,0,.5,'assault').leftFoot,0);
assert(motion(1,4,1,0,1,0,'assault').bob<flat.bob||Math.abs(motion(1,4,1,0,1,0,'assault').bob)<Math.abs(flat.bob));
for(const phase of [0,1,2,3,4,5,6])for(const speed of [0,1,4,7])for(const grade of [-4,-.5,0,.5,4])for(const c of [0,.5,1]){
 const p=motion(phase,speed,.8,.4,c,grade,'heavy');assert(Object.values(p).every(Number.isFinite));assert(Math.abs(p.leftFoot)<.4&&Math.abs(p.rightFoot)<.4);
}
console.log('V132–V134 terrain gait PASS: flat, uphill, downhill, stationary and crouch');
