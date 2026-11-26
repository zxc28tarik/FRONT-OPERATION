import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import * as THREE from 'three';
import {chromium} from 'playwright';
const old=execFileSync('git',['show','c43dc06b7a90a9d393a327cb7da9f1c609a558a5:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const current=fs.readFileSync('index.html','utf8').replace(/^ *\/\/ FO_V344_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V344_END \1\n/gm,'');
const tag=/^ *\/\/ FO_V343_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V343_END \1\n/gm;
assert.equal([...current.matchAll(tag)].length,7);
assert.equal(current.replace(tag,''),old);
const source=current.match(/\/\/ FO_V343_BEGIN blast-pool\n([\s\S]*?)\n *\/\/ FO_V343_END blast-pool/)[1];
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();
camera.position.set(0,1,3);
const api=new Function('THREE','scene','camera',source+';return {spawn:foV343SpawnBlast,tick:foV343RenderBlasts,clear:foV343ClearBlasts,slots:foV343Blasts,get maps(){return foV343Maps}}')(THREE,scene,camera);
const original=Math.random;let draws=0;Math.random=()=>{draws++;return .5};
try{
for(let i=0;i<20;i++)api.spawn(new THREE.Vector3(i,0,0),'M67 BOMBA');
assert.equal(draws,0);assert.equal(api.slots.length,4);assert.equal(scene.children.length,4);
api.tick(.8);assert(api.slots.every(s=>s.age===0&&s.sprites[0].visible));
for(let i=0;i<7;i++)api.tick(.1);
assert(api.slots.every(s=>!s.sprites[0].visible&&s.sprites[2].visible&&!s.sparks.visible));
api.tick(.5);assert.equal(scene.children.length,0);
const roots=api.slots.map(s=>s.root);
for(let i=0;i<30;i++){api.spawn(new THREE.Vector3(0,0,0),'C4');api.tick(.02);api.clear();assert.equal(scene.children.length,0);}
assert.deepEqual(api.slots.map(s=>s.root),roots);
assert.equal(draws,0);assert.equal(api.maps.length,2);
}finally{Math.random=original;}
console.log('V343 real Three pool reuse, fade, first frame and RNG PASS');
const snd=s=>s.match(/class SoundEngine \{[\s\S]*?(?=\n\s*const sound = new SoundEngine\(\);)/)[0];
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage();
const rows=await page.evaluate(async sources=>{
const render=async(src,d,indoor,method)=>{
 const sr=44100,ctx=new OfflineAudioContext(2,sr*2,sr);let seed=343,draws=0,starts=[],stops=[];
 const math=Object.create(Math);math.random=()=>{draws++;return ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)};
 const proxy=new Proxy(ctx,{get(target,key){if(key==='createOscillator'||key==='createBufferSource')return ()=>{const n=target[key]();const start=n.start.bind(n),stop=n.stop.bind(n);n.start=(...args)=>{starts.push(args[0]);start(...args)};n.stop=(...args)=>{stops.push(args[0]);stop(...args)};return n};const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
 const S=new Function('window','setTimeout','player','Math',src+';return SoundEngine')({AudioContext:function(){return proxy}},fn=>fn(),{},math);const e=new S();e.init();if(indoor)e.setAcousticEnvironment(true);const prior=draws;e[method](d);const voices=e.activeVoices,rng=draws-prior;const pcm=await ctx.startRendering();let peak=0,energy=0,clip=0;const data=pcm.getChannelData(0);for(const v of data){if(!Number.isFinite(v))throw Error('nonfinite');peak=Math.max(peak,Math.abs(v));energy+=v*v;clip+=Math.abs(v)>=1}return {peak:20*Math.log10(peak),rms:20*Math.log10(Math.sqrt(energy/data.length)),clip,voices,rng,starts,stops};};
 const rows=[];for(const d of [0,5,15,35,75,100])for(const indoor of [false,true]){const a=await render(sources[0],d,indoor,'playExplosion'),b=await render(sources[1],d,indoor,'playExplosion'),c=await render(sources[1],d,indoor,'playV343DroneExplosion');for(const v of [b,c])if(v.clip||!Number.isFinite(v.peak)||v.voices!==a.voices||v.rng!==a.rng||JSON.stringify(v.starts)!==JSON.stringify(a.starts)||JSON.stringify(v.stops)!==JSON.stringify(a.stops))throw Error('parity '+JSON.stringify([a,v]));if(Math.abs(a.peak-b.peak)>.1||Math.abs(a.rms-b.rms)>.1)throw Error('generic changed');if(Math.abs(a.rms-c.rms)<.1&&Math.abs(a.peak-c.peak)<.1)throw Error('drone unchanged');rows.push({d,indoor,a,b,c});}return rows;
},[snd(old),snd(current)]);
const out='test-artifacts/front-operation-v343';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/report.json',JSON.stringify(rows,null,2));
await page.addScriptTag({content:fs.readFileSync('node_modules/three/build/three.min.js','utf8')});
for(const t of [0,.10,.40,.80]){
const data=await page.evaluate(({source,t})=>{
 document.body.innerHTML='';const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1,.01,100);scene.background=new THREE.Color(0x28323b);camera.position.set(0,1.2,4);camera.lookAt(0,.5,0);const api=new Function('THREE','scene','camera',source+';return {spawn:foV343SpawnBlast,tick:foV343RenderBlasts}')(THREE,scene,camera);api.spawn(new THREE.Vector3(),'M67 BOMBA');api.tick(0);api.tick(t);const r=new THREE.WebGLRenderer({preserveDrawingBuffer:true,antialias:true});r.setSize(512,512);document.body.append(r.domElement);r.render(scene,camera);const result=r.domElement.toDataURL();r.dispose();return result;
},{source,t});fs.writeFileSync(out+'/blast-'+t+'.png',Buffer.from(data.split(',')[1],'base64'));
}
console.log('V343 24 PCM comparisons and 4 WebGL captures PASS');
}finally{await browser.close();}
