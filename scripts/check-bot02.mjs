import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const s=fs.readFileSync('index.html','utf8'),o=execFileSync('git',['show','5fd037e83cb0aa77a5ff997b610e1b17c04f0486:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const tag=/^ *\/\/ FO_BOT02_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_BOT02_END \1\n/gm;
const originalContactDecision=`            const openingPriority=botOpeningFirePriority(bot,bestEnemy,nowSec,initialFireLane,isWounded,isSniperTooClose,pressure);
            const followThrough=botFollowThroughPriority(bot,bestEnemy,nowSec,initialFireLane,isWounded,isSniperTooClose);
`;
const originalPressureStrafe="                if(!botObservedPressure(bot,bestEnemy,distToEnemy)){\n";
const originalPressureObjective="                !botObservedPressure(bot,bestEnemy,distToEnemy)&&distToEnemy>12;\n";
const originals={'contact-shortcircuit':originalContactDecision,
 'pressure-cache-strafe':originalPressureStrafe,
 'pressure-cache-objective':originalPressureObjective,
 'rally-advance':"                      behaviorHint='SUPPORT';\n                      setBotState(bot, 'SUPPORT_ALLY', 0.8);\n"};
const restored=s.replace(tag,(_,name)=>originals[name]??'')
  .replace('let directCombat=botMustContinueContact(','const directCombat=botMustContinueContact(');
assert.equal(restored,o);
const heavy=s.slice(s.indexOf('      function foBot02ContactCommit('),s.indexOf('      // FO_BOT02_END heavy-helper'));
const h=new Function(heavy+';return foBot02ContactCommit')();let cases=0;
for(const mode of ['deathmatch','bomb','rescue'])for(const cls of ['heavy','assault','medic','engineer','sniper'])for(const hp of [20,51,52,100]){
 const b={classId:cls,hp,contactOpportunity:{id:'x'}},e={id:'x'};
 assert.equal(h(b,e,1,true,'x',true,mode),true);
 const want=mode==='deathmatch'&&cls==='heavy'&&hp>=52;
 assert.equal(h(b,e,1.3,false,'x',true,mode),want);
 assert.equal(h(b,e,1.66,false,'x',true,mode),false);
 assert.equal(h(b,e,2,true,'x',true,mode),true);
 assert.equal(h(b,e,2.2,false,'y',true,mode),false);
 assert.equal(h(b,e,3,true,'x',true,mode),true);
 assert.equal(h(b,e,3.1,false,'x',false,mode),false);
 assert.equal(h(b,e,3.2,false,'x',true,mode),false);cases++;
}
// Medic BOT02 experiments were rejected; verify exact V344 selection/route parity.
const a='      function selectBotMedicPatient(',b='      // V34: Make friendly corridor negotiation';
assert.equal(s.slice(s.indexOf(a),s.indexOf(b)),o.slice(o.indexOf(a),o.indexOf(b)));
assert(!s.includes('FO_BOT02_BEGIN medic-route'));
assert(!s.includes('FO_BOT02_BEGIN short-reacquisition'));
let mc=0;
const sel=s.slice(s.indexOf(a),s.indexOf(b));
const pos=x=>({x,distanceTo(p){return Math.abs(x-p.x)}});
for(const mode of ['deathmatch','bomb','rescue'])
for(const cooldown of [0,3])
for(const scenario of ['injured','healthy','dead','enemy','out-of-range']){
 const bot={id:'medic',classId:'medic',team:'blue',abilityCooldown:cooldown,pos:pos(0)};
 const ally={id:'ally',alive:scenario!=='dead',team:scenario==='enemy'?'red':'blue',
   hp:scenario==='healthy'?100:40,pos:pos(scenario==='out-of-range'?25:4)};
 const patient=new Function('bots','player',sel+';return selectBotMedicPatient')(
   [bot,ally],{id:'player',alive:false,team:'blue',hp:100,pos:pos(0)})(bot);
 assert.equal(patient?.id,scenario==='injured'?'ally':undefined);
 mc++;
}
// Verify the *actual* gameplay expressions: no altered combat, flank or hold result.
const shortBlock=s.match(/\/\/ FO_BOT02_BEGIN contact-shortcircuit\n([\s\S]*?)\n *\/\/ FO_BOT02_END contact-shortcircuit/);
assert(shortBlock,'contact short-circuit block must exist');
const expr=shortBlock[1];
const contactDecision=new Function('directCombat','botOpeningFirePriority','botFollowThroughPriority',
  'bot','bestEnemy','nowSec','initialFireLane','isWounded','isSniperTooClose','pressure',
  expr+'; return {openingPriority,followThrough};');
let parity=0,oldCalls=0,newCalls=0;
for(const direct of [false,true])
for(const opening of [false,true])
for(const follow of [false,true])
for(const hold of [false,true])
for(const pressure of [false,true])
for(const flank of [false,true]){
  const result=contactDecision(direct,()=>{newCalls++;return opening;},
    ()=>{newCalls++;return follow;},{},{},0,false,false,false,pressure);
  oldCalls+=2;
  const oldHold=direct||opening||follow||hold;
  const newHold=direct||result.openingPriority||result.followThrough||hold;
  assert.equal(newHold,oldHold,'holdContact must remain identical');
  const oldFlank=flank&&(direct||(opening&&!pressure));
  const newFlank=flank&&(direct||(result.openingPriority&&!pressure));
  assert.equal(newFlank,oldFlank,'flank clearance must remain identical');
  parity++;
}
assert(newCalls<oldCalls,'duplicate helper evaluations must be reduced');
console.log('BOT02 isolated PASS',{heavy:cases,medicBaseline:mc,contactParity:parity,
  total:cases+mc+parity,decisionCallsSaved:oldCalls-newCalls});

// V348: only same-tick pure pressure tests may use cached result.
assert(s.includes('const pressure=botObservedPressure(bot,bestEnemy,distToEnemy);'));
assert(s.includes('FO_BOT02_BEGIN pressure-cache-strafe'));
assert(s.includes('FO_BOT02_BEGIN pressure-cache-objective'));
const pureStart=s.indexOf('      function botObservedPressure('),pureEnd=s.indexOf('      function chooseBotDodgeMode(',pureStart);
const pressureFn=new Function(s.slice(pureStart,pureEnd)+';return botObservedPressure;')();
let pressureCases=0;
for(const distance of [4,13,20,31])for(const yaw of [0,Math.PI/2,Math.PI])for(const firing of [true,false]){
 const bot={pos:{x:0,y:0,z:0}},enemy={pos:{x:0,y:0,z:distance},yaw,isFiring:firing};
 const cached=pressureFn(bot,enemy,distance);
 assert.equal(!cached,!pressureFn(bot,enemy,distance),'cached strafe pressure parity');
 assert.equal(cached,pressureFn(bot,enemy,distance),'cached objective pressure parity');
 pressureCases++;
}
console.log('BOT02 pressure cache PASS',{scenarios:pressureCases});
