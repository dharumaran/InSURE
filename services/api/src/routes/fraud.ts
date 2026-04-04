import { Router } from 'express'
import { z } from 'zod'
import { fail, ok } from '../http/envelope.js'
import { validateBody } from '../middleware/validate.js'
import { computeFraudScore } from '../services/fraudService.js'
import { mlFraudScore } from '../services/mlClient.js'

const router = Router()

const scoreSchema = z.object({
  incomeZ: z.number().optional(),
  suddenInactive: z.boolean().optional(),
  gpsSpeedKmh: z.number().optional(),
  staticWhileActive: z.boolean().optional(),
  weatherMismatch: z.boolean().optional(),
  sharedDeviceCount: z.number().int().min(0).optional(),
  sharedUpi: z.boolean().optional(),
  currentIncomePaise: z.number().optional(),
  mu30dPaise: z.number().optional(),
  sigma30dPaise: z.number().optional(),
  staticGpsMinutes: z.number().optional(),
})

router.post('/score', validateBody(scoreSchema), async (req, res) => {
  try {
    const b = req.body as z.infer<typeof scoreSchema>
    const ml = await mlFraudScore({
      incomeZ: b.incomeZ,
      suddenInactive: b.suddenInactive,
      gpsSpeedKmh: b.gpsSpeedKmh,
      staticWhileActive: b.staticWhileActive,
      weatherMismatch: b.weatherMismatch,
      sharedDeviceCount: b.sharedDeviceCount,
      sharedUpi: b.sharedUpi,
    })
    if (ml) {
      res.json(ok(ml))
      return
    }
    const rule = computeFraudScore({
      currentIncomePaise: b.currentIncomePaise ?? 65_000,
      mu30dPaise: b.mu30dPaise ?? 65_000,
      sigma30dPaise: b.sigma30dPaise ?? 12_000,
      gpsSpeedKmph: b.gpsSpeedKmh ?? 0,
      staticGpsMinutes: b.staticGpsMinutes ?? 0,
      weatherCellMismatch: b.weatherMismatch ?? false,
      sharedDeviceCount: b.sharedDeviceCount ?? 0,
      sharedUpi: b.sharedUpi ?? false,
    })
    res.json(ok({ B: rule.B, G: rule.G, L: rule.L, F_w: rule.F_w }))
  } catch (error) {
    res.status(500).json(fail('FRAUD_SCORE_FAILED', 'Unable to compute fraud score', error))
  }
})

export default router
