import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const out=path.resolve('test-artifacts/front-operation-h328');fs.mkdirSync(out,{recursive:true});
const before=execFileSync('git',['show','558dc3b494c4fb43e66e69249170f2070697ba56:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const h332Tag=/      \/\/ FO_H332_BEGIN ([^\n]+)\n[\s\S]*?      \/\/ FO_H332_END \1\n/g;
const h332Originals=JSON.parse(fs.readFileSync('scripts/h332-original-blocks.json','utf8'));
const stripH332=h=>h.replace(h332Tag,(_,id)=>{if(!Object.hasOwn(h332Originals,id))throw Error('Unknown H332 block '+id);return h332Originals[id];});
const after=stripH332(fs.readFileSync('index.html','utf8'));
const tag=/      \/\/ FO_H328_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_H328_END [^\n]+\n/g;
assert.equal(after.replace(tag,''),before,'all non-H source bytes unchanged');
const anchor='      window.onload = function () {';
const hook=`
      let foHQAseed=328,foHQAdraws=0,foHQAmodels=null;
      window.__foH328QA={
        ready(){return !!FO_MAPS.deathmatch;},
        inventory(mode){
          selectFoMap(mode);scene.updateMatrixWorld(true);
          const hash=bytes=>{let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return h>>>0;};
          const attr=a=>a?[a.itemSize,a.count,a.normalized,hash(new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength))]:null;
          const mesh=mapEnvironmentMeshes.map(o=>({type:o.geometry?.type,attrs:Object.fromEntries(Object.entries(o.geometry?.attributes||{}).map(([k,a])=>[k,attr(a)])),index:attr(o.geometry?.index),groups:o.geometry?.groups,
            local:o.matrix.toArray(),world:o.matrixWorld.toArray(),position:o.position.toArray(),rotation:o.rotation.toArray(),scale:o.scale.toArray(),visible:o.visible,cast:o.castShadow,receive:o.receiveShadow,metal:o.userData.isMetal??null}));
          const geos=new Set(mapEnvironmentMeshes.map(o=>o.geometry).filter(Boolean)),mats=new Set(),textures=new Set();
          for(const o of mapEnvironmentMeshes)for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){
            mats.add(m);for(const t of [m.map,m.bumpMap,m.alphaMap,m.normalMap])if(t)textures.add(t);
          }
          const dynamic=[dustParticles,...FO_BOMB_SITES.map(s=>s.beacon),...FO_RESCUE_POINTS.flatMap(p=>(p.parts||[]).map(q=>q.mesh))].filter(o=>o&&mapEnvironmentMeshes.includes(o));
          const dynamicTest=dynamic.map(o=>{const original=o.position.clone(),y=o.matrixWorld.elements[13];o.position.y+=.125;scene.updateMatrixWorld(true);const moved=Math.abs(o.matrixWorld.elements[13]-y-.125)<1e-8;o.position.copy(original);scene.updateMatrixWorld(true);return {auto:o.matrixAutoUpdate,moved};});
          const sights=[];for(const [a,b] of NAV_EDGES){const p=NAV_NODES[a],q=NAV_NODES[b];sights.push(hasLineOfSight(new THREE.Vector3(p.x,(p.y||0)+1.48,p.z),new THREE.Vector3(q.x,(q.y||0)+1.48,q.z)));}
          return {mesh,geometries:geos.size,materials:mats.size,textures:textures.size,globalGeos:new Set(Object.values(FO_MAPS).flatMap(a=>a.meshes.map(m=>m.geometry))).size,
            attributeBytes:[...geos].reduce((sum,g)=>sum+[g.index,...Object.values(g.attributes)].filter(Boolean).reduce((n,a)=>n+a.array.byteLength,0),0),
            auto:mapEnvironmentMeshes.filter(o=>o.matrixAutoUpdate).length,dynamicTest,sights,colliders:JSON.stringify(mapColliders),ramps:JSON.stringify(mapRamps),nodes:JSON.stringify(NAV_NODES),edges:JSON.stringify(NAV_EDGES),adj:JSON.stringify(NAV_ADJ),rng:foHQAdraws,
            stats:typeof foH328MapStats==='undefined'?null:foH328MapStats.get(mode)};
        },
        prepare(){
          // Render-only cohort. No synthetic bots are added to simulation.
          foHQAmodels=bots.map(b=>b.mesh);
          for(let i=foHQAmodels.length;i<15;i++)foHQAmodels.push(createEnhancedBotSoldierMesh(i%2?'red':'blue',CLASS_ORDER[i%5],i%3));
          for(const m of foHQAmodels)scene.remove(m.root);
          viewmodelGroup.visible=false;
        },
        benchmark(mode,count){
          selectFoMap(mode);
          const cam=new THREE.PerspectiveCamera(74,canvas.width/canvas.height,.03,280);
          const z=mode==='bomb'?29:38;
          cam.position.set(0,1.65,z);cam.lookAt(0,1.65,-15);
          for(let i=0;i<foHQAmodels.length;i++){
            const m=foHQAmodels[i];scene.remove(m.root);
            if(i>=count)continue;
            // Fixed visible formation across near/mid/far distances; no AI/ticks.
            m.root.position.set((i%5-2)*2.2,0,z-7-Math.floor(i/5)*15);
            m.root.rotation.set(0,Math.PI,0);m.root.visible=true;
            m.setVisualDetailDistance?.(0);
            m.setVisualDetailDistance?.(m.root.position.distanceTo(cam.position));
            scene.add(m.root);
          }
          renderer.render(scene,cam);renderer.getContext().finish();
          const times=[],submit=[];
          const mapSet=new Set(mapEnvironmentMeshes),originalUpdate=THREE.Object3D.prototype.updateMatrix;
          let localMatrixCalls=0;
          try{
            THREE.Object3D.prototype.updateMatrix=function(){if(mapSet.has(this))localMatrixCalls++;return originalUpdate.call(this);};
            renderer.render(scene,cam);renderer.getContext().finish();
          }finally{THREE.Object3D.prototype.updateMatrix=originalUpdate;}
          // Timing is measured separately, without the instrumentation overhead.
          for(let i=0;i<3;i++){
            const t=performance.now();renderer.render(scene,cam);submit.push(performance.now()-t);renderer.getContext().finish();times.push(performance.now()-t);
          }
          return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,
            times,submit,localMatrixCalls,levels:foHQAmodels.slice(0,count).map(m=>m.visualDetailLevel),image:canvas.toDataURL('image/png'),rng:foHQAdraws};
        },
        lod(){
          const m=foHQAmodels[0],rows=[];
          for(const d of [0,22,24,21,18,47,43,39,18,0]){
            m.setVisualDetailDistance(d);
            let visible=0,triangles=0;
            m.root.traverseVisible(n=>{if(n.isMesh){visible++;const g=n.geometry;triangles+=(g.index?g.index.count:g.attributes.position.count)/3;}});
            rows.push({d,level:m.visualDetailLevel,visible,triangles});
          }
          return rows;
        }
      };
`;
const inject=h=>h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js')
 .replace(anchor,hook+anchor+'\n        Math.random=()=>{foHQAdraws++;return ((foHQAseed=(Math.imul(foHQAseed,1664525)+1013904223)>>>0)/4294967296);};');
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(inject(req.url==='/before'?before:after));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const modes=['deathmatch','bomb','rescue'],data={},errors=[];
try{
 for(const version of ['before','after']){
  const page=await browser.newPage({viewport:{width:800,height:500},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(version+': '+String(e)));
  await page.route('https://cdn.tailwindcss.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+version,{waitUntil:'load',timeout:80000});
  await page.waitForFunction(()=>window.__foH328QA?.ready());
  const inv={},bench={};
  for(const mode of modes)inv[mode]=await page.evaluate(m=>window.__foH328QA.inventory(m),mode);
  await page.evaluate(()=>window.__foH328QA.prepare());
  const lod=await page.evaluate(()=>window.__foH328QA.lod());
  for(const mode of modes)for(const count of [0,5,15]){
   const r=await page.evaluate(({mode,count})=>window.__foH328QA.benchmark(mode,count),{mode,count});
   const image=Buffer.from(r.image.split(',')[1],'base64');delete r.image;
   r.imageHash=createHash('sha256').update(image).digest('hex');
   fs.writeFileSync(path.join(out,version+'-'+mode+'-'+count+'.png'),image);
   bench[mode+'-'+count]=r;
  }
  data[version]={inv,bench,lod};await page.close();
 }
 const report={maps:{},bench:{},lod:data.after.lod,errors};
 assert.deepEqual(data.after.lod,data.before.lod,'existing LOD visibility and triangle parity');
 for(const mode of modes){
  const a=data.before.inv[mode],b=data.after.inv[mode];
  for(const k of ['mesh','dynamicTest','sights'])assert.deepEqual(b[k],a[k],mode+' '+k);
  for(const k of ['materials','textures','colliders','ramps','nodes','edges','adj','rng'])assert.equal(b[k],a[k],mode+' '+k);
  assert(b.dynamicTest.every(x=>x.auto&&x.moved),mode+' dynamic objective still updates');
  assert(b.geometries<a.geometries&&b.attributeBytes<a.attributeBytes&&b.auto<a.auto,mode+' structural gain');
  assert(b.stats?.disposed>0&&b.stats?.frozen>0,mode+' safe cleanup');
  report.maps[mode]={objects:a.mesh.length,geometriesBefore:a.geometries,geometriesAfter:b.geometries,attributeBytesBefore:a.attributeBytes,attributeBytesAfter:b.attributeBytes,matrixAutoBefore:a.auto,matrixAutoAfter:b.auto,globalGeosBefore:a.globalGeos,globalGeosAfter:b.globalGeos,dynamic:b.dynamicTest.length,sights:a.sights.length,stats:b.stats};
 }
 for(const [k,a] of Object.entries(data.before.bench)){
  const b=data.after.bench[k];
  for(const v of ['calls','triangles','textures','imageHash','rng'])assert.equal(b[v],a[v],k+' '+v);
  assert.deepEqual(b.levels,a.levels,k+' LOD');
  assert(b.geometries<=a.geometries,k+' uploaded geometry count');
  assert(b.localMatrixCalls<a.localMatrixCalls,k+' actual static local matrix work reduced');
  const median=x=>[...x].sort((a,b)=>a-b)[1];
  report.bench[k]={before:a,after:b,medianBeforeMs:median(a.times),medianAfterMs:median(b.times),submitBeforeMs:median(a.submit),submitAfterMs:median(b.submit)};
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'h328-report.json'),JSON.stringify(report,null,2));
 console.log('H328 PASS',JSON.stringify(report,null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
