import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
function factory(path){
 const s=fs.readFileSync(path,'utf8');
 const a=s.indexOf('      let SOLDIER_SHARED = null;');
 const b=s.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
 assert(a>=0&&b>a,'soldier extraction missing');
 return new Function('THREE',s.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;')(THREE);
}
const base=process.env.FO_CHARACTER_BASELINE;
assert(base&&fs.existsSync(base),'FO_CHARACTER_BASELINE must be V247 HTML');
const earlier=factory(base),candidate=factory('index.html');
const bounds=n=>{if(!n.geometry.boundingBox)n.geometry.computeBoundingBox();return n.geometry.boundingBox;};
const face=(n,front)=>n.position.z+(front?bounds(n).max.z:bounds(n).min.z)*n.scale.z;
const meshes=m=>{let count=0;m.root.traverse(n=>{if(n.isMesh)count++;});return count;};
const roles=['assault','medic','engineer','sniper','heavy'];
const rows=[];
for(const team of ['blue','red'])for(const role of roles)for(let variant=0;variant<3;variant++){
 const old=earlier(team,role,variant),now=candidate(team,role,variant);
 assert.equal(meshes(old),meshes(now),'mesh / draw-call count drift');
 for(const key of ['leftHip','rightHip','leftKnee','rightKnee','head','weaponPivot','muzzleFlash'])
  assert(old[key].position.distanceTo(now[key].position)<1e-8,'gameplay anchor changed '+key);
 const oldFront=old.upperBody.children.find(n=>n.name==='v105_role_vest'&&n.position.z>0);
 const front=now.upperBody.children.find(n=>n.name==='v105_role_vest'&&n.position.z>0);
 const back=now.upperBody.children.find(n=>n.name==='v105_role_vest'&&n.position.z<0);
 assert(oldFront&&front&&back,'carrier panel missing');
 assert.equal(oldFront.position.z,front.position.z,'armor pivot moved');
 const frontZ=face(front,true),backZ=face(back,false);
 const pouches=now.upperBody.children.filter(n=>['pouch','admin'].includes(n.userData?.v176Equipment));
 assert.equal(pouches.length,4,'four cargo pouches required');
 const gaps=[];
 for(const n of pouches){
  assert(n.userData.v248CarrierMounted,'pouch not refitted');
  const exposed=n.position.z+bounds(n).min.z*n.scale.z;
  const error=Math.abs(exposed-frontZ-.0015);
  assert(error<.012,'pouch floats or embeds '+role+' '+error);
  assert(Math.abs(n.position.x)<=.165,'pouch outside carrier');
  gaps.push(error);
 }
 const straps=now.upperBody.children.filter(n=>n.userData?.v248HarnessFit);
 assert.equal(straps.length,2,'existing shoulder straps not fitted');
 for(const n of straps)assert(n.scale.z<=1.32&&n.scale.z>=1,'strap out of fit limits');
 const expectedPack=['medic','engineer','heavy'].includes(role);
 const pack=now.upperBody.children.find(n=>n.userData?.v149Pack);
 assert.equal(Boolean(pack),expectedPack,'unexpected/missing role pack');
 if(pack){
  assert(pack.userData.v248BackMounted,'pack not attached');
  const exposed=pack.position.z+bounds(pack).max.z*pack.scale.z;
  assert(Math.abs(backZ-exposed-.002)<.012,'backpack separation '+role);
  const followerCount=now.upperBody.children.filter(n=>n.userData?.v248PackFollower).length;
  assert.equal(followerCount,role==='heavy'?1:2,'role accessory follower mismatch');
 }
 const belt=now.root.children.find(n=>n.userData?.v176Equipment==='belt');
 assert(belt?.userData.v248WaistFit,'belt not fitted');
 assert(now.head.children.some(n=>n.name==='v246_integrated_helmet'),'V246 helmet regressed');
 const textile=[];now.root.traverse(n=>{if(n.userData?.v247Tailored)textile.push(n);});
 assert(textile.length>=10,'V247 textile surfaces regressed');
 const gunBefore=old.weaponPivot.children.length,gunAfter=now.weaponPivot.children.length;
 assert.equal(gunBefore,gunAfter,'third-person weapon changed');
 rows.push({team,role,variant,pouches:pouches.length,strapCount:straps.length,pack:Boolean(pack),
  front:frontZ,back:backZ,maxPouchError:Math.max(...gaps)});
}
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v248-carrier-fit.json',
 JSON.stringify({cases:rows.length,drawCallIncrease:0,rows},null,2));
console.log('V248 carrier and equipment fit PASS',rows.length,'models',
 '4 pouches + 2 straps; role packs preserved; no new meshes');
