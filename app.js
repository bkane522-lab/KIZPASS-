"use strict";

const SEED_EVENTS = [
  {id:"e1",name:"Lisboa Kizomba Nights",city:"Lisboa",date:"2026-08-14",going:["🦊","🐼","🦉"]},
  {id:"e2",name:"Urban Kiz Weekender",city:"Paris",date:"2026-09-05",going:["🐯","🦋"]},
  {id:"e3",name:"Semba & Soul",city:"Luanda",date:"2026-09-26",going:["🐻","🦅","🐸","🦊"]},
  {id:"e4",name:"Afrohouse Rooftop",city:"Rotterdam",date:"2026-10-10",going:["🐰"]},
  {id:"e5",name:"Kiz Marathon",city:"Barcelona",date:"2026-11-21",going:["🐺","🦝","🐨"]}
];

const SEED_PEOPLE = [
  {a:"🦊",n:"Ana R.",r:"Follower · Lisboa",s:7,inks:[0,2,1]},
  {a:"🐼",n:"Malik",r:"Leader · Paris",s:12,inks:[1,3,0]},
  {a:"🦉",n:"Chloé",r:"Prof · Lyon",s:19,inks:[2,0,3]},
  {a:"🐯",n:"Dju",r:"DJ · Rotterdam",s:24,inks:[3,1,2]},
  {a:"🦋",n:"Inês",r:"Follower · Porto",s:5,inks:[0,1,2]},
  {a:"🐻",n:"Kevin",r:"Leader · Bruxelles",s:9,inks:[2,3,0]}
];

async function fetchEvents(){
  // V1 locale. Remplacer par /api/events dès que le backend est prêt.
  return SEED_EVENTS;
}

const KEY="kizpass.v1";
const DEFAULT_STATE={name:"",role:"",origin:"",styles:[],level:"",since:"",teachers:"",motto:"",photo:null,stamps:[],going:[]};
const $=id=>document.getElementById(id);
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}};
const save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
let state={...DEFAULT_STATE,...(load()||{})};
state.styles=Array.isArray(state.styles)?state.styles:[];
state.stamps=Array.isArray(state.stamps)?state.stamps:[];
state.going=Array.isArray(state.going)?state.going:[];

const inks=["var(--st-violet)","var(--st-teal)","var(--st-rose)","var(--st-ochre)"];
const inkHex=["#43089C","#044A40","#8E0A3D","#7A3D03"];
const MOIS=["JAN","FÉV","MAR","AVR","MAI","JUIN","JUIL","AOÛT","SEP","OCT","NOV","DÉC"];
const SUB={pass:"PASSEPORT DE DANSE",events:"QUI VA OÙ",people:"LA COMMUNAUTÉ"};
const esc=t=>(t==null?"":String(t)).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const chev=s=>s.replace(/</g,'<span>‹</span>');

function parseLocalDate(iso){
  const [y,m,d]=String(iso).split("-").map(Number);
  return new Date(y,m-1,d,12,0,0,0);
}
function todayStart(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function passNumber(n){if(!n)return "——————";let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))>>>0;return "KP"+String(h%900000+100000)}
function mrz(s){
  const cl=t=>(t||"").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z0-9]+/g,"<");
  const pad=(t,n)=>(t+"<".repeat(n)).slice(0,n);
  return [pad(`KIZ<PASS<<${cl(s.name)}<<${cl(s.role)}`,42),pad(`${cl(s.origin)}<<${cl(s.motto)}`,42)];
}

function openProfile(){
  $("e-name").value=state.name;$("e-role").value=state.role;$("e-origin").value=state.origin;$("e-since").value=state.since;
  $("e-styles").value=(state.styles||[]).join(", ");$("e-level").value=state.level;$("e-teachers").value=state.teachers;$("e-motto").value=state.motto;
  openSheet("editSheet");
}

document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{
  const v=t.dataset.v;
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===t));
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("on"));
  $("v-"+v).classList.add("on");
  $("subtitle").textContent=SUB[v];
  window.scrollTo({top:0,behavior:"instant"});
}));

function render(){
  $("f-name").textContent=state.name||"—";$("f-role").textContent=state.role||"—";$("f-origin").textContent=state.origin||"—";
  $("f-level").textContent=state.level||"—";$("f-since").textContent=state.since||"—";$("f-teachers").textContent=state.teachers||"—";
  $("f-motto").textContent=state.motto||"—";$("passno").textContent=passNumber(state.name);
  $("hint").classList.toggle("hide",!!state.name);
  const sc=$("f-styles");sc.innerHTML="";
  (state.styles||[]).forEach(x=>{const e=document.createElement("span");e.className="chip";e.textContent=x;sc.appendChild(e)});
  const p=$("photo");
  if(state.photo){p.classList.add("hasimg");p.style.backgroundImage=`url(${state.photo})`}else{p.classList.remove("hasimg");p.style.backgroundImage=""}
  const [l1,l2]=mrz(state);$("mrz").innerHTML=`<div>${chev(l1)}</div><div>${chev(l2)}</div>`;
  renderStamps();save(state);
}

function renderStamps(){
  const w=$("stamps");w.innerHTML="";
  if(!state.stamps.length){w.innerHTML=`<div class="empty"><b>Aucun tampon pour l'instant</b><span>Choisis un événement puis ajoute ton tampon après y avoir participé.</span></div>`}
  else state.stamps.forEach((st,i)=>{
    const el=document.createElement("div");el.className="stamp";
    el.style.color=inks[i%inks.length];el.style.setProperty("--r",`${(i%2?1:-1)*(4+(i*13)%13)}deg`);
    el.style.setProperty("--mx",`${-10-((i*7)%9)}px`);el.style.setProperty("--my",`${-4-((i*5)%11)}px`);el.style.zIndex=state.stamps.length-i;
    el.innerHTML=`<div class="star">${"★".repeat(st.rating||0)}</div><div><div class="n">${esc(st.name)}</div><div class="c">${esc(st.city)}</div><div class="y">${esc(st.year)}</div></div>`;
    el.addEventListener("click",()=>{if(confirm(`Retirer le tampon « ${st.name} » ?`)){state.stamps.splice(i,1);render();renderEvents()}});
    w.appendChild(el);
  });
  $("s-fest").textContent=state.stamps.length;
  $("s-city").textContent=new Set(state.stamps.map(s=>(s.city||"").toLowerCase()).filter(Boolean)).size;
  $("s-style").textContent=(state.styles||[]).length;
}

let EVENTS=[];
async function renderEvents(){
  const w=$("events");
  if(!EVENTS.length){w.innerHTML=`<div class="empty"><span>Chargement…</span></div>`;try{EVENTS=await fetchEvents()}catch{EVENTS=[]}}
  const upcoming=EVENTS.filter(e=>parseLocalDate(e.date)>=todayStart()).sort((a,b)=>parseLocalDate(a.date)-parseLocalDate(b.date));
  $("ev-count").textContent=upcoming.length+" ÉVÉNEMENT"+(upcoming.length>1?"S":"");
  if(!upcoming.length){w.innerHTML=`<div class="empty"><b>Aucun événement à venir</b><span>La prochaine programmation apparaîtra ici.</span></div>`;return}
  w.innerHTML="";
  upcoming.forEach(e=>{
    const d=parseLocalDate(e.date);const going=state.going.includes(e.id);const done=state.stamps.some(s=>s.id===e.id);
    const n=(e.going||[]).length+(going?1:0);const eventIsPast=d<todayStart();
    const el=document.createElement("div");el.className="ev";
    el.innerHTML=`
      <div class="ev-date"><b>${d.getDate()}</b><span>${MOIS[d.getMonth()]}</span></div>
      <div class="ev-body">
        <h3>${esc(e.name)}</h3><div class="ev-city">${esc(e.city)}</div>
        <div class="ev-who">${(e.going||[]).slice(0,4).map(a=>`<div class="av">${a}</div>`).join("")}<p>${n} danseur${n>1?"s":""} y va${n>1?"nt":""}</p></div>
        <div class="ev-go">
          <button class="mini ${going?"on":""}" data-go="${e.id}">${going?"✓ J'y vais":"J'y vais"}</button>
          <button class="mini ${done?"done":""}" data-st="${e.id}">${done?"✓ Tamponné":"Tamponner"}</button>
        </div>
      </div>`;
    w.appendChild(el);
  });
  w.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.go,i=state.going.indexOf(id);i<0?state.going.push(id):state.going.splice(i,1);save(state);renderEvents();
  }));
  w.querySelectorAll("[data-st]").forEach(b=>b.addEventListener("click",()=>{
    const e=EVENTS.find(x=>x.id===b.dataset.st);if(!e)return;
    if(state.stamps.some(s=>s.id===e.id)){alert("Déjà tamponné ✦");return}openStamp(e);
  }));
}

function renderPeople(){
  $("pp-count").textContent=SEED_PEOPLE.length+" PASS";
  $("people").innerHTML=SEED_PEOPLE.map(p=>`<div class="pcard"><div class="pa">${p.a}</div><b>${esc(p.n)}</b><span class="pr">${esc(p.r)}</span><div class="pdots">${p.inks.map(i=>`<span class="pdot" style="background:${inkHex[i]}"></span>`).join("")}</div><div class="pn">${p.s} tampons</div></div>`).join("");
}

const openSheet=id=>$(id).classList.add("open");
const closeSheet=id=>$(id).classList.remove("open");
let curRate=0,curEvent=null;
function setRate(v){$("st-rate").querySelectorAll("button").forEach(b=>b.classList.toggle("on",+b.dataset.v<=v))}
function openStamp(e){
  curEvent=e||null;curRate=0;setRate(0);$("stampTitle").textContent=e?"Tamponner "+e.name:"Nouveau tampon";
  $("st-name").value=e?e.name:"";$("st-city").value=e?e.city:"";$("st-year").value=e?parseLocalDate(e.date).getFullYear():new Date().getFullYear();openSheet("stampSheet");
}

$("addStamp").addEventListener("click",()=>openStamp(null));
$("editPass").addEventListener("click",openProfile);
$("st-rate").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{curRate=+b.dataset.v;setRate(curRate)}));
$("saveStamp").addEventListener("click",()=>{
  const n=$("st-name").value.trim();if(!n){$("st-name").focus();return}
  state.stamps.unshift({id:curEvent?curEvent.id:"m"+Date.now(),name:n,city:$("st-city").value.trim(),year:$("st-year").value.trim(),rating:curRate});
  closeSheet("stampSheet");render();renderEvents();curEvent=null;
});
$("cancelStamp").addEventListener("click",()=>closeSheet("stampSheet"));
$("saveProfile").addEventListener("click",()=>{
  state.name=$("e-name").value.trim();state.role=$("e-role").value.trim();state.origin=$("e-origin").value.trim();state.since=$("e-since").value.trim();
  state.styles=$("e-styles").value.split(",").map(s=>s.trim()).filter(Boolean).slice(0,6);state.level=$("e-level").value.trim();state.teachers=$("e-teachers").value.trim();state.motto=$("e-motto").value.trim();
  closeSheet("editSheet");render();
});
$("cancelProfile").addEventListener("click",()=>closeSheet("editSheet"));
$("passCard").addEventListener("click",openProfile);
$("photo").addEventListener("click",e=>{e.stopPropagation();$("fileIn").click()});
$("photo").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("fileIn").click()}});

async function compressPhoto(file){
  if(!file.type.startsWith("image/"))throw new Error("Format non pris en charge");
  const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=data});
  const max=720,scale=Math.min(1,max/Math.max(img.width,img.height));const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
  const c=document.createElement("canvas");c.width=w;c.height=h;const ctx=c.getContext("2d");ctx.fillStyle="#EFE7FB";ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
  return c.toDataURL("image/jpeg",.82);
}
$("fileIn").addEventListener("change",async e=>{
  const f=e.target.files?.[0];if(!f)return;
  try{state.photo=await compressPhoto(f);render()}catch{alert("Impossible de charger cette photo.")}
  e.target.value="";
});

async function makeShareCard(){
  const c=document.createElement("canvas");c.width=1080;c.height=1350;const x=c.getContext("2d");
  const bg=x.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,"#DCCEF2");bg.addColorStop(1,"#A98AD5");x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);
  x.fillStyle="#170438";x.font="64px serif";x.fillText("KIZPASS",80,120);x.font="28px monospace";x.fillStyle="#4E3880";x.fillText("PASSEPORT DE DANSE",84,168);
  x.fillStyle="#F7F1FF";roundRect(x,60,220,960,880,42);x.fill();
  x.fillStyle="#3A0785";roundRect(x,60,220,960,130,42,true,false);x.fill();x.fillRect(60,300,960,50);
  x.fillStyle="#F5DC96";x.font="28px monospace";x.fillText("COMMUNAUTÉ KIZOMBA",100,300);x.textAlign="right";x.fillText(passNumber(state.name),970,300);x.textAlign="left";
  x.fillStyle="#170438";x.font="bold 52px sans-serif";x.fillText(state.name||"Mon KIZPASS",100,460);x.font="28px sans-serif";x.fillStyle="#4E3880";x.fillText(state.role||"Danseur·se Kizomba",100,515);
  const info=[["ORIGINE",state.origin||"—"],["NIVEAU",state.level||"—"],["DANSE DEPUIS",state.since||"—"],["STYLES",(state.styles||[]).join(" · ")||"—"]];
  let yy=610;for(const [k,v] of info){x.font="22px monospace";x.fillStyle="#7A5FAF";x.fillText(k,100,yy);x.font="30px sans-serif";x.fillStyle="#170438";wrapText(x,v,100,yy+42,820,38);yy+=130}
  x.fillStyle="#EFE0A5";roundRect(x,90,925,900,110,24);x.fill();x.fillStyle="#4A2F04";x.font="20px monospace";x.fillText("DEVISE",120,965);x.font="28px serif";wrapText(x,state.motto||"Danser, partager, se souvenir.",120,1005,820,34);
  x.fillStyle="#170438";x.font="bold 34px sans-serif";x.fillText(`${state.stamps.length} tampon${state.stamps.length>1?"s":""}`,80,1190);x.fillText(`${new Set(state.stamps.map(s=>s.city).filter(Boolean)).size} ville${new Set(state.stamps.map(s=>s.city).filter(Boolean)).size>1?"s":""}`,380,1190);x.fillText(`${state.styles.length} style${state.styles.length>1?"s":""}`,700,1190);
  x.font="22px monospace";x.fillStyle="#4E3880";x.fillText("kizpass.vercel.app",80,1280);
  return await new Promise(resolve=>c.toBlob(resolve,"image/png",.95));
}
function roundRect(ctx,x,y,w,h,r,topOnly=false){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,topOnly?y+h:y+h-r);if(!topOnly)ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);if(!topOnly)ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function wrapText(ctx,text,x,y,maxWidth,lineHeight){const words=String(text).split(/\s+/);let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,y);line=word;y+=lineHeight}else line=test}ctx.fillText(line,x,y)}

$("share").addEventListener("click",async()=>{
  const t=`Mon KIZPASS — ${state.name||"passeport de danse"}, ${state.stamps.length} tampon${state.stamps.length>1?"s":""}.`;
  try{
    const blob=await makeShareCard();const file=new File([blob],"mon-kizpass.png",{type:"image/png"});
    if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:"KIZPASS",text:t,files:[file]});return}
    if(navigator.share){await navigator.share({title:"KIZPASS",text:t,url:location.href});return}
  }catch(e){if(e?.name==="AbortError")return}
  try{await navigator.clipboard.writeText(t+" "+location.href);alert("Lien copié ✦")}catch{alert(t)}
});

document.querySelectorAll(".sheet").forEach(s=>s.addEventListener("click",e=>{if(e.target===s)s.classList.remove("open")}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".sheet.open").forEach(s=>s.classList.remove("open"))});

let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").hidden=false});
$("installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").hidden=true});
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;deferredInstallPrompt=null});

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}

render();renderEvents();renderPeople();
