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
- 2026-09-26 — **Website Intelligence live in the chain** (`5VWP3tMK3MZysi7w`). John's hand-off now goes Lead Intake →
  Website Intelligence → Website Builder. Research: 6 searches + homepage and up to 3 pages (Browserbase on n8n
  Gateway credits), labelled fact ledger, Ryan's role prompt read live, Claude on Gateway credits, deterministic
  fallback; WEBSITE_CREATOR_BRIEF with the two variations and placeholders; Orchestrator event
  `website.research` / `website.info_needed` (REVIEW task for John). Website Builder accepts `research_brief`
  (authoritative). Verified end to end (executions 298 → 300 → 301). Gateway credits were empty during the test,
  so the fallback brief was used — the chain still completed. Repo: `ceo-brain/agents/website-intelligence/`,
  `workflows/website-intelligence/`, tests 50/50.
- 2026-09-26 — **Website Builder v2.2 deployed: the automatic build chain is wired** (`hSTRGnHVsu6tMOmH`, published).
  Ryan switched Claude Code to "Accept edits" so the deploy could go through. New nodes: Load Website Build
  Tasks → **Decide Build** (auto-build policy: `build` / `ask_customer` / `already_built` / `daily_cap` of 12; no
  approval step) → task, run, audit → **Build Now?** → **Start Website Build Runner** (`7sEuGyU6IjJsSaKL`) → owner
  email. Compose System Prompt carries the two variations (A cinematic scroll film, B photo-led) and the
  WEBSITE_CREATOR_BRIEF rule; Finalize Website Brief 2.2.0 adds `ready_to_build`, `variations`, `film_brief`.
  Verified live: Lead Intake 328 → Website Intelligence 330 → Website Builder 331 (decision `build`, medical mode,
  task `building`, email sent) → Orchestrator 332. **The runner-start node is disabled in n8n** until the runner can
  be published: n8n refuses to publish a workflow that calls an unpublished sub-workflow, and the runner needs
  Ryan's Lovable MCP credential first. Once Ryan connects Lovable (and Higgsfield/Kling), Zaphiel assigns the
  credentials, publishes the runner, re-enables the node and republishes. Registry: `website_build_runner`.
- 2026-09-26 (late) — **Build step moved from n8n to a Zaphiel routine; no builds for test leads (Ryan).**
  Finding: Lovable only allows hosted OAuth clients it has approved, so n8n cloud's "MCP OAuth2 API" credential
  fails with 400 (docs.lovable.dev, "Supported AI clients"); the Lovable REST API cannot create projects and
  needs a Business plan. Ryan's Lovable, Higgsfield and Kling accounts are connected to Zaphiel's environment,
  so the build worker runs there: Claude Code Routine **"Zaphiel — Website Build Worker"**
  (`trig_01K4UinSX4tQWK537MeHQuuc`, hourly at :25 UTC = 00:25 SGT etc.; prompt in
  `ceo-brain/agents/website-build-worker/ROUTINE.md`). It reads `building` tasks from `ceo_tasks`, skips test
  leads, generates the 3 photos (Higgsfield `recraft_v4_1`, Kling fallback), builds in Lovable, reports to the
  Build Record webhook. **Blocked on one click by Ryan:** the routine was created without connectors (the tool
  cannot pass them); Ryan attaches n8n, Lovable, Higgsfield and Kling to it in claude.ai → Routines. The n8n
  "Website Build Runner" (`7sEuGyU6IjJsSaKL`) is superseded and stays unpublished; the Website Builder's
  "Start Website Build Runner" node stays disabled. Mistake recorded: Zaphiel ran one build for the fake
  "Sunrise Dental Clinic" test lead (24 Higgsfield credits, one Lovable project `4e9a50a0-3407-43ea-9fb2-564bcf0a7f4e`)
  before Ryan said tests happen only through John on WhatsApp. Rule added to the worker: never spend on test leads.
- 2026-09-26 (late) — **Both variations on** (Ryan: "they will create those 3D animation scroll effects video stuff"). The build worker now builds B (Lovable photo-led) then A (Higgsfield scroll-scrub film site, deployed to its Higgsfield subdomain, never the community feed) for every real lead and reports both links; routine prompt and `ROUTINE.md` step 2i updated.
- 2026-09-26 (late) — **Build worker stays on duty** (Ryan: an hour is too long). Each hourly routine session now checks n8n every 2 minutes for 55 minutes, so a build starts within 2 minutes of the hand-off. Open loop added: ask Lovable support to approve n8n cloud's OAuth callback so the n8n runner can start builds instantly as well.
- 2026-09-26 23:38 SGT — **Build worker connectors attached by Ryan** (n8n, Lovable, Higgsfield, Kling on `trig_01K4UinSX4tQWK537MeHQuuc`). Verification run fired; only the test lead was waiting, so it must report `skipped_test_mode` and spend nothing.
- 2026-09-26 (late) — **Funnels + construction + 3D film plan wired** (Ryan: "create funnels… construction sites, every single thing").
  John's hand-off gate and rules now treat "funnel / sales funnel / sales page" as a website request; the Website
  Builder builds it as a landing page. New industry **construction** with its own design direction (project-led,
  concrete/steel palette, high-vis accent); industry detection now matches word forms (plumber, renovation,
  logistics, manufacturer…). Found and fixed: the builder computed the 3D scroll-film plan but never stored it, so
  the build worker could not make variation A; `film_brief` and `variations` now go into the task payload.
  Deployed Lead Intake + Website Builder, tests 52/52. Verified live: Lead Intake 335 → Website Intelligence 337 →
  Website Builder 338 (construction, landing_page, build, film_brief stored) → Orchestrator 339. Test lead, so no
  build credits. Gateway AI credits are still $0: every agent runs on its rule fallback until Ryan tops up.
- 2026-09-26 (late) — **John's judgement: questions are answered, builds start only on request** (Ryan: "only when
  the customer actually wants to build a mock-up"). Intake 1.2.0: a build needs an explicit ask ("build me…",
  "we need a new website", "send me a mock-up") or a yes to John's mock-up offer; capability questions get an
  answer plus the offer; a complaint about an existing site never triggers a build. John's prompt says the same.
  Also fixed: plural "websites" was not recognised. Tests 56/56. Lead Intake deployed and verified live (execution
  340: "What type of websites can you build?" → answer + offer, no hand-off). John playbook lesson added. The Website
  Builder's copy of the company description (same wording change) syncs on its next deploy; it does not affect
  decisions.
- 2026-09-26 — **ATLAS installed** (EDG & CRM Systems Architect, Claude Code subagent `.claude/agents/atlas.md`,
  verbatim from Ryan) + template `80_Clients/_TEMPLATE_Client/edg/`. Merge into [[10_Agents/07_CRM_Architect]]
  proposed, waiting for Ryan's OK. Details in [[00_CEO_Brain/04_Changelog]].
- 2026-09-26 (night) — **ATLAS is a working team member** (Ryan: "create that agent… that can do whatever was in the
  prompt"). New n8n workflow **CEO Brain — ATLAS** `9XQWSgTBszRc0Jxj`, published. John (Lead Intake) now has an
  "EDG Needed?" gate: when a named company needs CRM / automation / integrations and John knows something about how
  it works today, the lead goes to ATLAS once. ATLAS loads Ryan's agent file live from GitHub, works in DESIGN mode to
  checkpoint 1, writes five files to `80_Clients/<company>/edg/` (test leads under `80_Clients/_Test/`), opens an
  approval task (Approval Inbox), emails Ryan and sends `edg.checkpoint_1` to the Orchestrator. Checkpoint 2+ and
  BUILD / AUDIT run in Claude Code with the same agent file and every tool, after Ryan confirms. Tests 60/60.
  Verified live with a test lead (Lead Intake 354 → ATLAS 356): all five files written, task opened, email sent,
  no website build started, zero Higgsfield / Lovable spend. Claude answered "Payment required" (Gateway credits $0),
  so ATLAS used its rule fallback: until the credits are topped up it only restates what John collected and lists
  the questions John should ask next.
- 2026-09-26 (night) — **ATLAS merged into 07** (Ryan: "ok merge"). [[10_Agents/07_CRM_Architect]] is now "07 · ATLAS —
  EDG & CRM Systems Architect" (alias ATLAS): all 18 sections rewritten from Ryan's agent file, the old CRM
  Architect content kept inside it (data layer, migration steps, open question), old note backed up in
  `_backups/2026-09-26/`. Boundaries set with Discovery (01), Workflow Automation (09), Data/BI (14),
  Security/QA (15); linked to the nine notes Ryan listed. John's note (02) has the two-way hand-off; the permission
  matrix row and the agent index updated. Decision recorded as ADR-4.
- 2026-09-26 (night) — **John asks ATLAS's questions automatically** (Ryan: "John asked automatically", correcting
  "i see first"). Lead Intake has a new step "Load ATLAS Questions" (the lead's `edg_design` task); John adds the next
  unasked ATLAS question to his normal reply, one per turn, never twice, never on a website-intake turn or a reply
  waiting for approval, never about price/contracts/credentials. Tests 63/63. Deployed and verified live: Lead
  Intake 361 (second message from the test lead) asked ATLAS's first question; ATLAS did not run twice. Recorded in
  ADR-4, the ATLAS note (07), John's note (02), Open loops.
- 2026-09-26 (night) — **Website Intelligence upgrade planned, on hold until the Gateway top-up** (Ryan: funnels, Google
  research, most high-converting 3D sales sites, realistic anatomy for doctors; "I will pay the gateway later. Just
  wait."). Found: every Website Intelligence search has failed since the credits ran out, and free search engines
  block n8n. Nothing changed live; plan in [[Open loops]]. Temporary probe workflow archived.

