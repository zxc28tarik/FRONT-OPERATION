'use strict';
// V38 isolated, deterministic team AI test. No browser or network dependency.
function runBotAiV38Regression(html) {
 const checks=[],ok=(value,label)=>{if(!value)throw Error('V38 FAIL: '+label);checks.push(label)};
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 scripts.forEach(x=>new Function(x[1]));ok(scripts.length===3,'All three original scripts parse');
 const begin=html.indexOf('      const TEAM_INTEL = {'),end=html.indexOf('      function getLaneFromX(',begin);
 if(begin<0||end<begin)throw Error('Team tactical module not found');
 const src=html.slice(begin,end);
 class Vec3{
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
  clone(){return new Vec3(this.x,this.y,this.z)}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z)}
 }
 const bots=[
  {id:'blue_0',team:'blue',classId:'assault',hp:100,alive:true,pos:new Vec3(),visibleEnemy:{id:'red_0'},
   teamFlankTargetId:null,teamFlankThreatAnchor:null,teamFlankGoalNode:-1,teamFlankRoute:[],
   teamFlankPathIndex:0,teamFlankCommitUntil:0,teamFlankRestUntil:0},
  {id:'blue_1',team:'blue',classId:'heavy',hp:100,alive:true,pos:new Vec3(1,0,0)},
  {id:'blue_2',team:'blue',classId:'medic',hp:100,alive:true,pos:new Vec3(-1,0,0)},
  {id:'blue_3',team:'blue',classId:'sniper',hp:100,alive:true,pos:new Vec3(-5,0,-3)},
  {id:'blue_4',team:'blue',classId:'engineer',hp:100,alive:true,pos:new Vec3(-4,0,3)},
  {id:'red_0',team:'red',classId:'assault',hp:100,alive:true,pos:new Vec3(0,0,25)},
  {id:'red_1',team:'red',classId:'assault',hp:100,alive:true,pos:new Vec3(1,0,25)}
 ];
 const nav=[{x:0,y:0,z:0},{x:0,y:0,z:6},{x:9,y:0,z:13},
  {x:-9,y:0,z:13},{x:0,y:0,z:20}];
 const player={team:'blue',alive:true,pos:new Vec3(0,0,-5)};
 let free=true,los=true,unreachable=false,paths=0;
 const alive=id=>id==='player'?player.alive:bots.some(x=>x.id===id&&x.alive);
 const api=new Function('THREE','bots','player','NAV_NODES','isEntityStillAlive',
  'hasLineOfSight','isPositionWalkable','findNearestNavNode','findPathAStar','droneSystem',
  src+'\nreturn {TEAM_INTEL,TEAM_TACTICS,resetTeamIntel,reportTeamVisualSighting,'+
  'refreshTeamBattlePlans,findTeamFlankRoute,getTeamFlankWaypoint,getTeamPinningOpportunity,'+
  'setClock:(t)=>{botAiClockSec=t},clock:()=>botAiClockSec};')(
  {Vector3:Vec3},bots,player,nav,alive,()=>los,()=>free,()=>0,
  (start,goal)=>{paths++;return unreachable?[]:[start,1,goal]},
  {clearDeadTargetSpots:()=>{}});
 const flank=bots[0],heavy=bots[1];
 api.resetTeamIntel();
 ok(api.clock()===0&&api.TEAM_TACTICS.blue.focusId===null,'New match clears tactical focus');
 api.refreshTeamBattlePlans(0);
 ok(bots.filter(x=>x.team==='blue'&&x.teamRole==='FLANK').length===1,
   'One healthy assault becomes flanker for 5-bot team');
 ok(heavy.teamRole==='PIN'&&bots[2].teamRole==='SUPPORT',
   'Heavy pins and medic supports');
 ok(bots[3].teamRole==='OVERWATCH'&&bots[4].teamRole==='RECON',
   'Sniper overwatch and engineer recon roles preserved');
 ok(bots[5].teamRole==='FLANK'&&bots[6].teamRole==='POINT',
   'Second assault soldier does not duplicate an existing flank assignment');
 ok(api.TEAM_TACTICS.blue.focusId===null,'Team roles never imply omniscient target knowledge');
 api.setClock(.5);
 api.reportTeamVisualSighting('blue',0,'blue_4','red_0',new Vec3(0,0,25));
 api.refreshTeamBattlePlans(.76);
 ok(api.TEAM_TACTICS.blue.focusId==='red_0'&&api.TEAM_TACTICS.blue.focusPos.z===25,
   'Fresh, verified report creates a shared tactical focus');
 bots[5].pos.z=48;
 ok(api.TEAM_TACTICS.blue.focusPos.z===25,'Hidden moving enemy cannot alter frozen tactical location');
 ok(api.getTeamPinningOpportunity(heavy,new Vec3(1,1.45,0),.9)?.threatId==='red_0',
   'Heavy pinning uses teammate-reported enemy position');
 los=false;
 ok(api.getTeamPinningOpportunity(heavy,new Vec3(1,1.45,0),.9)===null,
   'Pinning never fires through occluded geometry');
 los=true;
 ok(api.getTeamPinningOpportunity(heavy,new Vec3(1,1.45,0),2.5)===null,
   'Old enemy sightings cannot cause perpetual suppressing fire');
 api.setClock(1.55);
 api.reportTeamVisualSighting('blue',0,'blue_4','red_0',new Vec3(0,0,25));
 api.refreshTeamBattlePlans(1.56);
 let wp=api.getTeamFlankWaypoint(flank,1.56);
 ok(wp&&wp.z===6&&flank.teamFlankGoalNode>=0,
   'Flanker navigates toward an accessible flank by A-star waypoints');
 const selected=flank.teamFlankGoalNode,calls=paths;
 wp=api.getTeamFlankWaypoint(flank,1.65);
 ok(wp?.z===6&&paths===calls,'Flanking route is stable across successive game frames');
 ok(Math.abs(nav[selected].x)>=9,'Chosen destination is offset from direct attack centerline');
 flank.pos.z=6;
 wp=api.getTeamFlankWaypoint(flank,1.70);
 ok(wp?.x===nav[selected].x&&wp?.z===nav[selected].z,
   'Flanker progresses to next waypoint');
 flank.pos.x=nav[selected].x;flank.pos.z=nav[selected].z;
 wp=api.getTeamFlankWaypoint(flank,1.75);
 ok(wp===null&&flank.teamFlankGoalNode===-1&&flank.teamFlankRestUntil>3.5,
   'Completed flank begins cooldown rather than oscillating');
 const reachedCalls=paths;
 ok(api.getTeamFlankWaypoint(flank,1.9)===null&&paths===reachedCalls,
   'Cooldown blocks immediately reselecting the same flank');
 flank.pos.x=0;flank.pos.z=0;flank.teamFlankRestUntil=0;flank.teamFlankGoalNode=-1;
 free=false;
 ok(api.findTeamFlankRoute(flank,new Vec3(0,0,25))===null,
   'Invalid map geometry blocks flank orders');
 free=true;unreachable=true;
 ok(api.findTeamFlankRoute(flank,new Vec3(0,0,25))===null,
   'Missing A-star route blocks flank orders');
 unreachable=false;flank.hp=30;
 ok(api.getTeamFlankWaypoint(flank,2.0)===null,
   'Wounded flanker gives priority to survival');
 flank.hp=100;flank.visibleEnemy=null;
 ok(api.getTeamFlankWaypoint(flank,2.0)===null,
   'Invisible target cannot cause current-position precision flanking');
 flank.visibleEnemy={id:'red_0'};
 api.setClock(2.32);
 api.reportTeamVisualSighting('blue',0,'blue_4','red_1',new Vec3(1,0,25));
 api.TEAM_TACTICS.blue.lockedUntil=2.9;
 api.refreshTeamBattlePlans(2.38);
 ok(api.TEAM_TACTICS.blue.focusId==='red_0',
   'Focus commitment prevents rapid target changes on another report');
 api.refreshTeamBattlePlans(3.20);
 ok(api.TEAM_TACTICS.blue.focusId==='red_1',
   'Newer verified target accepted once focus lock expires');
 api.refreshTeamBattlePlans(6);
 ok(api.TEAM_TACTICS.blue.focusId===null,
   'Expired team intelligence clears coordinated target');
 bots[5].alive=false;
 api.resetTeamIntel();
 api.reportTeamVisualSighting('blue',0,'blue_4','red_0',new Vec3(0,0,25));
 ok(!Object.keys(api.TEAM_INTEL.blue.sightings).length,
   'Dead enemies are never reported as active objectives');
 api.reportTeamVisualSighting('blue',0,'blue_4','blue_1',new Vec3(0,0,3));
 ok(!Object.keys(api.TEAM_INTEL.blue.sightings).length,
   'Teammates cannot become an enemy tactical objective');
 ok(!src.includes('getLiveEntitySnapshot(')&&!src.includes('getCurrentWeapon('),
   'Tactical module cannot read unseen enemy snapshots or player weapon state');
 ok(html.includes('refreshTeamBattlePlans(nowSec);')&&
   html.includes('getTeamFlankWaypoint(bot, nowSec)'),
   'Main game update loop executes team tactics and flank navigation');
 ok(html.includes('getTeamPinningOpportunity(bot, botEyeNoTarget, nowSec)'),
   'Team pinning integrates with existing covering-fire branch');
 ok(html.includes('bot.teamFlankGoalNode >= 0 ? bot.teamFlankGoalNode'),
   'Recovery system respects flank navigation mission');
 ok(html.includes('const wantsTacticalCover = !(bot.teamRole === \'FLANK\'')&&
   html.includes('obstructedWp = bot.teamFlankGoalNode >= 0'),
   'Flank movement suppresses repeated cover search and uses correct blocked waypoint');
 ok((html.match(/teamFlankGoalNode: -1,/g)||[]).length===2&&
   html.includes('bot.teamFlankRestUntil = 0;'),
   'Both team spawns and respawns reset role navigation');
 ok(html.includes('aimSettleSec: 0.34')&&html.includes('return index % 15 === 14'),
   'Approved medium aim and expert-on-15th distribution preserved');
 return checks;
}
module.exports={runBotAiV38Regression};
if(require.main===module){
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 const tests=runBotAiV38Regression(html);
 console.log('BOT AI V38 PASS ('+tests.length+' checks)');
 tests.forEach(label=>console.log('  ✓ '+label));
}
