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
| WhatsApp (Meta Cloud API) | `CEO Brain — WhatsApp Inbound` `3IhIJ5IYsB7wQQSg` (published) | WhatsApp Business Cloud credential (System User token + phone number id); the July sandbox token expired | **built — needs credential + Meta webhook pointed at /webhook/ceo-brain/whatsapp** |
| Omnichannel inbox (`/inbound-message`) | existing n8n workflow `JVGDhhmPFSATl7B7` | none | Phase 2 wiring |
| Facebook / Instagram Lead Ads | new n8n workflow: Facebook Lead Ads trigger → map → POST | Meta app + page token | Phase 2 |
| TikTok Lead Generation | new n8n workflow: webhook → map → POST | TikTok Marketing API token | Phase 2 |
| respond.io | respond.io webhook → map → POST | respond.io API token | Phase 2 |
| Website form (Lovable site) | fetch() to the webhook from the form handler | none (add `CEO_BRAIN_WEBHOOK_SECRET` header in Phase 2) | Phase 2 |
| Gmail (inbound enquiries) | Gmail Trigger → map → POST | existing Gmail credential | Phase 2 |

Outbound: every customer message leaves through `CEO Brain — Outbound Sender` (`SAcnNxG1GWPwn3N7`):
email via Gmail (live), WhatsApp via the Cloud API node (re-add once the credential exists).
Google Calendar booking, Supabase, Stripe, accounting, Lovable/GitHub project creation, Obsidian
sync and voice AI are later phases and each gets its own adapter here when built.
