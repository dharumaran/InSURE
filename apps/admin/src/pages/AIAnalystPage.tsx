import { adminApi, sensorsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

type LocState = { prefetch?: string } | null | undefined

const cards = [
  { key: 'forecast', label: 'City risk forecast', icon: '🌆' },
  { key: 'fraud', label: 'Fraud pattern', icon: '🛡️' },
  { key: 'premium', label: 'Premium optimisation', icon: '₹' },
  { key: 'expansion', label: 'Expansion strategy', icon: '📈' },
] as const

export function AIAnalystPage() {
  const loc = useLocation()
  const prefetch = (loc.state as LocState)?.prefetch
  const sensorQ = useQuery({ queryKey: ['ai', 'mumbai'], queryFn: () => sensorsApi.latest('Mumbai') })
  const carQ = useQuery({ queryKey: ['ai', 'car'], queryFn: adminApi.car })
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)

  const context = `Live Mumbai sensors: rain ${sensorQ.data?.rainfallMmHr.toFixed(1) ?? '—'} mm/hr, heat ${sensorQ.data?.heatIndexC.toFixed(1) ?? '—'}°C, AQI ${sensorQ.data?.aqiScore ?? '—'}, cancel ${sensorQ.data?.cancelRatePct.toFixed(1) ?? '—'}%. CAR ${carQ.data?.car.toFixed(2) ?? '—'} (${carQ.data?.status ?? '—'}). `

  async function run(label: string) {
    setBusy(true)
    setOut('')
    const extra = prefetch ? `${prefetch} ` : ''
    const prompt = `${extra}${context}Task: ${label}. Answer in plain sentences only.`
    try {
      const r = await adminApi.ai(prompt)
      setOut(r.text)
    } catch (e) {
      setOut(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-fg">AI analyst</h1>
      <p className="text-sm text-fg-muted">Claude · live sensors + CAR fed into every prompt</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map((c, i) => (
          <motion.button
            key={c.key}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            disabled={busy}
            onClick={() => run(c.label)}
            className="flex items-center gap-3 rounded-2xl border border-dim-border bg-card p-4 text-left hover:border-bright-border"
          >
            <span className="text-2xl">{c.icon}</span>
            <span className="font-display text-sm font-semibold text-fg">{c.label}</span>
            <span className="ml-auto text-xs text-accent">Run →</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-dim-border bg-card p-4">
        <p className="font-mono text-xs text-purple">Output</p>
        {busy ? <p className="mt-2 text-sm text-fg-muted">Thinking…</p> : null}
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg">{out}</p>
      </div>
    </div>
  )
}
