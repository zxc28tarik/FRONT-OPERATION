import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const source=fs.readFileSync('index.html','utf8');
const baseline=fs.readFileSync(process.env.FO_V287_BASELINE,'utf8');
const cut=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return s.slice(i,j);};
const rig=s=>cut(s,'      let SOLDIER_SHARED = null;','      // =========================================================================\n      // 8. COLLISION');
assert.equal(rig(source),rig(baseline),'approved V287 model factory must be identical');
const fn=(s,n)=>cut(s,'      function '+n+'(','\n      }')+'\n      }';
const contracts=['botVisualGait','botVisualStance','botVisualGroundMotion','botVisualTransition','botVisualFootPlants','botVisualLegContact','botVisualDirection','botVisualCombatPose','botVisualFall'];
for(const name of contracts)assert.equal(fn(source,name),fn(baseline,name),name+' changed from V287');
const factory=s=>new Function('THREE',rig(s)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
const old=factory(baseline),now=factory(source);
const pose=n=>[...n.position.toArray(),n.rotation.x,n.rotation.y,n.rotation.z,...n.scale.toArray()];
const nodes=root=>{const a=[];root.traverse(n=>a.push(n));return a;};
const visibleStats=root=>{let meshes=0,triangles=0;const walk=(n,parentVisible)=>{const on=parentVisible&&n.visible;if(on&&n.isMesh){meshes++;triangles+=(n.geometry.index?.count??n.geometry.getAttribute('position').count)/3;}for(const c of n.children)walk(c,on);};walk(root,true);return {meshes,triangles};};
const roles=['assault','medic','engineer','sniper','heavy'];
const pivots=['root','upperBody','head','leftHip','rightHip','leftKnee','rightKnee','weaponPivot','muzzleFlash'];
const cases=[];
for(const team of ['blue','red'])for(const role of roles)for(let variant=0;variant<3;variant++){
 const a=old(team,role,variant),b=now(team,role,variant);
 const x=nodes(a.root),y=nodes(b.root);
 assert.equal(x.length,y.length);
 for(let i=0;i<x.length;i++){
  assert.equal(x[i].name,y[i].name);assert.equal(x[i].type,y[i].type);
  assert.deepEqual(pose(x[i]),pose(y[i]));assert.equal(x[i].visible,y[i].visible);
  if(x[i].isMesh){
   assert.deepEqual(x[i].geometry.getAttribute('position').array,y[i].geometry.getAttribute('position').array);
   assert.deepEqual(x[i].geometry.index?.array,y[i].geometry.index?.array);
   assert.equal(x[i].material?.name,y[i].material?.name);
  }
 }
 for(const key of pivots){assert(a[key]&&b[key],key);assert.deepEqual(pose(a[key]),pose(b[key]));}
 const near=visibleStats(b.root),lod=[];
 for(const dist of [8,25,60,8]){
  a.setVisualDetailDistance(dist);b.setVisualDetailDistance(dist);
  const sa=visibleStats(a.root),sb=visibleStats(b.root);
  assert.deepEqual(sa,sb);assert.equal(a.visualDetailLevel,b.visualDetailLevel);lod.push({dist,level:b.visualDetailLevel,...sb});
 }
 assert.deepEqual(lod[0],lod[3]);assert(lod[2].triangles<lod[0].triangles,'far LOD has no saving');
 cases.push({team,role,variant,nodes:y.length,pivots:pivots.length,near,lod});
}
assert.equal(cases.length,30);
const oldGait=new Function(fn(baseline,'botVisualGait')+';return botVisualGait;')();
const liveGait=new Function(fn(source,'botVisualGaitV291')+';return botVisualGaitV291;')();
const motion=new Function(fn(source,'botVisualGroundMotion')+';return botVisualGroundMotion;')();
const rows=[];let samples=0;
for(const role of roles)for(const speed of [.45,1.2,2.1,2.8,3.5,4.5,5.1,6.8]){
 let hipPeak=0,kneePeak=0,groundBobPeak=0;
 for(let i=0;i<=128;i++){
  const phase=i*Math.PI/64,g=liveGait(phase,speed,1,0,0,role),old=oldGait(phase,speed,1,0,0,role),m=motion(phase,speed,1,0,0,0,role);
  assert(Object.keys(g).every(k=>Math.abs(g[k]-old[k])<1e-12),'forward baseline altered');
  assert(Object.values(g).every(Number.isFinite));assert(Object.values(m).every(Number.isFinite));
  hipPeak=Math.max(hipPeak,Math.abs(g.leftHip));kneePeak=Math.max(kneePeak,g.leftKnee,g.rightKnee);groundBobPeak=Math.max(groundBobPeak,Math.abs(m.bob));samples++;
 }
 rows.push({role,speed,hipPeak,kneePeak,groundBobPeak});
}
assert.equal(samples,5160);
assert(source.includes('Math.max(0,actualSpeed)*Math.max(0,dt)*strideRate'),'visual phase must follow actual displacement');
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v288-baseline.json',JSON.stringify({models:cases.length,contracts,pivots,forwardSamples:samples,cases,rows,scope:'baseline only; not V289/V290 new locomotion acceptance'},null,2));
console.log('V288 PASS: 30 original-equivalent models, 270 pivot comparisons, 120 LOD comparisons, nine unchanged visual contracts, 5160 forward gait samples.');
