---
generated_by: build-vault.js
source: zaphiel/memory.md
source_last_updated: 2026-09-25 (session 2: Website Builder agent via Lovable, John Chat Console, Obsidian = main brain rule)
built: 2026-09-25
tags: [zaphiel, memory]
---
# Autonomous daily run (the thing that works without Ryan)

- Spec: `zaphiel/routines/daily-operator.md` — full parameters and the verbatim prompt.
- Fires 08:00 SGT daily as a FRESH Claude session (so it carries the full connector set),
  push + email notification on completion.
- Each run: read memory, check Shopify and the Meta ad-account flags for real, then DO one
  concrete thing that advances open loop #1, then write what changed back to memory and push.
- Guardrails in the prompt: spends no money, publishes nothing, sets nothing ACTIVE, invents
  no numbers, and must admit plainly when a run achieved nothing.
- **Status: awaiting Ryan's approval of the create_trigger permission prompt.** Re-issue the
  call verbatim from the spec once granted.

Up: [[00 Home]]
