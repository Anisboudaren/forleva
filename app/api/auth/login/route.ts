import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
import {
  setUserSessionCookie,
  getUserSessionCookieName,
  getUserSessionMaxAge,
} from '@/lib/user-session'

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
    if (user.role !== 'STUDENT' && user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'استخدم لوحة الإدارة لتسجيل الدخول كمسؤول' },
        { status: 403 }
      )
    }
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'الحساب غير مفعل أو موقوف. تواصل مع الإدارة.' },
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

    const sessionValue = setUserSessionCookie({
      userId: user.id,
      role: user.role,
      email: user.email,
    })
    const redirectPath = user.role === 'TEACHER' ? '/dashboard/teacher' : '/dashboard/student'
    const res = NextResponse.json({
      success: true,
      redirect: redirectPath,
    })
    const name = getUserSessionCookieName()
    res.cookies.set(name, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getUserSessionMaxAge(),
      path: '/',
    })
    return res
  } catch (e) {
    console.error('POST /api/auth/login', e)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}
