import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import type { AccountStatus } from '@/lib/schema-enums'
import type { AuditActorRole } from '@prisma/client'
import { createAuditLog } from '@/lib/audit-log'
import { AUDIT_ACTIONS } from '@/lib/audit-actions'

const VALID_STATUSES: AccountStatus[] = ['ACTIVE', 'PENDING', 'SUSPENDED', 'BLOCKED']

export async function PATCH(
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
    const body = await _req.json()
    const status = (body.status as string)?.toUpperCase()
    if (!status || !VALID_STATUSES.includes(status as AccountStatus)) {
      return NextResponse.json(
        { error: 'حالة غير صالحة (ACTIVE, PENDING, SUSPENDED, BLOCKED)' },
        { status: 400 }
      )
    }
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true, role: true, fullName: true, email: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id },
      data: { status: status as AccountStatus },
    })

    void createAuditLog({
      actorId: session.userId,
      actorRole: session.role as AuditActorRole,
      action: AUDIT_ACTIONS.USER_STATUS_CHANGE,
      entityType: 'user',
      entityId: existing.id,
      meta: {
        userId: existing.id,
        previousStatus: existing.status,
        newStatus: status,
        userRole: existing.role,
        userName: existing.fullName,
        userEmail: existing.email,
      },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/admin/users/[id]/status', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
