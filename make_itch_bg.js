// Seamless tileable page background in Hatch's dark GB-green palette (scanlines + faint dot grid).
const fs=require("fs"),zlib=require("zlib");
const W=96,H=96;
const BASE=[18,40,14], SCAN=[26,52,20], DOT=[32,66,26];
const buf=Buffer.alloc(W*H*3);
function px(x,y,c){const i=(y*W+x)*3;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];}
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  let c=BASE;
  if(y%3===0)c=SCAN;                 // horizontal scanline every 3px (96/3=32 → seamless)
  if(x%12===0&&y%12===0)c=DOT;       // faint dot grid every 12px (seamless)
  px(x,y,c);
}
function crc32(b){let c=~0>>>0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length,0);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(b),0);return Buffer.concat([l,b,cr]);}
const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=2;
const stride=W*3,raw=Buffer.alloc((stride+1)*H);for(let y=0;y<H;y++){raw[y*(stride+1)]=0;buf.copy(raw,y*(stride+1)+1,y*stride,y*stride+stride);}
fs.writeFileSync("itch-bg.png",Buffer.concat([sig,chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]));
console.log("wrote itch-bg.png "+W+"x"+H+" (seamless tile)");
