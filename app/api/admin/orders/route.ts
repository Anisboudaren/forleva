import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-session'
import { prisma } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED'] as const

/**
 * GET /api/admin/orders — admin-only.
 * Query: ?status=pending|confirmed|cancelled&search=
 */
export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')?.toUpperCase()
    const search = searchParams.get('search')?.trim() || ''

    const statusFilter =
      statusParam && VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])
        ? (statusParam as OrderStatus)
        : undefined

    const where: Parameters<typeof prisma.order.findMany>[0]['where'] = {}
    if (statusFilter) where.status = statusFilter
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: { user: true, course: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (e) {
    console.error('GET /api/admin/orders', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
