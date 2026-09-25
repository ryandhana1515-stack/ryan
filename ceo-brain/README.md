# CEO Brain — AI Lead & Sales Agent (Phase 1 + Phase 2)

CEO Brain is the AI Company Operating System. Phase 1 is the foundation: a lead comes in from
any channel, the AI understands it, qualifies it, drafts the next reply, schedules the follow-up,
and asks a human whenever a real decision is needed. Phase 2 (2026-09-25) added delivery: low-risk
replies go out automatically by email (WhatsApp once you add the credential); anything involving
prices, proposals, refunds, contracts or legal waits for your one-click approval.

Plain-English summary: you POST a lead to one web address; a few seconds later you get back a
neat JSON "report card" on that lead (what they want, what is missing, how hot they are, the
suggested reply, what to do next), the lead is saved with a full audit trail, and if the case
needs you, an email lands in your inbox.

---

## WHAT IS ALREADY WORKING

- **n8n** at `https://ryan1515.app.n8n.cloud` — the orchestrator. Authenticated through the
  official n8n MCP in the Claude session, so workflows are created/updated/tested from code.
- **Claude Sonnet 4.6 via n8n Gateway credits** — no API key needed. Worked on 2026-09-24/25;
  on the afternoon of 2026-09-25 the Gateway returned **"Payment required"** (credits used up), so
  John and the Website Builder ran on their deterministic fallbacks. Top up n8n AI credits (or add
  an Anthropic API key credential in n8n) to get Claude-quality replies back. Nothing breaks meanwhile.
- **Gmail credential** in n8n — used for the approval email. Verified: a `[TEST]` email was sent.
- **GitHub credential** in n8n (not used by Phase 1).
- **Lead Intake, deployed and active**: `CEO Brain — Lead Intake`, id `b7kbJpnKLN2uQxyn`,
  endpoint `POST https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead`. The agent is **John**,
  FusionTech AI's sales consultant, briefed from `zaphiel/knowledge/fusiontech-master-brain.md`.
- **Phase 2 workflows (all published)**: Outbound Sender `SAcnNxG1GWPwn3N7`, Approve Reply
  `uQxHTTdEkazgKpRT`, WhatsApp Inbound `3IhIJ5IYsB7wQQSg`, Daily Brief `Pew2PX1IcgdXqXr7`.
  See `workflows/README.md`.
- **Website Builder (Agent #2)** `hSTRGnHVsu6tMOmH`: when a prospect asks John for a website,
  landing page, online store, web app or portal, Lead Intake hands the conversation to this agent.
  It writes a build brief + a Lovable build prompt, stores a `website_build` approval task and
  emails you an **OPEN IN LOVABLE** button. Pressing Send in Lovable is the approval; nothing is
  built otherwise. Verified 2026-09-25 (execution 176).
- **John Chat Console** `ny60ozvH8B4uNpcb` — a hosted chat page to test John as a prospect:
  https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat (test mode,
  nothing goes to real customers, conversation memory per chat session).
- **Five data tables** in n8n holding leads, messages, agent runs, tasks and audit logs.

## WHAT WAS CREATED (this folder)

| Path | What it is |
|---|---|
| `agents/sales-qualification/` | Agent #1: manifest, input normalizer, deterministic rule engine (mock/fallback), post-processor with guardrails |
| `agents/website-builder/` | Agent #2: manifest and `brief.js` (deterministic fallback brief, validator, Lovable prompt builder, business-name guardrail) |
| `prompts/` | John's system prompt (FusionTech context, 13 discovery questions + website branch, hard rules), the Website Builder prompts, and the user templates |
| `schemas/` | Lead input contract, the production output schema (strict JSON), lead statuses + allowed transitions |
| `workflows/lead-intake/` | `build.js` generates the n8n workflow from the above; `dist/` has the SDK code, the inlined Code-node JS, and an importable n8n JSON |
| `workflows/website-builder/` | `build.js` generates the Website Builder workflow (same single-source pattern) |
| `workflows/john-chat-console/` | The hosted chat console workflow (SDK source) |
| `database/` | n8n data-table ids (live) and the Postgres/Supabase migration with tenant isolation (ready, not connected) |
| `integrations/` | The one-payload adapter contract and the Phase 2 channel list |
| `tests/` | 28 automated tests (unit + simulated n8n Code nodes, incl. the website hand-off and the brief agent) and a live webhook smoke test |
| `docs/` | Architecture, approvals/guardrails, Phase 2 plan |
| `.env.example` | Variable names only. No values. |

## HOW TO RUN IT

You do not need to run anything locally — it is live in n8n. To send a lead from any tool:

```bash
curl -X POST https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead \
  -H 'content-type: application/json' \
  -d '{"name":"John Tan","phone":"91234567","company":"ABC Property Pte Ltd","source":"facebook",
       "channel":"whatsapp","message":"Hi, I run a property agency with 25 agents ...",
       "test_mode":true,"ai_mode":"live"}'
```

Switches: `test_mode:true` marks everything as a test (email subject gets `[TEST]`);
`ai_mode:"mock"` uses the rule engine instead of Claude (free, deterministic).

To change the model, the notification email, or the default tenant: open the workflow in n8n and
edit the **Workflow Config** node. Everything else is generated from this folder.

## HOW TO TEST IT

```bash
cd ceo-brain
npm test                 # builds the workflow code and runs 22 tests locally (no credentials)
npm run test:show        # same, and prints the John Tan structured result
bash tests/live-test.sh mock   # hits the live n8n webhook with the rule engine
bash tests/live-test.sh live   # hits the live n8n webhook with Claude
```

Verified on the deployed workflows (Phase 2, 2026-09-25):

| Run | Input | Result |
|---|---|---|
| execution 165 | dental clinic lead, email channel, real mode | John qualified it, low-risk → **reply auto-sent by Gmail** (sender sub-execution 167, status `sent`), follow-up task in 48 h |
| execution 164 | Daily Brief manual run | brief built from the tables, Claude wrote 5 priorities, email delivered |
| execution 161 (Phase 1) | refund + lawyer | HUMAN_REVIEW, approval task, `[TEST]` email |

Verified on the deployed workflow (Phase 1, 2026-09-24):

| Run | Input | Result |
|---|---|---|
| execution 159 | John Tan, `ai_mode: mock` | rules-v1 → **HOT**, `book_discovery_call`, follow-up in 4 h, 279 ms |
| execution 160 | John Tan, `ai_mode: live` | Claude Sonnet 4.6 → valid JSON, **HOT**, `ask_qualifying_questions`, no fabricated budget/timeline, same lead re-used (dedupe), 14.5 s |
| execution 161 | "refund + lawyer" message, live | Claude → **HUMAN_REVIEW**; guardrails added `customer_requests_refund`, `customer_mentions_legal`; approval task created; `[TEST]` email sent via Gmail |

The deployed Code nodes byte-match the repo (`tests/run-tests.js` simulates them; the deploy
step diffed them).

## WHAT CREDENTIALS ARE STILL MISSING

For everything email-based: **none.** Claude runs on n8n Gateway credits; email goes through the
existing Gmail credential. **But the Gateway credits ran out on 2026-09-25** ("Payment required"):
top them up in n8n, or create an Anthropic API key credential and attach it to the two Claude nodes.
Until then the agents answer from their rule engines (safe, but generic).

For Lovable website builds: **none.** The Website Builder uses Lovable's Build-with-URL link; you
click, review the prefilled prompt and press Send in your own Lovable workspace.

For WhatsApp (in and out): **one credential** — a Meta **WhatsApp Business Cloud** credential in
n8n (permanent System User access token + the WhatsApp Business phone number ID). The old
sandbox token in the July workflow expired after 24 h and must not be reused. Once created:
(1) re-add the WhatsApp node to the Outbound Sender, (2) point Meta's webhook at
`https://ryan1515.app.n8n.cloud/webhook/ceo-brain/whatsapp` with verify token `ceo-brain-verify`.

For Phase 2 (only when you start it): Meta app/page token (Facebook & Instagram Lead Ads,
WhatsApp Cloud API), TikTok Lead Gen token, respond.io token, Supabase project + service role
key, and a shared secret for the webhook. Names are listed in `.env.example`; values never go in
the repo.

## HOW n8n IS CONNECTED

- The Claude session holds an authenticated **n8n MCP** connection to project
  `uFcEmgtYEFyGauyy` (Ryan's personal project). It can create, validate, update, execute and
  publish workflows and manage data tables. That is how this workflow was built and tested — no
  nodes were dragged by hand.
- The workflow uses n8n's **managed Anthropic credential ("Gateway credits")**, so no Anthropic
  key is stored anywhere. If Gateway credits ever run out, the Claude node errors, and the
  workflow automatically falls back to the rule engine and logs `fallback_reason` — leads are
  never dropped.
- Email uses the existing **Gmail OAuth** credential (`Gmail account`).
- The webhook is public (n8n default). Phase 2 adds header authentication.

## WHAT THE NEXT PHASE WILL BE

Phase 2 is partly done (delivery, approval, WhatsApp adapter, daily brief). Still open in Phase 2:
WhatsApp credential + Meta webhook switch-over, Facebook/Instagram Lead Ads and website-form
adapters, automated follow-up nudges from `ceo_tasks`, Google Calendar booking, Supabase.
Website Builder (Agent #2) is live. Phase 3: Agent Router + full Solution Architect Agent (turns a
qualified lead into a scope), Lovable dashboard, Obsidian sync. See `docs/phase-2-plan.md` for the live checklist.
