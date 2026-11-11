# BIO N:OV — Shopify product page

A high-conversion product page for **BIO N:OV**, the 3rd generation Korean nitric
oxide booster distributed by Bio Green Elixirs (exclusive via Bzzworld).

Built as a standalone React + Vite + TypeScript + Tailwind site so the build output
can be dropped into a Shopify section. Every asset is local: no CDN scripts, no
Google Fonts request, no external image host. The only outbound call the page is
meant to make is the Shopify add-to-cart form, which ships as a clearly marked
placeholder.

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check then emit to dist/
npm run preview    # serve the built bundle
```

## Measured results

Lighthouse 12, built bundle served with brotli (as a CDN would):

| Preset  | Performance | Accessibility | Best practices | SEO |
| ------- | ----------- | ------------- | -------------- | --- |
| Desktop | 100         | 100           | 100            | 100 |
| Mobile  | 91          | 100           | 100            | 100 |

Verified at 375px, 768px and 1280px with no horizontal overflow and no console
errors. Also verified under `prefers-reduced-motion: reduce`, where no content is
left invisible and the scroll-scrubbed sections render in their final state.

> Serve the bundle with compression. Uncompressed, the JS is 210 KB rather than
> 65 KB, which costs roughly 12 mobile performance points on its own.

## Page structure

Section order matches the brief, one component per section in `src/components`:

1. `Hero` — abstract vessel-flow canvas behind the product, parallax tilt on pointer
   move, pulse-glow CTA, star rating and the "8 Korean university professors" line
2. `IngredientMarquee` — the 9 hero ingredients, auto-scrolling, pause on hover
3. `TrustBar` — GMP, HACCP, ISO 22000, Korea Patent as one slim monoline row
4. `ProblemFraming` — NO decline vs age, self-drawing SVG line and area chart
5. `DiseaseGrid` — the six body systems, stagger-revealed
6. `StatBand` — 537M / 1.28B / 15M counters, animate once on first view
7. `VesselSection` — full-bleed cinematic band, parallax, +18% / +42% / -25%
8. `GenerationCompare` — 1st and 2nd gen muted, 3rd gen elevated and glowing
9. `ExplodingTablet` — scroll-scrubbed particle assembly with rotating dashed ring
10. `FiveWays` — blood pressure, blood sugar, vigor, aging (telomere diagram), skin
11. `RawMaterials` — four materials orbiting a centre badge with connecting lines
12. `ScienceTeam` — R&D lead, medical board head, six professors
13. `Certificates` — strain KACC91554P, placeholder plates, lightbox
14. `PricingBundles` — three selectable packs, gift ladder, totals, add to cart
15. `Testimonials` — swipeable carousel, autoplay with pause on hover and focus
16. `UsageStorage` — 3 times per day, 1 tablet per time, storage notes
17. `BuyCTA` — final conversion band with floating product and trust checklist
18. `Footer` + `StickyMobileBar` — thumb-reach price and CTA below `lg`

All copy and figures live in `src/data/product.ts`, sourced from the official
BIO N:OV brand deck with page references in the comments. Change numbers there,
not in components.

## Wiring up Shopify

`AddToCartButton` renders the real form the Liquid wrapper takes over:

```html
<form data-shopify-buy>
  <input type="hidden" name="id" value="{{ variant_id }}" />
  <input type="hidden" name="quantity" value="1" />
  <button type="submit">Add to Cart</button>
</form>
```

Three steps to make it live:

1. Put the real variant ids in the `variantId` field of each pack in
   `src/data/product.ts` (currently `TODO_VARIANT_ID_PACK_*`).
2. Point the form at `/cart/add` (or attach the Buy Button SDK) in
   `src/components/AddToCartButton.tsx`.
3. Remove the `event.preventDefault()` in that file's `onSubmit`. It exists only so
   the standalone build can demo the success animation.

The pack the shopper picked is shared through `SelectionContext`, so the pricing
cards, the sticky mobile bar and the final CTA always submit the same variant.

`vite.config.ts` sets `base: './'`, so every emitted asset URL is relative and the
bundle works from a Shopify asset sub-path without rewriting.

## Motion

Reveals use a small `useReveal` intersection-observer hook plus CSS transitions
rather than an animation library, which keeps the runtime dependency list at React
alone. Counters and charts animate once on first view and never re-run on scroll-up.

`VesselCanvas` is one particle system shared by the hero and the vessel section so
the two read as a continuous visual language. It blits pre-baked glow sprites
instead of building a gradient per particle per frame, idles when scrolled out of
view, halves its particle count on phones, and starts on the first idle callback so
it never delays first paint.

Everything non-essential is disabled under `prefers-reduced-motion: reduce`.

## Open TODOs before launch

- **Pricing** is provisional. Confirm retail prices and the discount ladder once
  landed cost and margin are set (`PACKS` in `src/data/product.ts`).
- **Testimonials** are placeholders marked `TODO: reviewer name`. Replace with real
  verified reviews. Do not publish invented medical outcomes.
- **Certificate images** are generated placeholder plates. Swap in the real patent,
  GMP, HACCP and ISO 22000 scans in `src/components/Certificates.tsx`.
- **Professor portraits** render as monogram plates until Bzzworld supplies photos.
- **Footer social links** point at `#`.
- **Aggregate rating** in the testimonials header is static text; wire it to the
  reviews app once one is installed.

## Compliance note

Lab-derived claims carry the required disclaimer inline, and the footer carries the
standard FDA-style statement. Both live in `src/data/product.ts` (`LAB_DISCLAIMER`
and `LEGAL_DISCLAIMER`) so legal can edit them in one place.
