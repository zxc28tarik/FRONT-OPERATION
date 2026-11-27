'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const cut=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert(i>=0&&j>i,a);return html.slice(i,j);};
let n=0;const ok=(v,m)=>{assert(v,m);n++;};
const allowed=new Function(cut('function foGameplayInputAllowed(','      function gameplayInputAllowed(')+';return foGameplayInputAllowed;')();
for(const started of [false,true])for(const ended of [false,true])for(const paused of [false,true])for(const menu of [false,true])for(const score of [false,true])
 ok(allowed({started,ended},paused,menu,score)===(started&&!ended&&!paused&&menu&&score),'input gate');
const reset=new Function(cut('function foResetLifeState(','      function respawnPlayer(')+';return foResetLifeState;')();
const defaults=new Function('THREE',cut('const player = {','      function getCurrentWeapon(')+';return player;')({Vector3:class{}});
const dirty={...defaults};
for(const key of Object.keys(dirty)){
 if(['name','team','classId','slot','hp','maxHp','sp','maxSp','alive','kills','deaths','pos','vel','yaw','pitch','ammoState'].includes(key))continue;
 if(typeof dirty[key]==='number')dirty[key]=19;
 if(typeof dirty[key]==='boolean')dirty[key]=!dirty[key];
}
dirty.reloadStageTriggered={mid:true,end:true};dirty.kills=7;dirty.deaths=2;dirty.classId='sniper';
reset(dirty);
for(const key of Object.keys(dirty)){
 if(['name','team','classId','slot','hp','maxHp','sp','maxSp','alive','kills','deaths','pos','vel','yaw','pitch','ammoState'].includes(key))continue;
 ok(JSON.stringify(dirty[key])===JSON.stringify(defaults[key]),'fresh life '+key);
}
ok(dirty.kills===7&&dirty.deaths===2&&dirty.classId==='sniper','career and class preserved');
const makeElement=()=>{const handlers={},classes=new Set(['hidden']);return {handlers,style:{},classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x)},addEventListener:(n,f)=>{handlers[n]=f;},getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})};};
const els=new Map();const element=id=>{if(!els.has(id))els.set(id,makeElement());return els.get(id);};
const document={getElementById:element,pointerLockElement:null,hidden:false};
const canvas=makeElement(),window=makeElement();
let fires=0,classes=0,spots=0,rolls=0,paused=false;
const player={alive:true,grounded:true,vel:{y:0},yaw:0,pitch:0,scopeStage:0,ads:false};
const matchState={started:true,ended:false};
const droneSystem={isPlayerControlling:()=>true,playerDrone:{yaw:0,pitch:0},handlePlayerSpotKey:()=>spots++,handlePlayerRightClick(){},handlePlayerRecall(){}};
const source=cut('const touchMoveVec =','      window.addEventListener(\'resize\'');
const api=new Function('document','canvas','window','player','droneSystem','gameplayInputAllowed','sound','playerPrimaryAction','applyManualRecoilCompensation','getCurrentWeapon','updateSniperScopeUI','startReload','triggerCombatRoll','openClassMenu',
 'let mouseDownLeft=false;\n'+source+'\nreturn {reset:resetTouchControls,state:()=>({moveTouchId,lookTouchId,fireTouchId,upTouchId,downTouchId,touchDroneAlt,mouseDownLeft,x:touchMoveVec.x,y:touchMoveVec.y})};')(
 document,canvas,window,player,droneSystem,()=>!paused,{init(){}},()=>fires++,()=>{},()=>({id:'hk416'}),()=>{},()=>{},()=>rolls++,()=>classes++);
const e=(...ids)=>({changedTouches:ids.map(identifier=>({identifier,clientX:90,clientY:50})),preventDefault(){}});
const fire=element('btn-touch-fire').handlers,up=element('btn-touch-drone-up').handlers,down=element('btn-touch-drone-down').handlers,move=element('touch-move-zone').handlers,look=canvas.handlers;
fire.touchstart(e(0));ok(fires===1&&api.state().mouseDownLeft,'fire starts');
fire.touchstart(e(3));ok(fires===1,'second finger ignored');
fire.touchcancel(e(3));ok(api.state().mouseDownLeft,'unrelated cancel ignored');
fire.touchcancel(e(0));ok(!api.state().mouseDownLeft&&api.state().fireTouchId===null,'fire cancel');
fire.touchstart(e(4));fire.touchend(e(4));ok(!api.state().mouseDownLeft,'fire normal end');
look.touchstart(e(1));ok(api.state().lookTouchId===1,'look starts');
look.touchcancel(e(2));ok(api.state().lookTouchId===1,'unrelated look cancel');
look.touchcancel(e(1));ok(api.state().lookTouchId===null,'look cancelled');
look.touchstart(e(8));look.touchend(e(8));ok(api.state().lookTouchId===null,'look can restart');
move.touchstart(e(2));move.touchmove(e(2));ok(api.state().x>0,'joystick moved');
move.touchcancel(e(2));ok(api.state().x===0&&api.state().moveTouchId===null,'joystick cancelled');
up.touchstart(e(5));ok(api.state().touchDroneAlt===1,'up');
down.touchstart(e(6));ok(api.state().touchDroneAlt===0,'simultaneous directions neutral');
up.touchcancel(e(5));ok(api.state().touchDroneAlt===-1,'down remains after up cancel');
down.touchend(e(6));ok(api.state().touchDroneAlt===0,'alt release');
up.touchstart(e(9));api.reset();ok(api.state().touchDroneAlt===0&&api.state().upTouchId===null,'global reset');
element('btn-touch-class').handlers.click();ok(classes===1,'shared class menu');
paused=true;fire.touchstart(e(3));look.touchstart(e(3));move.touchstart(e(3));up.touchstart(e(3));element('btn-touch-roll').handlers.click();element('btn-touch-drone-spot').handlers.click();
ok(fires===2&&api.state().fireTouchId===null&&api.state().lookTouchId===null&&api.state().moveTouchId===null&&api.state().touchDroneAlt===0&&rolls===0&&spots===0,'blocked menu controls');
const mouseCode=cut("window.addEventListener('mousedown'","      window.addEventListener('mouseup'");
let mouseFire=0,mouseAllowed=true;
new Function('window','canvas','document','gameplayInputAllowed','sound','isFoSpectating','playerPrimaryAction','player','droneSystem','getCurrentWeapon',
 'let mouseDownLeft=false,mouseDownRight=false,isDraggingLook=false,prevDragX=0,prevDragY=0;\n'+mouseCode)(
 window,canvas,document,()=>mouseAllowed,{init(){}},()=>false,()=>mouseFire++,player,droneSystem,()=>({}));
window.handlers.mousedown({button:0,target:element('btn-score-close')});ok(mouseFire===0,'UI click not fire');
mouseAllowed=false;document.pointerLockElement=canvas;window.handlers.mousedown({button:0,target:canvas});ok(mouseFire===0,'scoreboard blocks locked mouse');
mouseAllowed=true;window.handlers.mousedown({button:0,target:canvas});ok(mouseFire===1,'normal fire retained');
ok(html.includes("window.addEventListener('blur',clearGameplayInputs)")&&html.includes("if(document.hidden)clearGameplayInputs()"),'focus cleanup wired');
ok(html.includes('clearGameplayInputs();\n              updateScoreboardUI();'),'scoreboard stops held fire');
ok(html.includes('foResetLifeState(player);')&&html.includes('camera.updateProjectionMatrix();camera.updateMatrixWorld(true);'),'respawn reset and camera sync');
ok(html.includes("document.getElementById('btn-touch-class').addEventListener('click',openClassMenu);"),'mobile delegates to actual class handler');
console.log('Critical 07–10 PASS:',n,'checks; DOM adapter, not real browser.');
