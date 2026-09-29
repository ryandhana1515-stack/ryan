---
tags: [zaphiel, open-loops]
---
# Open loops

- **Ryan:** top up n8n AI credits (John and the Website Builder are on rule fallbacks).
- **WhatsApp is live for testing (2026-09-27).** Meta app "AI AGENTS" (1415986013818104) on Ryan's Meta business
  portfolio; free Meta test number (phone number ID `1321607761025022`, WhatsApp account `1034122678981935`); n8n
  credential "WHATSAPP FUSION TECH"; webhook → `/webhook/ceo-brain/whatsapp`, field `messages`; Outbound Sender sends
  WhatsApp. Ryan talked to John on it the same night.
- **Ryan (decision):** the old Bio Green app "Test" (1349701273957004) is still subscribed to this WhatsApp account and
  its n8n sandbox (`eS8K8Si0VqToZajp`, /webhook/whatsapp-in) also receives every message. Its key is expired so it
  cannot reply today; unsubscribe it before real customers use the number (Zaphiel can do it on Ryan's word).
- **Ryan (before real customers):** register FusionTech's own WhatsApp business number (the test number only reaches 5
  verified phones, and it sits under the Ryan Dhana/Foodblock portfolio); then Zaphiel swaps the phone number ID.
- **Done 2026-09-26 23:38 SGT:** Ryan attached n8n, Lovable, Higgsfield and Kling to the routine "Zaphiel —
  Website Build Worker". The mock-up chain is fully wired. The real test is Ryan through John on WhatsApp.
  Still optional for Ryan: delete the half-made "Lovable MCP (OAuth2)" credential in n8n and the test project
  "Sunrise Dental Clinic" in Lovable.
- ~~**Zaphiel:** John promised "10 to 15 minutes" for the mock-up~~ — done 2026-09-28: John now says "usually within
  about an hour" (Ryan: "change it to accurate timing").
- **Ryan:** paste `ceo-brain/website-chat/embed-snippet.html` into FusionTech.com.sg before `</body>`
  so visitors talk to John there; until then use https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat.
- **Ryan:** open the Training Room once (https://ryan1515.app.n8n.cloud/webhook/ceo-brain/dashboard),
  enter the PIN, allow the microphone, and change the PIN in n8n ("CEO Brain — Trainer API" →
  Trainer Config node) from the repo default.
- **Zaphiel:** after credits: run a real conversation, confirm John answers with Claude and the
  Leads/ note fills in with names and facts.
- **Ryan:** the directive message was cut off after "Client" in Part 26 — send the rest (the second
  client example and anything after it).
- **Ryan:** run one real discovery in the Discovery Console and correct the agent in
  [[Knowledge/Company Discovery — playbook]]; approve or reject the first proposal draft task.
- **Zaphiel (after credits):** Website QA inspection of a built Lovable preview (the checklist exists;
  the inspection needs a built site); Solution Architect, Customer Service, Email/Admin, Marketing,
  Operations, Finance Assistant agents in the same contract; Supabase migration (002 is ready).

## From Build Prompt v3 (2026-09-25) — Ryan's items
- **Ryan:** put the two PDFs (Blueprint, Review v2) into `zaphiel/vault/_sources/`; Zaphiel then copies the MUST DO / MUST NOT DO word-for-word into all 25 agent/worker notes.
- **Ryan:** review Phase 1 (the new folders) and say "continue" — or correct anything.
- **Ryan:** approval authority: who approves what (Ryan, Dad, client owner) and money limits → [[40_Registries/Agent_Permission_Matrix]] human approvers table.
- **Ryan:** choose the core stack for the first package (CRM, WhatsApp provider, dashboard, hosting) and create/authenticate the accounts; then say which integrations are `tested` so the [[40_Registries/Integration_Registry]] moves off `planned`.
- **Ryan:** pick the first pilot client (Bio Green Elixirs or Brow Revolution) and set the package price (proposal only, never in an agent).
- **Zaphiel (Phase 2, after Ryan's "continue"):** Solution Architect output (phased target architecture per client), onboarding steps 5–8 design detail, the first `80_Clients/` folder for the pilot, skill-pack extraction.
- **(Ryan)** Change the Approval Inbox PIN in n8n ("CEO Brain — Approval Inbox" → node "Inbox Config"); it
  starts as the same default as the Trainer PIN. Open https://ryan1515.app.n8n.cloud/webhook/ceo-brain/inbox
  once and press "Mark done" on the old test approval ("build MEDICAL business website for Dashboard tester").
- Next session: make Lead Intake, Website Builder, Build Record and the Build Runner post their events
  (`lead.human_review`, `website.brief`, `website.built`, `website.build_failed`, `workflow.failed`) to
  `POST /webhook/ceo-brain/event` so the Orchestrator sees every hand-off, not only the tables (Website
  Intelligence already does).
- ~~**(Ryan)** Top up the n8n Gateway credits~~ — paid 2026-09-26.
- Next: John reads open `website.info_needed` tasks and asks the customer in his own voice; Build Record sends
  `MOCKUP_READY` to John.
- ~~**Ryan (decision):** OK the plan to merge ATLAS into [[10_Agents/07_CRM_Architect]]~~ — done 2026-09-26 (Ryan: "ok merge"), see ADR-4 in [[Decisions]].
- ~~**Ryan:** top up n8n AI (Gateway) credits for ATLAS~~ — paid 2026-09-26; ATLAS runs on Claude Sonnet 5.
- **Zaphiel (next session):** ATLAS checkpoint 1 → 2 is manual for now: after Ryan confirms in the Approval Inbox, run
  the `atlas` subagent in Claude Code on `80_Clients/<company>/edg/` to continue. John already asks ATLAS's questions automatically (live 2026-09-26).
- ~~**Waiting for Ryan's Gateway top-up**~~ — done 2026-09-26: Ryan paid; Website Intelligence (funnels, sales
  strategy, 3D motion, realistic anatomy) and the Website Creator upgraded and deployed, see [[Change log]].
- **Ryan (the real test):** message John on WhatsApp or the chat page as a real customer (e.g. a clinic with its
  website link, asking for a mock-up). John answers, Website Intelligence researches silently, the creator builds on
  Lovable + Higgsfield, and the Build Worker (hourly, stays on duty the whole hour) sends both links back through John.
  Test leads never spend Lovable/Higgsfield credits, so this first real build is the proof.

- **Done 2026-09-29 19:40 SGT (Ryan): Vercel is set up.**
  - Project `fusiontech-mockups` (`prj_6ITMtjlNrihYOwfvZqDB2Dsvn4xc`, Vite) exists, with Vercel Authentication off.
  - The Vercel connector is on the build worker routine.
  - Git is disconnected from `ryan`, `ryan-cgab` and `fusiontech-mockups`. Their automatic rebuilds on every vault
    sync had used all 100 of the Hobby plan's daily deployments.
- **Proof build approved by Ryan (2026-09-29 20:05 SGT).** The "Atelier Noir" scene film is made:
  - 7 keyframes and 6 Kling scenes (334 credits);
  - stored permanently on Higgsfield and wired into `ceo-brain/site-kit/media.json`.

  - Preview for Ryan (behind the Higgsfield sign-in):
    https://atelier-noir-preview.higgsfield.app/atelier.html. This is Higgsfield website `697a1947-…`, built in the
    Higgsfield sandbox; all 6 scenes were cut into frames.
  Zaphiel deploys it to `fusiontech-mockups` when the Vercel daily limit resets (2026-09-30 about 19:30 SGT),
  aliases it `atelier-noir-mockup.vercel.app`, and sends Ryan the link.
- **Zaphiel (after the daily limit resets, 2026-09-30 about 19:30 SGT):**
  - Deploy the kit demo to `fusiontech-mockups` as files.
  - Confirm the build fetches the engine and a Kling film.
  - Confirm the link opens with no login.
  - Then offer Ryan a proof rebuild of the suit brand.
- **Zaphiel:** the n8n Website Builder "Finalize Website Brief" node is behind the repo by the `WB_TRANSFORM` table
  (commit 4ac1556); two deploy attempts were blocked because the 114 KB code could not be passed as one tool
  argument. The build worker carries the same transformation table in its own instructions, so builds are not
  affected; deploy the node with the next Website Builder change.
- **Fusion Property AI (2026-09-30):**
  - Re-verify the 7 register rows marked NEEDS VERIFICATION, starting with CEA's guidance on AI/virtual staging and
    the developer artist's-impression rule. Singapore Statutes Online was down; top up Firecrawl credits first.
  - Ryan: source the first 30–50 floor plans, with permission, for the Phase 0 test set.
  - Decide whether John should hand floor plans to the agent (today it runs in Claude Code only).
- **Fusion EDG Core (2026-09-30):**
  - Ryan: create the empty private GitHub repo `fusion-edg-core`; Zaphiel then moves `fusion-edg-core/` there with its
    history. The connector cannot create repos.
  - Ryan: create a Supabase dev/staging project and connect it (never paste keys in chat). Then Zaphiel runs the
    migrations there and deploys the API to a Vercel preview (L3, needs Ryan's OK).
  - Production scheduling for the dispatcher and follow-ups: Vercel Cron or pg_cron, not n8n (execution limits).
  - The 8 n8n EDG templates sit inactive, pointing at a placeholder URL. Connect them to a client's API only after
    approval.
- **Fusion EDG Core, 2026-09-30 update:** the private repo is done (code moved, tests green). Next is Ryan's Supabase
  project + connector, then "OK staging".
- **Fusion EDG Core, 2026-09-30:** the Supabase dev database is live (Tokyo, FAKE data, 0 security findings). Next is
  staging: the API goes on a Vercel preview. Ryan says "OK staging", and he sets 2 secrets himself (the app database
  password, and EDG_WEBHOOK_SECRET in Vercel).
