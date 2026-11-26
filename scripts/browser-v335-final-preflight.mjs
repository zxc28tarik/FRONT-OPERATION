import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const out=path.resolve('test-artifacts/front-operation-i335');fs.mkdirSync(out,{recursive:true});
const base=execFileSync('git',['show','2d60406b372ccf666c87cd6b0fe15132f6ad7e47:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const current=fs.readFileSync('index.html','utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const anchor='      window.onload = function () {';
const modes=['deathmatch','bomb','rescue'],classes=['assault','medic','engineer','sniper','heavy'];
const report={baseline:'V273',candidateSha:hash(current),baselineSha:hash(base),ui:[],bench:{},errors:[],limitations:['render-only 5/15 model cohorts, not 5/15 AI matches','native match roster is 11 bots','SwiftShader timing is not hardware FPS','QA freezes RAF for controlled UI tests']};
const hook='\
      let qaIModels=null,qaISeed=335;\
      window.__foI335={\
        state(){return {mode:matchState.mode,started:matchState.started,ended:matchState.ended,paused:gamePaused,roster:bots.length,classId:player.classId,hp:player.hp,sp:player.sp,scoreBlue:matchState.scoreBlue,scoreRed:matchState.scoreRed,time:matchState.timeRemaining,aspect:camera.aspect};},\
        ready(){return !!FO_MAPS.deathmatch&&bots.length>0;},\
        prepare(){qaIModels=bots.map(b=>b.mesh);for(let i=qaIModels.length;i<15;i++)qaIModels.push(createEnhancedBotSoldierMesh(i%2?"red":"blue",CLASS_ORDER[i%5],i%3));for(const m of qaIModels)scene.remove(m.root);viewmodelGroup.visible=false;},\
        benchmark(mode,count){\
          selectFoMap(mode);const z=mode==="bomb"?29:38;const cam=new THREE.PerspectiveCamera(74,canvas.width/canvas.height,.03,280);cam.position.set(0,1.65,z);cam.lookAt(0,1.65,-15);\
          for(let i=0;i<qaIModels.length;i++){const m=qaIModels[i];scene.remove(m.root);if(i>=count)continue;m.root.position.set((i%5-2)*2.2,0,z-7-Math.floor(i/5)*15);m.root.rotation.set(0,Math.PI,0);m.root.visible=true;m.setVisualDetailDistance?.(0);m.setVisualDetailDistance?.(m.root.position.distanceTo(cam.position));scene.add(m.root);}\
          renderer.render(scene,cam);renderer.getContext().finish();const times=[],submit=[];\
          for(let i=0;i<5;i++){const t=performance.now();renderer.render(scene,cam);submit.push(performance.now()-t);renderer.getContext().finish();times.push(performance.now()-t);}\
          return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,times,submit,image:canvas.toDataURL("image/png")};\
        }\
      };\
';
function inject(s){
 assert(s.includes(anchor));return s.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js')
 .replace(anchor,hook+'\n'+anchor+'\n        canvas.requestPointerLock=()=>{};Math.random=()=>((qaISeed=(Math.imul(qaISeed,1664525)+1013904223)>>>0)/4294967296);');
}
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(inject(req.url==='/before'?base:current));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const errors=report.errors;
async function open(version,viewport,hasTouch=false){
 const page=await browser.newPage({viewport,deviceScaleFactor:1,hasTouch});
 page.on('pageerror',e=>errors.push(version+': '+String(e)));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 await page.goto('http://127.0.0.1:'+server.address().port+'/'+version,{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__foI335?.ready());
 // Do not replace Tailwind with an empty stub; require actual utility styles.
 await page.waitForFunction(()=>getComputedStyle(document.getElementById('menu-overlay')).position==='fixed',{},{timeout:15000});
 return page;
}
const state=p=>p.evaluate(()=>window.__foI335.state());
async function bounds(page,selectors){
 const rows=await page.evaluate(sels=>sels.map(sel=>{const el=document.querySelector(sel),r=el.getBoundingClientRect(),c=getComputedStyle(el);return {sel,x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,visible:c.visibility!=='hidden'&&c.display!=='none',viewport:[innerWidth,innerHeight]};}),selectors);
 for(const r of rows){assert(r.visible&&r.w>0&&r.h>0,r.sel+' visible');assert(r.x>=-1&&r.y>=-1&&r.right<=r.viewport[0]+1&&r.bottom<=r.viewport[1]+1,r.sel+' fits viewport: '+JSON.stringify(r));}
 return rows;
}
try{
 // I333/I334: actual click/key events, CSS layout, mode transitions and HUD.
 for(const viewport of [{width:1280,height:720},{width:844,height:390},{width:390,height:844}]){
  for(const mode of modes){
   const page=await open('after',viewport,viewport.width<1000);
   try{
    const prefix=viewport.width+'x'+viewport.height+'-'+mode;
    assert.equal(await page.locator('.class-card').count(),5);
    for(const cls of classes){
     await page.locator('.class-card[data-class="'+cls+'"]').click();
     assert.equal(await page.locator('.class-card[aria-selected="true"]').count(),1);
     assert.equal(await page.locator('.class-card[aria-selected="true"]').getAttribute('data-class'),cls);
     assert.equal(await page.locator('#selected-class-loadout > span').count(),4);
    }
    await page.locator('.class-card[data-class="heavy"]').press('Home');
    assert.equal(await page.locator('.class-card[aria-selected="true"]').getAttribute('data-class'),'assault');
    await page.locator('#fo-game-mode').selectOption(mode);
    const menuBounds=await bounds(page,['#menu-overlay .fo-menu-panel','#fo-game-mode','#class-grid','#btn-deploy']);
    await page.screenshot({path:path.join(out,prefix+'-menu.png')});
    await page.locator('#btn-deploy').click();
    const deployed=await state(page);assert.equal(deployed.mode,mode);assert(deployed.started&&!deployed.ended);assert.equal(deployed.roster,11);assert.equal(deployed.classId,'assault');
    assert(await page.locator('#menu-overlay').isHidden());
    const hudBounds=await bounds(page,['#radar-canvas','.fo-scoreboard','.fo-status-panel','#slot-bar','.fo-ammo-panel']);
    for(const id of ['hp-value','sp-value','ammo-mag','ammo-reserve','match-timer','score-blue','score-red'])assert((await page.locator('#'+id).innerText()).trim().length>0,id);
    await page.screenshot({path:path.join(out,prefix+'-hud.png')});
    await page.keyboard.press('Escape');
    assert(await page.locator('#pause-overlay').isVisible(),'pause visible');
    await bounds(page,['#pause-overlay .fo-pause-panel','#btn-pause-resume','#btn-pause-map']);
    await page.locator('#btn-pause-score').click();assert(await page.locator('#scoreboard-overlay').isVisible());
    await page.locator('#btn-score-close').click();assert(await page.locator('#pause-overlay').isVisible());
    const beforeCancel=await state(page);
    await page.locator('#btn-pause-map').click();await page.locator('#fo-game-mode').selectOption(modes[(modes.indexOf(mode)+1)%3]);
    await page.locator('#btn-map-cancel').click();assert(await page.locator('#pause-overlay').isVisible());
    assert.deepEqual(await state(page),beforeCancel,'cancel preserves match');
    await page.locator('#btn-pause-resume').click();assert(!(await state(page)).paused);
    await page.setViewportSize({width:viewport.width+32,height:viewport.height+16});
    await page.waitForFunction(()=>Math.abs(window.__foI335.state().aspect-innerWidth/innerHeight)<1e-9);
    report.ui.push({viewport,mode,deployed,menuBounds,hudBounds,cancelPreserved:true,resized:true});
   }finally{await page.close();}
  }
 }
 // I335: matched V273/current visual cohorts, no invented AI roster.
 for(const version of ['before','after']){
  const page=await open(version,{width:800,height:500});
  try{
   await page.evaluate(()=>window.__foI335.prepare());report.bench[version]={};
   for(const mode of modes)for(const count of [0,5,15]){
    const row=await page.evaluate(({mode,count})=>window.__foI335.benchmark(mode,count),{mode,count});
    const png=Buffer.from(row.image.split(',')[1],'base64');delete row.image;row.imageHash=hash(png);
    assert(row.calls>0&&row.triangles>0&&row.geometries>0&&row.times.every(t=>Number.isFinite(t)&&t>=0));
    row.medianMs=[...row.times].sort((a,b)=>a-b)[2];
    fs.writeFileSync(path.join(out,version+'-'+mode+'-'+count+'.png'),png);report.bench[version][mode+'-'+count]=row;
   }
  }finally{await page.close();}
 }
 assert.equal(report.ui.length,9);assert.equal(Object.keys(report.bench.before).length,9);assert.equal(Object.keys(report.bench.after).length,9);assert.deepEqual(errors,[]);
 console.log('I335 preflight PASS; visual cohorts are not live AI matches or hardware FPS.');
}finally{
 fs.writeFileSync(path.join(out,'i335-preflight.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));
}
