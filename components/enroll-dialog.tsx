'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, User, Loader2, LogOut, CreditCard, Phone } from 'lucide-react'

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

type Step = 'loading' | 'login_required' | 'student_required' | 'confirm' | 'choose_payment' | 'success'

type EnrollDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: EnrollCourseInfo | null
  onEnrollSuccess?: (courseId: string) => void
}

export function EnrollDialog({ open, onOpenChange, course, onEnrollSuccess }: EnrollDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [paymentChoice, setPaymentChoice] = useState<'chargily' | 'pay_later' | null>(null)

  useEffect(() => {
    if (!open) return
    setStep('loading')
    setSession(null)
    setSubmitError(null)
    setPaymentChoice(null)
    fetch('/api/auth/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user ?? null
        setSession(user)
        if (!user) setStep('login_required')
        else if (user.role !== 'STUDENT') setStep('student_required')
        else setStep('confirm')
      })
      .catch(() => {
        setSession(null)
        setStep('login_required')
      })
  }, [open])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      handleClose(false)
      const redirect = course ? `/login?redirect=/courses/${course.id}` : '/login'
      router.push(redirect)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handlePayNow = async () => {
    if (!course) return
    setPaymentChoice('chargily')
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
      const orderId = (data as { id?: string }).id
      if (!orderId) {
        setSubmitError('فشل إنشاء الطلب. حاول مرة أخرى.')
        return
      }
      const checkoutRes = await fetch('/api/chargily/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId }),
      })
      const checkoutData = (await checkoutRes.json().catch(() => ({}))) as { checkoutUrl?: string; error?: string }
      if (checkoutRes.ok && checkoutData.checkoutUrl) {
        onEnrollSuccess?.(course.id)
        window.location.href = checkoutData.checkoutUrl
        return
      }
      setSubmitError((checkoutData as { error?: string }).error || 'تعذر فتح صفحة الدفع. جرب الدفع لاحقاً أو اختر "الدفع لاحقاً".')
    } catch {
      setSubmitError('فشل إنشاء الطلب. حاول مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayLater = async () => {
    if (!course) return
    setPaymentChoice('pay_later')
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

        {step === 'student_required' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-amber-600" />
                تسجيل الخروج مطلوب
              </DialogTitle>
              <DialogDescription>
                أنت مسجّل حالياً بحساب معلم أو مسؤول. للاشتراك في الدورة يجب تسجيل الخروج من الحساب الحالي ثم تسجيل الدخول بحساب طالب.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row gap-3 sm:justify-start">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => handleClose(false)}
                disabled={isLoggingOut}
              >
                إلغاء
              </Button>
              <Button
                className="rounded-full"
                style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري تسجيل الخروج...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </>
                )}
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
            <DialogFooter className="flex flex-row gap-3 sm:justify-start">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => handleClose(false)}
              >
                إلغاء
              </Button>
              <Button
                className="rounded-full"
                style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}
                onClick={() => setStep('choose_payment')}
              >
                اختر طريقة الدفع
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'choose_payment' && course && (
          <>
            <DialogHeader>
              <DialogTitle>اختر طريقة الدفع</DialogTitle>
              <DialogDescription>
                الدورة: {course.title} — {formatPrice(course.price)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isSubmitting}
                className="w-full flex items-start gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 text-right hover:border-amber-300 hover:bg-amber-50/30 transition-all disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              >
                <div className="rounded-full bg-amber-100 p-2 shrink-0">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">الدفع الآن (شارجيلي)</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    ادفع الآن عبر EDAHABIA أو CIB. يتم تفعيل الدورة فوراً بعد إتمام الدفع.
                  </p>
                </div>
                {isSubmitting && paymentChoice === 'chargily' && (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-600" />
                )}
              </button>
              <button
                type="button"
                onClick={handlePayLater}
                disabled={isSubmitting}
                className="w-full flex items-start gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 text-right hover:border-amber-300 hover:bg-amber-50/30 transition-all disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              >
                <div className="rounded-full bg-gray-100 p-2 shrink-0">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">الدفع لاحقاً (بريدي موب / CCP)</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    سيتواصل معك أحد من الفريق خلال 24 ساعة عبر واتساب أو مكالمة لتأكيد الطلب واستلام الدفع.
                  </p>
                </div>
                {isSubmitting && paymentChoice === 'pay_later' && (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-600" />
                )}
              </button>
            </div>
            {submitError && (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            )}
            <DialogFooter className="flex flex-row gap-3 sm:justify-start">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setStep('confirm')}
                disabled={isSubmitting}
              >
                رجوع
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
