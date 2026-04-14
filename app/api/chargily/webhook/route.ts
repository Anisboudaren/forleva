import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/db'

function verifyChargilySignature(payload: string, signature: string, secret: string): boolean {
  const computed = createHmac('sha256', secret).update(payload, 'utf8').digest('hex')
  if (computed.length !== signature.length) return false
  try {
    return timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(signature, 'utf8'))
  } catch {
    return false
  }
}

/**
 * POST /api/chargily/webhook — Chargily Pay webhook (signature verification, then update order).
 * Do not use req.json() before reading raw body; use req.text() for verification.
 */
export async function POST(req: Request) {
  const apiKey = process.env.CHARGILY_PRIVATE_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const signature = req.headers.get('signature') ?? ''
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!verifyChargilySignature(rawBody, signature, apiKey)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  let event: { type?: string; data?: { metadata?: { order_id?: string }; id?: string } }
  try {
    event = JSON.parse(rawBody) as typeof event
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = event?.type
  const data = event?.data

  if (eventType === 'checkout.paid' && data) {
    const orderId = data.metadata?.order_id
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Missing order_id in metadata' }, { status: 400 })
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      })
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      if (order.status === 'CONFIRMED') {
        return new NextResponse(null, { status: 200 })
      }
      // Activate the course for the student: set order to CONFIRMED so they get access
      // (learning page and "my courses" use Order.status === 'CONFIRMED' to grant access)
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        })
      } catch (e: unknown) {
        // If another CONFIRMED order already exists for this user/course, treat as idempotent.
        if (
          typeof e === 'object' &&
          e &&
          'code' in e &&
          typeof (e as { code?: unknown }).code === 'string' &&
          (e as { code: string }).code === 'P2002'
        ) {
          return new NextResponse(null, { status: 200 })
        }
        throw e
      }
    } catch (e) {
      console.error('Chargily webhook: failed to update order', orderId, e)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
  }
  // Acknowledge other event types (checkout.failed, checkout.canceled, etc.) with 200
  return new NextResponse(null, { status: 200 })
}
