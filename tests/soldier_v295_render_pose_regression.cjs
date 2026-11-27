'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      // V289/V290/V293/V294/V295:'),b=html.indexOf('      function animate(now)',a);
assert(a>=0&&b>a);
const api=new Function(html.slice(a,b)+';return {pose:foC295Pose,detail:foC295Detail,begin:beginFoC295Render,restore:restoreFoC295Render};')();
const roles=['assault','medic','engineer','sniper','heavy'];let n=0;
const ok=(v,m)=>{assert(v,m);n++;};
for(const role of roles)for(const speed of [0,.4,.8,1.2,2.1,2.8,3.5,4.5,5.1,6.8])for(const c of [0,.5,1])for(const turn of [-1,0,1])for(const death of [0,.25,.5,.75,1])for(let i=0;i<32;i++){
 const args=[i*Math.PI/16,speed,1,0,c,turn,.7,.3,role,.5,death];
 const p=api.pose(...args,1),z=api.pose(...args,0);
 ok(Object.values(p).every(v=>Number.isFinite(v)&&Math.abs(v)<.15),'bounded joint correction');
 ok(Object.values(z).every(v=>v===0),'far LOD zero');
 if(death===1)ok(Object.values(p).every(v=>v===0),'death end');
}
for(const role of roles)for(const speed of [.8,1.8,3,5,6.8]){
 const args=[Math.PI/4,speed,1,0,0,.5,.4,.6,role,.5];
 const p=api.pose(...args,0,1);
 let prev=p;
 for(let i=1;i<=100;i++){
  const q=api.pose(...args,i/100,1);
  ok(Object.keys(q).every(k=>Math.abs(q[k]-prev[k])<.005),'death continuous');prev=q;
 }
}
for(const role of roles){
 const p=api.pose(Math.PI/3,1.5,1,0,0,0,0,0,role,0,0,1),q=api.pose(Math.PI/3,5.5,1,0,0,0,0,0,role,0,0,1);
 ok(Math.abs(q.leftHip)>Math.abs(p.leftHip),'run differs from walk');
 const left=api.pose(0,0,0,0,0,-1,1,1,role,0,0,1),right=api.pose(0,0,0,0,0,1,1,1,role,0,0,1);
 ok(left.leftSide<0&&right.rightSide>0&&left.torso===-right.torso,'turn support and balance');
}
let prev=1;for(let d=0;d<=60;d+=.1){const x=api.detail(d,0);ok(x>=0&&x<=prev+1e-12,'LOD smooth monotone');prev=x;}
ok(api.detail(5,2)===0&&api.detail(40,0)===0,'far gating');
const node=(name='',userData={})=>({name,userData,rotation:{x:.1,y:.2,z:.3},children:[]});
const mesh={root:node(),upperBody:node(),head:node(),weaponPivot:node(),muzzleFlash:node(),leftHip:node(),rightHip:node(),leftKnee:node(),rightKnee:node(),visualDetailLevel:0};
mesh.root.visible=true;
mesh.leftKnee.children.push(node('v132_ankle'));mesh.rightKnee.children.push(node('v132_ankle'));
mesh.upperBody.children.push(mesh.head,mesh.weaponPivot,node('v105_role_vest'),node('',{v149Pack:true}),node('',{v176Equipment:'pouch'}));
const actor={alive:true,dying:false,mesh,pos:{x:0,y:0,z:0},classId:'assault',visualGaitPhase:Math.PI/3,visualTransition:{speed:4},visualDirection:{forward:1,side:0},visualFootPlants:{left:.6,right:.4,turn:.4},crouchAmt:0,visualCarry:.5};
const cam={position:{x:0,y:2,z:5},fov:74,zoom:1};
const original=JSON.stringify(actor);
const protectedNodes=()=>JSON.stringify([mesh.root,mesh.upperBody.rotation,mesh.head,mesh.weaponPivot,mesh.muzzleFlash]);
const before=protectedNodes();
for(let i=0;i<100;i++){
 try{api.begin([actor],cam);ok(JSON.stringify(actor)!==original,'real local pose applied');ok(protectedNodes()===before,'protected nodes stable');}
 finally{api.restore();}
 ok(JSON.stringify(actor)===original,'exact restore');
}
mesh.visualDetailLevel=2;const far=JSON.stringify(actor);api.begin([actor],cam);ok(JSON.stringify(actor)===far,'far unchanged');api.restore();
mesh.visualDetailLevel=0;actor.experimentalRigController={};const exp=JSON.stringify(actor);api.begin([actor],cam);ok(JSON.stringify(actor)===exp,'experimental rig unchanged');api.restore();
ok(html.includes('if(matchState.started)beginFoC295Render(bots,camera);'),'live hook');
ok(html.includes('restoreFoC295Render();\n          restoreV287RenderPose(vmRefs);'),'finally hook');
console.log('C295 PASS:',n,'numeric, continuity, LOD and reversible pose checks.');
