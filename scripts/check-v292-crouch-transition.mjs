// V292 integrated presentation regression.
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const cut=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i+a.length);if(i<0||j<=i)throw Error(a);return s.slice(i,j);};
const gait=new Function(cut(html,'function botVisualGait(','// V58: derive map awareness')+';return botVisualGaitV291;')();
const contact=new Function(cut(html,'function botVisualLegContact(','function botVisualDirection(')+';return botVisualLegContact;')();
function crouchPresentation(pose,crouch,speed,role){
 const c=Math.max(0,Math.min(1,Number.isFinite(crouch)?crouch:0));
 const moving=Math.max(0,Math.min(1,(Number.isFinite(speed)?speed:0)/2.8));
 // Zero at both established end poses; ease in/out with zero endpoint slope.
 const envelope=16*c*c*(1-c)*(1-c);
 const weight=role==='heavy'?.85:role==='sniper'?.94:1;
 const flex=envelope*(.14-.055*moving)*weight;
 const spread=envelope*.022*(1-.55*moving)*weight;
 return {leftHip:pose.leftHip-flex*.5,rightHip:pose.rightHip-flex*.5,
  leftKnee:pose.leftKnee+flex,rightKnee:pose.rightKnee+flex,
  leftSide:pose.leftSide-spread,rightSide:pose.rightSide+spread};
}
function verify(gait,candidate,contact){
 let checks=0,poses=0,maxCorrection=0,maxContactDelta=0;
 const assert=(x,m)=>{if(!x)throw Error(m);checks++};
 const keys=['leftHip','rightHip','leftKnee','rightKnee','leftSide','rightSide'];
 for(const role of ['assault','medic','engineer','sniper','heavy'])
 for(const speed of [0,.4,1.4,2.8,5.1,7])
 for(const [forward,side] of [[1,0],[-1,0],[0,-1],[0,1],[.707,.707],[0,0]])
 for(let phase=0;phase<Math.PI*2-.01;phase+=Math.PI/8){
  let prev=null;
  for(let i=0;i<=40;i++){
   const c=i/40,base=gait(phase,speed,forward,side,c,role);
   const result=candidate(base,c,speed,role);
   poses++;
   assert(keys.every(k=>Number.isFinite(result[k])&&Math.abs(result[k])<1.7),'nonfinite or excessive joint');
   assert(result.leftKnee>=0&&result.rightKnee>=0,'inverted knee');
   assert(result.leftSide<=base.leftSide+1e-12&&result.rightSide>=base.rightSide-1e-12,'stance must not narrow');
   if(i===0||i===40)assert(keys.every(k=>Math.abs(result[k]-base[k])<1e-12),'endpoints changed');
   const correction=keys.map(k=>result[k]-base[k]);
   maxCorrection=Math.max(maxCorrection,...correction.map(Math.abs));
   if(prev)assert(correction.every((v,k)=>Math.abs(v-prev[k])<.012),'pose correction discontinuity');
   prev=correction;
   for(const [h,k] of [['leftHip','leftKnee'],['rightHip','rightKnee']]){
    const a=contact(base[h],base[k],c*.32,0,.62);
    const b=contact(result[h],result[k],c*.32,0,.62);
    assert([b.hip,b.knee,b.foot].every(Number.isFinite),'contact correction invalid');
    const delta=Math.max(Math.abs(a.hip-b.hip),Math.abs(a.knee-b.knee),Math.abs(a.foot-b.foot));
    assert(delta<=.2,'excessive contact correction');
    maxContactDelta=Math.max(maxContactDelta,delta);
   }
  }
 }
 return {checks,poses,maxCorrection,maxContactDelta};
}
const live=new Function(cut(html,'function botVisualCrouchV292(','// V58: derive map awareness')+';return botVisualCrouchV292;')();
let parity=0;
const candidate=(p,c,s,r)=>{
 const {flex,spread}=live(c,s,r);
 const v={leftHip:p.leftHip-flex*.5,rightHip:p.rightHip-flex*.5,leftKnee:p.leftKnee+flex,rightKnee:p.rightKnee+flex,leftSide:p.leftSide-spread,rightSide:p.rightSide+spread};
 const w=crouchPresentation(p,c,s,r);
 if(Object.keys(v).some(k=>Math.abs(v[k]-w[k])>1e-12))throw Error('prototype parity');
 parity++;return v;
};
const report=verify(gait,candidate,contact);
if(report.poses!==118080||report.checks!==947520||parity!==118080)throw Error('coverage changed');
if(!html.includes('const crouchPose=botVisualCrouchV292(bot.crouchAmt,actualSpeed,bot.classId);'))throw Error('live call missing');
console.log(JSON.stringify({...report,parity},null,2));
