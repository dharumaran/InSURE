import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { fail } from '../http/envelope.js'

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json(fail('VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten()))
      return
    }
    req.body = parsed.data
    next()
  }
}

