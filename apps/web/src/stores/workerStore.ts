import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WorkerState = {
  token: string | null
  workerId: string | null
  city: string
  setSession: (token: string, workerId: string | null) => void
  setCity: (city: string) => void
  logout: () => void
}

export const useWorkerStore = create<WorkerState>()(
  persist(
    (set) => ({
      token: null,
      workerId: null,
      city: 'Mumbai',
      setSession: (token, workerId) => set({ token, workerId }),
      setCity: (city) => set({ city }),
      logout: () => set({ token: null, workerId: null }),
    }),
    { name: 'shieldride-worker' },
  ),
)
