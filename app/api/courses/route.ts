import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Public API: list published courses (no auth).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q')?.trim() ?? ''
    const query = rawQuery.length > 0 ? rawQuery : null
    const parsedLimit = Number(searchParams.get('limit'))
    const take = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.floor(parsedLimit), 1), 50)
      : query
        ? 5
        : 100

    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                {
                  teacher: {
                    fullName: { contains: query, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take,
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        imageUrl: true,
        duration: true,
        level: true,
        language: true,
        teacher: { select: { fullName: true } },
      },
    })
    return NextResponse.json(
      courses.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        price: c.price,
        imageUrl: c.imageUrl,
        duration: c.duration,
        level: c.level,
        language: c.language,
        instructor: c.teacher?.fullName ?? 'مدرّس',
      }))
    )
  } catch (e) {
    console.error('GET /api/courses', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
