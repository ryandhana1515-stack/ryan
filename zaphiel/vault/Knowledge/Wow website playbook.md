# Wow website playbook

Ryan, 2026-09-29: "teach the website agent how to build these crazy wow factor websites". The Edit Suits Co
mock-up was "quite too simple". Our first kit demo, one film plus coloured boxes, was still "too simple, there's
nothing". Ryan's reference is the TikTok by EditsbyGhalib, "animated fashion tailoring website created for a brand".
It plays as a **sequence of cinematic scenes**, each driven by the scroll:
1. A glowing white shirt floats alone in a black void, its cuffs hovering apart ("The Art of …").
2. A waistcoat builds itself onto the shirt, and jacket panels fly in ("Structure Held Close").
3. The full suit appears on a man adjusting his cuff under a spotlight ("The Complete Silhouette").
4. Four men in different-coloured suits walk towards the camera at night ("A Language of Colour").
5. An extreme macro of horn buttons and pick-stitching.

The titles are big serif type, alternating left and right. Every shot shares one look: a black void, warm gold rim
light, low fog and a glossy floor. Ryan's own example of the same idea is a motorbike: it splits into its parts, the
parts float, it spins 360°, then "vroom".

This note is what the build worker (Claude) reads before it builds any non-medical mock-up. Clinics are still
built on Lovable. The engine lives in the repo at `ceo-brain/site-kit/` and the sites are hosted on **Vercel**.
The doctrine still governs every build: [[Full Master Cinematic Website Agent 2026]].

## The one rule

A visitor must say "how did they do that?" within five seconds, on a phone. If the first screen could belong
to any template, the site is not finished.

## What makes the wow (in order of impact)

1. **A scene film: 5–7 cinematic scenes, each scrubbed by the scroll, where the product builds itself.** Each
   scene is one Kling shot of 5–10 seconds, pinned full screen and played forward by the scroll (and backward on
   scroll-up). It fades through black into the next scene. Something new happens every one or two scrolls. The
   arc is always the same:
   - the product appears in parts or raw;
   - it assembles itself, layer by layer or part by part;
   - it is revealed whole (a hero shot or a 360 turn);
   - it comes alive: worn, driven, lived in or poured;
   - an extreme macro of the craft details;
   - the payoff with the call to action.

   **One look bible for every scene** makes the scenes read as one film, not a collage: the same void or set,
   light direction, colour grade, lens and fog. Write it once in `docs/storyboard.md` and put it at the start of
   every scene prompt.

   **Keyframes first:**
   - Make every scene's start still with Kling `text_to_image` (or use the customer's photo), all using the
     look bible.
   - Then animate each scene from its start still (`first_image`) towards the next scene's start still
     (`tail_image`) when the subject continues across the cut, so the scenes join seamlessly. A hard cut (a new
     angle, a macro) uses `first_image` only.
2. **The film is the hero and fills the whole screen on phones.** The copy rides on the film in chapters that
   rise and fade over each scene: the hero line on scene 1, then a scene title per scene that alternates left and
   right (a small kicker such as "II · The waistcoat", a big serif title and one line of copy). It is never turned off on
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
- One lonely film followed by plain coloured boxes (our first demo), or scenes shot in different looks.
- Generic clips that could belong to any brand. Every scene must show this customer's product doing something.
- Default fonts, centred everything, evenly spaced cards, generic gradients or emoji icons.
- Text over the film without a tint.
- Anything invisible without JavaScript: all copy is readable at rest.

## Scene recipes per industry (start here, then art-direct)

| Business | Look bible | Scenes (each one Kling shot, scrubbed by the scroll) |
|---|---|---|
| Suits / tailoring (Ryan's TikTok reference) | black void, warm gold rim light, low fog, glossy floor | 1 a glowing white shirt floats, cuffs apart → 2 the waistcoat builds on, jacket panels fly in → 3 the complete suit on a man adjusting his cuff → 4 men in the colour range walk towards camera at night → 5 macro of buttons and pick-stitching → 6 the finished suit under one spotlight |
| Fashion house | the brand's set, or a black void with coloured light | 1 fabric ribbons swirl → 2 they form the hero garment on an invisible form → 3 the model turns in it → 4 the collection walks → 5 fabric macro → 6 the runway lights go out on the logo |
| Motorbikes (Ryan's example) | dark garage with haze, hard rim light | 1 parts float apart like an exploded diagram → 2 they snap together → 3 a 360 turn on a turntable → 4 the headlight ignites, the engine fires and the bike launches ("vroom", motion blur, wet road) → 5 macro of the engine and badge → 6 rider silhouette at dawn |
| Cars / showroom | studio black, light blades | 1 a covered silhouette, the silk slides off → 2 light blades trace the body lines → 3 a 360 turn → 4 it launches down a wet night road → 5 macro of wheel, stitching and badge → 6 parked under the showroom lights |
| Watches | black stone, one hard key light | 1 case, crystal, hands and strap float apart → 2 they glide together → 3 a slow 360 with a light sweep across the dial → 4 on the wrist, the second hand sweeping → 5 macro of the movement → 6 in the box |
| Jewellery | black velvet, sparkle light | 1 molten gold pours → 2 it is cast into the band → 3 the stone is set, throwing fire → 4 a slow turn in light → 5 macro of the claws → 6 on a hand in candlelight |
| Furniture | a sunlit loft | 1 raw timber and leather on a bench → 2 they shape and join themselves → 3 the finished piece rotates → 4 the room assembles around it → 5 macro of the grain and joints → 6 evening light, someone sits |
| Electronics | a clean white or black void | 1 the internals float apart → 2 they stack into the device → 3 a 360 turn → 4 the screen lights up in use → 5 macro of the materials → 6 the device on the desk |
| Property | golden hour, then interior warm light | 1 aerial of the district → 2 glide down to the building → 3 through the entrance → 4 the living room → 5 the view from the window → 6 dusk, the lights come on |
| Restaurant / F&B | a dark kitchen, steam, warm light | 1 raw ingredients float → 2 knife work and fire → 3 the dish assembles on the plate → 4 served at a candlelit table → 5 macro of texture and steam → 6 the dining room at night |
| Any other business | the brand's world in one consistent light | 1 the raw material → 2 it transforms → 3 the finished product revealed → 4 in use → 5 craft macro → 6 the call to action |

After the scenes, still use the kit's other sections: word-lit manifesto, horizontal gallery, counters, stacking
steps and booking.

## How the worker builds it (short form; the full manual is `ceo-brain/site-kit/README.md`)

1. Copy `ceo-brain/site-kit` to `mockups/<slug>/`.
2. Rewrite `index.html` (and one `.html` per page) and `src/styles/brand.css` from the brief and art
   direction.
3. Put one film per scene (`scene1` … `scene6`, each its Kling video URL) and the customer's photo URLs in
   `media.json`, with one `section.film` per scene in the page.
4. Build locally, then run `deploy-plan.mjs`.
5. Deploy the files to the Vercel project `fusiontech-mockups`. No git is needed.
   - Vercel's build fetches the engine from the repo.
   - It also downloads the film, crops the Kling watermark and cuts the frames.
6. Name it `<slug>-mockup.vercel.app` and check the live page and the film.
