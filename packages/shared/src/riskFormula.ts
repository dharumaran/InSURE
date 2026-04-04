import type { PlatformStatus, RiskScoreResult } from './types.js'

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

export type RiskInputs = {
  rainfallMmHr: number
  heatIndexC: number
  aqiScore: number
  cancelRatePct: number
  platformStatus: PlatformStatus
}

export function computeRiskScore(inputs: RiskInputs): RiskScoreResult {
  const R = clamp01(inputs.rainfallMmHr / 75)
  const H = clamp01(Math.max(0, (inputs.heatIndexC - 30) / 17))
  const A = clamp01(inputs.aqiScore / 380)
  const O = inputs.platformStatus === 'degraded' ? 1.0 : 0.1
  const C = clamp01(inputs.cancelRatePct / 58)

  const riskScore = clamp01(R * 0.25 + H * 0.15 + A * 0.1 + O * 0.2 + C * 0.15)

  // P_w = min( round(75 × (1 + 0.7 × R_w)), 120 ) with floor ₹80, cap ₹120
  const raw = Math.round(75 * (1 + 0.7 * riskScore))
  const premiumRupees = Math.min(Math.max(raw, 80), 120)
  const premiumPaise = premiumRupees * 100

  return {
    riskScore,
    premiumRupees,
    premiumPaise,
    components: { R, H, A, O, C },
  }
}

