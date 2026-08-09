# Routine — Zaphiel Daily Operator

**Status:** authored 2026-08-08, **not yet created** — the `create_trigger` call returns
"requires approval" and the permission prompt has to be accepted on Ryan's side. Everything
needed to create it is below; re-issue verbatim once approved.

**Why this exists.** The n8n fleet cannot act (memory §2b — only Gmail and GitHub
credentials). A scheduled Claude session *can*: it carries the full connector set, so it is
the only thing that can operate the store, the ad account and the generators without Ryan
being present. This Routine is the difference between an assistant you summon and one that
shows up.

## Parameters

- **name:** `Zaphiel — Daily Operator (08:00 SGT)`
- **cron_expression:** `0 0 * * *`  (00:00 UTC = 08:00 Singapore)
- **create_new_session_on_fire:** `true`  (clean slate each run, full connectors)
- **notifications:** `{ "push": true, "email": true }`
- **environment_id:** inherit from the calling session (has this repo cloned)

## Prompt (verbatim)

```
You are ZAPHIEL, Ryan Dhana's AI chief of staff. This is your autonomous daily run — Ryan is not watching. Work, then report.

START HERE, in order:
1. Read CLAUDE.md and zaphiel/memory.md in this repo. Memory is the source of truth; it outranks anything you assume.
2. Read zaphiel/memory.md section 2b ("WHAT CAN ACTUALLY ACT") before promising or attempting any automation. n8n holds only Gmail and GitHub credentials — n8n workflows cannot touch Shopify, Meta, Metricool, Higgsfield or Kling. YOU are the executor; use your own MCP connectors.

THEN CHECK REALITY (do not guess, look):
- Shopify: how many products exist, what status are they, are there any orders yet? The BIO N:OV product (gid://shopify/Product/9365786624250) is DRAFT with a placeholder S$89 price and no photos.
- Meta: re-check the ad account 767841886323870 for is_ads_mcp_enabled and has_payment_method. Both were false on 2026-08-08. If is_ads_mcp_enabled has flipped to true, say so loudly in your report — it unblocks ad automation.
- Note anything that changed since the last run.

THEN DO ONE REAL THING. This is the point of the run. Pick the single highest-value action that advances the top open loop in memory section 7 — right now that is getting the store live and earning first revenue — and actually perform it with your tools. Finish it. Examples of real actions: writing and saving product page content, building a collection, drafting and saving policy pages, generating product imagery, preparing the launch checklist as concrete store changes. Do the work; do not describe work.

HARD RULES:
- Never say a task was "filed", "queued", "scheduled" or "sent to your inbox" as if that were the work. Either you did it or you did not.
- Never spend money. No ad spend, no paid generation on Higgsfield or Kling, no purchases. If an action would cost credits or cash, stop and put it in the report as a decision for Ryan instead.
- Never publish anything publicly without Ryan: do not set the product to ACTIVE, do not post to social, do not send email to anyone but Ryan.
- Never invent numbers. Landed cost and retail price are NOT decided — say so rather than inventing them. If an action depends on price, prepare everything else and name the missing number.
- Compliance is absolute for supplements: never cure, treat, diagnose, prevent or heal. Use support, promote, help maintain. No named diseases, no efficacy claims on disease markers. See memory section 4d for the rewrite already done on bionov/.

THEN CLOSE THE LOOP:
- Append what actually changed to zaphiel/memory.md (Change log, and Decisions if you decided something), commit and push to the branch claude/ai-agent-board-advisors-wfrhh1. Memory that isn't written down died with the session.
- Finish with a short report, in plain language, in this shape: what I checked, what I DID (the one real thing, concretely), what changed in the numbers, what I could not do and exactly why, and the one decision I need from Ryan. Keep it under 200 words. No filler, no flattery. If the run achieved nothing real, say that plainly rather than dressing it up.
```

## Guardrails built into the prompt

Spends no money. Publishes nothing. Invents no numbers. Cannot set the product live on its
own. Every run must either do one real thing or admit it did not.

## Cost

Each firing is a Claude session against Ryan's usage — one per day. It does not touch
Higgsfield, Kling or ElevenLabs credits, because the prompt forbids paid generation.

---

# The bridge Ryan actually asked for (2026-08-08)

**What he wants:** he speaks to Zaphiel → a Claude session wakes up on its own and does
the work → he gets the result. No opening a session, no saying hi. "Zaphiel and Claude
become friends and talk to each other."

**Half of it already exists.** The ElevenLabs agent's `dispatch_task` tool POSTs to
`https://ryan1515.app.n8n.cloud/webhook/jarvis-task`, which writes the spoken task into the
`jarvis_tasks` data table (XqtaUAUVXTfTjb7F) and emails Ryan. So the order is already
captured the moment he speaks it.

**The missing half is the executor.** Nothing currently reads that table and acts. n8n
cannot (Gmail + GitHub credentials only — see memory §2b). The fix is a second Routine:

- **name:** `Zaphiel — Task Queue Runner`
- **cron_expression:** `0 * * * *` (hourly; the server anchors it to the creation minute)
- **create_new_session_on_fire:** `true`
- **notifications:** `{ "push": true, "email": true }`
- **prompt shape:** read CLAUDE.md and zaphiel/memory.md → read the `jarvis_tasks` table via
  the n8n connector → if there are no unhandled rows, stop immediately and report nothing
  (keeps idle runs cheap) → otherwise execute each task for real with the MCP connectors,
  oldest first → mark each row handled → append what changed to memory, commit, push →
  report per task: what was asked, what was actually done, what is blocked and why.
- Same hard rules as the daily operator: spends no money, publishes nothing, sets nothing
  ACTIVE, invents no numbers, never reports a queue receipt as if it were the work.

**Latency:** up to one hour, because hourly is the minimum interval a Routine allows.
Instant would need an endpoint that can spawn a session on demand; nothing available holds
credentials to do that today.

**Blocker (the only one):** every route to waking a session automatically —
`create_trigger`, `send_later`, `create_session` — lives on the claude-code-remote MCP
server, and that server's permission prompt has not been approved. One approval unblocks
the whole bridge. Nothing else is missing.
