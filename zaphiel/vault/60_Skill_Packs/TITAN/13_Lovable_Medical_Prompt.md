---
tags: [zaphiel, skill-pack, titan, lovable, medical, prompt]
version: 1.0 (2026-10-12)
---
# Lovable medical prompt: doctors' sites with the body journey built in Lovable

Ryan (2026-10-12): "for those doctors website artery things … you just need the right prompt … you can just use
Lovable itself for the artery heart thing, everything." Ryan has done this in Lovable before and it worked. So for
doctors and clinics, **Lovable builds the anatomy visuals itself** (real-time 3D in the browser). Kling/Higgsfield
films are optional extras, not required. Every Lovable message uses credits: show the cost card first.

## How TITAN runs it
1. Facts first: the clinic's name, doctors (SMC-registered qualifications as given), services, specialty, address,
   hours, contact, brand colours, logo. Anything missing is `[CLIENT TO PROVIDE]`. Nothing is invented.
2. `set_project_knowledge` on the Lovable project: paste the **Rules block** below, so every later edit keeps them.
3. `create_project` with the **Master prompt** (one message: the whole site). Use `plan_mode` first only for a very
   large site.
4. Review the preview (titan-qa screenshots on phone and desktop). Send **iteration prompts** (below) for realism and
   fixes, one topic per message.
5. Clinician review → Ryan/client approval → publish (never before).

## Rules block (project knowledge)
```
This is a Singapore medical clinic website. Follow these rules in every edit:
- Copy is factual, neutral and verifiable. No superlatives or praise ("best", "leading", "No. 1", "trusted by thousands", "painless", "guaranteed").
- No comparisons with other clinics. No promised results. No before/after or "after only" images (real or generated).
- No patient testimonials, review widgets, star ratings or Google-review embeds.
- No urgency tactics (countdowns, "limited slots").
- Every anatomy visual is labelled "Illustration for education only".
- Never show an AI person as a doctor or a patient. Doctor photos and videos are real, supplied by the clinic.
- Captions about medicine are placeholders marked [VERIFY WITH CLINIC] until the clinic's doctor approves them.
- Forms collect only name, phone/WhatsApp, preferred time and a short reason; include a PDPA consent checkbox with the purpose; no NRIC or medical history.
- Never put API keys in browser code.
```

## Master prompt (fill the < > parts)
```
Build a premium, calm, highly realistic website for <Clinic name>, a <specialty> clinic in Singapore. The centrepiece is
an interactive, photoreal-looking 3D "journey through the human body" rendered live in the browser.

TECH: React + TypeScript + Tailwind. For the 3D use three, @react-three/fiber, @react-three/drei and
@react-three/postprocessing. Use GSAP ScrollTrigger (with Lenis smooth scroll) so scroll progress drives the camera.
Keep all text as real HTML over the canvas.

THE BODY JOURNEY (one pinned full-screen section, about 700vh of scroll; scrolling down travels in, scrolling up
travels back out exactly):
1. Skin: a macro of human skin in soft light; as you scroll, the surface becomes translucent and a glowing network of
   blood vessels appears beneath, branching naturally (procedural branching tubes along smooth CatmullRom curves).
2. Inside an artery: the camera flies along the inside of a curved artery (a TubeGeometry rendered on its BackSide).
   The wall is deep red, wet and organic: a custom shader with a fresnel rim, glossy specular highlights, subtle
   animated noise in the normals, and a radius that pulses with a heartbeat at about 72 beats per minute. Thousands of
   red blood cells flow past: instanced biconcave discs (a LatheGeometry profile), tumbling slightly, speeding up on
   each pulse; a few white blood cells and tiny platelets. Soft volumetric fog, bloom on the highlights and a gentle
   depth of field so it feels like a medical film.
3. The heart: the camera exits the vessel to see the whole heart beating (a natural double-beat), anatomically
   oriented (apex down and to the patient's left, the aortic arch above), coronary arteries running over its surface
   (the left anterior descending artery down the front groove, the circumflex around the left, the right coronary
   artery around the right). Glossy, subsurface-looking tissue, dark clean background.
4. The lungs: gliding up through the chest, the two lungs expand and contract slowly (about 14 breaths a minute);
   inside, the airways branch down to clusters of tiny air sacs wrapped in capillaries.
5. The stomach and intestines: down past the diaphragm to the J-shaped stomach with its folded inner lining, then
   the coiled small intestine with a slow wave-like movement.
6. <Specialty scene: e.g. cardiology = a yellowish fatty plaque inside the artery wall narrowing the channel, then a
   fine metal mesh stent expanding on a balloon to open it; orthopaedics = the spine with discs and a nerve root;
   dental = through enamel and dentin to the pulp's nerve and vessels>. Educational and calm, never gory.
7. Back out to the calm person.
Each stage has a short caption that fades in beside the visual (alternate left and right on desktop, bottom on
phones): a small kicker, a title and one line. Captions are placeholders marked [VERIFY WITH CLINIC]. A small label
"Illustration for education only" stays in a corner of the section.

REALISM CHECKLIST: physically based materials, wet glossy tissue, subsurface-looking warmth, volumetric depth, slow
graceful camera, no cartoon colours, no low-poly look, no text inside the 3D.

PERFORMANCE: show a poster image first and start the 3D after the page is interactive; cap the device pixel ratio
at 1.5 on phones and use fewer blood cells there; pause rendering when the section is off screen; keep 60 fps on a
mid-range phone. If the visitor prefers reduced motion or WebGL is unavailable, show a sequence of still images of
each stage with the same captions.

THE REST OF THE SITE (premium, clinical, calm; brand colours <colours>; fonts: a refined serif for headings and a
clean sans for text):
- Hero above the journey: the clinic name, one factual line about what the clinic does, buttons "Book a
  consultation" and "WhatsApp us".
- "How it works" video section: a full-width player with a poster, a large play button, captions and a transcript
  below; a slot for the doctor's own explainer video (supplied by the clinic).
- Services: one card per service the clinic offers (<list>), plain facts only.
- Doctors: <names and SMC-registered qualifications exactly as given>, real photos supplied by the clinic.
- Clinic: address, opening hours, map link, contact.
- FAQ: <questions>, answers marked [VERIFY WITH CLINIC].
- Booking: a short form (name, phone/WhatsApp, preferred time, short reason) with a PDPA consent checkbox stating
  the purpose; on submit, POST JSON to the URL in the environment variable VITE_LEAD_ENDPOINT, including
  utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid and ttclid captured from the landing URL
  and kept for the session. Show a thank-you state. No NRIC or medical history.
- Footer: clinic details, privacy notice link, "Illustration for education only" note.
- Mobile first, accessible (keyboard, contrast, alt text, captions), fast.

Follow the project knowledge rules (no superlatives, no testimonials, no before/after, no AI people as doctors).
```

## Iteration prompts (one per message, after reviewing the preview)
- "Make the artery wall more organic and wet: stronger glossy highlights, finer noise in the normals, a slightly
  translucent warm rim. Keep the heartbeat pulse."
- "Make the red blood cells read as biconcave discs, not balls, and let them tumble slightly; add depth fog so far
  cells fade."
- "Slow the camera down by 30% and ease into each stage; scrolling up must reverse exactly."
- "On phones, keep 60 fps: halve the blood cells, cap DPR at 1.5, and keep the captions at the bottom."
- "The heart is mirrored: the apex must point down and to the patient's left (the viewer's right in a front view)."
- "Replace the specialty scene with <…> using the clinic's actual procedure list."

## Accuracy and rules
- Anatomy facts: [[60_Skill_Packs/Cinematic_Director/02_Medical_Anatomy_Films]] (facts table and common mistakes).
- Singapore rules: [[03_Medical_Supplement_Rules]] and [[12_SG_Rules_Research]].
- titan-qa: screenshots on phone/tablet/desktop, the reverse-scroll test, Lighthouse (the 3D must not block LCP), and
  form → CRM test.
