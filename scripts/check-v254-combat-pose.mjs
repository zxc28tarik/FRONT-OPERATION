import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const baseline=process.env.FO_CHARACTER_BASELINE;
assert(baseline&&fs.existsSync(baseline),'FO_CHARACTER_BASELINE must be V253 HTML');
const html=fs.readFileSync('index.html','utf8');
const old=fs.readFileSync(baseline,'utf8');
const extract=(s,start,end)=>{
 const a=s.indexOf(start),b=s.indexOf(end,a+start.length);
 assert(a>=0&&b>a,'source bounds '+start);return s.slice(a,b);
};
const combat=new Function(extract(html,'      function botVisualCombatPose(','      function botVisualFall(')+'return botVisualCombatPose;')();
const fall=new Function(extract(html,'      function botVisualFall(','      function updateBots(')+'return botVisualFall;')();
const oldCombat=new Function(extract(old,'      function botVisualCombatPose(','      function botVisualFall(')+'return botVisualCombatPose;')();
const oldFall=new Function(extract(old,'      function botVisualFall(','      function updateBots(')+'return botVisualFall;')();
const clamp01=v=>assert(v>=0&&v<=1&&Number.isFinite(v),'pose envelope out of bounds '+v);
let scalarCases=0;
for(const role of ['assault','medic','engineer','sniper','heavy']){
 for(const p of [0,.015,.08,.12,.2,.25,.35,.5,.7,.85,.9,.98,1]){
  const time=3.25;
  const pose=combat(.036,time*(1-p),time,role);
  for(const k of ['kick','reload','swap'])clamp01(pose[k]);
  if(p===0||p===1){assert(pose.swap<.00001,'magazine must be seated at reload boundaries');}
  if(p>.35&&p<.7)assert(pose.swap>.8,'middle reload should acquire and hold magazine');
  if(p===.5){assert(pose.reload>.8,'weapon should stay lowered during manipulation');}
  scalarCases++;
 }
 const noReload=combat(.055,0,0,role);
 assert.equal(noReload.reload,0);assert.equal(noReload.swap,0);
 const prior=oldCombat(.055,0,0,role);
 assert.equal(noReload.kick,prior.kick,'muzzle pulse scaling must be preserved');
 for(const side of [-1,1])for(const crouch of [0,.5,1]){
  let last=null;
  for(let i=0;i<=20;i++){
   const t=i/20,p=fall(t,side,role,crouch);
   for(const [key,val] of Object.entries(p))assert(Number.isFinite(val),'non-finite fall '+key);
   assert(p.pitch>=0&&p.pitch<1.6,'fall pitch out of envelope');
   assert(p.drop>=0&&p.drop<=.46,'fall drop out of envelope');
   assert(Math.abs(p.roll)<=.32,'fall roll out of envelope');
   assert(p.leftKnee>=-1e-6&&p.rightKnee>=-1e-6,'fall knee cannot reverse');
   assert(Math.abs(p.leftFoot)<=.12&&Math.abs(p.rightFoot)<=.13,'fall ankle overrotated');
   if(i===0){assert(Math.abs(p.leftKnee)<1e-7&&Math.abs(p.rightKnee)<1e-7,'death must start at live pose');}
   if(last)assert(p.drop>=last.drop-1e-8,'death drop must not rebound');
   last=p;scalarCases++;
  }
  const atMid=fall(.5,side,role,crouch);
  assert(Math.abs(atMid.leftKnee-atMid.rightKnee)>.1,'death legs still mirrored');
 }
 const heavy=.5; if(role==='heavy'){
  assert(fall(.5,1,'heavy',0).pitch<fall(.5,1,'assault',0).pitch,'heavy fall weight missing');
 }
 assert(oldFall(.5,1).leftKnee===undefined,'V253 baseline should not have V254 asymmetric knee');
}
const make=source=>{
 const a=source.indexOf('      let SOLDIER_SHARED = null;');
 const b=source.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
 assert(a>=0&&b>a,'soldier factory missing');
 return new Function('THREE',source.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
};
const baseFactory=make(old),newFactory=make(html);
const meshes=root=>{const all=[];root.traverse(n=>{if(n.isMesh)all.push(n);});return all;};
const vertexMatch=(a,b)=>{
 const p=a.geometry.getAttribute('position'),q=b.geometry.getAttribute('position');
 assert.equal(p.count,q.count,'character geometry resolution changed');
 for(let i=0;i<p.count;i++)if(Math.abs(p.getX(i)-q.getX(i))>1e-8||
  Math.abs(p.getY(i)-q.getY(i))>1e-8||Math.abs(p.getZ(i)-q.getZ(i))>1e-8)
  throw Error('V254 changed approved character mesh geometry');
};
let firstWeapon=null;
const checks=[];
for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])
for(let variant=0;variant<3;variant++){
 const a=baseFactory(team,role,variant),b=newFactory(team,role,variant);
 const before=meshes(a.root),after=meshes(b.root);
 assert.equal(after.length,before.length,'new mesh / drawcall');
 for(let i=0;i<before.length;i++){
  vertexMatch(before[i],after[i]);
  assert(before[i].position.distanceTo(after[i].position)<1e-9,'character mount altered');
 }
 for(const k of ['head','weaponPivot','muzzleFlash','leftHip','rightHip','leftKnee','rightKnee'])
  assert(a[k].position.distanceTo(b[k].position)<1e-9,'protected weapon/limb anchor changed');
 const magazine=b.weaponPivot.children.find(n=>n.name==='v119_visual_magazine');
 assert(magazine,'missing approved magazine');
 const rest=b.weaponPivot.position.clone();
 const magRest=magazine.position.clone(),magRot=magazine.rotation.clone();
 const pitch=b.weaponPivot.rotation.x;
 b.setVisualCombatPose({kick:1,reload:0,swap:0});
 assert(b.weaponPivot.position.z<rest.z,'muzzle recoil lacks visual travel');
 assert.equal(b.weaponPivot.rotation.x,pitch,'V254 changed gameplay aim rotation');
 b.setVisualCombatPose({kick:0,reload:1,swap:1});
 assert(b.weaponPivot.position.y<rest.y,'reload no longer lowers firearm');
 assert(magazine.position.distanceTo(magRest)>.05,'magazine visual displacement disappeared');
 assert(Math.abs(magazine.rotation.y-magRot.y)>.01,'magazine lacks lateral alignment stage');
 for(const tilt of [-1.1,-.5,0,.5,1.1]){
  b.weaponPivot.rotation.x=tilt;
  b.updateVisualGrip(tilt,.6);
  const hands=b.upperBody.children.filter(n=>/^v107_(support|trigger)_hand$/.test(n.name));
  assert.equal(hands.length,2,'IK hands missing');
  assert(hands.every(h=>h.position.distanceTo(b.weaponPivot.position)<.34),'hand slips too far from weapon');
 }
 b.weaponPivot.rotation.x=pitch;
 b.resetVisualCombatPose();
 assert(b.weaponPivot.position.distanceTo(rest)<1e-7,'weapon rest pose not restored');
 assert(magazine.position.distanceTo(magRest)<1e-7,'magazine rest position not restored');
 assert(Math.abs(magazine.rotation.x-magRot.x)<1e-8,'magazine rotation x not restored');
 assert(Math.abs(magazine.rotation.y-magRot.y)<1e-8,'magazine rotation y not restored');
 assert(Math.abs(magazine.rotation.z-magRot.z)<1e-8,'magazine rotation z not restored');
 b.setVisualDetailDistance(60);
 const low=meshes(b.root).reduce((sum,n)=>sum+n.geometry.getAttribute('position').count,0);
 b.setVisualDetailDistance(8);
 const high=meshes(b.root).reduce((sum,n)=>sum+n.geometry.getAttribute('position').count,0);
 assert(low<high,'distant LOD not preserved');
 const weapons=after.filter(n=>{let parent=n;while(parent){if(parent===b.weaponPivot)return true;parent=parent.parent;}return false;});
 if(!firstWeapon)firstWeapon=weapons.length;
 else assert(weapons.length>0,'weapon vanished');
 checks.push({team,role,variant,low,high,additionalMesh:0});
}
assert.equal(checks.length,30);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v254-combat-pose.json',
 JSON.stringify({models:checks.length,poseCases:scalarCases,extraMeshes:0,checks},null,2));
console.log('V254 combat, reload, death and IK PASS:',scalarCases,'pose checks,',checks.length,
 'model comparisons and preserved weapon anchors/LOD');
