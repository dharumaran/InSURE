import type { SensorLatest } from '@/types'
import { create } from 'zustand'

type State = {
  live: SensorLatest | null
  setLive: (s: SensorLatest | null) => void
  applyMockDrift: () => void
}

export const useSensorStore = create<State>((set) => ({
  live: null,
  setLive: (live) => set({ live }),
  applyMockDrift: () =>
    set((state) => {
      const cur = state.live
      if (!cur) return state
      return {
        live: {
          ...cur,
          rainfallMmHr: Math.max(0, cur.rainfallMmHr + (Math.random() - 0.44) * 5),
          heatIndexC: cur.heatIndexC + (Math.random() - 0.5) * 0.8 * 1,
          aqiScore: Math.max(
            0,
            Math.round(cur.aqiScore + (Math.random() - 0.5) * 18),
          ),
          cancelRatePct: Math.max(
            0,
            Math.min(100, cur.cancelRatePct + (Math.random() - 0.5) * 4),
          ),
          platformStatus: Math.random() > 0.97 ? 'degraded' : cur.platformStatus,
          recordedAt: new Date().toISOString(),
        },
      }
    }),
}))
