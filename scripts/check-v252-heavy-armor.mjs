import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const base=process.env.FO_CHARACTER_BASELINE;
assert(base&&fs.existsSync(base),'FO_CHARACTER_BASELINE must point to V251 HTML');
function make(file){
 const s=fs.readFileSync(file,'utf8');
 const a=s.indexOf('      let SOLDIER_SHARED = null;');
 const b=s.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
 assert(a>=0&&b>a,'factory source bounds missing');
 return new Function('THREE',s.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
}
const beforeFactory=make(base),afterFactory=make('index.html');
function meshList(m){const a=[];m.root.traverse(n=>{if(n.isMesh)a.push(n);});return a;}
function verticesChanged(a,b){
 const p=a.geometry.getAttribute('position'),q=b.geometry.getAttribute('position');
 assert(p&&q&&p.count===q.count,'unexpected mesh vertex count');
 let max=0;
 for(let i=0;i<p.count;i++){
  max=Math.max(max,Math.hypot(p.getX(i)-q.getX(i),p.getY(i)-q.getY(i),p.getZ(i)-q.getZ(i)));
 }
 return max;
}
const marked=(m,flag)=>{const a=[];m.root.traverse(n=>{if(n.userData?.[flag])a.push(n);});return a;};
const roles=['assault','medic','engineer','sniper','heavy'],report=[];
let firstHeavy=null;
for(const team of ['blue','red'])for(const role of roles)for(let variant=0;variant<3;variant++){
 const original=beforeFactory(team,role,variant),candidate=afterFactory(team,role,variant);
 const before=meshList(original),after=meshList(candidate);
 assert.equal(before.length,after.length,'Heavy package increased draw calls');
 for(const node of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])
  assert(original[node].position.distanceTo(candidate[node].position)<1e-9,'anchor changed '+node);
 if(role!=='heavy'){
  for(let i=0;i<before.length;i++){
   assert(before[i].position.distanceTo(after[i].position)<1e-9,'nonheavy mount changed');
   assert(before[i].scale.distanceTo(after[i].scale)<1e-9,'nonheavy scale changed');
   assert(verticesChanged(before[i],after[i])<1e-9,'nonheavy geometry changed');
  }
  for(const flag of ['v252HeavyCarrier','v252ShoulderShield','v252HeavyCollar','v252AmmoPack','v252FeedIntegration']){
   assert.equal(marked(candidate,flag).length,0,'unexpected heavy piece on '+role);
  }
 }else{
  const ca=marked(candidate,'v252HeavyCarrier'),shoulders=marked(candidate,'v252ShoulderShield');
  assert.equal(ca.length,2,'Heavy must have two tailored carrier plates');
  assert.equal(shoulders.length,2,'Heavy shoulder plates missing');
  assert.equal(marked(candidate,'v252HeavyCollar').length,1,'Heavy collar not sculpted');
  assert.equal(marked(candidate,'v252AmmoPack').length,1,'Heavy ammo pack not sculpted');
  assert.equal(marked(candidate,'v252FeedIntegration').length,1,'Heavy existing feed link missing');
  assert.equal(marked(candidate,'v252AmmoLoadout').length,4,'Heavy ammunition pockets not arranged');
  assert.equal(marked(candidate,'v252Harness').length,2,'Heavy harness not integrated');
  const oldCarrier=original.upperBody.children.filter(n=>n.userData?.v139Carrier);
  const newCarrier=candidate.upperBody.children.filter(n=>n.userData?.v139Carrier);
  assert.equal(newCarrier.length,2);
  for(let i=0;i<2;i++){
   const diff=verticesChanged(oldCarrier[i],newCarrier[i]);
   assert(diff>.00035&&diff<.015,'Heavy carrier distortion out of bounds '+diff);
   assert(newCarrier[i].userData.v249Finish==='ballistic','ballistic plate finish regressed');
  }
  const oldPack=original.upperBody.children.find(n=>n.userData?.v149Pack);
  const newPack=candidate.upperBody.children.find(n=>n.userData?.v149Pack);
  assert(oldPack&&newPack&&newPack.userData.v249Finish==='canvas','ammo pack/fabric finish regressed');
  const packDiff=verticesChanged(oldPack,newPack);
  assert(packDiff>.0002&&packDiff<.013,'ammunition pack contour out of bounds '+packDiff);
  if(team==='blue'){
   if(firstHeavy)assert.strictEqual(newCarrier[0].geometry,firstHeavy,'Heavy sculpt cache not reused');
   else firstHeavy=newCarrier[0].geometry;
  }
 }
 const oldWeapon=[],newWeapon=[];
 original.weaponPivot.traverse(n=>{if(n.isMesh)oldWeapon.push([n.geometry.getAttribute('position').count,n.material.roughness,n.material.metalness]);});
 candidate.weaponPivot.traverse(n=>{if(n.isMesh)newWeapon.push([n.geometry.getAttribute('position').count,n.material.roughness,n.material.metalness]);});
 assert.deepEqual(newWeapon,oldWeapon,'weapons changed');
 assert(candidate.head.children.some(n=>n.name==='v246_integrated_helmet'),'helmet regressed');
 const oldIFF=before.filter(n=>n.material?.emissive?.getHex?.()).map(n=>n.material.color.getHex());
 const newIFF=after.filter(n=>n.material?.emissive?.getHex?.()).map(n=>n.material.color.getHex());
 assert.deepEqual(newIFF,oldIFF,'team IFF changed');
 const high=after.reduce((sum,n)=>sum+n.geometry.getAttribute('position').count,0);
 candidate.setVisualDetailDistance(60);
 const low=meshList(candidate).reduce((sum,n)=>sum+n.geometry.getAttribute('position').count,0);
 assert(low<high,'far LOD failed');
 candidate.setVisualDetailDistance(8);
 const again=meshList(candidate).reduce((sum,n)=>sum+n.geometry.getAttribute('position').count,0);
 assert.equal(again,high,'near LOD failed');
 report.push({team,role,variant,changed:role==='heavy',meshChange:after.length-before.length,nearVertices:high,farVertices:low});
}
assert.equal(report.length,30);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v252-heavy-armor.json',
 JSON.stringify({cases:report.length,changedModels:6,meshIncrease:0,report},null,2));
console.log('V252 Heavy armor and loadout PASS: 30 models; no other classes changed; 0 new meshes/draw calls');
