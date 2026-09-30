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
# Report to John — Tan Aircon Services Pte Ltd

# Report to John — Tan Aircon Services Pte Ltd

## Plain-language summary
Ryan runs a small aircon servicing company with 3 technicians. Right now, every customer books through WhatsApp, and Ryan (or his team) writes the job down in a notebook and Excel. Because there's no system reminding anyone, technicians sometimes miss appointments, and — more costly — when a quotation is sent to a customer, nobody reliably follows up, so those customers quietly disappear. Ryan doesn't want a patch; he's asked for the full connected system: WhatsApp enquiries captured automatically, bookings with reminders, automatic follow-ups, quotations, invoices, payment tracking, and a daily report so he can see the whole business at a glance every day.

This is a great, well-scoped fit for our EDG approach — a small business with one main channel (WhatsApp), a clear operational flow (book → service → quote → pay), and a very clear pain point (forgotten follow-ups costing customers).

## What we understand so far
- Single lead channel: WhatsApp only
- 3 technicians, 3 users needed in the system
- No existing CRM, accounting, or scheduling software — clean slate
- Core desired modules: lead capture, booking + reminders, follow-up automation, quotations, invoices, payment tracking, CEO daily report

## What we still need before we can design the full architecture
See questions_open below — these are not optional extras, they directly affect how we design bookings, quotations and payments.

## Build status
This is DESIGN MODE, checkpoint 1 only (company model + current state + problem map). No architecture, platform choice or build spec has been produced yet. Awaiting Ryan's confirmation on the summary and answers to the open questions below before proceeding to future-state design.
