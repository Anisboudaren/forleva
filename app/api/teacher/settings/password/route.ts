import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function PATCH(req: Request) {
  const session = await getUserSession()
  if (!session) return jsonError("يجب تسجيل الدخول", 401)
  if (session.role !== "TEACHER") return jsonError("هذه الخدمة متاحة للمدرسين فقط", 403)

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return jsonError("Body غير صالح", 400)
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : ""
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : ""
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : ""

  if (!currentPassword || !newPassword || !confirmPassword) {
    return jsonError("جميع حقول كلمة المرور مطلوبة", 400)
  }
  if (newPassword.length < 8) {
    return jsonError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل", 400)
  }
  if (newPassword !== confirmPassword) {
    return jsonError("تأكيد كلمة المرور غير مطابق", 400)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, passwordHash: true, role: true },
  })
  if (!user || user.role !== "TEACHER") return jsonError("المستخدم غير موجود", 404)

  const ok = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!ok) return jsonError("كلمة المرور الحالية غير صحيحة", 400)

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash },
  })

  return NextResponse.json({ ok: true })
}
