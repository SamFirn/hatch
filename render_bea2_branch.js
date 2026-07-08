// BEASTIAL bea2 branch: baby Maneling -> NOBLE Lion (maned) / FERAL Manticore (cyclops). Quadruped, strict inset.
const fs=require("fs"), zlib=require("zlib"), vm=require("vm");
const code=fs.readFileSync("hatch.html","utf8").match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/)[0];
function lit(m){const st=code.indexOf(m),o=code.indexOf("{",st);let d=0,e=-1;for(let i=o;i<code.length;i++){const c=code[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+code.slice(o,e+1)+")");}
const FONT=lit("const FONT = {");
const E=(x,y)=>({x,y,w:3,h:3});
const C=(x,y,w=4,h=4)=>({x,y,w,h});
const P={
baby:{sil:["  # ### #  "," ######### "," ######### "," ######### "," ######### "," ######### "," ## ## ##  "," ## ## ##  "], eyes:[E(2,3),E(6,3)], mouth:{x:4,y:5,w:2,h:1}},
// ---- NOBLE: Lion (mane) ----
lion_child:{sil:["  # ### #  "," ######### "," ######### "," ######### "," ######### "," ######### "," ## ## ##  "," ## ## ##  "], eyes:[E(2,3),E(6,3)], mouth:{x:4,y:5,w:2,h:1}},
lion_teen_r:{sil:["  # ### #  "," ########## "," ########## "," ########## "," ########## "," ########## "," ## ## ## # "," ## ## ##   "], eyes:[E(2,3),E(7,3)], mouth:{x:4,y:5,w:3,h:1}},
lion_teen_f:{sil:[" # # # # # "," ######### "," ######### "," ######### "," ######### "," ######### "," ## ## ##  ","## ## ##   "], eyes:[E(2,3),E(6,3)], mouth:{x:4,y:5,w:2,h:1}},
lion_adult:{sil:[" #  ###  # ","###########","###########","###########"," ######### "," ######### "," ######### "," ## ## ## #"," ## ## ##  "], eyes:[E(3,4),E(7,4)], mouth:{x:5,y:6,w:3,h:1}},
lion_adult2:{sil:["# # ### # #","###########","###########","###########"," ######### "," ######### "," ######### "," ### ## ###"," ##  ## ## "], eyes:[E(3,4),E(7,4)], mouth:{x:5,y:6,w:3,h:1}},
lion_elder:{sil:["# # #### # #","############","############","############","############"," ########## "," ########## "," ########## "," ## ## ## ##"," ## ## ## # "], eyes:[E(4,4),E(8,4)], mouth:{x:6,y:6,w:3,h:1}},
// ---- FERAL: Manticore (cyclops, spiky mane) ----
manti_child:{sil:["  # # # #  "," ######### "," ######### "," ######### "," ######### "," ######### "," ## ## ##  "," ## ## ##  "], eyes:[C(3,2,3,3)], mouth:{x:5,y:5,w:1,h:1}},
manti_teen_r:{sil:[" # # # # # "," ######### "," ######### "," ######### "," ######### "," ######### "," ## ## ##  ","## ## ##   "], eyes:[C(3,2,4,3)], mouth:{x:5,y:5,w:1,h:1}},
manti_teen_f:{sil:["# # # # #  "," ######### "," ######### "," ######### "," ######### "," ######### "," ## ## #   ","## ## ##   "], eyes:[C(3,2,4,3)], mouth:{x:5,y:5,w:1,h:1}},
manti_adult:{sil:["# # ### # #"," ######### "," ######### "," ######### "," ######### "," ######### "," ######### "," ## ## ## #","## ## ##   "], eyes:[C(3,3,4,4)], mouth:{x:6,y:6,w:1,h:1}},
manti_adult2:{sil:["# #  #  # #"," ######### "," ######### "," ######### "," ######### "," ######### "," ######### "," ### ## ###","##  ## ##  "], eyes:[C(3,3,4,4)], mouth:{x:6,y:6,w:1,h:1}},
manti_elder:{sil:["# # #### # #"," ########## "," ########## "," ########## "," ########## "," ########## "," ########## "," ########## "," ## ## ## ##","## ## ## #  "], eyes:[C(4,3,5,5)], mouth:{x:7,y:6,w:1,h:1}},
};
function cell(sp,r,c){return (sp.sil[r]&&sp.sil[r][c])||" ";}
function insetOK(sp,e){for(let yy=-1;yy<=e.h;yy++)for(let xx=-1;xx<=e.w;xx++){if(cell(sp,e.y+yy,e.x+xx)!=="#")return false;}return true;}
let FAILS=[];
function autofit(name,sp){const eyes=sp.eyes||[];const cand=[];for(let dy=-3;dy<=6;dy++)for(let dx=0;dx<=5;dx++)cand.push([dx,dy]);cand.sort((a,b)=>(Math.abs(a[0])+Math.abs(a[1]))-(Math.abs(b[0])+Math.abs(b[1])));
  if(eyes.length===2){const[e0,e1]=eyes,o0={...e0},o1={...e1};for(const[dx,dy]of cand){const a={...e0,x:o0.x+dx,y:o0.y+dy},b={...e1,x:o1.x-dx,y:o1.y+dy};if(insetOK(sp,a)&&insetOK(sp,b)){Object.assign(e0,a);Object.assign(e1,b);return;}}FAILS.push(name);}
  else if(eyes.length===1){const e=eyes[0],o={...e};const c2=[];for(let dy=-3;dy<=6;dy++)for(let dx=-4;dx<=4;dx++)c2.push([dx,dy]);c2.sort((a,b)=>(Math.abs(a[0])+Math.abs(a[1]))-(Math.abs(b[0])+Math.abs(b[1])));for(const[dx,dy]of c2){const t={...e,x:o.x+dx,y:o.y+dy};if(insetOK(sp,t)){Object.assign(e,t);return;}}FAILS.push(name);}}
function buildShade(sp){const w=Math.max(...sp.sil.map(r=>r.length));const rows=sp.sil.map(r=>r.padEnd(w," "));const h=rows.length;const on=(r,c)=>r>=0&&r<h&&c>=0&&c<w&&rows[r][c]==="#";let top=h,bot=0;for(let r=0;r<h;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<h;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}sp.shade={map,w,h};}
for(const k in P){autofit(k,P[k]);buildShade(P[k]);}
console.log("INSET-EYE CHECK:", FAILS.length?FAILS.join(", "):"all inset OK");
const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function img(w,h){const buf=Buffer.alloc(w*h*3);for(let y=0;y<h;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h,buf};}
function rect(im,x,y,w,h,c){x|=0;y|=0;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
function drawSp(im,sp,ox,oy,s){const{map,w,h}=sp.shade;for(let r=0;r<h;r++)for(let c=0;c<w;c++){const lv=map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}for(const e of(sp.eyes||[])){rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK);}if(sp.mouth)rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);}
function tW(str,s){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*s;}return w-s;}
function text(im,str,x,y,s,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*s,y+r*s,s,s,c);cx+=(g[0].length+1)*s;}}
function textC(im,str,cx,y,s,c){text(im,str,cx-tW(str,s)/2,y,s,c);}
const s=8, colW=155, rowH=190, left=150, top=80;
const cols=["child","teen_r","teen_f","adult","adult2","elder"];
const chdr=["CHILD","TEEN +","TEEN -","ADULT +","ADULT -","ELDER"];
const W=left+cols.length*colW, H=top+rowH*2+30;
const im=img(W,H);
textC(im,"BEASTIAL - BEA2 BRANCH (BABY: MANELING)",W/2,20,4,INK);
textC(im,"NOBLE: LION   /   FERAL: MANTICORE (CYCLOPS)",W/2,48,3,P2);
chdr.forEach((h,ci)=>textC(im,h,left+ci*colW+colW/2,70,3,P2));
{const sp=P.baby,{w,h}=sp.shade;drawSp(im,sp,left/2-w*s/2,top+rowH-h*s,s);textC(im,"MANELING",left/2,top+rowH+8,2,INK);}
[["NOBLE","lion"],["FERAL","manti"]].forEach(([label,pre],ri)=>{const baseY=top+ri*rowH+rowH-40;text(im,label,6,top+ri*rowH+rowH/2,3,INK);cols.forEach((cc,ci)=>{const sp=P[pre+"_"+cc];if(!sp)return;const{w,h}=sp.shade;const cx=left+ci*colW+colW/2;drawSp(im,sp,cx-w*s/2,baseY-h*s,s);});});
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("bea2-branch.png",toPNG(im));console.log("wrote bea2-branch.png",W+"x"+H);
fs.writeFileSync("bea2.json",JSON.stringify(Object.fromEntries(Object.entries(P).map(([k,v])=>[k,{sil:v.sil,eyes:v.eyes}]))));
