import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

type Action = "start" | "view" | "complete"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function assertConfirmedEnrollment(userId: string, courseId: string) {
  const order = await prisma.order.findFirst({
    where: { userId, courseId, status: "CONFIRMED" },
    select: { id: true },
  })
  return Boolean(order)
}

/**
 * GET /api/student/progress
 * - Optional query: ?courseId=... (returns item-level progress for that course)
 * - Otherwise: returns progress summaries for all CONFIRMED enrolled courses.
 */
export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session) return jsonError("يجب تسجيل الدخول", 401)
  if (session.role !== "STUDENT") return jsonError("هذه الخدمة متاحة للطلاب فقط", 403)

  const url = new URL(req.url)
  const courseId = url.searchParams.get("courseId")?.trim() || null

  try {
    if (courseId) {
      const ok = await assertConfirmedEnrollment(session.userId, courseId)
      if (!ok) return jsonError("لا تملك وصولاً لهذه الدورة", 403)

      const [items, progressRows] = await Promise.all([
        prisma.courseSectionItem.findMany({
          where: { section: { courseId } },
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            position: true,
            section: { select: { id: true, title: true, position: true } },
          },
          orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
        }),
        prisma.courseItemProgress.findMany({
          where: { userId: session.userId, courseId },
          select: {
            itemId: true,
            startedAt: true,
            lastViewedAt: true,
            completedAt: true,
            progressPercent: true,
            updatedAt: true,
          },
        }),
      ])

      const byItemId = new Map(progressRows.map((p) => [p.itemId, p]))
      const completedItemIds = new Set(
        progressRows.filter((p) => p.completedAt).map((p) => p.itemId)
      )

      const nextItem = items.find((i) => !completedItemIds.has(i.id)) ?? null
      const lastActivity = progressRows
        .map((p) => p.lastViewedAt ?? p.startedAt ?? p.updatedAt)
        .filter(Boolean)
        .sort((a, b) => (a!.getTime() > b!.getTime() ? -1 : 1))[0] ?? null

      return NextResponse.json(
        {
          courseId,
          lastActivityAt: lastActivity,
          nextItem: nextItem
            ? {
                id: nextItem.id,
                title: nextItem.title,
                type: nextItem.type,
                sectionTitle: nextItem.section.title,
              }
            : null,
          items: items.map((i) => {
            const p = byItemId.get(i.id)
            return {
              id: i.id,
              title: i.title,
              type: i.type,
              duration: i.duration,
              sectionId: i.section.id,
              sectionTitle: i.section.title,
              sectionPosition: i.section.position,
              position: i.position,
              startedAt: p?.startedAt ?? null,
              lastViewedAt: p?.lastViewedAt ?? null,
              completedAt: p?.completedAt ?? null,
              progressPercent: p?.progressPercent ?? null,
            }
          }),
        },
        { status: 200 }
      )
    }

    // Summaries for all confirmed enrollments
    const confirmedOrders = await prisma.order.findMany({
      where: { userId: session.userId, status: "CONFIRMED" },
      select: { courseId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })

    const courseIds = Array.from(new Set(confirmedOrders.map((o) => o.courseId)))
    if (courseIds.length === 0) {
      return NextResponse.json({ courses: [] }, { status: 200 })
    }

    const [courses, progressAgg] = await Promise.all([
      prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: {
          id: true,
          title: true,
          category: true,
          imageUrl: true,
          teacher: { select: { fullName: true } },
        },
      }),
      prisma.courseItemProgress.groupBy({
        by: ["courseId"],
        where: { userId: session.userId, courseId: { in: courseIds } },
        _max: { lastViewedAt: true, updatedAt: true },
        _count: { _all: true },
      }),
    ])

    const totalItemsByCourse = await prisma.courseSectionItem.groupBy({
      by: ["sectionId"],
      where: { section: { courseId: { in: courseIds } } },
      _count: { _all: true },
    })
    // totalItemsByCourse is grouped by sectionId, so we need course totals:
    const sectionToCourse = await prisma.courseSection.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, courseId: true },
    })
    const sectionCourseMap = new Map(sectionToCourse.map((s) => [s.id, s.courseId]))
    const totalByCourseId = new Map<string, number>()
    for (const row of totalItemsByCourse) {
      const courseIdForSection = sectionCourseMap.get(row.sectionId)
      if (!courseIdForSection) continue
      totalByCourseId.set(
        courseIdForSection,
        (totalByCourseId.get(courseIdForSection) ?? 0) + row._count._all
      )
    }

    const completedByCourse = await prisma.courseItemProgress.groupBy({
      by: ["courseId"],
      where: {
        userId: session.userId,
        courseId: { in: courseIds },
        completedAt: { not: null },
      },
      _count: { _all: true },
    })
    const completedMap = new Map(completedByCourse.map((r) => [r.courseId, r._count._all]))

    const aggMap = new Map(progressAgg.map((r) => [r.courseId, r]))
    const courseMap = new Map(courses.map((c) => [c.id, c]))

    const summaries = courseIds
      .map((id) => {
        const c = courseMap.get(id)
        if (!c) return null
        const totalItems = totalByCourseId.get(id) ?? 0
        const completedItems = completedMap.get(id) ?? 0
        const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
        const agg = aggMap.get(id)
        const last = agg?._max.lastViewedAt ?? agg?._max.updatedAt ?? null
        return {
          id: c.id,
          title: c.title,
          category: c.category,
          imageUrl: c.imageUrl,
          instructor: c.teacher?.fullName ?? "مدرّس",
          totalItems,
          completedItems,
          progressPct,
          lastActivityAt: last,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ courses: summaries }, { status: 200 })
  } catch (e) {
    console.error("GET /api/student/progress", e)
    return jsonError("حدث خطأ", 500)
  }
}

/**
 * POST /api/student/progress
 * Body: { courseId: string, itemId: string, action: 'start'|'view'|'complete', progressPercent?: number }
 */
export async function POST(req: Request) {
  const session = await getUserSession()
  if (!session) return jsonError("يجب تسجيل الدخول", 401)
  if (session.role !== "STUDENT") return jsonError("هذه الخدمة متاحة للطلاب فقط", 403)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError("Body غير صالح", 400)
  }

  const obj = (body && typeof body === "object" ? (body as Record<string, unknown>) : null)
  const rawCourseId = typeof obj?.courseId === "string" ? obj.courseId : null
  const rawItemId = typeof obj?.itemId === "string" ? obj.itemId : null
  const courseId = rawCourseId?.trim() || ""
  const itemId = rawItemId?.trim() || ""
  const action = (typeof obj?.action === "string" ? obj.action : null) as Action | null
  const progressPercent =
    typeof obj?.progressPercent === "number" ? obj.progressPercent : undefined

  if (!courseId || !itemId) return jsonError("courseId و itemId مطلوبان", 400)
  if (!action || !["start", "view", "complete"].includes(action)) {
    return jsonError("action غير صالح", 400)
  }
  if (
    typeof progressPercent !== "undefined" &&
    (typeof progressPercent !== "number" || progressPercent < 0 || progressPercent > 100)
  ) {
    return jsonError("progressPercent غير صالح", 400)
  }

  try {
    const ok = await assertConfirmedEnrollment(session.userId, courseId)
    if (!ok) return jsonError("لا تملك وصولاً لهذه الدورة", 403)

    const item = await prisma.courseSectionItem.findFirst({
      where: { id: itemId, section: { courseId } },
      select: { id: true },
    })
    if (!item) return jsonError("الدرس غير موجود", 404)

    const now = new Date()

    const updated = await prisma.courseItemProgress.upsert({
      where: { userId_itemId: { userId: session.userId, itemId } },
      create: {
        userId: session.userId,
        courseId,
        itemId,
        startedAt: action === "start" || action === "view" || action === "complete" ? now : null,
        lastViewedAt: action === "view" || action === "complete" ? now : null,
        completedAt: action === "complete" ? now : null,
        progressPercent: typeof progressPercent === "number" ? Math.round(progressPercent) : null,
      },
      update: {
        startedAt: now,
        lastViewedAt: action === "view" || action === "complete" ? now : undefined,
        completedAt: action === "complete" ? now : undefined,
        progressPercent:
          typeof progressPercent === "number" ? Math.round(progressPercent) : undefined,
      },
      select: {
        itemId: true,
        courseId: true,
        startedAt: true,
        lastViewedAt: true,
        completedAt: true,
        progressPercent: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ ok: true, progress: updated }, { status: 200 })
  } catch (e) {
    console.error("POST /api/student/progress", e)
    return jsonError("حدث خطأ", 500)
  }
}

