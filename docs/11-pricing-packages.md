# 11. Pricing & White-Label Package Design

Goal: maximize *number of businesses on the platform* (traction drives
valuation) while keeping every account profitable and safe (usage caps).
Modeled on the GoHighLevel playbook, priced below it, differentiated by the
AI-employee layer.

## 11.1 Unit economics (the floor under every price)

Per active business account, monthly cost to us:

| Cost | Range (USD) |
|---|---|
| AI usage (OpenRouter) — light user | $5–15 |
| AI usage — active user (daily leads + content) | $20–60 |
| Infra share (server, DB, storage) | $1–3 |
| Media generation (fal.ai), if used | $2–10 |
| WhatsApp/voice usage | passed through or capped |

**Rule: every plan's price ≥ 3× its worst-case included cost.** Profit comes
from caps: each plan includes an AI-usage allowance; heavy use upsells.

## 11.2 Direct plans (selling to businesses ourselves)

| | **Starter** | **Growth** | **Scale** |
|---|---|---|---|
| Price | **$49/mo** | **$149/mo** | **$399/mo** |
| AI employees | Sales + Support + Content | All 15 | All 15 |
| AI actions*/mo | 500 | 2,500 | 10,000 |
| Channels | WhatsApp + webchat | + Instagram, FB, TikTok | + AI Voice calling |
| CEO dashboard | ✔ | ✔ | ✔ |
| Knowledge base docs | 20 | 200 | Unlimited |
| Users | 2 | 10 | Unlimited |
| Support | Community | Email | Priority + onboarding call |

*One AI action = one agent reply/task. Overage: $10 per extra 500 actions
(auto-purchase toggle, hard stop otherwise).

Annual = 2 months free. 14-day free trial, no card for trial (abuse-capped:
50 AI actions).

## 11.3 White-label / reseller plans (the growth engine)

The reseller (agency, consultant, marketer) gets the whole platform under
THEIR brand: their logo, their domain, their prices, their Stripe.

| | **Reseller** | **Reseller Pro** |
|---|---|---|
| Price | **$297/mo** | **$497/mo** |
| Client accounts included | 5 | 20 |
| Extra client accounts | **$25/account/mo** | **$19/account/mo** |
| Rebrand (logo, domain, colors) | ✔ | ✔ |
| They set their own prices | ✔ | ✔ |
| Reseller admin dashboard | ✔ | ✔ |
| Industry template packs | 3 | All |
| White-label onboarding videos | — | ✔ |

- The "$20–30" price point lives HERE: resellers pay ~$19–25 per client
  account and typically charge their clients $99–299 — their margin, our
  volume. A Pro reseller with 20 clients pays us ~$497–880/mo.
- Each client account carries the same AI-action caps as Starter (reseller
  can buy bumps). This keeps the floor intact at scale.

## 11.4 Multi-language (Asia-first rollout)

- **Agent conversations:** already language-aware — agents answer in the
  customer's language (Malay, Indonesian, Thai, Chinese, Japanese, Spanish,
  ... come free with the LLM). Tenant sets a default + allowed list.
- **Product UI & landing pages:** ship EN + MS + ID + TH + ZH first
  (Singapore/Malaysia/Indonesia/Thailand), then JA, ES, VI. UI strings are
  a translation dictionary — adding a language is a file, not a rebuild.
- **Template packs per market:** localized SOPs, sales scripts, and content
  calendars (e.g. Ramadan/Hari Raya campaign pack, 11.11 pack).

## 11.5 The valuation math (honest version)

SaaS companies sell for roughly **5–10× annual recurring revenue** (ARR);
exceptional AI-growth stories higher. Reaching a $50–100M valuation means
roughly **$8–15M ARR**, i.e. ~4,000–8,000 paying business accounts at a
~$150 average. The reseller channel is how you get thousands of accounts
without thousands of your own salespeople.

What buyers pay for in due diligence:
1. ARR + growth rate + net revenue retention (upgrades > churn)
2. Usage depth (AI actions/account — proves the product is alive)
3. Gross margin (why the caps in §11.2 matter)
4. **Clean data practice** — PDPA/GDPR compliance, consent records, tenant
   isolation. Personal customer data is never a sellable asset; *aggregate*
   traction metrics are. Cutting corners here cuts the sale price.

## 11.6 Rollout order

1. Prove it on Brow Revolution (case study + numbers).
2. Direct plans to 10–20 SG/MY beauty businesses (manual onboarding, learn).
3. Build self-serve onboarding + billing (Phase 4 of the roadmap).
4. Launch reseller program with the beauty-industry template pack.
5. Expand packs per vertical + language per market.
