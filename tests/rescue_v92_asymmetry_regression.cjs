'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const a=html.indexOf('      const FO_RESCUE_POINTS='),b=html.indexOf('      function selectFoMap(mode)',a);
const solids=[];const mesh=()=>({position:{set(){}},visible:true});
const three=new Proxy({}, {get:()=>function(){return {}}});
const sniper=new Function('THREE','makeProceduralTextureSet','addSolidBox','addDecoMesh','dustParticles','installFoGraph',html.slice(a,b)+'\nbuildFoPrisonMap();return FO_RESCUE_SNIPER;')(three,()=>({}),(x,y,z,w,h,d)=>{solids.push({x,y,z,w,h,d});return mesh()},()=>mesh(),null,()=>{});
const walk=(x,z)=>!solids.some(c=>1.6>c.y-c.h/2+.05&&0<c.y+c.h/2-.25&&x+.48>c.x-c.w/2&&x-.48<c.x+c.w/2&&z+.48>c.z-c.d/2&&z-.48<c.z+c.d/2);
const clear=(x,z,X,Z)=>!solids.some(c=>{
 if(c.y-c.h/2>=1.48||c.y+c.h/2<=1.48)return false;
 let lo=0,hi=1;
 for(const [p,q,m,M] of [[x,X,c.x-c.w/2,c.x+c.w/2],[z,Z,c.z-c.d/2,c.z+c.d/2]]){
  const v=q-p;if(Math.abs(v)<1e-8){if(p<m||p>M)return false;}
  else{const t1=(m-p)/v,t2=(M-p)/v;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false;}
 }
 return lo<=hi;
});
function sample(xmin,xmax,zmin,zmax,srcs){let n=0,seen=0;for(let x=xmin;x<=xmax;x++)for(let z=zmin;z<=zmax;z++){if(!walk(x,z))continue;n++;if(srcs.some(([a,b])=>clear(a,b,x,z)))seen++;}return seen/n;}
const left=[[-18,-36],[-24,-36],[-12,-36]],right=[[18,-36],[14,-36],[sniper.x,sniper.z]];
const mid=sample(-36,-12,-15,22,left),near=sample(-36,-12,-26,-18,left),east=sample(12,30,-26,-18,right),window=sample(10,30,-12,20,[[sniper.x,sniper.z]]);
assert(mid<.2&&near>.5&&east<.35&&east<near);
assert(window>.02&&window<.12);
assert(walk(sniper.x,sniper.z));
assert(html.includes("bot.classId==='sniper'&&live.some(p=>!p.carrier)?FO_RESCUE_SNIPER"));
console.log('V92 ASYMMETRY PASS: left mid '+mid.toFixed(3)+', left near '+near.toFixed(3)+', right near '+east.toFixed(3)+', narrow window '+window.toFixed(3));
