import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminSession } from '@/lib/auth-session'
import type { AuditActorRole } from '@prisma/client'
import { createAuditLog } from '@/lib/audit-log'
import { AUDIT_ACTIONS } from '@/lib/audit-actions'

/**
 * POST: Admin approves or rejects a deletion request.
 * Body: { action: 'approve' | 'reject' }
 * - approve: delete the review
 * - reject: clear deletionRequestedAt and deletionRequestedBy so the review is visible again
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id: reviewId } = await params
  if (!reviewId) {
    return NextResponse.json({ error: 'معرف التقييم مطلوب' }, { status: 400 })
  }

  let body: { action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }

  const action = body.action === 'approve' ? 'approve' : body.action === 'reject' ? 'reject' : null
  if (!action) {
    return NextResponse.json({ error: 'يجب تحديد action: approve أو reject' }, { status: 400 })
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        course: { select: { id: true, title: true } },
      },
    })
    if (!review) {
      return NextResponse.json({ error: 'التقييم غير موجود' }, { status: 404 })
    }

    if (action === 'approve') {
      await prisma.review.delete({ where: { id: reviewId } })

      void createAuditLog({
        actorId: session.userId,
        actorRole: session.role as AuditActorRole,
        action: AUDIT_ACTIONS.REVIEW_DELETION_APPROVE,
        entityType: 'review',
        entityId: reviewId,
        meta: {
          reviewId,
          courseId: review.course.id,
          courseTitle: review.course.title,
        },
      })
      return NextResponse.json({ success: true, deleted: true })
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        deletionRequestedAt: null,
        deletionRequestedBy: null,
      },
    })

    void createAuditLog({
      actorId: session.userId,
      actorRole: session.role as AuditActorRole,
      action: AUDIT_ACTIONS.REVIEW_DELETION_REJECT,
      entityType: 'review',
      entityId: reviewId,
      meta: {
        reviewId,
        courseId: review.course.id,
        courseTitle: review.course.title,
      },
    })
    return NextResponse.json({ success: true, deleted: false })
  } catch (e) {
    console.error('POST /api/admin/reviews/[id]/deletion-decision', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
