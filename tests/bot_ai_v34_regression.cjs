'use strict';
// Run: node tests/bot_ai_v34_regression.cjs
// Deterministic behavior scenarios: no DOM, WebGL or network required.
function runBotAiV34Regression(html) {
  const results = [];
  const check = (truth, message) => {
    if (!truth) throw new Error('V34 FAIL: ' + message);
    results.push(message);
  };
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  scripts.forEach(m => new Function(m[1]));
  check(scripts.length === 3, 'Three game scripts still parse');
  const start = html.indexOf('      // V34: Make friendly corridor negotiation deterministic.');
  const end = html.indexOf('      function updateBots(dt) {', start);
  if (start < 0 || end < start) throw new Error('Missing V34 helper block');
  const helpers = html.slice(start, end);
  class Vector3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    clone() { return new Vector3(this.x, this.y, this.z); }
    distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
  }
  const nodes = [
    { x: 0, y: 0, z: 0 },
    { x: 5, y: 0, z: 1 },
    { x: 0, y: 0, z: 9 },
    { x: 0, y: 0, z: -8 }
  ];
  let walk = () => true;
  let visible = () => true;
  let selectedCover = 2;
  let pathResult = [0, 2];
  let pathCalls = 0;
  const self = {
    id: 'blue_0', team: 'blue', alive: true, pos: new Vector3(),
    strafeDir: 1, path: [0, 2], pathIndex: 0, coverNode: 1,
    coverThreatAnchor: new Vector3(0, 0, -10),
    coverCommitTimer: 0, coverRelocateCooldown: 0,
    coverIsPartial: false, coverPhase: 'CROUCH_HOLD', coverPhaseTimer: 4,
    blockedNode: -1, rallyGoalNode: -1
  };
  const other = {
    id: 'blue_1', team: 'blue', alive: true, pos: new Vector3(0, 0, 2),
    path: [], pathIndex: 0
  };
  const player = { alive: false, team: 'blue', pos: new Vector3(0, 0, 3) };
  const bots = [self, other];
  const api = new Function(
    'THREE','NAV_NODES','bots','player','isPositionWalkable','hasLineOfSight',
    'findNearestNavNode','findPathAStar','findBestCoverNode',
    helpers + '\nreturn {inspectBotPassage,selectBotRallyWaypoint,refreshBotCoverForMovingEnemy};'
  )(
    { Vector3 }, nodes, bots, player,
    (...args) => walk(...args), (...args) => visible(...args),
    p => p.z >= 7 ? 2 : 0,
    () => { pathCalls++; return pathResult.slice(); },
    (pos,threat,bot) => {
      if (bot) bot._coverEval = { nodeIdx: selectedCover, isPartialCover: true };
      return selectedCover;
    }
  );
  const target = new Vector3(0, 0, 10);
  let choice = api.inspectBotPassage(self, target, 5);
  check(choice?.mode === 'sidestep', 'Follower finds lateral passing move');
  check(choice.point.x > 1.3 && choice.point.z > 0, 'Sidestep retains forward progress');
  check(self.pos.x === 0 && self.pos.z === 0, 'Passage decisions never teleport actors');

  walk = x => x < -0.2;
  choice = api.inspectBotPassage(self, target, 5);
  check(choice?.mode === 'sidestep' && choice.point.x < 0,
    'Blocked preferred side chooses opposite side');
  walk = () => false;
  choice = api.inspectBotPassage(self, target, 5);
  check(choice?.mode === 'yield' && choice.point === null,
    'Narrow doorway causes deliberate yield, not wall clipping');
  walk = () => true;
  other.pos.y = 3;
  check(api.inspectBotPassage(self, target, 5) === null,
    'Teammate on upper floor does not block ground-floor route');
  other.pos.y = 0;
  other.pos.z = -2;
  check(api.inspectBotPassage(self, target, 5) === null,
    'Teammate behind mover does not block passage');
  other.pos.z = 2; other.team = 'red';
  check(api.inspectBotPassage(self, target, 5) === null,
    'Enemy does not trigger friendly passage yield');
  other.team = 'blue'; other.pos.x = 3;
  check(api.inspectBotPassage(self, target, 5) === null,
    'Distant lateral teammate does not disrupt formation');
  other.pos.x = 0;
  check(api.inspectBotPassage(self, target, 0) === null,
    'Stationary guard does not run passage logic');
  other.path = [3]; other.pathIndex = 0;
  check(api.inspectBotPassage(self, target, 5) === null,
    'Head-on traffic gives lower-ID actor priority');
  self.id = 'blue_9';
  check(api.inspectBotPassage(self, target, 5)?.mode === 'sidestep',
    'Head-on higher-ID actor yields to avoid deadlock');
  self.id = 'blue_0'; other.path = [];
  other.alive = false; player.alive = true;
  check(api.inspectBotPassage(self, target, 5)?.mode === 'sidestep',
    'Friendly human player has passage priority');
  other.alive = true; player.alive = false;

  visible = () => false;
  const formation = new Vector3(0, 0, 9);
  const routed = api.selectBotRallyWaypoint(self, formation);
  check(routed?.z === 9 && self.rallyGoalNode === 2 && self.pathIndex === 1,
    'Squad follower uses a navigable waypoint when wall blocks rally');
  const previousCalls = pathCalls;
  api.selectBotRallyWaypoint(self, formation);
  check(pathCalls === previousCalls, 'Unchanged rally waypoint does not recalculate A-star each tick');
  visible = () => true;
  check(api.selectBotRallyWaypoint(self, formation) === formation && self.rallyGoalNode === -1,
    'Unblocked squad rally uses direct formation point');
  visible = () => false; pathResult = [];
  self.path = []; self.rallyGoalNode = -1;
  check(api.selectBotRallyWaypoint(self, formation) === null,
    'Unreachable rally never instructs bot to walk through a wall');
  pathResult = [0, 2];

  self.coverNode = 1; self.coverThreatAnchor = new Vector3(0, 0, -10);
  self.coverCommitTimer = 2; self.coverRelocateCooldown = 0;
  visible = () => true;
  let changed = api.refreshBotCoverForMovingEnemy(self, new Vector3(12, 0, 0), 0.1);
  check(!changed && self.coverNode === 1, 'Recently secured cover has minimum commitment time');
  self.coverCommitTimer = 0;
  self.coverRelocateCooldown = 0; visible = () => false;
  changed = api.refreshBotCoverForMovingEnemy(self, new Vector3(12, 0, 0), 0.1);
  check(!changed && self.coverNode === 1 && self.coverThreatAnchor.x === 12,
    'Concealed crouch posture preserves an otherwise good cover position');
  self.coverThreatAnchor = new Vector3(0, 0, -10);
  visible = () => true; selectedCover = 2; pathResult = [0, 2];
  changed = api.refreshBotCoverForMovingEnemy(self, new Vector3(12, 0, 0), 0.1);
  check(changed && self.coverNode === 2 && self.coverPhase === 'MOVE_TO_COVER',
    'Enemy flanking exposed cover selects and walks to better protection');
  check(self.coverCommitTimer > 2 && self.coverRelocateCooldown > 3,
    'Cover switch uses cooldown to prevent tactical thrashing');
  check(self.path.at(-1) === 2 && self.coverIsPartial === true,
    'Cover switch adopts reachable A-star route and cover type');
  self.coverNode = 1; self.coverThreatAnchor = new Vector3(0, 0, -10);
  self.coverCommitTimer = 0; self.coverRelocateCooldown = 0;
  selectedCover = -1;
  check(api.refreshBotCoverForMovingEnemy(self, new Vector3(12, 0, 0), 0.1) === false &&
    self.coverNode === 1, 'No valid new cover keeps current position');
  selectedCover = 2; pathResult = [];
  self.coverRelocateCooldown = 0;
  check(api.refreshBotCoverForMovingEnemy(self, new Vector3(12, 0, 0), 0.1) === false &&
    self.coverNode === 1, 'Unreachable new cover is rejected');
  check(html.includes('const passage = inspectBotPassage(bot, moveTargetPos, moveSpeed);') &&
    html.includes("passage.mode === 'yield'") &&
    html.includes('bot.passageRepathCooldown = 2.3;'),
    'Live movement loop integrates yield and guarded path replanning');
  check(html.includes('refreshBotCoverForMovingEnemy(bot, activeThreatPos, dt);') &&
    html.includes('selectBotRallyWaypoint(bot, formationPoint)'),
    'Live combat and squad loops invoke tactical helpers');
  check((html.match(/passageWaitTimer: 0,/g) || []).length === 2 &&
    html.includes('bot.passageWaitTimer = 0;') &&
    html.includes('bot.coverRelocateCooldown = 0;'),
    'Spawn and respawn reset new behavior memory');
  check(html.includes('Math.abs(bot.pos.y - bots[j].pos.y) > 1.45') &&
    html.includes('Math.abs(bot.pos.y - player.pos.y) <= 1.45'),
    'Movement separation no longer pushes soldiers across floors');
  return results;
}
module.exports = { runBotAiV34Regression };
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const checks = runBotAiV34Regression(html);
  console.log('BOT AI V34 PASS (' + checks.length + ' checks)');
  checks.forEach(name => console.log('  ✓ ' + name));
}
