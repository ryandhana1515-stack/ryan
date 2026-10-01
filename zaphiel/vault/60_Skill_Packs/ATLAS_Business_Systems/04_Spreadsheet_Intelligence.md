---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "04"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 04 · Spreadsheet Intelligence

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Excel, Google Sheets, CSV, formulas, tables, filters, pivots, imports/exports,
cleaning, mapping, spreadsheet → database migration.
DO NOT automatically discard spreadsheets. For each sheet: what does it do?
who updates it? what do the columns mean? which calculations/formulas
matter? which reports depend on it? which processes depend on it? Then:
REMAIN / CONNECT / BECOME PART OF CRM / MIGRATE TO DB / REPLACE.
PROCEDURE (when a file is shared): copy the original (read-only) → list sheets,
columns, types, row counts, blanks, duplicates → extract formulas and
cross-sheet references (e.g. with openpyxl) → map the dependencies → map
columns to target fields → record the business meaning of each formula as a
rule. Never paste personal data rows into notes. Record the structure only.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — "We use Excel for everything"; several versions of the same sheet; numbers that do not match; one person who "owns" the sheet.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Could you share the sheet, or a screenshot of the column headings?"
- "Who updates it, and how often?"
- "Which reports or decisions come from it?"

**CORE OBJECTS** — workbook · sheet · column · formula · cross-sheet reference · column→field mapping · business rule.

**KEY EVENTS** — `file.received` · `profile.completed` · `mapping.approved` · `import.dry_run` · `import.reconciled`

**WORKFLOWS** — Ryan's PROCEDURE, then the migration path in agent file B6 (checksum → profile → map → dry-run in DEV → reconciliation report → sign-off).

**KPIs** — Duplicate % and blank % in key columns (*Can we trust this data?*), measured during profiling, not invented.

**KEEP/BUY/BUILD** — A sheet with one editor and no automation need can REMAIN. Multi-user editing, history, permissions or automation → BECOME PART OF CRM or MIGRATE TO DB.

**CONTROLS & RISKS** — Original copied read-only with a checksum; notes hold structure only; no import without a reconciliation report and sign-off.

## Fusion EDG Core today
Import path: **NEW BUILD per client** (Data Migration Worker is designed, not built). Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[19_Database_Backend]] · [[01_Sales_CRM]]
