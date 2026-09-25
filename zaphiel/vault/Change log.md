---
tags: [zaphiel, changelog]
---
# Change log

- 2026-09-25 — FusionTech AI brain started. Built and published on n8n: John (Lead Intake, with the
  FusionTech context), Outbound Sender, Approve Reply, WhatsApp Inbound adapter, Daily Brief,
  Website Builder, Website Build Record, John Chat Console, Vault Writer. John reads the master brain
  and his playbook from this vault live; every conversation is written to Leads/ and Companies/.
  Website Build Record sends finished mock-ups to the customer (WhatsApp when the credential exists).
- 2026-09-25 — Vault created in the repo with the Obsidian Git plugin pre-installed; Ryan opened it
  ("vault is ready"); vault trimmed to FusionTech AI only; how-to notes for WhatsApp and training.
- 2026-09-25 — Found: n8n AI Gateway credits exhausted ("Payment required"); agents answer from
  their rule engines until Ryan tops up.
- 2026-09-25 — Training Room shipped: hosted dashboard (n8n `AM59goLdbt0clv8q`,
  /webhook/ceo-brain/dashboard) + Trainer API (`zKqlk05WShUOrojw`). Agents come from
  `Knowledge/agents.json`; teaching writes "Lessons learned" lines into the playbook notes here;
  chat relays to John (chat console) and the Website Builder (brief). First taught line landed in
  John's playbook from the dashboard (commit 880ec38). Voice via the browser (Web Speech API).
- 2026-09-25 — Ryan's product directive received (verbatim in [[FusionTech AI — Product & Build Directive]]).
  Built from it the same day: **Website Builder v2** (SME + Medical modes, design intelligence per
  business category, anti-generic rules, medical verification, QA checklist, design standard +
  playbook read live from the vault; deployed to `hSTRGnHVsu6tMOmH`, verified execution 209);
  **Company Discovery & Onboarding Agent** + Discovery Console (`9TnzsgPGRatMaQI3`) writing the Client
  Digital Company Map to `Discovery/` and a proposal draft when complete; **Proposal draft generator**;
  **CRM/ERP data layer** (39-table Postgres migration with tenant RLS, validated locally); Trainer API
  now chats with any registered agent; new vault notes: design standard, discovery playbook, product
  architecture, workforce roster, templates. Tests: 35 passing.

- 2026-09-25 — **BMW website chain proven:** John (chat console, execution 224) → Website Builder brief →
  mock-up built on Lovable ("Prestige Drive", project `e650eee1-4666-475f-95dc-0686284264fc`) → Website
  Build Record (execution 229) marked the task `built` and emailed Ryan the preview. Website Builder
  v2.0.2 deployed (automotive category, wider business-name detection). New **Chat with John public
  page** (`FngKsJ2x0AaWOdJl`, /webhook/ceo-brain/chat) + embed snippet for FusionTech.com.sg
  (`ceo-brain/website-chat/`). Tests: 36 passing. Still manual: the Lovable build step (see Open loops).
