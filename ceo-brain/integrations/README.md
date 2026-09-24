# Integrations (channel adapters)

Phase 1 exposes ONE entry point. Every channel becomes a thin adapter that translates its
native webhook into the lead-intake payload and POSTs it:

```
POST https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead
Content-Type: application/json

{ "tenant_id": "biogreen", "name": "...", "phone": "...", "email": "...", "company": "...",
  "industry": "...", "source": "facebook", "channel": "whatsapp", "message": "...",
  "conversation_history": [{ "role": "customer", "content": "...", "ts": "..." }],
  "external_ids": { "facebook_lead_id": "..." }, "test_mode": false, "ai_mode": "live" }
```

Contract: `schemas/lead-input.schema.json`. Response: the structured `SalesQualificationResult`
wrapped with lead id, status change, follow-up task and observability fields.

## Adapter status

| Channel | Adapter | Credential needed | Status |
|---|---|---|---|
| Manual / test / any HTTP client | none — call the webhook | none | **working** |
| WhatsApp (Meta Cloud API sandbox) | existing n8n workflow `eS8K8Si0VqToZajp` can forward to the webhook | Meta WhatsApp token (already in that workflow) | Phase 2 wiring |
| Omnichannel inbox (`/inbound-message`) | existing n8n workflow `JVGDhhmPFSATl7B7` | none | Phase 2 wiring |
| Facebook / Instagram Lead Ads | new n8n workflow: Facebook Lead Ads trigger → map → POST | Meta app + page token | Phase 2 |
| TikTok Lead Generation | new n8n workflow: webhook → map → POST | TikTok Marketing API token | Phase 2 |
| respond.io | respond.io webhook → map → POST | respond.io API token | Phase 2 |
| Website form (Lovable site) | fetch() to the webhook from the form handler | none (add `CEO_BRAIN_WEBHOOK_SECRET` header in Phase 2) | Phase 2 |
| Gmail (inbound enquiries) | Gmail Trigger → map → POST | existing Gmail credential | Phase 2 |

Outbound (sending the approved reply back on the channel), Google Calendar booking, Supabase,
Stripe, accounting, Lovable/GitHub project creation, Obsidian sync and voice AI are Phase 2+
and each gets its own adapter file here when built. Nothing in Phase 1 sends anything to a
customer.
