import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { BookOpen, Clock, Play, CheckCircle2, Filter, Search } from "lucide-react"
import Image from "next/image"
import { GradientText } from "@/components/text/gradient-text"
import Link from "next/link"

export default function MyCoursesPage() {
  const courses = [
    {
      id: 1,
      name: "مقدمة في البرمجة",
      instructor: "ياسين بومدين",
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      lastAccessed: "منذ ساعتين",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
      status: "in-progress",
      category: "برمجة",
    },
    {
      id: 2,
      name: "تصميم واجهات المستخدم",
      instructor: "ليلى زروقي",
      progress: 40,
      totalLessons: 30,
      completedLessons: 12,
      lastAccessed: "أمس",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
      status: "in-progress",
      category: "تصميم",
    },
    {
      id: 3,
      name: "قواعد البيانات",
      instructor: "أميرة بن عودة",
      progress: 100,
      totalLessons: 20,
      completedLessons: 20,
      lastAccessed: "منذ 3 أيام",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
      status: "completed",
      category: "برمجة",
    },
    {
      id: 4,
      name: "React للمحترفين",
      instructor: "ياسين بومدين",
      progress: 25,
      totalLessons: 32,
      completedLessons: 8,
      lastAccessed: "منذ أسبوع",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
      status: "in-progress",
      category: "برمجة",
    },
    {
      id: 5,
      name: "التسويق الرقمي",
      instructor: "عمر بلقاسم",
      progress: 100,
      totalLessons: 18,
      completedLessons: 18,
      lastAccessed: "منذ أسبوعين",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      status: "completed",
      category: "تسويق",
    },
    {
      id: 6,
      name: "Node.js للمحترفين",
      instructor: "أميرة بن عودة",
      progress: 0,
      totalLessons: 28,
      completedLessons: 0,
      lastAccessed: "لم تبدأ بعد",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
      status: "not-started",
      category: "برمجة",
    },
  ]

  const inProgressCourses = courses.filter(c => c.status === "in-progress")
  const completedCourses = courses.filter(c => c.status === "completed")
  const notStartedCourses = courses.filter(c => c.status === "not-started")

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="دوراتي" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          إدارة ومتابعة جميع دوراتك المسجلة
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            الكل ({courses.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            قيد التنفيذ ({inProgressCourses.length})
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            مكتملة ({completedCourses.length})
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن دورة..."
            className="w-full sm:w-64 pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <DashboardContentCard
          title="قيد التنفيذ"
          description={`${inProgressCourses.length} دورة قيد التعلم`}
          icon={Play}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">التقدم</span>
                        <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.completedLessons}/{course.totalLessons} دروس
                      </span>
                      <span>{course.lastAccessed}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardContentCard>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <DashboardContentCard
          title="مكتملة"
          description={`${completedCourses.length} دورة مكتملة`}
          icon={CheckCircle2}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                      <div className="bg-green-500 text-white rounded-full p-3">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">التقدم</span>
                        <span className="text-sm font-bold text-green-600">100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full w-full" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        {course.totalLessons} درس مكتمل
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardContentCard>
      )}

      {/* Not Started Courses */}
      {notStartedCourses.length > 0 && (
        <DashboardContentCard
          title="لم تبدأ بعد"
          description={`${notStartedCourses.length} دورة جاهزة للبدء`}
          icon={BookOpen}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notStartedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group relative overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">التقدم</span>
                        <span className="text-sm font-bold text-gray-400">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-300 h-2 rounded-full w-0" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.totalLessons} درس
                      </span>
                      <span className="text-yellow-600 font-medium">ابدأ الآن</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </DashboardContentCard>
      )}
    </div>
  )
}

