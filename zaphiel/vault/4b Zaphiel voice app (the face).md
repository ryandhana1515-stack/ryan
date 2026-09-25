---
generated_by: build-vault.js
source: zaphiel/memory.md
source_last_updated: 2026-09-25 (session 2: Website Builder agent via Lovable, John Chat Console, Obsidian = main brain rule)
built: 2026-09-25
tags: [zaphiel, memory]
---
# Zaphiel voice app (the face)

- **Live URL: https://ryan-rho.vercel.app** — Vercel project `ryan`
  (prj_Bqty7IxYVy3xFGmDJF0vpxPU1pOh, team ryandhana1515-6929s-projects). Source:
  `zaphiel/app/` in this repo (index.html + manifest.webmanifest + icon.svg + vercel.json).
  Deploying: the team blocks creating NEW Vercel projects (403) — always deploy into the
  existing `ryan` project, and keep `vercel.json` in the upload (the project is pinned to
  the Python framework; the builds override is what makes static files serve).
- Behavior (v3, 2026-08-08): PWA (save to home screen = standalone app). Landing view is
  the VOICE CORTEX — first visit taps JACK IN for the mic, return visits auto-arm a
  standby sentinel that wakes on a clap (sharp transient) or ~350ms of speech. Behind a
  sidebar sit EIGHT TEXT SPECIALISTS (UGC Director, Product Visuals, Content, Ads,
  Web & 3D, Store & Pricing, Market Brief, Board Clerk), each its own chat with a copy
  button on every answer. Look: terminal palette, scanlines, and a coiled dragon
  ouroboros around the core that breathes with the voice.
- **How the specialists work (important):** they are all the SAME ElevenLabs agent, run in
  `textOnly` mode with a per-session `overrides.agent.prompt.prompt` — that is why there is
  only one agent to pay for. This required enabling prompt + firstMessage + text_only in
  the agent's `platform_settings.overrides`; if those get switched off, every sidebar chat
  silently falls back to the chief-of-staff persona.
- **VOICE ENGINE (changed 2026-08-09): free on-device speech is now the DEFAULT.** The
  ElevenLabs account ran out of credits — every conversation from 2026-08-08 onward died in
  0-3 seconds with `termination_reason: "This request exceeds your quota limit."`, which
  surfaced to Ryan as "link closed" halfway through speaking. The app now uses the Web
  Speech API (recognition + speechSynthesis) with no quota and no cost, picking the best
  neural voice installed on the device. Tell Ryan to install a premium voice at
  Settings > Accessibility > Spoken Content > Voices — that is what makes it sound human
  rather than robotic. `ENGINE` in the app switches between "free" and "eleven" and is
  remembered in localStorage; if an ElevenLabs session dies inside 6 seconds without the
  agent ever speaking, the app now names the real cause on screen and falls back to free
  permanently instead of looping on reconnect.
- Brain for the free voice is on-device (`MIND` in the app) — real business facts only,
  and it says "I don't know" rather than inventing. `BRAIN_URL` is the single constant to
  point at a remote LLM endpoint when one is available; nothing else needs changing.
- **Anti-queue rule, baked in:** every specialist prompt AND the voice prompt forbid saying
  a request was filed, queued or emailed. They must produce the finished script/copy/plan
  in the window. `dispatch_task` is a last step, only when Ryan asks to queue something.
- Board Clerk never speaks for the four seats — it only sharpens the question, so the
  citation-gated meeting remains the only place they are quoted.
- Voice brain: **ElevenLabs conversational agent `agent_3001kzgz64emesm91398nx05c17e`**
  ("ZAPHIEL — Ryan's Chief of Staff", public auth, 10-min session cap, ElevenLabs-side
  usage billed to Ryan's ElevenLabs account). Its `dispatch_task` webhook tool POSTs
  {task, category} to the Zaphiel — Task Intake workflow (`eIgJT3NAuP7v9Hes`), so tasks
  spoken to the face land in `jarvis_tasks` + Ryan's inbox for a Claude session to execute.
- Older artifact prototype (tap-to-talk, local intent engine, no ElevenLabs cost):
  `zaphiel/face/index.html`.
- **Push-to-deploy now works.** A root `vercel.json` (static build of `zaphiel/app`
  with routes to its index) overrides the project's Python framework pin — every
  git deploy before 2026-08-08 failed with PYTHON_ENTRYPOINT_NOT_FOUND. Pushes to a
  feature branch build a PREVIEW at
  `ryan-git-claude-ai-agent-bo-f4821d-ryandhana1515-6929s-projects.vercel.app`;
  only a push to the DEFAULT branch (i.e. merging the PR) updates production
  `ryan-rho.vercel.app`. The Vercel MCP deploy tool needs an interactive permission
  grant Ryan must approve; merging is the credential-free path to production.

Up: [[00 Home]]
