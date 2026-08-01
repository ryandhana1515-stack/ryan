# BIOGREEN // AGENT OPERATIONS HQ

A live, cyberpunk "AI agent environment" for the Bio Green Elixirs agent team —
inspired by the viral *AI Agent Environment Tour* TikTok format. A top-down neon
facility map where each of your AI agents lives in its own room, works in real
time, and streams what it's doing to a terminal ops feed.

## The agents on the floor

| Agent | Codename | Room | Job |
|---|---|---|---|
| Orchestrator (Claude) | **CLAUDE** | Claude Core | Routes every task between agents |
| Content Agent | **NOVA** | Content Studio | Captions, ad copy, emails |
| Ads Agent | **PULSE** | Ads Lab | Meta + TikTok Smart+ campaigns |
| Customer Service Agent | **ECHO** | Support Desk | 24/7 chat + WhatsApp |
| Research Agent | **LEDGER** | Research Bay | Trends, hooks, competitor gaps |
| Affiliate Agent | **ORBIT** | Affiliate Hub | Creators, reviews, commissions |

## Features

- Animated facility map (canvas, 60fps): glowing rooms, wandering agent sprites,
  task packets flying to the core, blinking server racks, CRT scanlines
- Live ops feed — timestamped log of what each agent "just did", including
  💰 sale pings that decrement BIO N:OV stock in the toolbar
- HUD stats: tasks today, sales signals, uptime, live clock
- Click any room (or roster card) to focus that agent and filter the feed

## Run it

No build step — it's plain HTML/CSS/JS:

```bash
cd agent-hq
python3 -m http.server 8080
# open http://localhost:8080
```

## Film it for TikTok

1. Open fullscreen (F11), let it run ~30s so the feed fills up.
2. Screen-record, then film the monitor with your phone (the phone-filming-a-
   screen look is part of the viral format — moiré and room lighting included).
3. Caption idea: *"My AI employees run my supplement brand while I sleep 🤖🌿
   #aiagents #BioGreenElixirs #BIONOV"*
