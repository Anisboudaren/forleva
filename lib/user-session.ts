import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'forleva_user_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) throw new Error('AUTH_SECRET must be set and at least 16 characters')
  return secret
}

function sign(payload: string): string {
  const hmac = createHmac('sha256', getSecret())
  hmac.update(payload)
  return payload + '.' + hmac.digest('base64url')
}

function verify(value: string): string | null {
  const i = value.lastIndexOf('.')
  if (i === -1) return null
  const payload = value.slice(0, i)
  const sig = value.slice(i + 1)
  const expected = createHmac('sha256', getSecret()).update(payload).digest('base64url')
  if (expected.length !== sig.length) return null
  try {
    if (!timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sig, 'utf8'))) return null
  } catch {
    return null
  }
  return payload
}

export type UserSession = { userId: string; role: 'STUDENT' | 'TEACHER'; email: string | null }

export function setUserSessionCookie(session: UserSession): string {
  const payload = JSON.stringify({
    userId: session.userId,
    role: session.role,
    email: session.email ?? '',
  })
  return sign(Buffer.from(payload, 'utf8').toString('base64url'))
}

export function parseUserSession(cookieValue: string): UserSession | null {
  const payload = verify(cookieValue)
  if (!payload) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (decoded.userId && (decoded.role === 'STUDENT' || decoded.role === 'TEACHER')) {
      return {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email || null,
      }
    }
  } catch {
    return null
  }
  return null
}

export async function getUserSession(): Promise<UserSession | null> {
  const c = await cookies()
  const value = c.get(COOKIE_NAME)?.value
  if (!value) return null
  return parseUserSession(value)
}

export function getUserSessionCookieName() {
  return COOKIE_NAME
}

export function getUserSessionMaxAge() {
  return MAX_AGE
}
