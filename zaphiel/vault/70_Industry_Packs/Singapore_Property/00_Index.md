---
type: industry-pack
pack: Singapore_Property
country: SG
currency: SGD
units: [sqm, sqft]
agent: fusion-property-sg
tags: [industry-pack, property, singapore, fusion-property-ai, moc]
---
# Singapore Property: industry pack index

- **Agent:** [[10_Agents/16_Fusion_Property_SG]] (Claude Code subagent `.claude/agents/fusion-property-sg.md`, Ryan's
  text, verbatim).
- **Rule:** stored facts are a starting point. Anything customer-facing is checked against the register first
  (last verified ≤ 90 days, status VERIFIED).
- **Never** apply these rules to another country: a new country gets its own `70_Industry_Packs/<Country>_Property/`
  with this same structure (agent §19).

| # | Note | Agent section |
|---|---|---|
| 01 | [[70_Industry_Packs/Singapore_Property/01_Property_Types]] | §5 |
| 02 | [[70_Industry_Packs/Singapore_Property/02_Authority_Map]] | §6 |
| 03 | [[70_Industry_Packs/Singapore_Property/03_Regulation_Register]] | §7 |
| 04 | [[70_Industry_Packs/Singapore_Property/04_Renovation_Compliance_Matrix]] | §8 |
| 05 | [[70_Industry_Packs/Singapore_Property/05_Marketing_Advertising_Rules]] | §13 |
| 06 | [[70_Industry_Packs/Singapore_Property/06_Design_Systems]] | §9–10 |
| 07 | [[70_Industry_Packs/Singapore_Property/07_Geometry_Model_Schema]] | §3–4 |

## Product
- [[90_Products/Fusion_Property_AI/Architecture]] (§15–16)
- [[90_Products/Fusion_Property_AI/Roadmap]] (§17, §19, §21)
- [[90_Products/Fusion_Property_AI/Data_Model]] (§15, plus the fields from §3, §10, §11, §13 and §20)
- [[90_Products/Fusion_Property_AI/Test_Dataset_Plan]] (Phase 0)

## Linked agents
- [[cinematic-website]]
- [[10_Agents/05a_Website_Intelligence]]
- [[10_Agents/07_CRM_Architect|07_ATLAS_EDG_CRM_Architect]]
- [[10_Agents/03_Marketing_Growth]]
- [[10_Agents/04_Creative_Studio]]
- [[10_Agents/15_Security_Governance_QA]]

## Job outputs
- Each job writes to `80_Clients/<client-or-project>/property/<property-id>/`: files 01–09, as listed in
  [[90_Products/Fusion_Property_AI/Data_Model#Output files per job (agent §20)]].
- Test runs go under `80_Clients/_Test/`.
