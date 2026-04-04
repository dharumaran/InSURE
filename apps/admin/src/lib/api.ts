import type { ApiEnvelope } from '@shieldride/shared'
import axios, { type AxiosError, type AxiosResponse } from 'axios'

const envApi = import.meta.env.VITE_API_URL?.trim() ?? ''
const baseURL = envApi !== '' ? envApi : import.meta.env.DEV ? '' : ''

export const api = axios.create({
  baseURL,
  timeout: 120_000,
  validateStatus: () => true,
})

function isEnvelope(x: unknown): x is ApiEnvelope<unknown> {
  return (
    typeof x === 'object' &&
    x !== null &&
    'data' in x &&
    'error' in x &&
    'meta' in x
  )
}

async function unwrap<T>(p: Promise<AxiosResponse<unknown>>): Promise<T> {
  try {
    const res = await p
    const body = res.data

    if (isEnvelope(body)) {
      if (body.error) throw new Error(body.error.message)
      if (body.data === null) throw new Error('Empty response')
      return body.data as T
    }

    if (res.status === 404) {
      throw new Error(
        'API route not found. Run `npm run dev` in apps/admin (proxies /api) with the API on port 3001.',
      )
    }
    throw new Error(`Request failed (${res.status})`)
  } catch (e) {
    const ax = e as AxiosError<ApiEnvelope<unknown>>
    if (ax.response?.data && isEnvelope(ax.response.data) && ax.response.data.error) {
      throw new Error(ax.response.data.error.message)
    }
    if (ax.code === 'ERR_NETWORK' || ax.message === 'Network Error') {
      throw new Error(
        'Cannot reach API. Run the backend on port 3001 and use Vite dev server (proxy /api).',
      )
    }
    throw e
  }
}

export type Overview = {
  activeWorkers: number
  payoutsToday: number
  fraudQueue: number
  car: { car: number; status: string }
}

export type AdminPayout = {
  id: string
  triggerType: string
  triggerValue: number
  payoutAmountPaise: number
  status: string
  fraudScore: number
  fraudComponents: unknown
  createdAt: string
  worker: { name: string; city: string; platform: string }
}

export type FraudFlag = {
  id: string
  workerId: string
  payoutId: string | null
  scoreB: number
  scoreG: number
  scoreL: number
  scoreTotal: number
  reviewStatus: string
}

export type AdminWorker = {
  id: string
  name: string
  city: string
  platform: string
  status: string
  baselineIncomePaise: number
  policies: Array<{ premiumAmountPaise: number; riskScore: number }>
}

export const adminApi = {
  overview: () => unwrap<Overview>(api.get('/api/admin/overview')),
  payouts: () => unwrap<AdminPayout[]>(api.get('/api/admin/payouts')),
  fraudQueue: () => unwrap<FraudFlag[]>(api.get('/api/admin/fraud-queue')),
  car: () => unwrap<Overview['car']>(api.get('/api/admin/car')),
  workers: () => unwrap<AdminWorker[]>(api.get('/api/admin/workers')),
  fraudReview: (id: string, action: 'approve' | 'reject') =>
    unwrap(api.put(`/api/admin/fraud/${id}`, { action })),
  ai: (prompt: string) => unwrap<{ text: string }>(api.post('/api/admin/ai', { prompt })),
}

export const sensorsApi = {
  latest: (city: string) =>
    unwrap<{
      rainfallMmHr: number
      heatIndexC: number
      aqiScore: number
      cancelRatePct: number
      platformStatus: string
    }>(api.get(`/api/sensors/latest?city=${encodeURIComponent(city)}`)),
}
