// Server-side fal.ai wrapper. The FAL_KEY must never reach the client:
// this module is only imported from scripts/ and API routes.
import { fal } from '@fal-ai/client'
import fs from 'node:fs'
import path from 'node:path'
import type { AssetManifest, AssetRecord } from './types'
import { estimateCost, loadLedger, assertWithinBudget, recordCost } from './costs'

const MANIFEST_PATH = path.join(process.cwd(), 'data', 'asset-manifest.json')

export function getBudget(): number {
  return Number(process.env.FAL_GENERATION_BUDGET_USD ?? '100')
}

export function configureFal(): void {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY is not set (server-side only).')
  fal.config({ credentials: key })
}

export function loadManifest(): AssetManifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as AssetManifest
  }
  return { version: 1, budgetUsd: getBudget(), assets: [] }
}

export function saveManifest(m: AssetManifest): void {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2))
}

function upsert(m: AssetManifest, rec: AssetRecord): void {
  const i = m.assets.findIndex((a) => a.id === rec.id)
  if (i >= 0) m.assets[i] = rec
  else m.assets.push(rec)
  saveManifest(m)
}

async function download(url: string, outFile: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed ${res.status}`)
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()))
}

export interface GenerateImageOptions {
  id: string
  prompt: string
  referenceImagePath?: string
  outFile: string
  model?: string
}

export async function generateImage(opts: GenerateImageOptions): Promise<string> {
  configureFal()
  const model = opts.model ?? process.env.FAL_IMAGE_MODEL ?? 'fal-ai/flux/dev'
  const manifest = loadManifest()
  const existing = manifest.assets.find((a) => a.id === opts.id)
  if (existing?.approved) {
    throw new Error(`Asset ${opts.id} is approved — refusing to regenerate.`)
  }
  const est = estimateCost(model)
  const ledger = loadLedger(getBudget())
  assertWithinBudget(ledger, est)

  const now = new Date().toISOString()
  const rec: AssetRecord = {
    id: opts.id,
    stage: 'reference',
    kind: 'image',
    prompt: opts.prompt,
    model,
    estimatedCostUsd: est,
    actualStatus: 'generating',
    attempts: (existing?.attempts ?? 0) + 1,
    rejectedOutputs: existing?.rejectedOutputs ?? [],
    approved: false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  upsert(manifest, rec)

  const input: Record<string, unknown> = { prompt: opts.prompt }
  if (opts.referenceImagePath) {
    const buf = fs.readFileSync(opts.referenceImagePath)
    const uploaded = await fal.storage.upload(new Blob([new Uint8Array(buf)]))
    input.image_url = uploaded
  }

  const result = (await fal.subscribe(model, {
    input,
    logs: false,
  })) as { data?: { images?: Array<{ url: string }> } }

  const url = result?.data?.images?.[0]?.url
  if (!url) {
    rec.actualStatus = 'failed'
    rec.updatedAt = new Date().toISOString()
    upsert(manifest, rec)
    throw new Error(`No image returned for ${opts.id}`)
  }
  await download(url, opts.outFile)
  recordCost(ledger, { assetId: opts.id, model, estimatedCostUsd: est, timestamp: now })
  rec.actualStatus = 'generated'
  rec.selectedOutput = opts.outFile
  rec.updatedAt = new Date().toISOString()
  upsert(manifest, rec)
  return opts.outFile
}

export interface GenerateVideoOptions {
  id: string
  prompt: string
  firstFramePath: string
  outFile: string
  durationSeconds?: number
  model?: string
}

export async function generateVideo(opts: GenerateVideoOptions): Promise<string> {
  configureFal()
  const model =
    opts.model ?? process.env.FAL_VIDEO_MODEL ?? 'fal-ai/kling-video/v1.6/standard/image-to-video'
  const duration = opts.durationSeconds ?? 5
  const manifest = loadManifest()
  const existing = manifest.assets.find((a) => a.id === opts.id)
  if (existing?.approved) {
    throw new Error(`Asset ${opts.id} is approved — refusing to regenerate.`)
  }
  const est = estimateCost(model, duration)
  const ledger = loadLedger(getBudget())
  assertWithinBudget(ledger, est)

  const now = new Date().toISOString()
  const rec: AssetRecord = {
    id: opts.id,
    stage: 'test',
    kind: 'video',
    prompt: opts.prompt,
    model,
    durationSeconds: duration,
    estimatedCostUsd: est,
    actualStatus: 'generating',
    attempts: (existing?.attempts ?? 0) + 1,
    rejectedOutputs: existing?.rejectedOutputs ?? [],
    approved: false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  upsert(manifest, rec)

  const buf = fs.readFileSync(opts.firstFramePath)
  const imageUrl = await fal.storage.upload(new Blob([new Uint8Array(buf)]))

  const result = (await fal.subscribe(model, {
    input: { prompt: opts.prompt, image_url: imageUrl, duration },
    logs: false,
  })) as { data?: { video?: { url: string } } }

  const url = result?.data?.video?.url
  if (!url) {
    rec.actualStatus = 'failed'
    rec.updatedAt = new Date().toISOString()
    upsert(manifest, rec)
    throw new Error(`No video returned for ${opts.id}`)
  }
  await download(url, opts.outFile)
  recordCost(ledger, { assetId: opts.id, model, estimatedCostUsd: est, timestamp: now })
  rec.actualStatus = 'generated'
  rec.selectedOutput = opts.outFile
  rec.updatedAt = new Date().toISOString()
  upsert(manifest, rec)
  return opts.outFile
}
