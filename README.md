# AI Business Operating System (AI-BOS)

An AI-powered Business Operating System: one integrated ecosystem of AI
agents, automation workflows, and dashboards that operates 80–95% of a
company — marketing, sales, support, voice, operations, finance, HR — while
the CEO focuses on strategy and growth. Designed multi-tenant so it can run
your own companies first, then be sold to SMEs across industries.

## Start Here

📚 **[Complete Architecture & Implementation Roadmap → `docs/`](docs/README.md)**

| Doc | Contents |
|---|---|
| [01 – System Architecture](docs/01-architecture.md) | 5-layer architecture, department map, event-driven design |
| [02 – Roadmap](docs/02-roadmap.md) | Phases 1–4, timeline, cost estimates, scalability |
| [03 – Tech Stack](docs/03-tech-stack.md) | Recommended tools + buy-vs-build decisions |
| [04 – Database Design](docs/04-database-design.md) | Multi-tenant schema + event catalog |
| [05 – AI Agents](docs/05-ai-agents.md) | Agent pattern, orchestrator, all department agents |
| [06 – Workflows](docs/06-workflows.md) | Lead-to-cash and all automation flowcharts |
| [07 – Prompt Library](docs/07-prompt-library.md) | Production prompts per department |
| [08 – Security](docs/08-security.md) | RBAC, audit, backups, agent safeguards |
| [09 – Integrations](docs/09-integrations.md) | Adapter pattern + recommended tools |
| [10 – Deployment](docs/10-deployment.md) | Environments, testing, training, operations |

## Quick Start (Phase 1 build)

```bash
pip install -r requirements.txt
cp .env.example .env           # add ANTHROPIC_API_KEY or OPENROUTER_API_KEY (optional)

python -m app.seed             # provision demo tenant + knowledge + 11 AI employees
uvicorn app.main:app --port 8000
# open http://localhost:8000  -> CEO Command Center dashboard
```

No API key? Everything still runs on a deterministic mock LLM:

```bash
AIBOS_MOCK_LLM=1 python -m app.demo    # scripted end-to-end money loop
python -m pytest tests/                # 12 end-to-end smoke tests
```

## Repository Contents

- `docs/` — the full design package (architecture, roadmap, schema, prompts…)
- `app/` — the Phase 1 implementation:
  - `app/agents/` — LLM port (Anthropic/OpenRouter/mock), agent registry,
    RAG retrieval, and the **orchestrator** (routing, autonomy policy,
    guardrails, handoffs, run logging)
  - `app/workflows/` — event-bus subscribers for the lead-to-cash loop and
    KPI/health-score materialization
  - `app/api/` — CRM, agent admin, approval queue, knowledge, dashboard APIs
  - `app/static/dashboard.html` — the CEO Command Center
- `config/agents/` — the 11 AI employees as config bundles (prompt + tools +
  knowledge scope + autonomy + guardrails)
- `prompts/` — the versioned prompt library (doc 7)
- `tests/` — end-to-end smoke suite (runs offline against the mock LLM)
- `nano_banana.py` — image-generation prototype (Content AI building block)

## The AI Employees

Sales, Support, Marketing, Branding, Content, Social Media, Voice, Finance,
HR, SOP, and Analytics — each defined in `config/agents/*.yaml`, each with an
autonomy dial (`draft → approve → auto`), a kill switch, deterministic
guardrails (finance/HR can never go fully autonomous), and full run logging
for audit and cost tracking.

## Status

**Phase 1 — Revenue Engine: built.** Multi-tenant foundation, CRM core,
event bus, agent orchestrator, all 11 department agents, lead-to-cash
workflows, knowledge base with tenant-scoped retrieval, approval queue, and
CEO Dashboard v1. Next per [docs/02-roadmap.md](docs/02-roadmap.md):
real channel integrations (WhatsApp, calendar, Stripe webhooks) and Phase 2
growth features.
