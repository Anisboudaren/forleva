import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminSession } from '@/lib/auth-session'
import { slugifyCategoryName } from '@/lib/course-categories'
import { getSafeCourseImageUrl } from '@/lib/safe-course-image'

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return null
  }
  return session
}

/**
 * PATCH: Update category fields. Prefer isActive=false over hard delete.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف الفئة مطلوب' }, { status: 400 })
  }

  try {
    const existing = await prisma.courseCategory.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 })
    }

    const body = (await request.json()) as {
      name?: string
      description?: string | null
      imageUrl?: string | null
      imageKey?: string | null
      isActive?: boolean
      sortOrder?: number
    }

    const data: {
      name?: string
      slug?: string
      description?: string | null
      imageUrl?: string | null
      imageKey?: string | null
      isActive?: boolean
      sortOrder?: number
    } = {}

    if (body.name !== undefined) {
      const name = String(body.name).trim()
      if (!name) {
        return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 })
      }
      const clash = await prisma.courseCategory.findFirst({
        where: {
          id: { not: id },
          OR: [{ name }, { slug: slugifyCategoryName(name) }],
        },
      })
      if (clash) {
        return NextResponse.json({ error: 'اسم الفئة مستخدم مسبقاً' }, { status: 409 })
      }
      data.name = name
      data.slug = slugifyCategoryName(name)
    }

    if (body.description !== undefined) {
      data.description =
        body.description && String(body.description).trim()
          ? String(body.description).trim()
          : null
    }
    if (body.imageUrl !== undefined) {
      data.imageUrl =
        body.imageUrl && String(body.imageUrl).trim() ? String(body.imageUrl).trim() : null
    }
    if (body.imageKey !== undefined) {
      data.imageKey =
        body.imageKey && String(body.imageKey).trim() ? String(body.imageKey).trim() : null
    }
    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive)
    }
    if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
      data.sortOrder = Math.floor(Number(body.sortOrder))
    }

    const updated = await prisma.courseCategory.update({
      where: { id },
      data,
      include: { _count: { select: { courses: true } } },
    })

    // Keep legacy Course.category string in sync when renaming.
    if (data.name && data.name !== existing.name) {
      await prisma.course.updateMany({
        where: { categoryId: id },
        data: { category: data.name },
      })
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      imageUrl: updated.imageUrl ? getSafeCourseImageUrl(updated.imageUrl) : null,
      imageKey: updated.imageKey,
      isActive: updated.isActive,
      sortOrder: updated.sortOrder,
      courseCount: updated._count.courses,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (e) {
    console.error('PATCH /api/admin/categories/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

/**
 * DELETE: Soft-deactivate if courses are linked; hard-delete only when unused.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'معرف الفئة مطلوب' }, { status: 400 })
  }

  try {
    const existing = await prisma.courseCategory.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 })
    }

    if (existing._count.courses > 0) {
      const updated = await prisma.courseCategory.update({
        where: { id },
        data: { isActive: false },
        include: { _count: { select: { courses: true } } },
      })
      return NextResponse.json({
        ok: true,
        softDeleted: true,
        id: updated.id,
        isActive: updated.isActive,
        courseCount: updated._count.courses,
        message: 'تم تعطيل الفئة لأنها مستخدمة في دورات',
      })
    }

    await prisma.courseCategory.delete({ where: { id } })
    return NextResponse.json({ ok: true, softDeleted: false, id })
  } catch (e) {
    console.error('DELETE /api/admin/categories/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
