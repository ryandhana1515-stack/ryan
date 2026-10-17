---
tags: [zaphiel, apex, omneky, dashboard, directive, source]
from: Ryan (chat, 2026-10-17, with a screenshot of the Atlas dashboard Home)
status: source summary (faithful, section by section). Audit + report: [[00_CEO_Brain/13_APEX_Omneky_Dashboard_Audit]]
---
# FUSION AI — APEX + OMNEKY COMPLETE PRODUCTION INTEGRATION (Ryan's directive, 2026-10-17)

Goal: one Fusion AI dashboard, one APEX marketing director, Omneky as a connected provider, real workforce activity, real
campaign data, real approvals and execution, real leads/bookings/sales through Atlas CRM. Don't rebuild the AI workforce,
dashboard, CRM or database; inspect first, preserve working code.

1. **Existing system:** APEX (+ Market Research, Creative Brain, Ads Intelligence, Campaign Operator), ATLAS (CRM, leads,
   appointments, sales, revenue), JOHN (sales agent; Respond.io optional), TITAN (web), the Fusion AI dashboard; Brow
   Revolution = first pilot, not default.
2. **Objective:** customers talk to APEX in Fusion AI ("analyze my Facebook ads from the last 30 days … strongest videos …
   competitors … five new angles … S$50/day campaign … preview before launching") and see what APEX is doing, which
   specialist is working, research done, ads prepared, approvals pending, campaigns running, money spent, best ads, ads
   needing attention, leads → appointments → sales. No Claude Code for customers.
3. **Claude Code = development environment only.** Production APEX runs on our backend + an authorised production AI API.
4. **Omneky:** verify auth (OAuth/MCP, API key), campaign and creative functions, server-side compatibility, plan, account
   and brand limits, rate limits/charges, multi-client and white-label licensing. Don't assume an API key grants MCP
   functions, or that a Claude connection connects the dashboard. Mark each capability VERIFIED AND WORKING / DOCUMENTED
   BUT NOT TESTED / REQUIRES ADDITIONAL PERMISSION / NOT SUPPORTED / UNKNOWN (list: read campaigns, read ads, read
   performance, creative assets, image ads, video ads, campaign structures, create campaigns, create ad sets, audiences,
   budgets, launch, pause/resume, modify budgets, status, reports, competitor research, variations/testing).
5. **Architecture:** DASHBOARD → BACKEND → APEX ORCHESTRATION → AUTHORISED TOOL EXECUTION → OMNEKY → META/TIKTOK.
   Server-side auth, encrypted credentials, OAuth per ad account where supported, tenant isolation, roles, health checks,
   token renewal, error handling, retry and duplicate protection, audit logging; no keys in the front end; never share
   credentials across clients.
6. **APEX — AI WORKFORCE ACTIVITY page:** REQUEST RECEIVED → RESEARCHING → ANALYZING → CREATING → PREPARING CAMPAIGN →
   WAITING FOR APPROVAL → EXECUTING → MONITORING → REPORTING; per job: name, client, specialist, status, start, last
   update, completed/pending steps, error/blocker, approval, final result; statuses from real backend events; history.
7. **Simple CEO marketing dashboard:** MONEY SPENT, NEW ENQUIRIES, QUALIFIED LEADS, APPOINTMENTS, CONFIRMED SALES,
   REVENUE; best ads, ads needing attention, AI recommendations, pending approvals, connection status; plain English;
   CTR/CPC/CPM/CPA/CPL/ROAS only under View Details; missing data shown honestly.
8. **Winning-ads intelligence:** Ad Library / Creative Center research, history analysis, angle/hook/script/video/image/
   headline/audience/offer/CTA tests, formal A/B where supported (distinguish from multiple-ad testing), funnel tests,
   fatigue, scaling, qualified-lead and sales analysis; every test: objective, hypothesis, audience, budget, duration,
   success metric, tracking, approval.
9. **Creative production** through Omneky, Kling, Higgsfield, HeyGen, Gemini and other approved tools; uploads, scripts,
   UGC, hooks, headlines, CTAs, variations, previews; status and errors shown; never claim completion before the provider
   confirms; no paid credits without approval.
10. **Campaign creation workflow** (e.g. ten ads for Brow Revolution, TOTAL S$100/day): 20 steps from identifying the
    company to reporting qualified leads and sales; never treat S$100 as per ad; don't spread small budgets.
11. **Approval-first:** keep the approval-code system; approval before launches, budget increases, publishing, paid
    creative, major changes; auto-pause only under separately approved rules; record who/what/account/budget/details/
    timestamp/provider confirmation/final status.
12. **Atlas + John:** AD → LEAD → JOHN → QUALIFIED → APPOINTMENT → ATLAS → SALE → REVENUE; store campaign/ad ids; no
    duplicate leads/sales; privacy and consent.
13. **Multi-client / white-label:** separate organisation, brand, ad accounts, campaigns, creatives, budgets, permissions,
    approvals, CRM, credentials, audit logs; Master Admin enables modules per client; no Brow hard-coding; no commercial
    white-label Omneky until licensing is verified.
14. **Metricool** optional supporting analytics (preserve); **Supermetrics** not a priority, never mandatory.
15. **Order:** 1 Audit → 2 Omneky verification → 3 Read-only connection (one test ad account) → 4 APEX activity tracking →
    5 Creative + campaign preparation → 6 Approval + one small approved campaign → 7 CRM attribution → 8 Multi-client
    readiness. Don't skip testing stages.
16. **Report first** (10 questions: built, Omneky abilities, connection method, access Ryan must provide, unsupported,
    dashboard needs, buildable now, needs subscription, costs, next test). No purchases or live ads without approval.
