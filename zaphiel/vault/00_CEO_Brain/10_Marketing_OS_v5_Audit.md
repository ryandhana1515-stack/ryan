---
tags: [zaphiel, ceo-brain, marketing, audit, v5]
date: 2026-10-14
owner: Ryan
---
# Marketing OS v5 — audit, merge plan, Omneky checklist, costs, milestones

Answer to section 20 of Ryan's master prompt (2026-10-14). Status labels: PLANNED • CODED • MOCK TESTED • SANDBOX TESTED
• PRODUCTION VERIFIED; for connections: CONNECTED • NOT CONNECTED • BLOCKED.

## 1. Inventory (what already exists)
| Piece | Status |
|---|---|
| **Marketing Director** ("Marketing Brain") `.claude/agents/marketing-director.md` | CODED; v5: voice commands, CAMPAIGN_ORDER, one approval code, safety words, delegation, permissions |
| **Ads Intelligence** `ads-intelligence.md` | CODED; v5: workers Reporting + Tracking & CRM Attribution, §8.5 output fields |
| **Market Research** `market-research.md` | CODED; v5: workers Competitor Research + Audience & Offer Planning, injection safety |
| **Creative Brain** `creative-brain.md` (was `creative-producer.md`) | CODED; v5: workers Copy & Script, Image & Video Production, Campaign Preparation |
| `marketing-brain.md` (old read-only quick win) | RETIRED 2026-10-14 (rules live in ads-intelligence + director) |
| Cinematic Director, TITAN, ATLAS, John | CODED / live (John on WhatsApp via n8n). Delegation lines in the director |
| Diagnosis engine `ceo-brain/agents/marketing/diagnose.js` | MOCK TESTED (§38) |
| Permission + guard engine `autopilot.js` (v2) | MOCK TESTED (§40); approval-first since 2026-10-14 |
| Orders / budget maths / proposals / approvals `campaign-order.js` | MOCK TESTED (§42), new |
| n8n **Marketing — Ad Actions** `oMMIvt8PZOmUp24K` (Meta pause + daily budget, guard re-check, read-back, ledger) | CODED + pinned-tested + deployed **unpublished**; no Meta credential → not live |
| n8n tables `mk_autopilot_ledger` (done) + `mk_proposals` (waiting for Ryan) | CREATED (empty) |
| Daily routine `ceo-brain/agents/marketing/ROUTINE.md` ("Marketing Daily") | CODED; **not scheduled** (creating it was blocked by Claude Code's safety check; needs Ryan's OK) |
| Knowledge pack `60_Skill_Packs/Marketing_Team/` 00–13 + Brands | 00–08 v4 + v5 sections; 09–13 new |
| Layer 2: Fusion EDG Core Marketing module (Metricool connector, daily sync, findings, Atlas dashboard) | CODED + MOCK TESTED on staging (repo `fusion-edg-core`, not opened today) |
| Old n8n tables "Ad Drafts", "Content Queue", "kling_queue", "viral_engine_runs" | BioGreen-era, separate business: not used |
| **Metricool** MCP | CONNECTED (read + post scheduling; no ad campaign control). FusionTech pages connected, Brow Revolution nothing |
| **Supermetrics** MCP | CONNECTED; **can manage Meta/TikTok/Google campaigns** (created PAUSED); no ad account authenticated yet |
| **Omneky** MCP | NOT CONNECTED, not paid |
| Meta / TikTok / Google native APIs | NOT CONNECTED (Meta credential needed for Ad Actions) |
| Higgsfield, Kling, Canva | CONNECTED (credits need approval) · Figma view seat · ElevenLabs earlier 403 (UNVERIFIED) |
| Atlas CRM attribution | Lead stages exist (EDG Core + n8n `ceo_leads`); **gap:** John's intake doesn't read Meta's WhatsApp referral (ad id) yet |

## 2. Reuse / merge (done, reversible in git)
- Marketing Brain = Marketing Director (one agent). Creative Brain = Creative Producer (renamed file). `marketing-brain.md`
  retired. Workers are task templates inside the 3 managers, not new agents.
- Kept and upgraded: diagnosis engine, guard engine, Ad Actions workflow, ledger, knowledge pack, Brand Brains.
- Nothing new was created that duplicates Atlas, a CRM, a dashboard or a database. Two n8n tables only (ledger,
  proposals), inside the existing n8n project.
- Diffs of every changed existing file: [[80_Clients/_Test/marketing-team-v5/v5_DIFFS]].

## 3. Omneky verification checklist (full list: [[60_Skill_Packs/Marketing_Team/13_Provider_Evaluation]])
- ✅ MCP endpoint and OAuth; 12 MCP tools listed (analyze_performance, generate_image_ad, generate_video_ad,
  generate_avatar_ad, score_creative, launch_campaign, get_brand_kit, list_creatives, get_campaign_insights,
  create_source_from_url, pause_or_scale, compare_channels); spend waits for an explicit "go".
- ✅ Prices: Lite US$29 (200 credits), Standard US$99 (1,000, 3 brands, avatars from here), Pro US$249 (4,000),
  Enterprise custom; 7-day trial auto-converts (card requirement not stated).
- ❓ **Which plan includes the MCP/API: not stated anywhere. Ask in writing.**
- ❌ **Standard terms forbid using the service "for the benefit of a third party"** → no client/agency/white-label use
  without a written agreement.
- REST API = creative jobs only; campaign control is MCP-only. Ad Library research is in the web app, not in the MCP list.
- "Analysis/launch free" conflicts with a blog saying insights cost credits. Token renewal undocumented.
(All from vendor pages via search results; pages could not be opened directly today: recheck before paying.)

## 4. Costs that need Ryan's approval
| Item | Cost (verified on vendor pages, recheck) | Card / renews | Why now | If we skip it |
|---|---|---|---|---|
| Omneky | US$29–99/mo (avatars need Standard US$99) | trial auto-converts | creative + execution pilot Ryan prefers | Supermetrics + Higgsfield/Kling cover the pilot |
| Supermetrics | campaign management free with a subscription; Starter ≈ US$55/mo (14-day trial, no card) | paid plans auto-renew | already connected; manages Meta/TikTok/Google | Metricool for reading + Ad Actions for Meta |
| Ad spend (pilot) | the tiny budget Ryan sets | Meta billing | acceptance test M | no live proof |
| Kling / Higgsfield credits | per job (price check first) | existing plans | new creatives | real footage only (S$0) |
| Anthropic API key (Layer 2 product only) | usage-billed | — | dashboard backend | Layer 1 keeps running in Claude |
| Firecrawl top-up (optional) | — | — | deeper research | web search only |

## 5. First 3 milestones
1. **Connect read-only + facts (free):** Ryan links Brow Revolution's Meta ad account (Supermetrics trial or Metricool),
   confirms the Brand Brain facts, sets the daily cap and target CPL → first real report (T1 on real data).
2. **Tiny pilot on Ryan's own account (needs approval):** one CAMPAIGN_ORDER → proposal → APPROVE → campaign created
   PAUSED → read back → enable at a tiny budget → pause/resume → reconcile with Ads Manager (acceptance M).
3. **Run daily:** schedule "Marketing Daily" (report + proposals + approval codes by phone), then start Layer 2
   (dashboard) phases 1–2 in `fusion-edg-core`.
