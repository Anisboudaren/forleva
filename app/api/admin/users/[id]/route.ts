import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import type { UserRole } from '@/lib/schema-enums'

/** GET /api/admin/users/[id] — admin-only, safe contact fields for orders/client panel */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, phone: true, whatsapp: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }
    return NextResponse.json({
      id: user.id,
      fullName: user.fullName ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
      whatsapp: user.whatsapp ?? null,
    })
  } catch (e) {
    console.error('GET /api/admin/users/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
  }
  try {
    const body = await req.json()
    const fullName = (body.fullName as string)?.trim()
    const phone = (body.phone as string)?.trim().replace(/\s/g, '')
    const whatsapp = (body.whatsapp as string)?.trim().replace(/\s/g, '') || undefined
    const email = (body.email as string)?.trim() || undefined
    const roleInput = (body.role as string)?.toLowerCase()
    const role: UserRole = roleInput === 'teacher' ? 'TEACHER' : 'STUDENT'

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
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
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
    console.error('PATCH /api/admin/users/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 })
  }
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }
    if (user.id === session.userId) {
      return NextResponse.json(
        { error: 'لا يمكنك حذف حسابك الخاص' },
        { status: 400 }
      )
    }
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/users/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
