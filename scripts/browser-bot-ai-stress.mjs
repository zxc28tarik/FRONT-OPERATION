import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';

const output = path.resolve('test-artifacts/front-operation-bot-stress');
fs.mkdirSync(output, { recursive: true });
const source = fs.readFileSync('index.html');
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
  page.on('pageerror',error=>errors.push(String(error)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{
    waitUntil:'load',timeout:80000
  });
  await page.waitForFunction(()=>window.__frontOperationAiQaAdvance &&
    document.querySelector('#btn-deploy'),null,{timeout:60000});
  await page.locator('#btn-deploy').click();
  await page.waitForFunction(()=>document.getElementById('menu-overlay')
    .classList.contains('hidden'));
  const start=Date.now();
  const engine=await page.evaluate(() => window.__frontOperationAiQaAdvance(600));
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
  if(errors.length)throw Error('Uncaught browser game errors: '+errors.slice(0,5).join(' | '));
  result={
    status:'PASS',
    method:'600 seconds accelerated actual updateBots + drone/FX in Chromium',
    limitation:'Not a ten-minute real-time, rendered or human-played match; kill-score limits restarted',
    simulatedSec:engine.simulatedSec,
    wallTimeMs,
    scoreRestarts:engine.scoreRestarts,
    navValidation:nav,
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
        deaths:row.deaths,stuckRecoveries:row.stuckRecoveries}])),
    pageErrors:errors
  };
  console.log('PASS V42 accelerated 600s real bot logic stress: '+
    JSON.stringify(result));
} catch(e) {
  result={...result,error:String(e),pageErrors:errors};
  console.error('FAIL V42 accelerated bot stress: '+String(e));
  process.exitCode=1;
} finally {
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(result,null,2));
  try{await browser?.close();}catch(e){}
  await new Promise(resolve=>server.close(resolve));
}
