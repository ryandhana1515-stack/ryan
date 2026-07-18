// Cinematic asset generation for the BIO N:OV site (proxy-aware version).
//
// - Stills: requested with sync_mode -> the image comes back inside the
//   API response as a data URI (no CDN download needed) and is saved
//   into public/assets/.
// - Kling clips: generated from the ORIGINAL PDF cover photo as frame 1;
//   the fal.media CDN URL is recorded in data/cinematic-assets.json and
//   streamed by the site directly (the sandbox cannot download it, but
//   real visitors can). To self-host later: download each URL and place
//   it at the local path in the manifest, the site prefers local files.
import { fal } from '@fal-ai/client'
import fs from 'node:fs'
import path from 'node:path'

fal.config({ credentials: process.env.FAL_KEY })

const ROOT = process.cwd()
const OUT_IMG = path.join(ROOT, 'public/assets/diagrams')
const CINE = path.join(ROOT, 'data/cinematic-assets.json')
const LEDGER = path.join(ROOT, 'data/generation-costs.json')

const NEG =
  'morphing text, changing logo, label deformation, warping packaging, extra objects, hands, people, fire, smoke, debris, watermark, text overlay'

function ledger(id, model, cost) {
  const l = JSON.parse(fs.readFileSync(LEDGER, 'utf-8'))
  l.records.push({ assetId: id, model, estimatedCostUsd: cost, timestamp: new Date().toISOString() })
  l.totalEstimatedUsd += cost
  fs.writeFileSync(LEDGER, JSON.stringify(l, null, 2))
}

function saveCine(entry) {
  const data = fs.existsSync(CINE)
    ? JSON.parse(fs.readFileSync(CINE, 'utf-8'))
    : { videos: {}, stills: {} }
  if (entry.kind === 'video') data.videos[entry.id] = entry
  else data.stills[entry.id] = entry
  fs.writeFileSync(CINE, JSON.stringify(data, null, 2))
}

function dataUri(p) {
  return `data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`
}

function saveDataUri(uri, outFile) {
  const m = uri.match(/^data:(image\/\w+);base64,(.+)$/s)
  if (!m) throw new Error('not a data uri response')
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, Buffer.from(m[2], 'base64'))
}

async function fluxStillSync(id, prompt, outFile) {
  const r = await fal.subscribe('fal-ai/flux/dev', {
    input: {
      prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 28,
      sync_mode: true, // image returns inside the response
    },
    logs: false,
  })
  const url = r?.data?.images?.[0]?.url
  if (!url) throw new Error('no image in response')
  if (url.startsWith('data:')) {
    saveDataUri(url, outFile)
  } else {
    throw new Error('expected data URI (sync_mode), got CDN url')
  }
  ledger(id, 'fal-ai/flux/dev(sync)', 0.025)
  saveCine({ id, kind: 'still', local: path.relative(ROOT, outFile) })
  console.log(`[${id}] saved → ${outFile}`)
}

async function klingRemote(id, imageUri, prompt) {
  const model = 'fal-ai/kling-video/v2.1/standard/image-to-video'
  const r = await fal.subscribe(model, {
    input: { prompt, image_url: imageUri, duration: '5', negative_prompt: NEG, cfg_scale: 0.5 },
    logs: false,
  })
  const url = r?.data?.video?.url
  if (!url) throw new Error('no video url in response')
  ledger(id, model, 0.35)
  saveCine({
    id,
    kind: 'video',
    remoteUrl: url,
    local: `public/assets/videos/final/${id}.mp4`,
    model,
    seed: 'original PDF cover photo',
  })
  console.log(`[${id}] remote → ${url}`)
}

const main = async () => {
  const seed = dataUri(
    '/tmp/claude-0/-home-user-ryan/ebf84d9f-3a5a-560b-bf62-427effb25dd7/scratchpad/seed.jpg',
  )
  console.log(`seed ready (${Math.round(seed.length / 1024)} KB)`)

  const jobs = [
    klingRemote(
      'kling-bionov-arrival',
      seed,
      'Slow cinematic camera push-in toward the white BIO N:OV supplement box standing on a soft blue, purple and pink gradient studio background. A gentle beam of light sweeps across the packaging, soft floating dust particles shimmer, subtle reflections move on the floor. The box itself stays perfectly still and completely unchanged; all packaging text, the blue V logo and seals remain exactly as in the first frame. Premium clinical product commercial, smooth stable motion.',
    ),
    klingRemote(
      'kling-bionov-levitation',
      seed,
      'The white BIO N:OV supplement box rises slowly and levitates above the soft gradient floor while thin elegant ribbons of cyan and pink light orbit around it and tiny sparkling particles drift upward. The camera drifts slightly closer. The packaging artwork stays fixed and unchanged, no text morphing, premium scientific product commercial, controlled elegant zero-gravity motion.',
    ),
    fluxStillSync(
      'fermentation-world',
      'Premium scientific 3D render of a transparent glass fermentation chamber filled with elegant rising bubbles and microscopic particles, hints of garlic cloves and fresh lettuce leaves suspended in glowing liquid, clean white laboratory environment with blue, cyan, purple and pink gradient lighting, medical-science aesthetic, sophisticated, photorealistic, no people, no text',
      path.join(OUT_IMG, 'fermentation-world.png'),
    ),
    fluxStillSync(
      'molecule-world',
      'Premium scientific 3D visualisation of connected nitric oxide NO molecules as glowing spheres linked by flowing light pathways, cellular communication network, clean bright environment with blue, cyan, purple and pink gradients, elegant medical visualisation, white highlights, high-end scientific presentation, no text, no people',
      path.join(OUT_IMG, 'molecule-world.png'),
    ),
  ]
  const results = await Promise.allSettled(jobs)
  results.forEach((r, i) =>
    console.log(`job ${i}: ${r.status}${r.status === 'rejected' ? ' — ' + (r.reason?.message || r.reason) : ''}`),
  )
  process.exit(results.some((r) => r.status === 'rejected') ? 1 : 0)
}
main()
