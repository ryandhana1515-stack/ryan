# Marketing — Ad Actions (n8n `oMMIvt8PZOmUp24K`)

The **only** place an ad change reaches Meta (marketing autopilot, Ryan 2026-10-13). The daily Claude routine decides
what to do with `agents/marketing/autopilot.js`; this fixed workflow re-reads Meta live and re-checks every action with
`apGuardAdAction` right before the write. No AI model ever calls an ad platform directly.

**Unpublished on purpose:** it has no public URL. The routine runs it through the n8n MCP `execute_workflow`
(`executionMode: "manual"`, trigger `Ad Action In`, `webhookData.body` = one of the bodies below). Do not publish it.

## Two modes (one per run)

| Body | What happens | Answer |
|---|---|---|
| `{ mode: 'state', ad_account_id: 'act_…', currency_offset: 100 }` | Reads campaigns + ad sets. **Read-only**, no ledger rows. | `{ ok, account_daily_total, ads: { <campaign id>: { name, status, budget_id, daily_budget } } }` (the `live` input of `apAdPlan`) |
| `{ settings, action: { key, type, ad_id, budget_id, from, to, why }, ad_account_id, currency_offset }` | Ledger lookup by key → live object + account budgets → **Guard** → (allowed) POST to Meta → read back → ledger row | `{ ok, status: done\|failed\|refused, reason, read_back, key, ledger_written }` |

- `type` is `pause_ad` (POST `{ad_id}` `status=PAUSED`; works for a campaign, ad set or ad id) or `set_daily_budget`
  (POST `{budget_id}` `daily_budget=round(to × currency_offset)`; a campaign id for CBO, else the ad set id).
- State mode, campaign level: a campaign with its own daily budget → `budget_id` = campaign id; otherwise exactly one
  active ad set with a daily budget → that ad set; otherwise `budget_id`/`daily_budget` = null. `status` is `ACTIVE`
  only when Meta's `effective_status` is `ACTIVE`. `account_daily_total` = daily budgets of ACTIVE campaigns (CBO) +
  ACTIVE ad sets, in currency units (Meta's cents ÷ `currency_offset`).
- Extra checks on top of the guard: the object must belong to `ad_account_id` (and to the brand's `ads.ad_account_id`
  when the settings name one), the ledger must be readable, and more than one page (500) of campaigns or ad sets means
  "unknown total" → refused.
- Ledger (`mk_autopilot_ledger`): done/failed rows use the action key and kind `ad`; refusals use
  `<key>|refused|<ts>` and kind `ad_refused`, so a refusal never blocks (`apHasKey`) or starts a cool-down (`apAdPlan`).
  `failed` never blocks a retry.

## Build, test, deploy

```
node ceo-brain/workflows/marketing-ad-actions/build.js   # -> dist/marketing-ad-actions.sdk.ts + dist/code-nodes/*.js
node ceo-brain/tests/run-tests.js                        # section [41]
```

Code nodes are generated from `agents/marketing/autopilot.js` (guard) and `agents/marketing/meta-live.js` (Meta
parsing). Never hand-edit them in n8n: change the repo, rebuild, test, redeploy the SDK source with the n8n MCP.

## Needs from Ryan (once)

A Meta **System User token** with `ads_management` on the ad account, added in n8n as a **Facebook Graph API**
credential, then selected on the five Meta nodes (Read Campaigns, Read Ad Sets, Read Live, Apply, Read Back). Until
then a run either stops on the missing credential or is refused ("could not be read"); nothing reaches Meta.
