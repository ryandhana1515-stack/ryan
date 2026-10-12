---
tags: [zaphiel, skill-pack, titan, medical, video, explainers]
version: 1.0 (2026-10-12)
---
# Clinic video explainers: one narrated video per topic, matched to the clinic

Ryan (2026-10-12), replacing the earlier scroll-journey idea for doctors:
- **No cinematic scroll/parallax** on doctors' sites. A clean clinic website with the **clinic's own real photos**.
- A **video section** where narrated videos explain the anatomy (arteries, brain, organs…).
- The topics **depend on the clinic's website**: Website Intelligence finds the specialty and services. For a dental
  clinic, the section is about teeth, with **one video per part of the tooth** explaining what it is, and then why
  coming to this clinic helps.

## The flow
1. **Website Intelligence** reads the clinic's site and public pages:
   - the specialty;
   - the services list;
   - the doctors (SMC-registered qualifications as published);
   - the clinic's **real photos** (premises, team, equipment).
   It writes the **video plan** (below) into the brief.
2. **TITAN** turns the plan into the video section and the site (built on Lovable, [[13_Lovable_Medical_Prompt]]).
3. **Visuals for each video:**
   - Default (Ryan: "use Lovable itself for the artery heart thing"): Lovable renders each explainer as an animated
     anatomy scene inside a video player (play/pause, progress bar, captions, narration audio).
   - Optional: photoreal clips from Kling/Higgsfield when the clinic wants film-real footage (cost card;
     [[60_Skill_Packs/Cinematic_Director/02_Medical_Anatomy_Films]]).
4. **Narration** is written from the clinic's approved facts:
   - **Voice**, in order of preference: the doctor's own recorded voice (free, best); a labelled AI narration voice
     (ElevenLabs, needs a commercial plan); the browser's built-in voice only for a demo.
   - **Captions** always; a transcript under each video.
5. **Clinician review** of every script and visual before going live.

## One video = one topic (30–60 seconds)
Each video follows the same four beats:
1. **What it is:** the part of the body, plainly ("Under the hard enamel is dentin, a softer layer full of tiny
   tubes…").
2. **What can go wrong** (educational, calm, no fear tactics): "When decay reaches the dentin, teeth can feel sensitive."
3. **How it's treated, as this clinic offers it:** only services on the clinic's own list, described factually.
4. **Visit the clinic:** factual reasons only. These are its services, its doctors' qualifications, its location
   and hours, and how to book. Never "best", never promised results, never comparisons (Singapore rules,
   [[03_Medical_Supplement_Rules]]).

On the page, each video is a card in the section: a poster, the title ("The enamel"), a one-line summary and the
duration. Clicking it plays in a large player with captions. The "Book a consultation" and WhatsApp buttons sit under
every video.

## Topic library by specialty (Website Intelligence picks the topics the clinic actually treats)
| Specialty | Section title | Videos (one per topic) |
|---|---|---|
| **Dental** | Inside your teeth | Enamel · Dentin · Pulp, nerve and blood vessels · Root and periodontal ligament · Gums · Jawbone. Plus the clinic's treatments: fillings, root canal, implants (post, abutment, crown), braces/aligners, wisdom teeth, scaling and polishing |
| **Cardiology** | How your heart works | The heart's four chambers · The coronary arteries · Blood flow and blood cells · How arteries narrow (plaque) · Heart rhythm · Screening (ECG, echo, stress test) · Angioplasty and stents, if offered |
| **Vascular** | Your blood vessels | Arteries vs veins · Vein valves · Varicose veins · Circulation in the legs · Treatments offered |
| **Neurology** | Your brain and nerves | The brain's regions · Neurons and signals · Blood supply to the brain · Headaches and migraine · Stroke warning signs (educational) · Nerve tests offered |
| **Orthopaedics / spine** | Your joints and spine | The spine and discs · Nerve roots · The knee (cartilage, menisci, ligaments) · The shoulder · Sports injuries · Treatments offered |
| **Ophthalmology** | Inside your eye | Cornea and lens · The retina · Cataract · Glaucoma · Refractive errors · Treatments offered |
| **ENT** | Ear, nose and throat | The inner ear and hearing · The sinuses · The throat and tonsils · Treatments offered |
| **Gastroenterology** | Your digestive system | The stomach · The intestines · The liver · Endoscopy explained · Treatments offered |
| **Dermatology / aesthetics** | Your skin | Skin layers · Collagen · Acne · Pigmentation · Treatments offered (no injection points, no before/after) |
| **Women's health** | Women's health | Anatomy overview · Screening explained · Pregnancy stages (if an O&G clinic) · Treatments offered |
| **GP / family clinic** | How your body works | Heart and blood pressure · Lungs and breathing · Digestion · Diabetes and blood sugar · Vaccinations · Health screening |

A specialty not listed: Website Intelligence researches it from reputable medical sources and adds a row here.

## Rules (always)
- **Real photos** of the clinic come from the clinic's own website or the clinic directly. In PROSPECT mode they
  are used only in the private pitch mock-up, never published without the clinic's permission. Never stock models in
  white coats; never AI people as doctors or patients.
- Every animated or generated anatomy visual: "Illustration for education only".
- Scripts and captions are `[VERIFY WITH CLINIC]` until the clinic's doctor approves them.
- No testimonials, before/after, superlatives, comparisons or urgency ([[12_SG_Rules_Research]] §A).
