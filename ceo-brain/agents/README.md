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
| `sales-qualification` | **live, v1.1.0** | Agent #1, persona **John**. Briefed with the FusionTech Master Company Brain (`prompts/company-context.md`). Extracts, classifies, asks progressively, drafts; low-risk replies auto-sent, the rest approved by the owner. |
| `ceo-intelligence` (v0, inside the Daily Brief workflow) | live | Agent #8. Writes the recommended-priorities section of the 08:00 brief from table numbers only. |
| `website-builder` | **live, v1.0.0** | Agent #2 (the Solution Architect's mock-up-brief half). Triggered by Lead Intake when the customer asks for a website / web app. Produces a validated brief + Lovable build prompt, one `website_build` approval task per lead, and emails the owner an Open-in-Lovable link. Never builds or deploys by itself. |
| solution-architect | planned (Phase 3) | Full solution outline (workflow architecture, scope, tasks) for a qualified lead. |
| proposal | planned (Phase 2) | Drafts proposals; always `requires_approval`. |
| customer-service | planned | Existing n8n "Customer Service Agent — 24/7 Chat" will be migrated into this contract. |
| marketing | planned | Existing content/ads n8n agents migrate here. |
| email-admin, finance-assistant, operations, project-manager, ceo-intelligence | planned | Folders are created only when the agent is built. |
