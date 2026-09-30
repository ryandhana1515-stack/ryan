---
type: edg_output
agent: atlas
mode: DESIGN
checkpoint: 1
client: "Tan Aircon Services Pte Ltd"
lead_id: lead_wa6587587170_muo5thc0
provider: anthropic
generated: 2026-09-30T13:52:17.127Z
test_mode: false
---
# Current state — Tan Aircon Services Pte Ltd

# 01_current_state.md — Tan Aircon Services Pte Ltd

## Narrative
Today, everything starts and ends in WhatsApp and paper/Excel. A customer messages Ryan's WhatsApp number to request an aircon servicing or repair booking. Ryan (or whoever picks up the chat) writes the booking details into a notebook and/or an Excel sheet. From there, a technician is assigned — but HOW that assignment happens (manually by Ryan? verbally? UNKNOWN) is not yet confirmed. Because there is no reminder system, technicians sometimes miss appointments. Similarly, when a quotation is given to a customer (process UNKNOWN — verbal, WhatsApp text, or written), there is no structured way to track whether the customer accepted, so follow-ups are frequently forgotten, and the business loses customers who would have converted. There is currently no visible invoicing, payment tracking or reporting layer — these are entirely manual or non-existent today.

## Current Workflow (Mermaid)
```mermaid
flowchart TD
    A[Customer sends WhatsApp message] --> B[Ryan / staff reads WhatsApp]
    B --> C[Booking details written in Notebook and/or Excel]
    C --> D{Technician assigned}
    D -->|UNKNOWN process| E[Technician goes on-site]
    E --> F[Service performed]
    F --> G{Quotation needed?}
    G -->|Yes| H[Quotation given - method UNKNOWN]
    H --> I[Customer considers]
    I -->|No reminder system| J[Follow-up often forgotten]
    J --> K[Customer lost / goes elsewhere]
    G -->|No| L[Job completed]
    L --> M[Payment - method UNKNOWN]
    M --> N[No invoice system confirmed]
    N --> O[No reporting layer - Ryan has no daily overview]

    style J fill:#ffdddd
    style K fill:#ffdddd
    style D fill:#fff3cd
    style H fill:#fff3cd
    style M fill:#fff3cd
    style N fill:#ffdddd
    style O fill:#ffdddd
```

## Confirmed vs Unknown Steps
- CONFIRMED: WhatsApp is the only lead source; booking details are recorded in notebook + Excel; quotation follow-ups are frequently missed; 3 technicians; appointments sometimes missed.
- UNKNOWN: how technicians are assigned to jobs; how quotations are actually produced and sent; how payment is collected today; whether invoices are issued at all; whether recurring servicing/contracts exist; whether there's a service area limit.
