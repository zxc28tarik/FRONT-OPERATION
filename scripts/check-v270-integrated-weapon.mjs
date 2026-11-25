import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const latest=process.env.FO_WEAPON_PREVIOUS,baseline=process.env.FO_WEAPON_BASELINE;
assert(latest&&baseline&&fs.existsSync(latest)&&fs.existsSync(baseline),'V264 and V255 baselines required');
const old=fs.readFileSync(latest,'utf8'),original=fs.readFileSync(baseline,'utf8'),now=fs.readFileSync('index.html','utf8');
const start='      const WEAPON_MATS = {',end='      // =========================================================================\n      // 7. 3D BOT',collision='      // =========================================================================\n      // 8. COLLISION';
const cut=(s,a,b)=>{const x=s.indexOf(a),y=s.indexOf(b,x+a.length);assert(x>=0&&y>x);return s.slice(x,y);};
assert.equal(now.slice(0,now.indexOf(start)),original.slice(0,original.indexOf(start)));
assert.equal(now.slice(now.indexOf(collision)),old.slice(old.indexOf(collision)),'gameplay suffix changed in V265–270');
const reloadHook='        applyV260MagazinePose(vmRefs,player.reloading?\n          1-player.reloadTimer/Math.max(.01,player.reloadDuration):0);\n\n';
assert.equal(now.slice(now.indexOf(collision)).replace(reloadHook,''),original.slice(original.indexOf(collision)),'nonvisual gameplay changed across weapon package');
assert.equal(cut(now,'      function createBotSoldierMesh(team, classId) {',collision),cut(original,'      function createBotSoldierMesh(team, classId) {',collision),'approved V25 constructor not restored');
const vm=(s,newer)=>new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+cut(s,start,end)+
 '\nreturn {build(id){buildViewmodel(id);return {root:currentViewmodelMesh,refs:vmRefs};},group:viewmodelGroup'+
 (newer?',pose:applyV260MagazinePose,textures:V259_DETAIL_TEXTURES,materials:V259_DETAIL_MATERIALS':'')+'};')(THREE);
const soldier=s=>new Function('THREE',cut(s,'      let SOLDIER_SHARED = null;',collision)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
const nodes=root=>{const a=[];root.traverse(n=>a.push(n));return a;};
const close=(p,q,label)=>assert(p.distanceTo(q)<1e-6,label);
function transform(a,b,label){
 assert.equal(a.type,b.type,label);close(a.position,b.position,label+' position');
 close(a.scale,b.scale,label+' scale');assert.deepEqual(a.rotation.toArray(),b.rotation.toArray(),label+' rotation');
}
const triangles=g=>(g.index?.count??g.getAttribute('position').count)/3;
const bounds=(a,b,label)=>{a.computeBoundingBox();b.computeBoundingBox();close(a.boundingBox.min,b.boundingBox.min,label+' min');close(a.boundingBox.max,b.boundingBox.max,label+' max');};
const ids=['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf','knife','drone','m67','medkit','claymore'];
const ref=vm(original,false),prev=vm(old,false),candidate=vm(now,true),rows=[];
let poses=0,handCases=0;
for(const id of ids){
 const x=ref.build(id),p=prev.build(id),y=candidate.build(id);
 const u=nodes(x.root),v=nodes(p.root),w=nodes(y.root);
 assert.equal(u.length,w.length,id+' extra node since V255');assert.equal(v.length,w.length);
 let delta=0,cumulative=0,glove=0,utility=0;
 for(let i=0;i<w.length;i++){
  const a=u[i],b=v[i],c=w[i];transform(a,c,id);transform(b,c,id);
  if(!c.isMesh)continue;
  assert.equal(a.count,c.count,id+' instances changed');
  bounds(a.geometry,c.geometry,id);bounds(b.geometry,c.geometry,id);
  assert.equal(a.material.color?.getHex(),c.material.color?.getHex(),id+' palette changed');
  if(c.geometry.userData.v266Glove){
   assert.equal(b.geometry.type,'BoxGeometry');glove++;
  }else if(c.geometry.userData.v256Chamfer&&!b.geometry.userData.v256Chamfer){
   assert.equal(b.geometry.type,'BoxGeometry');utility++;
  }else assert.deepEqual(b.geometry.getAttribute('position').array,c.geometry.getAttribute('position').array,id+' unrelated mesh modified');
  assert(c.geometry.getAttribute('normal').array.every(Number.isFinite));
  delta+=triangles(c.geometry)-triangles(b.geometry);
  cumulative+=triangles(c.geometry)-triangles(a.geometry);
 }
 assert(glove>0,id+' glove refinement missing');
 assert(delta<=400,id+' final incremental triangle budget '+delta);
 assert(cumulative<=1200,id+' cumulative triangle budget '+cumulative);
 for(const key of ['muzzlePoint','ejectPoint','slideMesh','boltMesh','magazineMesh']){
  assert.equal(Boolean(x.refs[key]),Boolean(y.refs[key]));
  if(x.refs[key])assert.equal(u.indexOf(x.refs[key]),w.indexOf(y.refs[key]));
 }
 const m=y.refs.magazineMesh,h=y.refs.supportRest;
 if(m){
  const mp=m.position.clone(),mr=m.rotation.clone(),hp=h?.position.clone(),hr=h?.rotation.clone();
  const muzzle=y.refs.muzzlePoint.position.clone(),eject=y.refs.ejectPoint.position.clone();
  assert(h,id+' support hand missing');
  for(let k=0;k<=100;k++){
   candidate.pose(y.refs,k/100);poses++;handCases++;
   assert(m.position.distanceTo(mp)<=.030001);assert(h.mesh.position.distanceTo(hp)<=.016501);
   close(y.refs.muzzlePoint.position,muzzle,id);close(y.refs.ejectPoint.position,eject,id);
  }
  close(m.position,mp,id+' reload end');close(h.mesh.position,hp,id+' support end');
  candidate.pose(y.refs,.5);assert(h.mesh.position.distanceTo(hp)>.005);
  candidate.pose(y.refs,0);close(m.position,mp,id+' cancel');close(h.mesh.position,hp,id+' hand cancel');
  assert.deepEqual(m.rotation.toArray(),mr.toArray());assert.deepEqual(h.mesh.rotation.toArray(),hr.toArray());
 }
 rows.push({id,glove,utility,delta,cumulative,nodes:w.length});
}
assert.equal(poses,606);assert.equal(handCases,606);assert.equal(candidate.textures.size,3);
const shared=[...candidate.materials.values()];let sharedDisposals=0;
for(const m of shared)m.addEventListener('dispose',()=>sharedDisposals++);
let switches=0;
for(let repeat=0;repeat<3;repeat++)for(const id of ids){
 const root=candidate.group.children[0];
 const geos=[...new Set(nodes(root).filter(n=>n.geometry).map(n=>n.geometry))];
 const counts=new Map(geos.map(g=>[g,0]));
 for(const g of geos)g.addEventListener('dispose',()=>counts.set(g,counts.get(g)+1));
 candidate.build(id);switches++;
 assert.equal(candidate.group.children.length,1);assert([...counts.values()].every(n=>n===1),'geometry disposal not exactly once');
}
assert.equal(sharedDisposals,0);assert.deepEqual([...candidate.materials.values()],shared);
const beforeSoldier=soldier(original),lastSoldier=soldier(old),afterSoldier=soldier(now),soldierRows=[];
for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
 const x=beforeSoldier(team,role,variant),p=lastSoldier(team,role,variant),y=afterSoldier(team,role,variant);
 const u=nodes(x.root),v=nodes(p.root),w=nodes(y.root),weapon=new Set(nodes(y.weaponPivot));
 assert.equal(u.length,w.length);assert.equal(v.length,w.length);
 let finishes=0;
 for(let i=0;i<w.length;i++){
  const a=u[i],b=v[i],c=w[i];transform(a,c,role);transform(b,c,role);
  if(!c.isMesh)continue;
  assert.deepEqual(b.geometry.getAttribute('position').array,c.geometry.getAttribute('position').array,role+' V264 geometry drift');
  assert.equal(b.material.color.getHex(),c.material.color.getHex(),role+' finish repair changed appearance');
  assert.equal(b.material.roughness,c.material.roughness);assert.equal(b.material.metalness,c.material.metalness);
  if(c.userData.v263Finish)finishes++;
  if(!weapon.has(c)){
   assert.deepEqual(a.geometry.getAttribute('position').array,c.geometry.getAttribute('position').array,role+' character drift');
   assert.equal(a.material.color.getHex(),c.material.color.getHex());assert.equal(a.material.roughness,c.material.roughness);
  }
 }
 assert(finishes>=6,role+' missing visual finish');
 for(const k of ['weaponPivot','muzzleFlash','head','leftHip','rightHip','leftKnee','rightKnee'])close(x[k].position,y[k].position,role+' anchor');
 y.setVisualDetailDistance(60);y.setVisualDetailDistance(8);
 soldierRows.push({team,role,variant,finishes,nodes:w.length});
}
assert.equal(soldierRows.length,30);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v270-integrated-weapon.json',JSON.stringify({rows,soldierRows,poses,handCases,switches,textures:3},null,2));
console.log('V270 integrated acceptance PASS: 12 viewmodels, 30 character variants, 606 reload samples and 36 switches.');
