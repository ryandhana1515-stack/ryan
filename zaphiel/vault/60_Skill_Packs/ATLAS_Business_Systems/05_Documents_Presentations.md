---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "05"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 05 · Documents & Presentations

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
Word/Google Docs, PowerPoint/Google Slides, PDF, templates, contracts,
quotations, reports, SOPs, company presentations, management reports.
FLOW: CRM data → template → generated quotation/report → PDF → approval →
send → store → link to the customer record.
Rules: versioned templates, numbering rules (quotation/invoice numbers come
from the system of record, never re-used), approval before sending
priced/contractual docs. Slides may be generated for management reporting,
proposals or other approved purposes.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — "Quotes take too long"; copy-paste from old Word files; wrong prices or numbers on documents.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "How do you make a quotation today, and how long does one take?"
- "Who checks it before it goes to the customer?"
- "Where are the sent and signed copies kept?"

**CORE OBJECTS** — template (versioned) · document · number sequence · approval · PDF.

**KEY EVENTS** — `document.generated` · `document.approved` · `document.sent` · `document.signed`

**WORKFLOWS** — Ryan's FLOW.

**KPIs** — Time from request to quote sent (*Are quotes slowing our sales?*).

**KEEP/BUY/BUILD** — Quotations and invoices from the EDG/accounting system. Other documents: Google Docs/Slides or Microsoft templates via their APIs (verify current docs). Proposal tools only if the client already uses one.

**CONTROLS & RISKS** — Ryan's rules. Priced or contractual documents are approved by a person.

## Fusion EDG Core today
Quotations (approved price list only, one-click approve & send) and gap-free invoice numbers: **TESTED**. Other generated documents and slides: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[01_Sales_CRM]] · [[08_Accounting_Finance]] · [[23_E_Signature]] · [[18_File_Document_Storage]]
