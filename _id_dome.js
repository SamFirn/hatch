// Render the dome/shell family big for identification vs the app screenshot.
const fs=require("fs"),zlib=require("zlib"),vm=require("vm");
const h=fs.readFileSync("hatch.html","utf8");
function lit(m){const s=h.indexOf(m),o=h.indexOf("{",s);let d=0,e=-1;for(let i=o;i<h.length;i++){const c=h[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+h.slice(o,e+1)+")");}
const FONT=lit("const FONT = {");
// pull the wired SPRITES art block from hatch.html so we render EXACTLY what's live
const SPRITES=lit("const SPRITES = {");
const want=["momo","sh_child","sh_teen_r","sh_teen_f","sh_adult","sh_adult2","sh_elder"];
const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function sil(sp){return sp.sil||sp.s||sp;}
function buildShade(rows){const w=Math.max(...rows.map(r=>r.length));rows=rows.map(r=>r.padEnd(w," "));const hh=rows.length;const on=(r,c)=>r>=0&&r<hh&&c>=0&&c<w&&rows[r][c]==="#";let top=hh,bot=0;for(let r=0;r<hh;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<hh;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}return{map,w,hh};}
const s=10;
function img(w,ht){const buf=Buffer.alloc(w*ht*3);for(let y=0;y<ht;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h:ht,buf};}
function rect(im,x,y,w,ht,c){x|=0;y|=0;for(let yy=0;yy<ht;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
function drawSp(im,sp,ox,oy){const rows=sil(sp);const sh=buildShade(rows);for(let r=0;r<sh.hh;r++)for(let c=0;c<sh.w;c++){const lv=sh.map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}for(const e of(sp.eyes||[])){rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK);}if(sp.mouth)rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);return sh;}
function text(im,str,x,y,sc,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*sc,y+r*sc,sc,sc,c);cx+=(g[0].length+1)*sc;}}
function textC(im,str,cx,y,sc,c){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*sc;}text(im,str,cx-(w-sc)/2,y,sc,c);}
const COLS=4,cw=200,chh=230,top=30;const rows=Math.ceil(want.length/COLS);const W=COLS*cw,H=top+rows*chh;
const im=img(W,H);
textC(im,"DOME / SHELL LINE (current live sprites)",W/2,10,2,INK);
want.forEach((k,idx)=>{const sp=SPRITES[k];if(!sp){textC(im,k+" MISSING",(idx%COLS)*cw+cw/2,top+((idx/COLS)|0)*chh+100,1.5,INK);return;}const ci=idx%COLS,ri=(idx/COLS)|0;const cx=ci*cw+cw/2,baseY=top+ri*chh+chh-40;const sh=buildShade(sil(sp));drawSp(im,sp,cx-sh.w*s/2,baseY-sh.hh*s);textC(im,k,cx,top+ri*chh+chh-28,1.5,P2);});
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("_id_dome.png",toPNG(im));console.log("wrote _id_dome.png",W+"x"+H,"| keys found:",want.filter(k=>SPRITES[k]).join(","));
console.log("SPRITE sample momo:",JSON.stringify(SPRITES.momo).slice(0,200));
