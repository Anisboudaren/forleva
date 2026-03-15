'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Award, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const CERTIFICATE_TYPES = [
  { id: 'free', label: 'شهادة مشاركة مجانية' },
  { id: 'national', label: 'شهادة معترف بها وطنياً' },
  { id: 'international', label: 'شهادة معترف بها دولياً' },
] as const

type OrderWithCourse = {
  id: string
  status: string
  course: { id: string; title: string } | null
}

type OrderCertificateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderCertificateDialog({ open, onOpenChange }: OrderCertificateDialogProps) {
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [courseId, setCourseId] = useState('')
  const [certificateType, setCertificateType] = useState<string>(CERTIFICATE_TYPES[0].id)
  const [fullName, setFullName] = useState('')
  const [placeOfBirth, setPlaceOfBirth] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoadError(null)
    setCourseId('')
    setCertificateType(CERTIFICATE_TYPES[0].id)
    setFullName('')
    setPlaceOfBirth('')
    setDateOfBirth('')
    setNote('')
    setLoading(true)
    fetch('/api/orders', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error('يجب تسجيل الدخول')
          if (res.status === 403) throw new Error('الطلبات متاحة للطلاب فقط')
          throw new Error('فشل تحميل الدورات')
        }
        return res.json()
      })
      .then((data: OrderWithCourse[]) => {
        const list = Array.isArray(data) ? data : []
        const eligible = list.filter(
          (o) => o.course && (o.status === 'PENDING' || o.status === 'CONFIRMED')
        )
        const byCourse = new Map<string, string>()
        eligible.forEach((o) => {
          if (o.course) byCourse.set(o.course.id, o.course.title)
        })
        setCourses(Array.from(byCourse.entries()).map(([id, title]) => ({ id, title })))
        if (byCourse.size > 0 && !courseId) {
          setCourseId(Array.from(byCourse.keys())[0])
        }
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'فشل تحميل الدورات'))
      .finally(() => setLoading(false))
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Front-only: no API call for now
    setTimeout(() => {
      setSubmitting(false)
      onOpenChange(false)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            طلب شهادة
          </DialogTitle>
          <DialogDescription>
            اختر الدورة ونوع الشهادة وأدخل بياناتك. (الطلب للواجهة فقط حالياً)
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          </div>
        )}

        {loadError && !loading && (
          <p className="text-sm text-red-600 py-2" role="alert">
            {loadError}
          </p>
        )}

        {!loading && !loadError && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-sm text-gray-600 py-2">
                لا توجد دورات مسجلة أو مدفوعة. سجّل في دورة أولاً ثم عد لطلب الشهادة.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="order-cert-course">الدورة</Label>
                  <select
                    id="order-cert-course"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className={cn(
                      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                    required
                  >
                    <option value="">اختر الدورة</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order-cert-type">نوع الشهادة</Label>
                  <select
                    id="order-cert-type"
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value)}
                    className={cn(
                      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                    required
                  >
                    {CERTIFICATE_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order-cert-name">الاسم الكامل القانوني</Label>
                  <Input
                    id="order-cert-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="الاسم كما يظهر في الوثائق الرسمية"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-cert-place">مكان الولادة</Label>
                    <Input
                      id="order-cert-place"
                      value={placeOfBirth}
                      onChange={(e) => setPlaceOfBirth(e.target.value)}
                      placeholder="المدينة / الولاية"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order-cert-dob">تاريخ الولادة</Label>
                    <Input
                      id="order-cert-dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order-cert-note">ملاحظة (اختياري)</Label>
                  <textarea
                    id="order-cert-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="أي ملاحظات إضافية لطلب الشهادة"
                    rows={3}
                    className={cn(
                      'w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'placeholder:text-muted-foreground'
                    )}
                  />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || courses.length === 0}
                    className="rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال الطلب'
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}

            {courses.length === 0 && (
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  إغلاق
                </Button>
              </DialogFooter>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
