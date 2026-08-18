# 12. Launch Guide — Signups, Stripe Payments, and Your First Customers

How to go from "app is live" to "people sign up and money arrives",
step by step, with what exists today and what comes in Phase 4.

## 12.1 What is already built (today)

- **`/welcome`** — public marketing page, 12 languages, plan buttons.
- **`/signup`** — public signup form. Every submission becomes a **lead in
  YOUR OmniX tenant**, so YOUR Sales AI follows up with prospects of your
  software business (the product sells itself using itself). Bots are
  filtered by a honeypot field.
- **Stripe Payment Links slots** — set 4 environment variables and the
  signup success screen shows an "Activate my plan now" checkout button:
  `STRIPE_LINK_STARTER`, `STRIPE_LINK_GROWTH`, `STRIPE_LINK_SCALE`,
  `STRIPE_LINK_RESELLER`.

## 12.2 Stripe setup (one-time, ~30 minutes, no code)

1. Create account at **stripe.com** → business type: sole proprietor or
   your SG company (UEN) → connect your Singapore bank for payouts.
2. In Stripe: **Product catalog → Add product**, three times:
   - OmniX AI Starter — $49.00 USD, Recurring monthly
   - OmniX AI Growth — $149.00 USD, Recurring monthly
   - OmniX AI Scale — $399.00 USD, Recurring monthly
   (Optionally add a 14-day free trial on each price.)
3. For each product: **Create payment link** → enable "Collect customers'
   addresses" and "Allow promotion codes" → copy the link
   (`https://buy.stripe.com/...`).
4. In DigitalOcean → your app → **Settings → App-Level Environment
   Variables** → add the 3–4 `STRIPE_LINK_*` variables with those URLs →
   Save (the app redeploys itself).
5. **Test mode first:** Stripe has a test/live toggle. Do one fake
   purchase with card `4242 4242 4242 4242` in test mode, see it appear in
   the Stripe dashboard, then flip to live links.

## 12.3 What happens when someone buys (today's manual loop)

1. Prospect: `/welcome` → `/signup` → submits form.
2. Your Sales AI gets the lead instantly (approval queue / auto-reply) and
   follows up by email/WhatsApp.
3. Prospect clicks the Stripe link and subscribes → Stripe emails you +
   money lands in your Stripe balance → auto-paid-out to your bank.
4. **You onboard them (manual, ~30 min each, fine below ~20 customers):**
   - Create their tenant + agents (admin action / seed with their name)
   - Upload their services/prices/FAQs to their knowledge base
   - Set their brand kit (voice, banned words)
   - Send them their login + the 5-minute welcome video
5. Cancelations/refunds: handled inside Stripe dashboard.

## 12.4 Phase 4 (automated SaaS loop — built when demand proves out)

Stripe webhook `checkout.completed` → auto-create tenant → auto-send
welcome email with magic login link → in-app onboarding wizard → usage
metering per tenant → dunning emails on failed cards → self-serve plan
upgrades. (Architecture already supports it: multi-tenant DB + module
flags + per-tenant config.)

## 12.5 Launch checklist (this week)

- [ ] App live on DigitalOcean with database attached
- [ ] Custom domain: buy `omnixai.com`-style domain (or use
      `app.browrevolution.sg` subdomain) → DigitalOcean → Settings →
      Domains → follow DNS instructions
- [ ] Stripe live links in env vars
- [ ] Test the full loop yourself: signup → lead appears → pay (test mode)
- [ ] Put the `/welcome` link in your Instagram bio + TikTok + Facebook
- [ ] Record the demo video (script in doc 13) and pin it everywhere
- [ ] First 10 customers: personally message beauty-business owners you
      know — founder-led sales beats ads at the start

## 12.6 Positioning quick-reference

- One-liner: **"AI employees that run your business 24/7 — from $49/month."**
- Proof: your own Brow Revolution numbers (response time, bookings,
  no-show rate) — screenshot your dashboard weekly.
- Objection "I already use Respond.io / ManyChat": those are chat tools;
  OmniX is a whole AI team — sales, content, images, voice calls,
  finance reports, one dashboard.
