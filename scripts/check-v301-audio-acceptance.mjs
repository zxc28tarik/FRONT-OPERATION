import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const oldHtml=execFileSync('git',['show','a5e2e379001f441e83413103ee1a257f0d50b73a:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const newHtml=execFileSync('git',['show','54aad7f97a5a2a837f111b6a8584784d82dd4527:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const currentHtml=fs.readFileSync('index.html','utf8').replace(/^ *\/\/ FO_V336_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V336_END \1\n/gm,'');
const soundRe=/class SoundEngine \{[\s\S]*?(?=\n\s*const sound = new SoundEngine\(\);)/;
if(currentHtml.match(soundRe)?.[0]!==newHtml.match(soundRe)?.[0])throw Error('V301 audio source changed after acceptance');
function testAudio(oldHtml,newHtml){
 const re=/class SoundEngine \{[\s\S]*?(?=\n\s*const sound = new SoundEngine\(\);)/,oldSrc=oldHtml.match(re)[0],newSrc=newHtml.match(re)[0];let checks=0;
 const ok=(v,m)=>{if(!v)throw Error(m);checks++};
 ok(oldHtml.replace(re,'<SOUND>')===newHtml.replace(re,'<SOUND>'),'non-audio byte parity');
 const rows=[['hk416','rifle'],['mp7','smg'],['mrad','sniper'],['minimi','lmg'],['p320','pistol'],['glock18c','pistol'],['carlgustaf','rocket']];
 function engine(src){
  let draws=0,seed=19;const math=Object.create(Math);math.random=()=>{draws++;return ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)};
  const nodes=[],param=(v=0)=>({value:v,events:[],setValueAtTime(v,t){ok(Number.isFinite(v)&&Number.isFinite(t),'finite param');this.events.push([v,t])},exponentialRampToValueAtTime(v,t){ok(v>0&&Number.isFinite(v)&&Number.isFinite(t),'valid exponential');this.events.push([v,t])},linearRampToValueAtTime(v,t){this.events.push([v,t])},setTargetAtTime(v,t,c){this.events.push([v,t,c])},cancelScheduledValues(){}});
  const make=(type)=>{const n={kind:type,gain:param(1),frequency:param(350),Q:param(1),playbackRate:param(1),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),connections:[],connect(to){this.connections.push(to);return to},disconnect(){this.connections=[]},start(t=0){this.started=t},stop(t=0){this.stopped=t}};nodes.push(n);return n};
  const ctx={currentTime:0,sampleRate:8000,state:'running',destination:make('destination'),createGain:()=>make('gain'),createBiquadFilter:()=>make('filter'),createDynamicsCompressor:()=>make('compressor'),createConvolver:()=>make('convolver'),createBufferSource:()=>make('source'),createOscillator:()=>make('oscillator'),createBuffer(c,n){const arrays=Array.from({length:c},()=>new Float32Array(n));return {length:n,numberOfChannels:c,getChannelData:i=>arrays[i]}}};
  const S=new Function('window','setTimeout','player','Math',src+';return SoundEngine')({AudioContext:function(){return ctx}},fn=>fn(),{sprinting:false,crouching:false,pos:{x:20,y:0,z:20}},math);
  const e=new S();e.init();return {e,nodes,ctx,draws:()=>draws};
 }
 const a=engine(oldSrc),b=engine(newSrc);ok(a.draws()===b.draws(),'init RNG parity');
 const finish=(x,start)=>{const voices=x.nodes.slice(start).filter(n=>typeof n.onended==='function');for(const v of voices.sort((a,b)=>a.stopped-b.stopped))v.onended();ok(x.e.activeVoices===0,'legacy cleanup');if('audibleVoices'in x.e){ok(x.e.audibleVoices===0,'audible cleanup');for(const v of voices)ok(v.connections.length===0,'source disconnected')};return voices};
 function compare(name,args){
  const ai=a.nodes.length,bi=b.nodes.length;a.e[name](...args);b.e[name](...args);
  ok(a.draws()===b.draws(),name+' RNG parity');ok(a.e.activeVoices===b.e.activeVoices,name+' admission parity');
  const av=finish(a,ai),bv=finish(b,bi);ok(JSON.stringify(av.map(v=>[v.kind,v.started,v.stopped]))===JSON.stringify(bv.map(v=>[v.kind,v.started,v.stopped])),name+' schedule parity');
 }
 for(const [id,c] of rows){const p=b.e._resolveWeaponProfile(c,id),q=a.e._resolveWeaponProfile(c,id);for(const k of ['bodyDur','subDur','mechDelay'])ok(p[k]===q[k],id+k);ok(p.crackFreq!==q.crackFreq,id+' revised');for(const d of [0,1,15,26,30,33,41.99,42,47.99,48,65,90,150])compare('playGunshot',[c,d,id]);}
 for(const [name,args] of [['playExplosion',[0]],['playExplosion',[90]],['playHitmarker',[]],['playHitmarker',[true]],['playHitmarker',[false,true]],['playBoltCycle',[]],['playReloadStage',['out']],['playReloadStage',['in']],['playReloadStage',['bolt']],['playKnife',[]],['playRoll',[]],['playHeal',[]],['playDroneBeep',['deploy']],['playDroneBeep',['armed',20]],['playDroneBeep',['spot']],['playStep',[false,'concrete']],['playStep',[true,'metal']]])compare(name,args);
 let prev=b.e._audioDistance(0);for(let i=1;i<=18000;i++){const d=b.e._audioDistance(i/100);for(const k of ['attenuation','airCutHz','crack','sub'])ok(d[k]<=prev[k]+1e-12&&d[k]>=0,k+' monotonic');prev=d}
 ok(b.e._audioDistance(42).crack===0,'crack boundary');ok(b.e._audioDistance(48).sub===0,'sub boundary');
 const [ai,bi]=[a.nodes.length,b.nodes.length];for(let i=0;i<20;i++){a.e.playGunshot('rifle',15,'hk416');b.e.playGunshot('rifle',15,'hk416')}
 const remote=b.e.audibleVoices;ok(remote<=24,'remote audible limit');for(let i=0;i<30;i++){a.e.playGunshot('rifle',0,'hk416');b.e.playGunshot('rifle',0,'hk416');ok(b.e.audibleVoices<=32,'priority audible cap');ok(a.e.activeVoices===b.e.activeVoices,'legacy stress admission');ok(a.draws()===b.draws(),'stress RNG parity');}
 const stress={remote,priority:b.e.audibleVoices,legacyScheduled:b.e.activeVoices};finish(a,ai);finish(b,bi);
 for(const indoors of [true,false,true,false]){b.e.setAcousticEnvironment(indoors);ok(b.e.isIndoor===indoors,'environment');ok(b.e.indoorWet.gain.events.at(-1)[0]===(indoors?1:0),'indoor target');ok(b.e.outdoorWet.gain.events.at(-1)[0]===(indoors?0:1),'outdoor target')}
 b.e.startDroneHum();ok(!!b.e.droneHumNodes,'drone starts');b.e.updateDroneHum(.5,true);b.e.stopDroneHum();ok(b.e.droneHumNodes===null,'drone cleans up');
 return {checks,stress,oldSrc,newSrc,rows};
}
const {oldSrc,newSrc,rows,...report}=testAudio(oldHtml,newHtml);
console.log('V301 graph and RNG parity',JSON.stringify(report));
if(!process.argv.includes('--browser'))process.exit(0);
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();
 const output=await page.evaluate(async({oldSrc,newSrc,rows})=>{
 const cases=rows.flatMap(([id,cat])=>[0,15,30,41.9,42,47.9,48,65,90].map(d=>({label:id+'@'+d,events:[[0,'playGunshot',[cat,d,id]]]})));
 cases.push(...[
 ['explosion','playExplosion',[0]],['hit','playHitmarker',[]],['head','playHitmarker',[true]],['kill','playHitmarker',[false,true]],['bolt','playBoltCycle',[]],['reload-out','playReloadStage',['out']],['reload-in','playReloadStage',['in']],['reload-bolt','playReloadStage',['bolt']],['step-concrete','playStep',[false,'concrete']],['step-metal','playStep',[true,'metal']],['knife','playKnife',[]],['roll','playRoll',[]],['heal','playHeal',[]],['drone','playDroneBeep',['deploy']]
 ].map(([label,method,args])=>({label,events:[[0,method,args]]})));
 cases.push({label:'dense-remote-and-local',events:[...Array.from({length:20},()=>[0,'playGunshot',['rifle',15,'hk416']]),...Array.from({length:6},()=>[0,'playGunshot',['lmg',0,'minimi']]),[0,'playExplosion',[0]],[0,'playHitmarker',[false,true]]]});
 cases.push({label:'indoor-shot',events:[[0,'setAcousticEnvironment',[true]],[0,'playGunshot',['rifle',0,'hk416']]]});
 const render=async(source,c)=>{
 const sr=44100,ctx=new OfflineAudioContext(2,sr*2,sr);let seed=296;
 const math=Object.create(Math);math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const S=new Function('window','setTimeout','player','Math',source+';return SoundEngine')({AudioContext:function(){return ctx}},fn=>fn(),{sprinting:false,crouching:false,pos:{x:20,y:0,z:20}},math);
 const e=new S();e.init();for(const [,method,args] of c.events)e[method](...args);
 const pcm=await ctx.startRendering();let peak=0,sum=0,count=0,clip=0;
 for(let ch=0;ch<pcm.numberOfChannels;ch++)for(const v of pcm.getChannelData(ch)){if(!Number.isFinite(v))throw Error('non-finite PCM '+c.label);peak=Math.max(peak,Math.abs(v));sum+=v*v;count++;if(Math.abs(v)>=1)clip++}
 if(peak<=0)throw Error('silent '+c.label);return {peakDbFS:20*Math.log10(peak),rmsDbFS:20*Math.log10(Math.sqrt(sum/count)),clip};
 };
 const out=[];for(const c of cases){const before=await render(oldSrc,c),after=await render(newSrc,c);if(after.clip>0)throw Error('clipped '+c.label+' '+after.clip);out.push({label:c.label,before,after});}
 return out;
 },{oldSrc,newSrc,rows});
 console.log('V301 offline PCM before and after',JSON.stringify(output,null,2));
}finally{await browser.close()}
