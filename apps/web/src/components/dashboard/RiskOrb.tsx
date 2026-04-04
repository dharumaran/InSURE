import { motion } from 'framer-motion'

type Props = { value: number; premiumRupees: number }

function color(v: number) {
  if (v < 0.35) return 'text-success'
  if (v < 0.65) return 'text-warning'
  return 'text-danger'
}

export function RiskOrb({ value, premiumRupees }: Props) {
  const r = 52
  const c = 2 * Math.PI * r
  const dash = c * (1 - value)
  const cls = color(value)
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="-rotate-90" width="132" height="132" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className={cls}
          style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={value}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          className={`font-mono text-2xl font-bold ${cls}`}
        >
          {(value * 100).toFixed(0)}
        </motion.span>
        <span className="font-mono text-xs text-fg-muted">₹{premiumRupees}/wk</span>
      </div>
    </div>
  )
}
