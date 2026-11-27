import fs from 'node:fs';
import assert from 'node:assert/strict';
// QA-only transition context and A>B>A tests; no gameplay or browser required.
const src=fs.readFileSync('scripts/browser-bot01-baseline.mjs','utf8');
const cut=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i);return src.slice(i,j);};
const row=cut('      function bot01Row(b){','      function bot01EndContact(');
const sample=cut('      function bot01Sample(dt){','      window.__bot01Run=');
const b={id:'blue_1',team:'blue',classId:'heavy',alive:true,
  behaviorPlan:{kind:'ADVANCE'},lookControl:{owner:'ROUTE'},
  moveVelX:0,moveVelZ:0,botReload:null,activeDroneId:null,
  visibleEnemy:null,lastKnownEnemyPos:null,lastDirectContactAt:-10};
const bots=[b],audit={tick:0,rows:new Map(),contacts:new Map()};
const fn=new Function('bots','bot01Audit',
  'const bot01EndContact=()=>{};'+row+sample+';return bot01Sample;')(bots,audit);
const tick=(n,kind,context='other')=>{
 audit.tick=n;b.behaviorPlan={kind};b.visibleEnemy=context==='visible'?{id:'red'}:null;
 b.lastKnownEnemyPos=context==='recentLost'?{x:3,y:0,z:3}:null;
 b.lastDirectContactAt=context==='recentLost'?n*.05-.20:-10;
 b.hearingPos=context==='sound'?{x:3,y:0,z:3}:null;
 b.hearingTimer=context==='sound'?2:0;
 fn(.05);
};
tick(1,'ADVANCE');tick(2,'ENGAGE','visible');tick(3,'ADVANCE');
let r=audit.rows.get('blue_1');
assert.equal(r.transitions,2);assert.equal(r.rapidReversals,1);
assert.equal(r.transitionPairs['ADVANCE>ENGAGE'],1);
assert.equal(r.transitionPairs['ENGAGE>ADVANCE'],1);
assert.equal(r.rapidReversePairs['ADVANCE<>ENGAGE'],1);
assert.equal(r.transitionContexts.visible,1);
tick(40,'ENGAGE','recentLost');assert.equal(r.rapidReversals,1);
assert.equal(r.transitionContexts.recentLost,1);
tick(41,'ADVANCE','sound');assert.equal(r.rapidReversals,2);
assert.equal(r.transitionContexts.sound,1);
b.alive=false;tick(42,'ADVANCE');b.alive=true;tick(43,'ENGAGE','visible');
assert.equal(r.rapidReversals,2,'death/respawn is not a contact oscillation');
assert.equal(r.transitions,4,'no transition counted after dead actor');
tick(45,'MISSION');assert.equal(r.transitionContexts.mission,1);
console.log('BOT02 transition telemetry PASS (rapid reversals, contexts, death reset)');
