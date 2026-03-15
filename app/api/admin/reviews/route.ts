import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminSession } from '@/lib/auth-session'

/**
 * GET: List all reviews (admin). Optional query: courseId, rating, limit.
 */
export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId') ?? undefined
    const ratingParam = searchParams.get('rating')
    const ratingFilter =
      ratingParam && [1, 2, 3, 4, 5].includes(Number(ratingParam))
        ? Number(ratingParam)
        : undefined
    const limit = Math.min(
      Math.max(1, Number(searchParams.get('limit')) || 100),
      500
    )

    const reviews = await prisma.review.findMany({
      where: {
        deletionRequestedAt: null,
        ...(courseId ? { courseId } : {}),
        ...(ratingFilter ? { rating: ratingFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            teacher: { select: { id: true, fullName: true } },
          },
        },
        user: { select: { id: true, fullName: true, email: true } },
      },
    })

    const list = reviews.map((r) => ({
      id: r.id,
      courseId: r.course.id,
      courseName: r.course.title,
      teacherName: r.course.teacher?.fullName ?? '—',
      teacherId: r.course.teacher?.id,
      userId: r.user.id,
      userName: r.user.fullName ?? 'مستخدم',
      userEmail: r.user.email ?? undefined,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }))

    return NextResponse.json({ reviews: list })
  } catch (e) {
    console.error('GET /api/admin/reviews', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
