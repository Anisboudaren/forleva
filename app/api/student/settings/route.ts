import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

type UpdateBody = {
  fullName?: string
  email?: string
  phone?: string
  whatsapp?: string
}

export async function GET() {
  const session = await getUserSession()
  if (!session) return jsonError("يجب تسجيل الدخول", 401)
  if (session.role !== "STUDENT") return jsonError("هذه الخدمة متاحة للطلاب فقط", 403)

  try {
    const user = await prisma.user.findFirst({
      where: { id: session.userId, role: "STUDENT" },
      select: { id: true, fullName: true, email: true, phone: true, whatsapp: true },
    })
    if (!user) return jsonError("المستخدم غير موجود", 404)
    return NextResponse.json({ user }, { status: 200 })
  } catch (e) {
    console.error("GET /api/student/settings", e)
    return jsonError("حدث خطأ", 500)
  }
}

export async function PATCH(req: Request) {
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
  const incoming: UpdateBody = {
    fullName: typeof obj?.fullName === "string" ? obj.fullName.trim() : undefined,
    email: typeof obj?.email === "string" ? obj.email.trim() : undefined,
    phone: typeof obj?.phone === "string" ? obj.phone.trim() : undefined,
    whatsapp: typeof obj?.whatsapp === "string" ? obj.whatsapp.trim() : undefined,
  }

  // normalize empty strings to null (unset)
  const data: {
    fullName?: string | null
    email?: string | null
    phone?: string | null
    whatsapp?: string | null
  } = {}

  if (typeof incoming.fullName !== "undefined") data.fullName = incoming.fullName || null
  if (typeof incoming.email !== "undefined") data.email = incoming.email || null
  if (typeof incoming.phone !== "undefined") data.phone = incoming.phone || null
  if (typeof incoming.whatsapp !== "undefined") data.whatsapp = incoming.whatsapp || null

  if (Object.keys(data).length === 0) {
    return jsonError("لا توجد تغييرات", 400)
  }

  // Basic validation
  if (typeof data.fullName === "string" && data.fullName.length < 2) {
    return jsonError("الاسم الكامل قصير جداً", 400)
  }
  if (typeof data.email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return jsonError("البريد الإلكتروني غير صالح", 400)
  }
  if (typeof data.phone === "string" && data.phone.length < 6) {
    return jsonError("رقم الهاتف غير صالح", 400)
  }
  if (typeof data.whatsapp === "string" && data.whatsapp.length < 6) {
    return jsonError("رقم واتساب غير صالح", 400)
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: { id: true, fullName: true, email: true, phone: true, whatsapp: true },
    })
    return NextResponse.json({ user: updated }, { status: 200 })
  } catch (e: any) {
    // Handle unique conflicts for email/phone
    const msg = typeof e?.message === "string" ? e.message : ""
    if (msg.includes("Unique constraint") || msg.includes("P2002")) {
      return jsonError("البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل", 409)
    }
    console.error("PATCH /api/student/settings", e)
    return jsonError("حدث خطأ", 500)
  }
}

