import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const out=path.resolve('test-artifacts/front-operation-e306');fs.mkdirSync(out,{recursive:true});
const before=execFileSync('git',['show','1329fcb17e42cf790ecd4c066a03087ffb280d9a:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const after=execFileSync('git',['show','5b3c815c9497ab57ecc5b3bd115e4310a89670d1:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const fTag=/      \/\/ FO_F316_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_F316_END [^\n]+\n/g;
const h332Tag=/      \/\/ FO_H332_BEGIN ([^\n]+)\n[\s\S]*?      \/\/ FO_H332_END \1\n/g;
const h332Originals=JSON.parse(fs.readFileSync('scripts/h332-original-blocks.json','utf8'));
const stripH332=h=>h.replace(h332Tag,(_,id)=>{if(!Object.hasOwn(h332Originals,id))throw Error('Unknown H332 block '+id);return h332Originals[id];});
const h328Tag=/      \/\/ FO_H328_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_H328_END [^\n]+\n/g;
const g324Tag=/      \/\/ FO_G324_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_G324_END [^\n]+\n/g;
const gTag=/      \/\/ FO_G320_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_G320_END [^\n]+\n/g;
const current=stripH332(fs.readFileSync('index.html','utf8').replace(/^ *\/\/ FO_V342_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V342_END \1\n/gm,'').replace(/^ *\/\/ FO_V341_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V341_END \1\n/gm,'').replace(/^ *\/\/ FO_V340_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V340_END \1\n/gm,'').replace(/^ *\/\/ FO_V339_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V339_END \1\n/gm,'').replace(/^ *\/\/ FO_V336_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V336_END \1\n/gm,'').replace(/    \/\* FO_I335_BEGIN responsive-ui \*\/\n[\s\S]*?    \/\* FO_I335_END responsive-ui \*\/\n/g,'')).replace(h328Tag,'').replace(g324Tag,'').replace(gTag,'').replace(fTag,'');
const nextTag=/      \/\/ FO_E311_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_E311_END [^\n]+\n/g;
assert.equal(current.replace(nextTag,''),after,'V306 historical source preserved under V311 additions');
const tag=/      \/\/ FO_E306_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_E306_END [^\n]+\n/g;
assert.equal(after.replace(tag,''),before,'all non-E source bytes must match V301');
const anchor='      window.onload = function () {';
const hook=`
      let foEQAseed=306,foEQAdraws=0;
      window.__foE306QA={
        inventory(mode){
          selectFoMap(mode);
          const hash=bytes=>{let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return h>>>0;};
          const textureCache=new Map();
          const fingerprint=t=>{
            if(!t||!t.image||typeof t.image.getContext!=='function')return null;
            if(!textureCache.has(t)){
              const c=t.image,ctx=c.getContext('2d');
              textureCache.set(t,hash(ctx.getImageData(0,0,c.width,c.height).data));
            }
            return textureCache.get(t);
          };
          const mesh=mapEnvironmentMeshes.map(o=>{
            const g=o.geometry,materials=Array.isArray(o.material)?o.material:[o.material];
            const geometry=g?{type:g.type,attributes:Object.fromEntries(Object.entries(g.attributes).map(([name,a])=>[name,[a.itemSize,a.count,hash(new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength))]])),index:g.index?[g.index.count,hash(new Uint8Array(g.index.array.buffer,g.index.array.byteOffset,g.index.array.byteLength))]:null}:null;
            return {geometry,position:o.position.toArray(),rotation:o.rotation.toArray(),scale:o.scale.toArray(),visible:o.visible,cast:o.castShadow,receive:o.receiveShadow,metal:o.userData.isMetal??null,
              materials:materials.map(m=>m?{type:m.type,side:m.side,opacity:m.opacity,transparent:m.transparent,alphaTest:m.alphaTest,depthWrite:m.depthWrite}:null),
              textures:materials.map(m=>[fingerprint(m?.map),fingerprint(m?.bumpMap)])};
          });
          const mats=new Set(),textures=new Set(),interior={};
          for(const o of mapEnvironmentMeshes)for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){
            mats.add(m);if(m.name?.startsWith('FO_E306:'))interior[m.name]=(interior[m.name]||0)+1;for(const t of [m.map,m.bumpMap,m.alphaMap,m.normalMap])if(t)textures.add(t);
          }
          return {mode,mesh,colliders:JSON.stringify(mapColliders),ramps:JSON.stringify(mapRamps),nodes:JSON.stringify(NAV_NODES),edges:JSON.stringify(NAV_EDGES),adj:JSON.stringify(NAV_ADJ),objects:FO_MAPS[mode].objects.length,materials:mats.size,textures:textures.size,interior,rngDraws:foEQAdraws};
        },
        draw(mode,pose){
          selectFoMap(mode);
          const cam=new THREE.PerspectiveCamera(70,canvas.width/canvas.height,.1,240);
          cam.position.set(...pose.slice(0,3));cam.lookAt(...pose.slice(3));
          const t=performance.now();renderer.render(scene,cam);renderer.getContext().finish();
          return {image:canvas.toDataURL('image/png'),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,ms:performance.now()-t};
        },
        ready(){return !!FO_MAPS.deathmatch;}
      };
`;
const inject=h=>h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js')
 .replace(anchor,hook+anchor+'\n        Math.random=()=>{foEQAdraws++;return ((foEQAseed=(Math.imul(foEQAseed,1664525)+1013904223)>>>0)/4294967296);};');
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(inject(req.url==='/before'?before:after));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const modes=['deathmatch','bomb','rescue'];
const poses={
 deathmatch:[['warehouse',[-28,1.65,-33,-28,1.5,0]],['machine',[-25,1.65,-12,-24,.8,-8]],['central',[0,1.65,34,0,1.5,0]],['east',[27,1.65,35,25,1.5,0]]],
 bomb:[['maintenance',[-16*1.368,1.65,-38*.765,-21*1.368,1.2,-22*.765]],['storage',[-32*1.368,1.65,8*.765,-35.3*1.368,1.1,10*.765]],['yard',[16*1.368,1.65,-17*.765,16*1.368,2,-28*.765]],['street',[0,1.65,38*.765,0,1.5,6*.765]]],
 rescue:[['courtyard',[0,1.65,38,0,1.5,0]],['approach',[-18,1.65,-17,-18,1.5,-36]]]
};
const data={},errors=[];
try{
 for(const version of ['before','after']){
  const page=await browser.newPage({viewport:{width:800,height:500},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(version+': '+String(e)));
  await page.route('https://cdn.tailwindcss.com/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
  await page.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+version,{waitUntil:'load',timeout:80000});
  await page.waitForFunction(()=>window.__foE306QA?.ready());
  const inv={},shots={};
  for(const mode of modes)inv[mode]=await page.evaluate(m=>window.__foE306QA.inventory(m),mode);
  for(const mode of modes)for(const [name,pose] of poses[mode]){
   const r=await page.evaluate(({mode,pose})=>window.__foE306QA.draw(mode,pose),{mode,pose});
   const img=Buffer.from(r.image.split(',')[1],'base64');
   fs.writeFileSync(path.join(out,version+'-'+mode+'-'+name+'.png'),img);
   delete r.image;shots[mode+'-'+name]={...r,imageHash:(await import('node:crypto')).createHash('sha256').update(img).digest('hex')};
  }
  data[version]={inv,shots};await page.close();
 }
 const report={maps:{},views:{},errors};
 for(const mode of modes){
  const a=data.before.inv[mode],b=data.after.inv[mode];
  for(const key of ['colliders','ramps','nodes','edges','adj','objects','rngDraws'])assert.equal(b[key],a[key],mode+' '+key);
  const strip=rows=>rows.map(({textures,...m})=>m);
  assert.deepEqual(strip(b.mesh),strip(a.mesh),mode+' exact geometry/transform/raycast material parity');
  const changed=b.mesh.reduce((n,m,i)=>n+Number(JSON.stringify(m.textures)!==JSON.stringify(a.mesh[i].textures)),0);
  if(mode==='rescue'){assert.equal(changed,0);assert.equal(b.textures,a.textures);assert.equal(b.materials,a.materials);}
  else{
   assert(changed>0,mode+' surface texture did not change');
   const expected=mode==='deathmatch'?2:3;
   assert.equal(b.textures-a.textures,expected,mode+' texture allocation');
   assert.equal(b.materials-a.materials,expected,mode+' material allocation');
   assert.equal(Object.keys(b.interior).length,expected,mode+' interior finish coverage');
   assert(Object.values(b.interior).every(n=>n>0));
   assert(Object.keys(data.before.shots).filter(k=>k.startsWith(mode+'-')).some(k=>data.before.shots[k].imageHash!==data.after.shots[k].imageHash),mode+' render did not change');
  }
  report.maps[mode]={meshes:a.mesh.length,objects:a.objects,colliders:JSON.parse(a.colliders).length,ramps:JSON.parse(a.ramps).length,nodes:JSON.parse(a.nodes).length,edges:JSON.parse(a.edges).length,rngDraws:a.rngDraws,materialsBefore:a.materials,materialsAfter:b.materials,texturesBefore:a.textures,texturesAfter:b.textures,changedMeshes:changed,interior:b.interior};
 }
 for(const [name,a] of Object.entries(data.before.shots)){
  const b=data.after.shots[name];assert(a.calls>0&&a.triangles>0);
  assert.equal(b.calls,a.calls,name+' draw call budget');assert.equal(b.triangles,a.triangles,name+' triangle budget');
  report.views[name]={before:a,after:b};
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'e306-report.json'),JSON.stringify(report,null,2));
 console.log('E302–E306 WebGL PASS',JSON.stringify(report,null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
