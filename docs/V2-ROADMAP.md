# OmniX AI — V2 Expansion Roadmap

**Source:** the founder's three planning PDFs (PRD, Master Build Guide,
Technical Architecture — July 2026), reconciled against the live product.
**Rule #1 applies:** OmniX AI is live at omnixai-hypyf.ondigitalocean.app —
we extend the running FastAPI codebase, we never rebuild from scratch.

## 1. Tech-stack decision

The PDFs propose Next.js/React + Node microservices + Redis. The live
product is FastAPI + SQLAlchemy + vanilla-JS pages, deployed and earning
its keep. Decision: **keep the live stack.** What we adopt from the PDF
architecture instead, when scale demands it:

| PDF idea | How we adopt it |
|---|---|
| Model router for multiple LLMs | ✅ already live (`app/agents/llm.py`: Anthropic → OpenRouter → mock) |
| Queues (Redis) | 🔜 add RQ/Redis when background jobs outgrow in-process events |
| Object storage | 🔜 DO Spaces for `/generated` media (survives redeploys) |
| Microservices | ❌ not at this size — modular monolith is faster to ship & cheaper |
| RBAC, tenant isolation, white-label | ✅ multi-tenant from day one; roles land with Team Management |

## 2. Build-guide phases → live status

| # | PDF phase | Status |
|---|---|---|
| 1 | Authentication | ✅ LIVE — customer accounts, private workspaces (July 2026) |
| 2 | Dashboard | ✅ LIVE — CEO Command Center |
| 3 | AI chat | ✅ LIVE — Manager AI, voice input |
| 4 | Branding | ✅ LIVE — Branding AI → brand kit |
| 5 | Website builder | ✅ LIVE — Website AI publishes shareable pages |
| 6 | Content studio | ✅ LIVE — /studio: copy, images, video, 5-platform size pack |
| 7 | CRM | ✅ LIVE — leads, deals, conversations, appointments, invoices |
| 8 | Marketing | 🟡 PARTIAL — plans/campaign drafts; scheduler lands in V2-A |
| 9 | Analytics | ✅ LIVE — Analytics AI, health score, daily digest |
| 10 | White-label | 🟡 PARTIAL — multi-tenant core done; reseller branding V2-C |
| 11 | Affiliate | 🔜 V2-C |
| 12 | Marketplace | 🔜 V2-C |

## 3. PRD modules → live status

✅ **Already live:** AI Chat (Manager), Branding, Website Builder, Landing
Pages, Video Studio, Image Studio, Copywriting, CRM, Analytics,
Automation (event workflows), plus SEO/SCO/Guide/Support/Voice/HR/SOP —
18 employees the PDF doesn't even list yet.

🟡 **Partial:** Calendar (appointments exist → calendar UI in V2-A),
Billing (Stripe links → plan enforcement V2-B), White-label (tenant core
→ reseller skin V2-C), Ads Manager (Guide AI walkthroughs → native Meta/
TikTok APIs V2-B, needs platform developer approval).

🔜 **New modules queue:**

### Phase V2-A — this month (no external approvals needed)
1. **Team Management** — ✅ SHIPPED (/team): owner adds manager/staff
   teammates who sign in to the same workspace.
2. **Content Calendar / Social Scheduler** — ✅ SHIPPED (/calendar):
   plan posts per platform, open-composer + Guide-me publish flow.
3. **Video Studio** — ✅ SHIPPED (/video-studio, from the founder's
   "Master Build Prompt"): guided wizard (goal → brief → creative
   direction) → AI Director (concept/hook/script/storyboard/credit
   estimate) → per-scene edit/regenerate → provider router with the
   adapter port (`app/video/providers.py`: fal.ai live; HeyGen/Veo/
   Runway adapters enable when their keys are added; labelled Demo mode
   renders real MP4s locally — never fakes a provider) → ffmpeg
   assembly → 16:9 / 9:16 / 1:1 exports. Timeline editor, voice tracks,
   Stripe credits = next iterations.
4. **Business Consultant agent** — strategy Q&A grounded in tenant KPIs
   (the PDF's "CEO agent" reviewer split from Manager).

### Phase V2-B — needs keys/approvals from the founder
4. **Email Marketing** — campaign drafts → approval queue → send via
   Resend/Postmark key; list management on contacts.
5. **Billing enforcement** — Stripe webhooks flip tenant.plan; trial
   countdown; per-plan caps (agents stay, caps tighten).
6. **Ads Manager (native)** — Meta/TikTok marketing APIs after developer
   app approval; until then Guide AI playbooks remain the path.
7. **WhatsApp Business** — Cloud API onboarding (Meta approval).

### Phase V2-C — sell-the-platform layer
8. **White-label reseller skin** — custom domain, logo, colors per tenant.
9. **Affiliate program** — referral codes on signup, commission ledger.
10. **Marketplace** — agent/prompt/template packs installable per tenant.
11. **Automation builder** — natural language → event workflow (the
    "Automation AI" planned hire).

## 4. PDF agents → live employees

| PDF agent | Live employee |
|---|---|
| CEO | Manager AI ✅ (+ Business Consultant V2-A) |
| Marketing | Marketing AI ✅ |
| Copywriter | Content AI ✅ |
| Designer | Image AI ✅ |
| Video Creator | Video AI ✅ |
| Website Builder | Website AI ✅ |
| SEO | SEO AI ✅ (+ SCO AI bonus) |
| Ads | Guide AI playbooks now; native Ads agent V2-B |
| Analytics | Analytics AI ✅ |
| Customer Support | Support AI ✅ |
| Finance | Finance AI ✅ |
| Automation | Automation AI 🔜 V2-C |

## 5. Non-goals (explicitly rejected from the PDFs)

- Rebuilding the frontend in Next.js/React — no user-visible benefit
  today; revisit only if a mobile app or heavy interactivity demands it.
- Microservices — premature; modular monolith until >10k tenants.
- Glassmorphism restyle — the shipped design system (DESIGN-SYSTEM.md)
  stays; visual polish is iterative, not a rewrite.
