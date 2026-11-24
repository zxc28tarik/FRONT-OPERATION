'use strict';
const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      const WEAPONS = {'),b=html.indexOf('      // =========================================================================',html.indexOf('      const CLASSES = {',a));
const c=html.indexOf('      // V68: shared finite'),d=html.indexOf('      function updateBots(dt)',c);
const counters=new Map();
const record=(bot,field)=>{const r=counters.get(bot.id)||{};r[field]=(r[field]||0)+1;counters.set(bot.id,r);};
const api=new Function('DRONE_CONFIG','recordBotMetric',html.slice(a,b)+html.slice(c,d)+'\nreturn {W:WEAPONS,C:CLASSES,slot:botAmmoSlot,weapon:botAmmoWeapon,spend:botTrySpendRound,tick:tickBotAmmo};')({kamikazeDamage:85},record);
let n=0;const ok=(v,s)=>{if(!v)throw Error('V73 '+s);n++};
for(const cls of Object.values(api.C)){
 const bot={id:cls.id,classId:cls.id},ids=[cls.slots[1],cls.slots[2]];
 const foreign=Object.values(api.C).map(x=>x.slots[1]).find(x=>!ids.includes(x));
 ok(api.slot(bot,foreign)===null&&api.spend(bot,foreign)===false,cls.id+' foreign weapon rejected');
 let total=0;
 for(const id of ids){
  const w=api.W[id],s=api.slot(bot,id);let shots=0,steps=0;
  while(s.mag+s.reserve>0&&steps++<1000){
    if(api.spend(bot,id))shots++;
    else api.tick(bot,w.reloadTime+.01,{contact:true});
  }
  ok(shots===w.magSize+w.reserveMax&&s.mag===0&&s.reserve===0,cls.id+' '+id+' full-life conservation');
  ok(!api.spend(bot,id)&&!bot.botReload,cls.id+' '+id+' exhausted cannot fire or refill');
  total+=shots;
 }
 const r=counters.get(bot.id);
 ok(r.ammoRounds===total&&r.ammoSidearmRounds===api.W[ids[1]].magSize+api.W[ids[1]].reserveMax,cls.id+' telemetry agrees with inventory');
 ok(r.ammoReloadStarts===r.ammoReloadCompletes&&r.ammoWeaponSwitches===1,cls.id+' reload and switch accounting');
 ok(api.weapon(bot,foreign)===ids[0],cls.id+' exhausted fallback cannot return foreign gun');
}
const bot={id:'interrupt',classId:'assault'},s=api.slot(bot,'hk416');s.mag=1;
api.tick(bot,.1,{quiet:true,stationary:true,role:'HOLD'});
ok(!!bot.botReload,'Optional reload started');
api.tick(bot,.1,{contact:true});ok(!bot.botReload&&s.mag===1,'Optional reload interrupted without ammo gain');
ok(counters.get(bot.id).ammoReloadCancels===1,'Cancel recorded exactly once');
ok(api.spend(bot,'hk416')&&s.mag===0,'Remaining round fired');
ok(!api.spend(bot,'hk416')&&!!bot.botReload,'Empty starts timed reload');
api.tick(bot,.1,{role:'DEFUSE'});ok(!bot.botReload&&s.mag===0,'Objective cancels without refill');
ok(counters.get(bot.id).ammoReloadStarts===2&&counters.get(bot.id).ammoReloadCancels===2,'Both cancellations accounted');
console.log('BOT AI V73 AMMO AUDIT PASS ('+n+' checks)');
