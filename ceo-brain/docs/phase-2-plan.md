# Phase 2 (NOT started — awaiting approval of Phase 1)

Goal: connect real channels in and out, keep every guardrail.

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
