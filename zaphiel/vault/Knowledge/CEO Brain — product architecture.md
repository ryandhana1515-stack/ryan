---
tags: [zaphiel, knowledge, architecture, product]
derived_from: "[[FusionTech AI — Product & Build Directive]]"
updated: 2026-09-25
---
# CEO Brain — product architecture (what FusionTech sells, how it is built)

Derived from Ryan's directive of 2026-09-25. The product: **CEO Brain + AI workforce + CRM/ERP
company data layer + business automation + custom software + high-end websites**, customised per
customer and sold to SMEs and professional businesses.

## The four layers (never mixed up)
| Layer | Holds | Where |
|---|---|---|
| **Live operational data** | leads, contacts, conversations, tasks, quotes, orders, invoices status | CRM / database (n8n Data Tables now, Postgres/Supabase migration ready: `ceo-brain/database/`) |
| **Long-term company knowledge** | strategy, products, sales methodology, SOPs, agent definitions, standards, decisions, lessons | this vault (Obsidian) |
| **Orchestration** | every workflow | n8n |
| **Reasoning** | every judgement call | Claude models (through n8n Gateway credits) |

## The customer journey the product delivers
1. **Discovery** — the Company Discovery & Onboarding Agent talks like a consultant, never asks for
   "all your data", finds where information lives → **Client Digital Company Map**
   ([[Templates/Client Digital Company Map]]).
2. **Data onboarding plan** — every data source classified (AVAILABLE / NOT AVAILABLE / UNKNOWN /
   CONNECTION REQUIRED / IMPORT REQUIRED / NOT REQUIRED) and handled as CONNECTED LIVE (CRM,
   calendar, accounting, pipeline) · IMPORTED (spreadsheets) · INDEXED (SOPs, policies) ·
   SUMMARIZED (procedures) · LEFT IN PLACE. Connect, don't copy everything.
3. **CEO Brain generation** — only the modules this customer needs: CEO Dashboard, Sales Brain,
   Marketing Brain, Customer Service Brain, Operations Brain, Project Brain, Finance Information
   Brain, Admin Brain, Knowledge Brain, Reporting Brain.
4. **Proposal** — generated from the map ([[Templates/Proposal]]); **pricing always human**.
5. **Build pipeline** — project → customer workspace (isolated tenant) → requirements locked →
   integrations authorized → database → workflows → agents → website/app → tests → security check
   → human review → customer UAT → production → training → support → optimization.

## Reusable, not hard-coded
NEW CLIENT → Discovery → Company Map → Select modules → Provision tenant → Configure CRM →
Configure agents → Connect integrations → Generate workflows → Build interface → Test → Deploy.
Every agent is the same contract (`ceo-brain/agents/<id>/`: manifest, prompts, schema, rules
fallback, guardrails in code, playbook note in this vault) so a new customer is configuration, not
a rebuild.

## CRM / ERP data layer
Designed and validated in `ceo-brain/database/migrations/002_crm_erp_core.sql` (39 tables) and
explained in `ceo-brain/database/crm-erp-data-layer.md`. CRM: organizations, contacts, leads,
opportunities, deals, pipelines + stages, conversations, messages, tasks, appointments, quotations,
projects, activities, documents, agent runs, workflow runs, audit logs. ERP (optional per tenant):
orders, suppliers, purchasing, inventory + stock movements, service jobs, approvals, invoices,
payments (status only — the platform never moves money), employees + roles. Platform: tenant
modules, integrations (secret *references* only), data sources (the discovery checklist), company
maps (versioned). **Every row carries tenant_id and Row Level Security: Company A never sees
Company B.** Existing ERPs are integrated, never forcibly replaced.

## Human approval ladder (code, not prompt)
AI recommendation → human approval → execution → audit log, for: moving or refunding money,
signing contracts, final pricing, deleting critical data, changing critical permissions,
production deployment, sensitive legal commitments.

## Security
OAuth where possible; never ask a customer for a password in chat; secrets only in n8n credentials /
a secret manager, never in the vault, repo, logs or chat; least privilege; every customer isolated;
important automated actions logged.

## Websites
Two modes on one production system (SME, Medical/Doctor) to the S$10,000 standard in
[[Knowledge/Website design standard]]; mock-up → QA → human review → customer preview.

## Tools that are really connected (checked 2026-09-25)
n8n (Gmail + GitHub credentials, Gateway credits when topped up), GitHub, Claude sessions with the
Lovable / Higgsfield / Kling / Canva / Figma connectors (only inside a session Ryan runs or
authorizes). WhatsApp waits for the Meta credential. Nothing else is assumed.
