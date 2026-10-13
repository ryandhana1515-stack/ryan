---
tags: [zaphiel, skill-pack, marketing, approvals, safety]
status: active
version: v4 (2026-10-12)
---
# Approval Rules & Creative QA

## AI may do alone
Research, analyse, diagnose, and write hooks, scripts, storyboards and briefs. It may also prepare drafts and
recommendations, and read data (Metricool and other read-only tools).

## Autopilot: limits set once (Ryan, 2026-10-13)
Ryan: "I want our agents to be doing all these … the best marketing team of AI agents." He chose:
- **Posts: fully automatic.** Only approved facts and prices from the brand's autopilot note; the engine blocks
  superlatives, guarantees, before/after, comparisons, testimonials, unapproved numbers or prices, AI-made people;
  media where the network needs it; a daily limit per network. AI media is declared as AI on Instagram/TikTok.
- **Ad changes: automatic within caps.** Only HIGH-confidence verdicts: pause a losing campaign (never the last active
  one unless it spends with zero leads), raise a winner by at most 20% a day with a 3-day cool-down, never past the
  brand's `max_daily_spend`. Re-checked live inside n8n right before Meta is called; read back and logged.
- **Generation: automatic within a monthly credit budget** per tool, with a price check before every job.
- A **missing cap switches that part off** (never unlimited). Everything is logged in the n8n table
  `mk_autopilot_ledger` and reported in one email every morning.
Where: `Brands/<brand>/autopilot.md` (settings), `ceo-brain/agents/marketing/autopilot.js` (engine, tests §40),
`ceo-brain/agents/marketing/ROUTINE.md` (daily routine). The list below applies outside the autopilot or beyond its
limits. **Still never automatic:** new campaigns or audiences, sign-ups and subscriptions, deleting anything, budgets
above the cap, and client brands until the client owner switches autopilot on in writing.

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
