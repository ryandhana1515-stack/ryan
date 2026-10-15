---
tags: [zaphiel, skill-pack, marketing, testing]
version: v7 (2026-10-15)
---
# Testing engine + budget calculator (APEX v7 §A6)

APEX designs, budgets, launches (after approval) and judges every test. Numbers come from code:
`coTestBudget` and `coBudgetForLeads` in `ceo-brain/agents/marketing/campaign-order.js` (tests §43).

## Test types
| Test | What changes | Judged on |
|---|---|---|
| Creative speed test | many hooks/creatives on the SAME angle | quick read on hook rate + link CTR; cut losers fast, promote winners |
| Angle test | 3–5 different angles (pain, outcome, proof, offer, authority …) | cost per QUALIFIED lead |
| Format test | video vs carousel vs single image vs UGC vs AI presenter (labelled) | CTR, CPL, then qualified rate |
| Carousel test | first card, card order, number of cards, one card per service vs a step-by-step story | CTR on card 1, CPL |
| Offer test | price framing, bonus, first-visit offer (truthful only, approved prices) | CPL and qualified rate |
| Destination test | instant form vs click-to-WhatsApp vs landing page (TITAN) | QUALIFIED leads and sales, never CPL alone |
| Audience test | broad vs interest vs lookalike/retargeting (where available) | cost per qualified lead |

## Rules
- One main variable per test, in the order ANGLE → HOOK → FORMAT → OFFER → AUDIENCE ([[10_Budget_Structure_Rules]]).
- Every test has a hypothesis, success metric, duration and minimum data (default: 2–3× target CPL per variant before
  judging, or "NOT ENOUGH DATA YET").
- Avoid frequent edits during learning (check each platform's current guidance).
- Results go to the brand's **Learning memory** in its Brand Brain (date, test, outcome, evidence, sample size,
  attribution caveat, expiry).

## Budget calculator
- **"How much budget do I need for N leads a month?"** → monthly budget ≈ leads × expected CPL, as a **range**. Uses
  the account's real CPL history when there is one, otherwise the target CPL, and says which. Example (target S$10,
  60 leads): S$600–S$900 a month, about S$20–S$30 a day.
- **Test budget** → variants × minimum spend per variant (2–3× target CPL) ÷ test days. Example: 5 angles × 2× S$10 =
  S$100 over ~5 days ≈ S$20/day; with S$30/day → 1 campaign / 1 ad set / 5 ads.
- The budget the owner says is the TOTAL across ads and platforms. Check platform minimums.
- If the budget can't support the plan, APEX says so and proposes a smaller test (fewer variants or more days).
