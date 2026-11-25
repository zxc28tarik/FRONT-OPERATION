import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';

function factory(file){
  const s=fs.readFileSync(file,'utf8');
  const a=s.indexOf('      let SOLDIER_SHARED = null;');
  const b=s.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
  assert(a>=0&&b>a,'soldier factory not found');
  return new Function('THREE',s.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
}
const baseline=process.env.FO_CHARACTER_BASELINE;
assert(baseline&&fs.existsSync(baseline),'FO_CHARACTER_BASELINE is required');
const old=factory(baseline),now=factory('index.html');
const box=n=>{n.geometry.computeBoundingBox();return n.geometry.boundingBox.getSize(new THREE.Vector3());};
const meshCount=m=>{let c=0;m.root.traverse(n=>{if(n.isMesh)c++;});return c;};
const rows=[];
for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
  const a=old(team,role,variant),b=now(team,role,variant);
  for(const key of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])
    assert(a[key].position.distanceTo(b[key].position)<1e-7,key+' anchor moved');

  const helmet=b.head.children.find(n=>n.name==='v246_integrated_helmet');
  assert(helmet,'V246 shell missing '+role);
  const oldHelmet=a.head.children.find(n=>/helmet/.test(n.name)&&n.isMesh);
  assert(oldHelmet,'baseline helmet missing '+role);
  const oldSize=box(oldHelmet),newSize=box(helmet);
  for(const [x,y] of [[oldSize.x,newSize.x],[oldSize.y,newSize.y],[oldSize.z,newSize.z]])
    assert(y/x>.93&&y/x<1.07,'helmet envelope drift '+role);
  const changed=Math.abs(oldSize.x-newSize.x)+Math.abs(oldSize.y-newSize.y)+Math.abs(oldSize.z-newSize.z);
  assert(changed>.00015,'helmet contour unchanged '+role);

  assert(b.head.children.some(n=>n.name==='v246_helmet_retention_band'),'band missing');
  assert(b.head.children.some(n=>n.name==='v246_nvg_mount'),'NVG mount missing');
  assert(b.head.children.some(n=>n.name==='v246_eye_protection'),'eye protection missing');
  assert.equal(b.head.children.filter(n=>n.name==='v246_hearing_protection').length,2,'ear protection count');
  assert.equal(b.head.children.filter(n=>n.name==='v246_accessory_rail').length,2,'rail count');
  const retention=b.head.children.find(n=>n.name==='v246_chin_retention');
  assert(retention&&retention.children.length===(role==='heavy'?5:3),'retention kit missing '+role);

  const nearMeshes=meshCount(b),oldMeshes=meshCount(a);
  assert(nearMeshes-oldMeshes<=(role==='heavy'?5:3),'near draw-call budget exceeded '+role);
  assert(retention.visible,'near retention should start visible');
  b.setVisualDetailDistance(30);
  assert.equal(retention.visible,false,'retention must hide at mid LOD');
  const highCount=helmet.geometry.getAttribute('position').count;
  b.setVisualDetailDistance(60);
  const lowCount=helmet.geometry.getAttribute('position').count;
  assert(lowCount<=highCount,'helmet LOD did not simplify');
  assert(helmet.visible,'helmet shell cannot disappear');
  b.setVisualDetailDistance(10);
  assert(retention.visible,'retention must return at near LOD');

  rows.push({team,role,variant,oldSize:oldSize.toArray(),newSize:newSize.toArray(),meshDelta:nearMeshes-oldMeshes,highCount,lowCount});
}
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v246-helmet-comparison.json',JSON.stringify({cases:rows.length,rows},null,2));
console.log('V246 helmet/protection PASS',rows.length,'models','max mesh delta',Math.max(...rows.map(r=>r.meshDelta)));
