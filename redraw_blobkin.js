// REDRAW: all 55 Blobkin forms at the lean new-genus scale with big Gen-I inset eyes.
// Reuses the app's real shader/palette/eye rendering. Builds each creature from a
// GUARANTEED-SOLID face core + connected decorative toppers, so the strict inset eye
// gate (full 1px # border around each eye) passes by construction. Renders a chart.
//
// Lineage signature toppers:  shell=smooth dome · crest=center spike · wing=side flaps
//   spike=row of spikes · bloom=antennae w/ petals · fin=tall dorsal hump · ear=corner
//   ears · horn=corner horns.  noble(teen_r,adult)=small mouth; feral(teen_f,adult2)=wide mouth.
const fs=require("fs"),zlib=require("zlib"),vm=require("vm");
const h=fs.readFileSync("hatch.html","utf8");
function lit(m){const s=h.indexOf(m),o=h.indexOf("{",s);let d=0,e=-1;for(let i=o;i<h.length;i++){const c=h[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+h.slice(o,e+1)+")");}
const FONT=lit("const FONT = {");
const E=(x,y,w,hh)=>({x,y,w,h:hh});
const M=(x,y,w,hh)=>({x,y,w,h:hh});

// ── grid builder ──────────────────────────────────────────────
function build(o){
  const WT=o.WT, HT=15;
  const g=Array.from({length:HT},()=>Array(WT).fill(" "));
  const set=(r,c)=>{if(r>=0&&r<HT&&c>=0&&c<WT)g[r][c]="#";};
  const cx=WT>>1, cw=o.coreW, chh=o.coreH, ctop=o.coreTop, cleft=cx-(cw>>1), cright=cleft+cw-1;
  // solid face core
  for(let r=ctop;r<ctop+chh;r++)for(let c=cleft;c<=cright;c++)set(r,c);
  // topper (connected, above/around the core). Scales with body size + elder "grand" flag.
  const T=o.topper, big=cw>=13, grand=!!o.grand;
  const hline=(r,a,b)=>{for(let c=a;c<=b;c++)set(r,c);};
  const dome=()=>{ // tall smooth rounded hump
    hline(ctop-1,cleft+1,cright-1);
    hline(ctop-2,cleft+2,cright-2);
    if(cw>=11)hline(ctop-3,cleft+3,cright-3);
    if(grand)hline(ctop-4,cleft+4,cright-4);
  };
  if(T==="dome")dome();
  else if(T==="crest"){ // bold triangular crest rising from center
    hline(ctop-1,cleft+1,cright-1);
    const t=grand?4:big?3:2;
    for(let i=1;i<=t;i++){const half=Math.max(0,t-i);hline(ctop-1-i,cx-half,cx+half);}
  }
  else if(T==="spike"){ // crown of spikes (taller for big forms)
    for(let c=cleft+1;c<=cright-1;c+=2){set(ctop-1,c);if(big||grand)set(ctop-2,c);if(grand)set(ctop-3,c);}
  }
  else if(T==="fin"){ // tall dorsal sail
    const t=grand?5:big?4:3;
    for(let i=0;i<t;i++){const half=Math.max(0,(t-1-i));hline(ctop-1-i,cx-half,cx+half);}
  }
  else if(T==="wing"){ // broad side flaps
    const rows=big?3:2, ext=big?3:2;
    for(let i=0;i<rows;i++){const e=ext-i;for(let c=1;c<=e;c++){set(ctop+1+i,cleft-c);set(ctop+1+i,cright+c);}}
    if(grand){set(ctop,cleft-1);set(ctop,cright+1);}
  }
  else if(T==="ear"){ // upright pointed ears at corners
    const t=grand?4:big?3:2, li=cleft+1, ri=cright-1;
    for(let i=1;i<=t;i++){const w=Math.max(0,t-i);hline(ctop-i,li-0,li+w);hline(ctop-i,ri-w,ri+0);}
  }
  else if(T==="horn"){ // vertical horns w/ an outward tip (4-connected, no floating pixels)
    const t=grand?4:big?3:2;
    for(let i=1;i<=t;i++){set(ctop-i,cleft);set(ctop-i,cright);}
    set(ctop-t,cleft-1);set(ctop-t,cright+1);
  }
  else if(T==="bloom"){ // two antennae with flower petals
    const lx=cleft+2,rx=cright-2, stalk=grand?3:2;
    for(const bx of [lx,rx]){
      for(let i=1;i<=stalk;i++)set(ctop-i,bx);
      const py=ctop-stalk-1; // 3x3 petal
      set(py,bx);set(py,bx-1);set(py,bx+1);set(py-1,bx);set(py-1,bx-1);set(py-1,bx+1);set(py-2,bx);
    }
  }
  // rounded bottom + feet (feral = jagged/clawed feet)
  hline(ctop+chh,cleft+1,cright-1);
  if(o.feral){set(ctop+chh+1,cleft+1);set(ctop+chh+1,cleft+3);set(ctop+chh+1,cright-3);set(ctop+chh+1,cright-1);}
  else{set(ctop+chh+1,cleft+1);set(ctop+chh+1,cleft+2);set(ctop+chh+1,cright-2);set(ctop+chh+1,cright-1);}
  const sil=g.map(row=>row.join("").replace(/\s+$/,""));  // keep all rows so eye y-coords stay valid
  // eyes: big, centered in core, level, non-overlapping (legal by construction)
  const eh=o.eh, gap=o.gap??1, span=3+gap+3, ex0=cx-(span>>1)- (span%2?0:0), ey=ctop+1;
  const eyes=[E(ex0,ey,3,eh),E(ex0+3+gap,ey,3,eh)];
  // mouth on the lowest core row
  const my=ctop+chh-1;
  const mouth=o.feral?M(cx-2,my,5,1):M(cx-1,my,2,1);
  return {sil,eyes,mouth};
}

const S={};
// ===== BABIES =====
S.momo =build({WT:13,coreW:9,coreH:6,coreTop:4,eh:4,topper:"dome"});
S.pabu =build({WT:11,coreW:9,coreH:5,coreTop:5,eh:3,topper:"crest"});
S.tama =build({WT:13,coreW:11,coreH:5,coreTop:4,eh:3,topper:"ear"});
S.nubb =build({WT:11,coreW:9,coreH:5,coreTop:5,eh:3,topper:null});
// ===== UNIVERSAL OUTCOME ADULTS =====
S.grump=build({WT:15,coreW:13,coreH:5,coreTop:4,eh:3,topper:"dome",feral:true});
S.chonk=build({WT:17,coreW:15,coreH:6,coreTop:4,eh:4,topper:"dome"});
S.runt =build({WT:11,coreW:9,coreH:5,coreTop:5,eh:3,topper:null});

// helper for a 6-stage lineage: child, teen_r, teen_f, adult, adult2, elder
function lineage(pre,topper){
  S[pre+"_child"] =build({WT:15,coreW:9, coreH:5,coreTop:5,eh:3,topper});
  S[pre+"_teen_r"]=build({WT:17,coreW:11,coreH:5,coreTop:5,eh:3,topper});
  S[pre+"_teen_f"]=build({WT:17,coreW:11,coreH:5,coreTop:5,eh:3,topper,feral:true});
  S[pre+"_adult"] =build({WT:19,coreW:13,coreH:6,coreTop:6,eh:4,topper});
  S[pre+"_adult2"]=build({WT:19,coreW:13,coreH:6,coreTop:6,eh:4,topper,feral:true});
  S[pre+"_elder"] =build({WT:19,coreW:13,coreH:7,coreTop:7,eh:4,topper,grand:true});
}
lineage("sh","dome");
lineage("cr","crest");
lineage("wn","wing");
lineage("sp","spike");
lineage("bl","bloom");
lineage("fn","fin");
lineage("ea","ear");
lineage("hn","horn");

// ── strict inset gate verification (should already pass by construction) ──
function cell(sp,r,c){return (sp.sil[r]&&sp.sil[r][c])||" ";}
function insetOK(sp,e){for(let yy=-1;yy<=e.h;yy++)for(let xx=-1;xx<=e.w;xx++){if(cell(sp,e.y+yy,e.x+xx)!=="#")return false;}return true;}
const FAILS=[];
for(const k in S){const sp=S[k];for(const e of sp.eyes)if(!insetOK(sp,e))FAILS.push(k);}
console.log("inset gate:",FAILS.length?("FAIL → "+[...new Set(FAILS)].join(", ")):"all "+Object.keys(S).length+" OK");
// connectivity gate: every body must be ONE 4-connected component (no floating/diagonal-only pixels)
function components(sp){const rows=sp.sil,H=rows.length,W=Math.max(...rows.map(r=>r.length));const on=(r,c)=>r>=0&&r<H&&c>=0&&c<W&&(rows[r][c]||" ")==="#";const seen=new Set();let comps=0;for(let r=0;r<H;r++)for(let c=0;c<W;c++){if(on(r,c)&&!seen.has(r+","+c)){comps++;const st=[[r,c]];seen.add(r+","+c);while(st.length){const[y,x]=st.pop();for(const[dy,dx]of[[1,0],[-1,0],[0,1],[0,-1]]){const ny=y+dy,nx=x+dx;if(on(ny,nx)&&!seen.has(ny+","+nx)){seen.add(ny+","+nx);st.push([ny,nx]);}}}}}return comps;}
const FLOAT=[];for(const k in S){if(components(S[k])>1)FLOAT.push(k+"("+components(S[k])+")");}
console.log("connectivity:",FLOAT.length?("FLOATING → "+FLOAT.join(", ")):"all single-component OK");
if(process.argv[2]==="--dump"){fs.writeFileSync("_blobkin_redraw.json",JSON.stringify(S));console.log("dumped _blobkin_redraw.json ("+Object.keys(S).length+" forms)");}

// ── render chart (reuses app palette/shader/eye rendering) ────
const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function buildShade(sp){const w=Math.max(...sp.sil.map(r=>r.length));const rows=sp.sil.map(r=>r.padEnd(w," "));const hh=rows.length;const on=(r,c)=>r>=0&&r<hh&&c>=0&&c<w&&rows[r][c]==="#";let top=hh,bot=0;for(let r=0;r<hh;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<hh;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}return{map,w,hh};}
const s=5;
function img(w,ht){const buf=Buffer.alloc(w*ht*3);for(let y=0;y<ht;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h:ht,buf};}
function rect(im,x,y,w,ht,c){x|=0;y|=0;for(let yy=0;yy<ht;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
function drawSp(im,sp,ox,oy){const sh=buildShade(sp);for(let r=0;r<sh.hh;r++)for(let c=0;c<sh.w;c++){const lv=sh.map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}for(const e of(sp.eyes||[])){rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK);}if(sp.mouth)rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);return sh;}
function text(im,str,x,y,sc,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*sc,y+r*sc,sc,sc,c);cx+=(g[0].length+1)*sc;}}
function textC(im,str,cx,y,sc,c){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*sc;}text(im,str,cx-(w-sc)/2,y,sc,c);}
const KEYS=Object.keys(S);
const COLS=7,cw=140,chh=140,top=40;const rows=Math.ceil(KEYS.length/COLS);const W=COLS*cw,H=top+rows*chh;
const im=img(W,H);
textC(im,"BLOBKIN REDRAW — 55 FORMS @ lean scale + big inset eyes",W/2,14,2,INK);
KEYS.forEach((k,idx)=>{const sp=S[k];const ci=idx%COLS,ri=(idx/COLS)|0;const cx=ci*cw+cw/2,baseY=top+ri*chh+chh-30;const sh=buildShade(sp);drawSp(im,sp,cx-sh.w*s/2,baseY-sh.hh*s);textC(im,k,cx,top+ri*chh+chh-22,1.5,P2);});
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("blobkin-redraw.png",toPNG(im));console.log("wrote blobkin-redraw.png",W+"x"+H);
