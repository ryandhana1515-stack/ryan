# OmniX AI — Master Product Requirements Document (PRD)

**Product:** OmniX AI — The AI Operating System for Every Business
**Owner:** Ryan Dhana
**Status legend used throughout:** ✅ LIVE (built & deployed) · 🟡 PARTIAL · 🔜 PLANNED

> ⚠️ FOR ANY DEVELOPER OR AI AGENT READING THIS: OmniX AI is a WORKING,
> DEPLOYED PRODUCT (FastAPI + PostgreSQL/SQLite + vanilla-JS frontend,
> deployed on DigitalOcean App Platform, repo: this repository). Your job
> is to EXTEND this codebase — never rebuild from scratch. Read
> `docs/TECHNICAL-ARCHITECTURE.md` before writing any code.

## 1. Vision

OmniX AI is not another chatbot, CRM, or marketing tool. It is a complete
AI Business Operating System: entrepreneurs, SMEs, agencies, creators,
clinics, restaurants, real-estate and e-commerce businesses run their
entire company from one place. The user never wonders which AI tool to
open or which prompt to write — they state a business goal ("I want more
customers", "launch my product", "build me a website") and OmniX
coordinates the right AI employees, workflows and integrations to deliver
the outcome. OmniX is the user's AI Chief Operating Officer.

**Core philosophy: don't sell AI tools — sell completed business
outcomes.** Every screen answers "what business problem is being solved?",
never "which model is being used?".

## 2. Personas

| Persona | Situation | What OmniX gives them |
|---|---|---|
| Solo service owner (salon, clinic, agent) | Drowning in DMs, no marketing time, no tech skills | Sales AI answers leads 24/7, Studio makes content, Guide AI teaches platform setup |
| E-commerce / TikTok seller | Needs product content, listings, ads across platforms | Content pipeline + size packs + SCO listings + seller-registration guidance |
| Marketing agency / reseller | Sells services to SMEs, wants recurring revenue | White-label OmniX; each client account = margin (see §9) |
| Growing SME (5–50 staff) | Departments without department heads | 18 AI employees + SOPs + finance/HR/analytics reporting |

## 3. User journey (the golden path)

1. Visitor lands on marketing site (✅ `/welcome`, 12 languages) → watches
   real product footage (✅ `/videos`) → reads the 2:47am story (✅ `/how`)
   → founding offer (✅ `/offer`) → signup (✅ `/signup`, becomes a lead in
   the owner's own CRM — the product sells itself with itself).
2. New user enters the app → **CEO Dashboard** (✅) shows their business
   at a glance → "What would you like to achieve today?" journeys (✅ on
   Launch Pad; 🔜 promote to the dashboard home).
3. They speak or type to the **Manager AI** (✅ incl. voice input) — it
   researches live data, delegates to employees, reports back.
4. Work products flow through the **Approval Queue** (✅) until agents
   earn autonomy (✅ per-agent draft/approve/auto dial + kill switch).
5. Leads arrive (✅ webhook/signup; 🔜 native WhatsApp/Messenger/IG) →
   Sales AI qualifies, scores, books (✅) → reminders, invoices,
   onboarding, review requests fire automatically (✅ event workflows).

## 4. The eight modules

### 4.1 CEO Dashboard — ✅ LIVE (route `/`)
Revenue today, deals won, leads, conversion rate, pipeline value,
appointments, tasks, approvals, tickets, messages, AI runs & AI cost,
Business Health Score with component meters, AI-employee status grid
(autonomy + kill switch), AI daily digest button.
🔜 PLANNED: profit & cash-flow view, website visitors, notifications
center, "today's priorities" panel, goal-first home screen.

### 4.2 Marketing Hub — 🟡 PARTIAL (today: `/launch` Launch Pad)
✅ Campaign builder v1: describe offer + audience → ① ad copy + 5 angles
② ad image ③ landing page with a public shareable URL. One-click doors +
Guide-AI walkthroughs for Meta Ads/Business Suite, TikTok Business/Seller,
WhatsApp, Google Business.
🔜 PLANNED: full Campaign Builder wizard (question flow → complete
campaign package incl. email sequence, WhatsApp broadcast, call script,
schedule, launch checklist); native ad-platform APIs (Meta, TikTok,
Google/YouTube, LinkedIn, Xiaohongshu) — publish, budgets, and results
inside OmniX (requires platform developer approvals — see Tech doc §7);
campaign analytics, budget recommendations, audience builder, marketing
calendar, retargeting/referral/influencer templates.

### 4.3 Content Studio — 🟡 PARTIAL (today: `/studio`)
✅ Create pictures (Image AI/fal), video clips (Video AI/fal), captions
for FB/IG/TikTok/YouTube/Xiaohongshu in one click; **platform size pack**
(one image → 5 platform-correct crops with downloads); curated best-tool
directories (CapCut, HeyGen, Higgsfield, Canva, Veo, ChatGPT, Midjourney)
each with a Guide-AI coach.
🔜 PLANNED: logos/mockups/packaging templates, AI avatar & talking
videos in-app (HeyGen API), voiceovers/translation (TTS API), long-form
docs (proposals, decks, PDFs), asset library with brand-kit enforcement,
one-prompt multi-format generation.

### 4.4 Sales Hub — 🟡 PARTIAL
✅ CRM: contacts, leads with AI scoring, pipeline stages, deals, quotes
(schema), invoices + payments, appointments with reminders, tasks,
conversation timelines; sales automation (instant reply → qualify → book
→ dunning → onboarding → review request); Stripe payment links.
🔜 PLANNED: visual pipeline board UI, e-sign contracts, call tracking,
email tracking, forecasting & CLV analytics, proposal generator UI.

### 4.5 AI Employee Center — ✅ LIVE (18 employees; roster below)
Each employee = config bundle: role, mission (system prompt), knowledge
scope (RAG), tools allowlist, autonomy level, guardrails, full run
history with cost. Manager AI reviews their performance with real
numbers. See `docs/AI-EMPLOYEE-BIBLE.md` for every employee's full spec.
Roster (✅): Manager, Sales, Support, Voice, Marketing, Branding, Content,
Social Media, Image, Video, Website, SEO, SCO, Finance, HR, SOP,
Analytics, Guide. 🔜 PLANNED: Legal, Research, Operations, Project
Manager, Data Analyst, Translator, Automation.

### 4.6 Operations Center — 🟡 PARTIAL
✅ Tasks & reminders, approvals, SOP library + SOP AI, knowledge base
(company wiki), audit logs, event system. 🔜 PLANNED: projects UI,
files/documents manager, visual automation builder, internal chat, time
tracking, templates.

### 4.7 Customer Hub — 🟡 PARTIAL
✅ Unified conversation model (channel-agnostic), webchat + webhook
intake, AI replies with approval mode, ticketing + escalation + CSAT
fields, customer timeline. 🔜 PLANNED (Phase 2 integrations): native
WhatsApp Business API, Messenger, Instagram DM, TikTok, email inbox, SMS,
calls — one real inbox; sentiment dashboards.

### 4.8 App Marketplace — 🟡 PARTIAL (today: directories in Studio/Launch Pad)
✅ Curated tool cards (what it does, who it's for, open + Guide-AI coach)
for video, image, editing, and platform tools. 🔜 PLANNED: full
marketplace pages with pricing notes and connect buttons; OAuth-based
"Connected Apps" (Meta, TikTok, Google, WhatsApp, Zapier/Make/n8n,
Mailchimp/Brevo, GA4, Ahrefs/Semrush).

## 5. AI Command Center — 🟡 PARTIAL (today: `/chat` Manager AI)
✅ One conversation (text or voice) commands everything: the Manager
researches live business data (KPIs, agent stats, approvals, leads,
knowledge) across multiple steps, delegates to any employee, returns work
products (text, images, pages) inline. 🔜 PLANNED: multi-step workflow
execution from one command ("launch my July campaign" → research →
strategy → content → images → page → schedule → report), documented as
the Workflow Engine (Tech doc §6).

## 6. AI Workflows
✅ Event-driven automation live today: lead.created → instant reply →
qualification → appointment + reminders → deal.won → invoice →
payment → onboarding + review request; daily KPI materialization +
health score. 🔜 PLANNED: user-visible workflow templates ("Launch
Product", "Fill My Calendar", "Revive Old Customers"), a visual builder,
and scheduled recurring workflows.

## 7. Design principles
Premium, futuristic, clean (dark navy + cyan→magenta gradient — see
`docs/DESIGN-SYSTEM.md`); AI-first, not menu-first; business outcomes
before tools; minimum clicks; mobile-responsive; every outward action
gated by the autonomy dial; honest marketing (no fake testimonials,
truthful scarcity).

## 8. Languages & markets
✅ Marketing site in 12 languages (EN, MS, ID, TH, ZH, JA, ES, FR, PT,
DE, VI, AR w/ RTL); agents reply in the customer's language automatically.
Rollout: SG/MY → ID/TH → global West + Gulf. 🔜 in-app UI translation.

## 9. Monetization (full detail: docs/11)
Direct: Starter $49 / Growth $149 / Scale $399 per month with AI-action
allowances. White-label reseller: $297/$497 per month + $19–25 per client
account. Founding offer: first 10 at $49-for-life (✅ live on `/offer`).
Usage caps + per-tenant cost metering protect margin (✅ cost tracking
live; 🔜 metered billing enforcement + Stripe subscriptions native).

## 10. Plans & permissions
✅ Multi-tenant schema with per-tenant agents/brand/knowledge; single
admin password gate (Phase 1). 🔜 user accounts & roles per tenant
(owner/manager/staff per docs/08), plan-based module flags, reseller
admin console, enterprise SSO.

## 11. Roadmap
- **Phase 1 (✅ SHIPPED):** dashboard, agents, CRM+automation, knowledge/
  RAG, marketing site + funnel + offer, Launch Pad, Studio, Guide AI,
  deployment, payments via Stripe links.
- **Phase 2 (NEXT):** native integrations (WhatsApp Business API first,
  then Meta/TikTok ads + messaging, Google/YouTube), campaign wizard,
  workflow templates, user accounts & roles, metered billing, in-app
  marketplace with OAuth connections, media library.
- **Phase 3:** teams & enterprise permissions, accounting/inventory/ERP
  depth, e-commerce storefronts, reseller self-serve console, mobile app,
  advanced analytics & forecasting.

## 12. Success metrics
Activation: first lead answered by AI within 24h of signup. Engagement:
AI actions/tenant/week; approval-edit rate trending down. Revenue: MRR,
net revenue retention >100%, churn <3%/mo. Trust: zero uncontrolled
outbound incidents (approval/guardrail system).
