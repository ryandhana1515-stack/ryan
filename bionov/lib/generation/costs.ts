import fs from 'node:fs'
import path from 'node:path'
import type { CostLedger, CostRecord } from './types'

const LEDGER_PATH = path.join(process.cwd(), 'data', 'generation-costs.json')

// Rough public-pricing estimates (USD). Verify against fal.ai pricing
// before large runs — model pricing changes.
const MODEL_COST_TABLE: Record<string, number> = {
  'fal-ai/flux/dev': 0.025,
  'fal-ai/flux-pro/v1.1': 0.04,
  'fal-ai/flux/schnell': 0.003,
  'fal-ai/recraft-v3': 0.04,
  // video models — per 5s clip approximations
  'fal-ai/kling-video/v1.6/standard/image-to-video': 0.25,
  'fal-ai/kling-video/v2/master/image-to-video': 1.4,
  'fal-ai/minimax/video-01/image-to-video': 0.5,
}

export function estimateCost(model: string, seconds = 0): number {
  const base = MODEL_COST_TABLE[model] ?? 0.5
  if (seconds > 5) return base * (seconds / 5)
  return base
}

export function loadLedger(budgetUsd: number): CostLedger {
  if (fs.existsSync(LEDGER_PATH)) {
    return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8')) as CostLedger
  }
  return { budgetUsd, totalEstimatedUsd: 0, records: [] }
}

export function saveLedger(ledger: CostLedger): void {
  fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true })
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2))
}

/**
 * Budget guard. Throws if the request would exceed the configured budget.
 */
export function assertWithinBudget(
  ledger: CostLedger,
  estimated: number,
): void {
  if (ledger.totalEstimatedUsd + estimated > ledger.budgetUsd) {
    throw new Error(
      `Budget exceeded: spent ~$${ledger.totalEstimatedUsd.toFixed(2)} of $${ledger.budgetUsd}, request adds ~$${estimated.toFixed(2)}. Raise FAL_GENERATION_BUDGET_USD or approve explicitly.`,
    )
  }
}

export function recordCost(ledger: CostLedger, rec: CostRecord): void {
  ledger.records.push(rec)
  ledger.totalEstimatedUsd += rec.estimatedCostUsd
  saveLedger(ledger)
}
