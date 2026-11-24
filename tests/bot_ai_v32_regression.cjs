'use strict';
// Run: node tests/bot_ai_v32_regression.cjs
// No external dependencies. Deterministic game-AI unit scenarios, not a WebGL smoke test.
function runBotAiV32Regression(html) {
  const assert = (condition, label) => {
    if (!condition) throw new Error('FAIL: ' + label);
    return label;
  };
  const results = [];
  const between = (a, b) => {
    const from = html.indexOf(a);
    const to = html.indexOf(b, from + a.length);
    if (from < 0 || to <= from) throw new Error('Missing source anchors: ' + a);
    return html.slice(from, to);
  };
  const allScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  allScripts.forEach((m) => new Function(m[1]));
  results.push(assert(allScripts.length === 3, 'All three embedded scripts parse'));
  results.push(assert(!html.includes('bot.pos.x += (Math.random() - 0.5) * 1.1'),
    'Random collision teleport removed'));

  class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    clone() { return new Vec3(this.x, this.y, this.z); }
    copy(v) { return this.set(v.x, v.y, v.z); }
  }
  const THREE = { Vector3: Vec3 };

  // Navigation: edges are real, and a blocked lane is actually bypassed.
  const nav = new Function(between('      const NAV_NODES = [', '      function isPositionWalkable(') +
    '\nreturn {NAV_NODES,NAV_ADJ,findPathAStar};')();
  const basePath = nav.findPathAStar(0, 13, -1);
  const detour = nav.findPathAStar(0, 13, 7);
  const valid = (p) => p.length > 1 && p[0] === 0 && p[p.length - 1] === 13 &&
    p.every((node, i) => i === 0 || nav.NAV_ADJ[p[i-1]].some((edge) => edge.to === node));
  results.push(assert(nav.NAV_NODES.length === 50 && valid(basePath) && valid(detour) &&
    basePath.includes(7) && !detour.includes(7), 'A* bypasses blocked west-lane node'));

  // Local escape never changes actor position or steps through blocked cells.
  const escapeSrc = between('      function findBotEscapePoint(', '      const _coverThreatEye');
  const makeEscape = (walk) => new Function('THREE', 'isPositionWalkable',
    escapeSrc + '\nreturn findBotEscapePoint;')(THREE, walk);
  const actor = { pos: new Vec3(), unstuckSide: 1 };
  const free = makeEscape(() => true);
  const one = free(actor, new Vec3(0, 0, 10));
  const two = free(actor, new Vec3(0, 0, 10));
  results.push(assert(one.x * two.x < 0 && actor.pos.x === 0 && actor.pos.z === 0,
    'Sidestep alternates without teleporting actor'));
  const blockedSide = makeEscape((x) => x > -0.5)(actor, new Vec3(0, 0, 10));
  results.push(assert(blockedSide.x > 0 &&
    makeEscape(() => false)(actor, new Vec3(0, 0, 10)) === null,
    'Sidestep rejects blocked paths'));

  // Team sighting TTL advances only on simulated match time.
  const intelSrc = between('      const TEAM_INTEL = {', '      function getLaneFromX(');
  const alive = (id) => id === 'red_1' || id === 'blue_0';
  const intel = new Function('THREE','bots','player','isEntityStillAlive','hasLineOfSight',
    intelSrc + '\nreturn {reset:resetTeamIntel,report:reportTeamVisualSighting,' +
    'shared:getSharedTeamSighting,prune:pruneTeamIntel,' +
    'advance:(dt)=>{botAiClockSec+=dt},clock:()=>botAiClockSec};'
  )(THREE,[{id:'blue_0',team:'blue',pos:new Vec3()}],{team:'blue',alive:true},alive,()=>true);
  intel.reset();
  const teammate = {id:'blue_0',team:'blue',squadId:0,pos:new Vec3()};
  intel.report('blue',1,'blue_1','red_1',new Vec3(12,0,0));
  results.push(assert(!!intel.shared(teammate,intel.clock()) && intel.clock() === 0,
    'Shared sighting remains valid during pause'));
  intel.advance(3.7); intel.prune(intel.clock());
  results.push(assert(intel.shared(teammate,intel.clock()) === null,
    'Sighting expires after simulated-time TTL'));

  // Perception regression: disappearing target must not leak new world position.
  const perceptionSrc = between('      function updateBotPerception(', '      // =========================================================================\n      // 11. HIT FEEDBACK');
  const actors = {
    redA: {id:'redA', team:'red', alive:true, visible:true, pos:new Vec3(13,0,0), eye:new Vec3(13,1.48,0)},
    redB: {id:'redB', team:'red', alive:true, visible:false, pos:new Vec3(11,0,0), eye:new Vec3(11,1.48,0)}
  };
  const bot = {
    id:'blue0', team:'blue', squadId:0, pos:new Vec3(), upperYaw:Math.PI/2,
    alertTimer:0, alertPos:null, targetLockTimer:0, perceptionTimer:0,
    visibleEnemy:null, targetId:null, lastKnownEnemyPos:null, memoryTargetId:null,
    investigateTimer:0, reactionTimer:0, reactionRequired:0.2,
    coverNode:5, coverPhase:'PEEK_FIRE', coverSearchCooldown:1
  };
  const scan = new Function('THREE','bots','player','BOT_PERCEPTION_INTERVAL','_percEyeVec',
    'getLiveEntitySnapshot','evaluateCandidatePerception','scoreEnemyCandidate',
    'computeReactionDelay','isEntityStillAlive','clearDeadTargetMemory',
    'reportTeamVisualSighting','getSharedTeamSighting','botAiClockSec','getBotSkillProfile','resetBotAimTracking',
    'const isCoverSafeForNewVisibleTarget=()=>false;\n' + perceptionSrc + '\nreturn updateBotPerception;')(
    THREE,Object.values(actors),{team:'blue',alive:false},0.12,new Vec3(),
    (id) => {
      const a = actors[id];
      return a && a.alive ? {id,pos:a.pos,eye:a.eye,isPlayer:false} : null;
    },
    (_b,_eye,cand) => {
      if (!actors[cand.id].visible) return null;
      return {dist:Math.hypot(cand.pos.x,cand.pos.z),angleRad:0,inPrimaryCone:true};
    },
    (_b,_cand,perc) => perc.dist,
    () => 0.24,
    (id) => !!actors[id]?.alive,
    () => {},
    () => {},
    () => null,
    0,
    () => ({ reactionScale: 1.18 }),
    () => {}
  );
  const tick = () => scan(bot,0.04,{});
  tick();
  results.push(assert(bot.targetId === 'redA' && bot.lastKnownEnemyPos.x === 13,
    'Detect visible enemy A'));
  actors.redA.pos.x = actors.redA.eye.x = 34;
  actors.redA.visible = false;
  tick();
  results.push(assert(bot.targetId === null && bot.lastKnownEnemyPos.x === 13,
    'No wallhack: lost target memory freezes at observed position'));
  actors.redB.visible = true; bot.perceptionTimer = 0; tick();
  results.push(assert(bot.targetId === 'redB', 'Acquire newly visible B'));
  actors.redA.visible = true;
  actors.redA.pos.x = actors.redA.eye.x = 9;
  bot.perceptionTimer = 0; tick();
  results.push(assert(bot.targetId === 'redB', 'Target lock prevents minor switch'));
  actors.redA.pos.x = actors.redA.eye.x = 2;
  bot.perceptionTimer = 0; tick();
  results.push(assert(bot.targetId === 'redA', 'Immediate close threat overrides lock'));
  results.push(assert(bot.coverNode === -1, 'Cover re-evaluated on enemy switch'));

  // Red infantry must acquire a visible BLUE player, but blue allies must not.
  const human = {alive:true,team:'blue',pos:new Vec3(15,0,0),eye:new Vec3(15,1.48,0)};
  const scanPlayer = new Function('THREE','bots','player','BOT_PERCEPTION_INTERVAL','_percEyeVec',
    'getLiveEntitySnapshot','evaluateCandidatePerception','scoreEnemyCandidate',
    'computeReactionDelay','isEntityStillAlive','clearDeadTargetMemory',
    'reportTeamVisualSighting','getSharedTeamSighting','botAiClockSec','getBotSkillProfile','resetBotAimTracking',
    'const isCoverSafeForNewVisibleTarget=()=>false;\n' + perceptionSrc + '\nreturn updateBotPerception;')(
    THREE,[],human,0.12,new Vec3(),
    (id) => id === 'player' ? {id:'player',pos:human.pos,eye:human.eye,isPlayer:true} : null,
    (_b,_eye,cand) => ({dist:Math.hypot(cand.pos.x,cand.pos.z),angleRad:0,inPrimaryCone:true}),
    (_b,_cand,info) => info.dist,
    () => 0.24,
    (id) => id === 'player',
    () => {}, () => {}, () => null, 0,
    () => ({ reactionScale: 1.18 }),
    () => {}
  );
  const redBot = {...bot,id:'red0',team:'red',targetId:null,visibleEnemy:null,
    perceptionTimer:0,targetLockTimer:0,lastKnownEnemyPos:null,reactionTimer:0};
  scanPlayer(redBot,0.04,{});
  results.push(assert(redBot.targetId === 'player', 'Red infantry acquires visible human player'));
  const blueBot = {...redBot,id:'blue1',team:'blue',targetId:null,visibleEnemy:null,
    perceptionTimer:0,targetLockTimer:0,lastKnownEnemyPos:null,reactionTimer:0};
  scanPlayer(blueBot,0.04,{});
  results.push(assert(blueBot.targetId === null, 'Friendly infantry does not target human ally'));

  return results;
}

if (typeof module !== 'undefined' && module.exports) {
  const fs = require('node:fs');
  const path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const cases = runBotAiV32Regression(html);
  console.log('BOT AI V32 PASS (' + cases.length + ' checks)');
  cases.forEach((name) => console.log('  ✓ ' + name));
}
