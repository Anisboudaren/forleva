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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckCircle2,
  User,
  Loader2,
  LogOut,
  CreditCard,
  Truck,
  LogIn,
  UserPlus,
  Zap,
} from 'lucide-react'
import { COD_DELIVERY_FEE_DA } from '@/lib/order-constants'
import type { PaymentMethod } from '@/lib/schema-enums'

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

type Step =
  | 'loading'
  | 'choose_path'
  | 'student_required'
  | 'confirm'
  | 'guest_form'
  | 'choose_payment'
  | 'success'

type EnrollDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: EnrollCourseInfo | null
  onEnrollSuccess?: (courseId: string) => void
}

const GRADIENT = 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'

export function EnrollDialog({ open, onOpenChange, course, onEnrollSuccess }: EnrollDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [paymentChoice, setPaymentChoice] = useState<PaymentMethod | null>(null)
  const [guestFullName, setGuestFullName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [isGuestCheckout, setIsGuestCheckout] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep('loading')
    setSession(null)
    setSubmitError(null)
    setPaymentChoice(null)
    setGuestFullName('')
    setGuestPhone('')
    setIsGuestCheckout(false)
    fetch('/api/auth/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user ?? null
        setSession(user)
        if (!user) setStep('choose_path')
        else if (user.role !== 'STUDENT') setStep('student_required')
        else setStep('confirm')
      })
      .catch(() => {
        setSession(null)
        setStep('choose_path')
      })
  }, [open])

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => setStep('loading'), 200)
    }
    onOpenChange(isOpen)
  }

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

  const createOrder = async (paymentMethod: PaymentMethod) => {
    if (!course) return null

    const body: Record<string, string> = {
      courseId: course.id,
      paymentMethod,
    }

    if (isGuestCheckout) {
      body.guestFullName = guestFullName.trim()
      body.guestPhone = guestPhone.trim()
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setSubmitError((data.error as string) || 'فشل إنشاء الطلب. حاول مرة أخرى.')
      return null
    }
    return data as { id?: string; checkoutToken?: string }
  }

  const handleChargilyPay = async () => {
    if (!course) return
    if (isGuestCheckout && (!guestFullName.trim() || !guestPhone.trim())) {
      setSubmitError('الاسم ورقم الهاتف مطلوبان')
      return
    }

    setPaymentChoice('CHARGILY')
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const order = await createOrder('CHARGILY')
      if (!order?.id) return

      const checkoutBody: Record<string, string> = { orderId: order.id }
      if (isGuestCheckout && order.checkoutToken) {
        checkoutBody.checkoutToken = order.checkoutToken
      }

      const checkoutRes = await fetch('/api/chargily/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(checkoutBody),
      })
      const checkoutData = (await checkoutRes.json().catch(() => ({}))) as {
        checkoutUrl?: string
        error?: string
      }
      if (checkoutRes.ok && checkoutData.checkoutUrl) {
        onEnrollSuccess?.(course.id)
        window.location.href = checkoutData.checkoutUrl
        return
      }
      setSubmitError(
        checkoutData.error || 'تعذر فتح صفحة الدفع. جرّب الدفع عند الاستلام.'
      )
    } catch {
      setSubmitError('فشل إنشاء الطلب. حاول مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCodPay = async () => {
    if (!course) return
    if (isGuestCheckout && (!guestFullName.trim() || !guestPhone.trim())) {
      setSubmitError('الاسم ورقم الهاتف مطلوبان')
      return
    }

    setPaymentChoice('CASH_ON_DELIVERY')
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const order = await createOrder('CASH_ON_DELIVERY')
      if (!order?.id) return
      addEnrolledCourseId(course.id)
      onEnrollSuccess?.(course.id)
      setStep('success')
    } catch {
      setSubmitError('فشل إنشاء الطلب. حاول مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startGuestCheckout = () => {
    setIsGuestCheckout(true)
    setStep('guest_form')
  }

  const goToPayment = () => {
    if (isGuestCheckout) {
      if (!guestFullName.trim() || !guestPhone.trim()) {
        setSubmitError('الاسم ورقم الهاتف مطلوبان')
        return
      }
      setSubmitError(null)
    }
    setStep('choose_payment')
  }

  const codTotal = course ? course.price + COD_DELIVERY_FEE_DA : 0
  const chargilyTotal = course?.price ?? 0

  const paymentCards = course && (
    <>
      <button
        type="button"
        onClick={handleChargilyPay}
        disabled={isSubmitting}
        className="w-full flex items-start gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 text-right hover:border-amber-300 hover:bg-amber-50/30 transition-all disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
      >
        <div className="rounded-full bg-amber-100 p-2 shrink-0">
          <CreditCard className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">الدفع بالبطاقة الذهبية (إيداهابيا) عبر شارجيلي</p>
          <p className="text-sm text-gray-600 mt-0.5">
            ادفع مباشرة عبر إيداهابيا. المبلغ: {formatPrice(chargilyTotal)}
          </p>
        </div>
        {isSubmitting && paymentChoice === 'CHARGILY' && (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-600" />
        )}
      </button>
      <button
        type="button"
        onClick={handleCodPay}
        disabled={isSubmitting}
        className="w-full flex items-start gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 text-right hover:border-amber-300 hover:bg-amber-50/30 transition-all disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
      >
        <div className="rounded-full bg-gray-100 p-2 shrink-0">
          <Truck className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">الدفع عند الاستلام</p>
          <p className="text-sm text-gray-600 mt-0.5">
            +{formatPrice(COD_DELIVERY_FEE_DA)} رسوم توصيل — الإجمالي: {formatPrice(codTotal)}
          </p>
        </div>
        {isSubmitting && paymentChoice === 'CASH_ON_DELIVERY' && (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-600" />
        )}
      </button>
      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed">
        في كلتا الحالتين، سيتواصل معك فريقنا لتأكيد الدفع
        {isGuestCheckout ? ' وإنشاء حسابك على المنصة' : ''}.
      </p>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
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

        {step === 'choose_path' && (
          <>
            <DialogHeader>
              <DialogTitle>كيف تريد المتابعة؟</DialogTitle>
              <DialogDescription>
                يمكنك تسجيل الدخول أو إنشاء حساب، أو إتمام الشراء مباشرة بدون حساب.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Button asChild variant="outline" className="w-full justify-start gap-3 h-auto py-3 rounded-xl">
                <Link href={course ? `/login?redirect=/courses/${course.id}` : '/login'}>
                  <LogIn className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-right">
                    <span className="block font-semibold">لدي حساب — تسجيل الدخول</span>
                    <span className="block text-xs text-gray-500 font-normal">سجّل الدخول ثم أكمل الاشتراك</span>
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3 h-auto py-3 rounded-xl">
                <Link href={course ? `/signup?redirect=/courses/${course.id}` : '/signup'}>
                  <UserPlus className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-right">
                    <span className="block font-semibold">لا أملك حساب — إنشاء حساب</span>
                    <span className="block text-xs text-gray-500 font-normal">أنشئ حساباً مجاناً ثم اشترك</span>
                  </span>
                </Link>
              </Button>
              <button
                type="button"
                onClick={startGuestCheckout}
                className="w-full flex items-start gap-3 rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 text-right hover:border-amber-300 hover:bg-amber-50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <div className="rounded-full bg-amber-100 p-2 shrink-0">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">شراء سريع بدون حساب</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    أدخل اسمك ورقم هاتفك واختر طريقة الدفع — الأسرع للبدء
                  </p>
                </div>
              </button>
            </div>
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
              <Button variant="outline" className="rounded-full" onClick={() => handleClose(false)} disabled={isLoggingOut}>
                إلغاء
              </Button>
              <Button className="rounded-full" style={{ background: GRADIENT }} onClick={handleLogout} disabled={isLoggingOut}>
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
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                تأكيد الاشتراك
              </DialogTitle>
              <DialogDescription>أنت على وشك الاشتراك في الدورة التالية:</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-right">
              <p className="font-bold text-gray-900">{course.title}</p>
              <p className="mt-1 text-lg font-black text-amber-600">{formatPrice(course.price)}</p>
            </div>
            <DialogFooter className="flex flex-row gap-3 sm:justify-start">
              <Button variant="outline" className="rounded-full" onClick={() => handleClose(false)}>
                إلغاء
              </Button>
              <Button className="rounded-full" style={{ background: GRADIENT }} onClick={() => setStep('choose_payment')}>
                اختر طريقة الدفع
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'guest_form' && course && (
          <>
            <DialogHeader>
              <DialogTitle>شراء سريع بدون حساب</DialogTitle>
              <DialogDescription>
                الدورة: {course.title} — السعر الأساسي {formatPrice(course.price)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="guest-full-name">الاسم واللقب</Label>
                <Input
                  id="guest-full-name"
                  value={guestFullName}
                  onChange={(e) => setGuestFullName(e.target.value)}
                  placeholder="مثال: أحمد بن علي"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-phone">رقم الهاتف</Label>
                <Input
                  id="guest-phone"
                  type="tel"
                  dir="ltr"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="text-left"
                />
              </div>
            </div>
            {submitError && (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            )}
            <DialogFooter className="flex flex-row gap-3 sm:justify-start">
              <Button variant="outline" className="rounded-full" onClick={() => setStep('choose_path')}>
                رجوع
              </Button>
              <Button className="rounded-full" style={{ background: GRADIENT }} onClick={goToPayment}>
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
                {isGuestCheckout ? (
                  <>
                    {guestFullName} — {guestPhone}
                    <br />
                    الدورة: {course.title}
                  </>
                ) : (
                  <>
                    الدورة: {course.title} — {formatPrice(course.price)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">{paymentCards}</div>
            {submitError && (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            )}
            <DialogFooter className="flex flex-row gap-3 sm:justify-start">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setStep(isGuestCheckout ? 'guest_form' : 'confirm')}
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
              <DialogTitle className="text-center">تم استلام طلبك</DialogTitle>
              <DialogDescription className="text-center text-base">
                سيتواصل معك فريقنا لتأكيد الدفع
                {isGuestCheckout ? ' وإنشاء حسابك على المنصة' : ''}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button className="rounded-full" style={{ background: GRADIENT }} onClick={() => handleClose(false)}>
                حسناً
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
