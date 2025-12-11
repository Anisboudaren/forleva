import { DashboardCard, DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { BookOpen, Clock, Award, TrendingUp, CheckCircle2, PlayCircle, Play } from "lucide-react"
import Image from "next/image"
import { GradientText } from "@/components/text/gradient-text"

export default function StudentDashboard() {
  // Mock data - replace with real data later
  const stats = {
    enrolledCourses: 8,
    completedCourses: 3,
    inProgressCourses: 5,
    certificates: 2,
    studyStreak: 12,
    totalHours: 45,
  }

  const recentCourses = [
    {
      id: 1,
      name: "مقدمة في البرمجة",
      progress: 65,
      lastAccessed: "منذ ساعتين",
      nextLesson: "الدرس 8: المصفوفات",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      name: "تصميم واجهات المستخدم",
      progress: 40,
      lastAccessed: "أمس",
      nextLesson: "الدرس 5: CSS المتقدم",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      name: "قواعد البيانات",
      progress: 90,
      lastAccessed: "منذ 3 أيام",
      nextLesson: "الدرس الأخير",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          مرحباً بك في <GradientText text="لوحة التحكم" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          تابع تقدمك في التعلم واستكشف دورات جديدة
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={BookOpen}
          title="الدورات المسجلة"
          value={stats.enrolledCourses}
          description={
            <span className="inline-flex items-center gap-1">
              {stats.inProgressCourses} قيد التنفيذ
            </span>
          }
        />
        
        <DashboardCard
          variant="green"
          icon={CheckCircle2}
          title="الدورات المكتملة"
          value={stats.completedCourses}
          description={
            <span>
              {Math.round((stats.completedCourses / stats.enrolledCourses) * 100)}% معدل الإتمام
            </span>
          }
        />
        
        <DashboardCard
          variant="yellow"
          icon={Award}
          title="الشهادات"
          value={stats.certificates}
          description="شهادات معتمدة"
        />
        
        <DashboardCard
          variant="purple"
          icon={Clock}
          title="ساعات التعلم"
          value={stats.totalHours}
          description={
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stats.studyStreak} يوم متتالي
            </span>
          }
        />
      </div>

      {/* Continue Learning */}
      <DashboardContentCard
        title={
          <>
            <GradientText text="استمر في التعلم" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </>
        }
        description="دوراتك الحالية والتقدم المحرز"
        icon={PlayCircle}
      >
          <div className="space-y-4">
            {recentCourses.map((course) => (
              <div key={course.id} className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-6 md:min-h-[180px]">
                  {/* Course Image */}
                  <div className="relative w-full md:w-56 h-32 md:h-full md:min-h-[180px] rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  
                  {/* Course Info */}
                  <div className="flex-1 flex flex-col justify-between gap-2 md:gap-3 md:py-2">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                        {course.name}
                      </h3>
                      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 md:gap-3 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          آخر وصول: {course.lastAccessed}
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="text-yellow-600 font-medium">
                          الدرس التالي: {course.nextLesson}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">التقدم</span>
                          <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Continue Button */}
                    <div className="relative inline-flex items-center justify-center w-full md:w-fit group">
                      <div className="absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:shadow-lg group-hover:shadow-yellow-500/50" />
                      <button
                        className="relative inline-flex items-center justify-center gap-2 w-full md:w-fit px-6 py-3 text-base font-semibold text-white rounded-full transition-all duration-200"
                      >
                        <Play className="h-4 w-4" />
                        <span>استمر في التعلم</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </DashboardContentCard>

      {/* Quick Actions */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <DashboardContentCard
          title="إنجازاتك"
          icon={Award}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">سلسلة التعلم</span>
              <span className="font-semibold text-gray-900">{stats.studyStreak} يوم</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الدورات المكتملة</span>
              <span className="font-semibold text-gray-900">{stats.completedCourses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الشهادات المكتسبة</span>
              <span className="font-semibold text-yellow-600">{stats.certificates}</span>
            </div>
          </div>
        </DashboardContentCard>

        <DashboardContentCard
          title="تقدمك"
          icon={TrendingUp}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">إجمالي ساعات التعلم</span>
              <span className="font-semibold text-gray-900">{stats.totalHours} ساعة</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط التقدم</span>
              <span className="font-semibold text-gray-900">
                {Math.round(
                  recentCourses.reduce((acc, c) => acc + c.progress, 0) / recentCourses.length
                )}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الدورات النشطة</span>
              <span className="font-semibold text-blue-600">{stats.inProgressCourses}</span>
            </div>
          </div>
        </DashboardContentCard>
      </div>
    </div>
  )
}

