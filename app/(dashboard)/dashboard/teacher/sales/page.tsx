import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { ShoppingCart, TrendingUp, DollarSign, Calendar, Download } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

function formatCurrencyDZD(amount: number) {
  return `${Math.round(amount).toLocaleString()} د.ج`
}

function formatDateAr(date: Date) {
  return date.toLocaleDateString("ar-DZ", { day: "numeric", month: "long", year: "numeric" })
}

export default async function SalesPage() {
  const session = await getUserSession()

  if (!session || session.role !== "TEACHER") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للمدرسين فقط</p>
        <p className="text-sm text-gray-600">يرجى تسجيل الدخول بحساب مدرس لعرض المبيعات.</p>
      </div>
    )
  }

  const now = new Date()
  const start7d = new Date(now)
  start7d.setDate(now.getDate() - 7)
  const startToday = new Date(now)
  startToday.setHours(0, 0, 0, 0)

  const [orders, aggAll, agg7d, aggToday] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: "CONFIRMED",
        course: { teacherId: session.userId },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        course: { select: { title: true } },
        user: { select: { fullName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.aggregate({
      where: { status: "CONFIRMED", course: { teacherId: session.userId } },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: start7d }, course: { teacherId: session.userId } },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: startToday }, course: { teacherId: session.userId } },
      _count: { _all: true },
      _sum: { amount: true },
    }),
  ])

  const totalSales = aggAll._count._all
  const totalRevenue = aggAll._sum.amount ?? 0
  const todaySales = aggToday._count._all
  const todayRevenue = aggToday._sum.amount ?? 0
  const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0

  const sales = orders.map((o) => {
    const studentName = o.user?.fullName || o.user?.email || o.user?.phone || "طالب"
    return {
      id: o.id,
      courseName: o.course?.title ?? "—",
      studentName,
      amount: o.amount,
      date: formatDateAr(o.createdAt),
      status: o.status,
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            <GradientText text="المبيعات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-base text-gray-600">
            تتبع مبيعات دوراتك وإيراداتك
          </p>
        </div>
        <a
          href="/api/teacher/exports?kind=sales"
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
          icon={ShoppingCart}
          title="إجمالي المبيعات"
          value={totalSales}
          description={`${agg7d._count._all} في آخر 7 أيام`}
        />
        <DashboardCard
          variant="green"
          icon={DollarSign}
          title="إجمالي الإيرادات"
          value={formatCurrencyDZD(totalRevenue)}
          description={`${formatCurrencyDZD(agg7d._sum.amount ?? 0)} في آخر 7 أيام`}
        />
        <DashboardCard
          variant="yellow"
          icon={Calendar}
          title="مبيعات اليوم"
          value={todaySales}
          description={formatCurrencyDZD(todayRevenue)}
        />
        <DashboardCard
          variant="purple"
          icon={TrendingUp}
          title="متوسط المبيعات"
          value={totalSales > 0 ? formatCurrencyDZD(avgSale) : "—"}
          description="لكل مبيعة"
        />
      </div>

      {/* Sales List */}
      <DashboardContentCard
        title="سجل المبيعات"
        description={`${sales.length} آخر المبيعات`}
        icon={ShoppingCart}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">الدورة</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">الطالب</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">المبلغ</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">التاريخ</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-600">
                    لا توجد مبيعات مؤكدة بعد.
                  </td>
                </tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">{sale.courseName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{sale.studentName}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{formatCurrencyDZD(sale.amount)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{sale.date}</td>
                  <td className="py-3 px-4">
                    {sale.status === "CONFIRMED" ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        مؤكدة
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {sale.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardContentCard>
    </div>
  )
}

