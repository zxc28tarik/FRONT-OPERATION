import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const BASE='5fd037e83cb0aa77a5ff997b610e1b17c04f0486';
const BLOB='969432fb88c61b824ee6836df40006a64cdd3065';
const mode=process.env.BOT01_MODE||'deathmatch',seed=Number(process.env.BOT01_SEED||471001)>>>0;
const seeds=[471001,471002,471003,831017,831031];
assert(['deathmatch','bomb','rescue'].includes(mode));assert(seeds.includes(seed));
const raw=process.env.BOT01_GAME_FILE?fs.readFileSync(process.env.BOT01_GAME_FILE,'utf8'):execFileSync('git',['show',BASE+':index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const blob=createHash('sha1').update('blob '+Buffer.byteLength(raw)+'\0').update(raw).digest('hex');
if(!process.env.BOT01_GAME_FILE)assert.equal(blob,BLOB);
const out='test-artifacts/bot01/'+mode+'-'+seed;fs.mkdirSync(out,{recursive:true});
const hook=String.raw`
      // QA only; this text is served from the test runner, never shipped.
      const bot01Audit={tick:0,rows:new Map(),contacts:new Map(),winner:null};
      function bot01Row(b){
        let r=bot01Audit.rows.get(b.id);
        if(!r){r={id:b.id,team:b.team,classId:b.classId,aliveSec:0,movingSec:0,idleSec:0,quietNonMissionIdleSec:0,
          transitions:0,transitionPairs:{},rapidReversals:0,rapidReversePairs:{},transitionContexts:{},previousKind:null,lastTransitionAt:null,behaviorSec:{},lookSec:{},gateSec:{},visibleSec:0,laneAmmoSec:0,shots:0,contacts:0,contactsFired:0,
          contactsWithLane:0,contactsWithLaneFired:0,latency:[],laneLatency:[],lastBehavior:null};bot01Audit.rows.set(b.id,r);}
        return r;
      }
      function bot01EndContact(id){
        const c=bot01Audit.contacts.get(id);if(!c)return;
        const r=bot01Audit.rows.get(id);r.contacts++;if(c.laneAt!==null)r.contactsWithLane++;
        if(c.shotAt!==null){r.contactsFired++;r.latency.push(c.shotAt-c.started);
          if(c.laneAt!==null){r.contactsWithLaneFired++;r.laneLatency.push(Math.max(0,c.shotAt-c.laneAt));}}
        bot01Audit.contacts.delete(id);
      }
      function bot01Gate(b,e,dt,now,flags){
        const r=bot01Row(b);let c=bot01Audit.contacts.get(b.id);
        if(c&&(c.target!==e.id||c.tick!==bot01Audit.tick-1)){bot01EndContact(b.id);c=null;}
        if(!c){c={target:e.id,started:now,laneAt:null,shotAt:null,tick:bot01Audit.tick};bot01Audit.contacts.set(b.id,c);}
        c.tick=bot01Audit.tick;
        r.visibleSec+=dt;
        const usable=flags.ammo&&!flags.reload;
        if(flags.lane&&usable){r.laneAmmoSec+=dt;if(c.laneAt===null)c.laneAt=now;}
        const reason=!flags.lane?'lane':!flags.ammo?'ammo':flags.reload?'reload':!flags.reaction?'reaction':!flags.aim?'aim':!flags.cooldown?'cooldown':!flags.stance?'stance':'ready';
        r.gateSec[reason]=(r.gateSec[reason]||0)+dt;
      }
      function bot01Shot(b,now){const r=bot01Row(b),c=bot01Audit.contacts.get(b.id);r.shots++;if(c&&c.shotAt===null)c.shotAt=now;}
      function bot01Sample(dt){
        for(const [id,c] of bot01Audit.contacts)if(c.tick!==bot01Audit.tick)bot01EndContact(id);
        for(const b of bots){
          const r=bot01Row(b);if(!b.alive){r.lastBehavior=null;r.previousKind=null;r.lastTransitionAt=null;continue;}
          r.aliveSec+=dt;
          const kind=b.behaviorPlan?.kind||'NONE',look=b.lookControl?.owner||'NONE';
          r.behaviorSec[kind]=(r.behaviorSec[kind]||0)+dt;r.lookSec[look]=(r.lookSec[look]||0)+dt;
          if(r.lastBehavior!==null&&r.lastBehavior!==kind){
            r.transitions++;const oldKind=r.lastBehavior,key=oldKind+'>'+kind;
            r.transitionPairs[key]=(r.transitionPairs[key]||0)+1;
            const elapsed=bot01Audit.tick*dt;
            if(r.previousKind===kind&&r.lastTransitionAt!==null&&elapsed-r.lastTransitionAt<=1.0){
              r.rapidReversals++;
              const reverseKey=[oldKind,kind].sort().join('<>');
              r.rapidReversePairs[reverseKey]=(r.rapidReversePairs[reverseKey]||0)+1;
            }
            const context=b.visibleEnemy?'visible':
              (b.lastKnownEnemyPos&&Number.isFinite(b.lastDirectContactAt)&&elapsed-b.lastDirectContactAt<.75)?'recentLost':
              b.hearingPos&&b.hearingTimer>0?'sound':kind==='MISSION'?'mission':'other';
            r.transitionContexts[context]=(r.transitionContexts[context]||0)+1;
            r.previousKind=oldKind;r.lastTransitionAt=elapsed;
          }
          r.lastBehavior=kind;
          const moving=Math.hypot(b.moveVelX||0,b.moveVelZ||0)>.75;
          if(moving)r.movingSec+=dt;else {r.idleSec+=dt;
            if(!b.visibleEnemy&&!b.botReload&&!b.activeDroneId&&kind!=='MISSION'&&kind!=='DRONE')r.quietNonMissionIdleSec+=dt;}
        }
      }
      window.__bot01Run=({mode,seed})=>{
        let state=seed>>>0;Math.random=()=>((state=(Math.imul(1664525,state)+1013904223)>>>0)/4294967296);
        canvas.requestPointerLock=()=>{};
        document.getElementById('fo-game-mode').value=mode;matchState.ended=true;
        document.getElementById('btn-deploy').click();
        if(!matchState.started||matchState.ended||matchState.mode!==mode||bots.length!==11)throw Error('native match start failed');
        const initial=bots.map(b=>({id:b.id,classId:b.classId,team:b.team,difficulty:b.difficulty,x:b.pos.x,y:b.pos.y,z:b.pos.z}));
        const initialSeconds=matchState.timeRemaining,dt=.05,cap=initialSeconds+(mode==='bomb'?FO_BOMB_RULES.plantedSeconds:0)+1;
        let elapsed=0,plantedAt=null,site=null,firstPickupAt=null,firstSavedAt=null,checkpoint=null,invalid=0;
        const snapshots=[],round=v=>Math.round(v*1000)/1000;
        const objective=()=>mode==='bomb'?{phase:foBomb.phase,actor:foBomb.actor,progress:foBomb.progress,site:foBomb.site?.id??null,reason:foBomb.reason}:mode==='rescue'?{room:foRescue.roomId,reason:foRescue.reason,captives:foRescue.captives.map(p=>({id:p.id,discovered:p.discovered,carrier:p.carrier,saved:p.saved,progress:p.progress}))}:null;
        const summary=()=>({elapsed:round(elapsed),scoreBlue:matchState.scoreBlue,scoreRed:matchState.scoreRed,ended:matchState.ended,winner:bot01Audit.winner,objective:objective(),stats:getBotMetricsSnapshot(),
          actors:[...bot01Audit.rows.values()].map(r=>({...r,latency:r.latency.slice(),laneLatency:r.laneLatency.slice(),behaviorSec:{...r.behaviorSec},lookSec:{...r.lookSec},gateSec:{...r.gateSec},
            transitionPairs:{...r.transitionPairs},rapidReversePairs:{...r.rapidReversePairs},transitionContexts:{...r.transitionContexts}})),
          activeContacts:[...bot01Audit.contacts.values()].map(c=>({...c}))});
        for(let tick=1;tick<=Math.ceil(cap/dt)&&!matchState.ended;tick++){
          bot01Audit.tick=tick;elapsed=tick*dt;
          if(player.alive)updateV273PlayerFlash(dt);else clearV271PlayerFlash();
          matchState.timeRemaining=Math.max(0,matchState.timeRemaining-dt);
          if(matchState.timeRemaining<=1e-8&&!foSingleLife()){
            const winner=matchState.scoreBlue>matchState.scoreRed?'blue':matchState.scoreRed>matchState.scoreBlue?'red':'draw';
            endMatch(winner);break;
          }
          updatePlayer(dt);droneSystem.update(dt);updateBots(dt);updateEntitiesAndFX(dt);updateFoBomb(dt,dt);updateFoRescue(dt);
          bot01Sample(dt);
          if(mode==='bomb'&&foBomb.phase==='planted'&&plantedAt===null){plantedAt=round(elapsed);site=foBomb.site?.id??null;}
          if(mode==='rescue'){if(firstPickupAt===null&&foRescue.captives.some(p=>p.carrier))firstPickupAt=round(elapsed);if(firstSavedAt===null&&foRescue.captives.some(p=>p.saved))firstSavedAt=round(elapsed);}
          for(const b of bots)if(![b.pos.x,b.pos.y,b.pos.z,b.hp].every(Number.isFinite))invalid++;
          if(tick%20===0){updateHUD();renderRadar();}
          if(tick%200===0)snapshots.push({t:round(elapsed),blue:bots.filter(b=>b.alive&&b.team==='blue').length,red:bots.filter(b=>b.alive&&b.team==='red').length,score:[matchState.scoreBlue,matchState.scoreRed],objective:objective()});
          if(tick===1200)checkpoint=summary();
        }
        if(!checkpoint)checkpoint=summary();
        const censored=bot01Audit.contacts.size;for(const id of [...bot01Audit.contacts.keys()])bot01EndContact(id);
        return {...summary(),initial,initialSeconds,dt,seed,mode,map:foMapName(mode),invalid,plantedAt,site,firstPickupAt,firstSavedAt,censored,checkpoint,snapshots};
      };
`;
const anchors=[
 ['      window.onload = function () {',hook],
 ['            if (isReactionReady && isAimSettled && canShootFromStance && fireLaneClear && aimAligned && bot.fireTimer <= 0 &&','            bot01Gate(bot,bestEnemy,dt,nowSec,{lane:fireLaneClear,ammo:!!activeAmmo&&activeAmmo.mag>0,reload:!!bot.botReload&&bot.botReload.id===botWeaponId&&!bot.botReload.optional,reaction:!!isReactionReady,aim:isAimSettled&&aimAligned,cooldown:bot.fireTimer<=0,stance:canShootFromStance});\n'],
 ['              recordBotContactShot(bot,nowSec);','              bot01Shot(bot,nowSec);\n'],
 ['        matchState.ended = true;\n        gamePaused = false;','        bot01Audit.winner=winnerTeam;\n']
];
let source=raw;
for(const [anchor,insertion] of anchors){assert.equal(source.split(anchor).length,2,'QA anchor '+anchor);source=source.replace(anchor,insertion+anchor);}
source=source.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js');
new Function(source.match(/<script>\s*([\s\S]*?)<\/script>/)[1]);
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html;charset=utf-8'});res.end(source);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const errors=[];let browser,report={status:'FAIL',mode,seed,blob};
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.addInitScript(s=>{let state=s>>>0;Math.random=()=>((state=(Math.imul(1664525,state)+1013904223)>>>0)/4294967296);window.requestAnimationFrame=()=>1;
   Object.defineProperty(window,'AudioContext',{value:undefined,configurable:true});Object.defineProperty(window,'webkitAudioContext',{value:undefined,configurable:true});},seed);
 const origin='http://127.0.0.1:'+server.address().port;
 await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
 await page.goto(origin+'/',{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>typeof window.__bot01Run==='function');
 const started=Date.now();const data=await page.evaluate(({mode,seed})=>window.__bot01Run({mode,seed}),{mode,seed});
 report={status:'FAIL',mode,seed,blob,wallMs:Date.now()-started,method:'native 11 bot roster; passive player; accelerated production simulation order at 0.05 s; audio disabled; RAF frozen; no artificial score resets; QA-only read-only telemetry',...data,pageErrors:errors};
 assert.equal(data.initial.length,11);assert.equal(data.invalid,0);assert.equal(errors.length,0,errors.join(' | '));assert(data.ended&&['blue','red','draw'].includes(data.winner),'match did not end naturally');
 assert(data.elapsed>0&&data.elapsed<=data.initialSeconds+36);assert(data.checkpoint.elapsed<=60.001);
 for(const r of data.actors){assert(r.movingSec<=r.aliveSec+.001&&r.laneAmmoSec<=r.visibleSec+.001);assert(r.contactsFired<=r.contacts&&r.contactsWithLaneFired<=r.contactsWithLane);assert(r.latency.every(x=>Number.isFinite(x)&&x>=0));}
 for(const r of Object.values(data.stats.actors)){assert(r.hits<=r.shots&&r.ammoRounds>=r.shots+r.droneShots);}
 report.status='PASS';console.log('BOT01_MATCH '+JSON.stringify({mode,seed,elapsed:data.elapsed,winner:data.winner,score:[data.scoreBlue,data.scoreRed],plantedAt:data.plantedAt,firstPickupAt:data.firstPickupAt,firstSavedAt:data.firstSavedAt,objective:data.objective}));
}catch(e){report.error=String(e);report.pageErrors=errors;console.error(e);process.exitCode=1;}
finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server.close(r));}
