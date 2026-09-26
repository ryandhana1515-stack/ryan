---
tags: [zaphiel, changelog]
---
# Change log

- 2026-09-25 — FusionTech AI brain started. Built and published on n8n: John (Lead Intake, with the
  FusionTech context), Outbound Sender, Approve Reply, WhatsApp Inbound adapter, Daily Brief,
  Website Builder, Website Build Record, John Chat Console, Vault Writer. John reads the master brain
  and his playbook from this vault live; every conversation is written to Leads/ and Companies/.
  Website Build Record sends finished mock-ups to the customer (WhatsApp when the credential exists).
- 2026-09-25 — Vault created in the repo with the Obsidian Git plugin pre-installed; Ryan opened it
  ("vault is ready"); vault trimmed to FusionTech AI only; how-to notes for WhatsApp and training.
- 2026-09-25 — Found: n8n AI Gateway credits exhausted ("Payment required"); agents answer from
  their rule engines until Ryan tops up.
- 2026-09-25 — Training Room shipped: hosted dashboard (n8n `AM59goLdbt0clv8q`,
  /webhook/ceo-brain/dashboard) + Trainer API (`zKqlk05WShUOrojw`). Agents come from
  `Knowledge/agents.json`; teaching writes "Lessons learned" lines into the playbook notes here;
  chat relays to John (chat console) and the Website Builder (brief). First taught line landed in
  John's playbook from the dashboard (commit 880ec38). Voice via the browser (Web Speech API).
- 2026-09-25 — Ryan's product directive received (verbatim in [[FusionTech AI — Product & Build Directive]]).
  Built from it the same day: **Website Builder v2** (SME + Medical modes, design intelligence per
  business category, anti-generic rules, medical verification, QA checklist, design standard +
  playbook read live from the vault; deployed to `hSTRGnHVsu6tMOmH`, verified execution 209);
  **Company Discovery & Onboarding Agent** + Discovery Console (`9TnzsgPGRatMaQI3`) writing the Client
  Digital Company Map to `Discovery/` and a proposal draft when complete; **Proposal draft generator**;
  **CRM/ERP data layer** (39-table Postgres migration with tenant RLS, validated locally); Trainer API
  now chats with any registered agent; new vault notes: design standard, discovery playbook, product
  architecture, workforce roster, templates. Tests: 35 passing.

- 2026-09-25 — **BMW website chain proven:** John (chat console, execution 224) → Website Builder brief →
  mock-up built on Lovable ("Prestige Drive", project `e650eee1-4666-475f-95dc-0686284264fc`) → Website
  Build Record (execution 229) marked the task `built` and emailed Ryan the preview. Website Builder
  v2.0.2 deployed (automotive category, wider business-name detection). New **Chat with John public
  page** (`FngKsJ2x0AaWOdJl`, /webhook/ceo-brain/chat) + embed snippet for FusionTech.com.sg
  (`ceo-brain/website-chat/`). Tests: 36 passing. Still manual: the Lovable build step (see Open loops).
- 2026-09-25 — **Automatic mock-up chain built in the repo** (Ryan: zero approvals). John now greets and
  explains FusionTech himself (no escalation), runs the website intake (name, what the business does,
  what the site must do, where to send the link), and hands off only when complete. Website Builder
  v2.1: cinematic photo-led standard (full-bleed photography, rich colour and gradients, motion; no
  black boxes), image shot list, Decide Build (one build per lead, daily cap 12), calls the new
  **Website Build Runner** (`7sEuGyU6IjJsSaKL`, created in n8n): Higgsfield/Kling photography →
  Lovable (MCP, OAuth) → Website Build Record → John sends the link; chat console shows the preview
  and treats public-page visitors as real leads. 40 tests passing. **Not yet live:** the Claude Code
  permission classifier refused the deployment steps; see Open loops.
- 2026-09-25 — **CEO Brain v3, Phase 1 (vault).** Ryan's [[FusionTech AI — Build Prompt v3]] stored verbatim; backup in
  `_backups/2026-09-25/`; new structure: `00_CEO_Brain` (master rules, architecture v3 with diagram, build backlog +
  open questions, log pointers), `10_Agents` (16 head-agent contracts, MUST DO / MUST NOT DO from the prompt table,
  phases, services, registries), `20_Specialist_Workers` (9), `30_Platform_Services` (11 + dev/staging/production),
  `40_Registries` (Integration Registry with every connector `planned` until Ryan confirms; System-of-Record;
  Agent Permission Matrix; KPI Dictionary), `50_Client_Onboarding` (8-step workflow, 13 discovery topics,
  classification rules, data migration), `80_Clients/_TEMPLATE_Client`, `90_Templates` (5), `_sources/README`.
  Why: merge Review v2 onto the blueprint without breaking what runs. Nothing existing was moved or renamed (ADR-1).
- 2026-09-26 — **John v2 live in n8n** (Lead Intake `b7kbJpnKLN2uQxyn`): greets and explains FusionTech himself,
  runs the website intake (name, what the business does, what the site must do, where to send the link) and
  hands off to the Website Builder only when complete; email/name/industry learned in chat are saved on the
  lead. Verified live: "hi" → introduction (execution 275); mock-up ask → the four questions (278); BMW details
  → hand-off, brief + owner email (280 → 282). Chat console updated: public-page visitors are real leads, the
  preview link shows in the chat once a mock-up is built. Still on rule fallback (AI credits exhausted). The
  automatic Lovable build (Website Builder v2.1 + Build Runner) remains undeployed: permission block.
- 2026-09-26 — **Prestige Motors mock-up rebuilt to the cinematic standard** (Ryan rejected the flat first one).
  John's intake (execution 280) → brief → 3 photographs generated on Ryan's Higgsfield account
  (gpt_image_2_5: showroom at dusk, blue-hour drive, interior detail) → Lovable project
  `5fa1ce49-c40c-4fc1-935d-e6935a33421f` ("Prestige Drive Booking", 6 pages, test-drive booking, WhatsApp
  bar, agent finished in 6 min) → Website Build Record → task built, owner email, link in John's chat.
  Preview https://id-preview--5fa1ce49-c40c-4fc1-935d-e6935a33421f.lovable.app. Built by a Claude
  session on Ryan's request; the same steps are what the Website Build Runner will do unattended.
- 2026-09-26 — **Training: two variations per mock-up (ADR-2).** Website Builder playbook + design standard
  (live) teach variation A (cinematic scroll film site on Higgsfield, premium) and B (photo-led on Lovable);
  John's playbook: present both links, no prices. Repo: brief v2.2 carries `variations` + a film brief for A;
  intake reply mentions the two versions. No build was run (Ryan: training only).
- 2026-09-26 — **CEO Orchestrator (Agent #0) + Approval Inbox live.** Two new n8n workflows: **CEO Orchestrator**
  `8Ix4yc223sxrSu5h` (`POST /webhook/ceo-brain/event` + hourly: routing table, exception/review tasks, email
  on failures, unresolved-issues list, writes [[00_CEO_Brain/Management view]] into this vault) and **Approval
  Inbox** `r4ynzcSqRy8zHoFl` (https://ryan1515.app.n8n.cloud/webhook/ceo-brain/inbox: approvals via the
  Approve Reply gate, exceptions → Mark recovered with PIN, audit row). Deterministic, no AI credits. Verified
  with a test build-failure event (task opened, audited, view written, no email in test mode, then recovered
  from the inbox). Repo: `ceo-brain/agents/ceo-orchestrator/`, `workflows/ceo-orchestrator/`,
  `workflows/approval-inbox/`, tests 46/46.
- 2026-09-26 — **Website Intelligence & Conversion Strategist installed** (Ryan's agent file, verbatim). Claude Code
  subagent `.claude/agents/website-intelligence.md` (repo root, where Claude Code reads subagents); contract note
  [[10_Agents/05a_Website_Intelligence]] linked to 05, 02, 07, 09, 04, 14, 06, 15; output template
  `80_Clients/_TEMPLATE_Client/website/` (10 files + `WEBSITE_BUILD_BRIEF.json`). Run: `Use the website-intelligence
  agent in CLIENT|PROSPECT mode for <company name> <website>`.
- 2026-09-26 — **Website Intelligence internal role (ADR-3).** Ryan's system prompt stored verbatim
  ([[10_Agents/05a_Website_Intelligence — internal role prompt]]); contract 05a updated (chain John → Website
  Intelligence → Website Creator → John; STATUS messages; never customer-facing); John's playbook gets the
  website opening line and the hand-off rule; Website Builder playbook treats the WEBSITE_CREATOR_BRIEF as
  authoritative with visible placeholders; backlog Phase 5 gets the n8n research step.
