import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
function factory(file){
 const s=fs.readFileSync(file,'utf8');
 const a=s.indexOf('      let SOLDIER_SHARED = null;');
 const b=s.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
 assert(a>=0&&b>a,'soldier factory bounds');
 return new Function('THREE',s.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
}
const base=process.env.FO_CHARACTER_BASELINE;
assert(base&&fs.existsSync(base),'FO_CHARACTER_BASELINE must point to V249 HTML');
const oldFactory=factory(base),newFactory=factory('index.html');
const flat=m=>{const a=[];m.root.traverse(n=>{if(n.isMesh)a.push(n);});return a;};
function displacement(a,b){
 const p=a.geometry.getAttribute('position'),q=b.geometry.getAttribute('position');
 assert.equal(p.count,q.count,'vertex count');
 let max=0;
 for(let i=0;i<p.count;i++){
  const d=Math.hypot(p.getX(i)-q.getX(i),p.getY(i)-q.getY(i),p.getZ(i)-q.getZ(i));
  if(d>max)max=d;
 }
 return max;
}
const roles=['assault','medic','engineer','sniper','heavy'],rows=[];
for(const team of ['blue','red'])for(const role of roles)for(let variant=0;variant<3;variant++){
 const old=oldFactory(team,role,variant),now=newFactory(team,role,variant);
 const before=flat(old),after=flat(now);
 const changed=['assault','medic'].includes(role);
 assert.equal(before.length,after.length,'visual mesh count drift');
 for(const part of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])
  assert(old[part].position.distanceTo(now[part].position)<1e-9,'anchor moved '+part);
 const protectedOld=before.filter(n=>n.material?.emissive?.getHex?.()).map(n=>n.material.color.getHex());
 const protectedNew=after.filter(n=>n.material?.emissive?.getHex?.()).map(n=>n.material.color.getHex());
 assert.deepEqual(protectedNew,protectedOld,'team IFF color changed');
 const oldArmor=old.upperBody.children.filter(n=>n.name==='v105_role_vest');
 const newArmor=now.upperBody.children.filter(n=>n.name==='v105_role_vest');
 assert.equal(newArmor.length,2,'vest panels');
 const shifts=newArmor.map((n,i)=>displacement(oldArmor[i],n));
 if(changed){
  assert(newArmor.every(n=>n.userData.v250ArmorContour===role),'armor not tailored');
  assert(shifts.every(v=>v>.0005&&v<.012),'armor envelope changed too little or too much '+shifts);
 }else{
  assert(newArmor.every(n=>!n.userData.v250ArmorContour),'unrelated class gained V250 armor');
  assert(shifts.every(v=>v<1e-9),'unrelated armor geometry changed');
 }
 assert(newArmor.every(n=>n.userData.v249Finish==='ballistic'),'V249 ballistic finish lost');
 const pouches=now.upperBody.children.filter(n=>['pouch','admin'].includes(n.userData?.v176Equipment));
 assert.equal(pouches.length,4,'pouch count');
 assert.equal(pouches.every(n=>n.userData.v250RoleArrangement===role),changed,'pouch arrangement role mismatch');
 assert(pouches.every(n=>n.userData.v249Finish==='canvas'),'V249 pouch finish regressed');
 const straps=now.upperBody.children.filter(n=>n.userData?.v250StrapContour);
 assert.equal(straps.length,changed?2:0,'strap count drift');
 const pack=now.upperBody.children.find(n=>n.userData?.v149Pack);
 if(role==='medic'){
  assert(pack?.userData.v250MedicContour,'medic pack contour missing');
  const prev=old.upperBody.children.find(n=>n.userData?.v149Pack);
  const d=displacement(prev,pack);
  assert(d>.0005&&d<.012,'medic pack contour too subtle or excessive '+d);
  const oldCross=old.upperBody.children.filter(n=>n.material?.color?.getHex?.()===0xf8fafc);
  const newCross=now.upperBody.children.filter(n=>n.material?.color?.getHex?.()===0xf8fafc);
  assert.equal(newCross.length,oldCross.length,'medic marker count drift');
 }else{
  assert(!pack?.userData?.v250MedicContour,'non medic pack modified');
 }
 // Only the two requested classes change; other role silhouettes remain identical.
 if(!changed){
  for(let i=0;i<before.length;i++){
   assert(before[i].position.distanceTo(after[i].position)<1e-9,'unrelated mesh moved');
   assert(before[i].scale.distanceTo(after[i].scale)<1e-9,'unrelated mesh resized');
  }
 }
 const oldWeapon=[],newWeapon=[];
 old.weaponPivot.traverse(n=>{if(n.isMesh)oldWeapon.push([n.geometry.getAttribute('position').count,n.material.roughness,n.material.metalness]);});
 now.weaponPivot.traverse(n=>{if(n.isMesh)newWeapon.push([n.geometry.getAttribute('position').count,n.material.roughness,n.material.metalness]);});
 assert.deepEqual(newWeapon,oldWeapon,'approved weapons altered');
 const high=after.reduce((s,n)=>s+n.geometry.getAttribute('position').count,0);
 now.setVisualDetailDistance(60);
 const low=flat(now).reduce((s,n)=>s+n.geometry.getAttribute('position').count,0);
 assert(low<high,'distant LOD must still reduce vertex budget');
 now.setVisualDetailDistance(8);
 const restored=flat(now).reduce((s,n)=>s+n.geometry.getAttribute('position').count,0);
 assert.equal(high,restored,'near LOD not restored');
 rows.push({team,role,variant,changed,armorShifts:shifts,meshIncrease:after.length-before.length,nearVertices:high,farVertices:low});
}
assert.equal(rows.length,30);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v250-assault-medic.json',
 JSON.stringify({cases:rows.length,classesChanged:2,meshIncrease:0,rows},null,2));
console.log('V250 Assault / Medic fitted silhouette PASS',rows.length,'model comparisons; no added meshes');
