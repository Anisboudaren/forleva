import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'
import { CourseStatus, type ContentType as PrismaContentType } from '@prisma/client'

const CONTENT_TYPE_MAP: Record<string, PrismaContentType> = {
  video: 'VIDEO',
  quiz: 'QUIZ',
  external: 'EXTERNAL',
  pdf: 'PDF',
  survey: 'SURVEY',
  title: 'TITLE',
  certificate: 'CERTIFICATE',
  exercise: 'EXERCISE',
  audio: 'AUDIO',
  checklist: 'CHECKLIST',
  document: 'DOCUMENT',
  image: 'IMAGE',
}

const CONTENT_TYPE_FROM_DB: Record<string, string> = {
  VIDEO: 'video',
  QUIZ: 'quiz',
  EXTERNAL: 'external',
  PDF: 'pdf',
  SURVEY: 'survey',
  TITLE: 'title',
  CERTIFICATE: 'certificate',
  EXERCISE: 'exercise',
  AUDIO: 'audio',
  CHECKLIST: 'checklist',
  DOCUMENT: 'document',
  IMAGE: 'image',
}

type ApiSection = { title: string; items: ApiSectionItem[] }
type ApiSectionItem = {
  type: string
  title: string
  duration?: string
  url?: string
  question?: string
  options?: string[]
  correctOptionIndices?: number[]
  description?: string
  fileUrl?: string
}

function toExtraData(item: ApiSectionItem): Record<string, unknown> | null {
  const keys = ['question', 'options', 'correctOptionIndices', 'description', 'fileUrl'] as const
  const obj: Record<string, unknown> = {}
  let hasAny = false
  for (const k of keys) {
    const v = item[k]
    if (v !== undefined && v !== '') {
      if (Array.isArray(v) && v.length === 0) continue
      obj[k] = v
      hasAny = true
    }
  }
  return hasAny ? obj : null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  const { id } = await params
  try {
    const course = await prisma.course.findFirst({
      where: { id, teacherId: session.userId },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: { orderBy: { position: 'asc' } },
          },
        },
      },
    })
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 })
    }
    const mapped = {
      ...course,
      learningOutcomes: course.learningOutcomes as string[],
      sections: course.sections.map((sec) => ({
        id: sec.id,
        title: sec.title,
        position: sec.position,
        items: sec.items.map((item) => {
          const extra = (item.extraData ?? {}) as Record<string, unknown>
          return {
            id: item.id,
            type: CONTENT_TYPE_FROM_DB[item.type] ?? item.type.toLowerCase(),
            title: item.title,
            duration: item.duration ?? undefined,
            url: item.url ?? undefined,
            position: item.position,
            ...extra,
          }
        }),
      })),
    }
    return NextResponse.json(mapped)
  } catch (e) {
    console.error('GET /api/teacher/courses/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  const { id } = await params
  try {
    const existing = await prisma.course.findFirst({
      where: { id, teacherId: session.userId },
      include: { sections: { include: { items: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 })
    }

    const body = await request.json() as {
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
      title?: string
      category?: string
      price?: string | number
      imageUrl?: string
      duration?: string
      level?: string
      language?: string
      description?: string
      learningOutcomes?: string[]
      sections?: ApiSection[]
    }

    const statusOnly =
      body.status !== undefined &&
      Object.keys(body).every((k) => k === 'status')
    if (statusOnly) {
      const statusEnum: CourseStatus =
        body.status === 'PUBLISHED' || body.status === 'ARCHIVED' ? body.status : 'DRAFT'
      const updated = await prisma.course.update({
        where: { id },
        data: { status: statusEnum },
        include: {
          sections: { orderBy: { position: 'asc' }, include: { items: { orderBy: { position: 'asc' } } } },
        },
      })
      return NextResponse.json(updated)
    }

    const hasFullPayload =
      body.title !== undefined ||
      body.sections !== undefined ||
      body.learningOutcomes !== undefined
    if (!hasFullPayload) {
      const updated = await prisma.course.update({
        where: { id },
        data: {
          ...(body.title !== undefined && { title: String(body.title).trim() }),
          ...(body.category !== undefined && { category: String(body.category).trim() }),
          ...(body.price !== undefined && {
            price: typeof body.price === 'number' ? body.price : parseInt(String(body.price), 10) || 0,
          }),
          ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null }),
          ...(body.duration !== undefined && { duration: body.duration ? String(body.duration).trim() : null }),
          ...(body.level !== undefined && { level: body.level ? String(body.level).trim() : null }),
          ...(body.language !== undefined && { language: body.language ? String(body.language).trim() : null }),
          ...(body.description !== undefined && { description: body.description ? String(body.description).trim() : null }),
          ...(Array.isArray(body.learningOutcomes) && { learningOutcomes: body.learningOutcomes }),
        },
        include: {
          sections: { orderBy: { position: 'asc' }, include: { items: { orderBy: { position: 'asc' } } } },
        },
      })
      return NextResponse.json(updated)
    }

    const sections = Array.isArray(body.sections) ? (body.sections as ApiSection[]) : undefined
    if (sections) {
      await prisma.courseSectionItem.deleteMany({
        where: { section: { courseId: id } },
      })
      await prisma.courseSection.deleteMany({ where: { courseId: id } })
    }

    const learningOutcomes = Array.isArray(body.learningOutcomes)
      ? body.learningOutcomes.filter((o): o is string => typeof o === 'string')
      : (existing.learningOutcomes as string[])

    const statusUpdate: CourseStatus | undefined =
      body.status === 'PUBLISHED' || body.status === 'ARCHIVED'
        ? body.status
        : body.status !== undefined
          ? 'DRAFT'
          : undefined

    const priceNum =
      body.price !== undefined
        ? typeof body.price === 'number'
          ? body.price
          : parseInt(String(body.price), 10) || 0
        : existing.price

    await prisma.course.update({
      where: { id },
      data: {
        ...(statusUpdate !== undefined && { status: statusUpdate }),
        title: body.title !== undefined ? String(body.title).trim() : existing.title,
        category: body.category !== undefined ? String(body.category).trim() : existing.category,
        price: priceNum,
        imageUrl: body.imageUrl !== undefined ? (body.imageUrl ? String(body.imageUrl).trim() : null) : existing.imageUrl,
        duration: body.duration !== undefined ? (body.duration ? String(body.duration).trim() : null) : existing.duration,
        level: body.level !== undefined ? (body.level ? String(body.level).trim() : null) : existing.level,
        language: body.language !== undefined ? (body.language ? String(body.language).trim() : null) : existing.language,
        description: body.description !== undefined ? (body.description ? String(body.description).trim() : null) : existing.description,
        learningOutcomes,
        ...(sections
          ? {
              sections: {
                create: sections.map((sec, pos) => ({
                  title: (sec.title && String(sec.title).trim()) || 'قسم',
                  position: pos,
                  items: {
                    create: (sec.items || []).map((item, itemPos) => {
                      const type = CONTENT_TYPE_MAP[String(item.type).toLowerCase()] ?? 'VIDEO'
                      const extra = toExtraData(item as ApiSectionItem)
                      return {
                        type,
                        title: (item.title && String(item.title).trim()) || 'عنصر',
                        duration: item.duration && String(item.duration).trim() ? String(item.duration).trim() : null,
                        url: item.url && String(item.url).trim() ? String(item.url).trim() : null,
                        position: itemPos,
                        extraData: extra,
                      }
                    }),
                  },
                })),
              },
            }
          : {}),
      },
    })

    const updated = await prisma.course.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { position: 'asc' }, include: { items: { orderBy: { position: 'asc' } } } },
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('PATCH /api/teacher/courses/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  const { id } = await params
  try {
    const course = await prisma.course.findFirst({
      where: { id, teacherId: session.userId },
    })
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 })
    }
    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/teacher/courses/[id]', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
