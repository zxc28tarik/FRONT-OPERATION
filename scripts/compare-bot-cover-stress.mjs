import fs from 'node:fs';
import path from 'node:path';

// V47: side-by-side seeded test under the SAME game/browser test harness.
// Baseline has all V47 diagnostics but no cover-continuity rule.
const seeds=process.argv.slice(2).map(Number);
if(seeds.length<2||seeds.some(x=>!Number.isInteger(x)||x<=0))
  throw Error('Usage: node compare-bot-cover-stress.mjs <seed1> <seed2> [seed3...]');
const basePath=path.resolve('test-artifacts/front-operation-bot-stress');
const fields=['selections','arrivals','abandons','reassignments','retainedTargets',
  'routeRejected','alternativeSelected','stallReroutes','stallFallbacks',
  'stalledApproaches','orphanSeconds','approachSeconds','holdSeconds'];
const rows=[];
for(const seed of seeds){
  const load=variant=>JSON.parse(fs.readFileSync(
    path.join(basePath,variant+'-'+seed,'report.json'),'utf8'));
  const baseline=load('baseline'),candidate=load('candidate');
  for(const [name,r] of [['baseline',baseline],['candidate',candidate]]){
    if(r.status!=='PASS'||r.simulatedSec!==600||r.seed!==seed||
       r.variant!==name||r.navValidation?.reachableNodes!==50 ||
       !r.coverLifecycle || r.pageErrors?.length)
      throw Error('V47 seeded '+name+' report invalid at '+seed);
    if(r.coverLifecycle.abandons+r.coverLifecycle.arrivals>
       r.coverLifecycle.selections)throw Error('Impossible cover lifecycle');
  }
  rows.push({
    seed,baseline:{stuck:baseline.totalStuckRecoveries,
      ...Object.fromEntries(fields.map(k=>[k,baseline.coverLifecycle[k]||0])),
      shots:baseline.botShots,hits:baseline.botHits},
    candidate:{stuck:candidate.totalStuckRecoveries,
      ...Object.fromEntries(fields.map(k=>[k,candidate.coverLifecycle[k]||0])),
      shots:candidate.botShots,hits:candidate.botHits}
  });
}
const sums=side=>Object.fromEntries(['stuck','shots','hits',...fields].map(k=>
 [k,rows.reduce((n,r)=>n+(r[side][k]||0),0)]));
const baseline=sums('baseline'),candidate=sums('candidate');
const difference=Object.fromEntries(Object.keys(baseline).map(k=>
 [k,candidate[k]-baseline[k]]));
const comparison={
 status:'PASS',method:'Same three game seeds, V47 audited baseline vs cover-commit candidate',
 limitation:'Accelerated bot-engine stress, not ten-minute rendered human play; random streams can diverge after game decisions',
 seeds,baseline,candidate,difference,bySeed:rows
};
fs.writeFileSync(path.join(basePath,'comparison.json'),JSON.stringify(comparison,null,2));
console.log('PASS V48 seeded cover policy comparison: '+JSON.stringify(comparison));
