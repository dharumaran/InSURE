export function StatusBar({ label, live }: { label: string; live?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs text-fg-muted">
      {live ? (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="live-dot-ring absolute inline-flex h-full w-full rounded-full bg-success" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
        </span>
      ) : null}
      <span className="font-mono uppercase tracking-wide">{label}</span>
    </div>
  )
}
