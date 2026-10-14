---
tags: [zaphiel, skill-pack, marketing, diagnosis]
status: active
version: v4 (2026-10-12)
engine: ceo-brain/agents/marketing/diagnose.js (mk-diagnose-1.0.0)
---
# Ads Diagnosis Playbook

Ads Intelligence uses this every time. The **engine** (`diagnose.js`) applies it in code, and the agent explains the result.
Always keep **OBSERVATION** (the data) separate from **HYPOTHESIS** (a possible cause). Use "may indicate" or "appears
consistent with", and say how to check each hypothesis.

## 1. Find WHERE the funnel breaks (stage by stage)

| Stage | Key metrics (computed from raw data) | Question |
|---|---|---|
| 1 Delivery | spend, impressions, reach, CPM, frequency, delivery / learning status | Is the platform showing the ad at a sane cost? |
| 2 Attention | hook rate = 3-sec video views ÷ impressions; hold rate = ThruPlays (or 15-sec views) ÷ 3-sec views; average watch time | Do people stop scrolling and keep watching? |
| 3 Click | link CTR, CPC, outbound clicks | Does the ad make them want to act? |
| 4 Destination | leads ÷ link clicks, form completion, WhatsApp chats started, first-reply rate | Does the page, form or chat convert the click? |
| 5 Lead | leads, CPL | What does a lead cost? |
| 6 Quality | qualified %, cost per qualified lead, appointment %, show-up % | Are they real buyers? |
| 7 Sale | close rate, CAC, revenue, ROAS | Do leads become money? |

Stages 6–7 need CRM data (from John or Atlas). If the CRM isn't connected, say **"not connected"**. Never guess.
Metrics differ by platform (see [[06_Metrics_Dictionary]]), so a missing metric is "—", never 0.

## 2. Symptom → likely causes → how to verify → action

| Symptom (engine key) | Likely causes (hypotheses) | How to verify | Action button |
|---|---|---|---|
| High CPM / weak delivery (`high_cpm`) | Audience too narrow; season or competition; low relevance; special ad category limits; too many ad sets splitting the budget | Audience size, placements, relevance diagnostics, season | ADJUST BUDGET / consolidate; improve the creative |
| Low hook rate (`low_hook`) | Weak first 1–3 seconds: no pattern interrupt, slow intro, logo first | Compare hooks across ads with the same body | CREATE REPLACEMENT (new hooks on the same body: the cheapest test) |
| Good hook, low hold (`low_hold`) | Slow middle; the promise isn't paid off | Watch at the 15-second mark: is proof or a demo shown yet? | CREATE REPLACEMENT (re-edit: faster pacing, proof earlier) |
| Low CTR with OK hold (`low_ctr`) | Weak offer or CTA; unclear next step | Compare offers and CTAs across ads | NEW TEST (offer / CTA / a true reason to act now) |
| High CTR, low conversion (`destination_leak`) | Slow page, mismatch with the ad, too many fields, broken link, nobody replying; or tracking undercounts | Open the destination on a phone, test the form, check pixel/CAPI events, check WhatsApp reply time | FIX TRACKING / fix destination |
| Cheap leads, low quality (`cheap_low_quality`) | Form too easy; broad intent; misleading hook; optimising for a shallow event | Read 10 recent leads in the CRM | Qualifying questions / higher-intent form; optimise for a deeper event when data allows |
| Good leads, few sales (`slow_follow_up`) | Slow first reply, no second follow-up, weak script, price objection | Response times and follow-up counts per salesperson in the CRM | IMPROVE FOLLOW-UP **before** spending more on ads |
| Creative fatigue (`creative_fatigue`) | Frequency rising + CTR falling + CPM/CPL rising over days | Frequency and CTR by day; newer ads vs older | CREATE REPLACEMENT (new hooks on the winning angle first) |
| Spend with zero leads (`spend_no_leads`) | Broken tracking, form or destination; wrong objective; ad rejected or limited | Ad status, events, destination, right now | PAUSE (approval) |
| Leads stopped, clicks didn't (`tracking_break`) | Pixel, form or WhatsApp link broke; destination changed | Complete the form / chat on a phone; check events | FIX TRACKING |
| Sudden change | Account or policy issue, budget change, learning reset after edits, tracking outage, season | Change history and event logs | Depends on the cause |
| Platform vs CRM mismatch | Attribution windows, duplicates, tracking gaps | Reconcile platform leads against CRM leads | Explain; fix attribution |

## 3. Decisions: KILL / KEEP / SCALE / ITERATE

These are starting heuristics, configurable per company (`MK_DEFAULT_RULES` in the engine, overridden in the brand's
`targets.md`). They are not universal laws.

- **NOT ENOUGH DATA YET:** spend below 1.5 × target CPL and fewer than ~3,000 impressions. Say it plainly and don't judge.
- **KILL (recommend pause):**
  - spend ≥ 2.5 × target CPL with 0 leads; or
  - CPL > 1.75 × target after enough data; or
  - lead quality clearly worse than the other ads.
- **KEEP:** CPL within target × 1.2 and stable.
- **SCALE:** CPL (or CPQL) at or below target on each of the last 3 days, quality OK, frequency under the cap.
  - Increase **+15–25% every 3–4 days**, or duplicate into a new ad set.
  - Avoid big jumps and frequent edits, which can reset the platform's learning phase. Check each platform's current
    guidance first.
- **ITERATE:** a winner that is fatiguing gets new hooks or variations of its angle before it is abandoned. This also
  covers CPL above the band but below kill level, and cheap leads with low quality.
- **FIX TRACKING / IMPROVE FOLLOW-UP:** when the leak is outside the ad.

Every recommendation carries these fields:
- observed metric;
- comparison (target or own history);
- evidence and confidence (HIGH / MEDIUM / LOW);
- likely causes;
- recommended action;
- expected trade-off;
- approval needed? (kill, scale and budget changes: yes);
- verification plan (what to check, and when).

Action buttons: **KEEP RUNNING • PAUSE • CREATE REPLACEMENT • ADJUST BUDGET • FIX TRACKING • IMPROVE FOLLOW-UP • ASK MARKETING AI**.

## 4. Testing framework
- Test one main variable at a time, in this order: **ANGLE → HOOK → FORMAT → OFFER → AUDIENCE**.
- Keep a creative testing matrix (angle × hook × format) with results in the brand's Brand Brain ("Performance memory").
- Each test has a hypothesis, budget, duration, success metric and minimum-data rule.
- Winners and losers are recorded so the team learns per client.

## 5. Benchmarks
Never hard-code "good CTR = X%". Use, in this order:
1. the client's targets (`Brands/<brand>/targets.md`);
2. their own history (previous equal period);
3. later, anonymised Fusion cross-client benchmarks by industry and country, with consent.

Always state which one was used.

## 6. "Where it went wrong" report
Use the template in [[07_Report_Templates]] (section 3). Expected improvements are cautious ranges with their assumptions,
never guarantees.

## v5 additions (2026-10-14)
From Ryan's **Marketing OS v5** (2026-10-14). Additions only; the sections above still apply.

### v5 §8.1 Data validity comes first
Before any verdict, check the data itself. If a check fails, say so and lower the confidence.

| Check | What to look for |
|---|---|
| Freshness | When was the data last synced? Say "data as of …" |
| Date range | Is it the range Ryan asked for? Complete days only, unless he asked for today |
| Currency | One currency per number. No mixing without a stated conversion |
| Timezone | The ad account's timezone (default Asia/Singapore). Say which one |
| Conversion event | Which event is counted as a "lead" or "sale"? Is it the right one? |
| Attribution window | Which window the platform used (for example 7-day click, 1-day view) |
| Completeness | Are all campaigns, platforms and days present? |
| Incomplete current day | Today is never compared with a full day |
| Delayed conversions | Recent days may still gain conversions. Say so |
| Sample size | Enough impressions, clicks, leads? (minimums in [[06_Metrics_Dictionary]]) |
| Recent edits | Any change in the last few days? (change history) |
| Learning status | Is the ad set still learning or "learning limited"? |

**Broken tracking first.** If tracking looks broken (leads stopped but clicks didn't, Pixel or form events missing,
WhatsApp link changed), the diagnosis is **TRACKING**. No creative is called a loser until tracking is fixed and checked.

The funnel stage table (7 stages, metrics, question) is already in section 1 above. Not repeated.

### Extra symptom rows (not already in section 2)
| Symptom | Likely causes (hypotheses) | How to verify | Action |
|---|---|---|---|
| High CPM in a **special ad category** campaign (housing, employment, financial products) | The category removes some targeting (third-party summaries name age, gender, postcode and lookalikes; ⚠️ recheck on developers.facebook.com, 2026-10-14), so delivery is broader and can cost more | Check the campaign's special ad category setting and the targeting it allows | Judge CPM against other campaigns in the same category, not against normal campaigns. Improve the creative; do not try to work around the category |

"Sudden change → change history" and "Platform vs CRM mismatch → reconcile" are already rows in section 2.

### v5 §8.4 KILL / KEEP / SCALE defaults are PROPOSALS
- The thresholds in section 3 are **proposals per brand**, not laws. The brand's `targets.md` can change them.
- **Before pausing anything, check lead quality and sales** in the CRM.
- A **higher CPL with better sales can be the winner.** Judge on cost per qualified lead and on confirmed sales when they exist.
- If the CRM is not connected, say the verdict is based on platform leads only, and lower the confidence.

### v5 §8.5 Diagnosis output fields (every diagnosis)
1. **PROBLEM**: one line.
2. **ACTUAL FIGURES**: the numbers, with labels (PLATFORM-REPORTED / CRM-CONFIRMED).
3. **COMPARISON WINDOW**: which periods are compared, and the target.
4. **EVIDENCE QUALITY**: results of the §8.1 checks.
5. **PLAUSIBLE CAUSES**: hypotheses, each with how to check it.
6. **PREFERRED ACTION**.
7. **ALTERNATIVE** action.
8. **EXPECTED BENEFIT**: a hypothesis, stated as a cautious range with its assumptions.
9. **CONFIDENCE**: HIGH / MEDIUM / LOW.
10. **MINIMUM DATA NEEDED** before the verdict is solid.
11. **POLICY ELIGIBILITY**: is the action allowed by platform policy and the brand's rules?
12. **APPROVAL REQUIREMENT**: who must approve, and the approval code if needed ([[08_Approval_Rules]]).
13. **REVIEW DATE**: when we check again.

Never write "guaranteed winner". Never show a **predicted** ROAS as **measured** revenue.
