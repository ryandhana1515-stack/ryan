---
tags: [zaphiel, moc, agents, marketing]
status: draft
last_reviewed: 2026-10-03
---
# Marketing & Branding Intelligence — the three agents

Ryan's "FUSION AI — MARKETING & BRANDING INTELLIGENCE SYSTEM (v2)" (2026-10-03). Marketing is a **module inside Atlas**
([[00_CEO_Brain/07_Atlas_Platform_v4]]). It is not a separate app. The full plan is `fusion-edg-core/docs/marketing/PLAN.md`
(PR #30), and it is **waiting for Ryan's approval**.

**Golden rule:** NUMBERS COME FROM CODE, WORDS COME FROM AI.

| Agent | Note | Atlas registry key | Head agent it belongs to | Running today |
|---|---|---|---|---|
| Marketing Brain | [[10_Agents/Marketing/Marketing_Brain]] | `marketing` | [[10_Agents/03_Marketing_Growth]] | Quick win: Claude Code subagent `.claude/agents/marketing-brain.md` (Metricool read-only) |
| Ads & Data Diagnosis Agent | [[10_Agents/Marketing/Ads_Data_Diagnosis]] | `advertising` | [[10_Agents/03_Marketing_Growth]] + [[10_Agents/14_Data_BI_KPI]] (metric definitions) | Planned (Phase 1, steps 1a–1e) |
| Creative & Branding Agent | [[10_Agents/Marketing/Creative_Branding]] | `branding` | [[10_Agents/04_Creative_Studio]] | Planned (Phase 3) |

Boundaries:
- **John / Sales Brain** ([[10_Agents/02_Sales_CRM]]) is not rebuilt. Marketing reads sales outcomes through a read-only
  `SalesBrainPort`. WON/LOST stay human decisions.
- **ATLAS** ([[10_Agents/07_CRM_Architect]]) brings marketing data into the CRM (lead sources, attribution fields). Campaign
  strategy and creative are Marketing's job (boundary recorded 2026-10-01).
- Metric definitions live with [[10_Agents/14_Data_BI_KPI]] (KPI Dictionary). The marketing metric dictionary is PLAN.md
  section L.

Targets: [[60_Skill_Packs/Marketing/targets]] (waiting for Ryan's numbers).

## v4 team (2026-10-12): 1 manager + 3 specialists
Ryan's "FUSION AI COMPLETE AI MARKETING TEAM (v4)" replaces the earlier marketing prompts. The knowledge pack is
[[60_Skill_Packs/Marketing_Team/00_Index]].

| v4 role | Claude Code subagent | Note | Was |
|---|---|---|---|
| Marketing Director (entry point) | `marketing-director` | [[10_Agents/Marketing/Marketing_Director]] | Marketing Brain (quick win) |
| Ads Intelligence & Diagnosis | `ads-intelligence` | [[10_Agents/Marketing/Ads_Data_Diagnosis]] | `marketing-brain` subagent (its Metricool rules moved here) |
| Market Research & Competitor Intelligence | `market-research` | [[10_Agents/Marketing/Market_Research]] | new |
| Creative Brain (was Creative Producer) | `creative-brain` | [[10_Agents/Marketing/Creative_Branding]] | Creative & Branding Agent |

The Execution layer is code (Fusion EDG Core), never an AI agent. [[10_Agents/07_CRM_Architect|ATLAS]] stays the business
operations manager, and [[10_Agents/02_Sales_CRM|John]] stays the customer-facing sales agent.

Merge done (Ryan's Marketing OS v5 rule "one agent per role", 2026-10-14): `.claude/agents/marketing-brain.md` retired
(its rules live in `ads-intelligence` and `marketing-director`); `creative-producer.md` renamed `creative-brain.md`.
"Marketing Brain" = Marketing Director; "Creative Brain" = Creative Producer.
