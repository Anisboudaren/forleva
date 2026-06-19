import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'
import { COD_DELIVERY_FEE_DA } from '@/lib/order-constants'
import { isValidAlgerianPhone, normalizeAlgerianPhone } from '@/lib/phone'
import type { PaymentMethod } from '@/lib/schema-enums'

const VALID_PAYMENT_METHODS: PaymentMethod[] = ['CHARGILY', 'CASH_ON_DELIVERY']

function parsePaymentMethod(value: unknown): PaymentMethod | null {
  const raw = (value as string)?.trim().toUpperCase()
  if (raw === 'CHARGILY' || raw === 'CASH_ON_DELIVERY') return raw
  return null
}

function computeOrderAmount(coursePrice: number, paymentMethod: PaymentMethod) {
  const deliveryFee = paymentMethod === 'CASH_ON_DELIVERY' ? COD_DELIVERY_FEE_DA : 0
  return { amount: coursePrice + deliveryFee, deliveryFee }
}

async function findExistingOrder(params: {
  courseId: string
  userId?: string
  guestPhone?: string
}) {
  if (params.userId) {
    return prisma.order.findFirst({
      where: {
        userId: params.userId,
        courseId: params.courseId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
  if (params.guestPhone) {
    return prisma.order.findFirst({
      where: {
        userId: null,
        guestPhone: params.guestPhone,
        courseId: params.courseId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
  return null
}

/**
 * POST /api/orders — create order (student or guest).
 * Student body: { courseId, paymentMethod }
 * Guest body: { courseId, paymentMethod, guestFullName, guestPhone }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const courseId = (body.courseId as string)?.trim()
    const paymentMethod = parsePaymentMethod(body.paymentMethod)

    if (!courseId) {
      return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 })
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'طريقة الدفع مطلوبة' }, { status: 400 })
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, status: 'PUBLISHED' },
    })
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة أو غير منشورة' }, { status: 404 })
    }

    const session = await getUserSession()
    const guestFullName = (body.guestFullName as string)?.trim()
    const guestPhoneRaw = (body.guestPhone as string)?.trim()
    const guestPhone = guestPhoneRaw ? normalizeAlgerianPhone(guestPhoneRaw) : ''

    if (!session) {
      if (!guestFullName || !guestPhone) {
        return NextResponse.json(
          { error: 'الاسم ورقم الهاتف مطلوبان للشراء بدون حساب' },
          { status: 400 }
        )
      }
      if (!isValidAlgerianPhone(guestPhone)) {
        return NextResponse.json(
          { error: 'رقم الهاتف غير صالح. استخدم رقماً جزائرياً يبدأ بـ 05 أو 06 أو 07' },
          { status: 400 }
        )
      }

      const existing = await findExistingOrder({ courseId: course.id, guestPhone })
      if (existing) {
        return NextResponse.json(
          {
            ...existing,
            checkoutToken: existing.checkoutToken ?? undefined,
          },
          { status: 200 }
        )
      }

      const { amount, deliveryFee } = computeOrderAmount(course.price, paymentMethod)
      const checkoutToken = randomUUID()

      const order = await prisma.order.create({
        data: {
          courseId: course.id,
          paymentMethod,
          amount,
          deliveryFee,
          guestFullName,
          guestPhone,
          checkoutToken,
        },
      })

      return NextResponse.json(
        {
          ...order,
          checkoutToken: order.checkoutToken ?? undefined,
        },
        { status: 201 }
      )
    }

    if (session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'الطلبات متاحة للطلاب فقط' }, { status: 403 })
    }

    const existing = await findExistingOrder({ courseId: course.id, userId: session.userId })
    if (existing) {
      return NextResponse.json(existing, { status: 200 })
    }

    const { amount, deliveryFee } = computeOrderAmount(course.price, paymentMethod)

    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        courseId: course.id,
        paymentMethod,
        amount,
        deliveryFee,
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
