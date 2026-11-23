'use strict';
// V39 deterministic sound/hearing behavior tests. No browser dependency.
function runBotAiV39Regression(html) {
  const results=[],check=(v,label)=>{if(!v)throw Error('V39 FAIL: '+label);results.push(label)};
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  scripts.forEach(m=>new Function(m[1]));check(scripts.length===3,'Three embedded scripts parse');
  const begin=html.indexOf('      // V39: Acoustic suspicion.');
  const end=html.indexOf('      function updateBots(dt) {',begin);
  if(begin<0||end<=begin)throw Error('V39 acoustic helper section missing');
  const source=html.slice(begin,end);
  class V{
    constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
    clone(){return new V(this.x,this.y,this.z)}
    copy(p){this.x=p.x;this.y=p.y;this.z=p.z;return this}
    distanceTo(p){return Math.hypot(this.x-p.x,this.y-p.y,this.z-p.z)}
  }
  const matchState={started:false,ended:false},fakeMath=Object.create(Math);
  fakeMath.random=()=>.25;
  let vision=true,walkable=true,blocked=false,paths=0;
  const nav=[{x:0,y:0,z:0},{x:4,y:0,z:5},{x:10,y:0,z:12}];
  const m=new Function('THREE','Math','matchState','hasLineOfSight',
    'isPositionWalkable','findNearestNavNode','findPathAStar','NAV_NODES','botAiClockSec',
    source+'\nreturn {events:BOT_NOISE_EVENTS,reset:resetBotNoiseEvents,'+
    'resetHearing:resetBotHearing,emit:emitBotNoise,hear:considerBotHeardNoise,'+
    'route:getBotHearingWaypoint,setTime:(n)=>botAiClockSec=n};')(
    {Vector3:V},fakeMath,matchState,()=>vision,()=>walkable,
    p=>p.x>=8?2:0,(start,goal)=>{paths++;return blocked?[goal]:[start,1,goal]},nav,0
  );
  const fresh=()=>({id:'blue_0',team:'blue',pos:new V(),classId:'assault',hp:100,
    visibleEnemy:null,lastKnownEnemyPos:null,investigateTimer:0,
    hearingLastNoiseId:0,hearingScanCooldown:0,hearingCommitUntil:0,hearingTimer:0,
    hearingPos:null,hearingKind:null,hearingSourceId:null,hearingGoalNode:-1,
    hearingRoute:[],hearingRouteIndex:0});
  const emit=(type='gun',distance=15,team='red',id='red_0',height=0)=>
    m.emit(team,new V(0,height,distance),type,id);
  let b=fresh();
  check(!emit(),'No events outside active matches');
  matchState.started=true;
  check(!emit('gun',15,'other')&&!emit('invalid')&&
    !m.emit('red',new V(NaN,0,5),'gun','red_1'),
    'Unexpected event types, teams and nonfinite positions rejected');
  const pos=new V(0,0,15);
  check(m.emit('red',pos,'gun','red_0'),'Gunshot enters the world noise queue');
  pos.z=200;
  check(m.events[0].origin.z===15,'Sound event stores frozen position');
  check(!emit(),'Rapid shots from same gun are debounced');
  check(emit('gun',15,'red','red_1'),'Different gunshots can coexist');
  check(emit('pistol',15,'red','red_0'),'Pistol has independent sound profile');
  matchState.ended=true;
  check(!emit('gun',15,'red','red_2'),'Ended match emits no new sounds');
  matchState.ended=false;
  m.reset();m.setTime(1);
  emit();
  check(m.hear(b,1,.04),'Hostile audible gun creates suspicion');
  check(b.hearingPos.distanceTo(new V(0,0,15))>2.3 &&
    b.hearingPos.distanceTo(new V(0,0,15))<5.5,
    'Heard coordinates are deliberately inaccurate');
  check(b.hearingKind==='gun'&&b.hearingSourceId==='red_0'&&b.hearingTimer>3,
    'Investigate intent tracks sound type without enemy lock');
  check(b.visibleEnemy===null&&b.targetId===undefined,
    'Hearing alone never grants visual target acquisition');
  check(!m.hear(b,1.02,.02),'Hearing scans throttled per bot');
  check(b.hearingCommitUntil>1,'Sound pursuit has a minimum commitment interval');
  const frozen=b.hearingPos.clone();
  m.reset();m.setTime(1.1);
  check(b.hearingPos.distanceTo(frozen)===0,'New events cannot mutate existing suspicious point');
  m.resetHearing(b);
  check(b.hearingPos===null&&b.hearingGoalNode===-1&&b.hearingTimer===0,
    'Respawn hearing memory reset clears location and path');
  b=fresh();m.reset();m.setTime(2);emit('gun',15,'blue','blue_1');
  check(!m.hear(b,2,.1),'Friendly gunshots never redirect bots');
  b=fresh();m.reset();m.setTime(2);emit('gun',50);
  check(!m.hear(b,2,.1),'Gunfire beyond hearing radius is ignored');
  b=fresh();m.reset();m.setTime(2);emit('gun',15);vision=false;
  check(m.hear(b,2,.1),'Nearby gunfire heard through cover');
  b=fresh();m.reset();m.setTime(2);emit('gun',40);
  check(!m.hear(b,2,.1),'Occluded distant gunfire attenuates strongly');
  b=fresh();m.reset();m.setTime(2);emit('explosion',40);
  check(m.hear(b,2,.1)&&b.hearingTimer>4,
    'Loud explosion carries through cover and prompts investigation');
  b=fresh();m.reset();m.setTime(2);emit('sprint',10);
  check(!m.hear(b,2,.1),'Wall attenuates sprint sounds');
  vision=true;
  b=fresh();m.reset();m.setTime(2);emit('step',10);
  check(!m.hear(b,2,.1),'Normal footstep too distant to hear');
  b=fresh();m.reset();m.setTime(2);emit('sprint',10);
  check(m.hear(b,2,.1),'Sprinting more audible than walking');
  b=fresh();m.reset();m.setTime(2);emit('step',7,'red','red_0',3);
  check(!m.hear(b,2,.1),'Footstep on another floor is not falsely localized');
  b=fresh();m.reset();m.setTime(2);emit('gun');
  b.visibleEnemy={id:'red_0'};
  check(!m.hear(b,2,.1),'Confirmed sighting takes priority over sound');
  b=fresh();m.reset();m.setTime(2);emit('gun');
  b.lastKnownEnemyPos=new V(3,0,4);b.investigateTimer=4;
  check(!m.hear(b,2,.1),'Last visually observed position outranks audio');
  b=fresh();m.reset();m.setTime(2);emit('gun');b.hp=20;
  check(!m.hear(b,2,.1),'Wounded infantry does not chase suspicious sound');
  b=fresh();m.reset();m.setTime(2);emit('gun');b.hearingCommitUntil=4;
  check(!m.hear(b,2,.1),'Commitment prevents rapid aimless sound switching');
  b=fresh();m.reset();m.setTime(2);emit('gun');m.setTime(5);
  check(!m.hear(b,5,.1),'Expired noises cannot activate late bots');
  b=fresh();m.reset();m.setTime(6);emit('gun');walkable=false;
  check(!m.hear(b,6,.1)&&b.hearingPos===null,
    'No path intent accepted in unwalkable sound region');
  walkable=true;b=fresh();b.hearingPos=new V(10,0,12);
  vision=true;paths=0;
  check(m.route(b)?.z===12&&paths===0,
    'Visible candidate can be approached directly');
  vision=false;paths=0;
  check(m.route(b)?.x===4&&paths===1,'Obstructed destination uses real A-star waypoints');
  check(m.route(b)?.x===4&&paths===1,'A-star route cached between bot frames');
  b.pos.x=4;b.pos.z=5;
  check(m.route(b)?.x===10,'Bot advances through acoustic navigation nodes');
  b=fresh();b.hearingPos=new V(10,0,12);blocked=true;
  check(m.route(b)===null,'Unreachable A-star fallback not used as valid route');
  blocked=false;vision=true;m.reset();m.setTime(10);
  for(let i=0;i<65;i++)emit('gun',15,'red','red_'+i);
  check(m.events.length===40,'Sound event memory remains bounded to 40 slots');
  m.setTime(15);emit('gun',15,'red','new');
  check(m.events.length===1,'Expired acoustic events pruned on new event');
  check(!source.includes('getLiveEntitySnapshot(')&&
    !source.includes('reportTeamVisualSighting('),
    'Hearing module does not read hidden targets or create visual intel');
  check(html.includes('considerBotHeardNoise(bot, nowSec, dt);')&&
    html.includes('getBotHearingWaypoint(bot)'),
    'Real game loop uses acoustic scan and collision-aware navigation');
  check(html.includes("emitBotNoise(player.team, player.pos,")&&
    html.includes("emitBotNoise(bot.team, bot.pos, 'sprint', bot.id)"),
    'Real player and moving bot footsteps emit sounds');
  check(html.includes("emitBotNoise(team, pos, 'explosion', ownerName);")&&
    (html.match(/emitBotNoise\(bot\.team, bot\.pos,/g)||[]).length>=4,
    'Explosion and all four bot gunfire paths emit sounds');
  const from=html.indexOf('} else if (bot.hearingPos && bot.hearingTimer > 0) {');
  const investigate=html.slice(from,html.indexOf('const rallyKey =',from));
  check(from>0&&!investigate.includes('throwGrenade(')&&
    !investigate.includes('applyDamageToTarget(')&&
    !investigate.includes('targetId ='),
    'Sound-only investigation cannot blindly shoot or throw grenades');
  check((html.match(/hearingPos: null,/g)||[]).length===2&&
    html.includes('resetBotHearing(bot);')&&html.includes('resetBotNoiseEvents();'),
    'Both teams and fresh match reset all acoustic state');
  check(html.includes('return index % 15 === 14')&&
    (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
    'Approved 3:2 roster, every fifteenth Expert and medium aim retained');
  return results;
}
module.exports={runBotAiV39Regression};
if(require.main===module){
  const fs=require('node:fs'),path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const cases=runBotAiV39Regression(html);
  console.log('BOT AI V39 PASS ('+cases.length+' checks)');
  cases.forEach(name=>console.log('  ✓ '+name));
}
