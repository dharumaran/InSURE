import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DEMO_OTP, DEMO_PHONE, CITIES, PLATFORMS } from '@/lib/constants'
import { authApi, policiesApi, workersApi } from '@/lib/api'
import { useWorkerStore } from '@/stores/workerStore'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const steps = ['Phone', 'Profile', 'Pay', 'Active'] as const

function weekStartIso(): string {
  const d = new Date()
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const setSession = useWorkerStore((s) => s.setSession)
  const setCity = useWorkerStore((s) => s.setCity)
  const [step, setStep] = useState(0)
  const [phone, setPhone] = useState(DEMO_PHONE)
  const [otp, setOtp] = useState(DEMO_OTP)
  const [token, setToken] = useState<string | null>(null)
  const [workerId, setWorkerId] = useState<string | null>(null)
  const [name, setName] = useState('Rajan Kumar')
  const [city, setCityLocal] = useState<(typeof CITIES)[number]>('Mumbai')
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>('zepto')
  const [pincode, setPincode] = useState('400001')
  const [upi, setUpi] = useState('rajan@upi')
  const [aadhaar, setAadhaarLast4] = useState('1234')
  const [busy, setBusy] = useState(false)
  const [policyId, setPolicyId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onVerify() {
    setErr(null)
    setBusy(true)
    try {
      await authApi.sendOtp(phone)
      const r = await authApi.verifyOtp(phone, otp)
      setToken(r.token)
      if (r.worker?.id) {
        setWorkerId(r.worker.id)
        setSession(r.token, r.worker.id)
        setCityLocal((r.worker.city as (typeof CITIES)[number]) ?? 'Mumbai')
        setCity(r.worker.city)
        setStep(2)
      } else {
        setSession(r.token, null)
        setStep(1)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Verify failed')
    } finally {
      setBusy(false)
    }
  }

  async function onCreateProfile() {
    if (!token) return
    setErr(null)
    setBusy(true)
    try {
      const w = await workersApi.create({
        phone,
        name,
        city,
        pincode,
        platform,
        upiHandle: upi,
        aadhaarLast4: aadhaar,
        baselineIncomeRupees: 650,
        deviceFingerprint: 'demo-device',
      })
      setWorkerId(w.id)
      setSession(token, w.id)
      setCity(city)
      setStep(2)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function onPay() {
    const wid = workerId
    if (!wid) return
    setErr(null)
    setBusy(true)
    try {
      let pid: string
      const workerRes = await workersApi.get(wid)
      const existing = workerRes.policies[0]
      if (existing && !existing.premiumPaidAt) {
        pid = existing.id
      } else {
        const pol = await policiesApi.create(wid, weekStartIso())
        pid = pol.id
      }
      await policiesApi.pay(pid, 'demo-upi-ref')
      setPolicyId(pid)
      setStep(3)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Payment step failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="mb-8 flex gap-1">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-white/10'}`}
            />
          ))}
        </div>
        <h1 className="font-display text-2xl font-bold text-fg">ShieldRide</h1>
        <p className="text-sm text-fg-muted">Parametric cover for Q-commerce riders · demo mode</p>

        {err ? <p className="mt-4 text-sm text-danger">{err}</p> : null}

        {step === 0 ? (
          <Card className="mt-6">
            <h2 className="font-display font-semibold text-fg">Phone & OTP</h2>
            <label className="mt-4 block text-xs text-fg-muted">Mobile</label>
            <input
              className="mt-1 w-full rounded-xl border border-dim-border bg-base px-3 py-2 font-mono text-fg outline-none focus:border-bright-border"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
            />
            <label className="mt-4 block text-xs text-fg-muted">OTP (any 6 digits in demo)</label>
            <input
              className="mt-1 w-full rounded-xl border border-dim-border bg-base px-3 py-2 font-mono text-fg outline-none focus:border-bright-border"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
            />
            <p className="mt-3 text-xs text-fg-muted">Aadhaar eKYC via DigiLocker in production</p>
            <Button className="mt-4 w-full" disabled={busy} onClick={onVerify}>
              Verify & continue
            </Button>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card className="mt-6">
            <h2 className="font-display font-semibold text-fg">Profile</h2>
            <label className="mt-4 block text-xs text-fg-muted">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-dim-border bg-base px-3 py-2 text-fg outline-none focus:border-bright-border"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="mt-4 block text-xs text-fg-muted">City</label>
            <select
              className="mt-1 w-full rounded-xl border border-dim-border bg-base px-3 py-2 text-fg outline-none focus:border-bright-border"
              value={city}
              onChange={(e) => setCityLocal(e.target.value as (typeof CITIES)[number])}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="mt-4 block text-xs text-fg-muted">Platform</label>
            <select
              className="mt-1 w-full rounded-xl border border-dim-border bg-base px-3 py-2 text-fg outline-none focus:border-bright-border"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as (typeof PLATFORMS)[number])}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <label className="mt-4 block text-xs text-fg-muted">Pincode</label>
            <input
              className="mt-1 w-full rounded-xl border border-dim-border bg-base px-3 py-2 font-mono text-fg outline-none focus:border-bright-border"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            <label className="mt-4 block text-xs text-fg-muted">UPI</label>
            <input
              className="mt-1 w-full rounded-xl border border-dim-border bg-base px-3 py-2 font-mono text-fg outline-none focus:border-bright-border"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
            />
            <label className="mt-4 block text-xs text-fg-muted">Aadhaar last 4</label>
            <input
              className="mt-1 w-full rounded-xl border border-dim-border bg-base px-3 py-2 font-mono text-fg outline-none focus:border-bright-border"
              value={aadhaar}
              onChange={(e) => setAadhaarLast4(e.target.value)}
            />
            <p className="mt-3 text-xs text-fg-muted">Only last 4 Aadhaar digits stored</p>
            <Button className="mt-4 w-full" disabled={busy} onClick={onCreateProfile}>
              Save & continue
            </Button>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card className="mt-6">
            <h2 className="font-display font-semibold text-fg">UPI & premium</h2>
            <p className="mt-2 text-sm text-fg-muted">Weekly plan · all 5 triggers · ~₹95 (varies with risk)</p>
            <ul className="mt-4 list-inside list-disc text-xs text-fg-muted">
              <li>Heavy rain, heat, AQI, outage, demand collapse</li>
            </ul>
            <input
              className="mt-4 w-full rounded-xl border border-dim-border bg-base px-3 py-2 font-mono text-fg outline-none focus:border-bright-border"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
            />
            <Button className="mt-4 w-full" variant="green" disabled={busy} onClick={onPay}>
              Pay via UPI (demo) →
            </Button>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card className="mt-6 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/20 text-3xl text-success"
            >
              ✓
            </motion.div>
            <p className="mt-4 font-mono text-sm text-accent">SHR-2026-{policyId?.slice(-6).toUpperCase() ?? 'ACTIVE'}</p>
            <Button className="mt-6 w-full" onClick={() => navigate('/dashboard')}>
              Open my dashboard →
            </Button>
          </Card>
        ) : null}
      </motion.div>
    </div>
  )
}
