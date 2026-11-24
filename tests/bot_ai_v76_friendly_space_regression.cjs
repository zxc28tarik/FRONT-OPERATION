'use strict';
const fs=require('node:fs'),html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const directSrc=html.slice(html.indexOf('      // V44: A clear eye-level sightline'),html.indexOf('      // Patient affinity prevents rapid medic destination switches.'));
const a=html.indexOf('      // V57: distinguish the active route'),b=html.indexOf('      // V47: Do not replace a distant cover destination',a);
class Vector3{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}}
const nodes=[new Vector3(0,0,0),new Vector3(0,0,2),new Vector3(2,0,0),new Vector3(0,0,10)];
const self={id:'blue_0',team:'blue',alive:true,pos:new Vector3(),strafeDir:1,path:[],pathIndex:0,rallyGoalNode:-1,rallyRetryCooldown:0};
const ally={id:'blue_1',team:'blue',alive:true,pos:new Vector3(0,0,2),path:[],pathIndex:0};
let walk=()=>true,visible=()=>true,path=[0,2,3],calls=0;
const api=new Function('THREE','NAV_NODES','bots','player','isPositionWalkable','hasLineOfSight','findNearestNavNode','findPathAStar',
directSrc+'\n'+html.slice(a,b)+'\nreturn {passage:inspectBotPassage,rally:selectBotRallyWaypoint};')({Vector3},nodes,[self,ally],{alive:false},(...p)=>walk(...p),(...p)=>visible(...p),p=>p.z>5?3:0,()=>{calls++;return path.slice()});
let n=0;const ok=(v,s)=>{if(!v)throw Error('V76 '+s);n++};
const destination=nodes[3];
ok(api.passage(self,destination,5)?.mode==='sidestep','Real shared-space blocker still handled');
walk=(x,y,z)=>!(z>.8&&z<1.3&&Math.abs(x)<.4);
ok(api.passage(self,destination,5)===null,'Walkable endpoints separated by wall do not create false traffic');
const routed=api.rally(self,destination);
ok(routed!==destination&&routed?.x===2,'Eye-visible but body-blocked rally uses A-star');
const before=calls;api.rally(self,destination);ok(calls===before,'Rally route retained');
self.rallyGoalNode=-1;path=[3];ok(api.rally(self,destination)===null,'Blocked singleton route rejected');
walk=()=>true;ok(api.rally(self,destination)===destination,'Clear body and eye path direct');
walk=()=>false;ok(api.passage(self,destination,5)?.mode==='yield','Invalid endpoint keeps conservative handling');
walk=()=>true;ally.pos.y=3;ok(api.passage(self,destination,5)===null,'Other floor excluded');
ally.pos.y=0;ally.team='red';ok(api.passage(self,destination,5)===null,'Opposing team not friendly blocker');
ally.team='blue';ally.alive=false;ok(api.passage(self,destination,5)===null,'Inactive actor excluded');
ok(self.pos.x===0&&self.pos.z===0,'Queries never move actor');
console.log('BOT AI V76 SHARED SPACE PASS ('+n+' checks)');
