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
const h332=execFileSync('git',['show','cbf2c31ca8f3b7a6237e9433e8b41fe0fee35856:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const i335Css=/    \/\* FO_I335_BEGIN responsive-ui \*\/\n[\s\S]*?    \/\* FO_I335_END responsive-ui \*\/\n/g;
assert.equal(current.replace(/^ *\/\/ FO_V339_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V339_END \1\n/gm,'').replace(/^ *\/\/ FO_V336_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V336_END \1\n/gm,'').replace(i335Css,''),h332,'I only changes tagged CSS; all production JS and menu markup unchanged');
assert.equal([...current.matchAll(i335Css)].length,1,'one bounded CSS change');
const hash=s=>createHash('sha256').update(s).digest('hex');
const anchor='      window.onload = function () {';
const modes=['deathmatch','bomb','rescue'],classes=['assault','medic','engineer','sniper','heavy'];
const report={baseline:'V273',candidateSha:hash(current),baselineSha:hash(base),ui:[],bench:{},aiCohorts:[],errors:[],limitations:['render-only 5/15 model cohorts, not 5/15 AI matches','native match roster is 11 bots','SwiftShader timing is not hardware FPS','QA freezes RAF for controlled UI tests','5/15 actual AI cohorts use test-only roster-size fixture and 10 seconds controlled simulation; not full-length matches']};
const hook='\
      let qaIModels=null,qaISeed=335;\
      window.__foI335={\
        state(){return {mode:matchState.mode,started:matchState.started,ended:matchState.ended,paused:gamePaused,roster:bots.length,classId:player.classId,hp:player.hp,sp:player.sp,scoreBlue:matchState.scoreBlue,scoreRed:matchState.scoreRed,time:matchState.timeRemaining,aspect:camera.aspect};},\
        ready(){return !!FO_MAPS.deathmatch&&bots.length>0;},\
        render(){renderer.render(scene,camera);renderer.getContext().finish();},\
        runCohort(){\
          const first=bots.map(b=>({id:b.id,x:b.pos.x,y:b.pos.y,z:b.pos.z}));const started=botAiClockSec;const roster=bots.length;let steps=0;\
          for(let tick=0;tick<200&&!matchState.ended;tick++){\
            const dt=.05;matchState.timeRemaining=Math.max(0,matchState.timeRemaining-dt);updatePlayer(dt);droneSystem.update(dt);updateBots(dt);updateEntitiesAndFX(dt);updateFoBomb(dt,dt);updateFoRescue(dt);steps++;\
            if(tick%20===0){updateHUD();renderer.render(scene,camera);renderer.getContext().finish();}\
          }\
          const last=bots.map(b=>({id:b.id,x:b.pos.x,y:b.pos.y,z:b.pos.z,hp:b.hp,kills:b.kills,deaths:b.deaths,difficulty:b.difficulty}));\
          return {mode:matchState.mode,roster,steps,simulated:botAiClockSec-started,ended:matchState.ended,first,last,scoreBlue:matchState.scoreBlue,scoreRed:matchState.scoreRed};\
        },\
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
function inject(s,count=0){
 assert(s.includes(anchor));
 if(count){
  assert([5,15].includes(count));
  const start=s.indexOf('      function initBots()'),end=s.indexOf('\n      function ',start+1);
  assert(start>=0&&end>start);let body=s.slice(start,end);
  const blue='for (let i = 0; i < 5; i++)',red='for (let i = 0; i < 6; i++)';
  assert(body.includes(blue)&&body.includes(red));
  const nBlue=Math.floor(count/2),nRed=count-nBlue;
  body=body.replace(blue,'for (let i = 0; i < '+nBlue+'; i++)').replace(red,'for (let i = 0; i < '+nRed+'; i++)')
   .replace('name: BOT_NAMES_BLUE[i],','name: BOT_NAMES_BLUE[i] || ("QA_BLUE_"+i),')
   .replace('name: BOT_NAMES_RED[i],','name: BOT_NAMES_RED[i] || ("QA_RED_"+i),');
  s=s.slice(0,start)+body+s.slice(end);
 }
 return s.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js')
 .replace(anchor,hook+'\n'+anchor+'\n        canvas.requestPointerLock=()=>{};Math.random=()=>((qaISeed=(Math.imul(qaISeed,1664525)+1013904223)>>>0)/4294967296);');
}
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});const url=new URL(req.url,'http://127.0.0.1');res.end(inject(url.pathname==='/before'?base:current,Number(url.searchParams.get('count')||0)));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const errors=report.errors;
async function open(version,viewport,hasTouch=false,count=0){
 const page=await browser.newPage({viewport,deviceScaleFactor:1,hasTouch});
 page.on('pageerror',e=>errors.push(version+': '+String(e)));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 await page.goto('http://127.0.0.1:'+server.address().port+'/'+version+(count?'?count='+count:''),{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__foI335?.ready(),null,{polling:100});
 // Do not replace Tailwind with an empty stub; require actual utility styles.
 await page.waitForFunction(()=>getComputedStyle(document.getElementById('menu-overlay')).position==='fixed',null,{timeout:15000,polling:100});
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
    await page.evaluate(()=>window.__foI335.render());
    await page.screenshot({path:path.join(out,prefix+'-menu.png')});
    await page.locator('#btn-deploy').click();
    const deployed=await state(page);assert.equal(deployed.mode,mode);assert(deployed.started&&!deployed.ended);assert.equal(deployed.roster,11);assert.equal(deployed.classId,'assault');
    assert(await page.locator('#menu-overlay').isHidden());
    const hudBounds=await bounds(page,['#radar-canvas','.fo-scoreboard','.fo-status-panel','#slot-bar','.fo-ammo-panel']);
    for(const id of ['hp-value','sp-value','ammo-mag','ammo-reserve','match-timer','score-blue','score-red'])assert((await page.locator('#'+id).innerText()).trim().length>0,id);
    await page.evaluate(()=>window.__foI335.render());
    await page.screenshot({path:path.join(out,prefix+'-hud.png')});
    await page.keyboard.press('Escape');
    assert(await page.locator('#pause-overlay').isVisible(),'pause visible');
    const pauseBounds=await bounds(page,['#pause-overlay .fo-pause-panel','#btn-pause-resume','#btn-pause-map']);
    await page.locator('#btn-pause-score').click();assert(await page.locator('#scoreboard-overlay').isVisible());
    await page.locator('#btn-score-close').click();assert(await page.locator('#pause-overlay').isVisible());
    const beforeCancel=await state(page);
    await page.locator('#btn-pause-map').click();await page.locator('#fo-game-mode').selectOption(modes[(modes.indexOf(mode)+1)%3]);
    await page.locator('#btn-map-cancel').click();assert(await page.locator('#pause-overlay').isVisible());
    assert.deepEqual(await state(page),beforeCancel,'cancel preserves match');
    await page.locator('#btn-pause-resume').click();assert(!(await state(page)).paused);
    await page.setViewportSize({width:viewport.width+32,height:viewport.height+16});
    await page.waitForFunction(()=>Math.abs(window.__foI335.state().aspect-innerWidth/innerHeight)<1e-9,null,{polling:100});
    report.ui.push({viewport,mode,deployed,menuBounds,hudBounds,pauseBounds,cancelPreserved:true,resized:true});
   }finally{await page.close();}
  }
 }
 // I335: test-only variable-size actual AI cohorts, original decision code untouched.
 for(const mode of modes)for(const count of [5,15]){
  const page=await open('after',{width:800,height:500},false,count);
  try{
   await page.locator('#fo-game-mode').selectOption(mode);await page.locator('#btn-deploy').click();
   const row=await page.evaluate(()=>window.__foI335.runCohort());
   report.aiCohorts.push({count,...row});
   assert.equal(row.roster,count);assert.equal(row.last.length,count);assert.equal(row.mode,mode);
   assert(new Set(row.last.map(x=>x.id)).size===count,'unique test actor IDs');
   assert(row.steps>0&&(row.steps===200||row.ended),'10 seconds or legitimate match end');
   assert(Math.abs(row.simulated-row.steps*.05)<1e-7,'actual AI clock advanced');
   assert(row.last.every(b=>[b.x,b.y,b.z,b.hp,b.kills,b.deaths].every(Number.isFinite)),'finite real actor state');
   assert(row.last.some((b,i)=>b.x!==row.first[i].x||b.y!==row.first[i].y||b.z!==row.first[i].z),'actual bot movement');
   await page.screenshot({path:path.join(out,'ai-'+mode+'-'+count+'.png')});
  }finally{await page.close();}
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
 assert.equal(report.ui.length,9);assert.equal(report.aiCohorts.length,6);assert.equal(Object.keys(report.bench.before).length,9);assert.equal(Object.keys(report.bench.after).length,9);assert.deepEqual(errors,[]);
 console.log('I335 preflight PASS; short actual AI cohorts and separate render-only comparisons; not full matches or hardware FPS.');
}finally{
 fs.writeFileSync(path.join(out,'i335-preflight.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));
}
