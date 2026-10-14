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

## v5 additions (2026-10-14)
From Ryan's **Marketing OS v5** (2026-10-14). Only what was missing above.

### Metrics added or clarified
| Metric | Formula | Notes |
|---|---|---|
| CTR (all) | Σ all clicks ÷ Σ impressions | Includes likes, profile and "see more" clicks. **Link CTR** (above) is the one for judging ads. Always say which |
| CPL | Σ spend ÷ Σ leads | Already above; v5 confirms |
| Cost per qualified lead (CPQL) | Σ spend ÷ Σ qualified leads | Already above; qualified = CRM-CONFIRMED |
| **CPA (named event)** | Σ spend ÷ Σ count of **one named event** | Always name the event: "CPA (booked appointment)", "CPA (purchase)". Never "CPA" alone |
| ROAS | Σ revenue ÷ Σ spend | Already above. Platform-attributed ROAS and CRM-confirmed ROAS are shown **separately** |

### Rules added
- **Zero denominator → "unavailable".** Shown as "—" with the word "unavailable" in text. Never infinity, never a fake 0.
- **A CTA is not a metric.** "Book now" is a button, not a number.
- **A Pixel event is not proof of a sale.** A sale is CRM-CONFIRMED (or confirmed by the shop/payment system).
- **Blended ratios** across ads, days or channels use **summed numerators ÷ summed denominators**. Never average ratios.
- **Never add reach across channels** (or across days). The same person can be reached on Facebook and TikTok. Say
  "reach per channel" instead.
- **Never double-count Meta spend.** Facebook and Instagram placements share one Meta campaign; the platform split is a
  breakdown of one total, not two spends.
- **Platform-attributed vs CRM-confirmed** are always two separate columns.
- **Refunds, cancellations, duplicates and late updates:** revenue is net of refunds and cancellations once known; duplicate
  leads are removed (and the count of removed duplicates shown); late updates create a new **correction version** of the
  report.
- **Costs kept separate:** media spend (ad platforms) • software fees (subscriptions) • generation costs (credits for
  video/image/voice). Never mixed into one "cost" without the breakdown. Third-party costs are separate from FusionTech fees.

### Metadata on every metric
`source` · `timezone` · `currency` · `period` · `retrieval time` · `attribution window` · `conversion event` ·
`correction version`. A metric missing its metadata is not reported.
