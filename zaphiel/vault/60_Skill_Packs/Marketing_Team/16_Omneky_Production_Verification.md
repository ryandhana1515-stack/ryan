---
tags: [zaphiel, marketing, omneky, verification]
date: 2026-10-17
status: active (recheck before paying or building)
builds_on: "[[13_Provider_Evaluation]] (v5, 2026-10-14) and [[11_Capability_Register]]"
---
# Omneky production verification (2026-10-17)

**Question:** can the Fusion dashboard and APEX use Omneky in production (a server calling it, not Ryan typing in a
chat), and which ad actions does Omneky really offer?

**How this was checked.** I could **not open any Omneky page directly**. On 2026-10-17 WebFetch could not resolve
`www.omneky.com`, `docs.omneky.com` or `mcp.omneky.com`, and this session's network proxy refused the connection
(HTTP 403, host not allowed). So every fact below comes from **web-search results restricted to omneky.com**: an Omneky
page says it, as the search index quoted it. I did not read the full pages. Several pages are flagged by the index as
old (terms ~416 days, pricing ~694 days, Insights page much older). Nothing was signed up for, connected, generated or
paid for. The npm registry *was* reachable, so I checked it directly for a CLI package.

**Status labels used here.** VERIFIED AND WORKING = we saw it work (nothing qualifies: we have not connected Omneky).
DOCUMENTED BUT NOT TESTED = an official Omneky page says it exists. REQUIRES ADDITIONAL PERMISSION = exists, but needs
a higher plan, an Enterprise contract, or written permission. NOT SUPPORTED = an official page says no. UNKNOWN = no
official page answers it. **UNKNOWN never means "works".**

---

## What is NEW or CHANGED since 2026-10-14

1. **Omneky CLI: mentioned, but nothing behind it can be found.** The MCP page says that for terminal agents (Claude
   Code, Codex, Cowork) "the Omneky CLI is a better fit". No install guide, command list, package name or login method
   appears on any omneky.com page in search. The npm registry has **no package** called `omneky`, `omneky-cli`,
   `@omneky/cli` or `@omneky/mcp`, and a search for "omneky" returns 0 results (checked directly 2026-10-17). PyPI has
   no `omneky` package. → CLI is **UNKNOWN**. We cannot build on it.
2. **The MCP server is open to other clients.** The MCP page lists Claude (web, Cowork, Claude Code), ChatGPT, Cursor,
   Codex and Grok Bot. The integrations page says "any other MCP client can connect to the same server". This is new
   evidence that it is a normal remote MCP server, not a Claude-only connector. **Token lifetime, refresh tokens,
   OAuth 2.1 / dynamic client registration and headless (server) use are still not stated anywhere.**
3. **More campaign-planning abilities are described** (they were "no tool named" on 2026-10-14). The MCP page lists
   "search audiences, find interests, discover locations, estimate audience reach" and "budget recommendations", and
   says the agent can "set budgets, audiences, and A/B splits before pushing live" and "update targeting". The privacy
   policy (updated **2026-09-17**) describes a *targeting and reach* tool family (input: location, interest and country
   search terms plus audience specs; output: platform targeting options, reach estimates, minimum budgets) and a
   *campaign launch and management* family (input: objective, budget, schedule, targeting, creatives, destination URL,
   conversion events; pause, resume and budget changes; output: campaign IDs and status). **The exact tool names for the
   targeting family are not published**; the public list still shows the same 12 names.
4. **The web app can read and control campaigns that were NOT made in Omneky.** Ad Launcher's "Live campaigns" view
   "loads the campaigns on the ad accounts you connected, one channel at a time. Pause or activate them, and change the
   daily budget." Campaigns on Omneky's own ad account are not managed there. The integrations and Grok pages say the
   assistant works on "campaigns launched outside Omneky" (marketing copy, channels not specified).
5. **Launch settings per channel are now visible.** Meta goals: Sales, Leads, Traffic, Awareness (on Omneky's own
   account only Traffic or Awareness). TikTok: Reach, Traffic, Sales; "Launches as a Regular campaign, and Smart+ is
   not supported." LinkedIn: Brand Awareness, Website Visits, Engagement, Website Conversions. Defaults shown: age
   18–65, all genders, US$50/day. Campaigns and ad sets can be set active or paused; budget sits on the campaign or on
   the ad set.
6. **Terms: an "Ad Spend Fee" exists.** Section 2.1: fees "may be comprised of three components: (a) a recurring
   subscription fee ('Subscription Fee'), (b) a usage-based fee ('Usage Fee'), and (c) a fee based on a percentage of
   monthly ad spend ('Ad Spend Fee'), as described in Exhibit A or on the Platform." It is "calculated as a percentage
   of the Customer's advertising spend **managed by or tracked through** the Services", billed monthly in arrears; rates
   are "set forth in Exhibit A or on the Platform" (not found). Omneky may change fees at the end of a term "upon thirty
   (30) days prior notice". **Conflict:** Omneky's contact page says it does not charge for ad usage or ad spend.
7. **Terms: Omneky owns the ads it makes, and our licence covers only "our own" campaigns.** "Omneky shall own all
   right, title, and interest in and to all work product, including advertisements and creatives, created by or through
   the Services." The customer gets a "non-exclusive, non-transferable, royalty-free license, during the Term",
   "conditioned on full payment of fees", for the customer's **own advertising campaigns** only. Omneky keeps a
   "perpetual, irrevocable, worldwide, royalty-free, fully paid-up, non-exclusive, sublicensable" right to use work
   product and customer materials for its own marketing. A separate clause says the customer owns Input and Output "to
   the extent protectable under applicable law"; the terms do not reconcile the two. Terms last updated 2025-08-27 (per
   the index). **This is a second, independent reason (beside "for the benefit of a third party") why client work
   needs a written agreement.**
8. **Possible limit of ONE ad account per channel.** Omneky's support page: you can "connect one ad account per ad
   channel for free reporting and launching". A legacy FAQ: Standard is "one brand, one integrated ad account per each
   of our 5 self-serve platforms". The current pricing page does not mention ad-account limits. For a multi-client
   dashboard this is critical → ask.
9. **Credits are shared across brands.** Credits belong to the company, every brand draws on the same pool; team members
   are Admin or Standard per brand. Extra brands can be added "as an additional brand-level subscription" (contact page).
10. **Credit prices (API docs, newer figures):** image 1K 5 credits, 4K 10; image edit/upscale 5; 8-s product animation
    with sound 10; avatar video without product 15, with product 20; long-form avatar video 60–75; commercial up to 15 s
    30 (pricing/home); Clone ~5 credits per second (April 2026 blog). **The API docs themselves now list "AI performance
    insights: 1 credit per image ad, 2 per video ad"**, which contradicts the MCP page's "analysis and launching are
    free". The contact page still says 15 credits per image.
11. **September 2026 release (Omneky blog, posts dated 17–26 Sept 2026):** native plugins for Claude, ChatGPT, Grok and
    Slack; "new ad launchers for ChatGPT, Pinterest, and X"; automated marketing plans; prompt-based video editor;
    PostHog, Ahrefs, Semrush and HubSpot integrations; "Taste Bench" multi-model creative selection. **Conflict:** the Ad
    Launcher page still says Pinterest and X "can be connected… but you can't launch there yet", and the Insights page
    says their data "is not in Insights yet". Treat Pinterest and X as **not available** until shown.
12. **Slack:** approvals, weekly recaps and alerts; a Monday "Auto Ads" report (top creatives, spend, advice).
    **Privacy policy (2026-09-17):** Omneky shares account and usage data with "resellers, distributors, and affiliate
    partners" for customers they bring. Retention figures in [[13_Provider_Evaluation]] row 16 came from an older copy:
    recheck them against the 2026-09-17 version.
13. **ChatGPT connector "Paid plans only"** (Claude integration page). This most likely refers to ChatGPT's paid plans
    (developer mode), **not** Omneky's plans. It does not answer which Omneky plan includes MCP.

Unchanged and still true: endpoint `https://mcp.omneky.com/mcp`, OAuth sign-in, "no API keys to manage"; REST API with
`X-API-Key` covers creative jobs only; public API and MCP announced 2026-07-13; plans Lite US$29 / Standard US$99 /
Pro US$249 / Enterprise custom; standard terms forbid use "for the benefit of a third party".

---

## Capability table

Interfaces: **MCP** = Omneky MCP server (`mcp.omneky.com/mcp`, OAuth). **REST** = Omneky API (`X-API-Key`).
**UI** = Omneky web app only. **CLI** = none documented.

| Capability | Status | Interface | Source (official, via search, 2026-10-17) | Note |
|---|---|---|---|---|
| Read existing campaigns | DOCUMENTED BUT NOT TESTED | UI (Ad Launcher "Live campaigns"); MCP implied, tool not named | omneky.com/ad-launcher (also /omnichannel); omneky.com/integrations; omneky.com/integrations/grok | UI "loads the campaigns on the ad accounts you connected, one channel at a time". Integrations page claims it works on "campaigns launched outside Omneky". No MCP tool called "list campaigns"; closest is `get_campaign_insights`. Not on REST. |
| Read individual ads | DOCUMENTED BUT NOT TESTED (UI); UNKNOWN (MCP) | UI Insights; MCP `analyze_performance` probably | omneky.com/api-docs; omneky.com/blog/how-to-use-omneky-to-2x-sales | "AI Creative Performance Insights — per-ad-level analysis", 1 credit per image ad, 2 per video ad. Whether an MCP call returns per-ad rows: not stated. |
| Read performance | DOCUMENTED BUT NOT TESTED | MCP `get_campaign_insights`, `analyze_performance`, `compare_channels`; UI Insights | omneky.com/mcp; omneky.com/omnichannel-insights | Insights reads Meta (FB + IG), Google (incl. YouTube), TikTok, LinkedIn, Reddit, OpenAI Ads. "Pinterest and X Ads can be connected, but their data is not in Insights yet." Synced fields include spend, clicks, conversions, ROAS (privacy policy). |
| Retrieve creative assets | DOCUMENTED BUT NOT TESTED | MCP `list_creatives`, `get_brand_kit`; REST GET `/jobs/{job_id}` (API-made jobs only); UI download | omneky.com/mcp; omneky.com/api-docs; omneky.com/guides | MCP lets an agent "browse your creation history". Whether `list_creatives` returns download URLs: UNKNOWN. REST jobs are visible only to the key that created them. |
| Generate image ads | DOCUMENTED BUT NOT TESTED | MCP `generate_image_ad`; REST POST `/create_image_ad_async` | omneky.com/mcp; omneky.com/api-docs | 5 credits (1K), 10 (4K). REST 10 requests/min per key. |
| Generate video ads | DOCUMENTED BUT NOT TESTED (avatars: REQUIRES ADDITIONAL PERMISSION = Standard plan or higher) | MCP `generate_video_ad`, `generate_avatar_ad`; REST POST `/create_video_ad_async` | omneky.com/mcp; omneky.com/api-docs; omneky.com/pricing-plans | REST `target_duration` 10–15 s. Avatar 15–20 credits; Standard adds "commercials, avatars, and cloning". |
| Prepare campaign structures (draft, nothing live) | DOCUMENTED BUT NOT TESTED (planning); UNKNOWN (saved draft) | MCP (planning tools, names not published) then `launch_campaign` | omneky.com/mcp; omneky.com/privacy-policy | Audience search, reach estimate, budget recommendation, minimum-budget check are described. Whether a campaign can be **saved as a draft without launching** (or created paused) through MCP: UNKNOWN. |
| Create campaigns | DOCUMENTED BUT NOT TESTED | MCP `launch_campaign`; UI Ad Launcher. REST: not documented | omneky.com/mcp; omneky.com/ad-launcher; omneky.com/api-docs | Spending waits for "explicit confirmation in the conversation". REST API covers only creative jobs. |
| Create ad sets / ad groups | DOCUMENTED BUT NOT TESTED (UI); UNKNOWN (separate MCP control) | UI; MCP only inside `launch_campaign` (implied) | omneky.com/ad-launcher | UI: campaigns and ad sets active or paused; budget on campaign or ad set. No MCP tool to add an ad set to an existing campaign is named. |
| Configure audiences | DOCUMENTED BUT NOT TESTED | MCP (tool names not published); UI | omneky.com/mcp; omneky.com/privacy-policy; omneky.com/ad-launcher | Fields: locations, age ranges, genders, languages, interests, behaviors, audiences. Default 18–65, all genders. Custom/lookalike audiences: UNKNOWN. |
| Configure budgets | DOCUMENTED BUT NOT TESTED | MCP `launch_campaign` (+ budget recommendations); UI | omneky.com/mcp; omneky.com/integrations/claude | "Omneky checks minimum budgets and estimated reach first." Default US$50/day in the UI example. |
| Launch approved campaigns | DOCUMENTED BUT NOT TESTED | MCP `launch_campaign`; UI | omneky.com/mcp (FAQ) | "Anything that spends money — launching or scaling a campaign — waits for your explicit confirmation in the conversation first." **How that confirmation works when a server (no human in a chat) calls the tool: UNKNOWN.** |
| Pause and resume | DOCUMENTED BUT NOT TESTED (campaign level); UNKNOWN (single ad) | MCP `pause_or_scale`; UI "Pause or activate" | omneky.com/mcp; omneky.com/ad-launcher | MCP page: "Pause and resume campaigns". Pausing one individual ad inside a campaign: not stated. Whether pause also asks for confirmation: not stated. |
| Modify budgets | DOCUMENTED BUT NOT TESTED | MCP `pause_or_scale`; UI "change the daily budget" | omneky.com/mcp; omneky.com/ad-launcher | "Budget changes depend on what each channel allows." Increasing spend needs confirmation. |
| Retrieve campaign status | DOCUMENTED BUT NOT TESTED | MCP (launch family returns "campaign IDs and status"); UI Live campaigns | omneky.com/privacy-policy; omneky.com/ad-launcher | A dedicated "get status" tool is not named. |
| Performance reports | DOCUMENTED BUT NOT TESTED | MCP `analyze_performance`, `compare_channels`; UI Insights; Slack weekly recap | omneky.com/mcp; omneky.com/slack; omneky.com/guides; April-2026 blog | Monday "Auto Ads" report; PMAX asset-level reporting (April 2026). Export/PDF report via API: UNKNOWN. |
| Competitor ad research (Meta Ad Library) | DOCUMENTED BUT NOT TESTED (UI); UNKNOWN (MCP/REST) | UI only | omneky.com/blog/how-to-use-omneky-to-2x-sales; omneky.com/clone | "Search the integrated Meta Ads Library… pick a high-performing ad… click Clone." Clone ~5 credits/s. Not in the MCP tool list or REST docs. (omneky.com/ad-library is a gallery of AI-made examples, not Meta's library.) |
| Creative variations | DOCUMENTED BUT NOT TESTED | MCP `generate_*` (several outputs), `score_creative`; UI Variations Grid | omneky.com/mcp; omneky.com/blog/dynamic-creative-optimization | Omneky recommends 15–30 variants per launch. |
| Formal randomized A/B experiments | UNKNOWN | — | omneky.com/mcp; omneky.com/blog/dynamic-creative-optimization | MCP page says the agent can set "A/B splits before pushing live", but nothing shows a platform split test (randomized, separate audiences, significance). Omneky's own DCO guide contrasts fixed A/B tests with continuous reweighting. Treat as "several ads in one campaign" until Omneky confirms. |
| CLI for terminal agents | UNKNOWN | CLI (claimed) | omneky.com/mcp | Mentioned once; no docs, no npm/PyPI package found. |

---

## The 8 answers

**1. Authentication methods.**
- MCP: OAuth sign-in in a browser ("Sign in with your Omneky account — there are no API keys to manage"; "nothing
  secret is stored in Claude"). DOCUMENTED.
- REST: `X-API-Key` header, keys made in the Omneky Admin Dashboard, per-key rate limits; 401 bad key, 403 deactivated
  account, 429 rate limit with Retry-After. DOCUMENTED.
- Revoking: API keys and connector access can be revoked in Settings > Integrations (privacy policy).
- CLI: auth model UNKNOWN (no docs).
- Ad platforms: you connect your own ad accounts to Omneky (free); OpenAI Ads uses an API key from OpenAI's Ads
  Manager. Nothing else found.

**2. Can a production server (not Claude chat) use the MCP?** **UNKNOWN, leaning possible but not proven.** For: it is
a remote MCP endpoint, it lists five different clients, and the integrations page says "any other MCP client can
connect to the same server". Not found anywhere: OAuth 2.1 / dynamic client registration, refresh tokens, token
lifetime, service accounts, or any statement allowing unattended server use. Two specific blockers: (a) the OAuth login
is a browser sign-in by a person; whether the server can keep working afterwards depends on refresh tokens nobody has
documented; (b) launching and scaling wait for "explicit confirmation **in the conversation**", which a background
workflow does not have. Must be confirmed in writing and then tested.

**3. Does the REST API key cover campaign functions?** **No, as documented: creative jobs only.** The API docs
("Omneky API · Image & Video Ad Generation") list POST `/create_image_ad_async`, POST `/create_video_ad_async` and
GET `/jobs/{job_id}` (plus a `callback_url` webhook). No campaign, insights or launch endpoint is documented. Campaign
actions are reachable only through MCP or the web app. (Official pages do not say "not supported" in words; they just
don't document it.)

**4. Plan requirements for MCP / API.** **UNKNOWN.** No Omneky page ties MCP or API to a plan. API docs: "our team will
help you size a plan". MCP page: "MCP tools use the same credits as the Omneky platform." The "Paid plans only" line
on the Claude integration page refers to ChatGPT's plans, not Omneky's.

**5. Brand and ad-account limits per plan.** Brands: Lite 1, Standard 3, Pro 5, Enterprise custom ("custom limits on
brands, seats, and credits"); seats 1 / 3 / 5 (pricing page, possibly old). Extra brands may be bought as a brand-level
subscription. Ad accounts: support page says **"one ad account per ad channel"** free for reporting and launching; the
legacy FAQ says one integrated ad account per platform. Whether that is one per channel per brand or per company, and
whether more can be added: UNKNOWN. A stale Amazon page shows a US$79 "Creative Generation Pro" with unlimited brands
and seats; it conflicts with the pricing page; ignore until confirmed.

**6. Rate limits and usage charges.**
- REST rate limits: per API key, fixed one-minute window; image and video creation 10 requests/min each; job polling
  limit set per key in the dashboard. MCP rate limits: not published (UNKNOWN).
- Credits: see change 10 above. Top-ups 10 credits per US$1, never expire, used after monthly credits.
- Analysis: MCP page says free; API docs and a blog say per-ad insights cost 1–2 credits. CONFLICT.
- Launching on **our/client's own ad account**: connecting is free; ad spend is billed by Meta/Google/etc.
- Launching on **Omneky's ad account** (Meta, Google, OpenAI Ads): "pay the ad budget plus Omneky's fee, up front";
  Google refunded if no ads launch; on Meta only Traffic or Awareness. Fee amount: not found.
- **Ad Spend Fee** in the Terms (% of spend "managed by or tracked through the Services", billed monthly in arrears,
  rate in Exhibit A, not found) vs contact page "does not charge for ad usage or ad spend". CONFLICT. This could apply
  even to campaigns in our own accounts, because it covers spend merely "tracked through" Omneky.

**7. Multi-client / agency / white-label licensing.** **REQUIRES ADDITIONAL PERMISSION (written agreement).**
- Terms (restriction): "Except as specifically provided herein, Customer will not … rent, sell, lease, transfer or
  otherwise make available the Services or any portion thereof, or use it or any portion thereof for the benefit of a
  third party."
- Terms (licence to the ads): Omneky "shall own all right, title, and interest in and to all work product, including
  advertisements and creatives"; the customer's licence is "non-exclusive, non-transferable, royalty-free … during the
  Term", "conditioned on full payment of fees", for the customer's **own** advertising campaigns.
- Agency page (marketing, not contract): unlimited client accounts from one dashboard, "white-label delivery", removal
  of Omneky branding; "white-label ready for enterprise agency partnerships". Enterprise terms are mentioned ("enterprise
  terms of service includes IP assignment, data protection & AI governance controls") but not published.
- Conclusion: the standard self-serve plans do not give us the right to run Omneky for client companies or hand their
  ads to them. That needs an Enterprise or agency/partner contract, in writing.

**8. Platforms supported for execution.**
| Platform | Launch (own account) | Launch (Omneky's account) | Insights | Status |
|---|---|---|---|---|
| Meta (Facebook) | yes | yes (Traffic/Awareness only) | yes | DOCUMENTED BUT NOT TESTED |
| Instagram | via Meta | via Meta | yes ("Meta (Facebook and Instagram)") | DOCUMENTED BUT NOT TESTED |
| TikTok | yes (Regular campaigns; Smart+ not supported) | no | yes | DOCUMENTED; Smart+ NOT SUPPORTED |
| Google (PMax, Demand Gen, YouTube) | yes | yes (refund if no launch) | yes | DOCUMENTED BUT NOT TESTED |
| LinkedIn | yes (added April 2026) | no | yes | DOCUMENTED BUT NOT TESTED |
| Reddit | yes (added April 2026) | no | yes | DOCUMENTED BUT NOT TESTED |
| OpenAI Ads (ChatGPT) | yes | yes | yes | DOCUMENTED BUT NOT TESTED |
| Pinterest, X | connect only | — | "not in Insights yet" | NOT SUPPORTED per Ad Launcher/Insights pages; Sept-2026 blog announces launchers → CONFLICT, treat as no |

---

## What we must ask Omneky in writing

Replaces and extends the email draft in [[13_Provider_Evaluation]] §4 (still not sent; Ryan sends it).

1. **Server use of MCP.** May our own backend (n8n / our dashboard server) connect to `mcp.omneky.com/mcp` unattended,
   every day? Is it OAuth 2.1 with dynamic client registration? Do you issue refresh tokens, how long do access and
   refresh tokens last, and what happens to a running automation when they expire?
2. **Confirmation without a chat.** Launch and scale wait for "explicit confirmation in the conversation". How does a
   server confirm? Is there a draft/paused mode (create the campaign paused, launch later)? Does pause also ask?
3. **The CLI.** Your MCP page recommends "the Omneky CLI" for terminal agents. Where is it, how is it installed, how
   does it authenticate, and does it cover campaign actions?
4. **REST for campaigns.** Is there (or will there be) a REST endpoint for reading campaigns, launching, pausing and
   budgets, so we don't depend on MCP?
5. **Plans.** Which plans include MCP and the REST API? Any extra fee? MCP rate limits?
6. **Ad accounts.** Is it really one ad account per channel? Per brand or per company? Can we connect one Meta account
   per client brand?
7. **Ad Spend Fee.** Your Terms §2.1 allow a percentage-of-ad-spend fee on spend "managed by or tracked through the
   Services". Does any fee apply on self-serve plans, including campaigns in our own or clients' ad accounts? What
   percentage? And what is Omneky's fee when launching on Omneky's ad account?
8. **Free vs credits for analysis.** MCP page says analysis is free; API docs say 1 credit per image ad / 2 per video ad
   insight. Which applies to `analyze_performance`, `get_campaign_insights`, `compare_channels`, `score_creative`?
9. **Agency licence.** Your Terms forbid use "for the benefit of a third party" and limit our licence to our "own
   advertising campaigns". We run a platform for many small businesses (each with its own brand and ad account). Which
   contract allows this, at what price, and does it give the client (or us) ownership/licence of the ads made?
10. **White-label and embedding.** Can our dashboard call Omneky in the background under our brand, clients never logging
    in to Omneky? Can we opt out of Omneky's perpetual promotional use of client materials and ads?
11. **A/B testing.** Are "A/B splits" real platform experiments (e.g. Meta A/B test, randomized separate audiences, with
    a winner and significance), or several ads in one ad set?
12. **Ad Library via API/MCP.** Is Meta Ad Library search or Clone available through MCP or REST?
13. **Pinterest and X.** Your September 2026 blog announces launchers; the Ad Launcher page says not yet. Which is right?
14. **Existing campaigns.** Can MCP list and read campaigns and individual ads that were not created in Omneky, and pause
    a single ad (not only a whole campaign)?

---

## What this means for the Fusion dashboard (plain English)

- **Making ads: yes, and our server can do it today.** Omneky's normal API (a key we keep in n8n) makes image and video
  ads and hands back the files. That fits APEX's CREATE ADS step on any Omneky plan we can confirm includes the API.
- **Running ads (launch, pause, budgets, reports): not safe to wire into the dashboard yet.** Omneky only offers these
  through its AI "MCP" door or its own website. Nothing published says our server may use that door unattended, how long
  its login lasts, or how the "say go in the chat" safety step works without a chat. The CLI it mentions cannot be
  found. So the dashboard's LAUNCH / MONITOR / OPTIMISE buttons should **keep using our own Meta route** (Ad Actions)
  for now, and Omneky stays the creative engine.
- **Ryan can test campaign control by hand.** After he subscribes and connects his own Meta account, he can ask Claude
  to read and pause campaigns through Omneky in chat. That proves the tools work, but it is still a person in a chat,
  not the dashboard.
- **Clients: not yet.** Omneky's terms say the service is for our own use, and the ads it makes belong to Omneky with a
  licence for our own campaigns only. Before any client's ads go through Omneky we need a signed agency/Enterprise
  agreement. There may also be only one ad account per channel per account, which would block a many-client setup.
- **Money traps to avoid:** never choose "launch on Omneky's ad account" (budget plus an unknown fee, paid up front);
  ask about the possible percentage-of-ad-spend fee in the terms before connecting client accounts.
- **Do not show any Omneky campaign button as "working"** until Omneky answers questions 1, 2, 5, 6 and 9 in writing
  and we have run a real test on Ryan's own account.

Sources (all omneky.com, seen only as search results on 2026-10-17): /mcp · /integrations · /integrations/claude ·
/integrations/grok · /api-docs · /pricing-plans · /terms · /privacy-policy · /ad-launcher (also /omnichannel) ·
/campaign-launcher · /omnichannel-insights · /agent · /agency · /amazon · /demo-schedule · /clone · /ad-library ·
/guides · /slack · /support/account-billing/omneky-plans-credits-and-account-management ·
/newsroom/omneky-turns-ad-creative-into-open-ai-infrastructure · /blog/how-to-use-omneky-to-2x-sales ·
/blog/dynamic-creative-optimization · /blog (September 2026 roundup) · /blog/omneky-september-release (2025, not
2026). Direct check: registry.npmjs.org (no Omneky package), pypi.org (no `omneky`).
