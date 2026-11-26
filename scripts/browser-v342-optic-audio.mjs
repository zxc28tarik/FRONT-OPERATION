import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import * as THREE from 'three';
import {chromium} from 'playwright';
const before=execFileSync('git',['show','31b60b22b4f35cff0ad93e41721f2c0d0f559306:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const after=fs.readFileSync('index.html','utf8');
const tag=/^ *\/\/ FO_V342_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V342_END \1\n/gm;
assert.equal([...after.matchAll(tag)].length,3);
assert.equal(after.replace(tag,''),before);
function build(s){const a=s.indexOf('      const WEAPON_MATS = {'),b=s.indexOf('      // 7. 3D BOT',a);
return new Function('THREE','const viewmodelGroup=new THREE.Group();\n'+s.slice(a,b)+'\nreturn {build(id){buildViewmodel(id);return {root:currentViewmodelMesh,refs:vmRefs};}};')(THREE).build('mp7');}
function inspect(s){
 const saved=Math.random;let draws=0,seed=342;Math.random=()=>{draws++;return (seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;};
 try{const {root,refs}=build(s);const optic=root.children.find(n=>n.isGroup&&n.position.y===.066&&n.position.z===-.015);
 assert(optic);const housing=optic.children[1],g=housing.geometry,p=g.attributes.position;let minR=Infinity,maxR=0;
 for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getZ(i));minR=Math.min(minR,r);maxR=Math.max(maxR,r);}
 assert(g.attributes.normal.array.every(Number.isFinite));
 const nodes=[];root.traverse(n=>nodes.push({type:n.type,p:n.position.toArray(),r:n.rotation.toArray(),s:n.scale.toArray(),count:n.count}));
 const points=g.parameters.points?.map(v=>v.toArray());
 return {minR,maxR,type:g.type,points,triangles:(g.index?.count??p.count)/3,draws,nodes,muzzle:refs.muzzlePoint.position.toArray(),eject:refs.ejectPoint.position.toArray()};
 }finally{Math.random=saved;}}
const a=inspect(before),b=inspect(after);
assert.equal(a.type,'CylinderGeometry');assert.equal(b.type,'LatheGeometry');assert(b.minR>=.0124&&b.minR<.013);assert(b.maxR>=.0159&&b.maxR<=.0161);
assert.deepEqual(b.points[0],b.points.at(-1));assert(b.triangles<=600);
assert.equal(a.draws,b.draws);assert.deepEqual(a.nodes,b.nodes);assert.deepEqual(a.muzzle,b.muzzle);assert.deepEqual(a.eject,b.eject);
console.log('V342 actual Three closed optic cross-section and pose/RNG parity PASS');
const src=s=>s.match(/class SoundEngine \{[\s\S]*?(?=\n\s*const sound = new SoundEngine\(\);)/)[0];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
const page=await browser.newPage();
const rows=await page.evaluate(async sources=>{
 const render=async(src,id,cat,d)=>{
 const sr=44100,ctx=new OfflineAudioContext(2,sr*1.5,sr);let seed=296,draws=0;const math=Object.create(Math);math.random=()=>{draws++;return ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)};
 const S=new Function('window','setTimeout','player','Math',src+';return SoundEngine')({AudioContext:function(){return ctx}},fn=>fn(),{},math);const e=new S();e.init();const prior=draws;e.playGunshot(cat,d,id);const voices=e.activeVoices,rng=draws-prior;const pcm=await ctx.startRendering();let peak=0,energy=0,clip=0;for(const v of pcm.getChannelData(0)){if(!Number.isFinite(v))throw Error('nonfinite');peak=Math.max(peak,Math.abs(v));energy+=v*v;clip+=Math.abs(v)>=1;}return {peak:20*Math.log10(peak),rms:20*Math.log10(Math.sqrt(energy/pcm.length)),clip,voices,rng};};
 const rows=[];for(const [id,cat] of [['mrad','sniper'],['p320','pistol'],['glock18c','pistol'],['minimi','lmg'],['hk416','rifle'],['mp7','smg'],['carlgustaf','rocket']])for(const d of [0,15,42,48,90]){const a=await render(sources[0],id,cat,d),b=await render(sources[1],id,cat,d);if(b.clip||!Number.isFinite(b.peak)||a.voices!==b.voices||a.rng!==b.rng)throw Error(id+' '+d);if(['mp7','carlgustaf'].includes(id)?Math.abs(a.rms-b.rms)<.05&&Math.abs(a.peak-b.peak)<.05:Math.abs(a.rms-b.rms)>.10||Math.abs(a.peak-b.peak)>.10)throw Error('audio delta '+id+' '+d);rows.push({id,d,a,b});}return rows;
},[src(before),src(after)]);
fs.mkdirSync('test-artifacts/front-operation-v342',{recursive:true});fs.writeFileSync('test-artifacts/front-operation-v342/report.json',JSON.stringify({geometry:{before:a,after:b},rows},null,2));console.log('V342 35 OfflineAudio comparisons PASS');
}finally{await browser.close();}
