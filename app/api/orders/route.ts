import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'

/**
 * POST /api/orders — create order (student only).
 * Body: { courseId: string }
 */
export async function POST(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }
  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'الطلبات متاحة للطلاب فقط' }, { status: 403 })
  }
  try {
    const body = await req.json()
    const courseId = (body.courseId as string)?.trim()
    if (!courseId) {
      return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 })
    }
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: 'PUBLISHED' },
    })
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة أو غير منشورة' }, { status: 404 })
    }
    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        courseId: course.id,
        amount: course.price,
      },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (e) {
    console.error('POST /api/orders', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

/**
 * GET /api/orders — list current student's orders.
 */
export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }
  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'الطلبات متاحة للطلاب فقط' }, { status: 403 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders, { status: 200 })
  } catch (e) {
    console.error('GET /api/orders', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
