// V296: read-only baseline; no game runtime, AI, input or audio changes.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import { createHash } from 'node:crypto';
const html=execFileSync('git',['show','a5e2e379001f441e83413103ee1a257f0d50b73a:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const source=html.match(/class SoundEngine \{[\s\S]*?(?=\n\s*const sound = new SoundEngine\(\);)/)?.[0];
if(!source) throw Error('SoundEngine not found');
function baselineStatic(source){
 const assert=(x,msg)=>{if(!x)throw Error(msg)};
 const S=new Function(source+";return SoundEngine")();
 const rows=[['hk416','rifle'],['mp7','smg'],['mrad','sniper'],['minimi','lmg'],['p320','pistol'],['glock18c','pistol'],['carlgustaf','rocket']];
 const p=new S(),profiles=rows.map(([id,cat])=>({id,cat,...p._resolveWeaponProfile(cat,id)}));
 assert(new Set(profiles.map(({id,cat,...r})=>JSON.stringify(r))).size===7,'seven distinct profiles');
 const out=[];let checks=0;
 function makeContext(){
  const nodes=[];const param=(v=0)=>({value:v,events:[],setValueAtTime(v,t){this.events.push([v,t]);},exponentialRampToValueAtTime(v,t){assert(v>0,'positive exp target');this.events.push([v,t]);},linearRampToValueAtTime(v,t){this.events.push([v,t]);},setTargetAtTime(v,t,c){this.events.push([v,t,c]);},cancelScheduledValues(){}});
  const make=(type)=>{const n={type,gain:param(1),frequency:param(350),Q:param(1),playbackRate:param(1),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),connections:[],connect(to){this.connections.push(to);return to},disconnect(){this.connections=[]},start(t=0){this.started=t},stop(t=0){this.stopped=t}};nodes.push(n);return n};
  const ctx={currentTime:0,sampleRate:8000,state:'running',destination:make('destination'),createGain:()=>make('gain'),createBiquadFilter:()=>make('filter'),createDynamicsCompressor:()=>make('compressor'),createConvolver:()=>make('convolver'),createBufferSource:()=>make('source'),createOscillator:()=>make('oscillator'),createBuffer(c,n){const arrays=Array.from({length:c},()=>new Float32Array(n));return {length:n,numberOfChannels:c,getChannelData:i=>arrays[i]}}};
  return {ctx,nodes};
 }
 const fake=makeContext();const T=new Function("window","setTimeout","player",source+";return SoundEngine")({AudioContext:function(){return fake.ctx}},fn=>fn(),{sprinting:false,crouching:false,pos:{x:20,y:0,z:20}});const e=new T();e.init();
 const config={master:e.master.gain.value,dry:e.dryBus.gain.value,wet:e.reverbGain.gain.value,threshold:e.comp.threshold.value,limiter:e.limiter.threshold.value,maxVoices:e.maxVoices};
 assert(config.master===.44&&config.dry===.9&&config.wet===.16&&config.maxVoices===22,'baseline mixer');checks++;
 const finish=(start)=>{const n=fake.nodes.slice(start);const voices=n.filter(x=>typeof x.onended==='function');for(const v of voices)v.onended();assert(e.activeVoices===0,'voice count cleanup');checks++;return voices.length};
 for(const [id,cat] of rows)for(const d of [0,15,41.99,42,47.99,48,65,90]){
   const start=fake.nodes.length;e.playGunshot(cat,d,id);const expected=1+(d<42?1:0)+(d<48?1:0)+(d===0?1:0);assert(e.activeVoices===expected,`${id} ${d} voice count`);checks++;
   out.push({id,d,voices:finish(start),atten:Math.max(.05,Math.pow(1-Math.min(1,d/65),1.35)),lowpass:d===0?18000:Math.max(950,12000*Math.pow(1-Math.min(1,d/65),1.55))});
 }
 for(const [name,args] of [['playExplosion',[0]],['playHitmarker',[]],['playHitmarker',[true]],['playHitmarker',[false,true]],['playBoltCycle',[]],['playReloadStage',['out']],['playReloadStage',['in']],['playReloadStage',['bolt']],['playKnife',[]],['playRoll',[]],['playHeal',[]],['playDroneBeep',['deploy']],['playDroneBeep',['armed']],['playDroneBeep',['spot']],['playStep',[false,'concrete']],['playStep',[true,'metal']]]){
  const start=fake.nodes.length;e[name](...args);assert(e.activeVoices>0,name);checks++;finish(start);
 }
 e.startDroneHum();assert(e.droneHumNodes!==null,'hum starts');e.updateDroneHum(.5,true);e.stopDroneHum();assert(e.droneHumNodes===null,'hum stops');checks+=2;
 e.setAcousticEnvironment(true);assert(e.isIndoor&&e.reverbNode.buffer===e.indoorIR,'indoor IR');e.setAcousticEnvironment(false);assert(!e.isIndoor&&e.reverbNode.buffer===e.outdoorIR,'outdoor IR');checks+=2;
 const start=fake.nodes.length;for(let i=0;i<20;i++)e.playGunshot('rifle',15,'hk416');const remote=e.activeVoices;e.playGunshot('rifle',0,'hk416');const priority=e.activeVoices;assert(remote===24&&priority===28,'existing soft limit');checks++;finish(start);
 return {checks,config,profiles,distances:out,stress:{remote,priority}};
}
const baseline=baselineStatic(source);
console.log(JSON.stringify({sourceSHA256:createHash('sha256').update(source).digest('hex'),...baseline},null,2));
if(!process.argv.includes('--browser')) process.exit(0);
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
const page=await browser.newPage();
const result=await page.evaluate(async ({source,profiles})=>{
 const rows=[];
 const cases=profiles.flatMap(p=>[0,15,30,42,48,65,90].map(d=>({label:p.id+'@'+d,method:'playGunshot',args:[p.cat,d,p.id]})));
 cases.push(...[
 ['explosion','playExplosion',[0]],['hit','playHitmarker',[]],['head','playHitmarker',[true]],['kill','playHitmarker',[false,true]],
 ['bolt','playBoltCycle',[]],['reload-out','playReloadStage',['out']],['reload-in','playReloadStage',['in']],['reload-bolt','playReloadStage',['bolt']],
 ['step-concrete','playStep',[false,'concrete']],['step-metal','playStep',[true,'metal']],['knife','playKnife',[]],['roll','playRoll',[]],['heal','playHeal',[]],['drone','playDroneBeep',['deploy']]
 ].map(([label,method,args])=>({label,method,args})));
 for(const c of cases){
  const sr=44100,ctx=new OfflineAudioContext(2,sr*2,sr);
  let seed=296;const math=Object.create(Math);math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const S=new Function('window','setTimeout','player','Math',source+';return SoundEngine')({AudioContext:function(){return ctx}},fn=>fn(),{sprinting:false,crouching:false,pos:{x:20,y:0,z:20}},math);
  const e=new S();e.init();e[c.method](...c.args);
  const pcm=await ctx.startRendering();let peak=0,sum=0,count=0;
  for(let ch=0;ch<pcm.numberOfChannels;ch++)for(const v of pcm.getChannelData(ch)){if(!Number.isFinite(v))throw Error('non-finite PCM '+c.label);peak=Math.max(peak,Math.abs(v));sum+=v*v;count++}
  if(peak===0)throw Error('silent PCM '+c.label);
  rows.push({label:c.label,peakDbFS:20*Math.log10(peak),rmsDbFS:20*Math.log10(Math.sqrt(sum/count)),clip:peak>=1});
 }
 return rows;
},{source,profiles:baseline.profiles});
console.log('V296 offline Chromium PCM results',JSON.stringify(result,null,2));
}finally{await browser.close()}
