---
tags: [zaphiel, skill-pack, marketing, reports]
status: active
version: v4 (2026-10-12)
---
# Report Templates

## 1. Daily 60-second summary (W2)
```
<Brand> — data as of <date time> (<source>) [DEMO if demo]
Yesterday: spend <x> · leads <n> (PLATFORM-REPORTED) · CPL <x> vs target <y> · qualified <n> (CRM-CONFIRMED / not connected)
✅ Working: <ad/angle> — <why, one line>
⚠️ Needs attention: <ad> — <observation> → <action button>
❓ Decisions for you: <KILL/SCALE/budget change needing approval, one line each>
```

## 2. Weekly / monthly CEO report
1. **Headline** (2 sentences): the main result and the one thing to do next.
2. **Numbers vs target and the previous period:** spend, leads, qualified leads, appointments, sales, revenue, CPL,
   CPQL, CAC, ROAS (with labels and "data as of").
3. **By platform:** Facebook / Instagram / TikTok / YouTube ("not connected" where applicable).
4. **Winners and losers:** creatives and angles, with evidence.
5. **Risks:** tracking, fatigue, budget pacing, policy.
6. **Next actions:** who, what, when, and whether approval is needed.

## 3. "WHERE IT WENT WRONG" client diagnosis report (W4)
1. **Summary:** one paragraph in plain English.
2. **Funnel scorecard:** stages 1–7 with 🟢🟡🔴⚪ and the key number vs target (⚪ = not connected / no data).
3. **Top 3 money leaks:** each with its evidence (observation), likely cause (hypothesis) and how to verify.
4. **What's working:** keep / scale.
5. **14-day fix plan:** who / what / when / approval needed.
6. **How we'll confirm the fix:** the metric, the threshold and the date to check.
7. **Data gaps / not connected.**

Expected improvements are cautious ranges with assumptions, never guarantees.

## v5 additions (2026-10-14)
From Ryan's **Marketing OS v5** (2026-10-14). Additions only; section 1 above stays as the short format until code uses this one.

### Daily report (v5): about a 60-second read
Sent at the **owner-chosen time (SGT)**.
```
<Brand> daily — <date> (SGT) · data as of <time> · <sources>
SPEND: Meta <x> · TikTok <x> · Google <x> · TOTAL <x> (<currency>)
LEADS <n> (PLATFORM) · QUALIFIED <n> (CRM / not connected) · SALES <n> / REVENUE <x> (CRM-CONFIRMED)
CPL <x> vs target <y> · CPQL <x> vs <y> · ROAS <x> vs <y> (or "unavailable")
CAMPAIGNS: 🟢 <name> <one line> · 🟡 <name> <one line> · 🔴 <name> <one line>
ACTIONS TAKEN (verified by read-back): <action, time, result> / none
PENDING APPROVALS: <action> → APPROVE <code>
TRACKING / DATA GAPS: <gap> / none
NEXT TEST: <the ONE next test, one line>
TOOL / GENERATION COST: <tool> <amount> (separate from media spend)
```

### Weekly report (v5)
1. Experiments run + what we learned.
2. Creative winners and losers (with evidence and sample size).
3. Competitor observations (RESEARCH label, source and date).
4. Funnel bottlenecks (stage 1–7, [[02_Diagnosis_Playbook]]).
5. Budget recommendation (needs approval if it changes spend).
6. Next week's plan.

### Monthly report (v5)
1. Trends over the month (vs previous month).
2. CAC and ROAS by channel (CRM-confirmed; platform-attributed shown separately).
3. Brand learnings → written to the Brand Brain "Learning memory".

### Delivery and schedules
- Delivered to the **dashboard / chat first**. Email or WhatsApp only once that channel is configured and tested.
- A schedule counts as **"active" only when it is deployed, tested, enabled and shows a last-run time**. Before that it is
  "planned" or "coded".

### PREVIEW CARD (phone-friendly, sent before approval)
```
📋 PREVIEW — <order_id>
Brand: <brand> · Platform: <platforms>
Objective: <objective> → <destination>
Audience: <gender>, <age>, <location>
Budget: <total daily> <currency> TOTAL · <n> campaign / <n> ad set / <n> ads
Angles: 1) … 2) … 3) … 4) … 5) …
Target: CPL <x> (target, not a promise)
Honest maths: <e.g. ~3 leads/day at best; learning days cost more>
Review: day <n> · keep best 1–2 angles
Assumptions: <short list>
Questions: <max 3>
Reply: APPROVE <code> · REJECT · REQUEST CHANGES
```

### APPROVAL CARD (any spend or live change)
```
✅ APPROVAL NEEDED — code <code>
REQUESTED ACTION: <pause / launch / budget change / publish>
CAMPAIGN: <name>
ACCOUNT: <platform + account id, last 4 only>
CURRENT vs PROPOSED BUDGET: <x> → <y> <currency>/day
REASON: <one line, with the key figure>
EXPECTED BENEFIT: <hypothesis, cautious range>
RISKS: <one or two lines>
STATUS: PENDING
→ APPROVE <code> · REJECT · REQUEST CHANGES
```
Only the exact reply `APPROVE <code>` (or the dashboard button) approves. Each code works once, for this card only.

## v7 addition (2026-10-15): every report starts with the money view
Line 1 of every daily/weekly/monthly report and every APEX answer is the CEO money view ([[15_CEO_Money_View]],
`mkMoneyView`), then one GREEN/AMBER/RED status line and one recommended action with its approval code.
