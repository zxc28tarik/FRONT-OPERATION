import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';

const baseline=process.env.FO_CHARACTER_BASELINE;
assert(baseline && fs.existsSync(baseline),'Provide the immutable V240 HTML baseline');
const source=fs.readFileSync('index.html','utf8');
const prior=fs.readFileSync(baseline,'utf8');
function factory(s){
 const a=s.indexOf('      let SOLDIER_SHARED = null;');
 const b=s.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
 assert(a>=0&&b>a,'soldier factory boundaries missing');
 return new Function('THREE',s.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
}
const oldFactory=factory(prior),newFactory=factory(source);
const roles=['assault','medic','engineer','sniper','heavy'];
const nodes=root=>{const a=[];root.traverse(n=>a.push(n));return a;};
const meshes=root=>nodes(root).filter(n=>n.isMesh);
const count=(m,flag,value=true)=>nodes(m.root).filter(n=>value===true?Boolean(n.userData?.[flag]):n.userData?.[flag]===value).length;
function stats(root){
 const visible=meshes(root).filter(n=>{
   for(let p=n;p;p=p.parent){if(!p.visible)return false;}
   return true;
 });
 return {meshes:visible.length,vertices:visible.reduce((s,n)=>s+n.geometry.getAttribute('position').count,0),
 triangles:visible.reduce((s,n)=>s+(n.geometry.index?.count??n.geometry.getAttribute('position').count)/3,0)};
}
function weaponSnapshot(m){
 return meshes(m.weaponPivot).map(n=>({
   position:n.position.toArray(),rotation:n.rotation.toArray(),scale:n.scale.toArray(),
   vertices:Array.from(n.geometry.getAttribute('position').array),
   indices:n.geometry.index?Array.from(n.geometry.index.array):null
 }));
}
function finitePose(m){
 m.root.updateMatrixWorld(true);
 for(const n of nodes(m.root))assert(n.matrixWorld.elements.every(Number.isFinite),'nonfinite transform '+n.name);
}
const rows=[];
for(const team of ['blue','red'])for(const role of roles)for(let variant=0;variant<3;variant++){
 const a=oldFactory(team,role,variant),b=newFactory(team,role,variant);
 const label=team+'/'+role+'/'+variant;
 for(const key of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])
  assert(a[key].position.distanceTo(b[key].position)<1e-7,label+' protected anchor '+key);
 assert.deepEqual(weaponSnapshot(b),weaponSnapshot(a),label+' approved third-person weapon changed');
 assert(b.head.children.some(n=>n.name==='v246_integrated_helmet'&&n.userData.v249Finish==='ballistic'),label+' helmet finish missing');
 for(const r of ['assault','medic'])assert.equal(count(b,'v250ArmorContour',r),role===r?2:0,label+' V250 class identity '+r);
 for(const r of ['engineer','sniper'])assert.equal(count(b,'v251Carrier',r),role===r?2:0,label+' V251 class identity '+r);
 assert.equal(count(b,'v250MedicContour'),role==='medic'?1:0,label+' medic pack');
 assert.equal(count(b,'v251EngineerPack'),role==='engineer'?1:0,label+' engineer pack');
 assert.equal(count(b,'v251DrapedCape'),role==='sniper'?1:0,label+' sniper cape');
 assert.equal(count(b,'v252HeavyCarrier'),role==='heavy'?2:0,label+' heavy carrier');
 assert.equal(count(b,'v252AmmoPack'),role==='heavy'?1:0,label+' heavy ammo pack');
 a.setVisualDetailDistance(8);b.setVisualDetailDistance(8);
 const baseNear=stats(a.root),near=stats(b.root);
 b.setVisualDetailDistance(60);const far=stats(b.root);
 assert(far.vertices<near.vertices,label+' far LOD not cheaper');
 b.setVisualDetailDistance(8);assert.deepEqual(stats(b.root),near,label+' LOD does not restore');
 const weaponRest=b.weaponPivot.position.clone();
 for(const pitch of [-1.1,-.55,0,.55,1.1])for(const state of [
  {kick:1,reload:0,swap:0},{kick:0,reload:.5,swap:.5},{kick:0,reload:1,swap:1},{kick:0,reload:0,swap:0,carry:1}
 ]){
  b.weaponPivot.rotation.x=pitch;b.setVisualCombatPose(state);
  assert.equal(b.weaponPivot.rotation.x,pitch,label+' aim pitch changed');
  finitePose(b);
 }
 b.weaponPivot.rotation.x=0;b.resetVisualCombatPose();
 assert(b.weaponPivot.position.distanceTo(weaponRest)<1e-7,label+' weapon reset failed');
 finitePose(b);
 rows.push({team,role,variant,baseNear,near,far,meshDelta:near.meshes-baseNear.meshes,triangleDelta:near.triangles-baseNear.triangles});
}
assert.equal(rows.length,30);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v255-integrated-character.json',JSON.stringify({
 baseline:'V240',candidate:'V255 (V254 gameplay unchanged)',models:rows.length,combatPoseCases:rows.length*20,
 maxMeshDelta:Math.max(...rows.map(r=>r.meshDelta)),maxTriangleDelta:Math.max(...rows.map(r=>r.triangleDelta)),rows
},null,2));
console.log('V255 integrated character checks PASS:',rows.length,'models,',rows.length*20,'combat poses; near/far costs recorded.');
