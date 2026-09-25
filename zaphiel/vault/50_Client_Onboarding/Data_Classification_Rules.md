---
type: rules
priority: P0
status: designed
last_reviewed: 2026-09-25
source: "[[FusionTech AI — Product & Build Directive]] Parts 5–6"
tags: [onboarding, data, classification, p0]
---
# Data classification rules — CONNECT / IMPORT / INDEX / SUMMARIZE / LEAVE / NOT REQUIRED

Every data source found in discovery gets **one availability** and **one handling** decision. Connect, don't copy everything.

## Availability (what discovery records)
`AVAILABLE` · `NOT AVAILABLE` · `UNKNOWN` · `CONNECTION REQUIRED` · `IMPORT REQUIRED` · `NOT REQUIRED`

## Handling (what the plan decides)
| Handling | Use when | How | Examples | Source of truth after |
|---|---|---|---|---|
| **CONNECT (live)** | the data changes daily and a system owns it | OAuth/API through the [[30_Platform_Services/Tool_Connector_Gateway]]; entry in [[40_Registries/Integration_Registry]] | CRM, calendar, accounting, e-commerce orders, WhatsApp | the client's system stays the source of truth ([[40_Registries/System_of_Record_Registry]]) |
| **IMPORT** | the data lives in files and will now live in the CEO Brain | CSV/Excel mapping, dedupe, dry run, reconciliation, sign-off ([[50_Client_Onboarding/Data_Migration]]) | customer lists in spreadsheets, old lead lists, price lists | CEO Brain CRM becomes the source of truth; the file is retired |
| **INDEX** | documents agents must search but not change | index into the [[30_Platform_Services/Context_Knowledge]] service with the tenant boundary | SOPs, policies, product docs, FAQs, contracts (read-only) | the document stays where it is |
| **SUMMARIZE** | long procedures agents only need the gist of | summarized into the tenant's knowledge notes; original linked | onboarding manuals, process descriptions | original |
| **LEAVE IN PLACE** | needed rarely, sensitive, or out of scope | recorded in the map with owner and location; nothing copied | HR files, medical records, legal archives | untouched |
| **NOT REQUIRED** | no chosen module uses it | recorded as not required | anything outside scope | — |

## Rules
1. Sensitive categories (health, payroll, ID numbers, minors) default to **LEAVE IN PLACE** unless a module needs them and Ryan approves the purpose.
2. Never two sources of truth: an entity is either CONNECTed (client system rules) or IMPORTed (CEO Brain rules), never both.
3. Every CONNECT needs the client owner's authorization; status `planned` until [[20_Specialist_Workers/Integration_Health_Worker]] tests it.
4. Every IMPORT needs a dry run and a reconciliation report before the client signs off.
5. Everything indexed or imported carries `tenant_id`; nothing crosses tenants.
