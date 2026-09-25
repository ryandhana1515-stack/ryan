---
tags: [zaphiel, knowledge, agents, roster]
derived_from: "[[FusionTech AI — Product & Build Directive]]"
updated: 2026-09-25
---
# AI Workforce — the twelve agents

The roster Ryan defined, with what exists today. Ids are n8n workflow ids; every live agent reads
this vault and is trained from the Training Room ([[Agents]]).

| # | Agent | Mission | Status (2026-09-25) |
|---|---|---|---|
| 1 | **Company Discovery & Onboarding Agent** | Understands the customer's business through conversation → Client Digital Company Map → data onboarding plan → proposal draft | **Live** — Discovery Console (see [[Agents]]); playbook [[Knowledge/Company Discovery — playbook]] |
| 2 | **Sales Agent — John** | Captures, qualifies, follows up, updates CRM, books appointments, escalates | **Live** — Lead Intake `b7kbJpnKLN2uQxyn` |
| 3 | Solution Architect Agent | Converts discovery into technical architecture | Partly: the proposal draft's "proposed architecture / modules / agents" come from the Company Map; full agent planned |
| 4 | Website Architect Agent | Determines website requirements | Inside the Website Builder v2 (pages, features, integrations, design direction) |
| 5 | **SME Website Builder Agent** | Premium SME websites | **Live** — Website Builder v2 `hSTRGnHVsu6tMOmH`, mode `sme` |
| 6 | **Medical / Doctor Website Builder Agent** | Premium healthcare websites, stricter content/privacy/compliance | **Live** — Website Builder v2, mode `medical` |
| 7 | Customer Service Agent | Approved support workflows | Planned (module: Customer Service Brain) |
| 8 | Email / Admin Agent | Administrative workflows | Planned |
| 9 | Marketing Agent | Campaigns and content | Planned |
| 10 | Operations Agent | Work and bottlenecks | Planned |
| 11 | Finance Assistant | Permitted financial information workflows (never moves money) | Planned |
| 12 | **CEO Intelligence Agent** | Executive intelligence | **Live (v0)** — Daily Brief `Pew2PX1IcgdXqXr7` |
| — | Website QA stage | Checklist before any customer sees a site | Checklist generated with every brief (v2); the inspection of a built site runs when Lovable builds are authorized |
| — | Proposal Agent (draft) | Proposal sections from the Company Map, no pricing | **Live** inside the Discovery Console |

## Rules for every agent
Never invent facts. Never quote prices, guarantees, delivery dates, contracts or refunds. Never ask
for passwords. Never move money, sign, delete, change permissions or deploy to production without
a human. One brain (this vault), one contract (`ceo-brain/agents/`), no master agent.
