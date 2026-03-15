import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserSession } from '@/lib/user-session'

/**
 * POST: Request deletion of a review (teacher only, for their course).
 * Sets deletionRequestedAt and deletionRequestedBy; review goes to admin for approval.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id: reviewId } = await params
  if (!reviewId) {
    return NextResponse.json({ error: 'معرف التقييم مطلوب' }, { status: 400 })
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { course: { select: { teacherId: true } } },
    })
    if (!review) {
      return NextResponse.json({ error: 'التقييم غير موجود' }, { status: 404 })
    }
    if (review.course.teacherId !== session.userId) {
      return NextResponse.json({ error: 'غير مصرح بحذف تقييم هذه الدورة' }, { status: 403 })
    }

    if (review.deletionRequestedAt) {
      return NextResponse.json({ message: 'طلب الحذف مسبقاً قيد المراجعة' }, { status: 200 })
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        deletionRequestedAt: new Date(),
        deletionRequestedBy: session.userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/teacher/reviews/[id]/request-deletion', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
