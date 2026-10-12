---
tags: [zaphiel, skill-pack, cinematic, medical, anatomy]
version: 1.0 (2026-10-12)
---
# Medical anatomy films for doctors' websites

Ryan (2026-10-12): the agent "must be able to create real doctors' … artery stuff, the blood vessels and
everything", realistic and not cartoon. These films open specialist clinics' websites (Lovable builds clinic
sites; Ryan, 2026-09-29) and power their explainer videos. This note builds on the existing clinic logic in
`ceo-brain/agents/website-builder/brief.js` (`WB_EXPLAINER`: dental, cardiology, orthopaedic, ophthalmology,
general) and doctrine §11.

## The look (one look bible for every medical film)
"Photoreal medical visualisation, the quality of a high-end medical animation studio: a dark clean void with soft
volumetric light, subsurface scattering on tissue, glossy wet surfaces, physically accurate anatomy, shallow depth
of field, slow graceful camera, clinical cool tones with warm red highlights, no text, no labels, no gore."

Always add the **negative** line: "no blood spill, no open wounds, no surgical incisions, no needles, no syringes,
no cartoon, no low-poly, no text, no watermark, no extra organs, anatomically correct proportions."

## The journey structure (camera travels in, explains, travels out)
Every clinic film is one continuous camera journey chained frame to frame (each scene's tail still = the next
scene's first still):
1. **The person:** calm adult in soft light; the camera moves gently towards the area concerned (no identifiable
   face; a body part, a silhouette or the back of the head).
2. **Through the surface:** the skin turns translucent or the camera passes through it into the body. This is the
   "how did they do that" moment. Give it 10 seconds.
3. **The organ in full:** the healthy organ in motion (the heart beating, the lungs breathing, the knee bending).
4. **Inside, at the small scale:** blood cells in a vessel, nerve fibres, the cartilage surface.
5. **The concern, illustrated gently:** what can go wrong (narrowing, a slipped disc, worn cartilage). Clearly
   educational and non-frightening.
6. **How treatment helps:** only treatments the clinic actually offers, illustrated generically, no brand devices,
   no outcome promises.
7. **Back out:** the camera returns to the calm person. On the site this is also what the reverse scroll shows.

## Anatomy facts the prompts must respect (for accuracy checks)
The director checks each still against these before animating. Copy for the site is written or approved by the
clinic's doctor; these facts are only for making the pictures correct.

| Area | Must be true in the picture |
|---|---|
| **Heart** | Four chambers. Apex points down and to the left. The aorta arches up and over to the left. The coronary arteries run on the **surface** of the heart: the left anterior descending artery down the front groove between the ventricles, the circumflex around the left side, the right coronary artery around the right side, with coronary veins alongside. |
| **Artery (inside)** | A round tube with a smooth glistening inner lining (endothelium) and a muscular wall. Red blood cells are **biconcave discs** tumbling in pale plasma, a few white cells and small platelets. Flow pulses with the heartbeat. |
| **Narrowed artery (plaque)** | A yellowish fatty build-up **inside the wall, under the lining**, bulging into the channel and narrowing it; blood squeezes past. Not a blockage drawn as rubbish in the tube. |
| **Stent / balloon (if the clinic does it)** | A fine metal mesh tube expanded by a balloon on a thin catheter, pressing the plaque against the wall and reopening the channel. Generic mesh, no brand. |
| **Veins / varicose veins** | Thinner walls than arteries, one-way valves inside (cup-like flaps). Varicose: valves that don't close, blood pooling, a vein bulging under the skin. |
| **Capillaries** | So narrow that red cells pass in single file, a fine network around tissue. |
| **Brain** | Folded cortex. The arteries at the base form a ring (the Circle of Willis). Neurons: cell body, branching dendrites, one long axon with a myelin sheath; signals as soft light pulses across synapses. |
| **Spine** | Stacked vertebrae with cushion discs between them (a tough outer ring, a soft gel centre). The spinal cord runs down the canal; nerve roots leave between vertebrae. Slipped disc = the gel pushing through the ring towards a nerve root. |
| **Knee** | Thigh bone (femur), shin bone (tibia), kneecap (patella), the thin fibula on the outer side; two C-shaped menisci; cruciate ligaments crossing in the middle; smooth white cartilage on the bone ends. |
| **Eye** | Clear cornea in front, coloured iris, the lens behind the pupil, the gel-filled body, the retina at the back with vessels branching from the optic disc. |
| **Tooth** | Enamel outside, dentin, the pulp chamber with nerve and fine vessels running down the root canals into the jawbone, held by the gum. Implant = a titanium post in the jawbone, an abutment, a crown on top. |
| **Skin (aesthetics)** | Layers: epidermis on top, dermis with collagen and elastin fibres, small vessels, hair follicles and glands, then fat below. Ageing = thinner, looser collagen. |
| **Lungs** | Windpipe → bronchi → branching bronchioles → grape-like air sacs (alveoli) wrapped in capillaries; breathing as gentle expansion. |

If a clinic's specialty is not in this table, the director researches it first (reputable medical sources only)
and adds a row here.

## Recipes by specialty (5–7 scenes; prompts start with the look bible)
**Cardiology / heart screening**
1. Calm adult, soft light, camera eases towards the chest.
2. The chest turns translucent; the camera passes through the ribs (10 s, the threshold moment).
3. "A photoreal human heart beating slowly, coronary arteries branching across its surface, the aorta arching
   above, glossy tissue, volumetric light, slow 30° orbit."
4. "Inside a coronary artery: red blood cells, biconcave discs, tumbling through pale plasma along the glistening
   inner wall, pulsing with the heartbeat, macro."
5. "A yellowish fatty plaque inside the artery wall bulges into the channel, the blood flow narrows and squeezes
   past (educational illustration)."
6. Only if offered: "a fine metal mesh stent expands on a balloon catheter, pressing the plaque back, flow returns."
   Or a gentle screening scan of the heart.
7. The camera travels back out to the calm person.

**Vascular / varicose veins**: leg in soft light → through the skin → healthy vein valves opening and closing →
failing valves, blood pooling, the vein bulging → treatment as offered (generic) → back out.

**Neurology / stroke**: head silhouette → through the skull into the brain → the Circle of Willis with blood
flowing → neurons signalling → a narrowed or blocked vessel (illustrative) → back out.

**Orthopaedic / spine**: a person bending → the back turns translucent → the spine flexing → a disc between two
vertebrae, the gel centre → the gel pushing out towards a nerve root, which glows softly (pain) → treatment as
offered → back out.

**Orthopaedic / knee & sports**: a runner's knee mid-stride → translucent → the knee joint bending, menisci and
ligaments → worn cartilage (illustrative) → treatment as offered → back out.

**Dental** (extends `WB_EXPLAINER.dental`): smile → into one tooth → enamel, dentin → pulp with nerve and vessels →
implant post settling into the jawbone (if offered) → back out to the smile.

**Ophthalmology**: an eye in soft light (no identifiable face) → light through the cornea and lens → the retina
and its vessels → what blurs vision (illustrative) → back out to a clear city view.

**Aesthetics / dermatology**: skin surface in soft light → descending through the layers → collagen fibres in the
dermis → (only approved, non-invasive) → back out. No needles, no injection points (doctrine §11).

## Medical rules (always)
- Every generated anatomy film carries the label **"Illustration for education only"** on the website.
- **Doctor review before anything goes live:** the clinic's doctor approves every film and every caption. Until
  then, captions are `[VERIFY WITH CLINIC]`.
- Never show outcomes, before/after results, patient testimonials, success rates, "best", "painless", "guaranteed",
  invented doctors, invented credentials or brand-name devices.
- Never show injection points, needle depth, dosage or procedure steps the clinic has not supplied (doctrine §11).
- Non-gory, non-frightening: the concern scene is calm and educational.
- Singapore's rules for healthcare advertising apply to everything around the film: see [[04_Medical_Rules_SG]].
