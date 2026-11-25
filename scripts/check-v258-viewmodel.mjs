import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const baseline=process.env.FO_WEAPON_BASELINE;
assert(baseline&&fs.existsSync(baseline),'V256 baseline required');
const old=fs.readFileSync(baseline,'utf8'),now=fs.readFileSync('index.html','utf8');
const start='      const WEAPON_MATS = {';
const end='      // =========================================================================\n      // 7. 3D BOT';
function split(s){
 const a=s.indexOf(start),b=s.indexOf(end,a);
 assert(a>=0&&b>a,'viewmodel source missing');
 return [s.slice(0,a),s.slice(a,b),s.slice(b)];
}
const a=split(old),b=split(now);
assert.equal(a[0],b[0],'pre-viewmodel game source changed');
assert.equal(a[2],b[2],'soldiers or gameplay changed');
function api(s){
 return new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+s+
 '\nreturn {build(id){buildViewmodel(id);return {root:currentViewmodelMesh,refs:vmRefs};},group:viewmodelGroup};')(THREE);
}
const original=api(a[1]),candidate=api(b[1]);
const all=root=>{const list=[];root.traverse(n=>list.push(n));return list;};
const tris=g=>(g.index?.count??g.getAttribute('position').count)/3;
const near=(p,q,label)=>assert(p.distanceTo(q)<1e-6,label);
const cases=[];
for(const id of ['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf','knife','drone','m67','medkit','mine']){
 const x=original.build(id),y=candidate.build(id),u=all(x.root),v=all(y.root);
 assert.equal(u.length,v.length,id+' scene nodes increased');
 assert.equal(original.group.children.length,1);assert.equal(candidate.group.children.length,1);
 for(const key of ['muzzlePoint','ejectPoint','slideMesh','boltMesh','magazineMesh']){
  assert.equal(Boolean(x.refs[key]),Boolean(y.refs[key]),id+' animation reference changed '+key);
  if(x.refs[key]){
   assert.equal(u.indexOf(x.refs[key]),v.indexOf(y.refs[key]),id+' ref hierarchy changed');
   near(x.refs[key].position,y.refs[key].position,id+' anchor changed '+key);
  }
 }
 let changed=0,delta=0,meshCount=0,finishChanged=0;const profiles=new Set();
 for(let i=0;i<u.length;i++){
  const p=u[i],q=v[i];assert.equal(p.type,q.type,id+' node type changed');
  near(p.position,q.position,id+' local translation changed');
  near(p.scale,q.scale,id+' local scale changed');
  assert.deepEqual(p.rotation.toArray(),q.rotation.toArray(),id+' local rotation changed');
  if(!p.isMesh)continue;
  meshCount++;
  assert.equal(p.count,q.count,id+' instance count changed');
  p.geometry.computeBoundingBox();q.geometry.computeBoundingBox();
  near(p.geometry.boundingBox.min,q.geometry.boundingBox.min,id+' bounds min changed');
  near(p.geometry.boundingBox.max,q.geometry.boundingBox.max,id+' bounds max changed');
  assert.equal(p.material.color?.getHex(),q.material.color?.getHex(),id+' palette changed');
  assert(Number.isFinite(q.material.roughness)||q.material.isMeshBasicMaterial,'nonfinite surface finish');
  if(p.material.roughness!==q.material.roughness||p.material.metalness!==q.material.metalness)finishChanged++;
  if(q.geometry.userData.v257Profile){
   profiles.add(q.geometry.userData.v257Profile);
   changed++;assert(p.geometry.userData.v256Chamfer,'V256 chamfer was not preserved');
   assert.equal(p.geometry.type,q.geometry.type);
   assert(q.geometry.getAttribute('position').count>p.geometry.getAttribute('position').count,'profile was not refined');
   assert.equal(q.geometry.groups.length,0,'extra material groups');
   assert(q.geometry.getAttribute('normal').array.every(Number.isFinite),'invalid bevel normals');
   delta+=tris(q.geometry)-tris(p.geometry);
  }else{
   assert.equal(p.geometry.type,q.geometry.type,id+' unselected geometry changed');
   assert.equal(tris(p.geometry),tris(q.geometry),id+' unrelated triangle count changed');
  }
 }
 const intended=['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf'].includes(id);
 assert.equal(changed>0,intended,id+' coverage mismatch');
 assert(delta<=300,id+' triangle budget exceeded '+delta);
 if(intended)assert(finishChanged>0,id+' surface finish missing');
 cases.push({id,changed,profiles:[...profiles],finishChanged,triangleDelta:delta,meshCount,meshDelta:0});
}
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v258-viewmodel.json',JSON.stringify({cases},null,2));
console.log('V258 PASS: 12 viewmodels, profile and surface finish, unchanged anchors and scene-node counts',cases);
