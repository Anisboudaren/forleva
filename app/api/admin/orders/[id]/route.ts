import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED'] as const

/**
 * PATCH /api/admin/orders/[id] — admin-only.
 * Body: { status?: OrderStatus, adminNotes?: string }
 */
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
    return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 })
  }
  try {
    const body = await req.json()
    const statusInput = (body.status as string)?.toUpperCase()
    const adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes.trim() || null : undefined

    const updateData: { status?: OrderStatus; adminNotes?: string | null } = {}
    if (statusInput && VALID_STATUSES.includes(statusInput as (typeof VALID_STATUSES)[number])) {
      updateData.status = statusInput as OrderStatus
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'لا يوجد تحديث صالح' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { user: true, course: true },
    })
    return NextResponse.json(order)
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }
    console.error('PATCH /api/admin/orders/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
