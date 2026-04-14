import { DashboardCard, DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { TrendingUp, Users, BookOpen, Star, ShoppingBag, Eye } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

function formatCurrencyDZD(amount: number) {
  return `${Math.round(amount).toLocaleString()} د.ج`
}

export default async function TeacherDashboard() {
  const session = await getUserSession()

  if (!session || session.role !== "TEACHER") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للمدرسين فقط</p>
        <p className="text-sm text-gray-600">يرجى تسجيل الدخول بحساب مدرس لعرض لوحة التحكم.</p>
      </div>
    )
  }

  const now = new Date()
  const since = new Date(now)
  since.setDate(now.getDate() - 7)

  const [
    totalCourses,
    salesAggAll,
    salesAgg7d,
    reviewsAgg,
    topByRevenue,
  ] = await Promise.all([
    prisma.course.count({ where: { teacherId: session.userId } }),
    prisma.order.aggregate({
      where: {
        status: "CONFIRMED",
        course: { teacherId: session.userId },
      },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: "CONFIRMED",
        createdAt: { gte: since },
        course: { teacherId: session.userId },
      },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.review.aggregate({
      where: { course: { teacherId: session.userId } },
      _count: { _all: true },
      _avg: { rating: true },
    }),
    prisma.order.groupBy({
      by: ["courseId"],
      where: { status: "CONFIRMED", course: { teacherId: session.userId } },
      _count: { _all: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 1,
    }),
  ])

  const totalPurchases = salesAggAll._count._all
  const totalRevenue = salesAggAll._sum.amount ?? 0
  const recentPurchases = salesAgg7d._count._all

  const totalReviews = reviewsAgg._count._all
  const avgRating = reviewsAgg._avg.rating ?? 0

  let bestPerformingCourse: {
    name: string
    purchases: number
    reviews: number
    rating: number
  } | null = null

  const bestCourseId = topByRevenue?.[0]?.courseId
  if (bestCourseId) {
    const [course, courseReviewsAgg] = await Promise.all([
      prisma.course.findFirst({
        where: { id: bestCourseId, teacherId: session.userId },
        select: { title: true },
      }),
      prisma.review.aggregate({
        where: { courseId: bestCourseId, course: { teacherId: session.userId } },
        _count: { _all: true },
        _avg: { rating: true },
      }),
    ])

    bestPerformingCourse = {
      name: course?.title ?? "—",
      purchases: topByRevenue[0]?._count._all ?? 0,
      reviews: courseReviewsAgg._count._all,
      rating: courseReviewsAgg._avg.rating ?? 0,
    }
  }

  const satisfactionPercent =
    totalReviews > 0
      ? Math.round(
          ((await prisma.review.count({
            where: { course: { teacherId: session.userId }, rating: 5 },
          })) /
            totalReviews) *
            100
        )
      : 0

  const avgSalesPerDay = Math.round(recentPurchases / 7)

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          مرحباً بك في <GradientText text="لوحة التحكم" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          نظرة شاملة على أداء دوراتك وإحصائيات منصتك
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={BookOpen}
          title="إجمالي الدورات"
          value={totalCourses}
          description={
            <span className="inline-flex items-center gap-1">
              آخر 7 أيام
            </span>
          }
        />
        
        <DashboardCard
          variant="green"
          icon={ShoppingBag}
          title="إجمالي المبيعات"
          value={totalPurchases.toLocaleString()}
          description={
            <span className="inline-flex items-center gap-1">
              {recentPurchases.toLocaleString()} في آخر 7 أيام
            </span>
          }
        />
        
        <DashboardCard
          variant="yellow"
          icon={Star}
          title="إجمالي التقييمات"
          value={totalReviews.toLocaleString()}
          description={`متوسط التقييم: ${totalReviews > 0 ? avgRating.toFixed(1) : "—"}`}
        />
        
        <DashboardCard
          variant="purple"
          icon={TrendingUp}
          title="إجمالي الإيرادات"
          value={formatCurrencyDZD(totalRevenue)}
          description={
            <span className="inline-flex items-center gap-1">
              {formatCurrencyDZD(salesAgg7d._sum.amount ?? 0)} في آخر 7 أيام
            </span>
          }
        />
      </div>

      {/* Best Performing Course */}
      <DashboardContentCard
        title="أفضل دورة أداءً"
        description="الدورة الأكثر مبيعاً وتقييماً في منصتك"
        icon={TrendingUp}
      >
          <div className="space-y-4">
            {!bestPerformingCourse ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">لا توجد مبيعات مؤكدة بعد.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {bestPerformingCourse.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      الأكثر تحقيقاً للإيراد (مبيعات مؤكدة)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <Star className="h-5 w-5 fill-amber-600" />
                    <span className="text-xl font-bold">
                      {bestPerformingCourse.reviews > 0 ? bestPerformingCourse.rating.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>
            
                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">عدد المبيعات</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bestPerformingCourse.purchases}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-100">
                      <Star className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">عدد التقييمات</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bestPerformingCourse.reviews}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
      </DashboardContentCard>

      {/* Additional Stats */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <DashboardContentCard
          title="المشاهدات الأخيرة"
          icon={Users}
        >
          <div className="text-3xl font-bold text-gray-900">
            {recentPurchases}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            عدد المشتريات في آخر 7 أيام
          </p>
        </DashboardContentCard>

        <DashboardContentCard
          title="نظرة عامة"
          icon={Eye}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط المبيعات يومياً</span>
              <span className="font-semibold text-gray-900">{avgSalesPerDay}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط التقييم</span>
              <span className="font-semibold text-gray-900">{totalReviews > 0 ? avgRating.toFixed(1) : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الرضا</span>
              <span className="font-semibold text-green-600">{totalReviews > 0 ? `${satisfactionPercent}%` : "—"}</span>
            </div>
          </div>
        </DashboardContentCard>
      </div>
    </div>
  )
}

