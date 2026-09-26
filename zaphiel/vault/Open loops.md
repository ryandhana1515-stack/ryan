---
tags: [zaphiel, open-loops]
---
# Open loops

- **Ryan:** top up n8n AI credits (John and the Website Builder are on rule fallbacks).
- **WhatsApp setup paused (Ryan, 2026-09-26: "I just want to test John first").** Done: Meta app "FusionTech AI Agents",
  test number, phone number ID `1321607761025022`. Next when Ryan is ready: step 4 (permanent System User token) and
  step 5 (n8n credential "WhatsApp FusionTech") in [[Knowledge/_How to connect WhatsApp]]; then Zaphiel wires the
  Outbound Sender and points Meta at John. Ryan tests on the chat page meanwhile.
- **Ryan (to test John on WhatsApp):** WhatsApp credential in n8n — steps in [[Knowledge/_How to connect WhatsApp]]. Until then test John at https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat. Then
  Zaphiel re-adds the WhatsApp node to the Outbound Sender and points Meta at the inbound webhook.
- **Done 2026-09-26 23:38 SGT:** Ryan attached n8n, Lovable, Higgsfield and Kling to the routine "Zaphiel —
  Website Build Worker". The mock-up chain is fully wired. The real test is Ryan through John on WhatsApp.
  Still optional for Ryan: delete the half-made "Lovable MCP (OAuth2)" credential in n8n and the test project
  "Sunrise Dental Clinic" in Lovable.
- **Zaphiel (next session):** John promises "usually within 10 to 15 minutes" for the mock-up; the routine runs
  hourly, so change the wording in `zaphiel/knowledge/fusiontech-master-brain.md`-derived prompt to "within the
  hour" and redeploy Lead Intake + Website Builder. Ask Ryan whether the routine may run more often (platform
  minimum is 1 hour unless the project allows shorter).
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

