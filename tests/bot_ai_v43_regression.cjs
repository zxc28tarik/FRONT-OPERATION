'use strict';
// V43: Stalled-bot context QA ring and truthful move-intent diagnosis.
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
let n=0;const check=(yes,msg)=>{if(!yes)throw Error('V43 FAIL: '+msg);n++;console.log('  ✓ '+msg)};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for(const s of scripts)new Function(s[1]);
check(scripts.length===3,'Preserved inline game scripts');
const a=html.indexOf('      // V40: In-memory telemetry only.');
const b=html.indexOf('      let botLifeSequence = 0;',a);
check(a>0&&b>a,'V40-V43 metrics can be isolated without WebGL');
let walkable=(x,y,z)=>x>-2;
const api=new Function('walk','const isPositionWalkable=(...args)=>walk(...args);\n'+
  html.slice(a,b)+'\nreturn {state:BOT_METRICS,reset:resetBotMetrics,'+
  'snapshot:getBotMetricsSnapshot,stuck:recordBotStuckContext};')((...args)=>walkable(...args));
const bot={
 id:'red_1',team:'red',classId:'medic',state:'SUPPORT_ALLY',
 coverPhase:'NONE',pos:{x:0,y:0,z:0},goalNode:9,
 supportGoalNode:9,rallyGoalNode:-1,coverNode:-1,pathIndex:2,
 path:[41,39,9],visibleEnemy:null,hearingPos:null,
 unstuckTarget:null,passageStepTarget:null
};
api.reset();
check(api.state.stuckContexts.length===0&&
 Object.keys(api.state.stuckEventCounts).length===0,
 'New match starts with no stalled-movement samples');
for(let i=0;i<5;i++)api.stuck(bot,{x:-5,y:0,z:0},9,i*1.1);
check(api.state.stuckEventCounts.red_1===5,'Every stuck event counted even when sample is skipped');
check(api.state.stuckContexts.length===4,'After four initial contexts, repetitive events are decimated');
const sample=api.state.stuckContexts[0];
check(sample.waypoint===9&&sample.state==='SUPPORT_ALLY'&&sample.bot==='red_1',
 'Sample records waypoint, live behavioral state and actor ID');
check(sample.target?.x===-5&&sample.position.x===0&&sample.probeClear===false,
 'Probe detects wall between soldier and actual movement target');
check(sample.remaining===5&&sample.probeDistance===5,
 'Probe reports intended travel range without fabricated motion');
walkable=()=>true;
api.stuck(bot,{x:5,y:0,z:0},9,6);
check(api.state.stuckContexts.at(-1).probeClear===true,
 'Clear route diagnosed independently from alleged waypoint');
for(let i=0;i<1000;i++)api.stuck(bot,{x:8,y:0,z:0},9,7+i);
check(api.state.stuckContexts.length===100,
 'Diagnostic buffer remains bounded during recurring deadlock');
check(api.state.stuckEventCounts.red_1===1006,
 'Repeated observations do not overflow actor event counter');
const snapshot=api.snapshot();
snapshot.stuckContexts[0].bot='tampered';
check(api.state.stuckContexts[0].bot!=='tampered',
 'QA snapshot is read-only and cannot alter in-memory telemetry');
api.reset();
check(api.state.stuckContexts.length===0&&
 !Object.keys(api.state.stuckEventCounts).length,
 'Match restart clears both sample buffer and context counts');
check(html.includes('recordBotStuckContext(bot, moveTargetPos, obstructedWp, nowSec);'),
 'Real collision recovery captures actual movement target rather than stale A* guess');
check(html.includes('if (BOT_METRICS.stuckContexts.length > 100) BOT_METRICS.stuckContexts.shift();'),
 'Actual logging code enforces bounded memory usage');
check(html.includes("return index % 15 === 14")&&
 (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
 'User-required difficulty and medium aim unchanged');
console.log('BOT AI V43 PASS ('+n+' checks)');
