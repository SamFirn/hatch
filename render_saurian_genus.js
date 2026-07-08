// SAURIAN genus — 4 lines x 5 tiers (baby->elder), baseline-aligned, one scale.
// Saurian eye = w3 h3 with brow (fiercer than Blobkin's tall eye). Real app rendering.
const fs=require("fs"), zlib=require("zlib"), vm=require("vm");
const code=fs.readFileSync("hatch.html","utf8").match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/)[0];
function lit(m){const st=code.indexOf(m),o=code.indexOf("{",st);let d=0,e=-1;for(let i=o;i<code.length;i++){const c=code[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+code.slice(o,e+1)+")");}
const FONT=lit("const FONT = {");
const E=(x,y)=>({x,y,w:3,h:3}); // saurian eye

// ============ LINE 1 — HORNED DRAKE (single horn -> winged elder) ============
const L1={
baby:{sil:["     ###     ","    #####    ","   #######   ","  #########  ","  #########  ","  #########  ","   #######   ","   ####### # ","   #######   ","   ##   ##   ","  ###   ###  "], eyes:[E(3,3),E(7,3)], mouth:{x:5,y:7,w:3,h:1}},
child:{sil:["      ###      ","     #####     ","    #######    ","   #########   ","   #########   ","   #########   ","    #######    ","    ####### #  ","    #######    ","    ##   ##    ","   ##    ##    ","  ###    ###   "], eyes:[E(4,3),E(8,3)], mouth:{x:6,y:7,w:3,h:1}},
teen:{sil:["      ###      ","     #####     ","    #######    ","    #######    ","    ## ####    ","     #####     ","      ###      ","     #####     ","    ###### #   ","    ######  #  ","    ######     ","    ##  ##     ","   ##    ##    ","  ###    ###   "], eyes:[E(4,2),E(8,2)], mouth:{x:5,y:5,w:3,h:1}},
adult:{sil:["      ###      ","     #####     ","    #######    ","    #######    ","    ## ####    ","     #####     ","      ###      ","     #####     ","    #######    ","   ######## #  ","   ########  # ","    ######  #  ","    ######     ","    ##  ##     ","   ##    ##    ","   ##    ##    ","  ###    ###   "], eyes:[E(4,3),E(8,3)], mouth:{x:5,y:5,w:3,h:1}},
elder:{sil:["       ###       ","   #   ###   #   ","  ### ##### ###  "," #### ##### #### ","#### ####### ####"," ### ####### ### ","     #######     ","      #####      ","     #######     ","    #########    ","   ########## #  ","   ##########  # ","    ########  #  ","    ########     ","    ##    ##     ","   ##      ##    ","   ##      ##    ","  ###      ###   "], eyes:[E(6,4),E(10,4)], mouth:{x:8,y:6,w:3,h:1}},
};
// ============ LINE 2 — WYVERN (two horns -> bat-wing elder) ============
const L2={
baby:{sil:["   ##   ##   ","   ##   ##   ","   #######   ","  #########  ","  #########  ","  #########  ","   #######   ","   ####### # ","   #######   ","   ##   ##   ","  ###   ###  "], eyes:[E(3,3),E(7,3)], mouth:{x:5,y:6,w:3,h:1}},
child:{sil:["   ##   ##   ","   ##   ##   ","    #####    ","   #######   ","  #########  ","  #########  ","   #######   ","   ####### #  ","   #######   ","   ##   ##   ","  ###   ###  "], eyes:[E(3,3),E(7,3)], mouth:{x:5,y:6,w:3,h:1}},
teen:{sil:["   ##    ##   ","   ##    ##   ","    ######    ","   ########   ","   ## #####   ","    ######    ","     ####     ","    ######    ","   ######  #  ","   ######  #  ","   ######     ","   ##  ##     ","  ##    ##    ","  ##    ##    "], eyes:[E(4,3),E(8,3)], mouth:{x:5,y:5,w:3,h:1}},
adult:{sil:["   ##    ##   ","   ###  ###   ","    ######    ","   ########   ","   ## #####   ","    ######    ","     ####     ","    ######    ","   ########   ","   ######## # ","   ########  #","    ######  # ","    ######    ","    ##  ##    ","   ##    ##   ","   ##    ##   ","  ###    ###  "], eyes:[E(4,3),E(8,3)], mouth:{x:5,y:5,w:3,h:1}},
elder:{sil:["  ##       ##  ","  ###     ###  ","## ### ### ## #","### ####### ###","##  #######  ##"," # ######### # ","   #########   ","    #######    ","   #########   ","   ######### # ","   #########  #","    #######  # ","    #######    ","    ##   ##    ","   ##     ##   ","   ##     ##   ","  ###     ###  "], eyes:[E(5,4),E(9,4)], mouth:{x:7,y:6,w:3,h:1}},
};
// ============ LINE 3 — REX-KING (heavy jaw, small arms, big tail) ============
const L3={
baby:{sil:["    #####    ","   #######   ","  #########  ","  #########  ","  #########  ","  #########  ","  ######### #","   #######   ","   ##   ##   ","  ###   ###  "], eyes:[E(3,2),E(7,2)], mouth:{x:5,y:5,w:3,h:1}},
child:{sil:["    ######    ","   ########   ","  ##########  ","  ##########  ","  ##########  ","   ########   ","   ######## # ","    ######    ","    ##  ##    ","   ##    ##   ","  ###    ###  "], eyes:[E(3,2),E(8,2)], mouth:{x:5,y:5,w:4,h:1}},
teen:{sil:["    #######    ","   #########   ","  ###########  ","  #### ######  ","  ###########  ","   #########   ","    ###### #   ","   ########## ","   ########  #","    ######    ","    ##  ##    ","   ##    ##   ","  ###    ###  "], eyes:[E(3,2),E(9,2)], mouth:{x:5,y:4,w:5,h:1}},
adult:{sil:["    ########    ","   ##########   ","  ############  ","  ### ########  ","  ############  ","   ##########   ","    ########    ","     ######     ","    ######## #  ","    #########   ","   ##########  #","   #########  # ","    #######    ","    ##   ##    ","   ###   ###   ","  ###    ###   ","  ##      ##   "], eyes:[E(3,2),E(10,2)], mouth:{x:5,y:4,w:6,h:1}},
elder:{sil:["     #########     ","    ###########    ","   #############   ","   #### ########   ","   #############   ","    ###########    ","     #########     ","      #######      ","     #########  #  ","     ########### # ","    ############  #","   ############  # ","   ###########    ","    #########     ","    ##     ##     ","   ###     ###    ","  ###       ###   ","  ##         ##   "], eyes:[E(4,2),E(12,2)], mouth:{x:6,y:4,w:7,h:1}},
};
// ============ LINE 4 — SPINEBACK (dorsal spikes -> spiky titan) ============
const L4={
baby:{sil:["  # # # # #  ","   #######   ","  #########  ","  #########  ","  #########  ","  #########  ","   #######   ","   ####### # ","   #######   ","   ##   ##   ","  ###   ###  "], eyes:[E(3,3),E(7,3)], mouth:{x:5,y:6,w:3,h:1}},
child:{sil:["  #  #  #  #  ","   ########  ","  ##########  ","  #########  ","  #########  ","  #########  ","   #######   ","   ####### #  ","   #######   ","   ##   ##   ","  ###   ###  "], eyes:[E(3,3),E(7,3)], mouth:{x:5,y:6,w:3,h:1}},
teen:{sil:[" #  #  #  #  # ","  ###########  ","  #########   ","  #########   ","  ## ######   ","   #######    ","    #####     ","   #######    ","   #######  # ","   #######  # ","   #######    ","   ##  ##     ","  ##    ##    ","  ##    ##    "], eyes:[E(4,3),E(8,3)], mouth:{x:5,y:5,w:3,h:1}},
adult:{sil:[" #  #  #  #  # ","  ############ ","  #########    ","  #########    ","  ## ######    ","   ########    ","    ######     ","   ########    ","   ########  # ","   #########  #","   ########  # ","    ######     ","    ##  ##     ","   ##    ##    ","   ##    ##    ","  ###    ###   ","  ##      ##   "], eyes:[E(4,3),E(8,3)], mouth:{x:5,y:5,w:3,h:1}},
elder:{sil:["  #  #  #  #  #  ","  #  #  #  #  #  "," ############### ","  ###########   ","  ###########   ","  ### ########  ","   #########    ","    #######     ","   #########    ","   ##########  #","   ########### #","   ##########  #","    ########    ","    ##    ##    ","   ##      ##   ","   ##      ##   ","  ###      ###  ","  ##        ##  "], eyes:[E(5,4),E(9,4)], mouth:{x:7,y:6,w:3,h:1}},
};

const LINES=[["HORNED DRAKE",L1],["WYVERN",L2],["REX-KING",L3],["SPINEBACK",L4]];
const TIERS=["baby","child","teen","adult","elder"];
function buildShade(sp){const w=Math.max(...sp.sil.map(r=>r.length));const rows=sp.sil.map(r=>r.padEnd(w," "));const h=rows.length;const on=(r,c)=>r>=0&&r<h&&c>=0&&c<w&&rows[r][c]==="#";let top=h,bot=0;for(let r=0;r<h;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<h;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}sp.shade={map,w,h};}
// ---- AUTO-FIT eyes onto the face (slide symmetric pair; shrink as last resort) ----
function fullyOn(sp,e){ for(let yy=0;yy<e.h;yy++)for(let xx=0;xx<e.w;xx++){const r=e.y+yy,c=e.x+xx;const ch=(sp.sil[r]&&sp.sil[r][c])||" ";if(ch!=="#")return false;} return true; }
function autofit(name,tier,sp){ const eyes=sp.eyes||[]; if(!eyes.length)return;
  const cand=[]; for(let dy=-1;dy<=3;dy++)for(let dx=0;dx<=3;dx++)cand.push([dx,dy]);
  cand.sort((a,b)=>(Math.abs(a[0])+Math.abs(a[1]))-(Math.abs(b[0])+Math.abs(b[1])));
  if(eyes.length===2){ const [e0,e1]=eyes; const o0={...e0},o1={...e1};
    for(const [dx,dy] of cand){ const a={...e0,x:o0.x+dx,y:o0.y+dy}, b={...e1,x:o1.x-dx,y:o1.y+dy};
      if(fullyOn(sp,a)&&fullyOn(sp,b)){ Object.assign(e0,a);Object.assign(e1,b); if(dx||dy)console.log(`  fit ${name}/${tier} pair d(${dx},${dy})`); return; } }
    // last resort: shrink to 2x2 then retry
    e0.w=e1.w=2; e0.h=e1.h=2;
    for(const [dx,dy] of cand){ const a={...e0,x:o0.x+dx,y:o0.y+dy}, b={...e1,x:o1.x-dx,y:o1.y+dy};
      if(fullyOn(sp,a)&&fullyOn(sp,b)){ Object.assign(e0,a);Object.assign(e1,b); console.log(`  fit ${name}/${tier} pair SHRUNK d(${dx},${dy})`); return; } }
  }
  for(const e of eyes){ const o={...e}; let done=false;
    for(const [dx,dy] of cand){ for(const sgn of [1,-1]){ const t={...e,x:o.x+sgn*dx,y:o.y+dy}; if(fullyOn(sp,t)){Object.assign(e,t);done=true;break;} } if(done)break; } }
}
console.log("AUTO-FIT:");
LINES.forEach(([n,L])=>TIERS.forEach(t=>autofit(n,t,L[t])));

LINES.forEach(([n,L])=>TIERS.forEach(t=>buildShade(L[t])));

// ---- EYE-FIT VALIDATION: every eye cell must sit on a filled (#) pixel ----
function eyeFit(name,tier,sp){ const rows=sp.sil.map(r=>r); const bad=[];
  (sp.eyes||[]).forEach((e,ei)=>{ let off=0,edge=0;
    for(let yy=0;yy<e.h;yy++)for(let xx=0;xx<e.w;xx++){ const r=e.y+yy,c=e.x+xx;
      const ch=(rows[r]&&rows[r][c])||" "; if(ch!=="#") off++; }
    // also flag if any eye cell is on the silhouette's left/right outline column of that row
    for(let yy=0;yy<e.h;yy++){ const r=e.y; const row=rows[e.y]||""; }
    if(off>0) bad.push(`eye${ei}(${e.x},${e.y}) off-face x${off}`);
  });
  if(bad.length) console.log(`  ⚠ ${name}/${tier}: ${bad.join("; ")}`);
}
console.log("EYE-FIT CHECK:");
LINES.forEach(([n,L])=>TIERS.forEach(t=>eyeFit(n,t,L[t])));
console.log("---");

const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function img(w,h){const buf=Buffer.alloc(w*h*3);for(let y=0;y<h;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h,buf};}
function rect(im,x,y,w,h,c){x|=0;y|=0;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
function drawSp(im,sp,ox,oy,s){const{map,w,h}=sp.shade;for(let r=0;r<h;r++)for(let c=0;c<w;c++){const lv=map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}for(const e of(sp.eyes||[])){rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK);}if(sp.mouth)rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);}
function tW(str,s){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*s;}return w-s;}
function text(im,str,x,y,s,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*s,y+r*s,s,s,c);cx+=(g[0].length+1)*s;}}

const s=8, colW=170, rowH=210, leftPad=30, topPad=40;
const W=leftPad+TIERS.length*colW, H=topPad+LINES.length*rowH+20;
const im=img(W,H);
// header tier labels
TIERS.forEach((t,ci)=>text(im,t.toUpperCase(), leftPad+ci*colW+(colW-tW(t.toUpperCase(),3))/2, 14, 3, P2));
LINES.forEach(([name,L],ri)=>{ const baseY=topPad+ri*rowH+rowH-40; // common baseline
  text(im,name,10,topPad+ri*rowH+6,3,INK);
  TIERS.forEach((t,ci)=>{ const sp=L[t],{w,h}=sp.shade; const cx=leftPad+ci*colW+(colW-w*s)/2;
    drawSp(im,sp,cx, baseY-h*s, s); });
});
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("saurian-genus.png",toPNG(im));console.log("wrote saurian-genus.png",W+"x"+H);
