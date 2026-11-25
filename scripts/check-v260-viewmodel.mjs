import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const baseline=process.env.FO_WEAPON_BASELINE;
assert(baseline&&fs.existsSync(baseline),'V258 baseline required');
const old=fs.readFileSync(baseline,'utf8'),now=fs.readFileSync('index.html','utf8');
const start='      const WEAPON_MATS = {';
const end='      // =========================================================================\n      // 7. 3D BOT';
function split(s){
 const a=s.indexOf(start),b=s.indexOf(end,a);assert(a>=0&&b>a);
 return [s.slice(0,a),s.slice(a,b),s.slice(b)];
}
const a=split(old),b=split(now);
assert.equal(a[0],b[0],'pre-viewmodel code changed');
const cosmeticCall='        applyV260MagazinePose(vmRefs,player.reloading?\n          1-player.reloadTimer/Math.max(.01,player.reloadDuration):0);\n\n';
assert(b[2].includes(cosmeticCall),'reload update missing');
assert.equal(a[2],b[2].replace(cosmeticCall,''),'unrelated soldier/game code changed');
function api(s,newer){
 return new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+s+
 '\nreturn {build(id){buildViewmodel(id);return {root:currentViewmodelMesh,refs:vmRefs};},group:viewmodelGroup'+
 (newer?',pose:applyV260MagazinePose,textures:V259_DETAIL_TEXTURES,materials:V259_DETAIL_MATERIALS':'')+'};')(THREE);
}
const base=api(a[1],false),next=api(b[1],true);
const nodes=root=>{const out=[];root.traverse(n=>out.push(n));return out;};
const vec=(p,q,label)=>assert(p.distanceTo(q)<1e-7,label);
const ids=['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf','knife','drone','m67','medkit','mine'];
const cases=[];
let poseCases=0;
for(const id of ids){
 const x=base.build(id),y=next.build(id),u=nodes(x.root),v=nodes(y.root);
 assert.equal(u.length,v.length,id+' additional node');
 let detailed=0;
 for(let i=0;i<u.length;i++){
  const p=u[i],q=v[i];assert.equal(p.type,q.type);
  vec(p.position,q.position,id+' position');vec(p.scale,q.scale,id+' scale');
  assert.deepEqual(p.rotation.toArray(),q.rotation.toArray());
  if(!p.isMesh)continue;
  assert.deepEqual(p.geometry.getAttribute('position').array,q.geometry.getAttribute('position').array,id+' geometry changed');
  assert.equal(p.material.color?.getHex(),q.material.color?.getHex());
  assert.equal(p.material.roughness,q.material.roughness);
  assert.equal(p.material.metalness,q.material.metalness);
  if(q.material.userData.v259Surface){
   detailed++;
   assert(q.geometry.userData.v256Chamfer);
   const uv=q.geometry.getAttribute('uv');assert.equal(uv.count,q.geometry.getAttribute('position').count);
   assert(uv.array.every(n=>Number.isFinite(n)&&n>=-1e-6&&n<=1+1e-6));
   assert.equal(q.material.map.image.width,64);assert.equal(q.material.map.image.height,64);
   assert.equal(q.material.map.image.data.length,64*64*4);
   assert(next.textures.has(q.material.userData.v259Surface));
   assert.strictEqual(next.textures.get(q.material.userData.v259Surface),q.material.map);
  }else assert.strictEqual(Boolean(p.material.map),Boolean(q.material.map));
 }
 for(const k of ['muzzlePoint','ejectPoint','slideMesh','boltMesh','magazineMesh']){
  assert.equal(Boolean(x.refs[k]),Boolean(y.refs[k]));if(x.refs[k])assert.equal(u.indexOf(x.refs[k]),v.indexOf(y.refs[k]));
 }
 const muzzle=y.refs.muzzlePoint.position.clone(),eject=y.refs.ejectPoint.position.clone();
 if(y.refs.magazineMesh){
  const m=y.refs.magazineMesh,p=m.position.clone(),r=m.rotation.clone();
  assert(y.refs.magazineRest);
  for(let i=0;i<=100;i++){
   next.pose(y.refs,i/100);poseCases++;
   assert(m.position.distanceTo(p)<=.030001,id+' excessive magazine travel');
   assert(Math.abs(m.rotation.z-r.z)<=.045001,id+' excessive tilt');
   vec(y.refs.muzzlePoint.position,muzzle,id+' muzzle drift');
   vec(y.refs.ejectPoint.position,eject,id+' eject drift');
  }
  vec(m.position,p,id+' reload end did not reset');
  next.pose(y.refs,.5);assert(m.position.distanceTo(p)>.01,id+' no visible reload');
  next.pose(y.refs,0);vec(m.position,p,id+' cancel did not reset');
  assert.deepEqual(m.rotation.toArray(),r.toArray());
  next.pose(y.refs,NaN);vec(m.position,p,id+' invalid timer did not reset');
 }else next.pose(y.refs,.5);
 cases.push({id,detailed,magazine:Boolean(y.refs.magazineMesh),nodeDelta:0});
}
assert.equal(cases.length,12);
assert.equal(next.textures.size,3,'shared map count');
const cached=[...next.materials.values()];let disposed=0;
for(const m of cached)m.addEventListener('dispose',()=>disposed++);
for(let i=0;i<3;i++)for(const id of ids){next.build(id);assert.equal(next.group.children.length,1);}
assert.equal(disposed,0,'cached surface material disposed while switching');
assert.deepEqual([...next.materials.values()],cached,'surface material cache grew during switching');
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v260-detail.json',JSON.stringify({cases,poseCases,sharedTextures:next.textures.size,sharedMaterials:cached.length},null,2));
console.log('V260 visual detail and reload continuity PASS',cases.length,poseCases);
