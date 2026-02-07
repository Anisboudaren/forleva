import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Public API: get a single published course by ID (no auth).
 * Returns 404 if not found or not PUBLISHED.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 })
  }
  try {
    const course = await prisma.course.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: {
        teacher: { select: { id: true, fullName: true } },
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: { orderBy: { position: 'asc' } },
          },
        },
      },
    })
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة أو غير منشورة' }, { status: 404 })
    }
    const learningOutcomes = Array.isArray(course.learningOutcomes)
      ? (course.learningOutcomes as string[])
      : []

    return NextResponse.json({
      id: course.id,
      title: course.title,
      category: course.category,
      price: course.price,
      imageUrl: course.imageUrl,
      duration: course.duration,
      level: course.level,
      language: course.language,
      description: course.description,
      learningOutcomes,
      teacher: course.teacher
        ? { id: course.teacher.id, fullName: course.teacher.fullName ?? 'مدرّس' }
        : null,
      sections: course.sections.map((sec) => ({
        id: sec.id,
        title: sec.title,
        position: sec.position,
        items: sec.items.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          duration: item.duration ?? undefined,
          url: item.url ?? undefined,
          position: item.position,
          extraData: item.extraData ?? undefined,
        })),
      })),
    })
  } catch (e) {
    console.error('GET /api/courses/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
