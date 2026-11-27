import fs from 'node:fs';
import assert from 'node:assert/strict';
const s=fs.readFileSync('index.html','utf8');
const beginning=s.indexOf('                // FO_BOT02_BEGIN medic-ready-pursuit');
const ending=s.indexOf('                // FO_BOT02_END medic-ready-pursuit',beginning);
assert(beginning>0&&ending>beginning,'production Medic readiness gate');
const block=s.slice(beginning,ending);
const pick=new Function('bot','selectBotMedicPatient',block+';return injuredAlly;');
let cases=0;
for(const classId of ['medic','assault','heavy','sniper','engineer'])
for(const cooldown of [0,1.4,1.5,1.51,7,14]){
 const bot={classId,abilityCooldown:cooldown}, patient={id:'wounded',dist:2,pos:{x:0,y:0,z:0}};
 let scans=0;
 const actual=pick(bot,()=>{scans++;return patient;});
 const shouldTreat=classId==='medic'&&cooldown<=1.5;
 assert.equal(actual,shouldTreat?patient:null,'only kit-ready Medics pursue treatment');
 assert.equal(scans,shouldTreat?1:0,'no patient-search overhead on long cooldown');
 cases++;
}
// Real patient selection behavior is preserved when the medkit is ready.
const a=s.indexOf('      function selectBotMedicPatient(');
const b=s.indexOf('      // V34: Make friendly corridor negotiati',a);
assert(a>0&&b>a);
assert(!s.slice(a,b).includes('abilityCooldown'),'do not alter patient prioritization');
assert(s.includes("if (injuredAlly) {\n                  behaviorHint='SUPPORT';"),
 'genuine Medic support remains separate from squad advance');
assert(s.includes("if (injuredAlly.dist < 3.2"),'medkit deployment distance remains');
assert(s.includes('bot.abilityCooldown = 14;'),'medkit recharge preserved');
console.log('BOT02 Medic mobile treatment PASS',{classAndCooldownCases:cases});
