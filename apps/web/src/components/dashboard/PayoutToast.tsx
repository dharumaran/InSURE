import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  open: boolean
  amountRupees: number
  name?: string
  onClose: () => void
}

export function PayoutToast({ open, amountRupees, name, onClose }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,380px)] -translate-x-1/2"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-success/30 bg-gradient-to-b from-success/20 to-card px-4 py-4 shadow-glow"
            role="status"
          >
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-success">Payout processed</p>
            <p className="mt-1 font-mono text-2xl text-fg">₹{amountRupees.toFixed(0)}</p>
            <p className="mt-1 text-sm text-fg-muted">
              Credited. Stay safe{name ? `, ${name}` : ''} 🛡️
            </p>
            <button
              type="button"
              className="mt-3 text-xs text-accent underline"
              onClick={onClose}
            >
              Dismiss
            </button>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-success to-transparent" />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
