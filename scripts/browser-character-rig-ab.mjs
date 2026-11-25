import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const out='test-artifacts/front-operation-browser';
fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync('index.html','utf8'),a=html.indexOf('      let SOLDIER_SHARED = null;'),b=html.indexOf('      // =========================================================================\n      // 8. COLLISION',a);
if(a<0||b<a)throw Error('Missing model factory');
const factory=html.slice(a,b)+'\nreturn createEnhancedBotSoldierMesh;';
const rig=fs.readFileSync('modules/experimental/v188-skin-rig.mjs','utf8').replace("from 'three'","from '/three.module.js'");
const routes={'/three.module.js':['text/javascript',fs.readFileSync('node_modules/three/build/three.module.js')],'/rig.mjs':['text/javascript',rig]};
const server=createServer((req,res)=>{
 const [type,data]=routes[req.url]||['text/html','<!doctype html><html><body style="margin:0"></body></html>'];
 res.writeHead(200,{'content-type':type});res.end(data);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:'+server.address().port);
 const report=await page.evaluate(async factory=>{
  const THREE=await import('/three.module.js'),{createExperimentalRig}=await import('/rig.mjs');
  const enhanced=new Function('THREE',factory)(THREE);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x727b84);
  scene.add(new THREE.HemisphereLight(0xe1edff,0x3e454b,1.4));
  const light=new THREE.DirectionalLight(0xfff4df,1.5);light.position.set(-3,5,4);scene.add(light);
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1280,720);document.body.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(42,1280/720,.1,150),gl=renderer.getContext();
  const roles=['assault','medic','engineer','sniper','heavy'],models=[];
  for(let i=0;i<15;i++){
   const model=enhanced(i%2?'red':'blue',roles[i%5],i%3);
   model.root.position.set((i%5-2)*.9,0,-Math.floor(i/5)*1.25);
   scene.add(model.root);
   const rig=createExperimentalRig(model,{radial:12,steps:16});models.push({model,rig});
  }
  const median=v=>v.slice().sort((a,b)=>a-b)[Math.floor(v.length/2)];
  const rendererInfo=()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});
  const setPose=(i,enabled)=>{
   for(let j=0;j<models.length;j++){
    const {model:m,rig:r}=models[j],phase=i*.19+j*.4;
    m.leftHip.rotation.x=Math.sin(phase)*.35;m.rightHip.rotation.x=-m.leftHip.rotation.x;
    m.leftKnee.rotation.x=.15+Math.max(0,Math.cos(phase))*.5;
    m.rightKnee.rotation.x=.15+Math.max(0,-Math.cos(phase))*.5;
    m.upperBody.rotation.y=Math.sin(phase*.3)*.24;
    m.weaponPivot.rotation.x=Math.sin(phase*.5)*.25;m.updateVisualGrip(m.weaponPivot.rotation.x);
    if(enabled)r.update();
   }
  };
  const render=(i,on)=>{setPose(i,on);renderer.render(scene,camera);gl.finish();};
  const run=(enabled,distance)=>{
   for(const {model,rig} of models){model.setVisualDetailDistance(distance);rig.setEnabled(enabled);}
   for(let i=0;i<6;i++)render(i,enabled);
   const times=[];
   for(let i=0;i<20;i++){const t=performance.now();render(i,enabled);times.push(performance.now()-t);}
   return {times,...rendererInfo()};
  };
  const bands=[];
  for(const [name,distance,z] of [['near',12,9],['mid',32,28],['far',60,55]]){
   camera.position.set(0,2.4,z);camera.lookAt(0,1,-1);
   const baseline1=run(false,distance),candidate1=run(true,distance),candidate2=run(true,distance),baseline2=run(false,distance);
   const baselineMs=median([...baseline1.times,...baseline2.times]),candidateMs=median([...candidate1.times,...candidate2.times]);
   bands.push({name,distance,baselineMs,candidateMs,ratio:candidateMs/Math.max(.001,baselineMs),baselineCalls:baseline1.calls,candidateCalls:candidate1.calls,baselineTriangles:baseline1.triangles,candidateTriangles:candidate1.triangles});
  }
  camera.position.set(0,2.4,9);camera.lookAt(0,1,-1);
  window.previewRig=(on)=>{for(const {model,rig} of models){model.setVisualDetailDistance(12);rig.setEnabled(on);}render(8,on);return renderer.domElement.toDataURL('image/png');};
  return {renderer:gl.getParameter(gl.RENDERER),webgl:renderer.capabilities.isWebGL2?'WebGL2':'WebGL1',botCount:15,boneCount:models[0].rig.bones.length,bands,softwareGate:bands.every(x=>x.ratio<=1.10),hardwareGate:'NOT_MEASURED',activeRig:'legacy'};
 },factory);
 // Persist measurements before optional screenshots, even if image capture fails.
 fs.writeFileSync(path.join(out,'v216-rig-ab.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 if(errors.length)throw Error(errors.join(' | '));
 if(report.bands.some(x=>!Number.isFinite(x.ratio)||x.candidateCalls<=0||x.baselineCalls<=0))throw Error('Invalid render measurement');
 for(const enabled of [false,true]){
  const data=await page.evaluate(on=>window.previewRig(on),enabled);
  if(!data.startsWith('data:image/png;base64,')||data.length<2000)throw Error('Invalid canvas capture');
  fs.writeFileSync(path.join(out,'v216-15bots-'+(enabled?'experimental':'current')+'.png'),Buffer.from(data.split(',')[1],'base64'));
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
