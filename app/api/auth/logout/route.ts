import { NextResponse } from 'next/server'
import { getAdminSessionCookieName } from '@/lib/auth-session'
import { getUserSessionCookieName } from '@/lib/user-session'

export async function POST() {
  const res = NextResponse.json({ success: true })
  const clearCookie = (name: string) => {
    res.cookies.set(name, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }
  clearCookie(getAdminSessionCookieName())
  clearCookie(getUserSessionCookieName())
  return res
}
