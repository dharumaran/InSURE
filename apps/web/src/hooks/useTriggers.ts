import { sensorsApi } from '@/lib/api'
import type { TriggerActive } from '@shieldride/shared'
import { useQuery } from '@tanstack/react-query'

export function useTriggers(city: string, enabled = true) {
  return useQuery({
    queryKey: ['sensors', 'triggers', city],
    queryFn: () => sensorsApi.triggers(city) as Promise<TriggerActive[]>,
    refetchInterval: 15_000,
    enabled,
  })
}
