import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminSession } from '@/lib/auth-session'
import { AUDIT_ACTIONS } from '@/lib/audit-actions'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const actorId = searchParams.get('actorId') ?? undefined
    const action = searchParams.get('action') ?? undefined
    const entityType = searchParams.get('entityType') ?? undefined
    const entityId = searchParams.get('entityId') ?? undefined
    const from = searchParams.get('from') ?? undefined
    const to = searchParams.get('to') ?? undefined
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const pageSizeRaw = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE
    const pageSize = Math.min(Math.max(1, pageSizeRaw), MAX_PAGE_SIZE)

    const where: any = {}
    if (actorId) where.actorId = actorId
    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: { id: true, fullName: true, email: true, phone: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ])

    const actionLabels = AUDIT_ACTIONS

    return NextResponse.json({
      items: items.map((log) => ({
        id: log.id,
        createdAt: log.createdAt.toISOString(),
        actor: {
          id: log.actor.id,
          name: log.actor.fullName,
          email: log.actor.email,
          phone: log.actor.phone,
          role: log.actor.role,
        },
        actorRole: log.actorRole,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId ?? undefined,
        meta: log.meta ?? undefined,
      })),
      total,
      page,
      pageSize,
      actionOptions: actionLabels,
    })
  } catch (e) {
    console.error('GET /api/admin/audit-logs', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

