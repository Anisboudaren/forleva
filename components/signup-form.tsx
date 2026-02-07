'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { GradientText } from "@/components/text/gradient-text"

type SignupTab = 'student' | 'teacher'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [tab, setTab] = useState<SignupTab>('student')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!acceptedTerms) {
      setError('يجب الموافقة على الشروط والأحكام')
      return
    }
    setError(null)
    setIsLoading(true)
    const form = formRef.current
    if (!form) {
      setIsLoading(false)
      return
    }
    const formData = new FormData(form)
    const fullName = formData.get('fullName')?.toString()?.trim()
    const phone = formData.get('phone')?.toString()?.trim().replace(/\s/g, '')
    const whatsapp = formData.get('whatsapp')?.toString()?.trim().replace(/\s/g, '') || undefined
    const email = formData.get('email')?.toString()?.trim() || undefined
    const password = formData.get('password')?.toString()
    if (!fullName || !phone || !password) {
      setError('الاسم الكامل ورقم الهاتف وكلمة المرور مطلوبة')
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          whatsapp: whatsapp || undefined,
          email: email || undefined,
          password,
          role: tab,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError((data.error as string) || 'فشل إنشاء الحساب')
        setIsLoading(false)
        return
      }
      router.push('/login?registered=1')
      return
    } catch {
      setError('حدث خطأ في الاتصال')
    }
    setIsLoading(false)
  }

  return (
    <form ref={formRef} className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        {/* Student / Teacher tabs */}
        <div className="flex rounded-xl p-1 bg-gray-100 border border-gray-200 mb-2">
          <button
            type="button"
            onClick={() => setTab('student')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              tab === 'student'
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            طالب
          </button>
          <button
            type="button"
            onClick={() => setTab('teacher')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              tab === 'teacher'
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            معلم
          </button>
        </div>
        <div className="flex flex-col items-center gap-2 text-center mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            <GradientText text="إنشاء حساب" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            {tab === 'student' ? 'أنشئ حسابك مجاناً وابدأ رحلتك التعليمية' : 'التسجيل كمعلم'}
          </p>
        </div>

        {/* Student and Teacher: same signup form */}
        {(tab === 'student' || tab === 'teacher') && (
        <>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
            {error}
          </p>
        )}
        
        {/* Full Name - Required */}
        <Field>
          <FieldLabel htmlFor="fullName" className="text-gray-900 font-medium">
            الاسم الكامل <span className="text-red-500">*</span>
          </FieldLabel>
          <Input 
            id="fullName" 
            name="fullName"
            type="text" 
            placeholder="أدخل اسمك الكامل" 
            required 
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
        </Field>

        {/* Algerian Phone Number - Required */}
        <Field>
          <FieldLabel htmlFor="phone" className="text-gray-900 font-medium">
            رقم الهاتف الجزائري <span className="text-red-500">*</span>
          </FieldLabel>
          <Input 
            id="phone" 
            name="phone"
            type="tel" 
            placeholder="05XX XX XX XX" 
            required 
            pattern="^0[567][0-9]{8}$"
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
          
          {/* WhatsApp Number - Supplementary (under phone) */}
          <div className="mt-3">
            <FieldLabel htmlFor="whatsapp" className="text-gray-900 font-medium text-sm">
              رقم الواتساب
            </FieldLabel>
            <Input 
              id="whatsapp" 
              name="whatsapp"
              type="tel" 
              placeholder="05XX XX XX XX (اختياري)" 
              dir="rtl"
              className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 mt-1 text-right"
            />
            <FieldDescription className="text-gray-500 text-xs mt-1">
              يمكنك ترك هذا الحقل فارغاً إذا كان نفس رقم الهاتف
            </FieldDescription>
          </div>
        </Field>

        {/* Email - Optional/Supplementary */}
        <Field>
          <FieldLabel htmlFor="email" className="text-gray-900 font-medium">
            البريد الإلكتروني
          </FieldLabel>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com (اختياري)" 
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
          <FieldDescription className="text-gray-500 text-sm">
            اختياري - يمكنك إضافته لاحقاً
          </FieldDescription>
        </Field>

        {/* Password - Required */}
        <Field>
          <FieldLabel htmlFor="password" className="text-gray-900 font-medium">
            كلمة المرور <span className="text-red-500">*</span>
          </FieldLabel>
          <PasswordInput 
            id="password" 
            name="password"
            required 
            minLength={6}
            placeholder="••••••••"
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
          <FieldDescription className="text-gray-500 text-xs mt-1">
            ٦ أحرف على الأقل
          </FieldDescription>
        </Field>

        {/* Terms and Conditions - Required */}
        <Field>
          <div className="flex items-start gap-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              أوافق على <a href="#" className="text-yellow-600 hover:text-yellow-700 underline underline-offset-2">الشروط والأحكام</a> <span className="text-red-500">*</span>
            </label>
          </div>
        </Field>

        <Field>
          <div className="relative inline-flex items-center justify-center w-full group/btn">
            <div className="absolute transition-all duration-200 rounded-xl -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover/btn:shadow-lg group-hover/btn:shadow-yellow-500/50" />
            <Button 
              type="submit" 
              disabled={isLoading || !acceptedTerms}
              className="relative w-full px-6 py-3 text-base font-semibold text-white bg-transparent border-0 rounded-xl hover:bg-transparent focus:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </Button>
          </div>
        </Field>
        <Field>
          <FieldDescription className="text-center text-gray-600">
            لديك حساب بالفعل؟{" "}
            <a href="/login" className="text-gray-900 font-medium underline underline-offset-4 hover:text-yellow-600 transition-colors">
              تسجيل الدخول
            </a>
          </FieldDescription>
        </Field>
        </>
        )}
      </FieldGroup>
    </form>
  )
}

