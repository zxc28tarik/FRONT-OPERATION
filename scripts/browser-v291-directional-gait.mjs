import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const out=path.resolve('test-artifacts/front-operation-browser');fs.mkdirSync(out,{recursive:true});
const current=fs.readFileSync('index.html','utf8'),old=fs.readFileSync(process.env.FO_V287_BASELINE,'utf8');
const start=old.indexOf('function botVisualGait('),end=old.indexOf('// V58: derive map awareness',start);
assert(start>=0&&end>start);
const anchor='      window.onload = function () {';
assert(current.includes(anchor));
const hook=`
window.__fo291 = {
 sample:(role,phase,forward,side)=>{
  const baseline=(${old.slice(start,end).trim()});
  const model=createEnhancedBotSoldierMesh('blue',role,0);
  const stage=new THREE.Scene();stage.background=new THREE.Color(0x303840);
  stage.add(new THREE.HemisphereLight(0xffffff,0x66717a,1.5));
  const sun=new THREE.DirectionalLight(0xffffff,1.4);sun.position.set(3,5,4);stage.add(sun);
  stage.add(model.root);
  const cam=new THREE.PerspectiveCamera(34,canvas.width/canvas.height,.1,30);
  cam.position.set(2.6,1.45,4.0);cam.lookAt(0,1,0);
  const rootBefore=JSON.stringify([model.root.position.toArray(),model.root.rotation.toArray()]);
  const capture=fn=>{
   const g=fn(phase,2.8,forward,side,0,role);
   model.leftHip.rotation.x=g.leftHip;model.rightHip.rotation.x=g.rightHip;
   model.leftHip.rotation.z=g.leftSide;model.rightHip.rotation.z=g.rightSide;
   model.leftKnee.rotation.x=g.leftKnee;model.rightKnee.rotation.x=g.rightKnee;
   if(model.updateVisualJointFit)model.updateVisualJointFit();
   const t=performance.now();renderer.render(stage,cam);renderer.getContext().finish();
   return {image:canvas.toDataURL('image/png'),ms:performance.now()-t,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  };
  const before=capture(baseline),after=capture(botVisualGait);
  const rootUnchanged=rootBefore===JSON.stringify([model.root.position.toArray(),model.root.rotation.toArray()]);
  stage.remove(model.root);
  return {before,after,rootUnchanged};
 }
};
`;
const server=createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(current.replace(anchor,hook+anchor));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const report=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:960,height:600}});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__fo291&&window.THREE&&document.querySelectorAll('.class-card').length===5);
 for(const role of ['assault','medic','engineer','sniper','heavy'])
  for(const [name,f,s] of [['forward',1,0],['back',-1,0],['left',0,-1],['right',0,1]])
   for(const phase of [Math.PI/4,Math.PI*1.25]){
    const row=await page.evaluate(({role,phase,f,s})=>window.__fo291.sample(role,phase,f,s),{role,phase,f,s});
    assert(row.rootUnchanged&&row.before.calls>0&&row.after.calls>0);
    assert(row.before.triangles===row.after.triangles,'triangle count changed');
    if(name!=='forward')assert.notEqual(row.before.image,row.after.image,'directional pose not visible');
    const id='v291-'+role+'-'+name+'-'+phase.toFixed(2);
    for(const key of ['before','after']){
      fs.writeFileSync(path.join(out,id+'-'+key+'.png'),Buffer.from(row[key].image.split(',')[1],'base64'));
      delete row[key].image;
    }
    report.push({role,name,phase,...row});
   }
 assert.equal(report.length,40);assert.deepEqual(errors,[]);
 console.log('V291: 40 paired character pose WebGL captures; no root displacement; render costs recorded.');
}finally{
 fs.writeFileSync(path.join(out,'v291-directional-webgl.json'),JSON.stringify({report,errors,measurement:'isolated fixed-camera software WebGL render time, not gameplay FPS'},null,2));
 await browser.close();await new Promise(r=>server.close(r));
}
