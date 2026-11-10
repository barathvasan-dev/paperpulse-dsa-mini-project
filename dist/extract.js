const vendor = new URL("./vendor/", import.meta.url).href;
export function segment(raw) {
  const lines=raw.replace(/\r/g,"").split("\n").map(s=>s.trim()).filter(Boolean);
  const start=/^(?:Q(?:uestion)?\.?\s*\d+\s*[:.)-]?\s+|\d+\s*[.)]\s*|\(\d+\)\s*)/i;
  const chunks=[];let current="";
  if(lines.some(l=>start.test(l))){
    for(const line of lines){
      if(start.test(line)){if(current) chunks.push(current);current=line.replace(start,"");}
      else if(current) current+=" "+line;
    }
    if(current) chunks.push(current);
  } else chunks.push(...lines);
  return chunks.map(line=>{
    const match=line.match(/\s*(?:\[\s*(\d{1,3})(?:\s*(?:marks?|pts?))?\s*\]|\(\s*(\d{1,3})\s*(?:marks?|pts?)\s*\)|\b(\d{1,3})\s*marks?)\s*$/i);
    const prompt=(match?line.slice(0,match.index):line).trim();
    const label=prompt.match(/\s*\[topic:\s*([^\]\r\n]{1,80})\]\s*$/i);
    return {text:(label?prompt.slice(0,label.index):prompt).trim(),marks:match?Number(match[1]||match[2]||match[3]):null,topic:label?label[1].trim():""};
  }).filter(q=>q.text);
}
export async function extract(file,status){
  if(file.size>25*1024*1024) throw Error("Choose a file under 25 MB.");
  let ocr,doc;
  async function recognize(source) {
    ocr ??= await Tesseract.createWorker("eng",1,{workerPath:vendor+"worker.min.js",corePath:vendor+"tesseract-core-lstm.wasm.js",langPath:vendor,logger:m=>status(m.status+" · "+Math.round((m.progress||0)*100)+"%")});
    return (await ocr.recognize(source)).data.text;
  }
  try{
    if(/\.txt$/i.test(file.name)) return await file.text();
    if(/\.pdf$/i.test(file.name)){
      const pdf=await import("./vendor/pdf.min.js"); pdf.GlobalWorkerOptions.workerSrc=vendor+"pdf.worker.min.js";
      doc=await pdf.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,useSystemFonts:true}).promise;
      if(doc.numPages>60) throw Error("Split this PDF into files of up to 60 pages.");
      const pages=[];
      for(let i=1;i<=doc.numPages;i++){
        status("Reading page "+i+" of "+doc.numPages);
        const page=await doc.getPage(i), content=await page.getTextContent();
        let str=content.items.map(x=>(x.str||"")+(x.hasEOL?"\n":" ")).join("");
        if(str.trim().length<15){
          const native=page.getViewport({scale:1}), view=page.getViewport({scale:Math.min(2,2400/Math.max(native.width,native.height))}), canvas=document.createElement("canvas");
          canvas.width=view.width;canvas.height=view.height;
          await page.render({canvasContext:canvas.getContext("2d"),viewport:view}).promise;
          str=await recognize(canvas);canvas.width=canvas.height=0;
        }
        pages.push(str);page.cleanup();
      }
      return pages.join("\n");
    }
    if(/\.(png|jpe?g|webp|bmp)$/i.test(file.name)) return await recognize(file);
    throw Error("Choose a PDF, PNG, JPEG, WebP, BMP or text file.");
  } finally {if(ocr) await ocr.terminate();if(doc) await doc.destroy();}
}
