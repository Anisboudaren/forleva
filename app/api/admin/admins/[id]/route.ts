import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف المسؤول مطلوب' }, { status: 400 })
  }
  try {
    const body = await req.json()
    const fullName = (body.fullName as string)?.trim()
    const phone = (body.phone as string)?.trim().replace(/\s/g, '')
    const whatsapp = (body.whatsapp as string)?.trim().replace(/\s/g, '') || undefined
    const email = (body.email as string)?.trim() || undefined
    const roleInput = (body.role as string)?.toLowerCase()
    const role = roleInput === 'super_admin' ? UserRole.SUPER_ADMIN : UserRole.ADMIN

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: 'الاسم الكامل ورقم الهاتف مطلوبان' },
        { status: 400 }
      )
    }
    if (!/^0[567][0-9]{8}$/.test(phone)) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صالح (مثال: 05XX XXX XX XX)' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'المسؤول غير موجود' }, { status: 404 })
    }
    if (existing.role !== UserRole.ADMIN && existing.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'المستخدم ليس مسؤولاً' }, { status: 400 })
    }
    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: id },
        OR: email ? [{ email }, { phone }] : [{ phone }],
      },
    })
    if (duplicate) {
      return NextResponse.json(
        { error: 'البريد أو رقم الهاتف مسجل لمستخدم آخر' },
        { status: 409 }
      )
    }

    await prisma.user.update({
      where: { id },
      data: {
        fullName,
        phone,
        whatsapp: whatsapp || null,
        email: email || null,
        role,
      },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/admin/admins/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
