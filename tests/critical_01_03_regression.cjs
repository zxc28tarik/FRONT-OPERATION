'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const cut=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return html.slice(i,j);};
const elapsed=new Function(cut('function foMatchElapsed(','      function animate(now)')+';return foMatchElapsed;')();
const {sweep,advance}=new Function(cut('function foGrenadeSweep(','      function throwGrenade(')+';return {sweep:foGrenadeSweep,advance:foAdvanceGrenade};')();
const release=new Function(cut('function foReleaseEquipment(','      function clearAllMatchEntities(')+';return foReleaseEquipment;')();
const bomb=new Function(cut('const FO_BOMB_RULES=','      function foBombActors(')+';return stepFoBomb;')();
let n=0;const ok=(x,m)=>{assert(x,m);n++};
const vec=(x,y,z)=>({x,y,z,addScaledVector(v,t){this.x+=v.x*t;this.y+=v.y*t;this.z+=v.z*t;return this;}});
for(const fps of [5,10,15,20,30,60,144]){
 let sum=0,state={phase:'planted',seconds:35};
 for(let i=0;i<fps*10;i++){const real=elapsed(1/fps,false,false);sum+=real;bomb(state,Math.min(.05,1/fps),100,6,6,null,real);}
 ok(Math.abs(sum-10)<1e-8,'foreground elapsed '+fps);
 ok(Math.abs(state.seconds-25)<1e-8,'planted countdown '+fps);
}
for(const x of [-1,0,NaN,Infinity])ok(elapsed(x,false,false)===0,'invalid delta');
ok(elapsed(30,true,false)===0&&elapsed(30,false,true)===0,'hidden / resume');
const site={id:'A'},actor={id:'blue_1',site},state={phase:'unplanted',seconds:0,progress:0};
bomb(state,.05,100,6,6,actor,.2);
ok(state.progress===.05,'interaction duration stays on simulation step');
const wall={minX:0,maxX:.08,minY:0,maxY:5,minZ:-10,maxZ:10};
for(const direction of [-1,1])for(const speed of [1,10,17.5,50,200])for(const dt of [.001,.016,.05]){
 const x=direction>0?-.12:.20,g={pos:vec(x,2,0),vel:vec(speed*direction,0,0)};
 advance(g,dt,[wall],()=>0);
 ok(direction>0?g.pos.x<=-.085+1e-8:g.pos.x>=.165-1e-8,'no crossing');
}
const launch=sweep(vec(-.3,2,0),.55,0,0,[wall]);
ok(launch&&launch.nx===-1&&launch.t>0&&launch.t<1,'launch offset blocked');
const floor={minX:-5,maxX:5,minY:1,maxY:1.1,minZ:-5,maxZ:5};
const fall={pos:vec(0,1.4,0),vel:vec(0,-20,0)};advance(fall,.05,[floor],()=>1.1);ok(fall.pos.y>=1.185-1e-8&&fall.vel.y>0,'upper deck');
const ceiling={minX:-5,maxX:5,minY:2,maxY:2.1,minZ:-5,maxZ:5};
const rise={pos:vec(0,1.8,0),vel:vec(0,20,0)};advance(rise,.05,[ceiling],()=>0);ok(rise.pos.y<1.915&&rise.vel.y<0,'ceiling');
const clear={pos:vec(0,2,0),vel:vec(2,0,3)};advance(clear,.05,[],()=>0);
ok(Math.abs(clear.pos.x-.1)<1e-10&&Math.abs(clear.pos.z-.15)<1e-10&&Math.abs(clear.pos.y-1.955)<1e-10,'clear path unchanged');
let geos=0,mats=0,shared=0,removes=0;
for(let i=0;i<1000;i++){
 const geo={dispose(){geos++}},mat={dispose(){mats++}},sharedMat={dispose(){shared++}};
 const e={mesh:{traverse(fn){fn({geometry:geo,material:mat});fn({geometry:geo,material:sharedMat})}},ownedMaterials:[mat,mat]};
 const scene={remove(){removes++}};release(e,scene);release(e,scene);
}
ok(geos===1000&&mats===1000&&shared===0&&removes===1000,'owned resources once; shared preserved');
for(const [name,list] of [['g','activeGrenades'],['r','activeRockets'],['mk','activeMedkits'],['cm','activeClaymores']])
 ok(html.includes('foReleaseEquipment('+name+',scene);\n            '+list+'.splice(i, 1);'),'live cleanup '+list);
ok(html.includes('foReleaseEquipment(list[i],scene)'),'restart cleanup');
ok(html.includes('updateFoBomb(dt,clockDt);')&&html.includes('matchState.timeRemaining - clockDt'),'live clocks');
ok(html.includes('updateBots(dt);')&&html.includes('botAiClockSec += dt;'),'AI step preserved');
ok(html.includes('foAdvanceGrenade(g,dt,mapColliders,getFloorHeightAt);'),'live grenade contact');
console.log('Critical fixes PASS:',n,'checks; 1000 mock cleanup cycles; no real WebGL/FPS claim.');
