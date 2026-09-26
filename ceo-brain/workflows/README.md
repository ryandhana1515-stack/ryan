# Workflows (all on https://ryan1515.app.n8n.cloud, project uFcEmgtYEFyGauyy)

| Workflow | n8n id | Trigger | Status (2026-09-25) |
|---|---|---|---|
| **CEO Brain — Lead Intake** | `b7kbJpnKLN2uQxyn` | `POST /webhook/ceo-brain/lead` | published, 26 nodes. Phase 2 version: John persona + FusionTech context, auto-send gate, approve links |
| **CEO Brain — Outbound Sender** | `SAcnNxG1GWPwn3N7` | sub-workflow (called by Lead Intake + Approve Reply) | published. Email via Gmail works; WhatsApp resolves to `failed` until the WhatsApp credential exists |
| **CEO Brain — Approve Reply** | `uQxHTTdEkazgKpRT` | `GET /webhook/ceo-brain/approve?decision=approve\|reject&message_id=&lead_id=[&reply=]` | published |
| **CEO Brain — WhatsApp Inbound** | `3IhIJ5IYsB7wQQSg` | `GET/POST /webhook/ceo-brain/whatsapp` (Meta verify token `ceo-brain-verify`) | published; Meta is NOT pointed at it yet |
| **CEO Brain — Daily Brief** | `Pew2PX1IcgdXqXr7` | daily 08:00 SGT | published; first run emailed 2026-09-25 |
| **CEO Brain — Website Builder** (v2) | `hSTRGnHVsu6tMOmH` | sub-workflow (called by Lead Intake's "Website Requested?" gate, fire-and-forget) | published; v2 verified 2026-09-25 (execution 209 via the Trainer API: dental clinic → medical mode, verification list, QA checklist). 12 nodes: prompt → design standard + playbook from the vault → compose → Claude → finalize → task → run → audit → email. Source: `website-builder/build.js` |
| **CEO Brain — Discovery Console** | `9TnzsgPGRatMaQI3` | hosted chat https://ryan1515.app.n8n.cloud/webhook/40d1b87c-1ec4-4534-ac80-bbdeef475d23/chat | published 2026-09-25. Company Discovery & Onboarding Agent: map from `ceo_company_maps` → brain + discovery playbook from the vault → Claude → finalize (merge, guardrails, rules fallback) → save map → run log → vault note `Discovery/<map_id>.md` (create/update) → when complete: proposal task + owner email → reply. Source: `discovery-console/build.js` |
| **Zaphiel — Website Build Worker** (Claude routine, not n8n) | `trig_01K4UinSX4tQWK537MeHQuuc` | hourly; reads `ceo_tasks` status `building`, skips test leads, Higgsfield photos → Lovable project → POST website-built | created 2026-09-26; needs Ryan to attach the n8n/Lovable/Higgsfield/Kling connectors in claude.ai → Routines. Replaces the n8n Website Build Runner `7sEuGyU6IjJsSaKL` (unpublished: Lovable blocks hosted OAuth clients). Source: `agents/website-build-worker/ROUTINE.md` |
| **CEO Brain — Website Build Record** | `RVPBGpBzj2SUQlgX` | `POST /webhook/ceo-brain/website-built` {task_id, lead_id, status built\|build_failed\|skipped_test_mode, project_id, preview_url, editor_url, notes, actor} | published; verified 2026-09-25 (execution 184). Updates the `website_build` task, audits, emails the owner the preview. Endpoint for whichever agent session performs the Lovable build |
| **CEO Brain — John Chat Console** | `ny60ozvH8B4uNpcb` | hosted chat https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat | published; verified 2026-09-25 (execution 177). Source: `john-chat-console/workflow.sdk.ts` |
| **CEO Brain — Trainer API** | `zKqlk05WShUOrojw` | `POST /webhook/ceo-brain/trainer` {pin, action list\|playbook\|train\|chat, agent, text, session} | published; verified 2026-09-25 (executions 189–191). Backend of the Training Room: reads the agent registry and playbooks from the vault, writes "Lessons learned" lines into the playbook notes, relays chat to John (chat console) and the Website Builder (brief). PIN lives only in the Trainer Config node. Source: `trainer-api/workflow.sdk.ts` |
| **CEO Brain — Chat with John (public page)** | `FngKsJ2x0AaWOdJl` | `GET /webhook/ceo-brain/chat` → https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat | published 2026-09-25. Public "Talk to John" page: the @n8n/chat widget pointed at the John Chat Console. The same widget for FusionTech.com.sg is in `website-chat/embed-snippet.html`. Source: `website-chat/build.js` |
| **CEO Brain — Website Build Runner** | `7sEuGyU6IjJsSaKL` | called by the Website Builder (Execute Workflow) | **created 2026-09-25, NOT yet wired or published** (Lead Intake v2 and the chat console update ARE deployed, 2026-09-26) (Claude Code permission block). Photography via Higgsfield API (Kling fallback) → Lovable MCP create_project (OAuth) → poll → POST /webhook/ceo-brain/website-built. Needs n8n credentials: Higgsfield API (header), Kling API (header), Lovable MCP (OAuth2). Source: `website-build-runner/build.js` |
| **CEO Brain — CEO Orchestrator** (Agent #0) | `8Ix4yc223sxrSu5h` | `POST /webhook/ceo-brain/event` {type, source, lead_id, task_id, summary, severity, correlation_id, payload, test_mode} + hourly (`7 * * * *`) | published 2026-09-26; verified (execution 288: test `website.build_failed` → exception task `task_exc_…`, audit row, JSON response, Management view note created in the vault, run logged; no email in test_mode). Routing table + issue logic in `agents/ceo-orchestrator/orchestrator.js`. Source: `ceo-orchestrator/build.js` |
| **CEO Brain — Approval Inbox** | `r4ynzcSqRy8zHoFl` | `GET /webhook/ceo-brain/inbox` (page) · `POST` same path {pin, action close\|recover\|reopen\|cancel, task_id, note} | published 2026-09-26; verified (executions 289–291: page renders approvals with Approve/Reject links through Approve Reply, exceptions with Mark recovered; wrong PIN → 403; recover → task status + audit). PIN only in the "Inbox Config" node. Source: `approval-inbox/build.js` |
| **CEO Brain — Website Intelligence** (internal agent, ADR-3) | `5VWP3tMK3MZysi7w` | sub-workflow: called by Lead Intake's "Website Requested?" gate (renamed node "Hand Off to Website Intelligence"); same 15 inputs as the Website Builder | published 2026-09-26; verified end to end (Lead Intake 298 → Website Intelligence 300 → Website Builder 301 → Orchestrator task `task_evt_…`). Plan 6 searches → Browserbase search/fetch (n8n Gateway credits) → identify the company → fact ledger → Ryan's role prompt live from the vault → Claude → WEBSITE_CREATOR_BRIEF (deterministic fallback; never delays a mock-up) → Hand Off to Website Builder (`research_brief`, `research_json`) → event to the Orchestrator (`website.research` / `website.info_needed`). Source: `website-intelligence/build.js` |
| **CEO Brain — ATLAS** (EDG & CRM Systems Architect) | `9XQWSgTBszRc0Jxj` | sub-workflow: called by Lead Intake's "EDG Needed?" gate (`atNeeded`: named company + systems need beyond a website + one fact about how it works today); same 15 inputs as Website Intelligence | published 2026-09-26; verified (Lead Intake 354 → ATLAS 356). Once per lead → Ryan's agent file `.claude/agents/atlas.md` live from GitHub + runtime addendum → Claude, DESIGN mode checkpoint 1 (deterministic fallback) → approval task (`edg_design`) → run + audit → email Ryan → `edg.checkpoint_1` to the Orchestrator → five files into `zaphiel/vault/80_Clients/<slug>/edg/`. Source: `atlas/build.js` (inlines `agents/atlas/atlas.js`) |
| **CEO Brain — Training Dashboard** | `AM59goLdbt0clv8q` | hosted page https://ryan1515.app.n8n.cloud/webhook/ceo-brain/dashboard | published 2026-09-25. Serves `dashboard/index.html` (Training Room: talk by voice/text, teach, read playbooks). Source: `dashboard/build.js` → `dashboard/dist/dashboard.sdk.ts` |

## How the pieces talk

```
channel adapter (WhatsApp Inbound, website form, …)
   └─POST─► Lead Intake ─► Sales Agent "John" ─► guardrails ─► tables
                 ├─ company needs CRM / automation → ATLAS (checkpoint 1 files + approval task) ─► Ryan
                 ├─ customer asks for a website → Website Intelligence (research, fact ledger, WEBSITE_CREATOR_BRIEF) ─► Website Builder ─► brief + task ─► email owner
                 ├─ low risk & not test → Outbound Sender ─► Gmail / (WhatsApp when credential exists)
                 └─ needs human → email to owner with APPROVE & SEND / Reject links
                                        └─click─► Approve Reply ─► Outbound Sender ─► tables + audit
Daily Brief (08:00) ─► reads tables ─► CEO Intelligence Agent ─► email to owner
any workflow ─POST /webhook/ceo-brain/event─► CEO Orchestrator ─► routing table ─► exception/review tasks + audit (+ email on failures)
                                        └─hourly─► unresolved-issues list ─► vault 00_CEO_Brain/Management view.md
Approval Inbox (browser, /webhook/ceo-brain/inbox) ─► approvals → Approve Reply · exceptions → Mark recovered (PIN) ─► ceo_tasks + audit
Training Dashboard (browser) ─► Trainer API ─► vault (registry, playbooks) / John Chat Console / Website Builder / any agent chat_url (Discovery Console)
Discovery Console (owner chat) ─► Discovery Agent ─► ceo_company_maps + vault Discovery/<map>.md ─► proposal draft + review task + email
```

## Source of truth

- **Lead Intake** is generated by `lead-intake/build.js` from `agents/`, `prompts/` and `schemas/`
  (`npm test` runs the same Code-node JS that is deployed). `dist/expected-params.json` is what
  the deploy step diffs against the live workflow; `dist/lead-intake.n8n.json` is an importable
  export. **Never hand-edit Code nodes in n8n.**
- **Website Builder** is generated by `website-builder/build.js`, the **Discovery Console** by
  `discovery-console/build.js`, the **CEO Orchestrator** by `ceo-orchestrator/build.js`, the **Approval
  Inbox** by `approval-inbox/build.js` (both inline `agents/ceo-orchestrator/orchestrator.js`) and **Website
  Intelligence** by `website-intelligence/build.js` (inlines `agents/website-intelligence/research.js`) (same pattern: agent JS + prompts + schemas inlined). **John Chat Console** is
  the static `john-chat-console/workflow.sdk.ts`; **Vault Writer** and **Trainer API** are static
  `workflow.sdk.ts` files too. The **Training Dashboard** page is generated by `dashboard/build.js`,
  which inlines `dashboard/index.html` into `dashboard/dist/dashboard.sdk.ts`. All were created with
  `create_workflow_from_code`.
- The four earlier Phase 2 workflows were built as Workflow-SDK code through the n8n MCP in the Claude
  session and live in n8n. The permission classifier blocked writing the sender's SDK source into
  this repo during that session, so their source of truth is n8n itself for now; export them with
  the n8n MCP (`get_workflow_details`) into `<workflow>/dist/` when the repo is next updated.

## Deploying a change to Lead Intake

```
node workflows/lead-intake/build.js && node tests/run-tests.js
```
then, in a Claude session with the n8n MCP: `validate_workflow` on `dist/lead-intake.sdk.ts`, apply
the changed node parameters with `update_workflow` (or recreate), publish, and re-run the
verification script (compare deployed `jsCode`, system prompt, Gmail message and config against
`dist/`).

## Payload switches

- `test_mode: true` — rows flagged test, email subject `[TEST]`, **nothing is ever sent** (sender skips).
- `ai_mode: "mock"` — rule engine only, no AI credits.
- `Workflow Config.auto_send_low_risk` — `"true"` (default) sends non-escalated replies automatically; set `"false"` to make every reply wait for approval.
- The lead webhook has **no** `ignoreBots` option on purpose: it is an API endpoint called by other n8n
  workflows (chat console, WhatsApp adapter) whose HTTP client n8n would otherwise reject with 403.
