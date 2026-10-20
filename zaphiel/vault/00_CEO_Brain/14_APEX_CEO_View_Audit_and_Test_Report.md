# APEX CEO view — button audit and live test report (2026-10-20)

Ryan's ask: make the Marketing dashboard simple for an ordinary CEO. The existing APEX should run the advertising work
through Omneky; every button must be a real workflow; anything Omneky can't do must say so honestly.
Shipped in Fusion EDG Core PRs #58 and #59 (merged and deployed; migration 046 applied on staging).

## 1. Audit of the old Marketing section (before the change)

| Item | Finding | Fix |
|---|---|---|
| Campaign plan "Approve" | **Misleading.** It said "queued for launch through Omneky", but nothing ran a launch. | The wording now says plainly what happens next. A real launch flow was added: APPROVE AND LAUNCH → code → Omneky. |
| Plan sheet: "Approving lets FusionTech launch this plan" | **Implied a secret manual launch.** | Rewritten: approval locks the plan; launching needs its own code. |
| AI Workforce "live map" steps | **Fake buttons** that did nothing. | Turned into plain labels. |
| A/B table "Chance of being best", spend, leads | **Placeholders** that were never filled. | Removed; the page says results appear after launch. |
| Higgsfield / Kling "made with" | **Implied a connection** the dashboard doesn't have. | Now "suggested tool (not linked to this dashboard yet)". |
| 11 tabs plus 6 + 8 number cards | **Too complicated** for a CEO. | One APEX briefing screen; the 11 pages moved under "Advanced tools". |
| AI recommendations | **Missing:** Omneky's `get_recommendations` was never used. | VIEW AI RECOMMENDATIONS / ANALYZE MY ADS now call it. |
| Make new ads | **Missing.** | CREATE NEW ADS: APEX writes the briefs → code → Omneky `generate_image_ad`. |
| Pause / Resume / Budget | Wired to Omneky but **never pressed live**. | Kept. The readiness check now warns that the ad account selection is pending. |

## 2. The new main screen

It shows ten things:
1. Advertising spend
2. Leads
3. Cost per lead, against the CEO's target
4. Qualified leads
5. Appointments
6. Sales and revenue
7. Best-performing ads
8. Ads needing attention
9. APEX's recommended actions
10. Pending approvals

It also has:
- a large **"APEX, manage my marketing"** button;
- APEX's briefing, written by code from the real numbers in plain Marketing Director language;
- "What APEX can do in your account", a live readiness check.

## 3. Test report: each button against live provider responses (Brow Revolution, staging, Omneky brand 42271)

| Button | Workflow | Status |
|---|---|---|
| Connect Omneky | OAuth sign-in | ✅ **Live-verified** 2026-10-20 19:07 UTC (Ryan's own sign-in through the dashboard). |
| Refresh from Omneky / VIEW AD PERFORMANCE / VIEW CAMPAIGN RESULTS | `get_performance_summary`, `get_performance_breakdown`, `list_live_ads`, `list_connections`, `get_account` | ✅ **Live-verified** at 19:07 (on connect) and 19:55 (Ryan pressed Refresh). Real data: spend 2,298.39, 2,617 clicks, 16 leads, 6 campaigns, 28 ads. |
| Readiness check ("What APEX can do") | `get_account`, `list_connections`, `list_ad_accounts`, `list_live_ads` ×2 | ✅ **Live-verified** at 20:26 by the production timer: all 5 Omneky answers OK. Facebook connected; **ad account selection pending**; 2 ad sets in the active campaign; 954 credits. |
| First report / Diagnosis / Daily report | rules on the stored snapshot | ✅ First analysis written live at 19:08 (4 findings). The daily report runs at 8 AM SG. |
| ANALYZE MY ADS / APEX, manage my marketing | fresh read + readiness + `get_recommendations` + briefing | ⚠️ **Built and tested against the fake Omneky.** Its read steps are the ones verified live above. Not pressed live yet; needs a signed-in click. Omneky's `get_recommendations` timed out at 20 s on its first live call (checked directly in Omneky, read-only). Omneky caches the result, so pressing again after a minute shows them; the screen says so. |
| VIEW AI RECOMMENDATIONS | as above | ⚠️ Same as ANALYZE MY ADS. |
| CREATE NEW ADS | APEX writes briefs (free) → code → `generate_image_ad` → timer polls `get_creative_status` | ⏳ **Built; first live run needs Ryan's code** because it spends Omneky credits. The per-image price is not published by Omneky; credits before and after are recorded. |
| PREPARE A/B TEST / REVIEW CAMPAIGN | APEX campaign planner (existing) | ✅ Works; planning is free. |
| APPROVE AND LAUNCH | `launch_meta_ad` into an existing ad set, with a code | ⛔ **Blocked by Omneky.** Its live answer is "Facebook ad account and page still need to be chosen" (`needs_account_selection: true`). The button is greyed out and shows that reason. Also, Omneky's launch tool has no "WhatsApp messages" goal, so brand-new WhatsApp campaigns are not offered. |
| PAUSE AD / RESUME AD | `set_ad_status` (pause at once; resume needs a code) | ⚠️ **Not yet confirmed.** Wired, but never pressed live because it changes live ads. Omneky may refuse it while the ad account selection is pending; its answer will be shown. |
| SET TARGET | `marketing_targets` (cost per lead) | ✅ Works (database only). |

## 4. What Ryan must do

1. **In Omneky: Connections → Facebook → choose Brow's ad account and page.** This unblocks APPROVE AND LAUNCH.
   It probably also makes Pause/Resume work.
2. Press **"APEX, manage my marketing"** once. Then approve, or reject, the two replacement ad briefs with their code.
   Approving spends Omneky credits.
3. **Set the target cost per lead** (one click on the Cost per lead card).
4. **Currency:** Omneky does not state the ad account currency. The screen shows S$ (Brow's business currency).
   Confirm that the Meta ad account really is in SGD.
