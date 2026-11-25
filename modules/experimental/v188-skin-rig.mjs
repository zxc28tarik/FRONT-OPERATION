// V223–V228 adaptive experimental visual-only rig. Not imported by index.html.
import * as THREE from 'three';
const Y=new THREE.Vector3(0,1,0);
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Read root-local positions without walking every accessory and weapon mesh.
function localPoint(root,node,out){
 out.set(0,0,0);
 for(let n=node;n&&n!==root;n=n.parent){
  if(n.matrixAutoUpdate)n.updateMatrix();
  out.applyMatrix4(n.matrix);
 }
 return out;
}
function chains(model){
 const root=model.root;
 const arm=side=>{
  const sign=side==='left'?-1:1;
  const shoulder=model.upperBody.children.find(n=>n.userData.v154Joint==='shoulder'&&Math.sign(n.position.x)===sign);
  const elbow=model.upperBody.children.find(n=>n.userData.v154Joint==='elbow'&&Math.sign(n.position.x)===sign);
  const hand=model.upperBody.children.find(n=>n.name===(side==='left'?'v107_support_hand':'v107_trigger_hand'));
  return [shoulder,elbow,hand];
 };
 const leg=side=>[model[side+'Hip'],model[side+'Knee'],model[side+'Knee'].children.find(n=>n.name==='v132_ankle')];
 const extremities=[...['left','right'].map(side=>({kind:'leg',nodes:leg(side),radii:[.073,.059,.048]})),...['left','right'].map(side=>({kind:'arm',nodes:arm(side),radii:[.057,.049,.035]}))].map(c=>{
  if(c.nodes.some(n=>!n))throw Error('V188 rig missing '+c.kind+' pivot');
  const points=c.nodes.map(()=>new THREE.Vector3());
  return {...c,points:()=>c.nodes.map((n,i)=>localPoint(root,n,points[i]))};
 });
 const torsoPoints=[new THREE.Vector3(0,.88,0),new THREE.Vector3(),new THREE.Vector3()];
 return [...extremities,{kind:'torso',radii:[.135,.159,.129],points:()=>{
  if(model.upperBody.matrixAutoUpdate)model.upperBody.updateMatrix();
  torsoPoints[1].set(0,.15,0).applyMatrix4(model.upperBody.matrix);
  torsoPoints[2].set(0,.45,0).applyMatrix4(model.upperBody.matrix);
  return torsoPoints;
 }}];
}
function segmentBasis(a,b){
 const d=b.clone().sub(a),length=d.length();
 if(length<.0001)throw Error('V188 degenerate segment');
 return {length,q:new THREE.Quaternion().setFromUnitVectors(Y,d.normalize())};
}
// Round the joint centerline rather than forcing each ring through a sharp kink.
const startBend=.34,endBend=.66;
export function rigCenter(points,t,out=new THREE.Vector3()){
 const [a,b,c]=points;
 if(t<=startBend)return out.copy(a).lerp(b,t*2);
 if(t>=endBend)return out.copy(b).lerp(c,(t-.5)*2);
 const u=(t-startBend)/(endBend-startBend),v=1-u;
 // Quadratic Bezier endpoints lie on the two segments. A bent elbow remains continuous.
 return out.copy(a).multiplyScalar((1-startBend*2)*v*v)
  .addScaledVector(b,startBend*2*v*v+2*u*v+(2-endBend*2)*u*u)
  .addScaledVector(c,(endBend*2-1)*u*u);
}
export function createExperimentalRig(model,{radial=16,steps=24}={}){
 if(radial<8||steps<12||steps%2)throw Error('Invalid rig resolution');
 const root=model.root;root.updateMatrixWorld(true);
 const limbs=chains(model),bones=[],pos=[],uv=[],skinIndex=[],skinWeight=[],indices=[],groups=[],seams=[],plans=[];
 for(const limb of limbs){
  const p=limb.points(),base=bones.length;
  const ba=segmentBasis(p[0],p[1]),bb=segmentBasis(p[1],p[2]),qa=ba.q,qb=bb.q;
  const makeBone=(name,center,q)=>{
   const bone=new THREE.Bone();bone.name=name;bone.position.copy(center);bone.quaternion.copy(q);bones.push(bone);return bones.length-1;
  };
  const first=makeBone('v222_'+limb.kind+'_proximal',p[0],qa),last=makeBone('v222_'+limb.kind+'_distal',p[1],qb);
  const jointBones=[],ringIds=[];
  plans.push({limb,first,last,jointBones,lengths:[ba.length,bb.length]});
  const offset=pos.length/3,indexStart=indices.length;
  const source=limb.kind==='leg'?model.leftHip.children.find(n=>n.userData.v129Sculpted):model.upperBody.children.find(n=>n.userData.v129Sculpted&&Math.abs(n.position.x)>.1);
  const torsoSources=model.upperBody.children.filter(n=>n.userData.v129Sculpted&&Math.abs(n.position.x)<.02&&n.position.y>.05);
  const torsoWidth=torsoSources.length?Math.max(...torsoSources.map(n=>n.scale.x)):1;
  const torsoDepth=torsoSources.length?Math.max(...torsoSources.map(n=>n.scale.z)):1;
  const width=limb.kind==='torso'?torsoWidth:(source?.scale.x||1);
  const depth=limb.kind==='torso'?torsoDepth:(source?.scale.z||1);
  for(let j=0;j<=steps;j++){
   const t=j/steps,seg=t<=.5?0:1,u=seg===0?t*2:(t-.5)*2;
   const center=rigCenter(p,t);
   const bend=ease((t-startBend)/(endBend-startBend)),q=qa.clone().slerp(qb,bend);
   // Straight portions share one length-scaled bone. Only the curved transition needs ring bones.
   let id=t<=startBend?first:t>=endBend?last:makeBone('v222_'+limb.kind+'_bend_'+j,center,q);
   if(id!==first&&id!==last)jointBones.push({id,t,bend});
   ringIds.push(id);
   const joint=Math.exp(-(((t-.5)/.15)**2));
   const fullness=limb.kind==='arm'?.075:limb.kind==='leg'?.085:.025;
   const proximal=limb.kind==='arm'?.055:limb.kind==='leg'?.045:0;
   const r=THREE.MathUtils.lerp(limb.radii[seg],limb.radii[seg+1],u)*(1+.018*Math.sin(t*Math.PI*10)+fullness*joint+proximal*Math.exp(-((t/.14)**2)));
   for(let k=0;k<=radial;k++){
    const angle=k/radial*Math.PI*2;
    const v=new THREE.Vector3(Math.cos(angle)*r*width,0,Math.sin(angle)*r*depth*(limb.kind==='torso'?.70:.94)).applyQuaternion(q).add(center);
    pos.push(v.x,v.y,v.z);uv.push(k/radial,t);
    skinIndex.push(id,0,0,0);skinWeight.push(1,0,0,0);
    if(j<steps&&k<radial){
     const a=offset+j*(radial+1)+k,b=a+radial+1;
     indices.push(a,b,a+1,b,b+1,a+1);
    }
   }
   seams.push([offset+j*(radial+1),offset+j*(radial+1)+radial]);
  }
  // Close both tube ends; existing armor and boots still overlap these surfaces.
  for(const end of [0,steps]){
   const ring=offset+end*(radial+1),center=pos.length/3;
   const v=p[end===0?0:2];pos.push(v.x,v.y,v.z);uv.push(.5,end===0?0:1);
   skinIndex.push(ringIds[end],0,0,0);skinWeight.push(1,0,0,0);
   for(let k=0;k<radial;k++){
    if(end===0)indices.push(center,ring+k,ring+k+1);
    else indices.push(center,ring+k+1,ring+k);
   }
  }
  const materialIndex=limb.kind==='leg'?0:1;
  const prev=groups.at(-1);
  if(prev&&prev.materialIndex===materialIndex)prev.count+=indices.length-indexStart;
  else groups.push({start:indexStart,count:indices.length-indexStart,materialIndex});
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndex,4));
 geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeight,4));
 geometry.setIndex(indices);geometry.computeVertexNormals();
 const normal=geometry.getAttribute('normal'),n1=new THREE.Vector3(),n2=new THREE.Vector3();
 for(const [a,b] of seams){
  n1.fromBufferAttribute(normal,a);n2.fromBufferAttribute(normal,b);
  n1.add(n2).normalize();normal.setXYZ(a,n1.x,n1.y,n1.z);normal.setXYZ(b,n1.x,n1.y,n1.z);
 }
 normal.needsUpdate=true;geometry.computeBoundingSphere();
 for(const g of groups)geometry.addGroup(g.start,g.count,g.materialIndex);
 const pants=model.leftHip.children.find(n=>n.userData.v129Sculpted).material;
 const jacket=model.upperBody.children.find(n=>n.userData.v129Sculpted&&Math.abs(n.position.x)>.1).material;
 const materials=[pants,jacket].map(source=>{const m=source.clone();m.skinning=true;m.vertexColors=false;return m;});
 const mesh=new THREE.SkinnedMesh(geometry,materials);
 mesh.name='v188_experimental_skin';mesh.frustumCulled=false;
 for(const bone of bones)mesh.add(bone);
 root.add(mesh);root.updateMatrixWorld(true);
 const skeleton=new THREE.Skeleton(bones);mesh.bind(skeleton);
 // Attached binding keeps root transforms independent from the visual pose.
 mesh.visible=false;
 // Toggle only the cloth replacement. Armor, head, hands, boots, IFF, and weapon stay attached.
 const hidden=[];
 root.traverse(n=>{
  if(n===mesh||!n.isMesh)return;
  if(n.userData.v154Joint||n.userData.v129Sculpted)hidden.push({n,visible:n.visible});
 });
 let enabledState=false,disposed=false;
 const setEnabled=enabled=>{
  if(disposed)throw Error('Disposed experimental rig');
  enabled=!!enabled;
  if(enabled===enabledState)return;
  enabledState=enabled;
  if(enabled){root.add(mesh);mesh.visible=true;for(const item of hidden)item.n.visible=false;update();}
  else{mesh.visible=false;root.remove(mesh);for(const item of hidden)item.n.visible=item.visible;}
 };
 // Disabled comparison must not traverse the experimental skeleton.
 root.remove(mesh);
 const update=()=>{
  root.updateWorldMatrix(true,false);
  for(const plan of plans){
   const p=plan.limb.points(),a=segmentBasis(p[0],p[1]),b=segmentBasis(p[1],p[2]);
   const first=bones[plan.first],last=bones[plan.last];
   first.position.copy(p[0]);first.quaternion.copy(a.q);first.scale.y=a.length/plan.lengths[0];
   last.position.copy(p[1]);last.quaternion.copy(b.q);last.scale.y=b.length/plan.lengths[1];
   for(const ring of plan.jointBones){
    const bone=bones[ring.id];rigCenter(p,ring.t,bone.position);
    bone.quaternion.copy(a.q).slerp(b.q,ring.bend);
   }
  }
  // Explicit diagnostic updates work when detached as well; retain the original bind frame.
  if(mesh.parent)mesh.updateMatrixWorld(true);
  else{root.add(mesh);mesh.updateMatrixWorld(true);root.remove(mesh);}
  skeleton.update();
 };
 const dispose=()=>{if(disposed)return;setEnabled(false);root.remove(mesh);geometry.dispose();materials.forEach(m=>m.dispose());skeleton.dispose?.();disposed=true;};
 return {mesh,bones,update,dispose,limbs,geometry,setEnabled,get enabled(){return enabledState;}};
}
