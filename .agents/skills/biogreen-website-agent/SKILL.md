---
name: biogreen-website-agent
description: >
  Bio Green Elixirs WEBSITE AGENT. Use this agent for ALL website and Shopify store
  tasks — building pages, product listings, landing pages, Shopify theme code,
  HTML/CSS, copy for web pages, and site structure for biogreenelixirs.com.
  Trigger when user says "website agent", "build the website", "Shopify", "landing page",
  "web page", "store setup", or "use website agent".
---

# Bio Green Elixirs — Website Agent

## Role
Build and manage biogreenelixirs.com Shopify store and all web pages.

## Store Details
- **Platform:** Shopify
- **Domain:** biogreenelixirs.com
- **Email:** info@biogreenelixirs.com
- **Theme Style:** Dark navy + cyan/teal (#00DCFF) + white — futuristic health tech

## Brand CSS Variables
```css
:root {
  --color-bg: #0a0e1a;
  --color-primary: #00DCFF;
  --color-accent: #00a896;
  --color-white: #ffffff;
  --color-text: #e0e6f0;
  --color-gold: #d4af37;
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

## Pages To Build

### 1. Homepage
- Hero section: "Clearing The Way To Optimum Health"
- BIO N:OV product feature with key stats
- 5 benefits section with icons
- Science/proof section with lab data
- Testimonials carousel
- CTA: Shop Now button

### 2. Product Page — BIO N:OV
- Full product listing
- Clinical data (blood pressure -25% in 30 min)
- Comparison table vs competitors
- Ingredients breakdown
- FAQ section
- Add to Cart + Buy Now buttons
- Price: [set by Ryan]

### 3. Science Page
- 3rd Generation NO supplement explanation
- Patented fermentation technology (KACC91554P)
- Lab results infographic
- 8 Korean university professor credentials
- GMP + US Patent badges

### 4. About Us Page
- Bio Green Elixirs story
- Ryan Dhana + Singapore entity
- Mission: Global health distribution
- ACRA registered business

### 5. Affiliates Page
- GoAffPro affiliate program
- 15-25% commission explained
- Join form embed
- Recruitment pitch

### 6. Contact Page
- info@biogreenelixirs.com
- Contact form
- Social media links

## Shopify Apps To Install
```
Easyship        — Global shipping calculator
GoAffPro        — Affiliate program management
Loox            — Photo reviews with stars
Tidio           — AI customer service chat
Klaviyo         — Email marketing automation
Meta Pixel      — Facebook ad tracking
TikTok Pixel    — TikTok ad tracking
```

## Payment Gateways
- Stripe (global credit cards)
- PayPal (US/EU buyers)
- Shopify Payments (Singapore)

## Shopify Liquid Snippets

### Product Hero Section
```liquid
<section class="hero" style="background: var(--color-bg);">
  <div class="hero__content">
    <h1 class="hero__title">{{ product.title }}</h1>
    <p class="hero__subtitle">3rd Generation Nitric Oxide Supplement</p>
    <div class="hero__stats">
      <div class="stat">
        <span class="stat__number">25%</span>
        <span class="stat__label">Blood Pressure Drop</span>
      </div>
      <div class="stat">
        <span class="stat__number">30 min</span>
        <span class="stat__label">Time To Work</span>
      </div>
      <div class="stat">
        <span class="stat__number">400%</span>
        <span class="stat__label">More Effective</span>
      </div>
    </div>
    <a href="#buy" class="btn btn--primary">Order Now</a>
  </div>
  <div class="hero__image">
    {{ product.featured_image | img_tag: 'large' }}
  </div>
</section>
```

## Compliance Rules For Website Copy
- NEVER say: "cure", "treat", "diagnose", "prevent disease"
- ALWAYS say: "support", "promote", "help maintain", "may help"
- Include disclaimer: "These statements have not been evaluated by the FDA."
- Add: "Consult your healthcare provider before use."

## SEO Keywords To Target
- "nitric oxide supplement Singapore"
- "blood pressure supplement natural"
- "Korean health supplement"
- "BIO N:OV"
- "Bio Green Elixirs"
- "nitric oxide supplement 40 plus"
