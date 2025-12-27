'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { GradientText } from "@/components/text/gradient-text"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Add actual authentication logic here
    // For now, we'll simulate a login and redirect
    // You can determine user type (student/teacher) from the auth response
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For demo purposes, you can check email to determine user type
    // In production, this should come from your auth system
    const form = formRef.current
    if (!form) {
      setIsLoading(false)
      return
    }
    
    const formData = new FormData(form)
    const email = formData.get('email') as string
    
    // Simple logic: if email contains 'teacher' or 'admin', go to teacher dashboard
    // Otherwise, go to student dashboard
    const userType = email?.includes('teacher') || email?.includes('admin') ? 'teacher' : 'student'
    
    router.push(`/dashboard/${userType}`)
    setIsLoading(false)
  }

  return (
    <form ref={formRef} className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            <GradientText text="تسجيل الدخول" gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" />
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email" className="text-gray-900 font-medium">البريد الإلكتروني</FieldLabel>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            required 
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password" className="text-gray-900 font-medium">كلمة المرور</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline transition-colors"
            >
              نسيت كلمة المرور؟
            </a>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required 
            dir="rtl"
            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
          />
        </Field>
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
        <FieldSeparator className="text-gray-400">أو المتابعة باستخدام</FieldSeparator>
        <Field>
          <Button 
            variant="outline" 
            type="button"
            onClick={async () => {
              setIsLoading(true)
              // TODO: Add Google OAuth logic here
              // For now, redirect to student dashboard
              await new Promise(resolve => setTimeout(resolve, 500))
              router.push('/dashboard/student')
              setIsLoading(false)
            }}
            disabled={isLoading}
            className="w-full border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            تسجيل الدخول باستخدام Google
          </Button>
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
