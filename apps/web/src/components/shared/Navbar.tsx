import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="border-b border-dim-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 lg:max-w-5xl">
        <Link to="/dashboard" className="font-display text-lg font-bold text-fg">
          ShieldRide
        </Link>
        <nav className="flex gap-4 text-sm text-fg-muted">
          <Link to="/dashboard" className="hover:text-accent">
            Dashboard
          </Link>
          <Link to="/policy" className="hover:text-accent">
            Policy
          </Link>
        </nav>
      </div>
    </header>
  )
}
