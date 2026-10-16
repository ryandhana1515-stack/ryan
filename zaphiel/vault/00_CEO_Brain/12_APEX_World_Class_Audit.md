---
tags: [zaphiel, ceo-brain, apex, audit, plan]
date: 2026-10-16
status: waiting for Ryan's approval of the phases
source: "[[Knowledge/APEX — World-Class Master Upgrade Prompt (2026-10-16)]]"
---
# APEX world-class upgrade — audit + phased plan

## Audit: what exists, what works, what is missing (vs the 2026-10-16 prompt)
| Prompt section | Exists today | Works (evidence) | Missing |
|---|---|---|---|
| §1–2, 14 Identity, prime directives, voice | `.claude/agents/apex.md` + 4 specialists (Ads Intelligence, Market Research, Creative Brain, Campaign Operator); approval-first, platform-confirmed results, no invented data, client separation | tests §40–§42 (approvals, guard), T1–T6 | the "head of growth" persona and beliefs written in; "early signal, not proven" wording rule |
| §3 Platform mastery | `09_Ad_Formats`, `04_Platform_Playbooks`, `10_Budget_Structure_Rules` (objectives, formats, structures, learning phase basics) | knowledge only | per-platform **modules** with testing tools (Meta A/B Experiments, flexible/dynamic creative, Advantage+ enhancements, Lift; TikTok Split Test, ACO/Smart Creative, Smart+, Symphony; Google Experiments/Video experiments/Brand Lift), tracking setup, policies; future-platform template |
| §3.6 Live knowledge rule | `11_Capability_Register` (providers, dated) | — | a **per-platform feature registry** with min requirements, API support, region, last-verified date, source; the **90-day re-verify** check in code |
| §4 Research system | `05_Research_Playbook`, market-research agent, T3 competitor scan | T3 (8 competitors, 10 fields) | Step 1 "client's own history ranked by business results"; buying-psychology mapping; Research Brief template with the 5 outputs |
| §5 Creative engine | Creative Brain + 5-angle brief (T5), angle library, Creative QA in code (`apCopyProblems`) | T5; tests §40 B/C | the **10-angle** system with the 12 families; per-concept fields: 3 alternative hooks, short+long text, hypothesis "X beats Y because Z", kill criteria, policy-risk check |
| §6 Testing system | `14_Testing_Engine` (7 test types), `coTestBudget`, `coBudgetForLeads` | tests §43 | the **23-test library**, method selector (budget × question → discovery vs proof tool), **Test Plan schema + validator**, **statistical module** (two-proportion test + Bayesian probability-to-beat-control, plain-English %), verdicts **Proven / Promising / Inconclusive / Loser**, false-winner checks, 7-day minimum |
| §7 Decision rules | `diagnose.js` KILL/KEEP/SCALE/ITERATE/FIX TRACKING; fatigue finding; `autopilot.js` raise ≤20%, 3-day cool-down, caps | tests §38, §40 | **REFRESH** as its own verdict with all fatigue signals (frequency ≥3/7d, CTR −20–30% from peak, CPM↑+CTR↓, CPA rising 3–5 days, TikTok watch-time); horizontal scaling; roll-back rule; thresholds fully per client (incl. lead-to-sale rate); 3–5 fresh variations prepared automatically on fatigue |
| §8 Diagnosis | funnel stages 1–7, symptom→cause, §8.5 13-field output | tests §38, T6 | the owner's **four-question format** (WHAT HAPPENED / WHY IT MATTERS in $ / WHAT TO DO / WHAT TO MEASURE + CONFIDENCE); appointment, show-up, cost per appointment, LTV metrics |
| §9 Attribution | money view (`mkMoneyView`), Atlas lead stages, John qualification | tests §43 | **John doesn't capture the click-to-WhatsApp ad referral yet** (checked: no referral handling in `whatsapp-inbound`); tracking code in pre-filled messages; data model AD → ENQUIRY → QUALIFIED → APPOINTMENT → SHOW-UP → SALE → REVENUE; **CAPI / offline conversion feedback** to Meta/TikTok |
| §10 Omneky | provider evaluation, 8-question email draft, Campaign Operator ready | — | the **capability map from the real account** + adapter (needs Ryan to subscribe and connect) |
| §11 CEO dashboard | money view code; Atlas staff app (in `fusion-edg-core`) | — | the dashboard **data spec** and APEX screens (tests running "Video B leading, 2 more days", thumbnails, one-tap Approve/Reject) |
| §12 Safety | permission levels, caps, approval codes bound by hash, auto-pause policy, ledger + proposals tables, Ad Actions guard | tests §40–§42; n8n guard deployed | monthly cap + max step per client; audit log fields (recommended → approved → executed → confirmed → result) in one place; **monitoring every few hours** (needs the routine switched on) |
| §13 Multi-client | per-brand folders (`Brands/<brand>/`), EDG Core tenancy + RLS | EDG Core cross-tenant tests | **Winning Creative Library** per client + anonymised cross-client pattern library (with permission) |
| §16 Acceptance | T1–T6, acceptance A–M status | — | the **final-vision dry run** end to end |

## Conflicts with earlier decisions (flagged, newest wins unless Ryan says otherwise)
1. **Capped auto-scale.** This prompt allows an *optional*, client-enabled, hard-capped auto-scale rule; v5/v7 said automation may
   only reduce spend. Plan: build it **OFF by default**, usable only when a client explicitly switches it on with caps.
2. **Scaling step.** This prompt: ~20–30% every 2–3 days; today's hard ceiling is 20% with a 3-day cool-down. Plan: default
   20% / 3 days, client may set up to 30% / 2 days.
3. **Respond.io.** The prompt mentions capturing referrals "via respond.io where available"; Ryan's 2026-10-15 rule keeps
   Respond.io optional. Plan: our own route is the WhatsApp Cloud API referral (free); Respond.io only for a client already on it.
4. **Monitoring every few hours** needs the scheduled routine; creating schedules was blocked for Zaphiel before → Ryan's OK.

## Phased plan (no paid subscriptions, no new duplicate agents, nothing live without approval)
| Phase | What | Type | Needs Ryan |
|---|---|---|---|
| **1. Brain + knowledge** | upgraded APEX persona (§1–2, 14); platform modules Meta / TikTok / YouTube-Google / future template (§3); Platform Capability Registry per platform + 90-day check (§3.6); research workflow + Research Brief template + buying psychology (§4); 5- and 10-angle creative templates (§5) | notes + small code check | approve phases |
| **2. Testing + decision engine** | 23-test library, method selector, Test Plan schema + validator, statistics (two-proportion + Bayesian), verdict labels, false-winner checks (§6); REFRESH + fatigue signals, scaling/roll-back rules, per-client thresholds (§7); four-question diagnosis (§8) | code + tests | conflict 2 |
| **3. Safety + automation** | per-client monthly/daily caps and max step; optional auto-rules incl. capped auto-scale OFF by default; unified audit log (§12) | code + tests | conflict 1; schedule OK (conflict 4) |
| **4. Attribution** | John captures click-to-WhatsApp referral + fallback tracking codes; lead chain model through Atlas; CAPI/offline-conversion feedback design (§9) | code + n8n redeploy (from repo) | later: Meta dataset token in n8n |
| **5. Omneky** | capability map from the real account + adapter + request/response logging (§10) | code | Omneky subscribed + connected |
| **6. Dashboard + multi-client** | CEO dashboard data spec + APEX screens; per-client config; Winning Creative Library + anonymised pattern library (§11, §13) | spec + code in `fusion-edg-core` | attach that repo; permission rule for cross-client patterns |
| **7. Acceptance** | final-vision request run end to end in dry-run (§16) | test | — |
