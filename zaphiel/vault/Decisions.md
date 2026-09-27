---
tags: [zaphiel, decisions]
---
# Decisions

Newest first. Agents and Claude sessions obey these; contradict one only after flagging it to Ryan.

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

