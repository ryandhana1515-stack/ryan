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

## Repository Contents

- `docs/` — the full design package (architecture + roadmap, pre-build phase)
- `nano_banana.py` — early prototype: AI image generation via OpenRouter
  (Gemini image model), a building block for the Content Creation AI
  (see [doc 3](docs/03-tech-stack.md))

## Status

**Phase 0 — Design.** The architecture and roadmap are complete; Phase 1
(Revenue Engine: CRM + Sales AI + CEO Dashboard v1) is specified and ready
to build. See [docs/02-roadmap.md](docs/02-roadmap.md).
