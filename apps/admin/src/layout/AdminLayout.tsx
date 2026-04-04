import { NavLink, Outlet } from 'react-router-dom'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-accent/15 text-accent' : 'text-fg-muted hover:text-fg'}`

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-base">
      <header className="border-b border-dim-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <span className="font-display text-lg font-bold text-fg">ShieldRide · Ops</span>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" className={linkCls} end>
              Overview
            </NavLink>
            <NavLink to="/triggers" className={linkCls}>
              Trigger log
            </NavLink>
            <NavLink to="/workers" className={linkCls}>
              Workers
            </NavLink>
            <NavLink to="/car" className={linkCls}>
              CAR
            </NavLink>
            <NavLink to="/ai" className={linkCls}>
              AI analyst
            </NavLink>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </div>
    </div>
  )
}
