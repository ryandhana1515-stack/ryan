---
type: industry-pack
pack: Singapore_Property
section: 8
source: ".claude/agents/fusion-property-sg.md §8 (Ryan, 2026-09-30, verbatim)"
tags: [industry-pack, property, singapore, fusion-property-ai, compliance]
---
# 04 · Renovation compliance matrix

Part of [[70_Industry_Packs/Singapore_Property/00_Index]]. Governed by [[10_Agents/15_Security_Governance_QA]]. The rules behind
each cell are in [[70_Industry_Packs/Singapore_Property/03_Regulation_Register]].

Keep **design possibility** separate from **regulatory or engineering approval**. An attractive AI visualisation does
NOT prove that the construction is permitted.

## Labels
| Label | Meaning |
|---|---|
| **GREEN** | Likely cosmetic or non-structural; applicable rules still apply. |
| **AMBER** | A permit, MCST approval, a licensed trade (LEW, plumber, gas), or a structural or professional review may be required. |
| **RED** | Potentially prohibited or structurally sensitive; not suitable to recommend without verification by a professional or the authority. |

## Baseline matrix
Verify the details. The label is guidance, not approval.

| Change | HDB | Condo | Landed |
|---|---|---|---|
| Paint, loose furniture, decor, soft furnishings | GREEN | GREEN | GREEN |
| Built-in carpentry (not fixed to structure) | GREEN | GREEN (by-laws) | GREEN |
| New floor finish over existing | AMBER (permit/rules) | AMBER (MCST) | GREEN/AMBER |
| Hacking a non-structural wall | AMBER (HDB permit) | AMBER (MCST + possibly BCA/PE) | AMBER |
| Hacking a structural wall/column/beam | RED | RED | RED (QP/PE + approvals) |
| Altering the household shelter (walls, door, hacking, drilling) | RED | RED | RED |
| Moving kitchen/bathroom (wet areas) | AMBER–RED | AMBER–RED | AMBER |
| Electrical rewiring / new points | AMBER (LEW) | AMBER (LEW) | AMBER (LEW) |
| Plumbing / sanitary changes | AMBER (licensed plumber) | AMBER | AMBER |
| Window replacement | AMBER (BCA approved contractor) | AMBER (+ facade rules) | AMBER |
| Enclosing a balcony / changing the facade | RED (verify) | AMBER–RED (approved designs + MCST) | AMBER (URA) |
| Extensions, extra storey, attic, basement, pool | n/a (RED) | RED | AMBER (URA PP + BCA via QP) |
| Using common property / corridor | RED | RED | n/a |

## Wording on every concept
- Never tell a customer "This renovation is approved."
- Always state: **"Concept visualisation. Final feasibility and required approvals must be verified with the relevant
  authority, property management and/or qualified professional."**

## How the engine applies it
- Every PROPOSED RENOVATION on the geometry model (agent §3) gets one `ComplianceFlag` per change:
  - the change;
  - the property type;
  - the label;
  - the register rows it relies on;
  - the wording above.
  See [[90_Products/Fusion_Property_AI/Data_Model]].
- Checkpoint 3 (agent §21): the flag is shown to the user before any render of a structural or layout change.
- When a rule the label relies on is marked NEEDS VERIFICATION in the register, the label is raised one step
  (GREEN → AMBER, AMBER → RED), until the rule is verified. (Zaphiel's addition, on the cautious side. It is not
  in the agent file.)
