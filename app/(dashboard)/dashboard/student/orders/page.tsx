import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"
import { formatDateAr, formatRelativeAr } from "@/lib/format-date"
import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { GradientText } from "@/components/text/gradient-text"
import { ShoppingCart, Clock, BookOpen } from "lucide-react"
type OrderWithCourse = {
  id: string
  userId: string
  courseId: string
  status: string
  amount: number
  createdAt: Date
  course: { id: string; title: string; category: string }
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    className: string
  }
> = {
  PENDING: {
    label: "قيد المعالجة",
    className: "bg-yellow-100 text-yellow-700",
  },
  CONFIRMED: {
    label: "مؤكدة",
    className: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "ملغاة",
    className: "bg-red-100 text-red-700",
  },
}

export default async function StudentOrdersPage() {
  const session = await getUserSession()

  if (!session || session.role !== "STUDENT") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للطلاب فقط</p>
        <p className="text-sm text-gray-600">يرجى تسجيل الدخول بحساب طالب للوصول إلى سجل الطلبات.</p>
      </div>
    )
  }

  const orders: OrderWithCourse[] = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  })

  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0)

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText
            text="طلباتي"
            gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
          />
        </h1>
        <p className="text-base text-gray-600">سجل طلبات الدورات وحالتها الحالية</p>
      </div>

      <DashboardContentCard
        title={
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-yellow-500" />
            <span>سجل الطلبات</span>
          </div>
        }
        description={
          orders.length
            ? `${orders.length} طلب • إجمالي ${totalAmount.toLocaleString()} د.ج`
            : "لم تقم بأي طلبات بعد"
        }
        icon={ShoppingCart}
      >
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
              <ShoppingCart className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">لا توجد طلبات حتى الآن</h2>
            <p className="text-sm text-gray-600 max-w-md">
              عند تسجيلك في أي دورة، ستظهر جميع طلباتك هنا مع حالة كل طلب وتاريخ إنشائه.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">الدورة</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">المبلغ</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">التاريخ</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">منذ</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        <div className="flex flex-col gap-1">
                          <span>{order.course?.title ?? "دورة غير معروفة"}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {order.course?.category}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {order.amount.toLocaleString()} د.ج
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDateAr(order.createdAt)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{formatRelativeAr(order.createdAt)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardContentCard>
    </div>
  )
}

