import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
function factory(file){const s=fs.readFileSync(file,'utf8'),a=s.indexOf('      let SOLDIER_SHARED = null;'),b=s.indexOf('      // =========================================================================\n      // 8. COLLISION',a);return new Function('THREE',s.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);}
const old=factory(process.env.FO_CHARACTER_BASELINE),now=factory('index.html');
const rows=[];let cases=0;
const collect=m=>{const a=[];m.root.traverse(n=>{if(n.userData.v129Sculpted||n.name==='v106_face'||n.name==='v120_fitted_waist')a.push(n);});return a;};
const bounds=n=>{n.geometry.computeBoundingBox();return n.geometry.boundingBox.getSize(new THREE.Vector3()).toArray();};
for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
 const a=old(team,role,variant),b=now(team,role,variant),aa=collect(a),bb=collect(b);
 assert.equal(aa.length,12);assert.equal(bb.length,12);
 for(const key of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])assert(a[key].position.distanceTo(b[key].position)<1e-7,key+' anchor moved');
 let changed=0;const dimensions=[];
 for(let i=0;i<aa.length;i++){
  const x=bounds(aa[i]),y=bounds(bb[i]);assert(y.every(Number.isFinite));
  if(x.some((v,j)=>Math.abs(v-y[j])>.0005))changed++;
  assert(y.every((v,j)=>v/x[j]>.78&&v/x[j]<1.25),'anatomy bounds exceeded '+role+' '+i);
  dimensions.push({part:bb[i].name,old:x,new:y});
 }
 assert(changed>=8,'insufficient visible silhouette change');
 for(const pitch of [-1.1,-.6,0,.6,1.1]){
  a.weaponPivot.rotation.x=b.weaponPivot.rotation.x=pitch;a.updateVisualGrip(pitch);b.updateVisualGrip(pitch);
  for(const name of ['v107_support_hand','v107_trigger_hand'])assert(a.upperBody.children.find(n=>n.name===name).position.distanceTo(b.upperBody.children.find(n=>n.name===name).position)<1e-7);
 }
 const verts=m=>{let sum=0;m.root.traverse(n=>{if(n.isMesh&&n.visible)sum+=n.geometry.getAttribute('position').count;});return sum;};
 rows.push({team,role,variant,changed,oldVertices:verts(a),newVertices:verts(b),dimensions});cases++;
}
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v245-anatomy-comparison.json',JSON.stringify({cases,rows},null,2));
console.log('V245 anatomy and protected anchors PASS',cases,'models', 'changed surfaces minimum',Math.min(...rows.map(x=>x.changed)));
