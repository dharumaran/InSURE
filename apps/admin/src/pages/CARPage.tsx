import { CARGauge } from '@/components/CARGauge'
import { adminApi, sensorsApi } from '@/lib/api'
import { computeRiskScore } from '@shieldride/shared'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

export function CARPage() {
  const carQ = useQuery({ queryKey: ['admin', 'car'], queryFn: adminApi.car })
  const sensorQ = useQuery({ queryKey: ['sensor', 'Mumbai'], queryFn: () => sensorsApi.latest('Mumbai') })
  const risk = sensorQ.data
    ? computeRiskScore({
        rainfallMmHr: sensorQ.data.rainfallMmHr,
        heatIndexC: sensorQ.data.heatIndexC,
        aqiScore: sensorQ.data.aqiScore,
        cancelRatePct: sensorQ.data.cancelRatePct,
        platformStatus: sensorQ.data.platformStatus as 'online' | 'degraded' | 'outage',
      })
    : null

  if (!carQ.data) return <p className="text-fg-muted">Loading…</p>
  const c = carQ.data

  const rows = [
    { k: 'Premium pool', v: '₹25,000' },
    { k: 'Seed buffer', v: '₹15,000' },
    { k: 'Trigger rate (model)', v: '22%' },
    { k: 'Avg payout (EMA)', v: 'from ledger' },
    { k: 'Active workers', v: 'live count' },
    { k: 'Expected loss', v: 'τ × avg × N' },
    { k: 'CAR', v: c.car.toFixed(2) },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-8 lg:grid-cols-2">
      <div>
        <CARGauge value={c.car} status={c.status} />
        <p className="mt-4 text-sm text-fg-muted">
          CAR &lt; 1.5 monitor · &lt; 1.2 increase α · &lt; 1.0 pause new policies
        </p>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-dim-border bg-card p-4">
          <p className="font-display text-sm font-semibold text-fg">Unit economics</p>
          <table className="mt-3 w-full text-sm">
            <tbody className="text-fg-muted">
              {rows.map((r) => (
                <tr key={r.k} className="border-b border-dim-border/40">
                  <td className="py-2">{r.k}</td>
                  <td className="py-2 text-right font-mono text-fg">{r.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-dim-border bg-card p-4">
          <p className="font-display text-sm font-semibold text-fg">Premium formula (live Mumbai)</p>
          {risk ? (
            <p className="mt-2 font-mono text-sm text-fg-muted">
              P_w = min(round(75×(1+0.7×R_w)), 120), floor ₹80 → now ₹{risk.premiumRupees} with R_w{' '}
              {risk.riskScore.toFixed(2)}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
