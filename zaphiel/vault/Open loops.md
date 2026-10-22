---
tags: [zaphiel, open-loops]
---
# Open loops

- **Ryan:** top up n8n AI credits (John and the Website Builder are on rule fallbacks).
- **WhatsApp is live for testing (2026-09-27).** Meta app "AI AGENTS" (1415986013818104) on Ryan's Meta business
  portfolio; free Meta test number (phone number ID `1321607761025022`, WhatsApp account `1034122678981935`); n8n
  credential "WHATSAPP FUSION TECH"; webhook → `/webhook/ceo-brain/whatsapp`, field `messages`; Outbound Sender sends
  WhatsApp. Ryan talked to John on it the same night.
- **Ryan (decision):** the old Bio Green app "Test" (1349701273957004) is still subscribed to this WhatsApp account and
  its n8n sandbox (`eS8K8Si0VqToZajp`, /webhook/whatsapp-in) also receives every message. Its key is expired so it
  cannot reply today; unsubscribe it before real customers use the number (Zaphiel can do it on Ryan's word).
- **Ryan (before real customers):** register FusionTech's own WhatsApp business number (the test number only reaches 5
  verified phones, and it sits under the Ryan Dhana/Foodblock portfolio); then Zaphiel swaps the phone number ID.
- **Done 2026-09-26 23:38 SGT:** Ryan attached n8n, Lovable, Higgsfield and Kling to the routine "Zaphiel —
  Website Build Worker". The mock-up chain is fully wired. The real test is Ryan through John on WhatsApp.
  Still optional for Ryan: delete the half-made "Lovable MCP (OAuth2)" credential in n8n and the test project
  "Sunrise Dental Clinic" in Lovable.
- ~~**Zaphiel:** John promised "10 to 15 minutes" for the mock-up~~ — done 2026-09-28: John now says "usually within
  about an hour" (Ryan: "change it to accurate timing").
- **Ryan:** paste `ceo-brain/website-chat/embed-snippet.html` into FusionTech.com.sg before `</body>`
  so visitors talk to John there; until then use https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat.
- **Ryan:** open the Training Room once (https://ryan1515.app.n8n.cloud/webhook/ceo-brain/dashboard),
  enter the PIN, allow the microphone, and change the PIN in n8n ("CEO Brain — Trainer API" →
  Trainer Config node) from the repo default.
- **Zaphiel:** after credits: run a real conversation, confirm John answers with Claude and the
  Leads/ note fills in with names and facts.
- **Ryan:** the directive message was cut off after "Client" in Part 26 — send the rest (the second
  client example and anything after it).
- **Ryan:** run one real discovery in the Discovery Console and correct the agent in
  [[Knowledge/Company Discovery — playbook]]; approve or reject the first proposal draft task.
- **Zaphiel (after credits):** Website QA inspection of a built Lovable preview (the checklist exists;
  the inspection needs a built site); Solution Architect, Customer Service, Email/Admin, Marketing,
  Operations, Finance Assistant agents in the same contract; Supabase migration (002 is ready).

## From Build Prompt v3 (2026-09-25) — Ryan's items
- **Ryan:** put the two PDFs (Blueprint, Review v2) into `zaphiel/vault/_sources/`; Zaphiel then copies the MUST DO / MUST NOT DO word-for-word into all 25 agent/worker notes.
- **Ryan:** review Phase 1 (the new folders) and say "continue" — or correct anything.
- **Ryan:** approval authority: who approves what (Ryan, Dad, client owner) and money limits → [[40_Registries/Agent_Permission_Matrix]] human approvers table.
- **Ryan:** choose the core stack for the first package (CRM, WhatsApp provider, dashboard, hosting) and create/authenticate the accounts; then say which integrations are `tested` so the [[40_Registries/Integration_Registry]] moves off `planned`.
- **Ryan:** pick the first pilot client (Bio Green Elixirs or Brow Revolution) and set the package price (proposal only, never in an agent).
- **Zaphiel (Phase 2, after Ryan's "continue"):** Solution Architect output (phased target architecture per client), onboarding steps 5–8 design detail, the first `80_Clients/` folder for the pilot, skill-pack extraction.
- **(Ryan)** Change the Approval Inbox PIN in n8n ("CEO Brain — Approval Inbox" → node "Inbox Config"); it
  starts as the same default as the Trainer PIN. Open https://ryan1515.app.n8n.cloud/webhook/ceo-brain/inbox
  once and press "Mark done" on the old test approval ("build MEDICAL business website for Dashboard tester").
- Next session: make Lead Intake, Website Builder, Build Record and the Build Runner post their events
  (`lead.human_review`, `website.brief`, `website.built`, `website.build_failed`, `workflow.failed`) to
  `POST /webhook/ceo-brain/event` so the Orchestrator sees every hand-off, not only the tables (Website
  Intelligence already does).
- ~~**(Ryan)** Top up the n8n Gateway credits~~ — paid 2026-09-26.
- Next: John reads open `website.info_needed` tasks and asks the customer in his own voice; Build Record sends
  `MOCKUP_READY` to John.
- ~~**Ryan (decision):** OK the plan to merge ATLAS into [[10_Agents/07_CRM_Architect]]~~ — done 2026-09-26 (Ryan: "ok merge"), see ADR-4 in [[Decisions]].
- ~~**Ryan:** top up n8n AI (Gateway) credits for ATLAS~~ — paid 2026-09-26; ATLAS runs on Claude Sonnet 5.
- **Zaphiel (next session):** ATLAS checkpoint 1 → 2 is manual for now: after Ryan confirms in the Approval Inbox, run
  the `atlas` subagent in Claude Code on `80_Clients/<company>/edg/` to continue. John already asks ATLAS's questions automatically (live 2026-09-26).
- ~~**Waiting for Ryan's Gateway top-up**~~ — done 2026-09-26: Ryan paid; Website Intelligence (funnels, sales
  strategy, 3D motion, realistic anatomy) and the Website Creator upgraded and deployed, see [[Change log]].
- **Ryan (the real test):** message John on WhatsApp or the chat page as a real customer (e.g. a clinic with its
  website link, asking for a mock-up). John answers, Website Intelligence researches silently, the creator builds on
  Lovable + Higgsfield, and the Build Worker (hourly, stays on duty the whole hour) sends both links back through John.
  Test leads never spend Lovable/Higgsfield credits, so this first real build is the proof.

- **Done 2026-09-29 19:40 SGT (Ryan): Vercel is set up.**
  - Project `fusiontech-mockups` (`prj_6ITMtjlNrihYOwfvZqDB2Dsvn4xc`, Vite) exists, with Vercel Authentication off.
  - The Vercel connector is on the build worker routine.
  - Git is disconnected from `ryan`, `ryan-cgab` and `fusiontech-mockups`. Their automatic rebuilds on every vault
    sync had used all 100 of the Hobby plan's daily deployments.
- **Proof build approved by Ryan (2026-09-29 20:05 SGT).** The "Atelier Noir" scene film is made:
  - 7 keyframes and 6 Kling scenes (334 credits);
  - stored permanently on Higgsfield and wired into `ceo-brain/site-kit/media.json`.

  - Preview for Ryan (behind the Higgsfield sign-in):
    https://atelier-noir-preview.higgsfield.app/atelier.html. This is Higgsfield website `697a1947-…`, built in the
    Higgsfield sandbox; all 6 scenes were cut into frames.
  Zaphiel deploys it to `fusiontech-mockups` when the Vercel daily limit resets (2026-09-30 about 19:30 SGT),
  aliases it `atelier-noir-mockup.vercel.app`, and sends Ryan the link.
- **Zaphiel (after the daily limit resets, 2026-09-30 about 19:30 SGT):**
  - Deploy the kit demo to `fusiontech-mockups` as files.
  - Confirm the build fetches the engine and a Kling film.
  - Confirm the link opens with no login.
  - Then offer Ryan a proof rebuild of the suit brand.
- **Zaphiel:** the n8n Website Builder "Finalize Website Brief" node is behind the repo by the `WB_TRANSFORM` table
  (commit 4ac1556); two deploy attempts were blocked because the 114 KB code could not be passed as one tool
  argument. The build worker carries the same transformation table in its own instructions, so builds are not
  affected; deploy the node with the next Website Builder change.
- **Fusion Property AI (2026-09-30):**
  - Re-verify the 7 register rows marked NEEDS VERIFICATION, starting with CEA's guidance on AI/virtual staging and
    the developer artist's-impression rule. Singapore Statutes Online was down; top up Firecrawl credits first.
  - Ryan: source the first 30–50 floor plans, with permission, for the Phase 0 test set.
  - Decide whether John should hand floor plans to the agent (today it runs in Claude Code only).
- **Fusion EDG Core (2026-09-30):**
  - Ryan: create the empty private GitHub repo `fusion-edg-core`; Zaphiel then moves `fusion-edg-core/` there with its
    history. The connector cannot create repos.
  - Ryan: create a Supabase dev/staging project and connect it (never paste keys in chat). Then Zaphiel runs the
    migrations there and deploys the API to a Vercel preview (L3, needs Ryan's OK).
  - Production scheduling for the dispatcher and follow-ups: Vercel Cron or pg_cron, not n8n (execution limits).
  - The 8 n8n EDG templates sit inactive, pointing at a placeholder URL. Connect them to a client's API only after
    approval.
- **Fusion EDG Core, 2026-09-30 update:** the private repo is done (code moved, tests green). Next is Ryan's Supabase
  project + connector, then "OK staging".
- **Fusion EDG Core, 2026-09-30:** the Supabase dev database is live (Tokyo, FAKE data, 0 security findings). Next is
  staging: the API goes on a Vercel preview. Ryan says "OK staging", and he sets 2 secrets himself (the app database
  password, and EDG_WEBHOOK_SECRET in Vercel).
- **Fusion EDG Core, 2026-09-30 (staging live):** `fusion-edg-core-api` on Vercel works with FAKE data. Open:
  - Ryan: yes/no on sending John's real WhatsApp enquiries into the EDG CRM as FusionTech's own CRM (this stores real
    contacts). If yes: Zaphiel changes the Lead Intake workflow from the repo; Ryan adds EDG_WEBHOOK_SECRET as an n8n
    credential and allows n8n past the Vercel login (protection bypass).
  - Optional: a CRM screen for FusionTech staff.
  - Minor: the test-form banner still says "local EDG API"; fix the wording for staging.
- **EDG modules, 2026-09-30 (built, tested on FAKE data):** what is still needed before the first real client:
  - Verify the live adapters on real TEST accounts: a Meta test WhatsApp number, a Xero demo company, a Google test calendar. This needs FusionTech's own Meta / Xero / Google developer apps; Ryan creates those accounts once and Zaphiel guides him.
  - Staff web sign-in (Supabase Auth) is not built; people act through one-click email links for now.
  - For each client: the price list, tax rate, quote validity and payment terms come from the client during onboarding.
- **ATLAS builds (2026-09-30).** Built and working on the test system. Still open:
  - Scheduled jobs on the test system (follow-up reminders, appointment reminders, daily report) run only when called; production gets a scheduler (Vercel Cron / pg_cron, ADR-0004).
  - Going live per client: the client's real details, their WhatsApp number and Ryan's OK.
- ~~**Automatic build is blocked by one Vercel setting (2026-09-30).**~~ Done 2026-09-30: Ryan turned Deployment Protection off; n8n reaches the platform.
- **Still to build before the first paying client (proposed 2026-09-30):**
  - ~~A staff login and CRM screen~~ Done 2026-09-30 (team app, one-time sign-in links). Still to do: proper logins (Supabase Auth) instead of links.
  - Real email sending (for quotes, invoices and reminders).
  - A scheduler (Vercel Cron) for reminders, follow-ups and the 8am report.
  - A production environment that is separate from test.
- ~~**Switch the AI team on (Ryan, 2026-09-30).**~~ Done 2026-09-30: Ryan added `ANTHROPIC_API_KEY` and `CRON_SECRET` in Vercel and redeployed; `/health` says AI: anthropic. First real test (FAKE Sparkle Home Cleaning) passed. The steps below are kept for reference.
  - `ANTHROPIC_API_KEY`: an Anthropic API key (console.anthropic.com → API keys).
  - `CRON_SECRET`: any long random text.
  - Where: Vercel → fusion-edg-core-api → Settings → Environment Variables. Then redeploy (Deployments → ⋯ → Redeploy).
  - Zaphiel then rebuilds Tan Aircon as a test company and checks a real AI chat.
- **Before a real client's WhatsApp (NEEDS VERIFICATION):**
  - ~~Move the AI reply out of the WhatsApp webhook request (Meta wants a fast answer).~~ Done 2026-10-07 (Fusion EDG Core PR #34): Meta is answered at once, and the reply follows in the background.
  - Confirm the daily Vercel Cron gets past Deployment Protection.
  - WhatsApp templates for messages sent more than 24 h after the customer last wrote. The code is ready (checked 2026-10-07: approved templates are saved per number and used outside the 24 h window). Still open: FusionTech writes the wording for each client's number; Meta approves it.
- **Custom workflows outside the catalog** (other systems, other channels) are still built by Zaphiel by hand in n8n. Next step: ATLAS writes those n8n workflows itself.
- **After the first real AI test (2026-09-30):**
  - The Sparkle build took about 44 s and Ah Kow Plumbing about 52 s; the test platform stops a request at 60 s. It fits now, but a bigger company (more workflows) could come close. ~~Next step: run the build's checks in the background and email the result.~~ Done 2026-10-07 (PR #34).
  - Tan Aircon was built before the AI team existed (design v1), so it has no assistant or workflows. It is never built twice. To give it the AI team: a "rebuild" option, or a new test slug.
  - ~~AI billing (proposed 2026-09-30)~~ Done 2026-10-01: Ryan said yes; usage and monthly limits per client are built (Fusion EDG Core PR #14).
  - ~~John does not send the link on WhatsApp~~ Done 2026-09-30: John sends the "Try your system" page automatically.
- **Website Build Worker resume gap (found 2026-10-01).** If a worker session stops mid-build, the next hourly run skips the task for 75 minutes, so a website can wait up to 2 hours. Fix: let the next run resume when the last progress row is older than about 15 minutes instead of keying on the start row (`ceo-brain/agents/website-build-worker/ROUTINE.md` step b).
- **Roen (CRM built by mistake, 2026-10-01).** The test platform holds a Roen CRM that Ryan did not want. It is harmless test data; delete it on Ryan's word.
- **Make the CRM/EDG work for real businesses (Ryan said "go", 2026-10-01).** Order:
  1. ~~Finish-your-setup page~~ (done 2026-10-01);
  2. real email sending: code done (PR #15); **waiting on Ryan**: Resend account, domain send.fusiontech.com.sg verified on Cloudflare, `EMAIL_PROVIDER_API_KEY` in Vercel, redeploy;
  3. ~~AI replies on WhatsApp in the background~~ (done 2026-10-07, PR #34), and connecting a client's own number;
  4. ~~proper staff logins~~ (done 2026-10-01, PR #17; also the mobile job card, PR #16);
  5. a separate live system (monthly hosting fee, shown to Ryan before paying);
  6. ~~builds checked in the background (no 60-second limit)~~ (done 2026-10-07, PR #34).
  - Waiting on Ryan: FusionTech's own WhatsApp Business number verified with Meta; one friendly pilot business. (AI billing: done 2026-10-01.)
  - Found 2026-10-01: on the test system's free hosting plan the timer runs once a day and handles 50 workflow runs per client per run. Step 5 (live system) needs a proper scheduler (every few minutes), or "2 hours later" workflows wait until the next morning.
  - Still to build for billing: a monthly all-clients AI usage email to Ryan (with step 2, real email).
- 2026-10-01 — **ATLAS v3 follow-ups.**
  - ~~Ryan: send sections 36–49 of the v3 prompt~~ superseded 2026-10-02 by the Atlas master spec (see Decisions).
  - NEW BUILD items the scenario tests surfaced: ~~mobile job card~~ (built 2026-10-01, PR #16), ~~inventory
    and procurement~~ (built 2026-10-01, PR #19), ~~proper staff logins~~ (built 2026-10-01, PR #17), ~~Meta lead-form and portal intake~~ (built 2026-10-01, PR #18), DNC checks, more than one WhatsApp number per client.
  - The knowledge cards are `status: draft`; vendor names and Singapore rules in them are to be verified per client.
- 2026-10-01 — **Job card follow-ups.**
  - Ryan: try it on a phone. The test system's team app → Jobs → Open job card (any FAKE test company).
  - ~~ATLAS module catalog (B19) row for the job card~~ added 2026-10-01 (Ryan: "save", PR #111).
  - Not built yet: GPS/time-on-site tracking, a photo report emailed to the customer. (Materials taken off stock: built 2026-10-01, PR #19.)
- 2026-10-01 — **Staff logins follow-ups.**
  - ~~ATLAS agent file B19: logins line + catalog row~~ updated 2026-10-01 (Ryan: "save").
  - Password reset by email (instead of asking the manager for a link) needs the email key in Vercel first.

- 2026-10-01 — **Lead sources follow-ups** (Facebook lead forms + portal emails, PR #18).
  - Ryan, once: in the Meta app dashboard, add the "Lead Ads" webhook (page → leadgen) pointing to
    `https://fusion-edg-core-api.vercel.app/webhooks/meta-leads`, and submit app review for leads_retrieval,
    pages_manage_metadata, pages_show_list, pages_read_engagement, pages_manage_ads. Zaphiel walks him through it when
    the first client with Facebook ads is signed. Then set META_GRAPH_VERSION in Vercel.
  - An email service that posts forwarded enquiry emails to the private address (e.g. Cloudflare Email Routing or
    Resend inbound): choose and set up with the first property client. NEEDS VERIFICATION.
  - Check one real email from each portal a client uses; adjust the reader if needed.
  - ~~ATLAS module catalog (B19) row~~ added 2026-10-01 (Ryan: "save").
- 2026-10-01 — **Stock and purchasing follow-ups** (PR #19).
  - Ryan: try it on the test system (any FAKE company → Team → "Switch on Stock" → Stock → "Add example stock (test)").
  - Real supplier emails go out only on the live system; on the test system they go to the stand-in email.
  - ~~ATLAS module catalog (B19) row~~ added 2026-10-01 (Ryan: "save").
  - Not built yet: reserved stock / sales orders, barcode scanning, stock value reports, supplier bills to Xero.
- 2026-10-02 — **Real test with Ryan (in progress).**
  - ~~Step 1 email~~ done 2026-10-02 (Resend key in Vercel; sender onboarding@resend.dev until a domain exists).
  - Ryan has **no domain in Cloudflare** (Domains list empty). Before real clients: buy or locate the FusionTech domain, add the Resend records, switch `EMAIL_FROM_ADDRESS` to it.
  - Step 2: a spare phone number + a separate Meta app "FusionTech Clients" (WhatsApp) → Vercel `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_GRAPH_VERSION`, `WA_TOKEN_DEMO`, `EDG_LIVE_ADAPTERS=1`; Zaphiel checks no test company can message a stranger before switching live sending on.
- 2026-10-02 — **Owner workflows + Connect another app follow-ups** (PRs #21, #22).
  - Ryan: try both on the test system (AI team → "New workflow" / "Describe it in words"; Team → "Connect another app").
  - ~~ATLAS module catalog (B19) rows~~ added 2026-10-02 (Ryan: "save").
  - Not built yet: reading data *from* another app on a schedule (pulling), and apps that need a login (OAuth) rather than an address; those still need Zaphiel to build a connector.
- 2026-10-02 — **Atlas master spec** ([[00_CEO_Brain/06_Atlas_Master_Gap_Analysis]]).
  - ~~Ryan: say "go" for Phase 1~~ done 2026-10-02 ("Go"; Command Center built, PR #23). Ryan: try it (open the team app → Home).
  - Next: Phase 2, Customer 360 (one timeline, merge duplicates with a person confirming, customer service cases) — waiting for Ryan's go.
  - Supabase MCP note: statements that DROP something hang (it waits for a confirmation that never comes); migrations use CREATE OR REPLACE / ALTER instead.
  - Ryan: one pilot client (a real business) by Phase 3, so live integrations are proven.
  - Then phases 2–6 in order, each to the spec's Definition of Done.
- 2026-10-03 — **Atlas Platform v4 — Phase 2 DONE, waiting for Ryan before Phase 3** ([[00_CEO_Brain/07_Atlas_Platform_v4]]). Ryan: open a customer in the team app (timeline), try Customers → List and Follow-ups, Team → Follow-up rules; then "go" for Phase 3 (one inbox for WhatsApp / email / web, human takeover, calendar). Master Control invitation (Phase 1) still to be used if not done. Still open: production setup before the first real client; packages and pricing.
  - Follow-ups: Supabase default privileges re-grant new tables to `anon` (RLS still forced); production needs `EDG_TOKEN_ENCRYPTION_KEY` and its own timer setup; move the ATLAS n8n workflow from the shared key to its own `edgk_` key.
- 2026-10-02 — **Atlas dashboard follow-ups** (PR #26).
  - The skyline, Atlas and AI-team pictures load from the image service's storage; host them with the app so they never disappear.
  - Build the mockup modules that are still hidden when Ryan wants them: Communications (one inbox), Marketing, Branding, Orders, HR, Projects, Documents.
  - The AI Workforce panel shows the business's own assistants; names like John / Mia / Leo / Zoe in the mockup are examples, not built agents.
- 2026-10-03 — **Marketing & Branding Intelligence: waiting for Ryan** ([[10_Agents/Marketing/_index]]).
  - ~~Ryan: approve the plan~~ done 2026-10-03 ("go"). ~~Step 1a~~ done. **Step 1b is done (PR #32), waiting for Ryan.** To switch on the real data: Metricool Advanced plan; Vercel `METRICOOL_USER_TOKEN` + `METRICOOL_USER_ID`; then Master Control → FusionTech's business → Marketing data source → Metricool → test → confirm. NEEDS VERIFICATION at that first test: Metricool's field-list parameter name and response shape (the test shows it; a one-line fix if different). Next: step 1c (the numbers: spend, leads, cost per lead, comparisons).
  - (older) **Step 1a was done, waiting for Ryan.** Try it: Master Control → a FAKE business → Marketing on → team app → Marketing → "Add example ad data (test)". Then say "go" for 1b (the real Metricool connection and the daily update; needs the Metricool Advanced plan + 2 Vercel variables).
  - Ryan: fill in [[60_Skill_Packs/Marketing/targets]] (CPL, cost per result, CTR, ROAS, frequency cap, first reply time).
  - Ryan, at step 1b:
    - ~~upgrade Metricool to **Advanced**~~ done 2026-10-09 (Ryan paid);
    - put `METRICOOL_API_TOKEN` (the key; the old name `METRICOOL_USER_TOKEN` also works) and `METRICOOL_USER_ID` (`5123090`) in Vercel (never in chat). After the next deploy, the timer checks the key by itself within a minute; Zaphiel reads the result in `app.provider_checks`;
    - connect at least one Meta ad account in Metricool. Checked 2026-10-09: the FusionTech.AI brand has Instagram, TikTok and the Facebook page, but **no ad account** yet (no Meta Ads, no TikTok Ads), so there are no ad numbers to read until one is connected.
  - ~~Ryan: unlink BioGreen Elixirs from Metricool~~ done 2026-10-03. The brand (id `6656122`) now holds FusionTech's Instagram, TikTok and Facebook. Still to do:
    - ~~rename the brand from `biogreenelixirs` to "FusionTech AI" in Metricool~~ done (it is "FusionTech.AI", checked 2026-10-09);
    - confirm that Facebook page `1237077816163178` is FusionTech's page;
    - connect FusionTech's Meta ad account when ads start.
  - ~~Decide respond.io vs WhatsApp Cloud API~~ decided 2026-10-15: WhatsApp Cloud API with John; Respond.io optional only. (Was: Decide respond.io vs WhatsApp Cloud API for Click-to-WhatsApp attribution. respond.io's API needs Growth (about $159/mo); webhooks need Advanced (about $279/mo).
- 2026-10-03 — **Ad platform APIs checked** ([[Knowledge/Ad platform APIs — what each can do (2026-10-03)]]).
  - Metricool's API can READ ad results only. It cannot create, upload creative, pause, change Meta/TikTok budgets or duplicate. Those need Meta's Marketing API and TikTok's API for Business.
  - ~~Step 1b's Metricool connector must be adjusted to the official response format before going live~~ done 2026-10-09 (Fusion EDG Core PR #35). One detail is checked at the first live test: which level of Metricool's numbers is the day. The reader handles every case and shows the metric names.
  - Blocker for Meta App Review and TikTok developer registration: a **FusionTech domain, website, privacy policy page and company email** (Ryan has no domain yet).
- 2026-10-04 — **AI Marketing & Ads OS: waiting for Ryan's approval** of `fusion-edg-core/docs/marketing/PRE_IMPLEMENTATION_REPORT.md` (PR #33). Phase 1 (drafts only, no spend) can start right after.
  - Ryan's blockers for Phases 2–4: a **FusionTech domain, website, privacy-policy page and company email**; then Meta Business Verification + App Review, TikTok developer registration, and a Google Cloud project on paid billing with Basic access.
  - Firecrawl (Zaphiel's documentation research tool) reported **low credits**.
- 2026-10-09 — **HR (Atlas module 15).** Part 1 is built (People and Identity, PR #38).
  - ~~**Ryan, now:** create the employee-data key in Master Control.~~ Not needed (2026-10-09, Fusion EDG Core PR #39): the key now sets itself up. The test system shows `employee_data_key: automatic`. Ryan can ignore the Master Control invitation email.
  - **Rules for Zaphiel (never break them once staff details are saved):** never change `EDG_WEBHOOK_SECRET` in Vercel, never add `EDG_PII_ENCRYPTION_KEY`, and never remove the vault secret `edg_pii_key_part` in Supabase. Any of these locks HR identity details; nothing is lost, and putting the original back unlocks them.
  - **Waiting for Ryan's approval:** Part 2 (leave + Approval Center + bookings), then Part 3 (attendance), Part 4 (CEO HR dashboard, onboarding, HR Assistant) and Part 5 (payroll exports and reports). Each part is shown before the next.
  - **To confirm with the first real client's HR adviser:** identity retention after leaving (default 12 months, from MOM's employment-records page) and the default leave policy.
  - **Known gaps:**
    - HR and Payroll people can open Home, which shows the overall business numbers;
    - `atlas.md` does not mention HR yet (the diff goes to Ryan before saving);
    - the payroll provider is not chosen.
  - **Supabase MCP note:** a function body containing DELETE also hangs (it waits for a confirmation); split migrations, or keep DELETE out of function bodies.
- 2026-10-09 — **Atlas Universal Business OS (Ryan's "ATLAS MASTER PROMPT (FINAL)"): the pre-development report is done; STOP, waiting for Ryan.**
  - **Where:** Fusion EDG Core PR #40 (docs only): `docs/atlas-os/00_PRE_DEVELOPMENT_REPORT.md` + `01_PROVIDER_CARDS.md`. Ryan's readable page: https://claude.ai/artifact/RLVPhXwEBnt5objvcP6F9v
  - **Waiting for Ryan, 9 decisions:**
    1. Keep the automatic test build (approval only for go-live and for real client accounts).
    2. No unified API now.
    3. Ask Intuit about Singapore eligibility before QuickBooks.
    4. Gmail later.
    5. **Next build: Software Knowledge Base + compatibility checker (Phase A).**
    6. Free developer accounts, one at a time, starting with Xero.
    7. A lawyer prepares the PDPA data-processing agreement.
    8. Client workflows stay in the platform engine, not n8n Cloud (licence).
    9. WhatsApp Embedded Signup v4 after Meta verification.
  - ~~Do not build anything from that report before Ryan says go.~~ Ryan said **go** on 2026-10-10 (see Decisions). Phase A1 is done (PR #41).
  - **Facts to remember** (read on 2026-10-09; sources are in the provider cards):
    - **Xero:** Starter is 5 connections free; Core AUD 35 up to 50; certification needed beyond 50.
    - **QuickBooks:** the partner programme names US/UK/AU/CA companies.
    - **WhatsApp:** service messages are charged after 1,000 per number per month since 1 Oct 2026; Singapore has been its own market since 1 Jul 2026; Embedded Signup v2/v3 end on 15 Oct 2026.
    - **n8n Cloud** self-serve is for internal use only.
    - **Google Ads** developer tokens were retired on 9 Sept 2026.
    - **Metricool:** "standard use" is about 500 calls per brand per month.
    - **InvoiceNow:** phased in until 2031.
- 2026-10-10 — **Atlas Universal Business OS: next steps**
  - **Ryan, now — Xero developer account, step 1:** open developer.xero.com, sign up free with his Gmail, and reply "done".
    - Step 2 (Zaphiel guides): create the app, with redirect `https://fusion-edg-core-api.vercel.app/oauth/callback/xero`. Ryan puts the client id/secret into Vercel himself, never in chat. Then prove Xero on the Demo Company.
  - **Ryan, OK needed:** the small `atlas.md` addition "SOFTWARE CHECK", so ATLAS uses the Software Knowledge Base before promising any connection. Shown to Ryan 2026-10-10.
  - **Next build:** Phase A step 2, the Client Discovery + Blueprint record, the pasted-brief intake, the Discovery Console joined to John → ATLAS, and John's WhatsApp message-id dedupe.
  - **Developer accounts after Xero:** Meta (verification) → Google Cloud → Microsoft Entra → Shopify Partners → Intuit (ask about Singapore first) → Zoho → HubSpot → Employment Hero → TikTok. The status of each is kept in `app.developer_accounts` (Master Control → Software).
- 2026-10-10 — **Atlas Execution & Knowledge Upgrade** — ~~waiting for Ryan's approval~~ approved ("go") and built the same day: see the next entry.
  - **Plan items (docs/atlas-os/05):**
    - **P1** client implementation record: "What I Need" card, Build Ticket, pipeline stage;
    - **P2** owner pipeline page with alerts to Ryan;
    - **P3** secure credential form;
    - **P4** quotation drafts from Ryan's price list;
    - **P5** card fields v2 (regions, n8n, unified API, gotchas);
    - **P6** atlas.md rules (SOFTWARE CHECK + "Can we do it?" order + playbooks; Ryan sees the text first);
    - **P7** Excel import + Xero Demo Company proof;
    - **P8** white-label design only.
  - **Recommended order:** P5+P6 → P1 → P2 → P3 → P4 → P7.
  - **White-label rules** (one FusionTech app per provider, no per-agency clones for Xero/Shopify/HubSpot, n8n hidden) are recorded in docs/atlas-os/06. A lawyer should review the reseller agreement.
  - **Still waiting:** Xero developer account step 1 (Ryan).
- 2026-10-10 — **Atlas plan: P5, P1, P2, P3, P4 and P7 are done. What is left:**
  - ~~**Ryan, OK needed — P6**~~ done 2026-10-10 (Ryan "OK"; saved in atlas.md D6a–D6c).
  - **Ryan, when ready — prices:** Master Control → Quotes. Fill in FusionTech's fees. Until then every draft says "price needed", and Atlas never guesses a price.
  - **Ryan, now — Xero developer account step 1** (still open). This unlocks P7b, the Xero Demo Company proof.
  - **Ryan — still open from before:** ~~HR Part 2 approval~~ built 2026-10-10; the Metricool Meta ad account step.
  - **Zaphiel, next build:** Phase A step 2 — the Client Discovery and Blueprint record, the pasted-brief intake, the Discovery Console joined to John → ATLAS, and John's WhatsApp message-id dedupe.
  - **Housekeeping:** two leftover branches in fusion-edg-core (`atlas-p7-import`, `atlas-p7-customer-import`, superseded by PR #48) could not be deleted from this session. Delete them on GitHub; they are harmless.
- 2026-10-10 — **HR: Part 2 (leave) is done.**
  - ~~**Ryan's OK needed:** Part 3, attendance~~ built 2026-10-10 (PR #50).
  - **Still to do from Part 2:**
    - carry-over and expiry of unused leave;
    - a warning in the booking screen for leave not yet approved;
    - part-time pro-rating by hours;
    - leave in the Atlas build self-test.
  - **To confirm with the first client's HR adviser:** whether sick leave counts working days or calendar days, and the default leave policy.
- 2026-10-10 — **HR: Parts 1–3 are done (people, leave, attendance).** What's left:
  - ~~**Ryan's OK needed:** Part 4~~ built 2026-10-10 (PR #51). It covered:
    - an HR card on Home;
    - HR lines in the morning brief;
    - onboarding checklists;
    - training records;
    - the read-only HR Assistant.
  - **Still to come:** Part 5, payroll exports and reports, once a payroll provider is chosen. The timesheet CSV already exists.
  - **Gaps in Part 3:**
    - per-person shift rosters;
    - overtime rules (handled by the payroll provider);
    - an optional location setting with the employee's consent.
- 2026-10-10 — **HR Parts 1–4 are done.** Only Part 5, payroll exports and reports, is left.
  - **It needs a decision first:** which payroll provider FusionTech's clients will use.
    - Talenox is already on our software list.
    - Others, like Payboy and HReasily, are on the list too, but their APIs are not verified.
  - **Until a provider is chosen:** Atlas exports the timesheet CSV, and a payroll export CSV can be built.
- 2026-10-10 — **Zero-cost rule (Ryan): no software sign-ups until a real client needs them.** See [[00_CEO_Brain/08_Atlas_Zero_Cost_Plan]].
  - ~~Ryan, now — Xero developer account step 1~~ **withdrawn** (Ryan, 2026-10-10). P7b, the Xero Demo Company proof, waits for the first client who uses Xero. The connector stays at CODE IMPLEMENTED / MOCK TESTED.
  - ~~Payroll provider choice before HR Part 5~~ no longer blocking: a generic payroll export comes first.
  - **Ryan, when easy (optional):** screenshots of every screen of the CRM his friend built (sales, vouchers, invoices, reports), plus an Excel/CSV export of his own customers and sales from it. Zaphiel builds Ryan's own version in Atlas (same jobs, our own code) and imports his data. He doesn't need the friend's API key for this. Exporting his data is enough.
  - **Next build (free):**
    1. Sales team performance: targets, daily and monthly sales, KPI, ROI;
    2. vouchers and packages;
    3. a simple money book;
    4. a payroll export.
  - ~~Phase A2 n8n switch-on~~ **done 2026-10-10, all published:**
    - ATLAS update rounds and the pasted-brief filter (tested in n8n: executions 1717 and 1718);
    - the WhatsApp duplicate guard (executions 1719 and 1720: the same message twice, the second was ignored);
    - Discovery Console → Atlas.
  - **Still to deploy (small):**
    - Lead Intake's "Finalize & Validate Result" node uses the longer "already answered" list from `atlas.js`.
    - Until it is redeployed, John's own question filter is the older one.
    - ATLAS's questions are already filtered at the source.
- 2026-10-12 — **Marketing Team v4 Layer 1 done, waiting for Ryan** ([[80_Clients/_Test/marketing-team-v4/T_Results]]):
  - Ryan: which brand first (FusionTech AI or BROWREVOLUTION)? Is BROWREVOLUTION the business at browrevolution.sg?
  - Ryan: connect that brand's Instagram, Facebook and TikTok in Metricool (free); fill in its Brand Brain and targets.
  - Ryan: OK to retire `marketing-brain` (merged into `ads-intelligence`)?
  - Later: Layer 2 (platform marketing module) after Ryan approves Layer 1.
  - Firecrawl credits are low (only matters for the next deep research job).
- 2026-10-12 — **Brow Revolution marketing data: waiting for Ryan to connect** in Metricool (brand BROWREVOLUTION):
  Facebook Page, Instagram, TikTok, the Meta ad account (+ Google Business Profile; TikTok/Google Ads if used). Plus the
  last 90 days of bookings/sales as a CSV, and confirming the draft facts in its Brand Brain. HeyGen is not visible in
  this Claude session (connect at claude.ai/customize/connectors, then a new session); Seedance is reachable through Higgsfield.
- 2026-10-12 — **Cinematic Director: first real run waits for Ryan** — pick the first job (a watch demo or a doctor demo),
  then "APPROVED: up to N Kling credits". The first run measures real credit costs into
  [[60_Skill_Packs/Cinematic_Director/06_Prompt_Log]]. The agent is callable by name from the next Claude Code session.
- 2026-10-12 — **TITAN checkpoint 1 waits for Ryan** ([[00_CEO_Brain/09_TITAN_Audit]] §5): Tier 3 3D only with a licensed real model
  (OK?), Demo A subject (supplement brand or clinic), OK to add "reports to TITAN" sections and routing lines (diffs in the PR).
- 2026-10-12 — **TITAN Task 4 (demos) waits for Ryan:** Demo A free landing page (site kit, Vercel preview) can start on "go";
  Demo B, the doctor body-journey on Lovable, needs a cost card yes (Kling/Higgsfield credits + Lovable credits).
  Singapore rule citations for 03_Medical_Supplement_Rules / 07 / 08 are being researched.
- 2026-10-12 — **Website Build Worker routine** (`trig_01K4UinSX4tQWK537MeHQuuc`, hourly at :25) — last run (18:25 UTC) failed:
  **Claude usage limit reached**. Builds from WhatsApp wait until the limit resets; check the next runs. Ryan is about to
  test a dental clinic as a WhatsApp customer (real lead → uses Lovable credits).
- 2026-10-13 — **Marketing Autopilot: what only Ryan can do** (everything else is built and tested):
  1. **Turn on the daily schedule.** Creating the routine "Zaphiel — Marketing Autopilot" (08:46 SGT daily; connectors
     Metricool, n8n, Gmail, Kling, Higgsfield; prompt in `ceo-brain/agents/marketing/ROUTINE.md`) was blocked by Claude
     Code's safety check for Zaphiel. Ryan says yes in chat (Zaphiel retries) or creates it in claude.ai/code → Routines.
  2. **Caps** in each `Brands/<brand>/autopilot.md`: `max_daily_spend` (SGD) and monthly Kling / Higgsfield credits.
     Until set, ads and generation stay off (posts still run where facts are approved).
  3. **Meta token**: a System User token with `ads_management` on the ad account, added in n8n as a Facebook Graph API
     credential; Zaphiel attaches it to the 5 Meta nodes of Ad Actions `oMMIvt8PZOmUp24K` and fills `ad_account_id`.
  4. **Brow Revolution facts** confirmed → copied into its autopilot note (`approved`), then its posts can start.
  - Known limits: caps arrive from the routine (20% ceiling is hard-coded in the workflow); lifetime budgets ignored;
    first real Meta write is the true test (a rejection is logged as failed).
- 2026-10-14 — **Marketing OS v5: what only Ryan can do** (replaces the 2026-10-13 autopilot list):
  1. **Provider decision:** approve or decline Omneky (ask Omneky in writing first: which plan includes MCP/API,
     agency/multi-client and white-label rights, token renewal: questions in [[60_Skill_Packs/Marketing_Team/13_Provider_Evaluation]]).
     Check whether his Supermetrics account is a paid plan or a trial (campaign management is free with a subscription).
  2. **Link Brow Revolution's Meta ad account** read-only (Supermetrics or Metricool) → first real report.
  3. **Brand facts + targets:** confirm Brow Revolution's facts (price incl. GST, touch-up, reviews, website, artists),
     daily cap, target CPL / cost per qualified lead, what counts as "qualified". Remove "Singapore's leading" from the
     live ad unless there is proof.
  4. **Pause policy (optional):** fill `auto_pause_policy` if he wants automatic spend-reducing pauses.
  5. **Schedule "Marketing Daily"** (blocked for Zaphiel; Ryan's OK or set it up in claude.ai/code → Routines).
  6. **ATLAS gap:** John's intake should store Meta's WhatsApp referral (ad id) for attribution (acceptance E).
- 2026-10-15 — **Omneky (Ryan said yes):** (1) Ryan sends the drafted question email to Omneky (find their sales/support
  address on omneky.com) — plan with MCP, card/cancel, agency + dashboard rights, credits, sign-in renewal; (2) Ryan subscribes
  (Standard US$99) and adds the connector in claude.ai → Settings → Connectors → Add custom connector →
  `https://mcp.omneky.com/mcp` → sign in; (3) inside Omneky he links the Meta ad account (+ Page + Instagram), TikTok
  later; (4) Zaphiel then verifies the real tools, updates `11_Capability_Register`, maps the Execution Engine
  (`pause_or_scale` = the pause button) and runs read-only → one approved tiny pilot → pause/resume → reconcile.
  If on a trial: calendar reminder on day 6.
- 2026-10-15 — **APEX next test (read-only, free):** connect Brow Revolution's Facebook Page, Instagram and **Facebook Ads**
  account in Metricool (brand BROWREVOLUTION) → APEX reads real spend/leads/CPL per campaign and runs the diagnosis.
  Ask Ryan: does Brow Revolution use **Respond.io**, and on which plan (its API needs Growth ≈ US$159/mo; webhooks need
  Advanced ≈ US$279/mo, from the Software Knowledge Base; recheck)? If not, our WhatsApp Cloud API path captures
  click-to-WhatsApp ad referrals at no extra cost.
- 2026-10-16 — **APEX world-class upgrade: waiting for Ryan** to approve the 7 phases in [[00_CEO_Brain/12_APEX_World_Class_Audit]]
  and decide the 4 flagged conflicts (capped auto-scale opt-in OFF by default; scaling default 20% up to 30%; Respond.io
  only where a client uses it; OK to schedule monitoring every few hours).
- 2026-10-17 — **APEX in the dashboard: waiting for Ryan's go** on Phases 3–8 ([[00_CEO_Brain/13_APEX_Omneky_Dashboard_Audit]]).
  Findings: the platform's Marketing page is read-only counts; marketing findings/attribution tables exist but are unused;
  WhatsApp referral not parsed; no Omneky/Meta Marketing API yet. Omneky REST = creative only; campaign control only via MCP
  (server use + agency licence unconfirmed) → dashboard launch/pause on our own Meta connector unless Omneky confirms.
- 2026-10-18 — **Ryan: tap "Approve & build" for Brow Revolution's Atlas dashboard** (test system):
  https://fusion-edg-core-api.vercel.app/atlas/build?path=zaphiel%2Fvault%2F80_Clients%2Fbrow-revolution%2Fedg%2F16_edg_spec.json
  - The build's status page then gives the review link into the dashboard.
  - Numbers stay at zero until WhatsApp and Metricool are connected.
  - Still to confirm: hours, services and durations, prices, artists, address/website.
- 2026-10-19 — **Omneky is live for Brow Revolution** (checked read-only through the Omneky connector in Claude Code).
  - Company "Brow Revolution": plan `creative_generation_pro`, 954 credits (US$0.10 each), no card on file.
  - One brand: Brow Revolution (id 42271).
  - **Facebook connected.** Google, TikTok and the others are not connected. Shopify shows an error (not needed).
  - Ryan (2026-10-19): Omneky is the main tool for everything and Metricool is only the backup (matches the 2026-10-15 decision).
  - The dashboard's Marketing page still reads Metricool only. Connecting Omneky to the dashboard is Phases 5–6.
    Server-side use waits for Omneky's written answer (the email draft is still unsent).
- 2026-10-20 — **APEX in the dashboard: what is still to build for "run ads from the dashboard"** (Campaign Studio is live; plans and approvals work).
  1. **Launch through Omneky from the dashboard.** Needs Omneky's written OK for server use (Ryan sends the email
     draft) and the Omneky key in the secure form.
     Until then, approved plans are launched by Zaphiel through the Omneky connector in Claude, on Ryan's approval code.
  2. **Make the ads (images/videos) from the dashboard.**
     - Omneky REST is the first route (same key).
     - Higgsfield and Kling need their own server API keys, separately billed; every job is costed and approved first.
  3. **Test lab with per-ad results and winner calls.** Needs ad-level data from Omneky (or Meta's own API);
     Metricool gives campaign level only.
- 2026-10-20 — **APEX × Omneky: what is left after PR #57.**
  1. **Ryan: one click.** Open https://fusion-edg-core-api.vercel.app/app#marketing/connections (Brow Revolution),
     press **Connect Omneky**, sign in to Omneky and allow access.
     - Real Brow data then fills Overview, Campaigns and Ad Library at once.
     - APEX's first analysis follows within minutes; the daily report comes at 8 AM.
  2. **Ryan: in Omneky, choose the Facebook ad account and page for Brow Revolution.** Omneky shows it as "pending
     account selection". Until it is chosen, pause/resume/budget and launch through Omneky may be refused.
  3. **Launch from the dashboard is NOT wired yet** (`launch_meta_ad`). It needs:
     - an approved plan;
     - finished creatives, which cost Omneky credits and need Ryan's OK;
     - item 2 done.
     No ad money is spent until then.
  4. **Reports** go out as a Command Center notification plus an owner email DRAFT. WhatsApp delivery is not built.
  5. **Omneky's written answers are still needed**: third-party/agency use of OAuth for our clients, refresh-token
     lifetime, rate limits, partner programme. The email draft is still unsent.
  6. **Higgsfield and Kling** are used by Zaphiel through Ryan's connectors. Dashboard use needs their own server API
     keys (separately billed, approved first).
- 2026-10-20 — **Ryan, to make APEX fully operational from the dashboard** (details: [[00_CEO_Brain/14_APEX_CEO_View_Audit_and_Test_Report]]):
  1. **In Omneky:** Connections → Facebook → choose Brow's ad account and page. Omneky's live answer is "needs account
     selection", and this blocks APPROVE AND LAUNCH.
  2. Press **"APEX, manage my marketing"**, then approve or reject the replacement-ad briefs with their code. Approving
     spends Omneky credits.
  3. Set the **target cost per lead**.
  4. Confirm the Meta ad account currency is SGD. The screen shows S$; Omneky does not state it.
  5. **First live presses still to confirm:** Pause, Resume, Create new ads, Approve and launch. They are built and
     tested against a fake Omneky, but never pressed on the real account because they change live ads or spend
     credits.
- 2026-10-22 — **Ryan: press Reconnect Omneky** (Marketing → Connections, or the red card on the APEX briefing).
  - Ryan says Facebook is now connected in Omneky. The dashboard cannot confirm it until its Omneky sign-in is renewed.
  - After the reconnect, the readiness check shows whether "APPROVE AND LAUNCH" is unblocked.
  - Open question for Omneky: why was the refresh token rejected? Is there a set token lifetime, or did reconnecting
    Facebook inside Omneky reset it? Added to the Omneky email questions.
