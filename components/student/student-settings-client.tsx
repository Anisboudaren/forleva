"use client"

import { useEffect, useMemo, useState } from "react"
import { User, Loader2, Save } from "lucide-react"
import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { GradientText } from "@/components/text/gradient-text"

type UserSettings = {
  id: string
  fullName: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
}

type GetResponse = { user: UserSettings }
type PatchResponse = { user: UserSettings }

export default function StudentSettingsClient() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/student/settings", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || "فشل تحميل الإعدادات")
        }
        return (await res.json()) as GetResponse
      })
      .then((data) => {
        if (cancelled) return
        setFullName(data.user.fullName ?? "")
        setEmail(data.user.email ?? "")
        setPhone(data.user.phone ?? "")
        setWhatsapp(data.user.whatsapp ?? "")
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
    if (saving || loading) return false
    if (fullName.trim().length > 0 && fullName.trim().length < 2) return false
    if (email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return false
    if (phone.trim().length > 0 && phone.trim().length < 6) return false
    if (whatsapp.trim().length > 0 && whatsapp.trim().length < 6) return false
    return true
  }, [saving, loading, fullName, email, phone, whatsapp])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/student/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "فشل حفظ التغييرات")
      const parsed = data as PatchResponse
      setFullName(parsed.user.fullName ?? "")
      setEmail(parsed.user.email ?? "")
      setPhone(parsed.user.phone ?? "")
      setWhatsapp(parsed.user.whatsapp ?? "")
      setSuccess("تم حفظ التغييرات بنجاح")
    } catch (e: any) {
      setError(e?.message || "حدث خطأ")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          <GradientText
            text="الإعدادات"
            gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
          />
        </h1>
        <p className="text-base text-gray-600">حدّث معلومات حسابك</p>
      </div>

      <DashboardContentCard title="الملف الشخصي" description="معلوماتك الشخصية" icon={User}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
            )}
            {success && (
              <div className="rounded-lg bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">
                {success}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  placeholder="اكتب اسمك"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                {fullName.trim().length > 0 && fullName.trim().length < 2 && (
                  <p className="text-xs text-red-600 mt-1">الاسم قصير جداً</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                {email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (
                  <p className="text-xs text-red-600 mt-1">البريد غير صالح</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="مثال: 0550123456"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                {phone.trim().length > 0 && phone.trim().length < 6 && (
                  <p className="text-xs text-red-600 mt-1">رقم الهاتف غير صالح</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">واتساب</label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  type="tel"
                  placeholder="مثال: 0550123456"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                {whatsapp.trim().length > 0 && whatsapp.trim().length < 6 && (
                  <p className="text-xs text-red-600 mt-1">رقم واتساب غير صالح</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!canSave}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DashboardContentCard>

      <DashboardContentCard title="ملاحظة" description="كلمة المرور والإشعارات" icon={User}>
        <p className="text-sm text-gray-600 leading-7">
          حالياً هذه الصفحة تدعم تحديث معلوماتك الأساسية. إذا أردت، سأضيف بعد ذلك:
          تغيير كلمة المرور + تفضيلات الإشعارات.
        </p>
      </DashboardContentCard>
    </div>
  )
}

