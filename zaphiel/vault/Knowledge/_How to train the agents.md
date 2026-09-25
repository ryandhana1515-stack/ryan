---
tags: [zaphiel, howto, training]
for: Ryan
---
# How to train the agents

Every agent is three layers. You train the first two yourself in Obsidian; the third is code.

| Layer | What it holds | Who edits | When it takes effect |
|---|---|---|---|
| **Brain** — [[FusionTech AI — Master Company Brain]] | Facts about the company, offer, positioning, sales rules | You, in Obsidian | John's next message (live) |
| **Playbook** — e.g. [[Knowledge/John — Sales playbook]] | How to behave: tone, answers to common questions, lessons learned | You and the agents | John's next message (live) |
| **Guardrails** — code in the repo (`ceo-brain/`) | JSON output schema, "never quote prices", human-only decisions, hand-off rules | Zaphiel, when you ask | After a redeploy (Zaphiel does it) |

## Training John (the WhatsApp / sales agent)
1. **Talk to him** as a prospect in the chat console
   (https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat).
2. **Read what he did**: the conversation and the facts he extracted appear in `Leads/Test/…`
   in this vault within 10 minutes (real customers under `Leads/`).
3. **Correct him in the playbook**: open [[Knowledge/John — Sales playbook]] and add a line, e.g.
   "When someone asks about ROI, say we measure lost leads recovered in the first 30 days" or
   "Never say 'chatbot'". Under **Lessons learned** write what went wrong and what he should do
   instead. Newest lines win. He follows it on the next message.
4. **Change company facts in the brain note**, not in the playbook (new service, new positioning).
5. Anything about *rules* (what he may never do, the hand-off to the Website Builder, the JSON he
   must return) → tell Zaphiel; that is code and gets a test before it ships.
6. Keep both notes short. Everything in them is sent to John on every message; long notes make him
   slower and vaguer.

## Training the Website Builder
- Today it reads its instructions from the repo; its live playbook note
  `Knowledge/Website Builder — playbook` is the next wiring step (same pattern as John).
  Until then, write what you want there anyway: page structure you like, styles, must-have
  sections, things never to build. Zaphiel wires it in on the next redeploy.
- Judge its work in the brief emails and, once builds run, the Lovable previews. Put your verdicts
  under "Lessons learned" in that note.

## Training every future agent (same recipe)
- One brain (shared: the master brain note) + one playbook note per agent + code guardrails.
- Agents also **teach themselves**: after each conversation the Vault Writer records what happened
  in `Leads/` and `Companies/`; the Daily Brief reads those and tells you what to fix; you write the
  fix in the playbook. That loop is how the brain "gets better and grows".

## Where to check what an agent actually did
- `Leads/<lead>.md` — full conversation log and extracted facts.
- n8n → Executions — every run, node by node (ask Zaphiel to read one for you).
- n8n data table `ceo_agent_runs` — which model answered (`anthropic` = Claude, `rules` = the
  fallback because AI credits ran out) and how long it took.
