import type { ReactNode } from 'react'

const toneMap = {
  success: 'text-success border-success/25 bg-success/10',
  danger: 'text-danger border-danger/25 bg-danger/10',
  warning: 'text-warning border-warning/25 bg-warning/10',
  accent: 'text-accent border-accent/25 bg-accent/10',
  muted: 'text-fg-muted border-dim-border bg-glass',
} as const

type Tone = keyof typeof toneMap

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest ${toneMap[tone]}`}
    >
      {children}
    </span>
  )
}
