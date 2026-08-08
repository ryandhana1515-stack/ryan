# Jarvis Memory — persistent business state

> Every session reads this first and appends real changes before it ends.
> Rules: newest entry wins; never delete history (strike through and date instead);
> facts here outrank the static account skill when they disagree.

Last updated: 2026-08-08 (session: Board of Advisors + Jarvis brain build)

---

## 1. Live business state

- **Company:** Bio Green Elixirs — Singapore (ACRA-registered), owner Ryan Dhana, solo operator.
- **Hero product:** BIO N:OV — 3rd-gen nitric-oxide supplement, 500mg × 60 tablets,
  Bzzworld Korea manufacture, GMP + patented fermentation (KACC91554P). Ryan is the
  **Singapore distributor** (via Bisu World International, KL) — not the manufacturer.
- **Revenue:** $0 to date. **Shopify store: NOT yet live** (setup pending — this is the
  bottleneck to first revenue).
- **Channels live:** biogreenelixirs.com domain (Namecheap, to 2029), Google Workspace
  (info@biogreenelixirs.com), Facebook page, IG @biogreenelixirs, TikTok
  @biogreenelixirs. TikTok Shop SG application in progress; Shopee SG and Amazon US/EU pending.
- **Pricing:** retail price for BIO N:OV **not yet decided** — candidate work exists in
  ad drafts; a board meeting on pricing is a good next step. (Update this line the day
  pricing is set.)
- **Compliance:** supplement ads on Meta/TikTok restrict health claims — support/promote
  language only; "works in 30 minutes" claims must be framed as lab data, never cure/treat.
- **Other ventures:** VEX (venture studio site, in this repo), Veloce Tempesta GT +
  Aurum & Noir (concept luxury sites, Bio-Nov-website repo), BioExcela Global (ecommerce
  ecosystem concept), "Fusion AI / AI Business OS" architecture (omnixai app, session
  2026-07-15 — design phase).

## 2. The AI company (n8n @ ryan1515.app.n8n.cloud, project uFcEmgtYEFyGauyy)

Active workflows (ID — what it does):
- `cVOaVg8smx6412Kq` AI Manager — Company Orchestrator (chat; delegates to specialists)
- `trijC0dd0NbhXLJg` AI Manager — Daily Summary (18:00 daily → Manager Reports table)
- `cuJ1hUpX24cbau7n` AI Manager — Weekly Report (Mon 07:00 → Manager Reports table)
- `25JpHXIZXIyAvwLG` Content Agent — Daily Social Content (09:00 → Content Queue table)
- `mVa6ZEvC5w0xxef0` Ads Agent — Weekly Ad Drafts (Mon 10:00 → Ad Drafts table)
- `E3EeEIq9274TzbE4` Research Agent — Weekly Market Scan (Mon 08:00 → Research Reports)
- `2UEt08SHOgBw8Kp3` Affiliate Agent — Welcome (webhook POST /affiliate-signup)
- `0er3heB5espW8eEK` Customer Service Agent — 24/7 chat (BIO N:OV Q&A, compliance-guarded)
- `JVGDhhmPFSATl7B7` Omnichannel AI Hub — Universal Inbox (POST /inbound-message)
- `eS8K8Si0VqToZajp` WhatsApp Agent — Sandbox (webhook /whatsapp-in)
- `xDrtylIHseMy1vle` Voice Agent — Call Me Now (POST /call-me, ElevenLabs)
- `ObQN64nUN4QgoO3N` Voice Agent — Call Logger (/voice-call-log → Call Log table)
- `wWtVDcMhL0mXvmjf` Website Agent — Immersive 3D Site Designer (chat)
- `FYNbtG0oHGWiDI2g` Viral Content Engine (URL in → original short video → Metricool draft;
  email approval gate) — built 2026-08-06, PR #14 in this repo
- `mK8LuWxGITRr60GG` Email Daily Market Brief (weekdays 07:50 SGT — emails the brief the
  research session writes to GitHub)
- `s6x9D3vyoNSbvryn` Daily Market Research Agent (07:30 SGT writer — currently INACTIVE;
  the email workflow reads the repo file)
- `NOb10f0yUA8i8saA` **Board of Advisors — Meeting** (built 2026-08-08; see §4)
- Inactive/temp: `X5frUjOIdaMQPAbl` Louis Transcribe, `CyiN1kwx3bfjTQyW` +
  `r0IXsruqQ8kQ6NiU` art utilities, `c86AzvcNlDmPn5im` WABA subscribe.

n8n data tables: Business Profile, Leads CRM, Content Queue, Ad Drafts, Research
Reports, Manager Reports, Call Log, Affiliate Outreach, `board_meetings` (jJwgGyONl0lhlyFB).

## 3. Repos and sites

- `ryandhana1515-stack/ryan` — THIS repo: Jarvis brain, board/, bionov/ (BIO N:OV
  three.js landing), vex/ (VEX React site), nano_banana.py (OpenRouter image gen).
  Default branch: `claude/setup-nano-banana-openrouter-u2JAQ`.
- `ryandhana1515-stack/Bio-Nov-website` — Bio N:OV site experiments, luxury concept
  sites, n8n agent setup work.
- Open PRs in `ryan`: #14 Viral Content Engine assets, #15 Board of Advisors + Jarvis brain.

## 4. Board of Advisors (decision module)

- Seats: **Alex Hormozi** (Offers & Acquisition), **Charlie Munger** (Decision Quality &
  Risk), **Seth Godin** (Brand & Trust), **Sara Blakely** (Bootstrap Operations).
- Dossiers: `board/dossiers/*.md` (doctrine with primary sources, adversarially
  fact-checked — reports in `board/factcheck/`). Editing rules: retire entries, never
  delete; never hand-edit Verification fields (any substantive edit drops the entry to
  `user` until re-checked).
- Convene (CURRENT method — in-session, no API keys): the Claude session runs one
  isolated subagent per seat (each may read ONLY its own dossier file), the session
  itself chairs against the full live brief, then `node board/meeting.js` applies the
  citation gate + unanimity/prose guards deterministically, and the result is POSTed to
  n8n workflow `6go4TpVkwmoO1tnd` (webhook path `board-store`) which stores it in
  `board_meetings` and emails Ryan. Seat calls are covered by the Claude subscription.
- n8n workflow `NOb10f0yUA8i8saA` is the fully-built self-contained alternative, but
  its 3 Anthropic nodes fail with "Payment required" — **n8n AI credits are exhausted**
  (same reason the daily-brief workflow was rebuilt credential-free on 2026-08-05).
  It works again the day an Anthropic API key or n8n credits are added; storage, email,
  GitHub-fetch, gating and guards inside it are verified working.
- Standing review: monthly unprompted meeting (see skill for the routine).

## 5. Decisions log

- 2026-08-08 — Jarvis architecture: repo `ryan` is the brain (CLAUDE.md + jarvis/ +
  .claude/skills/jarvis); n8n is the always-on body; connectors are the hands. One-off
  session builds are over — new capabilities get indexed here.
- 2026-08-08 — Board roster fixed at Hormozi/Munger/Godin/Blakely; meetings via n8n with
  managed Anthropic credentials; chat + repo archive + email surfacing; monthly standing
  review approved by Ryan.
- 2026-08-06 — Viral Content Engine flow: reference URL → transcript → 3 Claude agents →
  email approval → render → Metricool draft (never auto-publish without approval).
- Earlier (from account skill): affiliate commissions 15–20% TikTok / 15–25% GoAffPro;
  target markets SG→MY/TH/PH→US/AU/UK; FAL.AI model choices for images/ads.

## 6. Change log

- 2026-08-08: Jarvis brain created (CLAUDE.md, jarvis/memory.md, jarvis skill). Board of
  Advisors built: parser+gate lib (38 tests), 4 researched dossiers, adversarial
  fact-check, n8n meeting workflow `NOb10f0yUA8i8saA`, `board_meetings` table, PR #15.

## 7. Open loops / next actions

- **#1 bottleneck: get the Shopify store live** — until then revenue is $0 and every ad
  dollar is premature (board meeting topic).
- Decide BIO N:OV retail pricing (convene the board with live cost data).
- TikTok Shop SG application — follow up.
- Merge PR #15 to activate the Jarvis brain for all future sessions.
- Wire the board's monthly standing review routine (first Monday of month).
- Fusion AI / AI Business OS: design exists; decide build vs park.
