import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSafeCourseImageUrl } from '@/lib/safe-course-image'

/**
 * Public: active categories with published course counts and images.
 */
export async function GET() {
  try {
    const categories = await prisma.courseCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            courses: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    })

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl ? getSafeCourseImageUrl(c.imageUrl) : null,
        courseCount: c._count.courses,
        sortOrder: c.sortOrder,
      }))
    )
  } catch (e) {
    console.error('GET /api/categories', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
