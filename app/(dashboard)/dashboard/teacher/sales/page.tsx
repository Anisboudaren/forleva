import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { ShoppingCart, TrendingUp, DollarSign, Calendar, Download } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"

export default function SalesPage() {
  const sales = [
    {
      id: 1,
      courseName: "مقدمة في البرمجة",
      studentName: "أحمد محمد",
      amount: 299,
      date: "15 يناير 2024",
      status: "completed",
    },
    {
      id: 2,
      courseName: "تصميم واجهات المستخدم",
      studentName: "فاطمة علي",
      amount: 249,
      date: "14 يناير 2024",
      status: "completed",
    },
    {
      id: 3,
      courseName: "قواعد البيانات المتقدمة",
      studentName: "خالد حسن",
      amount: 349,
      date: "13 يناير 2024",
      status: "completed",
    },
    {
      id: 4,
      courseName: "مقدمة في البرمجة",
      studentName: "سارة أحمد",
      amount: 299,
      date: "12 يناير 2024",
      status: "completed",
    },
  ]

  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0)
  const todaySales = sales.filter(s => s.date.includes("15")).length
  const todayRevenue = sales.filter(s => s.date.includes("15")).reduce((sum, s) => sum + s.amount, 0)

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
        <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          تصدير التقرير
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={ShoppingCart}
          title="إجمالي المبيعات"
          value={totalSales}
          description="مبيعة إجمالية"
        />
        <DashboardCard
          variant="green"
          icon={DollarSign}
          title="إجمالي الإيرادات"
          value={`${totalRevenue.toLocaleString()} د.ج`}
          description="إيرادات إجمالية"
        />
        <DashboardCard
          variant="yellow"
          icon={Calendar}
          title="مبيعات اليوم"
          value={todaySales}
          description={`${todayRevenue.toLocaleString()} د.ج`}
        />
        <DashboardCard
          variant="purple"
          icon={TrendingUp}
          title="متوسط المبيعات"
          value={`${Math.round(totalRevenue / totalSales)} د.ج`}
          description="لكل مبيعة"
        />
      </div>

      {/* Sales List */}
      <DashboardContentCard
        title="سجل المبيعات"
        description={`${totalSales} مبيعة`}
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
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">{sale.courseName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{sale.studentName}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{sale.amount} د.ج</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{sale.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      مكتملة
                    </span>
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

