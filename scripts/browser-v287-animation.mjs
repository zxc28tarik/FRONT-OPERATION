import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
const output=path.resolve('test-artifacts/front-operation-browser');fs.mkdirSync(output,{recursive:true});
const source=fs.readFileSync('index.html','utf8');
const anchor='      window.onload = function () {';
const hook=`
      window.__fo287={
        setup:()=>{gamePaused=true;canvas.requestPointerLock=()=>{};},
        snapshot:()=>({started:matchState.started,alive:player.alive,mode:matchState.mode}),
        sample:(id,phase)=>{
          gamePaused=true;clearV271PlayerFlash();buildViewmodel(id);
          viewmodelGroup.visible=true;currentViewmodelMesh.visible=true;
          viewmodelGroup.position.set(0,0,0);viewmodelGroup.rotation.set(0,0,0);
          camera.updateMatrixWorld(true);
          const actor={alive:true,ads:false,sprinting:false,fireCooldown:0,switchAnim:1-phase,
            reloading:phase>0&&phase<1,reloadTimer:1-phase,reloadDuration:1,
            boltAnimTimer:.52*(1-phase),slideKick:1-phase,knifeSwingTimer:.24*(1-phase)};
          const snap=()=>JSON.stringify([viewmodelGroup.position.toArray(),viewmodelGroup.rotation.toArray(),
            ...vmRefs.v287Pose.entries.map(e=>[e.node.position.toArray(),e.node.rotation.toArray()])]);
          const before=snap();
          const draw=()=>{
            const started=performance.now();renderer.render(scene,camera);renderer.getContext().finish();
            return {ms:performance.now()-started,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
          };
          const baseline=draw();
          let result,image;
          try{beginV287RenderPose(vmRefs,actor,.016,false);result=draw();image=canvas.toDataURL('image/png');}
          finally{restoreV287RenderPose(vmRefs);}
          return {baseline,result,restored:snap()===before,image};
        }
      };
`;
assert(source.includes(anchor));
const server=createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(source.replace(anchor,hook+anchor));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const errors=[],report=[];
try{
 const page=await browser.newPage({viewport:{width:960,height:600},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__fo287&&window.THREE&&document.querySelectorAll('.class-card').length===5);
 await page.evaluate(()=>{window.__fo287.setup();document.getElementById('btn-deploy').click();window.__fo287.setup();});
 assert((await page.evaluate(()=>window.__fo287.snapshot())).started);
 for(const id of ['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf','knife','drone','m67','medkit','claymore']){
  for(const phase of [.25,.50,.85]){
   const row=await page.evaluate(({id,phase})=>window.__fo287.sample(id,phase),{id,phase});
   assert(row.restored,id+' render transform not restored');
   assert(row.baseline.calls>0&&row.result.calls>0);
   fs.writeFileSync(path.join(output,'v287-'+id+'-'+phase+'.png'),Buffer.from(row.image.split(',')[1],'base64'));
   delete row.image;report.push({id,phase,...row});
  }
 }
 assert.equal(report.length,36);assert.deepEqual(errors,[]);
 console.log('V287 browser animation acceptance: 36 real-scene pose captures, restored simulation transforms and render costs.');
}finally{
 fs.writeFileSync(path.join(output,'v287-render-report.json'),JSON.stringify({report,errors,measurement:'fixed camera software WebGL render cost, not gameplay FPS'},null,2));
 await browser.close();await new Promise(r=>server.close(r));
}
