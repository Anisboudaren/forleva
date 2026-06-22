'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

type QuizQuestion = {
  id: string
  question: string
  options: string[]
  allowMultiple?: boolean
}

type QuizResult = {
  correct: boolean
  selected: number[]
}

type Props = {
  courseId: string
  itemId: string
  title: string
  questions: QuizQuestion[]
  onCompleted?: () => void
}

export function QuizPlayer({ courseId, itemId, title, questions, onCompleted }: Props) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [results, setResults] = useState<Record<string, QuizResult>>({})

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
          setScore(typeof data.score === 'number' ? data.score : null)
          setAnswers((data.answers as Record<string, number[]>) ?? {})
          setResults((data.quizResults as Record<string, QuizResult>) ?? {})
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

  const toggleOption = (questionId: string, optIdx: number, multi: boolean) => {
    if (submitted) return
    setAnswers((prev) => {
      const current = prev[questionId] ?? []
      if (multi) {
        const next = current.includes(optIdx)
          ? current.filter((i) => i !== optIdx)
          : [...current, optIdx].sort((a, b) => a - b)
        return { ...prev, [questionId]: next }
      }
      return { ...prev, [questionId]: [optIdx] }
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
      if (!res.ok) throw new Error(data.error || 'فشل إرسال الإجابات')
      setSubmitted(true)
      setScore(typeof data.score === 'number' ? data.score : null)
      setResults((data.quizResults as Record<string, QuizResult>) ?? {})
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

  if (questions.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">لا توجد أسئلة في هذا الكويز.</p>
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div>
        <p className="text-xs font-medium text-purple-600 mb-1">كويز</p>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {submitted && score !== null && (
          <p className="mt-2 text-sm font-semibold text-purple-700">
            نتيجتك: {score}%
          </p>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const qResult = results[q.id]
          const selected = answers[q.id] ?? []
          const inputType = q.allowMultiple ? 'checkbox' : 'radio'

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 ${
                submitted
                  ? qResult?.correct
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-red-200 bg-red-50/50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <p className="font-medium text-gray-900 mb-3">
                {qIdx + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selected.includes(optIdx)
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                        isSelected ? 'border-purple-300 bg-purple-50' : 'border-gray-100 hover:bg-gray-50'
                      } ${submitted ? 'cursor-default' : ''}`}
                    >
                      <input
                        type={inputType}
                        name={`q-${q.id}`}
                        checked={isSelected}
                        disabled={submitted}
                        onChange={() => toggleOption(q.id, optIdx, inputType === 'checkbox')}
                        className="rounded border-gray-300 text-purple-600"
                      />
                      <span className="text-sm text-gray-800 flex-1">{opt}</span>
                      {submitted && qResult && (
                        isSelected && qResult.correct ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : isSelected && !qResult.correct ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : null
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إرسال الإجابات
        </button>
      ) : (
        <p className="text-sm text-emerald-700 font-medium">تم إرسال إجاباتك بنجاح.</p>
      )}
    </div>
  )
}
