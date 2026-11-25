import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const now=fs.readFileSync('index.html','utf8');
const old=fs.readFileSync(process.env.FO_V273_BASELINE,'utf8');
const cut=(s,a,b)=>{const x=s.indexOf(a),y=s.indexOf(b,x+a.length);assert(x>=0&&y>x,a);return s.slice(x,y);};
assert.equal(cut(now,'      function updateBots(dt) {','      function updateEntitiesAndFX(dt) {'),cut(old,'      function updateBots(dt) {','      function updateEntitiesAndFX(dt) {'));
assert.equal(cut(now,'      const V273_FLASH_PROFILES=','      const activeTracers = [];'),cut(old,'      const V273_FLASH_PROFILES=','      const activeTracers = [];'));
const protectedPrefix='      let hitmarkerTimeout = null;';
const vfxStart='      const VFX_CAPS = {';
assert.equal(cut(now,vfxStart,'      // V272–V273:'),cut(old,vfxStart,'      // V272–V273:'));
assert.equal((now.match(/Math\.random\(/g)||[]).length,(old.match(/Math\.random\(/g)||[]).length);
function factory(s){
 const common=cut(s,vfxStart,'      // V272–V273:');
 const funcs=cut(s,s.includes('      let V277_IMPACT_ASSETS')?'      let V277_IMPACT_ASSETS':'      function spawnImpactMark(','      function spawnShellCasing(');
 const update=cut(s,'        for (let i = activeParticles.length - 1; i >= 0; i--) {','        for (let i = activeShellCasings.length - 1; i >= 0; i--) {');
 const rng=Object.create(Math);let seed=123456,count=0;
 rng.random=()=>{count++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 return new Function('THREE','Math',`const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();
 const activeParticles=[],activeImpactMarks=[];
 `+common+funcs+`\nfunction step(dt){`+update+`}
 return {spawnImpactFX,spawnCharacterHitFX,step,activeParticles,activeImpactMarks,scene,randomCount:()=>0,
 assets:typeof getV277ImpactAssets==='function'?getV277ImpactAssets:null};`)(THREE,rng);
}
const a=factory(old),b=factory(now);
const normal=new THREE.Vector3(0,1,0),pos=new THREE.Vector3(1,2,3);
const signature=x=>JSON.stringify({particles:x.activeParticles.map(p=>({pos:p.mesh.position.toArray(),vel:p.vel.toArray(),life:p.life,max:p.maxLife,gravity:p.gravity,grow:p.growRate,align:p.alignVel})),marks:x.activeImpactMarks.map(p=>({pos:p.mesh.position.toArray(),life:p.life}))});
const compare=()=>assert.equal(signature(a),signature(b),'particle state/RNG/cap timing changed');
for(let i=0;i<80;i++){
 for(const x of [a,b]){
  x.spawnImpactFX(pos,normal,i%2===0,10+i);
  x.spawnCharacterHitFX(pos,i%3===0,10+i);
 }
 compare();
 if(i%4===0){a.step(.031);b.step(.031);compare();}
}
assert.equal(b.activeParticles.length,145);
assert(b.activeImpactMarks.length<=38);
const assets=b.assets();
assert.strictEqual(assets,b.assets());
assert.equal(Object.keys(assets.maps).length,4);
assert.equal(assets.quad.index.count/3,2);
assert.equal(assets.markGeo.index.count/3,2);
const signatures=new Set(Object.values(assets.maps).map(t=>Buffer.from(t.image.data).toString('base64')));
assert.equal(signatures.size,4);
for(const mats of Object.values(assets.fades)){
 assert.equal(mats.length,4);assert(mats[0].opacity>mats[3].opacity);
}
for(let i=0;i<150;i++){a.step(.025);b.step(.025);compare();}
assert.equal(b.activeParticles.length,0);assert.equal(b.activeImpactMarks.length,0);assert.equal(b.scene.children.length,0);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v277-visual-regression.json',JSON.stringify({impactPairs:80,particleCap:145,markCap:38,sharedMaps:4,cleanup:true,botCodeIdentical:true,particleStateIdentical:true},null,2));
console.log('V277 PASS: 80 mixed impact pairs, identical particle state/RNG timing, fixed caps, shared materials and complete cleanup.');
