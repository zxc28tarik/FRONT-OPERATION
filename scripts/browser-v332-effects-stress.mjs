import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const out=path.resolve('test-artifacts/front-operation-h332');fs.mkdirSync(out,{recursive:true});
const before=execFileSync('git',['show','0a57c088db63d5ca44224e3225d092429ea4c92d:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const after=fs.readFileSync('index.html','utf8').replace(/^ *\/\/ FO_V340_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V340_END \1\n/gm,'').replace(/^ *\/\/ FO_V339_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V339_END \1\n/gm,'').replace(/^ *\/\/ FO_V336_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V336_END \1\n/gm,'');
const originals=JSON.parse(fs.readFileSync('scripts/h332-original-blocks.json','utf8'));
const tag=/      \/\/ FO_H332_BEGIN ([^\n]+)\n[\s\S]*?      \/\/ FO_H332_END \1\n/g;
const seen=new Set();assert.equal(after.replace(/    \/\* FO_I335_BEGIN responsive-ui \*\/\n[\s\S]*?    \/\* FO_I335_END responsive-ui \*\/\n/g,'').replace(tag,(_,id)=>{assert(Object.hasOwn(originals,id));assert(!seen.has(id));seen.add(id);return originals[id];}),before,'exact V328 source restore');
assert.equal(seen.size,Object.keys(originals).length);
const anchor='      window.onload = function () {';
const hook=`
      let qaSeed=332,qaDraws=0;
      window.__foH332QA={
        ready(){return !!FO_MAPS.deathmatch;},
        stress(){
          // Isolated synthetic-time effect/equipment stress; no AI ticks.
          // Existing live gameplay functions are called, not reimplemented.
          for(const b of bots)scene.remove(b.mesh.root);bots.length=0;
          player.alive=false;viewmodelGroup.visible=false;
          sound.playExplosion=()=>{};sound.playHeal=()=>{};
          const modes=['deathmatch','bomb','rescue'],rows=[],images=[];
          const lists=[activeTracers,activeParticles,activeImpactMarks,activeShellCasings,activeGrenades,activeRockets,activeMedkits,activeClaymores];
          const state=()=>lists.map(list=>list.map(e=>({life:e.life,fuse:e.fuse,healTick:e.healTick,armTimer:e.armTimer,team:e.team,
            pos:e.pos?.toArray(),vel:e.vel?.toArray(),rotVel:e.rotVel?.toArray(),start:e.start?.toArray(),end:e.end?.toArray(),dir:e.dir?.toArray(),
            mesh:e.mesh.position.toArray(),scale:e.mesh.scale.toArray(),rotation:e.mesh.quaternion.toArray(),ringScale:e.ring?.scale.toArray(),
            material:e.mesh.material?.color?.getHex(),opacity:e.mesh.material?.opacity,mark:e.mesh.userData?.v277Mark,impact:e.mesh.userData?.v277Impact})));
          const snap=()=>JSON.stringify(state());
          let h=2166136261;
          const hash=s=>{for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);};
          const pool=()=>typeof foH332VfxStats==='undefined'?null:{...foH332VfxStats,free:foH332VectorPool.length,geoCache:foH332EquipmentGeometry.size};
          const render=()=>{
            let shadow=0,total=0;const f=renderer.renderBufferDirect;
            renderer.renderBufferDirect=function(c,s,g,m,...rest){total++;if(m?.isMeshDepthMaterial||m?.isMeshDistanceMaterial)shadow++;return f.call(this,c,s,g,m,...rest);};
            try{renderer.render(scene,camera);renderer.getContext().finish();}
            finally{renderer.renderBufferDirect=f;}
            return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,shadow,total,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,image:canvas.toDataURL('image/png')};
          };
          // Identical synthetic clock for wall-clock driven cosmetic medkit pulse.
          // Only QA changes: production performance.now() remains untouched.
          let qaClock=1000;
          const previousClock=Object.getOwnPropertyDescriptor(performance,'now');
          Object.defineProperty(performance,'now',{configurable:true,value:()=>qaClock});
          try {
          for(let cycle=0;cycle<12;cycle++){
            const mode=modes[cycle%3];clearAllMatchEntities();selectFoMap(mode);
            camera.position.set(0,2.2,30);camera.lookAt(0,1.5,19);
            const pos=new THREE.Vector3(0,1.5,24),normal=new THREE.Vector3(0,1,0),dir=new THREE.Vector3(0,0,-1);
            const end=new THREE.Vector3(0,1.5,15),quat=new THREE.Quaternion();
            // Explicit cap evictions in a single burst.
            for(let n=0;n<45;n++){spawnTracer(pos,end,n%2?'sniper':'rifle');spawnShellCasing(pos,quat,'rifle');spawnImpactMark(pos,normal,n%2===0);}
            let max=[0,0,0,0];let activeRender;
            for(let tick=0;tick<1000;tick++){
              qaClock=1000+(cycle*1000+tick)*50;
              if(tick%10===0){spawnTracer(pos,end,tick%20?'rifle':'sniper');spawnShellCasing(pos,quat,'rifle');spawnImpactFX(pos,normal,tick%20===0,10);spawnCharacterHitFX(pos,tick%20===0,10);}
              if(tick%100===0){deployMedkit(pos,'blue');deployClaymore(pos,0,'QA','blue');throwGrenade(pos.clone(),dir,'QA','blue');fireRocket(pos.clone(),dir,'QA','blue');}
              updateEntitiesAndFX(.05);
              for(let i=0;i<4;i++)max[i]=Math.max(max[i],lists[i].length);
              if(tick%20===0)hash(snap());
              if(tick===3){activeRender=render();images.push({name:'active-'+cycle,image:activeRender.image});delete activeRender.image;}
            }
            const preClear=snap();
            clearAllMatchEntities();const cleared=lists.every(l=>l.length===0),empty=render();
            images.push({name:'empty-'+cycle,image:empty.image});delete empty.image;
            rows.push({cycle,mode,max,cleared,hash:h>>>0,preClearHash:(()=>{let x=2166136261;for(let i=0;i<preClear.length;i++)x=Math.imul(x^preClear.charCodeAt(i),16777619);return x>>>0;})(),rng:qaDraws,active:activeRender,empty,pool:pool()});
          }
          return {rows,images,simulatedSeconds:600,pool:pool(),rng:qaDraws};
          } finally { if(previousClock)Object.defineProperty(performance,'now',previousClock);else delete performance.now; }
        }
      };
`;
const inject=h=>h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js')
 .replace(anchor,hook+anchor+'\n        Math.random=()=>{qaDraws++;return ((qaSeed=(Math.imul(qaSeed,1664525)+1013904223)>>>0)/4294967296);};');
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(inject(req.url==='/before'?before:after));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const errors=[],data={};
try{
 for(const version of ['before','after']){
  const page=await browser.newPage({viewport:{width:800,height:500},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(version+': '+String(e)));
  await page.route('https://cdn.tailwindcss.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+version,{waitUntil:'load',timeout:80000});
  await page.waitForFunction(()=>window.__foH332QA?.ready());
  const r=await page.evaluate(()=>window.__foH332QA.stress());
  r.imageHashes={};
  for(const {name,image} of r.images){const png=Buffer.from(image.split(',')[1],'base64');r.imageHashes[name]=createHash('sha256').update(png).digest('hex');fs.writeFileSync(path.join(out,version+'-'+name+'.png'),png);}
  delete r.images;data[version]=r;await page.close();
 }
 fs.writeFileSync(path.join(out,'h332-diagnostic.json'),JSON.stringify({data,errors},null,2));
 const a=data.before,b=data.after;
 assert.equal(a.simulatedSeconds,600);assert.equal(b.simulatedSeconds,600);
 assert.equal(a.rng,b.rng,'RNG sequence');
 assert.deepEqual(a.imageHashes,b.imageHashes,'48 PNGs, 24 paired pixel hashes');
 assert.equal(a.rows.length,12);assert.equal(b.rows.length,12);
 for(let i=0;i<12;i++){
  const x=a.rows[i],y=b.rows[i];
  for(const k of ['mode','hash','preClearHash','rng','cleared'])assert.equal(y[k],x[k],i+' '+k);
  assert(y.cleared,'reset left active entities');assert.deepEqual(y.max,x.max,'VFX cap parity');
  for(const phase of ['active','empty'])for(const k of ['calls','triangles','shadow','total','textures'])assert.equal(y[phase][k],x[phase][k],i+' '+phase+' '+k);
  assert(y.pool.free<=256&&y.pool.geoCache<=16,'bounded pools');
  assert.equal(y.pool.created+y.pool.reused-y.pool.released,0,'no leaked vector leases');
 }
 assert(b.pool.reused>1000);assert(b.pool.geoReused>100);assert(b.pool.created<256);
 assert.equal(b.rows[11].pool.geoCache,b.rows[5].pool.geoCache,'equipment cache plateau');
 const late=b.rows.slice(3).map(r=>r.empty.geometries);
 assert(Math.max(...late)-Math.min(...late)<=16,'uploaded geometry plateau after map warmup');
 assert.deepEqual(errors,[]);
 const report={simulatedSecondsPerVersion:600,restarts:12,pairedFrames:24,pool:b.pool,rows:b.rows,baseline:a.rows,imageHashes:b.imageHashes,errors};
 fs.writeFileSync(path.join(out,'h332-report.json'),JSON.stringify(report,null,2));
 console.log('H332 PASS',JSON.stringify(report,null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
