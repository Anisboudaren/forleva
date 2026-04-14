"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Save, User, Bell, Lock } from "lucide-react"
import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { GradientText } from "@/components/text/gradient-text"
import { PasswordInput } from "@/components/ui/password-input"

type NotificationPrefs = {
  emailNotifications: boolean
  newLessons: boolean
  achievements: boolean
}

type SettingsResponse = {
  user: {
    fullName: string | null
    email: string | null
    phone: string | null
    whatsapp: string | null
    notificationPrefs: NotificationPrefs
  }
}

const DEFAULT_PREFS: NotificationPrefs = {
  emailNotifications: true,
  newLessons: true,
  achievements: true,
}

export default function TeacherSettingsClient() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passSaving, setPassSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch("/api/teacher/settings", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || "فشل تحميل الإعدادات")
        }
        return (await res.json()) as SettingsResponse
      })
      .then((data) => {
        if (cancelled) return
        setFullName(data.user.fullName ?? "")
        setEmail(data.user.email ?? "")
        setPhone(data.user.phone ?? "")
        setWhatsapp(data.user.whatsapp ?? "")
        setPrefs(data.user.notificationPrefs ?? DEFAULT_PREFS)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "حدث خطأ")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const canSave = useMemo(() => {
    if (loading || saving) return false
    if (fullName.trim().length > 0 && fullName.trim().length < 2) return false
    if (email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return false
    if (phone.trim().length > 0 && phone.trim().length < 6) return false
    if (whatsapp.trim().length > 0 && whatsapp.trim().length < 6) return false
    return true
  }, [loading, saving, fullName, email, phone, whatsapp])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/teacher/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          notificationPrefs: prefs,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "فشل حفظ التغييرات")
      setSuccess("تم حفظ الإعدادات بنجاح")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ")
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passSaving) return
    setPassSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/teacher/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "فشل تحديث كلمة المرور")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess("تم تحديث كلمة المرور بنجاح")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ")
    } finally {
      setPassSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText text="الإعدادات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-base text-gray-600">إدارة إعدادات حسابك وتفضيلاتك</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
      {success && <div className="rounded-lg bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">{success}</div>}

      <DashboardContentCard title="الملف الشخصي" description="معلوماتك الشخصية وإعدادات الحساب" icon={User}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="البريد الإلكتروني" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="رقم الهاتف" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} type="tel" placeholder="رقم واتساب" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg" />
            </div>
            <div className="flex justify-end">
              <button disabled={!canSave} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ التغييرات
              </button>
            </div>
          </form>
        )}
      </DashboardContentCard>

      <DashboardContentCard title="الإشعارات" description="إدارة تفضيلات الإشعارات" icon={Bell}>
        <div className="space-y-3">
          {[
            ["emailNotifications", "إشعارات البريد الإلكتروني"],
            ["newLessons", "إشعارات الدروس الجديدة"],
            ["achievements", "إشعارات الإنجازات"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-800">{label}</span>
              <input
                type="checkbox"
                checked={Boolean(prefs[key as keyof NotificationPrefs])}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
            </label>
          ))}
        </div>
      </DashboardContentCard>

      <DashboardContentCard title="الأمان" description="إدارة كلمة المرور والأمان" icon={Lock}>
        <form onSubmit={savePassword} className="space-y-4">
          <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="كلمة المرور الحالية" />
          <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة" />
          <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور" />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passSaving || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg disabled:opacity-50"
            >
              {passSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              تحديث كلمة المرور
            </button>
          </div>
        </form>
      </DashboardContentCard>
    </div>
  )
}
