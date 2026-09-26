---
tags: [zaphiel, open-loops]
---
# Open loops

- **Ryan:** top up n8n AI credits (John and the Website Builder are on rule fallbacks).
- **Ryan (to test John on WhatsApp):** WhatsApp credential in n8n — steps in [[Knowledge/_How to connect WhatsApp]]. Until then test John at https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat. Then
  Zaphiel re-adds the WhatsApp node to the Outbound Sender and points Meta at the inbound webhook.
- **Ryan — one click to make the mock-up chain live (2026-09-26 late).** The build step now runs as the Claude
  routine "Zaphiel — Website Build Worker" (hourly). It was created without connectors, so: open claude.ai →
  Routines → "Zaphiel — Website Build Worker" → attach the connectors **n8n, Lovable, Higgsfield, Kling** → save.
  Nothing else to type. (n8n cannot hold the Lovable login: Lovable blocks hosted tools; delete the half-made
  "Lovable MCP (OAuth2)" credential in n8n, it can never connect.) Optional: delete the test project
  "Sunrise Dental Clinic" in Lovable.
- **Zaphiel (next session):** John promises "usually within 10 to 15 minutes" for the mock-up; the routine runs
  hourly, so change the wording in `zaphiel/knowledge/fusiontech-master-brain.md`-derived prompt to "within the
  hour" and redeploy Lead Intake + Website Builder. Ask Ryan whether the routine may run more often (platform
  minimum is 1 hour unless the project allows shorter).
- **Ryan (decision):** variation A (Higgsfield cinematic scroll film site) is designed but not built by the worker
  until you say so (video credits per site).
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
- **(Ryan)** Top up the n8n **Gateway credits** (n8n → Settings → Usage/AI credits): they are depleted, so John,
  the Website Builder and the new Website Intelligence research (search, page reading, Claude) all run on the
  deterministic fallback until then. Same place as the model/API keys Ryan planned to add at home.
- Next: John reads open `website.info_needed` tasks and asks the customer in his own voice; Build Record sends
  `MOCKUP_READY` to John.
