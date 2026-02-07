import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'
import type { CourseStatus, ContentType } from '@/lib/schema-enums'

const CONTENT_TYPE_MAP: Record<string, ContentType> = {
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

export async function GET(request: NextRequest) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const statusFilter =
      statusParam === 'draft' || statusParam === 'published' || statusParam === 'archived'
        ? (statusParam.toUpperCase() as CourseStatus)
        : undefined

    const courses = await prisma.course.findMany({
      where: {
        teacherId: session.userId,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { sections: true } },
        sections: {
          select: { _count: { select: { items: true } } },
        },
      },
    })

    const list = courses.map((c) => {
      const sectionCount = c._count.sections
      const itemCount = c.sections.reduce((sum, s) => sum + s._count.items, 0)
      return {
        id: c.id,
        title: c.title,
        category: c.category,
        price: c.price,
        imageUrl: c.imageUrl,
        duration: c.duration,
        level: c.level,
        language: c.language,
        description: c.description,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        sectionCount,
        itemCount,
      }
    })
    return NextResponse.json(list)
  } catch (e) {
    console.error('GET /api/teacher/courses', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const {
      title,
      category,
      price,
      imageUrl,
      duration,
      level,
      language,
      description,
      learningOutcomes,
      sections = [],
      status = 'DRAFT',
    } = body as {
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
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'عنوان الدورة مطلوب' }, { status: 400 })
    }

    const priceNum = typeof price === 'number' ? price : parseInt(String(price ?? 0), 10)
    const outcomes = Array.isArray(learningOutcomes)
      ? learningOutcomes.filter((o): o is string => typeof o === 'string')
      : []
    const statusEnum: CourseStatus =
      (status === 'PUBLISHED' || status === 'ARCHIVED' ? status : 'DRAFT') as CourseStatus

    const createData = {
      teacherId: session.userId,
      status: statusEnum,
      title: title.trim(),
      category: (category && String(category).trim()) || 'أخرى',
      price: isNaN(priceNum) ? 0 : priceNum,
      imageUrl: imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : null,
      duration: duration && String(duration).trim() ? String(duration).trim() : null,
      level: level && String(level).trim() ? String(level).trim() : null,
      language: language && String(language).trim() ? String(language).trim() : null,
      description: description && String(description).trim() ? String(description).trim() : null,
      learningOutcomes: outcomes,
      sections: {
        create: (sections as ApiSection[]).map((sec, pos) => ({
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
                extraData: extra ?? undefined,
              }
            }),
          },
        })),
      },
    }
    const course = await prisma.course.create({
      data: createData as Parameters<typeof prisma.course.create>[0]['data'],
      include: {
        sections: { include: { items: true } },
      },
    })

    return NextResponse.json(course)
  } catch (e) {
    console.error('POST /api/teacher/courses', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
