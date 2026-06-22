import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-session'
import { prisma } from '@/lib/db'
import {
  normalizeQuizQuestions,
  parseExtraData,
  type FormField,
} from '@/lib/course-content'

type QuizAnswers = Record<string, number[]>
type FormAnswers = Record<string, string | string[]>

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const sa = [...a].sort((x, y) => x - y)
  const sb = [...b].sort((x, y) => x - y)
  return sa.every((v, i) => v === sb[i])
}

async function ensureEnrolled(userId: string, courseId: string) {
  const order = await prisma.order.findFirst({
    where: { userId, courseId, status: 'CONFIRMED' },
  })
  if (!order) return false
  return true
}

async function markItemComplete(userId: string, courseId: string, itemId: string) {
  const now = new Date()
  await prisma.courseItemProgress.upsert({
    where: { userId_itemId: { userId, itemId } },
    create: {
      userId,
      courseId,
      itemId,
      startedAt: now,
      lastViewedAt: now,
      completedAt: now,
      progressPercent: 100,
    },
    update: {
      lastViewedAt: now,
      completedAt: now,
      progressPercent: 100,
    },
  })
}

function gradeQuiz(
  extra: ReturnType<typeof parseExtraData>,
  answers: QuizAnswers
): { score: number; results: Record<string, { correct: boolean; selected: number[] }> } {
  const questions = normalizeQuizQuestions(extra)
  if (questions.length === 0) return { score: 0, results: {} }

  const results: Record<string, { correct: boolean; selected: number[] }> = {}
  let correctCount = 0

  for (const q of questions) {
    const selected = Array.isArray(answers[q.id]) ? answers[q.id] : []
    const correct = arraysEqual(selected, q.correctOptionIndices)
    results[q.id] = { correct, selected }
    if (correct) correctCount++
  }

  const score = Math.round((correctCount / questions.length) * 100)
  return { score, results }
}

function validateForm(
  fields: FormField[],
  answers: FormAnswers
): { ok: true } | { ok: false; error: string } {
  for (const field of fields) {
    if (!field.required) continue
    const val = answers[field.id]
    if (field.type === 'multi') {
      if (!Array.isArray(val) || val.length === 0) {
        return { ok: false, error: `الحقل «${field.label || 'مطلوب'}» مطلوب` }
      }
    } else if (!val || (typeof val === 'string' && !val.trim())) {
      return { ok: false, error: `الحقل «${field.label || 'مطلوب'}» مطلوب` }
    }
  }
  return { ok: true }
}

export async function GET(request: NextRequest) {
  const session = await getUserSession()
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')?.trim()
  const itemId = searchParams.get('itemId')?.trim()

  if (!courseId || !itemId) {
    return NextResponse.json({ error: 'معرّف الدورة والعنصر مطلوبان' }, { status: 400 })
  }

  const enrolled = await ensureEnrolled(session.userId, courseId)
  if (!enrolled) {
    return NextResponse.json({ error: 'غير مسجّل في هذه الدورة' }, { status: 403 })
  }

  const submission = await prisma.courseItemSubmission.findUnique({
    where: { userId_itemId: { userId: session.userId, itemId } },
  })

  if (!submission) {
    return NextResponse.json({ submitted: false })
  }

  const item = await prisma.courseSectionItem.findUnique({
    where: { id: itemId },
    select: { type: true, extraData: true },
  })

  let quizResults: Record<string, { correct: boolean; selected: number[] }> | undefined
  if (item?.type === 'QUIZ' && item.extraData) {
    const extra = parseExtraData(item.extraData)
    const { results } = gradeQuiz(extra, submission.answers as QuizAnswers)
    quizResults = results
  }

  return NextResponse.json({
    submitted: true,
    type: submission.type,
    answers: submission.answers,
    score: submission.score,
    submittedAt: submission.submittedAt.toISOString(),
    quizResults,
  })
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      courseId?: string
      itemId?: string
      answers?: QuizAnswers | FormAnswers
    }

    const courseId = body.courseId?.trim()
    const itemId = body.itemId?.trim()
    const answers = body.answers

    if (!courseId || !itemId || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const enrolled = await ensureEnrolled(session.userId, courseId)
    if (!enrolled) {
      return NextResponse.json({ error: 'غير مسجّل في هذه الدورة' }, { status: 403 })
    }

    const item = await prisma.courseSectionItem.findFirst({
      where: {
        id: itemId,
        section: { courseId },
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 })
    }

    const extra = parseExtraData(item.extraData)

    if (item.type === 'QUIZ') {
      const { score, results } = gradeQuiz(extra, answers as QuizAnswers)

      const submission = await prisma.courseItemSubmission.upsert({
        where: { userId_itemId: { userId: session.userId, itemId } },
        create: {
          userId: session.userId,
          courseId,
          itemId,
          type: 'QUIZ',
          answers: answers as object,
          score,
        },
        update: {
          answers: answers as object,
          score,
          submittedAt: new Date(),
        },
      })

      await markItemComplete(session.userId, courseId, itemId)

      return NextResponse.json({
        ok: true,
        score: submission.score,
        quizResults: results,
        submittedAt: submission.submittedAt.toISOString(),
      })
    }

    if (item.type === 'SURVEY') {
      const fields = Array.isArray(extra.formFields) ? extra.formFields : []
      const validation = validateForm(fields, answers as FormAnswers)
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      const submission = await prisma.courseItemSubmission.upsert({
        where: { userId_itemId: { userId: session.userId, itemId } },
        create: {
          userId: session.userId,
          courseId,
          itemId,
          type: 'SURVEY',
          answers: answers as object,
        },
        update: {
          answers: answers as object,
          submittedAt: new Date(),
        },
      })

      await markItemComplete(session.userId, courseId, itemId)

      return NextResponse.json({
        ok: true,
        submittedAt: submission.submittedAt.toISOString(),
      })
    }

    return NextResponse.json({ error: 'نوع المحتوى لا يدعم الإرسال' }, { status: 400 })
  } catch (e) {
    console.error('POST /api/student/item-submissions', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
