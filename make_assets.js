// Generates share images from the live sprite data — no image libs, pure node + zlib.
const fs = require("fs"), zlib = require("zlib"), vm = require("vm");
const code = fs.readFileSync("hatch.html", "utf8").match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/)[0];
function lit(marker) { const st = code.indexOf(marker), o = code.indexOf("{", st); let d=0,e=-1;
  for (let i=o;i<code.length;i++){ const c=code[i]; if(c==="{")d++; else if(c==="}"){ d--; if(!d){e=i;break;} } }
  return vm.runInNewContext("(" + code.slice(o,e+1) + ")"); }
const SPRITES = lit("const SPRITES = {"), FONT = lit("const FONT = {");

function buildShade(sp){ const w=Math.max(...sp.sil.map(r=>r.length)); const rows=sp.sil.map(r=>r.padEnd(w," ")); const h=rows.length;
  const on=(r,c)=> r>=0&&r<h&&c>=0&&c<w && rows[r][c]==="#";
  let top=h,bot=0; for(let r=0;r<h;r++)for(let c=0;c<w;c++) if(on(r,c)){ if(r<top)top=r; if(r>bot)bot=r; }
  const span=Math.max(1,bot-top), map=[];
  for(let r=0;r<h;r++){ const line=[]; for(let c=0;c<w;c++){ if(!on(r,c)){line.push(0);continue;}
    if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;} line.push((r-top)/span<0.42?1:2);
  } map.push(line);} sp.shade={map,w,h}; }
for(const k in SPRITES) buildShade(SPRITES[k]);

// palette (4-Shade Green)
const BG=[219,238,186], SCAN=[205,225,174], P1=[139,173,77], P2=[63,107,50], INK=[20,48,15], EYE=[238,250,212];
const PAL=[null,P1,P2,INK];

function img(w,h){ const buf=Buffer.alloc(w*h*3);
  for(let y=0;y<h;y++){ const c=(y%3===0)?SCAN:BG; for(let x=0;x<w;x++){ const i=(y*w+x)*3; buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2]; } }
  return {w,h,buf}; }
function rect(im,x,y,w,h,c){ x|=0;y|=0; for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){ const px=x+xx,py=y+yy;
  if(px<0||py<0||px>=im.w||py>=im.h)continue; const i=(py*im.w+px)*3; im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2]; } }
function frame(im,x,y,w,h,c,t){ rect(im,x,y,w,t,c);rect(im,x,y+h-t,w,t,c);rect(im,x,y,t,h,c);rect(im,x+w-t,y,t,h,c); }
function sprite(im,key,ox,oy,s){ const sp=SPRITES[key],{map,w,h}=sp.shade;
  for(let r=0;r<h;r++)for(let c=0;c<w;c++){ const lv=map[r][c]; if(lv) rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]); }
  for(const e of (sp.eyes||[])){ rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);
    const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;
    rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK); }
  if(sp.mouth) rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);
  return {w:w*s,h:h*s}; }
function spriteW(key,s){ return SPRITES[key].shade.w*s; }
function spriteH(key,s){ return SPRITES[key].shade.h*s; }
function tW(str,s){ let w=0; for(const ch of str.toUpperCase()){ const g=FONT[ch]||FONT["?"]; w+=(g[0].length+1)*s; } return w-s; }
function text(im,str,x,y,s,c){ let cx=x; for(const ch of str.toUpperCase()){ const g=FONT[ch]||FONT["?"];
  for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++) if(g[r][col]==="1") rect(im,cx+col*s,y+r*s,s,s,c);
  cx+=(g[0].length+1)*s; } return cx; }
function textC(im,str,y,s,c){ text(im,str,(im.w-tW(str,s))/2,y,s,c); }

// ---- PNG (RGB) ----
function crc32(buf){ let c=~0>>>0; for(let i=0;i<buf.length;i++){ c^=buf[i]; for(let k=0;k<8;k++) c=(c>>>1)^(0xEDB88320&-(c&1)); } return (~c)>>>0; }
function chunk(type,data){ const len=Buffer.alloc(4); len.writeUInt32BE(data.length,0);
  const body=Buffer.concat([Buffer.from(type,"ascii"),data]); const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(body),0);
  return Buffer.concat([len,body,crc]); }
function toPNG(im){ const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(im.w,0); ihdr.writeUInt32BE(im.h,4); ihdr[8]=8; ihdr[9]=2;
  const stride=im.w*3, raw=Buffer.alloc((stride+1)*im.h);
  for(let y=0;y<im.h;y++){ raw[y*(stride+1)]=0; im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride); }
  return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]); }

const URL = "HATCHPET.PAGES.DEV";

// ===== 1) CAST POSTER 1200x630 =====
(function(){ const im=img(1200,630); frame(im,14,14,1172,602,P2,3);
  textC(im,"HATCH",44,18,INK);
  textC(im,"A VIRTUAL PET FOR YOUR BROWSER",150,5,P2);
  textC(im,"200+ CREATURES - 4 FAMILIES - RARE ELDERS",188,5,INK);
  const cast=["momo","hd_adult","wolf_adult","falcon_adult","bl_adult","wy_adult","lion_adult","owl_adult","sh_elder","rap_adult","uni_adult","moth_adult"];
  const cols=6, s=6, cellW=190, cellH=150, gridW=cols*cellW, startX=(1200-gridW)/2, startY=250;
  cast.forEach((k,idx)=>{ const cx=startX+(idx%cols)*cellW, cy=startY+Math.floor(idx/cols)*cellH;
    sprite(im,k,cx+(cellW-spriteW(k,s))/2, cy+(110-spriteH(k,s))/2, s); });
  textC(im,"PLAY FREE - NO APP - NO ACCOUNT",552,5,P2);
  textC(im,URL,580,6,INK);
  fs.writeFileSync("share-cast.png", toPNG(im)); console.log("wrote share-cast.png", im.w+"x"+im.h);
})();

// ===== 2) EVOLUTION STRIP 1200x380 =====
(function(){ const im=img(1200,380); frame(im,14,14,1172,352,P2,3);
  textC(im,"ONE EGG - MANY PATHS",40,10,INK);
  const line=["egg","momo","sh_child","sh_teen_r","sh_adult","sh_elder"];
  const labels=["EGG","BABY","CHILD","TEEN","ADULT","ELDER"];
  const s=7, n=line.length, slot=1120/n, startX=40;
  line.forEach((k,i)=>{ const cx=startX+i*slot+slot/2;
    sprite(im,k, cx-spriteW(k,s)/2, 150-spriteH(k,s)/2, s);
    textC2(im,labels[i], cx, 250, 5, P2);
    if(i<n-1) text(im,">", startX+i*slot+slot-14, 150-10, 6, P2);
  });
  textC(im,"RAISE IT WELL AND IT ASCENDS - "+URL,330,6,INK);
  fs.writeFileSync("share-evolution.png", toPNG(im)); console.log("wrote share-evolution.png", im.w+"x"+im.h);
  function textC2(im,str,cx,y,s,c){ text(im,str,cx-tW(str,s)/2,y,s,c); }
})();

console.log("done");
