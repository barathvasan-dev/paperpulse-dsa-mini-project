const skip = new Set("a an the of in on for and with to how does what is are using".split(" "));
let engine;
export function normalize(text) {
  const words=text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+|[+*/=<>%-]/gu) || [];
  const filtered=words.filter(word=>!skip.has(word));
  return filtered.length ? filtered : words;
}
export async function analyze(papers, threshold) {
  engine ??= await WebAssembly.instantiate(await (await fetch("./pulse.wasm")).arrayBuffer());
  const api = engine.instance.exports, dictionary = new Map(), entries = [];
  api.reset(threshold, crypto.getRandomValues(new Uint32Array(1))[0]);
  for (const [p,paper] of papers.entries()) for (const q of paper.questions) {
    const ids = normalize(q.text).map(word => {
      if (!dictionary.has(word)) dictionary.set(word, dictionary.size + 1);
      return dictionary.get(word);
    });
    const ptr = api.input(p, q.marks ?? 0, ids.length);
    if (!ptr) throw Error("Each subject supports 600 questions, with up to 128 analysis tokens per question. Shorten a long question or split the collection.");
    new Int32Array(api.memory.buffer, ptr, ids.length).set(ids);
    entries.push({...q, paper:paper.name, year:paper.year, paperId:paper.id});
  }
  const count=api.analyze(), members=new Map();
  entries.forEach((q,i)=>{const r=api.group(i); if(!members.has(r)) members.set(r,[]);members.get(r).push(q)});
  return Array.from({length:count},(_,i)=>{
    const r=api.ranked(i);
    return {items:members.get(r), frequency:api.coverage(r), marks:api.score(r)};
  });
}

