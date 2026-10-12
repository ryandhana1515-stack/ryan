---
tags: [zaphiel, skill-pack, titan, contracts]
version: 1.0 (2026-10-12)
---
# Hand-off contracts (files in `80_Clients/<client>/web/`)

Templates with empty values: `80_Clients/_TEMPLATE_Client/web/`. Shared plain-English board: `web/STATUS.md`.

## WEB_BUILD_REQUEST (ATLAS / John / Marketing → TITAN)
```json
{ "client_id": "", "requested_by": "", "project_type": "website|landing_page|funnel|web_app|portal|3d_experience|seo",
  "goal": "", "conversion_goal": "whatsapp|form|booking|purchase|call|quote",
  "industry": "", "audience": "", "deadline": "", "budget_tier": "", "existing_site": "",
  "brand_assets": "path", "crm_needed": true, "notes": "", "approvals_needed": [] }
```

## INTEGRATION_SPEC (TITAN → ATLAS)
```json
{ "project_id": "", "forms": [{ "name": "", "fields": [], "pdpa_consent": true, "destination": "crm.lead" }],
  "events": ["form_submit", "whatsapp_click", "booking_complete", "purchase"],
  "utm_capture": true, "click_ids": ["fbclid", "ttclid", "gclid"], "webhooks": [], "crm_fields": [],
  "lead_owner_rule": "", "payments": null, "calendar": null, "status": "requested" }
```
ATLAS answers by setting `status` (`requested` → `accepted` → `built` → `tested`) and filling the endpoint and the
test record id. TITAN never connects client systems directly.

## CAMPAIGN_PAGE_REQUEST (Marketing → TITAN)
```json
{ "campaign_id": "", "platforms": ["meta", "tiktok", "youtube"], "angle": "", "offer": "", "audience": "",
  "creative_assets": [], "destination": "landing|whatsapp|form", "tracking": ["pixel", "capi", "utm"], "deadline": "" }
```
Marketing supplies the angle, offer, audience and creative. TITAN builds the page and the tracking.

## WEB_STATUS (TITAN → everyone)
```json
{ "project_id": "", "stage": "", "done": [], "works_with_real_accounts": [], "simulated": [],
  "needs_client_info": [], "needs_approval": [], "costs": [], "blockers": [], "next_action": "", "preview_url": "" }
```
`STATUS.md` says the same thing in plain English, for Ryan and John.
