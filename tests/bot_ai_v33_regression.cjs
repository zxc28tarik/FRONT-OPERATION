'use strict';
// FRONT OPERATION V33 deterministic AI regression, without a browser dependency.
// Run: node tests/bot_ai_v33_regression.cjs
function runBotAiV33Regression(html) {
  const ok = (condition, title) => {
    if (!condition) throw new Error('FAIL: ' + title);
    results.push(title);
  };
  const results = [];
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  scripts.forEach((m) => new Function(m[1]));
  ok(scripts.length === 3, 'Embedded JS: three scripts parse');

  const begin = html.indexOf('      // V33: Keep upper-body aim');
  const finish = html.indexOf('      function updateBots(dt) {', begin);
  if (begin < 0 || finish < begin) throw new Error('Cannot locate V33 helper block');
  const helpers = html.slice(begin, finish);
  class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    distanceTo(p) { return Math.hypot(this.x - p.x, this.y - p.y, this.z - p.z); }
  }
  const THREE = { Vector3: Vec3 };
  const bot = {
    id: 'blue_0', team: 'blue', alive: true, pos: new Vec3(0, 0, 0),
    upperYaw: Math.PI, strafeDir: 1, supportAllyId: null
  };
  const player = { id: 'player', alive: true, team: 'blue', hp: 20, pos: new Vec3(0, 0, 7) };
  const mates = [
    { id: 'blue_1', alive: true, team: 'blue', hp: 36, pos: new Vec3(0, 0, 10) },
    { id: 'red_1', alive: true, team: 'red', hp: 20, pos: new Vec3(0, 0, 19) }
  ];
  let walk = () => true;
  const make = () => new Function('THREE', 'bots', 'player', 'normalizeAngle', 'isPositionWalkable',
    helpers + '\nreturn {isBotAimAligned,isBotFireLaneClear,chooseBotFireLaneStep,selectBotMedicPatient};')(
      THREE, mates, player, (a) => Math.atan2(Math.sin(a), Math.cos(a)), (...args) => walk(...args)
    );
  const enemy = new Vec3(0, 1.45, 30);
  let ai = make();

  ok(!ai.isBotAimAligned(bot, enemy), 'No fire on target behind body turn');
  bot.upperYaw = 0;
  ok(ai.isBotAimAligned(bot, enemy), 'Fire permitted when upper body aligns');
  bot.upperYaw = 0.65;
  ok(!ai.isBotAimAligned(bot, enemy), 'Significant unfinished turn blocks fire');
  bot.upperYaw = Math.PI - 0.06;
  ok(ai.isBotAimAligned(bot, new Vec3(-0.2, 1.45, -20)),
    'Aim-angle wrap works near +/- pi');
  bot.upperYaw = 0;

  ok(!ai.isBotFireLaneClear(bot, enemy), 'Friendly teammate in shot path blocks fire');
  mates[0].alive = false;
  ok(!ai.isBotFireLaneClear(bot, enemy), 'Friendly player also blocks shot path');
  player.alive = false;
  ok(ai.isBotFireLaneClear(bot, enemy), 'No living ally on line permits fire');
  player.alive = true;
  mates[0].alive = true;
  mates[0].pos.x = 1.15; player.pos.x = 1.2;
  ok(ai.isBotFireLaneClear(bot, enemy), 'Nearby teammates outside line do not block fire');
  mates[0].pos.x = 0; mates[0].pos.y = 5; player.alive = false;
  ok(ai.isBotFireLaneClear(bot, enemy), 'Ally on different floor does not block fire');
  mates[0].pos.y = 0; mates[0].pos.z = -3;
  ok(ai.isBotFireLaneClear(bot, enemy), 'Ally behind shooter does not block fire');
  mates[0].pos.z = 10; player.alive = true; player.pos.x = 0;
  ok(ai.isBotFireLaneClear(bot, enemy, new Vec3(3, 0, 0)),
    'Shifted firing origin creates a free line');

  walk = () => true; ai = make();
  const step = ai.chooseBotFireLaneStep(bot, enemy);
  ok(step && Math.abs(step.x) > 2 && ai.isBotFireLaneClear(bot, enemy, step),
    'Blocked fire lane yields usable lateral step');
  walk = (x) => x < 0;
  bot.strafeDir = 1; ai = make();
  const leftStep = ai.chooseBotFireLaneStep(bot, enemy);
  ok(leftStep && leftStep.x < 0, 'Blocked preferred side tries safe opposite side');
  walk = () => false; ai = make();
  ok(ai.chooseBotFireLaneStep(bot, enemy) === null,
    'No side step if both routes contain geometry');
  walk = () => true; ai = make();

  player.pos.x = 0; player.pos.z = 7; player.alive = true;
  mates[0].pos.x = 0; mates[0].pos.z = 10; mates[0].alive = true;
  bot.supportAllyId = null;
  ok(ai.selectBotMedicPatient(bot)?.id === 'player',
    'Medic prioritizes urgent nearby wounded ally');
  bot.supportAllyId = 'blue_1';
  ok(ai.selectBotMedicPatient(bot)?.id === 'blue_1',
    'Medic patient affinity avoids minor target oscillation');
  mates[0].alive = false;
  ok(ai.selectBotMedicPatient(bot)?.id === 'player',
    'Medic abandons patient after their death');
  player.hp = 100;
  ok(ai.selectBotMedicPatient(bot) === null,
    'Medic does not chase healthy or dead allies');

  ok(html.includes('isBotFireLaneClear(bot, bestEnemy.eye)') &&
    html.includes('isBotAimAligned(bot, bestEnemy.eye)') &&
    html.includes('canShootFromStance && fireLaneClear && aimAligned && bot.fireTimer <= 0'),
    'Normal firearm damage is gated on aim and friendly lane');
  ok(html.includes('bot.fireLaneRecoveryGoal = chooseBotFireLaneStep(bot, bestEnemy.eye)'),
    'Live combat loop invokes lane-recovery movement');
  ok(html.includes('isBotFireLaneClear(bot, visibleEnemyDrone.pos)') &&
    html.includes('isBotAimAligned(bot, visibleEnemyDrone.pos)'),
    'Anti-drone fire also respects ally line and body direction');
  ok(html.includes('isBotFireLaneClear(bot, coverOpp.targetEye)') &&
    html.includes('isBotAimAligned(bot, coverOpp.targetEye)'),
    'Covering fire also respects ally line and body direction');
  ok(html.includes("const injuredAlly = bot.classId === 'medic' ? selectBotMedicPatient(bot) : null;"),
    'Live support loop uses stable medic selection');
  ok((html.match(/fireLaneRecoveryGoal: null/g) || []).length === 2 &&
    html.includes('bot.fireLaneRecoveryGoal = null;'),
    'All bot spawns and respawns initialize lane-recovery state');
  return results;
}

module.exports = { runBotAiV33Regression };
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const cases = runBotAiV33Regression(html);
  console.log('BOT AI V33 PASS (' + cases.length + ' checks)');
  cases.forEach((name) => console.log('  ✓ ' + name));
}
