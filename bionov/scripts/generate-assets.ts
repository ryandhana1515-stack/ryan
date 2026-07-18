/**
 * Staged fal.ai asset generation.
 *
 *   npx tsx scripts/generate-assets.ts references   # Stage 1 — cheap reference stills
 *   npx tsx scripts/generate-assets.ts tests        # Stage 2 — short low-cost motion tests
 *   npx tsx scripts/generate-assets.ts final        # Stage 3 — final clips (only approved shots)
 *
 * Every request is budget-guarded by FAL_GENERATION_BUDGET_USD and
 * recorded in data/asset-manifest.json + data/generation-costs.json.
 * Approved assets are never regenerated.
 */
import path from 'node:path'
import { SHOTS } from '../lib/generation/prompts'
import { generateImage, generateVideo, loadManifest } from '../lib/generation/fal'

const ROOT = process.cwd()
const REF = path.join(ROOT, 'public/assets/product/references')
const TESTS = path.join(ROOT, 'public/assets/videos/tests')
const FINAL = path.join(ROOT, 'public/assets/videos/final')

async function stageReferences() {
  for (const shot of SHOTS.filter((s) => s.kind === 'image')) {
    const out = path.join(REF, `${shot.id}.png`)
    console.log(`→ generating reference ${shot.id}`)
    try {
      await generateImage({
        id: shot.id,
        prompt: shot.prompt,
        referenceImagePath: path.join(REF, 'box-cutout.png'),
        outFile: out,
      })
      console.log(`  saved ${out}`)
    } catch (e) {
      console.error(`  FAILED: ${(e as Error).message}`)
    }
  }
  console.log('\nReview outputs against the PDF before running Stage 2.')
}

async function stageTests() {
  const manifest = loadManifest()
  const heroRef = manifest.assets.find(
    (a) => a.id === 'shot-01-clean-product-hero' && (a.approved || a.actualStatus === 'generated'),
  )
  if (!heroRef?.selectedOutput) {
    console.error('Stage 1 reference not generated/approved yet. Run "references" first.')
    process.exit(1)
  }
  for (const shot of SHOTS.filter((s) => s.kind === 'video')) {
    const out = path.join(TESTS, `${shot.id}.mp4`)
    console.log(`→ test clip ${shot.id}`)
    try {
      await generateVideo({
        id: shot.id,
        prompt: shot.prompt,
        firstFramePath: heroRef.selectedOutput,
        outFile: out,
        durationSeconds: 5,
      })
      console.log(`  saved ${out}`)
    } catch (e) {
      console.error(`  FAILED: ${(e as Error).message}`)
    }
  }
}

async function stageFinal() {
  const manifest = loadManifest()
  const approved = manifest.assets.filter((a) => a.kind === 'video' && a.approved)
  if (approved.length === 0) {
    console.error('No approved test clips. Mark "approved": true in data/asset-manifest.json first.')
    process.exit(1)
  }
  for (const a of approved) {
    const out = path.join(FINAL, `${a.id}.mp4`)
    console.log(`→ final clip ${a.id}`)
    try {
      await generateVideo({
        id: `${a.id}-final`,
        prompt: a.prompt,
        firstFramePath: a.selectedOutput ?? '',
        outFile: out,
        durationSeconds: a.durationSeconds ?? 5,
        model: process.env.FAL_FINAL_FRAME_MODEL,
      })
    } catch (e) {
      console.error(`  FAILED: ${(e as Error).message}`)
    }
  }
}

const stage = process.argv[2]
if (stage === 'references') stageReferences()
else if (stage === 'tests') stageTests()
else if (stage === 'final') stageFinal()
else {
  console.log('usage: tsx scripts/generate-assets.ts <references|tests|final>')
  process.exit(1)
}
