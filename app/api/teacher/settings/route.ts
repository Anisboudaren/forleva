import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

type NotificationPrefs = {
  emailNotifications: boolean
  newLessons: boolean
  achievements: boolean
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function parsePrefs(input: unknown): NotificationPrefs | null {
  if (!input || typeof input !== "object") return null
  const v = input as Record<string, unknown>
  if (
    typeof v.emailNotifications !== "boolean" ||
    typeof v.newLessons !== "boolean" ||
    typeof v.achievements !== "boolean"
  ) {
    return null
  }
  return {
    emailNotifications: v.emailNotifications,
    newLessons: v.newLessons,
    achievements: v.achievements,
  }
}

const DEFAULT_PREFS: NotificationPrefs = {
  emailNotifications: true,
  newLessons: true,
  achievements: true,
}

export async function GET() {
  const session = await getUserSession()
  if (!session) return jsonError("يجب تسجيل الدخول", 401)
  if (session.role !== "TEACHER") return jsonError("هذه الخدمة متاحة للمدرسين فقط", 403)

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, fullName: true, email: true, phone: true, whatsapp: true, notificationPrefs: true },
  })
  if (!user) return jsonError("المستخدم غير موجود", 404)

  const prefs = parsePrefs(user.notificationPrefs) ?? DEFAULT_PREFS
  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      whatsapp: user.whatsapp,
      notificationPrefs: prefs,
    },
  })
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

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : undefined
  const email = typeof body.email === "string" ? body.email.trim() : undefined
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : undefined
  const notificationPrefs =
    typeof body.notificationPrefs !== "undefined" ? parsePrefs(body.notificationPrefs) : undefined

  if (typeof fullName === "string" && fullName.length > 0 && fullName.length < 2) {
    return jsonError("الاسم الكامل قصير جداً", 400)
  }
  if (typeof email === "string" && email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("البريد الإلكتروني غير صالح", 400)
  }
  if (typeof phone === "string" && phone.length > 0 && phone.length < 6) {
    return jsonError("رقم الهاتف غير صالح", 400)
  }
  if (typeof whatsapp === "string" && whatsapp.length > 0 && whatsapp.length < 6) {
    return jsonError("رقم واتساب غير صالح", 400)
  }
  if (typeof body.notificationPrefs !== "undefined" && !notificationPrefs) {
    return jsonError("إعدادات الإشعارات غير صالحة", 400)
  }

  const data: Record<string, unknown> = {}
  if (typeof fullName !== "undefined") data.fullName = fullName || null
  if (typeof email !== "undefined") data.email = email || null
  if (typeof phone !== "undefined") data.phone = phone || null
  if (typeof whatsapp !== "undefined") data.whatsapp = whatsapp || null
  if (notificationPrefs) data.notificationPrefs = notificationPrefs

  if (Object.keys(data).length === 0) return jsonError("لا توجد تغييرات", 400)

  try {
    const updated = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: { id: true, fullName: true, email: true, phone: true, whatsapp: true, notificationPrefs: true },
    })
    return NextResponse.json({
      user: {
        ...updated,
        notificationPrefs: parsePrefs(updated.notificationPrefs) ?? DEFAULT_PREFS,
      },
    })
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e &&
      "code" in e &&
      typeof (e as { code?: unknown }).code === "string" &&
      (e as { code: string }).code === "P2002"
    ) {
      return jsonError("البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل", 409)
    }
    console.error("PATCH /api/teacher/settings", e)
    return jsonError("حدث خطأ", 500)
  }
}
