import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const now=fs.readFileSync('index.html','utf8'),old=fs.readFileSync(process.env.FO_V277_BASELINE,'utf8');
const cut=(s,a,b)=>{const x=s.indexOf(a),y=s.indexOf(b,x+a.length);assert(x>=0&&y>x,a);return s.slice(x,y);};
const bot=s=>cut(s,'      function updateBots(dt) {','      function updateEntitiesAndFX(dt) {');
assert.equal(bot(now),bot(old));
assert.equal(cut(now,'      function applyDamageToTarget(','      // V278:'),cut(old,'      function applyDamageToTarget(','      let damageFlashTimeout'));
const damage=s=>cut(s,'      function applyDamageToPlayer(','      // =========================================================================').replace(/        const flashEl = document.getElementById\(isBlast \? 'blast-flash' : 'damage-flash'\);[\s\S]*?\}, isBlast \? 240 : 160\);/,'        pulseV278DamageFlash(dmg,isBlast);');
assert.equal(damage(old),damage(now));
assert.equal((now.match(/Math\.random\(/g)||[]).length,(old.match(/Math\.random\(/g)||[]).length);
const pulse=cut(now,'      function pulseV278DamageFlash(','      function applyDamageToPlayer(');
const reset=cut(now,'      function resetV278DamageFlash(','      function clearAllMatchEntities(');
const elements=new Map(['damage-flash','blast-flash'].map(id=>[id,{style:{opacity:'0'}}]));
const pending=new Map();let seq=0;
const api=new Function('document','setTimeout','clearTimeout','const damageFlashTimeouts=new Map();\n'+pulse+reset+'\nreturn {pulseV278DamageFlash,resetV278DamageFlash};')({getElementById:id=>elements.get(id)},fn=>{pending.set(++seq,fn);return seq;},id=>pending.delete(id));
api.pulseV278DamageFlash(18,false);api.pulseV278DamageFlash(60,true);
assert.equal(pending.size,2);
api.pulseV278DamageFlash(20,false);assert.equal(pending.size,2);
for(const fn of [...pending.values()])fn();pending.clear();
for(const el of elements.values())assert.equal(el.style.opacity,'0');
api.pulseV278DamageFlash(30,false);api.resetV278DamageFlash();assert.equal(pending.size,0);
const make=s=>{
 const common=cut(s,'      const VFX_CAPS = {','      // V272–V273:');
 const tracers=cut(s,s.includes('      const V279_TRACER_MATS=')?'      const V279_TRACER_MATS=':'      function spawnTracer(','      // V276–V277:');
 const casing=cut(s,'      function spawnShellCasing(','      function getSafeDeployPosition(');
 const advance=cut(s,'        for (let i = activeTracers.length - 1;','        for (let i = activeParticles.length - 1;')+cut(s,'        for (let i = activeShellCasings.length - 1;','        if (dustParticles)');
 let seed=928123,count=0;const rng=Object.create(Math);
 rng.random=()=>{count++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 return new Function('THREE','Math','rngCount','const scene=new THREE.Scene(),activeTracers=[],activeShellCasings=[];\n'+common+tracers+casing+'\nfunction step(dt){'+advance+'}\nreturn {spawnTracer,spawnShellCasing,step,activeTracers,activeShellCasings,scene,rngCount};')(THREE,rng,()=>count);
};
const a=make(old),b=make(now),start=new THREE.Vector3(0,1.4,0),q=new THREE.Quaternion();
const sig=x=>JSON.stringify({tr:x.activeTracers.map(t=>[t.start.toArray(),t.end.toArray(),t.dir.toArray(),t.totalDist,t.streakLen,t.life,t.maxLife,t.mesh.position.toArray()]),sc:x.activeShellCasings.map(t=>[t.vel.toArray(),t.rotVel.toArray(),t.life,t.mesh.position.toArray()]),rng:x.rngCount()});
const compare=()=>assert.equal(sig(a),sig(b),'existing tracer/kovan movement or RNG changed');
for(let i=0;i<90;i++){
 const category=['rifle','smg','pistol','sniper','lmg'][i%5];
 for(const x of [a,b]){
  x.spawnTracer(start,new THREE.Vector3(i%3,1,5+i),category);
  x.spawnShellCasing(start,q,category);
 }
 compare();
 if(i%3===0){a.step(.016);b.step(.016);compare();}
}
assert(b.activeTracers.length<=28&&b.activeShellCasings.length<=32);
assert(b.activeShellCasings.every(c=>c.mesh.geometry.getAttribute('color')&&c.mesh.material.vertexColors));
for(let i=0;i<100;i++){a.step(.025);b.step(.025);compare();}
assert.equal(b.scene.children.length,0);
console.log('V278–V279 PASS: independent hit overlay reset, 90 tracer/casing pairs, identical movement/lifetime/RNG, bot and damage logic unchanged.');
