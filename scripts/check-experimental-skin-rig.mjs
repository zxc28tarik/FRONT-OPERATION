import fs from 'node:fs';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import * as THREE from 'three';
import {createExperimentalRig,rigCenter,createAdaptiveRigController} from '../modules/experimental/v188-skin-rig.mjs';
const html=fs.readFileSync('index.html','utf8');
const a=html.indexOf('      let SOLDIER_SHARED = null;'),b=html.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
const api=new Function('THREE',html.slice(a,b)+'\nreturn {enhanced:createEnhancedBotSoldierMesh};')(THREE);
let cases=0,maxRestError=0,minRingRatio=Infinity,maxRingRatio=0,maxCenterError=0,maxLongitudinalRatio=0;const longitudinal=[];
const reps=[];
// Independent distance hysteresis, staggering and reversibility checks.
{
 let enabled=false,updates=0;
 const mock={setEnabled(v){enabled=v;if(v)updates++;},update(){updates++;}};
 const c=createAdaptiveRigController(mock);
 assert.equal(c.step(60,0),'far');assert.equal(enabled,false);
 assert.equal(c.step(20,1),'near');assert.equal(enabled,true);
 assert.equal(c.step(24,2),'near');
 assert.equal(c.step(26,3),'mid');
 const mid=updates;c.step(32,4);c.step(32,5);assert.equal(updates-mid,1);
 assert.equal(c.step(46,6),'mid');assert.equal(c.step(49,7),'far');assert.equal(enabled,false);
 assert.equal(c.step(44,8),'far');assert.equal(c.step(40,9),'mid');
 c.reset();assert(!enabled&&c.mode==='far');
}
// Curve endpoints and straight-segment midpoint are independent reference checks.
const line=[new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,2,0)];
for(const t of [0,.34,.5,.66,1])assert(rigCenter(line,t).distanceTo(new THREE.Vector3(0,2*t,0))<1e-8);
for(const team of ['blue','red'])for(const cls of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
 const m=api.enhanced(team,cls,variant),r=createExperimentalRig(m);
 assert.equal(r.bones.length,45);assert.equal(r.mesh.visible,false);assert.equal(r.mesh.parent,null);
 const p=r.geometry.getAttribute('position'),w=r.geometry.getAttribute('skinWeight'),idx=r.geometry.getAttribute('skinIndex');
 const normals=r.geometry.getAttribute('normal');
 assert.equal(r.mesh.material.length,2);assert.equal(r.geometry.groups.length,2);
 assert.equal(r.geometry.groups.reduce((sum,g)=>sum+g.count,0),r.geometry.index.count);
 assert(normals.array.every(Number.isFinite));
 // Verify duplicated UV-seam positions and their repaired normals.
 const stride=25*17+2;
 for(let limb=0;limb<5;limb++)for(let ring=0;ring<25;ring++){
  const i=limb*stride+ring*17,j=i+16;
  const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,j);
  assert(a.distanceTo(b)<1e-6);
  a.fromBufferAttribute(normals,i);b.fromBufferAttribute(normals,j);assert(a.distanceTo(b)<1e-6);
 }
 for(let i=0;i<p.count;i++){
  assert(Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1)<1e-6);
  assert([idx.getX(i),idx.getY(i),idx.getZ(i),idx.getW(i)].every(x=>x>=0&&x<r.bones.length));
  const v=new THREE.Vector3().fromBufferAttribute(p,i),deformed=v.clone();
  r.mesh.boneTransform(i,deformed);
  maxRestError=Math.max(maxRestError,v.distanceTo(deformed));
 }
 assert(maxRestError<.0001,'bind pose equivalence');
 const muzzle=m.muzzleFlash.position.clone();
 r.setEnabled(true);assert(r.mesh.visible&&m.head.visible&&m.weaponPivot.visible&&r.mesh.parent===m.root&&r.enabled);
 const cloth=[],bridges=[];m.root.traverse(n=>{if(n.userData.v129Sculpted)cloth.push(n);if(['hip','shoulder'].includes(n.userData.v154Joint))bridges.push(n);});
 assert.equal(bridges.length,4);assert(bridges.every(n=>n.visible),'proximal bridges must remain');
 assert(cloth.length===10&&cloth.every(n=>!n.visible));
 r.setEnabled(false);assert(!r.mesh.visible&&cloth.every(n=>n.visible)&&r.mesh.parent===null&&!r.enabled);
 for(const angle of [0,.45,Math.PI/2,-.65]){
  m.leftHip.rotation.x=angle*.5;m.rightHip.rotation.x=-angle*.5;
  m.leftKnee.rotation.x=angle;m.rightKnee.rotation.x=angle*.6;
  m.upperBody.rotation.y=angle*.35;m.upperBody.rotation.x=angle*.12;
  m.weaponPivot.rotation.x=angle*.6;m.updateVisualGrip(angle*.6);
  m.root.position.set(3,0,-2);m.root.rotation.y=angle;r.update();
  for(let i=0;i<p.count;i+=7){
   const v=new THREE.Vector3().fromBufferAttribute(p,i);r.mesh.boneTransform(i,v);
   assert(v.toArray().every(Number.isFinite));assert(v.length()<3);
  }
  // Root-local fast path must match independent world-transform reference.
  m.root.updateMatrixWorld(true);
  const inverse=new THREE.Matrix4().copy(m.root.matrixWorld).invert();
  for(const limb of r.limbs){if(!limb.nodes)continue;const points=limb.points();for(let j=0;j<3;j++)assert(points[j].distanceTo(new THREE.Vector3().setFromMatrixPosition(limb.nodes[j].matrixWorld).applyMatrix4(inverse))<1e-7);}
  // Quantify ring compression during bends. Preserve a finite noncollapsed ring.
  for(let limb=0;limb<5;limb++)for(const ring of [9,12,15]){
   let rest=0,deformed=0;
   for(let k=0;k<16;k++){
    const i=limb*stride+ring*17+k,j=i+1;
    const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,j);
    rest+=a.distanceTo(b);r.mesh.boneTransform(i,a);r.mesh.boneTransform(j,b);deformed+=a.distanceTo(b);
   }
   const ratio=deformed/rest;
   assert(Number.isFinite(ratio)&&ratio>.98&&ratio<1.02,'V216 ring radius changed '+ratio);
   minRingRatio=Math.min(minRingRatio,ratio);maxRingRatio=Math.max(maxRingRatio,ratio);
  }
  // Rings must also follow the intended centerline; preserving circumference alone is insufficient.
  for(let limb=0;limb<5;limb++){
   const points=r.limbs[limb].points();
   for(let ring=0;ring<25;ring++){
    const i=limb*stride+ring*17,t=ring/24,seg=t<=.5?0:1,u=seg===0?t*2:(t-.5)*2;
    const expected=rigCenter(points,t),center=new THREE.Vector3();
    for(let k=0;k<16;k++){const v=new THREE.Vector3().fromBufferAttribute(p,i+k);r.mesh.boneTransform(i+k,v);center.add(v);}
    center.multiplyScalar(1/16);
    const error=center.distanceTo(expected);maxCenterError=Math.max(maxCenterError,error);
    assert(error<.0002,'ring center drift '+error);
    if(ring<24)for(let k=0;k<16;k++){
     const a=new THREE.Vector3().fromBufferAttribute(p,i+k),b=new THREE.Vector3().fromBufferAttribute(p,i+k+17),rest=a.distanceTo(b);
     if(rest<.002)continue;
     r.mesh.boneTransform(i+k,a);r.mesh.boneTransform(i+k+17,b);
     const stretch=a.distanceTo(b)/rest;assert(Number.isFinite(stretch));maxLongitudinalRatio=Math.max(maxLongitudinalRatio,stretch);longitudinal.push(stretch);
    }
   }
  }
  assert(m.muzzleFlash.position.equals(muzzle));
 }
 if(reps.length<15)reps.push({m,r});else r.dispose();
 cases++;
}
// CPU pose update diagnostic; not a GPU frame time acceptance gate.
const frames=120,run=()=>{for(let i=0;i<frames;i++)for(const {m,r} of reps){
 const phase=i*.12;m.leftKnee.rotation.x=Math.sin(phase)*.55;
 m.rightKnee.rotation.x=Math.cos(phase)*.55;r.update();
}};
run();const start=performance.now();run();const elapsed=performance.now()-start;
longitudinal.sort((a,b)=>a-b);const p95LongitudinalRatio=longitudinal[Math.floor(longitudinal.length*.95)];
assert(p95LongitudinalRatio<1.10,'p95 stretch regression');assert(maxLongitudinalRatio<1.45,'maximum stretch regression');
console.log(JSON.stringify({cases,bones:45,p95LongitudinalRatio,maxRestError,minRingRatio,maxRingRatio,maxCenterError,maxLongitudinalRatio,cpuMsPerFrame15Bots:elapsed/frames,vertices:reps[0].r.geometry.getAttribute('position').count,triangles:reps[0].r.geometry.index.count/3,gpuAcceptance:'NOT_MEASURED'},null,2));
for(const {r} of reps)r.dispose();
