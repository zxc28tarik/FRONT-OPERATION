import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const get = p => fs.readFileSync(p, 'utf8');
const game = get('index.html');
const v5 = get('references/V5_MARIEN_GORSEL_ORIJINAL.html');
const v12 = get('references/1C_duvar_konteyner.html');
const v17 = get('references/2D_V17_onayli_nisan.html');
const v20 = get('references/3B_siper.html');
const v22 = get('references/3C_V22_takim.html');
let passed = 0;
function test(name, run) {
  run();
  passed++;
  console.log('PASS', name);
}
function block(source, key) {
  const start = source.indexOf(key);
  assert.ok(start >= 0, 'Missing ' + key);
  const open = source.indexOf('{', start);
  assert.ok(open >= 0);
  let depth = 0, quote = '', comment = '', escaped = false;
  for (let i = open; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && n === '/') {comment = ''; i++;} continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '/' && n === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') {quote = c; continue;}
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw Error('Unterminated ' + key);
}
const func = (s, n) => block(s, 'function ' + n + '(');
const normalized = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*$/gm, '').replace(/\s+/g, '');
test('one inline JavaScript script parses', () => {
  const inline = [...game.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(x => !/\bsrc\s*=/.test(x[1]) && x[2].trim());
  assert.equal(inline.length, 1);
  new vm.Script(inline[0][2]);
});
test('V12 approved textures are identical', () => {
  assert.equal(normalized(func(game, 'makeProceduralTextureSet')),
    normalized(func(v12, 'makeProceduralTextureSet')));
  for (const surface of ['asphalt','concrete','concrete_weathered','steel','wood','sandbag','hazard','container_red','container_blue','container_rust']) {
    assert.ok(game.includes("makeProceduralTextureSet('" + surface + "'"), surface);
  }
});
test('V17 manual recoil is identical', () => {
  assert.equal(normalized(func(game, 'applyManualRecoilCompensation')),
    normalized(func(v17, 'applyManualRecoilCompensation')));
});
test('V20 three cover methods are retained', () => {
  for (const n of ['findBestCoverNode','getCoverOccupancyCount','setBotState']) {
    assert.equal(normalized(func(game, n)), normalized(func(v20, n)), n);
  }
});
test('V22 seven team AI methods are retained', () => {
  for (const n of ['buildSquadLeadership','reportTeamVisualSighting','getSharedTeamSighting',
    'broadcastRetreatCoverRequest','findCoveringFireOpportunity',
    'getTeamLaneCounts','assignBotTacticalGoal']) {
    assert.equal(normalized(func(game, n)), normalized(func(v22, n)), n);
  }
});
test('V25 advanced soldier identity exact and unified head group', () => {
  // V5 remains archived for artistic reference, not the active soldier baseline.
  const reference = get('references/V25_3D_BOT_SOLDIER_APPROVED.js');
  const active = func(game, 'createBotSoldierMesh');
  assert.equal(normalized(active), normalized(func(reference, 'createBotSoldierMesh')));
  assert.ok(active.includes('const headGroup = new THREE.Group();'));
  assert.ok(active.includes('headGroup.add(helmet);'));
  assert.ok(active.includes('headGroup.add(goggles);'));
  assert.ok(active.includes('head: headGroup,'));
  assert.ok(active.includes('weaponPivot,'));
  assert.ok(!active.includes('V5_WEAPON_MATS'));
});
test('BOT weapon muzzle is visual tracer origin in 3 firing modes', () => {
  const visual = func(game, 'getBotVisibleMuzzlePosition');
  assert.ok(visual.includes('bot.mesh.muzzleFlash.getWorldPosition(pos);'));
  assert.ok(visual.includes('root.updateMatrixWorld(true);'));
  assert.equal((game.match(/getBotVisibleMuzzlePosition\(bot, (?:botEye|botEyeNoTarget)/g) || []).length, 3);
  assert.ok(visual.includes('fallback.clone()'));
});
test('V5 fencing is original; six tactical signs exist', () => {
  assert.equal(normalized(func(game,'makeFenceAlphaTexture')),
    normalized(func(v5,'makeFenceAlphaTexture')));
  assert.equal((game.match(/addV5TacticalSign\(/g) || []).length - 1, 6);
});
test('V5 four architectural detail families are active', () => {
  for (const n of ['detailShippingContainer','detailJerseyBarrier','detailSniperBuilding']) {
    assert.ok(game.includes('function ' + n + '('), n);
  }
  assert.ok(game.includes('function buildDetailedSandbagWall('));
  assert.ok(game.includes('detailShippingContainer(x, y, z, w, h, d, isRotated);'));
  assert.ok(game.includes('detailJerseyBarrier(x, z, length, alongX);'));
  assert.equal((game.match(/detailSniperBuilding\(/g) || []).length - 1, 2);
  assert.ok(game.includes('facePos = (alongX ? d : w) / 2 - 0.075'));
  assert.ok(game.includes('x + w / 2 + 0.04, y, z + offset'));
});
test('V14 body and head hit particles integrated with cap', () => {
  assert.ok(game.includes('bloodDropGeo: new THREE.SphereGeometry(0.026, 6, 6)'));
  assert.ok(game.includes('matBloodBody: new THREE.MeshBasicMaterial({ color: 0x991b1b })'));
  assert.ok(game.includes('matBloodHead: new THREE.MeshBasicMaterial({ color: 0xdc2626 })'));
  assert.equal((game.match(/spawnCharacterHitFX\(/g) || []).length - 1, 3);
  assert.ok(func(game,'spawnCharacterHitFX').includes('activeParticles.length < VFX_CAPS.maxParticles'));
});
test('V24/V25 core gameplay and drone rules remain', () => {
  // Compare each of the 11 V17 weapons' balance and recoil settings with current game.
  // The V25 drone is a permitted additional weapon; no other original may change.
  const readWeapons = source => vm.runInNewContext(
    '(' + block(source, 'const WEAPONS = ').replace(/^const WEAPONS = /, '') + ')',
    { DRONE_CONFIG: { kamikazeDamage: 85 } }
  );
  const preserved = readWeapons(v17), current = readWeapons(game);
  assert.equal(Object.keys(preserved).length, 11);
  for (const [id, referenceWeapon] of Object.entries(preserved)) {
    assert.ok(current[id], 'Missing weapon ' + id);
    assert.equal(JSON.stringify(current[id]), JSON.stringify(referenceWeapon), id);
  }
  assert.match(game, /maxHp:\s*110/);
  assert.ok(game.includes('drone.vel.z += (targetVel.z - drone.vel.z) * horizAlpha;'));
  assert.ok(game.includes('!player.grounded || player.sp < 25'));
  assert.ok(game.includes("code === 'KeyQ'") && game.includes("code === 'KeyE'"));
});
test('approved game name is displayed', () => {
  assert.ok(game.includes('<title>FRONT OPERATION — MARIEN CQC</title>'));
  assert.ok(game.includes('            FRONT OPERATION'));
});
console.log(`ALL ${passed}/${passed} source preservation checks PASS`);
