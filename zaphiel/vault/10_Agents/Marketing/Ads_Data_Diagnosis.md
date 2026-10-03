---
type: agent
agent_id: ads-data-diagnosis
registry_key: advertising
status: planned
owner: Ryan
last_reviewed: 2026-10-03
tags: [agent, marketing]
---
# Ads & Data Diagnosis Agent

Part of [[10_Agents/03_Marketing_Growth]] · definitions with [[10_Agents/14_Data_BI_KPI]] · map: [[10_Agents/Marketing/_index]] · ATLAS boundary: [[10_Agents/07_CRM_Architect]]

**Where it stands (2026-10-03):** Step 1a is built (Fusion EDG Core PR #31): the tables, the module switch, the connector contract, the practice Metricool and idempotent saving. Steps 1b–1e come next, each after Ryan's go.

**Job (mostly code, not AI):**
- **Sync.** Atlas's own Metricool API connector runs server-side, every day, re-syncing the last 7 days (28 days once a
  week). Saves are idempotent.
- **Store.** Base metrics per ad per day. Each account keeps its own currency and timezone.
- **Calculate.** A tested metrics engine computes every ratio from summed base metrics.
- **Diagnose.** Versioned rules (`spend_no_results`, `tracking_break`, `cpr_above_target`, `ctr_low`, `cpm_spike`,
  `frequency_high`, `creative_fatigue`, …) run against the targets, with a minimum-data rule.
- **Report.** Findings are de-duplicated. Each campaign gets a status: HEALTHY / WATCH / ACTION REQUIRED / NOT ENOUGH DATA
  YET.
- **AI's part.** The AI only puts the findings into words. A code check rejects any number the AI writes that is not in
  the evidence.

**Never:** changes campaigns or budgets (read only until Ryan has proven the analytics correct; after that, only with
explicit authorised approval).
