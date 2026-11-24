'use strict';
const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      // V71D: preference-only'),b=html.indexOf('      function findBestCoverNode(',a);
const c=html.indexOf('      function botCombatRangeBand('),d=html.indexOf('      function chooseBotRangeStrafeGoal(',c);
const e=html.indexOf('      function botPreferredInfantryWeapon('),f=html.indexOf('      function botAmmoWeapon(',e);
const nodes=[{x:0,y:0,z:0},{x:20,y:0,z:0}],orders=new Map();
let bomb=true,weapon='mrad';
const api=new Function('isFoBombMode','foBotPlan','NAV_NODES','botAmmoWeapon',html.slice(a,b)+html.slice(c,d)+html.slice(e,f)+'\nreturn {pref:botCoverPreference,penalty:botCoverDutyPenalty};')(()=>bomb,{orders},nodes,()=>weapon);
const threat={x:0,y:0,z:20},bot={id:'blue_0',classId:'sniper',pos:{x:0,y:0,z:0},visibleEnemy:{pos:threat}};
let n=0;const ok=(v,s)=>{if(!v)throw Error('V71D '+s);n++};
ok(api.pref(bot,threat,false).range[0]===22,'Primary preference retained');
weapon='glock18c';ok(api.pref(bot,threat,false).range[0]===5&&api.pref(bot,threat,false).sidearm,'Visible active sidearm changes range');
ok(api.pref(bot,{x:2,y:0,z:20},false).range[0]===22,'Unmatched memory does not infer active weapon');
ok(api.pref(bot,threat,true).range[0]===22,'Wounded retreat keeps original preference');
orders.set(bot.id,{role:'HOLD',goal:0});ok(api.pref(bot,threat,false).anchor===nodes[0],'Holding duty anchor');
orders.set(bot.id,{role:'GUARD',goal:1});ok(api.pref(bot,threat,false).anchor===nodes[1],'Guard duty anchor');
for(const role of ['ESCORT','RETAKE','PLANT','DEFUSE']){
 orders.set(bot.id,{role,goal:0});ok(!api.pref(bot,threat,false).anchor,role+' not restricted');
}
orders.set(bot.id,{role:'GUARD',goal:0});ok(!api.pref(bot,threat,true).anchor,'Wounded not tied to duty');
bomb=false;ok(!api.pref(bot,threat,false).anchor,'Marien not assigned bomb duty');
ok(api.penalty({x:5,z:0},nodes[0])===0,'Nearby cover unchanged');
ok(api.penalty({x:100,z:0},nodes[0])===3,'Duty preference bounded');
ok(api.penalty(nodes[0],null)===0,'No duty penalty without anchor');
ok(html.includes('if (!isFullCover && !isPartialCover) continue;')&&html.includes('score += occupancy * 24.0;'),'Concealment and occupancy preserved');
ok(html.includes("classId === 'sniper' && !preference.sidearm")&&html.includes('score+=botCoverDutyPenalty(n,preference.anchor);'),'Live scoring uses both context preferences');
console.log('BOT AI V71D COVER CONTEXT PASS ('+n+' checks)');
