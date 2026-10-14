---
tags: [zaphiel, skill-pack, marketing, platforms]
status: active (specs to recheck before each campaign)
version: v4 (2026-10-12)
---
# Platform Playbooks

Before each campaign, recheck the current specs and features on the platform's own help pages. Never assume a UI
feature exists in the API. The ad API facts are in [[01_Tool_Library]] and [[Knowledge/Ad platform APIs — what each can do (2026-10-03)]].

## Facebook & Instagram (Meta)
- **Formats:** Reels and Stories 9:16; feed 4:5 or 1:1. Keep text inside the safe zones of Reels and Stories.
- **Objectives for SMEs:**
  - **Leads**: instant form or website.
  - **Click-to-WhatsApp**: messages.
  - **Website conversions.**
- **Trade-offs:**
  - Instant forms are cheap but can bring low-quality leads, so add qualifying questions.
  - WhatsApp gives a warmer conversation but needs a fast reply (John, or staff within minutes).
  - A landing page gives the most control but needs the pixel + Conversions API.
- **Audiences:** broad audiences often work when the creative is strong. Special ad categories (housing, employment,
  credit, social issues) limit targeting.
- **Tracking:** pixel + Conversions API. For WhatsApp, count conversations started and first replies, then confirm
  outcomes in the CRM.
- **Learning:** avoid frequent edits and big budget jumps (see [[02_Diagnosis_Playbook]] section 3).
- **Beauty, health, finance, property:** check Meta's ad policies and Singapore's ASAS code. Property also has the
  Singapore Property pack rules ([[70_Industry_Packs/Singapore_Property/05_Marketing_Advertising_Rules]]).

## TikTok
- **Native creator-style content wins.** Polished "ad-looking" videos often underperform.
- **Hook in the first 1–2 seconds.** Captions on. Trends and sounds: use only sounds cleared for commercial use (the
  Commercial Music Library). Check this in [[01_Tool_Library]].
- **Spark Ads:** boost organic or creator posts, only with the creator's authorisation code.
- **Formats:** 9:16, about 9–34 seconds works for most SME offers. Test several hooks on the same body.
- **Objectives:** lead generation (instant form), messages, website conversions. Check what is available for the account's
  region at the time.

## YouTube (Google Ads)
- **Shorts:** 9:16, native style.
- **In-stream:** hook before the skip button (about 5 seconds). Brand and offer early.
- **Campaigns:** Demand Gen and video campaigns through Google Ads. Check API support for the action needed before
  promising automation.
- **Best for:** longer explainers, demonstrations and retargeting people who already engaged.

## Content planning (organic, by brand)
For each brand:
- personas;
- value propositions;
- 3–5 messaging pillars;
- objection-handling posts;
- a monthly content calendar;
- organic ideas that test angles cheaply before ad spend.

Branding Studio (content) and Ads Analytics (results) are separate pieces, and both report to the Marketing Director.

## v5 additions (2026-10-14)
From Ryan's **Marketing OS v5** (2026-10-14). Additions only.

**Where things now live:**
- Objectives, lead destinations and formats for Meta, TikTok and YouTube/Google: [[09_Ad_Formats]].
- Total budget, small-budget structure, platform minimums, testing, scaling, naming, UTMs, timezone and currency:
  [[10_Budget_Structure_Rules]].
- What our tools can do by API on each platform: [[11_Capability_Register]].

**Platform facts not already above** (seen in search 2026-10-14; recheck in the account):
- **Meta:** the objective cannot be changed after the campaign is created (⚠️ third-party). Click-to-WhatsApp needs the
  WhatsApp number linked to the Facebook Page (⚠️ third-party). Special ad categories: housing, employment and financial
  products and services remove some targeting (✅ category names on developers.facebook.com).
- **TikTok:** Website Conversions and Product Sales are being merged into one **Sales** objective in a phased rollout;
  TikTok Shop ads run only as **GMV Max** since July 2025 (✅ ads.tiktok.com/help/article/sales-advertising-objective-tiktok).
  **Minimum daily budget: campaign $50, ad group $20** (✅ ads.tiktok.com/help/article/budget; SGD equivalent: recheck). A
  campaign budget lower than the ad group budget can cause delivery problems. Lead generation uses an Instant Form and
  needs a privacy-policy URL (✅).
- **YouTube:** non-skippable in-stream ads can now be up to 60 seconds; bumpers are 6 seconds; skippable ads can be
  skipped after 5 seconds (✅/⚠️ support.google.com/google-ads/answer/2375464). Video Action campaigns have moved into
  **Demand Gen** (⚠️ third-party).
