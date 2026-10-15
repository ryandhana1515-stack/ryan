---
tags: [zaphiel, marketing, test, v7]
date: 2026-10-15
---
# APEX v7 — T1–T6 re-run with APEX (plus the v7 additions)

Automated tests: `ceo-brain` **172/172 pass** (§38 diagnosis, §40 permissions, §41 Ad Actions, §42 orders/approvals,
§43 money view + budget calculator). Nothing launched, posted, generated or paid for.

| Test | Result (2026-10-15) |
|---|---|
| **T1** "How are my ads?" | Real check: Metricool BROWREVOLUTION still has **no networks connected**; FusionTech.AI pages connected, no ad account. APEX's answer starts with the money view: "No ad account is linked yet, so there is no spend to report." |
| **T2** 5 DEMO scenarios | creative_fatigue: ITERATE (HIGH); broken_tracking: FIX TRACKING (HIGH); cheap_low_quality: ITERATE (HIGH); slow_follow_up: KEEP + IMPROVE FOLLOW-UP (HIGH); winner_scale: SCALE (HIGH) — 5/5 correct |
| **T3** competitor scan | carried from 2026-10-14 ([[T3_Competitor_Scan]]); refresh at pilot step 3 |
| **T4** voice → preview card | unchanged and passing ([[T1_T2_T4_T6]]); budget line now backed by the calculator below |
| **T5** creative brief | carried from 2026-10-14 ([[T5_Creative_Brief]]) |
| **T6** where it went wrong | unchanged ([[T1_T2_T4_T6]]); now opens with the money view below |

## v7 additions, live output from the code
**CEO money view (DEMO account, CRM connected):**
> Over these 7 days (DEMO) you spent S$1,850 on ads → you got 168 leads (49 qualified) → 7 sales → S$2,716 revenue. Return on ad spend 1.47x. (Profit needs your gross margin.)

Status: **GREEN** (CPL 11.01 vs target 15).

**Money view when sales are not connected (example):**
> Today you spent S$42.5 on ads → 3 leads (PLATFORM-REPORTED). Sales not connected yet, so revenue and return are not shown.

Status: **RED** (CPL 14.17 vs target 10).

**"How much budget do I need to get 60 leads a month?"**
> For about 60 leads a month, plan S$600–S$900 a month (about S$20–S$30 a day), based on your target cost per lead (S$10), not yet proven by real data. This is a range, not a promise: the first weeks usually cost more while the platform learns.

**Test budget for 5 angles on S$30/day:**
> 5 variants × 2× S$10 = S$100 minimum over about 5 days ≈ S$20/day. S$30/day covers it: 1 campaign, 1 ad set, 5 ads for about 5 days, then keep the 1–2 best.

**Same test on S$15/day:**
> 5 variants × 2× S$10 = S$100 minimum over about 4 days ≈ S$25/day. S$15/day cannot test 5 variants properly in 4 days (needs about S$25/day). Test 3 variants instead, or run 7 days.

Note: the DEMO account shows GREEN on cost per lead while lead quality is weak (29% qualified). Once sales are
connected, a ROAS target makes the status judge money, not cheap leads; set one per brand.
