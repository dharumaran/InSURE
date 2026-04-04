import { adminApi, sensorsApi } from '@/lib/api'
import { computeRiskScore } from '@shieldride/shared'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const cities = ['Mumbai', 'Delhi', 'Bengaluru'] as const

function MiniOrb({ risk }: { risk: number }) {
  const r = 40
  const c = 2 * Math.PI * r
  const dash = c * (1 - risk)
  const color = risk < 0.35 ? '#00D68F' : risk < 0.65 ? '#FFB547' : '#FF5370'
  return (
    <svg className="-rotate-90" width="96" height="96" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
      <circle
        cx="50"
        cy="50"
        r={r}
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={dash}
      />
      <text x="50" y="54" textAnchor="middle" fill="#F0F4FF" className="font-mono text-sm">
        {(risk * 100).toFixed(0)}
      </text>
    </svg>
  )
}

export function OverviewPage() {
  const overviewQ = useQuery({ queryKey: ['admin', 'overview'], queryFn: adminApi.overview })
  const sensorsQ = useQuery({
    queryKey: ['admin', 'sensors', cities],
    queryFn: async () => {
      const rows = await Promise.all(cities.map((c) => sensorsApi.latest(c)))
      return cities.map((city, i) => ({ city, ...rows[i] }))
    },
  })

  const mumbai = sensorsQ.data?.[0]
  const risk = mumbai
    ? computeRiskScore({
        rainfallMmHr: mumbai.rainfallMmHr,
        heatIndexC: mumbai.heatIndexC,
        aqiScore: mumbai.aqiScore,
        cancelRatePct: mumbai.cancelRatePct,
        platformStatus: mumbai.platformStatus as 'online' | 'degraded' | 'outage',
      })
    : null

  const pie = overviewQ.data
    ? [
        { name: 'rain', value: 0.25 * (risk?.components.R ?? 0.2) },
        { name: 'heat', value: 0.15 * (risk?.components.H ?? 0.2) },
        { name: 'aqi', value: 0.1 * (risk?.components.A ?? 0.2) },
        { name: 'out', value: 0.2 * (risk?.components.O ?? 0.2) },
        { name: 'can', value: 0.15 * (risk?.components.C ?? 0.2) },
      ]
    : []

  const recent = [
    { t: 'rainfall', city: 'Mumbai', v: '38 mm/hr' },
    { t: 'aqi', city: 'Delhi', v: 'AQI 310' },
    { t: 'demand', city: 'Bengaluru', v: 'Cancel 48%' },
  ]

  if (!overviewQ.data) {
    return <p className="text-fg-muted">Loading…</p>
  }

  const { activeWorkers, payoutsToday, fraudQueue, car } = overviewQ.data

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active workers', v: activeWorkers },
          { label: 'Payouts 24h', v: payoutsToday },
          { label: 'CAR', v: car.car.toFixed(2) },
          { label: 'Fraud queue', v: fraudQueue },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-dim-border bg-card p-4 shadow-glow">
            <p className="font-mono text-xs text-fg-muted">{m.label}</p>
            <p className="font-mono text-2xl text-fg">{m.v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-dim-border bg-card p-4">
          <p className="font-display text-sm font-semibold text-fg">Live sensor grid</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {sensorsQ.data?.map((s) => (
              <div key={s.city} className="rounded-xl border border-dim-border bg-glass p-3 font-mono text-xs text-fg-muted">
                <p className="text-accent">{s.city}</p>
                <p>R {s.rainfallMmHr.toFixed(1)}</p>
                <p>H {s.heatIndexC.toFixed(1)}°</p>
                <p>AQI {s.aqiScore}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-dim-border bg-card p-4">
          <p className="font-display text-sm font-semibold text-fg">R_w breakdown (Mumbai)</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {risk ? <MiniOrb risk={risk.riskScore} /> : null}
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" innerRadius={28} outerRadius={50} paddingAngle={2}>
                    {pie.map((_, i) => (
                      <Cell key={i} fill={['#3B9EFF', '#FFB547', '#00D68F', '#B388FF', '#FF5370'][i % 5]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {risk ? (
            <p className="mt-2 font-mono text-xs text-fg-muted">
              P_w ≈ ₹{risk.premiumRupees}/wk · R {risk.components.R.toFixed(2)} H {risk.components.H.toFixed(2)} A{' '}
              {risk.components.A.toFixed(2)} O {risk.components.O.toFixed(2)} C {risk.components.C.toFixed(2)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="rounded-2xl border border-dim-border bg-card p-4">
        <p className="font-display text-sm font-semibold text-fg">Recent triggers</p>
        <table className="mt-3 w-full text-left text-sm text-fg-muted">
          <thead>
            <tr className="border-b border-dim-border font-mono text-xs">
              <th className="pb-2">Type</th>
              <th className="pb-2">City</th>
              <th className="pb-2">Reading</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.t + r.city} className="border-b border-dim-border/50">
                <td className="py-2 text-fg">{r.t}</td>
                <td>{r.city}</td>
                <td className="font-mono">{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
