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
let SOLDIER_V11_DETAIL_GEOMETRIES = null;
${extract('getSoldierSharedAssets')}
${extract('createLimbMesh')}
${extract('createBotSoldierMesh')}
${extract('enhanceV25SoldierWithV11Details')}
${extract('createEnhancedBotSoldierMesh')}
({ base: createBotSoldierMesh, enhanced: createEnhancedBotSoldierMesh });`;
const { base: baseFactory, enhanced: factory } = vm.runInNewContext(modelCode, { THREE });
assert.equal((source.match(/createEnhancedBotSoldierMesh\(/g) || []).length, 4,
  'all three bot/stand-in creation sites use enhanced V25 rig');
const required = ['root', 'upperBody', 'head', 'leftHip', 'rightHip',
  'leftKnee', 'rightKnee', 'weaponPivot', 'muzzleFlash'];
let count = 0;
let sharedRefined=null,sharedFabric=null;
for (const team of ['blue', 'red']) {
  for (const role of ['assault', 'medic', 'engineer', 'sniper', 'heavy']) {
    const baseline = baseFactory(team, role);
    const model = factory(team, role);
    for (const [part, difference] of [
      // V26/V26B adds production-quality layers on top of V25+V11.
      // Exact deltas protect against removing these approved details.
      ['root', 2],
      ['upperBody', role === 'medic' ? 17 : 16],
      ['head', 11],
      ['leftHip', 3],
      ['rightHip', 3],
      ['leftKnee', 3],
      ['rightKnee', 3],
      ['weaponPivot', role === 'sniper' ? 6 : 7]
    ]) {
      assert.equal(model[part].children.length - baseline[part].children.length, difference,
        `${team}/${role} V11 detail count ${part}`);
    }
    assert.ok(model.leftHip.children.at(-1).position.x < 0, 'left cargo pocket outside thigh');
    assert.ok(model.rightHip.children.at(-1).position.x > 0, 'right cargo pocket outside thigh');
    assert.ok(model.head.children.length > baseline.head.children.length,
      'V26 helmet enhancements remain attached to original V25 head pivot');
    for(const [part,name] of [['head','head'],['upperBody','carrier'],['leftHip','trouser'],['rightHip','trouser'],['leftKnee','boot'],['rightKnee','boot']]){
      const group=model[part].children.find(p=>p.name==='v99_'+name);
      assert.ok(group&&group.children.length>=3,team+'/'+role+' V99 detail '+part);
      assert.ok(group.children.every(p=>p.parent===group&&!p.castShadow),'V99 details remain visual only');
    }
    const flatten=(n)=>[n,...n.children.flatMap(flatten)];
    const refined=flatten(model.root).filter(n=>n.name==='v100_anatomy');
    assert.equal(refined.length,11,team+'/'+role+' shaped body surfaces');
    assert.ok(refined.every(n=>n.geometry&&n.geometry!==n.args[0]),'enhanced shapes replace base primitives');
    assert.ok(!flatten(baseline.root).some(n=>n.name==='v100_anatomy'),'base V25 remains unchanged');
    const thigh=refined.find(n=>n.parent===model.leftHip);
    assert.ok(thigh&&thigh.material,'textile applied on shaped thigh');
    if(sharedRefined)assert.equal(thigh.geometry,sharedRefined,'shape shared across all 10 models');
    sharedRefined=thigh.geometry;
    if(!sharedFabric)sharedFabric=thigh.material.args[0].map;
    assert.equal(thigh.material.args[0].map,sharedFabric,'same texture shared across teams and classes');
    assert.ok(!flatten(model.weaponPivot).some(n=>n.name==='v100_anatomy'||n.name==='v101_textile'),'weapon excluded from art pass');
    assert.ok(model.head.children.some(n=>n.name==='v105_role_helmet'),'role helmet geometry');
    assert.equal(model.upperBody.children.filter(n=>n.name==='v105_role_vest').length,2,'role vest fit');
    assert.ok(model.head.children.some(n=>n.name==='v106_face'),'fitted face');
    assert.equal(model.upperBody.children.filter(n=>/^v107_(support|trigger)_hand$/.test(n.name)).length,2,'two fitted gloves');
    assert.ok(model.upperBody.children.some(n=>n.name==='v107_fitted_equipment'),'rounded equipment');
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
console.log('PASS: 10/10 V25 soldier rigs with V11/V26/V26B/V99/V101/V104/V105/V145 details, head and muzzle hierarchy');
console.log('PASS: visible BOT muzzle world position and fallback');
