// Regenerates evotree.html from the live SPRITES + DEX in hatch.html.
// Genus-aware: groups by the DEX `genus` field (Blobkin = no field), derives
// every lineage's metadata from the graph so the bestiary stays in sync.
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync("hatch.html", "utf8");
const code = html.match(/<script>\s*\(\(\)\s*=>\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/)[0];

function literalText(marker) {
  const start = code.indexOf(marker), open = code.indexOf("{", start);
  let d = 0, end = -1;
  for (let i = open; i < code.length; i++) { const c = code[i];
    if (c === "{") d++; else if (c === "}") { d--; if (!d) { end = i; break; } } }
  return code.slice(open, end + 1);
}
const spritesText = literalText("const SPRITES = {");
const DEX = vm.runInNewContext("(" + literalText("const DEX = {") + ")");

// --- genus + lineage flavor ---
const genusMeta = {
  blobkin: {name:"Blobkin",  emoji:"🥚", blurb:"The original round ones — Hatch's first genus, all soft blobs and big eyes."},
  saurian: {name:"Saurian",  emoji:"🐉", blurb:"Bipedal dragon-kin — horns, jaws and spined backs."},
  beastial:{name:"Beastial", emoji:"🐺", blurb:"Four-legged beasts — fang, mane, horn and tusk."},
  skywing: {name:"Skywing",  emoji:"🕊️", blurb:"Winged fliers — feathered, bat, owl and insect wings."},
};
const genusOrder = ["blobkin","saurian","beastial","skywing"];
const lineEmoji = {
  shell:"🐢",crest:"👑",wing:"🦋",spike:"⚡",bloom:"🌸",fin:"🐟",ear:"🐰",horn:"🦏",
  hd:"🐲",gore:"😈",wy:"🪽",imp:"👿",rk:"🦖",rap:"🦅",sb:"🦎",tb:"🌵",
  wolf:"🐺",dire:"🐕",lion:"🦁",manti:"🦂",uni:"🦄",gloom:"🕯️",boar:"🐗",war:"⚔️",
  falcon:"🦅",vulture:"🍖",night:"🦇",gar:"🗿",owl:"🦉",screech:"🪶",moth:"🦋",wasp:"🐝",
};
const genusOf = k => DEX[k].genus || "blobkin";

// --- kind/rough per child, derived from its baby's branch order (branch 0 = kind) ---
const childRoute = {};
for (const n of Object.values(DEX)) if (n.stage === 1 && n.next) n.next.forEach((e, i) => { childRoute[e.to] = i === 0 ? "kind" : "rough"; });

// --- "how you reach this form" badge, graph-driven so it works for every genus ---
function edgeLabel(to) {
  if (/_child$/.test(to)) return childRoute[to] === "kind" ? {t:"kind care",bad:false} : {t:"rough care",bad:true};
  if (/_teen_r$/.test(to)) return {t:"good care",bad:false};
  if (/_teen_f$/.test(to)) return {t:"neglect",bad:true};
  if (to === "chonk") return {t:"overfed",bad:true};
  if (to === "grump") return {t:"many mistakes",bad:true};
  if (to === "runt")  return {t:"left sickly",bad:true};
  if (/_elder$/.test(to)) return {t:"raised well ✦",bad:false};
  if (/_adult2$/.test(to)) return {t:"wild path",bad:true};
  if (/_adult$/.test(to)) return {t:"stayed true",bad:false};
  return {t:"",bad:false};
}
const cond = {};
for (const n of Object.values(DEX)) if (n.next) for (const e of n.next) cond[e.to] = edgeLabel(e.to);

const stageName = ["Egg","Baby","Child","Teen","Adult","Elder"];
const rank = k => (/_teen_r$/.test(k)?0:/_teen_f$/.test(k)?1:/_adult2$/.test(k)?1:0);

// --- assemble per-genus layout ---
const genera = [];
let totalLineages = 0;
for (const g of genusOrder) {
  const babyKeys = Object.keys(DEX).filter(k => DEX[k].stage === 1 && genusOf(k) === g);
  const babies = babyKeys.map(bk => { const n = DEX[bk];
    return { key:bk, name:n.name, routes:n.next.map(e => ({ to:e.to, line:DEX[e.to].line, lineName:DEX[e.to].name, care:childRoute[e.to] })) }; });
  // lineage order = for each baby, its kind line then its rough line (keeps sibling pairs together)
  const lineages = [];
  for (const bk of babyKeys) for (const e of DEX[bk].next) {
    const line = DEX[e.to].line;
    const forms = Object.keys(DEX).filter(k => DEX[k].line === line && DEX[k].stage >= 2)
      .sort((a,b) => DEX[a].stage - DEX[b].stage || rank(a) - rank(b));
    lineages.push({ line, emoji:lineEmoji[line] || genusMeta[g].emoji,
      name: DEX[line+"_adult"] ? DEX[line+"_adult"].name : line,
      baby: DEX[bk].name, route: childRoute[e.to] === "kind" ? "kind care" : "rough care",
      forms: forms.map(k => ({ key:k, name:DEX[k].name, stage:stageName[DEX[k].stage], cond:cond[k]||{t:"",bad:false} })) });
  }
  totalLineages += lineages.length;
  // universal outcomes belong to Blobkin only
  const universal = g !== "blobkin" ? [] : ["chonk","grump","runt"].filter(k=>DEX[k]).map(k => ({ key:k, name:DEX[k].name,
    why:{ chonk:"overfed (refined teen)", grump:"many care mistakes", runt:"left sick + low health" }[k] }));
  genera.push({ genus:g, ...genusMeta[g], babies, lineages, universal });
}

const total = Object.keys(DEX).length;
const OUT = `<title>HATCH — Bestiary &amp; Evolution Map</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#111210">
<style>
  :root{ --bg:#efe7d8; --bg2:#e3d9c6; --panel:#f7f2e8; --edge:#d8ccb4;
    --ink:#2b2620; --ink2:#7d735f; --coral:#ef6a3d; --rec:#3f8f5a; }
  @media (prefers-color-scheme: dark){ :root{ --bg:#17181a; --bg2:#101113; --panel:#1e2023; --edge:#2c2f33;
    --ink:#ece7dd; --ink2:#a49c8c; --coral:#ff7d4d; --rec:#5fc07f; } }
  *{ box-sizing:border-box; }
  body{ margin:0; min-height:100vh; color:var(--ink);
    background:radial-gradient(130% 90% at 50% -20%, var(--bg), var(--bg2));
    font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
  .wrap{ max-width:1180px; margin:0 auto; padding:34px 16px 64px; }
  .eyebrow{ font:700 11px ui-monospace,monospace; letter-spacing:3px; color:var(--coral); text-transform:uppercase; }
  h1{ font-size:clamp(24px,5vw,38px); font-weight:800; letter-spacing:-.5px; margin:8px 0 10px; }
  .lede{ max-width:66ch; color:var(--ink2); font-size:15px; line-height:1.6; margin:0; }
  .count{ display:inline-block; margin-top:12px; font:700 12px ui-monospace,monospace; color:var(--rec);
    border:1px solid var(--rec); border-radius:20px; padding:4px 10px; }

  .genus{ margin-top:40px; padding-top:18px; border-top:2px solid var(--edge); }
  .genus.first{ border-top:0; }
  .genushead{ font-size:clamp(19px,3.4vw,26px); font-weight:800; letter-spacing:-.3px; margin:0 0 2px; display:flex; align-items:center; gap:10px; }
  .genusblurb{ color:var(--ink2); font-size:14px; margin:0 0 4px; }
  .gcount{ font:700 11px ui-monospace,monospace; color:var(--ink2); }

  .sec{ margin-top:20px; }
  .sec h2{ font-size:14px; font-weight:800; letter-spacing:.3px; margin:0 0 4px; display:flex; align-items:center; gap:8px; text-transform:uppercase; }
  .sec .sub{ font:600 12px ui-monospace,monospace; color:var(--ink2); margin:0 0 12px; }

  .panel{ background:var(--panel); border:1px solid var(--edge); border-radius:18px; padding:14px 14px 16px; margin-bottom:14px; }
  .panel .ptitle{ font-size:15px; font-weight:800; display:flex; align-items:center; gap:8px; margin:0 0 2px; }
  .panel .proute{ font:600 11px ui-monospace,monospace; color:var(--ink2); margin:0 0 12px; }
  .panel .proute b{ color:var(--ink); }
  .flow{ display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; align-items:flex-start; }

  .card{ flex:0 0 auto; width:112px; text-align:center; }
  .lcd{ border-radius:10px; padding:7px; background:linear-gradient(160deg,#241f16,#100e0a); box-shadow:0 1px 0 rgba(255,255,255,.25); }
  .lcd canvas{ width:100%; display:block; image-rendering:pixelated; border-radius:6px; box-shadow:0 0 0 2px #0c0b07; }
  .nm{ font-weight:800; font-size:14px; margin-top:8px; }
  .stg{ font:600 9px ui-monospace,monospace; color:var(--ink2); letter-spacing:1px; text-transform:uppercase; margin-top:1px; }
  .cond{ margin-top:6px; font:600 9px ui-monospace,monospace; color:var(--rec);
    border:1px solid var(--rec); border-radius:20px; padding:2px 6px; display:inline-block; }
  .cond.bad{ color:var(--coral); border-color:var(--coral); }
  .grid3{ display:grid; grid-template-columns:repeat(auto-fill,minmax(112px,1fr)); gap:12px; }

  .babygrid{ display:flex; gap:12px; overflow-x:auto; padding-bottom:6px; }
  .babycard{ flex:0 0 auto; width:150px; background:var(--panel); border:1px solid var(--edge); border-radius:16px; padding:12px; text-align:center; }
  .babycard .routes{ margin-top:8px; font:600 10px ui-monospace,monospace; line-height:1.7; color:var(--ink2); text-align:left; }
  .babycard .routes b{ color:var(--ink); }
  .g{ color:var(--rec); } .b{ color:var(--coral); }

  .legend{ margin-top:34px; display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px; }
  .lg{ background:var(--panel); border:1px solid var(--edge); border-radius:16px; padding:14px 16px; }
  .lg h3{ margin:0 0 6px; font-size:14px; font-weight:800; }
  .lg p{ font-size:13px; line-height:1.55; color:var(--ink2); margin:0; }
  .lg b{ color:var(--ink); }
  .scrollhint{ font:500 11px ui-sans-serif,system-ui; color:var(--ink2); opacity:.75; margin:2px 0 0; }
</style>

<div class="wrap">
  <div class="eyebrow">HATCH · Bestiary</div>
  <h1>Creatures &amp; evolution map</h1>
  <p class="lede">Every creature in the game and exactly how care decides which one you get. One egg → a random baby from one of four <b>genera</b> → and from the very first stage, how you raise it picks the lineage, then good vs. rough raising steers each branch. Same 4-Shade Green look as the app.</p>
  <span class="count">${total} forms · ${genusOrder.length} genera · ${totalLineages} lineages</span>

  <div id="genera"></div>

  <div class="legend">
    <div class="lg"><h3>🩹 Care mistakes</h3><p>Ignore a call (hungry / sad / sick / messy) too long = a <b>care mistake</b>, counted <b>per stage</b>. Few → refined forms; many → wilder ones.</p></div>
    <div class="lg"><h3>🍬 Overfeeding</h3><p>Lots of <b>snacks</b> or force-feeding raises weight + overfeed — in Blobkin, a refined teen that's overfed becomes <b>Dumplin</b>.</p></div>
    <div class="lg"><h3>🤒 Health</h3><p>A Blobkin feral teen left <b>sick with low health</b> becomes the frail <b>Runtling</b> instead of its adult.</p></div>
    <div class="lg"><h3>✦ Elders</h3><p>A <b>noble adult</b> raised well its whole life (few lifetime mistakes, trained, healthy) can <b>ascend</b> to a rare stage-5 <b>Elder</b> — one per lineage.</p></div>
  </div>
</div>

<script>
"use strict";
const STYLE = { field:'#dbeeba', pal:[null,'#8bad4d','#3f6b32','#14300f'], eyeLight:'#eefad4', pupil:'#14300f' };
const CRE = ${spritesText};
const GENERA = ${JSON.stringify(genera)};

const LW=26, LH=26, PXS=4;
function buildShade(sp){ const w=Math.max(...sp.sil.map(r=>r.length)); const rows=sp.sil.map(r=>r.padEnd(w,' ')); const h=rows.length;
  const on=(r,c)=> r>=0&&r<h&&c>=0&&c<w && rows[r][c]==='#';
  let top=h,bot=0; for(let r=0;r<h;r++)for(let c=0;c<w;c++) if(on(r,c)){ if(r<top)top=r; if(r>bot)bot=r; }
  const span=Math.max(1,bot-top), map=[];
  for(let r=0;r<h;r++){ const line=[]; for(let c=0;c<w;c++){ if(!on(r,c)){ line.push(0); continue; }
    if(!on(r-1,c)||!on(r+1,c)||!on(r,c-1)||!on(r,c+1)){ line.push(3); continue; } line.push((r-top)/span<0.42?1:2);
  } map.push(line); } sp.shade={map,w,h}; }
for(const k in CRE) buildShade(CRE[k]);

function mkCanvas(key){ const cv=document.createElement('canvas'); cv.width=LW*PXS; cv.height=LH*PXS; cv.dataset.key=key; return cv; }
function draw(cv, key, tick){
  const ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=false;
  const sp=CRE[key]; if(!sp){ return; } const {map,w,h}=sp.shade;
  ctx.fillStyle=STYLE.field; ctx.fillRect(0,0,cv.width,cv.height);
  const ox=Math.floor((LW-w)/2), bob=Math.round(Math.sin(tick/24)), oy=Math.floor((LH-h)/2)+bob;
  for(let r=0;r<h;r++)for(let c=0;c<w;c++){ const lv=map[r][c]; if(lv){ ctx.fillStyle=STYLE.pal[lv]; ctx.fillRect((ox+c)*PXS,(oy+r)*PXS,PXS,PXS); } }
  const closed=(tick%150)<7;
  for(const e of (sp.eyes||[])){ const ex=ox+e.x, ey=oy+e.y;
    if(closed){ ctx.fillStyle=STYLE.pal[3]; ctx.fillRect(ex*PXS,(ey+(e.h>>1))*PXS,e.w*PXS,PXS); continue; }
    ctx.fillStyle=STYLE.eyeLight; ctx.fillRect(ex*PXS,ey*PXS,e.w*PXS,e.h*PXS);
    const pw=Math.max(1,e.w-2),ph=Math.max(1,e.h-2),pxo=e.w>2?1:0,pyo=e.h>2?1:0;
    ctx.fillStyle=STYLE.pupil; ctx.fillRect((ex+pxo)*PXS,(ey+pyo)*PXS,pw*PXS,ph*PXS); }
  if(sp.mouth && !closed){ ctx.fillStyle=STYLE.pal[3]; ctx.fillRect((ox+sp.mouth.x)*PXS,(oy+sp.mouth.y)*PXS,sp.mouth.w*PXS,sp.mouth.h*PXS); }
}
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

const root=document.getElementById('genera');
GENERA.forEach((G,gi)=>{
  const sec=document.createElement('div'); sec.className='genus'+(gi===0?' first':'');
  const nForms = G.babies.length + G.lineages.reduce((a,l)=>a+l.forms.length,0) + G.universal.length;
  sec.insertAdjacentHTML('beforeend',
    \`<div class="genushead">\${G.emoji} Genus \${gi+1} — \${G.name}</div>
     <p class="genusblurb">\${G.blurb}</p>
     <span class="gcount">\${nForms} forms · \${G.lineages.length} lineages</span>\`);

  // babies
  const bsec=document.createElement('div'); bsec.className='sec';
  bsec.insertAdjacentHTML('beforeend', \`<h2>🥚 Eggs → babies → lineage</h2><p class="sub">Each baby is random. Early care picks its lineage: kind → one path, rough → another.</p>\`);
  const bg=document.createElement('div'); bg.className='babygrid';
  for(const b of G.babies){ const c=document.createElement('div'); c.className='babycard';
    const lcd=document.createElement('div'); lcd.className='lcd'; lcd.appendChild(mkCanvas(b.key)); c.appendChild(lcd);
    const rr=b.routes.map(r=>\`<span class="\${r.care==='kind'?'g':'b'}">\${r.care} care</span> → <b>\${r.lineName}</b>\`).join('<br>');
    c.insertAdjacentHTML('beforeend', \`<div class="nm">\${b.name}</div><div class="stg">Baby</div><div class="routes">\${rr}</div>\`);
    bg.appendChild(c); }
  bsec.appendChild(bg); sec.appendChild(bsec);

  // lineages
  const lsec=document.createElement('div'); lsec.className='sec';
  lsec.insertAdjacentHTML('beforeend', \`<h2>🧬 The \${G.lineages.length} lineages</h2><p class="sub">Child → Teen (good = refined · neglect = feral) → Adult → rare <b>Elder ✦</b> if raised well its whole life.</p>\`);
  for(const L of G.lineages){ const p=document.createElement('div'); p.className='panel';
    p.insertAdjacentHTML('beforeend', \`<div class="ptitle">\${L.emoji} \${L.name}</div><div class="proute">from <b>\${L.baby}</b> · \${L.route}</div>\`);
    const flow=document.createElement('div'); flow.className='flow';
    for(const f of L.forms){ const card=document.createElement('div'); card.className='card';
      const lcd=document.createElement('div'); lcd.className='lcd'; lcd.appendChild(mkCanvas(f.key)); card.appendChild(lcd);
      const cnd=f.cond&&f.cond.t? \`<div class="cond \${f.cond.bad?'bad':''}">\${f.cond.t}</div>\`:'';
      card.insertAdjacentHTML('beforeend', \`<div class="nm">\${f.name}</div><div class="stg">\${f.stage}</div>\${cnd}\`);
      flow.appendChild(card); }
    p.appendChild(flow); lsec.appendChild(p); }
  sec.appendChild(lsec);

  // universal (blobkin only)
  if(G.universal.length){ const usec=document.createElement('div'); usec.className='sec';
    usec.insertAdjacentHTML('beforeend', \`<h2>💥 Universal outcomes</h2><p class="sub">These override the lineage adult when you over/under-care at the teen stage.</p>\`);
    const ug=document.createElement('div'); ug.className='grid3';
    for(const u of G.universal){ const c=document.createElement('div'); c.className='card';
      const lcd=document.createElement('div'); lcd.className='lcd'; lcd.appendChild(mkCanvas(u.key)); c.appendChild(lcd);
      c.insertAdjacentHTML('beforeend', \`<div class="nm">\${u.name}</div><div class="stg">Adult</div><div class="cond bad">\${u.why}</div>\`);
      ug.appendChild(c); }
    usec.appendChild(ug); sec.appendChild(usec); }

  root.appendChild(sec);
});

const all=[...document.querySelectorAll('canvas')];
let tick=0;
function loop(){ tick++; for(const cv of all) draw(cv, cv.dataset.key, tick); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
</script>
`;
fs.writeFileSync("evotree.html", OUT);
console.log("wrote evotree.html —", total, "forms,", totalLineages, "lineages across", genusOrder.length, "genera,", (OUT.length/1024|0), "KB");
