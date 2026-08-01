# BIOGREEN // AGENT OPERATIONS HQ

A live, pixel-art "AI agent environment" for the Bio Green Elixirs agent team —
inspired by the viral *AI Agent Environment Tour* TikTok format. A top-down neon
facility where every one of your **real n8n agents** lives in its own room as an
animated pixel worker: they walk to desks, type, and stream what they're doing
to a terminal ops feed.

## The agents on the floor (mapped to the live n8n instance)

| Sprite | Room | Real n8n workflow(s) |
|---|---|---|
| **MANAGER** | AI Manager Core | AI Manager — Company Orchestrator · Daily Summary · Weekly Report |
| **NOVA** | Content Studio | Content Agent — Daily Social Content (daily 09:00) |
| **PULSE** | Ads Lab | Ads Agent — Weekly Ad Drafts (Mon 10:00) |
| **ECHO** | Support Desk | Customer Service Agent — 24/7 Chat |
| **LEDGER** | Research Bay | Research Agent — Weekly Market Scan (Mon 08:00) |
| **ORBIT** | Affiliate Hub | Affiliate Agent — Welcome New Affiliates (`/affiliate-signup`) |
| **WAVE** | Inbox Hub | WhatsApp Agent — Sandbox (`/whatsapp-in`) + WABA utility |
| **RELAY** | Inbox Hub | Omnichannel AI Hub — Universal Inbox (`/inbound-message`) |
| **VOX** | Voice Ops | Voice Agent — Call Me Now + Call Logger |
| **FORGE** | Web Forge | Website Agent — Immersive 3D Site Designer |

HUD numbers are seeded from the real instance at build time: 14 workflows,
83 executions, 96.4% success rate. FORGE shows an amber `2 ERR` status because
its last runs actually errored in n8n.

## Features

- **Working pixel agents**: 8×10 pixel-art workers with walk/type animations,
  per-agent colors, glow, name tags — they wander, sit at desks, and "work"
  whenever their workflow fires in the ops feed
- Facility map (canvas, 60fps): 9 glowing rooms, desks with flickering
  monitors, blinking server racks, task packets flying to the Manager core,
  animated corridors, CRT scanlines
- Live ops feed with per-agent activity based on each workflow's real job,
  💰 sale pings, and a BIO N:OV stock ticker
- Click a room (or roster card) to focus an agent and filter the feed —
  clicking Inbox Hub cycles between WAVE and RELAY

## Run it

No build step — plain HTML/CSS/JS:

```bash
cd agent-hq
python3 -m http.server 8080
# open http://localhost:8080
```

## Film it for TikTok

1. Open fullscreen (F11), let it run ~30s so the feed fills up.
2. Screen-record, then film the monitor with your phone (the phone-filming-a-
   screen look is part of the viral format — moiré and room lighting included).
3. Caption idea: *"My 10 AI employees run my supplement brand while I sleep 🤖🌿
   #aiagents #n8n #BioGreenElixirs #BIONOV"*
