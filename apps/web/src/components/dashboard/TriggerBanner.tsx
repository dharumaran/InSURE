import { Card } from '@/components/ui/Card'
import type { TriggerActive } from '@shieldride/shared'
import { motion } from 'framer-motion'

type Props = {
  triggers: TriggerActive[]
  baselineIncomePaise: number
}

const labels: Record<string, string> = {
  rainfall: 'Heavy rain',
  heat: 'Heat index',
  aqi: 'AQI hazard',
  outage: 'Platform outage',
  demand: 'Order collapse',
}

export function TriggerBanner({ triggers, baselineIncomePaise }: Props) {
  const active = triggers.filter((t) => t.active)
  if (active.length === 0) return null

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <Card className="border-danger/40 shadow-glow">
        <p className="font-display text-sm font-bold text-danger">Active triggers — payout in progress</p>
        <ul className="mt-3 space-y-2 text-sm text-fg-muted">
          {active.map((t) => {
            const pct = t.payoutPct ?? 0
            const amt = Math.round(baselineIncomePaise * pct)
            return (
              <li key={t.type} className="flex justify-between gap-2 border-t border-dim-border pt-2 first:border-t-0 first:pt-0">
                <span>
                  {labels[t.type] ?? t.type}: {t.reason}
                </span>
                <span className="font-mono text-success">₹{(amt / 100).toFixed(0)}</span>
              </li>
            )
          })}
        </ul>
      </Card>
    </motion.div>
  )
}
