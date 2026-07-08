const fs=require("fs"), vm=require("vm");
const html=fs.readFileSync("hatch.html","utf8");
let ok=true; const bad=(m)=>{ ok=false; console.log("FAIL:",m); };

// 1) syntax: compile the main IIFE without running it
const script=html.match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/);
if(!script) bad("could not locate main IIFE script");
else { try{ new vm.Script(script[0].replace(/^<script>/,"").replace(/<\/script>$/,"")); console.log("syntax: OK"); }catch(e){ bad("syntax error: "+e.message); } }

// 2) extract SPRITES + DEX objects
function lit(marker){ const st=html.indexOf(marker); const o=html.indexOf("{",st); let d=0,e=-1;
  for(let i=o;i<html.length;i++){const c=html[i]; if(c==="{")d++; else if(c==="}"){d--; if(!d){e=i;break;}}}
  return vm.runInNewContext("("+html.slice(o,e+1)+")"); }
const SPRITES=lit("const SPRITES = {");
const DEX=lit("const DEX = {");
console.log("sprites:",Object.keys(SPRITES).length,"| dex:",Object.keys(DEX).length);

// 3) integrity
for(const k in DEX){ if(!SPRITES[k]) bad("DEX key has no sprite: "+k);
  for(const b of (DEX[k].next||[])){ if(!DEX[b.to]) bad("DEX "+k+" -> missing target "+b.to); } }
if(!SPRITES.egg) bad("no egg sprite");

// 4) new-genus inset check (strict) — Blobkin predates the gate, so only check new keys
const NEWG=new Set(Object.keys(DEX).filter(k=>DEX[k].genus)); // genus field marks new entries
function cell(sp,r,c){return (sp.sil[r]&&sp.sil[r][c])||" ";}
function insetOK(sp,e){for(let yy=-1;yy<=e.h;yy++)for(let xx=-1;xx<=e.w;xx++){if(cell(sp,e.y+yy,e.x+xx)!=="#")return false;}return true;}
let insetFails=[];
for(const k of NEWG){ const sp=SPRITES[k]; if(!sp){continue;} for(const e of (sp.eyes||[])){ if(!insetOK(sp,e)){ insetFails.push(k); break; } } }
if(insetFails.length) bad("inset fails: "+insetFails.join(", ")); else console.log("new-genus inset: OK ("+NEWG.size+" forms)");

// 5) reachability + termination from every stage-1 baby
const BABIES=Object.keys(DEX).filter(k=>DEX[k].stage===1);
console.log("stage-1 babies:",BABIES.length);
const reached=new Set();
for(const b of BABIES){ (function walk(k,path){ if(path.includes(k)) { bad("TRUE cycle: "+path.join("->")+"->"+k); return; } if(path.length>12){ bad("path too deep from "+b+" at "+k); return; } reached.add(k); const np=path.concat(k); for(const br of (DEX[k].next||[])) walk(br.to,np); })(b,[]); }
// every new-genus form should be reachable
for(const k of NEWG){ if(!reached.has(k)) bad("unreachable new form: "+k); }
console.log("reachable forms:",reached.size);

// 6) genus counts
const byGen={}; for(const k in DEX){ const g=DEX[k].genus||"blobkin"; byGen[g]=(byGen[g]||0)+1; }
console.log("by genus:",JSON.stringify(byGen));

console.log(ok?"\nALL CHECKS PASS":"\n*** VALIDATION FAILED ***");
process.exit(ok?0:1);
