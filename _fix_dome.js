// PROTOTYPE reshape of the dome/shell line to kill the phallic silhouette.
// Strategy: broader "hood" dome (rounded, does NOT taper to a tip), body wider-than-tall,
// widest point kept low (mound, not column), tighter inboard feet. Keeps the strict inset
// eye gate + single-component connectivity. Renders CURRENT (live) vs NEW side by side.
const fs=require("fs"),zlib=require("zlib"),vm=require("vm");
const h=fs.readFileSync("hatch.html","utf8");
function lit(m){const s=h.indexOf(m),o=h.indexOf("{",s);let d=0,e=-1;for(let i=o;i<h.length;i++){const c=h[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+h.slice(o,e+1)+")");}
const FONT=lit("const FONT = {");
const SPRITES=lit("const SPRITES = {");
const E=(x,y,w,hh)=>({x,y,w,h:hh}),M=(x,y,w,hh)=>({x,y,w,h:hh});

// ── NEW builder: mound body (widest low), broad hood, tight feet ──
function build2(o){
  const WT=o.WT, HT=15;
  const g=Array.from({length:HT},()=>Array(WT).fill(" "));
  const set=(r,c)=>{if(r>=0&&r<HT&&c>=0&&c<WT)g[r][c]="#";};
  const cx=WT>>1, cw=o.coreW, chh=o.coreH, ctop=o.coreTop, cleft=cx-(cw>>1), cright=cleft+cw-1;
  const hline=(r,a,b)=>{for(let c=a;c<=b;c++)set(r,c);};
  // solid rectangular-ish core
  for(let r=ctop;r<ctop+chh;r++)hline(r,cleft,cright);
  // BROAD HOOD (rounded, flat-ish crown — no narrow tip): only pull in 1 col per row, max 2 rows
  hline(ctop-1,cleft+1,cright-1);
  if(o.grand)hline(ctop-2,cleft+2,cright-2);
  // MOUND base: flare the lowest body row out to full width, rounded bottom, then TIGHT inboard feet
  const by=ctop+chh; // bottom rounding row
  hline(by,cleft+1,cright-1);
  // tight little feet, pulled inboard, small gap
  const fl=cx-2, fr=cx+1;
  set(by+1,fl);set(by+1,fl+1);set(by+1,fr);set(by+1,fr+1);
  if(o.feral){ // feral: slightly splayed but still inboard
    set(by+1,cx-3);set(by+1,cx+2);
  }
  const sil=g.map(row=>row.join("").replace(/\s+$/,""));
  const eh=o.eh, gap=o.gap??1, span=3+gap+3, ex0=cx-(span>>1), ey=ctop+1;
  const eyes=[E(ex0,ey,3,eh),E(ex0+3+gap,ey,3,eh)];
  const my=ctop+chh-1;
  const mouth=o.feral?M(cx-2,my,5,1):M(cx-1,my,2,1);
  return {sil,eyes,mouth};
}
const NEW={};
// wider-than-tall across the whole line; adults stay chunky (already fine but rebuilt for consistency)
NEW.momo    =build2({WT:15,coreW:11,coreH:5,coreTop:5,eh:4});
NEW.sh_child=build2({WT:15,coreW:11,coreH:4,coreTop:6,eh:3});
NEW.sh_teen_r=build2({WT:17,coreW:13,coreH:4,coreTop:6,eh:3});
NEW.sh_teen_f=build2({WT:17,coreW:13,coreH:4,coreTop:6,eh:3,feral:true});
NEW.sh_adult =build2({WT:19,coreW:15,coreH:5,coreTop:6,eh:4});
NEW.sh_adult2=build2({WT:19,coreW:15,coreH:5,coreTop:6,eh:4,feral:true});
NEW.sh_elder =build2({WT:19,coreW:15,coreH:5,coreTop:7,eh:4,grand:true});

// ── gates ──
function cell(sp,r,c){return (sp.sil[r]&&sp.sil[r][c])||" ";}
function insetOK(sp,e){for(let yy=-1;yy<=e.h;yy++)for(let xx=-1;xx<=e.w;xx++){if(cell(sp,e.y+yy,e.x+xx)!=="#")return false;}return true;}
function components(sp){const rows=sp.sil,H=rows.length,W=Math.max(...rows.map(r=>r.length));const on=(r,c)=>r>=0&&r<H&&c>=0&&c<W&&(rows[r][c]||" ")==="#";const seen=new Set();let comps=0;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(on(r,c)&&!seen.has(r+","+c)){comps++;const st=[[r,c]];seen.add(r+","+c);while(st.length){const[y,x]=st.pop();for(const[dy,dx]of[[1,0],[-1,0],[0,1],[0,-1]]){const ny=y+dy,nx=x+dx;if(on(ny,nx)&&!seen.has(ny+","+nx)){seen.add(ny+","+nx);st.push([ny,nx]);}}}}}return comps;}
const FA=[],FL=[];for(const k in NEW){for(const e of NEW[k].eyes)if(!insetOK(NEW[k],e))FA.push(k);if(components(NEW[k])>1)FL.push(k+"("+components(NEW[k])+")");}
console.log("inset:",FA.length?"FAIL "+[...new Set(FA)]:"OK all "+Object.keys(NEW).length);
console.log("connectivity:",FL.length?"FLOAT "+FL:"OK single-component");

// ── render CURRENT vs NEW ──
const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function sil(sp){return sp.sil;}
function buildShade(rows){const w=Math.max(...rows.map(r=>r.length));rows=rows.map(r=>r.padEnd(w," "));const hh=rows.length;const on=(r,c)=>r>=0&&r<hh&&c>=0&&c<w&&rows[r][c]==="#";let top=hh,bot=0;for(let r=0;r<hh;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<hh;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}return{map,w,hh};}
const s=9;
function img(w,ht){const buf=Buffer.alloc(w*ht*3);for(let y=0;y<ht;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h:ht,buf};}
function rect(im,x,y,w,ht,c){x|=0;y|=0;for(let yy=0;yy<ht;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
function drawSp(im,sp,ox,oy){const rows=sil(sp);const sh=buildShade(rows);for(let r=0;r<sh.hh;r++)for(let c=0;c<sh.w;c++){const lv=sh.map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}for(const e of(sp.eyes||[])){rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK);}if(sp.mouth)rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);return sh;}
function text(im,str,x,y,sc,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*sc,y+r*sc,sc,sc,c);cx+=(g[0].length+1)*sc;}}
function textC(im,str,cx,y,sc,c){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*sc;}text(im,str,cx-(w-sc)/2,y,sc,c);}
const order=["momo","sh_child","sh_teen_r","sh_teen_f","sh_adult","sh_adult2","sh_elder"];
const COLS=7,cw=150,rowH=180,top=40;const W=COLS*cw,H=top+rowH*2;
const im=img(W,H);
textC(im,"CURRENT (top)  vs  NEW (bottom)",W/2,12,2,INK);
order.forEach((k,i)=>{const cx=i*cw+cw/2;
  const cur=SPRITES[k];if(cur){const sh=buildShade(sil(cur));drawSp(im,cur,cx-sh.w*s/2,top+rowH-40-sh.hh*s);}
  textC(im,k,cx,top+rowH-30,1,P2);
  const nw=NEW[k];const sh2=buildShade(sil(nw));drawSp(im,nw,cx-sh2.w*s/2,top+rowH*2-40-sh2.hh*s);
});
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("_fix_dome.png",toPNG(im));
fs.writeFileSync("_fix_dome.json",JSON.stringify(NEW));
console.log("wrote _fix_dome.png",W+"x"+H);
