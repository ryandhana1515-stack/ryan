# Approvals and guardrails

The AI in Phase 1 can autonomously: extract facts, classify, draft a reply, recommend a status,
create a follow-up task. It cannot send anything to a customer.

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

Phase 1 approval is manual: read the email / the `ceo_tasks` row, then act (reply on the
channel yourself, or update the lead status in the `ceo_leads` table). Phase 2 adds an approve /
reject endpoint that flips the draft message to `approved` and sends it via the channel adapter.
