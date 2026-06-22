'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Play,
  BookOpen,
  Clock,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  FileText,
  MessageSquare,
  Loader2,
  FileCheck,
} from "lucide-react"
import { VimeoVideoPlayer } from "@/components/vimeo-video-player"
import { isVimeoUrl } from "@/lib/vimeo"
import { QuizPlayer } from "@/components/student/learning/quiz-player"
import { FormPlayer } from "@/components/student/learning/form-player"
import type { FormField } from "@/lib/course-content"

type CourseSectionItem = {
  id: string
  type: string
  title: string
  duration?: string
  url?: string
  position: number
  studentExtra?: {
    questions?: Array<{ id: string; question: string; options: string[]; allowMultiple?: boolean }>
    formFields?: FormField[]
    description?: string
    fileUrl?: string
  }
}

type CourseSection = {
  id: string
  title: string
  position: number
  items: CourseSectionItem[]
}

type Course = {
  id: string
  title: string
  category: string
  price: number
  imageUrl: string | null
  duration: string | null
  level: string | null
  language: string | null
  description: string | null
  learningOutcomes: string[]
  teacher: { id: string; fullName: string } | null
  sections: CourseSection[]
}

const lessonTypes: Record<
  string,
  {
    icon: typeof Play
    label: string
    color: string
  }
> = {
  VIDEO: { icon: Play, label: "فيديو", color: "text-red-500" },
  QUIZ: { icon: HelpCircle, label: "كويز", color: "text-purple-500" },
  EXTERNAL: { icon: ExternalLink, label: "رابط خارجي", color: "text-blue-500" },
  PDF: { icon: FileText, label: "PDF", color: "text-red-600" },
  SURVEY: { icon: FileCheck, label: "نموذج", color: "text-green-500" },
  TITLE: { icon: BookOpen, label: "عنوان", color: "text-gray-500" },
}

type Props = {
  course: Course
}

type ProgressResponse = {
  courseId: string
  lastActivityAt: string | null
  nextItem:
    | { id: string; title: string; type: string; sectionTitle: string }
    | null
  items: Array<{
    id: string
    startedAt: string | null
    lastViewedAt: string | null
    completedAt: string | null
    progressPercent: number | null
  }>
}

function normalizeType(type: string) {
  return type.toUpperCase()
}

function ContentArea({
  course,
  activeItem,
  onQuizOrFormCompleted,
}: {
  course: Course
  activeItem: (CourseSectionItem & { sectionTitle: string }) | undefined
  onQuizOrFormCompleted: () => void
}) {
  if (!activeItem) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[280px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <Play className="h-10 w-10 text-amber-400" />
        <p className="text-sm text-slate-100 text-center">اختر درساً من المنهج لبدء التعلّم</p>
      </div>
    )
  }

  const type = normalizeType(activeItem.type)
  const extra = activeItem.studentExtra ?? {}

  if (type === "VIDEO") {
    const url = activeItem.url?.trim()
    if (url && isVimeoUrl(url)) {
      return (
        <VimeoVideoPlayer
          key={url}
          videoUrl={url}
          title={activeItem.title}
          className="w-full"
        />
      )
    }
    return (
      <div className="flex flex-col items-center justify-center gap-2 min-h-[280px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 text-center">
        <Play className="h-10 w-10 text-amber-400" />
        <p className="text-sm text-slate-100">
          {url
            ? "رابط الفيديو غير مدعوم. استخدم رابط Vimeo صالحاً."
            : "ارفع فيديو Vimeo لهذا الدرس من لوحة المعلم."}
        </p>
      </div>
    )
  }

  if (type === "PDF") {
    const pdfUrl = activeItem.url?.trim() || extra.fileUrl?.trim()
    if (!pdfUrl) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 min-h-[280px] bg-gray-50 p-6 text-center">
          <FileText className="h-10 w-10 text-red-500" />
          <p className="text-sm text-gray-600">لم يُرفع ملف PDF بعد.</p>
        </div>
      )
    }
    return (
      <div className="flex flex-col bg-white min-h-[480px]">
        <iframe
          src={pdfUrl}
          title={activeItem.title}
          className="w-full flex-1 min-h-[480px] border-0"
        />
        <div className="border-t border-gray-100 px-4 py-2 text-center">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-600 hover:underline"
          >
            فتح PDF في نافذة جديدة
          </a>
        </div>
      </div>
    )
  }

  if (type === "EXTERNAL") {
    const link = activeItem.url?.trim()
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[280px] bg-gradient-to-br from-blue-50 to-white p-8 text-center">
        <ExternalLink className="h-12 w-12 text-blue-500" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">{activeItem.title}</h3>
          {extra.description && (
            <p className="mt-2 text-sm text-gray-600 max-w-md">{extra.description}</p>
          )}
        </div>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            فتح الرابط
          </a>
        ) : (
          <p className="text-sm text-gray-500">لم يُضف رابط بعد.</p>
        )}
      </div>
    )
  }

  if (type === "QUIZ") {
    return (
      <div className="bg-white min-h-[280px] max-h-[70vh] overflow-y-auto">
        <QuizPlayer
          courseId={course.id}
          itemId={activeItem.id}
          title={activeItem.title}
          questions={extra.questions ?? []}
          onCompleted={onQuizOrFormCompleted}
        />
      </div>
    )
  }

  if (type === "SURVEY") {
    return (
      <div className="bg-white min-h-[280px] max-h-[70vh] overflow-y-auto">
        <FormPlayer
          courseId={course.id}
          itemId={activeItem.id}
          title={activeItem.title}
          description={extra.description}
          formFields={extra.formFields ?? []}
          onCompleted={onQuizOrFormCompleted}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 min-h-[280px] bg-gray-50 p-6 text-center">
      <BookOpen className="h-10 w-10 text-gray-400" />
      <p className="text-sm text-gray-600">نوع المحتوى غير مدعوم. يمكنك وضع علامة مكتمل للمتابعة.</p>
    </div>
  )
}

export default function LearningStudioClient({ course }: Props) {
  const topRef = useRef<HTMLDivElement | null>(null)
  const flatItems = useMemo(
    () =>
      course.sections.flatMap((sec) =>
        sec.items.map((item) => ({
          ...item,
          sectionId: sec.id,
          sectionTitle: sec.title,
        }))
      ),
    [course.sections]
  )

  const [activeItemId, setActiveItemId] = useState<string | null>(
    flatItems.find((i) => normalizeType(i.type) === "VIDEO")?.id ?? flatItems[0]?.id ?? null
  )

  const activeItem = flatItems.find((i) => i.id === activeItemId) ?? flatItems[0]

  const [progressLoading, setProgressLoading] = useState(true)
  const [progressError, setProgressError] = useState<string | null>(null)
  const [completedItemIds, setCompletedItemIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const refreshProgress = () => {
    fetch(`/api/student/progress?courseId=${encodeURIComponent(course.id)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return
        const data = (await res.json()) as ProgressResponse
        const completed = new Set(
          (data.items ?? []).filter((i) => i.completedAt).map((i) => i.id)
        )
        setCompletedItemIds(completed)
      })
      .catch(() => {})
  }

  useEffect(() => {
    let cancelled = false
    setProgressLoading(true)
    setProgressError(null)

    fetch(`/api/student/progress?courseId=${encodeURIComponent(course.id)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || "فشل تحميل التقدم")
        }
        return res.json() as Promise<ProgressResponse>
      })
      .then((data) => {
        if (cancelled) return
        const completed = new Set(
          (data.items ?? []).filter((i) => i.completedAt).map((i) => i.id)
        )
        setCompletedItemIds(completed)
      })
      .catch((e) => {
        if (!cancelled) setProgressError(e?.message || "حدث خطأ")
      })
      .finally(() => {
        if (!cancelled) setProgressLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [course.id])

  useEffect(() => {
    if (!activeItemId) return
    fetch("/api/student/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ courseId: course.id, itemId: activeItemId, action: "view" }),
    }).catch(() => {})
  }, [activeItemId, course.id])

  useEffect(() => {
    let cancelled = false
    if (!activeItemId) return
    fetch(`/api/student/notes?courseId=${encodeURIComponent(course.id)}&itemId=${encodeURIComponent(activeItemId)}`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : { content: "" }))
      .then((data) => {
        if (cancelled) return
        setNoteText(typeof data?.content === "string" ? data.content : "")
        setNoteStatus("idle")
      })
      .catch(() => {
        if (!cancelled) {
          setNoteText("")
          setNoteStatus("error")
        }
      })
    return () => {
      cancelled = true
    }
  }, [course.id, activeItemId])

  useEffect(() => {
    if (!activeItemId) return
    const t = setTimeout(() => {
      setNoteStatus("saving")
      fetch("/api/student/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId: course.id, itemId: activeItemId, content: noteText }),
      })
        .then((res) => {
          if (!res.ok) throw new Error()
          setNoteStatus("saved")
        })
        .catch(() => setNoteStatus("error"))
    }, 700)
    return () => clearTimeout(t)
  }, [course.id, activeItemId, noteText])

  const isActiveCompleted = Boolean(activeItemId && completedItemIds.has(activeItemId))

  const markActiveCompleted = async () => {
    if (!activeItemId || isActiveCompleted || saving) return
    setSaving(true)
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId: course.id, itemId: activeItemId, action: "complete" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "فشل حفظ التقدم")
      }
      setCompletedItemIds((prev) => {
        const next = new Set(prev)
        next.add(activeItemId)
        return next
      })
    } catch (e: unknown) {
      const msg =
        typeof e === "object" &&
        e &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
          ? (e as { message: string }).message
          : null
      setProgressError(msg || "حدث خطأ")
    } finally {
      setSaving(false)
    }
  }

  const activeType = activeItem ? normalizeType(activeItem.type) : ""
  const hideManualComplete = activeType === "QUIZ" || activeType === "SURVEY"

  return (
    <div
      ref={topRef}
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-4 md:gap-6"
    >
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="rounded-2xl border border-gray-200 bg-black/95 overflow-hidden shadow-lg">
          <ContentArea
            course={course}
            activeItem={activeItem}
            onQuizOrFormCompleted={refreshProgress}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 space-y-3">
            <p className="text-xs font-medium text-gray-500">الدرس الحالي</p>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              {activeItem?.title ?? course.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {activeItem && (
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                  <span>{activeItem.sectionTitle}</span>
                </span>
              )}
              {activeItem?.duration && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span>{activeItem.duration}</span>
                </span>
              )}
            </div>

            {!hideManualComplete && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={markActiveCompleted}
                  disabled={!activeItemId || isActiveCompleted || saving}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActiveCompleted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className={`h-4 w-4 ${isActiveCompleted ? "text-emerald-600" : "text-white"}`} />
                  )}
                  <span>{isActiveCompleted ? "تم إكمال الدرس" : "وضع علامة مكتمل"}</span>
                </button>

                {progressLoading ? (
                  <span className="text-xs text-gray-500 inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    جارٍ تحميل التقدم...
                  </span>
                ) : progressError ? (
                  <span className="text-xs text-red-600">{progressError}</span>
                ) : null}
              </div>
            )}

            {hideManualComplete && isActiveCompleted && (
              <p className="text-sm text-emerald-700 font-medium inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                تم إكمال هذا الدرس
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-amber-500" />
                ملاحظاتك على هذه الدورة
              </p>
            </div>
            <p className="text-xs text-gray-500">
              اكتب ملاحظاتك وأفكارك أثناء التعلم.
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="mt-1 min-h-[120px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="اكتب ملاحظاتك هنا..."
            />
            <p className="text-xs text-gray-500">
              {noteStatus === "saving" && "جارٍ حفظ الملاحظات..."}
              {noteStatus === "saved" && "تم حفظ الملاحظات"}
              {noteStatus === "error" && "تعذّر حفظ الملاحظات"}
              {noteStatus === "idle" && "يتم حفظ الملاحظات تلقائياً"}
            </p>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-gray-200 bg-white p-3 md:p-4 lg:p-5 max-h-[calc(100vh-8rem)] lg:sticky lg:top-24 overflow-hidden flex flex-col">
        <div className="mb-3 md:mb-4">
          <p className="text-xs font-medium text-gray-500 mb-1">منهج الدورة</p>
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-500" />
            <span>{course.sections.length} قسم • {flatItems.length} درس</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {course.sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-3 py-2.5 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-800">{section.title}</p>
                <span className="text-[11px] text-gray-500">{section.items.length} درس</span>
              </div>
              <ul className="divide-y divide-gray-100">
                {section.items.map((item) => {
                  const isActive = item.id === activeItem?.id
                  const isCompleted = completedItemIds.has(item.id)
                  const typeInfo =
                    lessonTypes[normalizeType(item.type)] ?? lessonTypes.TITLE
                  const TypeIcon = typeInfo.icon
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveItemId(item.id)
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-right text-xs transition-colors ${
                          isActive ? "bg-amber-50" : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <TypeIcon
                            className={`h-3.5 w-3.5 flex-shrink-0 ${
                              isActive ? "text-amber-500" : typeInfo.color
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`truncate font-medium ${
                                isActive ? "text-amber-700" : "text-gray-800"
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {typeInfo.label}
                              {item.duration && ` • ${item.duration}`}
                            </p>
                          </div>
                        </div>
                        {isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
