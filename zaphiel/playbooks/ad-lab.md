# Playbook — THE AD LAB (scan a brand → finished ad creatives)

**What this is for.** Ryan says one sentence to Zaphiel — *"make me five ads for
Manscaped"*, *"scan bionov.com and make ads"*, *"turn this into a video"* — and finished
advertising creative comes back. No prompt engineering from him, no picking models, no
waiting in a chat.

**Reference:** @hugovar.ai's "AI AD LAB" (TikTok, "Claude Code x Higgsfield"), which Ryan
sent on 2026-08-11 as the target. What that video actually does, frame by frame:

1. He speaks one line to a local voice app: *"make me five ads for Manscaped"*.
2. The agent replies conversationally (*"yes sir… uploading the product and making them now"*)
   and starts work immediately — no confirmation step, no clarifying questions.
3. It opens the product reference photo from disk (`.../current-product.jpg`).
4. It writes a **long, extremely specific art-direction prompt** into Higgsfield image
   generation — not "make an ad", but a full brief: backdrop, lighting reference, product
   placement, lens, angle, reflections, gradient, exact hex colours, and the headline
   typography spelled out verbatim.
5. It generates a **batch of four at once** (the green `Generate ✦ 4` button), on
   **GPT Image 2, quality High, 1K, 1:1**.
6. The result is a wall of finished, brand-quality static ads with real headlines and CTA
   buttons baked in — "NO GIMMICKS JUST GREAT SELTZER", "ZERO SUGAR ZERO MERCY",
   "EVERY DAD'S FAVORITE TAILGATE", each with a pill CTA like "Crack One →".

The lesson: **the quality is in the prompt length and specificity, and in using the real
product photo as a reference so the packaging is exact rather than invented.**

---

## How Zaphiel runs it

### Step 0 — never ask, just build
Ryan asked for five ads. Produce five ads. Do not come back with questions about tone or
audience unless something is genuinely impossible. If a detail is missing, make the call,
build it, and name the assumption in one line at the end.

### Step 1 — scan the brand
Whatever Ryan named, get to three things: **the product photo, the palette, the voice.**

- **Named brand with a website** → `WebFetch` the site and 2–3 product pages. Pull the real
  product name and pack size, the hero product image URL, the colour palette, the tone of the
  headlines, and the CTA wording they already use. `firecrawl_search` for their current ads
  and their competitors' if the site is thin.
- **Brand already in this repo** → BIO N:OV's reference photo is
  `bionov/assets/hero-product.jpg` (box + blister + tablets, blue→magenta gradient). Brand
  facts live in the `biogreen-elixirs-ecommerce` skill and `zaphiel/memory.md`.
- **A photo Ryan uploads** → use it directly, it is the best possible reference.
- **Competitor teardown** → `mcp__meta_ad__ads_library_search` returns the ads a brand is
  actually running right now. That is real evidence of what works in their category, not a
  guess. Use it to choose angles before writing a single prompt.

Write down, in one short block, the brand kit you derived: product name, pack size, 3–5 hex
colours, typographic feel, tone in five words, and the CTA phrasing. Everything downstream
inherits from it.

### Step 2 — import the reference image
`media_import_url` with a **direct file URL** — a raw.githubusercontent.com link works, a
page URL does not. It returns a `media_id`. Pass that as `medias: [{ role: "image", value: <media_id> }]`.
Never pass an `https://` URL straight into `medias`.

Without a reference the model invents the packaging, and an ad for a product that does not
look like the product is worthless.

### Step 3 — write five prompts that do not resemble each other
Five variations of one idea is a waste of five generations. Spread them across distinct ad
archetypes, so Ryan can see which direction wins:

1. **Keynote hero** — product dead-centre in a black void, dramatic key light, tech-launch
   gravitas.
2. **Clinical / proof** — white seamless sweep, certification and specification made the
   subject, precision and trust.
3. **Lifestyle flat-lay** — the product inside a real routine, arranged with the objects that
   surround it, shot top-down.
4. **Macro texture** — extreme close-up of the product's material, rim-lit, almost abstract.
5. **Typographic poster** — brand gradient field, product small, headline enormous.

Each prompt must specify, in this order and at length: the backdrop and its exact colour; the
lighting reference in real-world terms ("lit like a high-end gadget reveal at a tech
keynote"); where the product sits and how it is angled; the surface and its reflections; the
lens and camera height ("100mm, slight low-hero angle"); any secondary props; then the
**headline in quotes, verbatim**, its weight and case ("bold all-caps condensed sans-serif"),
its colour as a hex value, and its position; then the CTA pill and its text. Aim for 80–150
words per prompt. The video's prompts are that long for a reason.

### Step 4 — generate
`generate_image_batch`, one `requests[]` item per ad, each with:

```
model: "gpt_image_2"        // what the reference video uses; strongest text rendering
params: { quality: "high", resolution: "1k", aspect_ratio: "1:1",
          medias: [{ role: "image", value: <media_id> }], prompt: <the long brief> }
```

Aspect ratios worth using: `1:1` for feed, `9:16` for Stories and TikTok, `16:9` for YouTube.
`gpt_image_2` does not offer 4:5. `nano_banana_pro` is the alternative when text rendering
matters more than photorealism; `marketing_studio_image` is the one-click route when Ryan
wants speed over art direction.

Poll with `jobs_wait` (≤12 jobs, ≤15 s per call), then **one** `show_generation_by_ids` call
for the whole set. Never call `job_display` per job.

### Step 5 — make them move (only when asked)
A static ad becomes a video ad by animating the winning frame: `generate_video` with the
generated image as the reference, or Kling `image_to_video`. Keep motion small and
deliberate — a slow push in, a rotation, a light sweep. For a full narrated spot, call
`get_workflow_instructions` first and follow the matching workflow rather than improvising.

### Step 6 — deliver, do not describe
Save the results into the repo under `zaphiel/adlab/<brand>-<date>/`, commit, push. Report
the direct image URLs. **State the exact credit cost** — check `balance` before and after and
report the difference. Ryan's standing instruction is that generation credits are not to be
burned quietly.

---

## Compliance gate — runs on every headline before generation

Non-negotiable for BIO N:OV and any supplement or wellness client. A headline that fails
here does not get generated, it gets rewritten.

- **Never** cure, treat, prevent, heal, diagnose, reverse, fight, or protect against.
- **Never** name a disease or a disease marker.
- **Only** support, promote, help maintain — or avoid the claim entirely and sell the ritual,
  the standard, the origin, the format.
- Safe territory that still sells: certification and origin ("GMP certified, made in Korea"),
  format and dose as plain fact ("500 mg × 60 tablets"), the habit ("one tablet, every
  morning"), the standard ("the quiet essential").
- Do not fabricate a price. BIO N:OV's price is not decided — leave price out of the creative
  entirely rather than inventing one.

---

## How Ryan triggers it by voice

The app detects an instruction rather than a question (`isOrder()` in `zaphiel/app/index.html`)
and POSTs it to `/api/dispatch`, which fires the Routine and wakes a session that holds the
Higgsfield connector. That session reads this playbook and executes it.

For that path to work end to end, three things must be true — see
`zaphiel/routines/daily-operator.md`:

1. The Routine exists **with connectors attached** (created from claude.ai/code/routines, not
   from the `create_trigger` tool, which cannot attach them for this organization).
2. It has an **API trigger** with a generated bearer token.
3. `ROUTINE_FIRE_URL` and `ROUTINE_TOKEN` are set in the Vercel project's environment
   variables, so the token stays server-side and never ships to the browser.

Until then `/api/dispatch` returns `not_configured` and Zaphiel says so out loud instead of
pretending the work started.
