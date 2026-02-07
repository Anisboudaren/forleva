'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, User, Loader2 } from 'lucide-react'

type Session = { userId: string; role: string; email: string | null }

export type EnrollCourseInfo = {
  id: string
  title: string
  price: number
}

function formatPrice(price: number) {
  return `${price.toLocaleString()} د.ج`
}

const ENROLLED_COURSES_KEY = 'forleva_enrolled_course_ids'

export function getEnrolledCourseIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ENROLLED_COURSES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function addEnrolledCourseId(courseId: string): void {
  if (typeof window === 'undefined') return
  const ids = getEnrolledCourseIds()
  if (ids.includes(courseId)) return
  localStorage.setItem(ENROLLED_COURSES_KEY, JSON.stringify([...ids, courseId]))
}

type Step = 'loading' | 'login_required' | 'confirm' | 'success'

type EnrollDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: EnrollCourseInfo | null
  onEnrollSuccess?: (courseId: string) => void
}

export function EnrollDialog({ open, onOpenChange, course, onEnrollSuccess }: EnrollDialogProps) {
  const [step, setStep] = useState<Step>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setStep('loading')
    setSession(null)
    setSubmitError(null)
    fetch('/api/auth/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user ?? null
        setSession(user)
        setStep(user ? 'confirm' : 'login_required')
      })
      .catch(() => {
        setSession(null)
        setStep('login_required')
      })
  }, [open])

  const handleConfirmEnroll = async () => {
    if (!course) return
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError((data.error as string) || 'فشل إنشاء الطلب. حاول مرة أخرى.')
        return
      }
      addEnrolledCourseId(course.id)
      onEnrollSuccess?.(course.id)
      setStep('success')
    } catch {
      setSubmitError('فشل إنشاء الطلب. حاول مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset to loading so next open refetches session
      setTimeout(() => setStep('loading'), 200)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md"
        dir="rtl"
      >
        {step === 'loading' && (
          <>
            <DialogHeader>
              <DialogTitle>جاري التحميل...</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
          </>
        )}

        {step === 'login_required' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                تسجيل الدخول أو إنشاء حساب
              </DialogTitle>
              <DialogDescription>
                يرجى تسجيل الدخول أو إنشاء حساب للمتابعة والاشتراك في الدورة.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row gap-3 sm:justify-start">
              <Button asChild variant="outline" className="rounded-full">
                <Link href={course ? `/signup?redirect=/courses/${course.id}` : '/signup'}>
                  إنشاء حساب
                </Link>
              </Button>
              <Button asChild className="rounded-full" style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}>
                <Link href={course ? `/login?redirect=/courses/${course.id}` : '/login'}>
                  تسجيل الدخول
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && course && (
          <>
            <DialogHeader>
              <DialogTitle>تأكيد الاشتراك</DialogTitle>
              <DialogDescription>
                أنت على وشك الاشتراك في الدورة التالية:
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-right">
              <p className="font-bold text-gray-900">{course.title}</p>
              <p className="mt-1 text-lg font-black text-amber-600">{formatPrice(course.price)}</p>
            </div>
            <p className="text-sm text-gray-600">
              هل أنت متأكد من رغبتك في الاشتراك؟
            </p>
            {submitError && (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            )}
            <DialogFooter className="flex flex-row gap-3 sm:justify-start">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                className="rounded-full"
                style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}
                onClick={handleConfirmEnroll}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'نعم، أريد الاشتراك'
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center">تم تقديم طلبك بنجاح</DialogTitle>
              <DialogDescription className="text-center text-base">
                سيتواصل معك فريقنا خلال 24 ساعة عبر واتساب أو مكالمة لتأكيد طلبك واستلام الدفع.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                className="rounded-full"
                style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}
                onClick={() => handleClose(false)}
              >
                حسناً
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
