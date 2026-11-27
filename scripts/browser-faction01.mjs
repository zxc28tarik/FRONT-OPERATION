import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {chromium} from 'playwright';

const src=fs.readFileSync('index.html','utf8');
const out=path.resolve('test-artifacts/faction01');fs.mkdirSync(out,{recursive:true});
const anchor='      window.onload = function () {';
assert(src.includes(anchor),'game entry point');
assert(src.includes('FO_FACTION01_BEGIN arsenal')&&src.includes('FO_FACTION02_BEGIN fire field'));
const hook=String.raw\`
window.__foFactionQA={
 ready:()=>!!FO_MAPS.deathmatch&&!!document.getElementById('fo-faction-red'),
 start(team,mode){
   const radio=document.querySelector('input[name="fo-faction"][value="'+team+'"]');
   radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
   const select=document.getElementById('fo-game-mode');
   select.value=mode;select.dispatchEvent(new Event('change',{bubbles:true}));
   matchState.started=false;matchState.ended=false;
   document.getElementById('menu-overlay').classList.remove('hidden');
   document.getElementById('btn-deploy').click();
   const counts={blue:bots.filter(b=>b.team==='blue').length,red:bots.filter(b=>b.team==='red').length};
   const rows=foBombActors();
   updateScoreboardUI();
   const scoreboard={blue:document.getElementById('sb-blue-list').textContent,
                     red:document.getElementById('sb-red-list').textContent};
   const options={};
   for(const id of ['assault','medic','engineer','sniper','heavy']){
     const slots=foFactionSlots(team,id);
     initPlayerLoadout(id);
     const primary=getCurrentWeapon();
     if(primary.id!==slots[1]||!currentViewmodelMesh)throw Error('primary weapon equip '+id);
     if(!player.ammoState[primary.id]||!WEAPONS[primary.id])throw Error('missing firearm inventory '+id);
     const names=[1,2,3,4].map(k=>slots[k]||null);
     if(slots[4]){
       switchSlot(4);
       if(getCurrentWeapon()?.id!==slots[4])throw Error('slot 4 weapon mismatch '+id);
       const hud=document.getElementById('slot-name-4').textContent;
       if(slots[4]!=='drone'&&!hud.includes(WEAPONS[slots[4]].slotName))throw Error('slot 4 label '+id+' '+hud);
     }
     options[id]={names,primary:primary.name};
   }
   initPlayerLoadout('assault');
   renderer.render(scene,camera);renderer.getContext().finish();
   return {team:player.team,mode:matchState.mode,spawnZ:player.pos.z,
     yaw:player.yaw,counts,playerActor:rows.find(a=>a.id==='player')?.team,
     scoreboard,options,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
 },
 molotov(){
   if(player.team!=='red'||matchState.mode!=='deathmatch')throw Error('wrong Molotov QA stage');
   initPlayerLoadout('assault');switchSlot(4);
   const ammo=player.ammoState.molotov.mag;
   const p=player.pos.clone();p.y=1.35;
   throwGrenade(p,new THREE.Vector3(0,-.5,1),player.name,player.team);
   let steps=0;
   while(activeFires.length===0&&steps++<110)updateEntitiesAndFX(.05);
   if(activeFires.length!==1||activeGrenades.some(g=>g.kind==='molotov'))
     throw Error('Molotov did not ignite on contact');
   const fire=activeFires[0],blue=bots.find(b=>b.team==='blue'),red=bots.find(b=>b.team==='red');
   const originalBlue=blue.pos.clone(),originalRed=red.pos.clone();
   const ePos=fire.pos.clone().add(new THREE.Vector3(.65,0,.2));
   blue.pos.copy(ePos);red.pos.copy(ePos);
   blue.hp=100;blue.alive=true;red.hp=100;red.alive=true;
   for(let i=0;i<4;i++)foUpdateMolotovFires(.5);
   const damaged=blue.hp,friend=red.hp;
   blue.pos.copy(originalBlue);red.pos.copy(originalRed);
   renderer.render(scene,camera);renderer.getContext().finish();
   const before=activeFires.length;
   for(let i=0;i<12;i++)foUpdateMolotovFires(.5);
   const after=activeFires.length;
   return {ammo,kind:'molotov',before,after,damaged,friend,
     drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
 },
 reset(){
   const g=foIgniteMolotov(player.pos,player.name,'red');
   const before=activeFires.length;clearAllMatchEntities();
   return {before,after:activeFires.length,released:g.foReleased};
 }
};\`;
const gameHtml=src.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js')
  .replace(anchor,hook+anchor);
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){
  res.writeHead(200,{'content-type':'text/javascript'});
  res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;
 }
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(gameHtml);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const report={scenarios:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(String(e)));
 await page.route('https://cdn.tailwindcss.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__foFactionQA?.ready(),null,{timeout:20000});
 for(const mode of ['deathmatch','bomb','rescue'])for(const team of ['blue','red']){
   const r=await page.evaluate(({mode,team})=>window.__foFactionQA.start(team,mode),{team,mode});
   assert.equal(r.team,team);assert.equal(r.mode,mode);
   assert.equal(r.playerActor,team);
   assert.equal(r.counts.blue+(team==='blue'?1:0),6);
   assert.equal(r.counts.red+(team==='red'?1:0),6);
   assert.equal(team==='red'?r.spawnZ<0:r.spawnZ>0,true);
   assert(Math.abs(r.yaw-(team==='red'?Math.PI:0))<.01);
   assert(r.scoreboard[team].includes('SEN (OYUNCU)'));
   assert(!r.scoreboard[team==='blue'?'red':'blue'].includes('SEN (OYUNCU)'));
   assert(r.drawCalls>0&&r.triangles>0);
   assert.equal(r.options.medic.names[1],team==='red'?'tt33':'p320');
   assert.equal(r.options.medic.names[0],team==='red'?'uzi':'mp7');
   assert.equal(r.options.heavy.names[3],team==='red'?'rpg7':'carlgustaf');
   assert.equal(r.options.assault.names[3],team==='red'?'molotov':'m67');
   const fn='faction-'+mode+'-'+team+'.png';
   await page.screenshot({path:path.join(out,fn),animations:'disabled'});
   report.scenarios.push({mode,team,...r,image:fn});
 }
 // Molotov only on militia deathmatch; check impact, enemy-only fire, cleanup.
 await page.evaluate(()=>window.__foFactionQA.start('red','deathmatch'));
 report.molotov=await page.evaluate(()=>window.__foFactionQA.molotov());
 assert.equal(report.molotov.kind,'molotov');
 assert.equal(report.molotov.friend,100,'fire cannot hurt same-team actor');
 assert(report.molotov.damaged<100,'Molotov fire hurts visible enemy');
 assert.equal(report.molotov.after,0,'Molotov must expire');
 await page.screenshot({path:path.join(out,'faction-molotov.png'),animations:'disabled'});
 report.reset=await page.evaluate(()=>window.__foFactionQA.reset());
 assert(report.reset.before>0&&report.reset.after===0&&report.reset.released);
 assert.deepEqual(report.errors,[]);
 fs.writeFileSync(path.join(out,'faction01-report.json'),JSON.stringify(report,null,2));
 console.log('PASS FACTION01 real Chromium/WebGL: six team/mode starts, ten class kits per mode, two teams, Uzi/RPG, Molotov damage and cleanup');
}catch(e){
 process.exitCode=1;report.errors.push(String(e));
 fs.writeFileSync(path.join(out,'faction01-report.json'),JSON.stringify(report,null,2));
 console.error('FAIL FACTION01',String(e));
}finally{
 await browser?.close();await new Promise(r=>server.close(r));
}