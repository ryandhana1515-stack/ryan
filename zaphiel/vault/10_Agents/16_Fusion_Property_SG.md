---
type: agent
agent_id: fusion-property-sg
name: Fusion Property AI — Singapore Property Master Agent
version: 1.0
status: installed
owner: Ryan
last_reviewed: 2026-09-30
runs_as: Claude Code subagent `.claude/agents/fusion-property-sg.md` (repo root)
aliases: [Fusion Property AI, fusion-property-sg, Singapore Property Master Agent]
tags: [agent, specialist, property, singapore, fusion-property-ai]
---
# 16 · Fusion Property AI — Singapore Property Master Agent

> A separate specialist, only for Singapore residential property (Ryan, 2026-09-30). ONE FLOOR PLAN → TEN POSSIBLE
> HOMES. Also the template for the future Asia country packs.

**The agent file is the source of truth:** `.claude/agents/fusion-property-sg.md`. It is Ryan's text, verbatim: do
not paraphrase it here; change it only with Ryan's diff approval. This note is its node in the graph.

## Modes
| Mode | For | Start it with |
|---|---|---|
| FLOOR-PLAN | one plan → geometry → validation → 10 designs → renders / 3D | `Use the fusion-property-sg agent in FLOOR-PLAN mode. Plan: <file path or URL>. Property: <type if known>. Output to 80_Clients/_Test/property/<id>/.` |
| LISTING | agent listing page + ad asset pack + copy, CEA-compliant | `Use the fusion-property-sg agent in LISTING mode. Agent: <name, CEA reg no, phone>. Listing: <address/type>. Real photos: <links>. Owner consent: <yes/how>.` |
| DEVELOPER | new-launch website, site plan, unit-mix explorer, virtual show flat, cinematic scroll | `Use the fusion-property-sg agent in DEVELOPER mode. Project: <name>. Developer: <name>. Materials: <brochure / links>.` |
| PLATFORM BUILD | design and code the Fusion Property AI product | `Use the fusion-property-sg agent in PLATFORM BUILD mode. Build: <Phase 1 step>. Read 90_Products/Fusion_Property_AI/ first.` |
| KNOWLEDGE | answer Singapore property questions; refresh the register | `Use the fusion-property-sg agent in KNOWLEDGE mode. Question: <…>` or `…KNOWLEDGE mode. Refresh the Regulation Register.` |

## Knowledge and product
- Pack: [[70_Industry_Packs/Singapore_Property/00_Index]]. It includes the register
  ([[70_Industry_Packs/Singapore_Property/03_Regulation_Register]]), the compliance matrix and the marketing rules.
- Product: [[90_Products/Fusion_Property_AI/Architecture]], [[90_Products/Fusion_Property_AI/Roadmap]],
  [[90_Products/Fusion_Property_AI/Data_Model]], [[90_Products/Fusion_Property_AI/Test_Dataset_Plan]].

## Works with
| Agent | For |
|---|---|
| [[cinematic-website]] | DEVELOPER and LISTING websites: the site kit's PROPERTY journey and the scene film |
| [[10_Agents/05a_Website_Intelligence]] | research and conversion strategy before a property website |
| [[10_Agents/07_CRM_Architect\|07_ATLAS_EDG_CRM_Architect]] (ATLAS) | lead capture → CRM, WhatsApp, n8n workflows (Phase 4) |
| [[10_Agents/03_Marketing_Growth]] | ad asset packs, social publishing, the PDPA/DNC rules |
| [[10_Agents/04_Creative_Studio]] | photoreal renders, video, Kling/Higgsfield (approval before credits) |
| [[10_Agents/15_Security_Governance_QA]] | release gate, CEA/AI-label checklist, PDPA, permission matrix |

## Checkpoints (stop and ask)
1. Geometry below the confidence threshold.
2. Before spending credits on a bulk generation (show the count and the estimated cost).
3. Any proposed structural or layout change (show the compliance flag).
4. Before marketing goes public (the CEA/AI-label checklist and the agent's confirmation).
5. Before a production deploy (Ryan approves).

## Not wired to John yet
- John and the n8n Website Builder do not route to this agent today.
- Property websites from John still go through the Website Build Worker's PROPERTY journey ([[cinematic-website]]).
- It runs in Claude Code only.
- Wiring it in (for example, John handing a floor plan to FLOOR-PLAN mode) is an open loop.
