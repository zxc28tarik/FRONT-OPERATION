import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const path=process.env.FO_WEAPON_BASELINE;
assert(path&&fs.existsSync(path),'V262 baseline required');
const old=fs.readFileSync(path,'utf8'),now=fs.readFileSync('index.html','utf8');
const cut=(s,a,b)=>{const x=s.indexOf(a),y=s.indexOf(b,x+a.length);assert(x>=0&&y>x);return s.slice(x,y);};
const vm=s=>new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+cut(s,'      const WEAPON_MATS = {','      // =========================================================================\n      // 7. 3D BOT')+'\nreturn {texture:v259SurfaceTexture,build(id){buildViewmodel(id);return currentViewmodelMesh;}};')(THREE);
const soldier=s=>new Function('THREE',cut(s,'      let SOLDIER_SHARED = null;','      // =========================================================================\n      // 8. COLLISION')+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
const list=root=>{const a=[];root.traverse(n=>a.push(n));return a;};
function compare(a,b){
 assert.equal(a.type,b.type);
 assert(a.position.distanceTo(b.position)<1e-7);
 assert(a.scale.distanceTo(b.scale)<1e-7);
 assert.deepEqual(a.rotation.toArray(),b.rotation.toArray());
 if(a.isMesh){
  assert.deepEqual(a.geometry.getAttribute('position').array,b.geometry.getAttribute('position').array);
  assert.deepEqual(a.geometry.index?.array,b.geometry.index?.array);
 }
}
const before=vm(old),after=vm(now),textures=[];
for(const kind of ['metal','polymer','rubber']){
 const a=before.texture(kind),b=after.texture(kind);
 assert.equal(b.image.width,64);assert.equal(b.image.height,64);
 assert.strictEqual(after.texture(kind),b);
 assert.notDeepEqual(a.image.data,b.image.data);
 assert.equal(a.image.data.length,b.image.data.length);
 const values=Array.from(b.image.data).filter((_,i)=>i%4===0);
 assert(Math.min(...values)>=210&&Math.max(...values)<=255);
 textures.push({kind,min:Math.min(...values),max:Math.max(...values)});
}
const ids=['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf','knife','drone','m67','medkit','mine'];
for(const id of ids){
 const a=list(before.build(id)),b=list(after.build(id));
 assert.equal(a.length,b.length);
 for(let i=0;i<a.length;i++){compare(a[i],b[i]);if(a[i].isMesh){assert.equal(a[i].material.color.getHex(),b[i].material.color.getHex());assert.equal(a[i].material.roughness,b[i].material.roughness);}}
}
const a=soldier(old),b=soldier(now),rows=[],cache=new Map();
for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
 const x=a(team,role,variant),y=b(team,role,variant);
 const u=list(x.root),v=list(y.root),weapon=new Set(list(y.weaponPivot));
 assert.equal(u.length,v.length);
 let count=0;
 for(let i=0;i<u.length;i++){
  const p=u[i],q=v[i];compare(p,q);
  if(!p.isMesh)continue;
  if(q.userData.v263Finish){
   assert(weapon.has(q));assert(q!==y.muzzleFlash);count++;
   const key=role+':'+i;
   if(cache.has(key))assert.strictEqual(q.material,cache.get(key));else cache.set(key,q.material);
   assert.equal(q.material.userData.v263Finish,q.userData.v263Finish);
  }else{
   assert.equal(p.material.color.getHex(),q.material.color.getHex());
   assert.equal(p.material.roughness,q.material.roughness);
   assert.equal(p.material.metalness,q.material.metalness);
  }
 }
 assert(count>=6,role+' missing finish');
 rows.push({team,role,variant,finished:count,nodeDelta:0});
}
assert.equal(rows.length,30);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v264-weapon-cohesion.json',JSON.stringify({textures,viewmodels:ids.length,rows},null,2));
console.log('V264 PASS: three texture maps, 12 viewmodels, 30 character variants; unchanged geometry and transforms');
