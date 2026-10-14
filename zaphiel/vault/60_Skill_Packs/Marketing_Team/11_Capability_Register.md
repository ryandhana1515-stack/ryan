---
tags: [zaphiel, skill-pack, marketing, capabilities, ads, register]
status: active (recheck before use)
version: v5 (2026-10-14)
checked: 2026-10-14
---
# Capability Register: who can do what on an ad account

This note answers one question per row: **"Can provider X do action Y today, through what exact door, and have we seen it work?"**
The Marketing Team, the Execution layer and any UI must read this before offering an action. If a row is not
TESTED, the UI must not present it as working.

**How this was checked (2026-10-14).** Opening web pages directly was blocked in this session (no DNS for WebFetch,
curl denied, Firecrawl out of credits). Every web fact below comes from **web-search results limited to the vendor's own
domain**. Each fact names the page. Where we say "search snippet", the page itself was not opened: recheck it before
relying on a price or a rule. Tool names for connected MCPs come from the tool schemas loaded in Ryan's Claude Code
session (Supermetrics, Metricool, Higgsfield, Kling, Canva, ElevenLabs). Nothing was signed up for, bought, connected
or generated. No write tool was called.

## Status labels
| Label | Meaning |
|---|---|
| **DOCUMENTED-UNVERIFIED** | The vendor's page or docs say it exists. We have not connected or run it. |
| **CONNECTED** | The tool is connected in Ryan's session and its schema names the action. Not run yet on a real ad account. |
| **TESTED** | We ran it and saw the result (read-back). Only these rows may be shown as "works". |
| **UNAVAILABLE** | The provider does not offer it, or not to a business our size / plan. |
| **BLOCKED** | It exists, but something stops us (missing token, 403, no ad account linked, app review). |

## Interface classes
| Class | Meaning |
|---|---|
| **MCP** | Only through the vendor's MCP server (an AI chat client). Not callable from n8n code without an MCP client. |
| **REST** | A documented HTTP API our code (n8n) can call with a key/token. |
| **BOTH** | MCP and REST both cover it. |
| **NEEDS NATIVE API** | Only the ad platform's own API does it (Meta / TikTok / Google), which needs our own app approval. |
| **UNSUPPORTED** | No door found at all. |
| **NOT YET VERIFIED** | We could not find out. Ask the vendor in writing. |

## The rule: ONE optimiser per ad account
Only **one** system may make automatic changes (pause, budget, launch) on a given ad account at a time: our own
autopilot (n8n "Marketing — Ad Actions"), **or** Omneky, **or** a Supermetrics-driven agent, **or** Madgicx's AI, **or**
Smartly. Everything else on that account is **read-only**. Two optimisers on one account fight each other (one pauses,
the other scales) and nobody can explain the spend. The brand's autopilot note (`Brands/<brand>/autopilot.md`) must
name the single optimiser per ad account before any write is switched on.

## Our own pieces (honest status, 2026-10-14)
| Piece | What it really is | Status |
|---|---|---|
| n8n **Marketing — Ad Actions** `oMMIvt8PZOmUp24K` | Meta only. Two actions: `pause_ad` (POST `{id}` status=PAUSED) and `set_daily_budget` (POST `{budget_id}` daily_budget). Guard re-check + read-back + ledger. Plus a read-only `state` mode. | CODED, pinned-data tested (tests §41). Needs Ryan's **Meta System User token** in n8n. → **DOCUMENTED-UNVERIFIED for live** |
| Metricool MCP (`social_media_automate`) | Read analytics, scheduled posts; create/update scheduled posts; best time to post | **CONNECTED** (read PRODUCTION-verified on brand FusionTech.AI 2026-10-12). No ad accounts linked. Ad campaign management: none |
| Supermetrics MCP ("Supermetrics Marketing Analytics", tool v1.18.3) | Read data; read campaigns/resources; `manage_campaign` writes | **CONNECTED**. **No ad account authenticated yet** → every ad row below is not runnable until one is linked |
| Omneky MCP (`https://mcp.omneky.com/mcp`, OAuth) | Creative generation + campaign launch/pause/scale | **Not connected** → DOCUMENTED-UNVERIFIED |
| Higgsfield MCP, Kling MCP | Image/video generation (credits) | **CONNECTED** (credits: cost card + Ryan's yes) |
| Canva MCP | Designs, image generation, export | **CONNECTED** |
| ElevenLabs MCP | Speech, image, video generation | Connected, but **a read returned 403 earlier** (reported in session, not re-run today) → **BLOCKED / UNVERIFIED** |

## Register

Column key: **Lvl** = campaign / ad set (ad group) / ad. **Plan** = the plan or entitlement the vendor says is needed.
Sources are all checked 2026-10-14 unless another date is given.

### 1. Read metrics
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint (verified only) | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Read metrics | Supermetrics | 174 sources incl. Google Ads, Meta, TikTok, LinkedIn, Microsoft, Snapchat | all | MCP (also a separate Data API) | `data_query` → `get_async_query_results` | MCP is "included in all Supermetrics plans that include Data API access"; 14-day trial, no card | none (read) | CONNECTED (no ad account linked) | supermetrics.com/products/supermetrics-mcp; tool schema in session | none |
| Read metrics | Metricool | Meta Ads, Google Ads, TikTok Ads + organic | campaign | BOTH (MCP all plans; REST on Advanced/Custom only) | MCP `getAnalyticsDataByMetrics`, `getAnalyticsAvailableMetrics`; REST `/v2/advertising/campaigns`, `/datastudio/fbads/ads` etc. | MCP: any plan; REST: Advanced from US$53/mo annual | none | CONNECTED (organic read OK; no ad accounts) | help.metricool.com/mcp-vs-api-access-what-is-the-difference-5y3ib; [[Knowledge/Ad platform APIs — what each can do (2026-10-03)]] | brand 6656122 organic read, 2026-10-12 |
| Read metrics | Omneky | Meta, Google, TikTok, LinkedIn, Reddit, OpenAI Ads (launched via Omneky) | campaign/ad | MCP | `get_campaign_insights`, `analyze_performance`, `compare_channels` | NOT YET VERIFIED (no page ties MCP to a plan) | free per MCP page ("analysis and launching are free") | DOCUMENTED-UNVERIFIED | omneky.com/mcp (search snippet) | none |
| Read metrics | Fusion Ad Actions (n8n) | Meta | campaign + ad set (status, budgets only) | REST (n8n → Meta Graph) | `mode: 'state'` | Meta System User token | none | DOCUMENTED-UNVERIFIED (live) | ceo-brain/workflows/marketing-ad-actions/README.md | pinned-data tests §41 only |
| Read metrics | Meta Marketing API | Meta | all | NEEDS NATIVE API | GET `/{object}/insights` (`ads_read`) | free; own accounts in dev tier; clients need Full Access + Business Verification | none | DOCUMENTED-UNVERIFIED | developers.facebook.com/docs/marketing-api/insights/ (2026-10-03/12 notes) | none |
| Read metrics | TikTok API for Business | TikTok | all | NEEDS NATIVE API | `/report/integrated/get/` | free; developer + app approval | none | DOCUMENTED-UNVERIFIED | business-api.tiktok.com/portal/docs (2026-10-03) | none |
| Read metrics | Google Ads API | Google | all | NEEDS NATIVE API | GAQL `search` / `searchStream` | free; Explorer level enough for a few accounts | none | DOCUMENTED-UNVERIFIED | developers.google.com/google-ads/api/docs/api-policy/access-levels | none |
| Read metrics | Madgicx | Meta first; Google, TikTok reporting | all | MCP (Claude connector) | names not published | "from US$45/mo" vs "US$99/mo" (pages disagree) | none | DOCUMENTED-UNVERIFIED | academy.madgicx.com/lessons/what-is-madgicx; madgicx.com/blog/ads-mcp (search snippets) | none |
| Read metrics | Smartly | Meta, Google, TikTok, Pinterest, Snap, YouTube, Reddit… | all | NOT YET VERIFIED (no public API/MCP found) | — | enterprise, Order Form | — | UNAVAILABLE (for us) | docs.smartly.io/docs/introduction-to-smartly | none |

### 2. List campaigns
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| List campaigns | Supermetrics | AW, FA, TIK, LIA, AC (Microsoft), CGPTA (ChatGPT), SCM (Snapchat) | campaign → ad set → ad | MCP | `campaign_and_resource_get` (resource_type `campaigns`, `campaign_detail_level`) | API-enabled plan | none | CONNECTED (no ad account) | tool schema in session | none |
| List campaigns | Metricool | Meta, Google, TikTok | campaign | REST | GET `/v2/advertising/campaigns` (whether it lists all campaigns or only Metricool-made ones: NOT CONFIRMED) | Advanced plan | none | DOCUMENTED-UNVERIFIED (MCP route not confirmed) | 2026-10-03 note (swagger.json) | none |
| List campaigns | Omneky | as above | campaign | MCP | NOT YET VERIFIED (`list_creatives` lists creatives; no campaign-list tool named) | NOT YET VERIFIED | none | NOT YET VERIFIED | omneky.com/mcp (search snippet) | none |
| List campaigns | Fusion Ad Actions | Meta | campaign + ad set | REST | `mode: 'state'` | Meta token | none | DOCUMENTED-UNVERIFIED | README | pinned only |
| List campaigns | Meta / TikTok / Google native | each | all | NEEDS NATIVE API | Meta GET `/act_{id}/campaigns`; TikTok GET `/campaign/get/`; Google GAQL | free + approvals | none | DOCUMENTED-UNVERIFIED | 2026-10-03 note | none |

### 3. Create campaign draft (nothing spends)
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Create draft | Supermetrics | AW, FA, TIK, LIA, AC, CGPTA, SCM | campaign + ad sets + ads in one call | MCP | `manage_campaign` without `campaign_id` (`budget_amount` required). Schema: "On create: always forced to PAUSED" | early access, "free with an existing subscription" (needs Claude/Gemini as AI-chat destination + write access per ad account in Hub) | Paused by design. Hub approval modes: none / before going live / budget + going live / any change to a live campaign | CONNECTED (no ad account) | docs.supermetrics.com/docs/how-to-manage-ad-campaigns-with-ai-tools; …-in-supermetrics-studio; tool schema | none |
| Create draft | Omneky | Meta, Google, TikTok, LinkedIn, Reddit, OpenAI Ads (Pinterest, X: "not available yet") | campaign | MCP | `launch_campaign` (draft-only mode NOT YET VERIFIED: page says "nothing goes live until you say go") | NOT YET VERIFIED | spending waits for "explicit confirmation in the conversation"; checks minimum budgets and estimated reach first | DOCUMENTED-UNVERIFIED | omneky.com/mcp; omneky.com/integrations/claude; omneky.com/ad-launcher (search snippets) | none |
| Create draft | Omneky REST | — | — | UNSUPPORTED | REST docs list only creative jobs | — | — | UNAVAILABLE | omneky.com/api-docs (search snippet) | — |
| Create draft | Metricool | Meta/Google in web UI only (emailed 2FA code) | — | UNSUPPORTED (no API/MCP) | — | — | — | UNAVAILABLE | help.metricool.com/mcp-vs-api…; metricool.com/ad-campaigns-metricool/ | — |
| Create draft | Fusion Ad Actions | — | — | UNSUPPORTED (by design: never creates campaigns) | — | — | — | UNAVAILABLE | README | — |
| Create draft | Meta / TikTok / Google native | each | all | NEEDS NATIVE API | Meta POST `/act_{id}/campaigns` (status PAUSED); TikTok POST `/campaign/create/`; Google mutate | free + approvals | our own guard | DOCUMENTED-UNVERIFIED | 2026-10-03 note | none |

### 4. Launch (enable / go live: SPENDS MONEY)
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Launch | Supermetrics | AW, FA, TIK, LIA, AC, CGPTA, SCM | each level separately | MCP | `manage_campaign` update `status: ENABLED` on campaign, ad set, ad (schema: "Only set ENABLED on explicit user approval; it can start spend immediately… enable each level, as separate approved steps") | as above | Hub approval mode + Ryan's yes | CONNECTED (no ad account) | tool schema | none |
| Launch | Omneky | Meta, Google, TikTok, LinkedIn, Reddit, OpenAI Ads | campaign | MCP | `launch_campaign` | NOT YET VERIFIED | explicit chat confirmation. Two billing paths: **your own ad account** (spend billed by the platform, connecting free) or **Omneky's ad account** (Meta, Google, OpenAI Ads: "pay the ad budget plus Omneky's fee, up front") | DOCUMENTED-UNVERIFIED | omneky.com/mcp; omneky.com/ad-launcher (search snippets) | none |
| Launch | Metricool | — | — | UNSUPPORTED (REST GET `/stats/facebook/boost/{postId}` creates a paid boost: **never call**) | — | — | — | UNAVAILABLE | 2026-10-03 note | — |
| Launch | Fusion Ad Actions | — | — | UNSUPPORTED (never enables) | — | — | — | UNAVAILABLE | README | — |
| Launch | Native APIs | each | all | NEEDS NATIVE API | Meta POST `/{id}` status=ACTIVE; TikTok `/campaign/status/update/` ENABLE; Google mutate status ENABLED | approvals | — | DOCUMENTED-UNVERIFIED | 2026-10-03 note | none |

### 5. Pause
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Pause | Fusion Ad Actions | Meta | campaign / ad set / ad | REST (n8n → Meta) | `type: 'pause_ad'` → POST `{id}` status=PAUSED | Meta System User token | autopilot guard (HIGH confidence, never last active campaign) | DOCUMENTED-UNVERIFIED (live) | README | pinned §41 |
| Pause | Supermetrics | AW, FA, TIK, LIA, AC, CGPTA, SCM | all | MCP | `manage_campaign` update `status: PAUSED` | as above | Hub approval mode | CONNECTED (no ad account) | tool schema; supermetrics.com/blog/what-ai-agents-can-change-ad-accounts | none |
| Pause | Omneky | channels launched via Omneky | campaign | MCP | `pause_or_scale` | NOT YET VERIFIED | pausing does not spend; confirmation rule for pause NOT YET VERIFIED | DOCUMENTED-UNVERIFIED | omneky.com/mcp; omneky.com/ad-launcher | none |
| Pause | Madgicx | Meta | ad | MCP | names not published ("pause ads, adjust budgets" per Academy) | plan unclear | configurable approval workflow (vendor claim) | DOCUMENTED-UNVERIFIED | academy.madgicx.com (search snippet) | none |
| Pause | Metricool | — | — | UNSUPPORTED | — | — | — | UNAVAILABLE | help.metricool.com | — |
| Pause | Native APIs | each | all | NEEDS NATIVE API | Meta POST status=PAUSED; TikTok `/campaign/status/update/` DISABLE; Google mutate PAUSED | approvals | — | DOCUMENTED-UNVERIFIED | 2026-10-03 note | none |

### 6. Resume (re-enable: SPENDS MONEY)
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Resume | Supermetrics | as above | all | MCP | `manage_campaign` `status: ENABLED` | as above | explicit approval | CONNECTED (no ad account) | tool schema | none |
| Resume | Omneky | as above | campaign | MCP | `pause_or_scale` (resume wording NOT YET VERIFIED; Ad Launcher page: "pause or activate") | NOT YET VERIFIED | confirmation (spend) | DOCUMENTED-UNVERIFIED | omneky.com/ad-launcher | none |
| Resume | Fusion Ad Actions | — | — | UNSUPPORTED (by design) | — | — | — | UNAVAILABLE | README | — |
| Resume | Native APIs | each | all | NEEDS NATIVE API | status ACTIVE / ENABLE / ENABLED | approvals | — | DOCUMENTED-UNVERIFIED | 2026-10-03 note | none |

### 7. Change budget
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Change budget | Fusion Ad Actions | Meta | campaign (CBO) or ad set | REST | `type: 'set_daily_budget'` | Meta token | guard: max +20%/day, 3-day cool-down, never past `max_daily_spend` | DOCUMENTED-UNVERIFIED (live) | README; [[08_Approval_Rules]] | pinned §41 |
| Change budget | Supermetrics | as above (SCM min 20/day in account currency) | campaign or ad set | MCP | `manage_campaign` `budget_amount` / `budget_type` | as above | Hub mode "approval for budget changes" exists | CONNECTED (no ad account) | tool schema; mcp.supermetrics.com/changelog | none |
| Change budget | Omneky | per channel rules | campaign | MCP | `pause_or_scale` ("budget changes depend on what each channel allows") | NOT YET VERIFIED | confirmation (scaling spends) | DOCUMENTED-UNVERIFIED | omneky.com/mcp; omneky.com/ad-launcher | none |
| Change budget | Madgicx | Meta | ad set | MCP | not published | unclear | vendor claim | DOCUMENTED-UNVERIFIED | academy.madgicx.com | none |
| Change budget | Native APIs | each | campaign / ad set | NEEDS NATIVE API | Meta `daily_budget`; TikTok `/campaign/update/` (≥105% of spend); Google mutate | approvals | — | DOCUMENTED-UNVERIFIED | 2026-10-03 note | none |

### 8. Change targeting
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Change targeting | Supermetrics | AW, FA keep omitted fields; others replace the full set | campaign / ad set | MCP | `manage_campaign` `targeting`, `ad_groups[].targeting`; lookup via `campaign_and_resource_get` `targeting_search` | as above | Hub mode "any change to a live campaign" | CONNECTED (no ad account) | tool schema | none |
| Change targeting | Omneky | — | — | NOT YET VERIFIED | no tool named | — | — | NOT YET VERIFIED | omneky.com/mcp | — |
| Change targeting | Fusion Ad Actions / Metricool | — | — | UNSUPPORTED | — | — | — | UNAVAILABLE | README; help.metricool.com | — |
| Change targeting | Native APIs | each | ad set | NEEDS NATIVE API | Meta ad set `targeting`; TikTok `/adgroup/update/`; Google criteria mutate | approvals | — | DOCUMENTED-UNVERIFIED | 2026-10-03 note | none |

### 9. Create ad / creative (inside an ad account)
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Create ad | Supermetrics | AW, FA (page_id), TIK (video needs asset_id), LIA (single image), CGPTA, SCM | ad | MCP | `manage_campaign` `ad_groups[].ads[]`; media via `creative_picker` (upload_ref) or `asset_url` | as above | new ads: set PAUSED explicitly ("if omitted the platform's own default applies, which on some platforms is live") | CONNECTED (no ad account) | tool schema | none |
| Create ad | Omneky | as above | ad | MCP | `generate_*_ad` + `launch_campaign`; `list_creatives`, `get_brand_kit`, `create_source_from_url` | NOT YET VERIFIED | confirmation before launch | DOCUMENTED-UNVERIFIED | omneky.com/mcp | none |
| Create ad | Native APIs | each | ad | NEEDS NATIVE API | Meta `/adimages`, `/advideos`, `/adcreatives`, `/ads`; TikTok `/file/video/ad/upload/`, `/ad/create/` | approvals | — | DOCUMENTED-UNVERIFIED | 2026-10-03 note | none |
| Create ad | Metricool / Fusion Ad Actions | — | — | UNSUPPORTED | — | — | — | UNAVAILABLE | — | — |

### 10. Generate image (costs credits)
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Generate image | Higgsfield | — | — | MCP (+ separate paid API) | `generate_image`, `ads_studio_generate` | Higgsfield credits | cost card + Ryan's yes | CONNECTED | session schema; [[01_Tool_Library]] | none |
| Generate image | Kling | — | — | MCP | `text_to_image`, `image_to_image` | Kling credits | cost card + yes | CONNECTED | session schema | none |
| Generate image | Canva | — | — | MCP | `generate-image` | Canva plan | Ryan's yes if it uses AI credits | CONNECTED | session schema | none |
| Generate image | ElevenLabs | — | — | MCP | `creative_generate_image` | ElevenLabs credits | cost card + yes | BLOCKED / UNVERIFIED (earlier 403) | session schema | 403 on a read (reported) |
| Generate image | Omneky | — | — | BOTH | MCP `generate_image_ad`; REST POST `/create_image_ad_async` + GET `/jobs/{job_id}` (X-API-Key, 10 req/min) | credits (API docs: 5 credits at 1K; other pages say 15: conflict) | cost card + yes | DOCUMENTED-UNVERIFIED | omneky.com/api-docs; omneky.com/mcp (search snippets) | none |
| Generate image | Supermetrics | — | — | MCP | `manage_campaign` asset `asset_prompt` / `creative_picker` "generate" (cost NOT YET VERIFIED) | NOT YET VERIFIED | — | CONNECTED (cost unknown → do not use) | tool schema | none |

### 11. Generate video (costs credits)
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Generate video | Higgsfield | — | — | MCP | `generate_video`, `generate_video_batch` | credits | cost card + yes | CONNECTED | session schema | none |
| Generate video | Kling | — | — | MCP | `text_to_video`, `image_to_video`, `omni_ref_video`, `motion_control` | credits | cost card + yes | CONNECTED | session schema | none |
| Generate video | ElevenLabs | — | — | MCP | `creative_generate_video` | credits | cost card + yes | BLOCKED / UNVERIFIED | session schema | 403 (reported) |
| Generate video | Omneky | — | — | BOTH | MCP `generate_video_ad`; REST POST `/create_video_ad_async` (target_duration 10–15 s, 10 req/min) | credits (e.g. 10 credits for an 8-s product animation per API docs) | cost card + yes | DOCUMENTED-UNVERIFIED | omneky.com/api-docs | none |

### 12. Avatar video (consent rules apply)
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Avatar video | Omneky | — | — | MCP (REST: avatar-with-product priced in API docs; endpoint name NOT YET VERIFIED) | `generate_avatar_ad` | "commercials, avatars, and cloning" start on **Standard** (US$99/mo) | cost card + yes; AI person must be disclosed | DOCUMENTED-UNVERIFIED | omneky.com/pricing-plans; omneky.com/mcp | none |
| Avatar video | Higgsfield | — | — | MCP | `ai_influencer_prepare` → `ai_influencer_generate` (prepare gives a price first) | credits | cost card + yes | CONNECTED | session schema | none |
| Avatar video | HeyGen | — | — | REST | `POST /v3/videos` | PAYG from US$5 | recorded consent of the real person | not connected → DOCUMENTED-UNVERIFIED | [[01_Tool_Library]] | none |

### 13. Creative scoring
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Creative scoring | Omneky | — | — | MCP | `score_creative` (per-ad insights: 1 credit per image ad, 2 per video ad, per an April-2026 blog: conflicts with "analysis is free") | NOT YET VERIFIED | none if free; else cost card | DOCUMENTED-UNVERIFIED | omneky.com/mcp; omneky.com/blog/how-to-use-omneky-to-2x-sales (search snippets) | none |
| Creative scoring | Higgsfield | TikTok-style video | — | MCP | `virality_predictor` (credit cost NOT YET VERIFIED) | credits? | ask first | CONNECTED | session schema | none |
| Creative scoring | Supermetrics | — | — | UNSUPPORTED (only campaign `health_check`, not creative) | — | — | — | UNAVAILABLE | tool schema | — |

### 14. Competitor ad research
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Competitor research | Meta Ad Library (web) | Meta | ad | UI only for Singapore-only ads (API covers only EU/UK + political) | — | free | none | DOCUMENTED-UNVERIFIED | [[01_Tool_Library]] (2026-10-12) | none |
| Competitor research | Omneky "Ad Library" + Clone | Meta library | ad | **web app**; in MCP: NOT YET VERIFIED (not in the MCP tool list) | — | Clone Video ~5 credits/s (April-2026 blog) | cost card for cloning | DOCUMENTED-UNVERIFIED | omneky.com/blog/how-to-use-omneky-to-2x-sales; omneky.com/mcp (search snippets) | none |
| Competitor research | Supermetrics | "Facebook public data need no login" (organic pages, not the Ad Library) | — | NOT YET VERIFIED | `data_query` on public sources | — | — | NOT YET VERIFIED | `supermetrics_guide` card 3 (2026-10-14) | none |
| Competitor research | TikTok Creative Center / Google Transparency Center | TikTok / Google | ad | UI only | — | free | none | DOCUMENTED-UNVERIFIED | [[01_Tool_Library]] | none |

### 15. Audience / reach estimate
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Reach estimate | Supermetrics | listed for all; `forecast` is AW/FA only | ad set | MCP | `campaign_and_resource_get` resource_type `reach_estimate`, `forecast`, `keyword_volumes` (AW/AC) | API-enabled plan | none (read) | CONNECTED (no ad account) | tool schema | none |
| Reach estimate | Omneky | — | — | NOT YET VERIFIED (internal check before launch, no tool named) | — | — | — | NOT YET VERIFIED | omneky.com/integrations/claude | — |
| Reach estimate | Native APIs | each | ad set | NEEDS NATIVE API | endpoint names NOT YET VERIFIED in our notes | approvals | — | NOT YET VERIFIED | — | — |

### 16. Organic post scheduling
| Capability | Provider | Channels | Lvl | Interface | Tool / endpoint | Plan | Approval | Status | Source + date | Test evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Schedule posts | Metricool | connected social networks | post | BOTH | MCP `createScheduledPost`, `createScheduledPostForReview`, `updateScheduledPost`, `getScheduledPosts`, `getBestTimeToPostByNetwork` | any plan (Free: max 20 scheduled posts) | autopilot posts rules ([[08_Approval_Rules]]) | CONNECTED (scheduling not run yet) | help.metricool.com/mcp-vs-api…; session schema | none for scheduling |
| Publish to TikTok | Higgsfield | TikTok | post | MCP | `tiktok_connect`, `tiktok_prepare_publish`, `tiktok_publish_status` | Higgsfield account | Ryan's yes (public post) | CONNECTED (no TikTok linked; not run) | session schema | none |
| Schedule posts | Omneky / Supermetrics | — | — | UNSUPPORTED (not found) | — | — | — | UNAVAILABLE | omneky.com/mcp; tool schema | — |

## UI actions to disable until verified (TESTED status)
Grey these out in any dashboard, and the agents must not offer them as working:
1. **Any "Launch", "Enable" or "Resume" button**, through any provider (Supermetrics `status: ENABLED`, Omneky `launch_campaign` / `pause_or_scale` activate, native APIs). These spend money.
2. **Omneky "launch on Omneky's ad account"** (prepay ad budget + Omneky fee). Use only Ryan's own ad account.
3. **Budget increase / "scale"** anywhere except the Fusion Ad Actions path, and that one only after a live TESTED pause + budget run on Ryan's own Meta account.
4. **Targeting edits** and **new ads inside a live campaign** (Supermetrics, Omneky, native).
5. **Supermetrics Hub approval mode "No human approval"**: never pick it. Use "approval for any change to a live campaign".
6. **Metricool "boost" endpoints** (GET `/stats/facebook/boost/...`): never call.
7. **Generation buttons** (Omneky, Higgsfield, Kling, Canva AI, ElevenLabs, Supermetrics `asset_prompt`) unless a cost card is shown and the monthly credit cap allows it. ElevenLabs stays off until the 403 is fixed.
8. **Competitor-ad "API" research** for Singapore brands: there is no official API for Singapore-only commercial ads. Show the Ad Library web link instead.
9. **Any action on a client's ad account** until the client owner switches autopilot on in writing *and* the provider's terms allow agency use (Omneky: not yet, see [[13_Provider_Evaluation]]).
10. **A second optimiser on the same ad account** (see the ONE-optimiser rule above).
