---
tags: [zaphiel, open-loops]
---
# Open loops

- **Ryan:** top up n8n AI credits (John and the Website Builder are on rule fallbacks).
- **Ryan (to test John on WhatsApp):** WhatsApp credential in n8n — steps in [[Knowledge/_How to connect WhatsApp]]. Until then test John at https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat. Then
  Zaphiel re-adds the WhatsApp node to the Outbound Sender and points Meta at the inbound webhook.
- **Ryan — make the automatic mock-up chain live (3 things, once).**
  1. Permission: Claude Code's auto-mode classifier refused to deploy the chain ("Create Unsafe
     Agents") four times on 2026-09-25, even after Ryan said he had settled it. Add a permission rule
     in the Claude Code settings for this environment that allows it (the refusal text says exactly
     that), then say "deploy the automatic mock-up chain". Everything is already written and tested in
     the repo; the runner workflow `7sEuGyU6IjJsSaKL` already exists in n8n, unwired and unpublished.
  2. Credentials in n8n (never in the repo): "Higgsfield API" (Header Auth: Authorization = Key
     <key id>:<secret>, from console.higgsfield.ai), "Kling API" (Header Auth: Authorization = Bearer
     <API key>, from kling.ai/dev/api-key), "Lovable MCP (OAuth2)" (MCP Client OAuth2 for
     https://mcp.lovable.dev, sign in once). Open the runner workflow and select them on the
     Higgsfield / Kling / Lovable nodes.
  3. n8n AI credits, so John talks with Claude instead of the rule engine (the rule engine now greets
     and explains FusionTech, but a real conversation needs the model).
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
