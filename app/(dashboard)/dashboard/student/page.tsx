import { DashboardCard, DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { BookOpen, Clock, Award, TrendingUp, CheckCircle2, PlayCircle, Play } from "lucide-react"
import Image from "next/image"
import { GradientText } from "@/components/text/gradient-text"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"
import { formatRelativeAr } from "@/lib/format-date"

function parseDurationToMinutes(duration: string | null | undefined): number {
  if (!duration) return 0
  const m = duration.match(/(\d+)/)
  const n = m ? Number(m[1]) : 0
  if (!Number.isFinite(n) || n <= 0) return 0
  if (duration.includes("ساعة") || duration.includes("ساع")) return n * 60
  if (duration.includes("دقيقة") || duration.includes("دق")) return n
  return 0
}

function dayKey(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function computeStreak(activityKeys: Set<string>) {
  let streak = 0
  const cur = new Date()
  for (;;) {
    const key = dayKey(cur)
    if (!activityKeys.has(key)) break
    streak += 1
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

export default async function StudentDashboard() {
  const session = await getUserSession()

  if (!session || session.role !== "STUDENT") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للطلاب فقط</p>
        <p className="text-sm text-gray-600">يرجى تسجيل الدخول بحساب طالب لعرض لوحة التحكم.</p>
      </div>
    )
  }

  const confirmedOrders = await prisma.order.findMany({
    where: { userId: session.userId, status: "CONFIRMED" },
    select: { courseId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  const courseIds = Array.from(new Set(confirmedOrders.map((o) => o.courseId)))

  const [courses, progressRows] = await Promise.all([
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: {
        id: true,
        title: true,
        category: true,
        imageUrl: true,
        teacher: { select: { fullName: true } },
        sections: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            position: true,
            title: true,
            items: {
              orderBy: { position: "asc" },
              select: { id: true, title: true, duration: true, type: true, position: true },
            },
          },
        },
      },
    }),
    prisma.courseItemProgress.findMany({
      where: { userId: session.userId, courseId: { in: courseIds } },
      select: {
        courseId: true,
        itemId: true,
        lastViewedAt: true,
        completedAt: true,
        updatedAt: true,
      },
    }),
  ])

  const completedByCourse = new Map<string, Set<string>>()
  const lastActivityByCourse = new Map<string, Date>()
  const activityDayKeys = new Set<string>()

  for (const p of progressRows) {
    const t = p.lastViewedAt ?? p.completedAt ?? p.updatedAt
    activityDayKeys.add(dayKey(t))
    const prev = lastActivityByCourse.get(p.courseId)
    if (!prev || t.getTime() > prev.getTime()) lastActivityByCourse.set(p.courseId, t)
    if (p.completedAt) {
      const set = completedByCourse.get(p.courseId) ?? new Set<string>()
      set.add(p.itemId)
      completedByCourse.set(p.courseId, set)
    }
  }

  const recentCourses = courses
    .map((c) => {
      const flatItems = c.sections.flatMap((s) => s.items)
      const totalItems = flatItems.length
      const completedSet = completedByCourse.get(c.id) ?? new Set<string>()
      const completedItems = completedSet.size
      const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      const nextItem = flatItems.find((i) => !completedSet.has(i.id))
      const lastAt = lastActivityByCourse.get(c.id) ?? null
      return {
        id: c.id,
        name: c.title,
        progress: progressPct,
        lastAccessed: lastAt ? formatRelativeAr(lastAt) : "لم تبدأ بعد",
        nextLesson: nextItem ? nextItem.title : "مكتملة",
        image:
          c.imageUrl ||
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
        totalItems,
        completedItems,
        completed: totalItems > 0 && completedItems === totalItems,
        inProgress: completedItems > 0 && completedItems < totalItems,
        completedMinutes: flatItems
          .filter((i) => completedSet.has(i.id))
          .reduce((acc, i) => acc + parseDurationToMinutes(i.duration), 0),
      }
    })
    .sort((a, b) => {
      const aHas = a.lastAccessed !== "لم تبدأ بعد"
      const bHas = b.lastAccessed !== "لم تبدأ بعد"
      if (aHas && !bHas) return -1
      if (!aHas && bHas) return 1
      const aT = lastActivityByCourse.get(a.id)?.getTime() ?? 0
      const bT = lastActivityByCourse.get(b.id)?.getTime() ?? 0
      return bT - aT
    })

  const enrolledCourses = courseIds.length
  const completedCourses = recentCourses.filter((c) => c.completed).length
  const inProgressCourses = recentCourses.filter((c) => c.inProgress).length
  const certificates = 0
  const totalMinutes = recentCourses.reduce((acc, c) => acc + c.completedMinutes, 0)
  const totalHours = Math.round(totalMinutes / 60)
  const studyStreak = computeStreak(activityDayKeys)

  const stats = {
    enrolledCourses,
    completedCourses,
    inProgressCourses,
    certificates,
    studyStreak,
    totalHours,
  }

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
              {stats.enrolledCourses > 0
                ? `${Math.round((stats.completedCourses / stats.enrolledCourses) * 100)}% معدل الإتمام`
                : "—"}
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
            {recentCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">لا توجد دورات مؤكدة بعد.</p>
                <p className="text-xs text-gray-500 mt-1">عند تأكيد اشتراكك ستظهر الدورات هنا.</p>
              </div>
            ) : recentCourses.map((course) => (
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
                      <Link
                        href={`/dashboard/student/learning/${course.id}`}
                        className="relative inline-flex items-center justify-center gap-2 w-full md:w-fit px-6 py-3 text-base font-semibold text-white rounded-full transition-all duration-200"
                      >
                        <Play className="h-4 w-4" />
                        <span>استمر في التعلم</span>
                      </Link>
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
                {recentCourses.length > 0
                  ? `${Math.round(
                      recentCourses.reduce((acc, c) => acc + c.progress, 0) / recentCourses.length
                    )}%`
                  : "—"}
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

