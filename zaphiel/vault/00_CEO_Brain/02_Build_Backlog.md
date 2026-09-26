---
type: backlog
tags: [zaphiel, ceo-brain, backlog]
owner: Ryan
last_reviewed: 2026-09-25
---
# 02 · Build Backlog (Build order v2)

Legend: `[x]` done · `[ ]` open · **(Ryan)** needs Ryan · status words follow the agent contract: draft → designed → built → tested → live.

## Phase 1 — CEO Orchestrator + shared identity / tenant / audit / approval foundation
- [x] Vault structure v3, master rules, templates, P0 foundation notes, registries, architecture (2026-09-25, Phase 1 of the vault work)
- [x] Audit log table + rows written by every workflow (n8n `ceo_audit_logs`)
- [x] Approval ladder in code for John's replies (Approve Reply workflow); auto-build policy for mock-ups (Ryan's decision)
- [x] [[10_Agents/00_CEO_Orchestrator]] as a running workflow (routing + management view) — `8Ix4yc223sxrSu5h`, 2026-09-26; writes [[00_CEO_Brain/Management view]]; the Daily Brief stays as the 08:00 email
- [ ] Every workflow posts its events to the Orchestrator (`POST /webhook/ceo-brain/event`) instead of only writing tables
- [ ] [[30_Platform_Services/Identity_Tenant]] running: tenants + users + roles tables live (Supabase migration 002)
- [ ] [[30_Platform_Services/Approval_Service]] running as one shared workflow (today approvals are per-workflow)
- [ ] **(Ryan)** approval authority: who approves what (Ryan, Dad, client owner) and money limits
- [ ] **(Ryan)** source PDFs into `_sources/`; then copy MUST DO / MUST NOT DO word-for-word into every agent note

## Phase 2 — Discovery & Solution Architect + Client Onboarding / Data Discovery
- [x] Discovery Console live (`9TnzsgPGRatMaQI3`), Company Map + data-source checklist, proposal draft (no pricing)
- [ ] Solution Architect output: phased target architecture per client ([[10_Agents/01_Discovery_Solution_Architect]] §11)
- [ ] [[50_Client_Onboarding/Onboarding_Workflow]] steps 5–8 automated (authorization → validation → provisioning)
- [ ] **(Ryan)** pick the first pilot client (Bio Green Elixirs or Brow Revolution)

## Phase 3 — CRM Architect + Sales/CRM + source-of-truth registry
- [x] John live (Lead Intake `b7kbJpnKLN2uQxyn`), chat console, public chat page, website intake gate (repo)
- [ ] [[40_Registries/System_of_Record_Registry]] filled for the pilot client
- [ ] CRM schema migrated from n8n Data Tables to Postgres (Supabase) with RLS
- [ ] **(Ryan)** Meta WhatsApp Business credential in n8n; n8n AI credits

## Phase 4 — Workflow Automation + event / retry / exception / manual-recovery framework
- [ ] [[30_Platform_Services/Workflow_Event_Service]]: correlation ids, idempotency keys, retry limits, dead-letter queue, recovery task
- [x] Exception queue visible in the human task inbox ([[20_Specialist_Workers/Approval_Inbox_Agent]]) — Approval Inbox `r4ynzcSqRy8zHoFl`, 2026-09-26
- [ ] Retry limits + dead-letter handling before an exception task is opened (today: first failure → task)

## Phase 5 — General Website/App + premium website QA and deployment pipeline
- [x] Website Builder v2.1 (cinematic standard), Build Runner workflow created (`7sEuGyU6IjJsSaKL`), chain in repo
- [x] Deploy the automatic mock-up chain to n8n — done 2026-09-26 (Website Builder v2.2 `hSTRGnHVsu6tMOmH`: Decide Build → Start Website Build Runner; verified 328 → 330 → 331 → 332). Runner-start node disabled until the runner is published (needs the Lovable credential)
- [x] **(Ryan, done 2026-09-26)** attach the n8n, Lovable, Higgsfield and Kling connectors to the Claude routine "Zaphiel — Website Build Worker" (claude.ai → Routines). n8n credentials for Lovable are impossible (Lovable blocks hosted OAuth clients); the n8n runner is superseded
- [x] Website Intelligence step between John's hand-off and the Website Builder brief ([[10_Agents/05a_Website_Intelligence]], ADR-3) — `5VWP3tMK3MZysi7w`, 2026-09-26: Browserbase search + fetch on n8n Gateway credits, fact ledger, WEBSITE_CREATOR_BRIEF, questions for John as `website.info_needed`; verified 298 → 300 → 301
- [ ] John reads open `website.info_needed` tasks and asks the customer the questions in his own voice (chat console + Lead Intake)
- [ ] `MOCKUP_READY` message to John from Build Record (today John reads the built task directly)
- [ ] Website QA agent inspects a built preview against the checklist before the customer sees it
- [ ] Build Runner variation A: Higgsfield website builder (animated scroll-scrub site with a generated film) through the Higgsfield MCP (OAuth credential in n8n) — ADR-2; **(Ryan)** Higgsfield MCP credential

## Phase 6 — Data/BI/KPI + KPI dictionary + CEO daily/weekly intelligence
- [x] Daily Brief v0 (`Pew2PX1IcgdXqXr7`)
- [ ] [[40_Registries/KPI_Dictionary]] filled with definitions and owners; exception intelligence in the brief

## Phase 7 — Security/Governance/QA + staging / release / rollback / backup tests
- [ ] [[30_Platform_Services/Deployment_Environments]]: staging n8n project or workflow set, release gate, rollback test
- [ ] Backup + restore test of the vault and the database

## Phase 8 — ERP/Operations, then Finance, HR, Inventory (only per client need)
- [ ] Nothing until a client needs it

## Phase 9 — Customer Success + Marketing Growth + Creative Studio
- [ ] Nothing until Phase 5 is live

## Phase 10 — Medical/3D specialist + extra industry packs only when required
- [x] Medical mode in the Website Builder (content, verification, compliance rules)
- [ ] 3D / advanced medical UX only when a client requires it

## Open questions for Ryan (combined)
1. Approval authority and money limits (Ryan / Dad / client owner): needed by [[30_Platform_Services/Approval_Service]] and [[40_Registries/Agent_Permission_Matrix]].
2. Core stack for the first package: CRM (stay on the CEO Brain CRM or connect an existing one?), WhatsApp provider (Meta Cloud API direct?), dashboard/hosting.
3. First pilot client and the environment to test on (your own business first).
4. Pricing of the first sellable package (never in an agent; only in the proposal you approve).
5. Confirm which integrations are `tested`: Gmail and GitHub run in n8n daily; Lovable, Higgsfield, Kling, Meta WhatsApp are `planned`.
6. Source PDFs (Blueprint, Review v2) into `_sources/`.
7. ~~Claude Code permission rule so the automatic mock-up chain can be deployed.~~ Done 2026-09-26 (Accept edits mode).
