// PILOT: scale-matched redraws of two Blobkins, shown next to the current versions
// and a Saurian for reference. Applies the strict inset eye gate to the new drafts.
const fs=require("fs"), zlib=require("zlib"), vm=require("vm");
const h=fs.readFileSync("hatch.html","utf8");
function lit(m){const s=h.indexOf(m),o=h.indexOf("{",s);let d=0,e=-1;for(let i=o;i<h.length;i++){const c=h[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+h.slice(o,e+1)+")");}
const APP=lit("const SPRITES = {");
const E=(x,y,w=3,h=3)=>({x,y,w,h});

// --- NEW scale-matched drafts (lean ~new-genus scale + big inset eyes) ---
const NEW={
 momo_new:{sil:["    ######    ","   ########   ","  ##########  "," ############ "," ############ "," ############ "," ############ "," ############ ","  ##########  ","   ##    ##   "], eyes:[E(3,4,3,4),E(8,4,3,4)], mouth:{x:6,y:8,w:2,h:1}},
 sh_elder_new:{sil:["  # # # # # #  "," ############## ","################","################","################","################"," ############## ","  ############  ","  ###      ###  ","  ##        ##  "], eyes:[E(4,3,3,3),E(9,3,3,3)], mouth:{x:7,y:6,w:2,h:1}},
};
// strict inset gate + autofit (same as charts)
function cell(sp,r,c){return (sp.sil[r]&&sp.sil[r][c])||" ";}
function insetOK(sp,e){for(let yy=-1;yy<=e.h;yy++)for(let xx=-1;xx<=e.w;xx++){if(cell(sp,e.y+yy,e.x+xx)!=="#")return false;}return true;}
const FAILS=[];
function autofit(name,sp){const eyes=sp.eyes||[];const cand=[];for(let dy=-3;dy<=9;dy++)for(let dx=0;dx<=6;dx++)cand.push([dx,dy]);cand.sort((a,b)=>(Math.abs(a[0])+Math.abs(a[1]))-(Math.abs(b[0])+Math.abs(b[1])));
  const[e0,e1]=eyes,o0={...e0},o1={...e1};for(const[dx,dy]of cand){const a={...e0,x:o0.x+dx,y:o0.y+dy},b={...e1,x:o1.x-dx,y:o1.y+dy};if(insetOK(sp,a)&&insetOK(sp,b)){Object.assign(e0,a);Object.assign(e1,b);return;}}FAILS.push(name);}
for(const k in NEW) autofit(k,NEW[k]);
console.log("inset:", FAILS.length?FAILS.join(", "):"all OK");

const ALL=Object.assign({}, APP, NEW);
const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function buildShade(sp){const w=Math.max(...sp.sil.map(r=>r.length));const rows=sp.sil.map(r=>r.padEnd(w," "));const hh=rows.length;const on=(r,c)=>r>=0&&r<hh&&c>=0&&c<w&&rows[r][c]==="#";let top=hh,bot=0;for(let r=0;r<hh;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<hh;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}sp.shade={map,w,hh};}
const s=7;
function img(w,ht){const buf=Buffer.alloc(w*ht*3);for(let y=0;y<ht;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h:ht,buf};}
function rect(im,x,y,w,ht,c){x|=0;y|=0;for(let yy=0;yy<ht;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
function drawSp(im,sp,ox,oy){buildShade(sp);const{map,w,hh}=sp.shade;for(let r=0;r<hh;r++)for(let c=0;c<w;c++){const lv=map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}for(const e of(sp.eyes||[])){rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK);}if(sp.mouth)rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);}
const FONT=lit("const FONT = {");
function text(im,str,x,y,sc,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*sc,y+r*sc,sc,sc,c);cx+=(g[0].length+1)*sc;}}
function textC(im,str,cx,y,sc,c){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*sc;}text(im,str,cx-(w-sc)/2,y,sc,c);}

const cols=[["CURRENT",["momo","sh_elder"]],["RESCALED (NEW)",["momo_new","sh_elder_new"]],["SAURIAN REF",["drakelet","hd_elder"]]];
const cw=230, ch=200, top=64, W=cols.length*cw, H=top+2*ch;
const im=img(W,H);
textC(im,"BLOBKIN SCALE PILOT - SAME PX/CELL AS THE APP",W/2,16,3,INK);
textC(im,"CURRENT 20PX  vs  RESCALED ~14-16PX  vs  NEW-GENUS SCALE",W/2,38,2,P2);
cols.forEach(([label,keys],ci)=>{ textC(im,label,ci*cw+cw/2,56,2,ci===1?INK:P2);
  keys.forEach((k,ri)=>{ const sp=ALL[k]; if(!sp) return; buildShade(sp); const {w,hh}=sp.shade;
    const cx=ci*cw+cw/2, baseY=top+ri*ch+ch-40; drawSp(im,sp,cx-w*s/2, baseY-hh*s);
    textC(im,k, ci*cw+cw/2, top+ri*ch+ch-24, 2, P2); }); });
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("pilot-blobkin.png",toPNG(im));console.log("wrote pilot-blobkin.png",W+"x"+H);
