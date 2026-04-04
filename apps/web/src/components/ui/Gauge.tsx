type Props = {
  label: string
  value: number
  max: number
  lo: number
  hi: number
}

function tone(value: number, lo: number, hi: number): 'success' | 'warning' | 'danger' {
  if (value < lo) return 'success'
  if (value <= hi) return 'warning'
  return 'danger'
}

const colors = {
  success: 'from-success/40 to-success',
  warning: 'from-warning/40 to-warning',
  danger: 'from-danger/40 to-danger',
} as const

export function Gauge({ label, value, max, lo, hi }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const t = tone(value, lo, hi)
  return (
    <div className="space-y-2">
      <div className="flex justify-between font-mono text-2xs text-fg-muted">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/5">
        <div
          className={`h-1 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${colors[t]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
