---
tags: [zaphiel, skill-pack, marketing]
status: active
version: v5 (2026-10-14)
engine: ceo-brain/agents/marketing/campaign-order.js (being written; does the numbers below)
verified: 2026-10-14, from web search results (platform pages could not be opened directly in this session)
---
# Budget & Structure Rules

Serves Ryan's **Marketing OS v5** (2026-10-14). How a budget turns into a campaign structure, how we test, and how we
name and track everything. Formats and objectives: [[09_Ad_Formats]]. Kill/keep/scale: [[02_Diagnosis_Playbook]].
Approvals: [[08_Approval_Rules]].

**Numbers come from code.** The budget maths, the structure choice and the warnings are computed by
`ceo-brain/agents/marketing/campaign-order.js` (being written). Agents explain its result. They never do the arithmetic in
their head.

## 1. The budget is the TOTAL
- The owner's budget is the **total across all ads and all platforms**, unless he explicitly says otherwise.
- "S$30 a day" means S$30 a day **in total**. It never means S$30 per platform, per ad set or per ad.
- If he names two platforms and one budget, we split that one budget. We say the split in the preview card.
- If we are unsure, we use the total and list it as an assumption. We do not ask, unless the answer changes the plan.

## 2. Small budgets consolidate
- **One campaign, one ad set (or ad group), 3–5 ads.**
- Never split S$30/day into 5 ad sets of S$6. Each ad set would get too few results for the platform to learn.
- One platform first when the budget is small. Add a second platform only when the first has a proven angle.
- Meta: either an ad-set budget on the single ad set, or an Advantage campaign budget. With only one ad set they behave
  the same.

## 3. Check the platform's minimum budget first
| Platform | Known minimum | Check | Source (seen 2026-10-14) |
|---|---|---|---|
| **TikTok** | Daily budget: **campaign ≥ $50**, **ad group ≥ $20**. Lifetime: campaign > $50; ad group = $20 × scheduled days (31 days → $620). The campaign budget should not be lower than the ad group budget. Budget type cannot be switched after launch | ✅ amounts in USD as written on the help page; **SGD equivalent: recheck in the account** | ads.tiktok.com/help/article/budget · ads.tiktok.com/help/article/about-daily-budgets |
| **Meta** | **No single minimum.** It depends on objective, optimisation, bid strategy, budget type, currency and schedule. Third parties report about US$1/day for impression-optimised and about US$5/day for click/conversion-optimised ad sets. With a cost-per-result goal, guides say the daily budget should be ≥ 5 × the goal | ⚠️ third-party; **recheck**: type the budget into Ads Manager, which warns if it is too low | relevantaudience.com/facebook-ads/facebook-ads-cost-how-meta-charges · tryvizup.com (Meta minimum budget 2026) |
| **Google / YouTube** | Not confirmed | ❓ recheck | — |

What it means for small budgets:
- **TikTok with S$30/day total:** a campaign budget is too small (US$50 minimum). Use **one ad group** with an ad-group
  budget, and check the ad group minimum (US$20) in SGD on the day.
- **Meta with S$30/day:** fine for one ad set. A cost-per-result bid cap of S$10 would need about S$50/day by the 5×
  guideline, so use the default "highest volume" bidding at this budget (recheck).

## 4. Testing order and test rules
Order: **ANGLE → HOOK → FORMAT → OFFER → AUDIENCE**. One main variable at a time ([[02_Diagnosis_Playbook]] section 4).

Every test has five fields:
| Field | Example |
|---|---|
| Hypothesis | "The 'time saved every morning' angle gets cheaper WhatsApp chats than the 'natural look' angle." |
| Budget | S$30/day total, shared by the 5 ads |
| Duration | 5–7 days |
| Success metric | Cost per WhatsApp chat started, then cost per qualified lead (CRM-confirmed) |
| Minimum-data rule | No verdict on an ad until it has spent ≥ 1.5 × target CPL and ~3,000 impressions (engine defaults) |

## 5. Learning phase and scaling
- Avoid frequent edits. Group planned changes and make them at once.
- Avoid big budget jumps. Third-party guides say a change of about 20% or more can restart Meta's learning, and that
  Meta wants about 50 optimisation events in 7 days to leave learning (⚠️ third-party: gomarble.ai, lseo.com, 2026-10-14;
  recheck Meta's help page).
- Scale gradually: **+15–25% every few days** (our engine: 3–4 days, max 20%/day under autopilot), **or duplicate** the
  winner into a new ad set.
- TikTok learning thresholds differ between guides (about 25–50 results). ❓ recheck TikTok's own page.

## 6. Naming
`BRAND_PLATFORM_OBJECTIVE_ANGLE_YYYYMMDD`, in capitals, words joined with hyphens inside a part.
- Campaign: `BROWREV_META_LEADS_MULTI-ANGLE_20261014`
- Ad set / ad group: `BROWREV_META_LEADS_SG-F25-45_20261014`
- Ad: `BROWREV_META_LEADS_TIME-SAVED_20261014_V1`

## 7. UTMs on every link
Every link in every ad carries UTMs. Google's help says `utm_source`, `utm_medium` and `utm_campaign` should always be
used. Values are **case-sensitive**. A missing parameter shows as "(not set)" (✅ support.google.com/analytics/answer/10917952,
seen 2026-10-14). We always write lower case.

| Parameter | Our pattern | Example |
|---|---|---|
| `utm_source` | platform | `facebook`, `instagram`, `tiktok`, `youtube` |
| `utm_medium` | `paid_social` (or `paid_video` for YouTube) | `paid_social` |
| `utm_campaign` | the campaign name in lower case | `browrev_meta_leads_multi-angle_20261014` |
| `utm_content` | the ad name (angle + version) | `time-saved_v1` |
| `utm_term` | the ad set / audience | `sg-f25-45` |

Example:
`https://example.sg/promo?utm_source=facebook&utm_medium=paid_social&utm_campaign=browrev_meta_leads_multi-angle_20261014&utm_content=time-saved_v1&utm_term=sg-f25-45`

Meta can fill some values with dynamic URL parameters (❓ recheck the current list). Click-to-WhatsApp has no landing URL,
so tag the pre-filled WhatsApp message instead (for example "Hi, I saw your ad [TS1]") so the CRM can tell ads apart.

## 8. Timezone and currency
- Default timezone **Asia/Singapore**. If the ad account already has a timezone, **keep the account's timezone** and say
  which one every report uses. Changing an account's timezone can split its history; never change it without Ryan.
- Default currency **SGD**, unless the account is set to another currency. Report in the account's currency.
- **Never mix currencies** without a conversion. A converted number states the rate, the source and the date.

## 9. Honest budget maths: the worked example
"Run 5 ads for eyebrow embroidery in Singapore, ladies 25 to 45, $30 a day, 5 different angles, keep cost per lead below $10."

- S$30/day ÷ S$10 target CPL = **about 3 leads a day at best.** About 21 a week at best.
- The first days are in learning and usually cost more per lead. Week one may well be above S$10.
- 5 ads share S$30, so about **S$6 per ad per day** if spend were even (it won't be; the platform favours some ads).
- Our minimum-data rule (spend ≥ 1.5 × target CPL = S$15 per ad) means a fair read on each ad needs **about 3 days or more**.

Recommendation:
1. **1 campaign, 1 ad set** (or a campaign budget with that single ad set), S$30/day total.
2. **5 ads, one per angle**, same format and offer, so the angle is the only main variable.
3. Review on **day 5–7**. Keep the **1–2 best angles**. Then test new hooks on them.
4. Never promise "below S$10". Say it is the **target**, and report the real number daily.

The preview card and the approval code for this example are in [[12_Voice_Commands]].
