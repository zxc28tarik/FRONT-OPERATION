import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';

function factory(path){
  const source=fs.readFileSync(path,'utf8');
  const begin=source.indexOf('      let SOLDIER_SHARED = null;');
  const end=source.indexOf('      // =========================================================================\n      // 8. COLLISION',begin);
  assert(begin>=0&&end>begin,'soldier factory bounds');
  return new Function('THREE',source.slice(begin,end)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
}
const baselinePath=process.env.FO_CHARACTER_BASELINE;
assert(baselinePath&&fs.existsSync(baselinePath),'FO_CHARACTER_BASELINE must point to V248 HTML');
const oldFactory=factory(baselinePath),newFactory=factory('index.html');
const all=m=>{const nodes=[];m.root.traverse(n=>{if(n.isMesh)nodes.push(n);});return nodes;};
const samePoint=(a,b,label)=>assert(a.position.distanceTo(b.position)<1e-9,label+' pivot changed');
const materialPrint=m=>[m?.roughness,m?.metalness,m?.color?.getHex?.(),m?.emissive?.getHex?.()];
const perModel=[];
let firstMaterial=null;
for(const team of ['blue','red']){
 for(const role of ['assault','medic','engineer','sniper','heavy']){
  for(let variant=0;variant<3;variant++){
   const old=oldFactory(team,role,variant),now=newFactory(team,role,variant);
   const a=all(old),b=all(now);
   assert.equal(b.length,a.length,'new mesh/draw call detected');
   for(const part of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])
    samePoint(old[part],now[part],part);
   assert.equal(old.weaponPivot.children.length,now.weaponPivot.children.length,'weapon component count');
   const gunOld=[],gunNew=[];
   old.weaponPivot.traverse(n=>{if(n.isMesh)gunOld.push(materialPrint(n.material));});
   now.weaponPivot.traverse(n=>{if(n.isMesh)gunNew.push(materialPrint(n.material));});
   assert.deepEqual(gunNew,gunOld,'weapon materials or stats touched');
   const counts={ballistic:0,canvas:0,rubber:0,hardware:0,uniform:0};
   for(let i=0;i<b.length;i++){
    const prev=a[i],node=b[i];
    assert.equal(node.name,prev.name,'unexpected mesh hierarchy/name drift');
    assert(node.position.distanceTo(prev.position)<1e-9,'mesh mount moved');
    assert(node.scale.distanceTo(prev.scale)<1e-9,'mesh scale changed');
    const p=node.geometry.getAttribute('position'),q=prev.geometry.getAttribute('position');
    assert.equal(p?.count,q?.count,'geometry resolution changed');
    assert.equal(node.userData.v247Tailored,prev.userData.v247Tailored,'V247 cloth regressed');
    assert.equal(node.userData.v248CarrierMounted,prev.userData.v248CarrierMounted,'V248 equipment fit regressed');
    const kind=node.userData?.v249Finish;
    if(!kind)continue;
    assert(kind in counts,'unknown V249 material');
    counts[kind]++;
    assert(node.material!==prev.material,'finish not replaced');
    assert(node.material.name.includes('V249 '+kind),'material finish identity missing');
    assert(node.material.roughness>=.4&&node.material.roughness<=1.01,'roughness out of bounds');
    assert(node.material.metalness>=0&&node.material.metalness<=1,'metalness out of bounds');
    assert.equal(node.material.transparent,prev.material.transparent,'transparency changed');
    if(kind!=='uniform'){
      assert(node.material.bumpMap?.image?.width===64,'micro bump texture exceeds budget');
      assert(node.material.roughnessMap?.image?.width===64,'roughness texture exceeds budget');
    }
    // Vertex colors and the exact team identification colors must survive.
    if(prev.material.vertexColors)assert(node.material.vertexColors,'V247 seam vertex color lost');
   }
   const vest=now.upperBody.children.filter(n=>n.name==='v105_role_vest');
   assert.equal(vest.length,2,'carrier panels missing');
   assert(vest.every(n=>n.userData.v249Finish==='ballistic'),'front/back armor finish missing');
   assert(now.head.children.some(n=>n.name==='v246_integrated_helmet'&&n.userData.v249Finish==='ballistic'),
     'V246 helmet not finished');
   const pockets=now.upperBody.children.filter(n=>['pouch','admin'].includes(n.userData?.v176Equipment));
   assert.equal(pockets.length,4,'pouches missing');
   assert(pockets.every(n=>n.userData.v249Finish==='canvas'),'canvas pocket finish missing');
   const pack=now.upperBody.children.find(n=>n.userData?.v149Pack);
   if(pack)assert(pack.userData.v249Finish==='canvas','class backpack finish missing');
   assert(counts.rubber>=4,'rubber boots/gear not differentiated');
   assert(counts.hardware>=1,'metal hardware not differentiated');
   assert(counts.uniform>=8,'base uniforms missing');
   const emOld=a.filter(n=>n.material?.emissive?.getHex?.()).map(n=>materialPrint(n.material));
   const emNew=b.filter(n=>n.material?.emissive?.getHex?.()).map(n=>materialPrint(n.material));
   assert.deepEqual(emNew,emOld,'team IFF or emblem material changed');
   const helmet=now.head.children.find(n=>n.name==='v246_integrated_helmet');
   if(firstMaterial&&team==='blue'&&role==='assault')assert.strictEqual(helmet.material,firstMaterial,
      'helmet material should be cached for same team/class across variants');
   if(team==='blue'&&role==='assault'&&variant===0)firstMaterial=helmet.material;
   const highCount=b.reduce((s,n)=>s+(n.geometry?.getAttribute('position')?.count||0),0);
   now.setVisualDetailDistance(60);
   const lowCount=all(now).reduce((s,n)=>s+(n.geometry?.getAttribute('position')?.count||0),0);
   assert(lowCount<highCount,'far LOD not retained');
   now.setVisualDetailDistance(8);
   const restoredCount=all(now).reduce((s,n)=>s+(n.geometry?.getAttribute('position')?.count||0),0);
   assert.equal(restoredCount,highCount,'near LOD not restored');
   perModel.push({team,role,variant,counts,drawCallIncrease:b.length-a.length,nearVertices:highCount,farVertices:lowCount});
  }
 }
}
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v249-physical-surfaces.json',
  JSON.stringify({models:perModel.length,drawCallIncrease:0,textureResolution:64,perModel},null,2));
console.log('V249 material differentiation PASS:',perModel.length,'soldiers;',
  'ballistic/canvas/rubber/hardware/uniform; textures 64px, zero added meshes, LOD retained');
