---
tags: [zaphiel, cinematic, test, medical, cardiology, dry-run]
client: "DEMO Heart Specialist Clinic (fictional, Singapore)"
status: DRY RUN — storyboard + prompts + cost card only. NOT APPROVED. Nothing generated, 0 credits spent.
prepared_by: cinematic-director (Training Test B)
date: 2026-10-12
---
# DEMO Heart Specialist Clinic: anatomy film asset pack (dry run)

> **Fictional demo clinic.** No real doctor, no real credentials. Stated services for the demo: **heart screening**
> and **coronary angioplasty with stenting**. Every film is labelled **"Illustration for education only"** on the
> site, and every caption stays `[VERIFY WITH CLINIC]` until the clinic's doctor signs it off.
> Nothing has been generated. Generation waits for: **"APPROVED by Ryan: up to N Kling credits / M Higgsfield credits"**.

## 0. What the visitor sees (plain English, one line per scene)
1. A calm person sits in soft light; the camera drifts towards their chest.
2. The chest turns see-through like frosted glass and we glide through it to the beating heart (the "how did they do that" moment).
3. The heart beats slowly in a dark space, its own arteries running over its surface; we drift in onto one of them.
4. We pass through the artery wall and find ourselves inside it, with red blood cells streaming past.
5. Further along, a yellowish fatty bulge under the lining narrows the channel and the blood squeezes past.
6. A fine mesh stent on a tiny balloon arrives, opens, presses the bulge back, and the balloon leaves; the blood flows freely again.
7. We travel back out: out of the artery, out to the whole heart, and out of the chest to the same calm person.

Scrolling up plays the whole journey backwards (the site scrubs the frames in both directions).

---

## 1. Medical look bible (verbatim from `02_Medical_Anatomy_Films.md`, starts every prompt word for word)

**LOOK BIBLE (LB):**
> Photoreal medical visualisation, the quality of a high-end medical animation studio: a dark clean void with soft
> volumetric light, subsurface scattering on tissue, glossy wet surfaces, physically accurate anatomy, shallow depth
> of field, slow graceful camera, clinical cool tones with warm red highlights, no text, no labels, no gore.

**NEGATIVE LINE (NEG)** (verbatim):
> no blood spill, no open wounds, no surgical incisions, no needles, no syringes, no cartoon, no low-poly, no text,
> no watermark, no extra organs, anatomically correct proportions.

**Project additions to the look (same in every scene):**
- Key light from the **upper left**, cool blue-grey; a faint warm red rim from the right. Never changes direction.
- Lens language: 50 mm for the person, 85–100 mm macro for the heart and artery surface, wide macro inside the artery.
- **Composition for phones:** the subject always sits in the **central third** of the 16:9 frame with deep dark
  space left and right. A 9:16 centre crop of a 16:9 frame keeps only the middle ~32 % of the width, so this is what
  lets one 16:9 master serve both desktop and phone (and gives the desktop copy its left/right safe zones).

**How negatives are passed:** the live Kling and Higgsfield models have **no `negative_prompt` argument** (checked
2026-10-12). Negatives therefore go at the end of the prompt text: `… Avoid: <NEG> <scene extras>`.

**Assembled prompt format (every still and film):** `<LB> <scene text> Avoid: <NEG> <scene extras>`.
A fully assembled example is given for S3 in §4.2; all others follow the same pattern.

---

## 2. Storyboard: 7 chained scenes (9 film legs, 8 stills)

**The chain:** each leg's `tail_image` is the next leg's `first_image` (the same file). Scenes 6 and 7 each need two
legs because one move holds three states (6: plaque → device in place → stent open; 7: artery → whole heart →
person). The last leg ends on **S1, the opening still**, so the film closes exactly where it started.

| Scene | Leg | first_image → tail_image | Duration | Site section (scroll length) |
|---|---|---|---|---|
| 1 The person | F1 | S1 → S2 | 5 s | Hero, `data-from="0"` (≈240vh) |
| 2 Through the surface | F2 | S2 → S3 | 10 s | Threshold (≈320vh) |
| 3 The heart in full | F3 | S3 → S4 | 5 s | ≈240vh |
| 4 Into the artery | F4 | S4 → S5 | 5 s | ≈240vh |
| 5 The narrowing | F5 | S5 → S6 | 5 s | ≈240vh |
| 6 The stent | F6a + F6b | S6 → S6b → S7 | 5 s + 10 s | one scene, two legs (≈400vh, extrapolated) |
| 7 Back out | F7a + F7b | S7 → S3 → S1 | 5 s + 10 s | one scene, two legs (≈400vh, extrapolated) |

Total film: **60 s** across 9 legs. All 16:9, 1080p, silent.

### Shot packages (doctrine §22)

**Scene 1: The person**
- Purpose: calm, human opening; tells the visitor this is about *their* heart. Carries the hero copy.
- Subject/action: a calm adult in their fifties, seated, breathing slowly; framed chin-to-waist, no face.
- Start still S1 / end still S2 (closer on the chest, faint warm glow showing through the fabric).
- Camera/lens: 50 mm, eye level; slow push-in and slight tilt down. Speed: very slow.
- Light: cool key upper left, warm rim right. Grade: cool clinical with warm skin.
- Safe text zone: left third (desktop); bottom 30 % on phone over a tint. Mobile crop: centre 9:16, chest stays in frame.
- Continuity: same t-shirt, same posture as the final frame of the film (S1 returns at the end).
- Scene negatives: no face, no identifiable features, no tattoos, no jewellery, no logos, no hospital gown, no medical equipment.

**Scene 2: Through the surface (threshold, 10 s)**
- Purpose: the wow moment; the body turns translucent and we enter.
- Subject/action: fabric and skin turn frosted-glass translucent; soft pale silhouettes of the breastbone and ribs
  appear, then dissolve as the camera glides through to the heart, which sits behind the breastbone slightly to the
  person's left, and ends isolated in the void.
- Start S2 / end S3 (the hero heart). Camera: continuous forward glide, 50 mm → 85 mm feel. Speed: slow, even.
- Safe text zone: right third. Mobile crop: centre; the glow is centred so the crop holds.
- Scene negatives: no cut-open chest, no skin peeling, no blood, no organs other than a faint suggestion of lungs, no X-ray look, no skeleton face.

**Scene 3: The heart in full**
- Purpose: show the healthy heart and its own coronary arteries.
- Subject/action: anterior view, the heart beating slowly and calmly; slow ~20° orbit and a push in onto the LAD.
- Start S3 (hero) / end S4 (macro on the left anterior descending artery in its groove).
- Camera: 85 → 100 mm macro, shallow depth of field. Speed: slow.
- Safe text zone: left third. Mobile crop: heart centred in the middle third.
- Scene negatives: no valentine heart shape, no ribs, no open chest, no cut vessel ends with blood, no extra vessels, no jerky beating.

**Scene 4: Into the artery**
- Purpose: change of scale from organ to cells.
- Subject/action: the artery wall turns translucent and the camera passes into the channel, turning to look down its length as red cells stream past.
- Start S4 / end S5. Camera: macro push-in, then a gentle turn. Speed: slow → steady.
- Safe text zone: right third. Mobile crop: vanishing point centred.
- Scene negatives: no tearing, no puncture, no bleeding, no tunnel of random branches.

**Scene 5: The narrowing (the concern, gently)**
- Purpose: show what can narrow a coronary artery; calm and educational.
- Subject/action: camera travels forward with the pulsing flow; a smooth yellowish bulge under the intact lining
  comes into view on one side and the flow squeezes past.
- Start S5 / end S6. Camera: slow forward dolly in the channel. Speed: slow.
- Safe text zone: left third. Mobile crop: narrowing centred.
- Scene negatives: no blood clot, no rupture, no torn lining, no floating debris or rubbish, no complete blockage, no alarming red flashes.

**Scene 6: The stent (two legs)**
- Purpose: illustrate, generically, how a stent opens a narrowed artery (a service the demo clinic states it offers).
- F6a (5 s): a thin smooth catheter, with a hair-thin guide wire ahead of it, glides in along the channel from
  behind the camera and stops across the narrowing, carrying a deflated balloon with a crimped mesh stent.
- F6b (10 s): the balloon inflates slowly; the stent expands evenly and presses the plaque back into the wall; the
  balloon deflates and the catheter and wire withdraw towards the camera; the expanded stent stays in the wall; the
  channel is round and open and the cells flow freely.
- Stills: S6 → S6b → S7. Camera: locked, very slight drift only (the device moves, not the camera).
- Safe text zone: right third. Mobile crop: narrowing centred.
- Scene negatives: no needle, no sharp tip, no brand names or markings on the device, no X-ray/angiogram look, no hands, no surgeon, no catheter entry site (wrist or groin), no sparks.

**Scene 7: Back out (two legs)**
- Purpose: return to the calm person; on the site the reverse scroll also plays this journey inward again.
- F7a (5 s): camera pulls back out of the open artery, through its translucent wall, until the whole heart is seen beating calmly (ends on S3).
- F7b (10 s): camera keeps pulling back; pale ribs, then skin and fabric become opaque again around the heart's glow; the calm person breathing (ends on S1).
- Stills: S7 → S3 → S1 (S3 and S1 reused: zero extra still cost; the loop closes exactly).
- Safe text zone: left third, then the CTA (book a heart screening) over the final frame.
- Scene negatives: as scenes 2 and 3.

---

## 3. Anatomy-accuracy check per scene (against the facts table in `02_Medical_Anatomy_Films.md`)

Status: **PLANNED** (dry run, no stills yet). On production, each still is checked against this table **before** any
video credit is spent; a fail is a BLOCKER (`05_QA.md`).

| Scene / still | Must be true (facts table) | Built into the prompt | Risk to watch on the still |
|---|---|---|---|
| S1, S2 person | No identifiable face; heart behind the breastbone, slightly to the person's left | "chin to waist", glow left of the breastbone | Face creeping into frame; glow in the wrong place (right side) |
| F2 threshold | Ribs and breastbone in front of the heart; heart between the lungs | "pale silhouettes of breastbone and ribs", faint lungs only | Skeleton or organs invented; gory "opening" |
| S3 heart (hero) | Four chambers; **apex down and to the patient's left (viewer's right in a front view)**; aorta arches up and over to the patient's left; LAD down the front groove between the ventricles; circumflex round the left side; RCA round the right side; coronary veins alongside | Every item spelled out, with the viewer's-right note | Mirror-image heart (apex to viewer's left); symmetrical "valentine" shape; arteries floating off the surface; too much yellow fat in the grooves (looks like plaque) |
| S4 LAD macro | LAD runs in the anterior interventricular groove with a vein alongside | "in its groove between the ventricles, a coronary vein alongside" | Artery drawn as a loose tube on top of the muscle |
| S5 inside artery | Round tube, smooth glistening lining, muscular wall; red cells are **biconcave discs** in pale plasma; a few white cells and small platelets; pulsing flow | All spelled out; "not spheres, not coins with holes" | Red cells as balls or donuts with holes; bubbles; no white cells/platelets |
| S6 plaque | Yellowish fatty build-up **inside the wall, under the lining**, bulging into the channel; blood squeezes past; not rubbish in the tube | "under the glistening lining, the lining stretches intact over the bulge" | Plaque drawn as debris or a clot; lining torn; full blockage |
| S6b device | A fine metal mesh tube on a balloon on a thin catheter; generic, no brand | Crimped mesh on a deflated balloon, guide wire ahead, unbranded | Needle-like tip; text or markings on the device |
| S7 stent open | Mesh expanded, pressing plaque against the wall, channel reopened; generic | "struts flat against the wall, plaque pressed back, catheter and balloon gone" | Stent floating free in the channel; stent struts melting; "healing glow" effects (implies an outcome) |
| F3, F7 beating | Calm, regular beat | "slow, calm, regular beat" | Frantic or irregular beating (reads as an attack) |

**Accuracy notes (illustrative licence, to be signed off by the clinic's doctor):**
- Scale is compressed: in a real coronary artery red cells are far too small to see at this framing. This is normal
  for medical animation but is part of why the label "Illustration for education only" is required.
- Real stent delivery runs over a guide wire; the facts table does not mention the wire. Included here as a hair-thin
  wire, and listed for the doctor's approval.
- We show no blood clot, no plaque rupture and no heart attack: the brief is narrowing → stent, kept calm.

---

## 4. Prompt package (live argument names checked 2026-10-12)

### 4.1 Live tool facts used (Kling MCP 1.3.3 `who_am_i`, Higgsfield `models_explore`)
- Kling call shape: `model`, `arguments: [{name, value}]` (all values strings), `inputs: [{name, inputType: "URL", url}]`.
- **Stills:** `text_to_image` `kling-image-v3_0_omni` (default model). Defaults to change: `aspect_ratio` default is
  `auto` → set `16:9`. `img_resolution` → `2k`.
- **Edits:** `image_to_image` `kling-image-v3_0_omni`, input `image_1`, prompt references it as `图片1`. Defaults to
  change: `img_resolution` default is **`4k`** and Kling video inputs must be **below 4K**, so set `2k`;
  `aspect_ratio` default `3:4` → set `16:9`. URLs from earlier Kling tasks can be used directly (the tool says so);
  `file_upload` is only needed for local files.
- **Films:** `image_to_video` `kling-video-v3_0`, inputs `first_image` + `tail_image`. It has **no `aspect_ratio`
  argument** (follows the first image). Defaults to change: `prefer_multi_shots` default **`true`** → `false`;
  `enable_audio` default `true` → `false`. `duration` allows 3–15. `resolution` `1080p`.
- **Kling links expire after 24 hours, stills included.** Either submit all films within 24 h of the stills, or copy
  every approved still into Higgsfield with `media_import_url` and use its permanent URL as `first_image`/`tail_image`
  (Kling accepts public URLs).
- **Higgsfield fallback** (`generate_video`, `params`): `kling_o3_flf` (`duration` 3–15, `mode` std/pro/4k,
  `sound` "off", `aspect_ratio` "16:9", `medias` roles `start_image` / `end_image`); `seedance_2_0` (`duration` 4–15,
  `resolution` "1080p", `mode` "std", `generate_audio` false, roles `start_image` / `end_image`);
  `cinematic_studio_3_0` (`resolution` "1080p", `generate_audio` false, roles `start_image` / `end_image`).
  `medias[].value` must be a Higgsfield media_id or job_id, never a URL: import the Kling stills with
  `media_import_url` first. Each Higgsfield call can be preflighted with `get_cost: true` (returns the price, submits
  nothing).

### 4.2 Stills (order of production: S1, S3 → QA → S2, S4, S5 → QA → S6 → S6b, S7 → QA)

Common arguments for all stills: `img_resolution: "2k"`, `aspect_ratio: "16:9"`, `imageCount: "1"` (S3: `"2"`, the
hero, two variants, pick the best against §3).

**S1 — the person** · `text_to_image` · `kling-image-v3_0_omni` · inputs: none
- Scene text: "A calm adult in their fifties sits upright in soft light against the dark clean void, framed from just
  below the chin to the waist so no face is visible, wearing a plain soft light-grey crew-neck t-shirt, shoulders
  relaxed, hands resting in the lap, breathing slowly. The chest is centred and fills the central third of the frame,
  with deep dark negative space on both sides. Cool key light from the upper left, a faint warm rim on the shoulders,
  50mm lens, eye level, calm and reassuring."
- Extras after NEG: "no face, no identifiable features, no tattoos, no jewellery, no logos or print on clothing, no
  hospital gown, no medical equipment."

**S2 — close on the chest** · `image_to_image` · `kling-image-v3_0_omni` · inputs: `image_1` = S1
- Scene text: "图片1: the same person, the same t-shirt, the same light and void. The camera has moved in close to the
  centre of the chest, just to the person's left of the breastbone; the soft fabric texture fills the central third of
  the frame. A very faint warm red glow is just visible through the fabric, as if the heart's light shines from within.
  85mm, shallow depth of field."
- Extras: S1 extras + "no transparency yet, no anatomy visible yet."

**S3 — the heart (hero, 2 variants)** · `text_to_image` · `kling-image-v3_0_omni` · inputs: none · `imageCount: "2"`
- Fully assembled prompt (the pattern for every other prompt):
  > Photoreal medical visualisation, the quality of a high-end medical animation studio: a dark clean void with soft
  > volumetric light, subsurface scattering on tissue, glossy wet surfaces, physically accurate anatomy, shallow depth
  > of field, slow graceful camera, clinical cool tones with warm red highlights, no text, no labels, no gore. A
  > photoreal adult human heart floating alone in the dark clean void, seen from the front, centred and filling the
  > central third of the frame. A four-chambered heart with the apex pointing down and towards the viewer's right
  > (the patient's left). The aorta rises from the top and arches up and back over towards the viewer's right, the
  > pulmonary trunk in front of it dividing in two; the great vessels fade softly into the darkness above, with no cut
  > ends. The coronary arteries run on the surface of the heart: the left anterior descending artery runs down the
  > front groove between the left and right ventricles towards the apex, the circumflex artery curves around the left
  > side in the groove below the left atrium, and the right coronary artery curves around the right side in the groove
  > between the right atrium and right ventricle, with thinner bluish-purple coronary veins running alongside. Deep red
  > glossy heart muscle with wet subsurface highlights, only a little pale fat along the grooves. Caught calmly
  > mid-beat. 85mm macro lens, key light from the upper left, warm red highlights against cool blue shadows. Avoid:
  > no blood spill, no open wounds, no surgical incisions, no needles, no syringes, no cartoon, no low-poly, no text,
  > no watermark, no extra organs, anatomically correct proportions, no symmetrical valentine heart shape, no ribs, no
  > lungs, no open chest, no cut vessel ends with blood, no extra vessels, no mirror-image anatomy.

**S4 — macro on the LAD** · `image_to_image` · `kling-image-v3_0_omni` · inputs: `image_1` = chosen S3
- Scene text: "图片1: the same heart, the same light, the same void. The camera has moved in close and slightly lower
  onto the front of the heart. The left anterior descending coronary artery now runs diagonally through the centre of
  the frame in its groove between the ventricles, with a coronary vein alongside; the glossy red heart muscle around it
  falls softly out of focus. The artery's wall is smooth, round and slightly translucent, so a faint flow of red can be
  sensed inside. 100mm macro, shallow depth of field, the artery inside the central third."
- Extras: "no artery floating off the surface, no cut, no blood outside the vessel, no yellow deposits."

**S5 — inside the healthy artery** · `text_to_image` · `kling-image-v3_0_omni` · inputs: none
- Scene text: "Inside a healthy coronary artery: a round tube seen straight down its length, the camera centred in the
  channel. The smooth glistening pale-pink inner lining curves all around, the muscular wall faintly visible as soft
  layers beyond it. Red blood cells, glossy deep red biconcave discs, tumble and drift in pale straw-coloured plasma
  along the channel towards the vanishing point, with a few larger pale white blood cells with softly textured
  surfaces and tiny platelets among them. Soft volumetric light glows from further down the vessel. Macro, deep
  perspective, the vanishing point at the centre of the frame."
- Extras: "no clots, no debris, no bubbles, red cells not spheres and not coins with holes, no branching maze, no veins."

**S6 — the narrowing** · `image_to_image` · `kling-image-v3_0_omni` · inputs: `image_1` = S5
- Scene text: "图片1: the same artery, the same light, the same cells. A little further along the channel, a smooth
  yellowish fatty plaque has built up inside the wall, under the glistening lining, on one side, forming a rounded
  bulge that narrows the channel; the lining stretches intact over the bulge. The red cells crowd together and squeeze
  through the narrower gap. Calm, educational, not frightening."
- Extras: "no blood clot, no rupture, no torn lining, no floating debris or rubbish, no complete blockage, no pus, no ulcer."

**S6b — device in place** · `image_to_image` · `kling-image-v3_0_omni` · inputs: `image_1` = S6
- Scene text: "图片1: the same narrowed artery, the same light and cells, the plaque and lining unchanged. A thin smooth
  catheter has arrived along the channel from behind the camera, a hair-thin guide wire running ahead through its
  centre. Positioned exactly across the narrowing it carries a deflated balloon with a fine silver metal mesh stent
  crimped tightly around it. A generic, unbranded device."
- Extras: "no needle, no sharp tip, no brand names, no markings or text on the device, no X-ray look, no hands, no surgeon."

**S7 — stent open, flow restored** · `image_to_image` · `kling-image-v3_0_omni` · inputs: `image_1` = S6 (not S6b:
keeps the channel clean of the catheter)
- Scene text: "图片1: the same artery, the same light and cells. The narrowing has been reopened by a fine silver metal
  mesh stent, now fully expanded and pressed into the artery wall, its diamond-pattern struts lying flat against the
  lining, the yellowish plaque pressed back flat into the wall behind the mesh. The channel is round and open again and
  the red cells flow freely through it. No catheter, no balloon. Calm, clear, educational."
- Extras: "no balloon, no catheter, no damage to the wall, no clot, no glowing or sparkling healing effects."

### 4.3 Films (all `image_to_video` · `kling-video-v3_0`)

Common arguments: `resolution: "1080p"`, `prefer_multi_shots: "false"`, `enable_audio: "false"`, `imageCount: "1"`.
Prompt = `<LB> <move text> Avoid: <NEG> <extras>`. Every move text ends with: "One continuous shot, no cut, no fade,
starts exactly on the first frame and ends exactly on the last frame."

| Leg | inputs | duration | Move text | Extras |
|---|---|---|---|---|
| F1 | first_image S1, tail_image S2 | "5" | The person breathes slowly and calmly while the camera glides gently forward and slightly down towards the centre of the chest; at the very end a faint warm red glow appears through the fabric, just to the person's left of the breastbone. | no face, no sudden move, no zoom jump |
| F2 | S2 → S3 | "10" | The fabric and skin slowly turn translucent like frosted glass; soft pale silhouettes of the breastbone and ribs appear, then gently dissolve as the camera glides forward through them towards the warm glow; the beating heart emerges and is left floating alone in the dark void. Slow, even, graceful. | no cut-open chest, no skin peeling, no blood, no skeleton face, no X-ray look |
| F3 | S3 → S4 | "5" | The heart beats with a slow, calm, regular rhythm while the camera orbits about 20 degrees and slowly pushes in onto the left anterior descending artery in its groove on the front of the heart. The heart keeps its exact anatomy. | no frantic or irregular beating, no shape change, no extra vessels |
| F4 | S4 → S5 | "5" | The camera pushes into the artery; its wall becomes translucent and the camera passes smoothly through it into the channel, turning to look down its length as red blood cells stream past, pulsing gently with the heartbeat. | no tearing, no puncture, no bleeding |
| F5 | S5 → S6 | "5" | The camera travels slowly forward along the channel with the flowing cells, pulsing gently with the heartbeat, until a smooth yellowish bulge under the intact lining comes into view on one side and the flow squeezes past it. | no clot, no rupture, no debris, no alarming flashes |
| F6a | S6 → S6b | "5" | A thin smooth catheter, a hair-thin guide wire ahead of it, glides gently in along the channel from behind the camera and comes to rest across the narrowing; blood keeps flowing around it. The camera holds steady. | no needle, no sharp tip, no markings, no hands |
| F6b | S6b → S7 | "10" | The balloon slowly inflates and the fine metal mesh stent expands evenly with it, pressing the plaque back into the artery wall. Then the balloon gently deflates and the catheter and wire withdraw back out of frame towards the camera, leaving the expanded stent in the wall. The channel is round and open, and the red cells flow freely through it again. Slow, smooth, mechanical; the stent struts stay rigid and keep their exact pattern. | no sparks, no explosion, no melting mesh, no healing glow, no brand |
| F7a | S7 → S3 | "5" | The camera pulls slowly back out of the open artery, through its translucent wall, and keeps pulling back until the whole heart is seen beating calmly in the dark void. | as F3 |
| F7b | S3 → S1 | "10" | The camera keeps pulling back from the beating heart; soft pale ribs and the breastbone form around it, then skin and fabric become opaque again as the warm glow fades, revealing the calm person breathing softly in soft light. | no face, no cut-open chest, no skeleton face |

**If a Kling leg fails twice** (runbook step 4.5): the same two stills on Higgsfield `kling_o3_flf`
(`mode: "pro"`, `sound: "off"`, `aspect_ratio: "16:9"`, same `duration`, same prompt, `medias: [{role:
"start_image", value: <media_id of first still>}, {role: "end_image", value: <media_id of tail still>}]`), then
`seedance_2_0` (`resolution: "1080p"`, `mode: "std"`, `generate_audio: false`, same roles). Preflight each with
`get_cost: true` first.

**Zero-credit alternative for F7b:** play reversed copies of F2 then F1 (the same frames backwards end exactly on
S1). Saves ~100 Kling credits; costs some heart-beat-in-reverse risk and needs the builder to host the reversed
files. Default plan generates F7b; decide after QA of F1/F2.

### 4.4 Keeping the files
- Every Kling task id goes into the table below the moment it is submitted. Never regenerate before re-querying it.
- Each final clip: Higgsfield `media_import_url` (`type: "video"`, Kling's `urlWithoutWatermark`) → permanent URL from
  `show_medias`. Each approved still: same, `type: "image"` (they are the posters and the chain inputs).

| Item | Kling task id | Higgsfield media_id | Permanent URL | QA |
|---|---|---|---|---|
| S1 … S7, S6b | (none yet: dry run) | | | |
| F1 … F7b | (none yet: dry run) | | | |

---

## 5. Medical rules applied

**Source status:** `60_Skill_Packs/Cinematic_Director/04_Medical_Rules_SG.md` **does not exist** in the vault (not
even as a placeholder; the index and the agent file both link to it). The rules below come from
`02_Medical_Anatomy_Films.md`, doctrine §11 and `10_Agents/06_Medical_3D_Web.md`. The Singapore framework named here
(the Healthcare Services Act 2020 and its advertisement regulations from MOH, and the Singapore Medical Council's
Ethical Code and Ethical Guidelines on publicity) must be checked against the current official text before any real
clinic goes live: **[VERIFY: current MOH / SMC text not yet in the vault]**.

**On the site, every film:**
- Label **"Illustration for education only"** visible over or directly under the film at all times (HTML, not baked in).
- Captions in HTML only, every one `[VERIFY WITH CLINIC]` until the doctor signs off.
- A demo banner: "DEMO — fictional clinic, not a real medical provider" (this test only).

**Never shown or said (applied in prompts and captions):**
- No outcomes, before/after framing, success rates, "best", "painless", "safe", "guaranteed", "cure", "restores your
  heart", recovery times, prices, testimonials.
- No invented doctor, name, face, credential, qualification or hospital affiliation (`[DOCTOR NAME — CLINIC TO PROVIDE]`).
- No needles, syringes, injection points, catheter entry site (wrist or groin), cath-lab or operating theatre, X-ray /
  angiogram imagery, dosage or procedure steps beyond the generic mechanism the clinic states it offers.
- No blood clot, plaque rupture, heart attack, dying muscle, flat-line ECG, alarming flashes; nothing gory or frightening.
- No brand-name devices or markings on the stent, balloon or catheter.
- No identifiable patient face.

**Doctor sign-off (the gate before anything goes live):**

| Item | Who signs | Status |
|---|---|---|
| S1–S7 stills (anatomy as drawn, incl. guide wire and scale licence) | Clinic's cardiologist `[DOCTOR NAME — CLINIC TO PROVIDE]` | Not started |
| F1–F7b films | same | Not started |
| Every caption and the CTA wording | same | Not started |
| Publishing the site | Clinic's doctor + Ryan | Not started (demo is never published to a live domain) |

---

## 6. Lovable hand-off list (what the builder gets after production)

The director produces assets only. Lovable builds the clinic site; nothing is published without Ryan.

**Build rules for the film:**
- One pinned full-screen stage holding all 7 scenes back to back, scroll-scrubbed forward and backward (doctrine §5,
  §23). No black, fade or gap between scenes; every scene ends on the next scene's first frame.
- Scrub frames, not `<video>` seeking (backward video seeking stutters on phones): extract frames per leg (≈96 per 5 s,
  120 per 10 s, per `site-kit/README.md`), WebP, smaller set for phones. **Who extracts frames for a Lovable build is
  not defined in the notes (see training feedback)**; until then, Lovable is given the MP4s and the frame counts.
- Phone: the 16:9 film is centre-cropped to 9:16 and fills the screen (every scene is composed for this); copy sits
  at the bottom over a tint. Reduced motion: the posters (S1, S3, S5, S6, S7) as static steps with captions.
- Copy chapters alternate left/right on desktop (dark void zones are left in every frame).

**Asset list:**

| Site scene | Film legs (permanent URL) | Poster | Scroll length | Chapter copy (all placeholder) |
|---|---|---|---|---|
| 1 | F1 | S1 | ≈240vh, chapter at rest (`data-from="0"`) | Kicker "I · Your heart" · Title `[VERIFY WITH CLINIC]` · Line: "Why heart health matters, and who the clinic helps [VERIFY WITH CLINIC]" · CTA: "Book a heart screening [VERIFY WITH CLINIC]" |
| 2 | F2 | S2 | ≈320vh | "II · Inside" · "A look inside the chest [VERIFY WITH CLINIC]" |
| 3 | F3 | S3 | ≈240vh | "III · The heart's own arteries" · "How the coronary arteries feed the heart muscle [VERIFY WITH CLINIC]" |
| 4 | F4 | S4 | ≈240vh | "IV · Blood flow" · "Red cells carry oxygen through the artery [VERIFY WITH CLINIC]" |
| 5 | F5 | S6 | ≈240vh | "V · Narrowing" · "How fatty build-up in the wall can narrow an artery (illustrative) [VERIFY WITH CLINIC]" |
| 6 | F6a + F6b (two legs, one scene) | S7 | ≈400vh | "VI · Angioplasty and stenting" · "How a stent can hold a narrowed artery open (illustrative) [VERIFY WITH CLINIC]" |
| 7 | F7a + F7b (two legs, one scene) | S1 | ≈400vh | "VII · Back to you" · "Heart screening at the clinic [VERIFY WITH CLINIC]" · CTA: "Book a heart screening [VERIFY WITH CLINIC]" |

Plus, for every scene: the label "Illustration for education only"; the demo banner; the doctor sign-off gate.

**media.json skeleton** (only if the Website Build Worker's site kit is used instead of Lovable; filled after production):
```json
{ "films": [
  { "id": "scene1", "src": "<F1 permanent URL>", "crop": "none", "frames": 96 },
  { "id": "scene2", "src": "<F2 permanent URL>", "crop": "none", "frames": 120 },
  { "id": "scene3", "src": "<F3 permanent URL>", "crop": "none", "frames": 96 },
  { "id": "scene4", "src": "<F4 permanent URL>", "crop": "none", "frames": 96 },
  { "id": "scene5", "src": "<F5 permanent URL>", "crop": "none", "frames": 96 },
  { "id": "scene6", "src": ["<F6a permanent URL>", "<F6b permanent URL>"], "crop": "none", "frames": 216 },
  { "id": "scene7", "src": ["<F7a permanent URL>", "<F7b permanent URL>"], "crop": "none", "frames": 216 }
] }
```
(`crop: "none"` because the permanent copies are made from Kling's `urlWithoutWatermark`. Frame counts for two-leg
scenes are 96 + 120; confirm the kit sums legs this way.)

---

## 7. Cost card (balances checked live 2026-10-12)

| Account | Plan | Balance |
|---|---|---|
| Kling | Pro (SVIP) | **1,508 credits** |
| Higgsfield | Plus | **1,000 credits** |

**Every figure below is an ESTIMATE.** `06_Prompt_Log.md` has no measured cost for any model yet, so these are
planning figures (stills ≈6 credits each, range 1–10; Kling 3.0 1080p silent film ≈10 credits per second, range
7–15). They will be replaced by measured figures after the measurement run.

| Item | Tool / model | How many | Credits (estimate) | Why | If we skip it |
|---|---|---|---|---|---|
| Stills S1, S5 (text) | Kling `text_to_image` v3_0_omni 2K | 2 | ~12 | Keyframes for the person and the inside of the artery | No film |
| Hero still S3, 2 variants | same | 2 | ~12 | The heart is the riskiest anatomy: pick the better one | Higher risk of a wrong heart |
| Edit stills S2, S4, S6, S6b, S7 | Kling `image_to_image` v3_0_omni 2K | 5 | ~30 | Edits keep the same heart/artery between scenes | Scenes drift apart |
| Films F1, F3, F4, F5, F6a, F7a (5 s) | Kling `image_to_video` v3_0 1080p, first+tail, silent | 6 × 5 s | ~300 | The journey | No film |
| Films F2, F6b, F7b (10 s) | same | 3 × 10 s | ~300 | Threshold, stent, back out | Skip F7b → reversed F2+F1 saves ~100 |
| Contingency: one re-roll each for F2, F6b, F7b + 2 stills | Kling | — | ~310 | The three hardest moves | A failed scene waits for a new approval |
| Permanent copies | Higgsfield `media_import_url` / `show_medias` | 17 files | 0 expected (not measured) | Kling links expire in 24 h | Links die; the site breaks |
| Fallback films (only if Kling fails twice) | Higgsfield `kling_o3_flf` pro / `seedance_2_0` 1080p | 0 planned | unknown: preflight with `get_cost` | Plan B | — |
| **Total planned** | | | **~654 Kling** (~964 with contingency) · **0 Higgsfield** | | |

**Proposed measurement run (first step, ~70 Kling credits estimated, all of it reused in the final film):**
1. Read the Kling balance.
2. S3 hero (`text_to_image`, 2 variants) → read balance → cost per still.
3. S4 (`image_to_image` of the chosen S3) → read balance → cost per edit.
4. F3 (`image_to_video` v3_0, 5 s, 1080p, first S3 + tail S4, silent) → read balance → cost per 5 s film.
5. Higgsfield `generate_video` with `get_cost: true` for `kling_o3_flf` (pro, 5 s) and `seedance_2_0` (1080p, 5 s):
   free preflight, nothing is submitted.
6. Write all five figures into `06_Prompt_Log.md` "Measured costs", re-quote this card from them, then ask for the
   full budget.

**What I need from Ryan:**
- `APPROVED by Ryan: up to 70 Kling credits / 0 Higgsfield credits` for the measurement run (it also gives us the
  heart to judge the look); then the full budget, suggested **up to 1,000 Kling credits / 200 Higgsfield credits**
  (the Higgsfield part only for fallbacks).
- For a real clinic: the doctor's name for sign-off, the services list in their words, and any images or reference
  material they want us to follow.

---

## 8. QA plan (from `05_QA.md`; to be run on production)
- Stills: look bible identical; anatomy per §3; no gore, needles, text, extra organs; 9:16 centre crop keeps the subject.
- Films: first frame = first still, last frame = tail still (pause on both ends); no melting, no new parts, no
  flicker; readable when scrubbed backward; no black frames, cuts or fades; no watermark (or `crop: "kling"`); each
  leg's last frame = next leg's first frame.
- Before hand-off: permanent URLs kept; "Illustration for education only" noted; captions `[VERIFY WITH CLINIC]`;
  doctor approval listed as the gate; credits used vs the approved budget; `06_Prompt_Log.md` updated.
- Rating BLOCKER / HIGH / MEDIUM / POLISH. Known HIGH risks before we start: mirror-image heart (S3), red cells drawn
  as spheres (S5), F6b doing too much in one move, F7b morph looking like a cross-dissolve.
