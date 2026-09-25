---
type: registry
priority: P0
name: System-of-Record Registry
status: designed
owner_agent: "[[10_Agents/07_CRM_Architect]]"
last_reviewed: 2026-09-25
tags: [registry, source-of-truth, p0]
---
# System-of-Record Registry (P0 #5) — one source of truth per entity

For every entity: the **authoritative system**, who may **write**, who may **read**, and the **sync direction**. Agents check this before writing anywhere. Filled per tenant in `80_Clients/<client>/`; the FusionTech tenant is below.

## FusionTech tenant (2026-09-25)
| Entity | Authoritative system | May write | May read | Sync direction | Notes |
|---|---|---|---|---|---|
| Leads | CEO Brain CRM (`ceo_leads`, → Postgres `leads`) | [[10_Agents/02_Sales_CRM]] (John), Discovery Agent | all agents, Ryan | inbound channels → CRM | vault `Leads/` notes are a mirror, not the source |
| Contacts / organizations | CEO Brain CRM | John, CRM Architect | all | CRM → dashboards | |
| Conversations / messages | CEO Brain CRM (`ceo_messages`) | channel workflows (WhatsApp Inbound, chat console), Outbound Sender | John, Customer Success | channels ↔ CRM | |
| Tasks / approvals | CEO Brain (`ceo_tasks`) | any agent (create), humans (approve) | all | — | approvals only via [[30_Platform_Services/Approval_Service]] |
| Company maps | CEO Brain (`ceo_company_maps`, versioned) | Discovery Agent | Solution Architect, Orchestrator | CRM → vault note (mirror) | |
| Website build tasks / previews | CEO Brain (`ceo_tasks` type website_build) | Website Builder, Build Runner, Build Record | John, Ryan | — | preview links; publishing stays human |
| Company knowledge, playbooks, standards, decisions | **this vault** | Ryan, Zaphiel sessions, Training Room (append) | every agent (live) | vault → agents | never the CRM |
| Invoices / payments | client's accounting system (Xero/QuickBooks…) when connected; else none | client's system only | Finance Ops (read) | accounting → CEO Brain (status only) | the platform never moves money |
| Employees | client's HR system or none | client | HR agent (read, minimal) | — | sensitive: leave in place by default |
| Products / inventory | client's ERP/POS when connected | client's system | Inventory agent (read), Website agent (read) | ERP → CEO Brain | |
| Orders | client's e-commerce/ERP | client's system | Operations, Customer Success | ERP → CEO Brain | |
| Documents (SOPs, policies) | client's drive / this vault for FusionTech | owner | indexed read-only via [[30_Platform_Services/Context_Knowledge]] | index only | |
| Secrets / credentials | n8n credentials / password manager | Ryan | nobody else; agents use, never read | — | never in notes |

## Rules
No agent writes to a system that is not its entity's authoritative system. A second copy is a mirror, marked as such, and never edited by hand. Changing a source of truth is an ADR ([[90_Templates/ADR_Decision_TEMPLATE]]).
