# FusionTech site kit: the build manual for Claude-built mock-ups

Every non-medical mock-up is built from this kit and hosted on Vercel (Ryan, 2026-09-29: "vercel and teach the
website agent how to build these crazy wow factor websites"). Clinics and medical sites stay on Lovable.

Read `zaphiel/vault/Knowledge/Wow website playbook.md` first. It covers what makes the wow and what kills it,
with a recipe per industry. The Full Master Cinematic Website Agent 2026 doctrine (in the brief's `build_prompt`)
still governs the storyboard, the reversible timeline and the QA.

## What is in the kit

| File | What it does | Do you edit it? |
|---|---|---|
| `src/engine/film.js` | The pinned full-screen scroll film. The canvas plays frames forward on scroll-down and backward on scroll-up; smaller frames on phones; film chapters fade in and out at set points. | No |
| `src/engine/motion.js` | The motion vocabulary (the data attributes below). | No |
| `src/engine/fx.js` | Grain, vignette, particles, the soft cursor, and the opening curtain. | No |
| `src/engine/index.js` | Boot: Lenis smooth scroll on GSAP's clock, the films, motion and effects. | No |
| `src/styles/engine.css` | The engine's styles and the default tokens. | No |
| `src/styles/brand.css` | The brand: palette tokens, type pairing and the section looks. | **Rewrite it every time** |
| `index.html` (+ `about.html`, `services.html` …) | The pages; every `.html` file in the root is built. | **Write it every time** |
| `media.json` | The film URLs and the customer's photo URLs. | **Write it every time** |
| `scripts/media.mjs` | Runs on Vercel's build machine: downloads the film, crops the Kling watermark, cuts desktop and phone frames and a poster, and downloads the photos. | No |
| `scripts/kit.mjs` | The first build step on Vercel: fetches the engine files from this public repo. | No |
| `scripts/deploy-plan.mjs`, `kit-files.json` | Lists what goes into the deploy call, and how. | No |

The Zaphiel container cannot download Kling or Higgsfield media (the network policy blocks those hosts).
Vercel's build machine can, so media is only ever named by URL in `media.json`.

## Markup you can use

- **Scene film (the wow; see the playbook):** 5–7 scenes inside ONE `.film-sequence`. It pins one full-screen
  stage and plays the scenes back to back, with no black between them, dissolving each scene into the next
  over its last `data-dissolve` share (default 0.06). Each scene must end on the next scene's first frame.
  ```html
  <div class="film-sequence" data-dissolve="0.06">
  <section class="film" data-film="scene2" data-length="240">
    <canvas role="img" aria-label="…"></canvas>
    <div class="film-chapter film-chapter--right" data-from="0.12" data-to="0.92">
      <div class="scene-kicker">II · The waistcoat</div>
      <h2 class="scene-title">Structure, Held Close</h2>
      <p class="scene-copy">…</p>
    </div>
  </section>
  …
  </div>
  ```
  - `data-length` is each scene's share of the scroll in vh: about 240 for a 5-second scene, 320 for a
    10-second scene.
  - Scenes in a sequence have no push-in zoom (`data-zoom` defaults to 1), so the frames meet exactly.
  - Never put scene films outside the sequence one after another: separate pinned films show black and a slide
    between them.
  - Scene 1 carries the hero copy in a chapter with `data-from="0"` (visible at rest) and loads at once. Later
    scenes load as they come near.
  - Alternate `film-chapter--left` and `film-chapter--right` scene by scene. On phones both sit at the bottom.
  - The `data-from`/`data-to` windows inside one scene must not overlap.
  - Glass copy card: `class="film-chapter glass"`.
- **Motion attributes:**
  - `data-reveal="lines"`: masked word rise, for headlines.
  - `data-reveal="fade"`, `data-reveal="clip"` (a panel wipes open), `data-reveal="scale"`.
  - `data-scrub-text`: the paragraph lights up word by word; use once, for the manifesto.
  - `data-parallax="0.3"`: depth; negative values move towards the viewer.
  - `data-count="1998" data-suffix="+"`: a counter. Label it "illustrative" unless the number is a real fact
    from the brief.
  - `data-bg="#hex" data-ink="#hex"`: the page colour when this section takes the screen.
  - `data-magnetic`: for the primary buttons.
- **Horizontal pinned gallery:**
  `<section class="hscroll"><div class="hscroll-track"> cards… </div></section>`
- **Stacking cards:** `<section class="stack">` with `.stack-card` children.
- **Marquee:** `<div class="marquee"><div class="marquee-inner"><span>word</span>…</div></div>`
- **Always include:** `.curtain` (with `.curtain-brand` and `.curtain-count`) as the first child of `body`, and
  `.progress` right after it.

Fonts come from Google Fonts in `<head>`, and every stack has a real fallback. Pick a display face and a text
face that fit the brand (never Inter alone, never the demo's pair twice in a row). Do not add other libraries
unless the brief needs them: `three` and `@google/model-viewer` are allowed only for a REAL_TIME_3D section with
a textured model.

## media.json

```json
{
  "films":  [{ "id": "scene1", "src": "<Kling video URL>", "crop": "kling", "frames": 96 },
             { "id": "scene2", "src": "<Kling video URL>", "crop": "kling", "frames": 96 }],
  "stills": [{ "src": "<customer photo URL>", "out": "assets/shopfront.jpg" }]
}
```

- `src` can be a list of URLs (property legs): the legs are joined into one film.
- `src`: a permanent URL. Kling links expire after 24 hours, so copy each clip with Higgsfield `media_import_url`
  (Kling's `urlWithoutWatermark`) and use its `cloudfront.net` URL from `show_medias`.
- `crop`: `"none"` for watermark-free clips, Higgsfield or customer video; `"kling"` only for a watermarked Kling
  `url`.
- `frames`: 96 for a 5-second scene, 120 for a 10-second scene. More frames are smoother but heavier.
- Stills land in `public/<out>`; reference them as `/<out>`.

## Build and publish (the worker does all of this; nobody approves)

The Zaphiel routine has no push rights and no media downloads, so the deploy carries no git and no video:
- **Your files** go into the deploy call as text: the pages, `brand.css`, `main.js`, `media.json` and the docs.
- **The four build files** (`package.json`, `vercel.json`, `vite.config.js`, `scripts/kit.mjs`) are already
  uploaded to Vercel and go by their SHA-1.
- **The engine** is fetched by Vercel's build from this public repo (`scripts/kit.mjs`).
- **The film** is downloaded and cut by Vercel's build (`scripts/media.mjs`).

1. Get the kit, if the repo is not already your working directory:
   `git clone --depth 1 https://github.com/ryandhana1515-stack/ryan`.
2. Copy it: run `cp -r ceo-brain/site-kit mockups/<slug>` and `rm -rf mockups/<slug>/node_modules`. `<slug>`
   is lowercase with hyphens, for example `edit-suits-co`.
3. Write the files for this customer in `mockups/<slug>/`:
   - `index.html` and the other pages, from the brief's FULL WEBSITE section;
   - `src/styles/brand.css`, from the art direction;
   - `media.json`, from the film and the photos;
   - `docs/storyboard.md` and `docs/qa-report.md`.
   Never change the engine files. A customer's film never carries `"optional"` (only the kit demo's sample does).
4. Check locally, with no media:
   - `cd mockups/<slug> && npm install --ignore-scripts && npx vite build`.
   - The build must pass, and every page must be in `dist/`.
5. Plan the deploy: `node ceo-brain/site-kit/scripts/deploy-plan.mjs mockups/<slug>`. It prints three lists:
   - `byRef`: pass each as `{ "file", "sha", "size" }`.
   - `fetched`: leave these out; the build fetches them.
   - `inline`: pass each as `{ "file", "data": <the file's exact text>, "encoding": "utf-8" }`. A binary file
     is never inline: put it in `media.json` `stills` by URL instead.
6. Deploy with `mcp__Vercel__create_deployment`:
   - `teamId`: `team_aaKLA8GAfgGYn4ocuu0hA7EG`
   - `skipAutoDetectionConfirmation`: `"1"`
   - `requestBody`:
     `{ "name": "fusiontech-mockups", "project": "fusiontech-mockups", "target": "production", "files": [ …byRef, …inline ] }`
   - Never pass `projectSettings` (the project and `vercel.json` hold them).
   - If the call answers `missing_files`, upload each missing file once with `mcp__Vercel__upload_file`
     (`requestBody` = `deploy-plan.mjs mockups/<slug> --b64 <file>`, `xVercelDigest` = its sha,
     `contentLength` = its size) and deploy again.
7. Poll `mcp__Vercel__get_deployment` until `readyState` is `READY`, about 1–3 minutes.
   - On `ERROR`, read the build log with `mcp__Vercel__list_deployment_events`, fix, and deploy again.
   - `[media] download failed` means the film URL expired: make the film again.
   - `[kit] could not fetch` means GitHub was unreachable: deploy again once.
8. Give it a clean name: `mcp__Vercel__assign_alias` with alias `<slug>-mockup.vercel.app`. Add `-2` if it is
   taken. If aliasing is refused, use the deployment URL.
9. Check it: `mcp__Vercel__web_fetch_vercel_url` on the page and on `/film/scene1/manifest.json` (and the last
   scene's). Each manifest must show `count` ≥ 80.
10. `preview_url` is the alias (or the deployment URL), `project_id` is the deployment id, and `editor_url` is
    `""`. Then report as usual.

The Vercel project `fusiontech-mockups` has Vercel Authentication switched off, so every link is public.
Never deploy a mock-up to any other Vercel project, and never to a customer's domain.

After changing `package.json`, `vercel.json`, `vite.config.js` or `scripts/kit.mjs`:
- run `node scripts/deploy-plan.mjs --write-kit`;
- upload the changed file once, as in step 6;
- commit `kit-files.json`.

The tests check that the manifest matches the files.

## Fallback: Higgsfield hosting (when Vercel refuses the deploy)

Higgsfield sites need a Higgsfield sign-in. Ryan accepts that for now; customers get the Vercel link once Vercel is
back.

1. Create the website: `mcp__higgsfield__create_website`:
   - `type` `website`, no template;
   - `category`: the closest slug from `list_website_categories`;
   - `subdomain` `<slug>-mockup`.
2. Check it out: `website_repo_access` with `checkout`. Keep `checkout_path`.
3. Get the kit into the sandbox: `sandbox_exec`:
   `git clone -q --depth 1 https://github.com/ryandhana1515-stack/ryan fusiontech && cp -r fusiontech/ceo-brain/site-kit m`
4. Move your own files across. In your container, run
   `cd mockups/<slug> && tar czf - index.html <other pages> media.json src/main.js src/styles/brand.css docs | base64 -w0`.
   In the sandbox, run `echo '<that text>' | base64 -d | tar xz -C m`. If the text is longer than about 15,000
   characters, split the files over several calls.
5. Build: `sandbox_exec` with `background: true`, running
   `bash fusiontech/ceo-brain/site-kit/scripts/higgsfield-host.sh m <checkout_path> > hf.log 2>&1; echo EXIT $? >> hf.log`.
   Poll `tail hf.log` until `EXIT 0` (about 3–5 minutes). If `[media]` shows a failed download, fix the URL and
   run it again.
6. Push, then deploy: `website_repo_access` with `push`, then `deploy_website`. The deploy call can time out; poll
   `website_status` until `deployed`.
7. The link is `https://<subdomain>.higgsfield.app/home.html`.

## Quality gate before reporting (all must pass)

- The first screen is scene 1 with the hero headline and CTAs, on a phone.
- There are 5–7 scenes in one look, and the product builds itself across them.
- Scrolling down plays the scenes. Scrolling up plays them backwards. They are never swapped for stills.
- The build shows no console errors and no horizontal scroll at 390px width.
- Every section moves.
- All copy can be read at rest.
- The copy uses only the brief's facts. Placeholders are labelled. Generated items are marked "Illustrative".
- There are no prices, guarantees or dates.
- CTAs (WhatsApp, booking, form) are reachable from every screen.
- `docs/qa-report.md` has no BLOCKER or HIGH open.
