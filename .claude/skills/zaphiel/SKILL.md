---
name: zaphiel
description: Zaphiel operations manual for FusionTech AI — how to run, test, change and extend the agent team (John the Sales/WhatsApp Agent, the Website Builder, the supporting n8n workflows, the Obsidian vault, WhatsApp, Lovable). Use whenever the task is operational. Read zaphiel/vault/00 Home.md first.
---

# Zaphiel Operations Manual (FusionTech AI)

State lives in the Obsidian vault `zaphiel/vault/` (start at `00 Home.md`; write real changes back
into `Decisions.md` / `Change log.md` / `Open loops.md` and the `Agents` / `CEO Brain` notes).

## 1. The agents and how to call them
- **John (Lead Intake)** `b7kbJpnKLN2uQxyn`: n8n `execute_workflow` (trigger "Lead Webhook",
  webhookData.body per `ceo-brain/schemas/lead-input.schema.json`) or POST
  https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead. `test_mode:true` for anything not a real
  prospect; `ai_mode:"mock"` to avoid AI credits. Chat console (test):
  https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat (`ny60ozvH8B4uNpcb`).
- **Website Builder** `hSTRGnHVsu6tMOmH` (called by John's "Website Requested?" gate) → brief, task,
  email with Lovable link. **Website Build Record** `RVPBGpBzj2SUQlgX`: POST
  /webhook/ceo-brain/website-built {task_id, lead_id, status built|build_failed|skipped_test_mode,
  project_id, preview_url, editor_url, notes, actor} → task updated, mock-up sent to the customer via
  the Outbound Sender, copy to Ryan.
- **Outbound Sender** `SAcnNxG1GWPwn3N7` (email live; WhatsApp node re-added once the Meta WhatsApp
  Business credential exists). **Approve Reply** `uQxHTTdEkazgKpRT`. **WhatsApp Inbound**
  `3IhIJ5IYsB7wQQSg` (verify token ceo-brain-verify). **Vault Writer** `tVvSWjOubwBNLi88`.
  **Daily Brief** `Pew2PX1IcgdXqXr7` (08:00 SGT).
- Results: data tables `ceo_leads` / `ceo_tasks` (`requires_approval=true` waits for Ryan) /
  `ceo_agent_runs` (provider `rules` or `fallback` + "Payment required" = AI credits exhausted).

## 2. Changing an agent
- Behaviour and knowledge: the vault notes (`FusionTech AI — Master Company Brain`,
  `Knowledge/John — Sales playbook`, `Knowledge/Website Builder — playbook`) — live, no redeploy.
- Rules, schema, hand-offs: `ceo-brain/agents/*`, `prompts/`, `schemas/`; then
  `node ceo-brain/workflows/lead-intake/build.js && node ceo-brain/tests/run-tests.js`; deploy with
  n8n `update_workflow` (setNodeParameter on the generated Code nodes; verify byte-identical against
  `dist/`), publish. Same for `workflows/website-builder/build.js`.
- New agent: add a folder under `ceo-brain/agents/`, a playbook note under `Knowledge/`, a row in
  `Agents.md`, register the workflow id in `ceo-brain/database/n8n-data-tables.json`.

## 3. Blockers and how they clear
- AI credits: Ryan tops up n8n credits (or adds an Anthropic API key credential).
- WhatsApp: Meta WhatsApp Business Cloud credential in n8n — see the vault note
  `Knowledge/_How to connect WhatsApp`; then re-add the WhatsApp node in the sender, point Meta at
  /webhook/ceo-brain/whatsapp.
- Lovable builds: OAuth-only MCP → a Claude session with the Lovable connector creates projects;
  needs Ryan's one-time authorization. The Website Build Record endpoint takes the result.

## 4. Vault writing rules
Pull first; append, never rewrite Ryan's lines; keep notes short (playbooks are sent to the agents
on every message); no secrets; commit, push, PR, merge in the same session.
