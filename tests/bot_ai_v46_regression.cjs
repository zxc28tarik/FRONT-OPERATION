'use strict';
// V46 — Target continuity, cover usage and team focus telemetry regression.
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let checks = 0;
const check = (truth, label) => {
  if (!truth) throw new Error('V46 FAIL: ' + label);
  checks++;
  console.log('  ✓ ' + label);
};
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
scripts.forEach(match => new Function(match[1]));
check(scripts.length === 3, 'Three original game scripts remain parseable');
const a = html.indexOf('      // V40: In-memory telemetry only.');
const b = html.indexOf('      let botLifeSequence = 0;', a);
check(a >= 0 && b > a, 'Telemetry module can be loaded without WebGL');
const api = new Function(html.slice(a, b) + `
  return { state: BOT_METRICS, reset: resetBotMetrics,
    record: recordBotMetric, transition: recordBotTargetTransition,
    sample: sampleBotMetrics, snapshot: getBotMetricsSnapshot };
`)();
const bot = (id, team, classId, diff, x, z, enemy = null) => ({
  id, team, classId, difficulty: diff, alive: true,
  pos: {x,y:0,z}, visibleEnemy: enemy ? {id:enemy}:null,
  coverPhase:'NONE', moveVelX:0, moveVelZ:0, targetId:enemy,
});
const blue = [
  bot('blue_0','blue','assault','normal',0,0,'red_0'),
  bot('blue_1','blue','medic','hard',1,0,'red_0'),
  bot('blue_2','blue','heavy','normal',10,0,'red_1'),
];
const red = [
  bot('red_0','red','assault','normal',0,20,'blue_0'),
  bot('red_1','red','sniper','hard',9,20,null),
];
const roster = [...blue,...red];
api.reset();
check(api.state.version === 46 && api.state.seconds === 0, 'V46 telemetry version starts clean');
api.transition(blue[0], null, 'red_0');
api.transition(blue[0], 'red_0', 'red_0');
api.transition(blue[0], 'red_0', 'red_1');
api.transition(blue[0], 'red_1', null);
api.transition(blue[0], null, null);
check(api.state.actors.blue_0.targetAcquisitions === 1, 'First visibility is acquisition, not a switch');
check(api.state.actors.blue_0.targetSwitches === 1, 'Visible replacement counts one target switch');
check(api.state.actors.blue_0.targetLosses === 1, 'Lost visibility counts one loss');
check(api.state.classes.assault.targetSwitches === 1 &&
  api.state.teams.blue.targetLosses === 1, 'Target events preserve class and team attribution');
check(blue[0].visibleEnemy.id === 'red_0' && blue[0].targetId === 'red_0',
  'Telemetry never changes actual enemy selection');
blue[0].coverPhase = 'MOVE_TO_COVER';
blue[0].moveVelX = 2.1;
blue[1].coverPhase = 'CROUCH_HOLD';
blue[2].coverPhase = 'PEEK_FIRE';
red[0].coverPhase = 'NONE';
for (let k=0;k<20;k++) api.sample(.05,roster);
const snap = api.snapshot();
check(snap.seconds === 1 && snap.samples === 1, 'Exactly one simulated second is sampled');
check(snap.classes.assault.coverApproachSeconds === 1 &&
  snap.actors.blue_0.coverApproachSeconds === 1, 'Moving to cover is measured once per sample');
check(snap.actors.blue_1.coverHoldSeconds === 1 &&
  snap.actors.blue_2.coverHoldSeconds === 1, 'Both crouched hold and peek phases count as cover use');
check(snap.actors.blue_0.movingSeconds === 1 &&
  snap.actors.blue_1.movingSeconds === 0, 'Actual move speed, not just intention, measures movement');
check(snap.actors.blue_0.engagedSeconds === 1 &&
  snap.actors.red_1.engagedSeconds === 0, 'Only visible enemies contribute to engaged time');
check(snap.spread.blue.focusSamples === 1 &&
  snap.spread.blue.meanLargestFocus === 2, 'Team focus detects two soldiers sharing a visible target');
check(snap.spread.red.focusSamples === 1 &&
  snap.spread.red.meanLargestFocus === 1, 'Enemy-side focus measured independently');
check(snap.spread.blue.meanClosePairs > 0, 'V40 crowding metric is retained');
blue[1].visibleEnemy = null;
blue[2].visibleEnemy = null;
blue[0].visibleEnemy = null;
red[0].visibleEnemy = null;
for (let k=0;k<20;k++) api.sample(.05,roster);
check(api.state.seconds === 2, 'Second interval progresses without visible enemies');
const after = api.snapshot();
check(after.spread.blue.focusSamples === 1 &&
  after.spread.red.focusSamples === 1, 'No-target seconds never dilute observed focus');
check(Number.isFinite(after.spread.blue.meanLargestFocus) &&
  Number.isFinite(after.spread.red.meanLargestFocus), 'Focus export stays finite');
after.spread.blue.meanLargestFocus = 999;
after.actors.blue_0.coverHoldSeconds = 999;
check(api.state.spread.blue.focusSum === 2 &&
  api.state.actors.blue_0.coverHoldSeconds === 0, 'Snapshot is a defensive copy');
api.reset();
check(api.state.spread.blue.focusSamples === 0 &&
  api.state.spread.red.focusSum === 0 &&
  !Object.keys(api.state.actors).length, 'Match restart clears all new measures');
check(html.includes('recordBotTargetTransition(bot, previousTarget, currentTarget);') &&
  html.includes("recordBotMetric(bot,'sightings');"),
  'Live bot perception feeds transition metrics without removing V40 sightings');
check(html.includes("recordBotMetric(bot,'coverHoldSeconds');") &&
  html.includes("recordBotMetric(bot,'coverApproachSeconds');") &&
  html.includes("recordBotMetric(bot,'movingSeconds');"),
  'Live one-second samples are connected to cover and movement metrics');
check(html.includes('return index % 15 === 14') &&
  (html.match(/aimSettleSec: 0\.34/g)||[]).length === 3,
  'Expert cycle and 0.34-second shared aim remain unchanged');
check(!html.slice(a,b).includes('fetch(') &&
  !html.slice(a,b).includes('localStorage'), 'Metrics remain local without network or persistence');
console.log('BOT AI V46 PASS (' + checks + ' checks)');
