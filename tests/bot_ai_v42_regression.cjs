'use strict';
// FRONT OPERATION V42 — collision-aware A* edge filtering regression.
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let checks=0;
const verify=(truth,label)=>{if(!truth)throw Error('V42 FAIL: '+label); checks++;console.log('  ✓ '+label)};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
verify(scripts.length===3,'Three inline scripts preserved');
for(const script of scripts)new Function(script[1]);
const from=html.indexOf('      const NAV_NODES = [');
const until=html.indexOf('      // Recover from collisions by walking around obstacles',from);
verify(from>0&&until>from,'Real navigation and collider validator are available');
const box=(x,z,w,d,h=2,y=h/2)=>({
 minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:y-h/2,maxY:y+h/2
});
// Real-world obstacles reproduced from buildMarienCQCMap: west warehouse
// cargo, east gate barriers and the central divider.
const colliders=[
 box(-24,8,3.2,2.2,1.5), box(-24,-8,3.2,2.2,1.5),
 box(24,-13,4.2,2.0,1.5),box(18,0,1.2,14,3.2),
 box(-11,42,16,1.5,4.4),box(11,42,16,1.5,4.4),
 box(0,44.5,6.5,1.2,1.3),
 box(-11,-42,16,1.5,4.4),box(11,-42,16,1.5,4.4),
 box(0,-44.5,6.5,1.2,1.3)
];
const code=html.slice(from,until);
const api=new Function('mapColliders',code+'\nreturn {nodes:NAV_NODES,adj:NAV_ADJ,'+
  'edges:NAV_EDGES,validate:validateGroundNavEdges,path:findPathAStar,'+
  'nearest:findNearestNavNode,walkable:isPositionWalkable,state:NAV_VALIDATION};')(colliders);
verify(api.nodes.length===50,'Fifty tactical waypoints are preserved');
verify(api.edges.length===86,'Original connection candidates remain available');
for(const id of [3,9,34,39]){
 const p=api.nodes[id];
 verify(api.walkable(p.x,p.y,p.z),'Hotspot node '+id+' itself remains walkable');
}
verify(api.adj[34].some(v=>v.to===35),'A* graph initially contains impossible east diagonal');
verify(api.adj[9].some(v=>v.to===11),'A* graph initially contains impossible west diagonal');
const data=api.validate();
verify(data.checked>60,'Ground-floor edge inventory is checked');
for(const k of ['7-9','9-11','20-34','34-35']){
 verify(data.blockedEdges.includes(k),'Obstacle-crossing link '+k+' removed');
}
for(const [a,b] of [[7,9],[9,11],[20,34],[34,35]]){
 verify(!api.adj[a].some(v=>v.to===b)&&!api.adj[b].some(v=>v.to===a),
  'Edge '+a+'-'+b+' is rejected bidirectionally');
}
for(const [a,b] of [[3,4],[13,39],[0,3],[39,41],[34,33]]){
 verify(api.adj[a].some(v=>v.to===b)&&api.adj[b].some(v=>v.to===a),
  'Unobstructed link '+a+'-'+b+' stays available');
}
for(const [a,b] of [[0,19],[1,34],[41,19],[42,34],[4,13],[39,14]]){
 const p=api.path(a,b);
 verify(p[0]===a&&p.at(-1)===b&&p.length>1,
  'After pruning, A* still finds full path '+a+'-'+b);
 verify(p.every((n,i)=>i===0||api.adj[p[i-1]].some(v=>v.to===n)),
  'After pruning, route '+a+'-'+b+' uses only valid edges');
}
const old=JSON.stringify(data.blockedEdges);
api.validate();
verify(JSON.stringify(data.blockedEdges)===old,'Repeated validation is deterministic');
verify(data.reachableNodes===50,'Every original waypoint stays connected after filtering');
verify(data.activeEdges+data.blockedEdges.length===86,
 'Validator statistics account for every original connection');
verify(html.includes('        buildMarienCQCMap();\n        validateGroundNavEdges();'),
 'Geometry validation runs after building colliders and before spawning bots');
verify(html.includes('navValidation: {')&&
 html.includes('blockedEdges: NAV_VALIDATION.blockedEdges.slice()'),
 'Localhost QA can inspect actual pruning without new HUD');
verify(html.includes('resolveHorizontalCollision(bot.pos, 0.42, 1.7);'),
 'Soldier physics collision radius is unchanged');
verify(html.includes("recordBotStuckHotspot(bot, obstructedWp);"),
 'V40 stuck hotspot attribution remains intact');
verify(html.includes('return index % 15 === 14')&&
 (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
 'User difficulty distribution and 0.34-second medium aim are preserved');
console.log('BOT AI V42 PASS ('+checks+' checks)');
