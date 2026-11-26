import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import * as THREE from 'three';
import {chromium} from 'playwright';
const current=fs.readFileSync('index.html','utf8');
const old=execFileSync('git',['show','5095283f77d665d0d2783b5516f7507d03baaf83:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const tag=/^ *\/\/ FO_V336_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V336_END \1\n/gm;
assert.equal([...current.matchAll(tag)].length,5);
assert.equal(current.replace(tag,''),old,'all non-V336 bytes exact');
const out='test-artifacts/front-operation-v336';fs.mkdirSync(out,{recursive:true});
const split=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
const vm=s=>new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+split(s,'      const WEAPON_MATS = {','      // 7. 3D BOT')+'\\nreturn {build(id){buildViewmodel(id);return {root:currentViewmodelMesh,refs:vmRefs};}};'.replace(/\\n/g,'\n'))(THREE);
const runVm=s=>{const saved=Math.random;let draws=0,seed=336;Math.random=()=>{draws++;return ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)};try{
 const api=vm(s);const rows=[];
 for(const id of ['p320','minimi','glock18c','hk416','mp7','mrad','carlgustaf','p320','minimi']){
  const result=api.build(id);const root=result.root,refs=result.refs;
  root.updateMatrixWorld(true);let meshes=0,triangles=0;const names=[];root.traverse(n=>{if(n.isMesh){meshes++;triangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3*(n.isInstancedMesh?n.count:1);assert(n.geometry.attributes.position.array.every(Number.isFinite));if(n.name.startsWith('V336'))names.push(n.name);}});
  if(id==='minimi'&&s===current){const support=root.getObjectByName('V336_Minimi_sight_support'),tip=root.getObjectByName('V336_Minimi_sight_tip'),guard=root.getObjectByName('V336_Minimi_sight_guard');assert(support&&tip&&guard);const barrel=root.children.find(n=>n.isMesh&&n.geometry.type==='CylinderGeometry'&&n.position.z===-.405);assert(new THREE.Box3().setFromObject(support).intersectsBox(new THREE.Box3().setFromObject(barrel)),'sight to barrel bounds overlap');assert(new THREE.Box3().setFromObject(support).intersectsBox(new THREE.Box3().setFromObject(guard)),'sight support to guard overlap');assert(new THREE.Box3().setFromObject(support).intersectsBox(new THREE.Box3().setFromObject(tip)),'sight support to tip overlap');}
  if(id==='p320'&&s===current){assert(refs.slideMesh.getObjectByName('V336_P320_slide_detail'));assert(refs.slideMesh.getObjectByName('V336_P320_chamber_detail'));assert(root.getObjectByName('V336_P320_guard_bridge'));assert.equal(refs.slideMesh.children[0].material.color.getHex(),0x343e48);}
  rows.push({id,draws,meshes,triangles,names,muzzle:refs.muzzlePoint.position.toArray(),eject:refs.ejectPoint.position.toArray(),root:root.position.toArray()});
 }return rows;
 }finally{Math.random=saved;}};
const a=runVm(old),b=runVm(current);for(let i=0;i<a.length;i++){assert.equal(a[i].draws,b[i].draws,'shared RNG '+a[i].id);for(const key of ['muzzle','eject','root'])assert.deepEqual(a[i][key],b[i][key]);const expected=a[i].id==='p320'?3:a[i].id==='minimi'?1:0;assert.equal(b[i].meshes-a[i].meshes,expected);assert(b[i].triangles-a[i].triangles<=350);}
console.log('V336 actual Three geometry / RNG / anchor parity PASS',JSON.stringify(b));
const sound=s=>s.match(/class SoundEngine \{[\s\S]*?(?=\n\s*const sound = new SoundEngine\(\);)/)[0];
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
try{
const page=await browser.newPage({viewport:{width:960,height:540}});
const pcm=await page.evaluate(async sources=>{
 const render=async(src,id,cat,d)=>{
 const sr=44100,ctx=new OfflineAudioContext(2,sr*1.5,sr);let seed=296,draws=0;const math=Object.create(Math);math.random=()=>{draws++;return ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)};
 const S=new Function('window','setTimeout','player','Math',src+';return SoundEngine')({AudioContext:function(){return ctx}},fn=>fn(),{},math);const e=new S();e.init();const prior=draws;e.playGunshot(cat,d,id);const voices=e.activeVoices,rng=draws-prior;const pcm=await ctx.startRendering();let peak=0,energy=0,clip=0;for(const v of pcm.getChannelData(0)){if(!Number.isFinite(v))throw Error('nonfinite');peak=Math.max(peak,Math.abs(v));energy+=v*v;clip+=Math.abs(v)>=1;}return {peak:20*Math.log10(peak),rms:20*Math.log10(Math.sqrt(energy/pcm.length)),clip,voices,rng};};
 const rows=[];for(const [id,cat] of [['mrad','sniper'],['p320','pistol'],['glock18c','pistol'],['minimi','lmg'],['hk416','rifle'],['mp7','smg'],['carlgustaf','rocket']])for(const d of [0,15,42,48,90]){const a=await render(sources[0],id,cat,d),b=await render(sources[1],id,cat,d);if(b.clip||!Number.isFinite(b.peak)||a.voices!==b.voices||a.rng!==b.rng)throw Error(id+' '+d);if(['mrad','p320','glock18c'].includes(id)?Math.abs(a.rms-b.rms)<.05&&Math.abs(a.peak-b.peak)<.05:Math.abs(a.rms-b.rms)>.10||Math.abs(a.peak-b.peak)>.10)throw Error('audio delta '+id+' '+d);rows.push({id,d,a,b});}return rows;
},[sound(old),sound(current)]);
await page.addScriptTag({content:fs.readFileSync('node_modules/three/build/three.min.js','utf8')});
for(const [label,src] of [['before',old],['after',current]])for(const id of ['p320','minimi']){
 const source=split(src,'      const WEAPON_MATS = {','      // 7. 3D BOT');
 const result=await page.evaluate(({source,id})=>{
 document.body.innerHTML='';document.body.style.margin='0';
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x53616a);
 const camera=new THREE.PerspectiveCamera(62,960/540,.01,10);camera.position.set(0,0,0);
 const root=new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+source+'\nreturn {build(id){buildViewmodel(id);return currentViewmodelMesh;}};')(THREE).build(id);
 scene.add(root);scene.add(new THREE.HemisphereLight(0xe9efff,0x62616a,1.5));const key=new THREE.DirectionalLight(0xffffff,2);key.position.set(1,2,1);scene.add(key);
 const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(960,540);document.body.append(r.domElement);r.render(scene,camera);const hip=r.domElement.toDataURL();root.position.x=0;root.position.y=id==='p320'?-.045:-.088;r.render(scene,camera);const ads=r.domElement.toDataURL();r.dispose();return {hip,ads};
 },{source,id});
 for(const [pose,data] of Object.entries(result))fs.writeFileSync(out+'/'+label+'-'+id+'-'+pose+'.png',Buffer.from(data.split(',')[1],'base64'));
}
fs.writeFileSync(out+'/report.json',JSON.stringify({geometry:{before:a,after:b},pcm},null,2));console.log('V336 35 OfflineAudio cases and 8 WebGL captures PASS');
}finally{await browser.close();}
