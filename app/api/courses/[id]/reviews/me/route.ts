import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserSession } from '@/lib/user-session'

/**
 * GET: Check if the current user has already reviewed this course (auth optional).
 * Returns { hasReviewed: true, review?: {...} } or { hasReviewed: false }.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ hasReviewed: false })
  }

  const { id: courseId } = await params
  if (!courseId) {
    return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 })
  }

  try {
    const review = await prisma.review.findUnique({
      where: {
        courseId_userId: { courseId, userId: session.userId },
      },
    })
    if (!review) {
      return NextResponse.json({ hasReviewed: false })
    }
    return NextResponse.json({
      hasReviewed: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      },
    })
  } catch (e) {
    console.error('GET /api/courses/[id]/reviews/me', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
