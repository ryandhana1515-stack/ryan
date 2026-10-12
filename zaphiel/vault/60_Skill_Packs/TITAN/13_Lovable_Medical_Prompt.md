---
tags: [zaphiel, skill-pack, titan, lovable, medical, prompt]
version: 2.0 (2026-10-12)
---
# Lovable medical prompt: clinic sites with real photos and a video section

**v2.0, Ryan (2026-10-12):** doctors' sites are **not** cinematic scroll/parallax. They are clean, real clinic websites
built from the **clinic's own real photos**, with a **video section** of narrated explainers matched to the clinic's
specialty ([[14_Clinic_Video_Explainers]]). Lovable builds the site and renders the anatomy in the videos itself
(Ryan: "use Lovable itself for the artery heart thing"); Kling/Higgsfield clips are optional. Every Lovable message
uses credits: show the cost card first.

## How TITAN runs it
1. **Website Intelligence brief:** specialty, services, doctors (qualifications as published), the clinic's real
   photo URLs, brand colours/logo, address/hours/contact, and the **video plan** (topics from
   [[14_Clinic_Video_Explainers]]). Anything missing is `[CLIENT TO PROVIDE]`.
2. `set_project_knowledge` with the **Rules block** below.
3. `create_project` with the **Master prompt**, filled in, plus the photos attached or linked.
4. Review the preview (titan-qa on phone and desktop). Send iteration prompts one topic at a time.
5. Clinician review of every script and visual → Ryan/clinic approval → publish.

## Rules block (project knowledge)
```
This is a Singapore medical clinic website. Follow these rules in every edit:
- Use the clinic's own real photos (supplied). Never stock models in white coats. Never an AI-generated person as a doctor or a patient.
- Copy is factual, neutral and verifiable. No superlatives or praise ("best", "leading", "No. 1", "trusted by thousands", "painless", "guaranteed").
- No comparisons with other clinics. No promised results. No before/after or "after only" images.
- No patient testimonials, review widgets, star ratings or Google-review embeds. No urgency tactics.
- Every animated or generated anatomy visual is labelled "Illustration for education only".
- Medical scripts and captions are placeholders marked [VERIFY WITH CLINIC] until the clinic's doctor approves them.
- Forms collect only name, phone/WhatsApp, preferred time and a short reason; a PDPA consent checkbox states the purpose; no NRIC or medical history.
- Never put API keys in browser code.
```

## Master prompt (fill the < > parts)
```
Build a clean, premium, trustworthy website for <Clinic name>, a <specialty> clinic in Singapore. It is a real clinic
website, not a cinematic scroll site: calm layout, generous white space, fast, mobile first. Use the clinic's own
photos provided: <photo URLs or attachments: premises, team, treatment rooms, equipment>.

PAGES / SECTIONS
1. Hero: a large real photo of the clinic, the clinic name, one factual line about what the clinic does, buttons
   "Book a consultation" and "WhatsApp us" (WhatsApp link to <number> with a prefilled message).
2. Services: one card per service the clinic offers: <list>. Plain facts only.
3. VIDEO SECTION, titled "<section title, e.g. Inside your teeth>": an intro line, then a grid of video cards, one per
   topic: <topic 1>, <topic 2>, … Each card has a poster, the title, a one-line summary and the duration. Clicking a
   card opens a large player (play/pause, progress bar, captions on by default, a transcript below).
   Each video is an animated, realistic-looking anatomy explainer rendered in the browser (React Three Fiber / three
   with physically based, glossy, wet-looking tissue, soft lighting, a slow camera; or high-quality layered SVG/canvas
   animation where 3D is not needed), synced to a narration audio track and captions. Each video follows four beats:
   (1) what this part of the body is, (2) what can go wrong, explained calmly, (3) how it is treated, describing only
   the clinic's own services, (4) a closing card: "<Clinic name> · <services> · <address> · Book a consultation".
   Narration scripts: <scripts from the brief, marked [VERIFY WITH CLINIC]>. Narration audio: <doctor's recorded
   files, or a placeholder audio slot for now>. Label each video "Illustration for education only".
   Under every video: "Book a consultation" and "WhatsApp us".
4. Doctors: <names and SMC-registered qualifications exactly as given>, with the clinic's real photos.
5. The clinic: real photos of the premises, address, opening hours, a map link, contact details.
6. FAQ: <questions>, answers marked [VERIFY WITH CLINIC].
7. Booking: a short form (name, phone/WhatsApp, preferred time, short reason) with a PDPA consent checkbox stating the
   purpose. On submit, POST JSON to the URL in VITE_LEAD_ENDPOINT, including utm_source, utm_medium, utm_campaign,
   utm_content, utm_term, gclid, fbclid and ttclid captured from the landing URL and kept for the session. Show a
   thank-you state.
8. Footer: clinic details, privacy notice link, "Illustrations are for education only".

DESIGN: brand colours <colours>; a refined serif for headings and a clean, highly legible sans for text; real photos
large and sharp; subtle fade-in motion only (no parallax, no scroll-jacking). Accessible: keyboard, contrast, alt text
on every photo, captions on every video. Fast: lazy-load videos and the 3D in each player; posters first.

Follow the project knowledge rules (no superlatives, no testimonials, no before/after, no AI people as doctors).
```

## Iteration prompts (one per message)
- "Make the anatomy in the <topic> video more realistic: glossier, wetter tissue with soft subsurface warmth and a
  slower camera; keep the captions in sync."
- "The narration and captions drift: sync captions to the audio timestamps."
- "Replace the placeholder photos with the clinic's photos: <URLs>. Crop the hero to keep the reception desk in view."
- "On phones, make the video cards one column and the player full width, captions larger."
- "Add a video for <topic> using the same four beats; script: <script>."

## Accuracy and rules
- Anatomy facts: [[60_Skill_Packs/Cinematic_Director/02_Medical_Anatomy_Films]] (facts table, common mistakes).
- Topics and scripts: [[14_Clinic_Video_Explainers]]. Singapore rules: [[03_Medical_Supplement_Rules]], [[12_SG_Rules_Research]].
- titan-qa: phone/tablet/desktop, every video plays with captions, the form reaches the CRM test endpoint, Lighthouse.
