import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { TrendingUp, BookOpen, Clock, Target, Award, Calendar } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import { cn } from "@/lib/utils"

export default function ProgressPage() {
  const progressData = {
    overallProgress: 68,
    totalHours: 145,
    studyStreak: 12,
    completedCourses: 5,
    enrolledCourses: 8,
    certificates: 2,
  }

  const weeklyProgress = [
    { day: "السبت", hours: 3, lessons: 5 },
    { day: "الأحد", hours: 2, lessons: 3 },
    { day: "الإثنين", hours: 4, lessons: 7 },
    { day: "الثلاثاء", hours: 1, lessons: 2 },
    { day: "الأربعاء", hours: 3, lessons: 4 },
    { day: "الخميس", hours: 2, lessons: 3 },
    { day: "الجمعة", hours: 0, lessons: 0 },
  ]

  const courseProgress = [
    { name: "مقدمة في البرمجة", progress: 65, hours: 12 },
    { name: "تصميم واجهات المستخدم", progress: 40, hours: 8 },
    { name: "React للمحترفين", progress: 25, hours: 5 },
    { name: "قواعد البيانات", progress: 100, hours: 20 },
  ]

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

