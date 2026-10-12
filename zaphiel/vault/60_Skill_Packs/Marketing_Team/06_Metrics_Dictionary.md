---
tags: [zaphiel, skill-pack, marketing, metrics, kpi]
status: active
version: v4 (2026-10-12)
engine: ceo-brain/agents/marketing/diagnose.js (mkMetrics)
platform: fusion-edg-core/docs/marketing/PLAN.md section L (same definitions)
---
# Metrics Dictionary

**Store raw daily base metrics, then compute every ratio from the summed totals of the period. Never average daily
ratios.** Dividing by 0, or a missing input, gives **"—"**, never 0.

| Metric | Formula | Stage | Better | Minimum data before judging |
|---|---|---|---|---|
| Spend | Σ spend (one currency at a time; no FX mixing) | 1 | — | — |
| CPM | Σ spend ÷ Σ impressions × 1,000 | 1 | lower | ≥ 2,000 impressions |
| Frequency | Σ impressions ÷ period reach (true period reach only, never summed daily reach) | 1 | lower | where period reach exists |
| Hook rate | Σ 3-second video views ÷ Σ impressions | 2 | higher | ≥ 1,000 impressions |
| Hold rate | Σ ThruPlays (or 15-second views) ÷ Σ 3-second views | 2 | higher | ≥ 300 3-second views |
| Link CTR | Σ link clicks ÷ Σ impressions | 3 | higher | ≥ 1,000 impressions |
| CPC | Σ spend ÷ Σ link clicks | 3 | lower | ≥ 30 clicks |
| Destination conversion | Σ leads ÷ Σ link clicks | 4 | higher | ≥ 50 link clicks |
| CPL | Σ spend ÷ Σ leads | 5 | lower | ≥ 10 leads or spend ≥ 3 × target CPL |
| Qualified rate | Σ qualified ÷ Σ leads (CRM-CONFIRMED) | 6 | higher | ≥ 10 leads |
| CPQL | Σ spend ÷ Σ qualified leads | 6 | lower | ≥ 5 qualified |
| Appointment rate | Σ appointments ÷ Σ qualified | 6 | higher | — |
| Close rate | Σ sales ÷ Σ qualified | 7 | higher | ≥ 5 qualified |
| CAC | Σ spend ÷ Σ new customers | 7 | lower | ≥ 3 customers |
| ROAS | Σ revenue (CRM-linked only) ÷ Σ spend | 7 | higher | revenue linked in the CRM |

## Labels (every conversion number carries one)
- **PLATFORM-REPORTED:** leads, results and conversions as counted by Meta, TikTok or Google.
- **CRM-CONFIRMED:** leads matched in the Atlas CRM; qualified, appointments and sales as set by people. Revenue and ROAS
  come **only** from linked CRM sales data.

## Every number states
- its period (Today / Yesterday / Last 3, 7, 30 days / custom; complete days in the brand's timezone);
- its comparison (the prior equal period and the target);
- its source + last sync time ("data as of");
- its currency;
- the attribution window (when the platform supplies one);
- **"Not connected" / "Data unavailable"** when missing. Never an invented number.

## Metricool specifics
Metricool covers reporting only, for what its current API and plan expose:
- ratio fields that are formulas are never used;
- followers are LAST values (never summed);
- `null` = no data;
- it syncs about once a day, so windows end yesterday.

Metricool cannot pause or create campaigns unless the vendor confirms otherwise ([[01_Tool_Library]]).
