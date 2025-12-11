import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { PlayCircle, Clock, BookOpen, Play } from "lucide-react"
import Image from "next/image"
import { GradientText } from "@/components/text/gradient-text"
import Link from "next/link"

export default function ContinueLearningPage() {
  const courses = [
    {
      id: 1,
      name: "مقدمة في البرمجة",
      nextLesson: "الدرس 8: المصفوفات",
      progress: 65,
      lastAccessed: "منذ ساعتين",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
      duration: "15 دقيقة",
      lessonNumber: 8,
      totalLessons: 24,
    },
    {
      id: 2,
      name: "تصميم واجهات المستخدم",
      nextLesson: "الدرس 5: CSS المتقدم",
      progress: 40,
      lastAccessed: "أمس",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
      duration: "20 دقيقة",
      lessonNumber: 5,
      totalLessons: 30,
    },
    {
      id: 3,
      name: "React للمحترفين",
      nextLesson: "الدرس 3: Hooks المتقدمة",
      progress: 25,
      lastAccessed: "منذ 3 أيام",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
      duration: "25 دقيقة",
      lessonNumber: 3,
      totalLessons: 32,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="استمر في التعلم" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          استكمل دوراتك وواصل رحلتك التعليمية
        </p>
      </div>

      {/* Continue Learning Courses */}
      <DashboardContentCard
        title="دوراتك النشطة"
        description="استمر من حيث توقفت"
        icon={PlayCircle}
      >
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
            >
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
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>الدرس {course.lessonNumber} من {course.totalLessons}</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Continue Button */}
                  <div className="relative inline-flex items-center justify-center w-full md:w-fit group/btn">
                    <div className="absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover/btn:shadow-lg group-hover/btn:shadow-yellow-500/50" />
                    <Link
                      href={`/courses/${course.id}/lesson/${course.lessonNumber}`}
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardContentCard title="الدورات النشطة" icon={BookOpen}>
          <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
          <p className="text-sm text-gray-600 mt-1">دورة قيد التعلم</p>
        </DashboardContentCard>
        
        <DashboardContentCard title="متوسط التقدم" icon={PlayCircle}>
          <div className="text-3xl font-bold text-gray-900">
            {Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)}%
          </div>
          <p className="text-sm text-gray-600 mt-1">من جميع الدورات</p>
        </DashboardContentCard>
        
        <DashboardContentCard title="آخر نشاط" icon={Clock}>
          <div className="text-lg font-bold text-gray-900">منذ ساعتين</div>
          <p className="text-sm text-gray-600 mt-1">آخر مرة درست فيها</p>
        </DashboardContentCard>
      </div>
    </div>
  )
}

