import fs from 'node:fs';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import * as THREE from 'three';
import {createExperimentalRig} from '../modules/experimental/v188-skin-rig.mjs';
const html=fs.readFileSync('index.html','utf8');
const a=html.indexOf('      let SOLDIER_SHARED = null;'),b=html.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
const api=new Function('THREE',html.slice(a,b)+'\nreturn {enhanced:createEnhancedBotSoldierMesh};')(THREE);
let cases=0,maxRestError=0;
const reps=[];
for(const team of ['blue','red'])for(const cls of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
 const m=api.enhanced(team,cls,variant),r=createExperimentalRig(m);
 assert.equal(r.bones.length,8);assert.equal(r.mesh.visible,false);
 const p=r.geometry.getAttribute('position'),w=r.geometry.getAttribute('skinWeight'),idx=r.geometry.getAttribute('skinIndex');
 for(let i=0;i<p.count;i++){
  assert(Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1)<1e-6);
  assert(idx.getX(i)<8&&idx.getY(i)<8);
  const v=new THREE.Vector3().fromBufferAttribute(p,i),deformed=v.clone();
  r.mesh.boneTransform(i,deformed);
  maxRestError=Math.max(maxRestError,v.distanceTo(deformed));
 }
 assert(maxRestError<.0001,'bind pose equivalence');
 const muzzle=m.muzzleFlash.position.clone();
 for(const angle of [0,.45,Math.PI/2,-.65]){
  m.leftHip.rotation.x=angle*.5;m.rightHip.rotation.x=-angle*.5;
  m.leftKnee.rotation.x=angle;m.rightKnee.rotation.x=angle*.6;
  m.weaponPivot.rotation.x=angle*.6;m.updateVisualGrip(angle*.6);
  m.root.position.set(3,0,-2);m.root.rotation.y=angle;r.update();
  for(let i=0;i<p.count;i+=7){
   const v=new THREE.Vector3().fromBufferAttribute(p,i);r.mesh.boneTransform(i,v);
   assert(v.toArray().every(Number.isFinite));assert(v.length()<3);
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
console.log(JSON.stringify({cases,bones:8,maxRestError,cpuMsPerFrame15Bots:elapsed/frames,vertices:reps[0].r.geometry.getAttribute('position').count,triangles:reps[0].r.geometry.index.count/3,gpuAcceptance:'NOT_MEASURED'},null,2));
for(const {r} of reps)r.dispose();
