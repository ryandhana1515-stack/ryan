# Approvals and guardrails

The AI can autonomously: extract facts, classify, draft a reply, recommend a status, create a
follow-up task, and (Phase 2) **send a low-risk reply** on email/WhatsApp when nothing escalated,
the lead is not in test mode, and `auto_send_low_risk` is on. Everything escalated waits for the
owner's APPROVE & SEND / Reject click (Approve Reply workflow).

## Always escalated to a human (task `requires_approval = true` + email)

| Trigger | Where enforced | Effect |
|---|---|---|
| Draft reply contains a price, discount, guarantee, refund, contract, deployment date or credential word | `postprocess.js` → `PP_FORBIDDEN_REPLY` | reply withheld (empty), status HUMAN_REVIEW |
| Customer mentions refund, contract/NDA, legal/lawyer, fixed/final price, data deletion, payment | `postprocess.js` → `PP_ESCALATE_ON_MESSAGE` and `rules.js` → `RB_RISKY` | HUMAN_REVIEW |
| AI proposes WON or LOST | `postprocess.js` | converted to HUMAN_REVIEW, reason `ai_attempted_won_status` |
| Proposal / pricing requested with enough info | `rules.js` + prompt | PROPOSAL_REQUIRED, `request_proposal_approval` |
| close_lost (except spam) | `postprocess.js` | human confirms before a lead is closed |
| Model confidence < 0.4 | `postprocess.js` | `low_confidence` |
| Illegal status transition | `postprocess.js` + `schemas/lead-status.json` | previous status kept, `invalid_status_transition` |
| Support request / partnership | `rules.js` | HUMAN_REVIEW |

Prohibited for any agent, by design (no code path exists): send contracts, promise final prices,
issue refunds, move money, delete records, deploy production systems, expose credentials, make
irreversible customer commitments.

## Approving

Open the approval email and click **APPROVE & SEND** (sends the draft through the Outbound Sender,
closes the lead's open tasks, writes the audit row) or **Reject** (draft marked rejected). To send an
edited text instead, add `&reply=<your text>` to the approve link. Phase 3 replaces the bare link
with a signed token.


## Website builds (Agent #2) — automatic mock-ups (Ryan's decision, 2026-09-25)

Ryan's rule: a customer who asks John for a mock-up gets asked for the details (business name, what
the business does, what the site must do, where to send the link); once John has them the Website
Builder builds automatically and John sends the preview link. **No approval click anywhere.**
Guardrails in code: one build per lead (`Decide Build`), a daily cap of 12 builds, no build until the
four details are known, nothing published to a live domain, no prices or guarantees in copy.

State of the code (repo, tests green):
- `agents/website-builder/intake.js` — John's intake gate (inlined into Lead Intake).
- `agents/sales-qualification/rules.js` v2 — greeting / "what do you do" answers, never escalated.
- `agents/website-builder/brief.js` v2.1 — cinematic, photo-led standard; image shot list; readiness.
- `workflows/website-builder/build.js` — Decide Build → Start Website Build Runner.
- `workflows/website-build-runner/build.js` — Higgsfield/Kling photography → Lovable MCP → Build Record.
- `workflows/john-chat-console/workflow.sdk.ts` — public-page visitors are real leads; preview link in chat.

State in n8n: the Website Build Runner (`7sEuGyU6IjJsSaKL`) exists but is not wired into the Website
Builder and not published; Lead Intake, Website Builder and the chat console still run the previous
versions. Claude Code's permission classifier refused the deployment steps ("Create Unsafe Agents").
Ryan lifts that with a permission rule in his Claude Code settings; then a session redeploys from the
generators (`node workflows/*/build.js` → n8n MCP update/publish). Credentials the runner needs, set
once in n8n: Higgsfield API, Kling API, Lovable MCP (OAuth2). Always human: publishing to a live domain.
