'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const cut=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return html.slice(i,j);};
const budget=new Function(cut('function foFrameBudget(','      function animate(now)')+';return foFrameBudget;')();
const sweep=new Function(cut('function foGrenadeSweep(','      function foAdvanceGrenade(')+';return foGrenadeSweep;')();
const {surface,place,casing,medkit}=new Function('foGrenadeSweep',cut('function foRocketSurface(','      function fireRocket(')+';return {surface:foRocketSurface,place:foPlaceRocketContact,casing:foAdvanceCasing,medkit:foMedkitReachable};')(sweep);
let n=0;const ok=(v,m)=>{assert(v,m);n++;};
const vec=(x,y,z)=>({x,y,z,set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}});
for(const fps of [5,10,15,20,30,60,144]){
 let debt=0,elapsed=0;
 for(let frame=0;frame<fps*10;frame++){
  const b=budget(1/fps,debt);debt=b.debt;
  ok(b.dt<=.0500000001&&b.count<=10,'bounded substeps');
  elapsed+=b.dt*b.count;
 }
 ok(Math.abs(elapsed-10)<1e-8&&debt===0,'full time '+fps+' FPS');
}
let debt=0,elapsed=0,total=0;
for(const frame of [1.2,.1,.1,.03,.03,.03,.03]){
 const b=budget(frame,debt);elapsed+=b.dt*b.count;debt=b.debt;total+=frame;
 ok(Math.abs(total-elapsed-debt)<1e-8,'no lost debt');
}
ok(debt===0,'catch-up completes');
ok(budget(0,0).count===0,'zero elapsed no tick');
const wall={minX:0,maxX:.08,minY:0,maxY:5,minZ:-10,maxZ:10};
for(const dir of [-1,1])for(const speed of [4,44,150]){
 const p=vec(dir>0?-.1:.18,2,0),dx=dir*speed*.05,h=surface(p,dx,0,0,[wall],40,60);
 ok(h&&h.t>=0&&h.t<=1,'wall contact');
 const out=place(vec(0,0,0),p,dx,0,0,h);
 ok(dir>0?out.x<0:out.x>.08,'near face');ok(Math.abs(out.x-(dir>0?-.005:.085))<1e-8,'surface epsilon');
}
const hit=surface(vec(-.4,2,0),.75,0,0,[wall],40,60);
ok(hit&&hit.nx===-1,'blocked launch offset');
ok(!surface(vec(-3,6,0),4,0,0,[wall],40,60),'open overhead path');
const ground=surface(vec(0,.4,0),0,-1,0,[],40,60);
ok(ground&&ground.ny===1&&Math.abs(ground.t-.35)<1e-8,'ground impact');
const bound=surface(vec(39.8,2,0),1,0,0,[],40,60);
ok(bound&&bound.nx===-1&&Math.abs(bound.t-.2)<1e-8,'world bounds');
const deck={minX:-2,maxX:2,minY:2,maxY:2.2,minZ:-2,maxZ:2};
let sc={mesh:{position:vec(0,2.5,0)},vel:vec(0,-10,0)};casing(sc,.05,[deck],()=>0);
ok(Math.abs(sc.mesh.position.y-2.22)<1e-8&&sc.vel.y>0,'upper deck catches casing');
sc={mesh:{position:vec(0,1,0)},vel:vec(0,-10,0)};casing(sc,.05,[deck],()=>0);
ok(sc.mesh.position.y<1&&sc.vel.y<0,'no snapping upward from below');
sc={mesh:{position:vec(0,.1,0)},vel:vec(0,-10,0)};casing(sc,.05,[],()=>0);
ok(sc.mesh.position.y===.02&&sc.vel.y>0,'ground bounce');
ok(!medkit(vec(-.5,0,0),vec(.5,0,0),[wall]),'blocked healing through wall');
ok(medkit(vec(-.5,0,0),vec(.5,0,0),[]),'open healing');
ok(!medkit(vec(0,0,0),vec(0,2.3,0),[deck]),'blocked between floors');
ok(!medkit(vec(0,0,0),vec(2.51,0,0),[]),'radius unchanged');
ok(medkit(vec(0,0,0),vec(2.5,0,0),[]),'radius inclusive');
ok(html.includes('const dt=budget.dt,clockDt=dt;')&&html.includes('updateBots(dt);')&&html.includes('updateFoBomb(dt,clockDt);'),'live substeps');
ok(html.includes('foTimeDebt=budget.debt;')&&html.includes('foTimeDebt=0;lastFrameTime=performance.now();'),'pause debt reset');
ok(html.includes('foPlaceRocketContact(nextPos,r.pos,step.x,step.y,step.z,hit)'),'live contact');
ok(html.includes('foAdvanceCasing(sc,dt,mapColliders,getFloorHeightAt);'),'live casings');
ok(html.includes('foMedkitReachable(mk.pos,player.pos,mapColliders)')&&html.includes('foMedkitReachable(mk.pos,ally.pos,mapColliders)'),'both teams healing');
console.log('Critical 01/04/05/06 PASS:',n,'checks; no real frame-time or FPS claim.');
