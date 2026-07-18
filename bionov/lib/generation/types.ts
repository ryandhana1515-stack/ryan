export type AssetStage = 'reference' | 'test' | 'final'
export type AssetStatus =
  | 'pending'
  | 'generating'
  | 'generated'
  | 'approved'
  | 'rejected'
  | 'failed'

export interface AssetRecord {
  id: string
  stage: AssetStage
  kind: 'image' | 'video'
  prompt: string
  model: string
  resolution?: string
  durationSeconds?: number
  estimatedCostUsd: number
  actualStatus: AssetStatus
  attempts: number
  selectedOutput?: string
  rejectedOutputs: string[]
  approved: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AssetManifest {
  version: number
  budgetUsd: number
  assets: AssetRecord[]
}

export interface CostRecord {
  assetId: string
  model: string
  estimatedCostUsd: number
  timestamp: string
}

export interface CostLedger {
  budgetUsd: number
  totalEstimatedUsd: number
  records: CostRecord[]
}
