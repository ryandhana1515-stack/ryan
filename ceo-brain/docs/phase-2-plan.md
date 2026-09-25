# Phase 2 — status 2026-09-25

Goal: connect real channels in and out, keep every guardrail.

| Item | Status |
|---|---|
| Outbound Sender sub-workflow (email now, WhatsApp when credential exists) | DONE `SAcnNxG1GWPwn3N7` |
| Auto-send low-risk replies from Lead Intake (`auto_send_low_risk`) | DONE, verified execution 165 |
| Approve / reject links in the owner email → Approve Reply workflow | DONE `uQxHTTdEkazgKpRT` |
| WhatsApp inbound adapter (Meta Cloud API → Lead Intake with history) | BUILT `3IhIJ5IYsB7wQQSg`, waiting for credential + Meta webhook switch |
| CEO Daily Brief (CEO Intelligence Agent v0) | DONE `Pew2PX1IcgdXqXr7`, 08:00 SGT |
| Sales Agent has the FusionTech company brain, persona John | DONE (agent v1.1.0) |
| Website Builder agent (John → brief → Open-in-Lovable approval email) | DONE `hSTRGnHVsu6tMOmH`, verified execution 176 |
| John Chat Console (hosted test chat with per-session memory) | DONE `ny60ozvH8B4uNpcb`, verified execution 177 |
| n8n AI Gateway credits | EXHAUSTED 2026-09-25 ("Payment required") — agents on rule fallbacks until Ryan tops up |
| Facebook/Instagram Lead Ads, website form, TikTok, respond.io, Gmail adapters | TODO |
| Follow-up nudge scheduler from `ceo_tasks` | TODO (due follow-ups already appear in the Daily Brief) |
| Google Calendar booking | TODO (needs a Google Calendar credential in n8n) |
| Supabase | TODO (migration ready) |
| Signed approval tokens, webhook header auth | TODO (Phase 3 hardening) |

Original plan:

1. **Inbound adapters** (see `integrations/README.md`): WhatsApp Cloud API (reuse workflow
   `eS8K8Si0VqToZajp`), Facebook/Instagram Lead Ads, website form, TikTok Lead Gen, respond.io,
   Gmail. Each = one small n8n workflow that maps to the lead contract and POSTs to
   `/webhook/ceo-brain/lead`. Add `CEO_BRAIN_WEBHOOK_SECRET` header auth on the webhook.
2. **Conversation continuity**: adapters pass `conversation_history`; the agent already accepts it.
3. **Approve → send**: an approval webhook (or reply-to-email) that marks the draft `approved` and
   an outbound adapter per channel (WhatsApp template/session message, Gmail reply).
4. **Follow-up scheduler**: n8n Schedule Trigger that reads `ceo_tasks` due now and re-runs the
   agent with the history (nudges, not spam — max 3, then FOLLOW_UP/LOST for a human).
5. **Google Calendar booking** for `book_discovery_call` (existing Calendar connector).
6. **Supabase**: run `database/migrations/0001_init.sql`, swap the five data-table nodes.
7. **Agent Router**: one n8n workflow that reads `agent.json` manifests and dispatches by
   intent/status; Sales Qualification becomes its first route.
8. **Dashboard** (Lovable): leads by status, tasks awaiting approval, agent-run quality
   (fallback rate, latency, confidence). Reads Supabase with RLS.
9. **Obsidian CEO Brain**: nightly markdown export of decisions/audit into the vault repo.

Not before: payments (Stripe), accounting, Lovable project creation, voice.
