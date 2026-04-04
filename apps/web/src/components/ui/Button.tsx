import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants = {
  primary: 'bg-accent text-white shadow-glow hover:brightness-110 border border-bright-border',
  ghost: 'bg-accent/10 border border-accent/25 text-accent hover:bg-accent/15',
  green: 'bg-success/10 border border-success/25 text-success hover:bg-success/15',
  danger: 'bg-danger/10 border border-danger/25 text-danger hover:bg-danger/15',
} as const

type Variant = keyof typeof variants

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`rounded-xl px-4 py-3 font-display text-sm font-semibold transition active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
