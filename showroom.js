const PROJECTS = {
  nimba: {
    name: "Nimba", url: "https://nimba224.shop/",
    category: "01 / E-commerce & cultural storytelling",
    short: "An immersive online storefront built around carved objects, design and cultural storytelling.",
    details: "The experience centers the products with a prominent visual hero and clear shopping paths. Mobile layouts, product hierarchy, brand identity and gallery pacing were considered together to create a distinct digital storefront.",
    art: { bg: "#e2d0b2", ink: "#352318", accent: "#b67c4d" }
  },
  rail: {
    name: "OverTheRailCo", url: "https://overtherailco.com/",
    category: "02 / Fashion & direct-to-consumer commerce",
    short: "An independent fashion website where brand storytelling and product discovery support the shopping experience.",
    details: "The work connects the clothing label's visual identity with a clear retail structure, expressive product presentation and a mobile-friendly path through collection browsing and purchase.",
    art: { bg: "#b7b3ad", ink: "#1c1f22", accent: "#dc5c3d" }
  },
  friends: {
    name: "Friends + Fam", url: "https://friendsandfam.net/",
    category: "03 / E-commerce & brand",
    short: "A custom retail experience built for a coherent brand presence, product discovery and usability.",
    details: "Product presentation, navigation, responsive behavior and storefront hierarchy work together so customers can move naturally from first impression to product exploration.",
    art: { bg: "#da806e", ink: "#321f26", accent: "#f6dbb5" }
  }
};

const sceneViewport = document.getElementById("sceneViewport");
const fallbackCards = [...document.querySelectorAll(".fallback-panel")];
const chapters = [...document.querySelectorAll(".scene-section")];
const indicators = [...document.querySelectorAll("[data-indicator]")];
const viewer = document.getElementById("projectViewer");
const viewerStage = document.getElementById("viewerStage");
const desktopFrame = document.getElementById("viewerDesktopIframe");
const mobileFrame = document.getElementById("viewerMobileIframe");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const coarse = matchMedia("(pointer: coarse)");
const browserSupport = { renderer: null, onSceneChange: () => {}, onResize: () => {} };
let activeScene = "intro";
let isGallery = false;
let viewerProject = "nimba";
let viewerDevice = "desktop";
let restoreFocus = null;
let scrollQueued = false;

function screenIsSmall() { return window.innerWidth < 760; }
function setText(id, value) { document.getElementById(id).textContent = value; }

function scaleBrowser() {
  const holder = document.querySelector(".viewer-desktop-body");
  if (!holder) return;
  const w = holder.clientWidth || 1;
  const h = holder.clientHeight || 1;
  holder.style.setProperty("--browser-scale", String(Math.min(w / 1440, h / 900)));
}

function setViewerDevice(mode) {
  viewerDevice = mode;
  const mobile = mode === "mobile";
  viewerStage.classList.toggle("is-mobile", mobile);
  document.getElementById("viewDesktop").classList.toggle("is-selected", !mobile);
  document.getElementById("viewMobile").classList.toggle("is-selected", mobile);
  document.getElementById("viewDesktop").setAttribute("aria-pressed", String(!mobile));
  document.getElementById("viewMobile").setAttribute("aria-pressed", String(mobile));
  desktopFrame.removeAttribute("src");
  mobileFrame.removeAttribute("src");
  if (mobile) mobileFrame.src = PROJECTS[viewerProject].url;
  else desktopFrame.src = PROJECTS[viewerProject].url;
  requestAnimationFrame(scaleBrowser);
}

function openViewer(key, source) {
  const project = PROJECTS[key];
  if (!project) return;
  restoreFocus = source || document.activeElement;
  viewerProject = key;
  setText("viewerTitle", project.name);
  setText("viewerCategory", project.category);
  setText("viewerDescription", project.short);
  setText("viewerDetails", project.details);
  setText("viewerAddress", project.url.replace(/^https?:\/\//, ""));
  document.getElementById("viewerExternal").href = project.url;
  document.getElementById("viewerExternalIcon").href = project.url;
  viewer.hidden = false;
  document.body.classList.add("viewer-open");
  viewer.querySelector(".viewer-shell").scrollTop = 0;
  setViewerDevice(screenIsSmall() ? "mobile" : "desktop");
  viewer.querySelector(".viewer-close").focus();
}
function closeViewer() {
  if (viewer.hidden) return;
  viewer.hidden = true;
  document.body.classList.remove("viewer-open");
  desktopFrame.removeAttribute("src");
  mobileFrame.removeAttribute("src");
  if (restoreFocus && restoreFocus.isConnected && typeof restoreFocus.focus === "function") restoreFocus.focus();
}
document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", () => openViewer(button.dataset.open, button));
});
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", closeViewer));
document.getElementById("viewDesktop").addEventListener("click", () => setViewerDevice("desktop"));
document.getElementById("viewMobile").addEventListener("click", () => setViewerDevice("mobile"));
viewer.addEventListener("click", e => { if (e.target === viewer) closeViewer(); });
document.addEventListener("keydown", e => {
  if (viewer.hidden) return;
  if (e.key === "Escape") { e.preventDefault(); closeViewer(); return; }
  if (e.key !== "Tab") return;
  const targets = [...viewer.querySelectorAll('button:not([disabled]),a[href],iframe')].filter(el => el.getClientRects().length > 0);
  if (!targets.length) return;
  const first = targets[0], last = targets[targets.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
if ("ResizeObserver" in window) {
  new ResizeObserver(scaleBrowser).observe(document.querySelector(".viewer-desktop-body"));
}

function activateScene(next) {
  if (next === activeScene) return;
  activeScene = next;
  indicators.forEach(link => {
    const active = link.dataset.indicator === next;
    link.classList.toggle("is-current", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const ordered = ["nimba", "rail", "friends"];
  fallbackCards.forEach((card, i) => card.classList.toggle("is-active", (next === "intro" ? 0 : ordered.indexOf(next)) === i));
  browserSupport.onSceneChange(next);
}
function refreshSceneFromScroll() {
  scrollQueued = false;
  const mid = window.innerHeight * (screenIsSmall() ? 0.45 : 0.53);
  let next = "intro";
  for (const chapter of chapters) {
    const r = chapter.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) next = chapter.dataset.scene || "intro";
  }
  const galleryRect = document.getElementById("directory").getBoundingClientRect();
  const faded = galleryRect.top < window.innerHeight * 0.83;
  if (faded !== isGallery) {
    isGallery = faded;
    sceneViewport.classList.toggle("is-faded", faded);
  }
  document.getElementById("scenePagination").classList.toggle("is-visible", next !== "intro" && !faded);
  activateScene(next);
}
function requestSceneRefresh() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(refreshSceneFromScroll);
}
window.addEventListener("scroll", requestSceneRefresh, { passive: true });
window.addEventListener("resize", () => {
  requestSceneRefresh();
  browserSupport.onResize();
  scaleBrowser();
});
requestSceneRefresh();
fallbackCards[0].classList.add("is-active");

function makePoster(THREE, key, mobile) {
  const data = PROJECTS[key].art;
  const canvas = document.createElement("canvas");
  canvas.width = mobile ? 512 : 1024;
  canvas.height = mobile ? 640 : 1280;
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height, scale = w / 1024;
  ctx.scale(scale, scale);
  ctx.fillStyle = data.bg;
  ctx.fillRect(0, 0, 1024, 1280);
  const gradient = ctx.createLinearGradient(60, 0, 1050, 1170);
  gradient.addColorStop(0, "rgba(255,255,255,.32)");
  gradient.addColorStop(.55, "rgba(255,255,255,0)");
  gradient.addColorStop(1, "rgba(0,0,0,.20)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1280);
  ctx.strokeStyle = data.ink;
  ctx.lineWidth = 2;
  ctx.globalAlpha = .19;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath(); ctx.moveTo(i * 90 - 80, 0); ctx.lineTo(i * 90 - 80, 1280); ctx.stroke();
  }
  for (let j = 0; j < 17; j++) {
    ctx.beginPath(); ctx.moveTo(0, j * 90); ctx.lineTo(1024, j * 90); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = data.ink;
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillText("43DOU  /  SELECTED DIGITAL WORK", 68, 82);
  ctx.font = "bold 18px Arial, sans-serif";
  ctx.fillText("EXHIBITION  /  2026", 68, 1230);
  ctx.textAlign = "right";
  ctx.fillText("LIVE WEBSITE  ↗", 955, 1230);
  ctx.textAlign = "left";
  if (key === "nimba") {
    ctx.fillStyle = data.accent;
    ctx.beginPath();
    ctx.moveTo(490, 210); ctx.bezierCurveTo(220, 240, 250, 660, 395, 785);
    ctx.bezierCurveTo(420, 930, 600, 940, 652, 760);
    ctx.bezierCurveTo(820, 610, 780, 280, 490, 210);
    ctx.fill();
    ctx.fillStyle = "#452917";
    ctx.beginPath(); ctx.ellipse(422, 524, 35, 68, -.15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(586, 524, 35, 68, .15, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(488, 530, 32, 175);
    ctx.fillStyle = data.bg; ctx.fillRect(412, 705, 190, 20);
    ctx.fillStyle = data.ink; ctx.font = "900 150px Arial, sans-serif";
    ctx.fillText("NIMBA", 59, 1056);
    ctx.font = "bold 31px Arial, sans-serif";ctx.fillText("FORM  /  CULTURE  /  COMMERCE", 67, 1125);
  } else if (key === "rail") {
    ctx.fillStyle = data.ink;
    ctx.fillRect(86, 240, 852, 690);
    ctx.save();
    ctx.translate(107, 880);ctx.rotate(-Math.PI/2);
    ctx.fillStyle = "#f1ece4";ctx.font = "900 165px Arial, sans-serif";
    ctx.fillText("OVER", 0, 155);ctx.fillText("THE", 0, 338);ctx.fillText("RAIL", 0, 520);
    ctx.restore();
    ctx.fillStyle = data.accent; ctx.fillRect(730, 210, 125, 795);
    ctx.fillStyle = data.ink;ctx.font = "900 74px Arial, sans-serif";ctx.fillText("OTR / 02", 67, 1100);
    ctx.font = "bold 28px Arial, sans-serif";ctx.fillText("INDEPENDENT FASHION", 67, 1145);
  } else {
    ctx.fillStyle = data.ink;
    ctx.fillRect(70, 210, 880, 805);
    ctx.fillStyle = data.accent;
    ctx.font = "900 255px Arial, sans-serif";ctx.fillText("F+", 110, 615);
    ctx.fillText("F", 115, 895);
    ctx.strokeStyle = data.accent;ctx.lineWidth = 6;
    ctx.strokeRect(100, 254, 810, 718);
    ctx.fillStyle = data.ink;ctx.font = "900 85px Arial, sans-serif";ctx.fillText("FRIENDS + FAM", 68, 1105);
    ctx.font = "bold 27px Arial, sans-serif";ctx.fillText("STOREFRONT  /  COMMUNITY", 68, 1155);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = mobile ? 2 : 4;
  return texture;
}

function createShowroom(THREE) {
  const mobile = screenIsSmall();
  const canvas = document.getElementById("showroomCanvas");
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: !mobile, powerPreference: "low-power"
  });
  browserSupport.renderer = renderer;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0d151d, 0.033);
  const camera = new THREE.PerspectiveCamera(47, 1, .1, 130);
  scene.add(new THREE.AmbientLight(0xe0e5ec, .75));
  const keyLight = new THREE.DirectionalLight(0xf2e7d6, 2.3);
  keyLight.position.set(-3, 8, 12);scene.add(keyLight);
  const warm = new THREE.PointLight(0xff855c, 130, 23, 2);
  warm.position.set(-6, 4, 2);scene.add(warm);
  const cool = new THREE.PointLight(0x89c6d7, 110, 22, 2);
  cool.position.set(7, 3, -1);scene.add(cool);
  const steel = new THREE.MeshStandardMaterial({color:0x242e36,metalness:.9,roughness:.24});
  const blackSteel = new THREE.MeshStandardMaterial({color:0x10161c,metalness:.6,roughness:.3});
  const edge = new THREE.MeshStandardMaterial({color:0xadb4b1,metalness:.88,roughness:.2});
  const accents = [0xe2ac76,0xcf6b58,0xe1bf9b];
  const panels = [];
  const positions = [-4.45,0,4.45];
  const keys = ["nimba","rail","friends"];
  keys.forEach((key,i)=>{
    const group = new THREE.Group();
    group.position.set(positions[i],.58,-.6 + (i % 2) * .55);
    const shell = new THREE.Mesh(new THREE.BoxGeometry(3.38,4.37,.21),steel);
    group.add(shell);
    const border = new THREE.Mesh(new THREE.BoxGeometry(3.52,4.5,.085),edge);
    border.position.z=-.09;group.add(border);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(3.17,4.14),new THREE.MeshBasicMaterial({map:makePoster(THREE,key,mobile),toneMapped:false}));
    art.position.z=.128;group.add(art);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3.7,.09,.29),blackSteel);
    cap.position.y=-2.29;group.add(cap);
    const copperStrip = new THREE.Mesh(new THREE.BoxGeometry(2.6,.025,.19),new THREE.MeshBasicMaterial({color:accents[i]}));
    copperStrip.position.set(0,-2.37,.05);group.add(copperStrip);
    const tube = new THREE.Mesh(new THREE.TorusGeometry(2.03,.012,6,96),new THREE.MeshBasicMaterial({color:accents[i],transparent:true,opacity:.4}));
    tube.rotation.x=Math.PI/2.5;tube.position.set(0,-2.63,0);group.add(tube);
    scene.add(group);panels.push(group);
  });
  const floor = new THREE.GridHelper(42,24,0x55717a,0x293e4a);
  floor.position.y=-2.87;floor.material.transparent=true;floor.material.opacity=.23;scene.add(floor);
  for(const side of [-1,1]){
    const column = new THREE.Mesh(new THREE.BoxGeometry(.8,13,1.4),steel);
    column.position.set(side*10.2,1,-8);scene.add(column);
    const highlight = new THREE.Mesh(new THREE.BoxGeometry(.045,13,.05),new THREE.MeshBasicMaterial({color:0x6e8090,transparent:true,opacity:.5}));
    highlight.position.set(side*10.2-.38,1,-7.28);scene.add(highlight);
  }
  const overhead = new THREE.Mesh(new THREE.BoxGeometry(22,.26,1.1),blackSteel);
  overhead.position.set(0,5.8,-8);scene.add(overhead);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(16,.35,3.8),blackSteel);
  plinth.position.set(0,-3.12,-.8);scene.add(plinth);
  if (!mobile) {
    const particlesGeometry = new THREE.BufferGeometry();
    const array = new Float32Array(330);
    for(let i=0;i<110;i++){
      array[i*3] = (Math.random()-.5)*34;
      array[i*3+1] = (Math.random()-.5)*17;
      array[i*3+2] = -5-Math.random()*18;
    }
    particlesGeometry.setAttribute("position",new THREE.BufferAttribute(array,3));
    scene.add(new THREE.Points(particlesGeometry,new THREE.PointsMaterial({color:0xa6b8bd,size:.026,transparent:true,opacity:.55})));
  }
  // A true dimensional 43DOU sign: one instanced steel block per glyph segment.
  const glyphs = {
    "4":["10001","10001","10001","11111","00001","00001","00001"],
    "3":["11111","00001","00001","01111","00001","00001","11111"],
    "D":["11110","10001","10001","10001","10001","10001","11110"],
    "O":["01110","10001","10001","10001","10001","10001","01110"],
    "U":["10001","10001","10001","10001","10001","10001","01110"]
  };
  const lettering = ["4","3","D","O","U"];
  let voxelCount = 0;
  lettering.forEach(c => glyphs[c].forEach(row => { for(const digit of row) if(digit==="1") voxelCount++; }));
  const voxelMat = new THREE.MeshStandardMaterial({color:0xe2e8e4,metalness:.89,roughness:.22,emissive:0x382018,emissiveIntensity:.1});
  const voxels = new THREE.InstancedMesh(new THREE.BoxGeometry(.192,.192,.24),voxelMat,voxelCount);
  const glyphTransform = new THREE.Object3D();
  let instance = 0;
  lettering.forEach((letter,letterIndex)=>{
    glyphs[letter].forEach((row,r)=>{
      [...row].forEach((digit,c)=>{
        if(digit!=="1")return;
        glyphTransform.position.set(-3.05 + letterIndex*1.32 + c*.23,5.05-r*.23,-5.2);
        glyphTransform.updateMatrix();
        voxels.setMatrixAt(instance++,glyphTransform.matrix);
      });
    });
  });
  voxels.instanceMatrix.needsUpdate = true;
  scene.add(voxels);
  const logoCanvas = document.createElement("canvas");
  logoCanvas.width=1024;logoCanvas.height=256;
  const logoCtx=logoCanvas.getContext("2d");
  logoCtx.fillStyle="#e7ebe7";logoCtx.font="900 212px Arial, sans-serif";logoCtx.textAlign="center";
  logoCtx.fillText("43DOU",512,204);
  const logoTexture = new THREE.CanvasTexture(logoCanvas);logoTexture.colorSpace=THREE.SRGBColorSpace;
  const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(7.8,1.95),new THREE.MeshBasicMaterial({map:logoTexture,transparent:true,opacity:.1,depthWrite:false}));
  logoPlane.position.set(0,3.77,-4.7);scene.add(logoPlane);
  const target = {cameraX:0,cameraY:1.25,cameraZ:13.6,lookX:0,lookY:0};
  let pointerX=0,pointerY=0,paused=false,stopped=false;
  const shouldAnimate=()=>!reducedMotion.matches;
  function updateTarget(sceneName) {
    const small = screenIsSmall();
    if (sceneName === "intro") {
      target.cameraX = small ? positions[0] : 0;
      target.lookX = small ? positions[0] : 0;
      target.cameraY = small ? -.9 : 1.25;
      target.lookY = small ? -.85 : 0;
      target.cameraZ = small ? 10.5 : 13.7;
      return;
    }
    const index = keys.indexOf(sceneName);
    if(index<0)return;
    target.cameraX=small ? positions[index] : positions[index]-2.45;
    target.lookX=small ? positions[index] : positions[index]-2.3;
    target.cameraY=small ? -.82 : 1.12;
    target.lookY=small ? -.84 : .2;
    target.cameraZ=small ? 9.7 : 9.8;
  }
  browserSupport.onSceneChange=updateTarget;
  function resize() {
    const small=screenIsSmall();
    const pixelRatio=Math.min(window.devicePixelRatio||1,small?1.1:1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight,false);
    camera.aspect=window.innerWidth/Math.max(1,window.innerHeight);
    camera.fov=small?54:47;
    camera.updateProjectionMatrix();
    updateTarget(activeScene);
    if(!shouldAnimate()){
      camera.position.set(target.cameraX,target.cameraY,target.cameraZ);
      camera.lookAt(target.lookX,target.lookY,0);
    }
  }
  browserSupport.onResize=resize;
  camera.position.set(0,1.25,13.7);
  resize();
  updateTarget(activeScene);
  const finePointer=matchMedia("(pointer:fine)");
  const handlePointer=(e)=>{
    if (!finePointer.matches || !shouldAnimate()) return;
    pointerX=(e.clientX/window.innerWidth-.5)*2;
    pointerY=(e.clientY/window.innerHeight-.5)*2;
  };
  window.addEventListener("pointermove",handlePointer,{passive:true});
  const handleVisibility=()=>{paused=document.hidden};
  document.addEventListener("visibilitychange",handleVisibility);
  const contextLost=(e)=>{e.preventDefault();stopped=true;sceneViewport.classList.remove("webgl-ready")};
  canvas.addEventListener("webglcontextlost",contextLost,false);
  let lastFrame=0;
  const fpsCap=mobile?32:60;
  function tick(timestamp) {
    if(stopped)return;
    requestAnimationFrame(tick);
    if(paused || isGallery) return;
    if(timestamp-lastFrame<1000/fpsCap)return;
    lastFrame=timestamp;
    const t=timestamp*.001;
    const active=keys.indexOf(activeScene);
    const easing=shouldAnimate()?.06:1;
    const parallax=shouldAnimate() ? pointerX*.13 : 0;
    camera.position.x += (target.cameraX+parallax-camera.position.x)*easing;
    camera.position.y += (target.cameraY-(shouldAnimate()?pointerY*.07:0)-camera.position.y)*easing;
    camera.position.z += (target.cameraZ-camera.position.z)*easing;
    const lookX=target.lookX+parallax*.5;
    const lookY=target.lookY;
    if(!tick.look)tick.look=new THREE.Vector3(lookX,lookY,0);
    tick.look.lerp(new THREE.Vector3(lookX,lookY,0),easing);
    camera.lookAt(tick.look);
    panels.forEach((group,index)=>{
      const chosen=(active<0||active===index);
      const desiredScale=active<0?1:(chosen?1.055:.91);
      const current=group.scale.x;
      const scale=current+(desiredScale-current)*easing;
      group.scale.setScalar(scale);
      const y=.58 + (shouldAnimate()?Math.sin(t*1.12+index*2.1)*.085:0);
      group.position.y += (y-group.position.y)*easing;
      group.rotation.y += (((index-1)*-.14+(shouldAnimate()?Math.sin(t*.44+index)*.035:0))-group.rotation.y)*easing;
      group.rotation.z += (((index-1)*.025)-group.rotation.z)*easing;
    });
    renderer.render(scene,camera);
  }
  renderer.render(scene,camera);
  sceneViewport.classList.add("webgl-ready");
  requestAnimationFrame(tick);
  window.addEventListener("pagehide",()=>{
    stopped=true;
    document.removeEventListener("visibilitychange",handleVisibility);
    window.removeEventListener("pointermove",handlePointer);
    renderer.dispose();
    panels.forEach(group=>group.traverse(obj=>{
      if(obj.isMesh&&obj.geometry)obj.geometry.dispose();
      if(obj.isMesh&&obj.material&&obj.material.map)obj.material.map.dispose();
    }));
  },{once:true});
}

(async function boot3D(){
  if (!document.createElement("canvas").getContext) return;
  const saveData = navigator.connection && navigator.connection.saveData;
  if(saveData) return;
  try {
    let THREE;
    try { THREE=await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"); }
    catch { THREE=await import("https://unpkg.com/three@0.180.0/build/three.module.js"); }
    createShowroom(THREE);
    requestSceneRefresh();
  } catch(error) {
    console.warn("3D display unavailable; maintaining accessible gallery fallback.",error);
    sceneViewport.classList.remove("webgl-ready");
  }
})();
