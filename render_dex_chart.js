// Full evolution chart of every LIVE creature (Genus I Blobkin, 55 forms) from hatch.html.
const fs=require("fs"), zlib=require("zlib"), vm=require("vm");
const code=fs.readFileSync("hatch.html","utf8").match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/)[0];
function lit(m){const st=code.indexOf(m),o=code.indexOf("{",st);let d=0,e=-1;for(let i=o;i<code.length;i++){const c=code[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+code.slice(o,e+1)+")");}
const S=lit("const SPRITES = {"), D=lit("const DEX = {"), FONT=lit("const FONT = {");
function buildShade(sp){if(!sp||sp.shade)return;const w=Math.max(...sp.sil.map(r=>r.length));const rows=sp.sil.map(r=>r.padEnd(w," "));const h=rows.length;const on=(r,c)=>r>=0&&r<h&&c>=0&&c<w&&rows[r][c]==="#";let top=h,bot=0;for(let r=0;r<h;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<h;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}sp.shade={map,w,h};}
for(const k in S) buildShade(S[k]);
const nm=k=>(D[k]&&D[k].name)||k;

// lineage rows grouped by baby (good / rough branch of each baby)
const rows=[
 ["momo","shell"],["momo","bloom"],
 ["pabu","crest"],["pabu","fin"],
 ["tama","wing"], ["tama","ear"],
 ["nubb","spike"],["nubb","horn"],
];
const cols=["","child","teen_r","teen_f","adult","adult2","elder"]; // "" = baby (per-row)
const colHdr=["BABY","CHILD","TEEN +","TEEN -","ADULT +","ADULT -","ELDER"];

const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function img(w,h){const buf=Buffer.alloc(w*h*3);for(let y=0;y<h;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h,buf};}
function rect(im,x,y,w,h,c){x|=0;y|=0;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
function drawSp(im,sp,ox,oy,s){const{map,w,h}=sp.shade;for(let r=0;r<h;r++)for(let c=0;c<w;c++){const lv=map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}for(const e of(sp.eyes||[])){rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK);}if(sp.mouth)rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);}
function tW(str,s){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*s;}return w-s;}
function text(im,str,x,y,s,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*s,y+r*s,s,s,c);cx+=(g[0].length+1)*s;}}
function textC(im,str,cx,y,s,c){text(im,str,cx-tW(str,s)/2,y,s,c);}

const s=5, labelW=64, cellW=120, cellH=104, top=96;
const W=labelW+cols.length*cellW+20, H=top+rows.length*cellH+150;
const im=img(W,H);
textC(im,"HATCH - GENUS I: BLOBKIN",W/2,22,6,INK);
textC(im,"55 CREATURES - 8 LINEAGES - EGG TO ELDER",W/2,54,4,P2);
// column headers
colHdr.forEach((h,ci)=>textC(im,h,labelW+ci*cellW+cellW/2,76,3,P2));
// rows
rows.forEach(([baby,ln],ri)=>{ const y0=top+ri*cellH, baseY=y0+cellH-30;
  text(im,ln.toUpperCase(),6,y0+cellH/2-10,3,INK);
  const PRE={shell:"sh",bloom:"bl",crest:"cr",fin:"fn",wing:"wn",ear:"ea",spike:"sp",horn:"hn"};
  cols.forEach((cc,ci)=>{ const key = cc==="" ? baby : (PRE[ln]+"_"+cc); const sp=S[key]; if(!sp)return;
    const {w,h}=sp.shade; const cx=labelW+ci*cellW+cellW/2;
    drawSp(im,sp,cx-w*s/2, baseY-h*s, s);
    textC(im,nm(key),cx,baseY+4,2,INK);
  });
});
// footer: egg + universal care-outcome adults
const fy=top+rows.length*cellH+22;
textC(im,"START + CARE OUTCOMES  (ANY LINEAGE CAN REACH THESE)",W/2,fy,3,P2);
const fbase=fy+78;
[["egg","EGG"],["chonk",nm("chonk")],["grump",nm("grump")],["runt",nm("runt")]].forEach(([k,label],i)=>{
  const sp=S[k];buildShade(sp);const{w,h}=sp.shade;const cx=150+i*190;
  drawSp(im,sp,cx-w*s/2,fbase-h*s,s); textC(im,label,cx,fbase+6,2,INK);
});

function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("evolution-chart.png",toPNG(im));console.log("wrote evolution-chart.png",W+"x"+H);
