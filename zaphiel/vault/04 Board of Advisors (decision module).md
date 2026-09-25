---
generated_by: build-vault.js
source: zaphiel/memory.md
source_last_updated: 2026-09-25 (session 2: Website Builder agent via Lovable, John Chat Console, Obsidian = main brain rule)
built: 2026-09-25
tags: [zaphiel, memory]
---
# Board of Advisors (decision module)

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

Up: [[00 Home]]
