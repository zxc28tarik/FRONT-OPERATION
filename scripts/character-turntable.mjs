import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const output = path.resolve('test-artifacts/front-operation-browser');
fs.mkdirSync(output, { recursive: true });
const source = fs.readFileSync('index.html', 'utf8');

function extract(name) {
  const start = source.indexOf('function ' + name + '(');
  if (start < 0) throw Error('Missing ' + name);
  const open = source.indexOf('{', start);
  let depth = 0, quote = '', comment = '', escaped = false;
  for (let i = open; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && n === '/') { comment = ''; i++; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '/' && n === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { comment = 'block'; i++; continue; }
    if (c === "'" || c === '"' || c.charCodeAt(0) === 96) { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw Error('Unterminated function ' + name);
}

const soldierFunctions = [
  'let SOLDIER_SHARED = null;',
  'let SOLDIER_V11_DETAIL_GEOMETRIES = null;',
  extract('getSoldierSharedAssets'),
  extract('createLimbMesh'),
  extract('createBotSoldierMesh'),
  extract('enhanceV25SoldierWithV11Details'),
  extract('createEnhancedBotSoldierMesh'),
  'return { base: createBotSoldierMesh, enhanced: createEnhancedBotSoldierMesh, assets: getSoldierSharedAssets };'
].join('\n');
const pageHtml = '<!doctype html><html><head><meta charset="UTF-8">' +
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' +
  '<style>html,body{margin:0;background:#192232;color:#fff;font-family:Arial,sans-serif;overflow:hidden}' +
  'canvas{width:100vw;height:100vh;display:block}' +
  '#title{position:absolute;top:28px;left:30px;font-size:24px;font-weight:900;letter-spacing:1px}' +
  '#hint{position:absolute;top:65px;left:30px;font-size:14px;color:#dce5f4}' +
  '.caption{position:absolute;bottom:35px;font-size:24px;font-weight:900;background:#111827e6;padding:12px 20px;border-radius:12px;border:2px solid #9aa9bf}' +
  '#left{left:12%}#right{right:12%;border-color:#38bdf8}</style></head><body>' +
  '<canvas id="preview"></canvas><div id="title"></div><div id="hint">SAME V25 FOUNDATION • SAME LIGHT • SAME CAMERA • V11 + V26 + V127 DETAILS</div>' +
  '<div id="left" class="caption">ORIGINAL V25</div><div id="right" class="caption">V25 + V127 DETAILS</div>' +
  '</body></html>';
const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(pageHtml);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const report = { models: [], images: [], errors: [] };
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => report.errors.push(String(e)));
  await page.goto('http://127.0.0.1:' + server.address().port + '/', { waitUntil: 'load', timeout: 65000 });
  await page.evaluate(soldierCode => {
    const THREE = window.THREE;
    if (!THREE) throw Error('Three.js r128 did not load');
    const { base, enhanced, assets } = new Function('THREE', soldierCode)(THREE);
    const helmetGeo = assets().geos.helmetShell;
    const positions = helmetGeo.getAttribute('position'), normals = helmetGeo.getAttribute('normal');
    let outwardSum = 0, sampleCount = 0;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), z = positions.getZ(i), y = positions.getY(i);
      const radius = Math.hypot(x, z);
      if (radius < 0.095 || y < -0.03 || y > 0.115) continue;
      outwardSum += x * normals.getX(i) + z * normals.getZ(i);
      sampleCount++;
    }
    if (sampleCount < 20 || outwardSum <= 0) {
      throw Error('Helmet shell winding is inverted; exterior dome may be invisible: ' + outwardSum + ' / ' + sampleCount);
    }
    const canvas = document.getElementById('preview');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x707c88);
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 30);
    camera.position.set(0, 1.32, 4.65);
    camera.lookAt(0, 0.9, 0);
    scene.add(new THREE.HemisphereLight(0xddeeff, 0x28313a, 1.45));
    const key = new THREE.DirectionalLight(0xfff1dc, 1.5);
    key.position.set(-2, 4, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe1ecff, 0.75);
    fill.position.set(3.5, 3.0, -4.5);
    scene.add(fill);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 28),
      new THREE.MeshStandardMaterial({ color: 0x65717a, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.03;
    ground.receiveShadow = true;
    scene.add(ground);
    const models = new THREE.Group();
    scene.add(models);
    const countMeshes = obj => { let n = 0; obj.traverse(o => { if (o.isMesh) n++; }); return n; };
    window.__foCharacterPreview = {
      change(role, angle, team) {
        while (models.children.length) models.remove(models.children[0]);
        const original = base(team, role), improved = enhanced(team, role);
        const rotation = angle === 'back' ? Math.PI : angle === 'right' ? Math.PI / 2 : 0;
        original.root.position.x = -0.82;
        improved.root.position.x = 0.82;
        original.root.rotation.y = rotation;
        improved.root.rotation.y = rotation;
        models.add(original.root, improved.root);
        document.getElementById('title').textContent =
          'FRONT OPERATION / ' + team.toUpperCase() + ' ' + role.toUpperCase() + ' / ' + angle.toUpperCase();
        renderer.render(scene, camera);
        return {
          original: countMeshes(original.root),
          enhanced: countMeshes(improved.root),
          ...(() => {
            let input=0,output=0,invalid=0;
            improved.root.traverse(o=>{
              if(o.userData.v104OriginalMeshes){input+=o.userData.v104OriginalMeshes;output+=o.children.length;}
              if(o.name==='v104_batch'){
                const p=o.geometry.getAttribute('position'),n=o.geometry.getAttribute('normal');
                if(!p.array.every(Number.isFinite)||!n.array.every(Number.isFinite)||!o.geometry.boundingBox)invalid++;
              }
            });
            const h=improved.head.children.find(n=>n.name==='v105_role_helmet');
            const v=improved.upperBody.children.filter(n=>n.name==='v105_role_vest');
            return {detailInput:input,detailOutput:output,invalidBatches:invalid,roleHelmet:!!h,roleVests:v.length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
          })(),
          headY: improved.head.position.y + improved.upperBody.position.y
        };
      }
    };
    renderer.render(scene, camera);
  }, soldierFunctions);
  for (const team of ['blue', 'red']) {
    for (const role of ['assault', 'medic', 'engineer', 'sniper', 'heavy']) {
      const views = ['front', 'right', 'back'];
      for (const angle of views) {
        const stats = await page.evaluate(
          args => window.__foCharacterPreview.change(args.role, args.angle, args.team),
          { team, role, angle }
        );
        if(stats.detailInput<70||stats.detailOutput>=stats.detailInput*.45||stats.invalidBatches!==0)throw Error('Invalid V104 batches '+JSON.stringify(stats));
        if(!stats.roleHelmet||stats.roleVests!==2)throw Error('Missing V105 role geometry');
        if(stats.enhanced<=stats.original||stats.enhanced>stats.original+105)throw Error('Unexpected '+role+' model size');
        if (Math.abs(stats.headY - 1.54) > 0.001) throw Error('Head geometry regression');
        const image = 'character-' + team + '-' + role + '-' + angle + '.png';
        await page.screenshot({ path: path.join(output, image), animations: 'disabled' });
        report.images.push(image);
        report.models.push({ team, role, angle, ...stats });
      }
    }
  }
  if (report.errors.length) throw Error(report.errors.join(' | '));
  console.log('PASS character visual WebGL compare: ' + report.images.length + ' screenshots, 10 class/team models');
} catch (e) {
  process.exitCode = 1;
  report.errors.push(String(e));
  console.error('FAIL character visual WebGL compare: ' + String(e));
} finally {
  fs.writeFileSync(path.join(output, 'character-report.json'), JSON.stringify(report, null, 2));
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
