const legacyRows = {
  "s0": [
    "0194ed2fdfed9825",
    "c3765e5a15f137e1",
    "a3485f30b58f1fa6",
    "02e3a0c911699aa4",
    "82a519fc14a99e30",
    "b19bd387cdf1fdb0"
  ],
  "s1": [
    "558b6b34bbfe1262",
    "ef14c8b86fb21576",
    "3f587737363d1b64",
    "a482b16e8bac26a8",
    "d5db493317df0f97",
    "0bc59b38e0f66570"
  ],
  "s2": [
    "cc6df92a84f62c41",
    "ef14c8b86fb21576",
    "3f587737363d1b64",
    "82a519fc14a99e30",
    "9be71a052da03bbd",
    "a9adbb55e9ab6caf"
  ],
  "s3": [
    "0194ed2fdfed9825",
    "c3765e5a15f137e1",
    "a3485f30b58f1fa6",
    "02e3a0c911699aa4",
    "06d295386e516129",
    "06bbe8bd160c09b4"
  ],
  "s4": [
    "cc6df92a84f62c41",
    "ef14c8b86fb21576",
    "d23dd28bf2ddb4a9",
    "d5db493317df0f97",
    "9be71a052da03bbd",
    "06d295386e516129"
  ],
  "s5": [
    "558b6b34bbfe1262",
    "3f587737363d1b64",
    "5a218546d1ab589f",
    "d5db493317df0f97",
    "b19bd387cdf1fdb0",
    "0bc59b38e0f66570"
  ]
};

function emptySubject() {
  return {id:crypto.randomUUID(),name:"Data Structures",threshold:70,papers:[]};
}
async function removeSeedQuestions(paper) {
  if (!Object.hasOwn(legacyRows,paper.id)) return paper;
  const originals=new Set(legacyRows[paper.id]);
  const encoder=new TextEncoder();
  const keep=await Promise.all(paper.questions.map(async question=>{
    const bytes=encoder.encode(JSON.stringify([question.text,question.topic,question.marks]));
    const digest=new Uint8Array(await crypto.subtle.digest("SHA-256",bytes));
    const key=Array.from(digest.slice(0,8),byte=>byte.toString(16).padStart(2,"0")).join("");
    return !originals.delete(key);
  }));
  const questions=paper.questions.filter((_,index)=>keep[index]);
  return questions.length ? {...paper,questions} : null;
}
export async function loadWorkspace(){
  const storageKey="paperpulse-v1";
  let state;
  try { state=JSON.parse(localStorage.getItem(storageKey)); } catch {}
  if(!state?.subjects?.length){
    const subject=emptySubject();
    return {active:subject.id,subjects:[subject]};
  }
  const old=state.subjects.find(s=>s.id==="sample" && s.sample===true);
  if(!old)return state;
  old.papers=(await Promise.all(old.papers.map(removeSeedQuestions))).filter(Boolean);
  delete old.sample;
  // Retain this collection when it holds user imports or is the only subject.
  if(!old.papers.length && state.subjects.length>1){
    state.subjects=state.subjects.filter(s=>s!==old);
    if(state.active===old.id)state.active=state.subjects[0].id;
  }
  localStorage.setItem(storageKey,JSON.stringify(state));
  return state;
}
