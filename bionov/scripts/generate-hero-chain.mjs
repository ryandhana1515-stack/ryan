// Hero chain: 5 Kling clips, each anchored by REAL product photos from the
// PDF as BOTH first frame (image_url) and last frame (tail_image_url).
// Kling only invents the camera motion between two authentic keyframes,
// so the packaging stays true at every anchor. Endpoints are tried in
// order until one accepts tail_image_url. CDN URLs are recorded in
// data/cinematic-assets.json (streamed by the site; self-hostable later).
import { fal } from '@fal-ai/client'
import fs from 'node:fs'
import path from 'node:path'

fal.config({ credentials: process.env.FAL_KEY })

const ROOT = process.cwd()
const KEY = '/tmp/claude-0/-home-user-ryan/ebf84d9f-3a5a-560b-bf62-427effb25dd7/scratchpad/keyframes'
const CINE = path.join(ROOT, 'data/cinematic-assets.json')
const LEDGER = path.join(ROOT, 'data/generation-costs.json')

const NEG =
  'morphing text, changing logo, label deformation, warping packaging, extra products, different packaging, hands, people, fire, smoke, debris, watermark, text overlay'

// endpoints known to support start+end frame guidance, best first
const ENDPOINTS = [
  'fal-ai/kling-video/v2.1/pro/image-to-video',
  'fal-ai/kling-video/v1.6/pro/image-to-video',
  'fal-ai/kling-video/v1.6/standard/image-to-video',
]
const COST = { 'fal-ai/kling-video/v2.1/pro/image-to-video': 0.45, 'fal-ai/kling-video/v1.6/pro/image-to-video': 0.45, 'fal-ai/kling-video/v1.6/standard/image-to-video': 0.35 }

function ledger(id, model, cost) {
  const l = JSON.parse(fs.readFileSync(LEDGER, 'utf-8'))
  l.records.push({ assetId: id, model, estimatedCostUsd: cost, timestamp: new Date().toISOString() })
  l.totalEstimatedUsd += cost
  fs.writeFileSync(LEDGER, JSON.stringify(l, null, 2))
}

function saveCine(entry) {
  const data = JSON.parse(fs.readFileSync(CINE, 'utf-8'))
  data.videos[entry.id] = entry
  fs.writeFileSync(CINE, JSON.stringify(data, null, 2))
}

const uri = (name) =>
  `data:image/jpeg;base64,${fs.readFileSync(path.join(KEY, `${name}.jpg`)).toString('base64')}`

async function chainClip(id, fromKf, toKf, prompt) {
  let lastErr
  for (const ep of ENDPOINTS) {
    try {
      console.log(`[${id}] trying ${ep}`)
      const r = await fal.subscribe(ep, {
        input: {
          prompt,
          image_url: uri(fromKf),
          tail_image_url: uri(toKf),
          duration: '5',
          negative_prompt: NEG,
          cfg_scale: 0.5,
        },
        logs: false,
      })
      const url = r?.data?.video?.url
      if (!url) throw new Error('no video url')
      ledger(id, ep, COST[ep] ?? 0.45)
      saveCine({
        id, kind: 'video', remoteUrl: url, model: ep,
        local: `public/assets/videos/final/${id}.mp4`,
        firstFrame: fromKf, lastFrame: toKf,
      })
      console.log(`[${id}] OK → ${url}`)
      return
    } catch (e) {
      lastErr = e
      console.warn(`[${id}] ${ep} failed: ${e?.message || e}${e?.body ? ' ' + JSON.stringify(e.body).slice(0, 300) : ''}`)
    }
  }
  throw lastErr
}

const CAM =
  ' Smooth, slow, luxurious camera movement. The product packaging, its printed text and the blue V logo stay perfectly sharp, fixed and unchanged throughout. Premium clinical product commercial, cinematic soft studio light, no cuts.'

const main = async () => {
  const clips = [
    ['hero-chain-1', 'cover-hero', 'boxes-wood',
     'Cinematic transition: the camera glides from a single white BIO N:OV supplement box with silver blister packs on a blue-purple-pink gradient studio background to a display of three identical BIO N:OV boxes standing on a warm wooden pedestal against a bright blue gradient wall.' + CAM],
    ['hero-chain-2', 'boxes-wood', 'lifestyle-marble',
     'Cinematic transition: the camera glides from three white BIO N:OV boxes on a wooden pedestal to a bright marble kitchen scene where a BIO N:OV box lies beside a silver blister pack, fresh garlic bulbs and green lettuce leaves in white bowls.' + CAM],
    ['hero-chain-3', 'lifestyle-marble', 'lifestyle-open-box',
     'Cinematic transition: the camera glides across a bright marble surface from a closed white BIO N:OV box with garlic and lettuce to an overhead view of an opened BIO N:OV box with a silver blister pack of speckled tablets sliding out, surrounded by garlic cloves and lettuce.' + CAM],
    ['hero-chain-4', 'lifestyle-open-box', 'blister-flatlay',
     'Cinematic transition: the camera rises over an opened white BIO N:OV box and settles on an elegant flat-lay of the box surrounded by several silver blister packs filled with speckled herbal tablets on a bright blue and white background.' + CAM],
    ['hero-chain-5', 'blister-flatlay', 'usage-glass',
     'Cinematic transition: the camera glides from a flat-lay of BIO N:OV blister packs to a clean daylight scene of the white BIO N:OV box standing beside a clear glass of water and an opened silver blister pack on a white table.' + CAM],
  ]
  // sequential to be gentle on rate limits
  const failed = []
  for (const [id, a, b, prompt] of clips) {
    try {
      await chainClip(id, a, b, prompt)
    } catch (e) {
      console.error(`[${id}] FAILED ALL ENDPOINTS: ${e?.message || e}`)
      failed.push(id)
    }
  }
  console.log(failed.length ? `failed: ${failed.join(', ')}` : 'all clips OK')
  process.exit(failed.length ? 1 : 0)
}
main()
