import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserSession } from '@/lib/user-session'

const REVIEWS_LIMIT = 50

/**
 * GET: List reviews for a published course (public, no auth).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  if (!courseId) {
    return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 })
  }
  try {
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: 'PUBLISHED' },
      select: { id: true },
    })
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة أو غير منشورة' }, { status: 404 })
    }

    const reviews = await prisma.review.findMany({
      where: { courseId, deletionRequestedAt: null },
      orderBy: { createdAt: 'desc' },
      take: REVIEWS_LIMIT,
      include: {
        user: { select: { fullName: true } },
      },
    })

    return NextResponse.json(
      reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        userName: r.user.fullName ?? 'مستخدم',
      }))
    )
  } catch (e) {
    console.error('GET /api/courses/[id]/reviews', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

/**
 * POST: Create a review (auth required). One review per user per course.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json(
      { error: 'يجب تسجيل الدخول لترك تقييم' },
      { status: 401 }
    )
  }

  const { id: courseId } = await params
  if (!courseId) {
    return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 })
  }

  let body: { rating?: number; comment?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }

  const rating = typeof body.rating === 'number' ? body.rating : Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'التقييم يجب أن يكون بين 1 و 5' }, { status: 400 })
  }

  const comment =
    typeof body.comment === 'string' ? body.comment.trim() || null : null

  try {
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: 'PUBLISHED' },
      select: { id: true },
    })
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة أو غير منشورة' }, { status: 404 })
    }

    const existing = await prisma.review.findUnique({
      where: {
        courseId_userId: { courseId, userId: session.userId },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'لقد قمت بتقييم هذه الدورة مسبقاً' },
        { status: 409 }
      )
    }

    const review = await prisma.review.create({
      data: {
        courseId,
        userId: session.userId,
        rating,
        comment,
      },
      include: {
        user: { select: { fullName: true } },
      },
    })

    return NextResponse.json(
      {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        userName: review.user.fullName ?? 'مستخدم',
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('POST /api/courses/[id]/reviews', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
