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
- 2026-09-30 — **Fusion EDG Core moved to its private repo** `ryandhana1515-stack/fusion-edg-core` (Ryan: "repo made"). The history was kept (`git subtree split`, 5 commits), 51/51 tests pass there, and a `CLAUDE.md` with the working rules was added (fusion-edg-core PR #1, merged). The `fusion-edg-core/` folder was removed from the public `ryan` repo; its earlier commits remain in `ryan` history (there are no secrets in them).
- 2026-09-30 — **Supabase dev database live** (Ryan created the org "FusionTech AI" and the project `fusion-edg-dev`, then connected Supabase to Claude).
  - Region: Tokyo (ap-northeast-1). Client production projects will go in Singapore.
  - Migrations 001–008 applied, with FAKE seed data (2 demo orgs).
  - Isolation verified on Supabase itself: no cross-tenant reads, updates, deletes or inserts; the audit log cannot be changed; no data without an organisation; anonymous visitors see nothing.
  - Supabase security advisor: 10 warnings (function search_path), fixed with migration 008; now 0 findings. fusion-edg-core PR #2 merged.
- 2026-10-01 — **ATLAS v3: business-systems intelligence + health check** (Ryan's v3 prompt; "Ok" to the health-check fixes;
  PR #109). Health check: no broken links; 13 duplicated rules and 5 conflicts found. Agent file `.claude/agents/atlas.md`:
  Ryan's "BUSINESS SYSTEMS INTELLIGENCE (v3)" section (verbatim) + notes (pack location, Supabase wording, Marketing
  Agent, raise the ERP question early); one home per rule (secrets §11, approvals B5+B15, n8n B9, lead rule §8, AI
  agents B9, KPIs/CEO Brain B10, audit/failure B11, tests B12, industries → archetypes); conflicts fixed (customer
  contact, website agent names, marketing boundary, B19 sign-in line, §28 real builders). New knowledge pack
  `60_Skill_Packs/ATLAS_Business_Systems/` (29 cards, 12 archetypes; Ryan's text verbatim, card fields completed and
  labelled). Discovery playbook → pointer; 07 ATLAS note links instead of copying; draft notes 01/03/08/10/11/12/14
  link to their cards; `INTEGRATION_SPEC.json` stub in the client template. Scenario tests (fake data):
  A field service PASS, B ERP-like FAIL → fixed → PASS, C property PASS
  ([[80_Clients/_Test/atlas-v3-scenarios/00_Results]]). ceo-brain tests 135/135.
- 2026-10-01 — **Mobile job card built** (Ryan: "ok" to the field-service gap first; Fusion EDG Core PR #16, deployed to
  the test system). Technician's phone screen: address + map link, checklist per service, materials, before/after photos,
  notes, customer signature (or reason), complete; works offline and sends when the signal returns; AI agents refused by
  the app and the database. Migration 015 applied to staging; 137/137 tests; checked in a phone-sized browser offline →
  online → completed. Self-test bookings are now released. ATLAS cards 11/18 and the field-service archetype say TESTED.
- 2026-10-01 — **Staff logins + "each person sees only their own customers"** (Ryan: "do"; Fusion EDG Core PR #17, deployed
  to the test system). Own email + password at `/app/login`, set after a one-time link; lockout after 5 wrong tries;
  hashes only. Owner switch "Who sees which customers" enforced by the database for salespeople/support; managers,
  the AI and the system unaffected; free times stay true. Migration 016 on staging (applied through the SQL tool in
  parts: the migration tool timed out on one statement pattern). 147/147 tests. Cards 01/09 + property archetype updated.
- 2026-10-01 — **Lead sources: Facebook/Instagram lead forms + property-portal enquiry emails** (Ryan: "do"; Fusion EDG
  Core PR #18, test system). Migration 017 on staging; 161/161 tests. Real Page and real portal emails NEEDS VERIFICATION.
