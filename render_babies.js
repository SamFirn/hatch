// Contact sheet of NEW genus babies — REAL app shader + REAL app eye rendering.
// Charm rule: big expressive eyes (Gen I quality), roomy heads.
const fs=require("fs"), zlib=require("zlib"), vm=require("vm");
const code=fs.readFileSync("hatch.html","utf8").match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/)[0];
function lit(m){const st=code.indexOf(m),o=code.indexOf("{",st);let d=0,e=-1;for(let i=o;i<code.length;i++){const c=code[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+code.slice(o,e+1)+")");}
const REF=lit("const SPRITES = {"), FONT=lit("const FONT = {");

// ---- NEW BABIES v2 (big eyes, roomy heads) ----
const NEW={
// SAURIAN — upright cutie, leg-gap + tail, big eyes
sau1:{sil:[  // single horn
"     ###     ","    #####    ","   #######   ","  #########  ","  #########  ","  #########  ","   #######   ","   ####### # ","   #######   ","   ##   ##   ","  ###   ###  "],
  eyes:[{x:3,y:3,w:3,h:3},{x:7,y:3,w:3,h:3}], mouth:{x:5,y:7,w:3,h:1}},
sau2:{sil:[  // two ear-horns
"   ##   ##   ","   ##   ##   ","   #######   ","  #########  ","  #########  ","  #########  ","   #######   ","   ####### # ","   #######   ","   ##   ##   ","  ###   ###  "],
  eyes:[{x:3,y:3,w:3,h:3},{x:7,y:3,w:3,h:3}], mouth:{x:5,y:6,w:3,h:1}},
sau3:{sil:[  // wide jaw + big tail
"    #####    ","   #######   ","  #########  ","  #########  ","  #########  ","  #########  ","  ######### #","   #######   ","   ##   ##   ","  ###   ###  "],
  eyes:[{x:3,y:2,w:3,h:3},{x:7,y:2,w:3,h:3}], mouth:{x:5,y:6,w:3,h:1}},
sau4:{sil:[  // spiky head-crest
"  # # # # #  ","   #######   ","  #########  ","  #########  ","  #########  ","  #########  ","   #######   ","   ####### # ","   #######   ","   ##   ##   ","  ###   ###  "],
  eyes:[{x:3,y:3,w:3,h:3},{x:7,y:3,w:3,h:3}], mouth:{x:5,y:6,w:3,h:1}},
// BEASTIAL — chubby, FOUR leg-nubs, front head big eyes + ears
bea1:{sil:[  // pointy ears up
"  ##     ##  ","  ###   ###  ","  #########  "," ########### "," ########### "," ########### "," ########### "," ## ## ## ## "," ## ## ## ## "],
  eyes:[{x:3,y:3,w:3,h:3},{x:7,y:3,w:3,h:3}], mouth:{x:5,y:6,w:2,h:1}},
bea2:{sil:[  // floppy side ears
"   #######   ","  #########  "," ########### ","############# ","############# "," ########### "," ########### "," ## ## ## ## "," ## ## ## ## "],
  eyes:[{x:3,y:3,w:3,h:3},{x:7,y:3,w:3,h:3}], mouth:{x:5,y:6,w:2,h:1}},
bea3:{sil:[  // round ears, snout-tuft
"  #       #  ","  #########  "," ########### "," ########### "," ########### "," ########### "," ########### "," ## ## ## ## "," ## ## ## ## "],
  eyes:[{x:3,y:2,w:3,h:3},{x:7,y:2,w:3,h:3}], mouth:{x:5,y:5,w:2,h:1}},
bea4:{sil:[  // mane tuft on top
"   # # #     ","  #########  "," ########### "," ########### "," ########### "," ########### "," ########### "," ## ## ## ## "," ## ## ## ## "],
  eyes:[{x:3,y:3,w:3,h:3},{x:7,y:3,w:3,h:3}], mouth:{x:5,y:6,w:2,h:1}},
// SKYWING — round body, WING-STUBS out sides, big eyes
sky1:{sil:[  // rounded dove wings
"    #####    ","   #######   ","  #########  ","# ######### #","# ######### #","  #########  ","   #######   ","    #   #    "],
  eyes:[{x:3,y:2,w:3,h:3},{x:7,y:2,w:3,h:3}], mouth:{x:5,y:5,w:2,h:1}},
sky2:{sil:[  // pointed wings
"    #####    ","   #######   ","## ####### ##"," # ####### # ","  #########  ","   #######   ","    #   #    "],
  eyes:[{x:3,y:2,w:3,h:3},{x:7,y:2,w:3,h:3}], mouth:{x:5,y:5,w:2,h:1}},
sky3:{sil:[  // head tuft + wings
"     ###     ","    #####    ","  #########  ","# ######### #","# ######### #","  #########  ","   #######   ","    #   #    "],
  eyes:[{x:3,y:3,w:3,h:3},{x:7,y:3,w:3,h:3}], mouth:{x:5,y:6,w:2,h:1}},
sky4:{sil:[  // wings + tail streamers
"    #####    ","   #######   ","# ######### #","# ######### #","  #########  ","   #######   ","   # ### #   ","  #   #   #  "],
  eyes:[{x:3,y:2,w:3,h:3},{x:7,y:2,w:3,h:3}], mouth:{x:5,y:5,w:2,h:1}},
};

function buildShade(sp){const w=Math.max(...sp.sil.map(r=>r.length));const rows=sp.sil.map(r=>r.padEnd(w," "));const h=rows.length;const on=(r,c)=>r>=0&&r<h&&c>=0&&c<w&&rows[r][c]==="#";let top=h,bot=0;for(let r=0;r<h;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<h;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}sp.shade={map,w,h};}
for(const k in NEW)buildShade(NEW[k]);
const refKey=REF["momo"]?"momo":(REF["baby"]?"baby":Object.keys(REF)[1]); buildShade(REF[refKey]);

const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function img(w,h){const buf=Buffer.alloc(w*h*3);for(let y=0;y<h;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h,buf};}
function rect(im,x,y,w,h,c){x|=0;y|=0;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
// EXACT app sprite() rendering (sclera + inset pupil)
function drawSp(im,sp,ox,oy,s){const{map,w,h}=sp.shade;
  for(let r=0;r<h;r++)for(let c=0;c<w;c++){const lv=map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}
  for(const e of (sp.eyes||[])){ rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);
    const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;
    rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK); }
  if(sp.mouth)rect(im,ox+sp.mouth.x*s,oy+sp.mouth.y*s,sp.mouth.w*s,sp.mouth.h*s,INK);}
function tW(str,s){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*s;}return w-s;}
function text(im,str,x,y,s,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*s,y+r*s,s,s,c);cx+=(g[0].length+1)*s;}}

const rows=[
  {label:"I BLOBKIN (REF)", keys:[refKey], src:REF},
  {label:"II SAURIAN",  keys:["sau1","sau2","sau3","sau4"], src:NEW},
  {label:"III BEASTIAL",keys:["bea1","bea2","bea3","bea4"], src:NEW},
  {label:"IV SKYWING",  keys:["sky1","sky2","sky3","sky4"], src:NEW},
];
const s=12, cellW=250, cellH=230, cols=4, W=40+cols*cellW, H=40+rows.length*cellH;
const im=img(W,H);
rows.forEach((row,ri)=>{const cy=30+ri*cellH; text(im,row.label,20,cy,4,P2);
  row.keys.forEach((k,ci)=>{const sp=row.src[k];if(!sp)return;const{w,h}=sp.shade;const cx=30+ci*cellW;
    drawSp(im,sp,cx+(cellW-w*s)/2, cy+30+(160-h*s)/2, s); text(im,k,cx+8,cy+cellH-30,3,INK);});
});
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("babies-draft.png",toPNG(im));console.log("wrote babies-draft.png",W+"x"+H,"ref="+refKey);
