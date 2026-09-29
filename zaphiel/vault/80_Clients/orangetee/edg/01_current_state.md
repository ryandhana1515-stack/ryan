---
type: edg_output
agent: atlas
mode: DESIGN
checkpoint: 1
client: "OrangeTee"
lead_id: lead_wa6587587170_mumu7duk
provider: anthropic
generated: 2026-09-29T15:35:24.379Z
test_mode: false
---
# Current state — OrangeTee

# Current State — OrangeTee

## What we know today
OrangeTee is a Singapore residential property agency handling **sales, rentals, and new launches**. They currently have:
- An existing website (orangetee.com)
- An Instagram presence (@orangeteesingapore)
- WhatsApp in use (confirmed by customer, details unknown)

We do **not yet know** how enquiries are actually handled once they come in — that part of the workflow is UNKNOWN and needs to be asked.

```mermaid
flowchart TD
    A[Instagram @orangeteesingapore] -->|Enquiry - channel unknown, e.g. DM or click to WhatsApp| B[UNKNOWN: How enquiry reaches a person]
    C[Existing website orangetee.com] -->|Enquiry - form? phone? unknown| B
    D[WhatsApp - confirmed in use] --> B
    B --> E[UNKNOWN: Who receives / answers enquiry]
    E --> F[UNKNOWN: How follow-up happens]
    F --> G[UNKNOWN: How buyer/seller is tracked to close]
    G --> H[UNKNOWN: What happens after a deal closes]
```

## Narrative
Today, OrangeTee attracts interest via Instagram and its existing website, and WhatsApp is part of their process in some way. Beyond that, we do not yet know:
- Whether the current website has any enquiry form, and where those enquiries go
- Who answers Instagram DMs or WhatsApp messages, and how fast
- Whether there is any agent assignment process (e.g., by property, by area, by lead source)
- Whether there is any CRM, spreadsheet, or system currently tracking buyer/seller leads
- What happens after a lead is qualified — viewing scheduling, offer process, documentation, closing

This is expected at this stage — the customer's immediate request was a **website mock-up**, not a full operations review. We can proceed with the mock-up now, while continuing to gather the missing operational facts in parallel.
