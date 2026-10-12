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
For each still: model, aspect ratio, resolution, prompt, avoid-line. For each film: model, `first_image`,
`tail_image`, duration, resolution, the move prompt, `enable_audio: false` (sites play silent films). Use the
current argument names from Kling `who_am_i` and Higgsfield `models_explore` (they change; check every project).

**Settings you must always set yourself** (the defaults break website films; found in test B, 2026-10-12):
| Tool / model | Default | Set it to |
|---|---|---|
| Kling `text_to_image` (kling-image-v3_0_omni) | `aspect_ratio: auto` | `16:9` (or `9:16` for a phone-only still), `img_resolution: 2k` |
| Kling `image_to_image` (kling-image-v3_0_omni) | `img_resolution: 4k`, `aspect_ratio: 3:4` | `2k` and `16:9`. Video inputs must be under 4K |
| Kling `image_to_video` (kling-video-v3_0) | `prefer_multi_shots: true`, `enable_audio: true` | `false` and `false`. It has **no aspect setting**: it follows the first image |
| Kling `kling-video-v2_6` with a tail image | — | `resolution: 1080p` (required for a tail), no audio |
| Higgsfield `kling_o3_flf` | `sound: on`, `mode: std` | `sound: "off"`, `mode: "pro"` |
| Higgsfield `seedance_2_0`, `cinematic_studio_3_0` | `generate_audio` on (seedance) | `generate_audio: false`, `resolution: 1080p` |

**No model has a negative-prompt field.** Write the things to avoid as the last sentence of the prompt itself:
"Avoid: …".

**Phones (9:16):** compose every 16:9 master with the subject inside the **centre third**, so a centre crop fills a
phone screen (a 9:16 crop keeps about a third of the width). Generate a separate 9:16 film only for the hero
scene, and only if the budget allows.

**A move with three states** (plaque → stent in place → artery open) is two films with a middle keyframe. List the
pieces in order in the hand-off; the builder plays them back to back as one scene.

**The last scene:** product films end on the payoff still with no tail frame. Medical journeys end on the **opening
still** (back to the calm person), so the film loops cleanly. This exception to the playbook rule is deliberate.

## Step 3: cost card, then STOP until Ryan says yes
Check balances first: Kling `query_membership_and_credits`, Higgsfield `balance`. **Higgsfield prices are free to
check:** call `generate_video` / `generate_image` with `get_cost: true`. It submits nothing and returns the
credits. Kling has no price check, so use the prompt log or the measurement run below. Dry runs may use `get_cost`.

| Item | Tool / model | How many | Credits (estimate) | Why | If we skip it |
|---|---|---|---|---|---|

- **The first time a model is used,** estimate from [[06_Prompt_Log]]. If it has no figure yet, propose a
  **measurement run** that is also part of the final film: the hero still, one edit made from it, and one
  5-second first/tail film between them. Read the balance before and after each step and write the real costs in
  the log. Then quote the rest from those figures.
- Zero-cost rule: generation spends credits, so it needs **Ryan's yes** with a budget. The director only
  generates when the task it was given says **"APPROVED by Ryan: up to N Kling credits / M Higgsfield credits"**,
  and it stops before the budget runs out.

## Step 4: produce (only with the approval)
1. **Stills:** Kling `text_to_image` (or `image_to_image` from the customer's photo). URLs from earlier Kling jobs
   can be passed straight back into Kling. `file_upload` is needed only for other files (the customer's photo):
   it takes two steps (get an upload ticket, then upload with curl). Submit all stills, then poll `query_tasks`.
   Generate 2 variants of the hero only; pick the best against [[05_QA]].
   **Stills expire after 24 hours too:** submit the films within 24 hours of the stills, or first copy the stills to
   Higgsfield with `media_import_url`.
2. **QA the stills** (anatomy or part accuracy, the look bible match) before spending on video.
3. **Edits:** the exploded still and any alternate hero, as edits of the approved hero still.
4. **Films:** Kling `image_to_video` with `first_image` + `tail_image`, all scenes submitted together, then poll
   `query_tasks` (do not stop the turn while they run). Keep every task id. **Never pay twice:** re-query old ids
   before regenerating.
5. **Fallback** when a Kling film fails twice: the same keyframes on Higgsfield (`kling_o3_flf`,
   `cinematic_studio_3_0` or `seedance_2_0`, with start_image + end_image). Higgsfield `medias` take a Higgsfield
   media id or job id, **not a URL**: import the stills with `media_import_url` first.
6. **Keep the files:** Kling links expire after 24 hours. Copy each final clip with Higgsfield `media_import_url`
   (Kling's `urlWithoutWatermark`) and keep its permanent URL from `show_medias`.
7. **Polish (only if needed):** Higgsfield `generate_video` with the model `video_deflicker` or `topaz_video`, the
   `upscale_video` tool, or `reframe` for 9:16.

## Step 5: hand-off (the director's finished product)
Save to `zaphiel/vault/80_Clients/<slug>/cinematic/` (tests: `80_Clients/_Test/cinematic-director/<name>/`):
- `asset_pack.md`: look bible, storyboard table, every prompt, every task id, the permanent URLs, QA results, the
  credits used.
- Site-kit pitfalls: always write `"crop": "none"` for clean clips (a missing `crop` is treated as `"kling"` and
  cuts the picture). The kit's poster is each film's **first frame**, so if the film opens from darkness, give the
  builder a separate poster still for reduced-motion visitors.
- `media.json` for the site kit: `{"films": [{"id": "scene1", "src": "<permanent URL>", "crop": "none", "frames":
  96}, …]}`. Use `"crop": "kling"` only for a watermarked Kling URL, and 96 frames per 5 s scene or 120 per 10 s.
- For Lovable (clinics): the film URLs (pieces in order), the poster stills, the scroll section each one belongs
  to, the captions as `[VERIFY WITH CLINIC]` and the "Illustration for education only" label. Lovable has no
  frame-cutting build step like the site kit, so tell it to scrub the video itself (frames extracted in the
  browser, as `brief.js` `WB_CINEMATIC` describes). Prefer 5-second pieces: they scrub more smoothly than 10-second
  ones.
- Append what worked and what failed to [[06_Prompt_Log]]. That is how the director gets better every project.
