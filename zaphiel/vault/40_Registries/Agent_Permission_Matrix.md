---
type: registry
priority: P0
name: Agent Permission Matrix
status: designed
owner_agent: "[[10_Agents/15_Security_Governance_QA]]"
last_reviewed: 2026-09-25
tags: [registry, permissions, p0]
---
# Agent Permission Matrix (P0 #3) — rows = agents, columns = systems, cells = none / read / write / approval

`approval` = may request the action; a human approves through the [[30_Platform_Services/Approval_Service]]. Enforced by the [[30_Platform_Services/Policy_Service]] and the [[30_Platform_Services/Tool_Connector_Gateway]], not by prompts. Default for anything not listed: **none**.

| Agent | CRM (leads, contacts, tasks) | Conversations / channels (WhatsApp, email out) | Vault (knowledge) | Accounting / payments | Website / hosting | Integrations & secrets | Audit log | Tenant / users / roles |
|---|---|---|---|---|---|---|---|---|
| [[10_Agents/00_CEO_Orchestrator]] | read, write tasks | none | read | read (status) | read | none | write | read |
| [[10_Agents/01_Discovery_Solution_Architect]] | write (maps, leads) | read | read + append (Discovery/) | none | none | read registry | write | approval (provision tenant) |
| [[10_Agents/02_Sales_CRM]] (John) | write | write (low-risk replies auto; sensitive = approval) | read + append (Leads/) | none | none | none | write | none |
| [[10_Agents/03_Marketing_Growth]] | read | approval (publish) | read | none | none | none | write | none |
| [[10_Agents/04_Creative_Studio]] | none | none | read | none | none | none | write | none |
| [[10_Agents/05_Website_App_General]] | read, write tasks | approval (send preview via John: auto for mock-ups) | read | none | write (staging / preview); approval (production) | use (Lovable, Higgsfield, Kling) via gateway | write | none |
| [[10_Agents/06_Medical_3D_Web]] | read, write tasks | none | read | none | write (preview); approval (production + medical content review) | use via gateway | write | none |
| [[10_Agents/07_CRM_Architect]] (ATLAS) | DESIGN/AUDIT: read + write own `edg_design` task; BUILD: write schema + migrations on staging only; approval (production migration, go-live) | none (talks to customers only through John) | read + write own client folder `80_Clients/<slug>/edg/` | none | none | read registry; set status up to `planned` only; **never** secrets | write | read |
| [[10_Agents/08_ERP_Operations]] | read | none | read | none | none | none | write | none |
| [[10_Agents/09_Workflow_Automation]] | write (workflow runs) | none | read | none | none | read registry, health | write | none |
| [[10_Agents/10_Finance_Ops]] | read | approval (reminders) | read | read; approval (any change); **never** move money | none | none | write | none |
| [[10_Agents/11_HR_Workforce]] | none | none | read | none | none | none | write | approval (access revocation) |
| [[10_Agents/12_Inventory_Supply_Chain]] | read | none | read | none | none | none | write | none |
| [[10_Agents/13_Customer_Success]] | write (tickets) | write (low-risk); approval (compensation) | read | none | none | none | write | none |
| [[10_Agents/14_Data_BI_KPI]] | read | none | read + append (reports) | read | none | none | read | none |
| [[10_Agents/15_Security_Governance_QA]] | read | none | read | none | read | read registry (never secrets) | read | approval (permission changes) |

## Human approvers (to be confirmed by Ryan — open question 1)
| Action | Approver (proposed) | Limit |
|---|---|---|
| Send a reply that mentions price, contract, refund, guarantee | Ryan | — |
| Publish a website to a live domain | Ryan + client owner | — |
| Production deploy / migration | Ryan | — |
| Any payment, refund or credit | Ryan (FusionTech) / client owner (client) | money limits: **(Ryan to set)** |
| Change a permission or role | Ryan | — |
| Delete critical data | Ryan + client owner | — |
| Medical claims / content | client's doctor + Ryan | — |
