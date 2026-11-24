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
const a={id:'A',x:-16*1.368,z:-28*.765,node:36},b={id:'B',x:16*1.368,z:-28*.765,node:38};
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
ok(api.inside({alive:true,pos:{x:a.x,y:0,z:a.z}},a),'Grounded live actor may interact');
ok(!api.inside({alive:false,pos:{x:a.x,y:0,z:a.z}},a),'Dead actor cannot interact');
ok(!api.inside({alive:true,pos:{x:a.x,y:5,z:a.z}},a),'Above-site actor cannot interact');
ok(!api.inside({alive:true,pos:{x:0,y:0,z:0}},a),'Far actor cannot interact');
const gstart=html.indexOf('      const FO_TERSANE_X=');
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
const mapStart=html.indexOf('      const FO_TERSANE_X=');
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
// Sample clearance from head-height opaque solids over the playable interior.
let exposed=0;
const opaque=solids.filter(c=>c.y-c.h/2<1.48&&c.y+c.h/2>1.48);
for(let x=-36;x<=36;x+=2)for(let z=-56;z<=56;z+=2){
 const X=x*1.368,Z=z*.765;
 const d=Math.min(...opaque.map(c=>Math.hypot(Math.max(0,Math.abs(X-c.x)-c.w/2),Math.max(0,Math.abs(Z-c.z)-c.d/2))));
 if(d>4)exposed++;
}
ok(exposed<=180,'V89 exposed sample count <=180 (V88: 362): '+exposed);
ok(solids.length===131,'Tersane enlarged physical geometry built');
ok(liveGraph.nodes.every(n=>walk(n.x,n.z)),'Every Tersane nav node walkable');
ok(reach(0).size===liveGraph.nodes.length&&liveGraph.nodes.length===208,'All Tersane nodes connected after collision filtering');
let intervals=0,previous=false;
for(let i=0;i<=1053;i++){const clear=walk(-52.668+i*.1,16.065);if(clear&&!previous)intervals++;previous=clear;}
ok(intervals===4,'Exactly four physical dividing-wall openings');
ok(routes.length===4&&new Set(routes.map(q=>q.x)).size===4,'Four distinct route assignments');
for(const route of routes){
 ok(links[route.entry].includes(route.exit),'Walkable gate '+route.id);
 const seen=reach(route.exit);ok(seen.has(36)&&seen.has(38),'Gate reaches both bomb sites '+route.id);
}
const underRoof=(x,z)=>solids.some(c=>c.y-c.h/2>3&&c.w>=8&&c.d>=12&&
 x>c.x-c.w/2&&x<c.x+c.w/2&&z>c.z-c.d/2&&z<c.z+c.d/2);
for(const [name,x,z] of [['A hangar',-16,-28],['service',0,6],['west storage',-32,20],['east equipment',32,-5]])
 ok(underRoof(x*1.368,z*.765)&&walk(x*1.368,z*.765),'Enclosed and enterable '+name);
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
ok(Math.abs(g.nodes[0].x-g.nodes[4].x-(-87.552))<.001,'V88 spawn width reduced by 40 percent from V87');
ok(g.nodes[0].z-g.nodes[45].z===76.5,'V88 spawn separation reduced to 76.5');
ok(links.reduce((sum,l)=>sum+l.length,0)/2===653,'653 validated navigation edges');
const bounds=new Function('mode',html.slice(gstart,html.indexOf('      const FO_BOMB_SITES',gstart))+
 '\nconst foActiveMap=mode;return [foWorldX(38.5),foWorldZ(59.5)];');
ok(Math.abs(bounds('bomb')[0]-52.668)<.001&&Math.abs(bounds('bomb')[1]-45.5175)<.001,'V88 bomb bounds reduced on both axes');
ok(bounds('deathmatch')[0]===38.5&&bounds('deathmatch')[1]===59.5,'Marien world bounds unchanged');
ok(html.includes('foActiveMap=mode; // Set bounds before validating the selected graph.'),'Select correct bounds before nav validation');
ok(html.includes('foWorldZ(50));'),'Player deploys at expanded spawn');
ok(html.includes('b.pos.x=foWorldX(b.pos.x);b.pos.z=foWorldZ(b.pos.z);'),'Bot deployment uses enlarged arena');
// Quantify physical head-height sightlines across original reference nodes.
let visible=0,total=0;
for(let i=0;i<50;i++)for(let j=i+1;j<50;j++){
 const a=liveGraph.nodes[i],b=liveGraph.nodes[j];
 if(Math.hypot(a.x-b.x,a.z-b.z)<30)continue;
 total++;
 const blocked=solids.some(c=>{
   if(c.y-c.h/2>=1.48||c.y+c.h/2<=1.48)return false;
   let lo=0,hi=1;
   for(const [p,q,min,max] of [[a.x,b.x,c.x-c.w/2,c.x+c.w/2],[a.z,b.z,c.z-c.d/2,c.z+c.d/2]]){
     const v=q-p;
     if(Math.abs(v)<1e-8){if(p<min||p>max)return false;}
     else{const t1=(min-p)/v,t2=(max-p)/v;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false;}
   }
   return lo<=hi;
 });
 if(!blocked)visible++;
}
ok(total>0&&visible/total<.10,'Compact map retains low long-range visibility: '+visible+'/'+total);
const crossings=liveGraph.edges.flatMap(([a,b])=>{
 const p=liveGraph.nodes[a],q=liveGraph.nodes[b],x=5.5*1.368;
 if((p.x<x&&q.x>x)||(q.x<x&&p.x>x))return [p.z+(q.z-p.z)*(x-p.x)/(q.x-p.x)];
 return [];
});
ok(crossings.length>0&&crossings.every(z=>z<-3.06),'No early lateral shortcuts across mid divider');
ok(crossings.some(z=>z>-10.71&&z<-3.06),'First forward crossover navigable');
ok(crossings.some(z=>z>-25.245&&z<-16.83),'Second forward crossover navigable');
ok(crossings.every(z=>(z>-10.71&&z<-3.06)||(z>-25.245&&z<-16.83)),'Only the two forward windows connect sides');
// Execute the real bomb plan and route selection with controlled actors.
const ps=html.indexOf('      function refreshFoBotPlan(now)');
const pe=html.indexOf('      function refreshFoModeUi()',ps);
const sites=[{id:'A',x:g.nodes[36].x,z:g.nodes[36].z,node:36,guards:[31,35,37,41]},
 {id:'B',x:g.nodes[38].x,z:g.nodes[38].z,node:38,guards:[33,37,39,43]}];
const fakeBots=['blue','red'].flatMap(team=>Array.from({length:team==='blue'?5:6},(_,i)=>({
 id:team+'_'+i,team,alive:true,hp:100,pos:{x:i*2,y:0,z:team==='blue'?38.25:-38.25}})));
const state={phase:'unplanted',site:null,actor:null};
const plan={key:'',next:0,orders:new Map(),operators:new Map()};
let searches=0;
const ai=new Function('isFoBombMode','bots','foBomb','foBotPlan','FO_BOMB_SITES','NAV_NODES','FO_TERSANE_ROUTES','foWorldZ','botAiClockSec','isPositionWalkable','findNearestNavNode','findPathAStar','THREE',
 html.slice(ps,pe)+'\nreturn {refresh:refreshFoBotPlan,order:getFoBombBotOrder};')(
 ()=>true,fakeBots,state,plan,sites,liveGraph.nodes,routes,z=>z*.765,0,()=>true,()=>0,(_a,b)=>{searches++;return [b]}, {Vector3:function(x,y,z){Object.assign(this,{x,y,z})}});
ai.refresh(0);
ok(plan.orders.size===11&&plan.operators.size===2,'Every living bot assigned a mission; one planter per site');
ok([...plan.operators.values()].every(id=>id.startsWith('blue_')),'Only attacking team assigned to plant');
const beforeOps=[...plan.operators.values()].join(',');
fakeBots[0].pos.x+=50;ai.refresh(3);
ok([...plan.operators.values()].join(',')===beforeOps,'Operators retain stable assignments despite movement');
const bot=fakeBots[0];ai.order(bot,.05);ai.order(bot,.05);
ok(searches===1,'Valid objective path retained between frames');
bot.visibleEnemy={id:'enemy'};
ok(ai.order(bot,.05)===null,'Visible enemy takes precedence over mission route');
bot.visibleEnemy=null;
const lost=plan.operators.get('A');fakeBots.find(b=>b.id===lost).alive=false;ai.refresh(3.1);
ok(plan.operators.get('A')!==lost&&plan.orders.size===10,'Dead operator replaced immediately');
state.phase='planted';state.site=sites[0];ai.refresh(4);
ok(plan.operators.size===1&&plan.operators.get('A').startsWith('red_'),'One defender defuses after planting');
const reds=fakeBots.filter(b=>b.team==='red'&&b.alive).map(b=>plan.orders.get(b.id).goal);
ok(new Set(reds).size===reds.length,'Defusing team uses distinct positions');
ok(html.includes('Math.hypot(actor.moveVelX||0,actor.moveVelZ||0)<1.0'),'Bots must stop before objective interaction');
ok(html.includes('botRecoveryWaypoint(motionLeg,bot.behaviorPlan.local)'),'Stuck recovery uses actual movement leg (V81)');
console.log('BOMB MODE PASS ('+n+' checks)');
