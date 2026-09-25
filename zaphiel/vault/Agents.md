---
brain: FusionTech AI
tags: [zaphiel, agents]
updated: 2026-09-25
---
# Agents (FusionTech AI)

Every agent below reads this vault. The company knowledge is [[FusionTech AI — Master Company Brain]];
John also follows [[Knowledge/John — Sales playbook]]. All run on n8n at ryan1515.app.n8n.cloud
(project uFcEmgtYEFyGauyy). Ids are the workflow ids.

| Agent | What it does | n8n id |
|---|---|---|
| **John — Sales Agent** (Lead Intake) | Receives every enquiry (POST /webhook/ceo-brain/lead), loads the brain + playbook live, qualifies, extracts facts, drafts the reply, sends low-risk replies, escalates prices/contracts/refunds to Ryan, hands website requests to the Website Builder, writes the conversation to this vault | `b7kbJpnKLN2uQxyn` |
| **Website Builder** | Turns the conversation into a build brief + Lovable build prompt, stores one `website_build` task per lead, emails Ryan (link that opens Lovable with the prompt prefilled) | `hSTRGnHVsu6tMOmH` |
| **Website Build Record** | Receives the finished Lovable build (preview link), updates the task, sends the mock-up to the customer through the Outbound Sender (WhatsApp when the credential exists, else email), emails Ryan a copy | `RVPBGpBzj2SUQlgX` |
| **Outbound Sender** | The only place a customer message leaves the system (email live; WhatsApp waits for the Meta WhatsApp Business credential) | `SAcnNxG1GWPwn3N7` |
| **WhatsApp Inbound** | Meta WhatsApp Cloud API → John (GET/POST /webhook/ceo-brain/whatsapp, verify token ceo-brain-verify); Meta not pointed at it yet | `3IhIJ5IYsB7wQQSg` |
| **Approve Reply** | Ryan's APPROVE / Reject links in emails | `uQxHTTdEkazgKpRT` |
| **Vault Writer** | After every conversation turn writes the lead note (`Leads/`) and company note (`Companies/`) into this vault | `tVvSWjOubwBNLi88` |
| **Daily Brief** (CEO Intelligence Agent) | 08:00 SGT email: what happened, what needs Ryan | `Pew2PX1IcgdXqXr7` |
| **John Chat Console** | Test page to talk to John as a prospect: https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat | `ny60ozvH8B4uNpcb` |

## The website chain Ryan wants (target)
Customer on WhatsApp → **John** understands "build me a website" → **Website Builder** writes the
prompt and builds in Lovable → **Website Build Record** gets the preview link → **Outbound
Sender** sends the mock-up to the customer on WhatsApp → Ryan gets a copy. Nothing is published
to a live domain without Ryan.

What is still needed for the chain to run end to end without anyone: n8n AI credits (John and the
Website Builder currently answer from their rule engines), the Meta WhatsApp Business credential in
n8n (WhatsApp in/out), and Ryan's authorization for the Lovable build step (Lovable only allows
OAuth, so the build runs in a Claude session Ryan starts or approves once).

## What can actually act
n8n holds two credentials: Gmail and GitHub. So the agents can think, write to the data tables,
write to this vault, and email. WhatsApp needs the Meta credential; building on Lovable needs a
Claude session with the Lovable connector. Say so before promising an automation.

## Rules every agent follows
- Never invent facts; unknown = null and ask. Never quote prices, guarantees, delivery dates,
  contracts or refunds — those go to Ryan. WON/LOST are human decisions.
- Third-party software/API costs are always separate from FusionTech fees.
- Never store secrets in this vault or in logs.
