# BIOGREEN // AGENT OPERATIONS HQ — 3D

A fully immersive 3D spaceship deck where the Bio Green Elixirs AI agent team
**lives, moves, and actually works** — every agent is wired to its real n8n
workflow on `ryan1515.app.n8n.cloud`. Click any agent and you're chatting with
the live workflow behind it.

## What's real (linked to n8n)

| Agent | Chat backend | What happens when you message it |
|---|---|---|
| **MANAGER** | AI Manager chat trigger | The real orchestrator answers, delegating to its specialist sub-agents |
| **NOVA / PULSE / LEDGER** | AI Manager chat trigger | Routed to the Manager's real Content / Copy&Ads / Research specialists |
| **ECHO** | Customer Service chat trigger | The live 24/7 support agent with conversation memory |
| **FORGE** | Website Agent chat trigger | Describe a site → returns a build-ready package (3D plan, Kling prompts, Lovable brief) — "build websites" from inside the HQ |
| **RELAY / WAVE** | Omnichannel `/inbound-message` webhook | Claude answers from your Business Profile; the lead is logged to Leads CRM in n8n |
| **VOX** | Omnichannel webhook + `☎ REQUEST CALL` button | The call button POSTs `/call-me` and triggers a real ElevenLabs outbound phone call |
| **ORBIT** | Affiliate `/affiliate-signup` webhook | Type `name, email@x.com, followers` → runs a REAL signup, logs to Affiliate Outreach, returns the AI welcome message |

**📊 n8n ANALYTICS** (top bar) opens the grid dashboard: all 14 workflows with
run counts, error highlights and links into the n8n editor. Data is a snapshot
of the live instance (see `data/snapshot.js` — regenerate any time by asking
your AI CTO to "refresh the HQ analytics snapshot").

## The 3D deck

- Nine glowing rooms on a starship deck: hull walls with window strips,
  starfield, CRT scanlines, central AI Manager reactor core with orbiting rings
- **Voxel agents that genuinely move**: A* pathfinding on a nav grid — they
  wander their rooms, walk through door gaps and corridors to visit the core
  and other departments, sit at desks and type (screens flicker while they work)
- Task packets arc through the air to the core whenever a workflow fires
- Free camera: drag to orbit, scroll to zoom, click an agent to fly to it,
  `RESET CAM` to pull back to the overview
- Live ops feed + sales pings + BIO N:OV stock ticker, as before

## Run it

```bash
cd agent-hq
python3 -m http.server 8080
# open http://localhost:8080
```

No build step. Three.js is vendored locally (`vendor/three.module.min.js`).

## If chat says "[offline sim]"

The page couldn't reach `ryan1515.app.n8n.cloud` — usually CORS:

1. Open the workflow in n8n → the trigger node (Chat Trigger / Webhook)
2. Options → **Allowed Origins (CORS)** → set to `*` (or your site's origin)
3. Save + keep the workflow active, then retry

The VOX call button additionally needs the ElevenLabs credential + phone-number
ID filled in the "Make Outbound Call" node (currently a placeholder in n8n).

## Film it for TikTok

Fullscreen it, let the deck run, slowly orbit with the mouse, open a chat with
FORGE and ask for a website live on camera. Caption: *"I built a 3D command
deck for my AI employees — and I can talk to every one of them 🤖🚀
#aiagents #n8n #BioGreenElixirs"*
