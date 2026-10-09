---
tags: [atlas, fusion-edg-core, gap-analysis]
date: 2026-10-02
source: "[[_sources/Atlas_Master_CRM_EDG_AI_Workforce_Prompt.pdf]]"
---
# Atlas master spec: audit, gap analysis and phased plan (2026-10-02)

Ryan, 2026-10-02, sharing *Atlas Master CRM + EDG + AI Workforce System Prompt* (58 sections): "I read this entire
thing so you know what I actually want for Atlas right now". The PDF is in `_sources/`, word for word. Its section 54
asks for this document **before** any major code change. Nothing below has been built yet: it waits for Ryan's "go".

## How the spec maps onto what exists (no new agent, spec §0)
The spec's "Atlas" is the whole business operating system for a client. Today that is already two parts working together:
- **ATLAS, the systems architect agent** (`.claude/agents/atlas.md` + n8n `9XQWSgTBszRc0Jxj`). It learns the client's business and writes the design (onboarding §4, blueprint, modules).
- **Fusion EDG Core** (private repo `fusion-edg-core`, staging `fusion-edg-core-api.vercel.app`). It builds and runs that design: CRM, workflows, the client's AI agents, dashboard, integrations.

**Recommendation:** "Atlas" = ATLAS (designs) + EDG Core (runs), sold as one product. John stays the client-facing sales agent (§13). No Atlas 2, and no agent is overwritten.

## A. Existing system audit (status words: TESTED = automated tests on FAKE data; staging = live on the test system)
| Spec § | Area | Today | Status |
|---|---|---|---|
| 1, 37, 38 | Tenant isolation, security | every table forced row-level security per business; cross-tenant tests; secrets only server-side | TESTED, staging |
| 33 | Audit trail | who/what/when, human or AI, previous/new values, result | TESTED |
| 35 | Reliability | idempotency keys, retries with backoff, outbox events, nothing sent twice; failures → manual queue | TESTED |
| 4 | Onboarding → blueprint | ATLAS discovery (D0–D13), company classification, module choice, spec → one-click build, "Finish your setup" page | TESTED, staging |
| 6, 7, 32 | CRM, customer memory | one contact per phone/email (dedupe), owner in turn, stages, next action, notes, history on the customer card | TESTED, staging (partial: see C) |
| 8, 9 | WhatsApp / omnichannel | WhatsApp, website form, Facebook lead forms, portal emails, other apps (private address) → one customer; AI agent replies, hands over to a person | TESTED; live WhatsApp NEEDS VERIFICATION (Ryan's step 2) |
| 11, 12 | Pipeline + follow-ups | per-client stages with SLA hours; workflows chase unanswered customers, quotes, invoices | TESTED, staging |
| 18 | Appointments | free slots, no double booking, reminders, reschedule, complete / no-show, Google Calendar adapter | TESTED; Google live NEEDS VERIFICATION |
| 15 | Inventory | stores + vans, movements only, counts, low stock → draft purchase order, approvals, receiving, bill check | TESTED, staging (no reserved stock) |
| 17 | Finance | quotes (price list only), invoices, payments, Xero sync — not a full accounting system (as the spec wants) | TESTED; Xero live NEEDS VERIFICATION |
| 24 | Morning brief | from SQL only, "data unavailable" when a source is missing | TESTED, staging |
| 27, 45, 46 | Rule engine, builder, simulation | trigger + conditions + actions; owners build their own; rehearsed with a real customer before saving (nothing sent); "Run everything now (test)" | TESTED, staging (partial: see C) |
| 28 | Human-in-the-loop | tool levels L0–L3; agents can never approve quotes, take payments or mark won/lost (database refuses) | TESTED |
| 30 | Roles | owner, admin, manager, sales, support, viewer; own-customers-only option; enforced in the database | TESTED (partial: see C) |
| 34 | Integrations | adapters (mock vs live) for WhatsApp, email, Meta leads, Google, Xero, any app by address | TESTED; live accounts NEEDS VERIFICATION |
| 20 | Field operations | mobile job card: checklist, materials, photos, signature | TESTED, staging |

## B. Existing features to preserve
Everything in A. In particular: the safe tool catalog (agents act only through tested tools), rehearsal before any
workflow is saved, the price-list-only quote rule, movements-only stock, forced RLS, the audit log, idempotency,
ATLAS's discovery and build flow, John as the sales agent, the n8n CEO Brain workflows.

## C. Missing or partial (by spec section)
| § | Gap | Missing today |
|---|---|---|
| 29 | **Approval Center** | approvals exist in place (quote link, purchase orders), but there is no single screen with Approve / Reject / Request changes, reason, amount, deadline |
| 41 | **Notification Center** | alerts go out by email; there is no in-app list with severity, owner, read/resolved |
| 48, 35 | **Work queue / exception queue screen** | the manual queue and failed workflow runs are recorded but not shown as one queue with owner, priority, due time |
| 36 | **System health** | no screen for integration status, last successful sync, failed workflows, queued jobs, agent failures |
| 20 | **Tasks screen** | tasks are created (by workflows, intake), but there is no task list with overdue / blocked / unassigned |
| 39, 23, 50 | **Command Center first view** | the "Today" tab shows the numbers; it does not yet answer "what needs attention / approval / what next" in one place |
| 7, 32 | **Customer 360 + safe merge** | the card shows history, but not one full timeline (quotes, jobs, invoices, payments, messages together); duplicates are prevented, but there is no "possible duplicate → merge after a person confirms" |
| 21 | **Customer service cases** | complaints only trigger hand-over; there are no cases with priority, owner, response time, resolution |
| 25, 40 | **Ask Atlas + global search** | no natural-language questions over the business data (facts vs inference, with evidence); no search across everything |
| 27, 45 | **Workflow builder v2** | no approval step, escalation, owner per rule, versioning or loop guard; run history exists |
| 26 | **More events** | deal.won/lost, order.created, payment.received, complaint.created, task.overdue, stock.low as workflow triggers (some exist) |
| 16 | **Orders and fulfilment** | not built (orders, reserved stock, packing, shipping, tracking) |
| 19 | **Marketing intelligence** | lead source is recorded; no ad spend, cost per lead or ROAS |
| 14 | **HR** | staff and roles only; no leave, onboarding, documents, training |
| 10 | **Email intelligence** | reads forwarded enquiry emails only; no mailbox reading, summaries or reply drafts |
| 30 | **More roles** | Finance, Warehouse, HR, Marketing, Customer Service roles |
| 47, 49 | **Agent registry + process discovery** | each client's AI agents are listed, but there is no health or availability view; no automation-opportunity finder |

## D. Security and reliability risks
- Live channels (WhatsApp, Xero, Google, Meta) are proven only against recorded fakes until real accounts are connected. Every one stays NEEDS VERIFICATION until then (§55: do not claim integrations work until verified).
- Email has no domain yet (`onboarding@resend.dev`): fine for testing, not for real clients.
- "Send to another app": DNS rebinding remains a small, documented risk (limited by the no-redirect rule and the timeout).
- Ask Atlas (§25) must be read-only and run under the asking user's permissions; never free SQL.

## E. Proposed architecture improvements
- One **work item** model behind approvals, notifications, the exception queue and tasks, so the Command Center reads one source. Built on the existing `approvals`, `manual_queue`, `automation_runs`, `tasks` and `events`; no rewrite.
- Workflow steps gain `approval` and `escalate`. Rules gain an owner and a version number. A loop guard means a workflow cannot trigger itself more than once per subject.
- Ask Atlas = the existing agent runtime with read-only tools (counts, lists, customer summary), each answer citing the records it used.

## F. Database changes (expected)
`021` work items + notifications (read/resolved, severity, owner) · `022` support cases · `023` workflow versions,
owner, approval/escalation steps · later, only as clients need them: `orders`, marketing spend, HR leave.
Each with forced RLS, cross-tenant tests and a staging checksum.

## G. Integration plan
Prove what exists before adding more: live WhatsApp (Ryan's step 2) → email domain → Google Calendar and Xero with a
pilot client. Then, only when a client needs them: Microsoft calendar, Shopify, Respond.io, Meta/TikTok/Google ads spend.

## H. Workflow map
Customer contact → source → dedupe → CRM → intent → AI agent answers or hands over → owner + next action →
follow-up workflows → appointment / quotation (approval) → won/lost (a person) → invoice (approval) → payment →
job / fulfilment → review request → reactivation. Every step writes an event, which drives workflows. Every
approval, failure and escalation lands in the Command Center.

## I. Phased build plan (adjusted to what exists: spec priorities 1–2 are largely done)
1. **Command Center v1**: Approval Center, Notification Center, work / exception queue, tasks screen, system health, a first view that answers what happened / needs attention / needs approval / do next (§20, 23, 29, 36, 39, 41, 48).
2. **Customer 360**: one timeline, possible-duplicate merge with a person confirming, customer service cases (§7, 21, 32).
3. **Ask Atlas + search**: natural-language questions with evidence, global search, the morning brief in the app (§24, 25, 40).
4. **Workflow builder v2**: approval and escalation steps, owners, versions, loop guard, more events (§26, 27, 45).
5. **Modules on demand**: orders and fulfilment with reserved stock, marketing intelligence, HR basics, extra roles (§14, 15, 16, 19, 30).
6. **Advanced**: email intelligence, agent registry and health, automation-opportunity finder (§10, 47, 49).

Each phase must meet the Definition of Done (§56): screen + backend + database + permissions + workflow + validation +
errors + audit + tests + real integration behaviour where it applies. Then it goes to staging, Ryan tries it, and the
vault is updated.

## J. Files expected to change (Phase 1)
`fusion-edg-core`: `packages/db/migrations/021_*.sql`, new `packages/crm/src/workitems.ts`, `notify.ts`,
`automations.ts`, `apps/api/src/staff-app.ts`, `apps/api/public/app.html` (new Command Center first view), tests in
`apps/api/test/`, `docs/modules.md`. This repo: the vault, and `.claude/agents/atlas.md` (catalog rows, only after Ryan's "save").

## What Ryan does
1. Say **"go"** to start Phase 1 (or name a different first phase).
2. Step 2 of the real test: a spare phone number + a separate Meta app "FusionTech Clients" (WhatsApp).
3. A domain for email before real clients.
4. One pilot client (a real business) by Phase 3, so the integrations are proven on real accounts.
5. "save" for the two ATLAS catalog rows (owner workflows, connect another app).

## Progress
- 2026-10-02 — **Phase 1 done** (Ryan: "Go"): Command Center = Home tab, Approval Center, notifications, work queue, tasks, system health (Fusion EDG Core PR #23, migration 021, 202 tests). Phase 2 (Customer 360) waits for Ryan's go.

## Status against the 24-module blueprint (2026-10-09, Ryan sent "Atlas Complete Business Operating System Breakdown")
- **Built (13):**
  - 01 Command Center; 02 CRM; 03 Sales; 05 Follow-ups; 08 Appointments;
  - 10 Inventory; 12 Procurement; 13 Finance; 14 Accounting (Xero);
  - 19 AI Workforce; 20 Automation Center; 21 Approval Center; 24 Master Control.
- **Partly built (6):**
  - 04 WhatsApp & Communications: no shared inbox, no mailbox reading; live WhatsApp waits for a number.
  - 06 Marketing: the Metricool data reader is done; the dashboard and Ads Diagnosis are not built.
  - 17 Documents & Company Brain: approved FAQ and knowledge for agents only.
  - 18 Reports: morning brief and KPIs only; no weekly or monthly reports.
  - 22 Integrations: adapters and status exist; live accounts are unverified.
  - 23 Permissions: 6 roles; no finance, HR or warehouse roles.
- **Not built (5):** 07 Branding & Creative Studio; 09 Customer Service cases; 11 Orders & Fulfilment; 15 HR; 16 Projects & Tasks (only the tasks list exists).
- The blueprint's own rule: "Do not build 25 independent agents"; agents are reusable capabilities switched on per company.
