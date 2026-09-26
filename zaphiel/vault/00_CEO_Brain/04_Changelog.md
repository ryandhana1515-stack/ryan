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
