---
tags: [zaphiel, skill-pack, marketing, tools]
status: active (recheck before use)
version: v4 (2026-10-12)
verified: 2026-10-12, official vendor domains only (via search results; direct page opening was blocked in this session, so recheck the linked page before relying on a price or rule)
---
# Tool Library + Tool Router

Every tool the Marketing Team may use: what it is for, what it is NOT for, API, auth, pricing model (who pays), limits,
commercial-use rules, AI-disclosure/consent needs, whether it is connected in Ryan's Claude Code session, and its status.
**Tools change fast:** recheck the official page before using a price, limit or rule; never assume a UI feature exists in the
API. Anything not confirmed on an official page says **UNVERIFIED**. Every paid generation, sign-up or API purchase needs
the cost card and Ryan's yes ([[08_Approval_Rules]]).

## Connected in Ryan's Claude Code session (checked 2026-10-12)
| Tool | Connected? | Notes |
|---|---|---|
| Metricool | ✅ (read-only MCP) | Brand FusionTech.AI read OK; BROWREVOLUTION has no accounts yet; no ad accounts |
| Higgsfield | ✅ (MCP) | credits — ask first |
| Kling | ✅ (MCP) | credits — ask first |
| ElevenLabs | ✅ (MCP) | credits — ask first; check commercial-use plan |
| Canva | ✅ (MCP) | |
| Web search | ✅ | opening web pages directly may be blocked by the session's network policy; search results work |
| HeyGen, Google Veo/Gemini, Seedance (direct), CapCut, Meta/TikTok/Google Ads APIs | ❌ | not connected; not needed yet (zero-cost rule) |

## TOOL ROUTER — "need → tool"
| Need | First choice | Fallback | Never |
|---|---|---|---|
| Talking spokesperson / explainer | HeyGen (with the real person's recorded consent) — not connected yet | Real filmed footage (phone is fine) | A fake "customer" presented as a real testimonial |
| Cinematic product / lifestyle b-roll | Higgsfield (gives Kling, Seedance and its own models in one place) or Kling direct — pick by a small test | Stock + edit | Showing results the product can't deliver |
| UGC-style hook clips | Real creator/customer footage (best, with consent) → Higgsfield UGC/Marketing Studio presets | Avatar, labelled where required | Invented testimonials |
| Voiceover | ElevenLabs (commercial-use plan) | Ryan's/staff's real voice | Cloning anyone else's voice |
| Static ads / carousels | Canva (+ Higgsfield or Gemini images) | — | Fake before/after |
| Edit, captions, resize (9:16, 4:5, 1:1, 16:9) | CapCut (manual) / ffmpeg (code) | Canva | — |
| Competitor research | Meta Ad Library, TikTok Creative Center, Google Ads Transparency Center (public web) | Web search, reviews | Logging in to scrape |
| Ad results | Metricool (read) → native APIs later | — | Pretending Metricool can pause/create ads |

**Regulated or sensitive niches (beauty treatments, health, finance, property):** prefer REAL footage + real proof; AI visuals
must never imply real results. Meta labels ads made with third-party AI ("AI Info", see notes) — plan for disclosure.

---

Research date: 2026-10-12. Sources were limited to official vendor pages (docs, pricing, terms, help centres, official blogs and changelogs).

**How this was checked:** this session's network policy blocked opening pages directly (WebFetch/curl were denied), so every fact below comes from web-search results limited to the vendor's own domains. The vendor's own page is cited for each fact. Prices change often and some vendor pages contradict each other; where they do, both are noted. Anything that could not be confirmed on an official page is marked **UNVERIFIED**. No sign-ups, no paid calls.

---

### Higgsfield
- Purpose: An all-in-one web studio for AI images and video. It hosts many third-party models and Higgsfield's own models, plus presets and apps (Marketing Studio, AI Influencer, Genjutsu motion transfer, and others).
- Best for: Fast social and ad creative from one subscription. Trying several models (Kling, Seedance, Veo and others) without separate accounts. Ready-made "viral" presets.
- NOT good for: Model-exact pricing (credit costs differ by model and Higgsfield's own blog posts disagree). Workflows that need every website model through the API, because the API catalogue is curated and differs from the website. Training your own models on its outputs, which the Terms forbid.
- Inputs → outputs: Text prompt and/or reference images or video in; images, video clips (some with audio) and upscales out.
- Official API: **yes**. The "Higgsfield API" / Open Higgsfield (docs.higgsfield.ai, open.higgsfield.ai, console.higgsfield.ai) is asynchronous: you submit a job, then poll it or receive a webhook. It lists 50+ models including Seedance 2.5/2.0, Kling 3.0/O3/2.6/2.5, Wan, MiniMax, PixVerse, LTX, Grok, Ideogram, Recraft, Qwen, and Higgsfield Soul/DoP/Marketing Studio Image. Veo and Nano Banana did **not** appear in the API catalogue (website only: UNVERIFIED for the API). There is a Python SDK, and TypeScript docs were added in the changelog dated 2026-08-11.
- Auth: Key ID plus secret, created in the console, sent as `Authorization: Key <id>:<secret>`. The secret is shown only once. Keep it server-side.
- Pricing model: **The website and the API are billed separately.** The website is a subscription with credits. Higgsfield's blog cites Starter at $9 or $15/mo (posts disagree), Plus $49/mo (1,000 credits) and Ultra $129/mo (3,000 credits), all as of Sept 2026, so confirm on the pricing page. The API uses a prepaid USD balance (help centre says $5 minimum top-up) and charges only for successful generations, per the API FAQ.
- Limits: The API overview cites 20 concurrent requests per key. Per-model limits apply (for example, Seedance 2.5 via the API goes up to 30 s).
- Commercial use / licensing: Terms §4.4: Higgsfield "does not claim ownership of any of your Inputs or Outputs, nor does it restrict your commercial use of Outputs". The help centre says commercial rights are not tied to a plan. Outputs are not exclusive. Outputs may not be used to train AI models. IP indemnity is Enterprise only.
- AI disclosure / consent needs: The user is responsible for third-party IP and likeness rights (help centre). Higgsfield has no stated labelling duty of its own (UNVERIFIED), but platform rules (Meta/TikTok, below) still apply.
- Sample workflow for an SME ad: Upload the product photo, run a Marketing Studio or product-shot preset into a 9:16 image-to-video (Kling or Seedance), then add captions in ffmpeg or CapCut.
- Status for FusionTech: **Connected in this Claude Code session** (Higgsfield MCP). Every generation spends credits → cost card + Ryan's yes. Status: CONNECTED (not used yet for marketing).
- Verified: 2026-10-12 — https://docs.higgsfield.ai/docs/api-reference/overview · https://docs.higgsfield.ai/docs/help/faq · https://docs.higgsfield.ai/docs/authentication · https://higgsfield.ai/creator-hub/help-center/integrations/what-is-the-higgsfield-api · https://higgsfield.ai/terms-of-use-agreement · https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially · https://open.higgsfield.ai/explore

### HeyGen
- Purpose: AI avatar / talking-head videos (stock avatars, photo avatars, "Digital Twin" of a real person), video translation with lip sync, and text-to-speech.
- Best for: Spokesperson explainer ads, multilingual versions of one video, and personalised video at scale.
- NOT good for: Cinematic product b-roll. Using anyone's likeness without their recorded consent.
- Inputs → outputs: Script plus avatar ID plus voice ID gives an MP4. A source video plus target language gives a translated, lip-synced MP4.
- Official API: **yes**. API v3 at api.heygen.com covers `POST /v3/videos` (avatar video, Avatar IV/V engines), `POST /v3/video-translations` (batch up to 100 per call), avatar consent endpoints, and LiveAvatar.
- Auth: API key in the `X-Api-Key` header (created in the API dashboard).
- Pricing model: **The API is pay-as-you-go in USD and separate from web plans; no subscription is needed.** The minimum top-up is $5 and credits expire after 12 months. Example rates in the HeyGen help article: Avatar IV Digital Twin $4.83/min, Avatar III Digital Twin $0.60/min, video translation (speed lip-sync) $0.81/min, TTS $0.12/min. Enterprise is billed in credits at $0.50 each. Web plans (FAQ, possibly stale): Free $0 (3 videos/mo, watermark) and Creator $29/mo or $24/mo annual (600 credits, no watermark). HeyGen's MCP draws from web-plan credits; the direct API draws from the API balance.
- Limits: The PAYG tier allows 10 concurrent video jobs (avatar renders plus translations). Going over returns 429 with a Retry-After header.
- Commercial use / licensing: HeyGen's own pages say paid plans "grant full commercial rights" and call the free plan suited for "testing and non-commercial use". Exact Terms of Service wording: UNVERIFIED.
- AI disclosure / consent needs: **Digital Twins need consent from the person depicted.** Standard accounts record an on-camera consent statement through a hosted page (link valid for 24 h). Only whitelisted Enterprise accounts may upload pre-recorded consent or rely on an indemnity agreement. The moderation policy says avatars of other people without explicit consent are "strictly prohibited", and the depicted person can request removal at any time. Photo and prompt-generated avatars of non-real people need no consent.
- Sample workflow for an SME ad: The client owner records 2 min of footage plus a consent clip, giving a Digital Twin. John writes a 20 s script, the API renders it, and the API translates it into Chinese and Malay.
- Status for FusionTech: **Not connected.** Status: DOCUMENTED. Use only with the real person's recorded consent; API is pay-as-you-go (no subscription), still needs Ryan's yes.
- Verified: 2026-10-12 — https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained · https://developers.heygen.com/docs/quick-start · https://developers.heygen.com/docs/usage-limits · https://developers.heygen.com/docs/avatar-consent · https://www.heygen.com/moderation-policy · https://www.heygen.com/faq

### Google Veo (video) and Gemini image models ("Nano Banana")
- Purpose: Google's generative video (Veo) and image generation and editing (Gemini image models, branded "Nano Banana").
- Best for: High-quality 4–8 s video with native audio (Veo 3.1), cheap high-volume image generation and editing (Nano Banana 2.1 / 2), and text rendering in images (Nano Banana Pro).
- NOT good for: Long videos in one shot. Hiding AI origin (SynthID cannot be switched off).
- Inputs → outputs: Text and/or images (first/last frame, "ingredients") give an MP4 (720p/1080p/4k). Text plus images give images (1K/2K/4K).
- Current model names (Gemini API): **Veo 3.1** (standard), **Veo 3.1 Fast**, **Veo 3.1 Lite** (paid preview). Images: **Nano Banana 2.1 (`gemini-nano-banana-2.1`, GA 2026-10-06, now Google's recommended image model)**, Nano Banana 2 (= Gemini 3.1 Flash Image, deprecated 2026-05-28 with no shutdown date yet), Nano Banana 2 Lite, Nano Banana Pro (`gemini-3-pro-image`), and Nano Banana (`gemini-2.5-flash-image`, shutdown 2027-03-15). **Imagen 4 was shut down on 2026-08-17.**
- Official API: **yes**. Through the Gemini API (AI Studio key) and through Google Cloud's **Gemini Enterprise Agent Platform (formerly Vertex AI; renamed April 2026)**. Veo 3.1 / 3.1 Fast are GA there and 3.1 Lite is Preview. Regional availability for Singapore: UNVERIFIED.
- Consumer access: Gemini app (Google AI Pro and Ultra include Veo 3.1; Pro gets a limited Veo 3.1 Lite trial). Flow (Pro 1,000 Flow credits; Ultra 10,000 or 25,000). Whether Pro is offered in Singapore was not stated on the page found: UNVERIFIED.
- Auth: Gemini API key (AI Studio) or Google Cloud OAuth / service account (Agent Platform).
- Pricing model: Pay per use, and Veo is **paid tier only** (a billing account is needed). Gemini API page as of 2026-10-12: Veo 3.1 $0.40/s (720p/1080p), $0.60/s (4k). Veo 3.1 Fast $0.10/s (720p), $0.12/s (1080p), $0.30/s (4k). Veo 3.1 Lite $0.05/s (720p), $0.08/s (1080p). Nano Banana Pro $0.134 per 1K/2K image and $0.24 per 4K image (batch costs half). Nano Banana 2 about $0.067 per 1K image. Nano Banana 2.1 is listed lower (exact figure UNVERIFIED). The Agent Platform page prices some Veo tiers per video rather than per second.
- Limits: Veo durations of 4, 6 or 8 s (Lite launch post). Rate limits by tier: UNVERIFIED.
- Commercial use / licensing: Google "won't claim ownership" of generated content and may generate similar content for others (Gemini API Additional Terms; Flow help). Commercial use is "governed by the Terms of Service". Cloud Service Specific Terms bar using output to build competing models. On paid Gemini API use, prompts and outputs are not used to improve Google products; on the free tier they may be, and human reviewers may read them.
- AI disclosure / consent needs: **Every Veo, Nano Banana and Gemini-app output carries an invisible SynthID watermark that cannot be removed in settings.** Flow has a "Visible watermarking" toggle; the visible mark is forced in India, South Korea and Vietnam. Gemini can check whether media was made by Google AI. The Generative AI Prohibited Use Policy applies.
- Sample workflow for an SME ad: Nano Banana 2.1 makes the hero product image, Veo 3.1 Fast turns it into an 8 s 1080p image-to-video with audio (about $0.96 at $0.12/s), and the clip is exported to Canva or ffmpeg for logo and captions.
- Status for FusionTech: **Not connected** (needs a Google billing account → paid). Status: DOCUMENTED. Use through Higgsfield only if/when available there.
- Verified: 2026-10-12 — https://ai.google.dev/gemini-api/docs/pricing · https://ai.google.dev/gemini-api/docs/deprecations · https://ai.google.dev/gemini-api/docs/changelog · https://ai.google.dev/gemini-api/docs/models · https://blog.google/innovation-and-ai/technology/ai/veo-3-1-lite/ · https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/veo/3-1-generate · https://docs.cloud.google.com/gemini-enterprise-agent-platform/vertex-ai-name-changes · https://gemini.google/subscriptions/ · https://support.google.com/flow/answer/16353333 · https://deepmind.google/models/synthid/ · https://cloud.google.com/terms/service-terms

### Seedance (ByteDance)
- Purpose: ByteDance's video generation models (Seedance 2.5 / 2.0 / 2.0 Mini / 1.0 Pro) for text-to-video, image-to-video and multimodal reference-to-video.
- Best for: Multi-shot, consistent-character short video at low cost per clip.
- NOT good for: **Videos built from real people's faces.** These are blocked by default, and API access needs real-person verification and likeness authorisation. Not usable from the US (BytePlus is not available in the US).
- Inputs → outputs: Text, images or video references give MP4 clips (Dreamina/CapCut clips are capped at 15 s per the CapCut newsroom; the API via Higgsfield goes up to 30 s for 2.5).
- Official access: (1) **BytePlus ModelArk**, ByteDance's official enterprise API (Seedance 2.0 and "Dreamina-seedance-2.5"). BytePlus notes the Seedance/Seedream visual models "are not currently available to all teams", so you may need to contact BytePlus. (2) **Dreamina** (dreamina.capcut.com), the official consumer web app with a free daily-credit tier. (3) **CapCut**, a phased rollout to paid users in some countries (newsroom, April 2026).
- Official API: **yes** (BytePlus ModelArk).
- Auth: ModelArk API key from the BytePlus console (exact mechanism UNVERIFIED).
- Pricing model: Token-based pay-as-you-go plus prepaid bundles. The BytePlus page (updated 2026-08-07) shows Seedance 2.5 at $6.4/M tokens with video input and $10.7/M tokens without. Bundles: $32 for 5M, $64 for 10M, $640 for 100M tokens, valid for 3 months. Seedance 1.0 Pro is $2.5/M tokens. BytePlus blog: free quota of 2M tokens per account (shared between the Experience Center and the API).
- Limits: Real-face inputs are restricted. Model availability depends on team or region.
- Commercial use / licensing: BytePlus does not claim ownership of output but takes a licence to use inputs and outputs for service improvement. **The ModelArk *Playground* terms are non-commercial and forbid publishing outputs.** API commercial terms sit in "Specific Terms for the BytePlus Video Generation Model Services", whose body could not be read: UNVERIFIED. The Dreamina/CapCut ToS was not found: UNVERIFIED.
- AI disclosure / consent needs: The BytePlus GenAI Acceptable Use Policy requires AI content to be labelled and forbids using a person's likeness without consent. API integrators must keep their own real-person authorisation libraries.
- Sample workflow for an SME ad: A product image plus prompt goes to ModelArk Seedance 2.5 image-to-video (no human faces), giving a 9:16 clip that goes into the edit. Alternatively, call it through Higgsfield's API to avoid separate BytePlus onboarding.
- Status for FusionTech: **Not connected directly**; available through Higgsfield. Status: DOCUMENTED. BytePlus Playground terms are non-commercial (UNVERIFIED wording) → use via Higgsfield.
- Verified: 2026-10-12 — https://www.byteplus.com/en/product/seedance · https://www.byteplus.com/en/product/modelark · https://docs.byteplus.com/en/docs/ModelArk/1587798 · https://docs.byteplus.com/en/docs/ModelArk/2608626 · https://docs.byteplus.com/en/docs/legal/tos_modelark_playground · https://docs.byteplus.com/en/docs/legal/acceptable_use_policy_byteplus_genai · https://www.byteplus.com/en/blog/dreamina-seedance2-0 · https://www.capcut.com/newsroom/dreamina-seedance-2 · https://dreamina.capcut.com/tools/seedance-2-0

### Kling (Kuaishou)
- Purpose: Text-to-video, image-to-video, Omni (mixed references), **Motion Control** (apply a reference video's motion to a character image), lip sync, and text/image-to-image.
- Best for: Realistic human motion, product animation from a first or last frame, and recreating trending dance or motion with your own character.
- NOT good for: Small API budgets (the API's entry package is $700). Commercial use on the free tier.
- Inputs → outputs: Text, images (first/last frame, up to 3 "elements") and reference video/audio give MP4. Output URLs are **deleted after 30 days**, so save them right away.
- Official API: **yes**. Kling AI API (kling.ai/dev) offers `/text-to-video/kling-3.0`, `/image-to-video/kling-3.0`, `/omni-video/kling-3.0-omni`, Motion Control (Kling 3.0 MC added July 2026), `/v1/videos/advanced-lip-sync`, and webhooks with signatures (Aug 2026).
- Auth: An API key in the Authorization header (the newer method), or AccessKey plus SecretKey used to sign a JWT (HS256, 30-min expiry) sent as `Authorization: Bearer <token>`.
- Pricing model: **The API uses prepaid resource packages, separate from app memberships.** Video: 1 unit = $0.14 list; smallest package $700 for 5,000 units; larger tiers 10% off. 180-day validity, no rollover, 20 concurrent jobs. Images: 1 unit = $0.0035; entry package $350 for 100k units. Motion Control on Kling 3.0: 0.9 units/s at 720p ($0.126) and 1.2 units/s at 1080p ($0.168). A trial package exists for integration testing. App memberships (membership page, promos vary): Free $0 (watermark, **not for commercial use**), Standard about $6.99–10/mo (660 credits), Pro $25.99, Premier $64.99, Ultra $127.99 first month then $159.99. All paid tiers remove the watermark and include commercial use.
- Limits: 20 concurrent jobs (video packages), 9 (image packages). Image file size is listed as 10 MB in the Omni guide and 50 MB in the API doc.
- Commercial use / licensing: Paid memberships include commercial use; the free tier does not. Exact licence wording for API output: UNVERIFIED.
- AI disclosure / consent needs: The official consent rules for using a real person in Motion Control were not found: UNVERIFIED. Platform AI-label rules still apply.
- Sample workflow for an SME ad: The client's mascot or product image plus a trending motion clip go through Motion Control (1080p, 10 s, about $1.68), then the clip is captioned and posted.
- Status for FusionTech: **Connected in this session** (Kling MCP). Credits per job → cost card + Ryan's yes. The Kling API package is a separate large prepaid purchase (not needed: use the MCP/app). Status: CONNECTED.
- Verified: 2026-10-12 — https://kling.ai/dev/pricing · https://kling.ai/document-api/pricing/base/video · https://kling.ai/document-api/updates/api · https://kling.ai/document-api/api/get-started/authentication · https://kling.ai/document-api/api/video/3-0-omni/image-to-video · https://kling.ai/document-api/api/video/lip-sync · https://kling.ai/app/membership/membership-plan

### ElevenLabs
- Purpose: Text-to-speech (v4/v3 models), voice design from a text prompt, voice cloning (instant and professional), dubbing (Dubbing v2, 90+ languages), sound effects, music, and voice agents.
- Best for: Voice-overs for ads in many languages, custom brand voices, SFX, and dubbing a client video.
- NOT good for: Cloning someone else's voice as a professional clone (not allowed even with their consent). Commercial work on the free plan.
- Inputs → outputs: Text gives MP3/WAV speech. A prompt gives voice previews. Text gives a sound effect (0.1–30 s). Video or audio gives a dubbed version.
- Official API: **yes**. Endpoints include `POST /v1/text-to-speech/{voice_id}`, `POST /v1/text-to-voice/design` (the older create-previews route is deprecated), `POST /v1/sound-generation`, and the Dubbing v2 project API (2026-08-10). "Most of our API endpoints are available for all plans, including the free plan."
- Auth: API key (`xi-api-key` header; header name per ElevenLabs docs, not re-checked: UNVERIFIED).
- Pricing model: Subscription with a shared credit pool, or pay-as-you-go. Pricing page: Free $0 (10k credits), Starter $6/mo, Creator $22/mo, Pro $99/mo, Scale $299/mo, Business $990/mo. **PAYG (prepaid top-ups) replaced overage billing for new self-serve customers.** The API pricing page lists TTS per 1K characters (v4 $0.022, v4 Turbo $0.011); older pages show higher figures. API calls get discounted credit rates on some models.
- Limits: Depend on plan (concurrency and character limits: UNVERIFIED in detail).
- Commercial use / licensing: **The free plan has no commercial licence**, and free output must credit "elevenlabs.io" or "11.ai" in the title. **All paid plans (Starter and up) include a commercial licence**, except for Beta services. API output from ElevenLabs models is commercially licensed. **Music needs an additional licence for advertising, film, TV and games** (Music Terms).
- AI disclosure / consent needs: **Professional Voice Clone: your own voice only**, checked by reading a captcha aloud within 10 s. Instant Voice Clone: you must confirm you hold the rights before each upload. "No-go voices" (celebrities and high-risk public figures) are blocked. Breaches can lead to account bans.
- Sample workflow for an SME ad: Voice Design gives a "warm Singaporean female, 30s" brand voice. TTS reads the ad script in English and Mandarin, sound-generation adds a whoosh, and everything is mixed under the video.
- Status for FusionTech: **Connected in this session** (ElevenLabs MCP). Check the plan allows commercial use before any ad voiceover; voice cloning only of Ryan's own voice. Status: CONNECTED.
- Verified: 2026-10-12 — https://elevenlabs.io/pricing · https://elevenlabs.io/pricing/api · https://elevenlabs.io/docs/overview/administration/pay-as-you-go · https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform · https://elevenlabs.io/music-terms · https://help.elevenlabs.io/hc/en-us/articles/36842751624209-Can-I-create-a-Professional-Voice-Clone-of-someone-else-s-voice · https://help.elevenlabs.io/hc/en-us/articles/22584327690897-What-are-No-Go-Voices · https://elevenlabs.io/docs/api-reference/text-to-speech/convert · https://elevenlabs.io/docs/api-reference/text-to-voice/design · https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert · https://elevenlabs.io/docs/changelog/2026/8/10

### Canva
- Purpose: Design tool. Developer platform now named the **Canva Developers SDK**: "Canva REST APIs" (formerly Connect APIs, "Canva for your platform") and "Apps inside Canva" (formerly Apps SDK, iframe apps in the editor).
- Best for: On-brand static and short-video ad variants from **Brand Templates plus Autofill** (data into placeholders), resizing, and exporting finals.
- NOT good for: Generative video. Logos or trademarks built from Canva library content (forbidden). Mobile, SPA or browser-extension integrations (the REST APIs need a web backend).
- Inputs → outputs: Brand template plus data (text and image assets) gives a design, which exports as PDF/JPG/PNG/GIF/PPTX/MP4.
- Official API: **yes**. REST APIs: create design (preset or custom size), upload asset, brand templates (list, get dataset), **autofill job** (async, poll), export job, comments, folders. There is an OpenAPI spec and an official n8n Canva node (Canva dev blog).
- What can be automated: Template autofill, design creation, asset upload, export, folder moves, and comments. Editing arbitrary design elements through REST: UNVERIFIED.
- Auth: OAuth 2.0 Authorization Code with PKCE. Your Canva account needs MFA turned on to create an integration. Personal-use integrations need no review; public integrations need review with scope justification, and preview APIs fail review.
- Pricing model: There is no separate API fee (UNVERIFIED). Access follows the user's Canva plan. **Brand Templates need Pro, Teams or Enterprise.** **Autofill: the changelog of 2026-09-21 opened it to Pro and Teams (previously Enterprise only)**, but a community thread dated 2026-09-23 titled "Autofill API now gated to Enterprise with a limited trial…" suggests it was narrowed again. **Treat Autofill-on-Pro as UNVERIFIED until checked live.**
- Limits: Per-user, per-endpoint rate limits (for example, 20 or 100 req/min on comment endpoints). Data Autofill supports up to 150 fields. Canva says autofill usage limits "will be introduced in the future".
- Commercial use / licensing: Free and Pro content may be used commercially (ads, social, packaging). A Pro Content licence covers one design. The most restrictive licence in a design applies to the whole design. **No library content in trademarks or logos** (fonts and simple shapes excepted). Templates can be sold only as Canva template links. Images from Canva's AI features fall under the AI Product Terms, not the content licence.
- AI disclosure / consent needs: Canva AI Product Terms apply (details UNVERIFIED). Platform AI-label rules still apply.
- Sample workflow for an SME ad: The client's Brand Template (headline, price-free offer line, product photo slot) receives 10 headline variants from John through the Autofill API, and each design is exported to MP4/PNG for Meta and TikTok.
- Status for FusionTech: **Connected in this session** (Canva MCP). Status: CONNECTED (Brand Templates need Pro/Teams; check Ryan's plan before relying on them).
- Verified: 2026-10-12 — https://www.canva.dev/docs/connect/ · https://www.canva.dev/docs/connect/autofill-guide/ · https://www.canva.dev/docs/connect/api-reference/autofills/create-design-autofill-job/ · https://www.canva.dev/docs/connect/changelog/ · https://community.canva.dev/t/autofill-apis-are-now-available-on-canva-pro-and-above/8922 · https://www.canva.dev/docs/connect/creating-integrations/ · https://www.canva.dev/docs/connect/api-reference/brand-templates/ · https://www.canva.com/policies/content-license-agreement/ · https://www.canva.com/licensing-explained/

### CapCut (and ffmpeg as the open-source alternative)
- Purpose: CapCut is ByteDance's consumer and pro video editor (mobile, desktop, web) with auto-captions, templates, and Seedance-powered AI video for paid users in some markets. ffmpeg is an open-source command-line tool for cutting, cropping, resizing, burning captions and concatenating.
- Best for: CapCut suits manual polishing by a human editor. ffmpeg suits **automated** crops (9:16, 1:1, 4:5), burned-in subtitles (`subtitles` filter with libass), text overlays (`drawtext`), logo watermark and joining clips, all runnable on a server or in n8n.
- NOT good for: CapCut cannot be automated from n8n: **no public developer API was found**. ffmpeg gives no generative AI and no auto-transcription by itself (pair it with a speech-to-text model).
- Inputs → outputs: CapCut takes video/audio/images and gives an edited MP4. ffmpeg takes any media file plus filters and gives a transformed file.
- Official API: **CapCut: no (public).** The CapCut ToS says the platform includes an "SDK" and "API", but no public developer portal or docs were found; capcut.com/explore "API" pages are SEO templates, not docs. Treat it as no public API (UNVERIFIED whether partner access exists). **ffmpeg: not an API; free CLI and libraries.**
- Auth: CapCut uses a user account. ffmpeg needs none.
- Pricing model: CapCut is freemium with Pro subscriptions (prices UNVERIFIED). ffmpeg is free.
- Limits: CapCut: Seedance clips are limited to 15 s, and real-face image/video inputs were restricted at launch. ffmpeg is limited only by server CPU.
- Commercial use / licensing: CapCut ToS and template/music licences apply (detailed commercial terms UNVERIFIED; CapCut library music in ads is UNVERIFIED). **ffmpeg is LGPL 2.1+ by default. Building with `--enable-gpl` makes the whole build GPL, and `--enable-nonfree` makes it non-redistributable.** Running it on our own server to process client files is not distribution (general LGPL reading, not legal advice).
- AI disclosure / consent needs: CapCut AI features have no published label rule found (UNVERIFIED). Platform rules apply.
- Sample workflow for an SME ad: n8n receives the Veo/Kling clip, ffmpeg crops it to 9:16, burns in an SRT made by a transcription step, overlays the logo, and exports 3 aspect ratios.
- Status for FusionTech: **CapCut: no API** (manual use only). **ffmpeg** (free, open source) can do crops/captions in code. Status: DOCUMENTED.
- Verified: 2026-10-12 — https://www.capcut.com/clause/terms-of-service · https://www.capcut.com/newsroom/dreamina-seedance-2 · https://www.ffmpeg.org/legal.html · https://ffmpeg.org/ffmpeg-filters.html

### Metricool
- Purpose: Social media scheduling, analytics and reporting, plus an ads module (Meta Ads, Google Ads, TikTok Ads).
- Best for: One dashboard and automated PDF/PPT reports for clients across organic and paid. Scheduling posts.
- NOT good for: **Creating or pausing ads programmatically.** No API endpoint for this was found, the MCP explicitly excludes ad campaign management, and campaign creation in the web UI asks for an emailed 8-digit 2FA code. TikTok ad creation is not possible in Metricool even in the UI (monitoring only).
- Inputs → outputs: Connected social and ad accounts give metrics, reports and scheduled posts.
- Ad metrics reported (help centre and blog): **Meta Ads**: impressions, reach, clicks, spend, CPM, CPC, CTR, conversion value, ROAS (pulled live from Meta's API). **Google Ads**: impressions, spend, clicks, conversions, CPM, CPC, CTR, conversion value, keyword breakdown. **TikTok Ads**: impressions, cost, clicks, conversions, CPM, CPC, CTR, per-campaign table.
- Official API: **partial**. **The REST API is only on the Advanced and Custom plans.** Docs at app.metricool.com/resources/apidocs. It is mainly analytics, data export and post scheduling. The MCP works on all plans including Free and is **read-only for ads** ("access to their analytics only"; "Managing Ads campaigns is not available through the MCP").
- Auth: Token from Account Settings > API, sent in the `X-Mc-Auth` header, plus `userId` and `blogId` parameters.
- Pricing model: Subscription. Pricing page: Advanced from $53/mo billed annually or $67/mo billed monthly (up to 15 brands); 25 brands $85/$107; 50 brands $159/$210. The Advanced Analytics add-on is extra.
- Limits: Brand count by tier. API rate limits: UNVERIFIED.
- Commercial use / licensing: Standard SaaS; agency use is supported (multi-brand). Terms not reviewed: UNVERIFIED.
- AI disclosure / consent needs: Not applicable. Client must connect their ad accounts (OAuth inside Metricool).
- Sample workflow for an SME ad: A weekly n8n job calls the Metricool API (Advanced plan) for Meta and TikTok ad metrics, then John sends the client a WhatsApp summary of CTR, CPC and ROAS. Pausing a poor ad is done by a person in Ads Manager or Metricool's UI.
- Status for FusionTech: **Connected in this session** (Metricool MCP, read-only). PRODUCTION VERIFIED for reading brand 6656122 (2026-10-12). No ad accounts connected yet. Cannot create/pause ads.
- Verified: 2026-10-12 — https://help.metricool.com/plans-add-ons-and-api-access-explained-xux1u · https://help.metricool.com/mcp-vs-api-access-what-is-the-difference-5y3ib · https://help.metricool.com/basic-guide-for-api-integration-r97af · https://help.metricool.com/en/article/meta-ads-metrics-l7615/ · https://help.metricool.com/en/article/create-ads-campaigns-from-metricool-je5673/ · https://metricool.com/ad-campaigns-metricool/ · https://metricool.com/pricing/

### Meta Ad Library
- Purpose: Meta's public transparency database of ads on Facebook, Instagram, Messenger and Audience Network.
- Best for: Competitor research: seeing every **currently active** ad of any Page (creative, copy, CTA, start date, platforms).
- NOT good for: Spend, targeting or performance of normal commercial ads outside the EU/UK (not shown). Bulk scraping (forbidden).
- Inputs → outputs: Search by advertiser, keyword or country gives the ad cards.
- What's public: **All active ads** (no login needed): Library ID, Page, delivery dates, platforms, creative, copy, CTA; no targeting or spend. **Social issue, election and political ads**: active and inactive, kept for 7 years, with spend range, impressions range, demographics and "paid for by". **Ads delivered to the EU/UK** (all types): shown while active and archived 1 year after the last impression. EU entries add estimated EU reach, targeting and reach demographics, and advertiser/payer ("beneficiary") info.
- Official API: **partial**. The Ad Library API covers **only** (a) social issue/election/political ads worldwide (past 7 years) and (b) **any** ad delivered to the UK/EU in the past year. Ordinary commercial ads that never reached the EU/UK are **not** returned by the API, so for Singapore-only competitors the web UI is the only official route.
- Auth: Confirm your identity and location at facebook.com/ID (can take days), create a Meta for Developers account (accept Platform Policy), then use a user access token.
- Pricing model: Free.
- Limits: API scope as above. Since Oct 2025 Meta no longer runs political, electoral or social issue ads in the EU (TTPA), so the EU political archive is mostly historical from that date.
- Commercial use / licensing: **Automated collection or scraping needs Meta's express written permission** (Automated Data Collection Terms; Meta ToS). Ad creative from the archive is for analysis only, subject to Meta's data storage terms. Meta ad data may not be used to build user profiles or be passed to ad networks or data brokers. Do not copy competitor creative.
- AI disclosure / consent needs: Not applicable (research tool).
- Sample workflow for an SME ad: Before a client kickoff, a person (or an agent using the web UI, not scraping) reviews the top 3 competitors' active ads, and the hooks are summarised into the creative brief.
- Status for FusionTech: Public web pages only (no account). Singapore-only commercial ads are NOT in the API → human opens the web UI. Status: DOCUMENTED.
- Verified: 2026-10-12 — https://www.facebook.com/ads/library/api · https://www.facebook.com/help/259468828226154 · https://transparency.meta.com/researchtools/ad-library-tools/ · https://www.facebook.com/legal/automated_data_collection_terms · https://transparency.meta.com/policies/ad-standards/SIEP-advertising/SIEP/ · https://about.fb.com/news/2025/07/ending-political-electoral-and-social-issue-advertising-in-the-eu/

### TikTok Creative Center (Top Ads, Trends, Commercial Music Library)
- Purpose: TikTok's free inspiration hub with Top Ads (high-performing authorised ads with performance data), trends (hashtags, songs, creators), Keyword Insights, Top Products, and the Commercial Music Library (CML).
- Best for: Finding winning ad formats and hooks by region and industry. Finding music **cleared for business use**.
- NOT good for: Downloading or reusing other brands' ads (Top Ads are watermarked and not downloadable). Using "trending sounds" from the general library in business posts or ads.
- Inputs → outputs: Filters (region, industry, objective, period) give example ads and metrics. A search gives CML tracks.
- What's public: The Creative Center is reachable without login, but **logged out you see only 5 Top Ads**; the full Top Ads and trends need a TikTok Ads Manager login. All Top Ads are authorised by their advertisers in Ads Manager.
- Official API: **no** public Creative Center API found (UNVERIFIED). (TikTok's separate Commercial Content API on developers.tiktok.com is a research/transparency product; its scope was not checked.)
- Auth: TikTok for Business login for full access.
- Pricing model: Free.
- Limits: 5 Top Ads when logged out. No downloads.
- Commercial use / licensing: **The CML (about 1M tracks per the 2026 help article; an older post says 600k+) is free and cleared for organic posts, ads and branded content by businesses.** TikTok's help centre says businesses **cannot** use the general music library for commercial content, and promoting a business with general sounds from a personal account risks copyright infringement. Business accounts see only Commercial Sounds. **Most "trending sounds" are therefore off-limits for client ads unless they are in the CML.**
- AI disclosure / consent needs: TikTok requires labels on realistic AI-generated content (creator toggle or caption/sticker; TikTok may auto-label C2PA content). In **ads**, undisclosed AIGC is rejected or restricted. AI likeness of people without permission is banned even with a label.
- Sample workflow for an SME ad: Filter Top Ads by Singapore and F&B, note the 3 best hooks, pick a CML track that matches, and brief Kling or Veo with the format.
- Status for FusionTech: Public web pages only. Trending sounds are NOT cleared for business use; only the Commercial Music Library. Status: DOCUMENTED.
- Verified: 2026-10-12 — https://ads.tiktok.com/help/article/creative-center · https://ads.tiktok.com/resources/help/article/top-ads · https://ads.tiktok.com/help/article/how-to-use-the-top-ads-dashboard · https://ads.tiktok.com/help/article/commercial-music-library · https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library · https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content · https://www.tiktok.com/community-guidelines/en/integrity-authenticity

### Google Ads Transparency Center
- Purpose: Google's public directory of advertisers and their ads across Search, YouTube, Display, Maps and Play (adstransparency.google.com).
- Best for: Seeing every ad a competitor (or their website domain) runs on Google, with format and last-shown date, filtered by region and date.
- NOT good for: Spend or performance data on commercial ads. Targeting data outside certain regions.
- Inputs → outputs: Advertiser or website name plus region and date filters give the ad list and advertiser details.
- What's public: For each advertiser: name, location, the paying entity (payer name can differ from the advertiser since 2025), "verified" or "unverified" badge, and ads served over a period. For each ad: format and last date shown. In some countries/regions (EU/EEA): targeting info, total recipients and subject-matter labels. Political ads have a separate Political Ads Transparency Report, also available as a free public BigQuery dataset.
- Official API: **partial**. Google offers API access to Transparency Center data about **ads served in the EEA**, under the Ads Transparency Center terms. Regulators may get wider access. There is no general public API for non-EEA commercial ads (UNVERIFIED beyond these help pages).
- Auth: None for the web UI. API access per those terms (process UNVERIFIED).
- Pricing model: Free. BigQuery political dataset: first 1 TB of queries per month free.
- Limits: As above.
- Commercial use / licensing: Ads Transparency Center terms of service (text not reviewed: UNVERIFIED).
- AI disclosure / consent needs: Not applicable.
- Sample workflow for an SME ad: Look up the competitor's domain, list their active Search and YouTube ads in Singapore, and pull headline patterns into the brief.
- Status for FusionTech: Public web pages only. Status: DOCUMENTED.
- Verified: 2026-10-12 — https://adstransparency.google.com · https://support.google.com/adspolicy/answer/13733850 · https://support.google.com/adspolicy/answer/9703665 · https://support.google.com/adspolicy/answer/16189141 · https://blog.google/innovation-and-ai/technology/ads/announcing-the-launch-of-the-new-ads-transparency-center/ · https://cloud.google.com/blog/topics/developers-practitioners/how-get-started-political-ads-transparency-report-dataset

### Meta Marketing API / TikTok API for Business / Google Ads API
#### Meta Marketing API
- Purpose: Programmatic ads on Facebook and Instagram: create and manage campaigns, ad sets and ads, and read insights.
- Best for: Automated reporting (Insights API) and, once approved, rule-based pausing.
- NOT good for: Quick start for client accounts (needs App Review plus Business Verification).
- Inputs → outputs: Campaign, ad set and ad objects plus creatives give live ads. Insights queries give metrics.
- Official API: **yes**. **Reading insights** uses the `ads_read` permission (insights edge on account, campaign, ad set and ad). **Creating, editing and pausing** uses `ads_management` ("programmatically create campaigns, manage ads or fetch ad metrics"). Setting status=PAUSED on create was not found in search: UNVERIFIED as a quote, though it falls under ads_management.
- Auth: Meta app plus Facebook Login for Business, giving user or system-user access tokens. Apps with the higher access tier get long-lived tokens.
- What's needed: Development access by default (low rate limits; only your own ad accounts). **The higher tier needs App Review for `ads_management` / Ads Management Standard Access plus Business Verification** ("Business Verification is required for all apps making requests for Advanced Access"). App Review needs a screencast and a reason you manage ads for other businesses. **Rename:** Meta's rate-limiting doc now calls Standard Access **"Limited Access"** and Advanced Access **"Full Access"**, and the Full Access threshold dropped from 1,500 to 500 API calls in 15 days.
- Pricing model: API is free; ad spend is paid by the advertiser.
- Limits: Rate limits by tier (ads_management dev tier: 300/hr per account vs 100,000 in the higher tier, plus a per-active-ad component).
- Commercial use / AI disclosure: Meta Platform Terms apply. **AI:** political and social issue ads must self-disclose photoreal AI. **Since 2026-06-01 Meta automatically detects ad media made with third-party gen-AI and adds an "AI Info" label in "About this ad"** (no advertiser action needed).
- Sample workflow for an SME ad: n8n runs Insights daily into a sheet, and John reports to the client. Pausing stays a human decision until App Review passes and Ryan approves the automation.
- Verified: 2026-10-12 — https://developers.facebook.com/docs/permissions/ · https://developers.facebook.com/documentation/ads-commerce/marketing-api/overview/rate-limiting · https://developers.facebook.com/docs/marketing-api/insights/ · https://transparency.meta.com/policies/ad-standards/SIEP-advertising/SIEP/ · https://about.fb.com/news/2025/02/gen-ai-transparency-metas-ads-products/

#### TikTok API for Business (Marketing API v1.3)
- Purpose: Programmatic TikTok ads: campaigns, ad groups, ads, reporting, audiences and creatives.
- Official API: **yes**. `/campaign/create/`, `/adgroup/create/`, update endpoints, **"update operation status" endpoints for campaigns and ad groups (pausing is UNVERIFIED as a worked example but these are the documented mechanism)**, Get campaigns, ad groups and ads, and Reporting (sync and async basic reports; GMV Max has its own). There is also an official **TikTok for Business MCP server**.
- Auth / what's needed: Register a developer profile and **wait for approval** before creating an app. The app application describes use cases and advertisers; **review takes about 2–3 business days**; maximum 5 apps per developer. Choose permission scopes (Ad Account Management, Ads Management, Measurement, Audience Management, and others). The advertiser authorises through OAuth, giving an access token. Some features need allowlisting. **From 2026-03-20, a "TikTok Accounts" scope needs a separate Accounts API Access Application Form.**
- Pricing model: API is free; ad spend is paid by the advertiser.
- Commercial use / AI disclosure: TikTok ads policy requires AIGC labels or disclaimers; undisclosed AI is rejected or restricted.
- Sample workflow for an SME ad: A nightly n8n report pull, with an agent flagging ad groups with CPC above target to Ryan.
- Verified: 2026-10-12 — https://business-api.tiktok.com/portal/docs/marketing-api-get-started/v1.3 · https://business-api.tiktok.com/portal/docs/create-a-developer-app/v1.3 · https://business-api.tiktok.com/portal/docs/permission-scope/v1.3 · https://business-api.tiktok.com/portal/docs/create-an-ad-group/v1.3 · https://business-api.tiktok.com/portal/docs/basic-reports/v1.3 · https://business-api.tiktok.com/portal/docs/tiktok-ads-mcp-server/v1.3

#### Google Ads API
- Purpose: Programmatic Google Ads: reporting with GAQL (search/searchStream) and mutating campaigns, ad groups and ads (pause, enable, create).
- Official API: **yes**. Reading uses GAQL queries; writing uses mutate with an update mask (official "Update campaign" and "Pause ad" samples set status PAUSED). Some video campaign types cannot be changed through the API. **The official Google Ads MCP server is read-only.**
- Auth / what's needed: A Google Cloud project with the Google Ads API enabled, OAuth 2.0, and a manager account (`login-customer-id` header when acting through an MCC). **Developer tokens were retired on 2026-09-09; access levels now belong to the Google Cloud project.** Ladder: **Test** (test accounts only, 15k ops/day) → **Explorer** (production, 2,880 ops/day, some features restricted) → **Basic** (15k ops/day; **Google Cloud brand verification required**) → **Standard** (unlimited; manual review about 10 business days; Required Minimum Functionality applies). Apply from the Google Ads API Overview page in Cloud Console. **Known issue:** some projects upgraded after 2026-09-09 get AUTHORIZATION_ERROR on production calls.
- Pricing model: API is free; ad spend is paid by the advertiser.
- Sample workflow for an SME ad: Explorer access is enough for a weekly GAQL report on a few SME accounts. Pausing via mutate only after Ryan approves.
- Verified: 2026-10-12 — https://developers.google.com/google-ads/api/docs/api-policy/access-levels · https://developers.google.com/google-ads/api/docs/api-policy/developer-token · https://developers.google.com/google-ads/api/docs/concepts/no-developer-token · https://developers.google.com/google-ads/api/samples/update-campaign · https://developers.google.com/google-ads/api/samples/pause-ad · https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server · https://developers.google.com/google-ads/api/docs/campaigns/overview

- Status for FusionTech (all three): **Not connected.** Status: PLANNED (platform phase). Needs app review / business verification (Meta), developer approval (TikTok), Google Cloud project access level (Google). Nothing is applied for without Ryan's yes (cost card).

### Short entries: Runway, OpenAI Sora, Pika, Midjourney
- **Runway**: **Official API: yes** (dev.runwayml.com). Prepaid credits at $0.01 each, minimum $10. The API docs list gen4_turbo at 5 credits/s; the model list shows Gen-4 Turbo $0.12/s and Gen-4.5 $0.28/s (pages disagree). Monthly spend cap by usage tier. **Commercial use:** Runway's help centre says outputs carry no non-commercial restriction and you own them (consumer product; API-specific terms UNVERIFIED). Free consumer plan: 125 one-time credits with watermark. Verified 2026-10-12 — https://docs.dev.runwayml.com/guides/pricing/ · https://docs.dev.runwayml.com/guides/models/ · https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights · https://docs.dev.runwayml.com/usage/tiers/
- **OpenAI Sora**: **Discontinued.** The Sora web and app closed on **2026-04-26**, and the **Sora API (Videos API, sora-2, sora-2-pro) shut down on 2026-09-24 with no replacement model** (OpenAI deprecations page and help centre). **Do not plan around Sora.** Verified 2026-10-12 — https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation · https://developers.openai.com/api/docs/deprecations
- **Pika**: **Official API: yes** (dev.pika.art), now a multi-model API (Pika plus third-party models such as Wan and Seedance). Usage-based per-model pricing; an optional $10/mo membership unlocks wholesale rates; enterprise discounts up to 70%. **All API outputs are licensed for commercial use** under the Pika API agreement. Consumer app plans are separate (commercial use on higher tiers). Verified 2026-10-12 — https://dev.pika.art/ · https://dev.pika.art/pricing · https://pika.art/pricing
- **Midjourney**: **Official API: no.** The Community Guidelines say Midjourney does not provide an API "with a few rare exceptions" and **automating the service is prohibited**, so it cannot be used inside n8n. Commercial use is allowed for subscribers. **Companies with more than $1M/yr gross revenue must use Pro or Mega.** Stealth (private) mode is Pro and Mega only. Verified 2026-10-12 — https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service · https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans · https://docs.midjourney.com/hc/en-us/articles/32013696484109-Community-Guidelines
- Status for FusionTech: Not connected. Sora is reported discontinued (see notes). Status: DOCUMENTED.

---

## Things that surprised me / changed recently
1. **OpenAI Sora is gone.** The app ended on 2026-04-26 and the API on 2026-09-24, with no replacement. (help.openai.com/en/articles/20001152 · developers.openai.com/api/docs/deprecations)
2. **Google Ads developer tokens were retired on 2026-09-09.** Access levels (Test, Explorer, Basic, Standard) now sit on the Google Cloud project; Basic needs Cloud brand verification; some post-09-09 upgrades currently fail with AUTHORIZATION_ERROR. (developers.google.com/google-ads/api/docs/api-policy/developer-token)
3. **Imagen 4 was shut down on 2026-08-17. Nano Banana 2.1 went GA on 2026-10-06** and is now Google's recommended image model; Gemini 3.1 Flash Image (Nano Banana 2) is deprecated. (ai.google.dev/gemini-api/docs/deprecations · /changelog)
4. **Vertex AI is now "Gemini Enterprise Agent Platform"** (April 2026); the Vertex AI docs are no longer updated. (docs.cloud.google.com/gemini-enterprise-agent-platform/vertex-ai-name-changes)
5. **Meta renamed Marketing API tiers:** Standard became "Limited Access", Advanced became "Full Access", and the Full Access threshold was cut to 500 calls in 15 days. **Meta now auto-labels ads made with third-party gen-AI** ("AI Info") from 2026-06-01. (developers.facebook.com/documentation/ads-commerce/marketing-api/overview/rate-limiting · transparency.meta.com SIEP policy)
6. **The Meta Ad Library API does not return ordinary commercial ads unless they reached the EU/UK.** For Singapore-only competitors, use the web UI. Meta stopped all political and social issue ads in the EU from Oct 2025. (facebook.com/ads/library/api · about.fb.com 2025/07)
7. **The Higgsfield website and API are separate products with separate billing**, and the API catalogue does not include every website model (Veo and Nano Banana not seen in the API). (docs.higgsfield.ai FAQ · help centre)
8. **HeyGen API is pay-as-you-go from $5 with no subscription**, but Digital Twins need a recorded consent video from the real person; only whitelisted Enterprise accounts can skip it. (help.heygen.com API pricing · developers.heygen.com/docs/avatar-consent)
9. **The Kling API starts at a $700 prepaid package** (180 days, no rollover), unlike the cheap app memberships, and the free app tier is non-commercial. (kling.ai/dev/pricing · membership page)
10. **ElevenLabs:** a professional voice clone can only be your **own** voice (not a client's, even with consent; they must make it on their account and share it). The free plan is non-commercial and needs attribution. Music needs an extra licence for ads. PAYG replaced overage billing. (help.elevenlabs.io · elevenlabs.io/music-terms · PAYG docs)
11. **Canva Autofill API access moved twice in one week:** opened to Pro and Teams on 2026-09-21, then a 2026-09-23 community thread says it was gated back to Enterprise with a limited trial. Check live before relying on it. (canva.dev/docs/connect/changelog · community.canva.dev)
12. **Metricool can't create or pause ads through its API or MCP.** The API needs the Advanced plan ($53/mo annual); the MCP is read-only for ads; TikTok ads are monitor-only. (help.metricool.com MCP vs API · ads help)
13. **Seedance via BytePlus blocks real human faces by default**, the ModelArk Playground terms are non-commercial, and BytePlus is not available in the US. (docs.byteplus.com ModelArk 2608626 · tos_modelark_playground · byteplus blog)
14. **TikTok trending sounds are generally not cleared for business use.** Only the Commercial Music Library is. Logged-out Creative Center visitors see just 5 Top Ads. (ads.tiktok.com help: commercial-music-library, creative-center)
15. **Midjourney still has no API and forbids automation**, so it cannot be wired into the agent stack. (docs.midjourney.com Community Guidelines)

---

## v5 additions (2026-10-14)

Checked 2026-10-14 for the ad-execution question ("who can launch, pause and budget our ads?"). Direct page opening was
blocked again (WebFetch had no DNS, curl denied, Firecrawl out of credits), so every fact comes from web-search results
limited to the vendor's own domain; the pages were not opened by us. Action-by-action status: [[11_Capability_Register]].
Comparison and recommendation: [[13_Provider_Evaluation]].

### Omneky
- Purpose: AI ad platform: generate image, video and avatar ads from a brand URL, score creative, then launch and manage campaigns on several ad networks.
- Best for: Fast on-brand ad creative plus a simple launch for **Ryan's own brand**; trying many creative variants.
- NOT good for: **Client work under the standard terms** (they forbid use "for the benefit of a third party"). Campaign control from n8n code (campaign actions are MCP-only; REST covers creative jobs only). Pinterest and X launches ("not available yet").
- Inputs → outputs: Brand URL / brand kit / product images in → image, video and avatar ads, creative scores, launched campaigns, insights out.
- Official API: **yes, two doors.** (1) **MCP** `https://mcp.omneky.com/mcp`, tools: `analyze_performance`, `generate_image_ad`, `generate_video_ad`, `generate_avatar_ad`, `score_creative`, `launch_campaign`, `get_brand_kit`, `list_creatives`, `get_campaign_insights`, `create_source_from_url`, `pause_or_scale`, `compare_channels`. Launch targets: Meta, Google, TikTok, LinkedIn, Reddit, OpenAI Ads. (2) **REST**: POST `/create_image_ad_async`, POST `/create_video_ad_async`, GET `/jobs/{job_id}` (or `callback_url`); 10 req/min; video 10–15 s. No campaign endpoints documented.
- Auth: MCP: OAuth sign-in with the Omneky account ("no API keys to manage"); token lifetime/renewal not stated (UNVERIFIED). REST: `X-API-Key` header, key from the Omneky Admin Dashboard.
- Pricing model: Subscription + credits. Lite US$29/mo (200 credits, 1 brand, 1 seat), Standard US$99 (1,000 credits, 3 brands, 3 seats; adds commercials, avatars, cloning), Pro US$249 (4,000 credits, 5 brands, 5 seats), Enterprise custom; yearly US$24/79/199. Top-ups 10 credits per US$1, never expire. **7-day trial on Lite/Standard/Pro that auto-converts to paid.** Analysis and launching "free" per the MCP page (a blog says insights cost 1–2 credits per ad: conflict). Generation costs credits by format and resolution (API docs: image 5 credits at 1K; other pages say 15: conflict). Launching on **Omneky's** ad account means paying ad budget + Omneky's fee up front. **Which plan includes MCP/API: not stated (UNVERIFIED).**
- Limits: REST 10 req/min per endpoint; a job is visible only to the key that made it. Budget changes follow each channel's rules.
- Commercial use / licensing: Terms: Customer will not "rent, sell, lease, transfer or otherwise make available the Services… or use it… for the benefit of a third party", nor use information from the Services "for the prospective economic advantage of any third party". White-label for agencies is marketed (omneky.com/agency) but not in the Terms → needs written permission/Enterprise. Omneky gets a sublicensable licence to Customer Materials to run the service, plus a promotional licence to work product. Omneky says it does not train on customer Input/Output (third-party AI providers may, under their terms). Privacy: synced campaign data kept 60 days after disconnect; logs 90 days.
- AI disclosure / consent needs: Avatar and cloned ads are AI-made people/structures: disclose per Meta/TikTok rules; never present as a real customer. Cloning a competitor ad's structure: copy the idea, never the creative.
- Sample workflow for an SME ad: (Ryan's own brand, after his yes) `create_source_from_url` on fusiontech site → `generate_image_ad` ×3 (cost card first) → `score_creative` → pick one → `launch_campaign` into Ryan's own Meta account, which waits for explicit confirmation.
- Status for FusionTech: **Not connected.** DOCUMENTED-UNVERIFIED. Ryan's preferred pilot; trial only on his yes (calendar reminder for day 6). Not for clients until Omneky answers in writing ([[13_Provider_Evaluation]] §4).
- Verified: 2026-10-14 (search results, vendor domain) — https://www.omneky.com/mcp · https://www.omneky.com/pricing-plans · https://www.omneky.com/api-docs · https://www.omneky.com/terms · https://www.omneky.com/privacy-policy · https://www.omneky.com/ad-launcher · https://www.omneky.com/agency · https://www.omneky.com/integrations/claude · https://www.omneky.com/newsroom/omneky-turns-ad-creative-into-open-ai-infrastructure · https://www.omneky.com/blog/how-to-use-omneky-to-2x-sales

### Supermetrics (MCP "Supermetrics Marketing Analytics")
- Purpose: Marketing data platform (174 sources) with an MCP server for AI chats; now also **campaign management** (create, edit, pause ads) from the chat.
- Best for: Cross-platform reporting, and **paused campaign drafts** on Google, Meta, TikTok, LinkedIn, Microsoft, ChatGPT Ads and Snapchat with human approval.
- NOT good for: Creative generation (only basic `asset_prompt`, cost unknown). Organic post scheduling. Giving clients their own login (not allowed under agency terms).
- Inputs → outputs: Ad account + plain-language request in → data tables; or campaign/ad set/ad objects written to the ad platform (created PAUSED), with campaign history.
- Official API: **yes**. MCP tools in Ryan's session (tool v1.18.3): `data_source_discovery`, `accounts_discovery`, `field_discovery`, `data_query`, `get_async_query_results`, `campaign_and_resource_get` (campaigns, health_check, forecast, reach_estimate, targeting_search, assets, audiences, history, approval_status…), `manage_campaign` (ds_id AW/FA/TIK/LIA/AC/CGPTA/SCM; "On create: always forced to PAUSED"; "Only set ENABLED on explicit user approval"), `creative_picker`, `marketing_utilities` (free UTM/link/page-speed/char-limit checks), `supermetrics_guide`. Separate Supermetrics Data API for code.
- Auth: OAuth login to Supermetrics; each ad platform connected inside Supermetrics; **write access switched on per ad account** in the Hub ("Write settings").
- Pricing model: Fixed-price subscription (no data-volume billing; only Studio AI credits are metered). Starter US$55/mo monthly or US$44/mo yearly; Growth US$222 or US$177 (search snippets of the pricing page; recheck). MCP "included in all Supermetrics plans that include Data API access". **Campaign management: early access, "free with an existing subscription"** (needs Claude or Gemini as an AI-chat destination). **14-day trial, no card** (mcp.supermetrics.com). Subscriptions **auto-renew**; fees may rise 8% a year on auto-renewal; no refund of remaining days.
- Limits: MCP row limits by tier (blog: Starter 50k, Growth 250k, Pro 500k). Snapchat campaign budget minimum 20/day in account currency. Some platforms create new ads live unless PAUSED is set explicitly.
- Commercial use / licensing: ToS 5.2.1: a "Marketing Agency Customer" may use the Service for its clients; reports may be shared with clients (5.2.2); **clients may not get direct access or login credentials** (5.2.5); pushing data into a client's warehouse needs a separate agreement (5.2.4).
- AI disclosure / consent needs: Not applicable to the tool; ad content rules still apply. Approval modes in the Hub: none / before going live / budget changes + going live / any change to a live campaign → **always pick the last one.**
- Sample workflow for an SME ad: Ryan links his Meta ad account → `manage_campaign` creates a PAUSED Leads campaign with one ad set and one ad → `campaign_and_resource_get` reads it back → Ryan approves → status ENABLED per level.
- Status for FusionTech: **CONNECTED** in Ryan's Claude session. **No ad account authenticated yet** → no ad action can run. Trial or paid: check in the Hub. Best candidate for the Layer 1 execution pilot ([[13_Provider_Evaluation]] §3).
- Verified: 2026-10-14 — https://supermetrics.com/pricing · https://supermetrics.com/products/supermetrics-mcp · https://supermetrics.com/terms-of-service · https://docs.supermetrics.com/docs/how-to-manage-ad-campaigns-with-ai-tools · https://docs.supermetrics.com/docs/how-to-manage-ad-campaigns-in-supermetrics-studio · https://docs.supermetrics.com/docs/about-subscription-renewal · https://supermetrics.com/blog/what-ai-agents-can-change-ad-accounts · https://supermetrics.com/blog/march-2026-product-updates · https://mcp.supermetrics.com/changelog · tool schemas + `supermetrics_guide` output in session

### Madgicx
- Purpose: "AI Ads Manager for Meta": daily account audits (AI Marketer), recommendations with one-click execution, AI ad generator, multi-channel reporting (Google, TikTok, GA4, Shopify, Klaviyo).
- Best for: Meta-heavy e-commerce accounts that want a ready-made optimiser.
- NOT good for: Non-Meta execution; evidence quality (almost all claims are Madgicx's own blog).
- Inputs → outputs: Meta ad account in → audits, recommendations, executed changes, reports.
- Official API: **MCP for Claude** (Academy: pull performance, pause ads, adjust budgets, run audits). Tool names not published. Public REST API: not found (UNVERIFIED). Access may be "early access via support" (pages disagree).
- Auth: Madgicx account + Meta connection (vendor says official Meta API tokens: UNVERIFIED).
- Pricing model: Subscription; own pages disagree: "from US$45/mo", "from US$99/mo", a "Pro Complete" entry plan at US$99 with a US$1,000/mo ad-spend limit, a time-limited US$29 offer. 7-day trial (vendor). MCP said to be included at no extra charge.
- Limits: Ad-spend limits by plan (UNVERIFIED figures).
- Commercial use / licensing: Says agencies can connect "as many ad accounts as you wish for the same price" (vendor); terms not reviewed: UNVERIFIED.
- AI disclosure / consent needs: Platform rules for AI creative apply.
- Sample workflow for an SME ad: AI Marketer flags a fatigued ad set → a person approves → Madgicx pauses it.
- Status for FusionTech: Not connected. DOCUMENTED-UNVERIFIED. Backup option for Meta only; would be the single optimiser on that account if ever used.
- Verified: 2026-10-14 — https://academy.madgicx.com/lessons/what-is-madgicx · https://madgicx.com/ai-marketer · https://madgicx.com/blog/ads-mcp · https://madgicx.com/blog/ai-tools-for-meta-ad-agencies

### Smartly
- Purpose: Enterprise creative + media automation across social and programmatic (Media Suite, Creative Suite, Predictive Budget Allocation, Brand Pulse, "Synapse" AI agents layer, June 2026).
- Best for: Large brands and big agencies (800+ brands, US$7B+ ad spend managed, per Smartly press).
- NOT good for: A small Singapore agency: spend-based fees with a monthly minimum, sales-led contracts.
- Inputs → outputs: Catalogues, templates, ad accounts in → automated cross-channel campaigns and creative out.
- Official API: Public API or MCP: **not found** (UNVERIFIED). Channels per docs: Google Ads, Meta, Pinterest, Snapchat, TikTok, YouTube, Reddit, X (beta), Amazon DSP (alpha), Spotify, plus DV360 / The Trade Desk / Yahoo DSP.
- Auth: Enterprise account.
- Pricing model: Order Form. Terms of Use 2026: spend-based subscriptions are invoiced monthly on the customer's **total advertising spend** on the ad account (whether or not it ran through Smartly), with a monthly minimum fee. No public prices.
- Limits: Contract-based.
- Commercial use / licensing: Enterprise contract (Terms of Use 2026).
- AI disclosure / consent needs: Platform rules apply.
- Sample workflow for an SME ad: Not applicable at our size.
- Status for FusionTech: **UNAVAILABLE (not a fit).** Revisit only for a large client with its own Smartly contract.
- Verified: 2026-10-14 — https://www.smartly.io/ · https://www.smartly.io/terms-of-use-2026 · https://docs.smartly.io/docs/introduction-to-smartly · https://www.smartly.io/press/smartly-synapse

### Native ad APIs: what changed since 2026-10-03 / 10-12
- **Meta:** no change found. Serving businesses we do not own needs **Full Access** (formerly Advanced) through App Review + Business Verification; at least one successful call per permission within 30 days before requesting. Our n8n Ad Actions works on Ryan's own account with a System User token. (developers.facebook.com/docs/permissions/, 2026-10-14)
- **TikTok:** no change found. Agencies use the normal flow: developer app review (2–3 business days, max 5 apps, name the advertisers), then each advertiser authorises via the authorisation URL (emailed code) → long-term token. (business-api.tiktok.com/portal/docs/create-a-developer-app/v1.3, 2026-10-14)
- **Google Ads:** confirms the 2026-10-12 note: access level sits on the Google Cloud project since 2026-09-09; Explorer 2,880 production ops/day and **no account creation, user management, planning or billing**; Basic/Standard need Cloud brand verification; Standard review "days or sometimes weeks"; known AUTHORIZATION_ERROR after some upgrades. (developers.google.com/google-ads/api/docs/api-policy/access-levels, 2026-10-14)
