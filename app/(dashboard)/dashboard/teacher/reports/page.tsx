import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Users } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"

export default function ReportsPage() {
  const monthlyData = [
    { month: "يناير", sales: 1247, revenue: 374100, students: 342 },
    { month: "ديسمبر", sales: 1103, revenue: 330900, students: 298 },
    { month: "نوفمبر", sales: 892, revenue: 267600, students: 256 },
    { month: "أكتوبر", sales: 756, revenue: 226800, students: 189 },
  ]

  const topCourses = [
    { name: "مقدمة في البرمجة", sales: 342, revenue: 102258 },
    { name: "قواعد البيانات المتقدمة", sales: 256, revenue: 89344 },
    { name: "تصميم واجهات المستخدم", sales: 189, revenue: 47061 },
  ]

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
        <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          تصدير التقرير
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={TrendingUp}
          title="نمو المبيعات"
          value="+18%"
          description="من الشهر الماضي"
        />
        <DashboardCard
          variant="green"
          icon={DollarSign}
          title="إجمالي الإيرادات"
          value="1,199,400 ر.س"
          description="هذا الشهر"
        />
        <DashboardCard
          variant="yellow"
          icon={Users}
          title="نمو الطلاب"
          value="+15%"
          description="من الشهر الماضي"
        />
        <DashboardCard
          variant="purple"
          icon={BarChart3}
          title="متوسط المبيعات"
          value="312"
          description="مبيعة شهرياً"
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
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{data.revenue.toLocaleString()} ر.س</td>
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
          {topCourses.map((course, index) => (
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
                <p className="text-lg font-bold text-gray-900">{course.revenue.toLocaleString()} ر.س</p>
                <p className="text-xs text-gray-600">إيرادات</p>
              </div>
            </div>
          ))}
        </div>
      </DashboardContentCard>
    </div>
  )
}

