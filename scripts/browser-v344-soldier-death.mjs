import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const old=execFileSync('git',['show','441dbdd74d7173906e3671a3d242cf2c6b36a8dd:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const current=fs.readFileSync('index.html','utf8');
const tag=/^ *\/\/ FO_V344_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V344_END \1\n/gm;
assert.equal([...current.matchAll(tag)].length,3);assert.equal(current.replace(tag,''),old);
const release=current.match(/\/\/ FO_V344_BEGIN soldier-release\n([\s\S]*?)\n *\/\/ FO_V344_END soldier-release/)[1];
const damage=current.slice(current.indexOf('      function applyDamageToPlayer('),current.indexOf('      // 12. VFX'));
let cases=0;
for(const mode of ['tdm','bomb','rescue'])for(const self of [true,false])for(const lethal of [true,false])for(const blast of [true,false]){
 if(self&&!blast)continue;
 const player={alive:true,hp:100,rollTimer:0,team:'blue',name:'SEN (OYUNCU)',pos:{x:0,z:0},yaw:0,pitch:0,deaths:0,ads:true,scopeStage:1,reloading:true},matchState={ended:false,mode,killStreak:2},enemy={name:'Enemy',kills:0},calls={score:[],feed:[],dead:[],spectate:0,metric:0};
 const dom={getElementById(){return {classList:{add(){},remove(){}},style:{}}}};
 const fn=new Function('player','matchState','bots','droneSystem','document','pulseV278DamageFlash','clearGameplayInputs','updateHUD','updateSniperScopeUI','foSingleLife','startFoSpectator','recordBotMetric','clearDeadTargetMemory','addKillfeedEntry','registerTeamKill',damage+';return applyDamageToPlayer')(player,matchState,[enemy],{isPlayerControlling:()=>false,onOperatorDied(){}},dom,()=>{},()=>{},()=>{},()=>{},()=>mode!=='tdm',()=>calls.spectate++,()=>calls.metric++,(id)=>calls.dead.push(id),(...args)=>calls.feed.push(args),(team)=>calls.score.push(team));
 const name=self?player.name:enemy.name;fn(lethal?110:20,name,'M67',null,blast);
 assert.equal(player.alive,!lethal);assert.equal(player.deaths,lethal?1:0);assert.equal(player.hp,lethal?0:80);
 assert.equal(calls.score.length,lethal&&!self?1:0);if(calls.score.length)assert.equal(calls.score[0],'red');
 assert.equal(enemy.kills,lethal&&!self?1:0);assert.equal(calls.metric,enemy.kills);
 assert.equal(calls.spectate,lethal&&mode!=='tdm'?1:0);assert.equal(calls.dead.length,lethal?1:0);
 if(lethal){assert.equal(player.respawnTimer,3);assert.equal(calls.feed[0][1],self?'blue':'red');fn(110,name,'M67',null,blast);assert.equal(player.deaths,1);assert.equal(calls.feed.length,1);}
 cases++;
}
assert.equal(cases,18);console.log('V344 death attribution cases PASS',cases);
const soldier=current.slice(current.indexOf('      let SOLDIER_SHARED = null;'),current.indexOf('      // 8. COLLISION'));
const muzzle=current.slice(current.indexOf('      const V273_FLASH_PROFILES='),current.indexOf('      const activeTracers = [];'));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage();
await page.addScriptTag({content:fs.readFileSync('node_modules/three/build/three.min.js','utf8')});
const report=await page.evaluate(({soldier,muzzle,release})=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(65,1,.01,100);
 camera.position.set(0,5,18);camera.lookAt(0,1,0);
 scene.add(new THREE.AmbientLight(0xffffff,1));
 const renderer=new THREE.WebGLRenderer({antialias:false});renderer.setSize(256,256);
 const api=new Function('THREE',soldier+'\n'+muzzle+'\n'+release+'\nreturn {create:createEnhancedBotSoldierMesh,release:foV344ReleaseRetiredSoldiers,collect:foV344SoldierResources,trigger:triggerV273BotFlash,assets:getV273MuzzleAssets};')(THREE);
 const check=(x,m)=>{if(!x)throw Error(m)};
 const live=api.create('blue','engineer',0);scene.add(live.root);
 const assets=api.assets();let sharedDisposed=0;for(const g of assets.geometries.values())g.addEventListener('dispose',()=>sharedDisposed++);assets.material.addEventListener('dispose',()=>sharedDisposed++);
 const rows=[];let protectedLive=new Set();api.collect(live.root,protectedLive);
 let liveDisposed=0;for(const r of protectedLive)r.addEventListener('dispose',()=>liveDisposed++);
 const classes=['assault','medic','engineer','sniper','heavy'],ids=['hk416','mp7','mp7','mrad','minimi'];
 for(let cycle=0;cycle<4;cycle++){
  const models=[];for(let i=0;i<11;i++){const model=api.create(i<5?'blue':'red',classes[i%5],i%3);model.root.position.set((i%6-2.5)*1.5,0,i<5?0:-3);scene.add(model.root);models.push(model);if(i%2===0)api.trigger({mesh:model,muzzleTimer:.055},ids[i%5]);}
  for(const model of models)model.root.traverse(n=>{if(n.isMesh){n.frustumCulled=false;n.visible=true;}});
  renderer.render(scene,camera);const before=renderer.info.memory.geometries;
  const retired=new Set();for(const model of models)api.collect(model.root,retired);
  let disposed=0;for(const r of retired)r.addEventListener('dispose',()=>disposed++);
  for(const model of models)scene.remove(model.root);
  const released=api.release(models.map(m=>m.root),scene);
  renderer.render(scene,camera);const after=renderer.info.memory.geometries;
  check(released>0&&released===disposed,'private disposal count');check(after<before,'geometry count must decrease');check(liveDisposed===0&&sharedDisposed===0,'live or flash resource disposed');
  rows.push({cycle,before,after,released});
 }
 check(rows.slice(1).every(r=>r.after===rows[1].after),'shared geometry plateau after warmup '+JSON.stringify(rows));
 renderer.dispose();return {rows,liveDisposed,sharedDisposed};
},{soldier,muzzle,release});
fs.mkdirSync('test-artifacts/front-operation-v344',{recursive:true});fs.writeFileSync('test-artifacts/front-operation-v344/report.json',JSON.stringify({cases,...report},null,2));console.log('V344 WebGL soldier disposal PASS',report);
}finally{await browser.close();}
