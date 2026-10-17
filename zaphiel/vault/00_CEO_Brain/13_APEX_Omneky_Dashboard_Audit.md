---
tags: [zaphiel, ceo-brain, apex, omneky, dashboard, audit]
date: 2026-10-17
status: report to Ryan; build waits for his approval of the plan
sources: "[[Knowledge/APEX + Omneky Production Integration Directive (2026-10-17)]] · [[60_Skill_Packs/Marketing_Team/16_Omneky_Production_Verification]]"
---
# APEX + Omneky + Fusion dashboard — Phase 1 audit and Phase 2 verification

## Phase 1 — what is already built
**Brain repo (`ryan`):** APEX + Ads Intelligence, Market Research, Creative Brain, Campaign Operator (`.claude/agents/`);
engines in `ceo-brain/agents/marketing/`: diagnosis (`diagnose.js`, money view), permissions + guard (`autopilot.js`),
orders / budget maths / proposals / approval codes (`campaign-order.js`); n8n "Marketing — Ad Actions" `oMMIvt8PZOmUp24K`
(Meta pause/budget, unpublished, no Meta token); n8n tables `mk_proposals`, `mk_autopilot_ledger`; 172 tests.
These run in Claude/Claude Code — **not yet inside the customer dashboard.**

**Platform repo (`fusion-edg-core`, origin/main a7daf6c) = the dashboard in Ryan's screenshot:**
| Area | Real today | Notes |
|---|---|---|
| Hosting | one Vercel Function (`apps/api/src/vercel.ts`), Supabase Postgres (`fusion-edg-dev`), migrations 001–043, cron `/cron/tick` (Vercel daily + Supabase pg_cron every minute) | raw Node handlers, no framework |
| Tenancy + roles | FORCED RLS on every tenant table (`organization_id`), `withTenant`; roles owner…viewer; Fusion Master Control with MFA; per-org module switches (`organization_modules`, enforced in routes, UI and RLS) | cross-tenant test exists |
| Dashboard | vanilla-JS SPA `apps/api/public/app.html`: Home (real SQL: leads, appointments, won, revenue from payments, sources, priorities, activity), Ask Atlas (real Claude call), CRM, Appointments, Inventory, Finance, Reports, Marketing, AI Workforce, HR, Approvals, Integrations, Settings | Communications, Branding, Orders, Projects, Documents pages don't exist yet |
| Marketing page | **read-only, minimal**: ad accounts, campaign/ad-set/ad counts, sync status, connection (Metricool or example data) | no spend, CPL, findings or health on screen |
| Marketing data | migration 026: accounts, entities (campaign/ad set/ad), daily base metrics (micros), sync runs, targets, rule settings, findings, entity status, **attribution_events** (UTM, fbclid, ctwa_clid, wa_referral, ad/adset/campaign ids), reports; 027 marketing_connections; Metricool connector + daily sync (`packages/adapters/src/metricool.ts`, `marketing-sync.ts`) | findings, targets, status, attribution, reports **tables exist but nothing writes them** |
| AI Workforce page | real: `ai_agents`, `automations`, last 20 `automation_runs` with statuses, agent replies, monthly AI cost | closest existing "activity" view |
| Approvals + audit + jobs | Approval Center (domain drafts), engine approvals table (L0–L5, scope hash), append-only `audit_logs`, outbox `events`, `idempotency_keys`, `agent_reply_jobs` | no ad-campaign proposals yet |
| CRM chain | leads (source, channel, utm jsonb, stage, value), Meta Lead Ads webhook stores ad_id/form_id, appointments (no double booking), quotes → invoices → payments, timeline, follow-up engine | **WhatsApp webhook does not parse the click-to-WhatsApp `referral`**; no orders table |
| Secrets | `secret_ref` names only; OAuth (Xero, Google Calendar) tokens AES-256-GCM; split-key credential form (Vault half + Vercel half) | no Meta/TikTok/Omneky OAuth yet |
| Server AI | `AnthropicAgentModel` (`@anthropic-ai/sdk`, default `claude-sonnet-5`, env `ANTHROPIC_API_KEY`), used by WhatsApp agent, automations, Ask Atlas, HR, daily brief; usage logged | APEX not wired here yet |
| Omneky / Meta Marketing API / APEX | **none in the platform** | — |

## Phase 2 — what Omneky can actually do (official pages via search; site blocked for direct reading)
- **REST API (X-API-Key):** creative jobs only — image and video ad generation (10 requests/min per key; credits per job).
- **MCP (OAuth sign-in in a browser):** analyze performance, insights, compare channels, list creatives, score creative,
  generate image/video/avatar ads, **launch campaign**, **pause_or_scale** (whole campaign), brand kit. Spend actions wait for
  an explicit "go" in the conversation.
- **UNKNOWN:** whether a production server may use the MCP unattended (token refresh, no person present), pausing a single
  ad, drafts/paused creation, separate ad sets, per-ad reads, Ad Library via MCP/REST, formal randomized A/B, which plan
  includes MCP/API, MCP rate limits, the CLI (no package found).
- **Licence:** standard terms forbid use "for the benefit of a third party" and say Omneky owns the generated ads; our
  licence covers only our own campaigns while subscribed. Possible one ad account per channel; possible ad-spend fee in the
  terms (conflicts with their contact page). → client use needs a written agency/Enterprise agreement.
- Details and sources: [[60_Skill_Packs/Marketing_Team/16_Omneky_Production_Verification]].

## Recommended production architecture (no rebuild)
DASHBOARD (`app.html`) → BACKEND (`apps/api`) → APEX ORCHESTRATION (server-side Claude via the existing
`AnthropicAgentModel`, APEX jobs + steps as real events) → AUTHORISED TOOL EXECUTION (existing `executeTool` + approvals
+ audit + idempotency) → providers:
- **Creative:** Omneky REST (X-API-Key in the split-key credential store), Kling/Higgsfield where approved.
- **Read + launch/pause/budget on Meta (and later TikTok):** our own Meta Marketing API connector (free; Brow's own
  account via a System User token first; other clients via Meta app review + OAuth).
- **Omneky MCP for campaigns:** only if Omneky confirms in writing that a server may use it and agency use is allowed.
- **Metricool:** keeps its daily read sync as a supporting source.

## Phases (Ryan's order) and what each needs
| Phase | Build | Needs Ryan |
|---|---|---|
| 3 Read-only connection | Brow pilot organisation in the platform; Metricool sync of Brow's Meta account into the existing marketing tables; Marketing page shows spend/leads honestly | link Brow's Facebook Ads in Metricool (or a read-only Meta token) |
| 4 APEX activity | `apex_jobs` + `apex_job_steps` (tenant tables, RLS) written by real backend events; "APEX — AI Workforce Activity" page (stages, specialist, timestamps, blockers, approvals, result, history) | — |
| 4b CEO marketing screen | money view (spend, enquiries, qualified, appointments, sales, revenue) from Atlas + marketing tables; best ads / needs attention / recommendations / approvals / connections; View Details for ratios | — |
| 5 Creative + preparation | Omneky REST creative adapter; findings engine (port of `diagnose.js`) writing `marketing_findings`; campaign preview + proposal | Omneky subscription + API key (secure form) for live creative |
| 6 Approval + execution | proposals in the Approval Center bound by hash; Meta connector create (paused) → approve → enable; pause/resume/budget; read-back; audit | Meta System User token for Brow's ad account; tiny budget |
| 7 Attribution | parse WhatsApp `referral` (ctwa_clid, ad id) into `attribution_events` + lead; John qualification; appointments/payments → revenue per ad | — |
| 8 Multi-client | per-org Meta/Omneky credentials, module switch "marketing" per client, licence check before Omneky for clients | Omneky written agreement; Meta app review for client accounts |
