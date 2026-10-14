---
tags: [zaphiel, skill-pack, marketing, approvals, safety]
status: active
version: v4 (2026-10-12)
---
# Approval Rules & Creative QA

## AI may do alone
Research, analyse, diagnose, and write hooks, scripts, storyboards and briefs. It may also prepare drafts and
recommendations, and read data (Metricool and other read-only tools).

## Permission levels (Marketing OS v5, Ryan 2026-10-14 — replaces the 2026-10-13 autopilot)
Per brand, per account and per action category: **OFF • READ-ONLY • APPROVAL-REQUIRED (default) • LIMITED-AUTOMATION**
(only if Ryan sets it). Categories: posts, ads_pause, ads_budget, launch, generation, audience_destination
(`Brands/<brand>/autopilot.md`; engine `ceo-brain/agents/marketing/autopilot.js`, tests §40).
- **Always approval-required:** new launches, resumes that spend, scale-ups, budget moves (they can raise a single
  campaign's spend), audience/destination changes, paid creative generation, publishing anything public.
- **Automation may only REDUCE spend.** An automatic pause runs only under an owner-approved policy with all of: minimum
  age and minimum spend, validated and fresh tracking, a conversion-delay allowance, a qualified-lead/sales check, a
  cool-down and a maximum number of campaigns affected per day. Missing any → it becomes a proposal.
- **Caps:** total daily/monthly caps, per-account caps, generation-credit caps, maximum change per action (+20%). A pause
  never guarantees an exact spend cap (reporting lags): watch projected spend with a buffer and verify the paused status.
- **Broken or stale tracking** suspends every performance-driven change.

## Proposals, approval codes and execution (v5)
- **Approval card:** REQUESTED ACTION • CAMPAIGN • ACCOUNT • CURRENT vs PROPOSED BUDGET • REASON • EXPECTED BENEFIT •
  RISKS • STATUS → APPROVE / REJECT / REQUEST CHANGES (also by voice: "APPROVE <code>").
- **A proposal holds:** tenant, user, account, provider, target ids, action, expected current state, payload hash, cost
  impact, evidence, expiry (48 h), rollback plan (`ceo-brain/agents/marketing/campaign-order.js`, tests §42).
- **Approval binds to that exact proposal.** Any edit invalidates it. Just before executing, re-check permission, state,
  expiry, budget, tracking, connection (an expired token stops writes and asks Ryan to reconnect) and scope.
- **Job states:** DRAFT → AWAITING_APPROVAL → QUEUED → RUNNING → PROVIDER_PENDING → VERIFIED / FAILED / PARTIAL.
  Submitted ≠ approved by the platform ≠ delivering ≠ converting.
- **Retries:** idempotency key per proposal (no duplicate ads or charges); after a timeout look the object up before
  retrying; bounded retries; partially created campaigns are handled, never left silently.
- **Verify after every write:** requested vs actual state, ids, time, errors. Never show success for a mock, a missing
  credential or a rejection.
- **Provider confirmations are preserved:** if Omneky (or any provider) asks for its own spend confirmation, it is never
  bypassed. ONE optimiser per ad account.
- **Execution Engine = validated functions only** (listAccounts, fetchMetrics, fetchCampaigns, generateCreative,
  getCreativeJob, prepareCampaign, executeApprovedAction, verifyAction, mapped to real provider tools in
  `11_Capability_Register.md`). An AI model never sends arbitrary API requests.
- **Safety words:** "STOP AUTOMATION" = AI automation off (ads keep running) · "PAUSE ALL MANAGED ADS" = request pauses
  and verify. Always confirm which one.

History: on 2026-10-13 Ryan chose posts/raises/generation fully automatic within caps; his 2026-10-14 master prompt
(newest) replaced that with the levels above.

## Needs Ryan's YES (or the client owner's, for client brands)
- **Any paid generation:** Higgsfield, Kling, ElevenLabs, HeyGen, Veo/Gemini, Seedance and similar tools use credits.
  Show the cost card first.
- **Publishing anything public:** posts, ads, replies.
- **Launching ads**, increasing budgets or other significant spend changes.
- **Pausing a campaign that brings revenue**, or deleting anything.
- **Any sign-up or subscription.** Show the cost card:
  `TOOL / WHY NOW / COST / CARD REQUIRED / AUTO-UPGRADES / WHAT HAPPENS IF WE SKIP IT` ([[Decisions]], 2026-10-12).

## Spending guardrails (platform phase)
- A spend cap per company.
- Idempotency: retries never launch twice or double a budget.
- Read-back after every change.
- A log of the requester, approver, change, provider result and rollback approach.
- An AI model never makes raw HTTP calls to ad platforms. The Execution layer runs only validated, approved,
  structured actions.

## Creative QA (before the CEO sees anything)
- [ ] Only approved claims from the Brand Brain. No invented testimonials, results, prices or offers.
- [ ] No fake before/after. No results the product can't deliver.
- [ ] Beauty, health, finance and property rules are flagged (ASAS code, platform ad policies, the industry pack).
- [ ] AI-generated people or voices are disclosed where the platform or law requires it.
- [ ] Generated video is never presented as an authentic customer testimony.
- [ ] Voice cloning or a real person's likeness only with recorded consent.
- [ ] Music or sounds cleared for commercial use.
- [ ] Captions on, aspect ratios correct (9:16, 4:5, 1:1, 16:9), CTA matches the destination.

## Data boundaries
Marketing reads only approved CRM facts (leads, stages, sales outcomes, products) through tenant-scoped services. It has
**no access to HR, payroll or unrelated accounting data**. One brand's data and Brand Brain never mix with another's.
