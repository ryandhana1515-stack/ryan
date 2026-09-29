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
- 2026-09-30 — **Fusion Property AI — Singapore Property Master Agent installed** (Ryan's agent file, verbatim).
  - Claude Code subagent `.claude/agents/fusion-property-sg.md` (new; no conflict with `atlas` or `website-intelligence`).
  - Graph node [[10_Agents/16_Fusion_Property_SG]] with the five modes and how to start each. It links to
    [[cinematic-website]], [[10_Agents/05a_Website_Intelligence]], [[10_Agents/07_CRM_Architect|07_ATLAS_EDG_CRM_Architect]],
    [[10_Agents/03_Marketing_Growth]], [[10_Agents/04_Creative_Studio]] and [[10_Agents/15_Security_Governance_QA]].
    Ryan's name `07_ATLAS_EDG_CRM_Architect` does not exist, so the link goes to the real ATLAS note (07) under that
    label. `cinematic-website` did not exist, so a new pointer note [[Knowledge/cinematic-website]] maps it to the
    Cinematic doctrine, the Wow playbook and the site kit.
  - Pack [[70_Industry_Packs/Singapore_Property/00_Index]] (00–07).
  - Product folder `90_Products/Fusion_Property_AI/` (Architecture, Roadmap, Data_Model, Test_Dataset_Plan).
  - KNOWLEDGE REFRESH 1 of [[70_Industry_Packs/Singapore_Property/03_Regulation_Register]]: 40 rules, 33 VERIFIED on the
    official pages with URL and date, 7 NEEDS VERIFICATION. Where the official pages differ from the agent file's
    baseline (toilet-only 3-year rule, HS drilling ≤ 50 mm permitted, DRC for all HDB works, NEA landed only), the
    register wins; the agent file is unchanged.
  - Existing notes changed by appending only: `70_Industry_Packs/_index.md`, `10_Agents/_index.md`, `Decisions.md`,
    this changelog, [[Change log]] and [[Open loops]]. Test [32] was added.
- 2026-09-30 — **ATLAS v2 BUILD ENGINE + Fusion EDG Core built (development)** (Ryan: "Build all now"; "Don't do property first, do this first").
  - `.claude/agents/atlas.md`: BUILD ENGINE (v2) sections B1–B18 added, Ryan's text verbatim, plus one line of Zaphiel's ("the stricter safety rule wins"). The diff was shown before saving: 254 lines added, 0 removed. There is no second ATLAS.
  - New code `fusion-edg-core/` (repo root, not the vault). It moves to a private repo when Ryan creates one; the GitHub connector cannot create repos (403).
    - B1: tool registry, capability detection, the `executeTool` safety pipeline, approvals, audit, idempotency, MOCK adapters.
    - B2: multi-tenant schema with forced RLS; cross-tenant test passes; backup/restore tried.
    - B3: outbox dispatcher; 8 n8n templates created INACTIVE in the n8n folder "EDG Core — TEST templates (inactive)".
    - C: form/WhatsApp/email → CRM → owner → follow-up → CEO brief.
    - 51/51 tests pass. Docs, test report and demo script are in `fusion-edg-core/docs/`.
    - Summary: [[00_CEO_Brain/05_Fusion_EDG_Core]].
  - Nothing is in staging or production, and no real customer data was used.
