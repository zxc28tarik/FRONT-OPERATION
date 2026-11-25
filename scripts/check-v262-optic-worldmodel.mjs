import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const path=process.env.FO_WEAPON_BASELINE;
assert(path&&fs.existsSync(path),'V260 baseline required');
const old=fs.readFileSync(path,'utf8'),now=fs.readFileSync('index.html','utf8');
const cut=(s,a,b)=>{const x=s.indexOf(a),y=s.indexOf(b,x+a.length);assert(x>=0&&y>x);return s.slice(x,y);};
const optic=s=>new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+cut(s,'      const WEAPON_MATS = {','      // =========================================================================\n      // 7. 3D BOT')+'\nreturn [buildReflexOpticEXPS3,buildMicroRedDot,buildPrecisionScope];')(THREE);
const soldier=s=>new Function('THREE',cut(s,'      let SOLDIER_SHARED = null;','      // =========================================================================\n      // 8. COLLISION')+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
const list=root=>{const a=[];root.traverse(n=>a.push(n));return a;};
const near=(a,b,label)=>assert(a.distanceTo(b)<1e-6,label);
const compareTransform=(a,b,label)=>{assert.equal(a.type,b.type,label);near(a.position,b.position,label+' position');near(a.scale,b.scale,label+' scale');assert.deepEqual(a.rotation.toArray(),b.rotation.toArray(),label+' rotation');};
const bounds=(a,b,label)=>{a.computeBoundingBox();b.computeBoundingBox();near(a.boundingBox.min,b.boundingBox.min,label+' min');near(a.boundingBox.max,b.boundingBox.max,label+' max');};
const identical=(a,b,label)=>{assert.equal(a.type,b.type,label);assert.deepEqual(a.getAttribute('position').array,b.getAttribute('position').array,label);};
const oldOptic=optic(old),newOptic=optic(now),opticRows=[];
for(let i=0;i<3;i++){
 const a=list(oldOptic[i]()),b=list(newOptic[i]());assert.equal(a.length,b.length);
 let changed=0;
 for(let j=0;j<a.length;j++){
  const p=a[j],q=b[j];compareTransform(p,q,'optic');
  if(!p.isMesh)continue;
  assert.equal(p.material.color.getHex(),q.material.color.getHex());
  assert.equal(p.material.opacity,q.material.opacity);
  bounds(p.geometry,q.geometry,'optic');
  if(q.geometry.userData.v256Chamfer){changed++;assert.equal(p.geometry.type,'BoxGeometry');}
  else identical(p.geometry,q.geometry,'lens, reticle and unrelated optic geometry');
 }
 assert(changed>0);opticRows.push({optic:i,changed,nodeDelta:0});
}
const a=soldier(old),b=soldier(now),rows=[],cache=new Map();
for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
 const x=a(team,role,variant),y=b(team,role,variant),u=list(x.root),v=list(y.root),weapon=new Set(list(y.weaponPivot));
 assert.equal(u.length,v.length,role+' node count');let changed=0;
 for(let i=0;i<u.length;i++){
  const p=u[i],q=v[i];compareTransform(p,q,role);
  if(!p.isMesh)continue;
  assert.equal(p.material.color.getHex(),q.material.color.getHex());
  if(q.userData.v262Contour){
   assert(weapon.has(q));assert.equal(q.userData.v262Contour,role);
   bounds(p.geometry,q.geometry,role);
   assert.equal(p.geometry.getAttribute('position').count,q.geometry.getAttribute('position').count);
   assert.equal(p.geometry.index?.count,q.geometry.index?.count);
   assert(q.geometry.getAttribute('normal').array.every(Number.isFinite));
   const key=role+':'+i;
   if(cache.has(key))assert.strictEqual(q.geometry,cache.get(key),'shared geometry not reused');
   else cache.set(key,q.geometry);
   changed++;
  }else{
   identical(p.geometry,q.geometry,role+' unrelated geometry');
   assert.equal(p.material.roughness,q.material.roughness);
   assert.equal(p.material.metalness,q.material.metalness);
  }
 }
 assert(changed>0,role+' no contour refinement');
 for(const k of ['weaponPivot','muzzleFlash','leftHip','rightHip','leftKnee','rightKnee','head'])near(x[k].position,y[k].position,role+' '+k);
 const nearGeos=list(y.weaponPivot).filter(n=>n.isMesh).map(n=>n.geometry);
 y.setVisualDetailDistance(60);y.setVisualDetailDistance(8);
 assert.deepEqual(list(y.weaponPivot).filter(n=>n.isMesh).map(n=>n.geometry),nearGeos);
 rows.push({team,role,variant,changed,nodeDelta:0});
}
assert.equal(rows.length,30);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v262-optic-worldmodel.json',JSON.stringify({opticRows,rows},null,2));
console.log('V262 PASS: 3 optics, 30 worldmodels, preserved scene nodes and transforms');
