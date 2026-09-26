---
type: registry
priority: P0
name: Integration Registry
status: live
owner_agent: "[[10_Agents/15_Security_Governance_QA]]"
worker: "[[20_Specialist_Workers/Integration_Health_Worker]]"
last_reviewed: 2026-09-25
tags: [registry, integrations, p0]
---
# Integration Registry (P0 #4)

**Rule:** an entry is `planned` until Ryan confirms it is authenticated and tested. Nobody (agent, proposal, session) may claim an integration works while it is `planned`. Secrets are never here: `stored in: n8n credentials`.

## Schema (one entry = one connector per tenant)
`connector_name · tenant · owner · auth_type · scopes · mode (api/webhook) · token_expiry · rate_limits · health · last_sync · failures · reauth_needed · status (planned / authenticated / tested / live) · secret_location · used_by`
Template: [[90_Templates/Integration_Entry_TEMPLATE]]. Target table: `integrations` (migration 002; secret references only).

## FusionTech tenant — entries (2026-09-25)
| Connector | Used by | Auth | Mode | Health / evidence | Status | Ryan confirms |
|---|---|---|---|---|---|---|
| n8n Cloud (ryan1515.app.n8n.cloud) | all workflows | login | api | all live workflows run here | `planned` (observed working) | [ ] tested [ ] live |
| Gmail (n8n credential "Gmail account") | John, Website Builder, Build Record, Daily Brief, Discovery | oauth2 | api | owner emails delivered daily (executions 209–229) | `planned` (observed working) | [ ] tested [ ] live |
| GitHub (n8n credential "GitHub account", repo ryandhana1515-stack/ryan) | vault readers/writers in every agent | oauth2 | api | vault notes read live; Vault Writer commits | `planned` (observed working) | [ ] tested [ ] live |
| n8n AI Gateway (Anthropic Claude) | every agent's reasoning | n8n managed | api | credits exhausted 2026-09-25; rule fallbacks active | `planned` | [ ] credits topped up |
| Meta WhatsApp Business (Cloud API) | John in/out, Outbound Sender | oauth / system token | api + webhook | no credential yet ([[Knowledge/_How to connect WhatsApp]]) | `planned` | [ ] |
| Lovable MCP (https://mcp.lovable.dev) | [[20_Specialist_Workers/Deployment_Release_Worker|Website Build Runner]] | oauth2 (MCP Client) | api | credential not created | `planned` | [ ] |
| Higgsfield API (api.higgsfield.ai) | Website Build Runner (photography) | header key | api | credential not created; used from a Claude session on 2026-09-26 (3 photos) | `planned` | [ ] |
| Higgsfield MCP (website builder, scroll-scrub sites) | Website Build Runner, variation A (ADR-2) | oauth2 (MCP Client) | api | credential not created | `planned` | [ ] |
| Kling API (api-singapore.klingai.com) | Website Build Runner (photography fallback) | bearer key | api | credential not created | `planned` | [ ] |
| Supabase / Postgres | CRM/ERP data layer | service key (server only) | api | migration 002 validated locally, no project yet | `planned` | [ ] |
| Canva, Figma, ElevenLabs, Vercel, Shopify, Airtable, Slack, Google Drive/Calendar | future agents | connectors in Claude sessions only | — | not reachable from n8n | `planned` | [ ] |

## How status moves
`planned` → Ryan creates the credential in n8n → `authenticated` → [[20_Specialist_Workers/Integration_Health_Worker]] runs the test workflow → Ryan says "tested" → `tested` → first production use logged → `live`. Health checks daily; `reauth_needed` raises a task in the human inbox.
