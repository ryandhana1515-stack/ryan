---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "23"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 23 · E-Signature

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
FLOW: CRM → agreement → document generation → signature request → signed
document → store → CRM status updated → next workflow. Use supported
e-signature platforms. Legal enforceability questions go to a lawyer.
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Contracts signed on paper or by "OK" in chat; signed copies hard to find.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- "Do customers sign agreements or quotations, and how today?"
- "Where are signed copies kept?"

**CORE OBJECTS** — agreement · signature request · signed document · audit trail.

**KEY EVENTS** — `signature.requested` · `signature.completed` · `signature.declined`

**WORKFLOWS** — See Ryan's FLOW.

**KPIs** — Time to signature (*Are deals stuck at signing?*).

**KEEP/BUY/BUILD** — A supported e-signature platform; never custom.

**CONTROLS & RISKS** — Ryan's rule: enforceability questions go to a lawyer.

## Fusion EDG Core today
E-signature: **NEW BUILD** (integration). Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[05_Documents_Presentations]] · [[01_Sales_CRM]]
