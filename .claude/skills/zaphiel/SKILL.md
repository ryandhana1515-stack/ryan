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
