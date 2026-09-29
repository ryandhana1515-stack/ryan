# Wow website playbook

Ryan, 2026-09-29: "teach the website agent how to build these crazy wow factor websites". The Edit Suits Co
mock-up was "quite too simple". Ryan's reference was a TikTok of a suit website where the scroll plays a film.

This note is what the build worker (Claude) reads before it builds any non-medical mock-up. Clinics are still
built on Lovable. The engine lives in the repo at `ceo-brain/site-kit/` and the sites are hosted on **Vercel**.
The doctrine still governs every build: [[Full Master Cinematic Website Agent 2026]].

## The one rule

A visitor must say "how did they do that?" within five seconds, on a phone. If the first screen could belong
to any template, the site is not finished.

## What makes the wow (in order of impact)

1. **One continuous transformation film, driven by the scroll.** One 15-second Kling shot from a start still
   to an end still (Kling `first_image` → `tail_image`). The scroll plays it forward and scrolling up plays it
   backwards. It must never be three stitched clips. Examples:
   - Suits: a bolt of wool → the finished suit.
   - Watches: parts on stone → the assembled watch.
   - Jewellery: molten gold → the ring.
   - Furniture: raw timber → the piece in a sunlit room.
   - Cars: a covered silhouette → the car in the light.
   - Restaurants: raw ingredients → the plated signature dish.
   - Property: the street → the front door → the living room → the view (legs chained end frame to start
     frame).
2. **The film is the hero and fills the whole screen on phones.** The copy rides on the film in chapters that
   rise and fade at set points: hero line → chapter 1 → chapter 2 → payoff line. It is never turned off on
   phones; only reduced-motion visitors see the poster.
3. **Typography as architecture.**
   - One display face at a huge size (clamp up to about 130px).
   - Headline words rise out of a mask, one after another.
   - One paragraph lights up word by word as the visitor scrolls through it (the manifesto).
4. **The page changes colour as you move.** Each section sets the page colour when it takes the screen
   (`data-bg`), so the page feels like one continuous space, not blocks.
5. **A pinned horizontal gallery.** Scrolling down moves a row of cards sideways. Use it for collections,
   cloths, models, rooms or menu courses. With no real photos, it is colour and texture only.
6. **Depth.** Layers move at different speeds (`data-parallax`). Panels wipe open (`data-reveal="clip"`).
   Cards stack on each other while pinned (`.stack`) for the "how it works" steps.
7. **A cinematic finish.**
   - Subtle film grain, a soft vignette, a few slow particles in the brand's metal tone, and glass cards for
     copy over the film.
   - A soft cursor that grows on links, and magnetic buttons.
   - An opening curtain with the brand name while chapter 1 loads.
8. **Motion with meaning.** Numbers count up (labelled if illustrative). A marquee band speeds up with the
   scroll. A thin progress line runs along the top.
9. **Real before generated.** The customer's own logo and photos come first, when the Website Intelligence
   report found them. Anything generated is labelled "Illustrative".
10. **Match one award-level reference.** Before designing, name one real site the industry admires (for
    example Awwwards Sites of the Day in that industry) and match its level of finish: spacing, type scale,
    restraint. Write that site in `docs/storyboard.md`. Never copy its content.

## What kills the wow (never do these)

- Stills that swap as you scroll ("photo, then inside, then another photo": Ryan's complaint about Smile
  Plus).
- A static photo section, stock-looking imagery, or a grey or untextured 3D model.
- The film turned off on phones.
- Three short clips glued together.
- Default fonts, centred everything, evenly spaced cards, generic gradients or emoji icons.
- Text over the film without a tint.
- Anything invisible without JavaScript: all copy is readable at rest.

## Recipe per industry (start here, then art-direct)

| Business | Film (first still → end still) | Signature sections |
|---|---|---|
| Suits / fashion | wool bolt → finished suit on an invisible form | cloth gallery (horizontal), fittings stack, word-lit manifesto |
| Watches | parts on black stone → assembled watch, light sweep | complications gallery, 360 turn only with a textured model |
| Jewellery | molten gold → finished ring throwing fire | stones gallery, the setting process stack |
| Furniture | raw timber and leather → the piece in a sunlit room | materials gallery, room-by-room chapters |
| Electronics | exploded parts → the device, screen lights up | spec counters, feature chapters |
| Cars / showroom | covered silhouette → the car revealed under light | model gallery, test-drive CTA |
| Property | street → door → living room → view (chained legs) | floor-plan stack, neighbourhood gallery |
| Restaurant / F&B | raw ingredients → the plated dish | menu courses gallery, reservation CTA |
| Any other business | the raw material → the finished result the customer buys | process stack, proof counters |

## How the worker builds it (short form; the full manual is `ceo-brain/site-kit/README.md`)

1. Copy `ceo-brain/site-kit` to `mockups/<slug>/`.
2. Rewrite `index.html` (and one `.html` per page) and `src/styles/brand.css` from the brief and art
   direction.
3. Put the Kling film URL and the customer's photo URLs in `media.json`.
4. Build locally, then run `deploy-plan.mjs`.
5. Deploy the files to the Vercel project `fusiontech-mockups`. No git is needed.
   - Vercel's build fetches the engine from the repo.
   - It also downloads the film, crops the Kling watermark and cuts the frames.
6. Name it `<slug>-mockup.vercel.app` and check the live page and the film.
