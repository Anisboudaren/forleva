'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { GradientText } from '@/components/text/gradient-text'
import { useState } from 'react'

// Replace with your team's WhatsApp number (e.g. 213555123456 for Algeria)
const WHATSAPP_NUMBER = '213555000000'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsLoading(true)
    // Not functional yet - just simulate and show success message
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
    setIsLoading(false)
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            <GradientText
              text="نسيت كلمة المرور؟"
              gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
            />
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            اختر إما إرسال رابط إعادة التعيين إلى بريدك أو التواصل مع الفريق
          </p>
        </div>

        {/* Option 1: Email reset */}
        <Field>
          <FieldLabel htmlFor="forgot-email" className="text-gray-900 font-medium">
            إرسال رابط إعادة التعيين إلى بريدي
          </FieldLabel>
          {sent ? (
            <p className="text-amber-600 font-medium text-center py-4 rounded-lg bg-amber-50 border border-amber-200" dir="rtl">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                id="forgot-email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="rtl"
                className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
              </Button>
            </form>
          )}
        </Field>

        <div className="relative flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">أو</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Option 2: WhatsApp */}
        <Field>
          <FieldLabel className="text-gray-900 font-medium">
            التواصل مع الفريق عبر واتساب
          </FieldLabel>
          <FieldDescription className="text-gray-600 text-sm mb-2">
            تواصل مع الفريق من هنا واذكر مشكلتك وسنساعدك في استعادة حسابك
          </FieldDescription>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border-2 border-green-500 bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            تواصل مع الفريق من هنا واذكر مشكلتك
          </a>
        </Field>

        <FieldDescription className="text-center text-gray-600 pt-2">
          <a
            href="/login"
            className="text-gray-900 font-medium underline underline-offset-4 hover:text-yellow-600 transition-colors"
          >
            العودة لتسجيل الدخول
          </a>
        </FieldDescription>
      </FieldGroup>
    </div>
  )
}
