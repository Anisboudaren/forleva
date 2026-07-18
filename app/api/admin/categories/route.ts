import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminSession } from '@/lib/auth-session'
import { slugifyCategoryName } from '@/lib/course-categories'
import { getSafeCourseImageUrl } from '@/lib/safe-course-image'

function requireAdmin() {
  return getAdminSession().then((session) => {
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return null
    }
    return session
  })
}

/**
 * GET: List all categories for admin (including inactive).
 */
export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const categories = await prisma.courseCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { courses: true } },
      },
    })

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl ? getSafeCourseImageUrl(c.imageUrl) : null,
        imageKey: c.imageKey,
        isActive: c.isActive,
        sortOrder: c.sortOrder,
        courseCount: c._count.courses,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))
    )
  } catch (e) {
    console.error('GET /api/admin/categories', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

/**
 * POST: Create a category.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      name?: string
      description?: string
      imageUrl?: string | null
      imageKey?: string | null
      isActive?: boolean
      sortOrder?: number
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 })
    }

    const existing = await prisma.courseCategory.findFirst({
      where: {
        OR: [{ name }, { slug: slugifyCategoryName(name) }],
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'اسم الفئة مستخدم مسبقاً' }, { status: 409 })
    }

    const maxSort = await prisma.courseCategory.aggregate({ _max: { sortOrder: true } })
    const sortOrder =
      typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
        ? Math.floor(body.sortOrder)
        : (maxSort._max.sortOrder ?? -1) + 1

    const created = await prisma.courseCategory.create({
      data: {
        name,
        slug: slugifyCategoryName(name),
        description:
          typeof body.description === 'string' && body.description.trim()
            ? body.description.trim()
            : null,
        imageUrl:
          typeof body.imageUrl === 'string' && body.imageUrl.trim()
            ? body.imageUrl.trim()
            : null,
        imageKey:
          typeof body.imageKey === 'string' && body.imageKey.trim()
            ? body.imageKey.trim()
            : null,
        isActive: body.isActive !== false,
        sortOrder,
      },
      include: { _count: { select: { courses: true } } },
    })

    return NextResponse.json(
      {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description,
        imageUrl: created.imageUrl ? getSafeCourseImageUrl(created.imageUrl) : null,
        imageKey: created.imageKey,
        isActive: created.isActive,
        sortOrder: created.sortOrder,
        courseCount: created._count.courses,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('POST /api/admin/categories', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
