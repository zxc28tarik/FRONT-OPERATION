'use strict';
// V45: nearest reachable A* origins, especially warehouse facade.
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
let checks=0;
const expect=(pass,label)=>{if(!pass)throw Error('V45 FAIL: '+label); checks++;console.log('  ✓ '+label)};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
for(const scr of scripts)new Function(scr[1]);
expect(scripts.length===3,'Original 3 game scripts parse');
const a=html.indexOf('      const NAV_NODES = [');
const b=html.indexOf('      // Recover from collisions by walking around obstacles',a);
expect(a>0&&b>a,'Nav and physical walkability functions available');
const collider=(x,y,z,w,h,d)=>({minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2});
// Actual warehouse facades and base barricades from buildMarienCQCMap.
const obstacles=[
 collider(-18,1.8,-28,1.2,3.6,16),
 collider(-18,1.8,0,1.2,3.6,16),
 collider(-18,1.8,28,1.2,3.6,16),
 collider(0,.65,44.5,6.5,1.3,1.2),
 collider(0,.65,-44.5,6.5,1.3,1.2),
 collider(-24,.75,-8,3.2,1.5,2.2),
 collider(-24,.75,8,3.2,1.5,2.2)
];
const api=new Function('mapColliders',html.slice(a,b)+
 '\nreturn {near:findNearestNavNode,nodes:NAV_NODES,path:findPathAStar,'+
 'validate:validateGroundNavEdges};')(obstacles);
const p=(x,y,z)=>({x,y,z});
const outside=p(-16.98,0,0);
expect(api.near(outside)===9,'Original geometric nearest node is 9 behind warehouse wall');
const reachable=api.near(outside,true);
expect(reachable!==9,'Bot rejects unreachable nearest node across warehouse facade');
expect(reachable===19,'Bot chooses physically accessible center-side node 19');
expect(api.near(p(-24,0,0),true)===9,
 'Soldier already inside warehouse can still use node 9');
expect(api.near(p(-16.98,0,1),true)!==9,
 'Warehouse-wall isolation is robust to small parallel position variation');
expect(api.near(p(-16.98,0,-3),true)!==9,
 'Warehouse-wall isolation works along southern wall section');
expect(api.near(p(-34,0,14),true)===8,
 'Open warehouse lane retains its accessible waypoint');
expect(api.near(p(-26,0,44),true)===3,
 'V41 blue side exit is not changed by V45');
expect(api.near(p(-26,0,-44),true)===39,
 'V41 red side exit is not changed by V45');
expect(api.near(p(-16.98,3.62,0),true)===api.near(p(-16.98,3.62,0)),
 'Upper-deck nav selection preserves existing ramp behavior');
expect(api.near(outside,false)===9,'Goal/telemetry nearest lookups keep original semantics');
api.validate();
const path=api.path(reachable,9);
expect(path[0]===reachable&&path.at(-1)===9&&path.length>2,
 'Bot can navigate around warehouse facade instead of crossing it');
expect(path.every((id,i)=>i===0||api.path(id,id).at(-1)===id),
 'A* path maintains valid waypoint indices');
expect(api.near(outside,true)===reachable,
 'Reachable nearest choice is deterministic at the same position');
const count=(html.match(/findNearestNavNode\(bot\.pos, true\)/g)||[]).length;
expect(count>=10,'All major actor-origin A* queries use reachable node choice');
expect(html.includes("const isEngineerHoldNode") &&
 html.includes('NAV_VALIDATION.reachableNodes = seen.size;'),
 'V42 graph navigation and engineer defensive positions retained');
expect(html.includes('isBotDirectWalkingLineClear(bot.pos, injuredAlly.pos)'),
 'V44 medic physical direct-route requirement retained');
expect(html.includes('recordBotStuckContext(bot, moveTargetPos, obstructedWp, nowSec,{'),
 'V43 stuck context data retained');
expect(html.includes('return index % 15 === 14')&&
 (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
 'User difficulty cycle and common medium aiming remain unchanged');
console.log('BOT AI V45 PASS ('+checks+' checks)');
