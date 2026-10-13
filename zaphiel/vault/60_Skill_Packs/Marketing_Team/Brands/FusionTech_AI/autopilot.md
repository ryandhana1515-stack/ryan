---
tags: [zaphiel, marketing, autopilot]
brand: FusionTech AI
version: 1 (2026-10-13)
owner: Ryan
---
# Autopilot settings: FusionTech AI

Ryan (2026-10-13): posts **fully automatic**, ad changes **automatic within his caps**, video/image generation
**automatic within a monthly credit budget**. The daily routine reads the JSON block below; the guardrail engine
(`ceo-brain/agents/marketing/autopilot.js`) refuses anything outside it. Ryan edits only the values.

How to change it (plain words):
- `mode`: `live` = it acts by itself · `dry_run` = it only says what it would do · `off` = stopped.
- `ad_account_id`: the Meta ad account (`act_…`), filled in when the ad account is linked.
- `max_daily_spend`: the most all ads may spend per day together (SGD). **Empty (`null`) = no ad is ever changed.**
- `max_raise_pct`: how much a winning ad's budget may rise in one day (never more than 20).
- `monthly.kling` / `monthly.higgsfield`: credits it may spend per month. **`null` = it generates nothing.**
- `approved.claims` / `approved.prices`: the only facts and prices a post may use (from the Brand Brain).

```json
{
  "brand": "FusionTech AI",
  "metricool_brand_id": 6656122,
  "mode": "live",
  "currency": "SGD",
  "posts": { "auto": true, "max_per_day": 1, "networks": ["facebook", "instagram", "tiktok"] },
  "ads": { "auto": true, "platform": "meta", "ad_account_id": null, "max_daily_spend": null, "max_raise_pct": 20, "min_confidence": "HIGH", "raise_cooldown_days": 3, "keep_one_active": true },
  "credits": { "auto": true, "monthly": { "kling": null, "higgsfield": null } },
  "approved": {
    "claims": [
      "FusionTech AI is an AI software and automation company.",
      "AI AUTOMATION FOR A SMARTER TOMORROW.",
      "AUTOMATE • INNOVATE • SCALE • TOGETHER",
      "Singapore to the World.",
      "THE CEO BRAIN: an AI operating layer built around an individual company.",
      "A customized AI workforce and company operating system.",
      "Your employees should not waste hours repeatedly moving information between systems, chasing routine follow-ups and searching for information.",
      "FusionTech connects your company's systems and builds AI agents around your actual workflow.",
      "Diagnose first. Architect second. Build third. Test fourth. Deploy fifth. Improve continuously.",
      "Start with one high-value workflow: Lead Capture + AI Qualification + WhatsApp Follow-up + CRM + Appointment Booking + CEO Reporting."
    ],
    "prices": []
  },
  "report": { "email": "ryandhana1515@gmail.com" }
}
```

Source of the claims: [[Brands/FusionTech_AI/Brand_Brain]] (verbatim from the Master Company Brain). No prices, no
client names, no results: there are no paying clients yet.
