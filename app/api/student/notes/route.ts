import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function canAccessCourse(userId: string, courseId: string) {
  const order = await prisma.order.findFirst({
    where: { userId, courseId, status: "CONFIRMED" },
    select: { id: true },
  })
  return Boolean(order)
}

export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session) return jsonError("يجب تسجيل الدخول", 401)
  if (session.role !== "STUDENT") return jsonError("هذه الخدمة متاحة للطلاب فقط", 403)

  const url = new URL(req.url)
  const courseId = (url.searchParams.get("courseId") || "").trim()
  const itemId = (url.searchParams.get("itemId") || "").trim() || null
  if (!courseId) return jsonError("courseId مطلوب", 400)

  if (!(await canAccessCourse(session.userId, courseId))) {
    return jsonError("لا تملك وصولاً لهذه الدورة", 403)
  }

  const note = await prisma.courseNote.findFirst({
    where: { userId: session.userId, courseId, itemId },
    select: { content: true, updatedAt: true },
  })
  return NextResponse.json({ content: note?.content ?? "", updatedAt: note?.updatedAt ?? null })
}

export async function PUT(req: Request) {
  const session = await getUserSession()
  if (!session) return jsonError("يجب تسجيل الدخول", 401)
  if (session.role !== "STUDENT") return jsonError("هذه الخدمة متاحة للطلاب فقط", 403)

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return jsonError("Body غير صالح", 400)
  }

  const courseId = typeof body.courseId === "string" ? body.courseId.trim() : ""
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() || null : null
  const content = typeof body.content === "string" ? body.content : ""
  if (!courseId) return jsonError("courseId مطلوب", 400)
  if (content.length > 10000) return jsonError("الملاحظات طويلة جداً", 400)

  if (!(await canAccessCourse(session.userId, courseId))) {
    return jsonError("لا تملك وصولاً لهذه الدورة", 403)
  }

  const existing = await prisma.courseNote.findFirst({
    where: { userId: session.userId, courseId, itemId },
    select: { id: true },
  })
  const note = existing
    ? await prisma.courseNote.update({
        where: { id: existing.id },
        data: { content },
        select: { content: true, updatedAt: true },
      })
    : await prisma.courseNote.create({
        data: { userId: session.userId, courseId, itemId, content },
        select: { content: true, updatedAt: true },
      })
  return NextResponse.json(note)
}
