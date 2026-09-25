---
tags: [zaphiel, directive, ceo-brain, build-prompt, verbatim]
received: 2026-09-25
from: Ryan Dhana
status: in progress — Phase 1 done 2026-09-25, see [[00_CEO_Brain/02_Build_Backlog]]
---
# FUSIONTECH AI — CLAUDE CODE BUILD PROMPT v3
## Upgrade the CEO Brain inside my Obsidian vault

> Ryan's words, verbatim (2026-09-25). Zaphiel executes this phase by phase; Ryan approves each phase.

You are working inside my Obsidian vault (the "CEO Brain"). I have two source documents:
1. **CEO Brain Blueprint (original, 6 pages)** — the BASELINE. 1 CEO Orchestrator + 15 head agents, capability map, discovery, skill packs, industry packs, Universal Agent Contract, 10-phase roadmap.
2. **CEO Brain Review v2 (10 pages)** — the GAP ANALYSIS / ADDENDUM. P0/P1/P2 gaps, data-onboarding system, shared platform services, agent must-do / must-not-do rules, new specialist workers, build order v2.

Your job: merge Review v2 into the vault on top of the baseline, WITHOUT breaking what already exists.

---

## STEP 0 — Before you write anything (mandatory)

1. Scan the whole vault. List every existing folder, agent note, template and MOC (map of content).
2. Show me a short report: what exists, what matches the blueprint, what is missing, what is duplicated.
3. Propose the folder plan below adapted to my existing structure. **Wait for my "OK" before creating or moving files.**
4. Never delete or rename my existing notes. If something should move, propose it; I approve.
5. Work in a git branch or make a backup copy of the vault first (`/_backups/YYYY-MM-DD/`).

---

## STEP 1 — Target vault structure

Adapt to what already exists. Only create what is missing.

```
00_CEO_Brain/
   00_Master_Rules.md
   01_Architecture_v3.md
   02_Build_Backlog.md
   03_Decision_Log.md
   04_Changelog.md
10_Agents/
   00_CEO_Orchestrator.md
   01_Discovery_Solution_Architect.md
   02_Sales_CRM.md
   03_Marketing_Growth.md
   04_Creative_Studio.md
   05_Website_App_General.md
   06_Medical_3D_Web.md
   07_CRM_Architect.md
   08_ERP_Operations.md
   09_Workflow_Automation.md
   10_Finance_Ops.md
   11_HR_Workforce.md
   12_Inventory_Supply_Chain.md
   13_Customer_Success.md
   14_Data_BI_KPI.md
   15_Security_Governance_QA.md
20_Specialist_Workers/
   Client_Onboarding_Agent.md
   Data_Migration_Worker.md
   Integration_Health_Worker.md
   Approval_Inbox_Agent.md
   Deployment_Release_Worker.md
   Training_Adoption_Agent.md
   Support_Incident_Agent.md
   Cost_Usage_Agent.md
   Knowledge_Curator.md
30_Platform_Services/
   Identity_Tenant.md
   Context_Knowledge.md
   Tool_Connector_Gateway.md
   Approval_Service.md
   Workflow_Event_Service.md
   Audit_Service.md
   Policy_Service.md
   AI_Gateway.md
   Notification_Service.md
   Evaluation_QA.md
   Observability.md
40_Registries/
   Integration_Registry.md
   System_of_Record_Registry.md
   Agent_Permission_Matrix.md
   KPI_Dictionary.md
50_Client_Onboarding/
   Onboarding_Workflow.md
   Discovery_Questions.md
   Data_Classification_Rules.md   (CONNECT / IMPORT / INDEX / SUMMARIZE / LEAVE / NOT REQUIRED)
   Client_Digital_Company_Map_TEMPLATE.md
60_Skill_Packs/          (keep existing)
70_Industry_Packs/       (keep existing)
80_Clients/
   _TEMPLATE_Client/     (tenant folder template — one folder per client, never mixed)
90_Templates/
   Agent_Contract_TEMPLATE.md
   Worker_TEMPLATE.md
   Platform_Service_TEMPLATE.md
   Integration_Entry_TEMPLATE.md
   ADR_Decision_TEMPLATE.md
```

---

## STEP 2 — Universal Agent Contract template (every agent note uses this)

Put this in `90_Templates/Agent_Contract_TEMPLATE.md`, then apply it to all 16 head agents + 9 workers.

```
---
type: agent
agent_id: 
name: 
version: 1.0
status: draft | designed | built | tested | live
build_phase: 
owner: Ryan
last_reviewed: 
tags: [agent]
---
## 1. Identity & purpose
## 2. Inputs (what it receives, from whom)
## 3. Outputs (structured format — JSON schema or table)
## 4. MUST DO
## 5. MUST NOT DO
## 6. Read permissions (systems / data)
## 7. Write permissions (systems / data)
## 8. Needs human approval when...
## 9. Decision rights (what it can decide alone)
## 10. Memory (what it keeps, where, how long)
## 11. Workflow steps
## 12. Handoffs (to which agent, trigger, payload)
## 13. Platform services used (link [[...]])
## 14. Tools / connectors (link to Integration Registry — status must be real)
## 15. KPIs & logs
## 16. Tests & acceptance criteria
## 17. Failure / fallback behaviour
## 18. Open questions for Ryan
```

Universal execution rule, written into every agent:
**verified context → structured output → permission check → action or approval → audit log → measurable result.**

---

## STEP 3 — Fill each agent with the Review v2 rules

Copy the MUST DO / MUST NOT DO from Review v2 sections 5 & 6 into each agent note, word-for-word, then expand. Summary:

| # | Agent | MUST DO | MUST NOT DO |
|---|---|---|---|
| 0 | CEO Orchestrator | Route company-wide work; combine results; track unresolved issues; enforce approvals; produce management view | Become source of truth; bypass permissions; do sensitive actions without approval |
| 1 | Discovery / Solution Architect | Map business, processes, systems, data, source of truth; phased target architecture | Invent requirements; promise unvalidated integrations; collect unnecessary sensitive data |
| 2 | Sales / CRM | Capture, qualify, follow up, schedule, maintain pipeline; prepare approved proposal inputs | Promise final price/terms without authority; expose credentials/prompts; fabricate facts |
| 3 | Marketing Growth | Channels/campaigns, nurture, attribution, reporting | Publish regulated/high-risk claims without review; change budgets outside limits |
| 4 | Creative Studio | Brand-consistent copy, visual briefs, assets, creative QA | Invent testimonials/certifications; use unlicensed assets; override brand identity |
| 5 | Website/App General | Premium responsive sites/apps, forms, CRM capture, analytics, SEO/accessibility, deployment QA | Ship generic AI templates; deploy untested; expose secrets client-side; fake facts |
| 6 | Medical / 3D Web | Premium medical UX, reviewed-content workflow, accessibility/performance, fallbacks | Give clinical advice; invent credentials/outcomes; publish unreviewed medical claims |
| 7 | CRM Architect | Schema, lifecycle, dedupe, migration, routing, permissions, dashboards, integrations | Duplicate sources of truth; migrate without reconciliation; default to broad access |
| 8 | ERP / Operations | Jobs/orders/projects, procurement, approvals, fulfilment, service, exceptions | Automate unstable processes; hide exceptions; alter critical records outside rules |
| 9 | Workflow Automation | Triggers, conditions, approvals, retries, exception queue, logs, alerts, recovery, reconciliation | Silent failures; infinite retries; unlogged side effects; hardcoded secrets |
| 10 | Finance Ops | Invoice/AP/AR/expense/collections admin, approvals, reconciliation support, reporting | Move money, approve payments/refunds or alter books without authorization |
| 11 | HR / Workforce | Recruitment admin, onboarding, leave, training, performance process, offboarding/access revocation | Unsupported employment decisions; expose employee data; leave access active after offboarding |
| 12 | Inventory / Supply Chain | Stock movement, reorder, PO, warehouse, fulfilment, returns, counts, discrepancies | Silent stock adjustments; uncontrolled orders; ignore negative stock |
| 13 | Customer Success | Tickets, onboarding, SLA, complaints, renewals, health, escalation | Auto-close serious complaints; unauthorized compensation; hide escalations |
| 14 | Data / BI / KPI | Definitions, ETL, quality, KPI dictionary, dashboards, forecasts, anomalies, lineage | Mix definitions; present stale data as live; hide uncertainty; unversioned KPI changes |
| 15 | Security / Governance / QA | Permissions, privacy, tests, release gates, backups, monitoring, recovery, audits | Rubber-stamp releases; shared secrets; skip rollback tests; weaken controls |

For each agent, also add: which **platform services** it uses (link notes), which **registries** it reads/writes, and its **build phase** (Step 6).

---

## STEP 4 — Create the P0 foundation notes FIRST

These are the highest priority. Each gets its own note with: purpose, data model/schema, rules, owner agent, tests, status.

1. **Client Onboarding & Data Discovery** — guided conversation, never "give us all your data". Flow: Conversation → Company Map → System Inventory → Data Source Map → Connect/Import/Index Plan → Authorization → Validation → CEO Brain Provisioning.
2. **Tenant Provisioning** — separate client workspace, data boundary, environments, credential boundary, default policies. One folder per client in `80_Clients/`, never mixed.
3. **Identity & Permissions** — roles, OAuth/SSO where available, least privilege, approval authority, joiner/mover/leaver lifecycle. Build `Agent_Permission_Matrix.md` (rows = agents, columns = systems, cells = none/read/write/approval).
4. **Integration Registry** — schema fields: connector_name, owner, auth_type, scopes, api/webhook, token_expiry, rate_limits, health, last_sync, failures, reauth_needed, **status (planned / authenticated / tested / live)**.
5. **System-of-Record Registry** — for each entity (customers, leads, invoices, employees, products, orders, documents): authoritative system, who may write, who may read, sync direction.
6. **Data Migration** — CSV/Excel mapping, dedupe, validation, dry-run, rollback, reconciliation, client sign-off checklist.
7. **Dev / Staging / Production** — separate environments, test data, release gate, rollback, change control.

Then P1 (AI/model governance, workflow reliability, human task inbox, customer portal, commercial engine, adoption & training), then P2 (cost/FinOps, business continuity, data lifecycle).

---

## STEP 5 — Architecture deliverables to write in the vault

Produce these as notes (Markdown + Mermaid diagrams where useful):
- `01_Architecture_v3.md` — versioned technical architecture (agents on top, 11 shared platform services underneath, registries, tenants)
- Database / tenant model (tables, keys, tenant_id on every record)
- Integration Registry schema
- System-of-Record Registry
- Client onboarding workflow
- Universal Agent Contract template
- Approval model (who approves what, thresholds, timeouts, escalation)
- Event / retry model (correlation IDs, idempotency keys, queues, retry limits, dead-letter queue, manual recovery)
- Deployment environments
- `02_Build_Backlog.md` — phased implementation backlog with checkboxes

**Key architecture rule:** agents do NOT each rebuild permissions, logging, approvals, retries and notifications. They call the shared platform services.

---

## STEP 6 — Build order v2 (use this as the backlog phases)

1. CEO Orchestrator + shared identity / tenant / audit / approval foundation
2. Discovery & Solution Architect + Client Onboarding / Data Discovery
3. CRM Architect + Sales/CRM + source-of-truth registry
4. Workflow Automation + event / retry / exception / manual-recovery framework
5. General Website/App + premium website QA and deployment pipeline
6. Data/BI/KPI + KPI dictionary + CEO daily/weekly intelligence
7. Security/Governance/QA + staging / release / rollback / backup tests
8. ERP/Operations, then Finance, HR, Inventory (only per client need)
9. Customer Success + Marketing Growth + Creative Studio
10. Medical/3D specialist + extra industry packs only when required

**First sellable package:** Discovery + CEO Brain + CRM + AI Sales Agent + Workflow Automation + WhatsApp/Email + Dashboard + premium website/mock-up.

---

## STEP 7 — Hard rules (never break these)

- Discover before building. Integrate before duplicating. Automate only stable processes.
- Keep one source of truth per entity. Require approval for sensitive actions. Log material actions. Measure business results.
- **Do not claim an integration works until it is actually authenticated and tested.** Registry status stays "planned" until I confirm.
- Never put API keys, passwords or tokens in any Obsidian note. Write `stored in: <password manager / .env>` instead.
- Never delete, rename or overwrite my existing notes without approval.
- Never build all 16 agents at once. Finish one phase, show me, then continue.
- Never mix client data between tenant folders.
- Never invent client facts, prices, testimonials or certifications.
- Use [[wikilinks]] between agents, services and registries so the Obsidian graph shows real connections.
- Every change goes into `04_Changelog.md` (date, what changed, why).

---

## STEP 8 — How to work with me

- Work phase by phase. At the end of each phase give me: files created, files changed, open questions, what I need to do next.
- Put every question you cannot answer yourself into the agent's "Open questions for Ryan" section AND a combined list in `02_Build_Backlog.md`.
- Keep language simple. I'm building this to sell to SMEs.

---

## DEFINITION OF DONE (the vault is ready when)

1. A new client can be discovered without asking them to organize all data manually.
2. Their data/systems can be mapped to connect / import / index / leave-in-place.
3. A separate tenant can be provisioned safely.
4. Agents know exactly what they may read/write and when approval is required.
5. Workflows survive failures and can be recovered.
6. Every material action is auditable.
7. Staging and production are separated.
8. The CEO receives reliable KPI / exception intelligence.
9. FusionTech can measure per-client cost and business result.
10. The same core can be reused for the next client without copying insecure one-off logic.

---

## WHAT RYAN DOES (not Claude Code)

These need me, a human. Claude Code: remind me of these, don't pretend to do them.

**Now (before / during Phase 1)**
- [ ] Open Claude Code inside the Obsidian vault folder (so it can read/write the notes)
- [ ] Put the original Blueprint PDF and Review v2 PDF inside the vault (e.g. `/_sources/`) so Claude Code can read both
- [ ] Back up the vault (copy the folder) before the first run
- [ ] Review Claude Code's Step 0 report and reply "OK" or correct the folder plan
- [ ] Decide approval authority: who approves what (me, Dad, client owner) and money limits

**Accounts & integrations (only I can log in)**
- [ ] Choose the core stack for the first package (CRM, workflow tool e.g. n8n, WhatsApp provider, email, dashboard, hosting)
- [ ] Create accounts and connect/authenticate each tool myself
- [ ] Store all keys in a password manager or `.env` — never in Obsidian
- [ ] Test each connection, then tell Claude Code to mark it "tested" in the Integration Registry

**Business decisions**
- [ ] Pick the first pilot client (e.g. Brow Revolution or Bio Green Elixirs as an internal pilot)
- [ ] Set pricing for the first sellable package
- [ ] Answer each phase's "Open questions for Ryan"
- [ ] Approve each phase before Claude Code moves on

**Don't do**
- Don't ask a client to "send all your data"
- Don't sell modules that aren't built and tested yet
- Don't paste passwords or client personal data into notes or chats
- Don't skip staging — test on my own business first
