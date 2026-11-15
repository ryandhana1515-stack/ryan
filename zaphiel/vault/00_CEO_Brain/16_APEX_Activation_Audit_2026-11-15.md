---
tags: [zaphiel, apex, audit]
date: 2026-11-15
---
# APEX activation audit: 15 Nov 2026 (Brow Revolution pilot)

Evidence was read live, read-only. Sources: the staging database, Vercel, and Omneky (brand 42271, Ryan's account). Metricool was also checked.

## Blockers found
1. **The platform is offline.** Vercel answers every request with `402 Payment required: DEPLOYMENT_DISABLED`. The project is on the Hobby (free) plan.
   - The database timer calls `/cron/tick` every minute, which is 43,200 calls a month.
   - Suspected cause (not proven): Hobby usage limits.
   - The last APEX read was **6 Nov 23:38 UTC**, so nothing has been monitored since.
2. **Launch readiness bug (fixed in fusion-edg-core PR #87).** Omneky changed the shape of its campaign list. The readiness check saw 0 campaigns and showed "launch blocked: ad account not chosen".
   - Omneky's own preflight passes: channel connected, login, ad account access and page all pass.
3. **Omneky's minimum budget:** SGD 51.36/day for a new Meta leads campaign. A S$30/day leads campaign would be refused.
4. **WhatsApp results are not visible to Omneky.** It counted 0 WhatsApp conversations in 30 days.
   - The CRM has 0 real enquiries, because WhatsApp and Respond.io are not linked.
5. **Content tools:** the HeyGen, Higgsfield and Kling sign-ins were started on 5 Nov but never finished (they expired).
   - Generation through those apps is not built; only Omneky generates.
6. **Metricool:** the BROWREVOLUTION brand has no social accounts connected.

## Real data (Omneky, 16 Oct – 14 Nov 2026)
- Spend S$1,598.20 · 67,140 views · 1,914 clicks · CTR 2.85% · CPC S$0.84 · CPM S$23.80.
- 2 leads counted · 0 WhatsApp conversations counted.
- Live campaigns:
  - "BR - Master Selina Fem - WhatsApp - 2": S$30/day, running since 25 Sep.
  - "Chiến dịch Lượt tương tác mới" (an engagement campaign, not leads): S$30/day, running since 2 Nov.
  - Together that is S$60/day.
- Not provided by Omneky here: reach, frequency, revenue, ROAS, conversions.
