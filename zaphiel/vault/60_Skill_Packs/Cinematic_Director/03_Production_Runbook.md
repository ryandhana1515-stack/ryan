---
tags: [zaphiel, skill-pack, cinematic, runbook]
version: 1.0 (2026-10-12)
---
# Production runbook: from brief to finished film assets

The director **plans and produces film assets**. It does **not** build websites. The Website Build Worker (site kit
on Vercel) or Lovable (clinics) builds the site from the director's hand-off.

## Step 0: read first
The brief (or Ryan's words), the customer's real photos and facts, [[01_Split_and_Reassemble]] or
[[02_Medical_Anatomy_Films]], [[05_QA]], the doctrine [[Knowledge/Full Master Cinematic Website Agent 2026]] §5–§8,
§11, §22, and [[Knowledge/Wow website playbook]]. Check [[06_Prompt_Log]] for what already worked.

## Step 1: storyboard (free)
- One **look bible** sentence: set, light direction, lens, colour grade, atmosphere. It goes at the start of every
  prompt, word for word.
- 5–7 scenes in the arc (raw/parts → assembles → revealed → alive → macro → payoff; or the medical journey in →
  explain → out).
- For every scene, the **shot package** (doctrine §22): purpose, subject/action, start still, end still, camera and
  lens, light, movement, speed, duration, aspect ratio (16:9 master + 9:16 phone), safe text zone, negatives.
- The **chain:** scene N's tail still is scene N+1's first still (the same file).
- Where it goes on the site: which scroll section, `data-length` (≈240vh for 5 s, 320vh for 10 s), what copy rides
  on it (placeholders only; facts come from the customer).

## Step 2: prompt package (free)
For each still: model, aspect ratio, resolution, prompt, negative line. For each film: model, `first_image`,
`tail_image`, duration, resolution, the move prompt, `enable_audio: false` (sites play silent films). Use the
current argument names from Kling `who_am_i` and Higgsfield `models_explore` (they change; check every project).

## Step 3: cost card, then STOP until Ryan says yes
Check balances first: Kling `query_membership_and_credits`, Higgsfield `balance`.

| Item | Tool / model | How many | Credits (estimate) | Why | If we skip it |
|---|---|---|---|---|---|

- **The first time a model is used,** estimate from [[06_Prompt_Log]]. If it has no figure yet, make **one** still
  and **one** 5-second film, read the balance before and after, write the real cost in the log, and quote the
  rest from that.
- Zero-cost rule: generation spends credits, so it needs **Ryan's yes** with a budget. The director only
  generates when the task it was given says **"APPROVED by Ryan: up to N Kling credits / M Higgsfield credits"**,
  and it stops before the budget runs out.

## Step 4: produce (only with the approval)
1. **Stills:** Kling `text_to_image` (or `image_to_image` from the customer's photo). For `image_to_image` with the
   Kling omni or o1 models, the reference must be a Kling `file_upload` URL: upload first. Submit all stills, then
   poll `query_tasks`. Generate 2 variants of the hero only; pick the best against [[05_QA]].
2. **QA the stills** (anatomy or part accuracy, the look bible match) before spending on video.
3. **Edits:** the exploded still and any alternate hero, as edits of the approved hero still.
4. **Films:** Kling `image_to_video` with `first_image` + `tail_image`, all scenes submitted together, then poll
   `query_tasks` (do not stop the turn while they run). Keep every task id. **Never pay twice:** re-query old ids
   before regenerating.
5. **Fallback** when a Kling film fails twice: the same keyframes on Higgsfield (`kling_o3_flf`,
   `cinematic_studio_3_0` or `seedance_2_0`, with start_image + end_image).
6. **Keep the files:** Kling links expire after 24 hours. Copy each final clip with Higgsfield `media_import_url`
   (Kling's `urlWithoutWatermark`) and keep its permanent URL from `show_medias`.
7. **Polish (only if needed):** Higgsfield `video_deflicker`, an upscale, `reframe` for 9:16.

## Step 5: hand-off (the director's finished product)
Save to `zaphiel/vault/80_Clients/<slug>/cinematic/` (tests: `80_Clients/_Test/cinematic-director/<name>/`):
- `asset_pack.md`: look bible, storyboard table, every prompt, every task id, the permanent URLs, QA results, the
  credits used.
- `media.json` for the site kit: `{"films": [{"id": "scene1", "src": "<permanent URL>", "crop": "none", "frames":
  96}, …]}`. Use `"crop": "kling"` only for a watermarked Kling URL, and 96 frames per 5 s scene or 120 per 10 s.
- For Lovable (clinics): the film URLs, the poster stills, the scroll section each one belongs to, the captions as
  `[VERIFY WITH CLINIC]` and the "Illustration for education only" label.
- Append what worked and what failed to [[06_Prompt_Log]]. That is how the director gets better every project.
