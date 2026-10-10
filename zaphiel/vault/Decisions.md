---
tags: [zaphiel, decisions]
---
# Decisions

Newest first. Agents and Claude sessions obey these; contradict one only after flagging it to Ryan.

- 2026-10-02 — **The platform timer runs from the database, not n8n** (flagged change to checkpoint-0 answer 2). While building Phase 1: an n8n run every minute is ~43,000 n8n executions a month, which counts against the n8n Cloud plan that John and the other FusionTech agents run on. The hosted database's own scheduler (Supabase pg_cron) calls the platform every minute for free; its token is generated inside the database and kept in Supabase Vault (nobody sees it). Same result, no cost, no secret to copy.
- 2026-10-02 — **Only FusionTech switches a client's modules** (Platform v4 Phase 1). The owner's "Switch on Stock" button is gone; FusionTech switches modules in Master Control. A switched-off module is hidden, refused by the server and invisible in the database.

- 2026-10-02 — **Atlas Platform v4 checkpoint 0 answered** (Ryan: "Ok" to all six recommendations). (1) `fusion-edg-core` IS the Atlas platform, no merge. (2) Background timer: the n8n "every minute" runner calling the platform. (3) Production setup (paid Supabase in Singapore + live Vercel project) later, before the first real client. (4) Packages and pricing later. (5) Phase 1 approved: Fusion Master Control + module/agent switches enforced by the server and database. (6) ATLAS agent PLATFORM MODE section saved. Still stop for Ryan after each phase (he did not say "go all phases").

- 2026-10-02 — **The client dashboard is Ryan's "ATLAS · AI Business Operating System" design** (Ryan sent a mockup: "I want the dashboard to be exactly this, replace the dashboard with this"). This replaces the stone/jade "private office" look decided earlier today (newest wins). House style for everything a client sees: light blue and white with a deep-blue Atlas card and footer band, Plus Jakarta Sans, Great Vibes for the "Build · Automate · Grow" script, Singapore skyline banner, full dark mode. Every number on it is real (counts of the business's own records); a comparison is shown only when there are earlier figures; modules in the mockup that are not built yet are not shown. Tokens in `fusion-edg-core/apps/api/public/app.html`.
- 2026-10-02 — **Atlas Platform v4 is the build plan: one platform, many clients, Fusion controls entitlements** (Ryan's
  v4 master prompt, saved word for word in `fusion-edg-core/docs/platform-v4/SPEC.md`; see [[00_CEO_Brain/07_Atlas_Platform_v4]]).
  Phase 0 audit first, then stop; after every phase stop for Ryan's approval. Never test on production data. This phase
  plan replaces the order in [[00_CEO_Brain/06_Atlas_Master_Gap_Analysis]] (its "Step 2: Customer 360" becomes v4 Phase 2).
  No conflict with earlier decisions.

- 2026-10-02 — **The client app looks premium, never bland** (Ryan: "make it more premium… very posh… this looks way too bland and AI slop"). House style for everything a client sees (team app, sign-in, review pages): stone paper, obsidian ink, jade for actions, brass accents; Fraunces for headings and big numbers, Plus Jakarta Sans for the interface; full dark mode. New screens follow it (tokens in `apps/api/public/app.html`).

- 2026-10-02 — **The Atlas master spec is the target for Atlas** (Ryan shared *Atlas Master CRM + EDG + AI Workforce
  System Prompt*, 58 sections, in `_sources/`: "I read this entire thing so you know what I actually want for Atlas right
  now"). Atlas = the client's whole business operating system: ATLAS (the architect agent) designs it, Fusion EDG Core
  builds and runs it, and John stays the sales agent. No new or replacement agent (spec §0). Sequence: audit → gap
  analysis → plan → Ryan's go → build in phases ([[00_CEO_Brain/06_Atlas_Master_Gap_Analysis]]). This supersedes the
  wait for "sections 36–49" of the earlier v3 prompt: anything those sections would have covered is judged against
  this spec. Nothing in it contradicts an earlier decision.

- 2026-10-01 — **Staff logins: own email + password, not a separate login service** (Ryan: "do", Zaphiel's approach). Works
  now without the email key; a manager's one-time link sets or resets the password. The owner decides per business
  whether staff see all customers or only their own; the database enforces it.

- 2026-10-01 — **Build order: the mobile job card first** (Ryan: "ok" to Zaphiel's recommendation after the ATLAS v3 tests).
  Field-service businesses are the most common FusionTech client. Next in line: staff logins, Meta lead forms /
  portal leads, then stock and purchasing (only where a client cannot keep or buy a system).

- 2026-10-01 — **ATLAS v3: business-systems intelligence; one home per rule** (Ryan: "ATLAS v3 … BUSINESS SYSTEMS
  INTELLIGENCE UPGRADE + HEALTH CHECK", then "Ok" to the health-check recommendations). (1) ATLAS understands the whole
  company and classifies it (SALES-CRM · SERVICE-CRM · FIELD-SERVICE EDG · PROJECT/OPS EDG · COMMERCE EDG · ERP-LIKE
  EDG · HYBRID) before choosing the minimum modules; the router is in `.claude/agents/atlas.md`, the knowledge in
  [[60_Skill_Packs/ATLAS_Business_Systems/00_Index|the ATLAS Business Systems pack]] (29 cards + 12 archetypes).
  (2) Each rule has one home in the agent file; other places point to it. The vault discovery playbook is a pointer
  (the agent file holds D0–D13). (3) **Supabase wording:** Fusion EDG Core is the default when its catalog fits the
  client; otherwise keep or integrate what the client already has. (4) **Customer contact** (replaces the MUST NOT
  DO line "Talk to the customer directly"): ATLAS never messages a customer on its own channel; outside DISCOVERY mode
  its questions reach the customer through John's chat, in ATLAS's own name. (5) ATLAS is not the Website Agent or
  the Marketing Agent ([[10_Agents/03_Marketing_Growth]]); it may bring marketing data into the CRM. (6) Raise the ERP
  question early (from scenario test B). (7) Scenario tests live in `80_Clients/_Test/atlas-v3-scenarios/`.
  Ryan's sections 36–49 are still to come; they will be merged only where new or stricter than BUILD ENGINE v2.

- 2026-09-28 — **We design the look; we only ask for real facts** (Ryan: "John won't ask the customer how you want it
  to look … the website intelligence … will generate the best 3D scrolling website … how it looks is only for property,
  the property needs to give the room … only needs to know the important details like opening hours … the real
  things"). Replaces the look-and-feel part of the entry below. Website Intelligence and the Creator choose the best
  high-converting 3D scroll design themselves and never ask about style or colours. The customer is asked only for
  real facts the research could not find (what they sell, main services, location and opening hours for walk-in
  businesses). Property is the one exception: the rooms and features for the walkthrough (bedrooms, bathrooms, living
  and kitchen areas, pool, balcony, view).

- 2026-09-28 — **Every website starts from the customer's details; no replies to non-customers** (Ryan: "the customer
  must give the details … how the website wants to be … for every single website … the website creator must be able
  to build any website … not those weird inappropriate ones … just don't respond to them"). (1) Before any build John
  (or ATLAS) makes sure we know what the business does/sells, who its customers are, what the site should achieve AND
  how the customer wants it to look and feel (style, colours or a site they like), unless they leave it to us ("up to
  you", "just build"); max two rounds. (2) Any website for any business is built (business site, store, booking site,
  landing page, funnel, web app). (3) No reply at all to sexual, abusive or prank messages, people chatting for fun,
  scams, and people selling to FusionTech (freelancers, agencies, job seekers). A business owner who says "we offer …"
  and asks for a website or automation is a customer. Judged only by what the message says, never by who sends it
  (never nationality, race, religion or language) — Zaphiel declined a nationality-based filter.

- 2026-09-28 — **Property sites: a cinematic walkthrough of the home** (Ryan: "be able to build property houses …
  of the house or inside, cinematic scroll, parallax, everything … don't actually build it"). Agents, developers and
  new launches, condos, landed homes, villas, show flats and interior designers get a 5-scene Kling walkthrough scrubbed
  by the scroll (facade at golden hour → front door → living room → kitchen and dining → bedroom and balcony view),
  a floor-plan mini-map, room-by-room features, depth parallax and a gallery walkthrough on every listing page. Every
  generated image and clip is labelled "Artist's impression"; real photos, prices, sizes, addresses and floor plans are
  [CLIENT TO PROVIDE]; CEA advertising rules apply. Capability only: nothing was built.

- 2026-09-28 — **Build only with enough details; John asks first** (Ryan: "the website intelligence only asks the
  website creator to create the website when he got all the enough sufficient details"). Replaces "the mock-up starts
  from the name alone and is never delayed" (2026-09-27, the placeholder-first part). Website Intelligence reads what
  the customer told John and searches Google; if it still does not know what the business does or sells, who its
  customers are or what the site must achieve, it does not call the Website Creator: John asks the customer only those
  missing essentials (max two per message, never repeated). The customer's answer goes back to Website Intelligence,
  which checks again and builds when it is enough. Never stuck: after two rounds of questions, or when the customer
  says they are not sure / just build, it builds with clear placeholders. Logo, photos, colours, prices and
  testimonials never hold a build.

- 2026-09-28 — **Every mock-up is a full website with high-converting sales** (Ryan: "I want a full website mock-up
  with high converting sales and everything"). Not a single page: an 8–12 page sitemap for the industry (for example a
  café: Home, Menu, Our Story, Catering & Events, Order & Delivery, Reviews, Find Us; a car dealer: Models, Model
  Detail, Book a Test Drive, Service, Financing…), plus an Offer Landing Page and a Thank You page. Every page is built
  with real copy and ends with the call to action; the homepage follows the selling order (outcome headline + one CTA,
  proof, problem, offer, benefits, how it works, showcase, reviews, objections, a no-obligation risk reducer, final
  CTA); every page has the sticky CTA, WhatsApp and a short lead form. No prices or guarantees.

- 2026-09-28 — **Kling and Higgsfield together** (Ryan: "I also want to add Higgsfield there also"). Replaces "Kling
  for all website images and video; never Higgsfield" (2026-09-27). Kling makes the photos and the 3D parallax scroll
  film; Higgsfield turns the product/hero photo into a real 3D model (GLB) for the Apple-style product reveal that turns
  as the visitor scrolls (cars, food and drink, shops, devices; never for clinics, whose anatomy stays the photoreal
  Kling film), and makes a scene when a Kling clip fails. Lovable builds and publishes.

- 2026-09-27 — **Apple-grade websites; ATLAS speaks; Website Intelligence searches wider** (Ryan: "as premium as Apple
  videos but as a website … premium golden website with parallax, with 3D videos … make sure Atlas knows Atlas can talk
  and then John also can talk … the website intelligence … can search every single thing on Google … the website
  creator … many types of parallax video scrollings"). (1) Every mock-up meets an Apple-grade standard and uses 5–6
  scroll effects chosen for the business from a library (pinned film scrub, product reveal, zoom-through, depth
  parallax, sticky scrollytelling, text-mask reveal, horizontal gallery, split reveal, proof in motion, a premium golden
  light-sweep finish with champagne-gold accents for premium brands). (2) In the customer chat ATLAS asks its own
  questions in its own name ("ATLAS, our systems architect, would like to know: …"); John leads the conversation and
  keeps Website Intelligence's questions as his own. (3) Website Intelligence reads the customer's own description first,
  then searches wider: company, location, reviews, socials, maps listing, services, market and competitors, and reads up
  to five pages of their site.

- 2026-09-27 — **3D parallax scroll-film websites with Kling** (Ryan: "can we do the 3D parallax scrolling and connect
  the Kling to make the most beautiful 3D parallax website video scrolling … connect the Kling"). Every mock-up is ONE
  website: a Kling film of the business pinned in the hero and scrubbed by the scroll, layered depth parallax, sections
  and CTAs over the film, on top of the high-converting sales structure (offer, headline, proof, objections, repeated
  CTA). Clinics open on their realistic anatomy film. Kling makes the photos and the film, Lovable builds and publishes;
  never Higgsfield. **Replaces the two flat-site entries below** ("One flat, high-converting website" and "Flat pages
  keep the clinic anatomy").

- 2026-09-27 — **John never goes silent; he listens to voice notes** (Ryan: "he didn't even say anything … let John
  listen to voice messages too … everything linked"). John always answers. Only money, contracts, refunds, legal,
  personal data, proposals and WON/LOST still wait for Ryan: the customer then hears that Ryan will reply personally,
  and John's draft goes to Ryan. Anything else John flags (for example a late mock-up) is answered at once and Ryan is
  told. WhatsApp voice notes are transcribed (OpenAI speech-to-text on n8n credits) and John reads them like text;
  an unclear note gets a kind "please send it again or type it". Refines the 2026-09-25 "low-risk replies auto-send".

- 2026-09-27 — **Flat pages keep the clinic anatomy: arteries, heartbeat, blood vessels** (Ryan: "can we build all the
  arteries, all the heartbeats, all those blood vessels, it still must be able to do that"). Specialist clinics still
  open on photorealistic, medically accurate anatomy (for a heart clinic: the heart beating, coronary arteries,
  blood flowing through the vessels). Kling makes the still photo and a short silent video from it that loops on
  its own in the hero, not tied to scrolling. Everything else on the page stays flat. Amends the entry below
  ("clinics get realistic anatomy as a still photo").

- 2026-09-27 — **One flat, high-converting website per mock-up** (Ryan: "from now on, don't use scroll animation. Just use
  normal flat website that just have high converting sales in the brain"). No scroll animation, parallax, 3D, scroll
  film, video backgrounds or second version. Website Intelligence's sales strategy (offer, headline, proof, objections,
  repeated CTA, funnel) drives the page; clinics get realistic anatomy as a still photo. Supersedes ADR-2 (two
  variations) and the 3D/scroll parts of the 2026-09-26 upgrade; Kling makes the photos, Lovable builds and publishes.

- 2026-09-27 — **Kling for all website images and video; never Higgsfield** (Ryan: "for scroll website from now on
  permanently use Kling not Higgsfield" … "Kling all"). The build worker makes the photos, the clinic anatomy video
  and the scroll film with Kling. Variation A (cinematic scroll film site) = Kling film + a Lovable scroll site;
  both variations are published to public lovable.app links (no login). Amends ADR-2 (A was a Higgsfield site).

- 2026-09-27 — **Missing website details go back to John; ATLAS joins every mock-up** (Ryan: "if the website
  intelligence can't find more details on Google … tell John … and then John will ask the customer … not the same
  question but what's left"; "can you involve Atlas also?"). The mock-up still starts from the name alone and is never
  delayed: Website Intelligence builds with placeholders and, when Google leaves gaps, John messages the customer at
  once on WhatsApp/email (max two questions, never already-answered ones, placeholders are fine); on the web chat John
  asks them in his next replies. ATLAS starts in the background for every named company that asks for a mock-up; John
  asks ATLAS's questions after the website ones, one per reply, never repeating.

- 2026-09-27 — **The business name is enough to start a mock-up** (Ryan: "Once I give the name, he'll say, okay,
  building the mock-up now … the website intelligence … will search it up on Google … then he will send it to the
  website creator … John's like, here's the website link"). John no longer asks what the business does, its customers
  or the pages; Website Intelligence researches them. Only a missing name (or, off WhatsApp, where to send the link)
  holds the build. Supersedes the four-question intake of 2026-09-25.

- 2026-09-26 — **Agent models (Ryan paid the Gateway: "upgrade … all of them").** John, ATLAS and Discovery run
  on **Claude Sonnet 5** with thinking off, so John answers a chat in ~9 seconds. Website Intelligence and the
  Website Creator run on **Claude Fable 5.1** ("I want more better… premium websites, like with the artery and
  3D"), thinking on at medium effort. Website Intelligence plans the funnel, the high-converting sales strategy,
  the 3D/scroll motion and, for clinics, a photorealistic, medically accurate anatomy visual (never cartoon 3D);
  the creator always builds from that plan. Research stays on Browserbase (the Firecrawl node is not installed).

- 2026-09-25 — **FusionTech's product is the CEO Brain operating system** (CEO Brain + AI workforce +
  CRM/ERP data layer + automation + custom software + high-end websites), customised per customer and
  sold to SMEs and professional businesses. Full directive: [[FusionTech AI — Product & Build Directive]].
- 2026-09-25 — **Never ask a customer for "all your data".** The Discovery Agent finds where information
  lives and plans connect / import / index / summarise / leave-in-place. Never ask for passwords; OAuth.
- 2026-09-25 — **No generic AI websites.** Every site meets the S$10,000 standard in
  [[Knowledge/Website design standard]]; two modes (SME, Medical); QA before a customer sees it. The
  navy-purple-gradient / glowing-orbs / three-feature-boxes look is rejected on sight.
- 2026-09-25 — **Human approval ladder** for money, refunds, contracts, final pricing, deletes,
  permissions, production deploys and legal commitments: AI recommends → human approves → execute →
  audit. Pricing is never generated by an agent.
- 2026-09-25 — **Tenant isolation is a rule of the product**: every row carries the tenant; Company A
  never sees Company B. Existing ERPs are integrated, not replaced.
- 2026-09-25 — **Obsidian holds long-term knowledge; the CRM/database holds live operational data;
  n8n orchestrates; Claude reasons.** Never use the vault as the CRM.

- 2026-09-25 — **This vault holds FusionTech AI only.** Nothing from earlier projects. "This is the
  start of the real FusionTech AI."
- 2026-09-25 — **The vault is the brain for every agent.** Agents read it live (John: master brain +
  playbook on every message); every conversation is written back (Leads/, Companies/). Ryan trains
  agents by editing playbook notes; rules that must never break are code.
- 2026-09-25 — **Fully automated team, no master agent.** Customer → John → Website Builder → Lovable
  build → mock-up sent to the customer on WhatsApp → copy to Ryan. Ryan wants no approval clicks in
  that chain; the only remaining human step is the Lovable build authorization (Lovable is OAuth-only).
- 2026-09-25 — **John is the WhatsApp / sales agent**, briefed from the FusionTech Master Company
  Brain. FusionTech does build websites and web apps as part of AI systems; website requests are
  welcomed and handed to the Website Builder.
- 2026-09-25 — **Website builds run on Lovable.** Nothing is published to a live domain without Ryan.
- 2026-09-25 — **Low-risk replies auto-send; prices, proposals, contracts, refunds, WON/LOST stay
  human** (Ryan's approval links).
- 2026-09-25 — Order of play: (1) top up n8n AI credits, (2) website chain end to end incl. WhatsApp,
  (3) then the other agents. The training dashboard comes first so Ryan can train agents before
  activating them.
- 2026-09-25 — **Ryan: website mock-ups are fully automatic, zero approvals.** Customer asks John for a
  mock-up → John asks for the details (business name, what it does, what the site must do, where to
  send the link) → John hands off to the Website Builder → the mock-up is built → the link comes back
  to John → John sends it to the customer. No approve click anywhere. Publishing to a live domain
  stays with Ryan. (Supersedes the "owner clicks OPEN IN LOVABLE" approval step of the same day.)

## ADR-1 · Vault structure v3 (2026-09-25, Ryan: "do all okay")
- **Decision:** the numbered CEO Brain v3 structure is added next to the existing notes; nothing existing is moved, renamed or deleted. `Decisions`, `Change log`, `Open loops` stay at the root as the canonical logs (n8n and sessions write there); `00_CEO_Brain/03_Decision_Log` and `04_Changelog` point to them.
- **Why:** the live agents and the Vault Writer read/write fixed paths; moving them would break automation for no gain.
- **Consequences:** new decisions are appended here as `ADR-<n>` using [[90_Templates/ADR_Decision_TEMPLATE]]; the four live-read notes (`Knowledge/John — Sales playbook`, `Knowledge/Company Discovery — playbook`, `Knowledge/Website design standard`, `Knowledge/Website Builder — playbook`) never move.

## ADR-2 · Two website variations per mock-up (2026-09-26, Ryan)
- **Decision:** every mock-up request produces two versions: **A** a cinematic scroll film site built with Higgsfield's animated website builder (the premium, more expensive option) and **B** a photo-led site built on Lovable with generated photography. John presents both; pricing stays in Ryan's proposal.
- **Why:** Ryan wants customers to see the cinematic option and choose; the scroll film site is the upsell.
- **Consequences:** the Website Builder brief carries both variations; the Build Runner gets a second build path (Higgsfield MCP, OAuth) in backlog Phase 5; QA covers both.

## ADR-3 · Website Intelligence is an internal agent; John owns the customer (2026-09-26, Ryan)
- **Decision:** the chain is customer ↔ **John** → **Website Intelligence** → **Website Creator** (the Website Builder) → John → customer. Website Intelligence and the Website Creator never talk to the customer, never present the mock-up, never discuss price. Website Intelligence starts from whatever John has (even just "customer wants a mock-up, company X"), identifies the company, researches it and its market, never invents facts (`[CLIENT TO PROVIDE]`), and does **not** delay a mock-up for missing details: it briefs the Creator with placeholders. Missing critical information goes back to John as `STATUS: MORE_INFORMATION_REQUIRED`; John decides whether to ask the customer. The finished mock-up returns to John as `STATUS: MOCKUP_READY` and John presents it in his own voice.
- **Why:** Ryan's role prompt of 2026-09-26 ([[10_Agents/05a_Website_Intelligence — internal role prompt]]): one customer-facing voice, fast mock-ups, no invented facts.
- **Consequences:** the intake gate stays with John (website address + company name first); the research step is added between John's hand-off and the Website Builder brief (backlog Phase 5); the Website Builder treats a WEBSITE_CREATOR_BRIEF as authoritative input and keeps the placeholders visible; the Claude Code subagent version stays for Ryan's own client/prospect work.

## ADR-4 · ATLAS is the upgraded CRM Architect (07) (2026-09-26, Ryan: "ok merge")
- **Decision:** ATLAS — EDG & CRM Systems Architect replaces and extends [[10_Agents/07_CRM_Architect]] (file name kept so
  links keep working; alias `ATLAS`). Ryan's agent file `.claude/agents/atlas.md` is its source of truth. Scope is the
  whole business system (EDG), not only the CRM. Three modes (DESIGN default, BUILD, AUDIT) and four checkpoints; every
  step from design to build and from staging to production needs Ryan's approval. ATLAS works behind John and never
  talks to the customer.
- **Boundaries:** Discovery (01) runs the first client discovery, ATLAS takes its Company Map; ATLAS writes workflow
  specs, Workflow Automation (09) builds and runs them; Data/BI (14) owns KPI definitions; Security/QA (15) reviews
  permissions and privacy.
- **Consequences:** 07 rewritten (old note in `_backups/2026-09-26/`); John's note (02) gets the two-way hand-off;
  the permission matrix row now allows only the client's `edg/` folder and staging after approval.
- **Amendment (2026-09-26, Ryan: "John asked automatically"):** John asks ATLAS's questions for the customer
  automatically, one unasked question per normal reply. Ryan still receives the checkpoint email and approval task;
  the architecture (checkpoint 2 onwards) still waits for Ryan. (Ryan first said "i see first", then corrected it.)
- **Amendment (2026-09-27, Ryan: "save it" — ATLAS DISCOVERY MODE):** ATLAS has a 4th mode, DISCOVERY, before DESIGN.
  In DESIGN / BUILD / AUDIT mode ATLAS still works behind John. In DISCOVERY MODE ATLAS may speak with the customer
  directly (or with Ryan relaying the customer's answers), or give John the next questions to ask. This narrows ADR-3's
  "John owns the customer" for ATLAS's discovery conversations only; Website Intelligence and the Website Creator still
  never talk to the customer. Playbook: [[10_Agents/ATLAS_Discovery_Playbook]]; agent file `.claude/agents/atlas.md`.


- 2026-09-28 — **John promises the mock-up "usually within about an hour", never sooner** (Ryan: "change it to
  accurate timing"). Based on the real build times; revisit when faster builds are measured.

- 2026-09-29 — **The website team never asks what Google can answer; one question per message; never twice** (Ryan,
  after the Smile Plus Dental test: "they keep asking for the opening hours and the branch, which is already on
  Google … they only need to ask the things that are not in Google", "repeated questions", "duplicate messages").
  Website Intelligence finds addresses, branches, hours, phone, services and the website itself (or uses a
  placeholder); a business it cannot find is asked one thing: its website link. It asks only before the build, never
  while building. Only the customer's first reply to its question sends it back for another look. John does not
  relay its questions. ATLAS never asks what the customer already said. Every message asks at most one question.

- 2026-09-29 — **Film-led websites: the 3D scroll film on every screen, phones first; no static photo sections**
  (Ryan, on the Smile Plus mock-up: "no scroll effects, no nothing … I want an actual scroll website, 3D video …
  no photos, just colours"). Each Kling clip is a pinned film chapter scrubbed by the scroll on a canvas (frames
  extracted in the browser), never turned off on phones; generated photos are only film posters; everything else is
  clean solid brand-colour panels; every section has a scroll animation (GSAP ScrollTrigger + Lenis). The build
  worker checks the code after Lovable finishes and sends it back if the film or the effects are missing. Kling
  output carries a corner watermark, so the film is drawn 1.1x from the centre to crop it (Ryan's Kling Pro plan
  covers commercial use).

- 2026-09-29 — **The Full Master Cinematic Website Agent 2026 governs every website agent** (Ryan sent the PDF "for
  website agent"; verbatim in [[Knowledge/Full Master Cinematic Website Agent 2026]], PDF in `_sources/`). Every
  site is a chapter-based conversion story: scroll down advances it, scroll up reverses it exactly; one engine per
  chapter (real-time 3D only with accurate models, otherwise scrubbed video, image sequence, CSS/SVG or static);
  never fabricated facts or geometry; Lovable writes the storyboard and scroll timeline first, then builds; QA
  torture-tests reverse scroll before the link goes out. Higgsfield now makes the film (matching start/end frames
  so chapters join), Kling makes the posters and is the backup. It sits inside the design standard the Website
  Builder reads live, so Ryan can edit it in Obsidian.

- 2026-09-29 — **Any luxury retail website at the top standard** (Ryan: "make the website agent able to do all this
  for any retail luxury 10,000 website"). Watches, jewellery, electronics, furniture, fashion and luxury goods are
  recognised automatically and get: the matching doctrine module (reveal → craft → 360 → lifestyle; no exploded or
  internal view without the customer's CAD), a quiet-luxury design system, three art directions (the first is
  built), the maison sitemap (Collections, Product Detail, Craftsmanship, Book a Private Viewing, Boutique…), quiet
  selling (private viewing CTA, no discount strips or countdowns, "Price on request" until the customer confirms),
  generated products labelled "Illustrative" until real photography arrives, a full Higgsfield shot package per
  chapter, and a QA report (blocker/high/medium/polish) that must be clean before the link goes out.

- 2026-09-29 — **Real photos first; research everything about the company** (Ryan: "only give out the photo if the
  website intelligence cannot find … if they already show the photos, download from there … search every single
  thing about their company"). Website Intelligence now collects every photo on the company's own website and its
  Facebook/Instagram profile pages, plus the structured facts there (address, opening hours, phones, emails,
  socials, rating), and runs 13 searches (adds more socials, press/news, the people behind it, photos). The
  builder uses the company's own photos first (film posters, galleries); Kling generates only what they do not
  cover. Never another business's photos, never invented URLs, never for a business it could not confirm. Clinics
  keep the anatomy film as the opening. Limit: Google Maps/Business photos are not reachable by our search tools;
  the website and social pages are.

- 2026-09-29 — **John never repeats a question or asks about the look; every build uses the master prompt** (Ryan:
  "make sure John doesn't repeat questions and answers accurately … every time the website agent creates the
  website, it will use this prompt"). Code now removes any question in John's reply that he (or ATLAS) already asked,
  and any look/style/colour question; ATLAS skips near-duplicates. The Lovable build prompt is laid out as the PDF's
  MASTER ORCHESTRATOR, steps 1-10 (intelligence, creative, story, animation, engine, assets, Higgsfield, Lovable,
  conversion, QA), filled in for each business, with industry chapter labels and shot direction (clinics: anatomy,
  mechanism and doctors, consultation; property walkthrough; cars; F&B; luxury retail).

- 2026-09-29 — **Kling models run on Kling directly, not through Higgsfield** (Ryan: "if you want to use the Kling
  model in Higgsfield, can you go to the actual Kling?"). The film chapters are made on Ryan's Kling Pro account
  (`kling-video-v3_0`, first frame = this chapter's photo, tail frame = the next chapter's, no audio, one continuous
  shot). Higgsfield keeps the 3D product model and is the backup film maker with its non-Kling models.

- 2026-09-29 — **Two website builders** (Ryan: "don't use Lovable as the website builder, use Claude Fable 5.1 … I tried
  Lovable's artery design and it's better … Claude is better for cinematic scrolling websites, 360 watches, fashion
  houses, properties"). Clinics and medical sites: Lovable (with the Kling anatomy film). Every other business:
  Claude Fable 5.1 writes the site itself on Higgsfield's website platform with its tested `scroll-scrub` engine
  (reverse scroll, phone encodes, posters), live at `<slug>-mockup.higgsfield.app`; the film is made on Kling
  directly, the watermark cropped in the encode; the customer's real photos first. The build worker runs on
  Claude Fable 5.1.

- 2026-09-29 — **Clinic sites get a narrated explainer film** (Ryan: "it goes inside the teeth, then a narrator explains
  this and that and why, then it goes inside the human body … not as a scroll, an actual video inside the website").
  About 60 seconds, 6 scenes (outside → inside the tooth or body → vessels and nerves → the clinic's own treatment →
  back out → book), photoreal Kling pictures, a calm narrator voice (Higgsfield), burned subtitles and a captions
  track, played in a "How it works" section of the Lovable clinic site with the transcript underneath. Educational
  only, no promises or prices, labelled illustrative; the script is sent for the clinic to verify.

- 2026-09-29 — **One transformation film, a cinematic finish, never a grey 3D model** (Ryan, on the Edit Suits Co
  mock-up: "quite too simple"; he pointed to TikTok scroll-video suit sites). Claude-built sites play ONE continuous
  15-second Kling film where the product transforms as you scroll (suits: cloth → pattern pieces → stitched → the
  finished suit, orbiting) and restores on scroll-up; a quiet cinematic layer (film grain, vignette, a few floating
  particles, glass cards, brand tint); a 3D model only when textured and true to the product (never for fashion or
  furniture). Found the same day: Higgsfield-hosted mock-ups open a Higgsfield sign-in page for visitors, so
  customers cannot see them yet (hosting decision asked).

- 2026-09-29 — **Claude-built mock-ups are hosted on Vercel** (Ryan: "vercel and teach the website agent how to build
  these crazy wow factor website"). This replaces Higgsfield hosting, whose links open a sign-in page.
  - Every non-medical mock-up starts from the FusionTech site kit (`ceo-brain/site-kit`):
    - a pinned canvas scroll film that plays backwards on scroll-up, with the film kept on phones;
    - a motion vocabulary;
    - a cinematic layer: grain, vignette, particles, cursor and an opening curtain.
  - The build worker follows the **Wow website playbook** (vault `Knowledge/`).
  - Mock-ups are deployed as files to the Vercel project `fusiontech-mockups`, with no git and no media in the
    call. Vercel's build fetches the engine from this public repo, downloads the Kling film, crops the watermark and
    cuts the frames.
  - Links take the form `<slug>-mockup.vercel.app`.
  - Clinics stay on Lovable.

- 2026-09-29 (evening) — **Every non-clinic mock-up is a scene film of 5-7 cinematic scenes in one look.** Ryan: the
  first kit demo, one film plus coloured boxes, was "too simple, there's nothing".
  - His reference is the TikTok by EditsbyGhalib, "animated fashion tailoring website":
    - the shirt forms, glowing in a black void;
    - the waistcoat and jacket build on;
    - the complete silhouette;
    - the colour range walking at night;
    - a macro of the stitching.
  - His own example is a motorbike: it splits into parts, spins 360°, then "vroom".
  - The arc is: parts → assembled → revealed → alive → macro → payoff.
  - Every scene is its own Kling shot from keyframes that share one look bible. Recipes per industry are in
    [[Knowledge/Wow website playbook]].
  - This replaces the single 15-second transformation film.

- 2026-09-29 (night) — **No black between scenes, ever.** Ryan, after the Atelier Noir preview: "there's suddenly
  black thing when you scroll … I want the suit to turn into a person, no black thing in the middle"; "don't build
  it again, just tell the website agent".
  - All scenes play on one pinned stage (`.film-sequence`) and dissolve into each other.
  - Every scene ends on the next scene's first frame (Kling `tail_image`), written as a transformation (the empty
    suit fills out into the man wearing it).
  - No hard cuts, no fades to black, no separate pinned films.

- 2026-09-29 (night) — **Property sites: one uninterrupted camera journey from outside to inside** (Ryan's TikTok
  references: Marina Budarina's glass house above the clouds and JerryTheWebDev's marble-door estate).
  - The journey: aerial → facade → the doors part and the camera passes through → living room with the view →
    signature space → dusk.
  - Golden-hour haze, quiet copy, floating pill menu.
  - A property agent's site pairs that film with listings, neighbourhoods, valuation and the agent profile.
  - Recipe: [[Knowledge/Wow website playbook]] "Property".
  - Ryan wants to test it through John himself, not have Zaphiel build it.

- 2026-09-30 — **Fusion Property AI is a separate specialist agent** (Ryan: "This is a SEPARATE specialist agent,
  only for property: Singapore floor-plan intelligence, 3D + photoreal interior visualisation, property websites and
  landing pages, developer projects, listing marketing, and later my own property platform (bigger than PropertyGuru)
  and Asia expansion"). Agent file `.claude/agents/fusion-property-sg.md` (verbatim, [[10_Agents/16_Fusion_Property_SG]]);
  knowledge in [[70_Industry_Packs/Singapore_Property/00_Index]]; product in `90_Products/Fusion_Property_AI/`. Roadmap
  rule: don't build the marketplace first. Singapore rules are never applied to another country.

- 2026-09-30 — **ATLAS builds, not only designs; EDG Core first, property later** (Ryan: "Don't do property first do
  this first", then "Build all now"). ATLAS keeps ONE agent file, with BUILD ENGINE (v2) added. Client systems are built
  on the shared Fusion EDG Core ([[00_CEO_Brain/05_Fusion_EDG_Core]]): development only until Ryan approves staging
  (L3) and production (L4); L5 always needs a named human approver. Code lives outside the vault; the vault keeps the
  docs and links. n8n is the trigger layer only; business rules stay in tested code (ADR-0004).

- 2026-09-30 — **ATLAS builds the full EDG catalog** (Ryan: "I want Atlas to be able to do all those"): quotations, invoices, payments, appointments, client WhatsApp numbers and accounting (Xero) are now standard modules. The rules stay:
  - An AI never invents a price (it uses the approved price list only).
  - Approving or sending a quote, issuing an invoice, WON/LOST and "completed / no-show" are human decisions, made with one click from an email link.
  - An AI never records payments.

- 2026-09-30 — **ATLAS builds client systems on one approval click** (Ryan: "Atlas must be able to build CRM and EDG … do all to make atlas actually working"). Builds happen on the EDG test system only.
  - Going live with a real client stays a separate step for Ryan (the client's real prices and details plus his OK).
  - Tax rate, prices and staff always come from the client.

- 2026-09-30 — **Automatic build, no approval click** (Ryan: "Yes"). ATLAS builds each client's system on the EDG **test** platform straight after the design and emails Ryan the review link. This supersedes "ATLAS builds client systems on one approval click" for the test platform only.
  - Going live with a real client is still Ryan's decision: real prices and details, the client's WhatsApp number and his OK.
  - The same company is never built twice.

- 2026-09-30 — **Build the team's screen before the WhatsApp connection** (Ryan: "go"). Order:
  1. A working screen the client and prospects can see (test platform, fake data).
  2. Then the real WhatsApp connection with the first client who says yes.
  - Sign-in uses one-time links until proper logins (Supabase Auth) are built.
  - Test tools work only on the test system, and never while real providers are switched on.

- 2026-09-30 — **What FusionTech sells: an AI team that runs a client's business** (Ryan, verbatim: "build agents for people because it needs to know the entire CRM, EDG, can build automations for people … what if you don't have to work a 9-to-5 anymore, what if you can spend time with your family, with your kids, with AI automating your entire systems, business, workflows, everything for you").
  - ATLAS designs each client's **agents** as well as their automations. For example, the client's own "John" answers their customers, books jobs and follows up.
  - The CRM/EDG is the memory and the rules those agents work from.
  - The owner only decides what our rules keep human: prices, refunds, won/lost, going live.
  - Everything that is built is judged by one test: does it take work off the owner?
  - Ryan, the same day (verbatim): "it needs to know how to build AI agents, workflows, solve people problems." ATLAS is the builder. It works out the client's problem and then designs, builds and tests the agents and workflows that solve it. It is not limited to a fixed menu. Everything is built and tested on the test system first; Ryan decides go-live.

- 2026-09-30 — **Where workflows live, and the zero-error rule** (Ryan: "split then but you must remember it cannot have any errors when building the workflows and must make sure it works").
  - **Split:**
    - The standard workflows and the AI assistants run inside Fusion EDG Core: one tested engine for every client.
    - Custom workflows for one client (their other systems or channels) are built in n8n.
  - **Zero-error rule:** nothing is reported as "works" unless it has been proven.
    - **Standard:** ATLAS's design is checked against the catalog before building. Every workflow is rehearsed during the build with a fake customer (nothing is sent). A failure fails the build with the exact reason; a missing client detail shows as "waiting for".
    - **n8n (custom):**
      - Built from the repo, never hand-edited.
      - Checked with n8n's validator.
      - Run with test data before publishing, and checked for the expected result.
      - Never published if any step fails.
      - After publishing, the version diff is checked to confirm the deployed version is exactly the tested one.

- 2026-10-01 — **A website request stays a website request** (Ryan: "when I asked him to build a website … he built a CRM and EDG for me for no reason … I don't want that, I want a website"). **Replaces the 2026-09-27 rule** that ATLAS joins every website request for a named company.
  - ATLAS (CRM/EDG) wakes only when the customer asks for systems work themselves: a CRM, automation, workflows, integrations or AI agents.
  - When the customer says no ("I don't want a CRM", "just a website"), John stops all CRM/EDG questions and no CRM demo link is sent. If they later ask for it, it starts again.
  - AI assistants are never told anything is "free" (this caused "a free plumbing service visit" on 2026-09-30).

- 2026-10-01 — **AI billing: Option 1** (Ryan: "yes"). FusionTech holds one Anthropic key for every client. Each client's AI use is a separate line on their bill (third-party costs are always separate from FusionTech fees).
  - Each client has a monthly AI limit. The default is **US$20/month**, set by Zaphiel; Ryan changes it per client on the review page.
  - At 80% Ryan is told. At 100% the client's AI pauses until next month and a person answers; customers are never left without a reply.

- 2026-10-01 — **Property-portal leads arrive by email, not by API** (Ryan: "do", Zaphiel's approach). No Singapore
  portal publishes a lead API (checked 2026-10-01), so each business gets a private forwarding address; the enquirer is
  read from the email, and any email that cannot be read goes to a person. Facebook/Instagram lead forms use Meta's
  official Lead Ads webhook; one FusionTech Meta app serves every client Page (each Page belongs to one business).

- 2026-10-01 — **Stock and purchasing: small-business stock inside EDG Core, not an ERP** (Ryan: "stock and purchasing",
  Zaphiel's design). Stock changes only through movements (Ryan's card 13 rule); a person approves every purchase order
  and the person who prepared an order cannot approve it above the client's limit (card 14); costs and reorder levels
  come from the client, never invented. Where a client already runs an ERP or inventory system, ATLAS integrates with it
  and leaves EDG stock off.
- 2026-10-03 — **Marketing & Branding Intelligence is a module inside Atlas, built on Metricool's API first** (Ryan's v2
  prompt; plan by Zaphiel, waiting for Ryan's approval; Fusion EDG Core PR #30).
  - **Golden rule:** NUMBERS COME FROM CODE, WORDS COME FROM AI.
  - **Data:** Metricool's REST API is called server-side; the MCP is used only for build-time exploration. Raw base metrics
    are stored per ad per day. Ratios are always computed from sums. Each account keeps its own currency and timezone.
  - **Diagnosis:** deterministic, versioned rules with a minimum-data rule.
  - **John is not rebuilt:** Marketing reads sales through a read-only `SalesBrainPort`.
  - **Campaign control** (pause, budget) comes only after the analytics are proven correct, and only with explicit
    approval. AI never launches ads or raises budgets.
  - **Order:** Marketing Phase 1 runs next, then v4 Phase 3; this replaces the marketing/branding part of v4 Phase 5.
- 2026-10-03 — **BioGreen Elixirs is a separate business, not part of FusionTech** (Ryan: "BioGreen is just another
  product … a separate thing"). Its data stays out of the brain and out of the marketing work. Ryan unlinks it from Metricool.
  The Marketing Brain and the Atlas Marketing module read FusionTech's own brands and FusionTech clients only.
- 2026-10-03 — **Marketing plan approved; Marketing Phase 1 runs before Platform v4 Phase 3** (Ryan: "go"). It is built in steps 1a–1e. After each step: tests, the test system, a demo note, then a stop for Ryan.
- 2026-10-03 — **Marketing is an intelligence system, never a Metricool reporting dashboard** (Ryan, after step 1a, binding for every step).
  - **The finished module = three functions:**
    1. Marketing Brain: CMO-level; explains what is happening and what to do next.
    2. Ads & Data Diagnosis Agent: Meta / TikTok / other ads over time; flags abnormalities, wasted spend, rising CPL/CPA, falling CTR / conversions / ROAS, creative fatigue; evidence in simple words.
    3. Creative & Branding Agent: knows each company's Brand Brain; later creates hooks, copy, scripts, images, UGC/video concepts and replacement creatives through connected providers.
  - **The owner's screen must answer, simply:**
    - How much did I spend?
    - How many leads did I get?
    - What did each lead cost?
    - Which campaigns work?
    - Which need attention?
    - What changed?
    - Why might it have changed?
    - What does AI recommend next?
  - **Must connect to the Sales/WhatsApp Brain:** Ad → Lead → Conversation → Qualified → Appointment → Follow-up → Won/Lost → Revenue. The goal is to diagnose qualified leads, sales, revenue and where money is lost, not just cheap leads.
  - **Architecture:**
    - multi-tenant and modular;
    - Metricool is a first source only; the connector design stays so native Meta / TikTok / Google APIs plug in later;
    - working parts are never rebuilt;
    - each major stage is shown to Ryan before the next.
  - **Recorded as** the "North star" section of `fusion-edg-core/docs/marketing/PLAN.md`.
- 2026-10-03 — **Only FusionTech chooses a client's marketing data source** (Zaphiel's design, step 1b). FusionTech's Metricool key is one agency key, so a business picking a brand itself could read another client's data. The daily update runs only after the connection test passed and FusionTech confirmed the totals against Metricool's own screen.
- 2026-10-04 — **Fusion AI = "an AI marketing department for busy CEOs"** (Ryan's FINAL MASTER PROMPT v-FINAL; replaces earlier drafts).
  - **Daily loop:** report → one-click pause → replacement angles → video uploaded or generated → AI-built campaign → APPROVE & LAUNCH through official APIs.
  - **Channels:** Facebook + Instagram, TikTok, YouTube (via Google Ads Demand Gen). Metricool is invisible plumbing; the CEO only ever sees "Fusion".
  - **Five agents:** Marketing Brain, Diagnosis, Creative Director, Market Intelligence, and the Ads Operator (the only one that touches ad accounts, through validated actions and approvals).
  - **Rules:**
    - launching, activating, raising a budget or deleting needs human approval;
    - pausing is one click by the CEO;
    - auto-rules are opt-in only;
    - objects are created PAUSED and activated only after every step succeeded.
  - **Gate:** Zaphiel produced the pre-implementation report (Fusion EDG Core PR #33, docs only). No architecture change and no money-spending code before Ryan approves it.
- 2026-10-09 — **HR employee-data key is automatic (split key), not created by hand.** Ryan: "Is there any easier way? I don't want to do this." The key is derived from a Supabase Vault half plus `EDG_WEBHOOK_SECRET`. As a consequence, `EDG_WEBHOOK_SECRET` must never be rotated once staff details are saved (it would lock them). If it ever has to be rotated, first plan a re-encryption step.
- 2026-10-10 — **Atlas Universal Business OS: Ryan said "Go" to all 9 recommendations of the pre-development report** (Fusion EDG Core PR #40).
  1. Test builds stay automatic. Ryan approves going live and connecting a client's real accounts.
  2. No unified API (Apideck / Merge / Codat) for now. Look again at 10+ clients.
  3. Ask Intuit about Singapore eligibility before building QuickBooks.
  4. Gmail later. Start with forwarding plus Calendar and Sheets.
  5. Next build: the Software Knowledge Base and compatibility checker (Phase A1). **Done the same day: PR #41.**
  6. Zaphiel guides Ryan through the free developer accounts one at a time, starting with Xero.
  7. A lawyer prepares the PDPA data-processing agreement before the first real client. Zaphiel drafts the technical annex.
  8. Client workflows stay in the platform engine, not n8n Cloud. Zaphiel asks n8n in writing before any client workflow runs there.
  9. WhatsApp Embedded Signup (v4) after Meta verification. Start the Meta verification right after Xero.
