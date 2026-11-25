import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const output='test-artifacts/front-operation-browser';
fs.mkdirSync(output,{recursive:true});
const baseline=process.env.FO_WEAPON_BASELINE;
assert(baseline&&fs.existsSync(baseline),'provide V255 baseline');
const section=s=>{
 const a=s.indexOf('      const WEAPON_MATS = {'),b=s.indexOf('      // =========================================================================\n      // 7. 3D BOT',a);
 assert(a>=0&&b>a);
 return 'const viewmodelGroup=new THREE.Group();\n'+s.slice(a,b)+
 '\nreturn {build(id){buildViewmodel(id);return {root:currentViewmodelMesh,refs:vmRefs};},pose:typeof applyV260MagazinePose==="function"?applyV260MagazinePose:null};';
};
const before=section(fs.readFileSync(baseline,'utf8')),after=section(fs.readFileSync('index.html','utf8'));
const ids=['hk416','mp7','mrad','minimi','p320','glock18c','carlgustaf','knife','drone','m67','medkit','claymore'];
const report={baseline:'V255',candidate:'V270',rows:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(String(e)));
 await page.setContent('<html><body style="margin:0;background:#303943;color:#fff;font:16px Arial"><canvas id="stage"></canvas><div id="label" style="position:absolute;top:20px;left:28px;font-size:24px"></div><div style="position:absolute;bottom:24px;left:28px">V255 — BEFORE</div><div style="position:absolute;bottom:24px;left:52%">V270 — CANDIDATE</div></body></html>');
 await page.addScriptTag({path:path.resolve('node_modules/three/build/three.min.js')});
 await page.evaluate(({before,after})=>{
  const T=window.THREE;
  const api=[new Function('THREE',before)(T),new Function('THREE',after)(T)];
  const renderer=new T.WebGLRenderer({canvas:document.getElementById('stage'),antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);renderer.setSize(1280,720);renderer.setScissorTest(true);
  const scene=()=>{const s=new T.Scene();s.background=new T.Color(0x44505d);
   s.add(new T.HemisphereLight(0xe7f0ff,0x303030,1.5));
   const key=new T.DirectionalLight(0xffeed8,2.1);key.position.set(2,3,4);s.add(key);
   const fill=new T.DirectionalLight(0xc8deff,1);fill.position.set(-3,2,-4);s.add(fill);return s;};
  const scenes=[scene(),scene()],camera=new T.PerspectiveCamera(38,640/720,.005,30);
  let models=[],id='';
  window.foCompare=(weapon,angle,progress=0)=>{
   if(id!==weapon){
    for(let i=0;i<models.length;i++)scenes[i].remove(models[i].root);
    models=api.map(x=>x.build(weapon));id=weapon;
    models.forEach((x,i)=>scenes[i].add(x.root));
   }
   api.forEach((x,i)=>x.pose?.(models[i].refs,progress));
   const box=new T.Box3().setFromObject(models[0].root),sphere=box.getBoundingSphere(new T.Sphere());
   const distance=Math.max(.35,sphere.radius/Math.sin(T.MathUtils.degToRad(15)));
   camera.position.copy(sphere.center).add(new T.Vector3(Math.cos(angle)*distance,.40*distance,Math.sin(angle)*distance));
   camera.lookAt(sphere.center);
   document.getElementById('label').textContent=weapon.toUpperCase()+' • '+(progress?'RELOAD':'SAME CAMERA / LIGHT');
   const metrics=[];
   for(let i=0;i<2;i++){
    renderer.setViewport(i*640,0,640,720);renderer.setScissor(i*640,0,640,720);
    renderer.render(scenes[i],camera);
    metrics.push({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});
   }
   return metrics;
  };
 },{before,after});
 for(const id of ids){
  for(const [angle,name] of [[.7,'side'],[2.1,'rear']]){
   const metrics=await page.evaluate(({id,angle})=>window.foCompare(id,angle),{id,angle});
   assert(metrics.every(m=>m.calls>0&&m.triangles>0),id+' empty render');
   assert(metrics[1].calls<=metrics[0].calls,id+' draw calls increased');
   const file='v270-'+id+'-'+name+'.png';
   await page.screenshot({path:path.join(output,file)});
   report.rows.push({id,angle:name,metrics,file});
  }
  if(['hk416','mp7','mrad','minimi','p320','glock18c'].includes(id)){
   const metrics=await page.evaluate(id=>window.foCompare(id,.7,.5),id);
   const file='v270-'+id+'-reload.png';
   await page.screenshot({path:path.join(output,file)});
   report.rows.push({id,angle:'reload',metrics,file});
  }
 }
 assert.equal(report.rows.length,30);
 assert.deepEqual(report.errors,[]);
 console.log('V269–V270 render comparison: 30 captures; actual isolated render calls and triangles recorded.');
}finally{
 await browser?.close();
 fs.writeFileSync(path.join(output,'v270-weapon-turntable.json'),JSON.stringify(report,null,2));
}
