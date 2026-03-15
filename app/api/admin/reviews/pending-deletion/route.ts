import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminSession } from '@/lib/auth-session'

/**
 * GET: List reviews that are pending deletion (deletionRequestedAt != null).
 */
export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { deletionRequestedAt: { not: null } },
      orderBy: { deletionRequestedAt: 'desc' },
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
      teacherId: r.course.teacher?.id,
      teacherName: r.course.teacher?.fullName ?? '—',
      userId: r.user.id,
      userName: r.user.fullName ?? 'مستخدم',
      userEmail: r.user.email ?? undefined,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      deletionRequestedAt: r.deletionRequestedAt!.toISOString(),
      deletionRequestedBy: r.deletionRequestedBy ?? undefined,
    }))

    return NextResponse.json({ reviews: list })
  } catch (e) {
    console.error('GET /api/admin/reviews/pending-deletion', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
