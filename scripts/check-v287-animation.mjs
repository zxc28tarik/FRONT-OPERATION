import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const old=fs.readFileSync(process.env.FO_V281_BASELINE,'utf8'),now=fs.readFileSync('index.html','utf8');
const start='      const WEAPON_MATS = {',end='      // =========================================================================\n      // 7. 3D BOT';
const cut=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return s.slice(i,j);};
assert.equal(now.slice(0,now.indexOf(start)),old.slice(0,old.indexOf(start)));
const wrapped=cut(now,'        // V287: isolate presentation transforms','      }\n\n      window.onload');
assert.equal(now.slice(now.indexOf(end)).replace(wrapped,'        renderer.render(scene, camera);\n'),old.slice(old.indexOf(end)),'simulation suffix or render loop unexpectedly changed');
assert.equal((now.match(/Math\.random\(/g)||[]).length,(old.match(/Math\.random\(/g)||[]).length);
const make=(s,isNew)=>new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+cut(s,start,end)+'\nreturn {build(id){buildViewmodel(id);return {root:currentViewmodelMesh,refs:vmRefs};},group:viewmodelGroup,legacy:applyV260MagazinePose'+(isNew?',begin:beginV287RenderPose,restore:restoreV287RenderPose,profiles:V287_POSES,shared:V259_DETAIL_MATERIALS':'')+'};')(THREE);
const before=make(old,false),after=make(now,true);
const ids=['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf','knife','drone','m67','medkit','claymore'];
assert.deepEqual(Object.keys(after.profiles),ids);
const nodes=o=>{const a=[];o.traverse(n=>a.push(n));return a;};
const transform=n=>[...n.position.toArray(),...n.rotation.toArray(),...n.scale.toArray()];
const snapshot=(group,root)=>[transform(group),...nodes(root).map(transform)];
const world=n=>n.getWorldPosition(new THREE.Vector3()).toArray();
const finite=n=>[...n.position.toArray(),n.rotation.x,n.rotation.y,n.rotation.z].every(Number.isFinite);
const triangle=g=>(g.index?.count||g.getAttribute('position').count)/3;
const baseActor={alive:true,ads:false,sprinting:false,fireCooldown:0,switchAnim:0,reloading:false,reloadTimer:0,reloadDuration:1,boltAnimTimer:0,slideKick:0,knifeSwingTimer:0};
const report=[];let samples=0,changed=0,flashChecks=0,adsChecks=0;
for(const id of ids){
 const a=before.build(id),b=after.build(id),u=nodes(a.root),v=nodes(b.root);
 assert.equal(u.length,v.length,id+' node count changed');
 assert.deepEqual(snapshot(before.group,a.root),snapshot(after.group,b.root),id+' initial pose changed');
 let triangles=0,meshes=0;
 for(let k=0;k<u.length;k++)if(u[k].isMesh){
  assert(v[k].isMesh);meshes++;
  assert.equal(u[k].geometry.type,v[k].geometry.type);
  assert.deepEqual(u[k].geometry.getAttribute('position').array,v[k].geometry.getAttribute('position').array);
  assert.equal(u[k].material.color?.getHex(),v[k].material.color?.getHex());
  triangles+=triangle(v[k].geometry);
 }
 const r=b.refs,pose=r.v287Pose;
 assert.equal(pose.id,id);
 const rest=snapshot(after.group,b.root);
 let motions=0;
 for(let step=0;step<=100;step++){
  const t=step/100,actor={...baseActor,switchAnim:1-t,sprinting:step>20&&step<70,
   reloading:step>0&&step<100,reloadTimer:1-t,boltAnimTimer:step>0&&step<100?.52*(1-t):0,
   slideKick:1-t,knifeSwingTimer:.24*(1-t)};
  const actorSnapshot=JSON.stringify(actor);
  const beforePose=snapshot(after.group,b.root),muzzle=world(r.muzzlePoint),eject=world(r.ejectPoint);
  assert(after.begin(r,actor,.016,false));
  assert(nodes(b.root).every(finite));assert(finite(after.group));
  if(JSON.stringify(snapshot(after.group,b.root))!==JSON.stringify(beforePose)){motions++;changed++;}
  after.restore(r);
  assert.deepEqual(snapshot(after.group,b.root),beforePose,id+' restored transform mismatch');
  assert.deepEqual(world(r.muzzlePoint),muzzle,id+' muzzle drift after render');
  assert.deepEqual(world(r.ejectPoint),eject,id+' eject drift after render');
  assert.equal(JSON.stringify(actor),actorSnapshot,id+' gameplay actor mutated');
  samples++;
 }
 assert(motions>0,id+' missing presentation movement');
 for(const actor of [{...baseActor,ads:true,switchAnim:.5,sprinting:true},{...baseActor,fireCooldown:.1,switchAnim:.5,sprinting:true}]){
  const muzzle=world(r.muzzlePoint),eject=world(r.ejectPoint);
  after.begin(r,actor,.016,actor.fireCooldown>0);
  assert.deepEqual(world(r.muzzlePoint),muzzle,id+' active sight/muzzle drift');
  assert.deepEqual(world(r.ejectPoint),eject,id+' active ejection drift');
  after.restore(r);if(actor.ads)adsChecks++;else flashChecks++;
 }
 assert(!after.begin(r,{...baseActor,alive:false},.016));after.restore(r);
 assert.deepEqual(snapshot(after.group,b.root),rest,id+' death/cancel pose mismatch');
 b.root.visible=false;assert(!after.begin(r,baseActor,.016));b.root.visible=true;
 assert(after.begin(r,{...baseActor,switchAnim:.5},.016));
 try{throw Error('synthetic renderer fault');}catch(e){assert.equal(e.message,'synthetic renderer fault');}finally{after.restore(r);}
 assert.deepEqual(snapshot(after.group,b.root),rest,id+' exception cleanup');
 report.push({id,meshes,triangles,motions});
}
assert.equal(samples,1212);
const shared=[...after.shared.values()];let sharedDisposals=0;for(const mat of shared)mat.addEventListener('dispose',()=>sharedDisposals++);
let switches=0;
for(let cycle=0;cycle<3;cycle++)for(const id of ids){
 const prior=after.group.children[0];
 const geos=[...new Set(nodes(prior).filter(n=>n.geometry).map(n=>n.geometry))];
 const counts=new Map(geos.map(g=>[g,0]));
 for(const g of geos)g.addEventListener('dispose',()=>counts.set(g,counts.get(g)+1));
 const b=after.build(id);switches++;
 assert.equal(prior.parent,null);assert.equal(after.group.children.length,1);
 assert([...counts.values()].every(n=>n===1));assert(!b.refs.v287Pose.active);
}
assert.equal(sharedDisposals,0);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v287-animation-regression.json',JSON.stringify({samples,changed,flashChecks,adsChecks,switches,report,simulationSourceUnchanged:true},null,2));
console.log('V287 PASS: 12 unchanged models, 1212 visual poses, 36 switches, exact simulation restore, ADS and muzzle anchors preserved.');
