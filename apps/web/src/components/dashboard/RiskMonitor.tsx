import { StatusBar } from '@/components/shared/StatusBar'
import { Card } from '@/components/ui/Card'
import { Gauge } from '@/components/ui/Gauge'
import { RiskOrb } from '@/components/dashboard/RiskOrb'
import { sensorsApi } from '@/lib/api'
import { computeRiskScore } from '@/lib/riskEngine'
import type { SensorLatest } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

type Props = { sensor: SensorLatest | null }

export function RiskMonitor({ sensor }: Props) {
  const riskQ = useQuery({
    queryKey: ['sensors', 'risk', sensor?.city],
    queryFn: () => sensorsApi.risk(sensor!.city),
    enabled: Boolean(sensor?.city),
  })

  if (!sensor) {
    return (
      <Card>
        <p className="text-sm text-fg-muted">Loading risk monitor…</p>
      </Card>
    )
  }
  const risk =
    riskQ.data ??
    computeRiskScore({
      rainfallMmHr: sensor.rainfallMmHr,
      heatIndexC: sensor.heatIndexC,
      aqiScore: sensor.aqiScore,
      cancelRatePct: sensor.cancelRatePct,
      platformStatus: sensor.platformStatus as 'online' | 'degraded' | 'outage',
    })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusBar label="Live risk monitor" live />
            <p className="mt-1 font-display text-xs text-fg-muted">
              R_w from API (XGBoost when ML service is linked) · fallback formula offline
            </p>
          </div>
          <RiskOrb value={risk.riskScore} premiumRupees={risk.premiumRupees} />
        </div>
        <div className="mt-6 space-y-4">
          <Gauge label="Rain (mm/hr)" value={sensor.rainfallMmHr} max={80} lo={25} hi={50} />
          <Gauge label="Heat index (°C)" value={sensor.heatIndexC} max={50} lo={35} hi={42} />
          <Gauge label="AQI" value={sensor.aqiScore} max={400} lo={200} hi={300} />
          <Gauge label="Cancel rate (%)" value={sensor.cancelRatePct} max={60} lo={30} hi={45} />
        </div>
        {sensor.platformStatus !== 'online' ? (
          <p className="mt-4 rounded-lg border border-warning/25 bg-warning/10 px-3 py-2 font-mono text-xs text-warning">
            Platform status: {sensor.platformStatus}
          </p>
        ) : null}
      </Card>
    </motion.div>
  )
}
