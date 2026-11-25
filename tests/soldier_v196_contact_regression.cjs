'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const a=html.indexOf('      function botVisualLegContact('),b=html.indexOf('      function botVisualCombatPose(',a);
const {contact,direction}=new Function(html.slice(a,b)+'\nreturn {contact:botVisualLegContact,direction:botVisualDirection};')();
const height=(hip,knee)=>-.37*Math.cos(hip)-.36*Math.cos(hip+knee);
const standing=contact(0,0,0,0,1);
assert(Math.abs(height(standing.hip,standing.knee)+.73)<.01);
const crouch=contact(0,.45,.32,0,1);
assert(height(crouch.hip,crouch.knee)>height(0,.45)+.19);
const step=contact(0,.45,.2,.08,1);
assert(height(step.hip,step.knee)>height(crouch.hip,crouch.knee)-.07);
assert.deepEqual(contact(.3,.4,0,0,0),{hip:.3,knee:.4,foot:0});
for(const h of [-.8,0,.7])for(const k of [0,.7,1.4])for(const c of [0,.16,.32])for(const d of [-.1,0,.1]){
 const p=contact(h,k,c,d,.7);assert(Object.values(p).every(Number.isFinite));assert(Math.abs(p.foot)<=.48);
}
let dir=direction({forward:1,side:0},-1,1,1/60);assert(dir.forward<1&&dir.forward>-1&&dir.side>0&&dir.side<1);
for(let i=0;i<60;i++)dir=direction(dir,-1,1,1/60);
assert(dir.forward<-.99&&dir.side>.99);
console.log('V189–196 contact and directional smoothing PASS');
