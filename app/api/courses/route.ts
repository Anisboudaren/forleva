import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Public API: list published courses (no auth).
 */
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
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
