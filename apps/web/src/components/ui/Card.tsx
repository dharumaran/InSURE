import type { ReactNode } from 'react'

export function Card({
  children,
  glow = false,
  className = '',
}: {
  children: ReactNode
  glow?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-dim-border bg-card p-4 transition hover:border-white/10 md:p-6 ${glow ? 'shadow-glow' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
