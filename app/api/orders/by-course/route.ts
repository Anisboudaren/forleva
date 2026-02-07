import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

/**
 * GET /api/orders/by-course?courseId=...
 * Returns the current student's order status for a specific course, if any.
 */
export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session || session.role !== 'STUDENT') {
    // For anonymous users or non‑students we just say "no order"
    return NextResponse.json({ status: 'NONE' as const }, { status: 200 })
  }

  const url = new URL(req.url)
  const courseId = url.searchParams.get('courseId')?.trim()

  if (!courseId) {
    return NextResponse.json({ error: 'courseId مطلوب' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findFirst({
      where: { userId: session.userId, courseId },
      orderBy: { createdAt: 'desc' },
    })

    if (!order) {
      return NextResponse.json({ status: 'NONE' as const }, { status: 200 })
    }

    return NextResponse.json(
      {
        id: order.id,
        status: order.status,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('GET /api/orders/by-course', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

