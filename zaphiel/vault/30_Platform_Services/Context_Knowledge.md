---
type: platform_service
service_id: context_knowledge
name: Context & Knowledge
version: 1.0
status: designed
priority: P1
owner_agent: "[[20_Specialist_Workers/Knowledge_Curator]]"
owner: Ryan
last_reviewed: 2026-09-25
tags: [platform-service, p1]
---
# Context & Knowledge — shared platform service (P1)

> Built once, called by every agent. No agent rebuilds this.

## Purpose
Gives every agent **verified context**: the company brain, playbooks and standards from this vault (live), the client's indexed documents (INDEX class), and the client's summarized procedures — always inside the tenant boundary.

## Data model / schema
- FusionTech knowledge: this vault, read live from GitHub by the agents ([[Knowledge/_How the brain feeds the agents]]).
- Client knowledge: `documents` (tenant_id, source, title, location, class INDEX/SUMMARIZE, indexed_at) + a per-tenant search index; summaries as notes in `80_Clients/<tenant>/`.
- Every retrieved chunk carries tenant_id and source so answers can cite where a fact came from.

## Rules
1. An agent may only cite what the context service returned; no memory of other tenants, no invention.
2. Knowledge notes read live win over compiled prompts (newest date wins inside a note).
3. Sensitive documents are never indexed without the purpose approved (see [[50_Client_Onboarding/Data_Classification_Rules]]).

## Interfaces (what an agent calls → what it gets back)
`get_context(tenant, agent, topic)` → passages with sources · `index(tenant, document)` · `summarize(tenant, document)` → note

## Where it runs today → target
- **Today:** vault notes read live via the GitHub node in each workflow; no client document index yet
- **Target:** vector/full-text index per tenant (Supabase pgvector or n8n vector store) fed by the onboarding plan

## Owner agent
[[20_Specialist_Workers/Knowledge_Curator]]

## Tests
An agent answer cites a vault note; a client-A query never returns a client-B passage.

## Status
`designed` — see [[00_CEO_Brain/02_Build_Backlog]].
