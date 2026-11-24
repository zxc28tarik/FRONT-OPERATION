import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';

const seed = Number(process.env.FRONT_OPERATION_SEED || 0) >>> 0;
const variant = process.env.FRONT_OPERATION_VARIANT || 'single';
const inputGame = process.env.FRONT_OPERATION_GAME_FILE || 'index.html';
const output = path.resolve('test-artifacts/front-operation-bot-stress',
  variant + '-' + seed);
fs.mkdirSync(output, { recursive: true });
// V48 QA-only instrumentation injected into the local server response.
 // Baseline V47 and candidate V48 both receive EXACTLY the same helper.
 // Starting and simulating within ONE page task eliminates variable
 // live-render frames between click and the accelerated engine.
const raw = fs.readFileSync(inputGame, 'utf8');
const qaAnchor = '        window.__frontOperationAiQaAdvance = (seconds = 600) => {';
if(!raw.includes(qaAnchor)) throw Error('Local stress hook missing');
const qaPrelude = `
        window.__frontOperationAiQaSeededMatch = (value, seconds = 600) => {
          const originalRandom = Math.random;
          const originalLock = canvas.requestPointerLock;
          let state = value >>> 0;
          Math.random = () => {
            state = (Math.imul(1664525, state) + 1013904223) >>> 0;
            return state / 4294967296;
          };
          // No pointer-lock handshake is needed for headless bot logic.
          canvas.requestPointerLock = () => {};
          try {
            // Force normal built-in New Match path to regenerate both teams,
            // life/difficulty sequence, metrics, player and drone resources.
            matchState.ended = true;
            botAiClockSec = 0;
            document.getElementById('btn-deploy').click();
            if(!matchState.started || matchState.ended)
              throw Error('Cannot start deterministic QA match');
            return window.__frontOperationAiQaAdvance(seconds);
          } finally {
            Math.random = originalRandom;
            canvas.requestPointerLock = originalLock;
          }
        };
`;
const source = raw.replace(qaAnchor, qaPrelude + qaAnchor);
const errors = [];
const server = createServer((req,res) => {
  if(req.url==='/' || req.url==='/index.html') {
    res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
    res.end(source);
  } else {res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
let browser;
let result={status:'FAIL'};
try {
  browser=await chromium.launch({
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
      '--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']
  });
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  if(seed) {
    // V47 QA ONLY. The shipped game's Math.random is never modified.
    // Compare the identical world spawn sequence for two cover policies.
    await page.addInitScript(initial => {
      let state = initial >>> 0;
      Math.random = () => {
        state = (Math.imul(1664525,state)+1013904223) >>> 0;
        return state/4294967296;
      };
    },seed);
  }
  page.on('pageerror',error=>errors.push(String(error)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{
    waitUntil:'load',timeout:80000
  });
  await page.waitForFunction(()=>window.__frontOperationAiQaSeededMatch &&
    document.querySelector('#btn-deploy'),null,{timeout:60000});
  const start=Date.now();
  const engine=await page.evaluate(seed =>
    window.__frontOperationAiQaSeededMatch(seed,600),seed);
  const wallTimeMs=Date.now()-start;
  const stats=engine?.report;
  const nav=await page.evaluate(()=>window.__frontOperationAiQaSnapshot()?.navValidation);
  if(!stats||engine.simulatedSec!==600||stats.seconds<595)
    throw Error('600s bot engine clock not observed: '+
      JSON.stringify({sim:engine?.simulatedSec,clock:stats?.seconds}));
  if(!nav||nav.checked<60||nav.reachableNodes!==50||nav.blockedEdges.length<4||
      nav.blockedEdges.some(s=>typeof s!=='string'))
    throw Error('V42 physical navigation pruning QA not observed: '+JSON.stringify(nav));
  const difficulties=['normal','hard','expert'];
  const byDifficulty=Object.fromEntries(difficulties.map(key=>{
    const s=stats.difficulty[key]||{};
    return [key,{spawns:s.spawns||0,shots:s.shots||0,
      hits:s.hits||0,accuracy:s.accuracy??null,
      kills:s.kills||0,deaths:s.deaths||0,
      stuckRecoveries:s.stuckRecoveries||0,
      acousticInvestigations:s.heard||0}];
  }));
  const hotNodes=Object.entries(stats.stuckNodes||{})
    .map(([nodeId, row])=>({nodeId,count:row.total,
      classes:row.classes,teams:row.teams}))
    .sort((a,b)=>b.count-a.count).slice(0,8);
  const allHotspots=Object.values(stats.stuckNodes||{})
    .reduce((sum,row)=>sum+row.total,0);
  const allRecoveries=Object.values(stats.classes)
    .reduce((sum,row)=>sum+row.stuckRecoveries,0);
  if(allHotspots!==allRecoveries)
    throw Error('Route hotspot totals do not match stuck recovery count');
  const totalShots=difficulties.reduce((n,k)=>n+byDifficulty[k].shots,0);
  const totalHits=difficulties.reduce((n,k)=>n+byDifficulty[k].hits,0);
  if(totalHits>totalShots||stats.recent.length>20||
      stats.spread.blue.observations<595||stats.spread.red.observations<595||
      !Number.isFinite(stats.spread.blue.meanRadius)||
      !Number.isFinite(stats.spread.red.meanRadius))
    throw Error('Bot stress metric invariant failed');
  for(const metrics of Object.values(byDifficulty))
    if(metrics.hits>metrics.shots || (metrics.accuracy!==null &&
      (metrics.accuracy<0||metrics.accuracy>1)))
      throw Error('Invalid skill hit ratio');
  if((stats.stuckContexts||[]).length>100)
    throw Error('V43 stalled-bot context ring exceeded cap');
  const observedActors=Object.values(stats.actors || {});
  for(const actor of observedActors) {
    if(actor.sightings!==actor.targetAcquisitions+actor.targetSwitches ||
       actor.coverApproachSeconds+actor.coverHoldSeconds>actor.aliveSeconds ||
       actor.movingSeconds>actor.aliveSeconds)
      throw Error('V46 target/cover consistency invariant failed');
  }
  const coverCounts=(key)=>observedActors.reduce((n,b)=>n+(b[key]||0),0);
  const selections=coverCounts('coverAssignments');
  const arrivals=coverCounts('coverArrivals');
  const abandons=coverCounts('coverAbandons');
  const coverReasonTotal=Object.values(stats.coverAbandonReasons||{})
    .reduce((n,v)=>n+v,0);
  if(arrivals>selections||abandons>selections||
      arrivals+abandons>selections||
      coverCounts('coverReassignments')>abandons||
      coverCounts('coverOrphanSeconds')>coverCounts('coverApproachSeconds')||
      (stats.coverEvents||[]).length>90||coverReasonTotal!==abandons)
    throw Error('V47 cover lifecycle accounting invalid: '+
      JSON.stringify({selections,arrivals,abandons,coverReasonTotal}));
  if(errors.length)throw Error('Uncaught browser game errors: '+errors.slice(0,5).join(' | '));
  result={
    status:'PASS',
    seed,variant,
    method:'600 seconds accelerated actual updateBots + drone/FX in Chromium',
    limitation:'Not a ten-minute real-time, rendered or human-played match; kill-score limits restarted',
    simulatedSec:engine.simulatedSec,
    wallTimeMs,
    scoreRestarts:engine.scoreRestarts,
    navValidation:nav,
    behavior: {
      targetAcquisitions:observedActors.reduce((n,b)=>n+b.targetAcquisitions,0),
      targetSwitches:observedActors.reduce((n,b)=>n+b.targetSwitches,0),
      targetLosses:observedActors.reduce((n,b)=>n+b.targetLosses,0),
      coverApproachSeconds:observedActors.reduce((n,b)=>n+b.coverApproachSeconds,0),
      coverHoldSeconds:observedActors.reduce((n,b)=>n+b.coverHoldSeconds,0),
      movingSeconds:observedActors.reduce((n,b)=>n+b.movingSeconds,0),
      engagedSeconds:observedActors.reduce((n,b)=>n+b.engagedSeconds,0),
      meanLargestFocus: {
        blue:stats.spread.blue.meanLargestFocus,
        red:stats.spread.red.meanLargestFocus
      },
      meanClosePairs: {
        blue:stats.spread.blue.meanClosePairs,
        red:stats.spread.red.meanClosePairs
      }
    },
    coverLifecycle:{
      selections,arrivals,abandons,
      reassignments:coverCounts('coverReassignments'),
      retainedTargets:coverCounts('coverRetentions'),
      routeRejected:coverCounts('coverRouteRejected'),
      alternativeSelected:coverCounts('coverAlternativeSelected'),
      stallReroutes:coverCounts('coverStallReroutes'),
      stallFallbacks:coverCounts('coverStallFallbacks'),
      routeRetentions:coverCounts('coverRouteRetentions'),
      targetReevaluations:coverCounts('coverTargetReevaluations'),
      stalledApproaches:coverCounts('coverStalledApproaches'),
      orphanSeconds:coverCounts('coverOrphanSeconds'),
      approachSeconds:coverCounts('coverApproachSeconds'),
      holdSeconds:coverCounts('coverHoldSeconds'),
      abandonmentReasons:stats.coverAbandonReasons||{},
      recentEvents:stats.coverEvents||[],
      byClass:Object.fromEntries(Object.entries(stats.classes).map(([id,b])=>[
        id,{selections:b.coverAssignments,arrivals:b.coverArrivals,
          abandons:b.coverAbandons,stalled:b.coverStalledApproaches,
          orphanSeconds:b.coverOrphanSeconds}
      ]))
    },
    stuckContextSamples:stats.stuckContexts||[],
    samples:stats.samples,
    botShots:totalShots,
    botHits:totalHits,
    byDifficulty,
    byClass:Object.fromEntries(Object.entries(stats.classes).map(([k,s])=>
      [k,{shots:s.shots,hits:s.hits,kills:s.kills,deaths:s.deaths,
        stuckRecoveries:s.stuckRecoveries,heard:s.heard}])),
    blueSpread:stats.spread.blue.meanRadius,
    redSpread:stats.spread.red.meanRadius,
    recentSampleCount:stats.recent.length,
    hotspots:hotNodes,
    totalStuckRecoveries:allRecoveries,
    byBot:Object.fromEntries(Object.entries(stats.actors).map(([id,row])=>
      [id,{shots:row.shots,hits:row.hits,kills:row.kills,
        deaths:row.deaths,stuckRecoveries:row.stuckRecoveries,
        targetAcquisitions:row.targetAcquisitions,targetSwitches:row.targetSwitches,
        targetLosses:row.targetLosses,coverApproachSeconds:row.coverApproachSeconds,
        coverHoldSeconds:row.coverHoldSeconds,movingSeconds:row.movingSeconds}])),
    pageErrors:errors
  };
  console.log('PASS V48 accelerated 600s real bot logic stress: '+
    JSON.stringify(result));
} catch(e) {
  result={...result,seed,variant,error:String(e),pageErrors:errors};
  console.error('FAIL V48 accelerated bot stress: '+String(e));
  process.exitCode=1;
} finally {
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(result,null,2));
  try{await browser?.close();}catch(e){}
  await new Promise(resolve=>server.close(resolve));
}
