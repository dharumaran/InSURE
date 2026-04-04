import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { fail } from '../http/envelope.js'

type JwtPayload = { sub: string; phone: string; role?: 'worker' | 'admin' }

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const auth = req.headers.authorization
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) {
      res.status(401).json(fail('UNAUTHORIZED', 'Missing bearer token'))
      return
    }
    const secret = process.env['JWT_SECRET']
    if (!secret) {
      res.status(500).json(fail('SERVER_ERROR', 'JWT secret missing'))
      return
    }
    const decoded = jwt.verify(token, secret)
    if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded) || !('phone' in decoded)) {
      res.status(401).json(fail('UNAUTHORIZED', 'Invalid token payload'))
      return
    }
    req.auth = decoded as JwtPayload
    next()
  } catch (error) {
    res.status(401).json(fail('UNAUTHORIZED', 'Invalid or expired token', error))
  }
}

