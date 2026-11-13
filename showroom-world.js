"use strict";
/* Ambient Three.js architecture lives behind the real branded HTML exhibitions.
   Core navigation, previews and case studies work without WebGL. */
const colors={
 entrance:"#fb9169",commerce:"#e3aa78",services:"#89a8ae",
 hospitality:"#f17c59",culture:"#a791d8",decks:"#95b7ec",
 lab:"#94a8ef",contact:"#fb9169"
};
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const mobile=()=>innerWidth<=720;
async function bootWorld(){
  if(navigator.connection?.saveData||navigator.hardwareConcurrency && navigator.hardwareConcurrency<=2)return;
  if(!document.createElement("canvas").getContext)return;
  let THREE;
  try{THREE=await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js")}
  catch{
    try{THREE=await import("https://unpkg.com/three@0.180.0/build/three.module.js")}
    catch{return}
  }
  try{createWorld(THREE)}catch(e){console.warn("3D ambient environment unavailable:",e)}
}
function createWorld(T){
  const canvas=document.getElementById("worldCanvas");
  const renderer=new T.WebGLRenderer({
    canvas,alpha:true,antialias:!mobile(),powerPreference:"low-power",precision:"mediump"
  });
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.13;
  const scene=new T.Scene();
  scene.fog=new T.FogExp2(0x0b121a,.028);
  const camera=new T.PerspectiveCamera(51,1,.1,150);
  const metal=new T.MeshStandardMaterial({color:0x2c3b44,roughness:.33,metalness:.83});
  const railMat=new T.MeshStandardMaterial({color:0x667982,roughness:.26,metalness:.88});
  const floorMat=new T.MeshStandardMaterial({color:0x141e28,roughness:.37,metalness:.82});
  const letterMat=new T.MeshStandardMaterial({color:0xf0e8dd,roughness:.23,metalness:.83});
  const group=new T.Group();scene.add(group);
  scene.add(new T.AmbientLight(0xd9e3ed,.49));
  const hemi=new T.HemisphereLight(0xdde8f0,0x060b0e,1.55);
  scene.add(hemi);
  const key=new T.DirectionalLight(0xece8e0,1.7);
  key.position.set(-6,9,7);scene.add(key);
  const accent=new T.PointLight(0xfb9169,125,30,2);
  accent.position.set(-6,5,0);scene.add(accent);
  const fill=new T.PointLight(0x9cb7df,95,27,2);
  fill.position.set(7,4,-3);scene.add(fill);

  const floor=new T.Mesh(new T.PlaneGeometry(110,110),floorMat);
  floor.rotation.x=-Math.PI/2;floor.position.y=-3.75;group.add(floor);
  const grid=new T.GridHelper(110,44,0x57717d,0x253740);
  grid.position.y=-3.73;grid.material.transparent=true;grid.material.opacity=.24;group.add(grid);

  for(let x=-18;x<=18;x+=9){
    const pillar=new T.Mesh(new T.BoxGeometry(.85,17,1.1),metal);
    pillar.position.set(x,2,-11);group.add(pillar);
    const line=new T.Mesh(new T.BoxGeometry(.055,17,.085),railMat);
    line.position.set(x-.39,2,-10.36);group.add(line);
  }
  for(let z=-11;z>=-65;z-=15){
    const beam=new T.Mesh(new T.BoxGeometry(42,.3,1.2),metal);
    beam.position.set(0,6.65,z);group.add(beam);
    const trim=new T.Mesh(new T.BoxGeometry(33,.065,.1),railMat);
    trim.position.set(0,6.45,z+.51);group.add(trim);
  }

  const rings=new T.Group();rings.position.set(3.8,.5,-10.2);
  const ringMat=new T.MeshStandardMaterial({color:0x85939a,metalness:.86,roughness:.22,transparent:true,opacity:.6});
  for(let i=0;i<5;i++){
    const ring=new T.Mesh(new T.TorusGeometry(2.5+i*.18,.045,8,92),ringMat);
    ring.rotation.set(.7+i*.18,i*.32,i*.23);
    rings.add(ring);
  }
  group.add(rings);

  const font={
    "4":["10001","10001","10001","11111","00001","00001","00001"],
    "3":["11111","00001","00001","01111","00001","00001","11111"],
    "D":["11110","10001","10001","10001","10001","10001","11110"],
    "O":["01110","10001","10001","10001","10001","10001","01110"],
    "U":["10001","10001","10001","10001","10001","10001","01110"]
  };
  const chars=["4","3","D","O","U"];
  const count=chars.reduce((acc,c)=>acc+font[c].reduce((n,row)=>n+[...row].filter(v=>v==="1").length,0),0);
  const geometry=new T.BoxGeometry(.21,.21,.25);
  const letters=new T.InstancedMesh(geometry,letterMat,count);
  const transform=new T.Object3D();
  let n=0;
  chars.forEach((char,i)=>font[char].forEach((row,r)=>[...row].forEach((value,c)=>{
    if(value!=="1")return;
    transform.position.set(-3.5+i*1.42+c*.245,5.25-r*.245,-11.7);
    transform.updateMatrix();
    letters.setMatrixAt(n++,transform.matrix);
  })));
  letters.instanceMatrix.needsUpdate=true;
  group.add(letters);

  const config={
    entrance:{x:0,y:1,z:14,look:0},
    commerce:{x:2.6,y:1,z:12.9,look:0},
    services:{x:-2.3,y:.9,z:13.3,look:0},
    hospitality:{x:2.2,y:1,z:11.9,look:0},
    culture:{x:-1.9,y:1,z:14.2,look:0},
    decks:{x:1.6,y:.8,z:12.2,look:0},
    lab:{x:0,y:1,z:11.3,look:0},
    contact:{x:0,y:1,z:14.2,look:0}
  };
  let space="entrance",frozen=false,dead=false,last=0,px=0,py=0;
  const target={...config.entrance};
  const lightTarget=new T.Color(colors.entrance);
  const onMove=e=>{
    if(reduced.matches||!matchMedia("(pointer:fine)").matches)return;
    px=(e.clientX/innerWidth-.5)*2;py=(e.clientY/innerHeight-.5)*2;
  };
  addEventListener("pointermove",onMove,{passive:true});
  function renderNow(){
    camera.position.set(target.x,target.y,target.z);
    camera.lookAt(target.look,0,0);
    accent.color.copy(lightTarget);
    renderer.render(scene,camera);
  }
  function resize(){
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile()?1.05:1.4));
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/Math.max(1,innerHeight);
    camera.fov=mobile()?61:51;
    camera.updateProjectionMatrix();
    if(reduced.matches)renderNow();
  }
  window.EXHIBITION_WORLD={
    move(next){
      space=next;
      const settings=config[next]||config.entrance;
      Object.assign(target,settings);
      lightTarget.set(colors[next]||colors.entrance);
      if(reduced.matches)renderNow();
    },
    pause(value){frozen=Boolean(value)},
    resize
  };
  resize();
  camera.position.set(0,1,14);
  renderer.render(scene,camera);
  document.getElementById("world").classList.add("has-webgl");
  const onLost=e=>{e.preventDefault();dead=true;document.getElementById("world").classList.remove("has-webgl")};
  canvas.addEventListener("webglcontextlost",onLost,false);
  function frame(ms){
    if(dead)return;
    if(!reduced.matches)requestAnimationFrame(frame);
    if(frozen||document.hidden)return;
    if(ms-last<1000/(mobile()?27:45))return;
    last=ms;
    camera.position.x+=(target.x+px*.11-camera.position.x)*.06;
    camera.position.y+=(target.y-py*.05-camera.position.y)*.06;
    camera.position.z+=(target.z-camera.position.z)*.06;
    camera.lookAt(target.look,0,0);
    rings.rotation.y=ms*.00008;
    rings.rotation.z=Math.sin(ms*.0002)*.09;
    accent.color.lerp(lightTarget,.07);
    renderer.render(scene,camera);
  }
  if(!reduced.matches)requestAnimationFrame(frame);
  addEventListener("pagehide",()=>{
    dead=true;
    removeEventListener("pointermove",onMove);
    renderer.dispose();
    group.traverse(obj=>{if(obj.geometry?.dispose)obj.geometry.dispose()});
    [metal,railMat,floorMat,letterMat,ringMat].forEach(m=>m.dispose());
  },{once:true});
}
bootWorld();