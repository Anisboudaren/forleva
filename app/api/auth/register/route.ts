import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
import type { UserRole, AccountStatus } from '@/lib/schema-enums'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const fullName = (body.fullName as string)?.trim()
    const phone = (body.phone as string)?.trim().replace(/\s/g, '')
    const whatsapp = (body.whatsapp as string)?.trim().replace(/\s/g, '') || undefined
    const email = (body.email as string)?.trim() || undefined
    const password = body.password as string
    const roleInput = (body.role as string)?.toLowerCase()
    const role: UserRole = roleInput === 'teacher' ? 'TEACHER' : 'STUDENT'

    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: 'الاسم الكامل ورقم الهاتف وكلمة المرور مطلوبة' },
        { status: 400 }
      )
    }
    if (!/^0[567][0-9]{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صالح (مثال: 05XX XXX XX XX)' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: email ? [{ email }, { phone }] : [{ phone }],
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'البريد أو رقم الهاتف مسجل مسبقاً' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const status: AccountStatus = role === 'TEACHER' ? 'PENDING' : 'ACTIVE'
    await prisma.user.create({
      data: {
        fullName,
        phone,
        whatsapp: whatsapp || null,
        email: email || null,
        passwordHash,
        role,
        status,
        termsAcceptedAt: new Date(),
      },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/auth/register', e)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 })
  }
}
