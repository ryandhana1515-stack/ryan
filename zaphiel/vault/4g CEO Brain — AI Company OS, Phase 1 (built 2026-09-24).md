---
generated_by: build-vault.js
source: zaphiel/memory.md
source_last_updated: 2026-09-25 (session 2, final: Obsidian vault is LIVE — this file is archived, the vault is the brain)
built: 2026-09-25
tags: [zaphiel, memory]
---
# CEO Brain — AI Company OS, Phase 1 (built 2026-09-24)

Ryan's second product line: an AI Lead & Sales Agent platform (multi-client SaaS later).
- Code: `ceo-brain/` (agents/, prompts/, schemas/, workflows/, database/, integrations/, tests/,
  docs/). `npm test` = 22 tests incl. a simulation of the exact n8n Code-node JS.
- Live: n8n workflow `b7kbJpnKLN2uQxyn`, endpoint POST /webhook/ceo-brain/lead. Verified end to
  end (executions 159 mock, 160 live Claude, 161 human-review + Gmail email).
- Agent #1 `sales-qualification` v1.0.0: strict output schema 1.0, never fabricates (nulls +
  missing_information), max 3 progressive questions, drafts only. Guardrails are code
  (postprocess.js): prices/guarantees/refunds/contracts in a reply → withheld + HUMAN_REVIEW;
  WON/LOST human-only; proposals need approval. Rule engine (rules-v1) is mock mode AND fallback.
- Data: n8n data tables now (ids in [[02 The AI company (n8n @ ryan1515.app.n8n.cloud, project uFcEmgtYEFyGauyy)|§2]]); Postgres/Supabase migration with RLS ready in
  `ceo-brain/database/migrations/0001_init.sql`.
- Default tenant = `fusiontech`. Approval emails go to ryandhana1515@gmail.com
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

Up: [[00 Home]]
