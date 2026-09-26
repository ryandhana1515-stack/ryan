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
| `ceo-orchestrator` | **live, v1.0.0** | Agent #0 (head). Deterministic, no LLM: routes every event (`POST /webhook/ceo-brain/event`) by a fixed routing table, opens exception/review tasks for humans, computes the unresolved-issues list from the tables every hour, writes the vault Management view, serves the Approval Inbox. Never contacts a customer, never moves money. |
| `sales-qualification` | **live, v1.1.0** | Agent #1, persona **John**. Briefed with the FusionTech Master Company Brain (`prompts/company-context.md`). Extracts, classifies, asks progressively, drafts; low-risk replies auto-sent, the rest approved by the owner. |
| `ceo-intelligence` (v0, inside the Daily Brief workflow) | live | Agent #8. Writes the recommended-priorities section of the 08:00 brief from table numbers only. |
| `company-discovery` | **live, v1.0.0** | Agent #1 of the workforce. Consultant-style conversation → Client Digital Company Map (`schemas/company-map.schema.json`), data discovery checklist with connect/import/index/summarize/leave handling, proposal draft when complete. Rules fallback records the owner's answers under the asked topic. Runs in the Discovery Console. |
| `website-builder` | **live, v2.0.0** | Agents #4–#6: SME Website Builder + Medical/Doctor Website Builder on shared infrastructure, with the Website Architect's requirements step inside. Mode detection (medical is enforced by code from the customer's words), category design direction, anti-generic rules, content rules, medical verification list, QA checklist, Lovable prompt. Design standard + playbook read live from the vault. Never builds or deploys by itself. |
| `proposal` | **live (draft), v1.0.0** | Deterministic proposal draft from the Company Map — all sections, never pricing. Appended to the Discovery note, review task + email to the owner. |
| solution-architect | planned | Full technical architecture from the Company Map (today: the proposal draft's architecture/modules/agents sections). |
| customer-service | planned | Existing n8n "Customer Service Agent — 24/7 Chat" will be migrated into this contract. |
| marketing | planned | Existing content/ads n8n agents migrate here. |
| website-qa | checklist live, inspection planned | The QA checklist ships with every brief; inspecting a built preview needs Lovable builds. Medical adds content verification. |
| email-admin, finance-assistant, operations, project-manager | planned | Folders are created only when the agent is built. |
