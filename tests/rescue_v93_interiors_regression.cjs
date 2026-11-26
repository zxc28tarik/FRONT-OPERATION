'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      const FO_RESCUE_POINTS='),b=html.indexOf('      function selectFoMap(mode)',a);
const solids=[],ramps=[];let graph;
const mesh=()=>({position:{set(){}},visible:true});
const three=new Proxy({}, {get:()=>function(){return {}}});
const api=new Function('THREE','makeProceduralTextureSet','addSolidBox','addDecoMesh','dustParticles','installFoGraph','addWalkableRamp','const foE311ShareBumps=()=>{},foE311PrisonFinish=()=>{},foE311PrisonInterior=()=>{};\n'+html.slice(a,b)+'\nbuildFoPrisonMap();return {clear:foPrisonRouteClear,upper:FO_PRISON_UPPER};')(three,()=>({}),(x,y,z,w,h,d)=>{solids.push({minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2});return mesh()},()=>mesh(),null,(nodes,edges)=>graph={nodes,edges},(x,zStart,zEnd,yStart,yEnd,width)=>ramps.push({minX:x-width/2,maxX:x+width/2,zStart,zEnd,yStart,yEnd}));
assert.equal(ramps.length,4);assert.equal(solids.length,144);
for(const x of [-18,18])for(const y of [0,api.upper]){
 const dir=Math.sign(x);
 const at=(X,Z)=>({x:X,y,z:Z});
 assert(api.clear(at(x,-43),at(x,-36),solids,ramps),'Wide central hall opening');
 assert(!api.clear(at(x+4,-42),at(x+4,-37),solids,ramps),'Cross partition separates halls');
 assert(api.clear(at(x+dir*10,-43),at(x+dir*10,-29),solids,ramps),'Open annex gallery');
}
assert(graph.nodes.filter(n=>n.y===api.upper&&n.x< -10).length>40);
assert(graph.nodes.filter(n=>n.y===api.upper&&n.x>10).length>40);
const adj=graph.nodes.map(()=>[]);
for(const [a,b] of graph.edges){
 const p=graph.nodes[a],q=graph.nodes[b];
 if(p.y>0||q.y>0)assert(api.clear(p,q,solids,ramps),'3D route must have physical support and clearance');
 adj[a].push(b);adj[b].push(a);
}
const top=graph.nodes.findIndex(n=>n.y===api.upper&&n.x< -12);
const seen=new Set([top]),todo=[top];while(todo.length)for(const j of adj[todo.pop()])if(!seen.has(j)&&graph.nodes[j].y===api.upper){seen.add(j);todo.push(j)}
assert([...seen].some(j=>graph.nodes[j].x>12),'Upper gallery connects both wings without descending');
assert(!api.clear({x:18,y:0,z:-36},{x:18,y:api.upper,z:-36},solids,ramps),'No vertical shortcut through floor');
const s=html.indexOf('      function getFloorHeightAt('),e=html.indexOf('      function hasLineOfSight(',s);
const physics=new Function('mapColliders','mapRamps','foWorldX','foWorldZ',html.slice(s,e)+'\nreturn {floor:getFloorHeightAt,collision:resolveHorizontalCollision};')(solids,ramps,x=>x,z=>z);
for(const r of ramps){
 const x=(r.minX+r.maxX)/2,p={x,y:0,z:r.zStart-.5};
 for(let z=r.zStart-.5;z<=-44;z+=.08){p.z=z;physics.collision(p,.42,1.7);p.y=physics.floor(p.x,p.z,p.y+.45);assert(Math.abs(p.x-x)<.05&&Math.abs(p.z-z)<.05);}
 assert(Math.abs(p.y-api.upper)<.01);
 for(let z=-44;z>=r.zStart-.5;z-=.08){p.z=z;physics.collision(p,.42,1.7);p.y=physics.floor(p.x,p.z,p.y+.45);assert(Math.abs(p.x-x)<.05&&Math.abs(p.z-z)<.05);}
 assert.equal(p.y,0);
}
assert(html.includes("foActiveMap==='rescue')return foPrisonRouteClear(pos,n,mapColliders,mapRamps)"));
assert(html.includes('Math.abs(n.y-bot.pos.y)<.45'));
console.log('V93 INTERIORS PASS: '+graph.nodes.length+' nodes, '+graph.edges.length+' edges, 4 stairs and upper gallery');
