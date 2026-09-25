---
type: rules
tags: [zaphiel, ceo-brain, rules, master]
version: 3.0
owner: Ryan
last_reviewed: 2026-09-25
source: "[[FusionTech AI — Build Prompt v3]] Step 7 + [[FusionTech AI — Product & Build Directive]] Parts 23–24 + [[Decisions]]"
---
# 00 · Master Rules (every agent, worker, service and session obeys these)

## The universal execution rule
**verified context → structured output → permission check → action or approval → audit log → measurable result.**
Every agent note carries this line. No step is skipped, ever.

## Hard rules (Ryan, 2026-09-25)
1. **Discover before building. Integrate before duplicating. Automate only stable processes.**
2. **One source of truth per entity** — see [[40_Registries/System_of_Record_Registry]]. Never two.
3. **Approval for sensitive actions** — money in or out, refunds, contracts, final pricing, deleting critical data, changing permissions, production deploys, legal or medical commitments. The [[30_Platform_Services/Approval_Service]] decides; agents never bypass it.
4. **Log material actions** through the [[30_Platform_Services/Audit_Service]]. Unlogged side effects are bugs.
5. **Measure business results** — every agent has KPIs in the [[40_Registries/KPI_Dictionary]].
6. **An integration "works" only when it is authenticated and tested.** Its entry in the [[40_Registries/Integration_Registry]] stays `planned` until Ryan confirms `tested`, then `live`.
7. **No secrets in this vault, in the repo, in logs or in chat.** Write `stored in: n8n credentials` or `stored in: password manager`. Never a key, token or password.
8. **Never delete, rename or overwrite Ryan's notes without approval.** Append; propose moves.
9. **Never build all 16 agents at once.** Finish a phase, show Ryan, continue ([[00_CEO_Brain/02_Build_Backlog]]).
10. **Never mix client data between tenants.** One folder per client under `80_Clients/`, one `tenant_id` on every record, Row Level Security in the database ([[30_Platform_Services/Identity_Tenant]]).
11. **Never invent client facts, prices, testimonials, certifications, credentials or outcomes.** Unknown = a labelled placeholder or a question.
12. **[[wikilinks]] between agents, services and registries** so the graph shows real connections.
13. **Every change goes into [[00_CEO_Brain/04_Changelog]]** (date, what, why) — today that is the root [[Change log]].

## Rules every agent already follows (from the directive, unchanged)
- Never quote prices, guarantees, delivery dates, contracts or refunds — those go to Ryan. WON / LOST are human decisions.
- Nothing is published to a live domain without Ryan. Third-party costs are always separate from FusionTech fees.
- Never ask a customer for a password in chat. OAuth where possible. Least privilege.
- Agents do **not** each rebuild permissions, logging, approvals, retries or notifications. They call the shared [[30_Platform_Services/_index|platform services]].
- Code nodes in n8n are generated from `ceo-brain/` in the repo; never hand-edited.

## Ryan's decisions that override defaults (newest wins)
Kept in [[Decisions]]. Notably (2026-09-25): website **mock-ups build automatically with zero approvals**; publishing to a live domain stays human.
