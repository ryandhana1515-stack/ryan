// Scroll-morph clips: the product dissolves into particles and reforms
// into the science worlds. Kling 3.0 first+last frame anchoring.
import { fal } from '@fal-ai/client'
import fs from 'node:fs'
import path from 'node:path'

fal.config({ credentials: process.env.FAL_KEY })
const ROOT = process.cwd()
const KEY = '/tmp/claude-0/-home-user-ryan/ebf84d9f-3a5a-560b-bf62-427effb25dd7/scratchpad/keyframes'
const CINE = path.join(ROOT, 'data/cinematic-assets.json')
const LEDGER = path.join(ROOT, 'data/generation-costs.json')
const EP = 'fal-ai/kling-video/v3/pro/image-to-video'

const uri = (n) => `data:image/jpeg;base64,${fs.readFileSync(path.join(KEY, n + '.jpg')).toString('base64')}`

function record(id, url) {
  const l = JSON.parse(fs.readFileSync(LEDGER, 'utf-8'))
  l.records.push({ assetId: id, model: EP, estimatedCostUsd: 0.6, timestamp: new Date().toISOString() })
  l.totalEstimatedUsd += 0.6
  fs.writeFileSync(LEDGER, JSON.stringify(l, null, 2))
  const c = JSON.parse(fs.readFileSync(CINE, 'utf-8'))
  c.videos[id] = { id, kind: 'video', remoteUrl: url, model: EP, local: `public/assets/videos/final/${id}.mp4` }
  fs.writeFileSync(CINE, JSON.stringify(c, null, 2))
}

async function morph(id, fromKf, toKf, prompt) {
  console.log(`[${id}] generating…`)
  const r = await fal.subscribe(EP, {
    input: {
      prompt,
      start_image_url: uri(fromKf),
      end_image_url: uri(toKf),
      duration: '5',
      aspect_ratio: '16:9',
      negative_prompt: 'text overlay, watermark, hands, people, fire, smoke, harsh explosion, horror, scary imagery',
      cfg_scale: 0.5,
      generate_audio: false,
    },
    logs: false,
  })
  const url = r?.data?.video?.url
  if (!url) throw new Error('no video url')
  record(id, url)
  console.log(`[${id}] OK → ${url}`)
}

const main = async () => {
  await morph(
    'morph-box-to-ferment',
    'cover-hero',
    'fermentation-world',
    'Elegant scientific transformation: the white BIO N:OV supplement box gently dissolves from its edges into thousands of fine glowing white and cyan particles that drift softly through the air and gracefully reassemble into a transparent glass fermentation flask containing bubbles, garlic cloves and fresh lettuce leaves in a bright clean laboratory. Slow, calm, luxurious particle flow, premium medical aesthetic, soft light, no violence, no explosion.',
  )
  await morph(
    'morph-ferment-to-molecule',
    'fermentation-world',
    'molecule-world',
    'Elegant scientific transformation: the fermentation flask with garlic and lettuce softly dissolves into streams of luminous bubbles and particles that flow outward and reform into a glowing blue and purple network of connected nitric oxide molecules with flowing light pathways. Slow, calm, premium medical visualisation, soft gradients, no text.',
  )
  console.log('all morphs OK')
}
main().catch((e) => { console.error(e?.message || e); process.exit(1) })
