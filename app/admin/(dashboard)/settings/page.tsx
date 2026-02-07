import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { Settings, Bell, Shield, Palette } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText text="الإعدادات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          إعدادات لوحة الإدارة والمنصة
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardContentCard
          title="إعدادات الموقع"
          icon={Palette}
        >
          <p className="text-gray-600 text-sm">
            إعدادات عامة للموقع والشعار والعنوان
          </p>
        </DashboardContentCard>
        <DashboardContentCard
          title="الإشعارات"
          icon={Bell}
        >
          <p className="text-gray-600 text-sm">
            إعدادات الإشعارات والبريد الإلكتروني
          </p>
        </DashboardContentCard>
        <DashboardContentCard
          title="الأمان"
          icon={Shield}
        >
          <p className="text-gray-600 text-sm">
            إعدادات الأمان وتشفير البيانات
          </p>
        </DashboardContentCard>
      </div>
    </div>
  )
}
