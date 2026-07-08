// FULL SKYWING GENUS CHART — pulls exact sprites from sky1-4.json (already eye-placed).
const fs=require("fs"), zlib=require("zlib"), vm=require("vm");
const code=fs.readFileSync("hatch.html","utf8").match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/)[0];
function lit(m){const st=code.indexOf(m),o=code.indexOf("{",st);let d=0,e=-1;for(let i=o;i<code.length;i++){const c=code[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return vm.runInNewContext("("+code.slice(o,e+1)+")");}
const FONT=lit("const FONT = {");
const D={1:require("./sky1.json"),2:require("./sky2.json"),3:require("./sky3.json"),4:require("./sky4.json")};
function buildShade(sp){if(sp.shade)return sp;const w=Math.max(...sp.sil.map(r=>r.length));const rows=sp.sil.map(r=>r.padEnd(w," "));const h=rows.length;const on=(r,c)=>r>=0&&r<h&&c>=0&&c<w&&rows[r][c]==="#";let top=h,bot=0;for(let r=0;r<h;r++)for(let c=0;c<w;c++)if(on(r,c)){if(r<top)top=r;if(r>bot)bot=r;}const span=Math.max(1,bot-top),map=[];for(let r=0;r<h;r++){const line=[];for(let c=0;c<w;c++){if(!on(r,c)){line.push(0);continue;}if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){line.push(3);continue;}line.push((r-top)/span<0.42?1:2);}map.push(line);}sp.shade={map,w,h};return sp;}
const BG=[219,238,186],SCAN=[205,225,174],P1=[139,173,77],P2=[63,107,50],INK=[20,48,15],EYE=[238,250,212];
const PAL=[null,P1,P2,INK];
function img(w,h){const buf=Buffer.alloc(w*h*3);for(let y=0;y<h;y++){const c=(y%3===0)?SCAN:BG;for(let x=0;x<w;x++){const i=(y*w+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}}return{w,h,buf};}
function rect(im,x,y,w,h,c){x|=0;y|=0;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const px=x+xx,py=y+yy;if(px<0||py<0||px>=im.w||py>=im.h)continue;const i=(py*im.w+px)*3;im.buf[i]=c[0];im.buf[i+1]=c[1];im.buf[i+2]=c[2];}}
function drawSp(im,sp,ox,oy,s){const{map,w,h}=sp.shade;for(let r=0;r<h;r++)for(let c=0;c<w;c++){const lv=map[r][c];if(lv)rect(im,ox+c*s,oy+r*s,s,s,PAL[lv]);}for(const e of(sp.eyes||[])){rect(im,ox+e.x*s,oy+e.y*s,e.w*s,e.h*s,EYE);const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;rect(im,ox+(e.x+pxo)*s,oy+(e.y+pyo)*s,pw*s,ph*s,INK);}}
function tW(str,s){let w=0;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];w+=(g[0].length+1)*s;}return w-s;}
function text(im,str,x,y,s,c){let cx=x;for(const ch of str.toUpperCase()){const g=FONT[ch]||FONT["?"];for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==="1")rect(im,cx+col*s,y+r*s,s,s,c);cx+=(g[0].length+1)*s;}}
function textC(im,str,cx,y,s,c){text(im,str,cx-tW(str,s)/2,y,s,c);}
const rows=[["FALCON",1,"falcon"],["VULTURE",1,"vulture"],["NIGHTWING",2,"night"],["GARGOYLE",2,"gar"],["OWL",3,"owl"],["SCREECHER",3,"screech"],["MOTH",4,"moth"],["WASP",4,"wasp"]];
const cols=["baby","child","teen_r","teen_f","adult","adult2","elder"];
const chdr=["BABY","CHILD","TEEN +","TEEN -","ADULT +","ADULT -","ELDER"];
const s=5, labelW=90, cellW=120, cellH=108, top=92;
const W=labelW+cols.length*cellW+16, H=top+rows.length*cellH+16;
const im=img(W,H);
textC(im,"HATCH - GENUS IV: SKYWING",W/2,20,6,INK);
textC(im,"52 CREATURES - NOBLE vs FERAL - WINGED - EGG TO ELDER",W/2,52,3,P2);
chdr.forEach((h,ci)=>textC(im,h,labelW+ci*cellW+cellW/2,74,3,P2));
rows.forEach(([name,num,pre],ri)=>{const y0=top+ri*cellH, baseY=y0+cellH-22;
 text(im,name,6,y0+cellH/2-8,2,INK);
 cols.forEach((cc,ci)=>{const key = cc==="baby" ? "baby" : (pre+"_"+cc); const sp0=D[num][key]; if(!sp0){console.log("missing",num,key);return;} const sp=buildShade(sp0); const {w,h}=sp.shade; const cx=labelW+ci*cellW+cellW/2; drawSp(im,sp,cx-w*s/2, baseY-h*s, s);});
});
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
function toPNG(im){const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=2;const stride=im.w*3,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(stride+1)]=0;im.buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}return Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);}
fs.writeFileSync("skywing-chart.png",toPNG(im));console.log("wrote skywing-chart.png",W+"x"+H);
