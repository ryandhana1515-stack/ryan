# 3. Technology Stack

Chosen for: proven at SME scale, strong ecosystems, low lock-in, and a clear
path from "run my company" to "sell to hundreds of companies."

## 3.1 Recommended Stack

| Layer | Recommendation | Why | Alternative |
|---|---|---|---|
| Frontend (Dashboard, Staff Workspace, Portal) | **Next.js + TypeScript + Tailwind + shadcn/ui** | Fast to build, SSR for dashboards, huge talent pool, white-label theming is easy | SvelteKit, Nuxt |
| Charts/analytics UI | **Recharts / Tremor** | Dashboard-grade components out of the box | Apache ECharts |
| Backend API | **Node.js (NestJS) or Python (FastAPI)** | Typed, modular, first-class OpenAPI; pick by team skill — FastAPI if the AI code and API live together | Go for high-volume services later |
| Primary database | **PostgreSQL 16 + Row-Level Security** | One engine for business data, JSONB flexibility, RLS gives hard tenant isolation | — (non-negotiable) |
| Vector store | **pgvector (in Postgres)** | RAG without another moving part; migrate to Qdrant only if scale demands | Qdrant, Weaviate |
| Cache / queue | **Redis + BullMQ** (or Celery for Python) | Rate limiting, job retries, scheduled follow-ups | — |
| Event bus | **Redis Streams** (start) → **NATS/Kafka** (scale) | Simple first, upgrade path defined | RabbitMQ |
| Workflow engine | **n8n (self-hosted)** | 400+ connectors, visual flows the client can read, self-hosted = data control, fair-code license | Temporal (code-first, for the core lead-to-cash flow once stable), Make/Zapier (rented, avoid for the product) |
| Object storage | **S3-compatible (Cloudflare R2 / AWS S3 / MinIO)** | Recordings, media, documents | — |
| LLMs | **Claude (Anthropic) for agents/reasoning; a router (LiteLLM/OpenRouter) in front** | Best-in-class agentic reliability; router = per-task model choice and vendor independence | GPT-4-class, Gemini, open-weights (Llama) for cheap bulk tasks |
| Embeddings | **Voyage / OpenAI text-embedding-3 / bge (self-hosted)** | Quality vs cost dial | — |
| Image generation | **Gemini image models via OpenRouter** (already prototyped in this repo), Flux | Marketing visuals | DALL·E, SDXL |
| AI voice calls | **Retell AI or Vapi** (agent platform) over **Twilio/Telnyx** (telephony) | Human-like latency, barge-in, recordings, webhooks for summaries — building your own SIP stack is not worth it | Bland.ai; ElevenLabs for TTS voices |
| WhatsApp | **WhatsApp Business Cloud API** (direct or via 360dialog/Twilio) | The sales channel in most SME markets; official API for broadcasts + bots | — |
| Email | **Resend/Postmark (transactional)** + **Listmonk/Brevo (campaigns)** | Deliverability + cost control | Mailgun, SES |
| Social publishing | **Direct platform APIs** (Meta Graph, TikTok, LinkedIn, YouTube, Google Business) wrapped in adapters; **Postiz (open-source)** to accelerate | Direct APIs = product-grade; Postiz saves months | Ayrshare (rented API) |
| ERP | **ERPNext** (or Odoo Community) integrated via REST | Inventory/purchasing/projects/accounting solved for free; we add the AI layer | Odoo (better UX, license cost) |
| Accounting sync | **QuickBooks / Xero APIs** (per tenant's existing books) | SMEs already live there; sync don't migrate | ERPNext's own ledger |
| Payments | **Stripe** (+ local rails per market, e.g. FPX/GrabPay via Stripe/Xendit in SEA) | Payment links inside chat close the loop | Paddle for SaaS billing |
| Auth | **Keycloak or Auth0/Clerk** | SSO, MFA, per-tenant roles | Supabase Auth |
| Observability | **Grafana + Prometheus + Loki**; **Langfuse** for LLM traces | You cannot run autonomous agents without tracing what they did and what it cost | Datadog (paid) |
| Hosting | **One cloud (AWS/GCP/Hetzner) + Docker Compose → Kubernetes at scale**; Vercel for the frontend | Boring, portable | Fly.io, Railway early on |
| CI/CD | **GitHub Actions** | Already in the ecosystem | — |

## 3.2 Buy vs Build Decisions (the important ones)

| Capability | Decision | Reasoning |
|---|---|---|
| Agent orchestration, prompt library, autonomy policy | **BUILD** | This is the product. Owning it = the moat and the margin. |
| CRM | **BUILD (thin)** | Off-the-shelf CRMs fight the agent-first design; a lean pipeline/contacts/timeline schema is ~3 weeks and you own every byte. |
| Workflow engine | **BUY (n8n self-hosted)** | Visual flows, hundreds of connectors, zero license fee self-hosted. |
| ERP / accounting | **BUY (ERPNext + QuickBooks/Xero sync)** | Decades of edge cases you don't want to rediscover. |
| Voice infrastructure | **BUY (Retell/Vapi + Twilio)** | Latency engineering + telephony compliance is a company on its own. |
| Social/messaging APIs | **BUILD adapters over official APIs** | Rented aggregators cap margins and control your roadmap. |
| Knowledge/RAG pipeline | **BUILD (thin) on pgvector** | Simple, and tenant-isolation of knowledge is security-critical. |

## 3.3 AI Model Routing Policy

One router, per-task model selection — quality where it matters, pennies where
it doesn't:

| Task class | Model tier | Examples |
|---|---|---|
| Agentic reasoning, sales conversations, financial narratives | Frontier (Claude Sonnet/Opus class) | Sales AI replies, objection handling, exec insights |
| Bulk generation | Mid-tier | Social captions, hashtag sets, FAQ drafts |
| Classification/extraction | Small/cheap | Intent detection, lead scoring features, sentiment, routing |
| Embeddings | Embedding models | RAG indexing/search |
| Voice | Voice platform's optimized stack | Live calls |

All calls logged to Langfuse with tenant + agent + cost tags → per-tenant AI
cost on the CEO dashboard and in your SaaS unit economics.
