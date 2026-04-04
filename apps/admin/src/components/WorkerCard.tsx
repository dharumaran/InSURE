import type { AdminWorker } from '@/lib/api'
import { motion } from 'framer-motion'

type Props = { worker: AdminWorker; onAi: () => void }

export function WorkerCard({ worker, onAi }: Props) {
  const pol = worker.policies[0]
  return (
    <motion.div
      layout
      className="rounded-2xl border border-dim-border bg-card p-4 hover:border-white/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display font-semibold text-fg">{worker.name}</h3>
          <p className="font-mono text-xs text-fg-muted">
            {worker.id.slice(0, 8)} · {worker.platform} · {worker.city}
          </p>
        </div>
        <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
          {worker.status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-lg border border-dim-border bg-glass px-2 py-1 font-mono text-xs text-fg-muted">
          Baseline ₹{(worker.baselineIncomePaise / 100).toFixed(0)}
        </span>
        {pol ? (
          <>
            <span className="rounded-lg border border-dim-border bg-glass px-2 py-1 font-mono text-xs text-fg-muted">
              Prem ₹{(pol.premiumAmountPaise / 100).toFixed(0)}
            </span>
            <span className="rounded-lg border border-dim-border bg-glass px-2 py-1 font-mono text-xs text-fg-muted">
              R_w {pol.riskScore.toFixed(2)}
            </span>
          </>
        ) : null}
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        className="mt-4 w-full rounded-xl border border-purple/25 bg-purple/10 py-2 text-sm font-semibold text-purple"
        onClick={onAi}
      >
        AI analyse →
      </motion.button>
    </motion.div>
  )
}
