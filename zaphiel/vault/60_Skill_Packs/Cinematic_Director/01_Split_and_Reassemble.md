---
tags: [zaphiel, skill-pack, cinematic, kling, higgsfield]
version: 1.0 (2026-10-12)
---
# Split & reassemble: products that come apart and go back together

Ryan (2026-10-12): "I want the watch to be split into pieces and then come back." The films are made on **Kling**
and **Higgsfield**, not drawn in code. On the website, the scroll plays the film forward (it comes apart) and
backward (it goes back together), using the existing scroll engine. The director makes the film; it never builds
the site.

## The method that works: keyframes first, then the move between them
A video model is good at moving **from one picture to another picture**. It is bad at inventing an exploded
diagram from words alone. So we always make the two end states as still images first, then ask the video model to
travel between them.

1. **Hero still (assembled).** One photoreal still of the real product in the look bible (the set, the light, the
   lens). Use the customer's own product photo whenever one exists: put it into the look bible with an image edit,
   don't redraw it.
2. **Exploded still (made FROM the hero still).** Edit the hero still itself (Kling `image_to_image`, model
   `kling-image-v3_0_omni` or `gemini-3-pro-image` / Nano Banana Pro) so it shows the same product, same angle,
   same light, with its parts separated along one clear axis. Never generate the exploded state from scratch: an
   edit of the same picture is what keeps the parts identical.
3. **The split film.** Kling `image_to_video` with `first_image` = hero still and `tail_image` = exploded still.
   The prompt describes the **physical move**, not the look (see the recipes below).
4. **The reassembly.** Usually nothing extra: the site plays the same film backward on scroll-up, and that is the
   reassembly. When the story needs a second beat (it goes back together at a **new angle** for the call to
   action), make a second film: `first_image` = exploded still, `tail_image` = a new "alternate hero" still (an
   edit of the hero still at the new angle).
5. **Chain into the next scene.** The last frame of each scene is the first frame of the next scene (doctrine
   §22). No black, no cut.

### Which model for which step (checked on Ryan's accounts, 2026-10-12)
| Step | First choice | Fallback | Notes |
|---|---|---|---|
| Hero still | Kling `text_to_image`, `kling-image-v3_0_omni` (2K/4K), or `gemini-3-pro-image` (Nano Banana Pro) for exact materials | Higgsfield `generate_image` | 16:9 master + a 9:16 version for phones |
| Exploded still | Kling `image_to_image`, `kling-image-v3_0_omni` (prompt says "图片1 …") or `gemini-3-pro-image` | `gpt-image-2` edit | Edit of the hero still, never fresh |
| Split film | Kling `image_to_video` **`kling-video-v3_0`** with `first_image` + `tail_image`, 5 s, 1080p, `prefer_multi_shots: false`, `enable_audio: false` | `kling-video-v2_6` (tail needs 1080p, no audio) · Higgsfield `kling_o3_flf` / `cinematic_studio_3_0` / `seedance_2_0` (start_image + end_image, up to 4K) | Ryan: "go to the actual Kling" first (2026-09-29) |
| Several keyframes in one film | Kling `kling-video-v3_0_omni` (up to 7 reference images) | Higgsfield `kling_o3_image_reference` | Only when one move needs 3+ states |
| Same product in every scene | Kling Elements (`element_create` from the hero still, then `<<<id>>>` in prompts) | Always use the same hero still as the reference | Stops the product drifting between scenes |
| Real 3D model (only if asked) | Higgsfield `generate_3d` (image → GLB) | — | Not the default (Ryan, 2026-10-12: films, not code-drawn 3D) |
| Clean-up | Higgsfield `video_deflicker`, `topaz_video` / `bytedance_video_upscale`, `reframe` (9:16) | — | After the film is approved |

## Choreography rules (what makes it look expensive, not melted)
- **One axis.** Parts separate along one line (usually the depth axis towards the camera, or straight up). Two or
  three directions at most (straps up and down, crown sideways).
- **A clear order.** The outermost part leaves first and travels furthest: crystal → bezel → hands → dial →
  movement → case back; the anchor part (the case, the car body, the bottle) stays still.
- **Six to twelve visible parts.** More parts and the model starts inventing; fewer looks cheap. Small parts move
  as a group (all 12 hour markers together).
- **Slow, weighted, mechanical.** "Glides apart smoothly, each part floating on its own layer, perfectly aligned,
  no rotation of the parts, a slow camera orbit of 20°". Never "explodes" (gives fire and debris).
- **The camera moves a little, the parts move a lot.** A slight orbit or push-in, never both a big orbit and a
  big separation at once.
- **5 seconds per move.** 10 s only for a full journey. On the site, a 5-second film ≈ 240vh of scrolling.
- **Accuracy (doctrine §8):** never invent parts. Only parts that really exist in that product, from the
  customer's photos or spec. Without real internals, separate only the visible parts (strap, case, crystal,
  bezel, dial) and say so.

## Recipes (start here, then adapt to the real product)
Each recipe = hero still · exploded still edit · split-film move. Put the look bible at the start of every prompt.

**Watch** (look: black stone plinth, one hard strip light, warm rim, 100mm macro)
- Hero: "A luxury steel wristwatch at a three-quarter angle on black stone, dark studio, one strip light sweeping
  across the polished case and sapphire crystal, deep blacks, champagne highlights, photoreal product photography."
- Exploded edit: "图片1: the same watch, same angle and light, its parts separated along the axis facing the
  camera, evenly spaced and perfectly aligned: sapphire crystal in front, then the bezel, the hands, the dial with
  its markers, the movement with gears and jewels, the case back at the rear; strap halves drawn apart up and down;
  every part identical to the original, floating in the dark, no extra parts."
- Move: "The watch comes apart in a slow, precise sequence: the crystal lifts away first, then the bezel, the
  hands, the dial and the movement glide out along one axis, each on its own layer, perfectly aligned, the strap
  halves part up and down; the camera orbits 20 degrees; smooth, weighted, mechanical; no rotation of the parts, no
  sparks, no debris."

**Car** (studio black, light blades, wet floor)
- Exploded: body panels lift straight up off the chassis (bonnet, doors, roof), wheels slide outward, the cabin
  stays. Move: "panels rise vertically in one smooth wave, wheels slide out, light blades trace the edges".
  Accuracy: only panels; never invent engine internals (doctrine §9): use the real engine photo or leave it.

**Perfume / skincare bottle** (glass, caustics, one soft key)
- Exploded: cap up, collar and pump up, glass body stays, liquid held as a floating column, label as a thin layer
  in front. Move: "the cap and pump float upward, the liquid rises in a perfect suspended column, light refracts
  through the glass".

**Sneaker** (clean grey void)
- Exploded: outsole down, midsole, upper, laces and insole as layers. Move: "the layers drift apart vertically,
  laces unthread and hover".

**Phone / headphones / device** (black or white void)
- Only with real internals from the brand (doctrine §14). Otherwise the exterior parts: glass, frame, back.

**Jewellery / ring** (black velvet, sparkle light): stone lifts out of the claws, band and setting separate.

**Furniture** (sunlit loft): legs, frame, cushions and upholstery separate and settle back.

**Burger / dish** (dark kitchen, steam): bun top lifts, each layer floats apart with crumbs and sauce held in the air.

**Building / property**: floors stack up from the foundation (real floor plates only; artist's impression label).

## Failure modes and fixes
| What went wrong | Fix |
|---|---|
| Parts melt or morph into each other | Fewer parts; "each part rigid, keeps its exact shape"; switch to `kling-video-v2_6` with tail image; make a middle keyframe |
| New parts appear that were not in the hero | The exploded still was generated fresh: redo it as an edit of the hero still; add "no extra parts" |
| The product changes colour or shape between scenes | Use a Kling Element of the hero still; repeat the look bible word for word |
| Explosion, sparks, smoke | Never use "explode"; use "glides apart", "separates", "floats apart" |
| The ending does not match the next scene | The next scene must start from this scene's tail still (same file) |
| Camera spins too much | "camera orbits 15–20 degrees" or "locked-off camera, slow push-in" |
