---
tags: [zaphiel, skill-pack, marketing, providers, omneky, supermetrics, evaluation]
status: active (recheck before use)
version: v5 (2026-10-14)
checked: 2026-10-14
---
# Provider Evaluation: who should run our ads (Layer 1 pilot)

Ryan's preferred pilot is **Omneky**. This note checks Omneky against what is already connected (Supermetrics,
Metricool), two market alternatives (Madgicx, Smartly) and building on the native ad APIs ourselves.
The action-by-action detail sits in [[11_Capability_Register]].

**How this was checked (2026-10-14).** Opening pages directly was blocked in this session (WebFetch had no DNS, curl
was denied, Firecrawl had no credits). Every fact below comes from web-search results **limited to the vendor's own
domain**, so the page was not opened by us. "VERIFIED" here means *an official page says it, as quoted in search
results*. Recheck the live page before paying. Nothing was signed up for, bought, connected or generated.

---

## 1. Omneky verification checklist

| # | Question | What the public page says (source, checked 2026-10-14) | Status |
|---|---|---|---|
| 1 | MCP endpoint and login | Endpoint `https://mcp.omneky.com/mcp`. "Sign in with your Omneky account — there are no API keys to manage." OAuth in a browser window; "nothing secret is stored in Claude". Works in claude.ai, Desktop, mobile, Claude Code. (omneky.com/mcp; omneky.com/integrations/claude) | VERIFIED |
| 2 | Exact MCP tools | `analyze_performance`, `generate_image_ad`, `generate_video_ad`, `generate_avatar_ad`, `score_creative`, `launch_campaign`, `get_brand_kit`, `list_creatives`, `get_campaign_insights`, `create_source_from_url`, `pause_or_scale`, `compare_channels`. Parameters are not published. (omneky.com/mcp) | VERIFIED (names only) |
| 3 | Platforms | MCP page: launch to Meta, Google, LinkedIn, TikTok, Reddit (+ OpenAI Ads). Objectives: Awareness, Traffic, Leads, Sales & Conversions, Video Views, Performance Max & Demand Gen. Ad Launcher: Pinterest and X "can be connected… Launching and managing campaigns there is not available yet" (homepage and a blog disagree). (omneky.com/mcp; omneky.com/ad-launcher) | VERIFIED (Pinterest/X: conflicting, treat as no) |
| 4 | What spends money, how confirmation works | "Anything that spends money — launching or scaling a campaign — waits for your explicit confirmation in the conversation first." "Omneky checks minimum budgets and estimated reach first." (omneky.com/mcp FAQ; omneky.com/integrations/claude) | VERIFIED (whether pause also asks: UNVERIFIED) |
| 5 | Whose ad account is used | Your own account (spend billed by the platform; "Connecting an ad account is free") **or** Omneky's account for Meta, Google, OpenAI Ads: "Omneky runs the campaign. You pay the ad budget plus Omneky's fee, up front." Google: refunded if no ads launch. (omneky.com/ad-launcher) | VERIFIED (Omneky's fee amount: UNVERIFIED) |
| 6 | Credits for generation | "Each generation costs credits based on format and resolution." API docs: image 5 credits (1K), avatar video with product 20, 8-s product animation 10, video editing 2 credits/s. Other Omneky pages say 15 per image: **conflict**. April-2026 blog: credit costs cut 50–66%; Clone Video ~5 credits/s. "The app always shows the current cost first." (omneky.com/mcp; omneky.com/api-docs; omneky.com/blog/how-to-use-omneky-to-2x-sales) | VERIFIED that it costs credits; exact rates CONFLICTING |
| 7 | Are analysis and launch free? | MCP page: "analysis and launching are free". API docs: "Connect ad accounts… for direct-integrated launching — Free". But an April-2026 blog says per-ad AI performance insights cost 1 credit per image ad and 2 per video ad. | CONFLICTING → ASK OMNEKY IN WRITING |
| 8 | Plans and prices | Lite US$29/mo (US$24 yearly), 200 credits, 1 brand, 1 seat. Standard US$99 (US$79 yearly), 1,000 credits, 3 brands, 3 seats, adds "commercials, avatars, and cloning". Pro US$249 (US$199 yearly), 4,000 credits, 5 brands, 5 seats. Enterprise custom (custom limits, committed pricing, success manager, creative services, media buying). Top-ups: 10 credits per US$1, never expire, used after monthly credits. (omneky.com/pricing-plans) | VERIFIED (search index flags the page as older; recheck) |
| 9 | Trial auto-converts? | Lite, Standard and Pro have a 7-day free trial; Enterprise does not. "The paid subscription starts automatically when the trial ends." Card requirement not stated. (omneky.com/pricing-plans) | VERIFIED (auto-converts); card needed: UNVERIFIED |
| 10 | **Which plan includes MCP / API?** | **No Omneky page ties MCP or API to a plan.** The Claude page's "All plans: Free to Enterprise" refers to **Claude's** plans (Free Claude allows one custom connector), not Omneky's. API docs: "our team will help you size a plan". (omneky.com/integrations/claude; omneky.com/api-docs) | **ASK OMNEKY IN WRITING** |
| 11 | REST API scope | `X-API-Key` header, keys from the Omneky Admin Dashboard, per-key rate limits. Endpoints: POST `/create_image_ad_async`, POST `/create_video_ad_async`, GET `/jobs/{job_id}` (or `callback_url` webhook). 10 req/min each; video `target_duration` 10–15 s; a job is visible only to the key that made it. Errors 401/403/429 (+Retry-After). **No campaign endpoints documented.** Same credit balance as the app. (omneky.com/api-docs) | VERIFIED (campaign actions = MCP only) |
| 12 | Meta Ad Library research, and in MCP? | Web app has an "Ad Library" ("ads to study and clone") and Clone Video reuses hook/tone/structure of a Meta-library ad. Not in the MCP tool list. (omneky.com/blog/how-to-use-omneky-to-2x-sales; omneky.com/mcp) | Web app: VERIFIED. Via MCP: UNVERIFIED → ASK |
| 13 | **Agency / multi-client / resale terms** | Terms: "Except as specifically provided herein, Customer will not … rent, sell, lease, transfer or otherwise make available the Services or any portion thereof, or use it or any portion thereof **for the benefit of a third party**." Also: "Customer shall not use any information in any way related to or acquired by use of the Services for the prospective economic advantage of any third party." (omneky.com/terms; search index shows the page as ~413 days old) | VERIFIED: **standard terms do NOT allow client work** |
| 14 | White-label / embedding | Agency page markets "unlimited brands from a single workspace with white-label delivery" and removing Omneky branding; a blog mentions a custom subdomain ("[agency].omneky.com"). Not in the Terms; looks like an Enterprise/partner contract. Embedding Omneky inside our product: not addressed. (omneky.com/agency; omneky.com/blog/streamlining-agency-operations-with-omnekys-white-label-solution) | Marketing claim only → ASK OMNEKY IN WRITING |
| 15 | Token renewal | Not stated anywhere found (MCP OAuth lifetime, refresh, re-login). | ASK OMNEKY IN WRITING |
| 16 | Data retention | Privacy policy table (search index flags it as old): ad-account access tokens kept until you disconnect/revoke/close, "then deleted immediately"; synced campaign data kept while connected + **60 days** after; API/connector/Slack inputs and outputs kept with the workspace; request/response logs **90 days**. Terms: Omneky "will not use your Input, Output… to train, improve or develop its Services", but chosen third-party AI providers may under their own terms. (omneky.com/privacy-policy; omneky.com/terms) | VERIFIED (page age: recheck) |
| 17 | IP in our materials | Customer grants Omneky "a royalty free, worldwide, sublicensable right to use, display, copy and reproduce all Customer Materials to perform the Services"; a separate clause gives Omneky a perpetual licence to work product for promotion. (omneky.com/terms) | VERIFIED → ask for promo-use opt-out for clients |
| 18 | When MCP/API launched | Newsroom: public API + MCP server announced (MarTech360 coverage dated 2026-07-13). (omneky.com/newsroom/omneky-turns-ad-creative-into-open-ai-infrastructure) | VERIFIED (young product: ~3 months) |

---

## 2. Comparison table

| | **Omneky** | **Supermetrics** | **Metricool** | **Madgicx** | **Smartly** | **Native APIs (Meta / TikTok / Google)** |
|---|---|---|---|---|---|---|
| Execution scope | Launch, pause, scale via MCP only (`launch_campaign`, `pause_or_scale`). Meta, Google, TikTok, LinkedIn, Reddit, OpenAI Ads. No REST for campaigns. | Full create/update via MCP `manage_campaign`: campaign, ad set, ad, budget, status, targeting, keywords. Google, Meta, TikTok, LinkedIn, Microsoft, ChatGPT, Snapchat. **Created PAUSED.** Early access. | **None for ads** (read only; boost endpoint must never be used). Organic post scheduling yes. | Meta-first; MCP can pause ads and adjust budgets (vendor claim, tool names not published). | Enterprise cross-channel automation (Meta, Google, TikTok, Pinterest, Snap, YouTube, Reddit…). No public API/MCP found. | Everything, but we must build and maintain it, with approvals. |
| Creative generation | **Yes**: image, video, avatar ads, scoring, cloning (credits). REST for image/video jobs. | Light: `asset_prompt` / `creative_picker` (cost unknown). | No | AI Ad Generator (vendor claim) | Creative suite (enterprise) | No |
| Analytics | Campaign insights, channel comparison (Omneky-launched) | **Best**: 174 sources, cross-platform | Good, organic + paid read | Meta-deep, multi-channel reports | Enterprise | Raw data only |
| Cost (verified figures) | Lite US$29 / Standard US$99 / Pro US$249 per month (yearly US$24/79/199); Enterprise custom; top-ups 10 credits/US$1 | Starter US$55/mo monthly or US$44/mo yearly; Growth US$222 or US$177 (search snippets of the pricing page; recheck). **Campaign management: "free with an existing subscription" (early access).** | MCP any plan incl. Free; REST on Advanced from US$53/mo yearly | "From US$45/mo" vs "from US$99/mo" (own pages disagree) | Spend-based fee on all ad spend + monthly minimum (Order Form) | API free; ad spend only |
| Card / trial / auto-renew | 7-day trial, **auto-converts** to paid; card: UNVERIFIED | **14-day trial, no card** (mcp.supermetrics.com). Subscriptions **auto-renew**; may rise 8%/yr on renewal; no refund of remaining days. | Free plan exists | 7-day trial (vendor page) | Sales contract | None |
| Multi-client / white-label terms | **Standard terms forbid use "for the benefit of a third party"** and resale. White-label = marketing claim, likely Enterprise. | **Agency use allowed**: ToS 5.2.1 lets a "Marketing Agency Customer" use the Service for its clients; may share reports (5.2.2); **no direct client access or logins** (5.2.5); moving data into a client's warehouse needs a separate agreement (5.2.4). | Multi-brand agency plans; terms not reviewed | "Connect as many ad accounts as you wish for the same price" (vendor) | Built for agencies/brands, enterprise | Allowed, but each client must grant access; Meta Full Access + Business Verification; TikTok app review; Google access level + brand verification |
| Status for us | Not connected | **Connected**, no ad account yet | **Connected** (read) | Not connected | Not a fit | Meta path coded (Ad Actions), token missing |
| Fit for FusionTech (small Singapore agency) | Good creative + simple launch for **Ryan's own brand**. Not for clients until terms change in writing. | **Best execution fit today**: already connected, agency clause exists, paused-by-default, approval modes, cheap. | Keep for organic scheduling + reporting | Possible Meta alternative; weaker evidence | No (enterprise, spend-based minimums) | Long-term backbone for the platform; slow approvals |

Sources (all 2026-10-14, search results from vendor domains): omneky.com/mcp · /pricing-plans · /api-docs · /terms ·
/privacy-policy · /ad-launcher · /agency · /integrations/claude · /newsroom/omneky-turns-ad-creative-into-open-ai-infrastructure ·
supermetrics.com/pricing · /products/supermetrics-mcp · /terms-of-service · /blog/what-ai-agents-can-change-ad-accounts ·
docs.supermetrics.com/docs/how-to-manage-ad-campaigns-with-ai-tools · …/how-to-manage-ad-campaigns-in-supermetrics-studio ·
…/about-subscription-renewal · mcp.supermetrics.com/changelog · help.metricool.com/mcp-vs-api-access-what-is-the-difference-5y3ib ·
metricool.com/ad-campaigns-metricool/ · academy.madgicx.com/lessons/what-is-madgicx · madgicx.com/blog/ads-mcp ·
smartly.io/terms-of-use-2026 · docs.smartly.io/docs/introduction-to-smartly · developers.facebook.com/docs/permissions/ ·
developers.google.com/google-ads/api/docs/api-policy/access-levels · business-api.tiktok.com/portal/docs/create-a-developer-app/v1.3

---

## 3. Recommendation (plain English)

**Layer 1 pilot on Ryan's own ad account (FusionTech AI), nothing for clients yet.**

1. **Run the pilot on Supermetrics first, because it is already connected.** Ryan links his own Meta ad account in
   Supermetrics once, turns on write access for that one account, and picks the approval mode
   **"approval for any change to a live campaign"**. Then we test, in this order: read metrics → list campaigns →
   create one campaign (it is forced PAUSED) → read it back → change its budget while paused → delete or leave it paused.
   Nothing spends. This turns the Supermetrics rows in [[11_Capability_Register]] from CONNECTED to TESTED.
   Check first whether Ryan's Supermetrics is a 14-day trial (no card) and when it ends.
2. **Omneky as the creative engine, on a single 7-day trial, only when Ryan says yes.** Its strength is ad creative
   (image, video, avatar, scoring) and one-click launch. Before starting: set a calendar reminder for day 6, because the
   trial **turns into a paid plan automatically**. Lite (US$29, 200 credits) is enough to test generation; avatars need
   Standard (US$99). Launch only into Ryan's own ad account, **never** "launch on Omneky's ad account" (that prepays
   budget plus an unknown Omneky fee).
3. **One optimiser per ad account.** During the pilot, Supermetrics (or Omneky) is the only thing allowed to change the
   test campaign; our n8n Ad Actions and the autopilot stay read-only on that account.
4. **Do not sell any Omneky-based service to clients yet.** Its standard terms forbid using the service "for the benefit
   of a third party". We need Omneky's written permission (or an Enterprise/agency contract) first. Supermetrics' terms
   do allow agency work, but clients may not get their own login to our Supermetrics account.
5. **Keep building the native path in the background** (Meta System User token for Ad Actions; TikTok and Google app
   approvals later). It is free and is the only path we fully control.

**What must be confirmed in writing before selling to clients:** Omneky's permission for agency/multi-client use and
white-label/embedding, which plan includes MCP/API, token renewal, and an opt-out of Omneky's promotional use of client
work; Supermetrics' confirmation that campaign management on client ad accounts is covered by the agency clause and
what happens to it when early access ends (price).

---

## 4. Written questions to send

### To Omneky (email from Ryan; draft, not sent)
1. **Plan for MCP and API.** Which plans include the MCP server (`mcp.omneky.com/mcp`) and the REST API (X-API-Key)?
   Is either available on Lite or Standard, or only Pro/Enterprise? Are there extra fees?
2. **Production backend use.** May we call your API and MCP from our own automation (n8n workflows and AI agents)
   running every day, not only from a human chat? What rate limits apply on each plan?
3. **Agency / multi-client use.** Your Terms say the customer will not use the Services "for the benefit of a third
   party". We are a small agency in Singapore. May we use one Omneky account to make and launch ads for several client
   businesses, each in their own ad account? Which plan or contract allows it, and can you confirm in writing?
4. **White-label and embedding.** Can we show Omneky-made creative under our own brand, and can our own client
   dashboard call Omneky in the background (clients never log in to Omneky)? Is the custom domain a subdomain of
   omneky.com?
5. **Token renewal.** How long does the MCP OAuth login last? Does it refresh on its own, or must a person sign in
   again? What happens to a running automation when it expires?
6. **Free vs paid.** Your MCP page says analysis and launching are free; a blog says per-ad insights cost 1–2 credits.
   Which is correct today? Does `score_creative` or `analyze_performance` use credits?
7. **Confirmation.** Does `pause_or_scale` ask for confirmation when pausing, or only when scaling? Can we require
   confirmation for every write?
8. **Ad Library.** Is competitor Ad Library search or Clone available through the MCP or API?
9. **Client work in your marketing.** Can we opt out of Omneky using our clients' materials and ads for promotion?
10. **Trial.** Does the 7-day trial need a card, and can we stop auto-conversion in advance?

### To Supermetrics (only if we move to clients)
1. Our Supermetrics plan: does it include **campaign management** (`manage_campaign`) on **client** ad accounts under
   ToS 5.2.1 (Marketing Agency Customer)? Any limit on the number of client ad accounts with write access?
2. Campaign management is "early access" and "free with an existing subscription": will it be charged later, and with
   how much notice?
3. Is an AI-chat destination (Claude) included in Starter, or does it need Growth?
4. May our automation (not a person in chat) call the MCP daily for reads and paused-draft creation?
5. Confirm the auto-renewal date and notice period on our account.

## Ryan's decision (2026-10-15)
- **Omneky: yes** (Standard US$99/month, Ryan subscribes and connects it himself; client use waits for Omneky's written OK).
- **Supermetrics: not adopted.** Ryan does not want more reporting platforms. It stays unused unless it is proven to give an
  essential capability nothing else gives (today it doesn't: Meta's own API via our Ad Actions workflow covers the
  dashboard button for client accounts at no extra cost, after Meta's app review).
- **Metricool: kept** until a same-period comparison shows whether Omneky replaces its reporting.
