import { Navbar } from '@/components/shared/Navbar'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'

export function PolicyPage() {
  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-6 lg:max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="font-display text-2xl font-bold text-fg">Your cover</h1>
          <p className="text-sm text-fg-muted">Parametric triggers · automatic UPI payout</p>
          <Card className="mt-6">
            <h2 className="font-display text-sm font-semibold text-accent">Triggers</h2>
            <ul className="mt-3 space-y-2 text-sm text-fg-muted">
              <li>Rain &gt; 35 mm/hr sustained 45+ min → 80% baseline</li>
              <li>Heat index &gt; 42°C (11:00–16:00 IST) → 60% baseline</li>
              <li>AQI &gt; 300 sustained 3h → 50% baseline</li>
              <li>Platform outage / 90m+ degraded → 70% × hours/10 × baseline</li>
              <li>Cancel rate &gt; 45% 2h+ (min 5 orders) → 40% baseline</li>
            </ul>
          </Card>
          <Card className="mt-4">
            <h2 className="font-display text-sm font-semibold text-fg">Fraud &amp; review</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Claims are held for review when needed — never silently dropped. Payouts route to manual queue when
              risk is high.
            </p>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
