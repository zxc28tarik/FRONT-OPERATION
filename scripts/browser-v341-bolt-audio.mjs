import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const before=execFileSync('git',['show','5fdac63b2de9b0ceb4f369ab2e6f4c78f22422b2:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const after=fs.readFileSync('index.html','utf8').replace(/^ *\/\/ FO_BOT02_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_BOT02_END \1\n/gm,'').replace('let directCombat=botMustContinueContact(','const directCombat=botMustContinueContact(').replace(/^ *\/\/ FO_V344_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V344_END \1\n/gm,'').replace(/^ *\/\/ FO_V343_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V343_END \1\n/gm,'').replace(/^ *\/\/ FO_V342_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V342_END \1\n/gm,'');
const tag=/^ *\/\/ FO_V341_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V341_END \1\n/gm;
assert.equal([...after.matchAll(tag)].length,1);
assert.equal(after.replace(tag,''),before);
const src=s=>s.match(/class SoundEngine \{[\s\S]*?(?=\n\s*const sound = new SoundEngine\(\);)/)[0];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
const page=await browser.newPage();
const rows=await page.evaluate(async sources=>{
 const render=async(src,events,seed,indoor)=>{
 const sr=44100,ctx=new OfflineAudioContext(2,sr*1.5,sr);let draws=0,t=0,osc=0,buf=0,starts=[],stops=[];
 const math=Object.create(Math);math.random=()=>{draws++;return ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)};
 const proxy=new Proxy(ctx,{get(target,key){if(key==='currentTime')return t;if(key==='createOscillator'||key==='createBufferSource')return ()=>{const n=target[key]();key==='createOscillator'?osc++:buf++;const start=n.start.bind(n),stop=n.stop.bind(n);n.start=(...args)=>{starts.push(args[0]);start(...args)};n.stop=(...args)=>{stops.push(args[0]);stop(...args)};return n};const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
 const S=new Function('window','setTimeout','player','Math',src+';return SoundEngine')({AudioContext:function(){return proxy}},fn=>fn(),{},math);const e=new S();e.init();const prior=draws;if(indoor)e.setAcousticEnvironment(true);for(const [time,method,args] of events){t=time;e[method](...args)}const voices=e.activeVoices,rng=draws-prior;const pcm=await ctx.startRendering();let peak=0,energy=0,clip=0,hash=2166136261,earlyEnergy=0;const data=pcm.getChannelData(0);for(let i=0;i<data.length;i++){const v=data[i];if(!Number.isFinite(v))throw Error('nonfinite');peak=Math.max(peak,Math.abs(v));energy+=v*v;clip+=Math.abs(v)>=1;hash=Math.imul(hash^Math.round(v*1e8),16777619);if(i<sr*.25)earlyEnergy+=v*v}return {peak:20*Math.log10(peak),rms:20*Math.log10(Math.sqrt(energy/data.length)),clip,hash,earlyEnergy,osc,buf,starts,stops,voices,rng};};
 const cases=[];for(const [id,cat] of [['mrad','sniper'],['p320','pistol'],['glock18c','pistol'],['minimi','lmg'],['hk416','rifle'],['mp7','smg'],['carlgustaf','rocket']])for(const d of [0,15,90])cases.push({id:id+'@'+d,events:[[0,'playGunshot',[cat,d,id]]],seed:296,indoor:false,changed:false});for(const indoor of [false,true])for(const seed of [296,341,778]){cases.push({id:'bolt-'+seed+'-'+indoor,events:[[.26,'playBoltCycle',[]]],seed,indoor,changed:true});cases.push({id:'combined-'+seed+'-'+indoor,events:[[0,'playGunshot',['sniper',0,'mrad']],[.26,'playBoltCycle',[]]],seed,indoor,changed:true});}
 const rows=[];for(const c of cases){const a=await render(sources[0],c.events,c.seed,c.indoor),b=await render(sources[1],c.events,c.seed,c.indoor);if(b.clip||!Number.isFinite(b.peak)||a.voices!==b.voices||a.rng!==b.rng||JSON.stringify(a.starts)!==JSON.stringify(b.starts)||JSON.stringify(a.stops)!==JSON.stringify(b.stops))throw Error(c.id+' parity '+JSON.stringify([a,b]));if(Math.abs(a.earlyEnergy-b.earlyEnergy)>Math.max(1e-9,a.earlyEnergy*.002))throw Error(c.id+' initial energy');if(c.changed){if(a.hash===b.hash||a.osc-b.osc!==4||b.buf-a.buf!==4)throw Error(c.id+' bolt mismatch');}else if(Math.abs(a.peak-b.peak)>.05||Math.abs(a.rms-b.rms)>.05)throw Error(c.id+' unchanged levels');rows.push({id:c.id,a,b});}return rows;
},[src(before),src(after)]);
assert.equal(rows.length,33);fs.mkdirSync('test-artifacts/front-operation-v341',{recursive:true});fs.writeFileSync('test-artifacts/front-operation-v341/report.json',JSON.stringify(rows,null,2));console.log('V341 33 audio comparisons PASS');
}finally{await browser.close();}
