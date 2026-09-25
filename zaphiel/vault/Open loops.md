---
tags: [zaphiel, open-loops]
---
# Open loops

- **Ryan:** top up n8n AI credits (John and the Website Builder are on rule fallbacks).
- **Ryan:** WhatsApp credential in n8n — steps in [[Knowledge/_How to connect WhatsApp]]. Then
  Zaphiel re-adds the WhatsApp node to the Outbound Sender and points Meta at the inbound webhook.
- **Ryan — unblock the automatic mock-up chain.** Zaphiel designed it (John's intake gate → Website
  Builder auto-decision with one build per lead and a daily cap → "Website Build Runner" workflow in
  n8n using the MCP Client node with a Lovable OAuth credential → Website Build Record → Outbound Sender
  sends the link) but Claude Code's permission system refused to let it create the unattended,
  credit-spending agent, twice ("Create Unsafe Agents"). Only Ryan can lift that: add a permission
  rule in the Claude Code settings for this environment that allows it, then start a session and say
  "build the automatic mock-up chain". One-time account connections are still needed for it to run:
  Lovable OAuth credential in n8n (MCP Client node → mcp.lovable.dev), Meta WhatsApp credential, n8n AI
  credits. Until then, mock-ups are built by a Claude session on request (as the BMW demo was) and the
  rest of the chain is automatic.
- **Ryan:** paste `ceo-brain/website-chat/embed-snippet.html` into FusionTech.com.sg before `</body>`
  so visitors talk to John there; until then use https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat.
- **Ryan:** open the Training Room once (https://ryan1515.app.n8n.cloud/webhook/ceo-brain/dashboard),
  enter the PIN, allow the microphone, and change the PIN in n8n ("CEO Brain — Trainer API" →
  Trainer Config node) from the repo default.
- **Zaphiel:** after credits: run a real conversation, confirm John answers with Claude and the
  Leads/ note fills in with names and facts.
- **Ryan:** the directive message was cut off after "Client" in Part 26 — send the rest (the second
  client example and anything after it).
- **Ryan:** run one real discovery in the Discovery Console and correct the agent in
  [[Knowledge/Company Discovery — playbook]]; approve or reject the first proposal draft task.
- **Zaphiel (after credits):** Website QA inspection of a built Lovable preview (the checklist exists;
  the inspection needs a built site); Solution Architect, Customer Service, Email/Admin, Marketing,
  Operations, Finance Assistant agents in the same contract; Supabase migration (002 is ready).
