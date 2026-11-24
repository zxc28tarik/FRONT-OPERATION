import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
const seed=Number(process.env.FRONT_OPERATION_SEED||471001)>>>0;
const variant=process.env.FRONT_OPERATION_VARIANT||'candidate';
const input=process.env.FRONT_OPERATION_GAME_FILE||'index.html';
const out=path.resolve('test-artifacts/front-operation-bomb-full',variant+'-'+seed);
fs.mkdirSync(out,{recursive:true});
const raw=fs.readFileSync(input,'utf8'),anchor='      window.onload = function () {';
if(!raw.includes(anchor))throw Error('Missing boot anchor');
const hook=`
window.__foFullRoundQA=(seed)=>{
  const original=Math.random,lock=canvas.requestPointerLock;
  const audio=['playGunshot','playExplosion','playStep'].map(k=>[k,sound[k]]);
  let random=seed>>>0;
  Math.random=()=>{random=(Math.imul(1664525,random)+1013904223)>>>0;return random/4294967296;};
  canvas.requestPointerLock=()=>{};
  let elapsed=0,plantedAt=null,site=null,endedAt=null,invalid=0,missingOrders=0,respawns=0;
  const dead=new Set(), samples=[];
  try{
    document.getElementById('fo-game-mode').value='bomb';
    matchState.ended=true;
    document.getElementById('btn-deploy').click();
    if(matchState.mode!=='bomb'||!matchState.started||matchState.ended)throw Error('Bomb start failed');
    gamePaused=true;
    for(const [k] of audio)sound[k]=()=>{};
    const dt=.05;
    for(let tick=0;tick<3800&&!matchState.ended;tick++){
      elapsed+=dt;
      matchState.timeRemaining=Math.max(0,matchState.timeRemaining-dt);
      updatePlayer(dt);droneSystem.update(dt);updateBots(dt);updateEntitiesAndFX(dt);updateFoBomb(dt);
      for(const b of bots){
        if(!Number.isFinite(b.pos.x)||!Number.isFinite(b.pos.y)||!Number.isFinite(b.pos.z))invalid++;
        if(!b.alive)dead.add(b.id);else if(dead.has(b.id))respawns++;
        if(b.alive&&!foBotPlan.orders.has(b.id))missingOrders++;
      }
      if(foBomb.phase==='planted'&&plantedAt===null){plantedAt=elapsed;site=foBomb.site?.id;}
      if(tick%100===0)samples.push({t:Math.round(elapsed*10)/10,phase:foBomb.phase,
        blue:bots.filter(b=>b.team==='blue'&&b.alive).length,
        red:bots.filter(b=>b.team==='red'&&b.alive).length,
        player:player.alive,actor:foBomb.actor,progress:foBomb.progress});
    }
    if(matchState.ended)endedAt=elapsed;
    const stats=getBotMetricsSnapshot(), actors=Object.values(stats.actors);
    return {elapsed,endedAt,phase:foBomb.phase,reason:foBomb.reason,plantedAt,site,
      result:document.getElementById('match-result-text').textContent,
      invalid,respawns,missingOrders,samples,nav:NAV_VALIDATION.reachableNodes,
      lives:bots.map(b=>({id:b.id,alive:b.alive})),
      shots:actors.reduce((n,b)=>n+b.shots,0),hits:actors.reduce((n,b)=>n+b.hits,0),
      stuck:actors.reduce((n,b)=>n+b.stuckRecoveries,0),
      actorSeconds:actors.reduce((n,b)=>n+b.aliveSeconds,0),
      spread:stats.spread,stats};
  }finally{Math.random=original;canvas.requestPointerLock=lock;for(const [k,v] of audio)sound[k]=v;}
};
`;
const server=createServer((q,r)=>{r.writeHead(200,{'content-type':'text/html; charset=utf-8'});r.end(raw.replace(anchor,hook+anchor));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser,report={status:'FAIL',seed,variant};const errors=[];
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__foFullRoundQA&&document.getElementById('btn-deploy'),null,{timeout:60000});
 const data=await page.evaluate(seed=>window.__foFullRoundQA(seed),seed);
 report={...report,...data,pageErrors:errors};
 if(!data.endedAt||data.phase!=='ended'||!data.reason||data.nav!==251||data.invalid||data.respawns||data.missingOrders>11||data.hits>data.shots||errors.length)
   throw Error('Full-round invariant failure: '+JSON.stringify({end:data.endedAt,phase:data.phase,reason:data.reason,nav:data.nav,invalid:data.invalid,respawns:data.respawns,missingOrders:data.missingOrders,errors}));
 report.status='PASS';
 console.log('V63 BOMB FULL ROUND '+JSON.stringify({seed,variant,elapsed:data.elapsed,reason:data.reason,plantedAt:data.plantedAt,shots:data.shots,hits:data.hits,stuck:data.stuck,actorSeconds:data.actorSeconds}));
}catch(e){report.error=String(e);console.error(report.error);process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server.close(r));}
