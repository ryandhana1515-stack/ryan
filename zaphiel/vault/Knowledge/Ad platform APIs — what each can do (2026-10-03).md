---
tags: [zaphiel, knowledge, marketing, api]
checked: 2026-10-03
---
# Ad platform APIs: what each can do (checked 2026-10-03)

Ryan asked for this before buying anything. Sources:
- **Metricool:** its official OpenAPI file, `https://app.metricool.com/api/swagger.json` (OpenAPI 3.0.1, "Metricool API" v2.0.0, 553 paths). Every advertising path was parsed by script, so nothing is assumed.
- **Meta and TikTok:** their official developer documentation (links in each section).

## Metricool API
### READ (ad analytics)
| Endpoint | What it gives |
|---|---|
| GET `/datastudio/fbads/ads`, GET `/datastudio/tiktokads/ads` | Parameters: only `start` and `end`.<br>Returns a list of `DataStudioAd`: adAccount, provider, objective, campaign / ad group / ad ids and names, customEventType, currency, results, resultsLabel, conversions, actions{}, metrics{} (metric keys not documented), imageUrl, boostId.<br>**No date field**: for daily figures, ask one day at a time. |
| GET `/v2/advertising/campaigns`, `/v2/advertising/adgroups`, `/v2/advertising/ads` | Parameters: from, to, timezone, providers[], status[] (+ campaignId / adgroupId).<br>Campaign: status ACTIVE / PAUSED / REMOVED, dailyBudget, lifetimeBudget, currency, biddingStrategyType, objective, metrics{}.<br>Ad: titles, descriptions, mediaItems.<br>NOT CONFIRMED: whether these list every campaign or only those made inside Metricool. |
| GET `/v2/analytics/campaigns/facebookads`, `/tiktokads`, `/googleads` | Campaigns with metrics for a period. |
| GET `/v2/analytics/campaigns/{campaignId}/timelines` | A daily series of one metric for one campaign. |
| GET `/v2/analytics/campaigns/{campaignId}/aggregation` | One total for one campaign. |
| GET `/stats/tiktokads/campaigns`, GET `/stats/facebookads/campaigns`, GET `/stats/adwords/*` | The `facebookads` and `adwords` ones are deprecated. |
| GET `/v2/advertising/recommendations` | Google Ads recommendations. |

### WRITE (things that change ad accounts or spend money)
- **GET `/stats/facebook/boost/{postId}`.** Official summary: "Creates a paid campaign for a published Facebook post". It is a GET that spends money, so **the product must never call it**.
- **GET `/stats/facebook/boost/pending/{postId}`.** Adds a boost budget to a scheduled post.
- **PUT `/v2/advertising/recommendations`, PUT `/v2/advertising/recommendations/{id}`.** Applies Google Ads recommendations. Types include CAMPAIGN_BUDGET, MOVE_UNUSED_BUDGET, KEYWORD, TEXT_AD and bidding opt-ins.
- **Helpers that do not change accounts:** POST `/v2/advertising/ads/previews` and POST `/v2/advertising/suggestions/*`. They take a `CampaignCreationState` draft, but no endpoint to submit or create a campaign is published.

### Not in Metricool's API at all
Creating a campaign, uploading ad creative, pausing or resuming, changing a Meta or TikTok budget, duplicating a campaign.

### Correction to step 1b (recorded 2026-10-03)
The connector assumed field-id rows and a `fields` parameter. The official answer is `DataStudioAd` objects, with only `start` / `end` and no date.
Fix after Ryan's go:
- call one day at a time;
- map the documented fields;
- learn the metric keys from the first connection test;
- read campaign status and budgets from `/v2/advertising/campaigns` (better than the coverage matrix assumed).

## Meta Marketing API (Graph v26.0 is the latest per the changelog)
| Need | Endpoint |
|---|---|
| Read | GET `/{campaign\|adset\|ad\|act_id}/insights` with `level`, `time_increment=1` (daily), `fields`, `breakdowns`. Permission: ads_read. |
| Create | POST `/act_{id}/campaigns`, then `/act_{id}/adsets`, then `/act_{id}/ads` |
| Creative | POST `/act_{id}/adimages`, `/act_{id}/advideos` (chunked), `/act_{id}/adcreatives` |
| Pause / resume | POST `/{campaign_id}` (or ad set / ad) with `status` = PAUSED or ACTIVE |
| Budget | POST `/{campaign_id}` or `/{adset_id}` with daily_budget / lifetime_budget. Ad set budgets can change at most 4 times an hour. |
| Duplicate | POST `/{campaign_id}/copies` (deep_copy; status_option defaults to PAUSED) |

Access:
- An app with ads_read / ads_management. The default tier is Limited access (development only).
- Managing client accounts needs **Full access** through App Review. Keeping it needs at least 500 calls in 15 days and less than 15% errors.
- Business verification if the app touches sensitive data.
- A system user in FusionTech's Business Manager; each client assigns its ad account (`assigned_users`, tasks ANALYZE / ADVERTISE / MANAGE).
- Fee: none found (NOT CONFIRMED). Review time: not stated.
- Source: https://developers.facebook.com/docs/marketing-api/get-started/authorization

## TikTok API for Business (v1.3)
| Need | Endpoint |
|---|---|
| Read | `/report/integrated/get/` (data_level campaign / ad group / ad; `stat_time_day` up to 30 days); GET `/campaign/get/` for status and budget |
| Create | POST `/campaign/create/`, then `/adgroup/create/`, then POST `/ad/create/` |
| Creative | POST `/file/video/ad/upload/` (500 MB max); `/file/image/ad/upload/` (parameters NOT CONFIRMED) |
| Pause / resume | POST `/campaign/status/update/` (also ad group / ad), ENABLE / DISABLE |
| Budget | POST `/campaign/update/` and `/adgroup/update/` (at least 105% of current spend) |
| Duplicate | POST `/campaign/copy/task/create/`, then `/campaign/copy/task/check/` (copies start DISABLED) |

Access:
- Developer registration needs a **company email domain and a real company website**: about 3 business days.
- Then the app review: 2–3 business days.
- Each client approves once through OAuth; the token does not expire.
- A sandbox is available. Basic rate limit: 10 QPS.
- Fee: none found (NOT CONFIRMED).
- Source: https://business-api.tiktok.com/portal/docs/register-as-a-developer/v1.3
