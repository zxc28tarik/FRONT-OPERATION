'use strict';
// FRONT OPERATION V41 — deterministic geometry-aware base-exit regression.
// Run: node tests/bot_ai_v41_regression.cjs
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let count=0;
const check=(ok,msg)=>{ if(!ok) throw Error('V41 FAIL: '+msg); count++; console.log('  ✓ '+msg); };
const parts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
check(parts.length===3,'Three original inline scripts are preserved');
parts.forEach(m=>new Function(m[1]));
const begin=html.indexOf('      const NAV_NODES = [');
const finish=html.indexOf('      function isPositionWalkable(',begin);
check(begin>=0&&finish>begin,'Actual navigation module can be evaluated in isolation');
const nav=new Function(html.slice(begin,finish)+'\nreturn {nodes:NAV_NODES,edges:NAV_EDGES,adj:NAV_ADJ,nearest:findNearestNavNode,path:findPathAStar};')();
const {nodes,edges,adj,path:astar,nearest}=nav;
check(nodes.length===50,'All 50 established tactical nodes retained');
const near=(a,b)=>Math.abs(a-b)<0.001;
check(nodes[3].tag==='blue_west_exit'&&near(nodes[3].x,-26)&&near(nodes[3].z,44),
  'Blue node 3 now points to the traversable western flank, not the solid barricade');
check(nodes[39].tag==='red_west_exit'&&near(nodes[39].x,-26)&&near(nodes[39].z,-44),
  'Red node 39 now points to the traversable western flank, not the solid barricade');

// Exact solid base boxes from buildMarienCQCMap; no map geometry is modified by V41.
// Expand X/Z by the bot horizontal radius (0.42m) to test traversability.
const baseWalls=[
  {x:-11,z:42,w:16,d:1.5}, {x:11,z:42,w:16,d:1.5},
  {x:0,z:44.5,w:6.5,d:1.2},
  {x:-11,z:-42,w:16,d:1.5}, {x:11,z:-42,w:16,d:1.5},
  {x:0,z:-44.5,w:6.5,d:1.2}
];
for(const w of baseWalls){
  const pattern=new RegExp('addSolidBox\\('+w.x+', \\d+(?:\\.\\d+)?, '+w.z+', '+w.w+', \\d+(?:\\.\\d+)?, '+w.d+', ');
  check(pattern.test(html),'Original solid base wall '+w.x+','+w.z+' is still in gameplay');
}
const radius=0.42;
const blocked=(x,z)=>baseWalls.some(w=>
  Math.abs(x-w.x)<w.w/2+radius && Math.abs(z-w.z)<w.d/2+radius);
const edgeFree=(a,b)=>{
  const p=nodes[a],q=nodes[b];
  const steps=Math.ceil(Math.hypot(p.x-q.x,p.z-q.z)/0.2);
  for(let i=0;i<=steps;i++){
    const t=i/steps;
    if(blocked(p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t)) return false;
  }
  return true;
};
for(const n of [0,1,2,3,4,13,14,15,24,25,38,39,40,41,42])
  check(!blocked(nodes[n].x,nodes[n].z),'Base-area nav node '+n+' does not sit inside a wall');
check(!edges.some(([a,b])=>(a===3&&b===15)||(a===15&&b===3)),
  'Former impossible blue central-wall shortcut was removed');
check(!edges.some(([a,b])=>(a===25&&b===39)||(a===39&&b===25)),
  'Former impossible red central-wall shortcut was removed');
check(adj[3].some(e=>e.to===4)&&adj[3].some(e=>e.to===14),
  'Blue western exit links both base and courtyard');
check(adj[39].some(e=>e.to===13)&&adj[39].some(e=>e.to===24),
  'Red western exit links both base and courtyard');
for(const [a,b] of edges.filter(([a,b])=>[3,39].includes(a)||[3,39].includes(b)))
  check(edgeFree(a,b),'Base-exit edge '+a+'-'+b+' does not cross an original solid wall');
for(const start of [0,1,2]){
  for(const goal of [14,19,24]){
    const p=astar(start,goal);
    check(p[0]===start&&p.at(-1)===goal&&p.length>=2,
      'Blue spawn '+start+' has valid A* route to '+goal);
    check(p.every((n,i)=>i===0||edgeFree(p[i-1],n)),
      'Blue spawn '+start+' route to '+goal+' avoids solid base walls');
  }
}
for(const start of [40,41,42]){
  for(const goal of [24,19,14]){
    const p=astar(start,goal);
    check(p[0]===start&&p.at(-1)===goal&&p.length>=2,
      'Red spawn '+start+' has valid A* route to '+goal);
    check(p.every((n,i)=>i===0||edgeFree(p[i-1],n)),
      'Red spawn '+start+' route to '+goal+' avoids solid base walls');
  }
}
check(astar(0,14,3).at(-1)===14,'A* can bypass a blocked blue exit via the original side lane');
check(astar(40,24,39).at(-1)===24,'A* can bypass a blocked red exit via the original side lane');
check(edges.every(([a,b])=>adj[a].some(e=>e.to===b)&&adj[b].some(e=>e.to===a)),
  'Every nav edge remains bidirectional');
check(nearest({x:-26,y:0,z:44})===3&&nearest({x:-26,y:0,z:-44})===39,
  'Nearest-node lookup resolves both repositioned exits');
check(html.includes('if (movedDist < 0.55)')&&
  html.includes("recordBotStuckHotspot(bot, obstructedWp);"),
  'V40 stall detection and measurement remain intact');
check(html.includes("return index % 15 === 14")&&
  (html.match(/aimSettleSec: 0\\.34/g)||[]).length===3,
  'Three Normal/two Hard/expert substitution and common 0.34s aim are unchanged');
console.log('BOT AI V41 PASS ('+count+' checks)');
