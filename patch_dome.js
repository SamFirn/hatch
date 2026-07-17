// Splice ONLY the 7 reshaped dome/shell sprites into hatch.html's SPRITES block.
// Same keys → existing saves map unchanged; only the art changes. Everything else untouched.
const fs=require("fs"),vm=require("vm");
const FILE="hatch.html";
let h=fs.readFileSync(FILE,"utf8");
function lit(m){const s=h.indexOf(m),o=h.indexOf("{",s);let d=0,e=-1;for(let i=o;i<h.length;i++){const c=h[i];if(c==="{")d++;else if(c==="}"){d--;if(!d){e=i;break;}}}return {obj:vm.runInNewContext("("+h.slice(o,e+1)+")"),start:o,end:e};}
const {obj:SPR,start,end}=lit("const SPRITES = {");
const NEW=JSON.parse(fs.readFileSync("_fix_dome.json","utf8"));
let replaced=0;
for(const k of Object.keys(NEW)){if(!(k in SPR)){console.error("MISSING key in SPRITES:",k);process.exit(1);}SPR[k]=NEW[k];replaced++;}
function ser(sp){const sil="["+sp.sil.map(r=>JSON.stringify(r)).join(",")+"]";let s="{sil:"+sil;if(sp.eyes)s+=",eyes:["+sp.eyes.map(e=>`{x:${e.x},y:${e.y},w:${e.w},h:${e.h}}`).join(",")+"]";if(sp.mouth)s+=`,mouth:{x:${sp.mouth.x},y:${sp.mouth.y},w:${sp.mouth.w},h:${sp.mouth.h}}`;return s+"}";}
const body=Object.keys(SPR).map(k=>`${k}:${ser(SPR[k])}`).join(",\n");
const block="{\n"+body+"\n}";
fs.writeFileSync(FILE+".bak-dome",fs.readFileSync(FILE));
h=h.slice(0,start)+block+h.slice(end+1);
fs.writeFileSync(FILE,h);
console.log(`patched ${replaced} dome sprites into ${FILE} (backup: ${FILE}.bak-dome): ${Object.keys(NEW).join(", ")}`);
