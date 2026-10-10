---
type: plan
title: ATLAS ZERO-COST DEVELOPMENT & CLIENT READINESS PLAN
date: 2026-10-10
owner: Ryan Dhana
status: active (Ryan's rule, 2026-10-10)
---
# ATLAS ZERO-COST DEVELOPMENT & CLIENT READINESS PLAN

**Ryan's rule (2026-10-10):** *Build Atlas to be ready for customers, but do not make me pay for software that no customer
currently needs.* Atlas learns the technical part now; the real connection happens when a paying client brings their own
account. Ryan's full instruction is kept word for word below.

## In plain words

- Nobody asks Ryan to sign up for Xero, QuickBooks, payroll, Shopify or any other software "to test". Not even the free
  ones, until a real client needs that software.
- Atlas uses each provider's public documentation and **mock tests** (fake versions of the software that behave like the
  real thing) to get ready.
- When a real client arrives, **the client** connects **their own** account (one secure button or form). Their software
  subscription is theirs, never FusionTech's.
- Atlas's own CRM covers the basics, so a small company doesn't need an outside CRM or Xero: customers, sales, quotations,
  invoices, payments, bookings, stock, staff and reports.

## A. Already complete (reuse, do not rebuild)

| Area | What works today (test system) |
|---|---|
| CRM | Customers, leads, sales pipeline, owner per lead, follow-ups, customer timeline, duplicate merge, import from Excel/CSV |
| Sales money | Quotations from the approved price list, invoices, payment status, overdue reminders (drafts) |
| Bookings | Appointments without double booking, reminders, technician job cards |
| Stock | Items, stock places, suppliers, purchase orders, receiving, low-stock alerts |
| HR | Staff records, documents, leave (Singapore rules), attendance, onboarding, training, HR assistant |
| AI team | The client's own WhatsApp assistant, workflow engine (when-this-then-that), approvals screen |
| Owner | Morning brief, KPI numbers from the database, owner pipeline page, Master Control |
| Atlas itself | Software Knowledge Base (about 40 providers), compatibility checker, automatic test build from John's chat, **customer answers now update the built system (2026-10-10)** |
| Safety | Secure one-time form for client logins, encrypted keys, no passwords in chat |

## B. Can be built now, for free

1. **Sales team performance** (Ryan's top ask): monthly sales target per salesperson, daily and monthly sales, a KPI board
   (enquiries, replies, quotations, deals won, sales value), marketing ROI (sales vs the ad spend the owner enters).
2. **Vouchers and packages**: sell a voucher or prepaid package, track sessions used and the balance left, expiry, who sold it.
3. **Simple money book** ("basic accounting without Xero"): daily sales, money in and out, expenses with categories, a
   monthly summary. A company that uses Xero later can still connect it.
4. **Payroll export** as a generic spreadsheet (from attendance and leave), so no payroll subscription is needed yet.
5. **Connector code for the top providers** from their official documentation, labelled honestly (see the ladder below),
   with mock tests: Xero, QuickBooks, Google Calendar, Shopify, HubSpot, Zoho, Talenox.
6. Finish switching on the Phase A2 pieces in n8n (customer answers → plan update, duplicate WhatsApp guard, Discovery
   Console → Atlas).

## C. Can be tested free with developer accounts (optional, not now)

Only when Ryan wants a deeper test. Before any sign-up, Zaphiel checks and tells Ryan whether a card or a paid plan is needed.

| Provider | Free developer option (from the provider cards; recheck before use) |
|---|---|
| Xero | Free developer account with a Demo Company (Starter: up to 5 connected companies) |
| Meta / WhatsApp | Free developer app with a test number |
| Google (Calendar, Sheets) | Free Google Cloud project for sign-in permission |
| Shopify | Free Partner account with development stores |
| HubSpot, Zoho | Free developer / test accounts |

**Decision (Ryan, 2026-10-10): none of these is opened now.** It happens only when a real client needs that software.

## D. Must wait for a real client

- The client's own Xero / QuickBooks / payroll / Shopify subscription and their permission to connect it.
- The client's WhatsApp Business number and Meta business verification.
- QuickBooks: Intuit's Singapore eligibility is asked first.
- Going live: a separate live database and hosting (a small monthly cost; Zaphiel gives the exact figure when the first
  client says yes, before anything is bought).
- The PDPA data-processing agreement (Ryan's lawyer).

## E. Not needed now (do not buy)

Xero, QuickBooks, MYOB, Talenox or any payroll plan, Shopify, any outside CRM, inventory software, extra marketing tools,
a unified API (Apideck, Merge, Codat), production hosting.

## Connector honesty ladder

Every connector carries one of: **DOCUMENTED → CODE IMPLEMENTED → MOCK TESTED → SANDBOX TESTED → REAL ACCOUNT TESTED →
PRODUCTION READY**. Passing mock tests is never "production ready". Facts about a provider are dated, and rechecked on its
official documentation before a real client is connected.

## When the first paying client arrives (the 10 steps)

1. Atlas names the software the client uses. 2. Checks the Knowledge Base. 3. Rechecks the provider's current
documentation. 4. Checks whether a connector exists. 5. Lists the subscriptions **the client** needs. 6. Prepares the client's
authorisation checklist in plain English. 7. The client authorises their own account (secure button or form). 8. Atlas
configures the connection. 9. It is tested with the client's authorised data. 10. Ryan approves, and it goes live.

## Ryan's instruction, word for word (2026-10-10)

> FUSION AI — ATLAS ZERO-COST DEVELOPMENT POLICY. […] 1. NO UNNECESSARY PAID SUBSCRIPTIONS: Do not ask me to purchase
> subscriptions for Xero, QuickBooks, MYOB, HR and payroll platforms, Shopify, External CRM systems, Accounting applications,
> Inventory software, Marketing software, Other third-party business tools unless a real implementation requires them and I
> have explicitly approved the expense. Free developer accounts, free sandboxes, free API documentation and free testing
> environments are acceptable, provided they do not create unexpected charges or require automatic conversion to paid
> plans. Always tell me about any payment or billing requirements before registration. NEVER start a paid subscription,
> free trial requiring a payment method, or chargeable API service without my approval. […] 4. ATLAS MUST SUPPORT ITS OWN
> CRM […] customer records, lead management, sales pipeline, follow-ups, appointments, quotations, invoices, vouchers,
> payment-status tracking, products and services, employee access, reports, customer communication history, business
> workflow automation […] without creating a duplicate CRM. […] 5. PREPARE NOW, CONNECT WHEN CUSTOMERS ARRIVE […] Do not ask
> me to register for every software provider in advance. […] 8. I am a business owner, not a programmer. […] 9. DO NOT STOP
> DEVELOPMENT […] FINAL RULE: BUILD ATLAS TO BE READY FOR CUSTOMERS, BUT DO NOT MAKE ME PAY FOR SOFTWARE THAT NO CUSTOMER
> CURRENTLY NEEDS.

Also said in the same message (voice): his friend built the CRM he uses today (sales, vouchers, daily invoices, basic
accounting); Ryan wants his own version so his yearly earnings are not visible to the friend, and wants every salesgirl to
see her own sales, targets, KPI and ROI daily and monthly.
