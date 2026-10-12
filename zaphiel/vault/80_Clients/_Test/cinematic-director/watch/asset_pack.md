---
tags: [zaphiel, cinematic, test, dry-run, watch]
project: DEMO Maison Horlogère (fictional, training test A)
status: PLAN ONLY. Not approved. Nothing generated, no credits spent.
date: 2026-10-12
director: cinematic-director
---
# DEMO Maison Horlogère: asset pack (dry run)

> **DEMO / training test.** Maison Horlogère is a fictional brand and has no real customer. Nothing in this pack has
> been generated. Every credit figure is an **estimate** unless marked **measured**. Production starts only on
> "APPROVED by Ryan: up to N Kling credits / M Higgsfield credits".

## 0. What the visitor sees (plain English)
A steel dive watch sits on black stone in the dark, with one hard strip of light.
1. **Reveal:** the light sweeps on and the watch appears.
2. **Split:** as you scroll down, the crystal lifts off, then the bezel, then the three hands, each floating on its
   own layer above the dial. The crown slides out and the bracelet halves slide away.
3. **Macro:** the camera rises into the floating layers until the hands hover over the dial in close-up.
4. **New angle:** the camera pulls back and the floating watch is now standing upright, facing you.
5. **Reassembly:** every part glides back into place at this new angle.
6. **Call to action:** one slow sweep of light across the finished watch while the call-to-action card appears.

Scroll up and every step plays backwards. **One thing to know:** scrolling up from the call to action first takes the
watch apart again at the new angle (scene 5 played backwards), then it goes back together in scene 2 played
backwards. Every reversible film with a second reassembly beat works this way.

## 1. Look bible (word for word at the start of every prompt)
**LB:** "Photoreal luxury product photography with Apple-level restraint: a stainless-steel dive watch on a slab of
honed black basalt in a pitch-black studio. One hard vertical strip light from camera-left is the only light. It
draws a single clean white highlight down the polished steel and across the sapphire crystal, with one soft
reflection on the stone. Deep true blacks, no fill light, no haze, no fog. 100mm macro lens look, crisp focus,
neutral cool steel tones with a faint champagne warmth in the brightest highlights."

**WD (watch description, also word for word in every still prompt):** "a stainless-steel dive watch with a brushed and
polished case, a unidirectional bezel with a black ceramic insert marked only with minute ticks and one luminous
pip at 12, a matte black dial with applied round luminous hour markers and no text, broad sword hour and minute
hands and a lollipop seconds hand set at 10:10, a screw-down crown at 3 o'clock, and a brushed three-link steel
bracelet."

- **One light only.** Ryan's brief says one hard strip light. The recipe's "warm rim" would be a second light, so it is
  left out.
- **No text and no logo are generated.** A real client's logo and dial text only ever come from their own photos.

## 2. Parts that separate (accuracy, doctrine §8)
The demo separates **only the visible exterior parts every steel dive watch really has**. There are 9 visible pieces:

| # | Part | Moves | Order out (scroll down) |
|---|---|---|---|
| 1 | Sapphire crystal | straight up along the watch axis, furthest | 1st |
| 2 | Bezel with ceramic insert | up, below the crystal | 2nd |
| 3 | Seconds hand | up, top of the hands | 3rd |
| 4 | Minute hand | up, middle | 3rd (hands move as one group, staggered slightly) |
| 5 | Hour hand | up, lowest, just above the dial | 3rd |
| 6 | Crown | short slide straight out to the right | 4th |
| 7, 8 | Bracelet halves | slide apart along the stone, out of frame top and bottom | 4th |
| 9 | Case with dial seated in it | **anchor, never moves** | — |

- **No movement, no gears, no case back.** The dial stays seated in the case, so the inside of the case is never
  seen and nothing has to be invented.
- **With a real client:** a movement layer or a dial layer is added **only** if the client supplies photos or a spec
  of the actual calibre, or the brand's own exploded render or CAD.

## 3. Storyboard and shot packages

**Keyframe stills.** All stills are 16:9 at 2K and have identical pixel size, because Kling `kling-video-v3_0` has no
aspect argument and the film takes its shape from `first_image`.

| Still | What it is | How it is made | Real-client replacement |
|---|---|---|---|
| **K1** Hero A | Assembled, lying dial-up, high three-quarter view | `text_to_image` | **Client's hero product photo**, put into the look bible with an `image_to_image` edit (never redrawn) |
| **K0** Low-key | K1 with the light almost off | edit of K1 | edit of the client-based K1 |
| **K3** Exploded A | K1 with the parts separated vertically | edit of K1 | edit of the client-based K1. The brand's exploded render or component photos go in as `image_2` if they exist |
| **K4** Macro | close view down the stack: hands hovering over the dial | edit of K3 | edit of the client-based K3. A client macro of the dial goes in as `image_2` |
| **K6** Hero B | Assembled, standing upright facing the camera, low front three-quarter view, crown catching light | edit of K1 | **client's second-angle photo** (front or crown side), put into the look bible |
| **K5** Exploded B | K6 with the parts floating in front of the dial along the axis towards the camera, same order as K3 | edit of K6 with K3 as the second reference | edit of the client-based K6 + K3 |

**The chain:** S1 K0→K1 · S2 K1→K3 · S3 K3→K4 · S4 K4→K5 · S5 K5→K6 · S6 K6→(free end). Each scene's tail still is
the next scene's first still, and it is the same file.

**Engine (doctrine §3):** SCROLL_SCRUB_VIDEO. One `.film-sequence` in the site kit, frame sequences cut from each film.
**Phone:** the kit uses the same 16:9 film on phones and crops it to fill the screen (`film.js` cover fit). On a
9:16 to 9:19.5 phone only the **centre 26–32 % of the frame width** survives. Therefore every key action stays
inside the **phone-safe column** (centre 26 % of width) and between 8 % and 74 % of frame height. The bottom 26 % is
the phone copy zone and holds only stone and shadow.

### Shot packages (doctrine §22)
All six films use the same settings:
- **Look:** grade = LB.
- **Aspect:** 16:9 master, with the phone crop handled by composition.
- **Safe text zone:** desktop left or right third (copy alternates). On phones the copy sits in the bottom 26 %.
- **Continuity:** same WD, hands at 10:10 throughout (S6 excepted).
- **No copy baked into footage.**

**S1: Reveal**
- **Chapter / purpose:** I · opening; the "how did they do that" first five seconds.
- **Subject / action:** the watch is revealed by the strip light coming up.
- **Start / end:** K0 → K1.
- **Camera / lens:** locked-off, 100mm look, high three-quarter view about 45° above.
- **Light:** the strip light rises from a thin line to full, and its highlight travels down the case.
- **Movement / speed:** light only; the watch does not move. Slow.
- **Duration:** 5 s.
- **Negatives:** no camera move, no flare bloom, no second light, no text.

**S2: Split (the key film; played backwards = reassembly)**
- **Chapter / purpose:** II · the watch comes apart.
- **Subject / action:** parts 1–8 separate in the order in §2. The case is the anchor.
- **Start / end:** K1 → K3.
- **Camera:** **locked-off**. K3 is the same angle as K1, so there is no orbit.
- **Light:** constant.
- **Movement / speed:** slow, weighted, mechanical. Every part travels on one axis without rotating.
- **Duration:** 5 s.
- **Negatives:** "explodes", sparks, debris, smoke, melting, extra parts, gears, screws, rotating parts.

**S3: Macro dive**
- **Chapter / purpose:** III · craft detail.
- **Subject / action:** the camera rises and pushes in along the stack axis until the hovering hands and dial fill
  the frame. The parts stay frozen in the air.
- **Start / end:** K3 → K4.
- **Camera:** push-in plus a small rise (one combined move along the axis).
- **Light:** the strip highlight runs along the hand edges.
- **Duration:** 5 s.
- **Negatives:** parts moving, rotating, drifting; focus pumping; extra parts.

**S4: New angle**
- **Chapter / purpose:** IV · the watch turns to face you.
- **Subject / action:** the camera pulls back out of the macro and settles low and in front. The floating stack is
  now in front of the upright watch standing on the stone. The macro framing (no stone visible) hides the change of
  orientation.
- **Start / end:** K4 → K5.
- **Camera:** pull-back, settling into the low front three-quarter view.
- **Light:** constant.
- **Duration:** 5 s.
- **Negatives:** parts moving relative to each other, spinning, morphing, a cut, a flash.
- **Risk:** highest of the six films (see the fallback below).

**S5: Reassembly at the new angle**
- **Chapter / purpose:** V · made whole.
- **Subject / action:** the parts glide back into the case in reverse order: hour hand first, then minute and
  seconds, then the bezel, and the crystal last; the crown slides home.
- **Start / end:** K5 → K6.
- **Camera:** locked-off.
- **Light:** constant.
- **Duration:** 5 s.
- **Negatives:** the same as S2.

**S6: Call to action**
- **Chapter / purpose:** VI · payoff + CTA.
- **Subject / action:** the strip light glides once across the case and crystal, and the seconds hand sweeps. Nothing
  else moves.
- **Start / end:** K6 → no tail (the last scene has no `tail_image`).
- **Camera:** locked-off.
- **Duration:** 5 s.
- **Negatives:** camera move, new objects, hands other than the seconds hand moving.

**Fallback if S4 fails twice:** cut S3 and S4 and replace them with one film, K3→K5: "the floating stack slowly turns
upright in the air to face the camera". It is a rigid move of the whole assembly, and the parts keep their spacing.
That gives 5 scenes and saves 40 credits. If that fails too, run the same keyframes on Higgsfield (§5).

**Deviation from doctrine §8, on purpose.** §8 orders the scenes reveal → macro → rotation → separation → reassembly
at an alternate hero. Here the macro and the rotation happen **inside the exploded state** (S3, S4). Two reasons:
- A macro before the split would need a dead "pull back to the same hero" move.
- The macro between floating layers is the strongest wow moment.

The §8 end state (an assembled alternate hero + CTA at p = 1) is kept.

## 4. Where each film sits on the site (site kit, one `.film-sequence`)

| Scene | `data-film` | `data-length` | Chapter side | `data-from`–`data-to` | Copy (placeholders only) |
|---|---|---|---|---|---|
| S1 | `scene1` | 240 | left | 0 – 0.85 (visible at rest) | kicker "Maison Horlogère · DEMO", title `[HERO LINE — CLIENT]`, line `[ONE LINE — CLIENT]` |
| S2 | `scene2` | 240 | right | 0.15 – 0.9 | "II · Taken apart" `[TITLE]` `[LINE]` |
| S3 | `scene3` | 240 | left | 0.15 – 0.9 | "III · The detail" `[TITLE]` `[LINE]` |
| S4 | `scene4` | 240 | right | 0.15 – 0.9 | "IV · A new angle" `[TITLE]` `[LINE]` |
| S5 | `scene5` | 240 | left | 0.15 – 0.9 | "V · Made whole" `[TITLE]` `[LINE]` |
| S6 | `scene6` | 240 | right, `glass` card | 0.2 – 1 | CTA button `[CTA — CLIENT, e.g. book a private viewing]`. The CTA is DOM, never baked into the film |

- **Scroll length:** 6 × 240 = 1,440vh. `data-dissolve="0.06"` (the default). No `data-zoom`.
- **Specs:** no specs (depth rating, calibre, price) appear anywhere unless the client supplies them, as
  `[CLIENT TO PROVIDE]`. Generated footage is labelled "Illustrative".
- **Reduced motion:** the kit shows each film's first frame as the poster. The S1 poster is the low-key K0, which is
  why K0 keeps the silhouette readable. Builder note: use K1 as the S1 poster if the kit allows an override.

**media.json (draft; URLs filled after production):**
```json
{ "films": [
  { "id": "scene1", "src": "<permanent Higgsfield URL of S1>", "crop": "none", "frames": 96 },
  { "id": "scene2", "src": "<…S2>", "crop": "none", "frames": 96 },
  { "id": "scene3", "src": "<…S3>", "crop": "none", "frames": 96 },
  { "id": "scene4", "src": "<…S4>", "crop": "none", "frames": 96 },
  { "id": "scene5", "src": "<…S5>", "crop": "none", "frames": 96 },
  { "id": "scene6", "src": "<…S6>", "crop": "none", "frames": 96 } ] }
```
- **`crop` must be written out as `"none"`.** `scripts/media.mjs` defaults a missing `crop` to `"kling"` and would trim
  3 % off a clean clip.

## 5. Prompt package (live argument names, checked 2026-10-12)
- **Kling MCP version:** `who_am_i` returned mcpVersion 1.3.3 and said "tool list updated, reconnect". All Kling
  values are strings.
- **One `taskTraceId`:** use a single UUID v7 for the whole project.
- **No model has a negative-prompt argument** (Kling or Higgsfield). The "Negatives" line below is appended to the
  end of each prompt as plain "No …" sentences.

### Stills

**K1 Hero A**
- **Tool / model:** `mcp__kling__text_to_image`, model `kling-image-v3_0_omni`.
- **Arguments:** `prompt`, `img_resolution` "2k", `aspect_ratio` "16:9", `imageCount` "2" (two variants, pick one
  against QA).
- **Inputs:** none.
- **Prompt:** "LB + WD, lying dial-up on the stone, seen from a high three-quarter angle about 45 degrees above. The
  case sits in the horizontal centre of the frame at about 60 % of the frame height and fills about one fifth of the
  frame width. The bracelet runs out of frame at the top and bottom. Wide empty black space to the left and right,
  and empty black above the watch."
- **Negatives:** "No text, no logo, no numerals, no people, no props, no second light, no studio reflections, no
  haze."
- **Fallback:** `gemini-3-pro-image` (arguments `prompt`, `img_resolution` "2k" (required), `aspect_ratio` "16:9",
  **`image_count`** "2").

**K0 Low-key**
- **Tool / model:** `mcp__kling__image_to_image`, model `kling-image-v3_0_omni`.
- **Arguments:** `prompt`, `img_resolution` **"2k"** (default is 4k), `aspect_ratio` **"16:9"** (default is 3:4),
  `imageCount` "1".
- **Inputs:** `image_1` = K1, the Kling task URL. The tool says prior Kling URLs can be used directly. If it is
  refused, download K1 and use `file_upload`.
- **Prompt:** "LB. 图片1, exactly the same watch, same position, same camera and framing, but the strip light is almost
  off. The scene is near-black. Only a thin line of light catches the edge of the bezel and the top of the crown, and
  the silhouette of the watch is just readable against the stone. Nothing else changes."
- **Negatives:** "No new objects, no text, no change to the watch."

**K3 Exploded A**
- **Tool / model:** `image_to_image`, `kling-image-v3_0_omni`.
- **Arguments:** `img_resolution` "2k", `aspect_ratio` "16:9", `imageCount` "2".
- **Inputs:** `image_1` = K1.
- **Prompt:** "LB. 图片1: the same watch, same camera angle, same framing, same single strip light, shown as a precise
  exploded view along one vertical axis. The steel case with its dial stays exactly where it is on the stone.
  Directly above it, evenly spaced and perfectly aligned with the case, float in order from lowest to highest: the
  hour hand, the minute hand, the seconds hand, the bezel with its ceramic insert, and the sapphire crystal highest
  of all. The crown has slid a short distance straight out to the right of the case. The two halves of the bracelet
  have slid apart along the stone, away from the case, towards the top and bottom edges of the frame. Every part is
  identical in shape, finish and colour to 图片1, rigid, not rotated. The whole stack stays in the centre fifth of the
  frame width, between 8 % and 74 % of the frame height."
- **Negatives:** "No extra parts, no gears, no screws, no movement, no case back, no text, no labels, no sparks, no
  debris, no smoke."
- **Fallback:** `gemini-3-pro-image` image_to_image (`image_1` = K1, `img_resolution` "2k", `aspect_ratio` "16:9",
  `image_count` "2") or `gpt-image2` (note: no hyphen before 2 in image_to_image; `quality` "high").

**K6 Hero B**
- **Tool / model:** `image_to_image`, `kling-image-v3_0_omni`.
- **Arguments:** "2k", "16:9", `imageCount` "2".
- **Inputs:** `image_1` = K1.
- **Prompt:** "LB. 图片1: exactly the same watch, now standing upright on the black stone with the dial facing the
  camera, the bracelet closed in a loop behind it as on a display. Seen from a low front three-quarter angle slightly
  to the left, so the crown at 3 o'clock catches the strip light. The case sits in the horizontal centre at about
  55 % of the frame height and fills about one fifth of the frame width. The same single hard strip light from
  camera-left draws one clean highlight down the case side and across the crystal. Empty black space left and right.
  Same finish, hands at 10:10."
- **Negatives:** "No text, no logo, no extra objects, no change to the watch design."

**K4 Macro**
- **Tool / model:** `image_to_image`, `kling-image-v3_0_omni`.
- **Arguments:** "2k", "16:9", `imageCount` "1".
- **Inputs:** `image_1` = K3.
- **Prompt:** "LB. 图片1: the same exploded watch, identical parts and spacing, frozen in the air. The camera has moved
  close and looks almost straight down the axis of the stack, slightly off-axis. The matte black dial with its
  luminous markers fills the lower two-thirds of the frame. The hour, minute and seconds hands hover above it in
  three layers. The underside of the bezel and the edge of the sapphire crystal are soft and out of focus at the top
  of the frame. No stone is visible, only black around the dial. The strip light draws one bright line along the
  polished edges of the hands. Shallow depth of field, focus on the minute hand."
- **Negatives:** "No extra parts, no gears, no text, no logo, no numerals."

**K5 Exploded B**
- **Tool / model:** `image_to_image`, `kling-image-v3_0_omni`.
- **Arguments:** "2k", "16:9", `imageCount` "2".
- **Inputs:** `image_1` = K6, `image_2` = K3.
- **Prompt:** "LB. 图片1 with its parts separated exactly like 图片2, keeping the same camera, framing and light as
  图片1. The case with its dial and the bracelet stay exactly as in 图片1. In front of the dial, along the axis
  pointing towards the camera, float evenly spaced and perfectly aligned: the hour hand nearest the dial, then the
  minute hand, the seconds hand, the bezel with its ceramic insert, and the sapphire crystal nearest the camera. The
  gap between layers is about one third of the case diameter. The crown has slid a short distance straight out to the
  right. Every part is identical to 图片2, rigid, not rotated, and the whole stack stays inside the centre quarter of
  the frame width."
- **Negatives:** "No extra parts, no gears, no movement, no text, no sparks, no debris."

**Phone check on every still:** crop the centre 26 % column. Each still passes only if the action is inside it (§7).

### Films

The same settings are used for every film on Kling:
- **Tool / model:** `mcp__kling__image_to_video`, model **`kling-video-v3_0`**.
- **Arguments:** `prompt`, `duration` "5", `resolution` "1080p", `imageCount` "1", **`prefer_multi_shots` "false"**
  (the live default is "true"), **`enable_audio` "false"** (the live default is "true" and costs +50 %).
- **Inputs:** `first_image` and `tail_image` as Kling task URLs, both `inputType` "URL".

| Film | `first_image` | `tail_image` | Prompt (LB prepended) | Negatives (appended) |
|---|---|---|---|---|
| S1 | K0 | K1 | "Locked-off camera. The single strip light slowly brightens from a thin line, and its highlight travels down the polished case and across the sapphire crystal until the watch is fully revealed. The watch does not move." | "No camera movement, no second light, no lens flare, no text." |
| S2 | K1 | K3 | "Locked-off camera. The watch comes apart in a slow, precise sequence: the sapphire crystal lifts straight up first, then the bezel, then the seconds, minute and hour hands rise one after another, each gliding on its own layer along one vertical axis, perfectly aligned. The crown slides out to the right and the bracelet halves slide apart along the stone. The case stays still. Smooth, weighted, mechanical; every part rigid and keeps its exact shape." | "No rotation of the parts, no explosion, no sparks, no debris, no smoke, no melting, no new parts." |
| S3 | K3 | K4 | "The floating parts hold perfectly still in the air. The camera rises and glides slowly forward along the axis of the stack until the hovering hands and the dial fill the frame; the strip light slides along the polished hand edges. Smooth, slow, weighted." | "No part moves or rotates, no new parts, no focus pumping." |
| S4 | K4 | K5 | "The floating parts hold their spacing. The camera pulls slowly back out of the close-up and settles low in front, revealing the separated parts floating in front of the upright watch on the black stone. One continuous, smooth, weighted camera move." | "No parts spinning, no morphing, no cut, no flash, no new parts." |
| S5 | K5 | K6 | "Locked-off camera. The parts glide back into the watch in a slow, precise sequence along one axis: the hour hand settles first, then the minute and seconds hands, then the bezel, and the sapphire crystal seats last; the crown slides home. Every part rigid, perfectly aligned. Smooth, weighted, mechanical." | "No rotation of the parts, no sparks, no debris, no melting, no new parts." |
| S6 | K6 | (none) | "Locked-off camera. The strip light glides slowly once across the case and crystal from left to right; the seconds hand sweeps smoothly. Nothing else moves." | "No camera movement, no new objects, no other hands moving, no text." |

### Higgsfield fallback (only when a Kling film fails twice)
- **Step 1, import:** bring the two Kling keyframes in with `mcp__higgsfield__media_import_url` (`url`, `type`
  "image"). This gives `media_id`s, because `generate_video` `medias[].value` will not take https URLs.
- **Step 2, get the price for free:** `mcp__higgsfield__generate_video` with `params.get_cost: true` returns the credit
  cost without submitting a job. Run it before any fallback.
- **The three fallback models:**
  - `kling_o3_flf`: `params` = `model`, `prompt`, `duration` 5, `mode` "pro", **`sound` "off"** (default "on"),
    `multi_shots` false, `aspect_ratio` "16:9", and `medias` [{role `start_image`}, {role `end_image`}].
  - `seedance_2_0`: `resolution` "1080p", `mode` "std", **`generate_audio` false** (default true), `duration` 5,
    `aspect_ratio` "16:9", the same `medias` roles.
  - `cinematic_studio_3_0`: `resolution` "1080p", `generate_audio` false, `duration` 5 (range 4–15), the same roles.

### Keeping the files (production only)
- **Clip URLs:** for each final clip, take Kling's `urlWithoutWatermark` from `query_tasks` and run
  `mcp__higgsfield__media_import_url`. Keep the permanent `cloudfront.net` URL from `show_medias`.
- **Stills:** the same, for the poster use.
- **Task ids:** record every Kling task id here before anything is regenerated.

## 6. Cost card
**Balances (measured live, 2026-10-12):** Kling **1,508 credits** (Pro / SVIP) · Higgsfield **1,000 credits** (Plus).
**Prompt log:** no measured costs yet (every row reads "(measure)"), so every figure below is an **estimate**.

| Item | Tool / model | How many | Credits (estimate) | Basis | Why | If we skip it |
|---|---|---|---|---|---|---|
| Hero A (K1) | Kling t2i `kling-image-v3_0_omni` 2K | 2 images | 16 | planning figure 8 per image (unmeasured; resellers quote 1–2 of their own credits) | everything is edited from it | no film |
| Low-key (K0) | Kling i2i omni 2K | 1 | 8 | as above | the reveal | S1 starts lit; weaker opening |
| Exploded A (K3) | Kling i2i omni 2K | 2 | 16 | as above | the tail of the key film | no split |
| Hero B (K6) | Kling i2i omni 2K | 2 | 16 | as above | Ryan's new-angle CTA beat | no second beat |
| Macro (K4) | Kling i2i omni 2K | 1 | 8 | as above | the craft moment | 5-scene fallback |
| Exploded B (K5) | Kling i2i omni 2K (2 refs) | 2 | 16 | as above | start of the reassembly | no second beat |
| Films S1–S6 | Kling i2v `kling-video-v3_0` 5 s 1080p, no audio | 6 | 240 | Kling's published 8 credits/s at 1080p without audio (= 40 per 5 s); **not measured on our account** | the whole site film | — |
| Retake reserve | same | 2 films + 3 stills | 104 | as above | parts melting or drifting | stop and re-ask instead |
| **Kling total** | | | **≈ 424** | | **Ask: up to 425 Kling credits** | leaves ≥ 1,083 |
| Copy to permanent storage | Higgsfield `media_import_url` | 6 clips + 6 stills | 0 expected | **unknown, measure** | Kling links expire in 24 h | films lost after a day |
| Fallback films | Higgsfield `kling_o3_flf` pro / `seedance_2_0` 1080p, silent | 0–2 | 0 expected, up to ≈ 90 | third-party quotes 8–45 per 5 s; free `get_cost` preflight before any use | only if Kling fails twice | 5-scene fallback |
| **Higgsfield total** | | | **0 expected** | | **Ask: up to 100 Higgsfield credits (reserve only)** | leaves ≥ 900 |

**Waste this plan avoids:**
- Leaving `enable_audio` at its default would cost 60 instead of 40 per film: +120 credits across six films.
- Leaving the omni edit at its 4k default could cost more, and 4K outputs cannot be fed back into Kling (inputs
  must be below 4K).

**Not proposed:**
- Separate 9:16 phone films (+6 stills, +6 films ≈ +290). The site kit uses one film and crops it for phones.
- Kling Elements. The cost of `element_create` is unknown, and the same hero still used as `image_1` does the job.

**Measurement run (propose first, ≈ 56 Kling credits, all three outputs kept in the final film):**
1. Read the Kling balance. Make **K1** with `imageCount` "1". Read the balance again: that is the text_to_image cost.
2. Make **K0** (edit of K1). Read the balance: that is the image_to_image cost.
3. Make the **S1 film** K0→K1 (first + tail, 5 s, 1080p, silent). Read the balance: that is the film cost.
4. Free: run Higgsfield `get_cost: true` for `kling_o3_flf` and `seedance_2_0` with the same settings.
5. Write all real figures into `06_Prompt_Log.md` and re-quote the rest. If any figure is more than 25 % above the
   estimate, stop and re-ask Ryan.

Why two stills and not "one still and one film": a first + tail film needs two stills, and the edit cost has to be
measured too.

## 7. QA (from `05_QA.md`, made specific to this watch)
**On the stills, before any video credits**
- [ ] The look bible is identical in all six stills: one strip light from camera-left, black basalt, no fill, same
      grade. **BLOCKER** if a second light or haze appears.
- [ ] The watch is identical everywhere: bezel ticks, round markers, sword hands, lollipop seconds hand, crown at 3,
      three-link bracelet, hands at 10:10. **BLOCKER** on any drift.
- [ ] K3 and K5 contain exactly the 9 pieces in §2, in the right order: no gears, screws, case back or movement, and
      no visible case interior. **BLOCKER**.
- [ ] No generated text, numerals or logo anywhere. **HIGH**.
- [ ] Phone check: in the centre 26 % column, every keyframe keeps the action inside and the bottom 26 % clear.
      **HIGH** (K5 is the most likely to fail: tighten the spacing).
- [ ] All stills are 16:9 at the same pixel size and below 4K. **BLOCKER** for the chain.

**On every film**
- [ ] Pause on frame 1 and the last frame: they match the first and tail stills. **BLOCKER**.
- [ ] Parts stay rigid: no melting, no extra parts, no individual part rotating, no flicker. **BLOCKER**.
- [ ] Scrubbed backward (that is how the site plays scroll-up), S2 reads as a clean reassembly and S5 as a clean
      split. **HIGH**.
- [ ] No black frame, cut or fade at either end, and no multi-shot cut (`prefer_multi_shots` false). **BLOCKER**.
- [ ] Silent file (`enable_audio` false). **POLISH**.
- [ ] The scene's last frame equals the next scene's first frame. **BLOCKER**.

**Before hand-off**
- [ ] Permanent Higgsfield URLs are in `media.json` with `"crop": "none"` and 96 frames each.
- [ ] Credits used are logged against the approved budget, with every task id.
- [ ] A real client approves that the parts shown match their watch, and "Illustrative" labels are present.
- [ ] `06_Prompt_Log.md` is updated with the measured costs and what worked.

## 8. What I need from Ryan
1. For a real client: their product photos (a hero at three-quarter view, a front or crown-side angle, a dial macro),
   and whether real movement photos, an exploded render or CAD exist. Their logo comes from the photos only.
2. Approval for the measurement run (≈ 56 Kling credits), then for the full set: "APPROVED by Ryan: up to 425 Kling
   credits / 100 Higgsfield credits".
