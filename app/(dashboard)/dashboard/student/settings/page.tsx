import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { Settings, User, Bell, Lock, Globe, Palette } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import { PasswordInput } from "@/components/ui/password-input"

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="الإعدادات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          إدارة إعدادات حسابك وتفضيلاتك
        </p>
      </div>

      {/* Profile Settings */}
      <DashboardContentCard
        title="الملف الشخصي"
        description="معلوماتك الشخصية وإعدادات الحساب"
        icon={User}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">المستخدم</h3>
              <p className="text-sm text-gray-600">user@example.com</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              تغيير الصورة
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
              <input
                type="text"
                defaultValue="المستخدم"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                defaultValue="user@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                placeholder="+966 50 123 4567"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البلد</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                <option>السعودية</option>
                <option>الإمارات</option>
                <option>مصر</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200">
              حفظ التغييرات
            </button>
          </div>
        </div>
      </DashboardContentCard>

      {/* Notification Settings */}
      <DashboardContentCard
        title="الإشعارات"
        description="إدارة تفضيلات الإشعارات"
        icon={Bell}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">إشعارات البريد الإلكتروني</h3>
              <p className="text-xs text-gray-600">تلقي تحديثات عبر البريد الإلكتروني</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">إشعارات الدروس الجديدة</h3>
              <p className="text-xs text-gray-600">إشعار عند إضافة دروس جديدة للدورات المسجلة</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">إشعارات الإنجازات</h3>
              <p className="text-xs text-gray-600">إشعار عند إكمال دورة أو الحصول على شهادة</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
        </div>
      </DashboardContentCard>

      {/* Security Settings */}
      <DashboardContentCard
        title="الأمان"
        description="إدارة كلمة المرور والأمان"
        icon={Lock}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
            <PasswordInput
              className="w-full px-4 py-2.5 h-auto border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
            <PasswordInput
              className="w-full px-4 py-2.5 h-auto border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
            <PasswordInput
              className="w-full px-4 py-2.5 h-auto border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200">
              تحديث كلمة المرور
            </button>
          </div>
        </div>
      </DashboardContentCard>
    </div>
  )
}

