import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
import {
  setAdminSessionCookie,
  getAdminSessionCookieName,
  getAdminSessionMaxAge,
} from '@/lib/auth-session'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const emailOrPhone = (body.emailOrPhone as string)?.trim()
    const password = body.password as string
    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو رقم الهاتف وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }
    await prisma.$connect()
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    })
    if (!user) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'الحساب غير مفعل أو موقوف. تواصل مع الإدارة.' },
        { status: 403 }
      )
    }
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالدخول إلى لوحة الإدارة' },
        { status: 403 }
      )
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }
    const sessionValue = setAdminSessionCookie({
      userId: user.id,
      role: user.role,
      email: user.email,
    })
    const res = NextResponse.json({
      success: true,
      role: user.role,
      redirect: (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? '/admin' : '/dashboard/teacher',
    })
    const name = getAdminSessionCookieName()
    res.cookies.set(name, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getAdminSessionMaxAge(),
      path: '/',
    })
    return res
  } catch (e) {
    console.error('Admin login error:', e)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}
