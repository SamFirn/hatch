// Assembles new-genus SPRITES + DEX blocks for hatch.html.
// Pulls finished art from the render scripts, runs the SAME autofit as the charts
// so eye coords are final (the app does NOT autofit), then emits paste-ready JS.
const fs=require("fs"), vm=require("vm");

function extract(file, marker){
  const code=fs.readFileSync(file,"utf8");
  const st=code.indexOf(marker); if(st<0) throw new Error("marker not found: "+marker+" in "+file);
  const o=code.indexOf("{", st); let d=0,e=-1;
  for(let i=o;i<code.length;i++){const ch=code[i]; if(ch==="{")d++; else if(ch==="}"){d--; if(!d){e=i;break;}}}
  return vm.runInNewContext("("+code.slice(o,e+1)+")", {E:(x,y)=>({x,y,w:3,h:3}), C:(x,y,w=4,h=4)=>({x,y,w,h})});
}

// ---- autofit (identical logic to the chart renderers) ----
function cell(sp,r,c){return (sp.sil[r]&&sp.sil[r][c])||" ";}
function insetOK(sp,e){for(let yy=-1;yy<=e.h;yy++)for(let xx=-1;xx<=e.w;xx++){if(cell(sp,e.y+yy,e.x+xx)!=="#")return false;}return true;}
const FAILS=[];
function autofit(name,sp){const eyes=sp.eyes||[];const cand=[];for(let dy=-3;dy<=9;dy++)for(let dx=0;dx<=6;dx++)cand.push([dx,dy]);cand.sort((a,b)=>(Math.abs(a[0])+Math.abs(a[1]))-(Math.abs(b[0])+Math.abs(b[1])));
  if(eyes.length===2){const[e0,e1]=eyes,o0={...e0},o1={...e1};for(const[dx,dy]of cand){const a={...e0,x:o0.x+dx,y:o0.y+dy},b={...e1,x:o1.x-dx,y:o1.y+dy};if(insetOK(sp,a)&&insetOK(sp,b)){Object.assign(e0,a);Object.assign(e1,b);return;}}FAILS.push(name);}
  else if(eyes.length===1){const e=eyes[0],o={...e};const c2=[];for(let dy=-3;dy<=9;dy++)for(let dx=-6;dx<=6;dx++)c2.push([dx,dy]);c2.sort((a,b)=>(Math.abs(a[0])+Math.abs(a[1]))-(Math.abs(b[0])+Math.abs(b[1])));for(const[dx,dy]of c2){const t={...e,x:o.x+dx,y:o.y+dy};if(insetOK(sp,t)){Object.assign(e,t);return;}}FAILS.push(name);}}

// ---- gather source art ----
const SP={}; // final sprite map: key -> {sil, eyes, mouth?}
function add(key, obj){ SP[key]={sil:obj.sil, eyes:obj.eyes||[], ...(obj.mouth?{mouth:obj.mouth}:{})}; }

// SAURIAN: polished art lives in the chart file (babies + S); mouths come from the sau branch files.
const sauBabies=extract("render_saurian_chart.js","const babies");
const sauS=extract("render_saurian_chart.js","const S={");
const sauMouth={};
for(let i=1;i<=4;i++){ const P=extract(`render_sau${i}_branch.js`,"const P="); for(const k in P){ if(P[k].mouth) sauMouth[k]=P[k].mouth; } }
// map each saurian baby to its branch baby mouth
const sauBabyBranch={drakelet:1,hornlet:2,jawlet:3,pricklet:4};
for(const k in sauBabies){ const bi=sauBabyBranch[k]; const bp=extract(`render_sau${bi}_branch.js`,"const P="); add(k,{sil:sauBabies[k].sil, eyes:sauBabies[k].eyes, mouth:bp.baby&&bp.baby.mouth}); }
for(const k in sauS){ add(k,{sil:sauS[k].sil, eyes:sauS[k].eyes, mouth:sauMouth[k]}); }

// BEASTIAL + SKYWING: branch files have sil+eyes+mouth. Rename each branch's "baby".
const beaBaby={1:"cubling",2:"maneling",3:"unilet",4:"tusklet"};
const skyBaby={1:"fledgling",2:"batling",3:"owlet",4:"grublet"};
for(let i=1;i<=4;i++){ const P=extract(`render_bea${i}_branch.js`,"const P="); for(const k in P){ add(k==="baby"?beaBaby[i]:k, P[k]); } }
for(let i=1;i<=4;i++){ const P=extract(`render_sky${i}_branch.js`,"const P="); for(const k in P){ add(k==="baby"?skyBaby[i]:k, P[k]); } }

// bake eyes
for(const k in SP) autofit(k, SP[k]);

// ---- genus / lineage table ----
const GEN={
 saurian:[["drakelet","Drakelet","hd","Drake","gore","Gorehorn"],["hornlet","Hornlet","wy","Wyvern","imp","Imp"],["jawlet","Jawlet","rk","Rex-King","rap","Raptor"],["pricklet","Pricklet","sb","Spineback","tb","Thornbrute"]],
 beastial:[["cubling","Cubling","wolf","Wolf","dire","Direwolf"],["maneling","Maneling","lion","Lion","manti","Manticore"],["unilet","Unilet","uni","Unicorn","gloom","Gloomhorn"],["tusklet","Tusklet","boar","Boar","war","War-Boar"]],
 skywing:[["fledgling","Fledgling","falcon","Falcon","vulture","Vulture"],["batling","Batling","night","Nightwing","gar","Gargoyle"],["owlet","Owlet","owl","Owl","screech","Screecher"],["grublet","Grublet","moth","Moth","wasp","Wasp"]],
};

// ---- emit DEX text ----
const dexLines=[]; const allKeys=new Set();
function line(genus, key, obj){ allKeys.add(key); dexLines.push(`  ${key}:${obj},`); }
for(const g in GEN){
  dexLines.push(`  // ===== GENUS: ${g.toUpperCase()} =====`);
  for(const [bk,bn,nl,nn,fl,fn] of GEN[g]){
    line(g, bk, `{stage:1,genus:'${g}',line:'${nl}',name:'${bn}',next:[{to:'${nl}_child',when:c=>c.good},{to:'${fl}_child'}]}`);
  }
  for(const [bk,bn,nl,nn,fl,fn] of GEN[g]){
    for(const [key,nm] of [[nl,nn],[fl,fn]]){
      line(g,`${key}_child`, `{stage:2,genus:'${g}',line:'${key}',name:'${nm}',next:[{to:'${key}_teen_r',when:c=>c.good},{to:'${key}_teen_f'}]}`);
      line(g,`${key}_teen_r`,`{stage:3,genus:'${g}',line:'${key}',name:'${nm}',next:[{to:'${key}_adult'}]}`);
      line(g,`${key}_teen_f`,`{stage:3,genus:'${g}',line:'${key}',name:'${nm}',next:[{to:'${key}_adult2'}]}`);
      line(g,`${key}_adult`, `{stage:4,genus:'${g}',line:'${key}',name:'${nm}',next:[{to:'${key}_elder',when:c=>c.elder}]}`);
      line(g,`${key}_adult2`,`{stage:4,genus:'${g}',line:'${key}',name:'${nm}'}`);
      line(g,`${key}_elder`, `{stage:5,genus:'${g}',line:'${key}',name:'${nm}'}`);
    }
  }
}

// ---- emit SPRITES text ----
const sprLines=[];
const order=[...allKeys];
for(const k of order){ const sp=SP[k]; if(!sp){ console.log("!! MISSING SPRITE for DEX key:",k); continue; }
  const mouth = sp.mouth ? `,mouth:${JSON.stringify(sp.mouth)}` : "";
  sprLines.push(`${k}:{sil:${JSON.stringify(sp.sil)},eyes:${JSON.stringify(sp.eyes)}${mouth}},`);
}

// ---- validate ----
let problems=0;
for(const line of dexLines){ const m=line.match(/to:'([a-z0-9_]+)'/g); if(m) for(const mm of m){ const t=mm.slice(4,-1); if(!allKeys.has(t)){ console.log("!! DEX target missing:",t); problems++; } } }
for(const k of allKeys){ if(!SP[k]){ console.log("!! No sprite for:",k); problems++; } }
const extraSprites=order.filter(k=>!allKeys.has(k)); // sprites with no DEX entry (shouldn't happen)
for(const k in SP){ if(!allKeys.has(k)) { console.log("!! Sprite with no DEX entry:",k); problems++; } }

fs.writeFileSync("_dex_sprites.txt", sprLines.join("\n"));
fs.writeFileSync("_dex_graph.txt", dexLines.join("\n"));
console.log("sprites:",Object.keys(SP).length,"| dex keys:",allKeys.size,"| inset FAILS:",FAILS.length?FAILS.join(", "):"none","| problems:",problems);
