---
tags: [zaphiel, marketing, autopilot]
brand: BROWREVOLUTION
version: 1 (2026-10-13)
owner: Ryan
---
# Autopilot settings: BROWREVOLUTION

Ryan (2026-10-13): posts **fully automatic**, ad changes **automatic within his caps**, video/image generation
**automatic within a monthly credit budget**. Same rules as [[Brands/FusionTech_AI/autopilot]].

**Waiting for Ryan (one time):**
1. Confirm the facts in [[Brands/BROWREVOLUTION/Brand_Brain]] → they are copied into `approved` below. Until then
   **nothing is posted** (the engine refuses posts with no approved facts).
2. `max_daily_spend` (SGD) → until set, **no ad is changed**.
3. `monthly.kling` / `monthly.higgsfield` credits → until set, **nothing is generated**.

```json
{
  "brand": "BROWREVOLUTION",
  "metricool_brand_id": 7332947,
  "mode": "live",
  "currency": "SGD",
  "posts": { "auto": true, "max_per_day": 1, "networks": ["facebook", "instagram", "tiktok"] },
  "ads": { "auto": true, "platform": "meta", "ad_account_id": null, "max_daily_spend": null, "max_raise_pct": 20, "min_confidence": "HIGH", "raise_cooldown_days": 3, "keep_one_active": true },
  "credits": { "auto": true, "monthly": { "kling": null, "higgsfield": null } },
  "approved": { "claims": [], "prices": [] },
  "report": { "email": "ryandhana1515@gmail.com" }
}
```

Beauty-treatment rules always apply: no guaranteed results, no before/after, no "Singapore's leading" without proof,
no AI-made people, no invented reviews.
