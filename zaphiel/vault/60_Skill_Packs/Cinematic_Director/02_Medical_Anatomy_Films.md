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
| **Stent / balloon (if the clinic does it)** | A thin guide wire crosses the narrowing first; the crimped mesh tube rides over it on a balloon catheter. The balloon inflates, the mesh expands and presses the plaque against the wall; then the balloon **deflates and is withdrawn** and the stent **stays** in the wall. Generic mesh, no brand. Make it two films (plaque → device in place → open). |
| **Veins / varicose veins** | Thinner walls than arteries, one-way valves inside (cup-like flaps). Varicose: valves that don't close, blood pooling, a vein bulging under the skin. |
| **Capillaries** | So narrow that red cells pass in single file, a fine network around tissue. |
| **Brain** | Folded cortex. The arteries at the base form a ring (the Circle of Willis). Neurons: cell body, branching dendrites, one long axon with a myelin sheath; signals as soft light pulses across synapses. |
| **Spine** | Stacked vertebrae with cushion discs between them (a tough outer ring, a soft gel centre). The spinal cord runs down the canal; nerve roots leave between vertebrae. Slipped disc = the gel pushing through the ring towards a nerve root. |
| **Knee** | Thigh bone (femur), shin bone (tibia), kneecap (patella), the thin fibula on the outer side; two C-shaped menisci; cruciate ligaments crossing in the middle; smooth white cartilage on the bone ends. |
| **Eye** | Clear cornea in front, coloured iris, the lens behind the pupil, the gel-filled body, the retina at the back with vessels branching from the optic disc. |
| **Tooth** | Enamel outside, dentin, the pulp chamber with nerve and fine vessels running down the root canals into the jawbone, held by the gum. Implant = a titanium post in the jawbone, an abutment, a crown on top. |
| **Skin (aesthetics)** | Layers: epidermis on top, dermis with collagen and elastin fibres, small vessels, hair follicles and glands, then fat below. Ageing = thinner, looser collagen. |
| **Lungs** | Windpipe → bronchi → branching bronchioles → grape-like air sacs (alveoli) wrapped in capillaries; breathing as gentle expansion. |
| **Stomach & digestive tract** | Oesophagus down to the J-shaped stomach (upper left of the abdomen, under the diaphragm), folded inner lining (rugae), then the small intestine (long, coiled, with finger-like villi inside) and the large intestine framing it. Gentle wave-like movement (peristalsis). |
| **Liver** | The largest internal organ, upper right under the diaphragm, reddish-brown, wedge-shaped; the gallbladder tucked beneath it. |
| **Kidneys** | Two bean-shaped organs at the back of the abdomen either side of the spine, the right slightly lower; renal artery and vein at the inner notch; fine filtering units inside. |

**Common mistakes to catch (test B, 2026-10-12):**
- **Mirror image:** in a front view, the patient's left is on the viewer's **right**. The apex and the aortic arch
  point to the patient's left.
- **Fat is not plaque:** normal yellow fat on the heart's surface is not disease. Plaque sits **inside** an
  artery's wall.
- **Red cells:** biconcave discs, never balls. Drawing them bigger than true scale is fine, but keep the same scale
  in every scene.
- **Never show a blood clot, a rupture or bleeding,** even in the "concern" scene.

If a clinic's specialty is not in this table, the director researches it first (reputable medical sources only)
and adds a row here.

## The full body tour (Ryan, 2026-10-12: "they go inside the human body, the lungs, the stomach, the organs")
For a clinic or medical centre that wants the whole-body wow, one chained film (each scene's tail still = the next
scene's first still), 8–10 scenes, then the specialty in detail:
1. A calm person in soft light; the camera moves in, the skin turns translucent (10 s).
2. **Into an artery:** red blood cells flowing along the glistening wall; the camera rides the flow.
3. **The heart:** out of the vessel to see the heart beating, coronary arteries on its surface.
4. **The lungs:** the camera glides up through the chest; the lungs breathe, down to the branching airways and air
   sacs wrapped in capillaries.
5. **The stomach and digestive tract:** down past the diaphragm to the stomach's folded lining, then the coiled
   small intestine and its villi, gentle peristalsis.
6. **Liver and kidneys:** a slow pass past the liver (upper right) and the kidneys at the back, blood flowing
   through them.
7. **The clinic's specialty:** the organ the doctor treats, in detail (the recipes below).
8. **Back out** to the calm person (the opening still, so the film loops).
Each organ scene is 5 s (10 s for the threshold and the specialty). The camera never cuts: it travels through vessels
or tissue from one organ to the next.

## The presenter video section ("a director explaining it inside the website")
A separate "How it works" video on the site, next to the body-journey film:
- **Presenter:** the clinic's **real doctor filmed** (a phone on a tripod is fine) is the default. An **AI presenter**
  is allowed only as an illustrative presenter, labelled "AI presenter" on screen and next to the player, never
  claiming to be the doctor or a patient (Higgsfield/Kling presenter, voice from ElevenLabs with a commercial plan or
  the doctor's own voice with consent).
- **Picture-in-picture:** the presenter in a corner over the body-journey footage, so the explanation sits on top of
  the visuals.
- **Script:** written from the clinic's approved facts, 60–120 seconds, plain words, and **approved by the doctor**.
  Captions on, a transcript below the player.
- **Player:** a poster, a big play button, sound only after the visitor presses play, captions, full width.

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
- Every generated anatomy film carries the label **"Illustration for education only"** on the website. (Other
  businesses' generated visuals use "Illustrative" as in `brief.js`; for medical, use the longer label.)
- **Doctor review before anything goes live:** the clinic's doctor approves every film and every caption. Until
  then, captions are `[VERIFY WITH CLINIC]`.
- Never show outcomes, before/after results, patient testimonials, success rates, "best", "painless", "guaranteed",
  invented doctors, invented credentials or brand-name devices.
- Never show injection points, needle depth, dosage or procedure steps the clinic has not supplied (doctrine §11).
- Non-gory, non-frightening: the concern scene is calm and educational.
- Singapore's rules for healthcare advertising apply to everything around the film: see [[04_Medical_Rules_SG]].
