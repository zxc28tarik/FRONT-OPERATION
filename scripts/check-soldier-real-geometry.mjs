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
 const head=m.head.children.find(n=>n.name==='v106_face'),other=alt.head.children.find(n=>n.name==='v106_face');
 assert(head.geometry===other.geometry&&head.material!==other.material);
 assert.equal(alt.root.userData.visualVariant,1);assert.equal(alt2.root.userData.visualVariant,2);
 m.root.traverse(n=>{if(!n.isMesh)return;const p=n.geometry.getAttribute('position'),normal=n.geometry.getAttribute('normal');assert(p.array.every(Number.isFinite)&&normal.array.every(Number.isFinite));});
 const near=countVisible(m.root);
 m.setVisualDetailDistance(24);assert.equal(m.visualDetailLevel,1);const mid=countVisible(m.root);
 m.setVisualDetailDistance(22);assert.equal(m.visualDetailLevel,1);
 m.setVisualDetailDistance(50);assert.equal(m.visualDetailLevel,2);const far=countVisible(m.root);
 assert(near>mid&&mid>far&&m.head.visible&&m.weaponPivot.visible);
 m.setVisualDetailDistance(43);assert.equal(m.visualDetailLevel,2);
 m.setVisualDetailDistance(18);assert.equal(m.visualDetailLevel,0);assert.equal(countVisible(m.root),near);
 assert.equal(m.head.parent,m.upperBody);assert.equal(m.muzzleFlash.parent,m.weaponPivot);
 nearTotal+=near;farTotal+=far;models+=3;
}
console.log('V110/V111 real Three.js PASS: '+models+' models; near '+nearTotal+' / far '+farTotal+' visible meshes across 10 representatives');
