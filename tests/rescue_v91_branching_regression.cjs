'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      const FO_RESCUE_POINTS='),b=html.indexOf('      function selectFoMap(mode)',a);
const s=html.indexOf('      const FO_RESCUE_RULES='),e=html.indexOf('      function updateFoRescue(dt)',s);
const solids=[];let graph;
const mesh=()=>({position:{set(){}},visible:true});
const three=new Proxy({}, {get:()=>function(){return {}}});
const api=new Function('THREE','makeProceduralTextureSet','addSolidBox','addDecoMesh','dustParticles','installFoGraph',html.slice(a,b)+html.slice(s,e)+'\nbuildFoPrisonMap();return {rooms:FO_RESCUE_ROOMS,branches:FO_RESCUE_BRANCHES,state:foRescue,reset:resetFoRescue};')(three,()=>({}),(x,y,z,w,h,d)=>{solids.push({x,y,z,w,h,d});return mesh()},()=>mesh(),null,(nodes,edges)=>graph={nodes,edges});
const walk=(x,z)=>!solids.some(c=>1.6>c.y-c.h/2+.05&&0<c.y+c.h/2-.25&&x+.48>c.x-c.w/2&&x-.48<c.x+c.w/2&&z+.48>c.z-c.d/2&&z-.48<c.z+c.d/2);
const openings=z=>{let count=0,prev=false;for(let x=-38.5;x<=38.5;x+=.1){const free=walk(x,z);if(free&&!prev)count++;prev=free;}return count;};
assert.equal(openings(28),2);assert.equal(openings(-17),4);
for(let x=-18;x<=18;x+=.1)assert(walk(x,-36),'Interior link clear');
for(const q of api.branches){assert(walk(q.x,q.z));assert(walk(q.approach.x,q.approach.z));assert(walk(q.search.x,q.search.z));}
assert.equal(api.branches.map(q=>q.room).join(','),'A,A,LINK,B');
for(const [rng,id,x] of [[0,'A',-18],[.499,'A',-18],[.5,'B',18],[.999,'B',18]]){
 api.reset(()=>rng);assert.equal(api.state.roomId,id);assert.equal(api.state.captives.length,2);
 for(const p of api.state.captives){assert(Math.abs(p.x-x)===2.5);assert.equal(p.z,-36);assert(walk(p.x,p.z));assert(!p.discovered);}
}
assert(html.includes('live.filter(p=>!p.carrier&&p.discovered)'));
assert(html.includes("branch.id==='A_WEST'"));
assert(html.includes('p=>!p.saved&&p.discovered'));
assert(html.includes('if(isFoRescueMode())syncFoRescueMarkers();'));
console.log('V91 BRANCHING RESCUE PASS: 2 entrances, 4 branches, connected wings, random shared room');
