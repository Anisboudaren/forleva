import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"
import { getAdminSession } from "@/lib/auth-session"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params
  const questions = await prisma.courseQuestion.findMany({
    where: { courseId, isHidden: false },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { fullName: true } },
      replies: {
        where: { isHidden: false },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { fullName: true } } },
      },
    },
  })
  return NextResponse.json(
    questions.map((q) => ({
      id: q.id,
      content: q.content,
      createdAt: q.createdAt,
      userName: q.user.fullName ?? "مستخدم",
      replies: q.replies.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt,
        userName: r.user.fullName ?? "مستخدم",
      })),
    }))
  )
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 })
  const { id: courseId } = await params
  const body = (await req.json().catch(() => null)) as { content?: string } | null
  const content = (body?.content ?? "").trim()
  if (content.length < 2) return NextResponse.json({ error: "السؤال قصير جداً" }, { status: 400 })

  if (session.role === "STUDENT") {
    const enrolled = await prisma.order.findFirst({
      where: { userId: session.userId, courseId, status: "CONFIRMED" },
      select: { id: true },
    })
    if (!enrolled) {
      return NextResponse.json({ error: "يجب أن تكون مسجلاً في الدورة لطرح سؤال" }, { status: 403 })
    }
  }

  const q = await prisma.courseQuestion.create({
    data: { courseId, userId: session.userId, content },
    include: { user: { select: { fullName: true } } },
  })
  return NextResponse.json({
    id: q.id,
    content: q.content,
    createdAt: q.createdAt,
    userName: q.user.fullName ?? "مستخدم",
    replies: [],
  })
}

export async function PATCH(req: Request) {
  const admin = await getAdminSession()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }
  const body = (await req.json().catch(() => null)) as { questionId?: string; hide?: boolean } | null
  const questionId = (body?.questionId ?? "").trim()
  if (!questionId) return NextResponse.json({ error: "questionId مطلوب" }, { status: 400 })
  const updated = await prisma.courseQuestion.update({
    where: { id: questionId },
    data: { isHidden: body?.hide === true },
    select: { id: true, isHidden: true },
  })
  return NextResponse.json(updated)
}
