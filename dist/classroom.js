import {normalize} from "./analyze.js";
const methods=[
 ["Hash-map inverted index","Find candidate pairs","C maps each normalized token to earlier questions containing it. A pair that shares several tokens is considered once per new question. Common tokens can still produce many candidates."],
 ["Longest Common Subsequence","Compare word order","For two token sequences of lengths m and n, C computes LCS with dynamic programming in O(m × n) time and one row of O(n) working space. Similarity is 2 × LCS / (m + n)."],
 ["Union-Find","Build question groups","Pairs meeting the threshold are joined using path compression and union by size. If A matches B and B matches C, all three can belong to one group even when A and C score lower."],
 ["Randomized Quick Sort","Rank the groups","C chooses a random pivot and sorts groups by distinct paper count, then by total known marks. A component ID resolves remaining ties. For g groups the expected time is O(g log g), with O(g²) worst case."]
];
export function classroom(escape,first,second,threshold){
  const inputs=[first,second].map((text,i)=>'<label>Question '+(i?"B":"A")+'<textarea id="compare-'+i+'" rows="3" maxlength="2000">'+escape(text)+'</textarea></label>').join("");
  return '<div class="classroom"><section class="comparison panel"><header><div><div class="eyebrow">WORKED EXAMPLE</div><h2>Why do these questions match?</h2><p>Edit either wording to see which words stay in order.</p></div></header><div class="comparison-inner"><div class="compare-inputs">'+inputs+'</div><label class="lab-range">Example threshold <output id="lab-value">'+threshold+'%</output><input id="lab-threshold" type="range" min="40" max="100" value="'+threshold+'"></label><div id="trace" aria-live="polite"></div></div></section></div><section class="panel method-panel"><header><div><h2>Algorithms in the C engine</h2><p>PDF.js reads embedded text. Tesseract handles English OCR. After review, JavaScript normalizes words and sends token IDs to the compiled C engine.</p></div></header><div class="method-grid">'+methods.map(([title,role,body])=>'<article><small>'+role+'</small><h3>'+title+'</h3><p>'+body+'</p></article>').join("")+'</div></section>';
}
// Classroom trace retains the DP matrix to reconstruct a visible subsequence.
// The C ranking engine only needs its length and can keep a single row.
export function showTrace(escape){
  const root=document.querySelector("#trace");
  if(!root)return;
  const threshold=Number(document.querySelector("#lab-threshold").value);
  document.querySelector("#lab-value").value=threshold+"%";
  const [a,b]=[0,1].map(i=>normalize(document.querySelector("#compare-"+i).value));
  if(!a.length||!b.length||Math.max(a.length,b.length)>128){
    root.textContent="Enter between 1 and 128 normalized tokens in each question.";return;
  }
  const matrix=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
    matrix[i][j]=a[i-1]===b[j-1]?matrix[i-1][j-1]+1:Math.max(matrix[i-1][j],matrix[i][j-1]);
  }
  let i=a.length,j=b.length;
  const sequence=[];
  while(i&&j){
    if(a[i-1]===b[j-1]){sequence.push(a[i-1]);i--;j--}
    else if(matrix[i-1][j]>=matrix[i][j-1])i--;else j--;
  }
  sequence.reverse();
  const match=200*sequence.length>=(a.length+b.length)*threshold;
  const score=200*sequence.length/(a.length+b.length);
  root.innerHTML='<div class="trace-head"><strong>'+Number(score.toFixed(2))+'%</strong><span class="verdict '+(match?"pass":"")+'">'+(match?"Meets threshold":"Below threshold")+'</span></div><p>2 × '+sequence.length+' shared tokens ÷ ('+a.length+' + '+b.length+' tokens)</p><small>One longest common subsequence</small><div class="tokens">'+(sequence.map(w=>'<span>'+escape(w)+'</span>').join("")||"No shared tokens")+'</div>';
}

