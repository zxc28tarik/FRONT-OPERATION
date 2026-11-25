import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const s=fs.readFileSync('index.html','utf8');
const a=s.indexOf('      const V273_FLASH_PROFILES='),b=s.indexOf('      const activeTracers = [];',a);
assert(a>=0&&b>a);
const source=s.slice(a,b)+'\nreturn {profiles:V273_FLASH_PROFILES,assets:getV273MuzzleAssets()};';
const output='test-artifacts/front-operation-browser';
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1400,height:840},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.setContent('<html><body style="margin:0;background:#222831"><canvas id="stage"></canvas><div id="labels" style="position:absolute;inset:0;pointer-events:none;color:white;font:18px Arial"></div></body></html>');
 await page.addScriptTag({path:path.resolve('node_modules/three/build/three.min.js')});
 const report=await page.evaluate(source=>{
  const T=window.THREE,{profiles,assets}=new Function('THREE',source)(T);
  const r=new T.WebGLRenderer({canvas:document.getElementById('stage'),antialias:true,preserveDrawingBuffer:true});
  r.setSize(1400,840);r.setScissorTest(true);
  const scene=new T.Scene();scene.background=new T.Color(0x222831);
  const mesh=new T.Mesh(assets.geometries.get(profiles.hk416),assets.material);scene.add(mesh);
  const camera=new T.PerspectiveCamera(31,350/420,.01,10);
  const rows=[],labels=document.getElementById('labels');
  for(const [i,[id,p]] of Object.entries(profiles).entries()){
   const x=(i%4)*350,y=420-Math.floor(i/4)*420;
   mesh.geometry=assets.geometries.get(p);
   camera.position.set(.44,.21,.40);camera.lookAt(0,0,.085);
   r.setViewport(x,y,350,420);r.setScissor(x,y,350,420);r.render(scene,camera);
   const label=document.createElement('div');
   label.style.cssText='position:absolute;left:'+(x+18)+'px;top:'+(840-y-420+18)+'px';
   label.textContent=id.toUpperCase()+' / '+p.form;labels.append(label);
   rows.push({id,calls:r.info.render.calls,triangles:r.info.render.triangles});
  }
  return rows;
 },source);
 assert.equal(report.length,7);
 for(const row of report){assert(row.calls>0&&row.calls<=2);assert(row.triangles<=16);}
 assert.deepEqual(errors,[]);
 await page.screenshot({path:path.join(output,'v273-muzzle-profile-sheet.png')});
 fs.writeFileSync(path.join(output,'v273-muzzle-render-report.json'),JSON.stringify(report,null,2));
 console.log('V273 visual sheet rendered: 7 distinct effects at equal camera scale.');
}finally{await browser.close();}
