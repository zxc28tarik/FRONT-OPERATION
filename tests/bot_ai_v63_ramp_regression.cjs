'use strict';
const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      function getFloorHeightAt('),b=html.indexOf('      function hasLineOfSight(',a);
const ramps=[{minX:-7.3,maxX:-4.7,zStart:26.5,zEnd:19,yStart:0,yEnd:3.62},{minX:4.7,maxX:7.3,zStart:-26.5,zEnd:-19,yStart:0,yEnd:3.62}];
const colliders=[{minX:-7.4,maxX:-4.6,minZ:15.1,maxZ:19.3,minY:3.39,maxY:3.71},{minX:4.6,maxX:7.4,minZ:-19.3,maxZ:-15.1,minY:3.39,maxY:3.71}];
const api=new Function('mapRamps','mapColliders','foWorldX','foWorldZ',html.slice(a,b)+'\nreturn {floor:getFloorHeightAt,collision:resolveHorizontalCollision,step:tryRampLandingStep};')(ramps,colliders,x=>x,z=>z);
let n=0;const ok=(v,s)=>{if(!v)throw Error('V63 FAIL '+s);n++};
for(const sign of [-1,1]){
 const pos={x:sign*6,y:0,z:-sign*26.5};
 for(let i=0;i<160;i++){
  if(Math.abs(pos.z)>18.2)pos.z+=sign*.12;
  api.collision(pos,.42,1.7);
  const floor=api.floor(pos.x,pos.z,pos.y+.45);
  pos.y=pos.y<floor?Math.min(floor,pos.y+.375):Math.max(floor,pos.y-.08);
 }
 ok(Math.abs(pos.z)<18.35&&pos.y>=3.6,'Walk up ramp and across actual landing '+sign);
}
const low={x:-6,y:0,z:19.2};api.step(low,.42,ramps,colliders);ok(low.y===0,'No climb from beneath deck');
const side={x:-8,y:3.3,z:19.2};api.step(side,.42,ramps,colliders);ok(side.y===3.3,'No climb outside ramp');
const wall={x:-6,y:3.3,z:19.2};api.step(wall,.42,ramps,[{...colliders[0],minY:0}]);ok(wall.y===3.3,'No thick-wall step');
const outside={x:-6,y:3.3,z:20.4};api.step(outside,.42,ramps,colliders);ok(outside.y===3.3,'No jump far from landing');
console.log('BOT AI V63 RAMP PASS ('+n+' checks)');
