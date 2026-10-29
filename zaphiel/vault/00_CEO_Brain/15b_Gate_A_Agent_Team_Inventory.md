# FusionTech AI: the agent team today, mapped to the target org chart

Audit date: **2026-10-29**. This was a read-only audit. Nothing in either repository was changed.
`node ceo-brain/tests/run-tests.js` ran with **172 passed, 0 failed** and left the working tree clean.

## Where the evidence comes from

**Brain repo, `/home/user/ryan`**
- Local checkout is branch `claude/inspiring-cori-j5wemu` at `73d8ac5`.
- The remote default branch is ahead of it only by hourly commits from the n8n Management view. These were checked through the GitHub API; the latest is `271b419`, 2026-10-29 15:07Z.
- Files used:
  - `CLAUDE.md` and `.claude/skills/zaphiel/SKILL.md`
  - vault notes `Agents.md`, `CEO Brain.md`, `Decisions.md`, `Open loops.md`, `Change log.md`, `00_CEO_Brain/*`, `Knowledge/agents.json`
  - `ceo-brain/` (agents, workflows, `database/n8n-data-tables.json`, `workflows/README.md`)
  - `.claude/agents/*.md`

**Platform repo, `/home/user/fusion-edg-core`**
- Files used: `apps/api/src/app.ts` (the timer and webhooks), `packages/crm/src/{agents,brief,automations,omneky,apex-ceo,dashboard}.ts`, `docs/BACKGROUND_WORK.md`.

**Live systems, all queried read-only**
- **Supabase `fusion-edg-dev`** (`umuzxrxredctpbveqxlt`, Tokyo): `cron.job`, `cron.job_run_details`, row counts in organizations, leads, conversations, channel_accounts, ai_agents, automations, automation_runs, apex_events, agent_actions, apex_reports, omneky_links and agent_registry.
- **Claude scheduled tasks** (`list_triggers`): only one exists.
- **n8n MCP:** **not available in this session.** The connector needs authorisation in claude.ai connector settings. Live n8n state (active flags, execution history) therefore comes from the vault, the repo and git commits. It was not read from n8n directly.

Status words used below:
- **LIVE**: there is recent evidence it runs.
- **BUILT**: it is deployed or exists, but there is no recent proof it is used.
- **PARTIAL**: some of the role is covered.
- **DESIGN-ONLY**: a note or subagent prompt exists, but nothing runs.
- **MISSING**: nothing fills the role.

---

## 1. NOVA (CEO Brain)

Nothing is called NOVA anywhere in either repo or the vault (searched: no hits). The "CEO Brain" role is spread across six pieces:

| Piece | What it is | State and evidence | Connected to |
|---|---|---|---|
| **CEO Orchestrator (Agent #0)** n8n `8Ix4yc223sxrSu5h` | `POST /webhook/ceo-brain/event` plus an hourly run (`7 * * * *`). It routes events, opens exception tasks and writes `00_CEO_Brain/Management view.md`. No AI. | **LIVE.** Hourly "vault: management view" commits by "Zaphiel (n8n)" continue up to 2026-10-29 15:07Z. The view has read **"68 unresolved, 20 high" without change since 2026-10-27**, so nobody is clearing it. | GitHub (vault), Gmail, n8n tables |
| **Approval Inbox** n8n `r4ynzcSqRy8zHoFl` | `/webhook/ceo-brain/inbox`, protected by a PIN. | **BUILT.** 19 approvals have waited 640–760 hours (Management view). | Approve Reply `uQxHTTdEkazgKpRT`, `ceo_tasks` |
| **Daily Brief / "CEO Intelligence Agent v0"** n8n `Pew2PX1IcgdXqXr7` | Emails Ryan at 08:00 SGT. | **BUILT.** The first run was emailed on 2026-09-25 (ceo-brain README, execution 164). There is **no source in the repo**: `workflows/README.md` says its source of truth is n8n itself. No recent run can be verified without n8n access. | Gmail, n8n tables |
| **Platform CEO brief** `packages/crm/src/brief.ts` `generateCeoBrief`, route `jobs/ceo-brief` | Per-business morning brief, delivered as an email draft. | **BUILT, unscheduled.** Zero `agent_actions` rows with agent `ceo-intelligence`, so it has never been run. | Resend email draft |
| **"Ask CEO Brain"** on the staff-app Home | Questions answered from KPI facts. | **LIVE** on staging (fusion-edg-core PRs #63–66, 2026-10-25/27). | Supabase |
| **Zaphiel in Claude Code** | `CLAUDE.md` plus the vault. | Human-in-the-loop sessions only; not automatic. | Every connector |

**Gaps.**
- No single CEO agent decides across John, APEX, TITAN and ATLAS. The Orchestrator is only a routing table.
- No agent reads the platform (Supabase) and n8n together: the Management view counts n8n tables only.

---

## 2. JOHN (Sales & Follow-up)

**John today is n8n Lead Intake `b7kbJpnKLN2uQxyn`**, model Claude Sonnet 5 with rule fallback, playbook read live from the vault. Since 2026-09-27 he runs on WhatsApp through WhatsApp Inbound `3IhIJ5IYsB7wQQSg`.

**John's conversations stay in n8n.** They live in n8n data tables plus `Leads/` and `Companies/` notes in the vault. **They never reach the fusion-edg-core CRM** (see §8).

### Lead Qualifier — LIVE
- **What fills it:**
  - Lead Intake `b7kbJpnKLN2uQxyn` (`POST /webhook/ceo-brain/lead`); code in `ceo-brain/agents/sales-qualification/*`.
  - Entry points: WhatsApp Inbound `3IhIJ5IYsB7wQQSg`, John Chat Console `ny60ozvH8B4uNpcb`, public page `FngKsJ2x0AaWOdJl` (`/webhook/ceo-brain/chat`).
- **Evidence:**
  - Real WhatsApp leads `Leads/lead_wa6587587170_*`, all from Ryan's own tests between 2026-09-27 and 2026-10-01.
  - Management view: "Real leads 11, new 24 h: 0; agent runs 24 h: 23".
  - The last new lead note was written 2026-10-01.
  - Lead Intake redeployed 2026-10-01 (version `2a440fd9`).
- **Connected to:** Meta WhatsApp Cloud API, Gmail, GitHub (vault), Claude through the n8n Gateway.

### Follow-up Agent — PARTIAL for John, BUILT on the platform for client businesses
- **What fills it:**
  - John creates follow-up *tasks* in `ceo_tasks`, but **no scheduler sends them**. `docs/phase-2-plan.md` lists "Follow-up nudge scheduler: TODO". The Management view shows **37 overdue follow-ups**, some 714 hours old.
  - On the platform, client businesses have `processDueFollowUps` and `processFollowUpSignals` (timer every minute), plus the automation `quiet_new_enquiry`.
- **Evidence:**
  - `automation_runs` shows `quiet_new_enquiry` ran 17 times, last on 2026-10-10.
  - Brow Revolution's copy of that automation is **inactive**.
- **Connected to:** Supabase; WhatsApp and Resend email (mock or test).

### Booking Agent — MISSING for John, BUILT on the platform
- John has no calendar tool. The phase-2 plan lists "Google Calendar booking: TODO".
- The platform has appointments with free slots, booking, reschedule and reminders (fusion-edg-core PR #4).
- The client AI assistant's tools are `find_free_times` and `book_job` (`agents.ts`).
- **Evidence:** only FAKE test companies have used it (Sparkle Home Cleaning, 2026-09-30).
- **Connected to:** Google Calendar adapter `packages/adapters/src/google-calendar.ts`, tested only against stand-in servers (PR #40 audit).

### Broadcast Agent — MISSING
- No broadcast or bulk-send feature exists in either repo. The only hit is a software-card mention.
- Supporting pieces exist: WhatsApp templates for messages outside the 24-hour window, and opt-out handling on the platform.

### Inbox Monitor — PARTIAL
- **n8n side:**
  - WhatsApp duplicate guard (`ceo_seen_messages` `kFY9ifNq10q7R1Xv`, live 2026-10-10).
  - "John never goes silent" holding reply (2026-09-27).
  - Approval Inbox.
- **Platform side:**
  - `agent_reply_jobs` (retries, then a person is asked to reply).
  - The `manual_queue` table (166 rows).
- **Missing:** the platform has **no shared multi-channel inbox**. "Phase 3: one inbox" was never built (Open loops 2026-10-03; PR #40 audit "a shared inbox").
- **Evidence:** `agent_reply_jobs` has **0 rows**, so the background reply path has never run on a real message.

### Duplicates and conflicts
- **Two "Johns".**
  - FusionTech's own John (n8n) and each client's platform AI assistant (`ai_agents`, persona `front_desk`).
  - `ai_agents` has rows only for FAKE or test organisations.
  - **Brow Revolution has 0 AI agents and 0 WhatsApp channels.**
- **Two lead stores.** n8n `ceo_leads` / `ceo_messages`, and Supabase `leads` / `conversations`. Plus the vault `Leads/` notes.

---

## 3. APEX (Marketing)

There are two versions of APEX:
- **Platform APEX (LIVE):** fusion-edg-core, `omneky.ts` and `apex-ceo.ts`, the Marketing page of the staff app. Runs for Brow Revolution.
- **Claude Code APEX team:** subagents `.claude/agents/apex.md`, `ads-intelligence.md`, `market-research.md`, `creative-brain.md`, `campaign-operator.md`, with engines in `ceo-brain/agents/marketing/*.js`. These run only when someone opens a session.

### Ads Intelligence — LIVE (platform)
- **Platform:**
  - `syncOmneky`, `diagnose`, `buildReport` in `omneky.ts`; readiness in `apex-ceo.ts`.
  - Live evidence: `apex_events` shows `ads_intelligence/monitor/omneky.read` ×1,056, last 2026-10-29 13:31Z, and `report.monitor` ×45.
  - `omneky_links`: brow-revolution `connected`, last OK 2026-10-29 13:31Z.
- **Claude side:** `.claude/agents/ads-intelligence.md` (Metricool read-only) plus `diagnose.js` (tests §38).
- **Connected to:** Omneky (OAuth/MCP from the server), Facebook ad account behind Omneky, Metricool (backup).

### Market Research — DESIGN-ONLY
- `.claude/agents/market-research.md` (WebSearch/WebFetch, public ad libraries).
- No platform or n8n version. Test runs in `80_Clients/_Test/marketing-team-v5/T3_Competitor_Scan.md` only.

### Creative Brain — PARTIAL
- **Platform:**
  - `prepareCreatives` / `decideCreatives` / `pollCreatives` in `apex-ceo.ts`; Omneky makes the images after an approval code.
  - Evidence: `apex_events` `creative_brain/create/creative.brief` ×1 (2026-10-23).
  - The two replacement-ad briefs expired unapproved (Open loops 2026-10-24).
- **Claude side:** `.claude/agents/creative-brain.md` (drafts only).
- **Related:** `cinematic-director.md` (Kling and Higgsfield films, mainly for websites).
- **Connected to:** Omneky creative generation. Higgsfield and Kling only through Ryan's Claude connectors: the platform has no server keys for them (Open loops 2026-10-20).

### Campaign Operator — BUILT, never proven live
- **Platform:**
  - Pause, resume, budget and launch-into-an-existing-ad-set, all gated by approval codes (`omneky.ts`, `apex-ceo.ts`; PRs #57–62).
  - **No live press yet.** Open loops 2026-10-25: "first live pause, resume or launch … will confirm".
- **Claude side:**
  - `campaign-operator.md`, whose only write tools are the n8n Ad Actions workflow and Metricool scheduling. The file says "Omneky tools added when connected", but **its tool list has no `mcp__omneky__*`**.
  - n8n **"Marketing — Ad Actions" `oMMIvt8PZOmUp24K`** is **unpublished on purpose** and has **no Meta credential**, so it is not live.
  - n8n tables `mk_proposals` `LVWgKR8P8XoYGh8C` and `mk_autopilot_ledger` `TTIYHbyVfOphSZ0X` are empty.

### Social & Reputation Manager — MISSING
- The only pieces:
  - Metricool post scheduling, which exists as a tool on `campaign-operator`.
  - The post guard in `autopilot.js`.
- The "Marketing Daily" routine that would run posts was **never scheduled** (`ROUTINE.md` header; only one Claude scheduled task exists).
- No review or reputation monitoring exists. `agent_registry` lists `social` and `seo` as *planned*.

### Duplicates and conflicts
- **Two marketing stacks.**
  - Claude-side: subagents, n8n Ad Actions, `mk_proposals`, Metricool. Dormant.
  - Platform: Omneky, `marketing_actions` / `marketing_campaigns` / `marketing_creatives`, `apex_events`. Live.
  - They keep separate approval records: `mk_proposals` in n8n versus `marketing_*` in Supabase.
- **Two ad-data connectors.**
  - Metricool: never confirmed; `marketing_sync_runs` has 0 rows.
  - Omneky: live.
- **Two daily reports.** The platform APEX daily report runs at 8 AM SG (`apex_reports` daily ×9, last 2026-10-29 00:00Z). It is delivered as a Command Center notification plus an owner email *draft*, with no WhatsApp delivery. The "Marketing Daily" Claude routine is designed but not scheduled.

---

## 4. TITAN (Website & Funnels)

### Website Intelligence — LIVE
- n8n `5VWP3tMK3MZysi7w`, a sub-workflow of Lead Intake. Redeployed 2026-10-12; test execution 1796 (Change log).
- Also a Claude subagent `.claude/agents/website-intelligence.md`, the same role in a second form.
- **Connected to:** Browserbase search through n8n Gateway credits, Claude Fable 5.1.

### Website Creator — LIVE
- **Pieces:**
  - Website Builder v2 n8n `hSTRGnHVsu6tMOmH` writes the brief and prompt.
  - The Claude scheduled task **"Zaphiel — Website Build Worker"** `trig_01K4UinSX4tQWK537MeHQuuc` (hourly at :25 UTC, Claude Fable 5.1) builds on Lovable (clinics) or the site kit on Vercel.
  - Website Build Record `RVPBGpBzj2SUQlgX` (`/webhook/ceo-brain/website-built`).
- **Evidence:**
  - `list_triggers` shows the worker enabled; last run 2026-10-29 14:52Z SUCCEEDED.
  - Management view: built 7, failed 1 (OrangeTee).
  - The last real build was Roen, 2026-10-01.
- **Superseded leftover:** n8n "Website Build Runner" `7sEuGyU6IjJsSaKL`, unpublished.
- **Connected to:** Lovable, Kling, Higgsfield, Vercel (`fusiontech-mockups`), n8n (all attached to the worker task).
- **Known problems:**
  - The `WB_TRANSFORM` node in n8n is behind the repo (Open loops).
  - Resume gap: a stopped build can wait up to 2 hours (Open loops 2026-10-01).

### Cinematic Studio — PARTIAL
- `.claude/agents/cinematic-director.md` plus pack `60_Skill_Packs/Cinematic_Director/`. Its first paid run is waiting for Ryan (Open loops 2026-10-12).
- The film steps inside the Build Worker's `ROUTINE.md` (Kling first/tail frames, Higgsfield fallback) **are live**. The 2026-09-29 Atelier Noir proof used 334 Kling credits.
- **Connected to:** Kling, Higgsfield.

### Funnel & Forms Builder — PARTIAL
- **Funnels:** the Website Builder treats "funnel" as a landing-page request (`WB_FULL_SITE`: Offer Landing Page and Thank You pages).
- **Forms:** each built site embeds a lead form, but **site forms are not wired to the CRM.** Staff-app Home shows "Website builds: —" (dashboard.ts: "Website builds are run … outside this app").
- **Platform inbound pieces exist:** `/hooks/<token>` ("Connect another app"), Meta lead forms `/webhooks/meta-leads`, portal emails `/inbound/email/<token>`. These are tested on FAKE data only.
- **Related:** `titan-qa.md` checks forms in test mode (design).

### Domain & Deploy Manager — PARTIAL
- **What exists:**
  - The Build Worker deploys to Vercel `fusiontech-mockups` (`<slug>-mockup.vercel.app`), with Higgsfield hosting as fallback (`scripts/higgsfield-host.sh`).
  - Rule: nothing goes on a live domain without Ryan.
- **What is missing:**
  - No domain or DNS management.
  - **FusionTech has no domain at all** (Open loops 2026-10-02), which also blocks Meta App Review and real email sending.

### TITAN head
- `.claude/agents/titan.md`, `titan-seo.md`, `titan-qa.md` plus pack `60_Skill_Packs/TITAN/`.
- Vault 10_Agents/TITAN says "built (agent files + knowledge pack), demos pending". These are subagents, not a running service.
- SEO is DESIGN-ONLY.

### Duplicates
- Website Intelligence exists as both a subagent and an n8n workflow.
- Build Runner (n8n) versus Build Worker (Claude scheduled task); the runner is superseded.
- The cinematic steps live in both `cinematic-director.md` and the Build Worker's `ROUTINE.md`.

---

## 5. ATLAS (CRM + EDG)

The design agent is n8n ATLAS `9XQWSgTBszRc0Jxj` plus `.claude/agents/atlas.md` (1,148 lines). The platform is fusion-edg-core: staging at https://fusion-edg-core-api.vercel.app, Supabase `fusion-edg-dev`.

### Customer Records — BUILT on staging
- Supabase `contacts`, `leads`, `conversations`, the timeline (PR #29), import from Excel or CSV (PR #48), RLS per tenant.
- 12 organisations. Every one is FAKE or a test company, except **brow-revolution: 1 lead (the self-test), 0 channels**.
- **There is no "FusionTech" organisation**, so FusionTech's own CRM does not exist on the platform.

### Pipeline Manager — BUILT on staging
- Stages and pipelines, and the follow-up engine (PR #29).
- The ATLAS n8n workflow designs the pipeline for each client and auto-builds it (`POST /atlas/auto-build`, `/atlas/update`).
- **Evidence:** ATLAS update rounds published 2026-10-10 (executions 1717/1718).

### Orders & Inventory — PARTIAL
- **Inventory: BUILT** — stock, purchase orders and suppliers (PR #19).
- **Orders: MISSING** — `agent_registry` lists `orders` as planned; Open loops say "reserved stock / sales orders" are not built.

### Projects — MISSING
- `agent_registry` lists `documents` / `projects` as planned. The PR #40 audit says "orders, projects, documents and support cases" are not built.
- Only the job card exists, for field service (PR #16).

### Systems Builder — LIVE (test system)
- ATLAS n8n designs to checkpoint 1, then the platform `/atlas/auto-build` builds it (`atlas_build_jobs`, background builds since PR #34).
- **Evidence:**
  - Ah Kow Plumbing built through WhatsApp on 2026-09-30.
  - Brow Revolution built 2026-10-18.
  - 4 FAKE demo companies built 2026-10-10.
  - Checkpoint 2 and later run manually in Claude Code with `atlas.md`.

### Automation Builder — BUILT
- **Platform automations:**
  - `automations` / `automation_runs`; the owner builds them in "New workflow" or "Describe it in words" (PR #21).
  - "Connect another app" (PR #22).
  - **Evidence:** `automation_runs` has 174 done.
- **n8n EDG templates:** 8 templates (`fusion-edg-core/workflows/n8n/*.json`), **inactive**, pointing at a placeholder URL (Open loops 2026-09-30).
- **Custom n8n workflows** are still hand-built by Zaphiel (Open loops).

### Related pieces
- Discovery Console n8n `9TnzsgPGRatMaQI3` (Company Map, then proposal draft, then ATLAS hand-off since 2026-10-10).
- Software Knowledge Base (PR #41/#42).
- Owner pipeline page, quotation drafts.

### Duplicates
- ATLAS's DISCOVERY MODE overlaps with the Discovery Console agent.
- The n8n Approval Inbox overlaps with the platform Approval Center (PR #23).

---

## 6. SAGE (Admin, Finance & HR)

There is no SAGE agent. The vault contracts `10_Agents/10_Finance_Ops.md` and `11_HR_Workforce.md` are `status: draft`. "Finance assistant" and "Email/Admin agent" are still listed as *planned* in `ceo-brain/agents/README.md`. What exists is platform modules for client businesses only, not for FusionTech itself.

### Bookkeeper — PARTIAL
- A Xero connector (`packages/adapters/src/xero.ts`, `jobs/accounting-sync`) exists as code and has been tested against a mock.
- Ryan withdrew the Xero sign-up (zero-cost rule, 2026-10-10).
- A "simple money book" is listed as a next build.

### Payments & Invoicing — BUILT on staging
- Quotes, invoices (gapless numbering), payments, the overdue-invoice job and quote follow-up (PR #4).
- The `overdue_invoice_owner` and `quote_follow_up` automations have **0 runs**.
- FusionTech's own quotes (`app.fusion_quotes`) start with an **empty price list**.

### Payroll & HR — PARTIAL
- HR Parts 1–4 are BUILT on staging: people and identity (encrypted), leave, attendance, owner HR view and HR assistant (PRs #38–51).
- **Part 5 (payroll exports) is MISSING.** Only a timesheet CSV exists.

### Admin & Documents — MISSING
- The `documents` module is planned. The Email/Admin agent is planned.

### Compliance — PARTIAL
- **What exists:** guardrails in code (price checks, opt-out, PII encryption, RLS, audit logs), the security contract `15_Security_Governance_QA` (`designed`), and the TITAN SG rules research.
- **What is missing:** no compliance agent, no do-not-call (DNC) checks (Open loops), and the PDPA data-processing agreement is waiting on a lawyer.

---

## 7. Every scheduled or background job

### n8n schedules
Sources: the repo and the vault. n8n itself was not readable in this session.

| Job | Schedule | What it does | Evidence |
|---|---|---|---|
| CEO Orchestrator `8Ix4yc223sxrSu5h` "Every Hour" | `7 * * * *` (UTC) | Recomputes unresolved issues and writes `00_CEO_Brain/Management view.md` | `workflows/ceo-orchestrator/build.js:109`; hourly commits to 2026-10-29 15:07Z |
| Daily Brief `Pew2PX1IcgdXqXr7` | 08:00 SGT daily | Builds a brief from the n8n tables, Claude writes priorities, emails Ryan | README and Agents.md; source not in the repo; no current run visible |
| Old BioGreen WhatsApp sandbox `eS8K8Si0VqToZajp` (`/webhook/whatsapp-in`) | Webhook, not a schedule | **Still receives every message to the WhatsApp number**; its key is expired so it cannot reply | Open loops item "Ryan (decision)" |
| Website Build Runner `7sEuGyU6IjJsSaKL`, Marketing Ad Actions `oMMIvt8PZOmUp24K` | None | Unpublished | — |

No other n8n Schedule Trigger exists in any `ceo-brain/workflows/*/build.js`.

### Supabase pg_cron
Project `fusion-edg-dev`:

| jobid | Name | Schedule | Does | Health |
|---|---|---|---|---|
| 1 | `atlas-platform-timer` | `* * * * *` | `net.http_get` to `https://fusion-edg-core-api.vercel.app/cron/tick` with a token from Supabase Vault | 1,441 succeeded runs in the last 24 hours, last 2026-10-29 15:35Z |
| 2 | `atlas-cron-cleanup` | `23 3 * * *` | Deletes `cron.job_run_details` older than 7 days | active |

What `/cron/tick` runs every minute (`apps/api/src/app.ts:97-157`), for every organisation:
- outbox dispatch;
- background AI replies (`processAgentReplyJobs`);
- follow-ups, appointment reminders, overdue invoices and low stock;
- automations, including the 08:00 `morning_numbers`;
- follow-up alerts;
- the Metricool daily sync (only for confirmed connections; none yet);
- **APEX**: re-read Omneky every 3 hours, monitor, first report, 8 AM daily report, Sunday weekly report;
- APEX readiness and creative polling;
- HR daily checks, attendance and people-care;
- the Metricool key check;
- unfinished ATLAS build jobs.

### Claude scheduled tasks (routines)
`list_triggers` shows exactly one:

| Id | Name | Cron | Connectors | Last run |
|---|---|---|---|---|
| `trig_01K4UinSX4tQWK537MeHQuuc` | Zaphiel — Website Build Worker | `25 * * * *` | higgsfield, kling, Lovable, n8n, Vercel | 2026-10-29 14:52Z SUCCEEDED |

Designed but **never created**:
- "Zaphiel — Marketing Daily / Autopilot" (08:46 SGT). Creation was blocked twice and needs Ryan's OK.

### Platform automations
Table `automations`, runs through the timer:

| Automation | Organisations | Runs | Last run |
|---|---|---|---|
| `morning_numbers` (08:00 daily `owner_summary`) | 7 | 164 | 2026-10-29 00:00Z; result `owner_summary: manual_queue` |
| `quiet_new_enquiry` | 7 | 17 | 2026-10-10 |
| `overdue_invoice_owner`, `no_show_rebook`, `quote_follow_up`, `thank_after_job`, `thank_after_visit` | — | 0 | — |

Brow Revolution's two automations are **inactive**.

---

## 8. Where John's WhatsApp messages actually flow today

```
Customer's WhatsApp
  → Meta test number: phone_number_id 1321607761025022, WABA 1034122678981935,
    Meta app "AI AGENTS" 1415986013818104 (under the Ryan Dhana/Foodblock portfolio)
  → (also fan-out to the old Bio Green app "Test" 1349701273957004 → n8n eS8K8Si0VqToZajp, which cannot reply: expired key)
  → n8n "CEO Brain — WhatsApp Inbound" 3IhIJ5IYsB7wQQSg  GET/POST /webhook/ceo-brain/whatsapp
       duplicate guard (ceo_seen_messages) · "new chat" reset · voice note → OpenAI transcription
  → n8n Lead Intake (John) b7kbJpnKLN2uQxyn
       → n8n data tables ceo_leads R78LlzNLIpVoy802, ceo_messages eImH5AdVZEOW0t31, ceo_tasks, ceo_agent_runs, ceo_audit_logs
       → Vault Writer tVvSWjOubwBNLi88 → zaphiel/vault/Leads/*.md + Companies/*.md (GitHub)
       → sub-flows: Website Intelligence → Website Builder → (Build Worker) ; ATLAS 9XQWSgTBszRc0Jxj → platform /atlas/auto-build
  → reply out through Outbound Sender SAcnNxG1GWPwn3N7 (n8n credential "WHATSAPP FUSION TECH")
```

**The messages never reach the fusion-edg-core CRM tables.**
- Lead Intake has no call to the platform's `/v1/<org>/webhooks/whatsapp/forwarded` (X-EDG-Key) endpoint. The only n8n-to-platform calls are ATLAS's `/atlas/auto-build` and `/atlas/update`.
- Supabase `channel_accounts` has **0 rows for every organisation**.
- There is no FusionTech organisation on the platform.
- `agent_reply_jobs` has 0 rows.
- The decision to send John's real WhatsApp enquiries into the EDG CRM is still waiting for Ryan's yes or no (Open loops "Fusion EDG Core, 2026-09-30 (staging live)").
- Brow Revolution's Home shows 0 leads and chats because its WhatsApp is not connected (Open loops 2026-10-25).

**The number is a test number.**
- It can message only 5 verified phones.
- FusionTech's own WhatsApp Business number is not registered (Open loops).
- The platform's own WhatsApp webhook `/webhooks/whatsapp` needs `WHATSAPP_APP_SECRET` and `WHATSAPP_VERIFY_TOKEN` for a separate "FusionTech Clients" Meta app, which is not set up (Open loops 2026-10-02 step 2).

**John's intake does not store Meta's click-to-WhatsApp referral (ad id)**, so ads cannot be credited with the chats they bring (Open loops 2026-10-14 item 6; Omneky counts only 2 leads).

---

## 9. The morning briefing

There are four separate "morning" outputs, and none reaches Ryan as one consolidated brief:

1. **n8n Daily Brief `Pew2PX1IcgdXqXr7`**
   - 08:00 SGT email to Ryan from the n8n tables (FusionTech's own leads and tasks).
   - Proven 2026-09-25. Current activity not verifiable without n8n; source not in the repo.
2. **Platform `morning_numbers` automation**
   - 08:00 per client business, for 7 FAKE or test organisations.
   - Every run ends `manual_queue`: not delivered.
3. **Platform `generateCeoBrief`** (route `jobs/ceo-brief`)
   - LLM-narrated with a check that every number is grounded in the data, delivered as an email draft.
   - **Never scheduled**; 0 runs.
4. **APEX daily report**
   - 8 AM SG per business with Omneky connected; Brow Revolution only, runs daily (`apex_reports.daily` ×9).
   - Delivered as a notification plus an owner email *draft*.

The hourly Management view note is the closest thing to a running CEO brief, but it reads n8n data only.

---

## 10. Agent Ops / activity logs that exist

| Store | Where | Contents and state |
|---|---|---|
| `ceo_agent_runs` `zoxuUjbgzs6iLIaU` | n8n data table | One row per n8n agent call (agent, model, provider rules/fallback, latency). Management view: 23 runs in 24 hours |
| `ceo_audit_logs` `zjeuGe9AEgJS5MKg`, `ceo_tasks` `sPnRGXe4VYDJLJHr` | n8n | Status changes and human tasks (63 open) |
| `mk_autopilot_ledger`, `mk_proposals` | n8n | Marketing ledger and proposals; **empty** |
| Vault `00_CEO_Brain/Management view.md` | GitHub | Hourly snapshot of unresolved items |
| `apex_events` | Supabase | APEX activity feed (from/to agent, stage, action, plain English, cost, approval). 1,182 rows, all Brow Revolution, last 2026-10-29 13:31Z. Shown on the staff-app Home "Live Activity Feed" and the APEX workforce page |
| `apex_reports` | Supabase | first / monitor / daily / weekly / analysis reports |
| `agent_actions` | Supabase | AI cost ledger: `front_desk` reply ×9 and follow_up ×4 (last 2026-10-10); `apex` campaign.plan ×1 and creative.brief ×1 |
| `automation_runs` | Supabase | 174 done, 9 skipped, **2 stuck "running" since 2026-10-02** |
| `workflow_runs` | Supabase | **0 rows (unused)** |
| `audit_logs` (15,142), `events` (205; 0 in the last 24 hours), `notifications` (17), `manual_queue` (166), `marketing_sync_runs` (0) | Supabase | Platform audit, outbox and alerts |
| `agent_registry` | Supabase | Platform catalogue of assistant types: implemented = appointment, follow_up, management_briefing, sales_assistant; experimental = customer_service, reporting; internal = fusion_john / fusion_atlas / fusion_discovery / fusion_website; planned = advertising, social, seo, content, branding, finance, collections, hr, recruitment, inventory, orders, procurement, documents, operations |

There is **no single Agent Ops view across n8n and Supabase**. Agent activity is split between `ceo_agent_runs` (n8n) and `apex_events` / `agent_actions` (Supabase).

---

## 11. BioGreen / Bio Elixirs references (must not be used)

Ryan decided on 2026-10-03 (Decisions.md line 454) that BioGreen is a separate business.

1. **Live WhatsApp leak risk.**
   - The old Bio Green Meta app "Test" (1349701273957004) is still subscribed to FusionTech's WhatsApp account.
   - Its n8n sandbox `eS8K8Si0VqToZajp` (`/webhook/whatsapp-in`) receives every customer message.
   - This is still open in Open loops, waiting for Ryan's word to unsubscribe it.
2. **The WhatsApp number's business portfolio** is "Ryan Dhana/Foodblock", not FusionTech (Open loops).
3. **Code default tenant `'biogreen'`.**
   - `ceo-brain/agents/sales-qualification/normalize.js:5` (`CB_DEFAULT_TENANT`), inlined into the live Lead Intake Code node.
   - Also in `ceo-brain/integrations/README.md`, the test fixtures in `workflows/lead-intake/build.js` and `tests/run-tests.js`.
   - It is overridden today by `agent.json` `default_tenant: "fusiontech"` (Workflow Config), but it is still the fallback.
4. **`bionov/`** (BIO N:OV immersive site, Bzzworld Korea product) at the brain repo root.
   - Routed publicly by the root `vercel.json` (`/bionov/*`).
   - Referenced in `zaphiel/playbooks/cinematic-3d-sites.md`.
   - **Unrelated to FusionTech; must not be used.**
5. **Shopify connector = store "Bio Elixirs"** (09_TITAN_Audit; TITAN `01_Build_Router.md` / `04_Luxury_Ecommerce.md` say never use it for clients).
6. **Old n8n items from the BioGreen era**, unused:
   - tables "Ad Drafts", "Content Queue", "kling_queue", "viral_engine_runs";
   - possibly "Customer Service Agent — 24/7 Chat" and the Omnichannel inbox `JVGDhhmPFSATl7B7` (listed as "existing" in `ceo-brain/agents/README.md` and `integrations/README.md`).
7. **Session skill `anthropic-skills:biogreen-elixirs-ecommerce`** is installed in this Claude environment. It must not be used for FusionTech work.
8. **Unrelated stray files** at the repo root: `vex/` (a "VEX" hero site) and `nano_banana.py` (OpenRouter image script). They are not BioGreen, but are not FusionTech either.
9. The Metricool brand `6656122` was formerly `biogreenelixirs`. It is now FusionTech.AI (resolved 2026-10-03/09).

---

## 12. Duplicates (two things doing the same job)

| Job | Thing A | Thing B |
|---|---|---|
| Sales AI | n8n John (FusionTech's sales) | Platform per-business AI assistant (`ai_agents`, `front_desk`) |
| Lead and conversation store | n8n `ceo_leads` / `ceo_messages` plus vault `Leads/` | Supabase `leads` / `conversations` |
| WhatsApp entry | n8n WhatsApp Inbound (live) | Platform `/webhooks/whatsapp` and `/forwarded` (unconfigured), **plus** the old BioGreen sandbox still subscribed |
| Approvals | n8n Approval Inbox plus Approve Reply | Platform Approval Center and APEX approval codes; also `mk_proposals` (n8n) versus `marketing_*` (Supabase) |
| Morning brief | n8n Daily Brief | Platform `morning_numbers`, `generateCeoBrief`, APEX daily report |
| Marketing execution | `campaign-operator` plus n8n Ad Actions (Meta direct, unpublished) | Platform Omneky actions (live connection) |
| Marketing data | Metricool (subagents; platform connector never confirmed) | Omneky (live) |
| Activity log | n8n `ceo_agent_runs` / `ceo_audit_logs` | Supabase `apex_events` / `agent_actions` / `audit_logs` / `workflow_runs` (unused) |
| Website research | n8n Website Intelligence | `.claude/agents/website-intelligence.md` |
| Website build | n8n Website Build Runner (superseded, unpublished) | Claude Build Worker scheduled task |
| Films | `cinematic-director.md` | Film steps inside the Build Worker's `ROUTINE.md` |
| Discovery | Discovery Console n8n | ATLAS DISCOVERY MODE (`atlas.md`) |
| Automations | Platform automations engine | 8 inactive n8n EDG templates, plus hand-built n8n workflows |

---

## 13. Role scorecard

| Department | Role | Status |
|---|---|---|
| NOVA | CEO Brain | **PARTIAL**: Orchestrator hourly (live), Daily Brief (unverified), Ask CEO Brain (live); no NOVA agent |
| JOHN | Lead Qualifier | **LIVE** (n8n, WhatsApp test number) |
| JOHN | Follow-up Agent | **PARTIAL**: tasks only for John (37 overdue); platform engine built for clients |
| JOHN | Booking Agent | **MISSING** for John; platform booking built (FAKE data only) |
| JOHN | Broadcast Agent | **MISSING** |
| JOHN | Inbox Monitor | **PARTIAL** (dedupe, holding reply, Approval Inbox; no shared inbox) |
| APEX | Ads Intelligence | **LIVE** (platform, Omneky, Brow Revolution) |
| APEX | Market Research | **DESIGN-ONLY** (subagent) |
| APEX | Creative Brain | **PARTIAL** (Omneky briefs and images behind codes; subagent) |
| APEX | Campaign Operator | **BUILT, never pressed live** |
| APEX | Social & Reputation | **MISSING** |
| TITAN | Website Intelligence | **LIVE** |
| TITAN | Website Creator | **LIVE** (Build Worker hourly; Lovable / site kit on Vercel) |
| TITAN | Cinematic Studio | **PARTIAL** (worker film steps live; director agent design-only) |
| TITAN | Funnel & Forms | **PARTIAL** (funnel pages built; forms not wired to the CRM) |
| TITAN | Domain & Deploy | **PARTIAL** (Vercel mock-ups only; no FusionTech domain) |
| ATLAS | Customer Records | **BUILT** (staging; FAKE and test data plus Brow's self-test) |
| ATLAS | Pipeline Manager | **BUILT** (staging) |
| ATLAS | Orders & Inventory | **PARTIAL** (inventory yes, orders no) |
| ATLAS | Projects | **MISSING** |
| ATLAS | Systems Builder | **LIVE** on the test system (ATLAS n8n, then `/atlas/auto-build`) |
| ATLAS | Automation Builder | **BUILT** (platform automations; n8n templates inactive) |
| SAGE | Bookkeeper | **PARTIAL** (Xero connector, mock-tested only) |
| SAGE | Payments & Invoicing | **BUILT** (staging, unused) |
| SAGE | Payroll & HR | **PARTIAL** (HR Parts 1–4; payroll missing) |
| SAGE | Admin & Documents | **MISSING** |
| SAGE | Compliance | **PARTIAL** (guardrails in code; no agent, no DNC) |

## 14. Top gaps, most important first

1. **John and the CRM are disconnected.**
   - WhatsApp lives only in n8n tables and the vault.
   - There is no FusionTech organisation on the platform and no `channel_accounts`.
   - Brow Revolution's WhatsApp is not connected, so its CRM, Sales AI and attribution all read 0.
   - Needs Ryan's yes or no on sending John's leads into EDG, plus a real WhatsApp number.
2. **The BioGreen sandbox still receives every WhatsApp message**, and the number sits in the Foodblock portfolio on a 5-phone test number.
3. **No follow-up sender, booking or broadcast for John.** 37 overdue follow-up tasks; 19 approvals stale for weeks; the Management view has been stuck at 68 unresolved.
4. **APEX has never made a live change** (pause, resume or launch never pressed). The Social & Reputation role does not exist. The Marketing Daily routine is not scheduled.
5. **Morning briefs are fragmented and mostly undelivered.** There are four, none consolidated; the platform ones are drafts or `manual_queue`; the n8n Daily Brief cannot be verified and has no source in the repo.
6. **No Agent Ops view across n8n and Supabase.** `workflow_runs` is unused; 2 `automation_runs` have been stuck "running" since 2026-10-02.
7. **SAGE is mostly missing**: payroll, documents, a FusionTech-level finance or admin agent, compliance and DNC. Projects and Orders are missing in ATLAS.
8. **Source-of-truth breaks.**
   - Outbound Sender, Approve Reply and Daily Brief have no build scripts in `ceo-brain/` (n8n is their source).
   - The Website Builder `WB_TRANSFORM` node is behind the repo.
   - The `campaign-operator` tool list lacks Omneky.
   - The `'biogreen'` fallback tenant is still in John's code.
9. **TITAN is not linked to the platform** (Home shows "Website builds: —"); site forms are not wired to the CRM; no domain.
10. **n8n MCP needs authorisation** in this environment before live n8n state (active flags, executions) can be checked.
