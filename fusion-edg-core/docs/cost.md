# Cost estimate (internal infrastructure, monthly, USD)

Internal planning numbers for FusionTech, **not a price for a client**. Client pricing is Ryan's decision, and
third-party costs are always billed separately from FusionTech fees.

**Sources.** The official pricing pages, read on 2026-09-30 (search excerpts):
- supabase.com/pricing
- vercel.com/pricing and vercel.com/docs/plans
- n8n.io/pricing and support.n8n.io

Prices change: re-check them before any client proposal.

**Assumptions.** One small client: fewer than 2,000 leads a month, a few thousand WhatsApp conversations, and about 10
staff users, in one region.

## ESSENTIAL (to run one client in production)

| Item | Plan | Monthly | Note |
|---|---|---|---|
| Supabase (DB + Auth + RLS + Storage + daily backups, 7-day retention) | Pro | **$25** | Includes $10 compute credit (one Micro instance). Each additional project is from $10/month. |
| Vercel (API + cron + frontend) | Pro | **$20 per developer seat** | Viewer seats are free. Usage beyond the included allowances is billed per the pricing page. |
| n8n (intake webhooks, IMAP, daily brief) | Starter (2,500 executions a month), or Pro (**$50/month billed annually**) | Starter: see n8n.io/pricing | Ryan already runs n8n Cloud. Keep the every-minute jobs out of n8n (ADR-0004). |
| **Essential total** | | **about $45 + the n8n plan** | Shared across clients where Supabase/Vercel projects are shared (multi-tenant). |

## OPTIONAL
- Dedicated Supabase project per client (stronger isolation): from +$10/month plus compute.
- Supabase Team (SSO, longer retention): from $599/month. Only when a client requires it.
- Vercel Speed Insights: $10/month per project plus usage.

## SCALING (grows with usage; the formulas are on the providers' pages)
- **Supabase:** MAU above 100,000 at $0.00325 each; larger compute sizes; disk above 8 GB; egress above 250 GB.
- **Vercel:** function and edge usage beyond Pro's inclusions.
- **n8n:** more executions (a higher tier).
- **WhatsApp Business Platform:** Meta's per-message pricing (by category and country): pass it through to the client.
- **LLM:**
  - Routing: rules → small → standard → advanced (B14).
  - Every call is logged in `agent_actions` with tokens.
  - The daily brief is one standard-tier call a day per client.

**Not included:** domains, email provider, accounting and CRM subscriptions (the client's own), and WhatsApp BSP fees
if a BSP is used.
