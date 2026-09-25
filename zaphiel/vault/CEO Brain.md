---
tags: [zaphiel, ceo-brain]
updated: 2026-09-25
---
# CEO Brain

The AI company operating system of FusionTech AI: one team of agents, one brain (this vault), no
master agent. Agents call each other directly and every customer-facing decision that involves
money, contracts, publishing or refunds waits for Ryan.

## Live today (all on n8n, project uFcEmgtYEFyGauyy)
- **John — Sales Agent** (Lead Intake `b7kbJpnKLN2uQxyn`): every enquiry → qualifies, extracts facts,
  drafts the reply, sends low-risk replies, escalates the rest to Ryan, hands website requests to
  the Website Builder, writes the conversation to this vault. Reads the master brain and his
  playbook from this vault on every message.
- **Website Builder** (`hSTRGnHVsu6tMOmH`): conversation → build brief + Lovable build prompt → task
  → email to Ryan with a link that opens Lovable with the prompt prefilled.
- **Website Build Record** (`RVPBGpBzj2SUQlgX`): finished build → task updated → mock-up sent to the
  customer through the Outbound Sender (WhatsApp when the credential exists, else email) → copy to Ryan.
- **Outbound Sender** (`SAcnNxG1GWPwn3N7`), **Approve Reply** (`uQxHTTdEkazgKpRT`), **WhatsApp
  Inbound** (`3IhIJ5IYsB7wQQSg`), **Vault Writer** (`tVvSWjOubwBNLi88`), **Daily Brief**
  (`Pew2PX1IcgdXqXr7`), **John Chat Console** (`ny60ozvH8B4uNpcb`).
- Data: n8n tables `ceo_leads`, `ceo_messages`, `ceo_agent_runs`, `ceo_tasks`, `ceo_audit_logs`.
- Code: `ceo-brain/` in this repo (agents, prompts, schemas, generators, 29 tests). Every Code node in
  n8n is generated from there; nothing is hand-edited in n8n.

## Guardrails (code, not prompt)
Never invent facts. Never quote prices, guarantees, delivery dates, contracts or refunds — those go
to Ryan. WON/LOST are human decisions. Nothing is published to a live domain without Ryan.
Third-party costs are always separate from FusionTech fees. No secrets in the vault or logs.

## Test John yourself
https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat (test mode:
nothing reaches a real customer; the conversation lands in `Leads/Test/`).
