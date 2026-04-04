import { HeroCard } from '@/components/dashboard/HeroCard'
import { IncomeChart } from '@/components/dashboard/IncomeChart'
import { PayoutHistory } from '@/components/dashboard/PayoutHistory'
import { PayoutToast } from '@/components/dashboard/PayoutToast'
import { RiskMonitor } from '@/components/dashboard/RiskMonitor'
import { TriggerBanner } from '@/components/dashboard/TriggerBanner'
import { Navbar } from '@/components/shared/Navbar'
import { Button } from '@/components/ui/Button'
import { usePayouts } from '@/hooks/usePayouts'
import { useSensors } from '@/hooks/useSensors'
import { useTriggers } from '@/hooks/useTriggers'
import { workersApi } from '@/lib/api'
import { useSensorStore } from '@/stores/sensorStore'
import { useWorkerStore } from '@/stores/workerStore'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const workerId = useWorkerStore((s) => s.workerId)
  const city = useWorkerStore((s) => s.city)
  const live = useSensorStore((s) => s.live)

  const workerQ = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => workersApi.get(workerId ?? ''),
    enabled: Boolean(workerId),
  })
  const incomeQ = useQuery({
    queryKey: ['income', workerId],
    queryFn: () => workersApi.income(workerId ?? ''),
    enabled: Boolean(workerId),
  })

  useSensors(city)
  const triggersQ = useTriggers(city)
  const payoutsQ = usePayouts(workerId)

  const baseline = workerQ.data?.baselineIncomePaise ?? 65_000
  const paid = Boolean(workerQ.data?.policies[0]?.premiumPaidAt)
  const weekEarnedPaise = incomeQ.data?.reduce((a, d) => a + d.incomePaise, 0) ?? 0
  const coveredPaise =
    payoutsQ.data?.filter((p) => p.status === 'credited').reduce((a, p) => a + p.payoutAmountPaise, 0) ?? 52_000

  const [toastOpen, setToastOpen] = useState(false)
  const [toastAmt, setToastAmt] = useState(520)
  const firedRainRef = useRef(false)

  useEffect(() => {
    const r = live?.rainfallMmHr ?? 0
    if (r > 35 && !firedRainRef.current) {
      firedRainRef.current = true
      setToastAmt(Math.round((baseline * 0.8) / 100))
      setToastOpen(true)
    }
    if (r <= 30) firedRainRef.current = false
  }, [live?.rainfallMmHr, baseline])

  return (
    <div className="min-h-screen bg-base pb-24">
      <Navbar />
      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 lg:max-w-5xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4 lg:grid lg:grid-cols-2"
        >
          <div className="space-y-4">
            <HeroCard
              worker={workerQ.data ?? null}
              weekEarnedPaise={weekEarnedPaise}
              coveredPaise={coveredPaise}
              paid={paid}
            />
            {triggersQ.data ? (
              <TriggerBanner triggers={triggersQ.data} baselineIncomePaise={baseline} />
            ) : null}
            {incomeQ.data ? <IncomeChart data={incomeQ.data} /> : null}
          </div>
          <div className="space-y-4">
            <RiskMonitor sensor={live} />
            {payoutsQ.data ? <PayoutHistory items={payoutsQ.data} /> : null}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setToastAmt(520)
                setToastOpen(true)
              }}
            >
              Simulate payout (demo)
            </Button>
            {!workerId ? (
              <p className="text-center text-sm text-fg-muted">
                <Link to="/" className="text-accent underline">
                  Complete onboarding
                </Link>{' '}
                to load your profile.
              </p>
            ) : null}
          </div>
        </motion.div>
      </main>
      <PayoutToast
        open={toastOpen}
        amountRupees={toastAmt}
        name={workerQ.data?.name?.split(' ')[0]}
        onClose={() => setToastOpen(false)}
      />
    </div>
  )
}
