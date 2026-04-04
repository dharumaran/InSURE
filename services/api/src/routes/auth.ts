import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../db.js'
import { ok, fail } from '../http/envelope.js'
import { validateBody } from '../middleware/validate.js'
import { logger } from '../logger.js'

const router = Router()

const sendOtpSchema = z.object({ phone: z.string().regex(/^\d{10}$/) })
const verifyOtpSchema = z.object({ phone: z.string().regex(/^\d{10}$/), otp: z.string().regex(/^\d{6}$/) })

router.post('/send-otp', validateBody(sendOtpSchema), async (req, res) => {
  try {
    res.json(ok({ otpSent: true, demoOtp: '123456' }))
  } catch (error) {
    res.status(500).json(fail('AUTH_SEND_OTP_FAILED', 'Unable to send OTP', error))
  }
})

router.post('/verify-otp', validateBody(verifyOtpSchema), async (req, res) => {
  try {
    const { phone, otp } = req.body
    const demoOtp = process.env['DEMO_OTP']?.trim() || '123456'
    if (otp !== demoOtp) {
      res.status(401).json(fail('INVALID_OTP', 'Wrong OTP. Use the code we sent (demo: 123456).'))
      return
    }
    // Omit `email` here so OTP works even if `Worker.email` migration is not applied yet (column missing → Prisma error).
    const worker = await prisma.worker.findUnique({
      where: { phone },
      select: {
        id: true,
        name: true,
        city: true,
        platform: true,
        phone: true,
        upiHandle: true,
      },
    })
    const secret = process.env['JWT_SECRET']
    if (!secret) {
      res.status(500).json(fail('SERVER_ERROR', 'JWT secret missing'))
      return
    }
    const token = jwt.sign(
      { sub: worker?.id ?? `new-${phone}`, phone, role: 'worker' as const },
      secret,
      { expiresIn: '7d' },
    )
    res.json(ok({ token, worker: worker ?? null }))
  } catch (error) {
    logger.error({ err: error }, 'verify-otp failed')
    res.status(500).json(
      fail(
        'AUTH_VERIFY_OTP_FAILED',
        'Could not complete sign-in. Check the API database connection, run prisma migrate deploy, and ensure JWT_SECRET is set on the server.',
        error instanceof Error ? error.message : error,
      ),
    )
  }
})

export default router

