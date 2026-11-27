import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const s=fs.readFileSync('index.html','utf8');
const a=s.indexOf('      const V273_FLASH_PROFILES='),b=s.indexOf('      const activeTracers = [];',a);
assert(a>=0&&b>a);
const api=new Function('THREE',`const viewmodelGroup=new THREE.Group(),vmRefs={muzzlePoint:new THREE.Object3D()};
const muzzleLight=new THREE.PointLight(0xffb74d,0);
const matchState={started:true,ended:false},player={alive:true};
const root=new THREE.Group();root.position.set(.2,-.1,-.3);root.rotation.y=.2;
viewmodelGroup.add(root,muzzleLight);root.add(vmRefs.muzzlePoint);vmRefs.muzzlePoint.position.z=-.5;
`+s.slice(a,b)+`return {profiles:V273_FLASH_PROFILES,getV273MuzzleAssets,v273Profile,triggerV273PlayerFlash,updateV273PlayerFlash,clearV271PlayerFlash,foV339AcknowledgePlayerFlash,triggerV273BotFlash,updateV273BotFlash,viewmodelGroup,vmRefs,muzzleLight,player,matchState,get flash(){return v271PlayerFlash;}};`)(THREE);
const assets=api.getV273MuzzleAssets(),ids=['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf'];
assert.deepEqual(Object.keys(api.profiles),ids);
assert.equal(assets.geometries.size,7);assert.strictEqual(api.getV273MuzzleAssets(),assets);
assert.equal(assets.map.image.data.length,128*512*4);
assert.strictEqual(assets.material.map,assets.map);
const tileSignatures=new Set(),report=[];
let playerMesh=null,playerMaterial=null;
for(const id of ids){
 const p=api.profiles[id],geo=assets.geometries.get(p);
 assert.equal(geo.userData.v273Profile,id);
 assert.equal(geo.index.count/3,(p.planes+1)*2);
 assert(geo.index.count/3<=8);
 geo.computeBoundingBox();assert(Math.abs(geo.boundingBox.max.z-p.length)<1e-6);
 const tile=assets.map.image.data.slice(p.tile*128*64*4,(p.tile+1)*128*64*4);
 tileSignatures.add(Buffer.from(tile).toString('base64'));
 assert(tile.some((v,i)=>i%4===3&&v>200));
 assert(tile[3]===0&&tile[(64*128-1)*4+3]===0);
 api.triggerV273PlayerFlash(id);
 const mesh=api.flash;
 if(playerMesh){assert.strictEqual(mesh,playerMesh);assert.strictEqual(mesh.material,playerMaterial);}
 else{playerMesh=mesh;playerMaterial=mesh.material;}
 assert.strictEqual(mesh.geometry,geo);assert.strictEqual(mesh.material.map,assets.map);
 assert(mesh.visible&&mesh.parent===api.vmRefs.muzzlePoint);
 assert(Math.abs(api.muzzleLight.intensity-p.light)<1e-7);
 api.viewmodelGroup.updateMatrixWorld(true);
 const expected=api.vmRefs.muzzlePoint.getWorldPosition(new THREE.Vector3());
 assert(api.muzzleLight.getWorldPosition(new THREE.Vector3()).distanceTo(expected)<1e-6);
 api.foV339AcknowledgePlayerFlash();api.updateV273PlayerFlash(p.life*.5);assert(mesh.visible&&mesh.scale.z<1);
 api.triggerV273PlayerFlash(id);assert.strictEqual(api.flash,mesh);
 api.foV339AcknowledgePlayerFlash();api.updateV273PlayerFlash(p.life+.001);
 assert(!mesh.visible&&mesh.parent===null&&api.muzzleLight.intensity===0);
 report.push({id,form:p.form,triangles:geo.index.count/3,lifetimeMs:p.life*1000});
}
assert.equal(tileSignatures.size,7);
assert(api.profiles.minimi.width>api.profiles.hk416.width);
assert(api.profiles.minimi.planes>api.profiles.hk416.planes);
assert.notEqual(api.profiles.p320.form,api.profiles.glock18c.form);
api.triggerV273PlayerFlash('hk416');api.player.alive=false;api.updateV273PlayerFlash(.001);
assert(!api.flash.visible&&api.muzzleLight.intensity===0);api.player.alive=true;
const bot={mesh:{muzzleFlash:new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),new THREE.MeshBasicMaterial())},muzzleTimer:.055};
const mesh=bot.mesh.muzzleFlash;mesh.position.set(.1,.2,.3);
let disposed=0;mesh.geometry.addEventListener('dispose',()=>disposed++);
const sharedDisposals={n:0};for(const g of assets.geometries.values())g.addEventListener('dispose',()=>sharedDisposals.n++);
for(const id of ids){
 bot.muzzleTimer=.055;mesh.visible=true;
 api.triggerV273BotFlash(bot,id);
 assert.strictEqual(mesh.geometry,assets.geometries.get(api.profiles[id]));
 assert.strictEqual(mesh.material,assets.material);
 bot.muzzleTimer=.030;api.updateV273BotFlash(bot);assert(mesh.scale.x<1);
 assert.deepEqual(mesh.position.toArray(),[.1,.2,.3]);
}
assert.equal(disposed,1);assert.equal(sharedDisposals.n,0);
assert.equal((s.match(/triggerV273BotFlash\(bot,(?:bw|sw)\.id,(?:bw|sw)\.category\)/g)||[]).length,3);
assert.equal((s.match(/triggerV273PlayerFlash\(w\.id,w\.category\)/g)||[]).length,1);
fs.mkdirSync('test-artifacts/front-operation-browser',{recursive:true});
fs.writeFileSync('test-artifacts/front-operation-browser/v273-muzzle-profiles.json',JSON.stringify(report,null,2));
console.log('V273 PASS: seven unique silhouettes and tiles, shared atlas, reused mesh, stable muzzle anchors');

// V339: actual shared Three assets; test early-shot substeps before a frame submission.
let v339Cases=0;
for(const id of ids)for(const fps of [5,10,20,30,60,144,240])for(const count of [1,2,5,10])for(const ads of [false,true]){
 const p=api.profiles[id];api.player.ads=ads;api.clearV271PlayerFlash();api.triggerV273PlayerFlash(id);
 const originalMesh=api.flash;
 for(let i=0;i<count;i++)api.updateV273PlayerFlash(1/fps/count);
 assert.strictEqual(api.flash,originalMesh);assert(api.flash.visible&&api.flash.parent===api.vmRefs.muzzlePoint);assert(api.muzzleLight.intensity>0);
 if(id==='minimi'&&ads){assert(Math.abs(api.flash.scale.x-.68)<1e-9);assert(Math.abs(api.flash.material.opacity-p.opacity*.84)<1e-9);}
 else{assert.equal(api.flash.scale.x,1);assert.equal(api.flash.material.opacity,p.opacity);}
 api.foV339AcknowledgePlayerFlash();api.updateV273PlayerFlash(p.life*.5);assert(api.flash.visible&&api.flash.scale.z<1);
 api.updateV273PlayerFlash(p.life);assert(!api.flash.visible&&api.flash.parent===null&&api.muzzleLight.intensity===0);
 v339Cases++;
}
api.player.ads=false;api.triggerV273PlayerFlash('p320');api.updateV273PlayerFlash(.4);api.triggerV273PlayerFlash('minimi');assert(api.flash.visible);api.clearV271PlayerFlash();
assert(api.profiles.minimi.length*api.profiles.minimi.width*api.profiles.minimi.planes/(.154*.108*2)>1.9);
console.log('V339 first-render retention and ADS: '+v339Cases+' controlled cases PASS');
