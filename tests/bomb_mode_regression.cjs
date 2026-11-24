'use strict';
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
let n=0;const ok=(v,l)=>{if(!v)throw Error('BOMB FAIL '+l);n++;console.log('PASS '+l)};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
scripts.forEach(x=>new Function(x[1]));ok(scripts.length===3,'Inline JS parses');
const start=html.indexOf('      const FO_BOMB_RULES=');
const end=html.indexOf('      function foBombActors()',start);
const api=new Function(html.slice(start,end)+'\nreturn {rules:FO_BOMB_RULES,step:stepFoBomb,inside:foBombInside};')();
const fresh=()=>({phase:'unplanted',site:null,actor:null,progress:0,seconds:0});
const a={id:'A',x:-16,z:-28,node:36},b={id:'B',x:16,z:-28,node:38};
const plant={id:'blue_1',site:a},defuse={id:'red_1',site:a};
let x=fresh();
ok(api.step(x,1,100,0,6,null).winner==='red','Attackers eliminated before plant');
ok(api.step(fresh(),1,100,6,0,null).winner==='blue','Defenders eliminated');
ok(api.step(fresh(),1,0,6,6,null).winner==='red','Round timeout before plant');
x=fresh();ok(api.step(x,2,100,6,6,plant)===null&&x.phase==='unplanted','Plant requires full hold');
api.step(x,.5,100,6,6,null);ok(x.progress===0&&x.actor===null,'Leaving resets hold');
api.step(x,2,100,6,6,plant);api.step(x,1,100,6,6,{...plant,site:b});
ok(x.phase==='unplanted'&&x.progress===1,'Changing sites resets hold');
api.step(x,2,100,6,6,{...plant,site:b});
ok(x.phase==='planted'&&x.site.id==='B'&&x.seconds===35,'Correct selected site planted');
ok(api.step(x,1,0,0,6,null)===null&&x.seconds===34,'Planted objective survives attackers dying and round timeout');
ok(api.step(x,33,0,0,6,null)===null&&x.seconds===1,'Planted timer independent of match timer');
ok(api.step(x,1,0,0,6,null).winner==='blue','Detonation awards attackers');
x=fresh();api.step(x,3,100,6,6,plant);
ok(api.step(x,3,100,0,6,defuse)===null,'Defuse requires full hold');
ok(api.step(x,1,100,0,6,defuse).winner==='red','Defuse awards defenders');
ok(api.inside({alive:true,pos:{x:-16,y:0,z:-28}},a),'Grounded live actor may interact');
ok(!api.inside({alive:false,pos:{x:-16,y:0,z:-28}},a),'Dead actor cannot interact');
ok(!api.inside({alive:true,pos:{x:-16,y:5,z:-28}},a),'Above-site actor cannot interact');
ok(!api.inside({alive:true,pos:{x:0,y:0,z:0}},a),'Far actor cannot interact');
const gstart=html.indexOf('      function depotGraph()');
const gend=html.indexOf('      function buildDepot17Map()',gstart);
const g=new Function(html.slice(gstart,gend)+'\nreturn depotGraph();')();
ok(g.nodes.length===50&&g.edges.length===85,'Independent 50-node graph');
ok(g.nodes[36].x===a.x&&g.nodes[36].z===a.z&&g.nodes[38].x===b.x&&g.nodes[38].z===b.z,'Both sites are graph targets');
ok(html.includes("if (matchState.mode==='bomb') continue;")&&html.includes("document.getElementById('respawn-countdown').textContent='TEK CAN';"),'Bot and player no-respawn gates');
ok(html.includes('if (matchState.mode === \'bomb\') return;'),'Bomb victory not deathmatch kill target');
ok(html.includes('FO_MAPS.deathmatch=captureFoMap(foMapBefore)')&&html.includes('installFoGraph(next.nodes,next.edges)'),'Original world/nav snapshot restored');
ok(html.includes('updateFoBomb(dt);')&&html.includes('getFoBombBotOrder(bot,dt);'),'Game loop and bot objective integration');
// Evaluate the actual Tersane builder using a minimal Three.js adapter.
// Collect every solid, run the same ground clearance as the game and
// prove the four entrances are physical openings rather than visual labels.
const solids=[];let liveGraph;
const fakeMesh=()=>({position:{},rotation:{},visible:true});
const fakeThree=new Proxy({}, {get:()=>function(){return {}}});
const mapStart=html.indexOf('      const FO_BOMB_SITES');
const mapEnd=html.indexOf('      function selectFoMap(mode)',mapStart);
const routes=new Function('THREE','makeProceduralTextureSet','addSolidBox','addDecoMesh',
 'scene','mapEnvironmentMeshes','createCorridorSign','installFoGraph','dustParticles',
 html.slice(mapStart,mapEnd)+'\nbuildDepot17Map();return FO_TERSANE_ROUTES;')(
 fakeThree,()=>({}),(x,y,z,w,h,d)=>{solids.push({x,y,z,w,h,d});return fakeMesh()},
 ()=>fakeMesh(),{children:[]},[],()=>{},(nodes,edges)=>{liveGraph={nodes,edges}},null);
const walk=(x,z)=>!solids.some(c=>1.6>c.y-c.h/2+.05&&0<c.y+c.h/2-.25&&
 x+.42>c.x-c.w/2&&x-.42<c.x+c.w/2&&z+.42>c.z-c.d/2&&z-.42<c.z+c.d/2);
const links=liveGraph.nodes.map(()=>[]);
for(const [a,b] of liveGraph.edges){
 const p=liveGraph.nodes[a],q=liveGraph.nodes[b],steps=Math.ceil(Math.hypot(p.x-q.x,p.z-q.z)/.22);
 let clear=true;for(let i=0;i<=steps;i++){const t=i/steps;
  if(!walk(p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t)){clear=false;break}}
 if(clear){links[a].push(b);links[b].push(a);}
}
const reach=(start)=>{const seen=new Set([start]),todo=[start];
 while(todo.length)for(const j of links[todo.pop()])if(!seen.has(j)){seen.add(j);todo.push(j)}
 return seen;};
ok(solids.length>=70,'Tersane solid geometry built');
ok(liveGraph.nodes.every(n=>walk(n.x,n.z)),'Every Tersane nav node walkable');
ok(reach(0).size===50,'All Tersane nodes connected after collision filtering');
let intervals=0,previous=false;
for(let i=0;i<=770;i++){const clear=walk(-38.5+i*.1,21);if(clear&&!previous)intervals++;previous=clear;}
ok(intervals===4,'Exactly four physical dividing-wall openings');
ok(routes.length===4&&new Set(routes.map(q=>q.x)).size===4,'Four distinct route assignments');
for(const route of routes){
 ok(links[route.entry].includes(route.exit),'Walkable gate '+route.id);
 const seen=reach(route.exit);ok(seen.has(36)&&seen.has(38),'Gate reaches both bomb sites '+route.id);
}
const underRoof=(x,z)=>solids.some(c=>c.y-c.h/2>3&&c.w>=8&&c.d>=12&&
 x>c.x-c.w/2&&x<c.x+c.w/2&&z>c.z-c.d/2&&z<c.z+c.d/2);
for(const [name,x,z] of [['A hangar',-16,-28],['service',0,6],['west storage',-32,20],['east equipment',32,-5]])
 ok(underRoof(x,z)&&walk(x,z),'Enclosed and enterable '+name);
ok(html.includes('goal=bot.foGateEntryReached?route.exit:route.entry;'),'Bot enters assigned gate before advancing');
const aimStart=html.indexOf('      function isBotAimAligned(');
const aimEnd=html.indexOf('      function isBotFireLaneClear(',aimStart);
const aimGate=new Function('normalizeAngle',html.slice(aimStart,aimEnd)+'\nreturn isBotAimAligned;')(
 a=>Math.atan2(Math.sin(a),Math.cos(a)));
const eye={x:0,y:1.45,z:10};
ok(!aimGate({pos:{x:0,z:0},upperYaw:0,legYaw:Math.PI},eye),'Logical aim cannot shoot through torso rotation limit');
ok(aimGate({pos:{x:0,z:0},upperYaw:0,legYaw:.8},eye),'Aligned rendered weapon permits shot');
ok(!aimGate({pos:{x:0,z:0},upperYaw:.3,legYaw:.3},eye),'Visibly offset muzzle blocks shot');
ok(html.includes("const twist=normalizeAngle(bot.upperYaw-bot.legYaw);"),'Combat torso tracks body turn');
ok(html.includes("function isFoSpectating()")&&html.includes("!player.alive;"),'Spectator requires death');
ok(html.includes("b.alive&&b.team===player.team"),'Follow target is live teammate');
ok(html.includes("updateFoSpectator(dt);")&&html.includes("stopFoSpectator();"),'Spectator frame and reset integrated');
console.log('BOMB MODE PASS ('+n+' checks)');
