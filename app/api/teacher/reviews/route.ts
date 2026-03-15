import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserSession } from '@/lib/user-session'

/**
 * GET: List reviews for all courses taught by the current teacher.
 */
export async function GET() {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        course: { teacherId: session.userId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        course: { select: { id: true, title: true } },
        user: { select: { id: true, fullName: true } },
      },
    })

    const list = reviews.map((r) => ({
      id: r.id,
      courseId: r.course.id,
      courseName: r.course.title,
      studentName: r.user.fullName ?? 'مستخدم',
      studentId: r.user.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      deletionRequestedAt: r.deletionRequestedAt?.toISOString() ?? null,
      deletionRequestedBy: r.deletionRequestedBy ?? null,
    }))

    const visibleReviews = list.filter((r) => !r.deletionRequestedAt)
    const totalReviews = visibleReviews.length
    const avgRating =
      totalReviews > 0
        ? visibleReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0
    const fiveStarCount = visibleReviews.filter((r) => r.rating === 5).length
    const satisfactionPercent =
      totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0

    return NextResponse.json({
      reviews: list,
      stats: {
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        fiveStarCount,
        satisfactionPercent,
      },
    })
  } catch (e) {
    console.error('GET /api/teacher/reviews', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
