---
tags: [zaphiel, marketing, test, results, v5]
date: 2026-10-14
---
# Marketing OS v5, Layer 1: test results (T1–T6) and acceptance tests (A–M)

Ryan's master prompt "COMPLETE CLAUDE CODE MASTER PROMPT" (Marketing OS v5, 2026-10-14). Nothing was purchased,
launched, posted or generated. Automated tests: `ceo-brain` **169/169 pass** (§38 diagnosis, §40 permissions, §41 Ad
Actions workflow, §42 orders/approvals).

| Test | What | Result | Where |
|---|---|---|---|
| **T1** | "How are my ads?" on real data, read-only | ✅ Honest: no ad account linked anywhere; FusionTech pages quiet 14 days; Brow Revolution nothing connected; Supermetrics connected but no account authenticated | [[T1_T2_T4_T6]] |
| **T2** | 5 DEMO diagnosis scenarios | ✅ 5/5 correct; SCALE now becomes a proposal; broken tracking suspends changes | [[T1_T2_T4_T6]] |
| **T3** | Competitor scan, eyebrow embroidery SG | ✅ 8 competitors with the 10 v5 fields + 5 original hypotheses. ⚠️ No page could be re-opened today (DNS block); ad wording carried from the 2026-10-12 scan, updates from search summaries | [[T3_Competitor_Scan]] |
| **T4** | Voice command → CAMPAIGN_ORDER → preview card | ✅ Total S$30/day, ~3 leads/day at best, 1 campaign / 1 ad set / 5 ads, 2 questions; no approval code while facts are [ASK RYAN]; code issued once answered. NOT launched | [[T1_T2_T4_T6]] |
| **T5** | Creative brief: 5 angles, hooks, scripts, tool choice, cost card | ✅ Real footage first (S$0); every ad passes personal-attributes/superlative/before-after/review checks; all on HOLD for Ryan's facts | [[T5_Creative_Brief]] |
| **T6** | "Where it went wrong" from DEMO data | ✅ Summary, scorecard, 3 money leaks, what works, 14-day fix plan, how to confirm, gaps | [[T1_T2_T4_T6]] |

## Acceptance tests (section 19)
| # | Test | Status | Evidence |
|---|---|---|---|
| A | Voice → correct CAMPAIGN_ORDER with honest budget maths | ✅ PASS (code) | §42 test A; T4 |
| B | Brand Brain blocks invented offers/claims | ✅ PASS (code) | §40 B+C ($250 and "2000+ reviews" blocked); §42: no code while [ASK RYAN] |
| C | Creative QA catches personal attributes / unproven claims | ✅ PASS (code) | §40 ("Are you insecure about your thin brows?", "Singapore's leading", guarantees) |
| D | DEMO data → correct diagnosis (5) | ✅ PASS | §38 T2 |
| E | A lead reaches the right tenant's CRM, attributed, assigned | ⏳ NOT YET | Needs a real ad account + Atlas attribution. Gap found: John's intake does not read Meta's WhatsApp referral (ad id) yet |
| F | Approvals block unauthorised launches/budget changes; edited proposal needs re-approval | ✅ PASS (code) | §40 F (guard), §42 F (coApprove/coPreExecute), deployed guard in n8n `oMMIvt8PZOmUp24K` |
| G | Duplicate retry ≠ duplicate ad | ✅ PASS (code) | idempotency keys §40/§42; live provider untested |
| H | Failed/partial launch handled safely | 🟡 PARTIAL | job-state machine §42 (PARTIAL never becomes VERIFIED); live provider untested |
| I | Expired token stops writes, asks to reauthorise | 🟡 PASS in code | §42 (`token_expired` → reauth); live untested |
| J | Stale/broken tracking suspends performance changes | ✅ PASS (code) | §40 J; T6 (`suspended: true`) |
| K | Tenant A can't see tenant B | 🟡 PARTIAL | Layer 1: brands in separate notes, codes/hashes include the tenant (§42). Real isolation is Layer 2 (EDG Core RLS, tested there earlier) |
| L | Platform-attributed vs CRM-confirmed shown separately | ✅ PASS | engine labels (§38), report templates, T6 |
| M | Real end-to-end pilot, reconciled with Ads Manager | ⏳ NOT YET | Needs Ryan: link an ad account + approve a tiny pilot |
