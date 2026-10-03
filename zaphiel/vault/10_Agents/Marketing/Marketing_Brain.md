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

**First live read (2026-10-03):** the BioGreen Elixirs brand returned 0 or empty Instagram values for 26 Sep – 2 Oct, and
it has no ad accounts connected in Metricool. Either the account is new or quiet, or Metricool is not syncing it. Ryan
should check this.
