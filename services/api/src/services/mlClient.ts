import {
  computeRiskFeatureComponents,
  computeRiskScore,
  type RiskInputs,
  type RiskScoreResult,
} from '@shieldride/shared'
import type { TriggerActive, TriggerType } from '@shieldride/shared'
import type { TriggerEvalInput } from './triggerEngine.js'

const ML_TIMEOUT_MS = 12_000

function mlBase(): string | null {
  const u = process.env['ML_SERVICE_URL']?.trim()
  return u && u.length > 0 ? u.replace(/\/$/, '') : null
}

/** XGBoost risk regressor + same premium band as shared package. */
export async function mlRiskScore(inputs: RiskInputs): Promise<RiskScoreResult | null> {
  const base = mlBase()
  if (!base) return null
  try {
    const res = await fetch(`${base}/ml/risk-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfallMmHr: inputs.rainfallMmHr,
        heatIndexC: inputs.heatIndexC,
        aqiScore: inputs.aqiScore,
        cancelRatePct: inputs.cancelRatePct,
        platformStatus: inputs.platformStatus,
      }),
      signal: AbortSignal.timeout(ML_TIMEOUT_MS),
    })
    if (!res.ok) return null
    const row = (await res.json()) as { riskScore: number; premium: number }
    const components = computeRiskFeatureComponents(inputs)
    const premiumRupees = Math.round(row.premium)
    return {
      riskScore: Math.min(1, Math.max(0, row.riskScore)),
      premiumRupees,
      premiumPaise: premiumRupees * 100,
      components,
    }
  } catch {
    return null
  }
}

export async function resolveRiskScore(inputs: RiskInputs): Promise<RiskScoreResult> {
  return (await mlRiskScore(inputs)) ?? computeRiskScore(inputs)
}

type TriggerMlBody = {
  rainfallMmHr: number
  heatIndexC: number
  aqiScore: number
  cancelRatePct: number
  platformStatus: string
  orderDensity: number
  hourIST: number
  sustainedRainMinutes: number
  sustainedHeatMinutes: number
  sustainedAqiMinutes: number
  sustainedOutageMinutes: number
  sustainedDemandMinutes: number
}

/** Five XGBoost binary classifiers → trigger fire probabilities. */
export async function mlTriggerProbabilities(body: TriggerMlBody): Promise<Record<string, number> | null> {
  const base = mlBase()
  if (!base) return null
  try {
    const res = await fetch(`${base}/ml/trigger-prob`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(ML_TIMEOUT_MS),
    })
    if (!res.ok) return null
    const row = (await res.json()) as { probabilities: Record<string, number> }
    return row.probabilities ?? null
  } catch {
    return null
  }
}

const TRIGGER_THRESHOLD = 0.48

const PAYOUT: Record<TriggerType, number> = {
  rainfall: 0.8,
  heat: 0.6,
  aqi: 0.5,
  outage: 0.7,
  demand: 0.4,
}

function triggerValue(type: TriggerType, input: TriggerEvalInput): number {
  switch (type) {
    case 'rainfall':
      return input.rainfallMmHr
    case 'heat':
      return input.heatIndexC
    case 'aqi':
      return input.aqiScore
    case 'outage':
      return input.sustainedMinutes.outage
    case 'demand':
      return input.cancelRatePct
  }
}

export function triggersFromMlProbabilities(
  probs: Record<string, number>,
  input: TriggerEvalInput,
): TriggerActive[] {
  const types: TriggerType[] = ['rainfall', 'heat', 'aqi', 'outage', 'demand']
  return types.map((type) => {
    const p = probs[type] ?? 0
    return {
      type,
      active: p >= TRIGGER_THRESHOLD,
      reason: `ML fire probability ${(p * 100).toFixed(0)}% (threshold ${TRIGGER_THRESHOLD * 100}%)`,
      triggerValue: triggerValue(type, input),
      payoutPct: PAYOUT[type],
    }
  })
}

export type FraudMlBody = {
  incomeZ?: number
  suddenInactive?: boolean
  gpsSpeedKmh?: number
  staticWhileActive?: boolean
  weatherMismatch?: boolean
  sharedDeviceCount?: number
  sharedUpi?: boolean
}

export async function mlFraudScore(
  body: FraudMlBody,
): Promise<{ F_w: number; B: number; G: number; L: number } | null> {
  const base = mlBase()
  if (!base) return null
  try {
    const res = await fetch(`${base}/ml/fraud-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incomeZ: body.incomeZ ?? 0,
        suddenInactive: body.suddenInactive ?? false,
        gpsSpeedKmh: body.gpsSpeedKmh ?? 0,
        staticWhileActive: body.staticWhileActive ?? false,
        weatherMismatch: body.weatherMismatch ?? false,
        sharedDeviceCount: body.sharedDeviceCount ?? 0,
        sharedUpi: body.sharedUpi ?? false,
      }),
      signal: AbortSignal.timeout(ML_TIMEOUT_MS),
    })
    if (!res.ok) return null
    return (await res.json()) as { F_w: number; B: number; G: number; L: number }
  } catch {
    return null
  }
}
