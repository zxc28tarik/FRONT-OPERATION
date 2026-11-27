import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const s=fs.readFileSync('index.html','utf8'),o=execFileSync('git',['show','5fd037e83cb0aa77a5ff997b610e1b17c04f0486:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const tag=/^ *\/\/ FO_BOT02_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_BOT02_END \1\n/gm;
assert.equal(s.replace(tag,'').replace('let directCombat=botMustContinueContact(','const directCombat=botMustContinueContact('),o);
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
console.log('BOT02 isolated PASS',{heavy:cases,medicBaseline:mc,total:cases+mc});
