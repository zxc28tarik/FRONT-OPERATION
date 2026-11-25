import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';

const baselineFile=process.env.FO_CHARACTER_BASELINE;
assert(baselineFile&&fs.existsSync(baselineFile),'FO_CHARACTER_BASELINE must be V250 HTML');
const factory=file=>{
 const src=fs.readFileSync(file,'utf8');
 const a=src.indexOf('      let SOLDIER_SHARED = null;');
 const b=src.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
 assert(a>=0&&b>a,'soldier extraction bounds not found');
 return new Function('THREE',src.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
};
const oldFactory=factory(baselineFile),nextFactory=factory('index.html');
const flatten=model=>{const result=[];model.root.traverse(n=>{if(n.isMesh)result.push(n);});return result;};
const maxGeoMove=(a,b)=>{
 const p=a.geometry.getAttribute('position'),q=b.geometry.getAttribute('position');
 assert(p&&q,'missing real geometry');
 assert.equal(p.count,q.count,'geometry vertex count regressed');
 let d=0;
 for(let i=0;i<p.count;i++){
  d=Math.max(d,Math.hypot(p.getX(i)-q.getX(i),p.getY(i)-q.getY(i),p.getZ(i)-q.getZ(i)));
 }
 return d;
};
const cloth=(root,field)=>{const out=[];root.traverse(n=>{if(n.userData?.[field])out.push(n);});return out;};
const classes=['assault','medic','engineer','sniper','heavy'],report=[];
const caches={};
for(const team of ['blue','red'])for(const cls of classes)for(let variant=0;variant<3;variant++){
 const before=oldFactory(team,cls,variant),after=nextFactory(team,cls,variant);
 const a=flatten(before),b=flatten(after),changed=cls==='engineer'||cls==='sniper';
 assert.equal(a.length,b.length,'additional soldier draw call/mesh');
 for(const part of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash']){
  assert(before[part].position.distanceTo(after[part].position)<1e-9,'gameplay anchor changed '+part);
 }
 for(let i=0;i<a.length;i++){
  assert.equal(a[i].name,b[i].name,'mesh hierarchy names modified');
  if(!changed){
   assert(a[i].position.distanceTo(b[i].position)<1e-9,'unrelated role position changed');
   assert(a[i].scale.distanceTo(b[i].scale)<1e-9,'unrelated role scale changed');
   assert.strictEqual(a[i].geometry,b[i].geometry,'unrelated role geometry changed');
  }
 }
 const aCarrier=before.upperBody.children.filter(n=>n.userData?.v139Carrier);
 const bCarrier=after.upperBody.children.filter(n=>n.userData?.v139Carrier);
 assert.equal(bCarrier.length,2,'carrier panels missing');
 const displacement=bCarrier.map((n,i)=>maxGeoMove(aCarrier[i],n));
 if(changed){
  assert(bCarrier.every(n=>n.userData.v251Carrier===cls),'carrier sculpt missing');
  assert(displacement.every(d=>d>.0003&&d<.015),'carrier sculpt outside envelope '+displacement);
 }else{
  assert(displacement.every(d=>d<1e-10),'carrier changed for unrelated role');
 }
 assert(bCarrier.every(n=>n.userData?.v249Finish==='ballistic'),'V249 ballistic finish regressed');
 const pouches=after.upperBody.children.filter(n=>['pouch','admin'].includes(n.userData?.v176Equipment));
 assert.equal(pouches.length,4,'original four pouches missing');
 assert.equal(pouches.filter(n=>n.userData?.v251Loadout===cls).length,changed?4:0,'loadout assignment wrong');
 const straps=after.upperBody.children.filter(n=>n.userData?.v251Harness===cls);
 assert.equal(straps.length,changed?2:0,'original two shoulder straps mismatch');
 assert(pouches.every(n=>n.userData?.v249Finish==='canvas'),'V249 canvas finish regressed');
 const pack=after.upperBody.children.find(n=>n.userData?.v149Pack);
 if(cls==='engineer'){
  const oldPack=before.upperBody.children.find(n=>n.userData?.v149Pack);
  assert(pack?.userData?.v251EngineerPack,'engineer pack sculpt missing');
  assert(maxGeoMove(oldPack,pack)>.0003,'engineer pack unchanged');
  assert.equal(cloth(after.root,'v251ToolMounted').length,1,'tool tube mount missing');
  assert.equal(cloth(after.root,'v251UtilityMounted').length,1,'utility panel mount missing');
 }
 if(cls==='sniper'){
  const cape=cloth(after.root,'v251DrapedCape');
  const hood=cloth(after.root,'v251FittedHood');
  assert.equal(cape.length,1,'sniper cape sculpt missing');
  assert.equal(hood.length,1,'sniper hood sculpt missing');
  const oldCape=before.upperBody.children.find(n=>n.geometry.parameters?.radiusTop===.16);
  const oldHood=before.head.children.find(n=>n.geometry.parameters?.radius===.132);
  if(oldCape)assert(maxGeoMove(oldCape,cape[0])>.0003,'sniper cape unchanged');
  if(oldHood)assert(maxGeoMove(oldHood,hood[0])>.0003,'sniper hood unchanged');
  assert.equal(Boolean(pack),false,'sniper acquired backpack');
 }
 if(cls!=='engineer')assert.equal(cloth(after.root,'v251EngineerPack').length,0,'unexpected work pack');
 if(cls!=='sniper')assert.equal(cloth(after.root,'v251DrapedCape').length,0,'unexpected cape');
 assert(after.head.children.some(n=>n.name==='v246_integrated_helmet'),'V246 helmet removed');
 const oldWeapon=[],newWeapon=[];
 before.weaponPivot.traverse(n=>{if(n.isMesh)oldWeapon.push([n.geometry.getAttribute('position').count,n.material.roughness,n.material.metalness]);});
 after.weaponPivot.traverse(n=>{if(n.isMesh)newWeapon.push([n.geometry.getAttribute('position').count,n.material.roughness,n.material.metalness]);});
 assert.deepEqual(newWeapon,oldWeapon,'weapon geometry/material changed');
 const high=b.reduce((sum,n)=>sum+n.geometry.getAttribute('position').count,0);
 after.setVisualDetailDistance(60);
 const low=flatten(after).reduce((sum,n)=>sum+n.geometry.getAttribute('position').count,0);
 assert(low<high,'far LOD not preserved');
 after.setVisualDetailDistance(8);
 const restored=flatten(after).reduce((sum,n)=>sum+n.geometry.getAttribute('position').count,0);
 assert.equal(high,restored,'near LOD not restored');
 if(changed&&team==='blue'){
  const key=cls,first=caches[key],mesh=bCarrier[0].geometry;
  if(first)assert.strictEqual(mesh,first,'role armor geometry not shared across variants');
  else caches[key]=mesh;
 }
 report.push({team,cls,variant,changed,carrierDisplacement:displacement,meshChange:b.length-a.length,nearVertices:high,farVertices:low});
}
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v251-engineer-sniper.json',
 JSON.stringify({cases:report.length,classesChanged:['engineer','sniper'],meshIncrease:0,report},null,2));
console.log('V251 Engineer and Sniper silhouette PASS',report.length,
 'cases, unchanged 3 other classes, no new meshes/draw calls, LOD retained');
