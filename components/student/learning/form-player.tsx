'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { FormField } from '@/lib/course-content'

type FormAnswers = Record<string, string | string[]>

type Props = {
  courseId: string
  itemId: string
  title: string
  description?: string
  formFields: FormField[]
  onCompleted?: () => void
}

export function FormPlayer({
  courseId,
  itemId,
  title,
  description,
  formFields,
  onCompleted,
}: Props) {
  const [answers, setAnswers] = useState<FormAnswers>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(
      `/api/student/item-submissions?courseId=${encodeURIComponent(courseId)}&itemId=${encodeURIComponent(itemId)}`,
      { credentials: 'include' }
    )
      .then((res) => (res.ok ? res.json() : { submitted: false }))
      .then((data) => {
        if (cancelled) return
        if (data.submitted) {
          setSubmitted(true)
          setAnswers((data.answers as FormAnswers) ?? {})
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [courseId, itemId])

  const setTextAnswer = (fieldId: string, value: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }

  const toggleMulti = (fieldId: string, opt: string) => {
    if (submitted) return
    setAnswers((prev) => {
      const current = Array.isArray(prev[fieldId]) ? (prev[fieldId] as string[]) : []
      const next = current.includes(opt) ? current.filter((v) => v !== opt) : [...current, opt]
      return { ...prev, [fieldId]: next }
    })
  }

  const handleSubmit = async () => {
    if (submitting || submitted) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/student/item-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId, itemId, answers }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'فشل إرسال النموذج')
      setSubmitted(true)
      onCompleted?.()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'حدث خطأ')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        جارٍ التحميل...
      </div>
    )
  }

  if (formFields.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">لا توجد حقول في هذا النموذج.</p>
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div>
        <p className="text-xs font-medium text-green-600 mb-1">نموذج</p>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>

      <div className="space-y-4">
        {formFields.map((field) => (
          <div key={field.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {field.label || 'حقل'}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={(answers[field.id] as string) ?? ''}
                disabled={submitted}
                onChange={(e) => setTextAnswer(field.id, e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={(answers[field.id] as string) ?? ''}
                disabled={submitted}
                onChange={(e) => setTextAnswer(field.id, e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 resize-none"
              />
            )}

            {field.type === 'single' && (
              <div className="space-y-2">
                {(field.options ?? []).filter((o) => o.trim()).map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`field-${field.id}`}
                      checked={answers[field.id] === opt}
                      disabled={submitted}
                      onChange={() => setTextAnswer(field.id, opt)}
                      className="text-green-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {field.type === 'multi' && (
              <div className="space-y-2">
                {(field.options ?? []).filter((o) => o.trim()).map((opt, i) => {
                  const selected = Array.isArray(answers[field.id])
                    ? (answers[field.id] as string[]).includes(opt)
                    : false
                  return (
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={submitted}
                        onChange={() => toggleMulti(field.id, opt)}
                        className="rounded text-green-600"
                      />
                      {opt}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إرسال النموذج
        </button>
      ) : (
        <p className="text-sm text-emerald-700 font-medium">تم إرسال النموذج بنجاح.</p>
      )}
    </div>
  )
}
