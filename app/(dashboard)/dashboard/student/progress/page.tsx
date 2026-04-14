import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { TrendingUp, BookOpen, Clock, Target, Award, Calendar } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"

const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

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

export default async function ProgressPage() {
  const session = await getUserSession()

  if (!session || session.role !== "STUDENT") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-900">هذه الصفحة متاحة للطلاب فقط</p>
        <p className="text-sm text-gray-600">يرجى تسجيل الدخول بحساب طالب لعرض تقدمك.</p>
      </div>
    )
  }

  const confirmedOrders = await prisma.order.findMany({
    where: { userId: session.userId, status: "CONFIRMED" },
    select: { courseId: true },
  })
  const courseIds = Array.from(new Set(confirmedOrders.map((o) => o.courseId)))

  const [courses, progressRows] = await Promise.all([
    prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: {
        id: true,
        title: true,
        sections: {
          orderBy: { position: "asc" },
          select: {
            items: {
              orderBy: { position: "asc" },
              select: { id: true, duration: true },
            },
          },
        },
      },
    }),
    prisma.courseItemProgress.findMany({
      where: { userId: session.userId, courseId: { in: courseIds } },
      select: { courseId: true, itemId: true, completedAt: true, lastViewedAt: true, updatedAt: true },
    }),
  ])

  const completedByCourse = new Map<string, Set<string>>()
  const activityDayKeys = new Set<string>()
  for (const p of progressRows) {
    const t = p.lastViewedAt ?? p.completedAt ?? p.updatedAt
    activityDayKeys.add(dayKey(t))
    if (p.completedAt) {
      const set = completedByCourse.get(p.courseId) ?? new Set<string>()
      set.add(p.itemId)
      completedByCourse.set(p.courseId, set)
    }
  }

  const courseProgress = courses.map((c) => {
    const flatItems = c.sections.flatMap((s) => s.items)
    const totalItems = flatItems.length
    const completedSet = completedByCourse.get(c.id) ?? new Set<string>()
    const completedItems = completedSet.size
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    const minutes = flatItems
      .filter((i) => completedSet.has(i.id))
      .reduce((acc, i) => acc + parseDurationToMinutes(i.duration), 0)
    const hours = Math.round(minutes / 60)
    return { name: c.title, progress, hours, totalItems, completedItems }
  })

  const totals = courseProgress.reduce(
    (acc, c) => {
      acc.totalItems += c.totalItems
      acc.completedItems += c.completedItems
      acc.totalHours += c.hours
      return acc
    },
    { totalItems: 0, completedItems: 0, totalHours: 0 }
  )

  const overallProgress =
    totals.totalItems > 0 ? Math.round((totals.completedItems / totals.totalItems) * 100) : 0
  const enrolledCourses = courseIds.length
  const completedCourses = courseProgress.filter((c) => c.totalItems > 0 && c.completedItems === c.totalItems).length
  const certificates = 0
  const studyStreak = computeStreak(activityDayKeys)

  const progressData = {
    overallProgress,
    totalHours: totals.totalHours,
    studyStreak,
    completedCourses,
    enrolledCourses,
    certificates,
  }

  // Weekly progress: last 7 days (including today), hours/lessons from completed items
  const today = new Date()
  const keys: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    keys.push(dayKey(d))
  }
  const daily = new Map<string, { minutes: number; lessons: number }>()
  for (const k of keys) daily.set(k, { minutes: 0, lessons: 0 })

  const completedRows = progressRows.filter((p) => p.completedAt)
  if (completedRows.length > 0) {
    const itemIds = Array.from(new Set(completedRows.map((r) => r.itemId)))
    const items = await prisma.courseSectionItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, duration: true },
    })
    const durMap = new Map(items.map((i) => [i.id, parseDurationToMinutes(i.duration)]))
    for (const r of completedRows) {
      const k = dayKey(r.completedAt as Date)
      const bucket = daily.get(k)
      if (!bucket) continue
      bucket.lessons += 1
      bucket.minutes += durMap.get(r.itemId) ?? 0
    }
  }

  const weeklyProgress = keys.map((k) => {
    const d = new Date(k + "T00:00:00")
    const b = daily.get(k) ?? { minutes: 0, lessons: 0 }
    return {
      day: DAYS_AR[d.getDay()] ?? "",
      hours: Math.round((b.minutes / 60) * 10) / 10,
      lessons: b.lessons,
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="التقدم" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          تابع تقدمك في التعلم وإحصائياتك التفصيلية
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardContentCard title="التقدم الإجمالي" icon={TrendingUp}>
          <div className="text-3xl font-bold text-gray-900">{progressData.overallProgress}%</div>
          <p className="text-sm text-gray-600 mt-1">من جميع الدورات</p>
        </DashboardContentCard>
        
        <DashboardContentCard title="ساعات التعلم" icon={Clock}>
          <div className="text-3xl font-bold text-gray-900">{progressData.totalHours}</div>
          <p className="text-sm text-gray-600 mt-1">ساعة إجمالية</p>
        </DashboardContentCard>
        
        <DashboardContentCard title="سلسلة التعلم" icon={Target}>
          <div className="text-3xl font-bold text-gray-900">{progressData.studyStreak}</div>
          <p className="text-sm text-gray-600 mt-1">يوم متتالي</p>
        </DashboardContentCard>
        
        <DashboardContentCard title="الشهادات" icon={Award}>
          <div className="text-3xl font-bold text-gray-900">{progressData.certificates}</div>
          <p className="text-sm text-gray-600 mt-1">شهادة مكتسبة</p>
        </DashboardContentCard>
      </div>

      {/* Weekly Progress */}
      <DashboardContentCard
        title="التقدم الأسبوعي"
        description="ساعات التعلم والدروس المكتملة هذا الأسبوع"
        icon={Calendar}
      >
        <div className="w-full overflow-x-auto">
          <div className="relative h-64 md:h-80 w-full min-w-[600px] md:min-w-0 px-2 md:px-4 pb-12 md:pb-12">
            <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="80"
                  y1={60 + i * 70}
                  x2="920"
                  y2={60 + i * 70}
                  stroke="#e5e7eb"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                />
              ))}
              
              {/* Y-axis labels */}
              {[4, 3, 2, 1, 0].map((val, i) => (
                <text
                  key={val}
                  x="70"
                  y={60 + i * 70 + 5}
                  textAnchor="end"
                  className="text-xs md:text-sm fill-gray-500 font-medium"
                  fontSize="12"
                >
                  {val}س
                </text>
              ))}
              
              {/* Calculate points */}
              {(() => {
                const maxHours = Math.max(...weeklyProgress.map(d => d.hours), 1)
                const points = weeklyProgress.map((day, i) => {
                  const x = 80 + (i * 140)
                  const y = 60 + ((maxHours - day.hours) / maxHours) * 280
                  return { x, y, hours: day.hours }
                })
                
                // Create area path
                const areaPath = `M ${points[0].x},${points[0].y} ${points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')} L ${points[points.length - 1].x},340 L ${points[0].x},340 Z`
                
                // Create line path
                const linePath = `M ${points[0].x},${points[0].y} ${points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')}`
                
                return (
                  <>
                    {/* Area under curve */}
                    <path
                      d={areaPath}
                      fill="url(#lineGradient)"
                    />
                    
                    {/* Line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="md:stroke-[4]"
                    />
                    
                    {/* Data points */}
                    {points.map((point, i) => (
                      <g key={i}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="6"
                          fill="#fbbf24"
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer md:r-[8] md:stroke-[3]"
                        />
                        <text
                          x={point.x}
                          y={point.y - 15}
                          textAnchor="middle"
                          className="text-xs md:text-sm font-bold fill-gray-900"
                          fontSize="11"
                        >
                          {point.hours}س
                        </text>
                      </g>
                    ))}
                  </>
                )
              })()}
            </svg>
            
            {/* Day labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 md:px-16">
              {weeklyProgress.map((day, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-700">{day.day}</span>
                  <span className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{day.lessons} درس</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>ساعات التعلم</span>
            </div>
          </div>
        </div>
      </DashboardContentCard>

      {/* Course Progress */}
      <DashboardContentCard
        title="تقدم الدورات"
        description="التقدم التفصيلي لكل دورة"
        icon={BookOpen}
      >
        <div className="space-y-4">
          {courseProgress.map((course, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{course.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.hours} ساعة
                    </span>
                    <span>{course.progress}% مكتمل</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 ml-4">{course.progress}%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-500",
                    course.progress === 100
                      ? "bg-gradient-to-r from-green-400 to-green-600"
                      : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"
                  )}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </DashboardContentCard>
    </div>
  )
}

