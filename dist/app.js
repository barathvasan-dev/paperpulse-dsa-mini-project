import {classroom,showTrace} from "./classroom.js";
import {loadWorkspace} from "./workspace.js";
import {analyze} from "./analyze.js";
import {extract,segment} from "./extract.js";
const $=s=>document.querySelector(s), app=$("#app"), modal=$("#modal");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const paths={lab:"M7 3h10 M9 3v7l-6 9q-1 2 2 2h14q3 0 2-2l-6-9V3 M7 15h10",pulse:"M2 13h4l3-8 4 15 3-10 2 3h4",overview:"M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",papers:"M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7 M9 16h5",groups:"M3 17h4v4H3z M10 11h4v10h-4z M17 4h4v17h-4z",topics:"M3 5h18 M3 12h13 M3 19h9",plus:"M12 5v14 M5 12h14",arrow:"M5 12h14 M14 7l5 5-5 5",down:"M7 10l5 5 5-5",book:"M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1z M12 6v14",spark:"M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z",filter:"M4 7h16 M4 17h16 M9 4v6 M16 14v6",download:"M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",repeat:"M3 9h14l-3-3 M21 15H7l3 3",layers:"M2 8l10-5 10 5-10 5z M3 13l9 4 9-4 M3 17l9 4 9-4",shield:"M12 3l8 3v6q0 6-8 10-8-4-8-10V6z M8 12l3 3 5-6",search:"M15 15l6 6 M17 10a7 7 0 1 1-14 0 7 7 0 1 1 14 0",close:"M5 5l14 14 M19 5L5 19",menu:"M3 6h18 M3 12h18 M3 18h18",folder:"M3 6h6l2 2h10v12H3z",upload:"M12 17V3 M7 8l5-5 5 5 M3 17v4h18v-4"};
const icon=(n,s=18)=>'<svg aria-hidden="true" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'+paths[n]+'"/></svg>';
const names={overview:"Overview",papers:"Paper library",groups:"Question rankings",lab:"Algorithm lab"};
let matrixView=false, example=["",""];
let data, tab="overview", groups=[], draft=null, query="",filter="all",pending=false;
data=await loadWorkspace();
const subject=()=>data.subjects.find(s=>s.id===data.active)||data.subjects[0];
const save=()=>localStorage.setItem("paperpulse-v1",JSON.stringify(data));
function toast(msg){if(modal.open){let alert=modal.querySelector(".inline-error");if(!alert){alert=document.createElement("div");alert.className="inline-error";alert.setAttribute("role","alert");modal.querySelector("header").after(alert)}alert.textContent=msg;alert.scrollIntoView({block:"nearest"});return;}$("#notice").textContent=msg;$("#notice").classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("#notice").classList.remove("show"),4200)}
function dialog(title,html){modal.innerHTML='<header><h2>'+title+'</h2><button class="icon" aria-label="Close" data-a="close">'+icon("close")+'</button></header>'+html;if(!modal.open)modal.showModal()}
function nav(k){return '<button class="nav '+(tab===k?"sel":"")+'" aria-label="'+names[k]+'" data-tab="'+k+'">'+icon(k)+'<span>'+names[k]+'</span></button>'}
const btn=(action,label,style="",symbol="")=>'<button class="btn '+style+'" data-a="'+action+'">'+(symbol?icon(symbol,16):"")+label+'</button>';
async function refresh(){groups=await analyze(subject().papers,subject().threshold);render()}
function render(){
  const s=subject(),n=s.papers.reduce((a,p)=>a+p.questions.length,0),repeats=groups.filter(g=>g.frequency>1).length;
  app.innerHTML='<aside><div class="brand"><i>'+icon("pulse",30)+'</i>PaperPulse</div><div class="rail-label">WORKSPACE</div>'+Object.keys(names).map(nav).join("")+'<div class="rail-bottom">'+icon("shield",20)+'<div>Local workspace<small>Stored on this device</small></div></div></aside><main><header class="top"><div><button class="icon mobile" data-a="menu" aria-label="Open navigation">'+icon("menu")+'</button><span>Workspace</span><b>/</b>'+names[tab]+'</div><button class="subject" data-a="subjects">'+icon("book",16)+esc(s.name)+icon("down",14)+'</button></header><div class="content"><div class="title"><div><div class="eyebrow"><i></i> STUDY WORKSPACE</div><h1>'+({overview:"Workspace overview",papers:"Paper library",groups:"Question rankings",lab:"Algorithm lab"}[tab])+'</h1></div>'+btn("add","Add paper","primary","plus")+'</div>'+(tab==="overview"?overview(s,n,repeats):tab==="papers"?library(s):tab==="groups"?rankings():classroom(esc,...example,s.threshold))+'<footer>PaperPulse <span>Past paper analysis workspace</span></footer></div></main>';
  if(tab==="lab") showTrace(esc);
}
function overview(s,n,repeats){
  const stats=[["papers","Source papers",s.papers.length,"In this collection"],["layers","Questions",n,"Reviewed entries"],["repeat","Recurring groups",repeats,"Across multiple papers"]];
  return '<section class="hero"><div class="hero-copy"><div class="tag">'+icon("book",13)+"Subject collection"+'</div><h2>'+esc(s.name)+'</h2><p>'+ (s.papers.length?"Explore recurring questions across your past papers.":"Add your first paper to start comparing questions.")+'</p><button data-tab="groups">Explore rankings '+icon("arrow",15)+'</button><button class="hero-lab" data-tab="lab">Algorithm lab '+icon("lab",15)+'</button></div><div class="art" aria-hidden="true"><div class="sheet back"></div><div class="sheet front"><div class="tiny-lines"></div><strong>Σ</strong><div class="scribble"></div></div><div class="chart-sticker">'+icon("groups",31)+'</div><div class="star">✳</div></div></section><div class="stats">'+stats.map(([i,l,v,t],j)=>'<article><div class="stat-head"><span class="tile c'+j+'">'+icon(i,18)+'</span>'+l+'</div><strong>'+v+'</strong><small>'+t+'</small></article>').join("")+'</div><section class="panel"><header><div><div class="eyebrow">QUESTION ANALYSIS</div><h2>Top recurring questions</h2></div><button class="text" data-tab="groups">View all '+icon("arrow",14)+'</button></header>'+groupList(groups.filter(g=>g.frequency>1).slice(0,4))+'</section>';
}
function groupList(rows){return rows.length?rows.map(g=>{const i=groups.indexOf(g),q=g.items[0];return '<button class="group-row" data-g="'+i+'"><span class="rank">'+String(i+1).padStart(2,"0")+'</span><span class="grow"><strong>'+esc(q.text)+'</strong><small>'+esc(q.topic||"Unassigned")+' <em>·</em> '+g.marks+' known marks</small></span><span class="pill">'+g.frequency+' '+(g.frequency===1?"paper":"papers")+'</span></button>'}).join(""):'<p class="empty">No matching groups. Add papers or adjust your filters.</p>'}
function library(s){return '<section class="panel"><header><div><h2>Source papers</h2><p>'+s.papers.length+' papers in '+esc(s.name)+'</p></div></header>'+s.papers.map((p,i)=>'<button class="group-row" data-paper="'+i+'"><span class="tile c0">'+icon("papers")+'</span><span class="grow"><strong>'+esc(p.name)+'</strong><small>'+esc(p.year||"Year unspecified")+' · '+p.questions.length+' questions</small></span><span class="text">Review '+icon("arrow",14)+'</span></button>').join("")+(s.papers.length?"":'<p class="empty">Add a PDF, scan or photo to build your library.</p>')+'</section>'}
function filtered(){const search=query.toLowerCase();return groups.filter(g=>(filter!=="repeat"||g.frequency>1)&&g.items.some(q=>[q.text,q.topic,q.year,q.paper].some(x=>String(x).toLowerCase().includes(search))))}
function coverageTable(rows){
  const papers=subject().papers;
  if(!rows.length)return groupList([]);
  const heads=papers.map(p=>'<th scope="col">'+esc(p.name)+'<small>'+esc(p.year)+'</small></th>').join("");
  const body=rows.map(g=>{
    const counts=new Map();
    for(const q of g.items)counts.set(q.paperId,(counts.get(q.paperId)||0)+1);
    return '<tr><th scope="row"><button data-g="'+groups.indexOf(g)+'">'+esc(g.items[0].text)+'</button></th>'+papers.map(p=>{
      const count=counts.get(p.id)||0;
      return '<td><span class="'+(count?"hit":"miss")+'">'+(count||"—")+'</span></td>';
    }).join("")+'</tr>';
  }).join("");
  return '<div class="matrix-scroll" tabindex="0" aria-label="Scrollable paper coverage"><table class="matrix"><caption>Occurrences per paper. Select a question to inspect its sources.</caption><thead><tr><th scope="col">Question group</th>'+heads+'</tr></thead><tbody>'+body+'</tbody></table></div>';
}
function rankedContent(){const rows=filtered();return matrixView?coverageTable(rows):groupList(rows)}
function rankings(){return '<section class="panel"><header class="rank-toolbar"><div><h2>Evidence by question</h2><p>'+groups.length+' groups · '+subject().papers.length+' source papers</p></div><div class="switcher"><button data-a="list-view" aria-pressed="'+!matrixView+'">Ranked list</button><button data-a="matrix-view" aria-pressed="'+matrixView+'">Paper coverage</button></div></header><header class="tools"><div class="search">'+icon("search",16)+'<input id="search" aria-label="Search questions" placeholder="Search questions or topics" value="'+esc(query)+'"></div><select id="filter" aria-label="Group filter"><option value="all">All groups</option><option value="repeat" '+(filter==="repeat"?"selected":"")+'>Recurring only</option></select>'+btn("settings",subject().threshold+"% match","","filter")+btn("csv","Export CSV","","download")+'</header><div id="list">'+rankedContent()+'</div></section>'}
function details(i){const g=groups[i];dialog("Question group",'<div class="dialog-body"><span class="pill">Rank '+(i+1)+' · '+g.frequency+' distinct papers</span><h3>'+esc(g.items[0].text)+'</h3><p>'+g.items.length+' occurrences · '+g.marks+' total known marks</p>'+(g.items.length>1?'<button class="btn" data-a="compare-group" data-index="'+i+'">Compare two wordings in the lab ↗</button>':"")+g.items.map(q=>'<section class="evidence"><small>'+esc(q.paper)+' · '+esc(q.year||"Year unspecified")+' · '+(q.marks??"Unknown")+' marks</small><p>'+esc(q.text)+'</p></section>').join("")+'</div>')}
function subjects(){dialog("Subject collections",'<div class="dialog-body">'+data.subjects.map(s=>'<button class="group-row" data-sub="'+esc(s.id)+'">'+icon("folder")+'<span class="grow">'+esc(s.name)+'</span><small>'+s.papers.length+' papers</small></button>').join("")+'<form id="newsubject"><label>New subject<input required maxlength="80" name="name" placeholder="e.g. Operating Systems"></label><button class="btn primary">Create collection</button></form></div>')}
function add(){dialog("Add a paper",'<div class="dialog-body"><p>Import one paper, then review the questions before saving.</p><label class="drop">'+icon("upload",32)+'<strong>Choose a paper</strong><small>PDF, image or text · 25 MB maximum</small><input type="file" id="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.txt"></label><div id="progress" role="status"></div><label>Or paste question text<textarea id="paste" rows="5" placeholder="1. Explain binary tree traversal. [10 marks]"></textarea></label>'+btn("paste","Review pasted text","primary","arrow")+'</div>')}
function review(){dialog("Review paper",'<div class="dialog-body"><p>Check wording, marks and topics. Only saved questions enter the analysis.</p><div class="pair"><label>Paper name<input id="pname" maxlength="120" value="'+esc(draft.name)+'"></label><label>Year<input id="pyear" maxlength="12" value="'+esc(draft.year)+'"></label></div><div id="questions">'+draft.questions.map((q,i)=>'<section class="editq" data-i="'+i+'"><div><b>Question '+(i+1)+'</b><button class="text" data-remove="'+i+'">Remove</button></div><textarea aria-label="Question '+(i+1)+' text" rows="2" data-key="text">'+esc(q.text)+'</textarea><div class="pair"><label>Topic<input maxlength="80" data-key="topic" value="'+esc(q.topic)+'"></label><label>Marks<input type="number" min="0" max="999" data-key="marks" value="'+esc(q.marks)+'"></label></div></section>').join("")+'</div>'+btn("newq","Add question","","plus")+'<div class="actions">'+(subject().papers.some(p=>p.id===draft.id)?btn("delete","Remove paper","danger"):"")+btn("store","Save and analyze","primary")+'</div></div>')}
function readDraft(){draft.name=$("#pname").value.trim();draft.year=$("#pyear").value.trim();document.querySelectorAll(".editq").forEach(el=>{const q=draft.questions[+el.dataset.i];el.querySelectorAll("[data-key]").forEach(input=>{q[input.dataset.key]=input.dataset.key==="marks"?(input.value===""?null:Number(input.value)):input.value.trim()})})}
function makeDraft(name,text){const qs=segment(text);if(!qs.length)throw Error("No readable questions found. Paste text or try a clearer scan.");if(qs.length>600)throw Error("Import fewer than 601 questions at once.");draft={id:crypto.randomUUID(),name,year:name.match(/(?:19|20)\d{2}/)?.[0]||"",questions:qs};review()}
function exportCSV(){const values=[["Rank","Distinct papers","Group known marks","Question","Topic","Paper","Paper ID","Year","Marks"]];for(const g of filtered())for(const q of g.items)values.push([groups.indexOf(g)+1,g.frequency,g.marks,q.text,q.topic,q.paper,q.paperId,q.year,q.marks]);const csv=values.map(r=>r.map(v=>{let t=String(v??"");if(/^[\s]*[=+@-]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"'}).join(",")).join("\r\n");const url=URL.createObjectURL(new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"})),link=document.createElement("a");link.href=url;link.download="paperpulse-rankings.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
async function commit(change){const before=JSON.stringify(data);try{change();await refresh();save();modal.close()}catch(e){data=JSON.parse(before);await refresh();throw e}}
function settings(){dialog("Similarity threshold",'<div class="dialog-body"><p>Lower values group more wordings together. Higher values require a closer word sequence. A chain of matching pairs can connect a group.</p><label>Minimum LCS similarity <output id="val">'+subject().threshold+'%</output><input id="threshold" type="range" min="40" max="100" value="'+subject().threshold+'"></label>'+btn("apply","Apply and reanalyze","primary")+'</div>')}
document.addEventListener("click",async e=>{const b=e.target.closest("button");if(!b||pending)return;try{
  if(b.dataset.tab){tab=b.dataset.tab;document.body.classList.remove("nav-open");render();window.scrollTo(0,0);return}
  if(b.dataset.g!==undefined)return details(+b.dataset.g);
  if(b.dataset.paper!==undefined){draft=structuredClone(subject().papers[+b.dataset.paper]);return review()}
  if(b.dataset.sub){query="";filter="all";return await commit(()=>data.active=b.dataset.sub)}
  if(b.dataset.remove!==undefined){readDraft();draft.questions.splice(+b.dataset.remove,1);return review()}
  switch(b.dataset.a){
    case "list-view":case "matrix-view":matrixView=b.dataset.a==="matrix-view";render();break;
    case "compare-group":{
      const g=groups[Number(b.dataset.index)];
      example=[g.items[0].text,(g.items.find(q=>q.text!==g.items[0].text)||g.items[1]).text];
      modal.close();tab="lab";render();window.scrollTo(0,0);break;
    }
    case "menu":document.body.classList.toggle("nav-open");break;
    case "close":modal.close();break;
    case "subjects":subjects();break;
    case "settings":settings();break;
    case "apply":await commit(()=>subject().threshold=+$("#threshold").value);break;
    case "csv":exportCSV();break;
    case "add":add();break;
    case "paste":makeDraft("Untitled paper",$("#paste").value);break;
    case "newq":readDraft();draft.questions.push({text:"",marks:null,topic:""});review();modal.querySelector(".editq:last-child textarea")?.focus();break;
    case "delete":dialog("Remove this paper?",'<div class="dialog-body"><p>Removing '+esc(draft.name)+' will update the rankings for this subject.</p>'+btn("keep","Keep paper")+' '+btn("confirmDelete","Remove paper","danger")+'</div>');break;
    case "keep":review();break;
    case "confirmDelete":await commit(()=>subject().papers=subject().papers.filter(p=>p.id!==draft.id));break;
    case "store":readDraft();if(!draft.name||!draft.questions.length||draft.questions.some(q=>!q.text||(q.marks!==null&&(!Number.isInteger(q.marks)||q.marks<0||q.marks>999))))throw Error("Enter a paper name, question text and whole marks from 0–999, or leave marks blank.");
    await commit(()=>{const s=subject(),i=s.papers.findIndex(p=>p.id===draft.id);if(i<0)s.papers.push(draft);else s.papers[i]=draft});toast("Paper saved and rankings updated.");break;
  }
}catch(err){toast(err.message)}});
document.addEventListener("input",e=>{if(["compare-0","compare-1","lab-threshold"].includes(e.target.id))showTrace(esc);if(e.target.id==="threshold")$("#val").value=e.target.value+"%";if(e.target.id==="search"){query=e.target.value;$("#list").innerHTML=rankedContent()}});
document.addEventListener("submit",async e=>{if(e.target.id!=="newsubject")return;e.preventDefault();const name=e.target.elements.name.value.trim();if(!name)return;try{await commit(()=>{const id=crypto.randomUUID();data.subjects.push({id,name,threshold:70,papers:[]});data.active=id});toast("Subject collection created.")}catch(err){toast(err.message)}});
document.addEventListener("change",async e=>{if(e.target.id==="filter"){filter=e.target.value;$("#list").innerHTML=rankedContent()}if(e.target.id!=="file"||!e.target.files[0])return;const f=e.target.files[0];pending=true;modal.setAttribute("aria-busy","true");modal.querySelectorAll("input,button,textarea").forEach(el=>el.disabled=true);const status=m=>$("#progress").textContent=m;try{status("Reading paper…");const text=await extract(f,status);makeDraft(f.name.replace(/\.[^.]+$/,""),text)}catch(err){status("Import failed. "+err.message);e.target.value=""}finally{pending=false;modal.removeAttribute("aria-busy");modal.querySelectorAll("input,button,textarea").forEach(el=>el.disabled=false)}});
modal.addEventListener("cancel",e=>{if(pending)e.preventDefault()});
await refresh().catch(e=>{app.textContent="PaperPulse could not start. "+e.message});
