// V291 checks the integrated game, not only the prototype.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const old=process.env.FO_V287_BASELINE?fs.readFileSync(process.env.FO_V287_BASELINE,'utf8'):execFileSync('git',['show','a34c2ca958379b0023b0ee0418b40d01daeced61:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const cut=s=>{const a=s.indexOf("      function botVisualGait("),b=s.indexOf("      // V58: derive map awareness",a);if(a<0||b<a)throw Error("anchor");return {pre:s.slice(0,a),body:s.slice(a,b),post:s.slice(b)}};
const a=cut(old),b=cut(html);
assert.equal(a.pre,b.pre,'protected prefix changed');
assert.equal(a.post,b.post.replace("const gait=botVisualGaitV291(bot.visualGaitPhase,visualMotion.speed,pose.forward,pose.side,bot.crouchAmt,bot.classId);","const gait=botVisualGait(bot.visualGaitPhase,visualMotion.speed,pose.forward,pose.side,bot.crouchAmt,bot.classId);"),'protected suffix changed');
assert(b.body.startsWith(a.body),'historical V103 gait changed');
assert.equal(b.post.split("const gait=botVisualGaitV291(bot.visualGaitPhase,visualMotion.speed,pose.forward,pose.side,bot.crouchAmt,bot.classId);").length,2,'expected exactly one live V291 gait call');
const baseline=new Function(a.body+';return botVisualGait;')();
const live=new Function(b.body+';return botVisualGaitV291;')();
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
const count=verify(baseline,(_base,p,s,f,side,c,r)=>live(p,s,f,side,c,r));
assert.equal(count,28800);
let parity=0;
for(const role of ['assault','medic','engineer','sniper','heavy'])
 for(const speed of [0,.4,1.4,3,5.1,7])
  for(const c of [0,.5,1])
   for(let i=0;i<64;i++)
    for(const [f,s] of [[1,0],[-1,0],[0,1],[0,-1],[.707,.707],[-.707,.707],[0,0]]){
      const p=i*Math.PI/32,v=live(p,speed,f,s,c,role),w=directionalGait(baseline(p,speed,f,s,c,role),p,speed,f,s,c,role);
      assert(Object.keys(v).every(k=>Math.abs(v[k]-w[k])<=1e-10),'candidate mismatch');parity++;
    }
assert.equal(parity,40320);
console.log('V291 PASS:',count,'assertions;',parity,'integrated pose comparisons; all source outside gait identical.');
