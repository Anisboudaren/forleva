import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { isValidAlgerianPhone, normalizeAlgerianPhone } from '@/lib/phone'
import type { AuditActorRole } from '@prisma/client'
import { createAuditLog } from '@/lib/audit-log'
import { AUDIT_ACTIONS } from '@/lib/audit-actions'

/**
 * POST /api/admin/orders/[id]/create-student — create student account and link guest order.
 * Body: { fullName, phone, password, email?, whatsapp? }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const fullName = (body.fullName as string)?.trim()
    const phone = normalizeAlgerianPhone((body.phone as string) ?? '')
    const whatsappRaw = (body.whatsapp as string)?.trim()
    const whatsapp = whatsappRaw ? normalizeAlgerianPhone(whatsappRaw) : phone
    const email = (body.email as string)?.trim() || undefined
    const password = body.password as string

    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: 'الاسم الكامل ورقم الهاتف وكلمة المرور مطلوبة' },
        { status: 400 }
      )
    }
    if (!isValidAlgerianPhone(phone)) {
      return NextResponse.json(
        { error: 'رقم الهاتف غير صالح (مثال: 05XX XXX XX XX)' },
        { status: 400 }
      )
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { course: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }
    if (order.userId) {
      return NextResponse.json({ error: 'هذا الطلب مربوط بحساب بالفعل' }, { status: 409 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: email ? [{ email }, { phone }] : [{ phone }],
      },
      select: { id: true, fullName: true },
    })
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'رقم الهاتف أو البريد مسجل مسبقاً. يمكنك ربط الطلب بالحساب الموجود من لوحة المستخدمين.',
          existingUserId: existingUser.id,
        },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName,
          phone,
          whatsapp: whatsapp || null,
          email: email || null,
          passwordHash,
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      })

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { userId: user.id },
        include: { user: true, course: true },
      })

      return { user, order: updatedOrder }
    })

    void createAuditLog({
      actorId: session.userId,
      actorRole: session.role as AuditActorRole,
      action: AUDIT_ACTIONS.ORDER_UPDATE_NOTES,
      entityType: 'order',
      entityId: result.order.id,
      meta: {
        orderId: result.order.id,
        linkedUserId: result.user.id,
        courseId: result.order.courseId,
        action: 'link_guest_order_to_new_student',
      },
    })

    return NextResponse.json({
      success: true,
      order: result.order,
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        phone: result.user.phone,
        email: result.user.email,
      },
    })
  } catch (e) {
    console.error('POST /api/admin/orders/[id]/create-student', e)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب وربط الطلب' }, { status: 500 })
  }
}
