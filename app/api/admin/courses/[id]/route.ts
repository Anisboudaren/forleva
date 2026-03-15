import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminSession } from '@/lib/auth-session'

type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED'

/**
 * PATCH: Approve, reject, or suspend a course (admin/super_admin).
 * Body: { action: 'approve' | 'reject' | 'suspend' }
 * - approve: PENDING_REVIEW -> PUBLISHED (course goes live)
 * - reject: PENDING_REVIEW -> DRAFT
 * - suspend: PUBLISHED -> PENDING_REVIEW (course hidden from clients until approved again)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 })
  }

  try {
    const body = await request.json() as { action?: 'approve' | 'reject' | 'suspend' }
    const action = body.action

    if (action !== 'approve' && action !== 'reject' && action !== 'suspend') {
      return NextResponse.json({ error: 'إجراء غير صالح. استخدم approve أو reject أو suspend' }, { status: 400 })
    }

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 })
    }

    let newStatus: CourseStatus

    if (action === 'suspend') {
      if (course.status !== 'PUBLISHED') {
        return NextResponse.json(
          { error: 'يمكن تعليق الدورات المنشورة فقط' },
          { status: 400 }
        )
      }
      newStatus = 'PENDING_REVIEW'
    } else if (action === 'approve' || action === 'reject') {
      if (course.status !== 'PENDING_REVIEW') {
        return NextResponse.json(
          { error: 'يمكن فقط الموافقة أو الرفض للدورات قيد المراجعة' },
          { status: 400 }
        )
      }
      newStatus = action === 'approve' ? 'PUBLISHED' : 'DRAFT'
    } else {
      return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { status: newStatus },
      include: {
        teacher: { select: { id: true, fullName: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error('PATCH /api/admin/courses/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
