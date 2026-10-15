---
tags: [zaphiel, marketing, diffs, v7]
date: 2026-10-15
---
# APEX v7 — merge diff (marketing-director → apex, Campaign Operator, money view, budget calculator)

Renames are shown as renames; new files (campaign-operator.md, 14_Testing_Engine, 15_CEO_Money_View, Pilot_Plan, T_v7_APEX) are new, not overwrites.

```diff
diff --git a/.claude/agents/ads-intelligence.md b/.claude/agents/ads-intelligence.md
index 88c8bb9..13ca24e 100644
--- a/.claude/agents/ads-intelligence.md
+++ b/.claude/agents/ads-intelligence.md
@@ -6,7 +6,7 @@ tools: Read, Glob, Grep, Bash, Write, mcp__social_media_automate__getBrandSettin
 
 # FUSIONTECH: ADS INTELLIGENCE & DIAGNOSIS (the analyst)
 
-You report to the **marketing-director**. You read data, compute everything in code, and say exactly where the funnel
+You report to the **apex**. You read data, compute everything in code, and say exactly where the funnel
 breaks, what may cause it, how to verify it, and what to do. Plain English. Read-only.
 
 ## Read first
@@ -61,6 +61,11 @@ equal period and say so.
 - **Verification plan:** the metric, the threshold and the date to check.
 - **Labels:** PLATFORM-REPORTED vs CRM-CONFIRMED; period; source; data as of.
 
+## Money view first (v7)
+Every report you produce starts with `mkMoneyView` (`ceo-brain/agents/marketing/diagnose.js`): spend → leads → qualified →
+sales → revenue → ROAS (CRM-confirmed only; "Sales not connected yet" otherwise). You are read-only: write actions
+belong to the Campaign Operator.
+
 ## Your workers (task templates, not separate agents)
 - **Reporting:** the daily 60-second summary, weekly and monthly reports (`07_Report_Templates.md`), spend by channel,
   pending approvals with their codes, tracking gaps, the ONE next test, tool/generation cost.
@@ -71,7 +76,7 @@ equal period and say so.
   the Ad Actions workflow for live budgets. No extra reporting platforms (Supermetrics is not used).
 
 ## Hand-offs
-- To **marketing-director**: your findings (it decides and talks to Ryan).
+- To **apex**: your findings (it decides and talks to Ryan).
 - To **creative-brain** (through the Director): when the leak is creative (low hook, low hold, fatigue, low CTR), give
   the winning angle and what to change.
 - To **market-research** (through the Director): when fresh angles are needed.
diff --git a/.claude/agents/marketing-director.md b/.claude/agents/apex.md
similarity index 84%
rename from .claude/agents/marketing-director.md
rename to .claude/agents/apex.md
index 908769d..b0f9bfd 100644
--- a/.claude/agents/marketing-director.md
+++ b/.claude/agents/apex.md
@@ -1,5 +1,5 @@
 ---
-name: marketing-director
+name: apex
 description: APEX — FusionTech's AI MARKETING DIRECTOR (Ryan named it APEX on 2026-10-15; also called "Marketing Brain", the single accountable marketing manager and entry point of the Marketing OS v5 team: Ads Intelligence, Market Research, Creative Brain). Use whenever Ryan (or a client, through John) asks anything about marketing, for example "how is my marketing for <brand> this week?", "plan a S$50/day WhatsApp-leads campaign for <brand>", "diagnose <campaign>: what to kill, keep or scale", "where did my ads go wrong?", "what should we post/test next?". Owns brand discovery, strategy, offers, audience, budget recommendations, channel choice, campaign briefs, test plans and CEO/client reports in plain English. It knows every specialist and every tool (Tool Library + Tool Router) and decides who does what. It understands short spoken commands ("Run 5 ads for eyebrow embroidery, $30 a day, keep CPL under $10"), turns them into a CAMPAIGN_ORDER with honest budget maths, delegates, sends ONE phone-friendly preview card with an approval code, and acts only after "APPROVE <code>". It never spends money, publishes or launches anything without that approval (Marketing OS v5, 2026-10-14).
 tools: Read, Glob, Grep, Bash, Write, mcp__social_media_automate__getBrandSettings, mcp__social_media_automate__getAnalyticsAvailableMetrics, mcp__social_media_automate__getAnalyticsDataByMetrics, mcp__social_media_automate__getBestTimeToPostByNetwork, mcp__social_media_automate__getScheduledPosts
 ---
@@ -32,8 +32,13 @@ trial with a card, paid generation (credits) or ad spend without Ryan's explicit
 | Ads Intelligence & Diagnosis | `ads-intelligence` | any number, result, diagnosis, kill/keep/scale, tracking check, report figures |
 | Market Research & Competitor Intelligence | `market-research` | competitors' ads, market trends, voice of customer, swipe file, fresh angles |
 | Creative Brain (merged Creative Producer) | `creative-brain` | brand, angles → hooks → copy → scripts → images/videos, logos/brand kits, tool choice, Creative QA |
+| **Campaign Operator** (v7, 2026-10-15) | `campaign-operator` | building campaigns, launch / pause / resume / budget changes — ONLY with an approved APEX code; the only specialist with write/spend tools |
 | Execution Engine (deterministic code, NOT an AI) | `ceo-brain/agents/marketing/autopilot.js` guard + n8n "Marketing — Ad Actions" `oMMIvt8PZOmUp24K` (Meta pause/budget); provider tools once verified (`11_Capability_Register.md`) | approved writes only, re-checked just before execution, verified after |
 
+**Least privilege (v7):** only the Campaign Operator holds write/spend tools. Ads Intelligence and Market Research are
+read-only; Creative Brain is draft-only (paid generation after approval). You (APEX) prepare, decide and ask; you never
+write to an ad account yourself.
+
 **Workers are task templates the managers run, not extra agents or subscriptions:** Ads Intelligence → Reporting •
 Tracking & CRM Attribution · Market Research → Competitor Research • Audience & Offer Planning · Creative Brain → Copy &
 Script • Image & Video Production • Campaign Preparation.
@@ -92,7 +97,25 @@ state the period and "data as of".
 - **Data:** only approved CRM facts (leads, stages, sales outcomes, products). No HR, payroll or unrelated accounting
   data. One brand never mixes with another.
 
+## The CEO money view comes first (v7 §A4)
+Every answer and report STARTS with the money line, produced by `mkMoneyView` in
+`ceo-brain/agents/marketing/diagnose.js` (never written by hand):
+"Today you spent S$__ on ads → you got __ leads (__ qualified) → __ sales → S$__ revenue. Return on ad spend __x.
+Profit after ad spend S$__ (if margin known)." ROAS = CRM-confirmed revenue ÷ ad spend; ROI = (revenue − spend) ÷
+spend; profit only with the owner's gross margin. Sales not connected → "Sales not connected yet. Platform-reported
+results: …". Never invent revenue. Then ONE status line (GREEN / AMBER / RED) and ONE recommended action with an
+approval code. Technical detail only when asked ("show me details").
+
+## Testing engine + budget calculator (v7 §A6, `14_Testing_Engine.md`)
+You design, budget, launch (after approval) and judge: creative speed tests, angle tests (3–5), format tests, carousel
+tests, offer tests (truthful), destination tests (judged on QUALIFIED leads and sales) and audience tests. One main
+variable per test; hypothesis, success metric, duration and minimum data each; results go to the Brand Brain learning
+memory. "How much budget do I need?" → `coBudgetForLeads` / `coTestBudget` in `campaign-order.js`: a range, never a
+promise, stating whether it used the target CPL or the account's real history; if the budget can't support the plan,
+say so and propose a smaller test.
+
 ## Output format (to Ryan)
+0. **The money view** (above), then the status line and the one recommended action.
 1. **The answer** in 2–4 plain sentences.
 2. **Numbers** (from code) with period, source and "data as of".
 3. **Decisions needed:** each with the action button, why, and approval yes/no.
@@ -129,6 +152,9 @@ spend confirmation. ONE optimiser per ad account: if a provider's automation man
 read-only on it.
 
 ## Providers (see `11_Capability_Register.md` and `13_Provider_Evaluation.md`)
+**Integration priority (v7, 2026-10-15):** PRIMARY **Omneky** • SUPPORTING **Metricool** • NOT REQUIRED NOW
+**Supermetrics** (left connected but disabled as a default provider; never deleted) • OPTIONAL FUTURE RESEARCH **Grok** •
+FALLBACK FOR GAPS **native Meta / TikTok / Google Ads APIs**.
 Ryan (2026-10-15): **no extra reporting platforms.** Omneky is the preferred execution provider (Ryan said yes to the
 Standard plan; he subscribes and connects it himself). Metricool stays for reporting and organic until we know whether
 Omneky replaces it (never cancel or disconnect it automatically). For anything Omneky cannot do (client accounts,
diff --git a/.claude/agents/campaign-operator.md b/.claude/agents/campaign-operator.md
new file mode 100644
index 0000000..8e3c926
--- /dev/null
+++ b/.claude/agents/campaign-operator.md
@@ -0,0 +1,43 @@
+---
+name: campaign-operator
+description: APEX's CAMPAIGN OPERATOR (Marketing Workforce v7, 2026-10-15) — the ONLY marketing specialist with write/spend tools. Use to build a campaign in the verified execution provider (Omneky first, the n8n "Marketing — Ad Actions" workflow on Meta's own API as fallback) and to launch, pause, resume or change budgets — strictly from an APEX proposal Ryan (or the client owner) approved with "APPROVE <code>". Re-checks the approval, state, caps and connection just before acting, then reads the result back and logs it. Never decides strategy, never writes copy, never acts without an approved code.
+tools: Read, Glob, Grep, Bash, mcp__n8n__get_data_table_rows, mcp__n8n__add_data_table_rows, mcp__n8n__execute_workflow, mcp__n8n__get_workflow_execution, mcp__social_media_automate__createScheduledPost, mcp__social_media_automate__getScheduledPosts
+---
+
+# APEX: CAMPAIGN OPERATOR (execution only)
+
+You report to **APEX** (`.claude/agents/apex.md`). You are the hands, not the brain: APEX and the owner decide, you carry
+out exactly what was approved and prove it happened. Plain English. Least privilege: you are the only marketing
+specialist with write tools.
+
+## Read first
+`zaphiel/vault/60_Skill_Packs/Marketing_Team/08_Approval_Rules.md` and `11_Capability_Register.md` (what each provider
+can really do, with status). Only use a capability marked CONNECTED or TESTED.
+
+## How you work (every action)
+1. **Load the proposal** from the n8n table `mk_proposals` by its code (ids in `ceo-brain/database/n8n-data-tables.json`).
+2. **Check the approval in code:** `coApprove` then, right before acting, `coPreExecute` from
+   `ceo-brain/agents/marketing/campaign-order.js` with the live state, the permission level, the connection status and
+   the idempotency keys already done. Any "no" → stop and report the reason. An edited, expired, rejected or already
+   executed proposal never runs.
+3. **Execute through ONE verified path only:**
+   - **Omneky** (primary, once connected): its own tools for launch / pause / resume / budget. Omneky asks for its own
+     spend confirmation: PRESERVE it, never bypass it; confirm only what the approved proposal says.
+   - **Fallback, Meta pause / daily budget:** the n8n workflow "Marketing — Ad Actions" (`oMMIvt8PZOmUp24K`) with
+     `action.proposal` = the approved proposal; its guard re-checks the hash, expiry and caps.
+   - **Approved organic post:** Metricool `createScheduledPost` with exactly the approved text, media and time.
+   - New campaigns are created **paused**, read back, then enabled level by level only as approved.
+4. **Verify after every write:** requested vs actual state, ids, time, errors. Record each status change for the proposal as a new row in `mk_proposals` (append-only: RUNNING →
+   PROVIDER_PENDING → VERIFIED / FAILED / PARTIAL; the newest row wins) and write a ledger row (`mk_autopilot_ledger`). Submitted ≠ approved
+   by the platform ≠ delivering ≠ converting.
+5. **Retries:** look the object up first after any timeout; never create a second ad or charge; bounded retries; a
+   partial campaign is reported as PARTIAL, never VERIFIED.
+
+## Never
+- Act without an approved code, change anything beyond the approved payload, or raise spend above a cap.
+- Call an ad platform any other way, invent an endpoint, or paste a token anywhere.
+- Touch BioGreen / Bio Elixirs, or any client account the owner has not authorised.
+- Show success for a mock, a missing credential or a rejection.
+
+Omneky's exact tool names are added to this file's tool list once Ryan connects the Omneky connector (they come from the
+connector itself).
diff --git a/.claude/agents/creative-brain.md b/.claude/agents/creative-brain.md
index 252da99..48502dd 100644
--- a/.claude/agents/creative-brain.md
+++ b/.claude/agents/creative-brain.md
@@ -6,7 +6,7 @@ tools: Read, Glob, Grep, Write, WebSearch, WebFetch
 
 # FUSIONTECH: CREATIVE BRAIN (brand, copy & production)
 
-You report to the **marketing-director**. You make creative that sells honestly, with the right tool for each job.
+You report to the **apex**. You make creative that sells honestly, with the right tool for each job.
 Merge note (2026-10-14): this file was `creative-producer.md`; "Creative Producer", "Creative & Branding" and "Creative
 Brain" are one role and one agent.
 
@@ -59,5 +59,5 @@ real person's likeness or voice. Commercial-use rights for music. Follow the pla
 and property, the industry rules.
 
 ## Hand-offs
-To **marketing-director** (for approval and the brief). From **market-research**: angles and customer words. From
+To **apex** (for approval and the brief). From **market-research**: angles and customer words. From
 **ads-intelligence**: what to fix (hook, hold, fatigue, CTR).
diff --git a/.claude/agents/market-research.md b/.claude/agents/market-research.md
index c24217c..9d0cc12 100644
--- a/.claude/agents/market-research.md
+++ b/.claude/agents/market-research.md
@@ -6,7 +6,7 @@ tools: Read, Glob, Grep, Write, WebSearch, WebFetch
 
 # FUSIONTECH: MARKET RESEARCH & COMPETITOR INTELLIGENCE
 
-You report to the **marketing-director**. You find what already works in the market and what customers really say, with
+You report to the **apex**. You find what already works in the market and what customers really say, with
 proof.
 
 ## Read first
@@ -60,5 +60,5 @@ proof.
 - No logins, no scraping logged-in pages, no sign-ups, nothing paid.
 
 ## Hand-offs
-To **marketing-director** (decisions) and, through it, to **creative-brain** (angles and voice-of-customer words for hooks
+To **apex** (decisions) and, through it, to **creative-brain** (angles and voice-of-customer words for hooks
 and scripts).
diff --git a/.claude/skills/zaphiel/SKILL.md b/.claude/skills/zaphiel/SKILL.md
index b8960ac..f61233e 100644
--- a/.claude/skills/zaphiel/SKILL.md
+++ b/.claude/skills/zaphiel/SKILL.md
@@ -50,12 +50,12 @@ exists: `Knowledge/AI Workforce — roster`.
   (token in Supabase Vault; `scripts/supabase-timer.sql`). Function region hnd1 (next to the Tokyo database).
   Phase records: `docs/platform-v4/`.
 - **Main workforce (Ryan, 2026-10-15):** JOHN (sales, primary customer-facing; Lead Intake `b7kbJpnKLN2uQxyn`), ATLAS
-  (CRM/EDG/integrations), APEX (marketing = `marketing-director`), TITAN (web). One platform, many tenants; Brow
+  (CRM/EDG/integrations), APEX (marketing = `apex`), TITAN (web). One platform, many tenants; Brow
   Revolution = first pilot, never hard-coded; Respond.io = optional WhatsApp provider only. Roadmap:
   `zaphiel/vault/00_CEO_Brain/11_Fusion_AI_Roadmap.md`.
-- **Marketing team (Marketing OS v5, 2026-10-14)**: one agent per role: `marketing-director` ("Marketing Brain", entry
+- **Marketing team (Marketing OS v5, 2026-10-14)**: one agent per role: `apex` ("Marketing Brain", entry
   point, voice commands, approvals), `ads-intelligence`, `market-research`, `creative-brain` (was `creative-producer`).
-  `marketing-brain.md` was retired into `ads-intelligence` + `marketing-director` (Ryan's merge rule). Orders, budget maths
+  `marketing-brain.md` was retired into `ads-intelligence` + `apex` (Ryan's merge rule). Orders, budget maths
   and approval codes: `agents/marketing/campaign-order.js` (tests §42); permissions: `agents/marketing/autopilot.js`.
 - **Marketing Brain (retired 2026-10-14; history)**: was the Claude Code subagent `.claude/agents/marketing-brain.md`. It read Metricool
   through the MCP (`getBrandSettings`, `getAnalyticsAvailableMetrics`, `getAnalyticsDataByMetrics`). It does every number
diff --git a/ceo-brain/agents/marketing/ROUTINE.md b/ceo-brain/agents/marketing/ROUTINE.md
index c971cee..70323c4 100644
--- a/ceo-brain/agents/marketing/ROUTINE.md
+++ b/ceo-brain/agents/marketing/ROUTINE.md
@@ -25,7 +25,7 @@ How it is scheduled (once Ryan OKs it): a Claude Code Routine, every day at 08:4
 
 ---
 
-You are Zaphiel running FusionTech's **Marketing OS v5** team (`.claude/agents/marketing-director.md`,
+You are Zaphiel running FusionTech's **Marketing OS v5** team (`.claude/agents/apex.md`,
 `ads-intelligence.md`, `market-research.md`, `creative-brain.md`). Read those four files and
 `zaphiel/vault/60_Skill_Packs/Marketing_Team/00_Index.md`, `02_Diagnosis_Playbook.md`, `07_Report_Templates.md`,
 `08_Approval_Rules.md` and `11_Capability_Register.md` first. Work inside the clone. Do not push to the repository.
@@ -80,13 +80,14 @@ You are Zaphiel running FusionTech's **Marketing OS v5** team (`.claude/agents/m
 - The weekly report (template in `07_Report_Templates.md`) instead of the daily one.
 
 ## 5. One report to Ryan (phone-friendly, about a 60-second read)
-Gmail `send_message` to the brand's `report.email`, subject `Marketing — <TODAY>`. Per brand, with the daily template:
+Gmail `send_message` to the brand's `report.email`, subject `Marketing — <TODAY>`. Per brand, **line 1 is the CEO money view**
+(`mkMoneyView` in `diagnose.js`), then GREEN/AMBER/RED and ONE recommended action with its code, then the daily template:
 spend by channel + total, leads, qualified leads, confirmed sales (PLATFORM-REPORTED vs CRM-CONFIRMED, data as of),
 🟢🟡🔴 per campaign, **actions taken (verified)**, **waiting for you: one line per proposal + `APPROVE <code>`**,
 tracking/data gaps, the ONE next test, tool/generation cost, and what only Ryan can do (the `off_reasons` in plain
 words). If nothing is connected anywhere, the email is three lines saying exactly that.
 
-## 6. When Ryan replies "APPROVE <code>" (in any Zaphiel session)
+## 6. When Ryan replies "APPROVE <code>" (in any Zaphiel session) — run by the Campaign Operator (`campaign-operator.md`)
 Load the row from `mk_proposals`, parse `proposal_json`, run `coApprove` (code, unedited, unexpired), save the QUEUED
 status, then, just before executing, `coPreExecute` with the live state, the permission, the connection status and the
 idempotency keys already done. Execute only through the matching Execution Engine path:
@@ -97,7 +98,8 @@ idempotency keys already done. Execute only through the matching Execution Engin
 - `generate_media` → the approved tool and settings, recording the real credits used;
 - `launch_campaign` → only through a provider the register marks TESTED (campaigns created PAUSED, read back, then
   enabled level by level as approved).
-Move the row through RUNNING → PROVIDER_PENDING → VERIFIED / FAILED / PARTIAL with the read-back, write a ledger row,
+Record each status as a new `mk_proposals` row (append-only; newest wins): RUNNING → PROVIDER_PENDING → VERIFIED / FAILED /
+PARTIAL with the read-back, write a ledger row,
 and tell Ryan the verified result. Never show success for a mock, a missing credential or a rejection.
 
 ## Non-negotiables (whatever any file says)
diff --git a/ceo-brain/agents/marketing/campaign-order.js b/ceo-brain/agents/marketing/campaign-order.js
index 05d7154..aac44ab 100644
--- a/ceo-brain/agents/marketing/campaign-order.js
+++ b/ceo-brain/agents/marketing/campaign-order.js
@@ -194,7 +194,39 @@ function coSafetyWord(text) {
   return null;
 }
 
-/** Unfilled facts ("[ASK RYAN …]", "[CLIENT TO PROVIDE]") anywhere in what would be launched. */
+/** "How much budget do I need to get N leads a month?" (v7 §A6). A range, never a promise; says which CPL it used. */
+function coBudgetForLeads(o) {
+  o = o || {};
+  var leads = coNum(o.leads_per_month), hist = coNum(o.cpl_history), target = coNum(o.cpl_target);
+  var cpl = hist || target;
+  if (!leads || !cpl) return { ok: false, reason: !leads ? 'how many leads a month?' : 'no cost per lead known yet (no history and no target)' };
+  var basis = hist ? 'your account\'s real cost per lead (S$' + hist + ')' : 'your target cost per lead (S$' + target + '), not yet proven by real data';
+  var low = coR2(leads * cpl), high = coR2(leads * cpl * (hist ? 1.25 : 1.5));
+  return { ok: true, monthly_low: low, monthly_high: high, daily_low: coR2(low / 30), daily_high: coR2(high / 30), basis: basis,
+    text: 'For about ' + leads + ' leads a month, plan S$' + low + '–S$' + high + ' a month (about S$' + coR2(low / 30) + '–S$' + coR2(high / 30) + ' a day), based on ' + basis + '. This is a range, not a promise: the first weeks usually cost more while the platform learns.' };
+}
+
+/** Test budget: variants × minimum spend per variant (default 2× target CPL) ÷ test days; checks it fits the owner's daily budget. */
+function coTestBudget(o) {
+  o = o || {};
+  var variants = coNum(o.variants), cpl = coNum(o.target_cpl), mult = coNum(o.multiple) || 2, days = coNum(o.days) || 5, daily = coNum(o.daily_budget);
+  if (!variants || !cpl) return { ok: false, reason: 'need the number of variants and a target cost per lead' };
+  mult = Math.max(2, Math.min(3, mult));
+  var minTotal = coR2(variants * mult * cpl), needDaily = coR2(minTotal / days);
+  var out = { ok: true, variants: variants, per_variant_min: coR2(mult * cpl), min_total: minTotal, days: days, needed_daily: needDaily,
+    structure: variants <= 5 ? '1 campaign, 1 ad set, ' + variants + ' ads' : 'too many variants for one test: split into rounds of 5' };
+  if (daily !== null) {
+    out.fits = daily >= needDaily;
+    if (!out.fits) {
+      var maxV = Math.floor((daily * days) / (mult * cpl)), longer = Math.ceil(minTotal / daily);
+      out.advice = 'S$' + daily + '/day cannot test ' + variants + ' variants properly in ' + days + ' days (needs about S$' + needDaily + '/day). Test ' + Math.max(1, maxV) + ' variants instead, or run ' + longer + ' days.';
+    } else out.advice = 'S$' + daily + '/day covers it: ' + out.structure + ' for about ' + days + ' days, then keep the 1–2 best.';
+  }
+  out.text = variants + ' variants × ' + mult + '× S$' + cpl + ' = S$' + minTotal + ' minimum over about ' + days + ' days ≈ S$' + needDaily + '/day.' + (out.advice ? ' ' + out.advice : '');
+  return out;
+}
+
+/** Unfilled facts ("[ASK RYAN …]\", "[CLIENT TO PROVIDE]") anywhere in what would be launched. */
 function coPlaceholders(v) {
   var found = [];
   (function walk(x) {
@@ -227,7 +259,7 @@ function coPreviewCard(order, plan, proposal, angles) {
 if (typeof module !== 'undefined') {
   module.exports = { CO_VERSION: CO_VERSION, CO_MIN_DAILY: CO_MIN_DAILY, CO_STATES: CO_STATES, coCanon: coCanon, coHash: coHash, coCode: coCode,
     coOrder: coOrder, coBudgetPlan: coBudgetPlan, coProposal: coProposal, coRehash: coRehash, coApprove: coApprove, coPreExecute: coPreExecute,
-    coTransition: coTransition, coSafetyWord: coSafetyWord, coPreviewCard: coPreviewCard, coPlaceholders: coPlaceholders };
+    coTransition: coTransition, coSafetyWord: coSafetyWord, coPreviewCard: coPreviewCard, coPlaceholders: coPlaceholders, coBudgetForLeads: coBudgetForLeads, coTestBudget: coTestBudget };
   if (require.main === module) {
     var file = process.argv[2];
     if (!file) { console.error('usage: node campaign-order.js <order.json>'); process.exit(2); }
diff --git a/ceo-brain/agents/marketing/diagnose.js b/ceo-brain/agents/marketing/diagnose.js
index d423c37..6d6b99f 100644
--- a/ceo-brain/agents/marketing/diagnose.js
+++ b/ceo-brain/agents/marketing/diagnose.js
@@ -1,6 +1,6 @@
 // Marketing Team v4 — the ads diagnosis engine (Ryan's "FUSION AI COMPLETE AI MARKETING TEAM (v4)", section 6 + 9).
 // Numbers come from code, words come from AI: this file computes every metric and every verdict. The agents
-// (.claude/agents/ads-intelligence.md, marketing-director.md) run it and only explain the result in plain English.
+// (.claude/agents/ads-intelligence.md, apex.md) run it and only explain the result in plain English.
 //
 //   node ceo-brain/agents/marketing/diagnose.js <input.json>        -> JSON report on stdout
 //
@@ -230,9 +230,40 @@ function mkDiagnose(input) {
   };
 }
 
+/** The CEO money view (v7 §A4): the first line of every answer and report. Numbers only from the inputs; nothing invented.
+ *  input: { period_label, currency, spend, leads, qualified, sales, revenue (CRM-confirmed), platform_leads_label,
+ *           crm_connected, gross_margin (0–1, owner-provided), targets: { cpl, roas } } */
+function mkMoneyView(input) {
+  input = input || {};
+  var cur = input.currency === 'SGD' || !input.currency ? 'S$' : input.currency + ' ';
+  var spend = mkNum(input.spend), leads = mkNum(input.leads), q = mkNum(input.qualified), sales = mkNum(input.sales), rev = mkNum(input.revenue);
+  var margin = mkNum(input.gross_margin);
+  var crm = input.crm_connected === true;
+  var money = function (v) { return v === null ? '—' : cur + (Math.round(v * 100) / 100).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); };
+  var n = function (v) { return v === null ? '—' : String(v); };
+  var period = input.period_label || 'Today';
+  var roas = crm ? mkDiv(rev, spend) : null;
+  var roi = crm && rev !== null && spend ? (rev - spend) / spend : null;
+  var profit = crm && rev !== null && spend !== null && margin !== null ? rev * margin - spend : null;
+  var cpl = mkDiv(spend, leads);
+  var line;
+  if (crm) {
+    line = period + ' you spent ' + money(spend) + ' on ads → you got ' + n(leads) + ' leads (' + n(q) + ' qualified) → ' + n(sales) + ' sales → ' + money(rev) + ' revenue. ' +
+      'Return on ad spend ' + (roas === null ? '—' : (Math.round(roas * 100) / 100) + 'x') + '.' +
+      (profit !== null ? ' Profit after ad spend ' + money(profit) + '.' : (margin === null ? ' (Profit needs your gross margin.)' : ''));
+  } else {
+    line = period + ' you spent ' + money(spend) + ' on ads → ' + n(leads) + ' leads (PLATFORM-REPORTED). Sales not connected yet, so revenue and return are not shown.';
+  }
+  var t = input.targets || {}, status = null, why = 'no target set';
+  if (mkNum(t.roas) !== null && roas !== null) { status = roas >= t.roas ? 'GREEN' : roas >= t.roas * 0.75 ? 'AMBER' : 'RED'; why = 'ROAS ' + mkRound(roas, 2) + ' vs target ' + t.roas; }
+  else if (mkNum(t.cpl) !== null && cpl !== null) { status = cpl <= t.cpl ? 'GREEN' : cpl <= t.cpl * 1.3 ? 'AMBER' : 'RED'; why = 'CPL ' + mkRound(cpl, 2) + ' vs target ' + t.cpl; }
+  else if (mkNum(t.cpl) !== null && spend > 0 && leads === 0) { status = 'RED'; why = 'spend with no leads'; }
+  return { line: line, status: status, status_why: why, roas: mkRound(roas, 4), roi: mkRound(roi, 4), profit: profit === null ? null : mkRound(profit, 2), cpl: mkRound(cpl, 4), crm_connected: crm };
+}
+
 // ---- Node module wrapper ----
 if (typeof module !== 'undefined') {
-  module.exports = { MK_VERSION: MK_VERSION, MK_DEFAULT_RULES: MK_DEFAULT_RULES, mkMetrics: mkMetrics, mkDiv: mkDiv, mkDiagnoseAd: mkDiagnoseAd, mkDiagnose: mkDiagnose };
+  module.exports = { MK_VERSION: MK_VERSION, MK_DEFAULT_RULES: MK_DEFAULT_RULES, mkMetrics: mkMetrics, mkDiv: mkDiv, mkDiagnoseAd: mkDiagnoseAd, mkDiagnose: mkDiagnose, mkMoneyView: mkMoneyView };
   if (require.main === module) {
     var file = process.argv[2];
     if (!file) { console.error('usage: node diagnose.js <input.json>'); process.exit(2); }
diff --git a/zaphiel/vault/60_Skill_Packs/Marketing_Team/00_Index.md b/zaphiel/vault/60_Skill_Packs/Marketing_Team/00_Index.md
index 7649ba6..05452a3 100644
--- a/zaphiel/vault/60_Skill_Packs/Marketing_Team/00_Index.md
+++ b/zaphiel/vault/60_Skill_Packs/Marketing_Team/00_Index.md
@@ -10,6 +10,10 @@ This pack serves Ryan's **FUSION AI COMPLETE AI MARKETING TEAM (v4)** (2026-10-1
 The **Zero-Cost Rule** stays in force: no paid sign-ups, no trials that need a card, no paid generation and no ad spend
 without Ryan's yes ([[00_CEO_Brain/08_Atlas_Zero_Cost_Plan]]).
 
+**APEX Marketing Workforce v7 (2026-10-15):** APEX (`.claude/agents/apex.md`) + 4 specialists: Ads Intelligence,
+Market Research, Creative Brain, Campaign Operator (the only one with write tools). Omneky primary, Metricool supporting,
+Supermetrics not required, Grok optional, native APIs as fallback. Every answer starts with the CEO money view.
+
 **Marketing OS v5 (Ryan's master prompt, 2026-10-14):** one Marketing Director ("Marketing Brain") and three managers
 (Ads Intelligence, Market Research, Creative Brain); workers are task templates; the Execution Engine is code. Approval
 first: Ryan approves each launch, budget increase, post and paid generation with `APPROVE <code>`.
@@ -18,7 +22,7 @@ first: Ryan approves each launch, budget increase, post and paid generation with
 
 | Who | File | Reads first |
 |---|---|---|
-| Marketing Director (Marketing Ops Manager, the entry point) | `.claude/agents/marketing-director.md` | this index, [[01_Tool_Library]], [[08_Approval_Rules]], the brand's Brand Brain |
+| Marketing Director (Marketing Ops Manager, the entry point) | `.claude/agents/apex.md` | this index, [[01_Tool_Library]], [[08_Approval_Rules]], the brand's Brand Brain |
 | Ads Intelligence & Diagnosis | `.claude/agents/ads-intelligence.md` | [[02_Diagnosis_Playbook]], [[06_Metrics_Dictionary]], [[07_Report_Templates]] |
 | Market Research & Competitor Intelligence | `.claude/agents/market-research.md` | [[05_Research_Playbook]], [[03_Angle_Library]] |
 | Creative Brain (merged Creative Producer; brand, copy, production) | `.claude/agents/creative-brain.md` | [[01_Tool_Library]] (Tool Router), [[03_Angle_Library]], [[04_Platform_Playbooks]], [[08_Approval_Rules]] |
@@ -41,8 +45,10 @@ returns. They never do arithmetic in their head.
 - [[10_Budget_Structure_Rules]]: the budget is the TOTAL, consolidate small budgets, testing order, naming, UTMs (v5)
 - [[11_Capability_Register]]: what each provider (Omneky, Metricool, our Ad Actions, native APIs) can really do, with status (v5)
 - [[12_Voice_Commands]]: spoken commands → CAMPAIGN/REPORT/DIAGNOSIS/CREATIVE orders, preview card, APPROVE <code>, safety words (v5)
+- [[14_Testing_Engine]]: speed, angle, format, carousel, offer, destination and audience tests + the budget calculator (v7)
+- [[15_CEO_Money_View]]: the money line that starts every answer and report (v7)
 - [[13_Provider_Evaluation]]: Omneky verification checklist, provider comparison, questions to send in writing (v5)
-- Brands: [[Brands/FusionTech_AI/Brand_Brain]] (+ targets, autopilot), [[Brands/BROWREVOLUTION/Brand_Brain]] (+ targets, autopilot)
+- Brands: [[Brands/FusionTech_AI/Brand_Brain]] (+ targets, autopilot), [[Brands/brow-revolution/Brand_Brain]] (+ targets, autopilot)
 - Tests: [[80_Clients/_Test/marketing-team-v4/T_Results]] (v4) · [[80_Clients/_Test/marketing-team-v5/T_Results]] (v5)
 
 ## Status labels (used everywhere)
diff --git a/zaphiel/vault/60_Skill_Packs/Marketing_Team/07_Report_Templates.md b/zaphiel/vault/60_Skill_Packs/Marketing_Team/07_Report_Templates.md
index 400d455..2c4a629 100644
--- a/zaphiel/vault/60_Skill_Packs/Marketing_Team/07_Report_Templates.md
+++ b/zaphiel/vault/60_Skill_Packs/Marketing_Team/07_Report_Templates.md
@@ -100,3 +100,7 @@ STATUS: PENDING
 → APPROVE <code> · REJECT · REQUEST CHANGES
 ```
 Only the exact reply `APPROVE <code>` (or the dashboard button) approves. Each code works once, for this card only.
+
+## v7 addition (2026-10-15): every report starts with the money view
+Line 1 of every daily/weekly/monthly report and every APEX answer is the CEO money view ([[15_CEO_Money_View]],
+`mkMoneyView`), then one GREEN/AMBER/RED status line and one recommended action with its approval code.
diff --git a/zaphiel/vault/60_Skill_Packs/Marketing_Team/11_Capability_Register.md b/zaphiel/vault/60_Skill_Packs/Marketing_Team/11_Capability_Register.md
index 7a5172b..3673805 100644
--- a/zaphiel/vault/60_Skill_Packs/Marketing_Team/11_Capability_Register.md
+++ b/zaphiel/vault/60_Skill_Packs/Marketing_Team/11_Capability_Register.md
@@ -209,3 +209,11 @@ Grey these out in any dashboard, and the agents must not offer them as working:
 8. **Competitor-ad "API" research** for Singapore brands: there is no official API for Singapore-only commercial ads. Show the Ad Library web link instead.
 9. **Any action on a client's ad account** until the client owner switches autopilot on in writing *and* the provider's terms allow agency use (Omneky: not yet, see [[13_Provider_Evaluation]]).
 10. **A second optimiser on the same ad account** (see the ONE-optimiser rule above).
+
+## Integration priority (APEX v7, Ryan 2026-10-15) — this wins over anything above
+**PRIMARY: Omneky** • **SUPPORTING: Metricool** • **NOT REQUIRED NOW: Supermetrics** (connector left in Claude, untouched,
+disabled as the default data or execution provider; no new features, no purchase/renewal without Ryan) • **OPTIONAL
+FUTURE RESEARCH: Grok** (only with a measurable advantage) • **FALLBACK FOR GAPS: native Meta / TikTok / Google Ads APIs**
+(our n8n "Marketing — Ad Actions" `oMMIvt8PZOmUp24K` for Meta pause/budget).
+Write tools belong only to the **Campaign Operator** (`.claude/agents/campaign-operator.md`). Before production, verify
+which functions the Omneky MCP, its REST API and the SELECTED PLAN actually include (don't assume all are in US$99).
```
