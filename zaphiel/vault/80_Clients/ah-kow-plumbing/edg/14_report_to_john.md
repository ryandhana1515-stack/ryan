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
# Report to John — Ah Kow Plumbing

# Report to John — Ah Kow Plumbing (Checkpoint 1)

## Plain-language summary
Ah Kow Plumbing is a small, hands-on plumbing business (Ryan + 3 plumbers) in Singapore that runs entirely on WhatsApp today. Ryan personally answers every customer message himself — including late at night — and writes job details into a paper notebook. There's no shared system between the 4 plumbers, and when Ryan sends a customer a quote, there's nothing in place to follow up if the customer goes quiet, so quotes are often forgotten and likely turn into lost jobs.

What Ryan is asking for fits this picture well: a CRM to replace the notebook, an AI agent that can answer WhatsApp and book jobs (so Ryan isn't doing it all personally at all hours), reminders for appointments, and automatic follow-up on quotes that haven't been answered.

This is a good, right-sized fit for our EDG approach — we do **not** need a big enterprise system here. A lean WhatsApp + CRM + AI responder + job reminders + quote follow-up setup should cover everything Ryan described.

## What's still unclear (see questions below)
Before we can design the pipeline, data model and integrations properly, we need a bit more detail on: how jobs currently get assigned to a specific plumber, how quotes are priced today, working hours/service area, and whether payment is collected on the spot or invoiced.

## Build status
This is DESIGN MODE, Checkpoint 1 only (company model + current state + problem map). No architecture, platform choice, or build spec yet — that comes at Checkpoint 2, after Ryan confirms this understanding is correct and answers the open questions below.
