# Zaphiel Memory — persistent business state

> Every session reads this first and appends real changes before it ends.
> Rules: newest entry wins; never delete history (strike through and date instead);
> facts here outrank the static account skill when they disagree.

Last updated: 2026-09-25 (session 2: Website Builder agent via Lovable, John Chat Console, Obsidian = main brain rule)

---

## 1. Live business state

- **Company:** Bio Green Elixirs — Singapore (ACRA-registered), owner Ryan Dhana, solo operator.
- **Hero product:** BIO N:OV — 3rd-gen nitric-oxide supplement, 500mg × 60 tablets,
  Bzzworld Korea manufacture, GMP + patented fermentation (KACC91554P). Ryan is the
  **Singapore distributor** (via Bisu World International, KL) — not the manufacturer.
- **Revenue:** $0 to date. **Shopify store EXISTS** — "Bio Elixirs", `sz0gmr-cn.myshopify.com`,
  Basic plan, SGD, Singapore, info@biogreenelixirs.com. Verified 2026-08-08: it had
  **ZERO products**, which is why nothing downstream ever worked. First product created
  that day as a DRAFT: BIO N:OV — Nitric Oxide Support Complex, SKU BIONOV-500-60,
  `gid://shopify/Product/9365786624250`, provisional price S$89 (NOT a decided price —
  needs landed cost). To go live it needs: real price, product photos, and status ACTIVE.
- **Channels live:** biogreenelixirs.com domain (Namecheap, to 2029), Google Workspace
  (info@biogreenelixirs.com), Facebook page, IG @biogreenelixirs, TikTok
  @biogreenelixirs. TikTok Shop SG application in progress; Shopee SG and Amazon US/EU pending.
- **Pricing:** retail price for BIO N:OV **not yet decided** — candidate work exists in
  ad drafts; a board meeting on pricing is a good next step. (Update this line the day
  pricing is set.)
- **Compliance:** supplement ads on Meta/TikTok restrict health claims — support/promote
  language only; "works in 30 minutes" claims must be framed as lab data, never cure/treat.
- **Other ventures:** VEX (venture studio site, in this repo), Veloce Tempesta GT +
  Aurum & Noir (concept luxury sites, Bio-Nov-website repo), BioExcela Global (ecommerce
  ecosystem concept), "Fusion AI / AI Business OS" architecture (omnixai app, session
  2026-07-15 — design phase).

## 2. The AI company (n8n @ ryan1515.app.n8n.cloud, project uFcEmgtYEFyGauyy)

Active workflows (ID — what it does):
- `cVOaVg8smx6412Kq` AI Manager — Company Orchestrator (chat; delegates to specialists)
- `trijC0dd0NbhXLJg` AI Manager — Daily Summary (18:00 daily → Manager Reports table)
- `cuJ1hUpX24cbau7n` AI Manager — Weekly Report (Mon 07:00 → Manager Reports table)
- `25JpHXIZXIyAvwLG` Content Agent — Daily Social Content (09:00 → Content Queue table)
- `mVa6ZEvC5w0xxef0` Ads Agent — Weekly Ad Drafts (Mon 10:00 → Ad Drafts table)
- `E3EeEIq9274TzbE4` Research Agent — Weekly Market Scan (Mon 08:00 → Research Reports)
- `2UEt08SHOgBw8Kp3` Affiliate Agent — Welcome (webhook POST /affiliate-signup)
- `0er3heB5espW8eEK` Customer Service Agent — 24/7 chat (BIO N:OV Q&A, compliance-guarded)
- `JVGDhhmPFSATl7B7` Omnichannel AI Hub — Universal Inbox (POST /inbound-message)
- `eS8K8Si0VqToZajp` WhatsApp Agent — Sandbox (webhook /whatsapp-in)
- `xDrtylIHseMy1vle` Voice Agent — Call Me Now (POST /call-me, ElevenLabs)
- `ObQN64nUN4QgoO3N` Voice Agent — Call Logger (/voice-call-log → Call Log table)
- `wWtVDcMhL0mXvmjf` Website Agent — Immersive 3D Site Designer (chat)
- `eIgJT3NAuP7v9Hes` **Zaphiel — Task Intake** (webhook POST
  https://ryan1515.app.n8n.cloud/webhook/jarvis-task, body {task, category} →
  `jarvis_tasks` table + email to Ryan; this is where the voice app's dispatch_task lands.
  Webhook path and table keep the old `jarvis` spelling on purpose — the live voice agent
  calls that exact URL; renaming them breaks it.)
- `FYNbtG0oHGWiDI2g` Viral Content Engine (URL in → original short video → Metricool draft;
  email approval gate) — built 2026-08-06, PR #14 in this repo
- `mK8LuWxGITRr60GG` Email Daily Market Brief (weekdays 07:50 SGT — emails the brief the
  research session writes to GitHub)
- `s6x9D3vyoNSbvryn` Daily Market Research Agent (07:30 SGT writer — currently INACTIVE;
  the email workflow reads the repo file)
- `NOb10f0yUA8i8saA` **Board of Advisors — Meeting** (built 2026-08-08; see §4)
- `5Lvs87v8qfVMoUiB` Zaphiel — Voice Brain (POST /webhook/zaphiel-brain; inactive draft)
- `b7kbJpnKLN2uQxyn` **CEO Brain — Lead Intake** — ACTIVE. POST
  https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead → Sales Agent "John" (Claude via Gateway
  credits, FusionTech context, rule-engine fallback) → ceo_* tables → auto-send low-risk reply
  via the Outbound Sender, else approval email with APPROVE/Reject links. Source of truth:
  `ceo-brain/` (build.js generates it — never hand-edit its Code nodes). See §4g.
- `SAcnNxG1GWPwn3N7` CEO Brain — Outbound Sender (sub-workflow; email via Gmail live, WhatsApp
  node removed until a WhatsApp Business Cloud credential exists)
- `uQxHTTdEkazgKpRT` CEO Brain — Approve Reply (GET /webhook/ceo-brain/approve … links in emails)
- `3IhIJ5IYsB7wQQSg` CEO Brain — WhatsApp Inbound (GET/POST /webhook/ceo-brain/whatsapp, verify
  token ceo-brain-verify) — published, Meta NOT pointed at it yet
- `Pew2PX1IcgdXqXr7` CEO Brain — Daily Brief (08:00 SGT → email; CEO Intelligence Agent v0)
- `hSTRGnHVsu6tMOmH` **CEO Brain — Website Builder** (Agent #2; called by Lead Intake when a
  customer asks for a website/web app → brief + Lovable build prompt → approval task → email with
  OPEN IN LOVABLE button; source `ceo-brain/workflows/website-builder/build.js`)
- `RVPBGpBzj2SUQlgX` CEO Brain — Website Build Record (POST /webhook/ceo-brain/website-built; the
  agent session that builds on Lovable reports here → task built/failed/skipped + preview email)
- `ny60ozvH8B4uNpcb` **CEO Brain — John Chat Console** — hosted chat to test John:
  https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat (test_mode)
- Inactive/temp: `X5frUjOIdaMQPAbl` Louis Transcribe, `CyiN1kwx3bfjTQyW` +
  `r0IXsruqQ8kQ6NiU` art utilities, `c86AzvcNlDmPn5im` WABA subscribe.

n8n data tables: Business Profile, Leads CRM, Content Queue, Ad Drafts, Research
Reports, Manager Reports, Call Log, Affiliate Outreach, `board_meetings` (jJwgGyONl0lhlyFB),
`jarvis_tasks` (XqtaUAUVXTfTjb7F — voice-dispatched tasks land here; legacy name, see §2 note),
**CEO Brain (2026-09-24):** `ceo_leads` (R78LlzNLIpVoy802), `ceo_messages` (eImH5AdVZEOW0t31),
`ceo_agent_runs` (zoxuUjbgzs6iLIaU), `ceo_tasks` (sPnRGXe4VYDJLJHr), `ceo_audit_logs`
(zjeuGe9AEgJS5MKg) — every row carries `tenant_id`.

## 2b. WHAT CAN ACTUALLY ACT (read this before promising automation)

Diagnosed 2026-08-08 after Ryan said the fleet "does nothing". He was right:

- **UPDATE 2026-09-25 (afternoon): Gateway credits EXHAUSTED again** — both Claude nodes returned
  "Payment required"; Lead Intake and Website Builder fell back to their rule engines (safe,
  generic). Ryan must top up n8n AI credits or add an Anthropic API key credential. Check
  `ceo_agent_runs.provider` = `rules`/`fallback` to see when this is happening.
- **UPDATE 2026-09-24: n8n Gateway credits WORK again** — the managed Anthropic credential
  answered on `lmChatAnthropic` and `anthropic` nodes (claude-sonnet-4-6) with no API key. The
  "Payment required" failures of 2026-08-05/08 no longer reproduce. Workflow `NOb10f0yUA8i8saA`
  (board meeting) is therefore probably runnable again — untested since.
- **n8n holds only TWO credentials: Gmail and GitHub.** There is no Shopify, Meta, TikTok,
  Metricool, Higgsfield or Kling credential in the instance. So every "agent" in §2 can
  only think, write to a data table, and email. **None of them can touch the store or the
  ad account.** That is the root cause of the queue-receipt problem — not prompt wording.
- **Meta ads cannot be automated yet.** Ad account `767841886323870` (ACTIVE, SGD) returns
  `is_ads_mcp_enabled: false` — Meta is still rolling Ads MCP out to this account, so
  create/edit ad calls are refused by Meta, not by us. It also has
  `has_payment_method: false`, so nothing could spend anyway. Read-only research
  (ads_library_search, benchmarks) still works. Recheck the flag periodically.
- **The only thing with real hands is a Claude session** (this one), whose MCP connectors
  reach Shopify, Meta, Higgsfield, Kling, Metricool, Canva, Gmail, Drive, Calendar, Slack,
  Vercel, Lovable, Figma and n8n. Anything that must *do* rather than *draft* has to run
  in a session — either interactively, or on a schedule via a Routine/trigger.
- Practical rule: before telling Ryan something is "automated", check whether the executor
  actually holds a credential for that system. If it doesn't, say so.

## 3. Repos and sites

- `ryandhana1515-stack/ryan` — THIS repo: Zaphiel brain, board/, bionov/ (BIO N:OV
  three.js landing), vex/ (VEX React site), nano_banana.py (OpenRouter image gen).
  Default branch: `claude/setup-nano-banana-openrouter-u2JAQ`.
- `ryandhana1515-stack/Bio-Nov-website` — Bio N:OV site experiments, luxury concept
  sites, n8n agent setup work.
- Open PRs in `ryan`: #14 Viral Content Engine assets, #15 Board of Advisors + Zaphiel brain.

## 4. Board of Advisors (decision module)

- Seats: **Alex Hormozi** (Offers & Acquisition), **Charlie Munger** (Decision Quality &
  Risk), **Seth Godin** (Brand & Trust), **Sara Blakely** (Bootstrap Operations).
- Dossiers: `board/dossiers/*.md` (doctrine with primary sources, adversarially
  fact-checked — reports in `board/factcheck/`). Editing rules: retire entries, never
  delete; never hand-edit Verification fields (any substantive edit drops the entry to
  `user` until re-checked).
- Convene (CURRENT method — in-session, no API keys): the Claude session runs one
  isolated subagent per seat (each may read ONLY its own dossier file), the session
  itself chairs against the full live brief, then `node board/meeting.js` applies the
  citation gate + unanimity/prose guards deterministically, and the result is POSTed to
  n8n workflow `6go4TpVkwmoO1tnd` (webhook path `board-store`) which stores it in
  `board_meetings` and emails Ryan. Seat calls are covered by the Claude subscription.
- n8n workflow `NOb10f0yUA8i8saA` is the fully-built self-contained alternative, but
  its 3 Anthropic nodes fail with "Payment required" — **n8n AI credits are exhausted**
  (same reason the daily-brief workflow was rebuilt credential-free on 2026-08-05).
  It works again the day an Anthropic API key or n8n credits are added; storage, email,
  GitHub-fetch, gating and guards inside it are verified working.
- Standing review: monthly unprompted meeting (see skill for the routine).

## 4b. Zaphiel voice app (the face)

- **Live URL: https://ryan-rho.vercel.app** — Vercel project `ryan`
  (prj_Bqty7IxYVy3xFGmDJF0vpxPU1pOh, team ryandhana1515-6929s-projects). Source:
  `zaphiel/app/` in this repo (index.html + manifest.webmanifest + icon.svg + vercel.json).
  Deploying: the team blocks creating NEW Vercel projects (403) — always deploy into the
  existing `ryan` project, and keep `vercel.json` in the upload (the project is pinned to
  the Python framework; the builds override is what makes static files serve).
- Behavior (v3, 2026-08-08): PWA (save to home screen = standalone app). Landing view is
  the VOICE CORTEX — first visit taps JACK IN for the mic, return visits auto-arm a
  standby sentinel that wakes on a clap (sharp transient) or ~350ms of speech. Behind a
  sidebar sit EIGHT TEXT SPECIALISTS (UGC Director, Product Visuals, Content, Ads,
  Web & 3D, Store & Pricing, Market Brief, Board Clerk), each its own chat with a copy
  button on every answer. Look: terminal palette, scanlines, and a coiled dragon
  ouroboros around the core that breathes with the voice.
- **How the specialists work (important):** they are all the SAME ElevenLabs agent, run in
  `textOnly` mode with a per-session `overrides.agent.prompt.prompt` — that is why there is
  only one agent to pay for. This required enabling prompt + firstMessage + text_only in
  the agent's `platform_settings.overrides`; if those get switched off, every sidebar chat
  silently falls back to the chief-of-staff persona.
- **VOICE ENGINE (changed 2026-08-09): free on-device speech is now the DEFAULT.** The
  ElevenLabs account ran out of credits — every conversation from 2026-08-08 onward died in
  0-3 seconds with `termination_reason: "This request exceeds your quota limit."`, which
  surfaced to Ryan as "link closed" halfway through speaking. The app now uses the Web
  Speech API (recognition + speechSynthesis) with no quota and no cost, picking the best
  neural voice installed on the device. Tell Ryan to install a premium voice at
  Settings > Accessibility > Spoken Content > Voices — that is what makes it sound human
  rather than robotic. `ENGINE` in the app switches between "free" and "eleven" and is
  remembered in localStorage; if an ElevenLabs session dies inside 6 seconds without the
  agent ever speaking, the app now names the real cause on screen and falls back to free
  permanently instead of looping on reconnect.
- Brain for the free voice is on-device (`MIND` in the app) — real business facts only,
  and it says "I don't know" rather than inventing. `BRAIN_URL` is the single constant to
  point at a remote LLM endpoint when one is available; nothing else needs changing.
- **Anti-queue rule, baked in:** every specialist prompt AND the voice prompt forbid saying
  a request was filed, queued or emailed. They must produce the finished script/copy/plan
  in the window. `dispatch_task` is a last step, only when Ryan asks to queue something.
- Board Clerk never speaks for the four seats — it only sharpens the question, so the
  citation-gated meeting remains the only place they are quoted.
- Voice brain: **ElevenLabs conversational agent `agent_3001kzgz64emesm91398nx05c17e`**
  ("ZAPHIEL — Ryan's Chief of Staff", public auth, 10-min session cap, ElevenLabs-side
  usage billed to Ryan's ElevenLabs account). Its `dispatch_task` webhook tool POSTs
  {task, category} to the Zaphiel — Task Intake workflow (`eIgJT3NAuP7v9Hes`), so tasks
  spoken to the face land in `jarvis_tasks` + Ryan's inbox for a Claude session to execute.
- Older artifact prototype (tap-to-talk, local intent engine, no ElevenLabs cost):
  `zaphiel/face/index.html`.
- **Push-to-deploy now works.** A root `vercel.json` (static build of `zaphiel/app`
  with routes to its index) overrides the project's Python framework pin — every
  git deploy before 2026-08-08 failed with PYTHON_ENTRYPOINT_NOT_FOUND. Pushes to a
  feature branch build a PREVIEW at
  `ryan-git-claude-ai-agent-bo-f4821d-ryandhana1515-6929s-projects.vercel.app`;
  only a push to the DEFAULT branch (i.e. merging the PR) updates production
  `ryan-rho.vercel.app`. The Vercel MCP deploy tool needs an interactive permission
  grant Ryan must approve; merging is the credential-free path to production.

## 4c. Cinematic 3D-scroll websites (a product Ryan sells)

- Playbook: `zaphiel/playbooks/cinematic-3d-sites.md` — Ryan's own 5-brief playbook turned
  into an executable procedure. Engine: `zaphiel/templates/cinematic-scroll/` (frame-sequence
  scroll scrub, smooth scroll, pinned reveals, parallax; zero dependencies).
- The trick that makes it work: generate ONE hero image first, then pass it as the image
  reference to all three clips (ORBIT -> MACRO -> EXPLODED). Higgsfield for generation
  (Seedance 2.0, std, 1080p, 16:9, ~8s), Kling `image_to_video` as the cinematic alternative.
  ffmpeg the orbit into ~120 stills; the template scrubs them on scroll.
- Pricing per the playbook: mid-market $1.5k-$8k a site; big-brand tier 10-50x, pitched with
  a finished fictional demo rather than a deck. Never publish a demo under a real brand's
  name or logo without engagement.
- Reflected into: skill §9, and the app's "Site Director" specialist.

## 4d. bionov/ site — compliance rewrite (2026-08-08)

The three.js BIO N:OV site in `bionov/` was built but never deployed, and its copy was a
regulatory liability: it named stroke, dementia, Alzheimer's, myocardial infarction,
diabetes and hypertension, claimed garlic "promotes anticancer substances", and advertised
"-25% blood pressure" and "-8% blood sugar". 43 targeted replacements removed every disease
name and disease-marker efficacy number, reframed lab data as raw-material lab measurement,
and strengthened the footer disclaimer. **Do not revert to the brand-deck copy** — it is
HSA-unsafe in Singapore and an automatic Meta rejection.

## 4e. Autonomous daily run (the thing that works without Ryan)

- Spec: `zaphiel/routines/daily-operator.md` — full parameters and the verbatim prompt.
- Fires 08:00 SGT daily as a FRESH Claude session (so it carries the full connector set),
  push + email notification on completion.
- Each run: read memory, check Shopify and the Meta ad-account flags for real, then DO one
  concrete thing that advances open loop #1, then write what changed back to memory and push.
- Guardrails in the prompt: spends no money, publishes nothing, sets nothing ACTIVE, invents
  no numbers, and must admit plainly when a run achieved nothing.
- **Status: awaiting Ryan's approval of the create_trigger permission prompt.** Re-issue the
  call verbatim from the spec once granted.

## 4f. Zaphiel can analyse video (added 2026-08-09)

Ryan kept pointing at reference creators and asking for "that". Zaphiel now has a
documented path to actually watch a clip rather than guess — skill §10.
- Higgsfield `video_analysis_create` takes a **YouTube URL directly**, or a `video_input_id`
  for something already uploaded. Poll `video_analysis_status` (3-5 min).
- **TikTok/Instagram URLs are rejected** — the page is HTML, not a video file. Ryan must
  save or screen-record the clip and upload it; then `media_upload`/`media_confirm` into
  Higgsfield. `media_import_url` only works on direct file URLs (verified on
  raw.githubusercontent.com).
- `virality_predictor` reads hook strength and retention, on references and on our own cuts.
- Open reference Ryan wants studied: TikTok @hugovar.ai (an AI-persona account). Blocked
  from this environment — tiktok.com is refused by the egress proxy. Needs an upload.

## 4g. CEO Brain — AI Company OS, Phase 1 (built 2026-09-24)

Ryan's second product line: an AI Lead & Sales Agent platform (multi-client SaaS later).
- Code: `ceo-brain/` (agents/, prompts/, schemas/, workflows/, database/, integrations/, tests/,
  docs/). `npm test` = 22 tests incl. a simulation of the exact n8n Code-node JS.
- Live: n8n workflow `b7kbJpnKLN2uQxyn`, endpoint POST /webhook/ceo-brain/lead. Verified end to
  end (executions 159 mock, 160 live Claude, 161 human-review + Gmail email).
- Agent #1 `sales-qualification` v1.0.0: strict output schema 1.0, never fabricates (nulls +
  missing_information), max 3 progressive questions, drafts only. Guardrails are code
  (postprocess.js): prices/guarantees/refunds/contracts in a reply → withheld + HUMAN_REVIEW;
  WON/LOST human-only; proposals need approval. Rule engine (rules-v1) is mock mode AND fallback.
- Data: n8n data tables now (ids in §2); Postgres/Supabase migration with RLS ready in
  `ceo-brain/database/migrations/0001_init.sql`.
- Tenant for Ryan's own business = `biogreen`. Approval emails go to ryandhana1515@gmail.com
  (Workflow Config node).
- **Phase 2 (2026-09-25, Ryan: "never mind, do phase two")**: Outbound Sender, auto-send of
  low-risk replies (`Workflow Config.auto_send_low_risk`, default true), owner approval links,
  WhatsApp inbound adapter, Daily Brief — all published. Verified: execution 165 auto-sent John's
  email reply to a demo lead; 164 emailed the first CEO brief. Default tenant is now `fusiontech`.
- **John** = the Sales Agent persona (Ryan: "give John the brain"). Briefed from
  `zaphiel/knowledge/fusiontech-master-brain.md` via `ceo-brain/prompts/company-context.md`.
- **One blocker for WhatsApp**: n8n has no WhatsApp Business Cloud credential (the July sandbox
  token in `eS8K8Si0VqToZajp` expired; never copy it). Ryan must create the credential (permanent
  System User token + phone number id); then re-add the WhatsApp node in the sender and point
  Meta's webhook at /webhook/ceo-brain/whatsapp.
- Not in the repo: the four Phase 2 workflows' SDK source (the session's permission classifier
  blocked writing the sender file). Export them from n8n when next touched.
- **Phase 2b (2026-09-25, later)**: **Website Builder = Agent #2** (`ceo-brain/agents/website-builder/`).
  Lead Intake's new "Website Requested?" gate fires when the CURRENT message asks for a website /
  landing page / online store / web app / portal (or a new lead's desired automation includes
  `website_build`), hands off fire-and-forget to `hSTRGnHVsu6tMOmH`. That agent validates a brief
  (facts only from the customer's words; pages/features may be proposed; fabricated business names
  are stripped), builds a ≤1800-char Lovable prompt, upserts ONE `website_build` task per lead
  (`requires_approval`), and emails Ryan an **OPEN IN LOVABLE** button (Lovable Build-with-URL,
  `https://lovable.dev/#prompt=…`). Pressing Send in Lovable is the approval. The Lovable REST API
  cannot create AI projects (MCP-only), so nothing is created automatically — by design.
  John's context now says FusionTech DOES build websites as part of AI systems (was "NOT a website
  agency"). Verified: execution 175 → 176 (email 1a0d800062ce04cf), chat console execution 177.
  Lead webhook `ignoreBots` removed (it rejected n8n's own HTTP client with 403). 28 tests pass.
- **John Chat Console** `ny60ozvH8B4uNpcb`: where Ryan tests John as a prospect. Every message =
  real Lead Intake run in test_mode (nothing to customers), memory reloaded from `ceo_messages`
  per chat session, console status line under each reply.

## 5. Decisions log

- 2026-09-25 — **FusionTech AI is the AI-automation company** (brand of the CEO Brain product);
  its Master Company Brain v1.0 is approved knowledge at `zaphiel/knowledge/fusiontech-master-brain.md`.
  The Sales Agent is named John and sells FusionTech's positioning (customized AI workforce +
  company OS, never "a chatbot"; no prices, no guaranteed outcomes; third-party costs separate).
- 2026-09-25 — Ryan approved Phase 2 start. AI may auto-send low-risk qualifying replies;
  prices/proposals/refunds/contracts/legal/WON/LOST stay human-approved.
- 2026-09-25 — **Zaphiel's brain moves to an Obsidian vault** (Ryan). Ryan sets the vault up;
  until he says "vault is ready", `zaphiel/memory.md` stays the source of truth. Plan + converter:
  `zaphiel/obsidian/` (vault lives inside this repo at `zaphiel/vault/`, synced by Obsidian Git;
  n8n reads it through the GitHub credential; Claude sessions through the clone). CEO Brain
  Phase 2 stays on hold.
- 2026-09-24 — CEO Brain architecture: repo `ceo-brain/` is the source of truth, n8n is the
  runtime, agents return schema-validated JSON, guardrails live in code not prompts, the rule
  engine always runs as baseline/fallback, every row is tenant-scoped. AI drafts; humans send.
- 2026-08-08 — Zaphiel architecture: repo `ryan` is the brain (CLAUDE.md + zaphiel/ +
  .claude/skills/zaphiel); n8n is the always-on body; connectors are the hands. One-off
  session builds are over — new capabilities get indexed here.
- 2026-09-25 — **Obsidian vault = the main brain from the day Ryan creates it.** Everything
  important Ryan says and everything built gets added to the vault at the end of every session
  (memory.md until then). Knowledge documents (FusionTech brain) live in the vault verbatim.
- 2026-09-25 — Website builds go through Lovable via Build-with-URL links inside an approval
  email; no automatic project creation, no deploys without Ryan. Website Builder is Agent #2.
- 2026-09-25 — John's brief changed: FusionTech builds websites/web apps when part of an AI
  system (not "NOT a website agency"). Website requests are welcomed and handed to Agent #2.
- 2026-08-08 — Board roster fixed at Hormozi/Munger/Godin/Blakely; meetings via n8n with
  managed Anthropic credentials; chat + repo archive + email surfacing; monthly standing
  review approved by Ryan.
- 2026-08-06 — Viral Content Engine flow: reference URL → transcript → 3 Claude agents →
  email approval → render → Metricool draft (never auto-publish without approval).
- Earlier (from account skill): affiliate commissions 15–20% TikTok / 15–25% GoAffPro;
  target markets SG→MY/TH/PH→US/AU/UK; FAL.AI model choices for images/ads.

## 6. Change log

- 2026-09-25 (session 2): built **Website Builder** (Agent #2, `hSTRGnHVsu6tMOmH`) + Lead Intake
  hand-off gate; **John Chat Console** (`ny60ozvH8B4uNpcb`); John's brief now welcomes website
  requests; rules engine tags `website_build`; lead webhook `ignoreBots` removed; Obsidian
  builder copies `zaphiel/knowledge/*.md` verbatim; CLAUDE.md carries the "vault = main brain,
  append every session" rule. Gateway credits found exhausted ("Payment required").
- 2026-09-25 (session 2, later): Ryan wants zero-click website builds. Built **Website Build Record**
  `RVPBGpBzj2SUQlgX` (task update + audit + preview email; verified). The Lovable build step and the
  hourly Zaphiel Routine were blocked by the permission classifier — needs Ryan's authorization (§7).
- 2026-09-25: FusionTech brain stored; Sales Agent v1.1.0 (John); Phase 2 workflows built and
  published (Outbound Sender, Approve Reply, WhatsApp Inbound, Daily Brief); Lead Intake updated
  in place (26 nodes) and verified byte-identical to the repo build.
- 2026-09-24: **CEO Brain Phase 1 shipped** — `ceo-brain/` module, n8n workflow `b7kbJpnKLN2uQxyn`
  (24 nodes, published), 5 `ceo_*` data tables, Sales Qualification Agent with Claude + rule
  fallback, 22 tests, Postgres migration, docs. Discovered Gateway credits work again (§2b).
- 2026-08-08: brain created (CLAUDE.md, memory.md, ops skill). Board of
  Advisors built: parser+gate lib (38 tests), 4 researched dossiers, adversarial
  fact-check, n8n meeting workflow `NOb10f0yUA8i8saA`, `board_meetings` table, PR #15.
- 2026-08-08 (later): voice app shipped to https://ryan-rho.vercel.app (clap/voice
  wake, ElevenLabs realtime voice, PWA). Task Intake workflow `eIgJT3NAuP7v9Hes`
  + `jarvis_tasks` table wired to the agent's dispatch_task tool. First real board
  meeting ran ("$2,000 ads before store live?" → unanimous NO with per-seat unlock
  conditions), stored + emailed via `6go4TpVkwmoO1tnd`.
- 2026-08-08 (later still): **renamed Jarvis → ZAPHIEL** at Ryan's instruction. Renamed:
  repo dirs (`jarvis/` → `zaphiel/`, skill dir + skill name), CLAUDE.md identity,
  this file, the voice app UI, the ElevenLabs agent name and greeting, and the n8n
  workflow display name. Deliberately NOT renamed (would break the live voice link):
  webhook path `/webhook/jarvis-task`, data table `jarvis_tasks`, ElevenLabs
  `agent_3001kzgz64emesm91398nx05c17e`, Vercel project `ryan` / URL ryan-rho.vercel.app.

## 7. Open loops / next actions

- **Top up n8n AI Gateway credits** (or add an Anthropic API key credential) — John and the
  Website Builder are on rule fallbacks since 2026-09-25 afternoon.
- **Push branch `claude/inspiring-cori-j5wemu`** (two commits, incl. this one) — the session's
  permission classifier blocked `git push`; Ryan pushes, PR #20 updates, merge = brain update.
- **Zero-click website builds (Ryan 2026-09-25: "the AI agents do it all, I just sit and relax")**:
  Lovable MCP is OAuth-only → only a Claude session with the Lovable connector can build; the build
  session's permission system refused the demo build and the unattended hourly Routine. Needs Ryan's
  own authorization: start the "Website Build Routine" (hourly; reads open website_build tasks,
  skips test/chat leads, create_project on workspace zjVuSnHzhPWFroVpa2KX, reports to
  /webhook/ceo-brain/website-built) from his own Claude session, or add a permission rule for
  `mcp__Lovable__create_project`. Until then the email's Lovable button is the one click.
- Ryan already used the John Chat Console himself (lead_chat_780236a8…, "website about bmw").
- **Obsidian vault**: waiting for Ryan to create it (steps in `zaphiel/obsidian/MIGRATION-PLAN.md`);
  then run `node zaphiel/obsidian/build-vault.js` and retire memory.md.
- CEO Brain Phase 2 remaining: WhatsApp credential + Meta webhook switch, Lead Ads/website
  adapters, follow-up nudges, Calendar booking, Supabase. Then Phase 3: Agent Router + Solution
  Architect Agent.
- **#1 bottleneck: get the Shopify store live** — until then revenue is $0 and every ad
  dollar is premature (board meeting topic).
- Decide BIO N:OV retail pricing (convene the board with live cost data).
- TikTok Shop SG application — follow up.
- Merge PR #15 to activate the Zaphiel brain for all future sessions.
- Wire the board's monthly standing review routine (first Monday of month).
- Fusion AI / AI Business OS: design exists; decide build vs park.
