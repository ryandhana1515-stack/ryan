---
generated_by: build-vault.js
source: zaphiel/memory.md
source_last_updated: 2026-09-25 (session 2, final: Obsidian vault is LIVE — this file is archived, the vault is the brain)
built: 2026-09-25
tags: [zaphiel, memory]
---
# WHAT CAN ACTUALLY ACT (read this before promising automation)

Diagnosed 2026-08-08 after Ryan said the fleet "does nothing". He was right:

- **UPDATE 2026-09-25 (afternoon): Gateway credits EXHAUSTED again** — both Claude nodes returned
  "Payment required"; Lead Intake and Website Builder fell back to their rule engines (safe,
  generic). Ryan must top up n8n AI credits or add an Anthropic API key credential. Check
  `ceo_agent_runs.provider` = `rules`/`fallback` to see when this is happening.
- **UPDATE 2026-09-24: n8n Gateway credits WORK again** — the managed Anthropic credential
  answered on `lmChatAnthropic` and `anthropic` nodes (claude-sonnet-4-6) with no API key. The
  "Payment required" failures of 2026-08-05/08 no longer reproduce. Workflow `NOb10f0yUA8i8saA`
  (board meeting) is therefore probably runnable again — untested since.
- **n8n holds only TWO credentials: Gmail and GitHub.** There is no Shopify, Meta, TikTok,
  Metricool, Higgsfield or Kling credential in the instance. So every "agent" in [[02 The AI company (n8n @ ryan1515.app.n8n.cloud, project uFcEmgtYEFyGauyy)|§2]] can
  only think, write to a data table, and email. **None of them can touch the store or the
  ad account.** That is the root cause of the queue-receipt problem — not prompt wording.
- **Meta ads cannot be automated yet.** Ad account `767841886323870` (ACTIVE, SGD) returns
  `is_ads_mcp_enabled: false` — Meta is still rolling Ads MCP out to this account, so
  create/edit ad calls are refused by Meta, not by us. It also has
  `has_payment_method: false`, so nothing could spend anyway. Read-only research
  (ads_library_search, benchmarks) still works. Recheck the flag periodically.
- **The only thing with real hands is a Claude session** (this one), whose MCP connectors
  reach Shopify, Meta, Higgsfield, Kling, Metricool, Canva, Gmail, Drive, Calendar, Slack,
  Vercel, Lovable, Figma and n8n. Anything that must *do* rather than *draft* has to run
  in a session — either interactively, or on a schedule via a Routine/trigger.
- Practical rule: before telling Ryan something is "automated", check whether the executor
  actually holds a credential for that system. If it doesn't, say so.

Up: [[00 Home]]
