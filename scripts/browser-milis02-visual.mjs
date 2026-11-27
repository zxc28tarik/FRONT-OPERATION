import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {chromium} from 'playwright';

// Isolated, deterministic fixed-camera visual QA; NOT a gameplay FPS benchmark.
const source=fs.readFileSync('index.html','utf8');
const begin=source.indexOf('      let SOLDIER_SHARED = null;');
const end=source.indexOf('      // 8. COLLISION',begin);
assert(begin>=0&&end>begin,'shared soldier module can be isolated');
const soldierCode=source.slice(begin,end);
assert(soldierCode.includes('FO_MILIS02_BEGIN')&&soldierCode.includes('FO_MILIS02_END'));
const output=path.resolve('test-artifacts/fo-milis02');
fs.mkdirSync(output,{recursive:true});
const server=createServer((req,res)=>{
  if(req.url==='/three.min.js'){
    res.writeHead(200,{'content-type':'text/javascript'});
    res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;
  }
  res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
  res.end('<!doctype html><html><head><meta charset="utf-8"><script src="/three.min.js"></script></head>'+
    '<body style="margin:0;overflow:hidden;background:#3c4850"><canvas id="scene"></canvas></body></html>');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser,report={version:'FO_MILIS02',images:[],scenes:[],errors:[],costs:[],notes:'Fixed camera software WebGL drawcalls and triangles; not gameplay FPS'};
try{
  browser=await chromium.launch({headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
      '--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:760},deviceScaleFactor:1});
  page.on('pageerror',e=>report.errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
  await page.evaluate((code)=>{
    const THREE=window.THREE;
    if(THREE?.REVISION!=='128')throw Error('Three.js r128 required');
    const api=new Function('THREE',code+
      '\nreturn {create:createEnhancedBotSoldierMesh,base:createBotSoldierMesh};')(THREE);
    const canvas=document.getElementById('scene');
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
    renderer.setSize(1280,760);renderer.setPixelRatio(1);
    renderer.shadowMap.enabled=false;
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x58636b);
    const camera=new THREE.PerspectiveCamera(34,1280/760,.1,100);
    scene.add(new THREE.HemisphereLight(0xe2ebf1,0x202a30,1.6));
    const key=new THREE.DirectionalLight(0xffefdc,1.25);key.position.set(-3,6,5);scene.add(key);
    const rim=new THREE.DirectionalLight(0xd9e8ff,.65);rim.position.set(4,2,-6);scene.add(rim);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),
      new THREE.MeshStandardMaterial({color:0x606b66,roughness:1}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-.03;scene.add(ground);
    const actors=new THREE.Group();scene.add(actors);
    const classes=['assault','medic','engineer','sniper','heavy'];
    const clean=()=>{while(actors.children.length)actors.remove(actors.children[0]);};
    const allVisible=root=>{const meshes=[];const walk=(n,visible)=>{
      if(!visible||!n.visible)return;
      if(n.isMesh)meshes.push(n);
      for(const c of n.children)walk(c,true);
    };walk(root,true);return meshes;};
    const validate=(model,team,variant)=>{
      const head=model.head.children.find(n=>n.name==='v106_face');
      if(!head||!head.visible)throw Error('Sculpted facial surface hidden');
      if(model.muzzleFlash.parent!==model.weaponPivot)throw Error('Weapon muzzle anchor changed');
      if(model.head.parent!==model.upperBody)throw Error('Head attachment changed');
      if(team==='blue'){
        if(model.root.userData.foFaction)throw Error('Blue soldier was recolored as militia');
        if(model.root.children.some(n=>n.name?.startsWith('fo_milis02_')))throw Error('Blue militia accessory');
      }else{
        const o=variant===1?1:0;
        if(model.root.userData.foFaction!=='milis'||
           model.root.userData.foMilisOutfit!==o||
           model.root.userData.foMilisHeadwear!==variant)throw Error('Wrong militia outfit/headwear assignment');
        const body=model.upperBody.children.filter(n=>n.name?.startsWith('fo_milis02_'));
        const face=model.head.children.filter(n=>n.name?.startsWith('fo_milis02_'));
        if(body.length!==3||face.length!==(variant===1?2:3))throw Error('Missing packed outfit components');
        if(body.some(n=>n.castShadow)||face.some(n=>n.castShadow))
          throw Error('Accessory added dynamic shadows');
        const jacket=body.find(n=>n.name==='fo_milis02_jacket');
        if(jacket.material.color.getHex()!==(o?0x746b54:0x454c4a))
          throw Error('Wrong jacket material');
        const hiddenHelmet=model.head.children.find(n=>n.name==='v246_integrated_helmet');
        if(hiddenHelmet?.visible)throw Error('Militia military helmet exposed');
        for(const m of [...body,...face]){
          const g=m.geometry,p=g.getAttribute('position'),norm=g.getAttribute('normal');
          if(!p||!norm||p.count<=0||!Array.from(p.array).every(Number.isFinite)||
            !Array.from(norm.array).every(Number.isFinite))throw Error('Invalid packed accessory vertex buffer');
          g.computeBoundingBox();if(!g.boundingBox||g.boundingBox.isEmpty())throw Error('Missing accessory bounds');
        }
        model.setVisualDetailDistance(0);
        const near=allVisible(model.root).length;
        model.setVisualDetailDistance(60);
        const far=allVisible(model.root).length;
        if(!(near>far))throw Error('Militia far LOD does not reduce visible meshes');
        if(model.head.children.find(n=>n.name==='v246_integrated_helmet')?.visible)
          throw Error('LOD restored hidden military helmet');
        model.setVisualDetailDistance(0);
        if(allVisible(model.root).length!==near)throw Error('Militia detail did not recover on near LOD');
      }
      return {meshCount:allVisible(model.root).length,variant};
    };
    const render=()=>{renderer.render(scene,camera);renderer.getContext().finish();
      return {drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
        geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}};
    window.__milis02={
      scene(role,view){
        clean();
        const models=[],vals=[];
        for(let v=0;v<3;v++){
          const m=api.create('red',role,v);
          const stats=validate(m,'red',v);
          m.root.position.set((v-1)*1.45,0,0);
          m.root.rotation.y=view==='back'?Math.PI:view==='quarter'?.65:0;
          if(view==='quarter'){
            m.leftHip.rotation.x=-.3;m.rightHip.rotation.x=.35;
            m.leftKnee.rotation.x=.45;m.rightKnee.rotation.x=.14;
            m.updateVisualJointFit?.();
          }
          actors.add(m.root);models.push(m);vals.push(stats);
        }
        const left=models[0].upperBody.children.find(n=>n.name==='fo_milis02_jacket');
        const right=models[2].upperBody.children.find(n=>n.name==='fo_milis02_jacket');
        if(left.geometry!==right.geometry||left.material!==right.material)
          throw Error('Same outfit does not share buffers/material');
        camera.position.set(0,1.38,5.3);camera.lookAt(0,.90,0);
        return {role,view,models:vals,...render()};
      },
      stress(team,count){
        clean();const models=[];
        for(let i=0;i<count;i++){
          const role=classes[i%classes.length],variant=i%3;
          const m=api.create(team,role,variant);
          validate(m,team,variant);
          m.root.position.set(((i%5)-2)*1.2,0,-Math.floor(i/5)*1.65);
          actors.add(m.root);models.push(m);
        }
        camera.position.set(0,3.0,12);camera.lookAt(0,1,-1);
        return {team,count,visibleMeshes:models.reduce((sum,m)=>sum+allVisible(m.root).length,0),...render()};
      },
      roleMatrix(){
        return classes.flatMap(role=>[0,1,2].map(v=>{
          const red=api.create('red',role,v),blue=api.create('blue',role,v);
          return {role,variant:v,red:validate(red,'red',v),blue:validate(blue,'blue',v)};
        }));
      }
    };
  },soldierCode);
  const matrix=await page.evaluate(()=>window.__milis02.roleMatrix());
  assert.equal(matrix.length,15);
  report.matrix=matrix;
  for(const role of ['assault','medic','engineer','sniper','heavy']){
    for(const view of ['front','quarter','back']){
      const stats=await page.evaluate(({role,view})=>window.__milis02.scene(role,view),{role,view});
      assert(stats.drawCalls>0&&stats.triangles>0,'WebGL visible draw');
      const image='milis02-'+role+'-'+view+'.png';
      await page.screenshot({path:path.join(output,image),animations:'disabled'});
      report.images.push(image);report.scenes.push(stats);
    }
  }
  for(const team of ['blue','red'])for(const count of [5,15]){
    const stats=await page.evaluate(({team,count})=>window.__milis02.stress(team,count),{team,count});
    assert(stats.drawCalls>0&&stats.triangles>0&&stats.visibleMeshes>0);
    report.costs.push(stats);
  }
  assert.deepEqual(report.errors,[]);
  console.log('PASS MILIS02 Three.js actual WebGL: '+matrix.length+
    ' team/role/variant cases, '+report.images.length+' screenshots, 5/15 actor draw calls');
  console.log('MILIS02 ISOLATED RENDER COSTS',JSON.stringify(report.costs));
} catch(e){
  process.exitCode=1;report.errors.push(String(e));
  console.error('FAIL MILIS02 browser acceptance',String(e));
}finally{
  fs.writeFileSync(path.join(output,'milis02-webgl-report.json'),JSON.stringify(report,null,2));
  await browser?.close();await new Promise(resolve=>server.close(resolve));
}
