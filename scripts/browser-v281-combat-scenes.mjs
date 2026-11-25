import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
const output=path.resolve('test-artifacts/front-operation-browser');fs.mkdirSync(output,{recursive:true});
const old=fs.readFileSync(process.env.FO_V277_BASELINE,'utf8'),now=fs.readFileSync('index.html','utf8');
const hook=`
      // Local QA only; never shipped in index.html.
      window.__fo281={
        setup:()=>{
          gamePaused=true;
          canvas.requestPointerLock=()=>{};
        },
        snapshot:()=>({mode:matchState.mode,started:matchState.started,
          nav:NAV_NODES.length,colliders:mapColliders.length,botCount:bots.length,
          graph:JSON.stringify(NAV_NODES),position:player.pos.toArray(),yaw:player.yaw}),
        sample:(id,category,pose)=>{
          gamePaused=true;
          clearAllMatchEntities();clearV271PlayerFlash();
          camera.position.set(pose.position[0],pose.position[1]+1.62,pose.position[2]);
          camera.rotation.set(0,pose.yaw,0);
          camera.fov=74;camera.updateProjectionMatrix();
          viewmodelGroup.position.set(0,0,0);viewmodelGroup.rotation.set(0,0,0);
          viewmodelGroup.visible=true;buildViewmodel(id);
          camera.updateMatrixWorld(true);
          const render=()=>{
            const start=performance.now();renderer.render(scene,camera);
            renderer.getContext().finish();
            const elapsed=performance.now()-start;
            return {ms:elapsed,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
          };
          const plain=render(),plainImage=canvas.toDataURL('image/png');
          const before=vmRefs.muzzlePoint.getWorldPosition(new THREE.Vector3());
          triggerV273PlayerFlash(id,category);
          const fx=render(),flashImage=canvas.toDataURL('image/png');
          const after=vmRefs.muzzlePoint.getWorldPosition(new THREE.Vector3());
          const match=before.distanceTo(after)<.000001&&v271PlayerFlash?.geometry?.userData?.v273Profile===id;
          const flashMesh=v271PlayerFlash?.visible&&v271PlayerFlash.parent===vmRefs.muzzlePoint;
          clearV271PlayerFlash();
          const direction=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
          const point=camera.position.clone().addScaledVector(direction,2.2);
          const normal=direction.clone().negate();
          spawnImpactFX(point,normal,true,2.2);
          spawnImpactFX(point.clone().add(new THREE.Vector3(.26,0,0)),normal,false,2.2);
          spawnTracer(before,point,category);
          spawnShellCasing(vmRefs.ejectPoint.getWorldPosition(new THREE.Vector3()),camera.quaternion,category);
          const frames=[];
          for(let i=0;i<3;i++)frames.push(render());
          const combatImage=canvas.toDataURL('image/png');
          const counts={particles:activeParticles.length,marks:activeImpactMarks.length,tracers:activeTracers.length,casings:activeShellCasings.length};
          clearAllMatchEntities();
          return {plain,fx,frames,match,flashMesh,visibleImageChanged:plainImage!==flashImage,counts,flashImage,combatImage};
        }
      };
`;
const anchor='      window.onload = function () {';
const server=createServer((req,res)=>{
 const source=req.url==='/baseline'?old:now;
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache'});
 res.end(source.replace(anchor,hook+anchor));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const report=[];const errors=[];
const ids=[['hk416','rifle'],['mp7','smg'],['mrad','sniper'],['minimi','lmg'],['p320','pistol'],['glock18c','pistol'],['carlgustaf','rocket']];
try{
 for(const mode of ['deathmatch','bomb','rescue']){
  let reference=null;
  for(const variant of ['baseline','candidate']){
   const page=await browser.newPage({viewport:{width:960,height:600},deviceScaleFactor:1});
   page.on('pageerror',e=>errors.push(mode+'/'+variant+': '+String(e)));
   await page.goto('http://127.0.0.1:'+server.address().port+'/'+variant,{waitUntil:'load',timeout:80000});
   await page.waitForFunction(()=>window.__fo281&&window.THREE&&document.querySelectorAll('.class-card').length===5);
   await page.locator('#fo-game-mode').selectOption(mode);
   await page.evaluate(()=>{window.__fo281.setup();document.getElementById('btn-deploy').click();window.__fo281.setup();});
   const state=await page.evaluate(()=>window.__fo281.snapshot());
   assert.equal(state.mode,mode);assert(state.started&&state.botCount===11&&state.colliders>0);
   if(!reference)reference=state;
   else{assert.equal(state.graph,reference.graph);assert.equal(state.colliders,reference.colliders);}
   const chosen=mode==='deathmatch'?ids:[ids[0],ids[3]];
   for(const [id,category] of chosen){
    const r=await page.evaluate(({id,category,pose})=>window.__fo281.sample(id,category,pose),{id,category,pose:reference});
    assert(r.match&&r.flashMesh,id+' muzzle anchor/profile mismatch');
    assert(r.visibleImageChanged,id+' effect did not alter actual rendered image');
    assert(r.counts.particles<=145&&r.counts.marks<=38&&r.counts.tracers<=28&&r.counts.casings<=32);
    const save=(suffix,data)=>fs.writeFileSync(path.join(output,'v281-'+mode+'-'+variant+'-'+id+'-'+suffix+'.png'),Buffer.from(data.split(',')[1],'base64'));
    save('flash',r.flashImage);save('combat',r.combatImage);
    delete r.flashImage;delete r.combatImage;
    report.push({mode,variant,id,...r});
   }
   await page.close();
  }
 }
 assert.equal(report.length,22);
 assert.deepEqual(errors,[]);
 console.log('V280–V281 PASS: seven weapon effects in actual game scenes, all three modes, 22 paired samples, rendering cost recorded.');
}finally{
 fs.writeFileSync(path.join(output,'v281-combat-scene-report.json'),JSON.stringify({report,errors,measurement:'fixed camera, software WebGL synchronized render time; not gameplay FPS'},null,2));
 await browser.close();await new Promise(r=>server.close(r));
}
