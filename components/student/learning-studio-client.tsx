'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { Play, BookOpen, Clock, CheckCircle2, HelpCircle, ExternalLink, FileText, Award, Headphones, CheckSquare, MessageSquare, Loader2 } from "lucide-react"
import { MuxVideoPlayer, isMuxPlaybackUrl } from "@/components/mux-video-player"

type CourseSectionItem = {
  id: string
  type: string
  title: string
  duration?: string
  url?: string
  position: number
  extraData?: unknown
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
  SURVEY: { icon: CheckCircle2, label: "استبيان", color: "text-green-500" },
  TITLE: { icon: BookOpen, label: "عنوان", color: "text-gray-500" },
  CERTIFICATE: { icon: Award, label: "شهادة", color: "text-amber-500" },
  EXERCISE: { icon: CheckSquare, label: "تمرين", color: "text-indigo-500" },
  AUDIO: { icon: Headphones, label: "صوتي", color: "text-pink-500" },
  CHECKLIST: { icon: CheckCircle2, label: "قائمة", color: "text-teal-500" },
}

function youtubeWatchToEmbed(url: string | undefined): string | null {
  if (!url || !url.includes("youtube")) return null
  const match = url.match(/[?&]v=([^&]+)/)
  const id = match ? match[1] : null
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
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
    flatItems.find((i) => i.type === "VIDEO")?.id ?? flatItems[0]?.id ?? null
  )

  const activeItem = flatItems.find((i) => i.id === activeItemId) ?? flatItems[0]

  const [progressLoading, setProgressLoading] = useState(true)
  const [progressError, setProgressError] = useState<string | null>(null)
  const [completedItemIds, setCompletedItemIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

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
    // Mark as viewed (best-effort; do not block UI)
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

  const activeEmbedUrl = useMemo(() => {
    if (!activeItem) return null
    if (activeItem.type === "VIDEO" || activeItem.type === "video") {
      return youtubeWatchToEmbed(activeItem.url)
    }
    return null
  }, [activeItem])

  const activeMuxUrl =
    activeItem && (activeItem.type === "VIDEO" || activeItem.type === "video") && activeItem.url && isMuxPlaybackUrl(activeItem.url)
      ? activeItem.url
      : null

  return (
    <div
      ref={topRef}
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-4 md:gap-6"
    >
      {/* Main learning area */}
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="rounded-2xl border border-gray-200 bg-black/95 overflow-hidden shadow-lg">
          {activeMuxUrl ? (
            <MuxVideoPlayer
              key={activeMuxUrl}
              playbackUrlOrId={activeMuxUrl}
              title={activeItem?.title ?? course.title}
              className="w-full aspect-video"
            />
          ) : activeEmbedUrl ? (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`${activeEmbedUrl}?rel=0&modestbranding=1&playsinline=1`}
                title={activeItem?.title ?? course.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Play className="h-10 w-10 text-amber-400" />
                <p className="text-sm text-slate-100">
                  اختر درساً من المنهج على اليمين لبدء المشاهدة
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Active lesson info + notes */}
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

      {/* Curriculum sidebar */}
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
                    lessonTypes[item.type] ??
                    lessonTypes[item.type.toUpperCase()] ??
                    lessonTypes.TITLE
                  const TypeIcon = typeInfo.icon
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveItemId(item.id)
                          // Scroll the whole page to the very top (under the app header)
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

