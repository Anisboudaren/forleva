import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminSession } from '@/lib/auth-session'
import type { CourseStatus } from '@/lib/schema-enums'

const VALID_STATUSES: CourseStatus[] = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED']

/**
 * GET: List courses (admin/super_admin). Query: status, search.
 */
export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')?.toUpperCase()
    const statusFilter: CourseStatus | undefined =
      statusParam && VALID_STATUSES.includes(statusParam as CourseStatus)
        ? (statusParam as CourseStatus)
        : undefined
    const search = searchParams.get('search')?.trim() ?? ''

    const courses = await prisma.course.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { teacher: { fullName: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        teacher: { select: { id: true, fullName: true } },
        _count: { select: { sections: true } },
      },
    })

    const list = courses.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      price: c.price,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      teacher: c.teacher ? { id: c.teacher.id, fullName: c.teacher.fullName } : null,
      sectionCount: c._count.sections,
    }))

    return NextResponse.json(list)
  } catch (e) {
    console.error('GET /api/admin/courses', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
