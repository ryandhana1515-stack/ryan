---
name: zaphiel
description: Zaphiel operations manual — how to actually DO things for Ryan's business with the connected tools. Use whenever the task is operational — make a UGC or product video, generate product images or voices, post or schedule social content, run or draft ads, check or change the Shopify store, convene the Board of Advisors, run business routines, or command the n8n agent fleet. Read zaphiel/memory.md first for current state.
---

# Zaphiel Operations Manual

State lives in `zaphiel/memory.md` (read it first; update it after real changes).
This file is the HOW. Compliance rule for everything public: support/promote language,
never cure/treat/diagnose.

## 1. UGC videos (talking-head / creator-style)

Use the **Higgsfield** connector — it has ready-made multi-step workflows:
1. `get_workflow_instructions` (no args) → catalog; pick the UGC / talking-head (or
   ad/commercial/explainer) workflow; call again with that name and follow it exactly.
2. Voice: pick from `list_voices` or use ElevenLabs `text_to_speech` for the VO.
3. Script: write it yourself from BIO N:OV facts (memory §1) + winning hooks in the
   account skill; run `virality_predictor` on the finished cut when it matters.
4. Batch variants with `generate_video_batch` + `jobs_wait`.
5. Publishing: `tiktok_prepare_publish`/`tiktok_publish` (direct) or hand the file to
   Metricool (§3) for scheduled multi-platform posting.
Cost note: generation spends Higgsfield credits (`balance` to check). Confirm with Ryan
before large batches.

## 2. Product videos & images

- **Product images:** Higgsfield `generate_image` (or batch); `remove_background`,
  `upscale_image`, `outpaint_image`, `reframe` for edits. Existing brand assets:
  `bionov/assets/` in this repo. Brand: deep navy/black + cyan #00DCFF, premium
  scientific Korean-tech feel.
- **Cinematic product shots → motion:** Kling `image_to_video` (confirm before
  submitting — every Kling job is charged; `who_am_i` first per its rules), or
  Higgsfield `generate_video` with a product-ad workflow from the catalog.
- **3D:** Higgsfield `generate_3d` turns a product image into a GLB mesh (the bionov
  site already renders three.js scenes).

## 3. Posting & scheduling (Metricool = "social media automate" connector)

- `getBestTimeToPostByNetwork` → pick slot → `createScheduledPost` (draft:true for
  approval-gated content — the Viral Content Engine convention is NEVER auto-publish).
- `getScheduledPosts` / `updateScheduledPost` to manage the queue;
  `getAnalyticsDataByMetrics` for performance readouts.
- Content sources: n8n **Content Queue** table (daily drafts land there at 09:00) and
  the Viral Content Engine output.

## 4. Ads (Meta)

- Drafts already generated weekly into the **Ad Drafts** n8n table (Mon 10:00).
- Live ad ops via the `meta ad` connector: `ads_get_ad_accounts` →
  campaigns/adsets/ads/creatives; `ads_insights_*` for performance;
  `ads_library_search` for competitor research. Health-ad policy applies — reuse the
  compliance-checked framings from Ad Drafts.
- Spend decisions above ~$100 → convene the Board (§6) first while revenue is $0.

## 5. Store & pricing (Shopify)

- Shopify connector: `get-shop-info`, `create-product`/`update-product`, collections,
  `run-analytics-query` (ShopifyQL) once live. Store is NOT live yet — getting it live
  is open-loop #1 in memory.
- Pricing is undecided: when setting it, convene the Board with landed cost + competitor
  prices in the brief, then record the decision in memory §5.

## 6. Board of Advisors (decisions with teeth)

Convene when Ryan says "ask the board about X" or before big irreversible calls:
1. Build the brief yourself from LIVE sources (Shopify analytics once live, Meta
   insights, Metricool analytics, memory §1). Never invent numbers; say "no data" when
   there is none. Short brief = 3-5 lines for seats; full brief = everything, chair-only.
2. Fan out ONE isolated subagent per seat (Agent tool, model sonnet). Each subagent may
   read ONLY its own dossier (`board/dossiers/<id>.md`) — never another dossier, the
   factcheck dir, or the web — and returns strict JSON
   {abstain, position, reasoning, citations, confidence, would_change_mind}.
   Never role-play multiple seats in one call; never let a seat see another's opinion.
3. Gate deterministically: write the raw outputs to a scratch file as
   [{seatId, raw}, ...] and run `node board/meeting.js opinions.json` — it strips
   citations the seat wasn't shown, coerces every scalar, and snapshots cited sources.
4. Chair it YOURSELF from the gated opinions + full brief + each seat's blind spots:
   name the split before the agreement, discount via documented blind spots, treat
   abstention as abstention, flag "user"-verified citations as Ryan's own assumption.
   Write chair JSON, re-run `node board/meeting.js opinions.json chair.json` so the
   unanimity + prose guards apply to YOUR summary too.
5. Store + email: POST the meeting record to n8n webhook workflow `6go4TpVkwmoO1tnd`
   (path `board-store`) via the n8n connector execute_workflow (webhook input) — it
   inserts into board_meetings and emails Ryan. Then relay the summary in chat, leading
   with the split.
   (n8n workflow `NOb10f0yUA8i8saA` does all of this self-contained but needs n8n AI
   credits/an Anthropic key — currently exhausted; see memory §4.)
4. Monthly standing review: same workflow with unprompted:true and no question — the
   board sets its own agenda from the numbers.
Seat editing: retire doctrine entries (add `**Status:** retired`), never delete or renumber;
never hand-set Verification — substantive edits drop to `user` until re-fact-checked.

## 7. Routines (always-on cadence)

Existing (don't duplicate): daily market brief email 07:50 SGT; content drafts 09:00;
manager daily summary 18:00; weekly manager report Mon 07:00; research scan Mon 08:00;
ad drafts Mon 10:00. All indexed with IDs in memory §2.
Adding a new routine: prefer an n8n Schedule Trigger workflow (always-on) over
session-local scheduling; register it in memory §2 after creating it.

## 8. Command the agent fleet

- n8n connector `execute_workflow` runs any workflow by ID (memory §2 has the map);
  chat-triggered agents (AI Manager, Website Designer) accept `{type:"chat", chatInput}`.
- Leads: Leads CRM table. Customer questions: 24/7 CS agent. Voice callback: POST
  /call-me workflow. New affiliate: /affiliate-signup webhook.

## 9. Cinematic "3D scroll" websites (a sellable product, not a one-off)

Ryan's own playbook, executable: `zaphiel/playbooks/cinematic-3d-sites.md`.
Reusable engine: `zaphiel/templates/cinematic-scroll/` (scroll-scrub, smooth scroll,
pinned reveals, parallax — no dependencies).

The formula, non-negotiable because it is what makes it look expensive:
1. ONE named hero subject.
2. Generate ONE hero image FIRST (Higgsfield `generate_image`), then pass it as the image
   reference to every clip. This is the whole trick — it keeps the subject identical.
3. Three clips, always ORBIT -> MACRO -> EXPLODED/ASSEMBLY. Seedance 2.0, std, 1080p,
   16:9, no audio, ~8s. Batch with `generate_video_batch` + `jobs_wait`. Kling
   `image_to_video` is the alternative for cinematic product motion (every job is
   charged — confirm before submitting, never send trial jobs).
4. ffmpeg the orbit into ~120 stills; the template scrubs them on scroll.
5. Sections: hero -> story -> detail scrub -> specs -> scarcity/price -> private CTA.
6. Dark ground, ONE accent, serif display + minimal sans, very few words.
7. Open it and scroll it before saying it is done.

Per client only four things change: accent colour, type pairing, specs/price, CTA.
Five ready briefs (real estate, resort, automotive, airline, D2C retail) are in the
playbook; build the retail one with the real BIO N:OV bottle first — it doubles as the
demo for every retail pitch.

**Compliance gate before any wellness build goes public** (learned on `bionov/`): no named
diseases anywhere, no efficacy numbers on disease markers, lab data labelled as lab data,
support/promote/help-maintain only, and carry the not-intended-to-diagnose line.

## 10. Watching and analysing video (Zaphiel can study a reference, not just make one)

Ryan often points at a creator or a clip and says "I want that". Do not eyeball a
thumbnail and guess — actually analyse it.

**Scene-by-scene analysis** — Higgsfield `video_analysis_create`, then poll
`video_analysis_status` every 30-60s (takes 3-5 min). It accepts EXACTLY ONE of:
- `youtube_url` — a youtube.com / youtu.be link. Direct, no download needed.
- `video_input_id` — the media_id of a video already in Higgsfield.

**TikTok and Instagram links are NOT accepted.** For those, one of:
1. Ask Ryan to save the video (TikTok Share > Save video, or a screen recording) and
   upload it in chat. Then `media_upload` / `media_confirm` it into Higgsfield and pass the
   returned id as `video_input_id`.
2. If a direct file URL exists, `media_import_url` fetches it server-side — this works for
   public raw links (it succeeded on raw.githubusercontent.com), but NOT for a TikTok page
   URL, which serves HTML rather than a video file.
3. For a quick read without Higgsfield, a video uploaded to the chat can be inspected
   locally: `pip install av`, then extract frames with PyAV and look at them directly.
   That is how the Z.E.R.O. reference clip was analysed on 2026-08-08.

Accuracy note to pass on: the longer the video, the weaker the scene-by-scene breakdown.
Short clips give the most reliable results — analyse one strong video, not a whole profile.

**Engagement read** — `virality_predictor` scores hook strength, attention curve, retention
risk and audience response. Use it on a reference to learn why it worked, and on Ryan's own
cut before it goes out.

**The point of analysing:** feed what you learn straight into the build. Extract the hook
pattern, the shot rhythm, the on-screen text cadence and the character look, then run
§9 (cinematic sites) or the Higgsfield UGC workflow with those as the brief. If the
reference is an AI persona that reappears across many videos, the thing holding it together
is a character sheet — call `get_workflow_instructions` with `{ workflow: "character-sheet" }`
and lock one reference image FIRST, exactly like the hero-image rule in §9.

## 11. THE AD LAB — one sentence in, finished ad creative out

Ryan's target, sent 2026-08-11: @hugovar.ai's "AI AD LAB" — he speaks *"make me five ads for
Manscaped"*, and finished, brand-quality static ads appear. **This is the headline capability
Zaphiel is judged on.** Full procedure: `zaphiel/playbooks/ad-lab.md`. Read it before starting;
the short version:

1. **Scan the brand** — WebFetch the site and product pages for the real product name, pack
   size, palette and CTA wording. `mcp__meta_ad__ads_library_search` shows the ads a brand is
   running *right now*, which beats guessing the category's angles. For BIO N:OV the reference
   photo is `bionov/assets/hero-product.jpg`.
2. **Import the product photo** with `media_import_url` (direct file URL only — a page URL
   fails) and pass the returned id as `medias: [{role:"image", value:<media_id>}]`. Without a
   reference the model invents the packaging and the ad is useless.
3. **Write five prompts across five different archetypes** — keynote hero, clinical proof,
   lifestyle flat-lay, macro texture, typographic poster. 80–150 words each, specifying
   backdrop, lighting reference, product placement, lens and angle, then the headline
   **verbatim in quotes** with its weight, case, hex colour and position, then the CTA pill.
   Prompt length and specificity are where the quality lives.
4. **Generate** with `generate_image_batch`, `model: "gpt_image_2"`, `quality: "high"`,
   `resolution: "1k"` — the exact stack in the reference video. `jobs_wait` to poll, then one
   `show_generation_by_ids`. `1:1` feed, `9:16` stories.
5. **Animate only when asked** — the winning still into `generate_video` or Kling
   `image_to_video`; small deliberate motion.
6. **Deliver** into `zaphiel/adlab/<brand>-<date>/`, commit, push, and **report the exact
   credit cost** (`balance` before and after). Never burn generation credits silently.

**Compliance gate runs on every headline before generation** — never cure/treat/prevent/heal/
diagnose, never name a disease. Sell the standard, the origin, the format, the ritual. Never
invent BIO N:OV's price; it is not decided.

**By voice:** the app routes an instruction (not a question) to `/api/dispatch`, which fires
the Routine and wakes a session holding the Higgsfield connector. That needs the Routine
created *with connectors* from claude.ai/code/routines plus an API trigger token in Vercel —
see `zaphiel/routines/daily-operator.md`. Until then the endpoint returns `not_configured` and
Zaphiel says so aloud rather than pretending work began.
