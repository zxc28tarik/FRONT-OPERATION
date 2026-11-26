import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const out=path.resolve('test-artifacts/front-operation-g324');fs.mkdirSync(out,{recursive:true});
const baseline=execFileSync('git',['show','601f0d8b0a2a08a8636ae678233b9d65fae04397:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const h332Tag=/      \/\/ FO_H332_BEGIN ([^\n]+)\n[\s\S]*?      \/\/ FO_H332_END \1\n/g;
const h332Originals=JSON.parse(fs.readFileSync('scripts/h332-original-blocks.json','utf8'));
const stripH332=h=>h.replace(h332Tag,(_,id)=>{if(!Object.hasOwn(h332Originals,id))throw Error('Unknown H332 block '+id);return h332Originals[id];});
const h328Tag=/      \/\/ FO_H328_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_H328_END [^\n]+\n/g;
const html=stripH332(fs.readFileSync('index.html','utf8').replace(/^ *\/\/ FO_V339_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V339_END \1\n/gm,'').replace(/^ *\/\/ FO_V336_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V336_END \1\n/gm,'').replace(/    \/\* FO_I335_BEGIN responsive-ui \*\/\n[\s\S]*?    \/\* FO_I335_END responsive-ui \*\/\n/g,'')).replace(h328Tag,'');
const tag=/      \/\/ FO_G324_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_G324_END [^\n]+\n/g;
assert.equal(html.replace(tag,''),baseline,'non-G324 source exact parity');
const source=html.match(/      \/\/ FO_G324_BEGIN helper\n([\s\S]*?)      \/\/ FO_G324_END helper/)[1];
const [res,clock,result]=new Function(source+';return [foG324RescuePresentation,foG324Clock,foG324ResultPresentation]')();
let checks=0;const ok=(v,m)=>{assert(v,m);checks++};
const cases=[{saved:true},{discovered:false,x:999,z:888,carrier:'hidden'},{discovered:true},{discovered:true,carrier:'blue_2'},{discovered:true,carrier:'player'},{actor:'player',progress:.5,discovered:true}];
for(const a of cases)for(const b of cases)for(const alive of [true,false])for(const ended of [true,false]){
 const s={ended},r={captives:[a,b]},p={alive},before=JSON.stringify([s,r,p]),v=res(s,r,{holdSeconds:1},p);
 ok(JSON.stringify([s,r,p])===before,'state');ok(v.saved===Number(!!a.saved)+Number(!!b.saved),'saved');
 ok(!/999|888|hidden|blue_2/.test(v.label+v.hint),'no hidden data');ok(!alive&&!ended?v.label.includes('TAKIMINI İZLE'):true,'spectator');
}
for(let t=0;t<=600;t+=.25){
 ok(clock(t)===String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t)%60).padStart(2,'0'),'clock');
 ok(clock(t,true)===String(Math.floor(Math.ceil(t)/60)).padStart(2,'0')+':'+String(Math.ceil(t)%60).padStart(2,'0'),'ceil');
}
for(const mode of ['deathmatch','bomb','rescue'])for(const winner of ['blue','red','draw'])for(const scoreBlue of [0,49,50])for(const scoreRed of [0,49,50]){
 const s={mode,scoreBlue,scoreRed},p={kills:3,deaths:2},b={reason:'Bomba patladı'},r={reason:'İki esir kurtarıldı'},before=JSON.stringify([s,p,b,r]),v=result(s,winner,b,r,p,50);
 ok(v.score===scoreBlue+' – '+scoreRed,'team order');ok(JSON.stringify([s,p,b,r])===before,'result read-only');ok(v.summary.includes('3 eleme / 2 ölüm'),'player');
}
const anchor='      window.onload = function () {';
const hook=`
window.__foG324QA={
 ready:()=>!!FO_MAPS.deathmatch,
 test(){
  const rows=[];
  const status=document.getElementById('fo-bomb-status'),timer=document.getElementById('match-timer'),hint=document.getElementById('fo-spectator-hud').lastElementChild;
  const panels=[document.querySelector('#hud .fo-status-panel'),document.getElementById('slot-bar'),document.querySelector('#hud .fo-ammo-panel')];
  const old=panels.map(e=>e.style.visibility),oldHint=hint.textContent;
  const sync=()=>{foG320SyncModePresentation(matchState,foBomb,FO_BOMB_RULES,MATCH_TARGET_SCORE,player,bots,foSpectator,document);foG324SyncModePresentation(matchState,foRescue,FO_RESCUE_RULES,player,foSpectator,document,foBomb);};
  const snapshot=()=>JSON.stringify({matchState,foBomb:{...foBomb,site:foBomb.site?.id||null},foRescue,alive:player.alive,kills:player.kills,deaths:player.deaths,mode:foSpectator.mode,target:foSpectator.targetId});
  const read=name=>({name,label:status.textContent,timer:timer.textContent,hint:hint.textContent,panels:panels.map(e=>e.style.visibility),old,oldHint,
   result:document.getElementById('match-result-text').textContent,summary:document.getElementById('menu-subtitle').textContent,title:document.getElementById('menu-title').textContent,mode:matchState.mode,map:foActiveMap,ended:matchState.ended});
  const record=name=>{const before=snapshot();sync();const row=read(name);row.unchanged=before===snapshot();rows.push(row);};
  const start=(mode,seconds)=>{Object.assign(matchState,{mode,started:true,ended:false,scoreBlue:0,scoreRed:0,timeRemaining:seconds});
   player.alive=true;stopFoSpectator();resetFoBomb();resetFoRescue(()=>.5);selectFoMap(mode);if(mode==='rescue')syncFoRescueMarkers();refreshFoModeUi();record(mode+'-start');};
  start('deathmatch',600);matchState.scoreBlue=49;matchState.scoreRed=40;record('dm-near');registerTeamKill('blue');rows.push(read('dm-win'));
  start('bomb',150);const site=FO_BOMB_SITES[0];
  stepFoBomb(foBomb,FO_BOMB_RULES.plantSeconds,150,6,6,{id:'player',site});
  record('bomb-planted');
  player.alive=false;startFoSpectator();record('bomb-follow');setFoSpectatorMode('free');record('bomb-free');
  const b=stepFoBomb(foBomb,FO_BOMB_RULES.defuseSeconds,140,5,6,{id:'red_1',site});
  if(!b||b.winner!=='red')throw Error('actual defuse transition failed');
  foBomb.phase='ended';foBomb.reason=b.reason;matchState.scoreBlue=3;matchState.scoreRed=5;endMatch(b.winner);rows.push(read('bomb-result'));
  start('rescue',180);
  const p=foRescue.captives[0],q=foRescue.captives[1];
  p.discovered=true;record('rescue-discovered');
  const a={id:'player',alive:true,team:'blue',pos:{x:p.x,y:0,z:p.z}};
  stepFoRescue(foRescue,.5,180,[a],()=>true);record('rescue-pickup');
  stepFoRescue(foRescue,.5,180,[a],()=>true);record('rescue-carry');
  a.pos.x=FO_RESCUE_EXIT.x;a.pos.z=FO_RESCUE_EXIT.z;stepFoRescue(foRescue,.1,180,[a],()=>true);record('rescue-one');
  q.discovered=true;a.pos.x=q.x;a.pos.z=q.z;stepFoRescue(foRescue,1,180,[a],()=>true);
  player.alive=false;startFoSpectator();record('rescue-follow');setFoSpectatorMode('free');record('rescue-free');
  a.pos.x=FO_RESCUE_EXIT.x;a.pos.z=FO_RESCUE_EXIT.z;const r=stepFoRescue(foRescue,.1,180,[a],()=>true);
  if(!r||r.winner!=='blue')throw Error('actual rescue transition failed');
  foRescue.reason=r.reason;matchState.scoreBlue=2;matchState.scoreRed=3;endMatch(r.winner);rows.push(read('rescue-result'));
  start('deathmatch',600);matchState.scoreBlue=7;matchState.scoreRed=7;matchState.timeRemaining=0;endMatch('draw');rows.push(read('dm-draw'));
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
  await page.waitForFunction(()=>window.__foG324QA?.ready());
  const rows=await page.evaluate(()=>window.__foG324QA.test()),r=n=>rows.find(x=>x.name===n);
  assert(rows.filter(x=>x.unchanged!==undefined).every(x=>x.unchanged),'presentation mutation');assert(rows.every(x=>x.map===x.mode),'actual active map');
  assert.equal(r('deathmatch-start').timer,'10:00');assert.match(r('dm-near').label,/1 KALDI/);assert(r('dm-win').ended);
  assert.match(r('dm-win').result,/DERBARAN KAZANDI.*Hedefe ulaşıldı/);
  assert.equal(r('bomb-start').timer,'02:30');assert.equal(r('bomb-planted').timer,'00:35');
  for(const n of ['bomb-follow','bomb-free','rescue-follow','rescue-free'])assert(r(n).panels.every(x=>x==='hidden'),n);
  for(const n of ['bomb-result','rescue-result'])assert.deepEqual(r(n).panels,r(n).old,n);
  assert.match(r('bomb-result').result,/N.I.U. KAZANDI.*etkisizleştirildi/);assert.match(r('bomb-result').summary,/3 – 5/);assert.equal(r('bomb-result').timer,'00:31');
  assert.equal(r('rescue-start').timer,'03:00');assert.match(r('rescue-start').label,/ESİRLERİ BUL/);
  assert.match(r('rescue-pickup').label,/KURTARMA %50/);assert.match(r('rescue-carry').label,/TAHLİYEYE DÖN/);
  assert.match(r('rescue-one').label,/ESİR 1\/2/);assert.match(r('rescue-follow').label,/TAKIMINI İZLE/);assert.match(r('rescue-free').hint,/Shift/);
  assert.match(r('rescue-result').result,/DERBARAN KAZANDI.*İki esir kurtarıldı/);assert.match(r('rescue-result').label,/ESİR 2\/2/);assert.match(r('rescue-result').summary,/2 – 3/);
  assert.match(r('dm-draw').result,/BERABERE/);assert.equal(r('dm-draw').hint,r('dm-draw').oldHint);
  results.push({viewport,rows});await page.close();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'g324-report.json'),JSON.stringify({checks,results,errors},null,2));
 console.log('G324 PASS',JSON.stringify({checks,viewportCount:results.length,states:results[0].rows.length,errors},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
