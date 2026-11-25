import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const out='test-artifacts/front-operation-browser';fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync('index.html','utf8');
const moduleSource=fs.readFileSync('modules/experimental/v188-skin-rig.mjs','utf8').replace(/^import \* as THREE from 'three';\n/m,'').replace(/^export /gm,'').trimEnd();
const embedded=html.split('// FO_EXPERIMENTAL_RIG_BEGIN\n')[1]?.split('\n// FO_EXPERIMENTAL_RIG_END')[0];
assert.equal(embedded,moduleSource,'embedded module drift');
const anchor='      window.onload = function () {';
const hook=`window.__foRigQA={
 ready:()=>bots.length===11,
 inspect:()=>({requested:foExperimentalRigRequested(),count:bots.length,rigs:bots.filter(b=>b.experimentalRig).length,enabled:bots.filter(b=>b.experimentalRig?.enabled).length,failed:bots.filter(b=>b.experimentalRigFailed).length}),
 lifecycle:()=>{
  const b=bots[0],oldCamera=camera.position.clone(),oldFov=camera.fov,oldZoom=camera.zoom;
  const state=()=>JSON.stringify(bots.map(x=>[x.id,x.pos.toArray(),x.hp,x.alive,x.legYaw,x.upperYaw]));
  const before=state();camera.fov=74;camera.zoom=1;camera.updateProjectionMatrix();
  camera.position.copy(b.pos).add(new THREE.Vector3(0,1.2,4));
  updateFoExperimentalBotRigs();
  const rig=b.experimentalRig,enabled=!!rig?.enabled,attached=rig?.mesh.parent===b.mesh.root;
  const cloth=[];b.mesh.root.traverse(n=>{if(n.userData.v129Sculpted)cloth.push(n);});
  const hidden=cloth.length===10&&cloth.every(n=>!n.visible);
  const bridges=[];b.mesh.root.traverse(n=>{if(['hip','shoulder'].includes(n.userData.v154Joint))bridges.push(n);});
  const bridgeOK=bridges.length===4&&bridges.every(n=>n.visible);
  const intact=before===state()&&b.mesh.head.visible&&b.mesh.weaponPivot.visible;
  camera.position.copy(b.pos).add(new THREE.Vector3(0,1,120));updateFoExperimentalBotRigs();
  const restored=!!rig&&!rig.enabled&&rig.mesh.parent===null&&cloth.every(n=>n.visible);
  camera.position.copy(b.pos).add(new THREE.Vector3(0,1.2,4));updateFoExperimentalBotRigs();
  const reenabled=!!rig?.enabled;
  camera.position.copy(oldCamera);camera.fov=oldFov;camera.zoom=oldZoom;camera.updateProjectionMatrix();
  initBots();const disposed=rig?.mesh.parent===null;
  return {enabled,attached,hidden,bridgeOK,intact,restored,reenabled,disposed};
 },
 step:()=>{
  gamePaused=true;
  const seen=new Set();let peak=0,frames=0;
  for(let n=0;n<150;n++){
   const b=bots.find(b=>b.alive);if(!b)break;
   camera.fov=74;camera.zoom=1;camera.updateProjectionMatrix();
   camera.position.copy(b.pos).add(new THREE.Vector3(0,1.2,4));
   updateBots(.05);updateFoExperimentalBotRigs();frames++;
   const active=bots.filter(b=>b.experimentalRig?.enabled);peak=Math.max(peak,active.length);
   for(const x of active)seen.add(x.id);
   if(n%30===0)renderer.render(scene,camera);
  }
  renderer.render(scene,camera);
  return {failed:bots.filter(b=>b.experimentalRigFailed).length,active:peak,frames,seen:seen.size};
 }
};\n`;
const source=html.replace(anchor,hook+anchor);
const server=createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(source);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const errors=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:960,height:600}});page.on('pageerror',e=>errors.push(String(e)));
 const base='http://127.0.0.1:'+server.address().port+'/';
 await page.goto(base,{waitUntil:'load',timeout:80000});await page.waitForFunction(()=>window.__foRigQA?.ready());
 const normal=await page.evaluate(()=>window.__foRigQA.inspect());
 assert(!normal.requested&&normal.rigs===0);
 await page.goto(base+'?rig=experimental',{waitUntil:'load',timeout:80000});await page.waitForFunction(()=>window.__foRigQA?.ready());
 const optIn=await page.evaluate(()=>window.__foRigQA.inspect());
 assert(optIn.requested&&optIn.rigs===11&&optIn.enabled===0&&optIn.failed===0,JSON.stringify(optIn));
 const life=await page.evaluate(()=>window.__foRigQA.lifecycle());
 assert(Object.values(life).every(v=>v===true),JSON.stringify(life));
 await page.locator('#btn-deploy').click();await page.waitForFunction(()=>document.getElementById('menu-overlay').classList.contains('hidden'));
 const step=await page.evaluate(()=>window.__foRigQA.step());assert.equal(step.failed,0);assert(step.active>0&&step.frames>=100&&step.seen>0,JSON.stringify(step));
 assert.equal(errors.length,0,errors.join(' | '));
 const report={normal,optIn,life,step,errors};fs.writeFileSync(path.join(out,'v240-live-rig.json'),JSON.stringify(report,null,2));console.log('PASS optional live rig '+JSON.stringify(report));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
