---
generated_by: build-vault.js
source: zaphiel/memory.md
source_last_updated: 2026-09-25 (session 2, final: Obsidian vault is LIVE — this file is archived, the vault is the brain)
built: 2026-09-25
tags: [zaphiel, memory]
---
# The AI company (n8n @ ryan1515.app.n8n.cloud, project uFcEmgtYEFyGauyy)

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
- `eIgJT3NAuP7v9Hes` **Zaphiel — Task Intake** (webhook POST
  https://ryan1515.app.n8n.cloud/webhook/jarvis-task, body {task, category} →
  `jarvis_tasks` table + email to Ryan; this is where the voice app's dispatch_task lands.
  Webhook path and table keep the old `jarvis` spelling on purpose — the live voice agent
  calls that exact URL; renaming them breaks it.)
- `FYNbtG0oHGWiDI2g` Viral Content Engine (URL in → original short video → Metricool draft;
  email approval gate) — built 2026-08-06, PR #14 in this repo
- `mK8LuWxGITRr60GG` Email Daily Market Brief (weekdays 07:50 SGT — emails the brief the
  research session writes to GitHub)
- `s6x9D3vyoNSbvryn` Daily Market Research Agent (07:30 SGT writer — currently INACTIVE;
  the email workflow reads the repo file)
- `NOb10f0yUA8i8saA` **Board of Advisors — Meeting** (built 2026-08-08; see [[04 Board of Advisors (decision module)|§4]])
- `5Lvs87v8qfVMoUiB` Zaphiel — Voice Brain (POST /webhook/zaphiel-brain; inactive draft)
- `b7kbJpnKLN2uQxyn` **CEO Brain — Lead Intake** — ACTIVE. POST
  https://ryan1515.app.n8n.cloud/webhook/ceo-brain/lead → Sales Agent "John" (Claude via Gateway
  credits, FusionTech context, rule-engine fallback) → ceo_* tables → auto-send low-risk reply
  via the Outbound Sender, else approval email with APPROVE/Reject links. Source of truth:
  `ceo-brain/` (build.js generates it — never hand-edit its Code nodes). See [[4g CEO Brain — AI Company OS, Phase 1 (built 2026-09-24)|§4g]].
- `SAcnNxG1GWPwn3N7` CEO Brain — Outbound Sender (sub-workflow; email via Gmail live, WhatsApp
  node removed until a WhatsApp Business Cloud credential exists)
- `uQxHTTdEkazgKpRT` CEO Brain — Approve Reply (GET /webhook/ceo-brain/approve … links in emails)
- `3IhIJ5IYsB7wQQSg` CEO Brain — WhatsApp Inbound (GET/POST /webhook/ceo-brain/whatsapp, verify
  token ceo-brain-verify) — published, Meta NOT pointed at it yet
- `Pew2PX1IcgdXqXr7` CEO Brain — Daily Brief (08:00 SGT → email; CEO Intelligence Agent v0)
- `hSTRGnHVsu6tMOmH` **CEO Brain — Website Builder** (Agent #2; called by Lead Intake when a
  customer asks for a website/web app → brief + Lovable build prompt → approval task → email with
  OPEN IN LOVABLE button; source `ceo-brain/workflows/website-builder/build.js`)
- `RVPBGpBzj2SUQlgX` CEO Brain — Website Build Record (POST /webhook/ceo-brain/website-built; the
  agent session that builds on Lovable reports here → task built/failed/skipped + preview email)
- `ny60ozvH8B4uNpcb` **CEO Brain — John Chat Console** — hosted chat to test John:
  https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat (test_mode)
- Inactive/temp: `X5frUjOIdaMQPAbl` Louis Transcribe, `CyiN1kwx3bfjTQyW` +
  `r0IXsruqQ8kQ6NiU` art utilities, `c86AzvcNlDmPn5im` WABA subscribe.

n8n data tables: Business Profile, Leads CRM, Content Queue, Ad Drafts, Research
Reports, Manager Reports, Call Log, Affiliate Outreach, `board_meetings` (jJwgGyONl0lhlyFB),
`jarvis_tasks` (XqtaUAUVXTfTjb7F — voice-dispatched tasks land here; legacy name, see [[02 The AI company (n8n @ ryan1515.app.n8n.cloud, project uFcEmgtYEFyGauyy)|§2]] note),
**CEO Brain (2026-09-24):** `ceo_leads` (R78LlzNLIpVoy802), `ceo_messages` (eImH5AdVZEOW0t31),
`ceo_agent_runs` (zoxuUjbgzs6iLIaU), `ceo_tasks` (sPnRGXe4VYDJLJHr), `ceo_audit_logs`
(zjeuGe9AEgJS5MKg) — every row carries `tenant_id`.

Up: [[00 Home]]
