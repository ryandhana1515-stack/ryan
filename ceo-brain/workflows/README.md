# Workflows

| Workflow | n8n id | Trigger | Status |
|---|---|---|---|
| **CEO Brain — Lead Intake (Phase 1)** | `b7kbJpnKLN2uQxyn` | `POST https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead` | deployed + published 2026-09-24 |

## How n8n is managed (no manual node building)

The n8n instance is driven programmatically through the **official n8n MCP server** that the
Claude session is authenticated to. Order of preference we evaluated:

1. **n8n MCP (authenticated)** — available. Used for: creating the workflow from Workflow-SDK
   code (`create_workflow_from_code`), validating, executing test runs, reading executions,
   creating data tables, publishing. This is how Phase 1 was deployed.
2. n8n REST API — not configured (no `N8N_API_KEY` in this environment). Not needed.
3. Importable JSON — also produced (`lead-intake/dist/lead-intake.n8n.json`) so the workflow
   can be imported into any n8n instance by hand (Workflows → Import from file).

## Single source of truth

`lead-intake/build.js` generates the workflow from the agent modules, prompts and schemas:

```
node workflows/lead-intake/build.js        # -> dist/lead-intake.sdk.ts + dist/code-nodes/*.js
node tests/run-tests.js                    # unit + simulated n8n Code nodes
```

Then hand `dist/lead-intake.sdk.ts` to the n8n MCP (`validate_workflow` → `update_workflow` /
`create_workflow_from_code`). **Do not edit Code nodes inside n8n** — the next build would
overwrite them. `tests/run-tests.js` proves the deployed Code nodes byte-match the repo.

## Node map (24 nodes, 4 groups)

1. **Intake & validation** — Lead Webhook → Workflow Config (model, notify email, tenant) →
   Validate & Normalize Lead (Code) → Is Lead Valid? → (400 response on failure)
2. **Persist lead + inbound message** — Find Existing Lead → Resolve Lead Identity (merge +
   prompt) → Save Lead (upsert on `lead_key`) → Log Inbound Message
3. **AI qualification** — Rule-Based Qualification (always) → Use Live AI? → Sales
   Qualification Agent (Claude, error output wired to Finalize) → Finalize & Validate Result
   (JSON parse, schema validation, guardrails, status transition, follow-up time)
4. **Persist results & notify** — Update Lead Status → Log Agent Run → Log Audit Trail →
   Save Draft Reply → Create Follow-up Task → Human Review Needed? → Notify Owner (Gmail) →
   Respond With Result

## Payload

See `schemas/lead-input.schema.json`. Two switches matter for testing:

- `test_mode: true` — rows are flagged as test, the email subject gets `[TEST]`, nothing is ever
  sent to the customer (nothing is sent in Phase 1 anyway).
- `ai_mode: "mock"` — skip Claude, use the deterministic rule engine (zero AI credits).
