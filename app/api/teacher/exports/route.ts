import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

function toCsv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: string | number) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")),
  ].join("\n")
}

export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const url = new URL(req.url)
  const kind = (url.searchParams.get("kind") || "sales").trim()

  if (kind === "sales") {
    const orders = await prisma.order.findMany({
      where: { status: "CONFIRMED", course: { teacherId: session.userId } },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        course: { select: { title: true } },
        user: { select: { fullName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    const csv = toCsv(
      orders.map((o) => ({
        order_id: o.id,
        course: o.course?.title ?? "—",
        student: o.user?.fullName ?? o.user?.email ?? o.user?.phone ?? "—",
        amount_dzd: o.amount,
        created_at: o.createdAt.toISOString(),
      }))
    )
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="teacher-sales.csv"',
      },
    })
  }

  const monthly = await prisma.order.groupBy({
    by: ["courseId"],
    where: { status: "CONFIRMED", course: { teacherId: session.userId } },
    _count: { _all: true },
    _sum: { amount: true },
  })
  const courses = await prisma.course.findMany({
    where: { id: { in: monthly.map((m) => m.courseId) } },
    select: { id: true, title: true },
  })
  const titleMap = new Map(courses.map((c) => [c.id, c.title]))
  const csv = toCsv(
    monthly.map((m) => ({
      course_id: m.courseId,
      course: titleMap.get(m.courseId) ?? "—",
      confirmed_sales: m._count._all,
      revenue_dzd: m._sum.amount ?? 0,
    }))
  )

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="teacher-reports.csv"',
    },
  })
}
