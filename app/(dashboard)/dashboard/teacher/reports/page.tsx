import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Users } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]

function monthKey(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${yyyy}-${mm}`
}

function monthLabelFromKey(key: string) {
  const [y, m] = key.split("-")
  const mi = Number(m) - 1
  return `${MONTHS_AR[mi] ?? ""} ${y}`
}

function formatCurrencyDZD(amount: number) {
  return `${Math.round(amount).toLocaleString()} د.ج`
}

export default async function ReportsPage() {
  const session = await getUserSession()

  if (!session || session.role !== "TEACHER") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للمدرسين فقط</p>
        <p className="text-sm text-gray-600">يرجى تسجيل الدخول بحساب مدرس لعرض التقارير.</p>
      </div>
    )
  }

  const now = new Date()
  const start4Months = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const start7d = new Date(now)
  start7d.setDate(now.getDate() - 7)

  // Pull confirmed sales for the teacher's courses (last 4 months for table)
  const orders = await prisma.order.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { gte: start4Months },
      course: { teacherId: session.userId },
    },
    select: {
      amount: true,
      createdAt: true,
      userId: true,
      courseId: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const monthlyBuckets = new Map<string, { sales: number; revenue: number; studentIds: Set<string> }>()
  for (const o of orders) {
    const k = monthKey(o.createdAt)
    const b = monthlyBuckets.get(k) ?? { sales: 0, revenue: 0, studentIds: new Set<string>() }
    b.sales += 1
    b.revenue += o.amount
    b.studentIds.add(o.userId)
    monthlyBuckets.set(k, b)
  }

  const monthKeys: string[] = []
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(monthKey(d))
  }

  const monthlyData = monthKeys.map((k) => {
    const b = monthlyBuckets.get(k) ?? { sales: 0, revenue: 0, studentIds: new Set<string>() }
    return {
      month: monthLabelFromKey(k),
      sales: b.sales,
      revenue: b.revenue,
      students: b.studentIds.size,
    }
  })

  const totalRevenue4m = monthlyData.reduce((acc, m) => acc + m.revenue, 0)
  const totalSales4m = monthlyData.reduce((acc, m) => acc + m.sales, 0)

  const recent7dOrders = orders.filter((o) => o.createdAt >= start7d)
  const revenue7d = recent7dOrders.reduce((acc, o) => acc + o.amount, 0)
  const sales7d = recent7dOrders.length
  const students7d = new Set(recent7dOrders.map((o) => o.userId)).size

  // Top courses (all-time confirmed)
  const top = await prisma.order.groupBy({
    by: ["courseId"],
    where: { status: "CONFIRMED", course: { teacherId: session.userId } },
    _count: { _all: true },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  })

  const topIds = top.map((t) => t.courseId)
  const topCoursesMeta = await prisma.course.findMany({
    where: { id: { in: topIds }, teacherId: session.userId },
    select: { id: true, title: true },
  })
  const titleMap = new Map(topCoursesMeta.map((c) => [c.id, c.title]))
  const topCourses = top.map((t) => ({
    name: titleMap.get(t.courseId) ?? "—",
    sales: t._count._all,
    revenue: t._sum.amount ?? 0,
  }))

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            <GradientText text="التقارير" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-base text-gray-600">
            تحليل شامل لأداء دوراتك وإحصائيات منصتك
          </p>
        </div>
        <a
          href="/api/teacher/exports?kind=reports"
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          تصدير التقرير
        </a>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={TrendingUp}
          title="مبيعات آخر 7 أيام"
          value={sales7d}
          description="مبيعات مؤكدة"
        />
        <DashboardCard
          variant="green"
          icon={DollarSign}
          title="إجمالي الإيرادات"
          value={formatCurrencyDZD(totalRevenue4m)}
          description="آخر 4 أشهر"
        />
        <DashboardCard
          variant="yellow"
          icon={Users}
          title="طلاب آخر 7 أيام"
          value={students7d}
          description="طلاب جدد (مبيعات مؤكدة)"
        />
        <DashboardCard
          variant="purple"
          icon={BarChart3}
          title="متوسط قيمة المبيعة"
          value={totalSales4m > 0 ? formatCurrencyDZD(totalRevenue4m / totalSales4m) : "—"}
          description="آخر 4 أشهر"
        />
      </div>

      {/* Monthly Performance */}
      <DashboardContentCard
        title="الأداء الشهري"
        description="إحصائيات المبيعات والإيرادات"
        icon={Calendar}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">الشهر</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">المبيعات</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">الإيرادات</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">الطلاب الجدد</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{data.month}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{data.sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{formatCurrencyDZD(data.revenue)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{data.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardContentCard>

      {/* Top Courses */}
      <DashboardContentCard
        title="أفضل الدورات أداءً"
        description="الدورات الأكثر مبيعاً"
        icon={TrendingUp}
      >
        <div className="space-y-4">
          {topCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">لا توجد مبيعات مؤكدة بعد.</p>
            </div>
          ) : topCourses.map((course, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-600">{course.sales} مبيعة</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900">{formatCurrencyDZD(course.revenue)}</p>
                <p className="text-xs text-gray-600">إيرادات</p>
              </div>
            </div>
          ))}
        </div>
      </DashboardContentCard>
    </div>
  )
}

