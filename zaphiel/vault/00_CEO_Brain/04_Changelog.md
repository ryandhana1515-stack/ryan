---
type: pointer
tags: [zaphiel, ceo-brain, changelog]
---
# 04 · Changelog

The canonical changelog stays at the vault root: **[[Change log]]** (date, what changed, why). Every session appends there before it ends. This note exists so the blueprint's path resolves.

## Entries recorded here (also in [[Change log]])
- 2026-09-26 — **Website Intelligence & Conversion Strategist installed** (Ryan's agent file, verbatim): Claude Code subagent `.claude/agents/website-intelligence.md`; contract note [[10_Agents/05a_Website_Intelligence]]; output template `80_Clients/_TEMPLATE_Client/website/` (10 files + `WEBSITE_BUILD_BRIEF.json`). Runs in Claude Code in CLIENT or PROSPECT mode, before the Website Builder.
- 2026-09-26 — **ATLAS merged into 07** (Ryan: "ok merge"): [[10_Agents/07_CRM_Architect]] is now ATLAS (alias), rewritten
  from the agent file with the old content kept; John (02) hand-off, permission matrix and index updated; ADR-4.
- 2026-09-26 — **ATLAS live in n8n** (`9XQWSgTBszRc0Jxj`, source `ceo-brain/workflows/atlas/build.js`): John hands a
  lead to ATLAS once when a named company needs CRM / automation and John knows how it works today; ATLAS runs DESIGN
  mode to checkpoint 1 (files 00, 01, 02, 14, 15 in `80_Clients/<company>/edg/`), opens an approval task, emails Ryan
  and notifies the Orchestrator. Later checkpoints and BUILD / AUDIT run in Claude Code (`atlas` subagent, all tools).
- 2026-09-26 — **ATLAS — EDG & CRM Systems Architect installed** (Ryan's agent file, verbatim): Claude Code subagent
  `.claude/agents/atlas.md` (repo root, where Claude Code reads subagents, next to `website-intelligence.md`);
  output template `80_Clients/_TEMPLATE_Client/edg/` (STAGE 16 files, empty, plus a README linking ATLAS to the
  Orchestrator, John, Website Intelligence, Workflow Automation, Data/BI, Security/QA and the registries).
  [[10_Agents/07_CRM_Architect]] already exists, so no separate ATLAS note: the merge (ATLAS becomes the upgraded
  07) is proposed to Ryan and waits for his OK. John already has a note ([[10_Agents/02_Sales_CRM]]), so no stub.
- 2026-09-27 — **ATLAS DISCOVERY MODE added** (Ryan's text, verbatim; diff shown and approved: "save it").
  `.claude/agents/atlas.md`: DISCOVERY MODE added to the modes list and as a full section (D0–D13) right after
  OPERATING MODES; the identity line now reads "In DESIGN / BUILD / AUDIT mode you work behind John. In DISCOVERY MODE
  you may speak with the customer directly (or with Ryan relaying the customer's answers), OR give John the next
  questions to ask." Nothing else changed. New playbook note [[10_Agents/ATLAS_Discovery_Playbook]] (linked to 07 ATLAS,
  02 John, 05a Website Intelligence, 01 Discovery, 15 Security/QA — Ryan's names `07_ATLAS_EDG_CRM_Architect` and
  `John_Customer_Facing_Agent` do not exist, so the real notes are linked). New template folder
  `80_Clients/_TEMPLATE_Client/edg/discovery/` (00–05 + `DISCOVERY_BRIEF.json`). ADR-4 amended (narrows ADR-3 for ATLAS's
  discovery conversations). The live n8n ATLAS reads the agent file too; it keeps running DESIGN mode only.
  Start: `Use the atlas agent in DISCOVERY mode. New customer: <name/website or "no info">. I'll paste their replies.`
