import { payoutsApi } from '@/lib/api'
import type { PayoutRow } from '@/types'
import { useQuery } from '@tanstack/react-query'

export function usePayouts(workerId: string | null) {
  return useQuery({
    queryKey: ['payouts', workerId],
    queryFn: () => payoutsApi.list(workerId ?? '') as Promise<PayoutRow[]>,
    enabled: Boolean(workerId),
    refetchInterval: 30_000,
  })
}
