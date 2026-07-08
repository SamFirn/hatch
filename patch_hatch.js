const fs=require("fs");
let h=fs.readFileSync("hatch.html","utf8");
const EOL = h.includes("\r\n") ? "\r\n" : "\n";
const spr=fs.readFileSync("_dex_sprites.txt","utf8").replace(/\r?\n/g,EOL).trim();
const dex=fs.readFileSync("_dex_graph.txt","utf8").replace(/\r?\n/g,EOL).trim();

function replaceOnce(str, anchor, repl){
  const a=anchor.replace(/\n/g,EOL);
  const i=str.indexOf(a); if(i<0) throw new Error("anchor NOT FOUND: "+anchor.slice(0,50));
  if(str.indexOf(a, i+1)>=0) throw new Error("anchor NOT UNIQUE: "+anchor.slice(0,50));
  return str.slice(0,i)+repl.replace(/\n/g,EOL)+str.slice(i+a.length);
}

// 1) SPRITES: insert new-genus entries just before the SPRITES object's closing brace
h=replaceOnce(h,
  "mouth:{x:4,y:3,w:2,h:1} },\n};",
  "mouth:{x:4,y:3,w:2,h:1} },\n\n/* ===== NEW GENERA: Saurian / Beastial / Skywing (eyes pre-baked; app does not autofit) ===== */\n"+spr+"\n};");

// 2) DEX: insert new-genus lineages before the DEX object's closing brace
h=replaceOnce(h,
  "hn_elder:{stage:5,line:'horn', name:'Titanor'},\n};",
  "hn_elder:{stage:5,line:'horn', name:'Titanor'},\n\n"+dex+"\n};");

// 3) BABY_FORMS: new eggs can now hatch into any of the 4 genera
h=replaceOnce(h,
  "const BABY_FORMS  = ['momo','pabu','tama','nubb'];",
  "const BABY_FORMS  = ['momo','pabu','tama','nubb','drakelet','hornlet','jawlet','pricklet','cubling','maneling','unilet','tusklet','fledgling','batling','owlet','grublet'];");

fs.writeFileSync("hatch.html", h);
console.log("patched OK; EOL="+(EOL==="\r\n"?"CRLF":"LF"));
