---
tags: [zaphiel, ceo-brain, roadmap]
owner: Ryan
version: 1 (2026-10-15)
---
# Fusion AI roadmap (one platform, many companies)

Ryan's master system update (2026-10-15). Upgrade what exists; do not rebuild.

## The workforce
| Agent | Owns | Where it lives today |
|---|---|---|
| **JOHN** (primary, customer-facing) | enquiries, sales conversations, qualification, requirements, follow-up, appointments, Atlas CRM updates; coordinates ATLAS, APEX, TITAN | n8n Lead Intake `b7kbJpnKLN2uQxyn` + WhatsApp Inbound `3IhIJ5IYsB7wQQSg`; playbook [[Knowledge/John — Sales playbook]] (read live) |
| **ATLAS** | CRM, EDG, operations, integrations | `.claude/agents/atlas.md`, n8n ATLAS `9XQWSgTBszRc0Jxj`, Fusion EDG Core (multi-tenant, RLS) |
| **APEX** | marketing strategy, ads, creative, optimisation | `.claude/agents/marketing-director.md` + ads-intelligence, market-research, creative-brain; engines in `ceo-brain/agents/marketing/` |
| **TITAN** | websites, landing pages, 3D, SEO | `.claude/agents/titan.md` (+ titan-seo, titan-qa, cinematic-director, website-intelligence) |

## Platform rules
- Every client is a separate tenant: company info, brand knowledge, CRM records, ad accounts, AI configuration,
  workflows, integrations, permissions, reports (EDG Core RLS; per-brand notes in the vault).
- **Brow Revolution = first pilot company**, never a default or hard-coded value (checked 2026-10-15: no Brow Revolution
  data in platform code; it lives only in `Brands/BROWREVOLUTION/` and its own client records).
- **Messaging:** John is the sales intelligence on any supported channel (WhatsApp Cloud API first, website chat,
  email). Respond.io = optional provider, not a priority; working client integrations are kept.
- **Marketing tools:** Omneky preferred for execution (Ryan approved Standard; he connects it), Metricool kept for
  reporting until compared, Meta/TikTok own APIs as the free fallback. No Supermetrics or other extra platforms.
- Approval first for anything that spends or publishes (Marketing OS v5).

## Current priority: APEX end to end, verified on the Brow Revolution pilot
| Step | What proves it | Status |
|---|---|---|
| 1. Read-only connection | Brow Revolution's Meta ad account (+ Page, Instagram) linked in Metricool; APEX reads real spend/leads/CPL | ⏳ Ryan connects |
| 2. RESEARCH | competitor + audience + offer scan for the pilot | ✅ done (T3, refresh when live) |
| 3. CREATE ADS | five genuinely different angles, copy, scripts, creative brief; creatives via Kling/Higgsfield (HeyGen/Gemini optional, paid) | ✅ brief (T5); production waits for approval + facts |
| 4. PREVIEW + APPROVE | CAMPAIGN_ORDER → honest budget maths → preview card → `APPROVE <code>` | ✅ code (T4, §42) |
| 5. LAUNCH (one controlled campaign) | created paused → approved → tiny budget live → verified | ⏳ needs Omneky connected (or the Ad Actions path with a Meta token) + Ryan's budget |
| 6. MONITOR + DIAGNOSE | daily real-data diagnosis, tracking check, fatigue, lead quality | ✅ engine (§38); ⏳ real data |
| 7. OPTIMISE | kill/keep/scale as proposals; one-tap pause | ✅ engine (§40); ⏳ live |
| 8. REPORT | qualified leads, appointments, sales, revenue from Atlas CRM; platform vs CRM separate | ⏳ needs John's WhatsApp ad-referral capture + Atlas attribution |

## Next build items (free, no new subscriptions)
1. John's WhatsApp intake stores Meta's click-to-WhatsApp referral (ad id, campaign) on the lead → attribution.
2. APEX screens in the Fusion AI dashboard (Atlas app): report, "why this ad is bad", Turn off, preview, Approve —
   tenant-scoped, on demo data until accounts are linked.
3. Schedule "Marketing Daily" (`ceo-brain/agents/marketing/ROUTINE.md`) once Ryan OKs it.
4. Pilot tenant for Brow Revolution in EDG Core (its own company record, CRM, John configuration) when Ryan says go.

## Later
- Client onboarding: each client links its own ad accounts, WhatsApp number and permissions in the dashboard.
- Meta / TikTok app review for managing client ad accounts through their own APIs (free, takes weeks).
- Omneky agency terms (written) before any client use of Omneky.
