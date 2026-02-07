"use client"

import { useState, useEffect } from "react"
import { DashboardCard, DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { Users, BookOpen, TrendingUp, Activity, Shield, UserCog, ShoppingBag } from "lucide-react"
import { GradientText } from "@/components/text/gradient-text"
import Link from "next/link"

type Stats = {
  totalUsers: number
  studentCount: number
  teacherCount: number
  activeUsers: number
  newThisMonth: number
  totalCourses: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setStats(data)
        } else if (!cancelled) {
          setStats({
            totalUsers: 0,
            studentCount: 0,
            teacherCount: 0,
            activeUsers: 0,
            newThisMonth: 0,
            totalCourses: 0,
          })
        }
      } catch {
        if (!cancelled) setStats(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [])

  const display = (n: number) => (loading ? "—" : (stats != null ? String(n) : "—"))

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          مرحباً، <GradientText text="المسؤول" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">
          نظرة عامة على إحصائيات المنصة
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users">
          <DashboardCard
            variant="blue"
            icon={Users}
            title="إجمالي المستخدمين"
            value={display(stats?.totalUsers ?? 0)}
            description="طالب ومعلم"
          />
        </Link>
        <DashboardCard
          variant="green"
          icon={BookOpen}
          title="إجمالي الدورات"
          value={display(stats?.totalCourses ?? 0)}
          description="دورة نشطة"
        />
        <DashboardCard
          variant="yellow"
          icon={Activity}
          title="النشطون"
          value={display(stats?.activeUsers ?? 0)}
          description="مستخدم نشط"
        />
        <DashboardCard
          variant="purple"
          icon={TrendingUp}
          title="جدد هذا الشهر"
          value={display(stats?.newThisMonth ?? 0)}
          description="تسجيل جديد"
        />
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <DashboardContentCard
          title="إجراءات سريعة"
          description="الوصول السريع للصفحات الأساسية"
          icon={Shield}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
            >
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">إدارة المستخدمين</p>
                <p className="text-xs text-gray-600">عرض وتعديل المستخدمين</p>
              </div>
            </Link>
            <Link
              href="/admin/admins"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
            >
              <div className="p-2 rounded-lg bg-amber-100">
                <UserCog className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">إدارة المسؤولين</p>
                <p className="text-xs text-gray-600">عرض وإضافة المسؤولين</p>
              </div>
            </Link>
            <Link
              href="/admin/courses"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
            >
              <div className="p-2 rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">إدارة الدورات</p>
                <p className="text-xs text-gray-600">عرض وتعديل الدورات</p>
              </div>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
            >
              <div className="p-2 rounded-lg bg-amber-100">
                <ShoppingBag className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">الطلبات</p>
                <p className="text-xs text-gray-600">عرض طلبات الشراء</p>
              </div>
            </Link>
          </div>
        </DashboardContentCard>

        <DashboardContentCard
          title="نشاط النظام"
          icon={Activity}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">آخر تسجيل دخول</span>
              <span className="text-sm font-medium text-gray-900">منذ دقائق</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">حالة النظام</span>
              <span className="text-sm font-medium text-green-600">يعمل بشكل طبيعي</span>
            </div>
          </div>
        </DashboardContentCard>
      </div>
    </div>
  )
}
