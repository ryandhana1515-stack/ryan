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
- 2026-09-26 (night) — **John always has an answer** (Ryan: "John knows everything and knows how to reply… he can't
  say I don't know"). New answer bank of 26 customer questions (more info, price, how long, how it works, is it a
  bot, talk to a person, examples, WhatsApp, funnels/3D sites, software, data safety, results, staff, support,
  marketing, customer service, bookings, finance, which AI, CEO Brain, why us, demo, ease of use, location, industries)
  in John's backup mode (rules-v3) and in his live playbook ([[Knowledge/John — Sales playbook]]), all from the Master
  Company Brain. Price, paperwork, payment, discount, refund and complaint questions get a helpful reply that says
  Ryan handles it personally (still held for Ryan's OK). Unclear messages get a friendly reply instead of being parked.
  A guard swaps any AI reply that says "I don't know" / "I'm not sure" for John's answer. John's AI rules now answer
  general price and timing questions instead of parking them. Tests 68/68; deployed and verified live (execution 376).

- 2026-09-26 (night) — **Agent team upgraded to Claude 5 (Ryan paid the Gateway: "upgrade … all of them").**
  John, ATLAS, Discovery → Claude Sonnet 5 with thinking off (first try with thinking on used all of John's tokens and
  took 45 s; now ~9 s per reply, verified execution 383). Website Intelligence, Website Creator → Claude Fable 5.1.
  Website Intelligence now plans the funnel, a high-converting sales strategy, 3D/scroll motion and, for clinics, a
  photorealistic, medically accurate anatomy visual (e.g. a beating heart with arteries and blood flow). The creator
  always puts that plan into the Lovable prompt, uses the anatomy shot as the clinic's hero, and the Build Worker
  routine turns it into a looping video (Higgsfield, Kling backup). Deployed to all five n8n workflows (code verified
  identical to the repo); tests 70/70.
- 2026-09-26 (night) — **Live test of the upgraded chain** (test lead: a real Singapore heart clinic, Asian Heart &
  Vascular Centre). John (Sonnet 5) replied in 12 s and handed off; Website Intelligence (Fable 5.1, 2.7 min) Googled
  the clinic, read 4 of its pages (5 locations, services, heart tests), planned a 6-step booking funnel and a
  scroll-driven photoreal beating heart with coronary arteries; the Website Creator (Fable 5.1, 2 min) wrote a
  12-page medical brief incl. the `/screen` ad funnel, hero = the realistic heart. Three bugs found and fixed the same
  night: ATLAS's good answer was rejected because it contained a diagram (all agents now read such answers); the
  research plan was cut before the 3D and anatomy lines reached Lovable (important lines now first, prompt limit
  12,000); John promised the phone when the customer asked for email (typed email now wins). Tests 73/73.
- 2026-09-27 (night) — **John is on WhatsApp.** Ryan set up the Meta app, token and webhook (guided step by step);
  Zaphiel wired the Outbound Sender to WhatsApp and subscribed the AI AGENTS app to the WhatsApp account (it was
  missing: messages went only to the old Bio Green sandbox). First real conversation showed three faults, all fixed the
  same night: a "hi" from a new contact was held for approval (NEW→NEW status rule), "what can you help us with" was
  treated as a website order (mock-up template replaced John's answer), and John read EDG as the Enterprise
  Development Grant. John's live playbook now has the full plain-words offer: CEO Brain and modules, SME operating
  system, EDG, CRM, AI workforce, automation, ERP, websites/funnels. Tests 76/76.
- 2026-09-27 (night) — **ATLAS DISCOVERY MODE** saved to `.claude/agents/atlas.md` (Ryan: "save it"), playbook
  [[10_Agents/ATLAS_Discovery_Playbook]], template `80_Clients/_TEMPLATE_Client/edg/discovery/`, ADR-4 amended. John's
  live playbook gained "Ask like a consultant" (ATLAS's discovery questions in plain words; websites still start from
  the name alone).
- 2026-09-27 (night) — **Website Intelligence → John → customer; ATLAS on every mock-up.** When Google leaves gaps,
  Website Intelligence saves the missing details as a `website_info_needed` task and John messages the customer
  straight away (WhatsApp/email, max two questions, mock-up keeps building with placeholders); John's question list now
  reads website details first, then ATLAS's, one per reply, skipping anything already asked. ATLAS starts for every
  named company that asks for a mock-up. Tests 80/80.
- 2026-09-27 (night) — **Build worker updated live** (Ryan: "update the build worker", "Kling all"). Lovable builds
  without stopping for plan approval (the worker nudges it if it pauses and checks pages exist), every mock-up is
  published to a public lovable.app link (no login), and Kling makes all photos, the anatomy video and the scroll
  film; variation A is a Kling film scrubbed on a Lovable scroll site. Website Intelligence's questions now speak to the
  customer ("do you have a logo"). Live test "Ah Seng Kopi Corner": ATLAS started, Website Intelligence saved three
  questions for John, the mock-up kept building.
- 2026-09-27 (night) — **Flat websites only** (Ryan). Website Intelligence now always plans a flat page (no scroll,
  parallax, 3D, film or video), the Creator's prompt and design rules say the same, John promises one link, the build
  worker builds one site (Kling photos, still anatomy photo for clinics) and publishes it publicly. Tests 81/81.
- 2026-09-27 (night) — **Clinic anatomy stays on flat pages** (Ryan: "all the arteries, all the heartbeats, all those
  blood vessels, it still must be able to do that"). Specialist clinics get the realistic anatomy photo plus a short
  Kling video from it (the heart beating, blood flowing through the arteries) that loops on its own in the hero, not
  tied to scrolling. Website Intelligence, the Creator's prompt and the build worker (live) updated. Tests 82/82.
- 2026-09-27 (night) — **Deployed to n8n** (Ryan: "deploy it"): flat websites + the clinic anatomy loop are live in
  Lead Intake (`749b3345`), Website Builder (`3c8618f3`) and Website Intelligence (`1817edc5`); six Code nodes,
  byte-identical to the repo, published. No workflow was run (no build, no credits).
- 2026-09-27 (night) — **WhatsApp "new chat"** (Ryan: "how do I start a brand new chat … without any words"). Sending
  just "new chat" (or "reset") to the FusionTech number starts a fresh conversation: John forgets the earlier chat, a
  new lead is opened for the number, and the next message is treated like a new customer (a new mock-up is allowed).
  The old conversation is kept in the records. Tests 86/86.
- 2026-09-27 (night) — **Why John went quiet, and the fixes.** (1) Ryan's voice note was dropped: WhatsApp Inbound only
  took typed text → voice notes are now downloaded and transcribed. (2) "Hi any response?" got a reply that waited for
  approval because John flagged the late mock-up → John now always answers (see Decisions). (3) The Free & Easy
  mock-up link *was* sent to Ryan at 16:06, but the Build Record never wrote it into the conversation, so John kept
  promising it → the mock-up message is now logged and John sees it. Tests 91/91.
- 2026-09-27 (night) — **3D parallax scroll-film websites with Kling** (Ryan). Replaces the flat-site rule. Website
  Intelligence plans a scroll film per industry again (clinics: the anatomy film); the creator's design rules, strategy
  section and single variation (`parallax_film_site`) ask Lovable for a Kling film scrubbed by the scroll with layered
  depth parallax; John's websites answer mentions it; the build worker (live) makes three Kling clips per mock-up
  (image_to_video from the Kling photos) and hands them to Lovable. Kling is attached to the routine. Tests 91/91.
- 2026-09-27 (night) — **Apple-grade websites, ATLAS's own voice, a wider Google pass** (Ryan). The creator's build
  prompt now carries an Apple-grade standard and 5–6 scroll effects per industry (`wbEffectsFor`), prompt cap 14000;
  John's replies ask ATLAS's questions in ATLAS's name (`atIsAtlasQuestion`, `AT_VOICE`); Website Intelligence runs 9
  searches (adds socials, maps listing, competitors) and reads 5 pages, and reads the customer's own description first.
- 2026-09-28 — **Higgsfield added next to Kling** (Ryan). Build worker (repo + live routine): step e3 makes a
  Higgsfield 3D model (`generate_3d`) for product businesses, handed to Lovable as a scroll-driven "3D MODEL" section;
  a failed Kling clip is remade on Higgsfield. The creator's product-reveal effect uses the model when there is one.
- 2026-09-28 — **Full website per mock-up** (Ryan). `WB_FULL_SITE` sitemaps per industry + Offer Landing Page +
  Thank You; `wbEnsureFullSite` tops up the model's pages; a protected FULL WEBSITE block (every page built, selling
  homepage order, sticky CTA + WhatsApp + lead form, Apple-grade effects) rides in every Lovable prompt; the build worker
  checks every page was built. Coffee/kopi shops now count as food & beverage. Tests 95/95.
- 2026-09-28 — **Enough details before building** (Ryan). Website Intelligence returns `enough_to_build`; when "no" it
  holds the build (`hold`, `ready` false), saves the questions and John asks the customer ("before our team builds
  your … website, … so it is right for you"). John's next turn sends the answer back to Website Intelligence while a
  `website_info_needed` task is open and no `website_build` task exists. Max 2 rounds (`WR_MAX_INFO_ROUNDS`), "not
  sure" counts as enough. John's hand-off reply now says the team researches first. Tests 100/100.
- 2026-09-28 — **Property walkthrough** (Ryan; not built, capability only). Property detection widened (villas,
  penthouses, show flats, new launches, interior designers; construction checked first); property photos (facade,
  living room, bedroom + view) and a 5-scene `film_brief` walkthrough; new `walkthrough` scroll effect; a property line
  in the FULL WEBSITE block ("Artist's impression", CEA); Website Intelligence plans the walkthrough; the build worker
  makes 5 clips for property. Tests 101/101.
- 2026-09-28 — **Customer's look-and-feel wish required; silence for non-customers** (Ryan). `WR_STYLE_Q` /
  `wrStyleKnown` in Website Intelligence; `RB_INAPPROPRIATE` and `notACustomer` in John (spam, scams, sexual/abusive,
  pranks, vendors, job seekers → no reply); business owners saying "we offer …" stay customers. Tests 103/103.
- 2026-09-28 — **No look question; property rooms only** (Ryan). `WR_STYLE_Q` removed: look/style/colour questions are
  filtered out; `WR_ROOMS_Q` / `wrRoomsKnown` ask property customers for rooms and features; the Website Intelligence
  prompt lists the real facts (sell, services, location, opening hours). Tests 103/103.
- 2026-09-28 — **Deployed and verified live** (Ryan: "deploy everything"). All 19 Code nodes of Lead Intake, Website
  Builder, Website Intelligence and WhatsApp Inbound are byte-identical to the repo (PR #69) and published; the build
  worker routine carries the property version. Ryan can test: send "new chat" on WhatsApp, then ask John for a
  website or funnel.
- 2026-09-28 — **Accurate mock-up timing** (Ryan: "change it to accurate timing"). John now says the link comes
  "usually within about an hour" (hand-off reply, the timing FAQ, John's prompt, company context, playbook). Why: the
  only real build (Free & Easy Minimart) took 33 minutes from hand-off with a single clip; builds now make 3 clips
  (5 for property) and a 3D model, and the worker checks every 2 minutes with a short gap between hourly sessions.
- 2026-09-29 — **Smile Plus Dental test fixes** (Ryan). What went wrong: every customer reply re-ran Website
  Intelligence (4 runs in 4 minutes), each run sent its own "quick details" message, John relayed the same questions
  again, ATLAS asked for the website link already given, John asked up to three questions per message, voice notes
  were transcribed as Malay, and each extra run emailed Ryan a "website brief (already built)" copy. Fixes:
  `wrDropPublicQuestions` / `wrAskedTopics` / `wrUrlGiven` (research.js), asks only when holding the build;
  `wbInfoReplyDue` (intake.js) so only the first reply re-runs it; `atQuestionsFromRows` is ATLAS-only,
  `atAlreadyAnswered` + `atOneQuestion` (atlas.js); John's prompt: one question, never repeated, never public facts;
  Website Intelligence prompt: a business found online is always enough; transcription language set to English.
  Tests 109/109.
- 2026-09-29 — **Smile Plus mock-up had no scroll film** (Ryan: "it was shit, no scroll effects"). Cause: Lovable
  turned the film off below 768px (phones saw a still), scrubbed remote Kling MP4s with `currentTime` (choppy), and
  filled the page with static photos; the build also started from the first, thinner brief (addresses and hours as
  placeholders). Fixes: `WB_CINEMATIC` (brief.js) is film-led and phones-first; the routine's film block describes the
  canvas frame scrubber, solid colour panels and effects in every section, crops the Kling watermark, and a new step
  g1 checks the built code and sends Lovable a fix once. The Smile Plus mock-up was rebuilt this way with the real
  addresses, hours and WhatsApp numbers. Tests 109/109.
- 2026-09-29 — **Doctrine wired in** (Ryan's Full Master Cinematic Website Agent 2026). Vault note (verbatim) +
  PDF in `_sources/`; appended to `Website design standard` (read live by the Website Builder; the old two-variation
  and pipeline sections marked superseded). `brief.js`: `WB_DOCTRINE_MARK`, `WB_STORY_BY_CATEGORY` (the PDF's industry
  modules), `wbDoctrineSection` in every Lovable prompt; prompt limit 18,000. Routine: Higgsfield Director (e2, start/end
  frames, sound off; Kling backup), check g1 also requires `docs/storyboard.md` and reversible scrubbed chapters.
  Tests 112/112.
- 2026-09-29 — **Luxury retail layer** (`brief.js`): `WB_LUXURY_KINDS` / `wbLuxuryKind` / `wbKindOf`,
  `WB_LUXURY_STORY` (doctrine 8, 13, 14, 15 + fashion), `WB_DESIGN_LUXURY`, `wbLuxuryPages`, `WB_LUXURY_HOME`,
  `WB_LUXURY_DIRECTIONS` + `wbArtDirections` (three directions for every site), `wbShot` + `WB_LUXURY_SHOTS` (the
  doctrine-22 shot package on every film chapter), QA report `docs/qa-report.md` in the doctrine block. Detection
  fixes: "showroom" alone is no longer a car dealer; watch and jewellery house names recognised. Routine: e2 writes
  the full shot package into the Higgsfield prompt, luxury chapters rule, g1 requires a clean QA report. Tests 115/115.
- 2026-09-29 — **Real photos + deeper research** (`research.js`): `wrImagesFromHtml` (og/twitter images, img src,
  data-src, largest srcset, CSS backgrounds, JSON-LD images/logo; icons, svgs, gifs and tiny images skipped),
  `wrJsonLd` / `wrStructured` (address, hours, phones incl. tel/wa.me links, emails, socials, rating), digest REAL
  PHOTOS section and verified facts, `wrRealPhotos` + brief key `real_photos` (only URLs research found), 13 queries,
  7 pages + 2 social profiles read. `brief.js`: `wbRealPhotosFrom`, `real_url` on image shots, REAL PHOTOS line in
  every Lovable prompt. Routine: shots with `real_url` are not generated. Tests 118/118.
- 2026-09-29 — **Final test prep** (Ryan). `intake.js` `wbCleanQuestions` / `WB_LOOK_Q` (run on John's own reply
  before the intake step); `atlas.js` `atAskedBefore`; John's prompt: never ask about the look, answer first.
  `brief.js`: `wbDoctrineSection` rewritten as the master prompt steps 1-10; `wbChapterShots` (clinic, car, F&B
  chapters and shots); property scenes carry shot packages. Tests 120/120.
- 2026-09-29 — **Film on Kling directly** (Ryan). Routine e2 rewritten (Kling `image_to_video` with first/tail frames,
  `enable_audio` false, `prefer_multi_shots` false; Higgsfield `flux_3_video`/`minimax_h3_max` as backup); the
  builder and research prompts name Kling as the film maker. Tests 120/120.
- 2026-09-29 — **Claude builder path** (routine): f0 routes medical → Lovable (f-g2), others → step F (Higgsfield
  `website-builder-flow` + `scroll-scrub` template, design brief from the master prompt, Kling film cropped and
  encoded with `scroll-scrub-video.sh`, real photos first, GLB 360 for luxury, storyboard + QA report, Phase 5
  gate, `deploy_website`). Routine model → `claude-fable-5-1`. Tests 121/121.
- 2026-09-29 — **Clinic explainer film.** `brief.js`: `WB_EXPLAINER` (dental, cardiology, orthopaedic,
  ophthalmology, general) + `wbExplainerBrief` in `film_brief.explainer`; the Lovable prompt reserves the player.
  Routine step e4: script → Higgsfield `seed_audio` narration → Kling clips → assembled in the Higgsfield sandbox
  (watermark cropped, subtitles, VTT, poster) → uploaded to the Lovable project. Tests 122/122.
- 2026-09-29 — **Transformation film + cinematic finish** (`brief.js` `WB_TRANSFORM` → `film_brief.transformation`;
  routine F3 one 15-second Kling first→tail transformation, F3b film grain / vignette / particles / glass cards /
  tint, no untextured 3D, e2 chapter clips for Lovable builds only). Tests 123/123.
- 2026-09-29 — **Site kit + Vercel hosting + Wow playbook.**
  - `ceo-brain/site-kit`:
    - the engine: film, motion, fx and boot;
    - `scripts/media.mjs` (Kling download, watermark crop, desktop and phone frames, poster);
    - `scripts/kit.mjs` (the engine is fetched at build time);
    - `scripts/deploy-plan.mjs` with `kit-files.json` (the four build files are already uploaded to Vercel);
    - a demo tailoring page, tested on desktop and iPhone: the film scrubs forward and back, no overflow, no
      errors.
  - Vault note `Knowledge/Wow website playbook.md`.
  - Routine:
    - steps F1–F5 rewritten for the kit on Vercel;
    - new step 2b0 (a task waits while its builder's connector is missing);
    - the live prompt is now a short pointer that clones the public repo and follows `ROUTINE.md`, so a merge
      updates the worker.
  - Tests 124/124.
- 2026-09-29 — Vercel set up by Ryan:
  - `fusiontech-mockups` created, with login protection off;
  - the Vercel connector added to the build worker;
  - Git disconnected from all three Vercel projects, because the vault sync's automatic rebuilds used the Hobby
    plan's 100 deployments a day.
- 2026-09-29 — **Scene film upgrade:**
  - the kit engine loads later scenes lazily, fades through black between scenes and orders pins;
  - side-aligned scene titles (`film-chapter--left/right`, `scene-kicker/title/copy`);
  - the demo is rebuilt as 6 tailoring scenes, tested on desktop and iPhone;
  - the playbook has scene recipes for 11 industries (motorbikes included);
  - routine F3: keyframes with one look bible, then Kling scenes chained first/tail.
  - Tests 124/124.
- 2026-09-29 — **Atelier Noir proof scenes made on Kling.**
  - The scenes: shirt → waistcoat builds on → jacket closes → man adjusting cuff → four suits walk at night →
    button macro → suit under the spotlight.
  - The kit demo `media.json` now points at the 6 permanent clips.
  - The worker now uses Kling's watermark-free links and copies each clip to Higgsfield, because Kling links
    expire after 24 hours.
- 2026-09-29 — **Scene sequence engine.** New `src/engine/sequence.js`: one pinned stage, scenes back to back
  with a 6% dissolve and no zoom jump. Checked at 61 scroll positions on desktop and iPhone: a scene is always
  fully visible, never black. The playbook, routine F2/F3 and README now chain every scene to the next. The
  Atelier Noir preview was not rebuilt (Ryan). Tests 124/124.
- 2026-09-29 — **Higgsfield fallback hosting.** When Vercel refuses a deploy (today: the daily limit), the worker
  publishes on Higgsfield with `scripts/higgsfield-host.sh` (routine F6, kit README). Tested end to end on
  `fusiontech-kit-check`. Ryan accepts a link behind the Higgsfield sign-in for now.
- 2026-09-30 00:35 SGT — **Stuck build fix.** The OrangeTee build stopped after its Kling scenes (about 290 credits)
  and the next run skipped it as "already started".
  - The routine now treats a start mark older than 75 minutes as a dead run and resumes it.
  - It logs Kling generation ids (`website_build_progress`) so a resume reuses them.
  - It never ends its turn while a build is in progress.

- 2026-09-30 — **Fusion Property AI — Singapore Property Master Agent installed** (Ryan's agent file, verbatim).
  - Claude Code subagent `.claude/agents/fusion-property-sg.md` (new; no conflict with `atlas` or `website-intelligence`).
  - Graph node [[10_Agents/16_Fusion_Property_SG]] with the five modes and how to start each. It links to
    [[cinematic-website]], [[10_Agents/05a_Website_Intelligence]], [[10_Agents/07_CRM_Architect|07_ATLAS_EDG_CRM_Architect]],
    [[10_Agents/03_Marketing_Growth]], [[10_Agents/04_Creative_Studio]] and [[10_Agents/15_Security_Governance_QA]].
    Ryan's name `07_ATLAS_EDG_CRM_Architect` does not exist, so the link goes to the real ATLAS note (07) under that
    label. `cinematic-website` did not exist, so a new pointer note [[Knowledge/cinematic-website]] maps it to the
    Cinematic doctrine, the Wow playbook and the site kit.
  - Pack [[70_Industry_Packs/Singapore_Property/00_Index]] (00–07).
  - Product folder `90_Products/Fusion_Property_AI/` (Architecture, Roadmap, Data_Model, Test_Dataset_Plan).
  - KNOWLEDGE REFRESH 1 of [[70_Industry_Packs/Singapore_Property/03_Regulation_Register]]: 40 rules, 33 VERIFIED on the
    official pages with URL and date, 7 NEEDS VERIFICATION. Where the official pages differ from the agent file's
    baseline (toilet-only 3-year rule, HS drilling ≤ 50 mm permitted, DRC for all HDB works, NEA landed only), the
    register wins; the agent file is unchanged.
  - Existing notes changed by appending only: `70_Industry_Packs/_index.md`, `10_Agents/_index.md`, `Decisions.md`,
    this changelog, [[Change log]] and [[Open loops]]. Test [32] was added.

- 2026-09-30 — **ATLAS v2 BUILD ENGINE + Fusion EDG Core built (development)** (Ryan: "Build all now"; "Don't do property first, do this first").
  - `.claude/agents/atlas.md`: BUILD ENGINE (v2) sections B1–B18 added, Ryan's text verbatim, plus one line of Zaphiel's ("the stricter safety rule wins"). The diff was shown before saving: 254 lines added, 0 removed. There is no second ATLAS.
  - New code `fusion-edg-core/` (repo root, not the vault). It moves to a private repo when Ryan creates one; the GitHub connector cannot create repos (403).
    - B1: tool registry, capability detection, the `executeTool` safety pipeline, approvals, audit, idempotency, MOCK adapters.
    - B2: multi-tenant schema with forced RLS; cross-tenant test passes; backup/restore tried.
    - B3: outbox dispatcher; 8 n8n templates created INACTIVE in the n8n folder "EDG Core — TEST templates (inactive)".
    - C: form/WhatsApp/email → CRM → owner → follow-up → CEO brief.
    - 51/51 tests pass. Docs, test report and demo script are in `fusion-edg-core/docs/`.
    - Summary: [[00_CEO_Brain/05_Fusion_EDG_Core]].
  - Nothing is in staging or production, and no real customer data was used.

- 2026-09-30 — **Fusion EDG Core moved to its private repo** `ryandhana1515-stack/fusion-edg-core` (Ryan: "repo made"). The history was kept (`git subtree split`, 5 commits), 51/51 tests pass there, and a `CLAUDE.md` with the working rules was added (fusion-edg-core PR #1, merged). The `fusion-edg-core/` folder was removed from the public `ryan` repo; its earlier commits remain in `ryan` history (there are no secrets in them).

- 2026-09-30 — **Supabase dev database live** (Ryan created the org "FusionTech AI" and the project `fusion-edg-dev`, then connected Supabase to Claude).
  - Region: Tokyo (ap-northeast-1). Client production projects will go in Singapore.
  - Migrations 001–008 applied, with FAKE seed data (2 demo orgs).
  - Isolation verified on Supabase itself: no cross-tenant reads, updates, deletes or inserts; the audit log cannot be changed; no data without an organisation; anonymous visitors see nothing.
  - Supabase security advisor: 10 warnings (function search_path), fixed with migration 008; now 0 findings. fusion-edg-core PR #2 merged.

- 2026-09-30 — **Fusion EDG Core staging is live on Vercel** (Ryan: "ok staging"; he imported the repo and set the 3 env vars himself).
  - Project `fusion-edg-core-api`, URL https://fusion-edg-core-api.vercel.app (behind a Vercel login). `/health` returns ok (env staging); `/test-form` works.
  - Database: Supabase `fusion-edg-dev` through the pooler, as the `edg_app` role (RLS applies). The first 500 error was a typo in the database link; Ryan fixed it and redeployed.
  - Ryan's test enquiry created one lead in the FAKE org `acme-demo`: owner assigned, next action set, follow-up task, auto-reply draft. Repeat enquiries were deduplicated.
  - ATLAS on WhatsApp was already live separately: John → Lead Intake → ATLAS n8n workflow `9XQWSgTBszRc0Jxj`.

- 2026-09-30 — **ATLAS can now build the parts that were "not ready yet"** (Ryan: "I want Atlas to be able to do all those"). Fusion EDG Core PR #4, merged; staging redeployed and healthy.
  - Quotations → invoices → payments. The AI quotes only from the client's approved price list; a person approves and sends with one click from an email; invoices are numbered with no gaps; payments come in from a person or from Xero.
  - Appointment booking. Free slots, booking by the AI agent, double booking is impossible (database rule), reschedule, confirmation and reminder messages, Google Calendar sync.
  - Client WhatsApp numbers. A setup checklist that says who does what; one shared WhatsApp inbox address for every client.
  - Accounting. The client connects Xero with one link; invoices go to Xero and payments come back.
  - ATLAS's agent file gained section **B19 EDG MODULE CATALOG** (added only; nothing removed), so every design now uses these parts.
  - 82/82 tests pass. The staging database (Supabase `fusion-edg-dev`) got the 3 new table sets; its fingerprint matches the tested copy, and the security advisor reports 0 findings. All data is FAKE.

- 2026-09-30 — **ATLAS now BUILDS the CRM/EDG system, not only designs it** (Ryan: "do all to make atlas actually working").
  - ATLAS writes a build plan (`16_edg_spec.json`) next to its design. Ryan's email has an **Approve & build** button.
  - One click (with Vercel sign-in) builds the client's own system on the EDG test system: pipeline, team (placeholders), bookings, quotes and invoices, automations and the owner's daily numbers.
  - A self-test then runs a fake enquiry through it, and Ryan gets a review page with a "send a test enquiry" form.
  - Nothing about prices, tax or staff is invented; the page lists what the client must still provide.
  - Code: Fusion EDG Core PR #5 (91/91 tests; migration 012 on Supabase, 0 advisor findings). The ATLAS n8n workflow was updated from the repo and published (127/127 tests).
  - A FAKE demo plan (Lim Renovation) sits in `80_Clients/_Test/lim-renovation-fake-demo/edg/` so the button can be tried at once.

- 2026-09-30 — **ATLAS builds automatically, with no button** (Ryan: "Yes … I want to actually make Atlas work").
  - After ATLAS saves its design, the n8n workflow waits 30 seconds, then asks the EDG test platform to build the client's system (`POST /atlas/auto-build`). Ryan gets a second email, "ATLAS built <company>: check it", with the review link.
  - If the build cannot run, that email says why and keeps the old "see the plan and build" link as a backup.
  - Service businesses (aircon, plumbing, cleaning, pest control, repairs) now get technicians instead of salespeople, a "Service visit" booking (90 min + 30 min travel) and the pipeline New enquiry → Contacted → Quotation sent → Job booked → Job done.
  - The Tan Aircon plan was re-made with this logic: 3 technicians, service visits, quotations, invoices and bookings.
  - Code: Fusion EDG Core PR #6 (92/92 tests). ATLAS workflow `9XQWSgTBszRc0Jxj` was updated from the repo and published (version `2eec5462`; 129/129 tests; the deployed code is identical to the repo).

- 2026-09-30 — **The team app: a screen for the system ATLAS builds** (Ryan: "I don't know what's the point … I want to actually make Atlas work"; "go").
  - Every system ATLAS builds now has a phone app for the client's team at `/app`, with five tabs:
    - **Customers**: every WhatsApp enquiry on a board in the client's own stages (for aircon: New enquiry → Contacted → Quotation sent → Job booked → Job done).
    - **Jobs**: each technician's day, with booking and "job done".
    - **Quotes**: quotations, invoices and payments, the price list, and the GST and payment settings the client enters.
    - **Today**: the owner's numbers and morning report.
    - **Team**: real names instead of placeholders, and one-time sign-in links you can send on WhatsApp.
  - Customers move stages by themselves: quote sent → "Quotation sent", job booked → "Job booked", job done → "Job done".
  - How to get in: on the system page, press **Open the app**. Test tools there: "Test WhatsApp" (fake 9000 numbers only) and "Add example customers" (7 fake customers with jobs).
  - Also fixed: test messages would have failed after the test server restarted.
  - Code: Fusion EDG Core PR #7 (106/106 tests; database change 013 applied to Supabase, 0 security findings).

- 2026-09-30 — **ATLAS now designs and builds each business's AI team, not only its CRM/EDG** (Ryan: "build agents for people … it needs to know how to build AI agents, workflows, solve people problems … not only [one company]").
  - **AI assistant** (the business's own "John"):
    - Answers the business's customers on WhatsApp.
    - Uses only that business's facts: services, hours, approved prices, the answers the owner approved.
    - Finds free times, books the job, prepares quotations from the price list, and saves details and notes.
    - Hands the customer to a person (complaints, money, medical, or when unsure) and then stays quiet.
    - Can never approve a quote, take a payment, mark won/lost, or invent a price.
  - **Workflows** ("when this happens, do that"), for example:
    - call new enquiries that went quiet;
    - follow up quotations after 2 days, with the AI writing the follow-up;
    - thank the customer after the job;
    - rebook customers who didn't show up;
    - tell the owner about overdue invoices;
    - the owner's numbers every morning at 8.
  - **ATLAS** reads the owner's message and lists the problems in the owner's words. It then designs the assistant and the workflows together with the CRM/EDG (`16_edg_spec.json` v2). The test platform builds it all and runs a test chat with the assistant.
  - **Tan Aircon's design** now has 7 problems, the "Tan Aircon Services Assistant" and 6 workflows.
  - **Team app:** a new "AI team" tab showing what ATLAS found, the assistants (on/off), a test chat, the workflows in plain sentences, and the answers the AI may give (the owner approves them).
  - **Timer:** runs every day at 08:00 Singapore time for every business.
  - Code:
    - Fusion EDG Core PR #8 (119/119 tests; database change 014 on Supabase, 0 security findings).
    - ATLAS workflow `9XQWSgTBszRc0Jxj` published as version `051d0507` (131/131 tests; the deployed code is identical to the repo).
    - `.claude/agents/atlas.md` gained section B20 (added only).

- 2026-09-30 — **Every workflow is proven during the build** (Ryan: "it cannot have any errors … must make sure it works").
  - The build now rehearses each workflow with a fake customer, without sending anything. It checks that the words fill in, the stages exist, someone receives owner notices, the customer can be reached, and the AI message gets written.
  - A problem fails the build with the reason. A missing client detail (for example the owner's email) shows as "waiting for".
  - Fusion EDG Core PR #9 (120/120 tests). Tan Aircon's and a dental clinic's designs rehearse with no failures.
  - Also: the rule is in Decisions, and ATLAS's file has a new B20 zero-error paragraph (added only).

- 2026-09-30 — **First real AI test passed (FAKE company "Sparkle Home Cleaning").**
  - Ryan connected the AI (Anthropic key in Vercel) and turned the login wall off. ATLAS's design was built automatically from n8n on the test platform.
  - Result: 7 checks working, 5 waiting for the client's details (the owner's email, a price list). None failed.
  - The real AI assistant answered a test customer: "Our earliest free slots are Thu 1 Oct 9:00am, 9:30am, or 10:00am. Would any of these work for you?" It looked up the calendar itself.
  - The first attempt hit the platform's 60-second limit. Fixed in Fusion EDG Core PR #10:
    - the AI answers in quick mode;
    - the AI checks and workflow rehearsals run side by side, each with a 30 s budget;
    - a build that was cut off finishes its checks on the next run.
  - Now about 44 s. Tests 121/121.
  - The temporary n8n test workflow `fbfGt6dS62t1ZnIw` is archived.

- 2026-09-30 — **Ryan tested ATLAS on WhatsApp (FAKE company "Ah Kow Plumbing"). It worked end to end.**
  - Ryan wrote to John as a plumbing owner. John answered and asked ATLAS's first question. In the background ATLAS designed the system and the test platform built it in about 52 s.
  - Result: 7 working, 5 waiting for the client's details. Ryan got the "ATLAS built Ah Kow Plumbing" email with the link.
  - **Found a real problem:** the AI assistant offered "a free plumbing service visit" even though there is no price list.
  - Fixed in Fusion EDG Core PR #11:
    - every AI reply is checked before it is sent;
    - an amount that is not on the approved price list, or "free", discount or no-charge wording, is never sent;
    - the AI rewrites the reply once, otherwise a person takes over.
  - Tests 122/122.

- 2026-09-30 — **Prospects now get a simple "Try your system" page from John on WhatsApp** (Ryan: "I don't understand what to do on that app and he didn't reply me the link … people will be confused").
  - **New page** (Fusion EDG Core PR #12). It is one phone-sized page in plain words:
    - what ATLAS found in the business;
    - **1** chat with your new AI assistant as if you were your own customer;
    - **2** see that customer land in your CRM;
    - **3** the workflows that run by themselves;
    - what is still needed to switch it on for real.
  - Test system only; AI replies are capped at 60 per company per hour. The link cannot open the staff app.
  - **John sends the link automatically** after ATLAS builds, on the channel the customer used. ATLAS n8n workflow `9XQWSgTBszRc0Jxj` gained 4 steps (published version `c1eee7a5`, identical to the repo; ceo-brain tests 132/132).
  - Ryan's email also gets a "Try it as the customer" button.
  - Ah Kow Plumbing's link was sent to Ryan on WhatsApp through the same sender, as a one-off (the one-off workflow `yEShZhncnlbA6jnK` is archived).

- 2026-10-01 — **John retrained after Ryan's Roen test.**
  - What happened: Ryan asked for a website for Roen (electrician) and gave the link. Because of the 27 Sep rule, John also woke ATLAS. ATLAS built a CRM and sent a CRM demo link. After Ryan said "I didn't want a CRM or EDG", John still added ATLAS's CRM question.
  - Now:
    - a website request never wakes ATLAS;
    - "don't want a CRM", "just a website" and similar end all CRM/EDG talk;
    - the CRM demo link is never sent to a website-only customer;
    - the service-business assistant template no longer says "free" visits.
  - Tests 135/135, including a replay of the Roen chat.
  - Deployed, and checked to be identical to the repo:
    - Lead Intake `b7kbJpnKLN2uQxyn` (version `2a440fd9`);
    - ATLAS `9XQWSgTBszRc0Jxj` (version `2443b4ec`).
  - The Roen website itself: the build worker started it at 09:17 UTC (keyframes and scenes made by 09:23); the session stopped before finishing. Zaphiel set a check-in for 10:35 UTC to resume it.

- 2026-10-01 — **"Finish your setup" page: a built system can now be made to work for a real business** (Ryan: "make it work, build CRM, EDG for people … workflows, automations, everything"; first of 6 steps).
  - From the "Try your system" page, the owner taps **Fill in your details** and fills in, on one phone page:
    - their name and email;
    - the team (real names, who gets new enquiries; add or remove people);
    - opening days and hours;
    - the services customers book;
    - the price list;
    - GST, quote validity and payment terms.
  - **Save and check** re-rehearses every workflow and shows "N of M ready". Prices the owner types count as approved, so the AI assistant quotes exactly those.
  - Tested: a full save goes from 6 to 12 of 13 ready. Only the WhatsApp number is left; FusionTech connects it at go-live.
  - Also fixed: "tell the owner" notices now go to the business owner, not the customer's salesperson.
  - Fusion EDG Core PR #13 (124/124 tests, checked at phone width).

- 2026-10-01 — **Per-client AI costs and monthly limits** (Fusion EDG Core PR #14; 125/125 tests).
  - Every AI reply and AI follow-up records its cost at Claude's official prices (Sonnet 5: US$2 per million input tokens, US$10 per million output; cheaper for cached text).
  - The client sees "AI use this month: N replies · US$x of your US$y limit" in their app. Ryan sees the same on each client's review page and can change the limit there.
  - At the limit the AI pauses and a person answers. Ryan gets an alert at 80% and 100%.

- 2026-10-01 — **Real email is ready on the platform's side** (Fusion EDG Core PR #15; 127/127 tests).
  - Resend sends as "<Business> via FusionTech" from send.fusiontech.com.sg.
  - On the test system only the business's own people (owner and staff) get real email; test customers never do.
  - It switches on when Ryan adds `EMAIL_PROVIDER_API_KEY` in Vercel and redeploys. The domain is on Cloudflare, and Ryan has the click-by-click steps.
- 2026-10-01 — The Roen website mock-up finished (the build worker resumed the stopped build) and John sent the link to Ryan on WhatsApp.
- 2026-10-01 — **ATLAS v3: business-systems intelligence + health check** (Ryan's v3 prompt; "Ok" to the health-check fixes;
  PR #109). Health check: no broken links; 13 duplicated rules and 5 conflicts found. Agent file `.claude/agents/atlas.md`:
  Ryan's "BUSINESS SYSTEMS INTELLIGENCE (v3)" section (verbatim) + notes (pack location, Supabase wording, Marketing
  Agent, raise the ERP question early); one home per rule (secrets §11, approvals B5+B15, n8n B9, lead rule §8, AI
  agents B9, KPIs/CEO Brain B10, audit/failure B11, tests B12, industries → archetypes); conflicts fixed (customer
  contact, website agent names, marketing boundary, B19 sign-in line, §28 real builders). New knowledge pack
  `60_Skill_Packs/ATLAS_Business_Systems/` (29 cards, 12 archetypes; Ryan's text verbatim, card fields completed and
  labelled). Discovery playbook → pointer; 07 ATLAS note links instead of copying; draft notes 01/03/08/10/11/12/14
  link to their cards; `INTEGRATION_SPEC.json` stub in the client template. Scenario tests (fake data):
  A field service PASS, B ERP-like FAIL → fixed → PASS, C property PASS
  ([[80_Clients/_Test/atlas-v3-scenarios/00_Results]]). ceo-brain tests 135/135.
- 2026-10-01 — **Mobile job card built** (Ryan: "ok" to the field-service gap first; Fusion EDG Core PR #16, deployed to
  the test system). Technician's phone screen: address + map link, checklist per service, materials, before/after photos,
  notes, customer signature (or reason), complete; works offline and sends when the signal returns; AI agents refused by
  the app and the database. Migration 015 applied to staging; 137/137 tests; checked in a phone-sized browser offline →
  online → completed. Self-test bookings are now released. ATLAS cards 11/18 and the field-service archetype say TESTED.
- 2026-10-01 — **Staff logins + "each person sees only their own customers"** (Ryan: "do"; Fusion EDG Core PR #17, deployed
  to the test system). Own email + password at `/app/login`, set after a one-time link; lockout after 5 wrong tries;
  hashes only. Owner switch "Who sees which customers" enforced by the database for salespeople/support; managers,
  the AI and the system unaffected; free times stay true. Migration 016 on staging (applied through the SQL tool in
  parts: the migration tool timed out on one statement pattern). 147/147 tests. Cards 01/09 + property archetype updated.
- 2026-10-01 — **Facebook lead forms + property-portal enquiries come in as customers** (Ryan: "do"; Fusion EDG Core
  PR #18, deployed to the test system). Facebook/Instagram lead forms: one webhook for every client Page, the lead is
  read from Meta and goes through the normal intake (owner in turn, follow-ups); Meta retries ignored. Enquiry emails
  (PropertyGuru, 99.co, EdgeProp, SRX, Ohmyhome, Carousell, website plug-ins): a private forwarding address per
  business; the person who enquired is read from the email. Anything unreadable goes to a person, never lost. Test
  tools "Send a test Facebook lead" / "Send a test portal email". Migration 017 on staging; 161/161 tests; checked in a
  phone-sized browser. Cards 01 + property archetype updated.
- 2026-10-01 — **ATLAS B19: Facebook lead forms + portal enquiry emails row added** (Ryan: "save"). ATLAS now offers them as TESTED, staging (real Page and real portal emails NEEDS VERIFICATION).
- 2026-10-01 — **Stock and purchasing built** (Ryan: "stock and purchasing"; Fusion EDG Core PR #19, deployed to the
  test system). Items, stores and technician vans, suppliers; stock changes only through recorded movements (the
  database keeps the figure, nobody can type it in); manager corrections with a reason; counts approved by a different
  manager; materials on the job card come off the van when the job is completed; low stock drafts one purchase order
  per supplier for a manager to approve (never sent by itself); approve & email the supplier (approval limit: the
  preparer cannot approve above it); deliveries in full or in part; supplier bill checked against what arrived.
  Team app: Stock tab, owner switch, test tools. Migration 018 on staging (in parts); 174/174 tests; checked in a
  phone-sized browser. ATLAS (n8n `9XQWSgTBszRc0Jxj`, Finalize ATLAS) switches stock on when a client talks about
  stock/parts and has no ERP (ceo-brain tests 136/136; deployed code verified identical). Cards 11/13/14 + field-service archetype updated.
- 2026-10-01 — **ATLAS B19: stock and purchasing row added** (Ryan: "save"); "inventory" removed from the not-yet list. ATLAS offers it as TESTED, staging, only where the client has no ERP or inventory system.
