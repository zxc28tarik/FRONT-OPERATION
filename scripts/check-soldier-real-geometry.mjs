import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('      let SOLDIER_SHARED = null;'),end=html.indexOf('      // =========================================================================\n      // 8. COLLISION',start);
const api=new Function('THREE',html.slice(start,end)+'\nreturn {base:createBotSoldierMesh,enhanced:createEnhancedBotSoldierMesh};')(THREE);
assert.equal(THREE.REVISION,'128');
const countVisible=root=>{let n=0;const walk=(o,visible)=>{const on=visible&&o.visible;if(on&&o.isMesh)n++;for(const c of o.children)walk(c,on);};walk(root,true);return n;};
let models=0,nearTotal=0,farTotal=0;
for(const team of ['blue','red'])for(const cls of ['assault','medic','engineer','sniper','heavy']){
 const m=api.enhanced(team,cls,0),alt=api.enhanced(team,cls,1),alt2=api.enhanced(team,cls,2);
 const hands=m.upperBody.children.filter(n=>/^v107_(support|trigger)_hand$/.test(n.name));
 assert.equal(hands.length,2);assert.equal(typeof m.updateVisualGrip,'function');
 const muzzle=m.muzzleFlash.position.clone();
 for(const pitch of [-1.1,-.8,-.4,0,.4,.8,1.1]){
   m.weaponPivot.rotation.x=pitch;m.updateVisualGrip(pitch);
   for(const h of hands)assert(h.position.toArray().every(Number.isFinite)&&h.position.distanceTo(m.weaponPivot.position)<.32);
   const limbs=m.upperBody.children.filter(n=>n.name==='v100_anatomy');
   assert(limbs.every(n=>n.position.toArray().every(Number.isFinite)&&n.quaternion.toArray().every(Number.isFinite)&&n.scale.y>0&&n.scale.y<1.8));
   assert(m.muzzleFlash.position.equals(muzzle));
 }
 // Combat pose keeps pivot angle fixed, follows real state and restores rest.
 const mag=m.weaponPivot.children.find(n=>n.name==='v119_visual_magazine');assert(mag,'class reload magazine');
 const magRest=mag.position.clone();
 const rest=m.weaponPivot.position.clone(),pitch=m.weaponPivot.rotation.x;
 m.setVisualCombatPose({kick:1,reload:0,swap:0});
 assert(m.weaponPivot.position.z<rest.z&&m.weaponPivot.rotation.x===pitch);
 m.setVisualCombatPose({kick:0,reload:1,swap:1});
 assert(m.weaponPivot.position.y<rest.y&&m.weaponPivot.rotation.x===pitch);
 assert(hands.every(h=>h.position.toArray().every(Number.isFinite)));assert(mag.position.distanceTo(magRest)>.05);
 m.resetVisualCombatPose();assert(m.weaponPivot.position.distanceTo(rest)<.00001);assert(mag.position.distanceTo(magRest)<.00001);
 let camo=0;m.root.traverse(n=>{if(n.material?.name==='V112 camouflage')camo++;});
 assert(camo>0);
 const head=m.head.children.find(n=>n.name==='v106_face'),other=alt.head.children.find(n=>n.name==='v106_face');
 assert(head.geometry!==other.geometry&&head.material!==other.material);assert(head.geometry===api.enhanced(team,cls,0).head.children.find(n=>n.name==='v106_face').geometry);
 assert.equal(alt.root.userData.visualVariant,1);assert.equal(alt2.root.userData.visualVariant,2);
 if(team==='red'){
   assert.equal(m.root.userData.foMilisOutfit,0,'outfit 0 charcoal');
   assert.equal(alt.root.userData.foMilisOutfit,1,'outfit 1 earth');
   assert.equal(alt2.root.userData.foMilisOutfit,0,'only two outfit palettes');
   for(const [i,x] of [m,alt,alt2].entries()){
     assert.equal(x.root.userData.foMilisHeadwear,i,'headwear variant');
     assert(x.head.children.some(n=>n.name==='fo_milis02_headwear'&&n.visible),'visible civilian headwear');
     assert(x.head.children.some(n=>n.name==='v106_face'&&n.visible),'anatomical face exposed');
     assert(x.upperBody.children.some(n=>n.name==='fo_milis02_jacket'),'jacket attached');
     assert(x.upperBody.children.filter(n=>n.name.startsWith('fo_milis02_')).every(n=>!n.castShadow),
       'militia details add no shadow draws');
     const helm=x.head.children.find(n=>n.name==='v246_integrated_helmet');
     assert(!helm||!helm.visible,'military helmet cannot remain visible');
   }
   assert.equal(m.upperBody.children.find(n=>n.name==='fo_milis02_jacket').geometry,
     alt.upperBody.children.find(n=>n.name==='fo_milis02_jacket').geometry,'static jacket geometry shared');
   assert.notEqual(m.upperBody.children.find(n=>n.name==='fo_milis02_jacket').material,
     alt.upperBody.children.find(n=>n.name==='fo_milis02_jacket').material,'two actual textile materials');
 }else{
   for(const x of [m,alt,alt2])assert(!x.root.userData.foFaction,'soldier cannot inherit militia appearance');
 }

 const faceGroup=x=>x.head.children.find(n=>n.name==='v99_head');
 assert(faceGroup(m).children.some((n,i)=>n.geometry!==faceGroup(alt).children[i].geometry),'visible face geometry differs');
 assert.equal(faceGroup(m).children[0].geometry,faceGroup(api.enhanced(team,cls,0)).children[0].geometry,'same variant shares face geometry');
 const shell=m.head.children.find(n=>n.userData.v150Shell);
 assert(shell&&shell.material.bumpMap&&shell.material.roughness>=.73&&shell.material.roughness<=.93);
 const pack=m.upperBody.children.find(n=>n.userData.v149Pack);
 if(['medic','engineer','heavy'].includes(cls)){
   assert(pack&&pack.geometry.boundingBox&&pack.geometry.getAttribute('position').count>100);
   assert.equal(pack.geometry,alt.upperBody.children.find(n=>n.userData.v149Pack).geometry);
 }else assert(!pack);
 m.root.traverse(n=>{if(!n.isMesh)return;const p=n.geometry.getAttribute('position'),normal=n.geometry.getAttribute('normal');assert(p.array.every(Number.isFinite)&&normal.array.every(Number.isFinite));});
 const ankles=[m.leftKnee,m.rightKnee].map(n=>n.children.find(c=>c.name==='v132_ankle'));
 assert(ankles.every(a=>a&&a.children.length===4),'articulated boots and overlays');
 assert(ankles.every(a=>a.children.some(n=>n.name==='v136_foot_overlay')));
 m.setVisualFootPose(.15,-.2);assert.equal(ankles[0].rotation.x,.15);assert.equal(ankles[1].rotation.x,-.2);
 m.resetVisualCombatPose();assert(ankles.every(a=>a.rotation.x===0));
 let folds=0,weapon=0;m.root.traverse(n=>{if(n.userData.v129Sculpted)folds++;if(n.userData.v131Refined)weapon++;});
 assert.equal(folds,10);assert(weapon>=2);let newAnatomy=0;m.root.traverse(n=>{if(n.userData.v245Anatomy)newAnatomy++;});assert.equal(newAnatomy,10);assert(head.userData.v245Face);assert(m.root.children.some(n=>n.userData.v245Pelvis));
 const carriers=m.upperBody.children.filter(n=>n.userData.v139Carrier);
 assert.equal(carriers.length,2);
 assert(carriers.every(n=>n.geometry.boundingBox&&n.geometry.getAttribute('position').count>100));
 const twin=api.enhanced(team,cls,0);
 assert.equal(carriers[0].geometry,twin.upperBody.children.find(n=>n.userData.v139Carrier).geometry);
 let dense=0;m.root.traverse(n=>{if(n.userData.v129Sculpted&&n.geometry.getAttribute('position').count>300)dense++;});
 assert.equal(dense,10);
 const cloth=[];m.root.traverse(n=>{if(n.userData.v129Sculpted)cloth.push({n,high:n.geometry});});
 const joints=[];m.root.traverse(n=>{if(n.userData.v154Joint)joints.push({n,high:n.geometry,kind:n.userData.v154Joint});});
 assert.equal(joints.length,8,'two hip, knee, shoulder and elbow textile bridges');
 for(const kind of ['hip','knee','shoulder','elbow'])assert.equal(joints.filter(j=>j.kind===kind).length,2);
 for(const j of joints){
   assert(j.high.boundingBox&&j.high.getAttribute('position').count>=375&&j.n.userData.v240TextileBridge);
   if(team==='blue')assert(j.n.material.name==='V112 camouflage','soldier joint camouflage unchanged');
   else{
     const expected=['hip','knee'].includes(j.kind)?0x383f44:0x454c4a;
     assert.equal(j.n.material.color.getHex(),expected,'militia joint matches civilian cloth');
   }
   assert(j.n.quaternion.toArray().every(Number.isFinite));
 }
 for(const pitch of [-1.1,-.6,0,.6,1.1]){
   m.weaponPivot.rotation.x=pitch;m.updateVisualGrip(pitch);
   assert(joints.every(j=>j.n.quaternion.toArray().every(Number.isFinite)));
   assert(m.muzzleFlash.position.equals(muzzle));
 }
 m.weaponPivot.rotation.x=0;m.resetVisualCombatPose();
 const jointTwin=[];twin.root.traverse(n=>{if(n.userData.v154Joint)jointTwin.push(n.geometry);});
 assert(joints.every((j,i)=>j.high===jointTwin[i]),'joint geometry shared');
 const cuts=[],textiles=[],contacts=[];
 m.root.traverse(n=>{if(n.userData.v157Cut)cuts.push(n);if(n.userData.v164Textile)textiles.push(n);if(n.userData.v163Contact)contacts.push(n);});
 assert.equal(cuts.length,4);assert(ankles.every(a=>a.children.some(n=>n.userData.v158Toe)));
 assert(textiles.length>12);for(const n of textiles){
   const mat=n.material;assert(mat.map&&mat.bumpMap&&mat.roughnessMap);
   assert(mat.map!==mat.bumpMap&&mat.bumpMap!==mat.roughnessMap);
   // V249 upgrades carrier/pack textile finishes with a shared 64px material
   // micro-map. Original uniform V164 textures must remain 256px and repeat twice.
   const v249=n.userData.v249Finish;
   const militiaWeave=team==='red'&&mat.name==='FO_MILIS03_FABRIC';
   assert.equal(mat.bumpMap.image.width,militiaWeave?64:v249&&v249!=='uniform'?64:256);
   assert.equal(mat.bumpMap.repeat.x,militiaWeave?3:v249&&v249!=='uniform'?3:2);
   if(militiaWeave){
     assert(mat.map.image.width===64&&mat.roughnessMap.image.width===64,'64px shared fabric map trio');
     assert(mat.bumpScale>0&&mat.bumpScale<=.009,'subtle, physically non-displacing cloth bump');
   }
 }
 assert.equal(contacts.length,2);
 assert(contacts.every(n=>n.material.vertexColors&&n.geometry.getAttribute('color').array.some(v=>v<.99)));
 const headHigh=head.geometry;assert(head.userData.v170Head);
 assert(shell.geometry.getAttribute('position').count>300);
 const equipment=[];m.root.traverse(n=>{if(n.userData.v176Equipment)equipment.push(n);});
 for(const kind of ['belt','glove','kneepad','pouch','admin']){
  assert(equipment.some(n=>n.userData.v176Equipment===kind),'missing '+kind);
 }
 assert.equal(equipment.filter(n=>n.userData.v176Equipment==='glove').length,2);
 assert.equal(equipment.filter(n=>n.userData.v176Equipment==='kneepad').length,2);
 assert(equipment.every(n=>n.geometry.boundingBox&&n.geometry.getAttribute('position').array.every(Number.isFinite)));
 assert.equal(m.root.userData.v182Role,cls);
 assert.equal(m.root.children.find(n=>n.userData.v176Equipment==='belt').geometry,twin.root.children.find(n=>n.userData.v176Equipment==='belt').geometry);
 const helmetHigh=shell.geometry;assert(shell.userData.v197HelmetLod);
 const knee=m.leftKnee.children.find(n=>n.userData.v154Joint==='knee');
 assert(knee&&typeof m.updateVisualJointFit==='function');
 m.leftKnee.rotation.x=0;m.updateVisualJointFit();const neutral=knee.scale.z;
 m.leftKnee.rotation.x=1.5;m.updateVisualJointFit();assert(knee.scale.z>neutral&&knee.scale.z<neutral*1.09);
 m.leftKnee.rotation.x=0;m.updateVisualJointFit();assert(Math.abs(knee.scale.z-neutral)<1e-6);
 const hip=m.leftHip.children.find(n=>n.userData.v154Joint==='hip');assert(hip);
 m.leftHip.rotation.x=0;m.leftHip.rotation.z=0;m.updateVisualJointFit();const hipNeutral=hip.scale.z;
 m.leftHip.rotation.x=.7;m.leftHip.rotation.z=.3;m.updateVisualJointFit();assert(hip.scale.z>hipNeutral&&hip.scale.z<hipNeutral*1.041);
 m.leftHip.rotation.set(0,0,0);m.updateVisualJointFit();assert(Math.abs(hip.scale.z-hipNeutral)<1e-6);
 const near=countVisible(m.root);
 const armBands=m.upperBody.children.filter(n=>n.geometry===api.base(team,cls).upperBody.children.find(c=>c.geometry?.parameters?.height===.065)?.geometry);
 const closeGroups=[m.head.children.find(n=>n.name==='v99_close_face'),m.upperBody.children.find(n=>n.name==='v99_close_rig')];
 assert(closeGroups.every(g=>g&&g.children.length>0));
 assert(closeGroups.every(g=>g.visible===(team==='blue')),'soldiers retain tactical details; milis hide them');
 assert(m.root.children.some(n=>n.name==='v120_fitted_waist'));
 m.setVisualCombatPose({carry:1});assert(m.weaponPivot.position.y<rest.y);
 m.resetVisualCombatPose();assert(m.weaponPivot.position.distanceTo(rest)<.00001);
 m.setVisualDetailDistance(24);assert.equal(m.visualDetailLevel,1);const mid=countVisible(m.root);assert(closeGroups.every(g=>!g.visible));
 m.setVisualDetailDistance(22);assert.equal(m.visualDetailLevel,1);
 m.setVisualDetailDistance(50);assert.equal(m.visualDetailLevel,2);const far=countVisible(m.root);assert(cloth.every(c=>c.n.geometry!==c.high&&c.n.geometry.getAttribute('position').count<c.high.getAttribute('position').count));
 assert(joints.every(j=>j.n.geometry!==j.high&&j.n.geometry.getAttribute('position').count<j.high.getAttribute('position').count));
 assert(head.geometry!==headHigh&&head.geometry.getAttribute('position').count<headHigh.getAttribute('position').count);
 assert(shell.geometry!==helmetHigh&&shell.geometry.getAttribute('position').count<helmetHigh.getAttribute('position').count);
 assert(contacts.every(n=>n.geometry.getAttribute('color')));
 assert(near>mid&&mid>far&&m.head.visible&&m.weaponPivot.visible);
 m.setVisualDetailDistance(43);assert.equal(m.visualDetailLevel,2);
 m.setVisualDetailDistance(18);assert.equal(m.visualDetailLevel,0);assert.equal(countVisible(m.root),near);assert(cloth.every(c=>c.n.geometry===c.high));
 assert(joints.every(j=>j.n.geometry===j.high),'joint geometry returns to close detail');
 assert.equal(shell.geometry,helmetHigh);assert.equal(head.geometry,headHigh);assert.equal(m.head.parent,m.upperBody);assert.equal(m.muzzleFlash.parent,m.weaponPivot);
 nearTotal+=near;farTotal+=far;models+=3;
}
console.log('V200 candidate real Three.js PASS: '+models+' models; near '+nearTotal+' / far '+farTotal+' visible meshes across 10 representatives');
