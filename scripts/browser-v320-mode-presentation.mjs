import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const out=path.resolve('test-artifacts/front-operation-g320');fs.mkdirSync(out,{recursive:true});
const baseline=execFileSync('git',['show','47e9c947e729ab3f10f6ac025cc3d9cdb5bc3ff1:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const h332Tag=/      \/\/ FO_H332_BEGIN ([^\n]+)\n[\s\S]*?      \/\/ FO_H332_END \1\n/g;
const h332Originals=JSON.parse(fs.readFileSync('scripts/h332-original-blocks.json','utf8'));
const stripH332=h=>h.replace(h332Tag,(_,id)=>{if(!Object.hasOwn(h332Originals,id))throw Error('Unknown H332 block '+id);return h332Originals[id];});
const h328Tag=/      \/\/ FO_H328_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_H328_END [^\n]+\n/g;
const g324Tag=/      \/\/ FO_G324_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_G324_END [^\n]+\n/g;
const html=stripH332(fs.readFileSync('index.html','utf8').replace(/^ *\/\/ FO_V342_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V342_END \1\n/gm,'').replace(/^ *\/\/ FO_V341_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V341_END \1\n/gm,'').replace(/^ *\/\/ FO_V340_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V340_END \1\n/gm,'').replace(/^ *\/\/ FO_V339_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V339_END \1\n/gm,'').replace(/^ *\/\/ FO_V336_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V336_END \1\n/gm,'').replace(/    \/\* FO_I335_BEGIN responsive-ui \*\/\n[\s\S]*?    \/\* FO_I335_END responsive-ui \*\/\n/g,'')).replace(h328Tag,'').replace(g324Tag,'');
const tag=/      \/\/ FO_G320_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_G320_END [^\n]+\n/g;
assert.equal(html.replace(tag,''),baseline,'all non-G source identical');
const source=html.match(/      \/\/ FO_G320_BEGIN helper\n([\s\S]*?)      \/\/ FO_G320_END helper/)[1];
const [dm,bomb]=new Function(source+';return [foG320DeathmatchPresentation,foG320BombPresentation]')();
let checks=0;const ok=(v,m)=>{assert(v,m);checks++};
for(let blue=0;blue<=50;blue++)for(let red=0;red<=50;red++)for(const team of ['blue','red']){
 const a={scoreBlue:blue,scoreRed:red,ended:false},before=JSON.stringify(a),p=dm(a,50,team);
 ok(p.remaining===50-(team==='blue'?blue:red),'remaining');
 ok(JSON.stringify(a)===before,'state');
 ok(p.label.includes(blue===red?'BERABERE':(team==='blue'?blue>red:red>blue)?'ÖNDE':'GERİDE'),'lead');
}
const rules={plantSeconds:3,defuseSeconds:4};
for(const phase of ['unplanted','planted','ended'])for(let sec=0;sec<=35;sec+=.5)for(const actor of [null,'player','red_1'])for(const progress of [0,.1,1.5,3,4,5]){
 const a={phase,actor,progress,seconds:sec,site:{id:'A'},actionSite:'B'},before=JSON.stringify(a),p=bomb(a,rules,6,5);
 ok(JSON.stringify(a)===before,'bomb state');ok(p.planted===(phase==='planted'),'phase');
 ok(p.seconds===(phase==='planted'?Math.ceil(sec):null),'seconds');ok(!p.label.includes('NaN'),'finite');
}
const anchor='      window.onload = function () {';
const hook=`
window.__foG320QA={
 ready:()=>!!FO_MAPS.deathmatch,
 test(){
  const rows=[];
  const state={started:true,ended:false,mode:'deathmatch',scoreBlue:0,scoreRed:0,timeRemaining:600};
  const bomb={phase:'unplanted',site:null,actor:null,progress:0,seconds:0,reason:''};
  const actor={alive:true,team:'blue'},squad=Array.from({length:11},(_,i)=>({team:i<5?'blue':'red',alive:true}));
  const spectator={mode:'follow'};
  const status=document.getElementById('fo-bomb-status'),timer=document.getElementById('match-timer'),hud=document.getElementById('hud');
  const spectatorHud=document.getElementById('fo-spectator-hud'),hint=spectatorHud.lastElementChild;
  const panels=[hud.querySelector('.fo-status-panel'),document.getElementById('slot-bar'),hud.querySelector('.fo-ammo-panel')];
  const old=panels.map(e=>e.style.visibility),oldHint=hint.textContent;
  const record=name=>{
   const snap=JSON.stringify([state,bomb,actor,squad,spectator]);
   foG320SyncModePresentation(state,bomb,FO_BOMB_RULES,MATCH_TARGET_SCORE,actor,squad,spectator,document);
   rows.push({name,unchanged:snap===JSON.stringify([state,bomb,actor,squad,spectator]),label:status.textContent,timer:timer.textContent,timerColor:timer.style.color,hidden:status.classList.contains('hidden'),panels:panels.map(e=>e.style.visibility),hint:hint.textContent,old,oldHint});
  };
  record('tie');state.scoreBlue=46;state.scoreRed=40;record('lead');state.scoreRed=49;record('behind');
  state.mode='bomb';record('bomb-start');bomb.actor='player';bomb.actionSite='B';bomb.progress=1.5;record('plant');
  bomb.phase='planted';bomb.site={id:'B'};bomb.actor=null;bomb.seconds=34.2;record('planted');
  bomb.seconds=9.2;bomb.actor='red_1';bomb.progress=2;record('defuse');
  actor.alive=false;record('follow');spectator.mode='free';record('free');state.ended=true;bomb.phase='ended';record('ended');
  state.ended=false;state.mode='rescue';status.textContent='ESİR 1/2';record('rescue');
  state.mode='deathmatch';actor.alive=true;state.scoreBlue=0;state.scoreRed=0;record('reset');
  return rows;
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
const errors=[],results=[];
try{
 for(const viewport of [{width:1280,height:720},{width:390,height:844}]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://cdn.tailwindcss.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
  await page.waitForFunction(()=>window.__foG320QA?.ready());
  const rows=await page.evaluate(()=>window.__foG320QA.test()),r=n=>rows.find(x=>x.name===n);
  assert(rows.every(x=>x.unchanged),'simulation mutation');
  assert.equal(r('tie').label,'BERABERE');assert.match(r('lead').label,/ÖNDE \+6.*4 KALDI/);
  assert.match(r('behind').label,/GERİDE 3/);assert.match(r('bomb-start').label,/6–6 CANLI/);
  assert.match(r('plant').label,/KURMA B %50/);assert.equal(r('planted').timer,'00:35');
  assert.match(r('defuse').label,/ÇÖZME %50/);assert.equal(r('defuse').timer,'00:10');
  assert.notEqual(r('defuse').timerColor,r('planted').timerColor);
  assert(r('follow').panels.every(x=>x==='hidden'));assert.match(r('follow').hint,/Önceki/);
  assert.match(r('free').hint,/Shift/);assert.deepEqual(r('ended').panels,r('ended').old);
  assert.equal(r('rescue').label,'ESİR 1/2');assert.equal(r('rescue').timerColor,'');
  assert.equal(r('reset').label,'BERABERE');assert.equal(r('reset').hint,r('reset').oldHint);
  results.push({viewport,rows});await page.close();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'g320-report.json'),JSON.stringify({checks,results,errors},null,2));
 console.log('G320 PASS',JSON.stringify({checks,viewportCount:results.length,states:results[0].rows.length,errors},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
