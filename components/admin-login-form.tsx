'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { GradientText } from "@/components/text/gradient-text"

export function AdminLoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    const form = formRef.current
    if (!form) {
      setIsLoading(false)
      return
    }
    const emailOrPhone = (form.emailOrPhone as HTMLInputElement)?.value?.trim()
    const password = (form.password as HTMLInputElement)?.value
    if (!emailOrPhone || !password) {
      setError('أدخل البريد الإلكتروني أو رقم الهاتف وكلمة المرور')
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'فشل تسجيل الدخول')
        setIsLoading(false)
        return
      }
      if (data.redirect) {
        router.push(data.redirect)
      } else {
        router.push(data.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard/teacher')
      }
    } catch {
      setError('حدث خطأ أثناء الاتصال')
    }
    setIsLoading(false)
  }

  return (
    <form ref={formRef} className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center mb-2">
          <div className="mb-2 p-2 rounded-lg bg-amber-100/50">
            <span className="text-xs font-semibold text-amber-800">لوحة الإدارة</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            <GradientText text="تسجيل دخول المسؤول" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            أدخل بياناتك للوصول إلى لوحة الإدارة
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-600 text-center bg-red-50 py-2 px-3 rounded-lg" role="alert">
            {error}
          </p>
        )}
        <Field>
          <FieldLabel htmlFor="emailOrPhone" className="text-gray-900 font-medium">البريد الإلكتروني أو رقم الهاتف</FieldLabel>
          <Input 
            id="emailOrPhone" 
            name="emailOrPhone"
            type="text" 
            autoComplete="username"
            placeholder="admin@example.com أو 05xxxxxxxx" 
            required 
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password" className="text-gray-900 font-medium">كلمة المرور</FieldLabel>
            <a
              href="/admin/forgot-password"
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
        <Field>
          <div className="relative inline-flex items-center justify-center w-full group/btn">
            <div className="absolute transition-all duration-200 rounded-xl -inset-px bg-gradient-to-r from-amber-500 to-yellow-600 group-hover/btn:shadow-lg group-hover/btn:shadow-amber-500/50" />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="relative w-full px-6 py-3 text-base font-semibold text-white bg-transparent border-0 rounded-xl hover:bg-transparent focus:bg-transparent"
            >
              {isLoading ? 'جاري التحقق...' : 'دخول لوحة الإدارة'}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  )
}
