import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
const seed=Number(process.env.FRONT_OPERATION_SEED||471001)>>>0;
const variant=process.env.FRONT_OPERATION_VARIANT||'candidate';
const input=process.env.FRONT_OPERATION_GAME_FILE||'index.html';
const diagnostic=process.env.FRONT_OPERATION_DIAGNOSTIC==='1';
const out=path.resolve('test-artifacts/front-operation-bomb-full',variant+'-'+seed);
fs.mkdirSync(out,{recursive:true});
const raw=fs.readFileSync(input,'utf8'),anchor='      window.onload = function () {';
if(!raw.includes(anchor))throw Error('Missing boot anchor');
const hook=`
window.__foFullRoundQA=({seed,diagnostic})=>{
  const original=Math.random,lock=canvas.requestPointerLock;
  const audio=['playGunshot','playExplosion','playStep'].map(k=>[k,sound[k]]);
  let random=seed>>>0;
  Math.random=()=>{random=(Math.imul(1664525,random)+1013904223)>>>0;return random/4294967296;};
  canvas.requestPointerLock=()=>{};
  let elapsed=0,plantedAt=null,site=null,endedAt=null,invalid=0,missingOrders=0,respawns=0;
  const dead=new Set(), samples=[], diagnostics=[];
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
      // Read-only diagnostic snapshot. No decision helper calls: do not
      // perturb random state, inventory, target selection or simulation clock.
      if(diagnostic&&tick%20===0)diagnostics.push({
        t:Math.round(elapsed*100)/100,phase:foBomb.phase,timeRemaining:matchState.timeRemaining,
        actor:foBomb.actor,progress:foBomb.progress,
        bots:bots.filter(b=>b.alive).map(b=>{
          const order=foBotPlan.orders.get(b.id),contact=b.visibleEnemy;
          const slots=CLASSES[b.classId]?.slots||{},stats=BOT_METRICS.actors[b.id]||{};
          const inventory=[slots[1],slots[2]].filter(Boolean).map(id=>{
            const s=b.ammoState?.[id],w=WEAPONS[id];
            return {id,mag:s?.mag??w.magSize,reserve:s?.reserve??w.reserveMax};
          });
          return {id:b.id,team:b.team,classId:b.classId,hp:b.hp,
            position:{x:b.pos.x,y:b.pos.y,z:b.pos.z},
            speed:Math.hypot(b.moveVelX||0,b.moveVelZ||0),
            role:order?.role??null,site:order?.site?.id??null,goal:order?.goal??null,
            state:b.state,behavior:b.behaviorPlan?.kind??null,lookOwner:b.behaviorPlan?.lookOwner??null,
            target:contact?.id??null,contact:!!contact,
            aimSettle:b.aimSettleTimer??0,reaction:b.reactionTimer??0,reactionRequired:b.reactionRequired??0,
            fireTimer:b.fireTimer??0,fireLaneBlockTimer:b.fireLaneBlockTimer??0,
            coverPhase:b.coverPhase,lastAmmoWeapon:b.lastAmmoWeapon??null,
            reload:b.botReload?{...b.botReload}:null,inventory,
            shots:stats.shots??0,droneShots:stats.droneShots??0,ammoRounds:stats.ammoRounds??null,
            emptyAttempts:stats.ammoEmptyAttempts??null,objectiveRetryStarts:stats.objectiveRetryStarts??null,objectiveRetryMoves:stats.objectiveRetryMoves??null,
            pathIndex:b.foObjectiveIndex??null,pathLength:b.foObjectivePath?.length??null};
        })
      });
      if(tick%100===0)samples.push({t:Math.round(elapsed*10)/10,phase:foBomb.phase,
        blue:bots.filter(b=>b.team==='blue'&&b.alive).length,
        red:bots.filter(b=>b.team==='red'&&b.alive).length,
        player:player.alive,actor:foBomb.actor,progress:foBomb.progress,
        operators:[...foBotPlan.operators.entries()].map(([site,id])=>{const b=bots.find(v=>v.id===id),o=foBotPlan.orders.get(id),target=FO_BOMB_SITES.find(s=>s.id===site);return {site,id,role:o?.role,alive:b?.alive,hp:b?.hp,x:b?.pos.x,z:b?.pos.z,distance:b&&target?Math.hypot(b.pos.x-target.x,b.pos.z-target.z):null,goal:b?.foObjectiveGoal,pathIndex:b?.foObjectiveIndex,pathLength:b?.foObjectivePath?.length,gatePassed:!!b?.foGatePassed,contact:!!b?.visibleEnemy,state:b?.state,coverPhase:b?.coverPhase};})});
    }
    if(matchState.ended)endedAt=elapsed;
    const stats=getBotMetricsSnapshot(), actors=Object.values(stats.actors);
    return {elapsed,endedAt,phase:foBomb.phase,reason:foBomb.reason,plantedAt,site,
      result:document.getElementById('match-result-text').textContent,
      invalid,respawns,missingOrders,samples,diagnostics,nav:NAV_VALIDATION.reachableNodes,
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
 const data=await page.evaluate(args=>window.__foFullRoundQA(args),{seed,diagnostic});
 report={...report,...data,pageErrors:errors};
 if(!data.endedAt||data.phase!=='ended'||!data.reason||data.nav!==251||data.invalid||data.respawns||data.missingOrders>11||data.hits>data.shots||errors.length)
   throw Error('Full-round invariant failure: '+JSON.stringify({end:data.endedAt,phase:data.phase,reason:data.reason,nav:data.nav,invalid:data.invalid,respawns:data.respawns,missingOrders:data.missingOrders,errors}));
 const stats=data.stats;
  const auditFields=['ammoRounds','ammoSidearmRounds','ammoWeaponSwitches','ammoReloadStarts','ammoReloadCompletes','ammoReloadCancels','ammoEmptyAttempts','ammoReloadSeconds','rolePlantSeconds','roleDefuseSeconds','roleEscortSeconds','roleGuardSeconds','roleHoldSeconds','roleRetakeSeconds','coverSidearmPreferences','coverDutyPreferences'];
  const auditRows=Object.values(stats.actors||{});
  const ammoAudit=auditRows.some(x=>Object.hasOwn(x,'ammoRounds'))?{
    totals:Object.fromEntries(auditFields.map(k=>[k,auditRows.reduce((n,x)=>n+(x[k]||0),0)])),
    byClass:Object.fromEntries(Object.entries(stats.classes||{}).map(([id,x])=>[id,Object.fromEntries(auditFields.map(k=>[k,x[k]||0]))]))
  }:null;
  if(ammoAudit){
    for(const x of auditRows){
      if(auditFields.some(k=>!Number.isFinite(x[k])||x[k]<0)||
         x.ammoRounds<x.shots+x.droneShots||x.ammoSidearmRounds>x.ammoRounds||
         x.ammoReloadCompletes+x.ammoReloadCancels>x.ammoReloadStarts||
         x.ammoReloadSeconds>x.aliveSeconds||
         ['rolePlantSeconds','roleDefuseSeconds','roleEscortSeconds','roleGuardSeconds','roleHoldSeconds','roleRetakeSeconds'].reduce((n,k)=>n+x[k],0)>x.aliveSeconds)
        throw Error('V73 ammunition/role telemetry invariant failed');
    }
  }
 report.ammoAudit=ammoAudit;
 report.objectiveRetry={starts:Object.values(stats.actors).reduce((n,b)=>n+(b.objectiveRetryStarts||0),0),moveTicks:Object.values(stats.actors).reduce((n,b)=>n+(b.objectiveRetryMoves||0),0)};
 if(diagnostic){
   if(!data.diagnostics.length||data.diagnostics.length>191)throw Error('Diagnostic sampling bounds');
   for(const frame of data.diagnostics)for(const b of frame.bots){
     if(b.inventory.some(s=>!Number.isInteger(s.mag)||!Number.isInteger(s.reserve)||s.mag<0||s.reserve<0))
       throw Error('Invalid sampled ammo');
     if(!Number.isFinite(b.speed)||!Number.isFinite(b.aimSettle)||!Number.isFinite(b.fireTimer))
       throw Error('Invalid diagnostic actor state');
   }
   console.log('V74 DIAGNOSTIC '+JSON.stringify({seed,variant,frames:data.diagnostics.length,
     final:data.reason,operators:data.diagnostics.filter((_,i)=>i%10===0).flatMap(f=>f.bots.filter(b=>b.role==='PLANT'||b.role==='DEFUSE').map(b=>({t:f.t,id:b.id,role:b.role,state:b.state,contact:b.contact,speed:b.speed,aimSettle:b.aimSettle,fireTimer:b.fireTimer,fireLaneBlockTimer:b.fireLaneBlockTimer,inventory:b.inventory,reload:b.reload,ammoRounds:b.ammoRounds,emptyAttempts:b.emptyAttempts,shots:b.shots})))}));
 }
  if(stats.stuckBreakdown){
    const expected=Object.values(stats.actors).reduce((n,b)=>n+b.stuckRecoveries,0);
    for(const bucket of Object.values(stats.stuckBreakdown))
      if(Object.values(bucket).reduce((n,v)=>n+v,0)!==expected)throw Error('V77 stuck breakdown count mismatch');
  }
 report.status='PASS';
 console.log('V63 BOMB FULL ROUND '+JSON.stringify({seed,variant,elapsed:data.elapsed,reason:data.reason,plantedAt:data.plantedAt,shots:data.shots,hits:data.hits,stuck:data.stuck,actorSeconds:data.actorSeconds,objectiveRetry:report.objectiveRetry,operators:data.samples.map(s=>({t:s.t,operators:s.operators}))}));
}catch(e){report.error=String(e);console.error(report.error);process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server.close(r));}
