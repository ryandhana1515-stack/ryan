---
tags: [zaphiel, skill-pack, marketing, moc]
owner: Ryan
status: active
version: v4 (2026-10-12)
---
# Marketing Team v4: knowledge pack (Layer 1)

This pack serves Ryan's **FUSION AI COMPLETE AI MARKETING TEAM (v4)** (2026-10-12), which replaces the earlier marketing prompts.
The **Zero-Cost Rule** stays in force: no paid sign-ups, no trials that need a card, no paid generation and no ad spend
without Ryan's yes ([[00_CEO_Brain/08_Atlas_Zero_Cost_Plan]]).

**Marketing OS v5 (Ryan's master prompt, 2026-10-14):** one Marketing Director ("Marketing Brain") and three managers
(Ads Intelligence, Market Research, Creative Brain); workers are task templates; the Execution Engine is code. Approval
first: Ryan approves each launch, budget increase, post and paid generation with `APPROVE <code>`.

**The team.** One Marketing Director manages three specialists. The Execution layer is code, not an agent.

| Who | File | Reads first |
|---|---|---|
| Marketing Director (Marketing Ops Manager, the entry point) | `.claude/agents/marketing-director.md` | this index, [[01_Tool_Library]], [[08_Approval_Rules]], the brand's Brand Brain |
| Ads Intelligence & Diagnosis | `.claude/agents/ads-intelligence.md` | [[02_Diagnosis_Playbook]], [[06_Metrics_Dictionary]], [[07_Report_Templates]] |
| Market Research & Competitor Intelligence | `.claude/agents/market-research.md` | [[05_Research_Playbook]], [[03_Angle_Library]] |
| Creative Brain (merged Creative Producer; brand, copy, production) | `.claude/agents/creative-brain.md` | [[01_Tool_Library]] (Tool Router), [[03_Angle_Library]], [[04_Platform_Playbooks]], [[08_Approval_Rules]] |
| Execution layer (platform phase: approved API actions only) | Fusion EDG Core Marketing module | `fusion-edg-core/docs/marketing/PLAN.md` |

**Numbers come from code, words come from AI.** All metrics and kill/keep/scale verdicts come from
`ceo-brain/agents/marketing/diagnose.js` (tested in `ceo-brain/tests/run-tests.js` §38). The agents explain what it
returns. They never do arithmetic in their head.

## Notes
- [[01_Tool_Library]]: every tool (Higgsfield, HeyGen, Veo/Gemini, Seedance, Kling, ElevenLabs, Canva, CapCut/ffmpeg, Metricool, ad libraries, ad APIs), plus the **Tool Router**
- [[02_Diagnosis_Playbook]]: where the funnel breaks, symptom → cause → how to verify → action, kill/keep/scale
- [[03_Angle_Library]]: angles, hook formulas, script structure
- [[04_Platform_Playbooks]]: Facebook & Instagram, TikTok, YouTube
- [[05_Research_Playbook]]: competitor ad scans, voice of customer, swipe file
- [[06_Metrics_Dictionary]]: every formula, period, label (PLATFORM-REPORTED vs CRM-CONFIRMED)
- [[07_Report_Templates]]: daily 60-second summary, weekly/monthly CEO report, "Where it went wrong"
- [[08_Approval_Rules]]: what the AI may do alone and what needs Ryan's yes; Creative QA
- [[09_Ad_Formats]]: every objective, destination and ad format on Meta, TikTok, YouTube/Google, and when to use what (v5)
- [[10_Budget_Structure_Rules]]: the budget is the TOTAL, consolidate small budgets, testing order, naming, UTMs (v5)
- [[11_Capability_Register]]: what each provider (Omneky, Metricool, our Ad Actions, native APIs) can really do, with status (v5)
- [[12_Voice_Commands]]: spoken commands → CAMPAIGN/REPORT/DIAGNOSIS/CREATIVE orders, preview card, APPROVE <code>, safety words (v5)
- [[13_Provider_Evaluation]]: Omneky verification checklist, provider comparison, questions to send in writing (v5)
- Brands: [[Brands/FusionTech_AI/Brand_Brain]] (+ targets, autopilot), [[Brands/BROWREVOLUTION/Brand_Brain]] (+ targets, autopilot)
- Tests: [[80_Clients/_Test/marketing-team-v4/T_Results]] (v4) · [[80_Clients/_Test/marketing-team-v5/T_Results]] (v5)

## Status labels (used everywhere)
PLANNED • CODED • MOCK TESTED • SANDBOX TESTED • PRODUCTION VERIFIED.

| Piece | Status (2026-10-12) |
|---|---|
| 4 subagents (Layer 1) | CODED (agent files). Tested in [[80_Clients/_Test/marketing-team-v4/T_Results]] |
| Diagnosis engine `diagnose.js` | MOCK TESTED (5 DEMO scenarios + rules tests) |
| Metricool read (Claude Code MCP) | PRODUCTION VERIFIED for reading (brand FusionTech.AI, 2026-10-12). No ad accounts connected yet |
| Platform Marketing module (Layer 2): Metricool connector, daily sync, findings tables | CODED + MOCK TESTED (Fusion EDG Core steps 1a/1b) |
| **Autopilot** (Ryan, 2026-10-13): guardrail engine `ceo-brain/agents/marketing/autopilot.js`, daily routine `ceo-brain/agents/marketing/ROUTINE.md`, settings `Brands/<brand>/autopilot.md`, ledger n8n table `mk_autopilot_ledger` | CODED + MOCK TESTED (§40) + dry run on FusionTech's real settings. Posts automatic; ads and credits wait for Ryan's caps |
| Meta Ads changes (pause / daily budget only) via n8n "Marketing — Ad Actions" | CODED; waits for Ryan's Meta System User token in n8n. TikTok / Google Ads writes: PLANNED (app approvals) |
| Paid generation (Higgsfield, Kling, ElevenLabs, HeyGen, Veo…) | Tools connected where marked in [[01_Tool_Library]]. Every paid generation needs Ryan's yes |

## Links
Head agents: [[10_Agents/03_Marketing_Growth]], [[10_Agents/04_Creative_Studio]], [[10_Agents/14_Data_BI_KPI]] · Atlas: [[10_Agents/07_CRM_Architect]] · John: [[10_Agents/02_Sales_CRM]] · Earlier team notes: [[10_Agents/Marketing/_index]] · Platform plan: `fusion-edg-core/docs/marketing/PLAN.md`
