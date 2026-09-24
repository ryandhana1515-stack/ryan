# Agents

Every agent is a folder with the same contract, so the AI Agent Router (Phase 2) can dispatch to
any of them without special cases:

```
agents/<agent-id>/
  agent.json      manifest: id, version, model, prompt paths, input/output schema, what it may
                  do autonomously, what must escalate, what it must never do
  normalize.js    (optional) input validation/normalization — pure functions
  rules.js        deterministic fallback that produces the SAME output schema as the LLM
  postprocess.js  parse + validate + guardrails + next-action logic — pure functions
```

Rules that apply to all agents:

- **Structured output only.** The LLM must return JSON that validates against the agent's output
  schema in `schemas/`. Anything else is rejected and the deterministic fallback is used.
- **Never fabricate.** Unknown = `null` + listed in `missing_information`.
- **Guardrails are code, not prompt.** `postprocess.js` enforces them regardless of provider.
- **Human-only actions** (contracts, final prices, refunds, money movement, deletes, deploys,
  credentials, irreversible commitments) can only be *requested* via a task with
  `requires_approval = true`; no agent executes them.
- **Observability.** Every run writes one `agent_runs` row: agent, version, input ref, output,
  provider, model, success, error, latency, workflow + execution id, lead id. No secrets in logs.

| Agent | Status | Notes |
|---|---|---|
| `sales-qualification` | **Phase 1 — live** | Agent #1. Lead intake, extraction, classification, progressive questioning, draft reply. |
| solution-architect | planned (Phase 2) | Turns a qualified lead into a solution outline. |
| proposal | planned (Phase 2) | Drafts proposals; always `requires_approval`. |
| customer-service | planned | Existing n8n "Customer Service Agent — 24/7 Chat" will be migrated into this contract. |
| marketing | planned | Existing content/ads n8n agents migrate here. |
| email-admin, finance-assistant, operations, project-manager, ceo-intelligence | planned | Folders are created only when the agent is built. |
