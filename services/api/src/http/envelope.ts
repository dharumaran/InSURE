import type { ApiEnvelope } from '@shieldride/shared'

export function ok<T>(data: T, meta: Record<string, unknown> = {}): ApiEnvelope<T> {
  return { data, error: null, meta }
}

export function fail(
  code: string,
  message: string,
  details?: unknown,
  meta: Record<string, unknown> = {},
): ApiEnvelope<null> {
  return { data: null, error: { code, message, details }, meta }
}

