---
tags: [atlas, platform, v4]
date: 2026-10-02
---
# Atlas Platform v4: one platform, many clients

Ryan, 2026-10-02: "CLAUDE CODE MASTER PROMPT — ATLAS PLUG-AND-PLAY AI BUSINESS PLATFORM (v4)". Core rule: **one Atlas
platform, many clients; Fusion controls what each client can see and use.**

- **Spec (word for word):** `fusion-edg-core/docs/platform-v4/SPEC.md` — https://github.com/ryandhana1515-stack/fusion-edg-core/blob/main/docs/platform-v4/SPEC.md
- **Phase 0 audit + gap analysis + phase plan:** `fusion-edg-core/docs/platform-v4/00_AUDIT.md` — https://github.com/ryandhana1515-stack/fusion-edg-core/blob/main/docs/platform-v4/00_AUDIT.md
- **Status:** CHECKPOINT 0 — waiting for Ryan's review and decisions. No platform code changes until he approves.

## The short version of the audit
- The Atlas **platform** is the `fusion-edg-core` repo (no second codebase exists; nothing to merge). ATLAS the **agent**
  designs; the platform builds and runs; the n8n CEO Brain is FusionTech's own internal sales machine.
- Only one database exists (`fusion-edg-dev`, fake data). No production yet.
- Strong already: every table locked per business, audit trail, no double-sends, rehearsal before anything goes live.
- Biggest gaps for v4: Fusion's own master control screen and platform admin login (with two-step login), real module
  ON/OFF switches enforced by the server and database (today only hidden in the screen), one machine key that can do
  too much, and background work that only runs once a day on the current hosting plan.

## Phases (spec §22, adjusted to what exists)
1 Tenant/auth/security/entitlements + Fusion Master Control · 2 CRM/timeline/follow-ups/tasks · 3 Communications ·
4 Home/approvals/notifications (largely built) · 5 Other modules · 6 AI workforce registry · 7 Builder/analytics/templates.
Stop for Ryan after every phase.
