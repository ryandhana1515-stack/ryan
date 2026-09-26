---
name: zaphiel
description: Zaphiel operations manual for FusionTech AI — how to run, test, change and extend the agent team (Discovery Agent, John the Sales/WhatsApp Agent, the Website Builder v2 in SME + Medical modes, the Training Room, the supporting n8n workflows, the Obsidian vault, WhatsApp, Lovable) and the CEO Brain product (modules, CRM/ERP data layer, build pipeline). Use whenever the task is operational. Read zaphiel/vault/00 Home.md first.
---

# Zaphiel Operations Manual (FusionTech AI)

State lives in the Obsidian vault `zaphiel/vault/` (start at `00 Home.md`; write real changes back
into `Decisions.md` / `Change log.md` / `Open loops.md` and the `Agents` / `CEO Brain` notes).
The product Ryan sells and how it is built: `Knowledge/CEO Brain — product architecture` (derived
from `FusionTech AI — Product & Build Directive`, verbatim). The twelve-agent roster and what
exists: `Knowledge/AI Workforce — roster`.

## 1. The agents and how to call them
- **Discovery — Company Discovery & Onboarding Agent** (Discovery Console `9TnzsgPGRatMaQI3`):
  hosted chat https://ryan1515.app.n8n.cloud/webhook/40d1b87c-1ec4-4534-ac80-bbdeef475d23/chat or n8n
  `execute_workflow` (trigger "Discovery Chat (hosted)", `chatInput`). Session ids starting
  `dash_`/`test_`/`mcp` are test mode → `Discovery/Test/`. Every turn: map in `ceo_company_maps`
  (`l02tcAaRNNYzCwBP`) + vault note `Discovery/<map_id>.md`; when complete (≥75% of 13 topics, ≥4
  turns): proposal draft (no pricing) appended, `proposal_draft` task, email to Ryan.
- **John (Lead Intake)** `b7kbJpnKLN2uQxyn`: n8n `execute_workflow` (trigger "Lead Webhook",
  webhookData.body per `ceo-brain/schemas/lead-input.schema.json`) or POST
  https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead. `test_mode:true` for anything not a real
  prospect; `ai_mode:"mock"` to avoid AI credits. Chat console (test):
  https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat (`ny60ozvH8B4uNpcb`).
  Public "Chat with John" page for customers: https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat
  (`FngKsJ2x0AaWOdJl`, source `ceo-brain/website-chat/build.js`; embed snippet for the company site
  in `website-chat/embed-snippet.html`).
- **Website Builder v2** `hSTRGnHVsu6tMOmH` (called by John's "Website Requested?" gate; two modes
  `sme` / `medical` decided by code from the customer's words) → brief with design direction,
  content rules, medical verification list, QA checklist, Lovable prompt → task → email with Lovable
  link. Reads `Knowledge/Website design standard` + `Knowledge/Website Builder — playbook` live.
  Test it through the Trainer API (`chat`, agent `website-builder`). **Website Build Record**
  `RVPBGpBzj2SUQlgX`: POST /webhook/ceo-brain/website-built {task_id, lead_id, status
  built|build_failed|skipped_test_mode, project_id, preview_url, editor_url, notes, actor} → task
  updated, mock-up sent to the customer via the Outbound Sender, copy to Ryan.
- **ATLAS — EDG & CRM Systems Architect**: n8n `9XQWSgTBszRc0Jxj` (called by John's "EDG Needed?"
  gate, once per lead; source `ceo-brain/workflows/atlas/build.js` + `agents/atlas/atlas.js`) runs
  DESIGN mode to checkpoint 1 → files 00/01/02/14/15 in `zaphiel/vault/80_Clients/<slug>/edg/`
  (test leads under `80_Clients/_Test/`), `edg_design` approval task, email to Ryan, event
  `edg.checkpoint_1`. Everything after checkpoint 1 (architecture, build spec, BUILD, AUDIT) runs in
  Claude Code with the `atlas` subagent (`.claude/agents/atlas.md`, all tools) once Ryan confirms.
  John asks ATLAS's open questions himself: Lead Intake's "Load ATLAS Questions" step reads the lead's
  `edg_design` task and Finalize adds the next unasked one to John's reply (`atlas_question` in the output).
- **Training Room** `AM59goLdbt0clv8q`: https://ryan1515.app.n8n.cloud/webhook/ceo-brain/dashboard
  (PIN in the "Trainer Config" node of **Trainer API** `zKqlk05WShUOrojw`, POST
  /webhook/ceo-brain/trainer {pin, action list|playbook|train|chat, agent, text, session}). Agents
  come from `Knowledge/agents.json`; any entry with a `chat_url` is chattable from the dashboard.
- **Outbound Sender** `SAcnNxG1GWPwn3N7` (email live; WhatsApp node re-added once the Meta WhatsApp
  Business credential exists). **Approve Reply** `uQxHTTdEkazgKpRT`. **WhatsApp Inbound**
  `3IhIJ5IYsB7wQQSg` (verify token ceo-brain-verify). **Vault Writer** `tVvSWjOubwBNLi88`.
  **Daily Brief** `Pew2PX1IcgdXqXr7` (08:00 SGT).
- Results: data tables `ceo_leads` / `ceo_company_maps` / `ceo_tasks` (`requires_approval=true`
  waits for Ryan) / `ceo_agent_runs` (provider `rules` or `fallback` + "Payment required" = AI
  credits exhausted). Long-term CRM/ERP schema: `ceo-brain/database/migrations/002_crm_erp_core.sql`.

## 2. Changing an agent
- Behaviour and knowledge: the vault notes (`FusionTech AI — Master Company Brain`,
  `Knowledge/John — Sales playbook`, `Knowledge/Company Discovery — playbook`,
  `Knowledge/Website design standard`, `Knowledge/Website Builder — playbook`) — live, no redeploy.
- Rules, schema, hand-offs: `ceo-brain/agents/*`, `prompts/`, `schemas/`; then
  `node ceo-brain/workflows/<workflow>/build.js && node ceo-brain/tests/run-tests.js`; deploy with
  n8n `update_workflow` (setNodeParameter on the generated Code nodes; verify against `dist/`) or
  `create_workflow_from_code` for a new workflow (no `Object.assign`, no array methods, no
  `switch.case` in SDK code), then publish and verify with one real execution.
- New agent: a folder under `ceo-brain/agents/` (manifest, prompts, schema, rules fallback,
  guardrails in code), a playbook note under `Knowledge/`, an entry in `Knowledge/agents.json`
  (with `chat_url` if it has a console), a row in `Agents.md`, the workflow id in
  `ceo-brain/database/n8n-data-tables.json`. It then appears in the Training Room automatically.

## 3. Blockers and how they clear
- AI credits: Ryan tops up n8n credits (or adds an Anthropic API key credential).
- WhatsApp: Meta WhatsApp Business Cloud credential in n8n — see the vault note
  `Knowledge/_How to connect WhatsApp`; then re-add the WhatsApp node in the sender, point Meta at
  /webhook/ceo-brain/whatsapp.
- Lovable builds: OAuth-only MCP → a Claude session with the Lovable connector creates projects;
  needs Ryan's one-time authorization. The Website Build Record endpoint takes the result; the QA
  checklist in every brief is what to inspect before the customer sees it.
- Supabase: run `database/migrations/0001_init.sql` then `002_crm_erp_core.sql`, add a Postgres
  credential in n8n, swap the data-table nodes (same column names).

## 4. Non-negotiables (from the directive)
Never ask a customer for "all your data" or for a password; never quote prices, guarantees or
timelines (pricing is human); never generate the generic AI website look; AI recommends → human
approves → execute → audit for money, refunds, contracts, deletes, permissions, production; every
row carries the tenant; the vault is knowledge, the CRM/database is live data.

## 5. Vault writing rules
Pull first; append, never rewrite Ryan's lines; keep notes short (playbooks are sent to the agents
on every message); no secrets; commit, push, PR, merge in the same session.

## CEO Brain v3 vault structure (2026-09-25)
Numbered folders next to the original notes: `00_CEO_Brain` (master rules, architecture v3, build backlog + open questions), `10_Agents` (16 contracts), `20_Specialist_Workers` (9), `30_Platform_Services` (11 + environments), `40_Registries` (integration status is real: `planned` until Ryan confirms), `50_Client_Onboarding`, `80_Clients/<tenant>/` (never mixed), `90_Templates`. Root logs stay canonical (ADR-1). Work phase by phase per [[00_CEO_Brain/02_Build_Backlog]]; end every phase with files created / changed, open questions, what Ryan does next. Never move the four live-read Knowledge notes.
