'use strict';
// V47 cover-commit policy: progressing soldiers don't oscillate between
// distant cover points; immediate threats and stalls can still force a move.
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
let checks=0;const ok=(yes,name)=>{
 if(!yes)throw Error('V47 COMMIT FAIL: '+name);
 checks++;console.log('  ✓ '+name);
};
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
scripts.forEach(m=>new Function(m[1]));
ok(scripts.length===3,'Inline scripts remain parseable');
const from=html.indexOf('      // V47: Do not replace a distant cover destination');
const to=html.indexOf('      // V36: A persistent lateral dodge',from);
ok(from>0&&to>from,'Original V47 movement policy and refresh function isolated');
const policySrc=html.slice(from,to);
const compile=(time=4)=> {
 const calls={cover:0,path:0};
 class V{constructor(x,y,z){this.x=x;this.y=y;this.z=z;}clone(){return new V(this.x,this.y,this.z);}}
 const nodes=[{x:0,y:0,z:0},{x:15,y:0,z:3}];
 const api=new Function('botAiClockSec','NAV_NODES','THREE','hasLineOfSight',
 'findBestCoverNode','findPathAStar','findNearestNavNode',
 policySrc+'\nreturn {keep:shouldKeepApproachingCover,refresh:refreshBotCoverForMovingEnemy};')(
 time,nodes,{Vector3:V},()=>true,
 ()=>{calls.cover++;return 1;},
 ()=>{calls.path++;return [0,1];},()=>0
 );
 return {api,calls,V};
};
const bot=()=>({
 alive:true,id:'red_4',team:'red',pos:{x:0,y:0,z:0},
 coverNode:0,coverPhase:'MOVE_TO_COVER',coverCommitTimer:0,
 coverRelocateCooldown:0,coverThreatAnchor:{x:-10,y:0,z:0},
 _coverAudit:{node:0,arrived:false,since:1,
  initialDistance:24,bestDistance:12,lastProgressAt:3.8},
 blockedNode:-1,path:[0],pathIndex:0
});
const threat={x:20,y:0,z:0,clone(){return {...this};}};
let p=compile(4),b=bot();
ok(p.api.keep(b,threat,4),'Distant cover attempt gets a short progress commitment');
ok(p.api.refresh(b,threat,.05)===false,
 'Live refresh does not replace progressing distant cover');
ok(p.calls.cover===0&&b.coverNode===0,
 'No cover search or route replacement while soldier advances');
ok(p.api.keep(b,threat,7)===false,
 'Commitment expires after bounded travel time');
p=compile(9);b=bot();
ok(p.api.refresh(b,threat,.05)===true,
 'After expiry a newly exposed cover can be replaced');
ok(p.calls.cover===1&&p.calls.path===1&&b.coverNode===1,
 'Old cover reroutes through existing A-star method after expiry');
p=compile(4);b=bot();b._coverAudit.lastProgressAt=1.1;
ok(!p.api.keep(b,threat,4),
 'No forward movement for 2.25 seconds ends commitment early');
ok(p.api.refresh(b,threat,.05)===true,
 'Stalled approach can relocate instead of being frozen');
p=compile(4);b=bot();const close={x:6,y:0,z:0,clone(){return {...this};}};
ok(!p.api.keep(b,close,4),
 'Near enemy at under 9m can override cover commitment');
ok(p.api.refresh(b,close,.05)===true,
 'Actual refresh relocates when close attacker appears');
p=compile(4);b=bot();b._coverAudit.arrived=true;
ok(!p.api.keep(b,threat,4),
 'Soldier already at cover is allowed to reconsider destination');
p=compile(4);b=bot();b._coverAudit.node=1;
ok(!p.api.keep(b,threat,4),
 'Stale audit for a different cover node cannot block routing');
p=compile(4);b=bot();b.coverPhase='NONE';
ok(!p.api.keep(b,threat,4),
 'No approach phase means no cover commitment');
p=compile(4);b=bot();b._coverAudit=null;
ok(!p.api.keep(b,threat,4),
 'Missing telemetry never suppresses original tactical decisions');
p=compile(4);b=bot();b.coverCommitTimer=2.6;
ok(p.api.refresh(b,threat,.05)===false&&p.calls.cover===0,
 'Old initial 2.6-second cover commitment remains intact');
ok(html.includes('if (shouldKeepApproachingCover(bot, threatPos, botAiClockSec)) return false;'),
 'Actual refresh calls policy before proposing a new route');
ok(html.includes('Math.max(3.4,')&&html.includes('progressAgo < 2.25')&&
 html.includes('threatDist >= 9.0'),
 'Time, progress and close-threat escape gates are retained');
ok(html.includes('bot.coverCommitTimer = 2.6;'),
 'Base tactical commitment and V20 cover mechanics remain unchanged');
ok(html.includes('return index % 15 === 14')&&
 (html.match(/aimSettleSec: 0\.34/g)||[]).length===3,
 'Three Normal, two Hard and expert rotation have shared 0.34-second aim');
console.log('BOT AI V47 COMMIT PASS ('+checks+' checks)');
