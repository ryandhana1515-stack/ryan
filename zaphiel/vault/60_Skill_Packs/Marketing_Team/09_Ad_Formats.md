---
tags: [zaphiel, skill-pack, marketing]
status: active (recheck platform menus before each campaign)
version: v5 (2026-10-14)
verified: 2026-10-14, from web search results. Opening the platforms' own pages was blocked in this session (DNS), so every line says how sure we are.
---
# Ad Formats & Objectives Library

Serves Ryan's **Marketing OS v5** (2026-10-14). Use it to pick the **objective**, the **lead destination** and the
**format** for a campaign. Budgets and structure rules are in [[10_Budget_Structure_Rules]]. Platform tips are in
[[04_Platform_Playbooks]]. Which of these our tools can actually create or change by API: **provider support: see
[[11_Capability_Register]]** (never assume a menu item in Ads Manager exists in the API).

**How sure we are (column "Check"):**
- ✅ **verified**: the platform's own help or developer page, seen through search on the date shown.
- ⚠️ **third-party**: several marketing guides agree, but we did not see the platform's own page. Recheck before relying on it.
- ❓ **recheck**: not confirmed this session. Look it up in the account before using it.

Menus change by account, region and rollout. **The ad account's own menu wins** over this note.

## 1. Meta (Facebook + Instagram)

### Structure
**Campaign** (objective, optional campaign budget) → **Ad set** (audience, placements, schedule, budget if no campaign
budget, conversion location) → **Ads** (creative, copy, CTA, link).

| Item | What it means | Check | Source (date) | Provider support |
|---|---|---|---|---|
| Six objectives: **Awareness, Traffic, Engagement, Leads, App promotion, Sales** | Introduced as the "ODAX" set (2022–23), replacing the older 11 | ⚠️ | influee.co/blog/meta-campaign-objectives · madgicx.com/blog/facebook-campaign-objectives (2026-10-14) | see [[11_Capability_Register]] |
| The objective is fixed once the campaign is created | Pick it carefully; to change it, make a new campaign | ⚠️ | influee.co/blog/meta-campaign-objectives (2026-10-14) | — |
| **Advantage campaign budget** (formerly CBO) | One budget at campaign level; Meta spreads it across ad sets. It can starve small audiences such as retargeting | ⚠️ | jonloomer.com · lebesgue.io (2026-10-14) | see [[11_Capability_Register]] |
| **Ad set budget** | Each ad set has its own budget. Gives control, but splits small budgets | ⚠️ | same | see [[11_Capability_Register]] |
| **Advantage+ placements** (formerly automatic placements) | Meta picks where to show the ad across Facebook, Instagram, Messenger and Audience Network | ⚠️ | strikesocial.com/blog/should-you-use-meta-advantage-placements-for-your-campaigns (2026-10-14) | see [[11_Capability_Register]] |
| **Advantage+ audience** | Meta's AI finds people, using our audience inputs as a suggestion | ⚠️ | facebook.com/business/ads/meta-advantage-plus (listed by third parties, 2026-10-14) | see [[11_Capability_Register]] |
| Special ad categories (housing, employment, financial products and services; social issues/elections/politics is a separate label) | Removes some targeting (for example age, gender, postcode, lookalikes in the first three) | ✅ (category names) / ⚠️ (exact limits) | developers.facebook.com/documentation/ads-commerce/marketing-api/audiences/special-ad-category (page updated 2026-05-21; seen 2026-10-14) | — |

### Lead destinations (Leads objective, "conversion location")
| Destination | Good for | Watch out | Check | Provider support |
|---|---|---|---|---|
| **Instant Form** (form inside Facebook/Instagram) | Fast and cheap leads | Lower intent. Add qualifying questions, or use the higher-intent form type, so sales does not drown in junk | ⚠️ (jonloomer.com/qvt/website-and-instant-forms-conversion-location, 2026-10-14) | see [[11_Capability_Register]] |
| **Click-to-WhatsApp / Messenger / Instagram Direct** | Singapore service businesses (salons, clinics, tuition). Chat is how SG customers book | Needs fast replies: John (seconds) or staff (minutes). The WhatsApp number must be linked to the Facebook Page. Can run under Engagement, Traffic or Leads depending on the account | ⚠️ (wati.io · support.chatarchitect.com, 2026-10-14) | see [[11_Capability_Register]] |
| **Website / landing page + Pixel + Conversions API** | Higher intent; full control of the message | Needs a working page (**TITAN builds it**, via `CAMPAIGN_PAGE_REQUEST`) and tested Pixel + CAPI events | ⚠️ | see [[11_Capability_Register]] |
| **Calls** | People who prefer to phone | Someone must answer during the ad's hours | ⚠️ (oneppcagency.co.uk, 2026-10-14) | see [[11_Capability_Register]] |
| Combined options ("Website and Instant Forms", "Website and Calls", "Multiple") | Meta tests several locations | Appear only in some accounts; default can differ | ⚠️ (jonloomer.com/qvt/multiple-conversion-location, 2026-10-14) | see [[11_Capability_Register]] |

### Formats
| Format | Ratio / notes | Check | Provider support |
|---|---|---|---|
| Single image | Feed 4:5 or 1:1 | ❓ recheck current specs | see [[11_Capability_Register]] |
| Single video | Feed 4:5 or 1:1; Reels and Stories 9:16 | ❓ | see [[11_Capability_Register]] |
| Carousel | Several cards, each with its own image/video and link | ⚠️ | see [[11_Capability_Register]] |
| Collection / Instant Experience | Hero image or video with products below; tap opens a full-screen Instant Experience (older name: "Canvas") | ✅ developers.facebook.com/docs/marketing-api/creative/collection-ads (2026-10-14) | see [[11_Capability_Register]] |
| Reels & Stories | 9:16, full screen; keep text and CTA inside the safe zone | ❓ recheck safe-zone template | see [[11_Capability_Register]] |
| Catalog / dynamic: **Advantage+ catalog ads** (formerly Dynamic Product Ads) | Products from a catalog, shown to the people most likely to want them; under the Sales objective | ⚠️ accelerateddigitalmedia.com/insights/what-are-meta-advantage-catalog-ads (2026-10-14) | see [[11_Capability_Register]] |
| Partnership ads (creator/brand together) | Run through a creator's handle with their permission | ❓ not confirmed this session | see [[11_Capability_Register]] |
| Boosted posts | Promote an existing Page/Instagram post. Fewer options than Ads Manager | ❓ | see [[11_Capability_Register]] |

## 2. TikTok

### Structure
**Campaign** (objective, optional campaign budget) → **Ad group** (audience, placement, budget, schedule, optimisation
location) → **Ad** (video/photos, text, CTA, destination).

| Item | What it means | Check | Source (date) | Provider support |
|---|---|---|---|---|
| Objectives in three groups: **Awareness** (Reach), **Consideration** (Traffic, Video views, Community interaction), **Conversion** | Community interaction optimises for follows or profile visits | ✅ | ads.tiktok.com/help/article/choose-right-objective (2026-10-14) | see [[11_Capability_Register]] |
| **Lead generation** objective, with an **Instant Form** as the optimisation location; needs a privacy-policy URL | Form created at ad level | ✅ | ads.tiktok.com/help/article/set-up-lead-generation-with-instant-form · ads.tiktok.com/help/article/build-instant-form (2026-10-14) | see [[11_Capability_Register]] |
| Messaging lead ads (TikTok DM / WhatsApp / Messenger) | "Where available" | ⚠️ third-party only (kommo.com) | recheck in the account | see [[11_Capability_Register]] |
| **Sales** objective: Website Conversions + Product Sales merged; sales on TikTok Shop, website and/or app; **phased rollout, not all accounts** | Older accounts may still show Web conversions / Product sales / Catalog sales separately | ✅ | ads.tiktok.com/help/article/sales-advertising-objective-tiktok (updated March 2026; seen 2026-10-14) | see [[11_Capability_Register]] |
| TikTok Shop ads: **GMV Max** is the default and only supported campaign type since July 2025 | For e-commerce brands with a TikTok Shop | ✅ | same page | see [[11_Capability_Register]] |
| App promotion objective | For app installs | ❓ | — | see [[11_Capability_Register]] |

### Formats
| Format | Notes | Check | Provider support |
|---|---|---|---|
| In-Feed video | 9:16, native creator style | ⚠️ | see [[11_Capability_Register]] |
| **Spark Ads** | Boost an organic post (ours or a creator's). A creator's post needs their **authorisation code**, one code per video, for a set period; the ad stops when the code expires or is cancelled. Errors such as `auth_code_expired` mean ask the creator to extend | ✅ (error codes: ads.tiktok.com/help/article/about-spark-ads-code-error-notifications-in-tiktok-ads-manager) / ⚠️ (code durations 7–365 days: relevantaudience.com, 2026-10-14) | see [[11_Capability_Register]] |
| Carousel / photo ads | Several images with music | ❓ recheck | see [[11_Capability_Register]] |
| TopView | First ad when the app opens; reservation buy, big budgets | ⚠️ | see [[11_Capability_Register]] |
| Catalog / shopping (Catalog sales, Dynamic Showcase Ads) | Product ads from a catalog | ✅ (named in TikTok glossary) | see [[11_Capability_Register]] |

## 3. YouTube / Google (next phase)

| Item | What it means | Check | Source (date) | Provider support |
|---|---|---|---|---|
| **Skippable in-stream** | Viewer can skip after 5 seconds. Put the hook and brand before the skip | ⚠️ (5 s: pixability.com) | support.google.com/google-ads/answer/2375464 (2026-10-14) | see [[11_Capability_Register]] |
| **Non-skippable in-stream** | Now up to **60 seconds** (older page said 30); paid by impressions (target CPM) | ✅ (as quoted from the Google help page in search) | same | see [[11_Capability_Register]] |
| **Bumper** | 6 seconds, non-skippable | ✅ | same | see [[11_Capability_Register]] |
| **In-feed video** | Thumbnail in search results, beside related videos, on the home feed | ✅ | same | see [[11_Capability_Register]] |
| **Shorts** ads | 9:16, between Shorts | ✅ | same | see [[11_Capability_Register]] |
| Campaign types: **Search, Performance Max, Shopping, Display, Demand Gen, Video, App** | Demand Gen = image, video and carousel on YouTube (incl. Shorts), Discover, Gmail, Display. Video Action campaigns have been moved into Demand Gen; Display is migrating into Demand Gen during 2026 | ⚠️ (adwisely.com · relevantaudience.com · seoteric.com, 2026-10-14) | recheck in Google Ads | see [[11_Capability_Register]] |

## 4. When to use what (starting points, not laws)

| Business / goal | Start with | Why | Then |
|---|---|---|---|
| **Local service + chat culture** (salons, brow studios, clinics, tuition) | Meta **click-to-WhatsApp**, or a Leads **Instant Form with qualifying questions** | SG customers book by chat; low friction | Only if replies are fast (John or staff). Measure chats started → first reply → booked, in the CRM |
| **Considered purchase** (B2B, renovation, property, FusionTech's own offer) | **Landing page + form**, Pixel + CAPI; **retarget** visitors and video viewers | People need proof and time | TITAN builds the page ([[60_Skill_Packs/TITAN/00_Index]]). Retarget with proof and objection-busting angles |
| **E-commerce** | **Sales** objective + **catalog** (Advantage+ catalog / TikTok Sales or GMV Max) + **UGC-style** video | The platform matches products to buyers | Real UGC only, with consent. AI people are disclosed and never shown as real customers |
| **New brand, no audience yet** | **Video views or Reach** | Cheap attention builds a warm audience | **Retarget the engagers** (people who watched or interacted) with a Leads or Sales campaign |

Always: one objective per campaign, the destination matches the CTA, and the lead path is tested on a phone before launch.
Every launch needs Ryan's approval code ([[08_Approval_Rules]], [[12_Voice_Commands]]).

## Sources seen 2026-10-14 (search results; recheck the live page before quoting a rule)
- ads.tiktok.com/help/article/choose-right-objective
- ads.tiktok.com/help/article/set-up-lead-generation-with-instant-form · ads.tiktok.com/help/article/build-instant-form
- ads.tiktok.com/help/article/sales-advertising-objective-tiktok
- ads.tiktok.com/help/article/about-spark-ads-code-error-notifications-in-tiktok-ads-manager
- ads.tiktok.com/help/article/tiktok-ads-manager-glossary-terms
- developers.facebook.com/docs/marketing-api/creative/collection-ads
- developers.facebook.com/documentation/ads-commerce/marketing-api/audiences/special-ad-category
- support.google.com/google-ads/answer/2375464 (About video ad formats)
- Third-party: influee.co, madgicx.com, jonloomer.com, strikesocial.com, accelerateddigitalmedia.com, wati.io,
  support.chatarchitect.com, relevantaudience.com, pixability.com, adwisely.com, seoteric.com, kommo.com
