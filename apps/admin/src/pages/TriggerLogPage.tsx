import { FraudDetailPanel } from '@/components/FraudDetailPanel'
import { adminApi, type AdminPayout, type FraudFlag } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

export function TriggerLogPage() {
  const qc = useQueryClient()
  const payoutsQ = useQuery({ queryKey: ['admin', 'payouts'], queryFn: adminApi.payouts })
  const fraudQ = useQuery({ queryKey: ['admin', 'fraud'], queryFn: adminApi.fraudQueue })
  const [selected, setSelected] = useState<AdminPayout | null>(null)

  const flagByPayout = useMemo(() => {
    const m = new Map<string, FraudFlag>()
    for (const f of fraudQ.data ?? []) {
      if (f.payoutId) m.set(f.payoutId, f)
    }
    return m
  }, [fraudQ.data])

  const mu = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      adminApi.fraudReview(id, action),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'payouts'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'fraud'] })
    },
  })

  const selFlag = selected ? flagByPayout.get(selected.id) ?? null : null

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="font-display text-xl font-bold text-fg">Trigger log</h1>
        <p className="text-sm text-fg-muted">Payout events · click Arjun Singh AQI row for fraud matrix</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-dim-border bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="font-mono text-xs text-fg-muted">
              <tr className="border-b border-dim-border">
                <th className="p-3">Worker</th>
                <th className="p-3">Trigger</th>
                <th className="p-3">F_w</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(payoutsQ.data ?? []).map((p) => (
                <tr
                  key={p.id}
                  className={`cursor-pointer border-b border-dim-border/40 hover:bg-white/5 ${
                    selected?.id === p.id ? 'bg-accent/10' : ''
                  }`}
                  onClick={() => setSelected(p)}
                >
                  <td className="p-3 text-fg">{p.worker.name}</td>
                  <td className="p-3 font-mono text-fg-muted">{p.triggerType}</td>
                  <td className="p-3 font-mono text-warning">{p.fraudScore.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="rounded-full border border-dim-border px-2 py-0.5 text-xs">{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <FraudDetailPanel
        payout={selected}
        flag={selFlag}
        onApprove={() => selFlag && mu.mutate({ id: selFlag.id, action: 'approve' })}
        onReject={() => selFlag && mu.mutate({ id: selFlag.id, action: 'reject' })}
      />
    </div>
  )
}
