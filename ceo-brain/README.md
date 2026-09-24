# CEO Brain — Phase 1: AI Lead & Sales Qualification Agent

CEO Brain is the AI Company Operating System. Phase 1 is the foundation: a lead comes in from
any channel, the AI understands it, qualifies it, drafts the next reply, schedules the follow-up,
and asks a human whenever a real decision is needed. **Nothing is sent to a customer without a
human.**

Plain-English summary: you POST a lead to one web address; a few seconds later you get back a
neat JSON "report card" on that lead (what they want, what is missing, how hot they are, the
suggested reply, what to do next), the lead is saved with a full audit trail, and if the case
needs you, an email lands in your inbox.

---

## WHAT IS ALREADY WORKING

- **n8n** at `https://ryan1515.app.n8n.cloud` — the orchestrator. Authenticated through the
  official n8n MCP in the Claude session, so workflows are created/updated/tested from code.
- **Claude Sonnet 4.6 via n8n Gateway credits** — no API key needed; verified working today
  (14 s, ~2,900 tokens per lead).
- **Gmail credential** in n8n — used for the approval email. Verified: a `[TEST]` email was sent.
- **GitHub credential** in n8n (not used by Phase 1).
- **The Phase 1 workflow, deployed and active**: `CEO Brain — Lead Intake (Phase 1)`, id
  `b7kbJpnKLN2uQxyn`, endpoint `POST https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead`.
- **Five data tables** in n8n holding leads, messages, agent runs, tasks and audit logs.

## WHAT WAS CREATED (this folder)

| Path | What it is |
|---|---|
| `agents/sales-qualification/` | Agent #1: manifest, input normalizer, deterministic rule engine (mock/fallback), post-processor with guardrails |
| `prompts/` | The agent's system prompt (consultant persona, 13 discovery questions, hard rules) and user template |
| `schemas/` | Lead input contract, the production output schema (strict JSON), lead statuses + allowed transitions |
| `workflows/lead-intake/` | `build.js` generates the n8n workflow from the above; `dist/` has the SDK code, the inlined Code-node JS, and an importable n8n JSON |
| `database/` | n8n data-table ids (live) and the Postgres/Supabase migration with tenant isolation (ready, not connected) |
| `integrations/` | The one-payload adapter contract and the Phase 2 channel list |
| `tests/` | 22 automated tests (unit + simulated n8n Code nodes) and a live webhook smoke test |
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

Verified today, on the deployed workflow:

| Run | Input | Result |
|---|---|---|
| execution 159 | John Tan, `ai_mode: mock` | rules-v1 → **HOT**, `book_discovery_call`, follow-up in 4 h, 279 ms |
| execution 160 | John Tan, `ai_mode: live` | Claude Sonnet 4.6 → valid JSON, **HOT**, `ask_qualifying_questions`, no fabricated budget/timeline, same lead re-used (dedupe), 14.5 s |
| execution 161 | "refund + lawyer" message, live | Claude → **HUMAN_REVIEW**; guardrails added `customer_requests_refund`, `customer_mentions_legal`; approval task created; `[TEST]` email sent via Gmail |

The deployed Code nodes byte-match the repo (`tests/run-tests.js` simulates them; the deploy
step diffed them).

## WHAT CREDENTIALS ARE STILL MISSING

For Phase 1: **none.** It runs on n8n Gateway credits (Claude) and the existing Gmail credential.

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

See `docs/phase-2-plan.md`. In one line: connect real channels in (WhatsApp, Facebook/Instagram
Lead Ads, website, TikTok, respond.io, Gmail) and out (approved replies, calendar bookings), add
the approval endpoint and follow-up scheduler, move storage to Supabase, and put an Agent Router
in front so the next agents (Solution Architect, Proposal, Customer Service …) plug in.
**Phase 2 does not start until Phase 1 is approved.**
