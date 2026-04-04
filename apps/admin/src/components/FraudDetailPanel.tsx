import type { AdminPayout, FraudFlag } from '@/lib/api'
import { motion } from 'framer-motion'

type Props = {
  payout: AdminPayout | null
  flag: FraudFlag | null
  onApprove: () => void
  onReject: () => void
}

function Gauge({ label, v, w }: { label: string; v: number; w: string }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-xs text-fg-muted">
        <span>
          {label} ({w})
        </span>
        <span>{v.toFixed(2)}</span>
      </div>
      <div className="mt-1 h-1 w-full rounded-full bg-white/5">
        <div
          className="h-1 rounded-full bg-gradient-to-r from-purple/40 to-purple"
          style={{ width: `${Math.min(100, v * 100)}%` }}
        />
      </div>
    </div>
  )
}

export function FraudDetailPanel({ payout, flag, onApprove, onReject }: Props) {
  if (!payout) {
    return <p className="rounded-2xl border border-dim-border bg-card p-4 text-sm text-fg-muted">Select a payout row</p>
  }
  const comps = payout.fraudComponents as { B?: number; G?: number; L?: number } | null
  const B = comps?.B ?? flag?.scoreB ?? 0
  const G = comps?.G ?? flag?.scoreG ?? 0
  const L = comps?.L ?? flag?.scoreL ?? 0
  const fw = payout.fraudScore
  const review = payout.status === 'review'
  const badge =
    fw < 0.3 ? 'AUTO' : fw < 0.5 ? 'LOG' : fw < 0.8 ? 'REVIEW' : 'MANUAL'

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-dim-border bg-card p-4 lg:sticky lg:top-4"
    >
      <p className="font-mono text-xs text-accent">Fraud detail</p>
      <h3 className="font-display text-lg font-semibold text-fg">{payout.worker.name}</h3>
      <p className="text-xs text-fg-muted">
        {payout.triggerType} · {new Date(payout.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs text-fg-muted">
        <dt>Trigger value</dt>
        <dd className="text-fg">{payout.triggerValue}</dd>
        <dt>Payout</dt>
        <dd className="text-success">₹{(payout.payoutAmountPaise / 100).toFixed(0)}</dd>
        <dt>Status</dt>
        <dd className="text-fg">{payout.status}</dd>
        <dt>F_w</dt>
        <dd className="text-warning">{fw.toFixed(2)}</dd>
        <dt>Band</dt>
        <dd className="text-fg">{badge}</dd>
      </dl>
      <div className="mt-4 space-y-3">
        <Gauge label="B behavioral" v={B} w="0.40" />
        <Gauge label="G geo" v={G} w="0.35" />
        <Gauge label="L linkage" v={L} w="0.25" />
      </div>
      {flag && review ? (
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl border border-success/25 bg-success/10 py-2 text-sm font-semibold text-success"
            onClick={onApprove}
          >
            Approve
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl border border-danger/25 bg-danger/10 py-2 text-sm font-semibold text-danger"
            onClick={onReject}
          >
            Reject
          </button>
        </div>
      ) : null}
    </motion.aside>
  )
}
