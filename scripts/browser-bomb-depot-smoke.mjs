import { chromium } from 'playwright';
import fs from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
const output=path.resolve('test-artifacts/front-operation-browser');
fs.mkdirSync(output,{recursive:true});
const source=fs.readFileSync('index.html','utf8');
const anchor='      window.onload = function () {';
if(!source.includes(anchor))throw Error('Missing boot anchor');
// ONLY the local acceptance server injects direct scenario control.
const hook=`
      window.__foDepotQa={
        snapshot:()=>({mode:matchState.mode,ended:matchState.ended,phase:foBomb.phase,
          site:foBomb.site?.id,reason:foBomb.reason,alive:player.alive,
          botLives:bots.map(b=>({id:b.id,alive:b.alive})),
          nav:NAV_VALIDATION.reachableNodes,colliders:mapColliders.length,
          meshes:mapEnvironmentMeshes.length,graph:JSON.stringify(NAV_NODES),
          sites:FO_BOMB_SITES.map(s=>({id:s.id,reachable:findPathAStar(2,s.node,-1).at(-1)===s.node,
            walkable:isPositionWalkable(s.x,0,s.z)}))}),
        freeze:()=>{gamePaused=true;canvas.requestPointerLock=()=>{};},
        plant:()=>{
          player.pos.set(-16,0,-28);player.vel.set(0,0,0);player.rollTimer=0;
          player.reloading=false;mouseDownLeft=false;updateFoBomb(3.1);
        },
        killAndCheck:()=>{
          const b=bots.find(b=>b.team==='blue');
          applyDamageToTarget(b,999,true,'QA','red','QA');
          applyDamageToPlayer(999,'QA','QA');
          for(let i=0;i<100;i++){updatePlayer(.05);updateBots(.05);}
          return {playerDead:!player.alive,botDead:!b.alive,
            deathText:document.getElementById('respawn-countdown').textContent};
        },
        spectatorCheck:()=>{
          const initial=selectFoSpectatorTarget();
          if(!initial||initial.team!==player.team||!initial.alive)throw Error('No live teammate selected');
          const first=initial.id,second=selectFoSpectatorTarget(1);
          updateFoSpectator(.05);
          const follow=foSpectator.mode==='follow'&&
            !viewmodelGroup.visible&&document.body.classList.contains('fo-spectating')&&
            document.getElementById('respawn-overlay').classList.contains('hidden');
          const distinct=second&&second.id!==first;
          // Forced death in QA only, verify automatic retargeting.
          if(second)applyDamageToTarget(second,999,true,'QA','red','QA');
          updateFoSpectator(.05);
          const switched=foSpectator.targetId!==second?.id&&
            foSpectatorTeam().some(b=>b.id===foSpectator.targetId);
          setFoSpectatorMode('free');
          const before=camera.position.clone(),body=player.pos.clone();
          keys.KeyW=true;updateFoSpectator(.1);keys.KeyW=false;
          const free=foSpectator.mode==='free'&&camera.position.distanceTo(before)>.2&&
            player.pos.distanceTo(body)<.001&&!player.alive;
          setFoSpectatorMode('follow');updateFoSpectator(.05);
          return {follow,distinct,switched,free,returned:foSpectator.mode==='follow'};
        },
        aimCheck:()=>{
          const stub={pos:new THREE.Vector3(),upperYaw:0,legYaw:Math.PI};
          const eye=new THREE.Vector3(0,1.45,10);
          const rejectsSide=!isBotAimAligned(stub,eye);
          stub.legYaw=.8;
          const acceptsFront=isBotAimAligned(stub,eye);
          stub.upperYaw=.3;stub.legYaw=.3;
          return {rejectsSide,acceptsFront,rejectsOffset:!isBotAimAligned(stub,eye)};
        },
        defuse:()=>{
          const b=bots.find(b=>b.team==='red'&&b.alive);
          if(!b)throw Error('No defender left');
          b.pos.set(foBomb.site.x,0,foBomb.site.z);b.visibleEnemy=null;b.activeDroneId=null;b.unstuckTimer=0;
          updateFoBomb(4.1);
        },
        end:()=>{foBomb.reason='QA';endMatch('red');}
      };
`;
const server=createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(source.replace(anchor,hook+anchor));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const errors=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__foDepotQa?.snapshot().nav===50);
 const original=await page.evaluate(()=>window.__foDepotQa.snapshot());
 await page.locator('#fo-game-mode').selectOption('bomb');
 await page.evaluate(()=>{window.__foDepotQa.freeze();document.getElementById('btn-deploy').click();window.__foDepotQa.freeze();});
 const depot=await page.evaluate(()=>window.__foDepotQa.snapshot());
 if(depot.mode!=='bomb'||depot.nav!==50||depot.botLives.length!==11||depot.graph===original.graph||
     depot.sites.some(s=>!s.walkable||!s.reachable)||depot.colliders===original.colliders)throw Error('Invalid separate map '+JSON.stringify(depot));
 await page.screenshot({path:path.join(output,'depot17-start.png')});
 await page.evaluate(()=>window.__foDepotQa.plant());
 let state=await page.evaluate(()=>window.__foDepotQa.snapshot());
 if(state.phase!=='planted'||state.site!=='A')throw Error('Player planting failed');
 const dead=await page.evaluate(()=>window.__foDepotQa.killAndCheck());
 if(!dead.playerDead||!dead.botDead||dead.deathText!=='TEK CAN')throw Error('Deathmatch respawn leaked into bomb mode '+JSON.stringify(dead));
 const spectate=await page.evaluate(()=>window.__foDepotQa.spectatorCheck());
 if(Object.values(spectate).some(v=>v!==true))throw Error('Spectator failure '+JSON.stringify(spectate));
 const aim=await page.evaluate(()=>window.__foDepotQa.aimCheck());
 if(Object.values(aim).some(v=>v!==true))throw Error('Rendered yaw gate failure '+JSON.stringify(aim));
 await page.screenshot({path:path.join(output,'depot17-spectator.png')});
 await page.evaluate(()=>window.__foDepotQa.defuse());
 state=await page.evaluate(()=>window.__foDepotQa.snapshot());
 if(!state.ended||state.reason!=='Bomba etkisizleştirildi')throw Error('Defusal did not conclude match');
 await page.screenshot({path:path.join(output,'depot17-result.png')});
 await page.locator('#fo-game-mode').selectOption('deathmatch');
 await page.evaluate(()=>{document.getElementById('btn-deploy').click();window.__foDepotQa.freeze();});
 const restored=await page.evaluate(()=>window.__foDepotQa.snapshot());
 if(restored.mode!=='deathmatch'||!restored.alive||restored.botLives.some(b=>!b.alive)||
     restored.colliders!==original.colliders||restored.meshes!==original.meshes||
     restored.graph!==original.graph||restored.nav!==50)throw Error('Marien restore mismatch');
 if(await page.evaluate(()=>document.body.classList.contains('fo-spectating')))throw Error('Spectator HUD leaked into new match');
 if(errors.length)throw Error(errors.join(' | '));
 console.log('PASS real WebGL Depot17: separate 50-node map, both sites reachable, plant, no respawn, teammate switching, free camera, rendered aim gate, defuse, exact Marien restoration');
}catch(e){console.error('FAIL Depot17 browser: '+String(e));process.exitCode=1;}
finally{await browser?.close();await new Promise(r=>server.close(r));}
