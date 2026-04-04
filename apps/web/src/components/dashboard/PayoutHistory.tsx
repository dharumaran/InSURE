import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { PayoutRow } from '@/types'
import { motion } from 'framer-motion'

type Props = { items: PayoutRow[] }

export function PayoutHistory({ items }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
      <Card>
        <h3 className="font-display text-sm font-semibold text-fg">Payout history</h3>
        <ul className="mt-4 space-y-3">
          {items.length === 0 ? (
            <li className="text-sm text-fg-muted">No payouts yet.</li>
          ) : (
            items.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-dim-border pt-3 first:border-t-0 first:pt-0"
              >
                <div>
                  <p className="font-mono text-xs text-fg-muted">{p.triggerType}</p>
                  <p className="text-xs text-fg-muted">
                    {new Date(p.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-success">₹{(p.payoutAmountPaise / 100).toFixed(0)}</span>
                  {p.status === 'review' ? <Badge tone="warning">In review</Badge> : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </Card>
    </motion.div>
  )
}
