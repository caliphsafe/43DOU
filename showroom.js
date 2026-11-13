"use strict";
const data = window.SHOWROOM_DATA;
if (!data || !data.groups || !data.exhibits) throw Error("Missing showroom project data.");
const groups=data.groups, exhibits=data.exhibits;
const byGroup=Object.fromEntries(groups.map(g=>[g.id,exhibits.filter(p=>p.group===g.id)]));
const byId=Object.fromEntries(exhibits.map(p=>[p.id,p]));
const selected=Object.fromEntries(groups.map(g=>[g.id,0]));
let lastSwipeAt=0;
const $=id=>document.getElementById(id);
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const colors={entrance:"#fb9169",commerce:"#e3aa78",services:"#89a8ae",hospitality:"#f17c59",culture:"#a791d8",decks:"#95b7ec",lab:"#94a8ef",contact:"#fb9169"};
window.EXHIBITION_WORLD={move:()=>{},pause:()=>{},resize:()=>{}};
const motion=()=>reduced.matches?"auto":"smooth";
const phone=()=>innerWidth<=720;
const escapeText=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function makeRoom(g){
  const total=byGroup[g.id].length;
  const id=escapeText(g.id);
  const text=[
    '<section class="room" id="room-'+id+'" data-space="'+id+'" aria-labelledby="heading-'+id+'" style="--room-accent:'+colors[g.id]+'">',
    '<div class="room-shell">',
    '<div class="room-head"><div class="room-head-left"><span class="room-number">'+g.index+'</span>',
    '<div><p class="room-label">THE EXHIBITION / '+escapeText(g.short)+'</p><h2 id="heading-'+id+'">'+escapeText(g.title)+'</h2></div></div>',
    '<p>'+escapeText(g.intro)+'</p></div>',
    '<div class="room-layout"><div class="case-copy">',
    '<p class="case-count" data-case-count></p><h3 data-title></h3><p class="case-summary" data-summary></p>',
    '<div class="case-highlights" data-highlights></div>',
    '<div class="case-actions"><button type="button" class="action action-primary" data-view>Explore project <span aria-hidden="true">↗</span></button>',
    '<button type="button" class="breakdown-toggle" data-breakdown aria-expanded="false">Behind the build <span aria-hidden="true">+</span></button></div>',
    '<div class="case-breakdown" data-breakdown-panel hidden></div></div>',
    '<div class="stage-wrap"><div class="installation" data-installation aria-label="Three-dimensional display of real project branding"></div>',
    '<div class="stage-actions"><button type="button" class="stage-arrow" data-prev aria-label="Previous project">‹</button>',
    '<span class="stage-position" data-stage-count></span>',
    '<button type="button" class="stage-arrow" data-next aria-label="Next project">›</button></div>',
    '<div class="stage-caption"><span>ACTUAL BRAND ASSETS</span><span>SELECT AN INSTALLATION TO EXPLORE ↗</span></div>',
    '</div></div>',
    '<div class="room-foot"><p class="room-foot-label"><span>IN THIS EXHIBITION</span><span>'+String(total).padStart(2,"0")+' PROJECT'+(total===1?"":"S")+' / SELECT TO VIEW</span></p>',
    '<div class="room-rail" data-rail aria-label="'+escapeText(g.title)+' project selector"></div></div>',
    '</div></section>'
  ];
  return text.join("");
}
$("rooms").innerHTML=groups.map(makeRoom).join("");

function brandThumb(p,n){
  const span=document.createElement("span");span.className="rail-thumb";
  span.style.setProperty("--brand-bg",p.palette[0]);
  if(p.visual){
    const img=document.createElement("img");
    img.src=p.visual;img.alt="";img.loading="lazy";img.decoding="async";
    img.addEventListener("error",()=>{img.remove();span.classList.add("no-image");span.textContent=String(n+1).padStart(2,"0")},{once:true});
    span.append(img);
  }else{span.classList.add("no-image");span.textContent=String(n+1).padStart(2,"0")}
  return span;
}
function makeRail(p,index,gid){
  const b=document.createElement("button");b.type="button";b.className="rail-button";
  b.dataset.projectId=p.id;b.setAttribute("aria-pressed","false");
  const label=document.createElement("span");label.className="rail-button-text";
  const name=document.createElement("strong");name.textContent=p.title;
  const number=document.createElement("span");number.textContent=String(index+1).padStart(2,"0")+" / "+String(byGroup[gid].length).padStart(2,"0");
  label.append(name,number);b.append(brandThumb(p,index),label);
  b.addEventListener("click",()=>selectProject(gid,index,true));
  return b;
}
function makePanel(p,position,gid){
  const b=document.createElement("button");b.type="button";
  b.className="art-panel "+(position===0?"is-active":position<0?"is-left":"is-right");
  b.setAttribute("aria-label",(position===0?"Explore ":"Select ")+p.title);
  const screen=document.createElement("span");
  screen.className="art-screen"+(p.mode==="contain"?" is-contain":"");
  screen.style.setProperty("--brand-bg",p.palette[0]);
  screen.style.setProperty("--brand-ink",p.palette[1]);
  const fallback=document.createElement("span");fallback.className="art-brand-fallback";fallback.textContent=p.title;
  if(p.visual){
    const img=document.createElement("img");img.src=p.visual;
    img.alt="Visual asset from "+p.title;img.loading="lazy";img.decoding="async";
    img.addEventListener("error",()=>{img.remove();screen.classList.add("is-unavailable")},{once:true});
    screen.append(img);
  }else{screen.classList.add("is-unavailable")}
  screen.append(fallback);
  if(p.logo && p.visual){
    const logo=document.createElement("img");logo.src=p.logo;logo.alt="";logo.loading="lazy";logo.className="brand-logo";
    logo.addEventListener("error",()=>{logo.remove()},{once:true});
    screen.classList.add("has-logo");screen.append(logo);
  }
  const foot=document.createElement("span");foot.className="art-panel-footer";
  const title=document.createElement("strong");title.textContent=p.title;
  const prompt=document.createElement("small");prompt.textContent=position===0?"SELECT TO EXPLORE":"SELECT TO FOCUS";
  foot.append(title,prompt);
  const shine=document.createElement("span");shine.className="art-glint";shine.setAttribute("aria-hidden","true");
  b.append(screen,foot,shine);
  b.addEventListener("click",()=>{
    if(Date.now()-lastSwipeAt<450)return;
    const idx=byGroup[gid].findIndex(x=>x.id===p.id);
    if(selected[gid]===idx)openViewer(p.id,b);
    else selectProject(gid,idx,true);
  });
  return b;
}
function selectProject(gid,index,fromUser=false){
  const list=byGroup[gid];
  if(!list?.length)return;
  index=(index%list.length+list.length)%list.length;
  selected[gid]=index;
  const p=list[index],room=$("room-"+gid);
  const kind=p.kind==="presentation"?"PRESENTATION":p.kind==="experience"?"INTERACTIVE EXPERIENCE":"SELECTED WEBSITE";
  const counter=String(index+1).padStart(2,"0")+" / "+String(list.length).padStart(2,"0");
  room.querySelector("[data-case-count]").textContent=kind+" / "+counter;
  room.querySelector("[data-title]").textContent=p.title;
  room.querySelector("[data-summary]").textContent=p.summary;
  const chips=room.querySelector("[data-highlights]");
  chips.replaceChildren(...p.deliverables.slice(0,4).map(t=>{const span=document.createElement("span");span.textContent=t;return span}));
  room.querySelector("[data-view]").firstChild.textContent=p.kind==="presentation"?"Explore presentation ":p.kind==="experience"?"Explore platform ":"Explore website ";
  room.querySelector("[data-stage-count]").textContent=counter;
  const detail=room.querySelector("[data-breakdown-panel]");
  detail.replaceChildren();
  [["01 / OBJECTIVE",p.objective],["02 / DESIGN DIRECTION",p.design],["03 / EXPERIENCE",p.experience]].forEach(([heading,body])=>{
    const h=document.createElement("h4"),para=document.createElement("p");
    h.textContent=heading;para.textContent=body;detail.append(h,para);
  });
  const art=[];
  if(list.length>1)art.push(makePanel(list[(index-1+list.length)%list.length],-1,gid));
  art.push(makePanel(p,0,gid));
  if(list.length>1)art.push(makePanel(list[(index+1)%list.length],1,gid));
  room.querySelector("[data-installation]").replaceChildren(...art);
  const rail=room.querySelector("[data-rail]");
  rail.querySelectorAll(".rail-button").forEach(b=>{
    const active=b.dataset.projectId===p.id;
    b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));
  });
  if(fromUser){
    const active=rail.querySelector(".rail-button.is-active");
    if(active)rail.scrollTo({left:Math.max(0,active.offsetLeft-rail.offsetLeft-(rail.clientWidth-active.offsetWidth)/2),behavior:motion()});
  }
}
for(const g of groups){
  const room=$("room-"+g.id);
  room.querySelector("[data-rail]").replaceChildren(...byGroup[g.id].map((p,i)=>makeRail(p,i,g.id)));
  room.querySelector("[data-prev]").addEventListener("click",()=>selectProject(g.id,selected[g.id]-1,true));
  room.querySelector("[data-next]").addEventListener("click",()=>selectProject(g.id,selected[g.id]+1,true));
  room.querySelector("[data-view]").addEventListener("click",e=>openViewer(byGroup[g.id][selected[g.id]].id,e.currentTarget));
  room.querySelector("[data-breakdown]").addEventListener("click",e=>{
    const b=e.currentTarget,detail=room.querySelector("[data-breakdown-panel]");
    detail.hidden=!detail.hidden;b.setAttribute("aria-expanded",String(!detail.hidden));
    b.querySelector("span").textContent=detail.hidden?"+":"−";
  });
  let x=null,y=null;
  const stage=room.querySelector("[data-installation]");
  stage.addEventListener("touchstart",e=>{if(e.touches.length!==1)return;x=e.touches[0].clientX;y=e.touches[0].clientY},{passive:true});
  stage.addEventListener("touchend",e=>{
    if(x===null||y===null)return;
    const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;
    x=null;y=null;
    if(Math.abs(dx)>55&&Math.abs(dx)>1.5*Math.abs(dy)){
      lastSwipeAt=Date.now();
      selectProject(g.id,selected[g.id]+(dx<0?1:-1),true);
    }
  },{passive:true});
  selectProject(g.id,0);
}
function makeHero(){
  const brands=["NIMBA","OVER THE RAIL CO.","ELÖRE ATELIER"].map(name=>exhibits.find(p=>p.title===name)).filter(Boolean);
  $("entranceArt").replaceChildren(...brands.map((p,i)=>{
    const a=document.createElement("a");a.className="hero-installation";a.href="#room-"+p.group;
    a.dataset.position=String(i);a.setAttribute("aria-label","Explore "+p.title);
    a.style.background=p.palette[0];
    const img=document.createElement("img");img.src=p.visual;img.alt="Website visual from "+p.title;img.loading=i===1?"eager":"lazy";img.decoding="async";
    img.addEventListener("error",()=>img.remove(),{once:true});
    const title=document.createElement("strong");title.textContent=p.title;
    a.append(img,title);
    a.addEventListener("click",()=>{const index=byGroup[p.group].findIndex(v=>v.id===p.id);selectProject(p.group,index)});
    return a;
  }));
}
makeHero();

const idxDialog=$("projectIndex"),viewDialog=$("siteViewer"),search=$("indexSearch");
function renderIndex(q){
  q=String(q||"").trim().toLowerCase();
  const results=$("indexResults");results.replaceChildren();let count=0;
  groups.forEach(g=>{
    const matches=byGroup[g.id].filter(p=>(p.title+" "+g.title+" "+p.summary+" "+p.deliverables.join(" ")).toLowerCase().includes(q));
    if(!matches.length)return;
    count+=matches.length;
    const section=document.createElement("section");section.className="index-group";
    const h=document.createElement("h3");h.textContent=g.index+" / "+g.title+" — "+matches.length;
    const grid=document.createElement("div");grid.className="index-group-grid";
    matches.forEach(p=>{
      const b=document.createElement("button");b.type="button";b.className="index-entry";
      if(p.visual){
        const img=document.createElement("img");img.src=p.visual;img.alt="";img.loading="lazy";
        img.addEventListener("error",()=>img.remove(),{once:true});
        b.append(img);
      }
      const label=document.createElement("span");label.textContent=p.title;b.append(label);
      b.addEventListener("click",()=>{
        const n=byGroup[p.group].findIndex(v=>v.id===p.id);
        selectProject(p.group,n);idxDialog.close();
        $("room-"+p.group).scrollIntoView({behavior:motion(),block:"start"});
      });
      grid.append(b);
    });
    section.append(h,grid);results.append(section);
  });
  $("indexCount").textContent=count+" project"+(count===1?"":"s")+" found";
  if(!count){const p=document.createElement("p");p.textContent="No projects match this search.";results.append(p)}
}
function openIndex(){
  renderIndex(search.value);idxDialog.showModal();document.body.classList.add("is-locked");
  window.EXHIBITION_WORLD.pause(true);search.focus();
}
$("openIndex").addEventListener("click",openIndex);
$("entranceIndex").addEventListener("click",openIndex);
$("closeIndex").addEventListener("click",()=>idxDialog.close());
search.addEventListener("input",()=>renderIndex(search.value));
idxDialog.addEventListener("click",e=>{if(e.target===idxDialog)idxDialog.close()});
idxDialog.addEventListener("close",()=>{document.body.classList.remove("is-locked");window.EXHIBITION_WORLD.pause(false)});

let viewerProject=null,restoreFocus=null;
function scaleBrowser(){
  const holder=document.querySelector(".desktop-screen");if(!holder)return;
  holder.style.setProperty("--frame-scale",String(Math.min(holder.clientWidth/1440,holder.clientHeight/900)));
}
function setDevice(mode){
  const mobile=mode==="mobile";
  $("viewerStage").classList.toggle("is-mobile",mobile);
  [["desktopToggle",!mobile],["mobileToggle",mobile]].forEach(([id,on])=>{
    $(id).classList.toggle("is-on",on);$(id).setAttribute("aria-pressed",String(on));
  });
  $("frameDesktop").removeAttribute("src");$("frameMobile").removeAttribute("src");
  if(viewerProject)(mobile?$("frameMobile"):$("frameDesktop")).src=viewerProject.url;
  requestAnimationFrame(scaleBrowser);
}
function openViewer(id,focus){
  const p=byId[id];if(!p)return;
  viewerProject=p;restoreFocus=focus||document.activeElement;
  $("viewerTitle").textContent=p.title;
  $("viewerCategory").textContent=(p.kind==="presentation"?"PITCH DECK":p.kind==="experience"?"INTERACTIVE PLATFORM":"WEBSITE")+" / "+groups.find(g=>g.id===p.group).title;
  $("viewerSummary").textContent=p.summary;
  $("viewerExternal").href=p.url;$("browserOpen").href=p.url;
  $("browserUrl").textContent=p.url.replace(/^https?:\/\//,"");
  $("viewerExternal").textContent=p.kind==="presentation"?"OPEN FULL PRESENTATION ↗":"OPEN ORIGINAL WEBSITE ↗";
  const details=[["01 / Objective",p.objective],["02 / Visual direction",p.design],["03 / Experience & implementation",p.experience]];
  $("viewerCaseDetails").replaceChildren(...details.map(([h,t])=>{
    const article=document.createElement("article"),heading=document.createElement("h4"),body=document.createElement("p");
    heading.textContent=h;body.textContent=t;article.append(heading,body);return article;
  }));
  viewDialog.showModal();document.body.classList.add("is-locked");
  window.EXHIBITION_WORLD.pause(true);
  setDevice(phone()?"mobile":"desktop");
  $("closeViewer").focus();
}
$("closeViewer").addEventListener("click",()=>viewDialog.close());
$("desktopToggle").addEventListener("click",()=>setDevice("desktop"));
$("mobileToggle").addEventListener("click",()=>setDevice("mobile"));
viewDialog.addEventListener("click",e=>{if(e.target===viewDialog)viewDialog.close()});
viewDialog.addEventListener("close",()=>{
  $("frameDesktop").removeAttribute("src");$("frameMobile").removeAttribute("src");viewerProject=null;
  document.body.classList.remove("is-locked");window.EXHIBITION_WORLD.pause(false);
  if(restoreFocus?.isConnected)restoreFocus.focus();
});
if("ResizeObserver" in window)new ResizeObserver(scaleBrowser).observe(document.querySelector(".desktop-screen"));

let scrollPending=false,activeSpace="entrance";
function updateSpace(){
  scrollPending=false;
  if(idxDialog.open||viewDialog.open)return;
  const pivot=innerHeight*.5;
  const spaces=[$("entrance"),...groups.map(g=>$("room-"+g.id)),$("contact")];
  let next=activeSpace;
  for(const el of spaces){
    const r=el.getBoundingClientRect();
    if(r.top<=pivot&&r.bottom>=pivot){next=el.dataset.space||"entrance";break}
  }
  if(next!==activeSpace){
    activeSpace=next;
    document.documentElement.style.setProperty("--accent",colors[next]||colors.entrance);
    document.querySelectorAll(".top-nav a").forEach(a=>a.classList.toggle("is-current",a.getAttribute("href")==="#room-"+next));
    window.EXHIBITION_WORLD.move(next);
  }
}
function scheduleSpace(){if(scrollPending)return;scrollPending=true;requestAnimationFrame(updateSpace)}
addEventListener("scroll",scheduleSpace,{passive:true});
addEventListener("resize",()=>{scheduleSpace();window.EXHIBITION_WORLD.resize();scaleBrowser()},{passive:true});
addEventListener("visibilitychange",()=>window.EXHIBITION_WORLD.pause(document.hidden));
scheduleSpace();
if(location.hash){
  requestAnimationFrame(()=>{
    let id="";try{id=decodeURIComponent(location.hash.slice(1))}catch{id=location.hash.slice(1)}
    const target=document.getElementById(id);
    if(target)target.scrollIntoView({behavior:"auto",block:"start"});
  });
}
