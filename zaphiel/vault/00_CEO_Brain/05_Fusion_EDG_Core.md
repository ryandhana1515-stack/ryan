---
type: product
tags: [ceo-brain, atlas, edg, crm, fusion-edg-core]
status: development
updated: 2026-09-30
---
# 05 · Fusion EDG Core (built by ATLAS v2)

**What it is.** The reusable engine that turns ATLAS from "designs a CRM" into "builds a working CRM + EDG". Every client
system is built on it. Ryan: "Build all now" (2026-09-30).

- **Agent:** [[10_Agents/07_CRM_Architect|ATLAS]]. `.claude/agents/atlas.md` now has **BUILD ENGINE (v2)**, sections B1–B18
  (Ryan's text, verbatim).
- **Code:** private repo **`ryandhana1515-stack/fusion-edg-core`** (Ryan created it on 2026-09-30; the code moved there
  with its history, and the copy in the `ryan` repo was removed). The vault keeps the docs and links only.
- **Status:** STAGING live with FAKE data only (2026-09-30): Vercel project `fusion-edg-core-api`,
  https://fusion-edg-core-api.vercel.app (Vercel login needed), on the Supabase dev database `fusion-edg-dev`.
  Nothing is in production, and no real customer data is used.

## What was built (all tested: 51/51 pass, typecheck clean)
| Milestone | What | Proof |
|---|---|---|
| A | ATLAS upgraded in place (no second ATLAS) | diff shown; 254 lines added, 0 removed |
| B1 | Tool registry (23 tools), capability detection, the one `executeTool` safety pipeline, approvals (L4 QA gate, L5 named approver, bound to the exact input, single use), audit, idempotency, MOCK adapters | 19 tests |
| B2 | Multi-tenant database: every table has organization_id and **forced RLS**; append-only audit; WON/LOST human-only; every active lead owned with a next action; FAKE seed; backup + restore tried | 11 tests, incl. the **critical cross-tenant** test |
| B3 | Transactional outbox + dispatcher (retry, backoff, dead-letter → manual queue + alert, idempotent consumers); 8 n8n templates | 6 tests; the 8 workflows created **inactive** in n8n, folder "EDG Core — TEST templates (inactive)" |
| C | Vertical slice: website form / WhatsApp / email → dedupe (+65, lower-case) → contact + lead → round-robin owner → next action + date → acknowledgement → follow-up → events + audit → KPI views → CEO Daily Brief (numbers from SQL; the LLM only narrates; a number guard rejects invented numbers) | 15 end-to-end tests: new lead, duplicate lead, duplicate webhook, messaging outage → manual queue, wrong role denied, cross-tenant blocked, opt-out respected, "data unavailable" |

The docs are in the private repo (`docs/`): plan, 6 ADRs, architecture diagrams, env var names, runbook, cost,
test report and client demo script. `pnpm demo` runs the demo.

## What Ryan does (the system cannot do these itself)
1. ~~Create the private GitHub repo `fusion-edg-core`~~ **done 2026-09-30**: the code is there and 51/51 tests pass.
2. ~~Create a Supabase project~~ **done 2026-09-30**: `fusion-edg-dev` (Tokyo). Migrations 001–008 and FAKE data are
   applied, RLS is verified there, and the security advisor reports 0 findings. The original wording of this step was:
   **Create a Supabase project for development/staging** (Pro plan, about $25/month; it includes a $10 compute credit).
   Then connect Supabase to Claude, or give a database URL through the secret manager, **never in chat**.
3. **Approve each next step:** ~~staging deploy (L3)~~ **done 2026-09-30**, then production (L4, needs the QA gate), and any L5 action.
4. **Per real client:** WhatsApp Business Platform setup, CRM/accounting connections, and a signed data-ownership and
   handover agreement.

## Important finding
- An n8n job every minute is about 43,200 executions a month, while n8n Starter includes 2,500.
- So in production the event dispatcher and the follow-up runner run on the API's own scheduler (Vercel Cron / Supabase
  pg_cron), not on n8n.
- n8n stays for intake webhooks, email polling and the daily brief (ADR-0004).

## Business modules (added 2026-09-30, Fusion EDG Core PR #4)
Quotations → invoices → payments · appointment booking · client WhatsApp numbers · Xero sync · Google Calendar ·
one-click approval links. They are listed for ATLAS in `.claude/agents/atlas.md` → **B19 EDG MODULE CATALOG**; the
details are in `fusion-edg-core/docs/modules.md`. 82/82 tests pass on FAKE data. The live WhatsApp, Xero and Google
connections are written from each provider's documentation but NEED VERIFICATION on real test accounts.

## ATLAS Approve & build (2026-09-30, Fusion EDG Core PR #5)
ATLAS design → `16_edg_spec.json` → Ryan's email button → `/atlas/build` shows the plan → **Approve & build** → the
client's own system is built on the test system in one step, self-tested with a fake enquiry, and shown on a review page.
Demo: `80_Clients/_Test/lim-renovation-fake-demo/edg/16_edg_spec.json`.

**Automatic build (2026-09-30, Ryan: "Yes"; Fusion EDG Core PR #6):** no button needed. The ATLAS workflow calls
`POST /atlas/auto-build` 30 seconds after saving the design, and Ryan gets a second email with the review link. Test platform only;
going live stays Ryan's decision. Needs n8n to reach the platform: Vercel Authentication must be "Only Preview Deployments".

**Team app (2026-09-30, Fusion EDG Core PR #7):** every built system has a phone screen at `/app`. It has five tabs: Customers board, Jobs, Quotes, Today and Team.
- Open it from the system page ("Open the app"). Team members sign in with a one-time link the owner makes in Team.
- Customers move through the stages by themselves when a quote is sent, a job is booked or a job is done.
- Test tools (fake data): "Test WhatsApp" and "Add example customers".

**The AI team (2026-09-30, Fusion EDG Core PR #8):** every business ATLAS builds gets an AI assistant plus workflows. They are stored as data and run by one tested engine (`packages/crm/src/agents.ts`, `automations.ts`).
- The assistant thinks with Claude (`claude-sonnet-5`) once `ANTHROPIC_API_KEY` is set in Vercel.
- The daily timer (`/cron/tick`, 08:00 SGT) needs `CRON_SECRET`.
- Details: `docs/modules.md` → "The AI team". ATLAS's rules for designing it: `.claude/agents/atlas.md` → B20.

**Mobile job card (2026-10-01, Ryan: "ok" to building it first; Fusion EDG Core PR #16):** in the team app, Jobs → **Open job card**.
- The technician sees the customer (call / WhatsApp), the job address with **Open map**, the job notes, the service's
  checklist, materials used, before/after photos, notes for the office, the customer's signature, and **Complete job**.
- Works on a weak signal: every tap is kept on the phone and sent by itself when there is signal again.
- Completing needs the customer's signature or a written reason; the office sees the summary on the customer.
- Checklists come from the business (Jobs → Checklists) or ATLAS's spec, never invented. AI agents can never touch a
  job card. Tested: 137/137 on FAKE data; database change applied to the test system (0 security warnings).
- Also fixed: a new system's self-test no longer leaves its FAKE booking in a technician's calendar.

**Staff logins + "own customers only" (2026-10-01, Ryan: "do"; Fusion EDG Core PR #17):**
- Each person signs in at `/app/login` with their email and their own password. They set it under Team → My login
  after signing in once with the link their manager makes; that link is also "forgot password".
- 5 wrong tries → wait 15 minutes. Passwords are stored only as scrambled codes nobody can read, not even admins.
- Owner switch in Team → **Who sees which customers**: everyone sees all (default), or each salesperson/technician
  sees only their own customers and the customers of their own jobs. Owners, managers and the AI still see everything.
  The database enforces it. ATLAS can preset it for a client (e.g. a property agency).
- Tested 147/147; database change on the test system; checked live there (admin 5 customers, one technician 2).


**Facebook lead forms + property-portal enquiries (2026-10-01, Ryan: "do"; Fusion EDG Core PR #18):**
- Facebook/Instagram lead forms: when someone fills in a client's form, the customer appears on the board by itself,
  given to the next person in turn, with follow-ups. Before the first client: the client gives FusionTech access to
  their Facebook Page, and Meta must approve FusionTech's app (app review).
- Property portals and other enquiry emails: the owner gets a private address in Team → "Where customers come from";
  FusionTech connects the client's enquiry inbox to it. The person who enquired is read from the email; an email that
  cannot be read goes to a person.
- Test system: Team → Test tools → "Send a test Facebook lead" / "Send a test portal email".
- Tested 161/161; database change on the test system. NEEDS VERIFICATION: a real Page, and one real email per portal.

**Stock and purchasing (2026-10-01, Ryan: "stock and purchasing"; Fusion EDG Core PR #19):**
- Team app → **Stock**: what is in the store and in each technician's van, what is low, and purchase orders.
- Stock only changes when something is received, used on a job, moved or corrected, so the figures can be trusted.
  A correction needs a manager and a reason; a team member's count needs a manager's OK.
- Materials a technician picks on the job card come off their van when the job is completed.
- When an item runs low, an order to the supplier is prepared and a manager is emailed. Nothing goes to a supplier
  until a person approves it. Above the business's limit, a second person approves.
- Deliveries are recorded in full or in part; the supplier's bill is checked against what actually arrived.
- Owners switch it on under Team; ATLAS switches it on when a client talks about stock or parts (not when they
  already use an ERP). Test system: Stock → "Add example stock (test)".
- Tested 174/174; database change on the test system. Not built yet: barcode scanning, stock value reports, bills to Xero.

**Owners build their own workflows (2026-10-02, Ryan: "i want this"; Fusion EDG Core PR #21):**
- AI team tab → **New workflow**: When (something happens, then wait; or every day/week) → Only if → Then do. Same safe building blocks as ATLAS; no code.
- **Describe it in words**: the AI turns a sentence into the form; the owner checks and saves.
- Rehearsed with a real customer of the business before saving (nothing sent); refused with a plain reason if it cannot work.
- Change / Remove on every workflow (ATLAS's too); removing keeps the history. Owners, administrators, managers only.

**Connect another app (2026-10-02, Ryan: "i want this"; Fusion EDG Core PR #22):**
- Team → **Connect another app**. For a client's own software that has no ready-made link (booking system, form, shop, Zapier, Make).
- **Receive customers**: a private address; each customer the other app sends arrives like any enquiry.
- **Send to an app**: workflow step "Send the details to another app" (signed; public internet addresses only; owner told if it fails).
- Tested 192/192; database change on the test system. Still needs Zaphiel: apps that need a login (OAuth) or pulling data on a schedule.
