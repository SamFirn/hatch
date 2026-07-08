# HATCH — Sprite Art Study & Design Method
*Prepared by Navi, 2026-07-06. Purpose: ground new Hatch creature sprites in the design language that made '90s virtual-pet & monster art beloved — taking **inspiration, never copying**, and deliberately avoiding "AI slop."*

---

## 0. Our actual format (design to THIS)
- Sprites = **hand-authored 1-bit silhouettes** (`#` = on, space = off), ~**11–20 px** per side.
- Shading is **auto-derived**: outline = 3, top ~42% of the body = light (1), lower = mid (2). So *vertical placement is your shading* — features up top catch the light band.
- Eyes = light sclera + pupil boxes; mouth = a 1-px box. Personality is authored *separately* from the body shape.
- Evolution is **branching**, ~14 forms, egg → baby → child → teen → adult, with lineage motifs.

**Why this matters:** this is nearly the exact medium of the 1996 Tamagotchi and 1997 Digimon V-Pet. Their best sprites were *born from* a tiny 1-bit grid. We're not simulating that look — we're working in it. The constraint is the point.

---

## 1. What the '90s masters actually did

### Tamagotchi (Bandai / Akihiro Yokoi, 1996)
- Sprites lived on a ~32×16 monochrome LCD — often ~16px creatures, pure black shapes.
- Beloved ones (Mametchi's antenna-and-big-head, Kuchipatchi's blobby duck-bill) win on **silhouette alone** — you know them as a black shape with the screen off.
- Cuteness came from **proportion, not detail**: big head, small body, round forms (neoteny). Two eyes + one mouth carried all the emotion. Life came from **2-frame animation** (idle bob + blink).

### Pokémon Gen 1→3 (1996–2002)
- **Gen 1** (GB, ~56px, 4 GB-green shades): often janky/off-model, but bold silhouettes and one unforgettable *signature feature* per mon (Pikachu cheeks+tail, Charmander's flame tail).
- **Gen 2** (Gold/Silver/Crystal): the spritework high-point of the era — cleaner shading, dynamic poses, still totally readable small.
- **Gen 3** (GBA color): more mass, more detail, but the identity still rides the silhouette + signature trait.
- **Evolution lesson (critical for us):** a line escalates **mass + complexity** while a **shared motif persists** — Charmander's tail-flame survives all the way to Charizard; Bulbasaur's bulb grows into a tree. The creature changes; the *thread* doesn't.

### Digimon (Bandai / WiZ, 1997)
- Literally started as a monochrome LCD V-Pet — **our exact format.** The original Digimon sprites are the single best direct reference we have.
- Language is **"cool/kaiju," not just cute**: sharper, more mechanical, more transformation. Digivolution can radically restructure a creature while keeping identifiable motifs (Agumon → Greymon keeps snout + claws + orange energy).
- Beloved because each stage felt like a **real reward** — the new silhouette read as a genuinely different, bigger being at ~16px.

---

## 2. Why those tiny sprites are beloved (the transferable rules)
1. **Silhouette-first.** If it doesn't read as a distinct black shape, it fails. Thumbnail every creature as pure `#` before adding a single eye.
2. **One signature feature.** A single memorable trait (antenna / ears / tail / crest / spikes). Clutter kills identity at this size.
3. **Proportion = emotion.** Big head + big eyes + round = baby/cute. Leaner, taller, sharper, more negative space = older/edgier.
4. **Eyes do 80% of the work.** Consistent eye language = consistent character. High & wide = innocent; narrow & angled = tough (the current `grump` already fakes brows with silhouette notches — good instinct).
5. **Economy.** Every pixel is a decision; negative space is a feature. Legible beats detailed, always.
6. **Motif continuity across a line.** One shape threads baby→adult so it feels like the *same being* growing up.
7. **Cheap life.** Idle bob + a blink frame = "alive." We already do this.

---

## 3. Avoiding "AI slop" — concretely
"AI slop" at sprite scale = mushy blobs, no intentional silhouette, over-detail that turns to noise when small, symmetrical-but-soulless, and **sameface** (every creature the same round body with swapped ears).

**Our antidotes (the format already fights slop — lean in):**
- **Author silhouettes by hand in ASCII.** No upscaled image-gen → downscale. The grid forces intent.
- **Silhouette FAMILIES must differ.** Right now the four babies lean round. Push them to genuinely different families: **round, teardrop, tall/eared, stubby/spiky** — distinct from frame one. (Pabu's teardrop and Nubb's antenna are the right instinct; exaggerate further.)
- **One deliberate asymmetry or quirk per creature** — a bent antenna, one chipped ear, an off-center crest. Imperfection reads as *character*; perfect symmetry reads as generated.
- **No two forms share a body outline.** If you can swap two creatures' eyes and not tell them apart, redesign.
- **Escalate on purpose.** Each evolution should change the *silhouette class*, not just bolt on spikes.

---

## 4. Method: designing a Hatch creature (repeatable)
1. **Pick a lineage motif** (the thread): e.g. *ears*, *crest*, *tail-curl*, *single eye*, *shell*.
2. **Thumbnail the silhouette** as pure `#` at the target grid — read it with eyes squinted. Distinct shape? Keep. Blob? Kill.
3. **Choose the silhouette family** so it contrasts its siblings in the same tree.
4. **Place features in the top ~42%** so the auto-light-shade sculpts them.
5. **Add eyes/mouth boxes last** to set the archetype (cute vs. tough).
6. **Evolve by escalation:** keep the motif, grow the mass, shift the family (round baby → eared child → tall/sharp teen → imposing adult), carry the eye language forward.

---

## 5. Worked mini-example — a "Crest" lineage (motif persists, family shifts)
Demonstrates continuity + escalation in our exact format. (Illustrative, original — not shipped yet.)

**Baby — round, tiny top nub crest:**
```
      ##      
    ######    
   ########   
  ##########  
  ##########  
  ##########  
   ########   
    ##  ##    
```
**Child — taller, crest forks into two:**
```
    #    #    
    ##  ##    
     ####     
    ######    
   ########   
   ########   
   ########   
   ########   
    ######    
    ##  ##    
```
**Teen — lean, swept-back single crest, sharper base:**
```
   #####      
   ####       
    ##        
   ######     
  ########    
  ########    
  ########    
   ######     
   ##  ##     
  ##    ##    
```
Same idea (a crest) threads all three; the **silhouette family changes each stage** (round → forked/upright → lean/swept), mass grows, and the base gets sharper as it "ages." That's the anti-slop, pro-'90s move: intentional escalation on a shared thread.

---

## 6. Recommendations for Hatch specifically
- **Define 3–4 lineages, each with one persistent motif**, so the whole evo tree feels authored, not random. (You already have the `_b` Gubbi→Bloop ear-line — formalize the rest.)
- **Differentiate the 4 babies by silhouette family** so lineage reads from the very first stage (supports the "branch by lineage" tweak already noted as a future option in the dev log).
- **Keep everything ≤ ~20px** and top-weight the signature features for the auto-shader.
- **Give each creature one quirk.** That single intentional imperfection is the biggest, cheapest slop-repellent we have.
- Next step when you're ready: pick the lineages/motifs together, then I'll author a full themed set of silhouettes in-format and we drop them into `SPRITES{}` with matching evo-tree wiring.
```
