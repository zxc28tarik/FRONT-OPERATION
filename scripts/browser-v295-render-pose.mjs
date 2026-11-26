import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const out=path.resolve('test-artifacts/front-operation-browser');fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync('index.html','utf8'),anchor='      window.onload = function () {';
assert(html.includes(anchor));
const hook=`
window.__foC295QA={
 sample(team,role,variant){
  const model=createEnhancedBotSoldierMesh(team,role,variant);
  const stage=new THREE.Scene();stage.background=new THREE.Color(0x303840);
  stage.add(new THREE.HemisphereLight(0xffffff,0x66717a,1.5));
  const sun=new THREE.DirectionalLight(0xffffff,1.4);sun.position.set(3,5,4);stage.add(sun);stage.add(model.root);
  const cam=new THREE.PerspectiveCamera(34,canvas.width/canvas.height,.1,100);
  cam.position.set(2.6,1.45,4);cam.lookAt(0,1,0);
  const actor={mesh:model,pos:new THREE.Vector3(),alive:true,dying:false,classId:role,crouchAmt:0,visualCarry:.6,
    visualDirection:{forward:1,side:0},visualFootPlants:{left:.3,right:.7,turn:0},visualTransition:{speed:1.6},visualGaitPhase:Math.PI/3};
  const all=[];model.root.traverse(n=>all.push(n));
  const snap=()=>JSON.stringify(all.map(n=>[n.position.toArray(),n.rotation.toArray(),n.scale.toArray(),n.visible]));
  const anchorPos=()=>JSON.stringify([model.root,model.upperBody,model.head,model.weaponPivot,model.muzzleFlash].map(n=>[n.position.toArray(),n.rotation.toArray(),n.getWorldPosition(new THREE.Vector3()).toArray()]));
  const draw=()=>{const start=performance.now();renderer.render(stage,cam);renderer.getContext().finish();return {image:canvas.toDataURL('image/png'),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,ms:performance.now()-start};};
  const report=[];
  for(const [name,speed,turn,death] of [['walk',1.6,0,0],['run',5.5,0,0],['turn',0,.8,0],['fall',3.5,.2,.5]]){
   actor.alive=death===0;actor.dying=death>0;actor.deathAnimTimer=.65*(1-death);actor.visualTransition.speed=speed;actor.visualFootPlants.turn=turn;
   const g=botVisualGaitV291(actor.visualGaitPhase,speed,1,0,0,role);
   model.leftHip.rotation.x=g.leftHip;model.rightHip.rotation.x=g.rightHip;model.leftKnee.rotation.x=g.leftKnee;model.rightKnee.rotation.x=g.rightKnee;
   model.leftHip.rotation.z=g.leftSide;model.rightHip.rotation.z=g.rightSide;
   model.root.rotation.x=death?botVisualFall(death,1,role,0).pitch:0;
   model.root.rotation.z=death?botVisualFall(death,1,role,0).roll:0;
   model.updateVisualJointFit?.();
   const snapshot=snap(),anchors=anchorPos(),before=draw();let after,stable;
   try{beginFoC295Render([actor],cam);stable=anchorPos()===anchors;after=draw();}
   finally{restoreFoC295Render();}
   const restored=snap()===snapshot;
   report.push({name,before,after,stable,restored});
  }
  model.setVisualDetailDistance(60);
  const far=snap();beginFoC295Render([actor],cam);const farUnchanged=far===snap();restoreFoC295Render();
  stage.remove(model.root);
  return {report,farUnchanged};
 }
};
`;
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
 res.end(html.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js').replace(anchor,hook+anchor));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const report=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:800,height:500},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__foC295QA&&window.THREE&&document.querySelectorAll('.class-card').length===5);
 for(const team of ['blue','red'])for(const role of ['assault','medic','engineer','sniper','heavy'])for(let variant=0;variant<3;variant++){
  const x=await page.evaluate(({team,role,variant})=>window.__foC295QA.sample(team,role,variant),{team,role,variant});
  assert(x.farUnchanged,role+' far LOD changed');
  for(const row of x.report){
   assert(row.stable&&row.restored,role+' protected pose changed');
   assert(row.before.calls>0&&row.after.calls===row.before.calls&&row.after.triangles===row.before.triangles,'render geometry budget changed');
   assert.notEqual(row.before.image,row.after.image,role+' '+row.name+' pose not visible');
   if(variant===0)for(const key of ['before','after'])fs.writeFileSync(path.join(out,'c295-'+team+'-'+role+'-'+row.name+'-'+key+'.png'),Buffer.from(row[key].image.split(',')[1],'base64'));
   delete row.before.image;delete row.after.image;
   report.push({team,role,variant,...row});
  }
 }
 assert.equal(report.length,120);assert.deepEqual(errors,[]);
 console.log('C295 WebGL PASS: 120 paired poses, 30 class/team/face variants, equal draw calls/triangles, restored protected transforms.');
}finally{
 fs.writeFileSync(path.join(out,'c295-render-pose-report.json'),JSON.stringify({report,errors,measurement:'isolated paired software WebGL render costs; not match FPS'},null,2));
 await browser.close();await new Promise(r=>server.close(r));
}
