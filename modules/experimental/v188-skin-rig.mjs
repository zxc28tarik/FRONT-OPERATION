// V183–V188 experimental visual-only rig. Not imported by index.html.
import * as THREE from 'three';
const Y=new THREE.Vector3(0,1,0);
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const point=(root,node)=>root.worldToLocal(node.getWorldPosition(new THREE.Vector3()));
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
 const extremities=['left','right'].flatMap(side=>[{kind:'leg',nodes:leg(side),radii:[.073,.059,.048]},{kind:'arm',nodes:arm(side),radii:[.057,.049,.035]}]).map(c=>{
  if(c.nodes.some(n=>!n))throw Error('V188 rig missing '+c.kind+' pivot');
  return {...c,points:()=>c.nodes.map(n=>point(root,n))};
 });
 const torsoPoint=y=>root.worldToLocal(model.upperBody.localToWorld(new THREE.Vector3(0,y,0)));
 return [...extremities,{kind:'torso',radii:[.135,.159,.129],points:()=>[new THREE.Vector3(0,.88,0),torsoPoint(.15),torsoPoint(.45)]}];
}
function segmentBasis(a,b){
 const d=b.clone().sub(a),length=d.length();
 if(length<.0001)throw Error('V188 degenerate segment');
 return {length,q:new THREE.Quaternion().setFromUnitVectors(Y,d.normalize())};
}
export function createExperimentalRig(model,{radial=16,steps=24}={}){
 if(radial<8||steps<12||steps%2)throw Error('Invalid rig resolution');
 const root=model.root;root.updateMatrixWorld(true);
 const limbs=chains(model),bones=[],bindLengths=[],pos=[],uv=[],skinIndex=[],skinWeight=[],indices=[];
 for(const limb of limbs){
  const p=limb.points(),base=bones.length;
  for(let j=0;j<2;j++){
   const b=new THREE.Bone(),basis=segmentBasis(p[j],p[j+1]);
   b.name='v188_'+limb.kind+'_'+base+'_'+j;b.position.copy(p[j]);b.quaternion.copy(basis.q);
   bones.push(b);bindLengths.push(basis.length);
  }
  const offset=pos.length/3;
  for(let j=0;j<=steps;j++){
   const t=j/steps,seg=t<=.5?0:1,u=seg===0?t*2:(t-.5)*2;
   const center=p[seg].clone().lerp(p[seg+1],u);
   const qa=segmentBasis(p[0],p[1]).q,qb=segmentBasis(p[1],p[2]).q;
   const bend=ease((t-.36)/.28),q=qa.clone().slerp(qb,bend);
   const r=THREE.MathUtils.lerp(limb.radii[seg],limb.radii[seg+1],u)*(1+.026*Math.sin(j*2.4));
   const w=ease((t-.34)/.32);
   for(let k=0;k<=radial;k++){
    const angle=k/radial*Math.PI*2;
    const v=new THREE.Vector3(Math.cos(angle)*r,0,Math.sin(angle)*r*(limb.kind==='torso'?.70:.94)).applyQuaternion(q).add(center);
    pos.push(v.x,v.y,v.z);uv.push(k/radial,t);
    skinIndex.push(base,base+1,0,0);skinWeight.push(1-w,w,0,0);
    if(j<steps&&k<radial){
     const a=offset+j*(radial+1)+k,b=a+radial+1;
     indices.push(a,b,a+1,b,b+1,a+1);
    }
   }
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndex,4));
 geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeight,4));
 geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();
 const source=model.leftHip.children.find(n=>n.userData.v129Sculpted).material;
 const material=source.clone();material.skinning=true;material.vertexColors=false;
 const mesh=new THREE.SkinnedMesh(geometry,material);
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
 const setEnabled=enabled=>{
  mesh.visible=!!enabled;
  for(const item of hidden)item.n.visible=enabled?false:item.visible;
  if(enabled)update();
 };
 const update=()=>{
  root.updateMatrixWorld(true);
  limbs.forEach((limb,i)=>{
   const p=limb.points();
   for(let j=0;j<2;j++){
    const k=i*2+j,b=bones[k],basis=segmentBasis(p[j],p[j+1]);
    b.position.copy(p[j]);b.quaternion.copy(basis.q);b.scale.set(1,basis.length/bindLengths[k],1);
   }
  });
  mesh.updateMatrixWorld(true);skeleton.update();
 };
 const dispose=()=>{setEnabled(false);root.remove(mesh);geometry.dispose();material.dispose();skeleton.dispose?.();};
 return {mesh,bones,update,dispose,limbs,geometry,setEnabled};
}
