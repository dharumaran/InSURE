import { WorkerCard } from '@/components/WorkerCard'
import { adminApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export function WorkersPage() {
  const nav = useNavigate()
  const q = useQuery({ queryKey: ['admin', 'workers'], queryFn: adminApi.workers })

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-fg">Workers</h1>
      <p className="text-sm text-fg-muted">Rider book · AI shortcut</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(q.data ?? []).map((w) => (
          <WorkerCard
            key={w.id}
            worker={w}
            onAi={() =>
              nav('/ai', {
                state: {
                  prefetch: `Worker ${w.name} in ${w.city} on ${w.platform}. Baseline ₹${(w.baselineIncomePaise / 100).toFixed(0)}/day. Suggest one risk action.`,
                },
              })
            }
          />
        ))}
      </div>
    </div>
  )
}
