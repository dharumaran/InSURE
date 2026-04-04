import { sensorsApi } from '@/lib/api'
import { useSensorStore } from '@/stores/sensorStore'
import type { SensorLatest } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

const mock = import.meta.env.VITE_MOCK_SENSORS === 'true'

export function useSensors(city: string) {
  const setLive = useSensorStore((s) => s.setLive)
  const applyMockDrift = useSensorStore((s) => s.applyMockDrift)

  const q = useQuery({
    queryKey: ['sensors', 'latest', city],
    queryFn: () => sensorsApi.latest(city) as Promise<SensorLatest>,
    refetchInterval: 15_000,
  })

  useEffect(() => {
    if (q.data) setLive(q.data)
  }, [q.data, setLive])

  useEffect(() => {
    if (!mock) return
    const id = window.setInterval(() => applyMockDrift(), 2800)
    return () => clearInterval(id)
  }, [applyMockDrift])

  return q
}
