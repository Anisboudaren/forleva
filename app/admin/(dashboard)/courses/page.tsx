import { DashboardContentCard, DashboardCard } from "@/components/dashboard/DashboardCard"
import { BookOpen, Plus } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"

export default function AdminCoursesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText text="الدورات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          إدارة جميع دورات المنصة
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          variant="blue"
          icon={BookOpen}
          title="إجمالي الدورات"
          value={89}
          description="دورة نشطة"
        />
      </div>

      <DashboardContentCard
        title="قائمة الدورات"
        description="سيتم إضافة جدول الدورات قريباً"
        icon={BookOpen}
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-amber-100 mb-4">
            <BookOpen className="h-12 w-12 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">إدارة الدورات</h3>
          <p className="text-gray-600 max-w-sm mb-4">
            هذه الصفحة ستضم جدولاً لإدارة الدورات مع إمكانية التعديل والحذف
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors">
            <Plus className="h-4 w-4" />
            إضافة دورة
          </button>
        </div>
      </DashboardContentCard>
    </div>
  )
}
