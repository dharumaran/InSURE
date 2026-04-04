import { motion } from 'framer-motion'

type Props = { value: number; status: string }

function tone(s: string) {
  if (s === 'stable') return 'text-success'
  if (s === 'monitor') return 'text-warning'
  return 'text-danger'
}

export function CARGauge({ value, status }: Props) {
  const cls = tone(status)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border border-bright-border bg-card p-6 text-center shadow-glow ${cls}`}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-fg-muted">CAR</p>
      <p className="font-mono text-5xl font-bold">{value.toFixed(2)}</p>
      <p className="mt-2 font-display text-sm capitalize text-fg-muted">{status.replace(/_/g, ' ')}</p>
    </motion.div>
  )
}
