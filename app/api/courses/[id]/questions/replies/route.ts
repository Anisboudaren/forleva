import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"
import { getAdminSession } from "@/lib/auth-session"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 })
  const { id: courseId } = await params
  const body = (await req.json().catch(() => null)) as
    | { questionId?: string; content?: string }
    | null
  const questionId = (body?.questionId ?? "").trim()
  const content = (body?.content ?? "").trim()
  if (!questionId) return NextResponse.json({ error: "questionId مطلوب" }, { status: 400 })
  if (content.length < 2) return NextResponse.json({ error: "الرد قصير جداً" }, { status: 400 })

  const question = await prisma.courseQuestion.findFirst({
    where: { id: questionId, courseId },
    select: { id: true, course: { select: { teacherId: true } } },
  })
  if (!question) return NextResponse.json({ error: "السؤال غير موجود" }, { status: 404 })

  if (session.role === "TEACHER" && question.course.teacherId !== session.userId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }
  if (session.role === "STUDENT") {
    const enrolled = await prisma.order.findFirst({
      where: { userId: session.userId, courseId, status: "CONFIRMED" },
      select: { id: true },
    })
    if (!enrolled) return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const reply = await prisma.courseQuestionReply.create({
    data: { questionId, userId: session.userId, content },
    include: { user: { select: { fullName: true } } },
  })

  return NextResponse.json({
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt,
    userName: reply.user.fullName ?? "مستخدم",
  })
}

export async function PATCH(req: Request) {
  const admin = await getAdminSession()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }
  const body = (await req.json().catch(() => null)) as { replyId?: string; hide?: boolean } | null
  const replyId = (body?.replyId ?? "").trim()
  if (!replyId) return NextResponse.json({ error: "replyId مطلوب" }, { status: 400 })
  const updated = await prisma.courseQuestionReply.update({
    where: { id: replyId },
    data: { isHidden: body?.hide === true },
    select: { id: true, isHidden: true },
  })
  return NextResponse.json(updated)
}
