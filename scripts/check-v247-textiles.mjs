import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';

function soldierFactory(path){
  const s=fs.readFileSync(path,'utf8');
  const begin=s.indexOf('      let SOLDIER_SHARED = null;');
  const end=s.indexOf('      // =========================================================================\n      // 8. COLLISION',begin);
  assert(begin>0&&end>begin,'soldier factory anchors missing');
  return new Function('THREE',s.slice(begin,end)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
}
const base=process.env.FO_CHARACTER_BASELINE;
assert(base&&fs.existsSync(base),'FO_CHARACTER_BASELINE must point to the V246 HTML');
const previous=soldierFactory(base),current=soldierFactory('index.html');
const meshCount=model=>{let count=0;model.root.traverse(n=>{if(n.isMesh)count++;});return count;};
const clothMeshes=model=>{const nodes=[];model.root.traverse(n=>{if(n.isMesh&&n.userData?.v129Sculpted)nodes.push(n);});return nodes;};
const geometrySize=g=>{g.computeBoundingBox();return g.boundingBox.getSize(new THREE.Vector3());};
const maxDisplacement=(a,b)=>{
 const p=a.getAttribute('position'),q=b.getAttribute('position');
 assert.equal(p.count,q.count,'vertex count changed unexpectedly');
 let max=0;
 for(let i=0;i<p.count;i++)max=Math.max(max,Math.hypot(
  p.getX(i)-q.getX(i),p.getY(i)-q.getY(i),p.getZ(i)-q.getZ(i)));
 return max;
};
const report=[],seenRoleGeom=new Map();
for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
 const old=previous(team,role,variant),now=current(team,role,variant);
 assert.equal(meshCount(now),meshCount(old),'added soldier draw calls');
 for(const part of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])
  assert(old[part].position.distanceTo(now[part].position)<1e-8,part+' anchor changed');
 const before=clothMeshes(old),after=clothMeshes(now);
 assert.equal(before.length,after.length,'cloth mesh count changed');
 assert(after.length>=10,'too few cloth surfaces found');
 const kinds=new Set();
 const measurements=[];
 for(let i=0;i<after.length;i++){
  const oldMesh=before[i],mesh=after[i],kind=mesh.userData.v247TextileKind;
  assert(mesh.userData.v247Tailored,'unprocessed cloth surface '+i);
  assert(['chest','abdomen','thigh','shin','upperArm','forearm'].includes(kind),'unknown cloth kind');
  kinds.add(kind);
  assert.equal(mesh.parent===null,false,'broken articulation');
  assert(mesh.material.vertexColors,'vertex fabric color not enabled');
  assert(mesh.geometry.getAttribute('color'),'vertex stitch layer missing');
  const d=maxDisplacement(oldMesh.geometry,mesh.geometry);
  assert(d>.00025&&d<.009,'textile displacement outside bounded range '+kind+': '+d);
  const x=geometrySize(oldMesh.geometry),y=geometrySize(mesh.geometry);
  for(const key of ['x','y','z'])assert(y[key]/x[key]>.89&&y[key]/x[key]<1.12,
   'textile silhouette envelope changed too much '+kind+'/'+key);
  for(const attrName of ['position','normal','color']){
   const attr=mesh.geometry.getAttribute(attrName);
   assert(attr&&attr.count>0,'missing '+attrName);
   for(let j=0;j<attr.array.length;j++)assert(Number.isFinite(attr.array[j]),'nonfinite '+attrName);
  }
  measurements.push({kind,displacement:d,vertices:mesh.geometry.getAttribute('position').count});
 }
 assert.equal(kinds.size,6,'not all cloth categories covered');
 const prev=seenRoleGeom.get(role);
 if(prev)assert.strictEqual(after[0].geometry,prev,'cloth geometry should be cached across bots');
 else seenRoleGeom.set(role,after[0].geometry);
 const geomNear=after.map(n=>n.geometry);
 now.setVisualDetailDistance(60);
 for(let i=0;i<after.length;i++){
  assert(after[i].geometry!==geomNear[i],'far LOD did not swap cloth '+i);
  assert(after[i].geometry.getAttribute('position').count<=geomNear[i].getAttribute('position').count,
   'far LOD is heavier '+i);
 }
 now.setVisualDetailDistance(10);
 for(let i=0;i<after.length;i++)assert.strictEqual(after[i].geometry,geomNear[i],'near LOD did not return');
 assert(now.head.children.some(n=>n.name==='v246_integrated_helmet'),'V246 helmet regression');
 report.push({team,role,variant,clothMeshes:after.length,kinds:[...kinds],measurements});
}
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v247-textile-comparison.json',
 JSON.stringify({cases:report.length,drawCallIncrease:0,rows:report},null,2));
console.log('V247 tailored textile PASS',report.length,'models',
 'kinds',6,'no new draw calls','near/mid/far LOD tested');
