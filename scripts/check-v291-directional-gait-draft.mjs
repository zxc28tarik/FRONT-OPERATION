// C4 / V291 candidate; intentionally not wired into the live game.
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const start=html.indexOf('function botVisualGait(');
const end=html.indexOf('// V58: derive map awareness',start);
if(start<0||end<0)throw Error('baseline gait anchors missing');
const baseline=new Function(html.slice(start,end)+';return botVisualGait;')();
function directionalGait(base,phase,speed,forward,side,crouch,role){
  const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:0));
  const f=clamp(forward,-1,1),s=clamp(side,-1,1),c=clamp(crouch);
  const motion=clamp(speed/.9),run=clamp((speed-2.1)/3);
  const load=role==='heavy'?.86:role==='sniper'?.94:1;
  const back=Math.max(0,-f),lateral=Math.abs(s);
  const wave=Math.sin(phase),quadrature=Math.cos(phase);
  const stride=(.20+.38*run)*load*(1-.45*c)*motion;
  const swingL=Math.max(0,-wave),swingR=Math.max(0,wave);
  // Candidate only: shorter backwards reach and asymmetric lead/trail side step.
  // Keep all outputs as local pose angles; no position, yaw, timing or AI writes.
  const sideReach=s*stride*.12, sideOpen=lateral*stride*.13;
  const sideLift=lateral*motion*load*(1-.35*c)*(.07+.04*run);
  return {...base,
    leftHip:base.leftHip+wave*stride*back*.20,
    rightHip:base.rightHip-wave*stride*back*.20,
    leftSide:base.leftSide+sideReach*(.5+.5*wave)-sideOpen,
    rightSide:base.rightSide+sideReach*(.5-.5*wave)+sideOpen,
    leftKnee:base.leftKnee+back*motion*load*(1-c*.4)*swingL*.06+sideLift*Math.max(0,-quadrature),
    rightKnee:base.rightKnee+back*motion*load*(1-c*.4)*swingR*.06+sideLift*Math.max(0,quadrature)
  };
}
function verify(baseline,candidate){
  let n=0;
  const ok=(v,msg)=>{if(!v)throw Error(msg);n++};
  const near=(a,b)=>Math.abs(a-b)<1e-9;
  const keys=['leftHip','rightHip','leftSide','rightSide','leftKnee','rightKnee'];
  for(const role of ['assault','medic','engineer','sniper','heavy'])
    for(const speed of [0,.4,1.4,3,5.1,7])
      for(const c of [0,.5,1])
        for(let i=0;i<32;i++){
          const phase=i*Math.PI/16;
          const evalPose=(f,s,p=phase)=>{const b=baseline(p,speed,f,s,c,role);return candidate(b,p,speed,f,s,c,role)};
          const front=evalPose(1,0),old=baseline(phase,speed,1,0,c,role);
          ok(keys.every(k=>near(front[k],old[k])),'forward preservation');
          for(const [f,s] of [[0,-1],[0,1],[-1,0],[-.707,.707],[.707,-.707],[0,0]]){
            const v=evalPose(f,s);
            ok(keys.every(k=>Number.isFinite(v[k])&&Math.abs(v[k])<1.5),'bounded finite local pose');
            if(speed===0)ok(keys.every(k=>near(v[k],baseline(phase,speed,f,s,c,role)[k])),'stationary preservation');
          }
          const l=evalPose(0,-1),r=evalPose(0,1,phase+Math.PI);
          ok(near(l.leftSide,-r.rightSide)&&near(l.rightSide,-r.leftSide)&&near(l.leftKnee,r.rightKnee)&&near(l.rightKnee,r.leftKnee),'mirror symmetry');
          const b=evalPose(-1,0);
          ok(Math.abs(b.leftHip)<=Math.abs(baseline(phase,speed,-1,0,c,role).leftHip)+1e-9,'reverse stride bounded');
        }
  return n;
}
console.log('C4 isolated directional gait assertions:',verify(baseline,directionalGait));
