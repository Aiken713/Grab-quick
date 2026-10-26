const DEF_TIERS=[
 {name:"Common",max:100,say:true,snd:null,color:"#c8d4f0"},
 {name:"Uncommon",max:40,say:true,snd:null,color:"#5ec2ff"},
 {name:"Rare",max:20,say:true,snd:null,color:"#7da6ff"},
 {name:"Epic",max:8,say:true,snd:null,color:"#ff6b7d"},
 {name:"Legendary",max:3,say:true,snd:null,color:"#ff2d4a"},
 {name:"Mythic",max:1,say:true,snd:null,color:"#ffd84d"},
 {name:"Crazy pull",max:.5,say:true,snd:null,color:"#e24dff"}];
const TCOL=DEF_TIERS.map(t=>t.color);
const DEF_ITEMS=[["Pizza",30],["Pasta",30],["Tacos",20],["Sushi",12],["Ice cream",6],["Golden steak",2]].map(([n,w])=>({n,w}));
let S={items:DEF_ITEMS,tiers:clone(DEF_TIERS),secs:10,log:[],stats:{rounds:0,items:{},tiers:{}}};
try{const r=localStorage.getItem("rarity-picker-v2")||localStorage.getItem("rarity-picker-v1");if(r){const p=JSON.parse(r);if(p&&((p.items&&p.tiers)||p.wheels))S=Object.assign(S,p)}}catch(e){}
if(!S.stats||!S.stats.items)S.stats={rounds:0,items:{},tiers:{}};
S.items.forEach(i=>{if(typeof i.r!=="number")i.r=tierOf(eff(i))});
function uid(){return Math.random().toString(36).slice(2,9)}
function clone(o){return JSON.parse(JSON.stringify(o))}
const blank=()=>({rounds:0,items:{},tiers:{}});
if(!Array.isArray(S.wheels)||!S.wheels.length){
 const first={id:uid(),name:"My first wheel",items:S.items,tiers:S.tiers,secs:S.secs,stats:S.stats,log:S.log||[]};
 S.wheels=[first].concat((S.sets||[]).map(s=>({id:uid(),name:s.name,items:s.items,tiers:s.tiers,secs:s.secs||10,stats:blank(),log:[]})));
 S.cur=first.id}
function migrateWheel(w){w.items.forEach(i=>{if(typeof i.r!=="number")i.r=0});if(!w.stats||!w.stats.items)w.stats=blank();if(!w.log)w.log=[];if(!w.secs)w.secs=10;
 w.tiers.forEach((t,i)=>{if(!t.color)t.color=TCOL[i]||"#7da6ff"});
 if(!w.t2){const has=n=>w.tiers.some(t=>t.name.toLowerCase()===n);
  if(!has("mythic"))w.tiers.push({name:"Mythic",max:1,say:true,snd:null,color:"#ffd84d"});
  if(!has("crazy pull"))w.tiers.push({name:"Crazy pull",max:.5,say:true,snd:null,color:"#e24dff"});w.t2=true}}
let pendT=null;
S.wheels.forEach(migrateWheel);
function curW(){return S.wheels.find(w=>w.id===S.cur)||S.wheels[0]}
function loadWheel(id){S.cur=id;const w=curW();S.cur=w.id;S.items=w.items;S.tiers=w.tiers;S.secs=w.secs;S.stats=w.stats;S.log=w.log}
function syncCur(){const w=curW();w.items=S.items;w.tiers=S.tiers;w.secs=S.secs;w.stats=S.stats;w.log=S.log}
loadWheel(S.cur);
function save(){try{syncCur();localStorage.setItem("rarity-picker-v2",JSON.stringify({wheels:S.wheels,cur:S.cur}));return true}catch(e){return false}}
const $=id=>document.getElementById(id);
function tcol(i){const t=S.tiers[Math.min(i,S.tiers.length-1)];return (t&&t.color)||"#7da6ff"}
const scol=i=>tcol(i),mix=c=>"color-mix(in srgb,"+c+" 62%,#0b1f4d)",col=i=>mix(tcol(i));
function autoShare(){let F=0,A=0;S.items.forEach(i=>{if(i.auto)A++;else F+=Math.max(0,+i.w||0)});return A?Math.max(0,100-F)/A:0}
function wt(it){return it.auto?autoShare():Math.max(0,+it.w||0)}
function sum(){const a=autoShare();return S.items.reduce((s,i)=>s+(i.auto?a:Math.max(0,+i.w||0)),0)}
function eff(it){const t=sum();return t?wt(it)/t*100:0}
const fmt=p=>+(+p).toFixed(p<1?2:1);
function tierOf(p){// smallest max that still covers p -> rarest matching tier
  let best=0,bm=Infinity;S.tiers.forEach((t,i)=>{if(p<=t.max&&t.max<bm){bm=t.max;best=i}});return best}

/* ---------- audio ---------- */
let ac;function ctx(){if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();return ac}
function tone(f,t0,d,type,v){const a=ctx(),o=a.createOscillator(),g=a.createGain();o.type=type||"sine";o.frequency.value=f;
 g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v||.15,t0+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
 o.connect(g).connect(a.destination);o.start(t0);o.stop(t0+d+.05)}
function tick(f){try{tone(f||600,ctx().currentTime,.06,"square",.06)}catch(e){}}
function fanfare(i){try{const a=ctx(),t=a.currentTime,sc=[262,330,392,523,659,784,1047,1319,1568,2093];
 const n=Math.min(2+(i*1.5|0),10);for(let k=0;k<n;k++)tone(sc[k],t+k*.1,.35,i>2?"sawtooth":"triangle",.14);
 if(i>=3)for(let k=0;k<3;k++)tone(sc[3+k]*(i>=4?2:1),t+n*.1+.05,1.1,"sine",.1);
 if(i>=5)for(let k=0;k<6;k++)tone(1568+k*120,t+n*.1+.3+k*.07,.5,"square",.05)}catch(e){}}
function playTier(i){const t=S.tiers[i];
 if(t.snd){try{new Audio(t.snd).play()}catch(e){}}else fanfare(i);
 if(t.say&&"speechSynthesis" in window){try{const u=new SpeechSynthesisUtterance(t.name);u.rate=.9;u.pitch=i>2?.7:1;setTimeout(()=>speechSynthesis.speak(u),t.snd?0:500)}catch(e){}}}

/* ---------- game ---------- */
const stage=$("stage");let busy=false;
function idle(){stage.className="stage";stage.style.removeProperty("--glow");
 stage.innerHTML='<div class="hint">'+esc(curW().name)+' · Round '+(S.stats.rounds+1)+'. Everyone ready? Eyes on the table.</div><button class="big" id="go">Start round</button>';$("go").onclick=start}
function pick(){const t=sum();if(t<=0)return null;let r=Math.random()*t;
 for(const it of S.items){r-=wt(it);if(r<0)return it}return S.items[S.items.length-1]}
function start(){
 if(busy)return;if(!S.items.length||sum()<=0){stage.innerHTML='<div class="name">Add an item with a chance above 0 first.</div><button class="big" id="go">Start round</button>';$("go").onclick=start;return}
 busy=true;ctx();const ms=Math.max(1,Math.min(60,+S.secs||10))*1000;
 stage.className="stage";stage.innerHTML='<div class="ring"></div><div class="name">Rolling…</div><div class="bar"><i id="pb"></i></div>';
 const t0=performance.now();let nextTick=0;
 (function loop(){const e=performance.now()-t0,f=e/ms;
  const pb=$("pb");if(pb)pb.style.width=Math.min(100,f*100)+"%";
  if(e>=nextTick&&f<1){tick(380+f*700);nextTick=e+Math.max(110,650-f*540)}
  if(e<ms)requestAnimationFrame(loop);else reveal()})();
}
function reveal(){
 const it=pick(),p=eff(it),ti=Math.min(it.r|0,S.tiers.length-1),t=S.tiers[ti];
 stage.className="stage done"+(ti>=5?" wow":"");stage.style.setProperty("--glow",scol(ti));
 stage.innerHTML='<div class="rar">'+esc(t.name)+'</div><div class="name">'+esc(it.n)+'</div><div class="hint">Round '+(S.stats.rounds+1)+' · '+fmt(p)+'% chance'+'</div><button class="big" id="go">Next round</button>';
 $("go").onclick=start;playTier(ti);
 S.stats.rounds++;S.stats.items[it.n]=(S.stats.items[it.n]||0)+1;S.stats.tiers[t.name]=(S.stats.tiers[t.name]||0)+1;
 S.log.unshift({n:it.n,r:t.name,k:tcol(ti)});S.log=S.log.slice(0,200);save();drawLog();drawStats();busy=false}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}

/* ---------- settings UI ---------- */
function tierOpts(sel){return S.tiers.map((t,i)=>'<option value="'+i+'"'+(i===sel?' selected':'')+'>'+esc(t.name)+'</option>').join("")}
function drawItems(){
 const a=autoShare();
 $("items").innerHTML=S.items.map((it,k)=>'<div class="row"><input type="text" data-n="'+k+'" value="'+esc(it.n)+'" aria-label="Item name"><label class="chk"><input type="checkbox" data-au="'+k+'"'+(it.auto?' checked':'')+'> Auto</label><input type="number" data-w="'+k+'" value="'+(it.auto?fmt(a):it.w)+'" min="0" step="any" aria-label="Chance percent"'+(it.auto?' disabled':'')+'><span>%</span>'+(it.auto?'':'<span class="eqv" data-e="'+k+'" title="Real chance out of 100">= '+fmt(eff(it))+'%</span>')+'<select data-r="'+k+'" aria-label="Rarity" style="color:'+col(it.r)+'">'+tierOpts(it.r)+'</select><button class="s" data-d="'+k+'" aria-label="Remove '+esc(it.n)+'">Remove</button></div>').join("");
 if(!S.items.length)$("items").innerHTML='<div class="hint">No items yet. Add your first one below.</div>';
 $("newR").innerHTML=tierOpts(0);$("secs").value=S.secs;updTotal()}
function drawBar(){const t=sum();$("pbar").innerHTML=t?S.items.map(it=>{const p=eff(it);return p<=0?"":'<i title="'+esc(it.n)+' '+fmt(p)+'%" style="width:'+p+'%;background:'+tcol(it.r)+'">'+(p>=9?'<span>'+esc(it.n)+'</span>':'')+'</i>'}).join(""):""}
function refreshAutos(){const a=fmt(autoShare());S.items.forEach((it,k)=>{if(it.auto){const n=document.querySelector('[data-w="'+k+'"]');if(n)n.value=a}else{const e=document.querySelector('[data-e="'+k+'"]');if(e)e.textContent="= "+fmt(eff(it))+"%"}})}
function updTotal(){
 const A=S.items.filter(i=>i.auto).length,F=S.items.reduce((s,i)=>s+(i.auto?0:Math.max(0,+i.w||0)),0);let m="",cls="hint",bal=false;
 if(!S.items.length){m=""}
 else if(A&&F===0){m="Auto items split 100% evenly ("+fmt(autoShare())+"% each)."}
 else if(A&&F<=100){m="Items with a number use "+fmt(F)+"%. The other "+fmt(100-F)+"% is shared by the "+A+" Auto item"+(A>1?"s":"")+" ("+fmt(autoShare())+"% each). Every number you see is a real chance."}
 else if(A){m="The numbers you typed add up to "+fmt(F)+"%, which is over 100%. Auto items get 0% and everything is scaled down. Lower a number to fix it.";cls="tw"}
 else if(Math.abs(F-100)<0.005){m="Adds up to 100%. Every number is a real chance."}
 else if(F<100){m="Only "+fmt(F)+"% is handed out. The leftover "+fmt(100-F)+"% is spread out in proportion, so real chances are a bit higher than your numbers. Tap Balance to 100% or switch an item to Auto.";cls="tw";bal=true}
 else{m="Adds up to "+fmt(F)+"%, which is over 100%. Real chances are scaled down. Tap Balance to 100%.";cls="tw";bal=true}
 $("total").className=cls;$("total").textContent=m;$("bal").style.display=bal?"":"none";drawBar();refreshAutos()}
$("eq").onclick=()=>{S.items.forEach(i=>i.auto=true);save();drawItems()};
$("bal").onclick=()=>{const t=sum();if(t<=0)return;S.items.forEach(i=>{i.w=+((+i.w||0)*100/t).toFixed(2)});save();drawItems()};
function drawTiers(){
 $("tiers").innerHTML=S.tiers.map((t,i)=>'<div class="tier"><div class="row"><input type="text" data-tn="'+i+'" value="'+esc(t.name)+'" aria-label="Rarity name" style="color:'+col(i)+';font-weight:800"><input type="color" data-tc="'+i+'" value="'+(t.color||'#7da6ff')+'" aria-label="Rarity color"><button class="s'+(pendT===i?' warn':'')+'" data-tdel="'+i+'">'+(pendT===i?'Tap again to delete':'Delete')+'</button></div>'+
 '<div class="row"><label><input type="checkbox" data-ts="'+i+'" '+(t.say?"checked":"")+'> Say the name out loud</label></div>'+
 '<div class="row"><button class="s" data-tr="'+i+'">'+(t.snd?'Change sound':'Record or upload')+'</button>'+(t.snd?'<button class="s" data-tx="'+i+'">Use built-in</button>':'<span class="hint">Using built-in</span>')+'<button class="s" data-tp="'+i+'">Test</button></div></div>').join("")}
function drawLog(){$("hist").innerHTML=S.log.length?S.log.map(l=>'<div><span>'+esc(l.n)+'</span><b style="color:'+(l.k?mix(l.k):col(l.c))+'">'+esc(l.r)+'</b></div>').join(""):'<div class="hint">Nothing drawn yet.</div>'}
$("items").addEventListener("input",e=>{const d=e.target.dataset;
 if(d.n!==undefined)S.items[d.n].n=e.target.value;
 if(d.w!==undefined){S.items[d.w].w=e.target.value===""?0:+e.target.value;save();updTotal();return}
 if(d.au!==undefined){const it=S.items[d.au];if(e.target.checked)it.auto=true;else{it.w=fmt(autoShare());it.auto=false}save();drawItems();const c=document.querySelector('[data-au="'+d.au+'"]');if(c)c.focus();return}
 if(d.r!==undefined){S.items[d.r].r=+e.target.value;e.target.style.color=col(+e.target.value);save();return}
 save()});
function drawItemsKeep(el){const k=el.dataset.w;drawItems();const n=document.querySelector('[data-w="'+k+'"]');if(n){n.focus();const v=n.value;n.value="";n.value=v}}
$("items").addEventListener("click",e=>{const k=e.target.dataset.d;if(k!==undefined){S.items.splice(k,1);save();drawItems()}});
$("newAuto").onchange=()=>{$("newW").disabled=$("newAuto").checked};
$("add").onclick=()=>{const n=$("newName").value.trim();if(!n)return;S.items.push({n,auto:$("newAuto").checked,w:+$("newW").value||0,r:+$("newR").value||0});$("newName").value="";save();drawItems()};
$("newName").addEventListener("keydown",e=>{if(e.key==="Enter")$("add").click()});
$("secs").oninput=e=>{S.secs=+e.target.value||10;save()};
$("tiers").addEventListener("input",e=>{const d=e.target.dataset;
 if(d.tc!==undefined){S.tiers[d.tc].color=e.target.value;const nm=e.target.closest(".tier").querySelector("[data-tn]");if(nm)nm.style.color=col(+d.tc);save();drawItems();drawStats();return}
 if(d.tn!==undefined)S.tiers[d.tn].name=e.target.value;
 if(d.tm!==undefined)S.tiers[d.tm].max=+e.target.value||0;
 if(d.ts!==undefined)S.tiers[d.ts].say=e.target.checked;
 if(d.tf!==undefined){const f=e.target.files[0];if(f){const r=new FileReader();r.onload=()=>{S.tiers[d.tf].snd=r.result;save();drawTiers()};r.readAsDataURL(f)}return}
 save();drawItems()});
$("tiers").addEventListener("click",e=>{const d=e.target.dataset;
 if(d.tx!==undefined){S.tiers[d.tx].snd=null;save();drawTiers()}
 if(d.tp!==undefined)playTier(+d.tp);
 if(d.tr!==undefined)openSnd(+d.tr);
 if(d.tdel!==undefined){const k=+d.tdel;if(S.tiers.length<2)return;
  if(pendT===k){S.tiers.splice(k,1);S.items.forEach(it=>{if(it.r===k)it.r=0;else if(it.r>k)it.r--});pendT=null;save();drawTiers();drawItems();drawStats()}
  else{pendT=k;drawTiers()}}});
$("tadd").onclick=()=>{const n=$("tnew").value.trim();if(!n)return;S.tiers.push({name:n,max:0,say:true,snd:null,color:$("tcol").value});$("tnew").value="";pendT=null;save();drawTiers();drawItems();drawStats()};
$("tnew").addEventListener("keydown",e=>{if(e.key==="Enter")$("tadd").click()});
function updTvr(){$("tvr").textContent=curW().name+" · Rounds played: "+S.stats.rounds}
function drawStats(){const st=S.stats,mx=Math.max(1,...Object.values(st.items));
 $("rounds").textContent=st.rounds;updTvr();
 const row=(n,c,m,color)=>'<div class="srow"><span>'+esc(n)+'</span><div class="sb"><i style="width:'+(c/m*100)+'%;'+(color?'background:'+color:'')+'"></i></div><b>'+c+'</b></div>';
 const tm=Math.max(1,...Object.values(st.tiers));
 const byT=S.tiers.map((t,i)=>row(t.name,st.tiers[t.name]||0,tm,col(i))).join("");
 const byI=Object.entries(st.items).sort((a,b)=>b[1]-a[1]).map(([n,c])=>row(n,c,mx)).join("");
 $("stats").innerHTML='<div class="sub">By rarity</div>'+byT+'<div class="sub">By item</div>'+(byI||'<div class="hint">No picks yet.</div>')}
let rt;$("rst").onclick=()=>{const b=$("rst");if(b.classList.contains("warn")){clearTimeout(rt);S.stats={rounds:0,items:{},tiers:{}};S.log=[];save();drawStats();drawLog();idle();b.classList.remove("warn");b.textContent="Reset stats"}
 else{b.classList.add("warn");b.textContent="Tap again to reset everything";rt=setTimeout(()=>{b.classList.remove("warn");b.textContent="Reset stats"},3500)}};

/* ---------- record or upload a sound ---------- */
const rec={mr:null,stream:null,idx:0,data:null,timer:null};
function stopRec(){try{if(rec.mr&&rec.mr.state!=="inactive")rec.mr.stop()}catch(e){}}
function closeStream(){if(rec.stream){rec.stream.getTracks().forEach(t=>t.stop());rec.stream=null}clearInterval(rec.timer)}
function setPend(d,m){rec.data=d;$("sndPrev").src=d;$("sndPrev").hidden=false;$("sndSave").disabled=false;$("sndMsg").textContent=m}
function openSnd(i){rec.idx=i;rec.data=null;$("sndTitle").textContent="Sound for "+S.tiers[i].name;$("sndPrev").hidden=true;$("sndSave").disabled=true;
 $("sndRec").textContent="Record";$("sndMsg").textContent="Tap Record, then speak or play your sound. It stops by itself after 8 seconds.";$("snd").showModal()}
$("sndRec").onclick=async()=>{
 if(rec.mr&&rec.mr.state==="recording"){stopRec();return}
 try{rec.stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){$("sndMsg").textContent="Couldn’t use the microphone. Allow mic access in your browser, or upload a file instead.";return}
 const ch=[];rec.mr=new MediaRecorder(rec.stream);
 rec.mr.ondataavailable=e=>{if(e.data.size)ch.push(e.data)};
 rec.mr.onstop=()=>{closeStream();$("sndRec").textContent="Record again";const r=new FileReader();r.onload=()=>setPend(r.result,"Recorded. Tap play to check it.");r.readAsDataURL(new Blob(ch,{type:rec.mr.mimeType||"audio/webm"}))};
 rec.mr.start();$("sndRec").textContent="Stop";let s=0;$("sndMsg").textContent="Recording… 0s";
 rec.timer=setInterval(()=>{s++;$("sndMsg").textContent="Recording… "+s+"s";if(s>=8)stopRec()},1000)};
$("sndUp").onclick=()=>$("sndFile").click();
$("sndFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>setPend(r.result,"File loaded. Tap play to check it.");r.readAsDataURL(f);e.target.value=""};
$("sndSave").onclick=()=>{S.tiers[rec.idx].snd=rec.data;drawTiers();
 if(save())$("snd").close();else $("sndMsg").textContent="Using it for now, but it’s too big to remember after you close the page. Try a shorter one."};
$("sndCancel").onclick=()=>$("snd").close();
$("snd").addEventListener("close",()=>{if(rec.mr)rec.mr.onstop=null;stopRec();closeStream();$("sndPrev").pause()});

/* ---------- wheels library ---------- */
let pendW=null;
function wmsg(t){$("wmsg").textContent=t}
function drawWList(){$("wlist").innerHTML=S.wheels.map(w=>'<div class="row"><b style="flex:1 1 120px">'+esc(w.name)+(w.id===S.cur?' <span class="hint">(open)</span>':'')+'</b><span class="pct">'+w.items.length+' items</span>'+(w.id===S.cur?'':'<button class="s" data-wo="'+w.id+'">Open</button>')+'<button class="s" data-we="'+w.id+'">Export</button><button class="s" data-wl="'+w.id+'">Copy link</button><button class="s" data-wd="'+w.id+'">Duplicate</button><button class="s'+(pendW===w.id?' warn':'')+'" data-wx="'+w.id+'">'+(pendW===w.id?'Tap again to delete':'Delete')+'</button></div>').join("")}
function drawWheels(){$("wname").value=curW().name;drawWList()}
function refreshAll(){drawItems();drawTiers();drawLog();drawStats();drawWheels();if(!busy)idle()}
function openWheel(id){if(busy)return;save();loadWheel(id);save();pendW=null;refreshAll()}
$("wname").addEventListener("input",e=>{curW().name=e.target.value||"Untitled wheel";save();drawWList();updTvr()});
$("wadd").onclick=()=>{const n=$("wnew").value.trim()||"New wheel";if(busy)return;save();
 const w={id:uid(),name:n,items:[],tiers:clone(DEF_TIERS),secs:10,stats:blank(),log:[]};migrateWheel(w);S.wheels.push(w);loadWheel(w.id);$("wnew").value="";
 wmsg(save()?"Created “"+n+"”. Add its items below.":"Created, but this browser is out of room to remember it. Use Export.");pendW=null;refreshAll()};
$("wnew").addEventListener("keydown",e=>{if(e.key==="Enter")$("wadd").click()});
function b64u(u){let s="";for(let k=0;k<u.length;k+=8192)s+=String.fromCharCode.apply(null,u.subarray(k,k+8192));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function packWheel(w){const o={n:w.name,s:w.secs,i:w.items.map(i=>[i.n,i.auto?null:+i.w||0,i.r|0]),t:w.tiers.map(t=>[t.name,t.color,t.say?1:0])};
 let out=new TextEncoder().encode(JSON.stringify(o)),pre="p";
 if(typeof CompressionStream!=="undefined"){try{out=new Uint8Array(await new Response(new Blob([out]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer());pre="z"}catch(e){}}
 return pre+b64u(out)}
async function unpackWheel(s){const b=s.slice(1).replace(/-/g,"+").replace(/_/g,"/");let u=Uint8Array.from(atob(b+"=".repeat((4-b.length%4)%4)),c=>c.charCodeAt(0));
 if(s[0]==="z")u=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
 return JSON.parse(new TextDecoder().decode(u))}
function wheelFromShare(o){const hex=c=>/^#[0-9a-f]{6}$/i.test(c)?c:"#7da6ff";
 if(!o||!Array.isArray(o.i)||!Array.isArray(o.t)||!o.t.length||o.i.length>500||o.t.length>40)throw 0;
 const tiers=o.t.map(t=>({name:String(t[0]).slice(0,40),max:0,say:!!t[2],snd:null,color:hex(t[1])}));
 const items=o.i.map(i=>({n:String(i[0]).slice(0,60),auto:i[1]===null,w:i[1]===null?0:Math.max(0,+i[1]||0),r:Math.min(tiers.length-1,Math.max(0,i[2]|0))}));
 return {id:uid(),name:String(o.n||"Shared wheel").slice(0,60),items,tiers,secs:Math.max(1,Math.min(60,+o.s||10)),stats:blank(),log:[],t2:true}}
async function checkShared(){const m=location.hash.match(/^#wheel=([A-Za-z0-9_-]+)$/);if(!m)return;
 try{const w=wheelFromShare(await unpackWheel(m[1]));S.wheels.push(w);loadWheel(w.id);save();history.replaceState(null,"",location.pathname+location.search);refreshAll();wmsg("Added “"+w.name+"” from a shared link. It’s now in your list.")}
 catch(e){wmsg("That shared link didn’t work.")}}
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){try{const ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();const ok=document.execCommand("copy");ta.remove();return ok}catch(x){return false}}}
function download(name,text){const b=new Blob([text],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
$("wlist").addEventListener("click",async e=>{const d=e.target.dataset;
 if(d.we){save();const w=S.wheels.find(x=>x.id===d.we);download((w.name.replace(/[^\w-]+/g,"-")||"wheel")+".json",JSON.stringify({wheels:[w]},null,1));wmsg("Exported “"+w.name+"”.")}
 if(d.wl){save();const w=S.wheels.find(x=>x.id===d.wl);
  if(location.protocol==="file:"){wmsg("Links only work once the page is hosted online, like on GitHub Pages. Use Export for now.");return}
  const url=location.origin+location.pathname+location.search+"#wheel="+await packWheel(w),ok=await copyText(url),snd=w.tiers.some(t=>t.snd);
  wmsg(ok?"Link copied. Anyone who opens it gets their own copy of “"+w.name+"”."+(snd?" Recorded or uploaded sounds aren’t included, so use Export to share those.":""):"Couldn’t copy automatically. Copy this link: "+url)}
 if(d.wo)openWheel(d.wo);
 if(d.wd){save();const w=S.wheels.find(x=>x.id===d.wd),c=clone(w);c.id=uid();c.name=w.name+" copy";c.stats=blank();c.log=[];S.wheels.push(c);wmsg(save()?"Duplicated as “"+c.name+"”.":"Duplicated, but it’s too big to remember. Use Export.");drawWList()}
 if(d.wx){if(S.wheels.length<2){wmsg("Keep at least one wheel.");return}
  if(pendW===d.wx){const was=d.wx===S.cur;S.wheels=S.wheels.filter(x=>x.id!==d.wx);pendW=null;if(was)loadWheel(S.wheels[0].id);save();refreshAll()}
  else{pendW=d.wx;drawWList()}}});
$("exp").onclick=()=>{save();const b=new Blob([JSON.stringify({wheels:S.wheels,cur:S.cur},null,1)],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(b);a.download="rarity-picker-wheels.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
$("imp").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{const d=JSON.parse(r.result);let n=0;
  const add=w=>{if(!w||!w.items||!w.tiers)return;w.items.forEach(i=>{if(typeof i.r!=="number")i.r=0});
   const x={id:w.id||uid(),name:w.name||"Imported wheel",items:w.items,tiers:w.tiers,secs:w.secs||10,stats:w.stats&&w.stats.items?w.stats:blank(),log:w.log||[],t2:w.t2};migrateWheel(x);
   const i=S.wheels.findIndex(v=>v.id===x.id);if(i>=0)S.wheels[i]=x;else S.wheels.push(x);n++};
  (d.wheels||d.sets||[]).forEach(add);if(!d.wheels&&!d.sets)add(d.current||d);
  save();loadWheel(S.cur);refreshAll();wmsg("Imported "+n+" wheel"+(n===1?"":"s")+".")}catch(x){wmsg("That file didn’t work. Use a file made by Export.")}e.target.value=""};
 r.readAsText(f)};

/* ---------- TV mode ---------- */
let wl=null;
function setTv(on){document.body.classList.toggle("tv",on);$("tv").textContent=on?"Exit TV mode":"TV mode";
 try{if(on&&navigator.wakeLock)navigator.wakeLock.request("screen").then(l=>wl=l).catch(()=>{});else if(wl){wl.release();wl=null}}catch(e){}}
$("tv").onclick=async()=>{const el=document.documentElement,on=!document.body.classList.contains("tv");setTv(on);
 try{if(on){const f=el.requestFullscreen||el.webkitRequestFullscreen;if(f)await f.call(el)}else if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}}catch(e){}};
function fsChange(){if(!document.fullscreenElement&&!document.webkitFullscreenElement&&document.body.classList.contains("tv"))setTv(false)}
document.addEventListener("fullscreenchange",fsChange);document.addEventListener("webkitfullscreenchange",fsChange);
document.addEventListener("keydown",e=>{if(e.code==="Space"&&document.body.classList.contains("tv")&&!busy&&document.activeElement.tagName!=="INPUT"){e.preventDefault();start()}});

$("clr").onclick=()=>{S.log=[];save();drawLog()};

drawItems();drawTiers();drawLog();drawStats();drawWheels();idle();checkShared();
