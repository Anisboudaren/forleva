"use client"

import { useEffect, useRef, useState } from "react"
import { Palette, Lock, Loader2, Save, Upload, X, ImageIcon } from "lucide-react"
import { DashboardContentCard } from "@/components/dashboard/DashboardCard"
import { GradientText } from "@/components/text/gradient-text"
import { PasswordInput } from "@/components/ui/password-input"
import { runImageUpload, ImageUploadError } from "@/lib/image-upload-client"

type ImageValue = { url: string | null; key: string | null }

function ImageField({
  label,
  hint,
  value,
  onChange,
  square,
}: {
  label: string
  hint?: string
  value: ImageValue
  onChange: (next: ImageValue) => void
  square?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const result = await runImageUpload(file, { prefix: "site", name: file.name })
      onChange({ url: result.url, key: result.key })
    } catch (e) {
      setError(e instanceof ImageUploadError ? e.message : "فشل رفع الصورة")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-800">{label}</label>
      <div className="flex items-center gap-4">
        <div
          className={`relative overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300 ${
            square ? "w-16 h-16 rounded-lg" : "h-16 w-32 rounded-lg"
          }`}
        >
          {value.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt={label} className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="h-6 w-6" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {value.url ? "تغيير" : "رفع صورة"}
            </button>
            {value.url && !uploading && (
              <button
                type="button"
                onClick={() => onChange({ url: null, key: null })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
                إزالة
              </button>
            )}
          </div>
          {error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : hint ? (
            <p className="text-xs text-gray-500">{hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function AdminSettingsClient() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [siteTitle, setSiteTitle] = useState("")
  const [siteDescription, setSiteDescription] = useState("")
  const [favicon, setFavicon] = useState<ImageValue>({ url: null, key: null })
  const [logo, setLogo] = useState<ImageValue>({ url: null, key: null })
  const [ogImage, setOgImage] = useState<ImageValue>({ url: null, key: null })

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passSaving, setPassSaving] = useState(false)
  const [passError, setPassError] = useState<string | null>(null)
  const [passSuccess, setPassSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch("/api/admin/settings/site", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("فشل تحميل الإعدادات")
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setSiteTitle(data.siteTitle ?? "")
        setSiteDescription(data.siteDescription ?? "")
        setFavicon({ url: data.faviconUrl ?? null, key: data.faviconKey ?? null })
        setLogo({ url: data.logoUrl ?? null, key: data.logoKey ?? null })
        setOgImage({ url: data.ogImageUrl ?? null, key: data.ogImageKey ?? null })
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

  const saveSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          siteTitle: siteTitle.trim(),
          siteDescription: siteDescription.trim(),
          faviconUrl: favicon.url,
          faviconKey: favicon.key,
          logoUrl: logo.url,
          logoKey: logo.key,
          ogImageUrl: ogImage.url,
          ogImageKey: ogImage.key,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "فشل حفظ الإعدادات")
      setSuccess("تم حفظ إعدادات الموقع بنجاح")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ")
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passSaving) return
    setPassSaving(true)
    setPassError(null)
    setPassSuccess(null)
    try {
      const res = await fetch("/api/admin/settings/password", {
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
      setPassSuccess("تم تحديث كلمة المرور بنجاح")
    } catch (e: unknown) {
      setPassError(e instanceof Error ? e.message : "حدث خطأ")
    } finally {
      setPassSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          <GradientText text="الإعدادات" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
        </h1>
        <p className="text-sm sm:text-base text-gray-600">إعدادات لوحة الإدارة والمنصة</p>
      </div>

      <DashboardContentCard title="إعدادات الموقع و SEO" description="العنوان والوصف والشعار والأيقونة" icon={Palette}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={saveSite} className="space-y-5">
            {error && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
            {success && (
              <div className="rounded-lg bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">{success}</div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الموقع (SEO Title)</label>
                <input
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  type="text"
                  placeholder="Forleva"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف الموقع (Meta Description)</label>
                <input
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  type="text"
                  placeholder="منصة تعليمية اجتماعية للمتعلمين"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <ImageField
                label="أيقونة المتصفح (Favicon)"
                hint="تظهر في تبويب المتصفح"
                value={favicon}
                onChange={setFavicon}
                square
              />
              <ImageField
                label="شعار شريط التنقل (Logo)"
                hint="يظهر في أعلى الموقع"
                value={logo}
                onChange={setLogo}
              />
              <ImageField
                label="صورة المشاركة (OG Image)"
                hint="عند مشاركة الرابط"
                value={ogImage}
                onChange={setOgImage}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ الإعدادات
              </button>
            </div>
          </form>
        )}
      </DashboardContentCard>

      <DashboardContentCard title="الأمان" description="تغيير كلمة مرور حسابك" icon={Lock}>
        <form onSubmit={savePassword} className="space-y-4">
          {passError && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{passError}</div>}
          {passSuccess && (
            <div className="rounded-lg bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">{passSuccess}</div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="كلمة المرور الحالية"
            />
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="كلمة المرور الجديدة"
            />
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="تأكيد كلمة المرور"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passSaving || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
