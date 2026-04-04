import { Card } from '@/components/ui/Card'
import type { IncomeDay } from '@/types'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'

type Props = { data: IncomeDay[] }

export function IncomeChart({ data }: Props) {
  const chart = data.map((d) => ({
    ...d,
    incomeRupees: d.incomePaise / 100,
    rain: d.day === 'Wed',
  }))
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
      <Card>
        <h3 className="font-display text-sm font-semibold text-fg">7-day income</h3>
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#8899BB', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#8899BB', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Bar dataKey="incomeRupees" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {chart.map((entry) => (
                  <Cell key={entry.day} fill={entry.rain ? '#FF5370' : '#3B9EFF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-dim-border bg-glass p-3 text-xs text-fg-muted">
          <span aria-hidden>🌧️</span>
          <p>Wed rain: ₹80 earned → ShieldRide auto-paid ₹520</p>
        </div>
      </Card>
    </motion.div>
  )
}
