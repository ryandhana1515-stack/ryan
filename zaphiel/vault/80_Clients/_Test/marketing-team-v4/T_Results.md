---
tags: [zaphiel, marketing, test, results]
date: 2026-10-12
---
# Marketing Team v4, Layer 1: test results (T1–T5)

Ryan's master prompt **FUSION AI COMPLETE AI MARKETING TEAM (v4)**, Layer 1 Steps 2–3: the knowledge pack
([[60_Skill_Packs/Marketing_Team/00_Index]]) plus 4 agents (`.claude/agents/apex.md`, `ads-intelligence.md`,
`market-research.md`, `creative-producer.md`). Zero-cost rule respected: nothing paid, generated, published or signed up.

| Test | What it checks | Result | Status | Where |
|---|---|---|---|---|
| **T1** | "How is my marketing?" on **real** Metricool data (read-only) | ✅ Honest answer: FusionTech's IG/TikTok exist but have 1 and 0 followers, no posts in 14 days and no ad account. Nothing to diagnose yet. BROWREVOLUTION has no accounts connected | PRODUCTION VERIFIED (reading) | [[T1_T2_T5]] |
| **T2** | Diagnosis accuracy on 5 DEMO scenarios (fatigue, broken tracking, cheap-bad leads, slow follow-up, winner) | ✅ 5/5 correct, automated test §38 | MOCK TESTED | [[T1_T2_T5]] |
| **T3** | Competitor ad scan + voice of customer + swipe file (eyebrow embroidery, Singapore) | ✅ 10 competitors profiled + ~12 smaller; ~30 Meta Ad Library ads; customer fears in their own words; compliance notes; 3 angles. Videos and images not viewable; Reddit snippets only; TikTok behind a login | DONE (RESEARCH, sources dated) | [[T3_Research_Brief]] |
| **T4** | Creative pack: 3 angles × 3 hooks, 25 s script, storyboard, Tool Router choice, prompts, cost card, Creative QA | ✅ All parts. Recommendation: real phone footage, **S$0**; AI optional for b-roll only. All brand facts [ASK RYAN] | DRAFT (no generation) | [[T4_Creative]] |
| **T5** | "Where it went wrong" report on a DEMO account | ✅ Summary, scorecard, 3 money leaks, winner to scale, 14-day fix plan, how to confirm, data gaps | MOCK TESTED | [[T1_T2_T5]] |

Automated tests: `ceo-brain` **146/146 pass** (§38 = marketing engine).

## Limits found during testing
- This session cannot open web pages directly (network policy). Research used search results and the Firecrawl scraper.
  Some tool prices and rules are therefore **search-verified only** and flagged "recheck" in [[60_Skill_Packs/Marketing_Team/01_Tool_Library]].
- Firecrawl warned its account is **low on credits**. It is only needed for deep research; no top-up is needed until the next research job.
- No ad account is connected anywhere, so the real diagnosis can't run on real ads yet.

## Waiting for Ryan
1. Which brand first: FusionTech AI or BROWREVOLUTION? Is BROWREVOLUTION the business at browrevolution.sg (it appears in T3)?
2. Connect that brand's Instagram, Facebook and TikTok in Metricool (free; already on your account).
3. Fill in the brand's targets and Brand Brain (prices, offers, approved claims).
4. OK to retire the older `marketing-brain` agent (its rules now live in `ads-intelligence`)?
