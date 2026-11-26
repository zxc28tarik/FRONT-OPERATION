import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {chromium} from 'playwright';

const out=path.resolve('test-artifacts/front-operation-browser');
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync('index.html','utf8'),anchor='      window.onload = function () {';
assert(source.includes(anchor));
const hook=`
      // Only the test server injects this fixture; production source is untouched.
      window.__foCriticalQA={
        freeze(){gamePaused=true;canvas.requestPointerLock=()=>{};clearGameplayInputs();},
        sample(){
          gamePaused=true;
          const mode=matchState.mode,roster=bots.length,colliderCount=mapColliders.length;
          const v=(x,y,z)=>new THREE.Vector3(x,y,z);
          const wall={minX:0,maxX:.08,minY:0,maxY:5,minZ:-10,maxZ:10};
          const deck={minX:-2,maxX:2,minY:2,maxY:2.2,minZ:-2,maxZ:2};
          const grenade={pos:v(-.2,2,0),vel:v(17.5,0,0)};
          foAdvanceGrenade(grenade,.05,[wall],()=>0);
          const rocket=foRocketSurface(v(-.2,2,0),2.2,0,0,[wall],40,60);
          const rocketPos=foPlaceRocketContact(v(0,0,0),v(-.2,2,0),2.2,0,0,rocket);
          const casing={mesh:new THREE.Object3D(),vel:v(0,-10,0)};
          casing.mesh.position.set(0,2.5,0);foAdvanceCasing(casing,.05,[deck],()=>0);
          const healBlocked=!foMedkitReachable(v(-.5,0,0),v(.5,0,0),[wall]);
          const healOpen=foMedkitReachable(v(-.5,0,0),v(.5,0,0),[]);
          // Real Three.js equipment resources and GPU counters, not mocked disposers.
          clearAllMatchEntities();
          const render=()=>{renderer.render(scene,camera);renderer.getContext().finish();return renderer.info.memory.geometries;};
          const before=render(),cycles=[];
          let released=0,expected=0,sharedDisposed=0,cacheDisposed=0;
          const cacheSeen=new Set();
          const shared=[WEAPON_MATS.olivePaint,WEAPON_MATS.brass,WEAPON_MATS.medRed,WEAPON_MATS.medWhite];
          const onShared=()=>sharedDisposed++;
          shared.forEach(m=>m.addEventListener('dispose',onShared));
          try{
            for(let i=0;i<3;i++){
              const p=player.pos.clone(),dir=v(0,0,-1);
              throwGrenade(p.clone().add(v(0,1.5,0)).addScaledVector(dir,.55),dir,player.name,player.team);
              fireRocket(p.clone().add(v(0,1.5,0)).addScaledVector(dir,.75),dir,player.name,player.team);
              deployMedkit(p,player.team);deployClaymore(p,0,player.name,player.team);
              for(const e of [...activeGrenades,...activeRockets,...activeMedkits,...activeClaymores]){
                const unique=new Set(e.ownedMaterials||[]);e.mesh.traverse(n=>{if(n.geometry)unique.add(n.geometry);});
                for(const resource of unique){
                  if(resource.foH332Shared){
                    if(!cacheSeen.has(resource)){cacheSeen.add(resource);resource.addEventListener('dispose',()=>cacheDisposed++);}
                  }else{expected++;resource.addEventListener('dispose',()=>released++);}
                }
              }
              const peak=render();clearAllMatchEntities();cycles.push({peak,after:render()});
            }
          }finally{shared.forEach(m=>m.removeEventListener('dispose',onShared));}
          const counts=renderer.info.render;
          return {mode,roster,colliderCount,grenade:grenade.pos.x,rocket:rocketPos.x,casing:casing.mesh.position.y,healBlocked,healOpen,
            budget:foFrameBudget(.2,0),before,cycles,released,expected,sharedDisposed,cacheDisposed,cacheSize:cacheSeen.size,calls:counts.calls,triangles:counts.triangles};
        },
        inputs(){
          gamePaused=false;clearGameplayInputs();
          const score=document.getElementById('scoreboard-overlay');
          const weapon=getCurrentWeapon(),ammo=()=>player.ammoState[weapon.id].mag;
          const initial=ammo();score.classList.remove('hidden');
          canvas.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}));
          const noFire=ammo()===initial&&!mouseDownLeft;score.classList.add('hidden');
          const touch=(target,type,id)=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'changedTouches',{value:[{identifier:id,clientX:10,clientY:10}]});target.dispatchEvent(e);};
          const fire=document.getElementById('btn-touch-fire');
          player.fireCooldown=0;touch(fire,'touchstart',0);const started=mouseDownLeft;
          touch(fire,'touchcancel',0);const cancelled=!mouseDownLeft&&fireTouchId===null;
          touch(canvas,'touchstart',4);const lookStarted=lookTouchId===4;
          touch(canvas,'touchcancel',4);const lookCancelled=lookTouchId===null;
          clearGameplayInputs();
          player.fireCooldown=1.25;player.knifeSwingTimer=.15;player.slideKick=.8;player.grounded=false;
          const kills=player.kills,deaths=player.deaths;
          respawnPlayer();
          const fresh=player.fireCooldown===0&&player.knifeSwingTimer===0&&player.slideKick===0&&player.grounded&&player.kills===kills&&player.deaths===deaths;
          const mobile=document.getElementById('btn-touch-class');mobile.click();
          const menu=document.getElementById('menu-overlay');
          const classGate=foSingleLife()?menu.classList.contains('hidden')&&!gamePaused:!menu.classList.contains('hidden')&&gamePaused;
          menu.classList.add('hidden');gamePaused=true;clearGameplayInputs();
          return {noFire,started,cancelled,lookStarted,lookCancelled,fresh,classGate};
        }
      };
`;
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
 res.end(source.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js').replace(anchor,hook+anchor));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const report=[],errors=[];
try{
 for(const mode of ['deathmatch','bomb','rescue']){
  const page=await browser.newPage({viewport:{width:960,height:600},deviceScaleFactor:1,hasTouch:true});
  page.on('pageerror',e=>errors.push(mode+': '+String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
  await page.waitForFunction(()=>window.__foCriticalQA&&window.THREE&&document.querySelectorAll('.class-card').length===5);
  await page.locator('#fo-game-mode').selectOption(mode);
  await page.evaluate(()=>{window.__foCriticalQA.freeze();document.getElementById('btn-deploy').click();window.__foCriticalQA.freeze();});
  const physical=await page.evaluate(()=>window.__foCriticalQA.sample());
  const inputs=await page.evaluate(()=>window.__foCriticalQA.inputs());
  report.push({mode,physical,inputs});
  assert.equal(physical.mode,mode);assert.equal(physical.roster,11);assert(physical.colliderCount>0&&physical.calls>0&&physical.triangles>0);
  assert(physical.grenade<-.085&&physical.rocket<0&&Math.abs(physical.casing-2.22)<1e-8);
  assert(physical.healBlocked&&physical.healOpen);assert.equal(physical.budget.count,4);assert.equal(physical.budget.debt,0);
  assert(physical.expected>0&&physical.released===physical.expected&&physical.sharedDisposed===0&&physical.cacheDisposed===0,'equipment ownership and disposal');
  assert(physical.cacheSize<=16,'shared geometry cache cap');
  const resident=physical.cycles[0].after;
  assert(resident>=physical.before&&resident-physical.before<=physical.cacheSize,'only bounded shared buffers may remain');
  assert(physical.cycles.every(c=>c.after===resident),'GPU geometry counter did not plateau after first cache warmup');
  for(const [key,value] of Object.entries(inputs))assert.equal(value,true,mode+' '+key);
  await page.screenshot({path:path.join(out,'critical-'+mode+'.png')});
  await page.close();
 }
 assert.deepEqual(errors,[]);assert.equal(report.length,3);
 console.log('Critical live browser QA: 3 modes, actual resource disposal, physical fixtures and input events.');
}finally{
 fs.writeFileSync(path.join(out,'critical-10-live-report.json'),JSON.stringify({report,errors,measurement:'controlled software WebGL; not full match or hardware FPS'},null,2));
 await browser.close();await new Promise(r=>server.close(r));
}
