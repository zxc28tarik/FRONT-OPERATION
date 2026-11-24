'use strict';
// V44: Medics do not run into waist-high obstacles visible over their tops.
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
let checks=0;
const verify=(ok,name)=>{if(!ok)throw Error('V44 FAIL: '+name);checks++;console.log('  ✓ '+name)};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for(const s of scripts)new Function(s[1]);
verify(scripts.length===3,'All three gameplay scripts still parse');
const a=html.indexOf('      // V44: A clear eye-level sightline');
const b=html.indexOf('      // Patient affinity prevents rapid medic destination switches.',a);
verify(a>0&&b>a,'V44 helper can be isolated');
let walk=(x,y,z)=>!(x>3&&x<6&&Math.abs(z)<1);
const direct=new Function('isPositionWalkable',
 html.slice(a,b)+'\nreturn isBotDirectWalkingLineClear;')((...args)=>walk(...args));
const p=(x,y,z)=>({x,y,z});
verify(direct(p(0,0,0),p(10,0,4)),'Open diagonal walkable segment is permitted');
verify(!direct(p(0,0,0),p(10,0,0)),'Waist-height obstacle blocks direct medic route');
verify(!direct(p(10,0,0),p(0,0,0)),'Obstacle is detected in the opposite travel direction');
verify(direct(p(0,0,2),p(10,0,2)),'Medic may walk around the obstacle');
verify(!direct(p(0,0,0),p(10,2.5,0)),'Different floor forces proper nav ramp routing');
verify(!direct(null,p(5,0,0))&&!direct(p(0,0,0),null),
 'Missing actor positions cannot produce false walkability');
walk=()=>true;
verify(direct(p(0,0,0),p(10,0,0)),
 'Physical clearance allows direct movement when no obstruction exists');
walk=(x,y,z)=>x<2;
verify(!direct(p(0,0,0),p(10,0,0)),
 'A wall early in the route is detected by sampling');
walk=(x,y,z)=>x<9.92;
verify(!direct(p(0,0,0),p(10,0,0)),
 'A blockage at target endpoint also rejects direct route');
walk=()=>true;
verify(direct(p(1,0,1),p(1,0,1)),
 'Already reached standing point does not create a false obstacle');
const medicSource=html.slice(html.indexOf("                const injuredAlly = bot.classId === 'medic'"),
  html.indexOf("                } else if (bot.lastKnownEnemyPos", html.indexOf("                const injuredAlly = bot.classId === 'medic'")));
verify(medicSource.includes('hasLineOfSight(medicEye, allyEye) &&') &&
 medicSource.includes('isBotDirectWalkingLineClear(bot.pos, injuredAlly.pos)'),
 'Real medic support requires sightline AND body-traversable ground');
verify(medicSource.includes('if (canReachAllyDirectly) {') &&
 medicSource.includes('moveTargetPos = injuredAlly.pos.clone();') &&
 medicSource.includes('findPathAStar('),
 'Blocked direct support transfers to existing A-star path');
verify(medicSource.includes('canReachAllyDirectly && bot.abilityCooldown <= 0'),
 'Healing at short range also respects actual navigability');
verify(html.includes('recordBotStuckContext(bot, moveTargetPos, obstructedWp, nowSec,{'),
 'V43 diagnostics remain active to verify the behavioral fix');
verify(html.includes('NAV_VALIDATION.reachableNodes = seen.size;'),
 'V42 graph-connectivity check is unchanged');
verify(html.includes('return index % 15 === 14')&&
 (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
 'Five-bot skill distribution and 0.34s medium aiming remain unchanged');
console.log('BOT AI V44 PASS ('+checks+' checks)');
