import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const out=path.resolve('test-artifacts/front-operation-f316');fs.mkdirSync(out,{recursive:true});
const baseline=execFileSync('git',['show','cb6865b06763fa9a7e35f3a61c5d21f7e36c58c2:index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const h332Tag=/      \/\/ FO_H332_BEGIN ([^\n]+)\n[\s\S]*?      \/\/ FO_H332_END \1\n/g;
const h332Originals=JSON.parse(fs.readFileSync('scripts/h332-original-blocks.json','utf8'));
const stripH332=h=>h.replace(h332Tag,(_,id)=>{if(!Object.hasOwn(h332Originals,id))throw Error('Unknown H332 block '+id);return h332Originals[id];});
const h328Tag=/      \/\/ FO_H328_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_H328_END [^\n]+\n/g;
const g324Tag=/      \/\/ FO_G324_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_G324_END [^\n]+\n/g;
const gTag=/      \/\/ FO_G320_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_G320_END [^\n]+\n/g;
const html=stripH332(fs.readFileSync('index.html','utf8').replace(/^ *\/\/ FO_BOT02_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_BOT02_END \1\n/gm,'').replace('let directCombat=botMustContinueContact(','const directCombat=botMustContinueContact(').replace(/^ *\/\/ FO_V344_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V344_END \1\n/gm,'').replace(/^ *\/\/ FO_V343_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V343_END \1\n/gm,'').replace(/^ *\/\/ FO_V342_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V342_END \1\n/gm,'').replace(/^ *\/\/ FO_V341_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V341_END \1\n/gm,'').replace(/^ *\/\/ FO_V340_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V340_END \1\n/gm,'').replace(/^ *\/\/ FO_V339_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V339_END \1\n/gm,'').replace(/^ *\/\/ FO_V336_BEGIN (\S+)\n[\s\S]*?^ *\/\/ FO_V336_END \1\n/gm,'').replace(/    \/\* FO_I335_BEGIN responsive-ui \*\/\n[\s\S]*?    \/\* FO_I335_END responsive-ui \*\/\n/g,'')).replace(h328Tag,'').replace(g324Tag,'').replace(gTag,'');
const tag=/      \/\/ FO_F316_BEGIN [^\n]+\n[\s\S]*?      \/\/ FO_F316_END [^\n]+\n/g;
assert.equal(html.replace(tag,''),baseline,'F must not change any non-presentation source');
const source=html.match(/      \/\/ FO_F316_BEGIN helper\n([\s\S]*?)      \/\/ FO_F316_END helper/)[1];
const definitions=html.slice(html.indexOf('      const DRONE_CONFIG ='),html.indexOf('      // 2. PROCEDURAL WEB AUDIO'));
const {DRONE_CONFIG,WEAPONS,CLASSES}=new Function(definitions+';return {DRONE_CONFIG,WEAPONS,CLASSES}')();
const [status,begin,restore]=new Function(source+';return [foF316EquipmentStatus,foF316BeginEquipmentRender,foF316RestoreEquipmentRender]')();
const expected={assault:['hk416','p320','knife','m67'],medic:['mp7','p320','knife','medkit'],engineer:['mp7','p320','knife','drone'],sniper:['mrad','glock18c','knife',null],heavy:['minimi','p320','knife','carlgustaf']};
let checks=0;const ok=(v,m)=>{assert(v,m);checks++};
for(const [id,slots] of Object.entries(expected)){
 assert.deepEqual(Object.values(CLASSES[id].slots),slots);
 const a={classId:id,slot:4,alive:true,team:'blue',ammoState:{},reloading:false};
 for(const w of slots.filter(Boolean))a.ammoState[w]={mag:WEAPONS[w].magSize,reserve:WEAPONS[w].reserveMax};
 const full=status(a,CLASSES,WEAPONS,1,false);
 ok(full.state===(id==='sniper'?'none':'ready'),id+' ready');
 const w=slots[3]&&WEAPONS[slots[3]];
 if(w&&w.category!=='drone')for(let mag=0;mag<=w.magSize;mag++)for(let reserve=0;reserve<=w.reserveMax;reserve++)for(const loading of [true,false]){
  a.ammoState[w.id]={mag,reserve};a.reloading=loading;
  const before=JSON.stringify(a),p=status(a,CLASSES,WEAPONS);
  ok(p.state===(w.category==='rocket'&&loading?'loading':mag>0?'ready':reserve>0?'reload':'empty'),'equipment status');
  ok(JSON.stringify(a)===before,'read-only');
 }
}
for(const charge of [0,1])for(const active of [false,true])ok(status({classId:'engineer'},CLASSES,WEAPONS,charge,active).state===(active?'active':charge?'ready':'empty'),'drone state');
const actor={classId:'engineer',slot:4,alive:true,team:'blue'},refs={foF316DroneStatus:{scale:{x:1}}},drone={getRemainingCharges:()=>0};
const kits=[{team:'blue',life:1,ring:{material:{opacity:.55}}},{team:'red',life:1,ring:{material:{opacity:.55}}}];
for(let i=0;i<100;i++){begin(actor,refs,kits,drone);ok(refs.foF316DroneStatus.scale.x===.16,'bar');ok(kits[0].ring.material.opacity<.55&&kits[1].ring.material.opacity===.55,'ring');restore();ok(refs.foF316DroneStatus.scale.x===1&&kits[0].ring.material.opacity===.55,'restore');}
console.log('F316 source checks',checks);
const anchor='      window.onload = function () {';
const hook=`
window.__foF316QA={
 ready:()=>!!FO_MAPS.deathmatch,
 test(){
  const results=[],shots=[];
  camera.position.set(0,1.62,35);camera.lookAt(0,1.62,0);viewmodelGroup.visible=true;
  const read=()=>({badge:document.getElementById('hud-class-badge').textContent,accent:document.getElementById('hud-class-badge').style.color,
   label:document.getElementById('slot-sub-4').textContent,opacity:document.getElementById('slot-box-4').style.opacity,
   ammo:document.getElementById('ammo-mag').textContent,weapon:document.getElementById('hud-weapon-name').textContent});
  const snap=()=>JSON.stringify({classId:player.classId,slot:player.slot,ammo:player.ammoState,reloading:player.reloading,charge:droneSystem.getRemainingCharges('player')});
  const record=(classId,slot,caseName)=>{
    const prior=snap();updateHUD();const unchanged=prior===snap();
    results.push({classId,slot,caseName,unchanged,...read()});
  };
  const draw=()=>{renderer.render(scene,camera);renderer.getContext().finish();return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,image:canvas.toDataURL('image/png')};};
  for(const classId of Object.keys(CLASSES)){
    initPlayerLoadout(classId);player.alive=true;droneSystem.grantLifeCharge('player');
    for(const slot of [1,2,3,4]){
      if(!CLASSES[classId].slots[slot]){record(classId,slot,'absent');continue;}
      switchSlot(slot);record(classId,slot,'full');
    }
    const id=CLASSES[classId].slots[4];
    if(id==='drone'){
      droneSystem.charges.player=0;record(classId,4,'empty');
      const bar=vmRefs.foF316DroneStatus,before=bar.scale.x;
      const pre=draw();let post,changed,restored;
      try{foF316BeginEquipmentRender(player,vmRefs,[],droneSystem);changed=bar.scale.x===before*.16;post=draw();}
      finally{foF316RestoreEquipmentRender();restored=bar.scale.x===before;}
      shots.push({name:'controller',pre,post,changed,restored});
      droneSystem.grantLifeCharge('player');record(classId,4,'restored');
    }else if(id){
      const ammo=player.ammoState[id];ammo.mag=0;record(classId,4,'empty-mag');
      if(id==='carlgustaf'){player.reloading=true;record(classId,4,'loading');player.reloading=false;ammo.reserve=0;record(classId,4,'empty-all');}
    }
  }
  // Actual Three.js healing entities, existing lifetime and geometry, no simulation advance.
  deployMedkit(new THREE.Vector3(0,0,35),player.team);
  deployMedkit(new THREE.Vector3(3,0,35),player.team==='blue'?'red':'blue');
  const [friend,enemy]=activeMedkits.slice(-2);friend.life=1;enemy.life=1;
  camera.position.set(0,3.2,40);camera.lookAt(1.5,0,35);
  const oldF=friend.ring.material.opacity,oldE=enemy.ring.material.opacity;
  const pre=draw();let post,changed,restored;
  try{foF316BeginEquipmentRender(player,vmRefs,[friend,enemy],droneSystem);changed=friend.ring.material.opacity<oldF&&enemy.ring.material.opacity===oldE;post=draw();}
  finally{foF316RestoreEquipmentRender();restored=friend.ring.material.opacity===oldF&&enemy.ring.material.opacity===oldE;}
  shots.push({name:'medkit',pre,post,changed,restored});
  clearAllMatchEntities();
  return {results,shots};
 }
};
`;
const server=createServer((req,res)=>{
 if(req.url==='/three.min.js'){res.writeHead(200,{'content-type':'text/javascript'});res.end(fs.readFileSync('node_modules/three/build/three.min.js'));return;}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8'});
 res.end(html.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','/three.min.js').replace(anchor,hook+anchor));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1000,height:650},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://cdn.tailwindcss.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load',timeout:80000});
 await page.waitForFunction(()=>window.__foF316QA?.ready());
 const report=await page.evaluate(()=>window.__foF316QA.test());
 const rows=report.results;assert(rows.every(r=>r.unchanged));
 for(const [id,slots] of Object.entries(expected))for(let slot=1;slot<=4;slot++){
  const r=rows.find(r=>r.classId===id&&r.slot===slot&&r.caseName===(slots[slot-1]?'full':'absent'));assert(r,id+' slot '+slot);
  if(slots[slot-1])assert.equal(r.weapon,WEAPONS[slots[slot-1]].name);
 }
 const row=(id,c)=>rows.find(r=>r.classId===id&&r.caseName===c);
 assert.equal(row('assault','empty-mag').label,'0/2');assert.equal(row('medic','empty-mag').label,'0/3');
 assert.equal(row('heavy','empty-mag').label,'0+2');assert.equal(row('heavy','loading').label,'DOLUYOR');assert.equal(row('heavy','empty-all').label,'0+0');
 assert.equal(row('sniper','absent').label,'—');assert.match(row('engineer','empty').label,/KULLANILDI/);assert.match(row('engineer','restored').label,/HAZIR/);
 assert.equal(new Set(Object.keys(expected).map(id=>row(id,'full').accent)).size,5);
 for(const s of report.shots){assert(s.changed&&s.restored,s.name);assert(s.pre.calls>0);assert.equal(s.pre.calls,s.post.calls);assert.equal(s.pre.triangles,s.post.triangles);assert.notEqual(s.pre.image,s.post.image,s.name+' visible render difference');
  for(const k of ['pre','post']){fs.writeFileSync(path.join(out,s.name+'-'+k+'.png'),Buffer.from(s[k].image.split(',')[1],'base64'));delete s[k].image;}
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'f316-report.json'),JSON.stringify({checks,...report,errors},null,2));
 console.log('F316 WebGL PASS',JSON.stringify({checks,...report},null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
