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
| **CEO Brain — Website Build Record** | `RVPBGpBzj2SUQlgX` | `POST /webhook/ceo-brain/website-built` {task_id, lead_id, status built\|build_failed\|skipped_test_mode, project_id, preview_url, editor_url, notes, actor} | published; verified 2026-09-25 (execution 184). Updates the `website_build` task, audits, emails the owner the preview. Endpoint for whichever agent session performs the Lovable build |
| **CEO Brain — John Chat Console** | `ny60ozvH8B4uNpcb` | hosted chat https://ryan1515.app.n8n.cloud/webhook/4bc5f31c-c270-4d21-8895-59cf46ea70fb/chat | published; verified 2026-09-25 (execution 177). Source: `john-chat-console/workflow.sdk.ts` |
| **CEO Brain — Trainer API** | `zKqlk05WShUOrojw` | `POST /webhook/ceo-brain/trainer` {pin, action list\|playbook\|train\|chat, agent, text, session} | published; verified 2026-09-25 (executions 189–191). Backend of the Training Room: reads the agent registry and playbooks from the vault, writes "Lessons learned" lines into the playbook notes, relays chat to John (chat console) and the Website Builder (brief). PIN lives only in the Trainer Config node. Source: `trainer-api/workflow.sdk.ts` |
| **CEO Brain — Chat with John (public page)** | `FngKsJ2x0AaWOdJl` | `GET /webhook/ceo-brain/chat` → https://ryan1515.app.n8n.cloud/webhook/ceo-brain/chat | published 2026-09-25. Public "Talk to John" page: the @n8n/chat widget pointed at the John Chat Console. The same widget for FusionTech.com.sg is in `website-chat/embed-snippet.html`. Source: `website-chat/build.js` |
| **CEO Brain — Website Build Runner** | `7sEuGyU6IjJsSaKL` | called by the Website Builder (Execute Workflow) | **created 2026-09-25, NOT yet wired or published** (Claude Code permission block). Photography via Higgsfield API (Kling fallback) → Lovable MCP create_project (OAuth) → poll → POST /webhook/ceo-brain/website-built. Needs n8n credentials: Higgsfield API (header), Kling API (header), Lovable MCP (OAuth2). Source: `website-build-runner/build.js` |
| **CEO Brain — Training Dashboard** | `AM59goLdbt0clv8q` | hosted page https://ryan1515.app.n8n.cloud/webhook/ceo-brain/dashboard | published 2026-09-25. Serves `dashboard/index.html` (Training Room: talk by voice/text, teach, read playbooks). Source: `dashboard/build.js` → `dashboard/dist/dashboard.sdk.ts` |

## How the pieces talk

```
channel adapter (WhatsApp Inbound, website form, …)
   └─POST─► Lead Intake ─► Sales Agent "John" ─► guardrails ─► tables
                 ├─ customer asks for a website → Website Builder ─► brief + task ─► email owner (OPEN IN LOVABLE)
                 ├─ low risk & not test → Outbound Sender ─► Gmail / (WhatsApp when credential exists)
                 └─ needs human → email to owner with APPROVE & SEND / Reject links
                                        └─click─► Approve Reply ─► Outbound Sender ─► tables + audit
Daily Brief (08:00) ─► reads tables ─► CEO Intelligence Agent ─► email to owner
Training Dashboard (browser) ─► Trainer API ─► vault (registry, playbooks) / John Chat Console / Website Builder / any agent chat_url (Discovery Console)
Discovery Console (owner chat) ─► Discovery Agent ─► ceo_company_maps + vault Discovery/<map>.md ─► proposal draft + review task + email
```

## Source of truth

- **Lead Intake** is generated by `lead-intake/build.js` from `agents/`, `prompts/` and `schemas/`
  (`npm test` runs the same Code-node JS that is deployed). `dist/expected-params.json` is what
  the deploy step diffs against the live workflow; `dist/lead-intake.n8n.json` is an importable
  export. **Never hand-edit Code nodes in n8n.**
- **Website Builder** is generated by `website-builder/build.js` and the **Discovery Console** by
  `discovery-console/build.js` (same pattern: agent JS + prompts + schemas inlined). **John Chat Console** is
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
