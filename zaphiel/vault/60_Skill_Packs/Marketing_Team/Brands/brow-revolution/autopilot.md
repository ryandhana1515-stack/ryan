---
tags: [zaphiel, marketing, autopilot]
brand: BROWREVOLUTION
version: 1 (2026-10-13)
owner: Ryan
---
# Autopilot settings: BROWREVOLUTION

> **Pilot company (Ryan, 2026-10-15):** Brow Revolution is Fusion AI's first pilot for testing John, Atlas, APEX
> and TITAN end to end. It is one tenant among many, never the platform default.

Ryan (2026-10-13): posts **fully automatic**, ad changes **automatic within his caps**, video/image generation
**automatic within a monthly credit budget**. Same rules as [[Brands/FusionTech_AI/autopilot]].

**Waiting for Ryan (one time):**
1. Confirm the facts in [[Brands/brow-revolution/Brand_Brain]] → they are copied into `approved` below. Until then
   **nothing is posted** (the engine refuses posts with no approved facts).
2. `max_daily_spend` (SGD) → until set, **no ad is changed**.
3. `monthly.kling` / `monthly.higgsfield` credits → until set, **nothing is generated**.

## v5 update (Ryan's Marketing OS master prompt, 2026-10-14 — newest wins)
This note now holds **permissions** per action category, not "automatic" switches. Levels: `OFF` • `READ_ONLY` •
`APPROVAL_REQUIRED` (default) • `LIMITED_AUTOMATION`. Posts, budget increases, launches, generation and audience or
destination changes **always need Ryan's approval** (reply `APPROVE <code>`). Only `ads_pause` (it reduces spend) may be
`LIMITED_AUTOMATION`, and only once every number in `auto_pause_policy` is filled in and Ryan has OK'd it: minimum age in
days, minimum spend, data freshness (hours), conversion delay (hours), cool-down (hours) and the most campaigns paused
per day. Until then everything waits for approval. This replaces the 2026-10-13 "fully automatic" choice.

```json
{
  "brand": "BROWREVOLUTION",
  "metricool_brand_id": 7332947,
  "mode": "live",
  "currency": "SGD",
  "permissions": { "posts": "APPROVAL_REQUIRED", "ads_pause": "APPROVAL_REQUIRED", "ads_budget": "APPROVAL_REQUIRED", "launch": "APPROVAL_REQUIRED", "generation": "APPROVAL_REQUIRED", "audience_destination": "APPROVAL_REQUIRED" },
  "auto_pause_policy": { "min_age_days": null, "min_spend": null, "freshness_hours": null, "conversion_delay_hours": null, "cooldown_hours": null, "max_campaigns_per_day": null, "require_quality_check": true },
  "posts": { "max_per_day": 1, "networks": ["facebook", "instagram", "tiktok"] },
  "ads": { "platform": "meta", "ad_account_id": null, "max_daily_spend": null, "max_raise_pct": 20, "min_confidence": "HIGH", "raise_cooldown_days": 3, "keep_one_active": true },
  "credits": { "monthly": { "kling": null, "higgsfield": null } },
  "approved": { "claims": [], "prices": [] },
  "report": { "email": "ryandhana1515@gmail.com" }
}
```

Beauty-treatment rules always apply: no guaranteed results, no before/after, no "Singapore's leading" without proof,
no AI-made people, no invented reviews.
