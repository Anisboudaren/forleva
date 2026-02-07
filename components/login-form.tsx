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
import { useState, useRef } from "react"
import { GradientText } from "@/components/text/gradient-text"

type LoginTab = "student" | "teacher"

type LoginFormProps = React.ComponentProps<"form"> & {
  showRegisteredMessage?: boolean
}

export function LoginForm({
  className,
  showRegisteredMessage = false,
  ...props
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [tab, setTab] = useState<LoginTab>("student")
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    const form = formRef.current
    if (!form) {
      setIsLoading(false)
      return
    }
    const formData = new FormData(form)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: formData.get('emailOrPhone')?.toString()?.trim(),
          password: formData.get('password'),
        }),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError((data.error as string) || 'فشل تسجيل الدخول')
        setIsLoading(false)
        return
      }
      window.location.href = data.redirect || `/dashboard/${tab}`
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
            <GradientText text="تسجيل الدخول" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            أدخل بريدك الإلكتروني أو رقم هاتفك لتسجيل الدخول
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="emailOrPhone" className="text-gray-900 font-medium">البريد الإلكتروني أو رقم الهاتف</FieldLabel>
          <Input 
            id="emailOrPhone" 
            name="emailOrPhone"
            type="text" 
            inputMode="text"
            autoComplete="username"
            placeholder="m@example.com أو 05xxxxxxxx" 
            required 
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password" className="text-gray-900 font-medium">كلمة المرور</FieldLabel>
            <a
              href="/forgot-password"
              className="ml-auto text-sm text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline transition-colors"
            >
              نسيت كلمة المرور؟
            </a>
          </div>
          <PasswordInput 
            id="password" 
            name="password"
            required 
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
        </Field>
        {showRegisteredMessage && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2" role="status">
            تم إنشاء حسابك. سجّل الدخول الآن.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
            {error}
          </p>
        )}
        <Field>
          <div className="relative inline-flex items-center justify-center w-full group/btn">
            <div className="absolute transition-all duration-200 rounded-xl -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover/btn:shadow-lg group-hover/btn:shadow-yellow-500/50" />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="relative w-full px-6 py-3 text-base font-semibold text-white bg-transparent border-0 rounded-xl hover:bg-transparent focus:bg-transparent"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </div>
        </Field>
        <Field>
          <FieldDescription className="text-center text-gray-600">
            ليس لديك حساب؟{" "}
            <a href="/signup" className="text-gray-900 font-medium underline underline-offset-4 hover:text-yellow-600 transition-colors">
              سجل الآن
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
