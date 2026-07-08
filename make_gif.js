// Animated evolution GIF from live sprite data. Uses the "uncompressed GIF" LZW
// technique (fixed 8-bit codes + periodic CLEAR) — fully spec-valid, renders in
// every decoder (no variable-width off-by-one risk).
const fs = require("fs"), vm = require("vm");
const code = fs.readFileSync("hatch.html","utf8").match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/)[0];
function lit(m){ const st=code.indexOf(m),o=code.indexOf("{",st); let d=0,e=-1;
  for(let i=o;i<code.length;i++){const c=code[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}} return vm.runInNewContext("("+code.slice(o,e+1)+")"); }
const SPRITES=lit("const SPRITES = {"), FONT=lit("const FONT = {");
function buildShade(sp){ const w=Math.max(...sp.sil.map(r=>r.length)); const rows=sp.sil.map(r=>r.padEnd(w," ")); const h=rows.length;
  const on=(r,c)=>r>=0&&r<h&&c>=0&&c<w&&rows[r][c]==="#"; let top=h,bot=0;
  for(let r=0;r<h;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}
  const span=Math.max(1,bot-top),map=[]; for(let r=0;r<h;r++){const l=[];for(let c=0;c<w;c++){if(!on(r,c)){l.push(0);continue;}
    if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){l.push(3);continue;}l.push((r-top)/span<0.42?1:2);}map.push(l);} sp.shade={map,w,h}; }
for(const k in SPRITES) buildShade(SPRITES[k]);

const PALETTE=[[219,238,186],[139,173,77],[63,107,50],[20,48,15],[238,250,212],[205,225,174],[233,244,206],[0,0,0]];
const W=240,H=220,S=7;
function newFrame(flash){ const b=new Uint8Array(W*H);
  for(let y=0;y<H;y++){ const row = flash?6:(y%3===0?5:0); for(let x=0;x<W;x++) b[y*W+x]=row; } return b; }
function rect(b,x,y,w,h,idx){ x|=0;y|=0; for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){ const px=x+xx,py=y+yy;
  if(px<0||py<0||px>=W||py>=H)continue; b[py*W+px]=idx; } }
function drawSprite(b,key,cx,cy,s){ const sp=SPRITES[key],{map,w,h}=sp.shade; const ox=cx-(w*s>>1),oy=cy-(h*s>>1);
  for(let r=0;r<h;r++)for(let c=0;c<w;c++){ const lv=map[r][c]; if(lv) rect(b,ox+c*s,oy+r*s,s,s,lv); }
  for(const e of (sp.eyes||[])){ rect(b,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,4);
    const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0; rect(b,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,3); }
  if(sp.mouth) rect(b,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,3); }
function tW(str,s){ let w=0; for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*s;} return w-s; }
function text(b,str,x,y,s,idx){ let cx=x; for(const ch of str.toUpperCase()){ const g=FONT[ch]||FONT["?"];
  for(let r=0;r<g.length;r++)for(let c=0;c<g[r].length;c++) if(g[r][c]==="1") rect(b,cx+c*s,y+r*s,s,s,idx); cx+=(g[0].length+1)*s; } }
function textC(b,str,y,s,idx){ text(b,str,(W-tW(str,s))/2,y,s,idx); }

// uncompressed GIF-LZW: min code size 7, fixed 8-bit codes, CLEAR(128)/EOI(129), re-CLEAR every 125 codes
function lzw(px){ const CLEAR=128,EOI=129,bytes=[]; bytes.push(CLEAR); let count=0;
  for(let i=0;i<px.length;i++){ bytes.push(px[i]&127); if(++count===125){ bytes.push(CLEAR); count=0; } }
  bytes.push(EOI); return bytes; }              // width is 8 → each code is exactly one byte
function subBlocks(bytes){ const out=[]; for(let i=0;i<bytes.length;i+=255){ const c=bytes.slice(i,i+255); out.push(c.length,...c); } out.push(0); return out; }

const out=[]; const push=(...a)=>{ for(const x of a) out.push(x&255); }; const u16=v=>{ out.push(v&255,(v>>8)&255); };
for(const c of "GIF89a") out.push(c.charCodeAt(0));
u16(W); u16(H); out.push(0xF2,0,0);
for(let i=0;i<8;i++){ const c=PALETTE[i]||[0,0,0]; out.push(c[0],c[1],c[2]); }
push(0x21,0xFF,0x0B); for(const c of "NETSCAPE2.0") out.push(c.charCodeAt(0)); push(0x03,0x01); u16(0); push(0x00);
function addFrame(px,delay){ push(0x21,0xF9,0x04,0x00); u16(delay); push(0x00,0x00);
  push(0x2C); u16(0); u16(0); u16(W); u16(H); push(0x00); push(7);
  for(const b of subBlocks(lzw(px))) out.push(b&255); }

const stages=[["egg","EGG"],["momo","BABY"],["sh_child","CHILD"],["sh_teen_r","TEEN"],["sh_adult","ADULT"],["sh_elder","ELDER"]];
stages.forEach(([key,label],i)=>{
  for(let bob=0;bob<2;bob++){ const f=newFrame(false);
    textC(f,"HATCH - IT EVOLVES",14,3,2);
    drawSprite(f,key,W/2,112-bob,S);
    textC(f,label,176,4,3);
    textC(f,"HATCHPET.PAGES.DEV",200,2,2);
    addFrame(f,45); }
  if(i<stages.length-1) addFrame(newFrame(true),7);
});
out.push(0x3B);
fs.writeFileSync("hatch-evolve.gif", Buffer.from(out));
console.log("wrote hatch-evolve.gif", W+"x"+H, (out.length/1024|0)+"KB", stages.length*2+(stages.length-1)+" frames");

// ---- self-check: decode frame 1's LZW back and confirm it round-trips ----
function unlzw(bytes){ const out=[]; for(const c of bytes){ if(c===128){continue;} if(c===129)break; out.push(c); } return out; }
const testFrame=newFrame(false); drawSprite(testFrame,"sh_elder",W/2,112,S);
const dec=unlzw(lzw(Array.from(testFrame)));
const ok = dec.length===testFrame.length && dec.every((v,i)=>v===testFrame[i]);
console.log("LZW round-trip:", ok?"OK (pixels identical)":"!! MISMATCH");
