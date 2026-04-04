import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { WorkerProfile } from '@/types'
import { motion } from 'framer-motion'

type Props = {
  worker: WorkerProfile | null
  weekEarnedPaise: number
  coveredPaise: number
  paid: boolean
}

export function HeroCard({ worker, weekEarnedPaise, coveredPaise, paid }: Props) {
  const first = worker?.name?.split(' ')[0] ?? 'Rider'
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card glow className="border-bright-border bg-gradient-to-br from-card via-card to-accent/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-fg-muted">Hey {first},</p>
            <h1 className="font-display text-2xl font-bold text-fg md:text-3xl">Stay covered on shift</h1>
            <p className="mt-1 text-sm text-fg-muted">
              {worker?.platform?.toUpperCase()} · {worker?.city}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {paid ? (
              <Badge tone="success">Active</Badge>
            ) : (
              <Badge tone="danger">Unpaid</Badge>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-xl border border-dim-border bg-glass px-3 py-2 font-mono text-xs text-fg-muted">
            This week earned <span className="text-fg">₹{(weekEarnedPaise / 100).toFixed(0)}</span>
          </div>
          <div className="rounded-xl border border-dim-border bg-glass px-3 py-2 font-mono text-xs text-fg-muted">
            ShieldRide covered <span className="text-success">₹{(coveredPaise / 100).toFixed(0)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
