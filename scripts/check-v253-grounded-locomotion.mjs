import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const baseline=process.env.FO_CHARACTER_BASELINE;
assert(baseline&&fs.existsSync(baseline),'FO_CHARACTER_BASELINE must be V252 HTML');

const source=fs.readFileSync('index.html','utf8');
const before=fs.readFileSync(baseline,'utf8');
function extract(s,start,end){
 const a=s.indexOf(start),b=s.indexOf(end,a+start.length);
 assert(a>=0&&b>a,'missing source anchors '+start);
 return s.slice(a,b);
}
const footPlants=new Function(extract(source,
 '      function botVisualFootPlants(','      // V189–V195:')+'return botVisualFootPlants;')();
const stance=new Function(extract(source,
 '      function botVisualStance(','      // V132–V134:')+'return botVisualStance;')();
const contact=new Function(extract(source,
 '      function botVisualLegContact(','      function botVisualDirection(')+'return botVisualLegContact;')();
const oldStance=new Function(extract(before,
 '      function botVisualStance(','      // V132–V134:')+'return botVisualStance;')();

const checkFinite=value=>{
 for(const [key,n] of Object.entries(value))
  assert(Number.isFinite(n),'invalid visual animation scalar '+key+': '+n);
};
let transitionCases=0,maxBank=0;
for(const role of ['assault','medic','engineer','sniper','heavy']){
 for(const speed of [0,.18,.45,1.5,3.2,5.4,6.8]){
  for(const crouch of [0,.4,1]){
   for(const side of [-1,0,1])for(const turnRate of [-9,-2,0,2,9]){
    let prev=null;
    for(let frame=0;frame<8;frame++){
     const phase=frame*Math.PI/4;
     const output=footPlants(prev,phase,speed,1,side,crouch,turnRate,.016,role);
     checkFinite(output);
     for(const key of ['left','right','move'])assert(output[key]>=0&&output[key]<=1,'plant weight outside range');
     assert(Math.abs(output.bank)<=.040001,'excessive body bank');
     assert(output.lean>=0&&output.lean<=.020001,'excessive forward lean');
     if(prev)assert(Math.abs(output.bank-prev.bank)<.009,'bank transition pops');
     maxBank=Math.max(maxBank,Math.abs(output.bank));
     prev=output;transitionCases++;
    }
   }
  }
 }
 const lo=footPlants(null,Math.PI/2,3.2,1,0,0,0,.016,role);
 const hi=footPlants(null,3*Math.PI/2,3.2,1,0,0,0,.016,role);
 assert(lo.left>lo.right+.5&&hi.right>hi.left+.5,'opposing stance phases incorrect');
 const settled=footPlants(null,0,0,0,0,1,0,.016,role);
 assert(settled.left>.75&&settled.right>.75,'both feet should plant while crouched stationary');
 const s0=stance(role,0,0,0,0,true);
 const s1=stance(role,0,0,1,0,true);
 const old=oldStance(role,0,0,1,0,true);
 assert(s1.stanceWidth>.014&&s1.stanceWidth<s0.stanceWidth,'crouched foot support still too narrow');
 assert(old.stanceWidth===0,'baseline expected zero crouched stance');
 const c1=contact(.20,.10,.16,.08,.52),c2=contact(.20,.10,.16,.08,.08);
 checkFinite(c1);checkFinite(c2);
 for(const c of [c1,c2]){
  assert(c.hip>=-1.15&&c.hip<=1.05,'contact hip invalid');
  assert(c.knee>=0&&c.knee<=1.85,'contact knee invalid');
  assert(Math.abs(c.foot)<=.48,'ankle correction out of bounds');
 }
}

const factory=src=>{
 const a=src.indexOf('      let SOLDIER_SHARED = null;');
 const b=src.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
 assert(a>=0&&b>a,'soldier factory source extraction failed');
 return new Function('THREE',src.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
};
const oldFactory=factory(before),newFactory=factory(source);
const meshes=root=>{const list=[];root.traverse(n=>{if(n.isMesh)list.push(n);});return list;};
const identity=(a,b)=>{
 const p=a.geometry.getAttribute('position'),q=b.geometry.getAttribute('position');
 assert.equal(p.count,q.count,'geometry vertex count drift');
 for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i)-q.getX(i))>1e-8||
 Math.abs(p.getY(i)-q.getY(i))>1e-8||Math.abs(p.getZ(i)-q.getZ(i))>1e-8)
 throw Error('V253 changed approved character surface geometry');
};
const cases=[];
for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])
for(let variant=0;variant<3;variant++){
 const old=oldFactory(team,role,variant),now=newFactory(team,role,variant);
 const a=meshes(old.root),b=meshes(now.root);
 assert.equal(a.length,b.length,'V253 added meshes/draw calls');
 for(let i=0;i<a.length;i++){
  identity(a[i],b[i]);
  assert(a[i].position.distanceTo(b[i].position)<1e-9,'V253 changed mesh mounting');
  assert(a[i].scale.distanceTo(b[i].scale)<1e-9,'V253 changed mesh scale');
 }
 for(const key of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])
  assert(old[key].position.distanceTo(now[key].position)<1e-9,'V253 moved protected game pivot');
 const high=b.reduce((n,m)=>n+m.geometry.getAttribute('position').count,0);
 now.setVisualDetailDistance(60);
 const low=meshes(now.root).reduce((n,m)=>n+m.geometry.getAttribute('position').count,0);
 assert(low<high,'V253 lost distant LOD');
 now.setVisualDetailDistance(8);
 assert.equal(meshes(now.root).reduce((n,m)=>n+m.geometry.getAttribute('position').count,0),high,'V253 lost near LOD');
 cases.push({team,role,variant,meshIncrease:0,nearVertices:high,farVertices:low});
}
assert.equal(cases.length,30);
assert(source.includes('Math.max(0,actualSpeed)*Math.max(0,dt)*strideRate'),
 'stride phase is not coupled to resolved world displacement');
assert(source.includes('const lf=contact(bot.mesh.leftHip,bot.mesh.leftKnee,g.left,feet.left)'),
 'left grounded IK not consuming plant weight');
assert(source.includes('const rf=contact(bot.mesh.rightHip,bot.mesh.rightKnee,g.right,feet.right)'),
 'right grounded IK not consuming plant weight');
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v253-grounded-locomotion.json',
 JSON.stringify({models:cases.length,transitionCases,maxBank,addedMeshes:0,cases},null,2));
console.log('V253 grounded locomotion PASS:',transitionCases,'visual stance transitions and',
 cases.length,'unchanged soldier models; no extra meshes or lost LOD');
