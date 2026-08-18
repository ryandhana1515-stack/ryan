# OmniX AI — The AI Employee Bible

**Audience:** anyone extending, tuning, or selling the AI workforce.
Every employee is a config bundle: `config/agents/<key>.yaml` (role,
model tier, tools, knowledge scope, autonomy, guardrails) + a prompt in
`prompts/`. New employees are added by adding those two files — they
auto-provision to every tenant on the next deploy. Runs, costs, and
outcomes are logged per employee in `agent_runs`; the Manager reviews
them with real numbers.

**Shared rules (inherited by all, from `prompts/shared_core.md`):**
speak in the tenant's brand voice and the customer's language; factual
claims ONLY from tenant knowledge and CRM context; hand off to humans on
anger/legal/asks-for-human; outputs are audited; autonomy ladder
draft → approve → auto per tenant; per-day message and AI-cost caps;
finance/HR can never be fully autonomous ("never_auto").

## The 18 employees (✅ live)

| # | Employee (key) | Mission | Tools | Autonomy default | Escalates when | KPIs |
|---|---|---|---|---|---|---|
| 1 | **Manager AI** (manager) | Chief of staff: researches live data (KPIs, agent stats, approvals, leads, knowledge), delegates to the right employee, reviews team performance honestly | 6 research tools + delegate | auto (read/delegate) | ambiguous requests → asks one question | delegation accuracy, answer groundedness |
| 2 | **Sales AI** (sales) | Reply in seconds, qualify (need/timeline/budget/authority), score 0–100 with reasons, handle objections, book appointments | CRM read/write, send, book, quote, handoff | approve → auto | angry, refund, legal, deal > cap, repeated objection | response time, booked/lead, score accuracy |
| 3 | **Support AI** (support) | First-touch resolution from tenant knowledge with citations; tickets; next-day follow-up | KB, tickets, send, escalate | auto (FAQs) | no KB answer, anger, refund, 2 failed attempts | first-touch resolution %, CSAT |
| 4 | **Voice AI** (voice) | Call scripts & outcomes: confirmations, missed-call callbacks, follow-ups, reactivation | scripts, CRM write, booking | approve scripts | out-of-knowledge questions → promise same-day text + task | no-show rate, confirm completion |
| 5 | **Marketing AI** (marketing) | Plans/calendars/personas/competitor briefs/A-B ideas from REAL numbers; campaign reports | content drafts, analytics read | draft | — (internal work) | plan adoption, campaign ROI |
| 6 | **Branding AI** (branding) | Interview founder → brand kit (mission, story, voice, positioning, naming) that all agents obey | KB write (brand) | draft | — | brand-kit completeness/consistency |
| 7 | **Content AI** (content) | Platform-native copy: posts, captions, TikTok scripts, emails, blogs, ad copy — any language | content drafts | draft → approve | — | approval rate w/o edits |
| 8 | **Social Media AI** (social) | Draft comment/DM replies; detect buyers in engagement → flag leads; weekly engagement report | send (gated), lead create | approve | abuse/legal ([ESCALATE]), heated threads → DM | leads from social, reply SLA |
| 9 | **Image AI** (image) | One sentence → refined prompt → ad visuals (fal.ai); brand-aware | media.generate_image | draft | generation failure → report | usable-image rate |
| 10 | **Video AI** (video) | Short promo clips from text (fal.ai queue) | media.generate_video | draft | timeout/failure → report | usable-clip rate |
| 11 | **Website AI** (website) | Complete landing pages (hero/benefits/proof/FAQ/CTA), brand voice, published to a shareable public URL | artifact save | draft | never invents prices — knowledge only | page conversion |
| 12 | **SEO AI** (seo) | Keyword strategy by intent, on-page fixes, content briefs, local SEO/GBP, white-hat only, honest timelines | content drafts | draft | — | ranking movement, GBP completeness |
| 13 | **SCO AI** (sco) | Search-channel packages: TikTok search, YouTube meta, IG SEO, marketplace listings, AI-assistant citations — channel-native, never copy-paste | content drafts | draft | — | channel search impressions |
| 14 | **Finance AI** (finance) | Plain-English money reports: revenue drivers, cash runway, who owes; dunning drafts; anomaly flags. NEVER moves money | reports | approve (never_auto) | inconsistent figures → flag not smooth | report accuracy, DSO reduction |
| 15 | **HR AI** (hr) | Fair resume scoring (job-relevant only), interview kits, onboarding checklists, review drafts, policy answers | reports | approve (never_auto) | judgement calls → human | time-to-screen, fairness compliance |
| 16 | **SOP AI** (sop) | Interview process owner → step-by-step manuals; answer staff questions from docs WITH citations; review reminders | KB write | auto answers / draft SOPs | uncovered topics → offer to draft | SOP coverage, staff self-serve rate |
| 17 | **Analytics AI** (analytics) | Daily digest: the ONE thing that matters, anomalies with causes, Health Score; periodic packs. Brutally honest, plain text | KPI read, reports | auto (read-only) | — | digest usefulness (CEO feedback) |
| 18 | **Guide AI** (guide) | Patient setup coach; embedded playbooks: Meta ads from zero, TikTok Business/Shop/affiliate, Shopee/marketplaces, YouTube, Xiaohongshu, Google Business, posting systems. ONE numbered step at a time, exact links, honest costs, never asks for passwords | none (pure guidance) | auto | user stuck → asks what they see | journey completion rate |

## Memory & learning system (how they get smarter)

- **Customer memory:** the CRM timeline (every message, call summary,
  ticket, payment) is injected into context — shared memory across all
  employees.
- **Company memory:** tenant knowledge base via RAG (tenant + role
  scoped in SQL, not in the prompt).
- **Self memory:** `agent_runs` history + human edits in the approval
  queue = the tuning dataset. Weekly ritual: review edits → improve
  prompts → prompts are versioned files, changes go through git like code
  (golden-set evals gate promotions — docs/05 §5.5).

## Planned hires (Phase 2/3 — add via YAML+prompt when needed)

| Employee | Mission sketch |
|---|---|
| Research AI | market/competitor deep dives with cited sources (needs web-search tool) |
| Legal AI | contract drafts/reviews, compliance checklists — always attorney-reviewed, never_auto |
| Operations AI | project plans, resource scheduling, bottleneck alerts |
| Project Manager AI | turns goals into task trees, chases owners, status reports |
| Data Analyst AI | ad-hoc SQL/chart answers over tenant data |
| Translator AI | human-quality localization of any asset, brand-voice aware |
| Automation AI | builds/edits event workflows from natural language |

## Extension recipe (for developers)

1. `config/agents/<key>.yaml` — copy an existing bundle, set key/name/
   description, tools allowlist, knowledge scope, autonomy, guardrails.
2. `prompts/<key>_system.md` — role, method, output format, escalation
   markers ([ESCALATE], [LEAD] conventions).
3. If it needs a new tool: implement + allowlist it in the orchestrator/
   manager tool registries; outward actions MUST pass the autonomy gate.
4. Add its keyword routes to `manager.py` `_KEYWORD_ROUTES` and (if
   customer-facing) a card on /welcome + a page entry in agent.html.
5. Update tests (roster set + counts) and this Bible.
