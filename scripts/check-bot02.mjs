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
const sel=s.slice(s.indexOf('      function selectBotMedicPatient('),s.indexOf('      // V34: Make friendly corridor negotiation'));
const pos=x=>({x,distanceTo(p){return Math.abs(x-p.x)}});let mc=0;
for(const mode of ['deathmatch','bomb','rescue'])for(const cooldown of [0,3])for(const kit of ['none','friendly','enemy','expiring','blocked']){
 const b={id:'medic',classId:'medic',team:'blue',abilityCooldown:cooldown,pos:pos(0)},ally={id:'ally',alive:true,hp:40,team:'blue',pos:pos(4)},player={alive:false};
 const kits=kit==='none'?[]:[{team:kit==='enemy'?'red':'blue',life:kit==='expiring'?.1:10,healTick:.5,pos:pos(4)}];
 const fn=new Function('matchState','bots','player','activeMedkits','mapColliders','foMedkitReachable',sel+';return selectBotMedicPatient')({mode},[b,ally],player,kits,[],()=>kit!=='blocked');
 assert.equal(fn(b)?.id,mode==='deathmatch'&&(cooldown>0||kit==='friendly')?undefined:'ally');mc++;
}
const route=s.match(/\/\/ FO_BOT02_BEGIN medic-route\n([\s\S]*?)\n *\/\/ FO_BOT02_END medic-route/)[1];let rc=0;
for(const mode of ['deathmatch','bomb','rescue'])for(const cls of ['medic','heavy'])for(const patient of [null,{}])for(const owned of [true,false]){
 let calls=0;const b={classId:cls,supportAllyId:'ally',supportGoalNode:1,path:[0,owned?1:2],goalNode:2,pathIndex:1,blockedNode:-1,pos:pos(0)};
 new Function('matchState','bot','injuredAlly','NAV_NODES','findNearestNavNode','findPathAStar',route)({mode},b,patient,[{}, {}, {}],()=>0,()=>{calls++;return [0,2]});
 assert.equal(calls,mode==='deathmatch'&&cls==='medic'&&!patient&&owned?1:0);rc++;
}
console.log('BOT02 isolated PASS',{heavy:cases,medic:mc,route:rc,total:cases+mc+rc});
