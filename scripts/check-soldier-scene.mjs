import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const source = fs.readFileSync('index.html', 'utf8');
function extract(name) {
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, 'missing function ' + name);
  const open = source.indexOf('{', start);
  let depth = 0, quote = '', comment = '', escaped = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];
    if (comment === 'line') { if (ch === '\n') comment = ''; continue; }
    if (comment === 'block') { if (ch === '*' && next === '/') {comment = ''; i++;} continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') { comment = 'line'; i++; continue; }
    if (ch === '/' && next === '*') { comment = 'block'; i++; continue; }
    if (ch === "'" || ch === '"' || ch === '`') {quote = ch; continue;}
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw Error('Unterminated function ' + name);
}
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v) { return this.set(v.x, v.y, v.z); }
  clone() { return new Vector3(this.x, this.y, this.z); }
}
class Vector2 {
  constructor(x, y) { this.x = x; this.y = y; }
}
class Object3D {
  constructor(...args) {
    this.args = args;
    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1, 1, 1);
    this.children = [];
    this.parent = null;
  }
  add(...children) {
    for (const child of children) {
      assert.ok(child, 'null mesh child');
      this.children.push(child);
      child.parent = this;
    }
  }
  clone() {
    const result = new this.constructor(...this.args);
    result.position.copy(this.position);
    result.rotation.copy(this.rotation);
    result.scale.copy(this.scale);
    return result;
  }
  rotateX() { return this; }
  rotateY() { return this; }
  rotateZ() { return this; }
}
const THREE = new Proxy({
  Mesh: Object3D,
  Group: Object3D,
  Vector2,
  Vector3
}, { get: (o, k) => o[k] || Object3D });

const modelCode = `let SOLDIER_SHARED = null;
${extract('getSoldierSharedAssets')}
${extract('createLimbMesh')}
${extract('createBotSoldierMesh')}
createBotSoldierMesh;`;
const factory = vm.runInNewContext(modelCode, { THREE });
const required = ['root', 'upperBody', 'head', 'leftHip', 'rightHip',
  'leftKnee', 'rightKnee', 'weaponPivot', 'muzzleFlash'];
let count = 0;
for (const team of ['blue', 'red']) {
  for (const role of ['assault', 'medic', 'engineer', 'sniper', 'heavy']) {
    const model = factory(team, role);
    for (const field of required) assert.ok(model[field], `${team}/${role} missing ${field}`);
    assert.equal(model.head.parent, model.upperBody, 'headGroup attached to chest');
    assert.ok(model.head.children.length >= 7, 'helmet/goggles/NVG are attached to headGroup');
    assert.ok(model.head.children.every(piece => piece.parent === model.head), 'head pivot children intact');
    assert.ok(Math.abs(model.upperBody.position.y + model.head.position.y - 1.54) < 0.001,
      'visual head and original hitbox aligned');
    assert.equal(model.muzzleFlash.parent, model.weaponPivot, 'muzzle flash attached to firearm');
    model.head.rotation.x = -0.4; // one pivot, all helmet parts inherit motion
    assert.ok(model.head.children.length >= 7);
    count++;
  }
}
assert.equal(count, 10);

const getMuzzle = vm.runInNewContext(
  extract('getBotVisibleMuzzlePosition') + ';getBotVisibleMuzzlePosition;',
  { THREE }
);
const worldPos = new Vector3(1, 1.26, 2);
const fakeRoot = {
  position: new Vector3(),
  updated: false,
  updateMatrixWorld(flag) { this.updated = flag; }
};
const mockBot = {
  pos: new Vector3(1, 0, 2), crouchAmt: 0.5,
  mesh: {
    root: fakeRoot,
    muzzleFlash: { getWorldPosition(out) { out.copy(worldPos); } }
  }
};
const actualMuzzle = getMuzzle(mockBot, new Vector3(1, 1.45, 2));
assert.equal(actualMuzzle.y, 1.26);
assert.equal(fakeRoot.position.y, -0.16);
assert.equal(fakeRoot.updated, true);
assert.equal(getMuzzle(null, new Vector3(0, 1.45, 0)).y, 1.45);
console.log('PASS: 10/10 advanced V25 soldier scene graphs, head/hitbox/muzzle hierarchy');
console.log('PASS: visible BOT muzzle world position and fallback');
