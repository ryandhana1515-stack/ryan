---
type: knowledge-card
pack: ATLAS_Business_Systems
card: "25"
agent_id: atlas
status: draft
source: "Ryan, ATLAS v3 PART 2 (2026-10-01)"
tags: [atlas, knowledge-pack, business-systems]
---
# 25 · API & Integration

> Knowledge card for ATLAS ([[10_Agents/07_CRM_Architect]]). Open it only when this area is part of the client's
> business (agent file → BUSINESS SYSTEMS INTELLIGENCE (v3)). Index: [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|00_Index]].

## Ryan's card (verbatim)
```text
REST, webhooks, OAuth, API keys, service accounts, permissions, scopes, rate
limits, pagination, retries, timeouts, idempotency, error handling, mapping,
sync, logging, API versioning.
Per integration: SYSTEM • PURPOSE • DATA IN • DATA OUT • AUTHENTICATION •
PERMISSIONS • SOURCE OF TRUTH • TRIGGER • ERROR HANDLING • LOGGING • COST.
Never invent endpoints. Use current official docs (record URL + date).
```

## Card format
_Fields below complete Ryan's card format (SIGNALS • ASK • CORE OBJECTS • KEY EVENTS • WORKFLOWS • KPIs • KEEP/BUY/BUILD • CONTROLS & RISKS). They are Zaphiel's additions, not Ryan's words; where Ryan's text already covers a field it is referenced, not repeated._

**SIGNALS** — Two or more systems must share data; duplicate data entry between apps.

**ASK** (1–3 at a time, plain words, only what is still unknown)
- (Customer) Which software does your team use every day?
- (Technical discovery) API and webhook availability, plan limits, admin who can consent.

**CORE OBJECTS** — integration · credential reference (name only) · mapping · sync cursor · error queue.

**KEY EVENTS** — `sync.started` · `sync.failed` · `sync.completed` · `webhook.received`

**WORKFLOWS** — Agent file §10 API VERIFICATION PROTOCOL and B9 API INTEGRATIONS (12 steps).

**KPIs** — Failed syncs (*Is data flowing?*).

**KEEP/BUY/BUILD** — Integrate before replacing.

**CONTROLS & RISKS** — Secrets only in the secret manager (agent file §11); least-privilege scopes; signature verification on webhooks.

## Fusion EDG Core today
Adapters: WhatsApp, Xero, Google Calendar (MOCK-tested, live NEEDS VERIFICATION), Resend email (built). Others: **NEW BUILD**. Source: `fusion-edg-core/docs/modules.md`; agent file B19/B20. Status words are exact: TESTED = automated
tests on FAKE data; NEEDS VERIFICATION = not yet proven on a real account; NEW BUILD = design it, Zaphiel builds it
before it is promised.

**Related:** [[26_Automation_n8n]] · [[19_Database_Backend]]
