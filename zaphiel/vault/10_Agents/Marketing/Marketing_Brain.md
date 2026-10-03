---
type: agent
agent_id: marketing-brain
registry_key: marketing
status: quick-win (read-only subagent); product version planned
owner: Ryan
last_reviewed: 2026-10-03
tags: [agent, marketing]
---
# Marketing Brain

Part of [[10_Agents/03_Marketing_Growth]] · map: [[10_Agents/Marketing/_index]] · numbers per [[10_Agents/14_Data_BI_KPI]] · ATLAS boundary: [[10_Agents/07_CRM_Architect]]

**Where it stands (2026-10-03):**
- **Today:** a Claude Code subagent, `.claude/agents/marketing-brain.md`. It reads Metricool through the MCP and is read
  only: it has no posting, scheduling or boosting tools.
- **Later:** the `marketing` agent inside Atlas (PLAN.md section D).

**Job:**
- Answers "how is our marketing doing?" and writes the weekly summary.
- Links ads to sales outcomes (Phase 2, through `SalesBrainPort`).
- Picks the 3 actions that matter this week.

**Rules:**
- Every number is computed by a script from base metrics: sums first, then ratios. Daily percentages are never averaged.
- Conversions are labelled platform-reported vs CRM-verified.
- Below the minimum data it says NOT ENOUGH DATA YET.
- Findings use the format PROBLEM / EVIDENCE / POSSIBLE CAUSE / ACTION / PRIORITY / CONFIDENCE / STATUS.
- It never posts, schedules, launches ads or changes budgets. Drafts go back to the main session, which asks Ryan first.
- It never invents facts, and never makes health claims for client products without Ryan's review.

**Data it can read through Metricool:** see PLAN.md section K (coverage matrix). Status, budgets, audience breakdowns
and Meta currency are not available (they need a native API connector).

**Targets:** [[60_Skill_Packs/Marketing/targets]].

**Data source (2026-10-03):** FusionTech's own social and ad accounts, connected to Metricool.

**Update (2026-10-03, after Ryan unlinked BioGreen):** Metricool brand `6656122` now holds FusionTech's Instagram `fusiontech.ai`, TikTok `Fusiontech.AI` and Facebook page `1237077816163178`; YouTube was removed. The brand still has its old label `biogreenelixirs`, which Ryan can rename to "FusionTech AI". The first read returned zeros because Metricool fills in the past 30 days overnight after a new connection. No ad account is connected yet. BioGreen Elixirs is a separate business and is not read by this agent (Ryan).
