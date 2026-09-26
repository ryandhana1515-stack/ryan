---
tags: [zaphiel, ceo-brain]
updated: 2026-09-25
---
# CEO Brain

The AI company operating system of FusionTech AI: one team of agents, one brain (this vault), no
master agent. Agents call each other directly and every customer-facing decision that involves
money, contracts, publishing or refunds waits for Ryan.

## What FusionTech sells
CEO Brain + AI workforce + CRM/ERP company data layer + automation + custom software + high-end
websites, customised per customer (Ryan's directive, 2026-09-25: [[FusionTech AI — Product & Build Directive]];
how it is built: [[Knowledge/CEO Brain — product architecture]]; the twelve agents: [[Knowledge/AI Workforce — roster]]).

## Live today (all on n8n, project uFcEmgtYEFyGauyy)
- **Discovery — Company Discovery & Onboarding Agent** (Discovery Console `9TnzsgPGRatMaQI3`): consultant-style
  conversation → Client Digital Company Map in `Discovery/` after every turn → proposal draft (no
  pricing) + review task + email when complete. Reads the brain + its playbook live.
- **John — Sales Agent** (Lead Intake `b7kbJpnKLN2uQxyn`): every enquiry → qualifies, extracts facts,
  drafts the reply, sends low-risk replies, escalates the rest to Ryan, hands website requests to
  the Website Builder, writes the conversation to this vault. Reads the master brain and his
  playbook from this vault on every message.
- **Website Builder v2** (`hSTRGnHVsu6tMOmH`): SME + Medical modes; conversation → premium brief (design
  direction, content rules, QA checklist, medical verification) + Lovable build prompt → task → email to
  Ryan. Reads the design standard + playbook live from this vault.
- **Website Build Record** (`RVPBGpBzj2SUQlgX`): finished build → task updated → mock-up sent to the
  customer through the Outbound Sender (WhatsApp when the credential exists, else email) → copy to Ryan.
- **Outbound Sender** (`SAcnNxG1GWPwn3N7`), **Approve Reply** (`uQxHTTdEkazgKpRT`), **WhatsApp
  Inbound** (`3IhIJ5IYsB7wQQSg`), **Vault Writer** (`tVvSWjOubwBNLi88`), **Daily Brief**
  (`Pew2PX1IcgdXqXr7`), **Website Intelligence** (`5VWP3tMK3MZysi7w`), **ATLAS** (`9XQWSgTBszRc0Jxj`), **CEO Orchestrator** (`8Ix4yc223sxrSu5h`), **Approval Inbox** (`r4ynzcSqRy8zHoFl`), **John Chat Console** (`ny60ozvH8B4uNpcb`), **Trainer API**
  (`zKqlk05WShUOrojw`), **Training Room** dashboard (`AM59goLdbt0clv8q`), **Chat with John public
  page** (`FngKsJ2x0AaWOdJl`, https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat), **Website Build
  Runner** (`7sEuGyU6IjJsSaKL`, superseded 2026-09-26: the build step runs as the Claude routine "Zaphiel —
  Website Build Worker" `trig_01K4UinSX4tQWK537MeHQuuc`, see `ceo-brain/agents/website-build-worker/ROUTINE.md`;
  the n8n runner stays unpublished and the Website Builder's start node disabled).
- Data: n8n tables `ceo_leads`, `ceo_messages`, `ceo_agent_runs`, `ceo_tasks`, `ceo_audit_logs`,
  `ceo_company_maps`. Long-term CRM/ERP schema (39 tables, tenant isolation with RLS) designed in
  `ceo-brain/database/migrations/002_crm_erp_core.sql`.
- Code: `ceo-brain/` in this repo (agents, prompts, schemas, generators, 40 tests). Every Code node in
  n8n is generated from there; nothing is hand-edited in n8n.

## Guardrails (code, not prompt)
Never invent facts. Never quote prices, guarantees, delivery dates, contracts or refunds — those go
to Ryan. WON/LOST are human decisions. Nothing is published to a live domain without Ryan.
Third-party costs are always separate from FusionTech fees. No secrets in the vault or logs.

## Run a discovery yourself
https://ryan1515.app.n8n.cloud/webhook/40d1b87c-1ec4-4534-ac80-bbdeef475d23/chat — talk as a business owner; the Company Map appears in `Discovery/Test/` in this
vault after every message (real customers: `Discovery/`). Also reachable from the Training Room (agent "Discovery").

## Train the agents (Training Room)
https://ryan1515.app.n8n.cloud/webhook/ceo-brain/dashboard — every agent in [[Knowledge/agents.json]]
plus the brain. Talk by voice or text, teach ("when a customer says X, then …") straight into the
playbook notes in this vault, read each playbook live. PIN: the Trainer Config node of the n8n
workflow "CEO Brain — Trainer API". See [[Knowledge/_How to train the agents]].

## Test John yourself
https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat (test mode:
nothing reaches a real customer; the conversation lands in `Leads/Test/`).
