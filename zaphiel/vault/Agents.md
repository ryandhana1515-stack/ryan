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
| **Discovery — Company Discovery & Onboarding Agent** | Talks to a business owner like a consultant (max two questions per reply), never asks for "all your data", classifies where information lives (connect / import / index / summarise / leave), builds the **Client Digital Company Map** into `Discovery/` in this vault after every turn and, when complete, a **proposal draft** (no pricing) + review task + email to Ryan. Reads the master brain + [[Knowledge/Company Discovery — playbook]] live. Console: https://ryan1515.app.n8n.cloud/webhook/40d1b87c-1ec4-4534-ac80-bbdeef475d23/chat | `9TnzsgPGRatMaQI3` |
| **Website Builder v2** (SME + Medical modes) | Turns the conversation into a premium build brief: mode, business category, design direction (brand personality, typography, layout, imagery, motion, palette — the generic AI look is forbidden), pages, content rules, medical verification list, QA checklist, Lovable build prompt; **v2.2 Decide Build** (auto-build policy: one build per lead, daily cap, no approval) starts the Website Build Runner; one `website_build` task per lead; emails Ryan. Reads [[Knowledge/Website design standard]] + [[Knowledge/Website Builder — playbook]] live | `hSTRGnHVsu6tMOmH` |
| **Website Build Record** | Receives the finished Lovable build (preview link), updates the task, sends the mock-up to the customer through the Outbound Sender (WhatsApp when the credential exists, else email), emails Ryan a copy | `RVPBGpBzj2SUQlgX` |
| **Outbound Sender** | The only place a customer message leaves the system (email live; WhatsApp waits for the Meta WhatsApp Business credential) | `SAcnNxG1GWPwn3N7` |
| **WhatsApp Inbound** | Meta WhatsApp Cloud API → John (GET/POST /webhook/ceo-brain/whatsapp, verify token ceo-brain-verify); Meta not pointed at it yet | `3IhIJ5IYsB7wQQSg` |
| **Approve Reply** | Ryan's APPROVE / Reject links in emails | `uQxHTTdEkazgKpRT` |
| **Vault Writer** | After every conversation turn writes the lead note (`Leads/`) and company note (`Companies/`) into this vault | `tVvSWjOubwBNLi88` |
| **Website Intelligence** (internal, ADR-3) | Between John and the Website Builder: identifies the company, searches and reads its public pages, labels facts, writes the WEBSITE_CREATOR_BRIEF (two variations, placeholders) and calls the builder; questions go to John via the Orchestrator; never talks to the customer | `5VWP3tMK3MZysi7w` |
| **ATLAS** (EDG & CRM Systems Architect, internal) | Works behind John. When a named company needs CRM / automation / integrations (not only a website) and John knows how it works today, Lead Intake hands the lead to ATLAS once. ATLAS reads Ryan's agent file `.claude/agents/atlas.md` live, runs DESIGN mode to **checkpoint 1** (company model, current state, problem map, report to John, open questions) into `80_Clients/<company>/edg/`, opens an approval task, emails Ryan and tells the Orchestrator. Stops there until Ryan confirms. Checkpoint 2+ (architecture, build spec), BUILD and AUDIT run in Claude Code with the same agent file and all tools. Never talks to the customer | `9XQWSgTBszRc0Jxj` |
| **CEO Orchestrator** (Agent #0) | Head agent, no AI: receives every event (`POST /webhook/ceo-brain/event`), routes it by a fixed table, opens exception/review tasks, emails Ryan on failures, recomputes the unresolved-issues list hourly and writes [[00_CEO_Brain/Management view]] | `8Ix4yc223sxrSu5h` |
| **Approval Inbox** | One page for everything waiting on a human — approvals (Approve/Reject via the Approve Reply gate), exceptions (Mark recovered, PIN), leads needing a human, overdue, stale: https://ryan1515.app.n8n.cloud/webhook/ceo-brain/inbox | `r4ynzcSqRy8zHoFl` |
| **Daily Brief** (CEO Intelligence Agent) | 08:00 SGT email: what happened, what needs Ryan | `Pew2PX1IcgdXqXr7` |
| **John Chat Console** | Test page to talk to John as a prospect: https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat | `ny60ozvH8B4uNpcb` |
| **Training Room** (dashboard) | Ryan's training app: https://ryan1515.app.n8n.cloud/webhook/ceo-brain/dashboard — lists every agent in [[Knowledge/agents.json]] plus the brain; talk to an agent by voice or text, teach it ("when a customer says X, then …" → written into its playbook note here), read its playbook live | `AM59goLdbt0clv8q` |
| **Trainer API** | Backend of the Training Room (POST /webhook/ceo-brain/trainer, PIN-protected): reads the registry + playbooks from this vault, appends lessons to the playbook notes, relays chat to John / the Website Builder / any agent with a `chat_url` in the registry (Discovery) | `zKqlk05WShUOrojw` |

## The twelve-agent workforce
The full roster Ryan defined and what exists today: [[Knowledge/AI Workforce — roster]]. Product
architecture (CEO Brain modules, CRM/ERP layer, build pipeline): [[Knowledge/CEO Brain — product architecture]].

## The website chain Ryan wants (target)
Customer on WhatsApp → **John** understands "build me a website" → **Website Builder** writes the
prompt and builds in Lovable → **Website Build Record** gets the preview link → **Outbound
Sender** sends the mock-up to the customer on WhatsApp → Ryan gets a copy. Nothing is published
to a live domain without Ryan.

**Proven end to end on 2026-09-25 (BMW demo):** a customer told John in the chat console "I'm Daniel
from Prestige Motors, a BMW dealership… I want a premium website with test-drive booking and
WhatsApp" → John handed it to the Website Builder (task `task_web_lead_chat_mcpsession1790361458590`)
→ the mock-up was built on Lovable (project `e650eee1-4666-475f-95dc-0686284264fc`, preview
https://id-preview--e650eee1-4666-475f-95dc-0686284264fc.lovable.app) → Website Build Record flipped
the task to `built` and emailed Ryan the preview (execution 229). The customer send was skipped only
because it was a test session with no phone or email.

**2026-09-26:** second Prestige Motors mock-up built to the cinematic standard with generated photography (Lovable `5fa1ce49-c40c-4fc1-935d-e6935a33421f`); see [[Change log]].

**2026-09-25, later:** Ryan rejected the first mock-up (flat black boxes, no photography) and set the
zero-approval flow. The repo now has it end to end (John intake → Website Builder v2.1 cinematic
standard → **Website Build Runner** with Higgsfield/Kling photography + Lovable → Build Record → John
sends the link). Deployment is blocked by Claude Code's permission classifier; see Open loops.

Customers can already talk to John from the web: public page
https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat (n8n `FngKsJ2x0AaWOdJl`); the same chat bubble
for FusionTech.com.sg is in `ceo-brain/website-chat/embed-snippet.html` (paste before `</body>`).

What is still needed for the chain to run with no one touching anything: n8n AI credits (John and
the Website Builder currently answer from their rule engines), the Meta WhatsApp Business credential
in n8n (WhatsApp in/out), and the automatic Lovable build step. Today the build step runs in a Claude
session (this one built the BMW demo). n8n's MCP Client node supports OAuth, so an unattended
"Website Build Runner" workflow (brief → Lovable MCP `create_project` → wait → report to
/webhook/ceo-brain/website-built) is possible once Ryan authorizes the Lovable OAuth credential in n8n
once; Zaphiel's attempt to create that runner workflow was blocked by its permission system and needs
Ryan's explicit go-ahead.

## Adding a new agent
Create its playbook note under `Knowledge/`, add it to [[Knowledge/agents.json]] (id, name, role,
playbook path, chat type, workflow id) and it appears in the Training Room on the next page load —
no dashboard change needed. Wire the playbook into the agent's prompt the way John's is.

## What can actually act
n8n holds two credentials: Gmail and GitHub. So the agents can think, write to the data tables,
write to this vault, and email. WhatsApp needs the Meta credential; building on Lovable needs a
Claude session with the Lovable connector (or, once Ryan authorizes it, an n8n MCP Client node with a
Lovable OAuth credential). Say so before promising an automation.

## Rules every agent follows
- Never invent facts; unknown = null and ask. Never quote prices, guarantees, delivery dates,
  contracts or refunds — those go to Ryan. WON/LOST are human decisions.
- Third-party software/API costs are always separate from FusionTech fees.
- Never store secrets in this vault or in logs.


## CEO Brain v3 contracts
Every agent now has a contract note in [[10_Agents/_index|10_Agents]] (16 head agents) and [[20_Specialist_Workers/_index|20_Specialist_Workers]] (9 workers); the rules they share are in [[00_CEO_Brain/00_Master_Rules]].
