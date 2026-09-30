---
type: edg_output
agent: atlas
mode: DESIGN
checkpoint: 1
client: "Ah Kow Plumbing"
lead_id: lead_wa6587587170_muoefz7m
provider: anthropic
generated: 2026-09-30T17:50:25.396Z
test_mode: false
---
# Current state — Ah Kow Plumbing

# Current State — Ah Kow Plumbing

## Narrative
Ah Kow Plumbing is a 4-plumber business in Singapore. All customer contact happens over WhatsApp. Ryan (the owner) personally reads and replies to every message himself, including late at night. When a job is agreed, he writes it into a paper notebook — there is no shared or digital job list. Quotes are sent to customers, but there is no system to track whether a customer responded, so follow-ups are frequently forgotten and likely lost sales.

## Flow (today)
```mermaid
flowchart TD
    A[Customer sends WhatsApp message] --> B[Ryan personally reads message - any time of day/night]
    B --> C{What does customer need?}
    C -->|New enquiry| D[Ryan replies manually, discusses job]
    C -->|Wants a quote| E[Ryan sends quote manually]
    D --> F[Job agreed]
    F --> G[Ryan writes job into paper notebook]
    G --> H[UNKNOWN: How job is assigned to a specific plumber]
    H --> I[UNKNOWN: How job completion/payment is recorded]
    E --> J{Customer responds?}
    J -->|Yes| F
    J -->|No - silence| K[No follow-up happens - quote forgotten]
    K --> L[Lost job opportunity]
```

## Notes
- No system currently attributes leads beyond "came via WhatsApp" — no ad/campaign source data.
- UNKNOWN: whether the 3 other plumbers see WhatsApp messages or only Ryan does.
- UNKNOWN: how a job is assigned to a specific plumber once agreed.
- UNKNOWN: how payment is collected/confirmed.
- UNKNOWN: whether there is any email use in the business.
