# HATCH — Genus / Body-Plan Art Direction
*Prepared by Navi, 2026-07-07. Builds on `HATCH-sprite-art-study.md`. Goal: escape "blob with a hat," give creatures real anatomy, and make each tiny sprite imply a grand creature the way '90s v-pets did.*

---

## 0. The core doctrine — "the sprite is a sign, not the creature"
Sam's insight: as a kid, the magic wasn't the 16px sprite — it was **knowing what awesome creature that silly sprite stood for**, and letting imagination fill the rest. The sprite is a *pointer* to a grander being (which the full-art bestiary and the name complete).

So every sprite must carry **enough anatomical cue that the brain auto-completes the myth**: a rearing biped → "dragon," a four-legged profile → "beast/wolf," a wide wingspan → "sky-lord." A centered blob completes to… a blob. That's why the current forms fall flat at the top of each line.

**Rule:** a sprite succeeds when a stranger can name its *kind* (biped? beast? bird?) from the black silhouette alone.

---

## 1. Genera = body plans (the big change)
Stop organizing only by surface motif (shell/crest/horn). Add a **body-plan axis** — the genus — which is what actually makes silhouettes read as different creatures.

- **Genus I — Blobkin (what we have).** Round, limbless-ish, cute, centered. Reframe the existing 55 forms as **one deliberate genus** — the "common/starter" life, Tamagotchi-classic. They're not wrong; they were just *everything*. Now they're a category.
- **Genus II — Saurian (bipedal).** Stands upright: distinct head, torso, two legs with a stance gap, usually a tail (and often small arms). Reads as dragon/lizard-man/kaiju. *Touchstones: Charmander→Charizard line, Agumon/Greymon, Machop.*
- **Genus III — Beastial (quadruped).** Horizontal body on four legs, head offset to one end, tail at the other. Reads as wolf/lion/mount. *Touchstones: Growlithe/Arcanine, Eevee, Garurumon, Ponyta.*
- **Genus IV — Skywing (winged).** Wingspan dominates the frame; body is small and central. Reads as bird/dragon/seraph. *Touchstones: Pidgeotto/Charizard wings, Aerodactyl, Birdramon, Zubat.*

(Future genera to keep in back pocket: **Serpentine** (no legs, long coil), **Aquatic** (fins/streamline), **Insectoid** (segmented + many limbs). Don't build yet — nail four first.)

---

## 2. Watercolor full-art → 1-bit (what to actually steal)
Gen 1 Pokémon art was **Sugimori watercolor** — soft, painterly, full of *volume and gesture*. You can't put color in a 1-bit sprite, so steal the three things that survive the shrink:

1. **Gesture / posture.** Watercolor creatures *lean, rear, crouch, spread*. They have a line-of-action. Our sprites are stiff and symmetric. → Give each a **pose**, not a mugshot. A slight lean or a raised limb implies motion and life.
2. **Implied volume via our auto-shader.** The renderer already lights the top ~42% and shades the belly (outline=3, light=1, mid=2). That *is* watercolor's form-shading in miniature. → Shape bodies so the light band lands on a chest/shoulder/wing-top and the shadow on the underside — it reads as a rounded, 3D animal, not a flat cutout.
3. **One "story" feature, dynamically placed.** Full art sells the creature with one hero trait (a flame tail mid-flick, a wing caught mid-beat). → Put the signature feature **in an active position** (tail curling *out*, wing *up*, jaw *open*), not stapled on symmetrically.

**Anti-slop discipline (unchanged, reinforced):** hand-author every silhouette; design the black shape first and name its *kind* before adding an eye; one deliberate asymmetry per creature; **and now — render it to real pixels and look at it before committing.** No sprite ships unseen.

---

## 3. Silhouette language per genus (authoring rules)
- **Blobkin:** ≤14px, round, centered, feet as small nubs. Cute proportion (big head-share). *(existing — leave as-is)*
- **Saurian (biped):** taller than wide (~14w × 17–18h). Head clearly *above* a narrower torso; **a visible gap between two legs** (this single cue = "it stands up"); tail breaking symmetry to one side; optional arm nubs. Light band on the chest/head.
- **Beastial (quad):** wider than tall (~18w × 12–13h). Horizontal back-line; head massed at one end (bigger), tail at the other; **four distinct leg stubs** under the body (the cue that sells "four-legged"). Light band along the back.
- **Skywing:** widest of all (~18–20w); **wingspan fills the frame**, body small and central; wings posed *up or mid-beat*, not flat; tiny feet/tail below. Light band on the upper wing edges.

Escalation within a genus (baby→elder) = same body plan, growing mass + sharper/greater features, keeping the line's motif thread (shell/crest/etc.) — motif still lives, but now *on a real body*.

---

## 4. First-draft silhouettes (adult tier — TO BE RENDERED & ITERATED)
*Illustrative proofs the body plans fit our format. Not final — next step is rendering these with the real shader and refining until they read.*

**Saurian (bipedal) — "stands up, tail out":**
```
     ####     
    ######    
    ## ###     <- snout juts (facing right)
    ######    
     ####      <- neck
    ###### #   
   ########## <- tail sweeps right
   ########   
   ########   
    ######    
    ##  ##     <- LEG GAP = reads upright
   ###  ###    <- feet
```

**Beastial (quadruped) — "horizontal beast, head + 4 legs":**
```
             ####   
            ######   <- head massed at right
   #################
  ##################  <- back-line / body
  ##################
  ## ##  ## ##  ##    <- four leg stubs
  ## ##  ## ##  ##   
```

**Skywing (winged) — "wingspan owns the frame":**
```
##            ##
###          ###
### #      # ###
###  ##  ##  ###   <- head/body small & central
### ######## ###
 ############## 
   ####  ####    <- little feet
    ##    ##    
```

Each already reads as its *kind* in pure black — that's the bar. Now they need the render-and-refine pass.

---

## 5. Build plan
1. **Agree the 4 genera** + which existing lineages map where (e.g., wing-line → Skywing, spike/horn → Saurian, ear/fin → Beastial, shell/crest/bloom → Blobkin). Or assign fresh.
2. **Set up a visual-QA render loop:** reuse the pure-node PNG encoder (`make_assets.js`) to render any `sil` array (with real shading) to a PNG so we *see* each sprite before it ships. This is the anti-slop gate.
3. **Author per genus, baby→elder,** iterating each against the render.
4. **Wire into the `DEX`** (add a `genus` field alongside `line`), keep saves compatible (don't remove existing forms).
5. Optional: **full-art bestiary** — richer rendered creature art on the evotree/bestiary page, so the "grand creature the sprite represents" is literally shown → completes the childhood-imagination loop.
