# FusionTech AI — Implementation Tracker

> The single list of what really works, what is untested, what is blocked and what comes next. Statuses come only from evidence (production rows, tests), never from "the screen exists". Update it after every change: newest date wins. Status key: 1 working and verified live · 2 built, not live-tested · 3 partly working · 4 interface only · 5 missing integration · 6 not built.

Priorities (Ryan, 2026-11-26): 1 APEX + Omneky + Facebook → 2 diagnosis, A/B, creatives, campaigns → 3 authorised execution + Controlled Autopilot → 4 Instagram/TikTok → 5 Website AI → 6 Atlas CRM/EDG/ERP → 7 John + client delivery → 8 HR/finance → 9 CEO Brain orchestration. One milestone at a time.

## Repair log — 2026-11-26 (newest first)

Colours (Ryan, 26 Nov): GREEN = works and verified end to end · YELLOW = built, not yet live-tested · ORANGE = blocked on an authorisation, key or decision · RED = broken or not built · GREY = planned.

**How it was checked:**
- Vercel production error logs (7 days).
- Production database rows.
- A Playwright crawler that clicked **529 buttons on 23 pages** (a fresh load for each click) against a local copy with the practice Omneky.
- 418 automated tests.

| Area | Function | Was | Root cause | Repair (PR) | Test evidence | Now |
|---|---|---|---|---|---|---|
| Platform | Every page (me, dashboard, marketing, APEX, Analyze, timer) | Froze for 5 min on 26 Nov at 22:44 SGT; Ryan's "Run AI Diagnosis" never answered | Production pool of 2 connections, no wait limit, and 15 code paths that nest a second transaction: requests deadlocked each other | Nested transactions use a sibling pool; 15 s wait limit; pool 6 (#101) | Regression test deadlocks without the fix and passes with it; no production errors since the deploy | GREEN (fix verified in a test; production being watched) |
| Platform | Omneky refresh clicked twice | Two full reads at once | No lock | One read per business at a time (#101) | Unit-level | YELLOW |
| All departments | Agent tool "Launch" forms, Meeting Brief, Delegate Task, connection Test buttons | Crashed or did nothing | Two dashboard functions both named `runAction`; the later replaced the engine's | Renamed APEX's to `apexRunAction` (#103) | Re-crawl: Meeting Brief runs; no duplicate function names remain | GREEN (local copy); YELLOW in production until clicked |
| Home | Lead sources chart | Drawn wrong | Two `donut` functions | Renamed (#103) | Script check | YELLOW |
| Home | Revenue tile with Finance off | Script error "not found" | Opened Finance unconditionally | Says Finance is off (#103) | Crawl | GREEN |
| APEX | 9 "Ask APEX" buttons (Overview, AI Assist, AI Suggest, Apply Recommendation, Diagnosis and Analytics asks) | Old advice-only answer, no tools | Still called the old `marketing/ask` | All run the APEX agent with steps and cards (#103) | Script check; same agent as the Assistant | YELLOW |
| CEO Brain | "Analyse my Facebook ads" in CEO Brain or the Marketing chat | Generic answer, never reached APEX | ceo.ask and marketing.ask ignored APEX | Marketing questions are handed to APEX, with its steps shown (#103) | Test: routes to APEX; other questions stay with the director | YELLOW |
| APEX | Target S$10 saved from chat | Worked | — | — | Production: policy target 10.00 (26 Nov 14:37 UTC) | GREEN |
| APEX | Campaign plans use the saved target | Plans kept asking for it | Policy not read | Uses the target; a budget over the limit becomes a question (#101) | Test | YELLOW |
| APEX | Daily CEO briefing | — | — | #99 and #100 (now reads yesterday and the last 7 days) | First live briefing 26 Nov 13:54 UTC | GREEN |
| APEX | Large picture and video uploads (up to 200 MB) | 900 kB limit | No file storage | Direct upload to the existing Supabase Storage (#102) | Refusal and safety tests | ORANGE (needs the storage key) |
| APEX | WhatsApp enquiries per ad | Shows 0 | Omneky has no WhatsApp conversation metric; the "WhatsApp" campaign's live ad set is "New Engagement Ad Set" | — | Omneky read on 26 Nov: message_conversations 0 | ORANGE (needs Meta ads_read access) |
| APEX | First real paused campaign; pause, resume and budget; A/B plan launch | Never run live (marketing_actions has 0 rows) | Waiting on Ryan | — | Tests only | ORANGE (Ryan's code) |
| APEX | Paid creatives (Omneky, Kling, Higgsfield) | 2 requests from Oct/Nov with expired codes | Waiting on Ryan | — | — | ORANGE (ask again, then approve credits) |
| Chats | Empty Send (APEX, NOVA, directors, inbox) | Did nothing | No message | Says what is missing (#103) | Crawl | GREEN |
| Team | Father's login | — | No "add member" yet; the unused owner seat works | — | — | ORANGE (Ryan: name and email on the owner seat, then a sign-in link) |
| Website AI, Atlas, John, HR, Accounting | See the table below | — | — | Not changed today (Ryan's order: APEX first) | — | See below |


**Date:** 2026-11-26
**Method:** read-only. Sources were the code in `fusion-edg-core` (branch `feature/ceo-brain-nova`), the vault, `ceo-brain/` and read-only SELECT counts on Supabase `umuzxrxredctpbveqxlt`. Counts are row totals, with the latest date in brackets. Nothing was written, sent or called on any provider.

**Status key:** 1 Fully operational and verified (production rows prove real use) · 2 Implemented but not live-tested · 3 Partially working · 4 Interface only · 5 Missing integration · 6 Not implemented

**Read these first:**
- Supabase `umuzxrxredctpbveqxlt` is the only platform database. The vault calls it staging. It holds 12 tenants: 11 demo or test tenants plus `brow-revolution`.
- Only APEX's Omneky data is real customer data.
- Every CRM lead and conversation is `self-test`, `seed`, `example` or `demo-page`. No lead has been created since 2026-10-18.
- The platform was offline from 6 to 15 Nov (Vercel Hobby 402).
- The n8n MCP connector is not authorised, so n8n execution history could not be read. n8n status below comes from the commits its Vault Writer and Orchestrator make to the vault.
- Update, 26 Nov, 14:00 UTC: the marketing policy, the Controlled Autopilot dry run, internet research and the daily briefing are merged (fusion-edg-core#99, #100), and migration 055 is applied. The first daily briefing ran live at 13:54 UTC (real Omneky data, read-only).

| Department | Capability | Status | Evidence | Next step |
|---|---|---|---|---|
| CEO Brain | NOVA "Ask" / Director Chat | 1 | `jobs` 3 `ceo.ask` completed (11-04); `agent_actions` nova ask 3, explain 6 (11-17) | Get Ryan using it weekly; nothing since 11-17 |
| CEO Brain | "What this means" explanations (Detail Panel) | 1 | `explanations` 5 (11-17), cached per data hash | none, keep |
| CEO Brain | Delegation NOVA → director (tracked job) | 6 | `actions_registry` `ceo.delegate` = not_built | Build delegation as an engine job (next CEO Brain gate) |
| CEO Brain | Orchestration graph / Connections page | 3 | Renders from tests and jobs, but `workflow_runs` 0 and `app_connections` 0 | Feed real job and connection state into the graph |
| CEO Brain | Morning numbers / daily briefing | 3 | `automation_runs` `morning_numbers` ~38–46 per tenant (11-26), but every run raises `manual_queue` "staff member has no email" (292 open) | Add owner emails, or switch the notice to the dashboard; clear the queue |
| CEO Brain | n8n CEO Orchestrator + Management view | 1 | Hourly vault commits "management view (68 unresolved, 20 high)" up to 2026-11-24 | Clear or close the 19 stale approvals (1,200+ h old) |
| CEO Brain | n8n Daily Brief email (`Pew2PX1IcgdXqXr7`) | 2 | No readable evidence: the n8n MCP is not authorised | Authorise n8n MCP and check its executions |
| Company Brain | Vault master brain read live by n8n agents | 3 | Vault notes exist. The last John lead note was written 2026-10-01 | Run one real John conversation to prove the live read |
| Company Brain | Platform knowledge base (`knowledge_items`) | 3 | 3 rows (10-01), 3 test tenants only; 0 for Brow | Load Brow's services, hours and FAQs from the vault tenant note |
| Company Brain | Software Knowledge Base | 2 | `software.ts` + tests; `app.software_requests` 0 | Use it once in an onboarding |
| Company Brain | Brand Kit | 2 | Code + migration 052; `brand_kits` 0, `brand_assets` 0 | Ryan: website, logo and tone for Brow |
| APEX | Omneky connection (OAuth) | 1 | `omneky_links` connected (since 10-23), `last_ok_at` 11-26, no error | Get Omneky's written answers on agency/token lifetime |
| APEX | Omneky read / ad results sync (every 3 h) | 1 | `marketing_snapshots` 190 (184 by timer, latest 11-26: 2 campaigns, 3 ads); `apex_events` omneky.read 190 ok | none. Note: 988 failures 10-20→10-22 (refresh token) |
| APEX | Launch readiness check | 1 | `apex_events` omneky.readiness 193 confirmed (11-26) | none |
| APEX | Monitoring timer + monitor reports | 1 | `apex_reports` monitor 184 (10-20→11-26); `apex_events` report.monitor 184 | Add alerting when a read fails 3× in a row |
| APEX | Daily / weekly reports | 1 | `apex_reports` daily 27 (11-26), weekly 3 (11-22) | none |
| APEX | Report delivery to owner | 3 | Command Center notification + email DRAFT only (vault 10-20); no WhatsApp delivery | Send to the owner by email or WhatsApp once a channel is linked |
| APEX | AI Diagnosis (rules + analysis) | 1 | `apex_reports` analysis 3 (11-17); diagnose stage in every monitor report | Ryan sets target cost per lead so the verdicts are absolute |
| APEX | Analytics tiles (spend/views/clicks) | 1 | Built from real Omneky snapshots (latest 11-26) | none |
| APEX | Analytics: leads, sales, ROAS, CRM-qualified | 5 | Brow CRM has 1 self-test lead, `payments` 0 | Link Brow's WhatsApp / Respond.io to the CRM |
| APEX | Audience insights (age/gender) | 6 | Shown as "not connected" (vault 11-06) | Read Omneky's age/gender breakdown into the snapshot |
| APEX | APEX Assistant chat (agent with tools) | 1 | `apex_chat` 4 rows (2 user / 2 apex, claude-sonnet-5, 11-24); `agent_actions` apex.chat 5 | Use it for the first real campaign; light use so far |
| APEX | Campaign plan (Campaign Creator) | 3 | `marketing_campaigns` 3 (latest 11-18), all `needs_answers`, `execution_status` not_started; `agent_actions` campaign.plan 3 | Ryan: budget and target cost per lead, then approve one plan |
| APEX | A/B Testing Studio | 2 | UI + code (#98); no plan with an approved test design; a creative comparison only, not a Meta randomised split | Run one comparison; Meta Marketing API for true 50/50 |
| APEX | Paused launch on Facebook (create campaign OFF) | 2 | Code #96 + migration 053; tested on the fake Omneky only; `provider_ids` empty | First real paused campaign with Ryan's codes |
| APEX | Pause / resume / budget changes | 2 | `omneky.ts` set_ad_status/set_ad_budget; `marketing_actions` 0 rows, never pressed live | One live pause/resume on a low-risk ad |
| APEX | Content: Omneky image/video | 2 | `marketing_creatives` 2, both `awaiting_approval` (10-23, 11-17); never generated | Ryan approves one creative (credits shown first) |
| APEX | Content: Kling | 2 | `mcp_links` kling connected; `connections` test ok 11-17; no generation recorded | Approve one paid Kling test |
| APEX | Content: Higgsfield | 2 | `mcp_links` higgsfield connected; test ok 11-17; no generation recorded | Approve one paid Higgsfield test (70 credits) |
| APEX | Content: HeyGen | 5 | `mcp_links` heygen `signing_in`; `connections` `not_tested` (MCP sign-in refused; key form sent 11-18) | Ryan enters the HeyGen key, then press Test |
| APEX | Creative brief / copy writing (free) | 1 | `agent_actions` creative.brief 2 (11-17) | none |
| APEX | Marketing policy + emergency stop | 2 | #99 merged; migration 055 applied; no policy row saved yet (no target set) | Ryan sets the target (S$10) |
| APEX | Controlled Autopilot | 2 | Dry run only (`AUTOPILOT_LIVE = false`), tested in CI | Switch to live after the first verified live launch |
| APEX | Daily CEO briefing (agent) | 1 | First live briefing 2026-11-26 13:54 UTC: get_ad_results, diagnose_ads and check_policy, read-only | Check that tomorrow's shows yesterday and 7 days (#100) |
| APEX | Internet research (web search) | 2 | Server tool wired (#99); never used live; may be switched off for the API key | Ask APEX one research question |
| APEX | Metricool (backup data source) | 5 | `app.provider_checks` metricool 39 checks, all `ok=false` (11-26) | Drop it or reconnect (Omneky is primary) |
| APEX | Social planner / comments / reviews | 6 | `marketing.social` not_built | Not a priority |
| APEX | TikTok / Google / other ad platforms | 5 | Not connected in Omneky (vault 11-24) | Connect only when a client needs it |
| Website AI (TITAN) | Website Intelligence (n8n `5VWP3tMK3MZysi7w`) | 3 | Deployed 10-12; app.agents website_intelligence = partial; no platform rows | Run one real lead through it |
| Website AI | Website Builder v2 + Build Worker routine (Lovable / site-kit) | 3 | Management view: built 7, failed 1; last real build Roen 10-01 | One fresh build to confirm it still works |
| Website AI | Website Build Record → send mock-up via John | 3 | Proven 09-25 and 10-01 (Roen link sent on WhatsApp) | Re-test after the WhatsApp number change |
| Website AI | `website.request` (platform) | 2 | `actions_registry` live; no website projects table, `tasks` 34 rows (last 10-18) | Link TITAN projects to the app (Website AI shows "—") |
| Website AI | `website.build` inside the platform | 5 | `actions_registry` needs_setup: GitHub + Vercel tokens | Ryan: GitHub/Vercel tokens for client sites |
| Website AI | Publish to live domain | 6 | `website.publish` not_built; `deploy` agent not_built | Build after `website.build` works |
| Website AI | SEO (TITAN-SEO) | 2 | Claude Code agent prompt only (vault 10-12); no SEO code or rows in platform | Run one SEO audit for Brow |
| Website AI | Cinematic / 3D (Kling + Higgsfield film) | 3 | Atelier Noir proof 09-29; `cinematic` agent partial | Use on the next real build |
| John Sales AI | WhatsApp Inbound → John (n8n, Meta test number) | 3 | Live since 09-27 on a 5-phone test number; last lead note 10-01; Mgmt view: 11 real leads, 0 new | Real business number, then a real customer test |
| John Sales AI | John replies inside the platform (agent replies) | 2 | `agent_actions` front_desk reply 9 (10-10); `agent_reply_jobs` 0; every conversation is self-test | Connect a real WhatsApp channel to the platform |
| John Sales AI | WhatsApp Cloud API as a platform channel | 5 | `channel_accounts` 0; adapter `whatsapp-cloud.ts` exists | Ryan: WhatsApp settings in Vercel + number decision |
| John Sales AI | Brow Revolution WhatsApp / Respond.io → CRM | 5 | Brow leads = 1 self-test (10-18); Respond.io only a catalog entry with a key form | Ryan: Respond.io key or move the WhatsApp number (rollback plan) |
| John Sales AI | Follow-up reminders (quiet new enquiry) | 2 | `automation_runs` quiet_new_enquiry last 10-18, test tenants only | Proves itself once real leads arrive |
| John Sales AI | Follow-up sequences (day 1/3/7 sending) | 5 | `sales.followup_sequence` needs_setup (WhatsApp) | After the WhatsApp channel |
| John Sales AI | Unified Inbox | 4 | Leads & Inbox screen exists; `sales.inbox` not_built; "Send" opens the owner's own WhatsApp | Build after WhatsApp is linked |
| John Sales AI | Broadcasts | 6 | `sales.broadcast` not_built | Later |
| John Sales AI | Ad referral attribution (CTWA) | 6 | `attribution_events` 0; referral not parsed (vault 10-17) | Parse the Meta referral in intake |
| John Sales AI | Discovery Console (n8n `9TnzsgPGRatMaQI3`) | 2 | No Discovery note writes visible since early Oct | Ryan runs one real discovery |
| Atlas CRM | Leads / contacts | 2 | `leads` 26, `contacts` 27, all test/seed (last 10-18) | Real leads via WhatsApp link |
| Atlas CRM | Pipeline / deals | 2 | `pipelines` 12, `deals` 0 | Use with first real leads |
| Atlas CRM | Quotes | 2 | `quotes.ts` + tests; `quotes` 0, `quote_lines` 0 | One real quote for a pilot client |
| Atlas CRM | Invoices / payments | 2 | `invoices` 0, `payments` 0 | Enable finance for a pilot |
| Atlas CRM | Appointments | 2 | `appointments` 12 (test, 10-18); `availability_rules` 200 | Brow: confirm hours and services, then real bookings |
| Atlas CRM | Inventory / stock | 2 | `stock_items` 4, `stock_locations` 3 (demo, 10-10); `stock_movements` 0 | Pilot with a retail tenant |
| Atlas CRM | Purchase orders / suppliers | 2 | `purchase_orders` 0, `suppliers` 0 | Same |
| Atlas CRM | Sales orders | 6 | `crm.sales_order` not_built | Atlas modules gate |
| Atlas CRM | Projects | 6 | `crm.projects` not_built | Atlas modules gate |
| Atlas CRM | Tags / custom fields / smart lists | 6 | `crm.tags` not_built | Atlas modules gate |
| Atlas CRM | Job cards (field jobs) | 2 | `job_cards` 0 | Pilot with a field-service tenant |
| Atlas CRM | Tasks | 2 | `tasks` 34 (last 10-18); `crm.task_create` live | none |
| Atlas CRM | Importer (CSV) | 2 | `import_batches` 0 | Import Brow's customer list |
| Atlas CRM | ATLAS build (spec → client dashboard) | 1 | `app.atlas_build_jobs` 13 done (incl. Brow, 10-18) | Idle since 10-18; next client |
| Atlas CRM | Client implementations tracker | 3 | `app.client_implementations` 5, all `waiting_for_connections` (10-18) | Close the connection blockers |
| Atlas CRM | FusionTech own quotes (`fusion_quotes`) | 2 | 5 rows (10-18), `fusion_price_list` 0 | Ryan sets the price list |
| HR | People / staff profiles | 2 | `staff_hr_profiles` 6 (demo-beauty-salon only, 10-10); Brow HR module off | Pilot HR for one real tenant |
| HR | Leave | 2 | `leave.ts` + tests; `leave_types` 0, `leave_requests` 0 | Same |
| HR | Attendance / clock-in | 2 | `attendance_events` 0; "Staff online" needs it on | Same |
| HR | HR care (document expiry reminders) | 2 | `hr_expiry_reminders` 0, `staff_documents` 0 | Same |
| HR | Payroll | 5 | `admin.payroll` needs_setup: payroll provider | Choose a payroll provider |
| Accounting | Xero sync (invoices ↔ payments) | 5 | `xero.ts` + `accounting.ts`; `integration_connections` xero = planned (7) | Xero demo company + FusionTech Xero app |
| Accounting | QuickBooks | 5 | `integration_connections` quickbooks planned (1) | Only if a client needs it |
| Accounting | Stripe payment links | 5 | `admin.payment_link` needs_setup | Connect Stripe when a client needs it |
| Accounting | Expenses / receipts / bookkeeper | 6 | `admin.expense` not_built; bookkeeper agent not_built | Later |
| n8n | Lead Intake / John (`b7kbJpnKLN2uQxyn`) | 3 | Last vault lead note 10-01; Mgmt view 0 new leads | Real test after the WhatsApp number |
| n8n | Vault Writer / Orchestrator / Approval Inbox | 1 | 559 n8n vault commits since 10-27 (latest 11-24) | Clear the 19 stale approvals |
| n8n | 8 EDG workflow templates | 4 | Inactive, placeholder URL (vault 09-30) | Wire to a client only after approval |
| n8n | n8n execution verification | 5 | n8n MCP needs authorisation in this session | Ryan authorises the n8n connector |
| Action engine | Engine jobs (buttons/chat → job) | 3 | `jobs` 3 (all `ceo.ask`, 11-04); registry 28: 13 live, 6 needs_setup, 9 not_built | Route APEX/CRM buttons through the engine too |
| Action engine | Approvals (generic) | 2 | `approvals` 0 | Use with the first paid action |
| Action engine | Approval codes (marketing) | 2 | No campaign or creative ever `decided_by` (all null) | First approved plan |
| Action engine | Manual queue / exceptions | 3 | `manual_queue` 292 open, 0 resolved (all `staff_notice_failed`) | Fix the root cause and bulk-resolve |
| Action engine | One-click action links | 1 | `action_links` app.signin 13/13 used (11-21) | none |
| Scheduling | pg_cron platform timer (every min) | 1 | `cron.job_run_details` 10,696 succeeded / 30 d (11-26); `net` 360× HTTP 200 | Consider every 5 min (Vercel usage) |
| Scheduling | Automations engine | 1 | `automation_runs` 140 in 30 d (11-26); `automations` 33 | Fix the notice failure it produces |
| Scheduling | Cron cleanup | 1 | atlas-cron-cleanup 8 succeeded (11-26) | none |
| Scheduling | Hosting uptime (Vercel) | 3 | Platform offline 11-06→11-15 (402, Hobby); 300 s limit raised | Ryan: Vercel plan decision |
| Multi-tenant | Tenancy + RLS | 1 | 12 orgs isolated; `tenancy.test.ts`; migrations 004/023 | Archive the 11 demo/test tenants or tag them |
| Multi-tenant | Staff app sign-in (owner) | 1 | `app_sessions` 26 for Brow (11-21) | none |
| Multi-tenant | Master Control (platform admin, 2-step) | 1 | `app.platform_audit` admin.login 12, setup_completed 2 (11-21) | none |
| Multi-tenant | "Sign in as me" / support view | 1 | `support.own_signin` 13, `support.view` 12 (11-21) | none |
| Multi-tenant | Per-client module switches | 1 | `organization_modules` 150 (113 on / 37 off); Brow 8 on, 6 off (10-18) | none |
| Multi-tenant | Roles & permissions per staff | 2 | `roles` 120 (10 per org); `permissions` 0; only owner/admin sessions seen | Add a real staff user for Brow |
| Multi-tenant | Staff logins (non-owner) | 2 | `user_credentials` 0, `staff_identity` 0 | Same |
| Multi-tenant | Separate login + agent for Ryan's dad | 6 | Open loop 11-24, not built | Ryan: dad's name, email, number |
| Multi-tenant | Dashboard languages (中文, BM, VI…) | 6 | Open loop 11-24 (Director Chat answers in 5 languages; UI is English) | Build the UI language switch |
| Connections | Gmail | 6 | Platform: catalog card only. n8n holds a Gmail credential (unverified) | Decide: platform email via Resend or Gmail |
| Connections | Email sending (Resend) | 5 | Only `mock:email` in `integration_connections`; staff notices fail | Configure the real email provider + staff emails |
| Connections | Google Calendar | 5 | `google-calendar.ts` adapter; only `mock:calendar` (15 tested) | Google test calendar + FusionTech Google app |
| Connections | Meta Lead Ads | 5 | `/webhooks/meta-leads` + onboarding exist; 0 leads with that source | Connect Brow's Page when instant forms are used |
| Connections | WhatsApp Cloud API (platform) | 5 | `channel_accounts` 0; settings not in Vercel env (vault 10-30) | Ryan: number decision + secrets |
| Connections | Claude (Anthropic) for agents | 1 | `agent_actions` provider anthropic 32 (11-24) | Record costs: `usage_costs` 0 rows |
| Connections | AI cost tracking | 3 | `agent_actions` stores tokens; `usage_costs` 0, `connections` monthly caps unset | Write per-call costs to `usage_costs` |

## Blocked on Ryan

1. **Brow's real enquiries are not in the CRM.** Ryan has to choose one way in: a Respond.io API key through the secure form, or moving Brow's WhatsApp number to the platform (this needs a rollback plan). He also needs to:
   - register a real FusionTech WhatsApp business number (the test number reaches only 5 phones);
   - unsubscribe the old BioGreen app from the WhatsApp account.
2. **First real paused campaign.** Ryan has to:
   - set the daily budget (at least S$51.73/day for leads, or S$6.47/day for traffic to a wa.me link), the destination and the target cost per lead (S$10 example: tell APEX "My target cost per lead is S$10");
   - approve the plan and enter his launch codes;
   - decide whether to keep the S$30/day engagement campaign.
3. **One paid creative.** Ryan approves one test video or image on Omneky, Kling or Higgsfield (the credits are shown before it runs). He also enters the HeyGen API key in the secure form.
4. **Brand Kit and owner emails.** Ryan gives Brow's website, logo and tone. He also gives the staff or owner email addresses, so the 292 failed "morning numbers" notices stop.
5. **Large video uploads.** The Vercel plan is settled: Ryan upgraded to Pro in November after the Hobby outage. Still open: Ryan says yes or no to Vercel Blob for large video uploads (usage-priced).
6. **Website builds inside the platform.** Ryan provides GitHub and Vercel tokens for client sites.
7. **Accounting, calendar and payroll.** Ryan creates the FusionTech Xero, Google and Meta developer apps and test accounts, and picks Stripe and payroll providers when a client needs them.
8. **Approvals.** Ryan authorises the n8n MCP connector so n8n runs can be verified. He also sends the unsent Omneky email about agency use and token lifetime.
9. **Dad's login.** Ryan gives his dad's name, email and WhatsApp number.
