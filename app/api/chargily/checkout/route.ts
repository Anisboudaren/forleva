import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'

const CHARGILY_API_BASE =
  process.env.CHARGILY_API_URL ??
  (process.env.CHARGILY_MODE === 'live'
    ? 'https://pay.chargily.net/api/v2'
    : 'https://pay.chargily.net/test/api/v2')

function getBaseUrl(req: Request): string {
  const url = req.headers.get('x-url') ?? req.url
  try {
    const origin = new URL(url).origin
    if (origin && (origin.startsWith('http://') || origin.startsWith('https://'))) return origin
  } catch {
    // ignore
  }
  const appUrl = process.env.APP_URL
  if (appUrl) return appUrl.replace(/\/$/, '')
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`
  return 'http://localhost:3000'
}

/**
 * POST /api/chargily/checkout — create Chargily checkout for an existing order (student only).
 * Body: { orderId: string }
 * Returns: { checkoutUrl: string }
 */
export async function POST(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }
  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'الطلبات متاحة للطلاب فقط' }, { status: 403 })
  }

  const apiKey = process.env.CHARGILY_PRIVATE_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'إعدادات الدفع غير مكتملة' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const orderId = (body.orderId as string)?.trim()
    if (!orderId) {
      return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.userId,
        status: 'PENDING',
      },
      include: { course: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود أو غير مؤهل للدفع' }, { status: 404 })
    }

    const baseUrl = getBaseUrl(req)
    const payload = {
      amount: order.amount,
      currency: 'dzd',
      success_url: `${baseUrl}/payment/success?order_id=${encodeURIComponent(order.id)}`,
      failure_url: `${baseUrl}/payment/failure?order_id=${encodeURIComponent(order.id)}`,
      metadata: { order_id: order.id },
      locale: 'ar' as const,
    }

    const res = await fetch(`${CHARGILY_API_BASE.replace(/\/$/, '')}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const checkout = (await res.json().catch(() => ({}))) as { id?: string; checkout_url?: string }
    if (!res.ok) {
      console.error('Chargily checkout API error', res.status, checkout)
      return NextResponse.json(
        { error: (checkout as { message?: string }).message ?? 'حدث خطأ أثناء إنشاء صفحة الدفع' },
        { status: 502 }
      )
    }

    const checkoutId = checkout.id
    if (checkoutId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { chargilyCheckoutId: checkoutId },
      })
    }

    const checkoutUrl = checkout.checkout_url
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'لم يتم إنشاء رابط الدفع' }, { status: 500 })
    }

    return NextResponse.json({ checkoutUrl })
  } catch (e) {
    console.error('POST /api/chargily/checkout', e)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء صفحة الدفع' }, { status: 500 })
  }
}
