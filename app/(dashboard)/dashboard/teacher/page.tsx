import { DashboardCard, DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { TrendingUp, Users, BookOpen, Star, ShoppingBag, Eye } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"

export default function TeacherDashboard() {
  // Mock data - replace with real data later
  const stats = {
    totalCourses: 24,
    totalPurchases: 1247,
    totalReviews: 892,
    avgRating: 4.8,
    bestPerformingCourse: {
      name: "مقدمة في البرمجة",
      purchases: 342,
      reviews: 156,
      rating: 4.9,
    },
    recentPurchases: 127,
    totalRevenue: 62470,
  }

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
          value={stats.totalCourses}
          description={
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% من الشهر الماضي
            </span>
          }
        />
        
        <DashboardCard
          variant="green"
          icon={ShoppingBag}
          title="إجمالي المبيعات"
          value={stats.totalPurchases.toLocaleString()}
          description={
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +23% من الشهر الماضي
            </span>
          }
        />
        
        <DashboardCard
          variant="yellow"
          icon={Star}
          title="إجمالي التقييمات"
          value={stats.totalReviews.toLocaleString()}
          description={`متوسط التقييم: ${stats.avgRating}`}
        />
        
        <DashboardCard
          variant="purple"
          icon={TrendingUp}
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toLocaleString()} ر.س`}
          description={
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18% من الشهر الماضي
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.bestPerformingCourse.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  أكثر دورة تحظى بشعبية بين طلابك
                </p>
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <Star className="h-5 w-5 fill-amber-600" />
                <span className="text-xl font-bold">{stats.bestPerformingCourse.rating}</span>
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
                    {stats.bestPerformingCourse.purchases}
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
                    {stats.bestPerformingCourse.reviews}
                  </p>
                </div>
              </div>
            </div>
          </div>
      </DashboardContentCard>

      {/* Additional Stats */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <DashboardContentCard
          title="المشاهدات الأخيرة"
          icon={Users}
        >
          <div className="text-3xl font-bold text-gray-900">
            {stats.recentPurchases}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            عدد المشتريات في آخر 30 يوماً
          </p>
        </DashboardContentCard>

        <DashboardContentCard
          title="نظرة عامة"
          icon={Eye}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط المبيعات يومياً</span>
              <span className="font-semibold text-gray-900">42</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">نسبة الإتمام</span>
              <span className="font-semibold text-gray-900">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الرضا</span>
              <span className="font-semibold text-green-600">94%</span>
            </div>
          </div>
        </DashboardContentCard>
      </div>
    </div>
  )
}

