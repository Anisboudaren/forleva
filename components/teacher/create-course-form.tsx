'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DashboardContentCard, DashboardCard } from '@/components/dashboard/DashboardCard'
import { GradientText } from '@/components/text/gradient-text'
import {
  BookOpen,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  HelpCircle,
  FileCheck,
  Award,
  CheckSquare,
  Headphones,
  CheckCircle2,
  Edit,
  File,
  Layers,
  type LucideIcon,
} from 'lucide-react'

export type ContentType =
  | 'video'
  | 'quiz'
  | 'external'
  | 'pdf'
  | 'survey'
  | 'title'
  | 'certificate'
  | 'exercise'
  | 'audio'
  | 'checklist'
  | 'document'
  | 'image'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  duration?: string
  url?: string
  /** Quiz: question text */
  question?: string
  /** Quiz: answer options */
  options?: string[]
  /** Quiz: indices of correct option(s) */
  correctOptionIndices?: number[]
  /** Video, survey, etc.: description */
  description?: string
  /** Video/PDF/audio/document/image: object URL or file name after upload (front-only) */
  fileUrl?: string
}

export interface Section {
  id: string
  title: string
  items: ContentItem[]
}

export interface CourseFormData {
  title: string
  category: string
  price: string
  imageUrl: string
  duration: string
  level: string
  language: string
  description: string
  learningOutcomes: string[]
  sections: Section[]
}

const CONTENT_TYPES: {
  value: ContentType
  label: string
  icon: LucideIcon
  color: string
  bg: string
  hover: string
}[] = [
  { value: 'video', label: 'فيديو', icon: Video, color: 'text-red-600', bg: 'bg-red-100', hover: 'hover:bg-red-200' },
  { value: 'quiz', label: 'كويز', icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-100', hover: 'hover:bg-purple-200' },
  { value: 'external', label: 'رابط خارجي', icon: ExternalLink, color: 'text-blue-600', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { value: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-700', bg: 'bg-red-50', hover: 'hover:bg-red-100' },
  { value: 'survey', label: 'استبيان', icon: FileCheck, color: 'text-green-600', bg: 'bg-green-100', hover: 'hover:bg-green-200' },
  { value: 'title', label: 'عنوان', icon: BookOpen, color: 'text-gray-700', bg: 'bg-gray-100', hover: 'hover:bg-gray-200' },
  { value: 'certificate', label: 'شهادة', icon: Award, color: 'text-amber-600', bg: 'bg-amber-100', hover: 'hover:bg-amber-200' },
  { value: 'exercise', label: 'تمرين', icon: CheckSquare, color: 'text-indigo-600', bg: 'bg-indigo-100', hover: 'hover:bg-indigo-200' },
  { value: 'audio', label: 'صوتي', icon: Headphones, color: 'text-pink-600', bg: 'bg-pink-100', hover: 'hover:bg-pink-200' },
  { value: 'checklist', label: 'قائمة', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-100', hover: 'hover:bg-teal-200' },
  { value: 'document', label: 'مستند', icon: FileText, color: 'text-sky-600', bg: 'bg-sky-100', hover: 'hover:bg-sky-200' },
  { value: 'image', label: 'صورة', icon: ImageIcon, color: 'text-emerald-600', bg: 'bg-emerald-100', hover: 'hover:bg-emerald-200' },
]

const LEVELS = ['مبتدئ', 'متوسط', 'متقدم', 'كافة المستويات']
const CATEGORIES = ['برمجة', 'تصميم', 'تسويق', 'أعمال', 'لغات', 'أخرى']
const LANGUAGES = ['العربية', 'English', 'Français']

const defaultSection = (): Section => ({
  id: crypto.randomUUID(),
  title: '',
  items: [],
})

const defaultContentItem = (type: ContentType = 'video'): ContentItem => ({
  id: crypto.randomUUID(),
  type,
  title: '',
  duration: '',
  url: '',
})

function getTypeConfig(type: ContentType) {
  return CONTENT_TYPES.find((t) => t.value === type) ?? {
    value: type as ContentType,
    label: type,
    icon: File,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    hover: 'hover:bg-gray-200',
  }
}

function ContentItemRow({
  item,
  sectionId,
  onUpdate,
  onRemove,
}: {
  item: ContentItem
  sectionId: string
  onUpdate: (itemId: string, patch: Partial<ContentItem>) => void
  onRemove: (itemId: string) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [typeSelectOpen, setTypeSelectOpen] = useState(false)
  const typeConfig = getTypeConfig(item.type)
  const TypeIcon = typeConfig.icon

  const durationLabel = ['video', 'audio'].includes(item.type) && item.duration ? item.duration : '-'
  const hasUrl = ['external', 'video', 'pdf', 'document', 'image'].includes(item.type) && item.url

  return (
    <div className="flex flex-col border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 min-w-0">
      {/* Row: same layout as content page */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 min-w-0">
        <div className={`p-3 rounded-lg ${typeConfig.bg} ${typeConfig.color} flex-shrink-0 w-fit`}>
          <TypeIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-1">
            {item.title || 'بدون عنوان'}
          </h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span className="line-clamp-1">{typeConfig.label}</span>
            {durationLabel !== '-' && <span className="hidden sm:inline">المدة: {durationLabel}</span>}
            {hasUrl && <span className="hidden md:inline">رابط</span>}
            <div className="flex sm:hidden items-center gap-2 text-xs">
              {durationLabel !== '-' && <span>المدة: {durationLabel}</span>}
              {hasUrl && <span>•</span>}
              {hasUrl && <span>رابط</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
            عنصر
          </span>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="تعديل"
            aria-expanded={dropdownOpen}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dropdown panel: expands inside the same card (in-flow) */}
      {dropdownOpen && (
        <div className="border-t border-gray-200 bg-gray-50/70 p-4 space-y-4 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">تعديل العنصر</span>
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                aria-label="إغلاق"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Label className="mb-2 block text-sm font-medium text-gray-700">نوع المحتوى</Label>
              <button
                type="button"
                onClick={() => setTypeSelectOpen((o) => !o)}
                className={`flex items-center gap-2 w-full min-w-[180px] p-2.5 rounded-lg border border-gray-200 bg-white text-right hover:bg-gray-50 ${typeConfig.bg} ${typeConfig.color}`}
              >
                <TypeIcon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 font-medium">{typeConfig.label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${typeSelectOpen ? 'rotate-180' : ''}`} />
              </button>
              {typeSelectOpen && (
                <div className="absolute top-full right-0 mt-1 z-10 w-full min-w-[200px] py-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
                  {CONTENT_TYPES.map((t) => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          onUpdate(item.id, { type: t.value })
                          setTypeSelectOpen(false)
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 text-right hover:bg-gray-100 transition-colors ${t.bg} ${t.color}`}
                      >
                        <span className="p-1.5 rounded-lg bg-white/80">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">العنوان</Label>
              <Input
                value={item.title}
                onChange={(e) => onUpdate(item.id, { title: e.target.value })}
                placeholder="عنوان العنصر"
                className="w-full"
              />
            </div>

            {/* Type-specific fields */}
            {item.type === 'quiz' && (
              <>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">السؤال</Label>
                  <textarea
                    value={item.question ?? ''}
                    onChange={(e) => onUpdate(item.id, { question: e.target.value })}
                    placeholder="نص السؤال..."
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[60px]"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">الخيارات (حدد الصحيح/ة)</Label>
                  <div className="space-y-2">
                    {(item.options ?? ['', '']).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(item.correctOptionIndices ?? []).includes(idx)}
                          onChange={(e) => {
                            const next = item.correctOptionIndices ?? []
                            const nextIdx = e.target.checked
                              ? [...next, idx].sort((a, b) => a - b)
                              : next.filter((i) => i !== idx)
                            onUpdate(item.id, { correctOptionIndices: nextIdx })
                          }}
                          className="rounded border-gray-300"
                          aria-label="صحيح"
                        />
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const next = [...(item.options ?? ['', ''])]
                            next[idx] = e.target.value
                            onUpdate(item.id, { options: next })
                          }}
                          placeholder={`خيار ${idx + 1}`}
                          className="flex-1 min-w-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8"
                          onClick={() => {
                            const next = (item.options ?? ['', '']).filter((_, i) => i !== idx)
                            const correct = (item.correctOptionIndices ?? []).filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))
                            onUpdate(item.id, { options: next.length >= 1 ? next : [''], correctOptionIndices: correct })
                          }}
                          disabled={(item.options ?? ['', '']).length <= 1}
                          aria-label="حذف خيار"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdate(item.id, {
                          options: [...(item.options ?? ['', '']), ''],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة خيار
                    </Button>
                  </div>
                </div>
              </>
            )}

            {item.type === 'video' && (
              <>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">الوصف</Label>
                  <textarea
                    value={item.description ?? ''}
                    onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                    placeholder="وصف الفيديو..."
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[60px]"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">رابط الفيديو</Label>
                  <Input
                    value={item.url ?? ''}
                    onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">أو رفع فيديو</Label>
                  <input
                    type="file"
                    accept="video/*"
                    className="block w-full text-sm text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onUpdate(item.id, { fileUrl: URL.createObjectURL(file) })
                    }}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">المدة</Label>
                  <Input
                    value={item.duration ?? ''}
                    onChange={(e) => onUpdate(item.id, { duration: e.target.value })}
                    placeholder="00:00"
                    className="w-32"
                  />
                </div>
              </>
            )}

            {item.type === 'pdf' && (
              <>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">رفع ملف PDF</Label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="block w-full text-sm text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onUpdate(item.id, { fileUrl: URL.createObjectURL(file) })
                    }}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">أو رابط PDF</Label>
                  <Input
                    value={item.url ?? ''}
                    onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full"
                  />
                </div>
              </>
            )}

            {item.type === 'audio' && (
              <>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">الوصف</Label>
                  <textarea
                    value={item.description ?? ''}
                    onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                    placeholder="وصف الملف الصوتي..."
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[60px]"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">رابط أو رفع صوت</Label>
                  <Input
                    value={item.url ?? ''}
                    onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full mb-2"
                  />
                  <input
                    type="file"
                    accept="audio/*"
                    className="block w-full text-sm text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onUpdate(item.id, { fileUrl: URL.createObjectURL(file) })
                    }}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">المدة</Label>
                  <Input
                    value={item.duration ?? ''}
                    onChange={(e) => onUpdate(item.id, { duration: e.target.value })}
                    placeholder="00:00"
                    className="w-32"
                  />
                </div>
              </>
            )}

            {['document', 'image'].includes(item.type) && (
              <>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">
                    {item.type === 'image' ? 'رفع صورة' : 'رفع مستند'}
                  </Label>
                  <input
                    type="file"
                    accept={item.type === 'image' ? 'image/*' : '.pdf,.doc,.docx,application/pdf'}
                    className="block w-full text-sm text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onUpdate(item.id, { fileUrl: URL.createObjectURL(file) })
                    }}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">أو رابط</Label>
                  <Input
                    value={item.url ?? ''}
                    onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full"
                  />
                </div>
              </>
            )}

            {item.type === 'external' && (
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-700">رابط</Label>
                <Input
                  value={item.url ?? ''}
                  onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                  placeholder="https://..."
                  className="w-full"
                />
              </div>
            )}

            {['survey', 'exercise', 'checklist', 'title', 'certificate'].includes(item.type) && (
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-700">الوصف (اختياري)</Label>
                <textarea
                  value={item.description ?? ''}
                  onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                  placeholder="..."
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
            )}

        </div>
      )}
    </div>
  )
}

export type CreateCourseFormProps = {
  mode?: 'create' | 'edit'
  courseId?: string
  initialData?: CourseFormData
  currentStatus?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  onSuccess?: () => void
}

const defaultFormData: CourseFormData = {
  title: '',
  category: '',
  price: '',
  imageUrl: '',
  duration: '',
  level: '',
  language: 'العربية',
  description: '',
  learningOutcomes: [''],
  sections: [],
}

export function CreateCourseForm({
  mode = 'create',
  courseId,
  initialData,
  currentStatus = 'DRAFT',
  onSuccess,
}: CreateCourseFormProps = {}) {
  const [form, setForm] = useState<CourseFormData>(initialData ?? defaultFormData)
  useEffect(() => {
    if (mode === 'edit' && initialData) setForm(initialData)
  }, [mode, initialData])

  const update = <K extends keyof CourseFormData>(key: K, value: CourseFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const setLearningOutcome = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.learningOutcomes]
      next[index] = value
      return { ...prev, learningOutcomes: next }
    })
  }

  const addLearningOutcome = () => {
    setForm((prev) => ({ ...prev, learningOutcomes: [...prev.learningOutcomes, ''] }))
  }

  const removeLearningOutcome = (index: number) => {
    setForm((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index),
    }))
  }

  const [addItemDialogSectionId, setAddItemDialogSectionId] = useState<string | null>(null)
  const addSectionOpen = false // unused: sections are title-only; items use addItemDialogSectionId

  const addSection = () => {
    setForm((prev) => ({ ...prev, sections: [...prev.sections, defaultSection()] }))
  }

  const addContentItemWithType = (sectionId: string, type: ContentType) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, defaultContentItem(type)] } : s
      ),
    }))
    setAddItemDialogSectionId(null)
  }

  const updateSection = (sectionId: string, title: string) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    }))
  }

  const removeSection = (sectionId: string) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }))
  }

  const addContentItem = (sectionId: string, type?: ContentType) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: [...s.items, defaultContentItem(type ?? 'video')] }
          : s
      ),
    }))
  }

  const updateContentItem = (
    sectionId: string,
    itemId: string,
    patch: Partial<ContentItem>
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
            }
          : s
      ),
    }))
  }

  const removeContentItem = (sectionId: string, itemId: string) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
      ),
    }))
  }

  function buildPayload(status: 'DRAFT' | 'PUBLISHED') {
    const learningOutcomes = form.learningOutcomes.filter((o) => o.trim() !== '')
    const sections = form.sections.map((sec, pos) => ({
      title: sec.title.trim() || 'قسم',
      items: sec.items.map((item, itemPos) => {
        const extra: Record<string, unknown> = {}
        if (item.question !== undefined && item.question !== '') extra.question = item.question
        if (item.options !== undefined && item.options.length) extra.options = item.options
        if (item.correctOptionIndices !== undefined && item.correctOptionIndices.length) extra.correctOptionIndices = item.correctOptionIndices
        if (item.description !== undefined && item.description !== '') extra.description = item.description
        if (item.fileUrl !== undefined && item.fileUrl !== '') extra.fileUrl = item.fileUrl
        return {
          type: item.type,
          title: item.title.trim() || 'عنصر',
          duration: item.duration || undefined,
          url: item.url || undefined,
          ...(Object.keys(extra).length ? extra : {}),
        }
      }),
    }))
    return {
      title: form.title.trim(),
      category: form.category.trim() || 'أخرى',
      price: form.price === '' ? 0 : parseInt(String(form.price), 10) || 0,
      imageUrl: form.imageUrl.trim() || undefined,
      duration: form.duration.trim() || undefined,
      level: form.level.trim() || undefined,
      language: form.language.trim() || undefined,
      description: form.description.trim() || undefined,
      learningOutcomes: learningOutcomes.length ? learningOutcomes : [''],
      sections,
      status,
    }
  }

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const submitStatusRef = useRef<'DRAFT' | 'PUBLISHED'>('PUBLISHED')
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault()
    if (submitting) return
    setSubmitError(null)
    if (!form.title.trim()) {
      setSubmitError('عنوان الدورة مطلوب')
      return
    }
    setSubmitting(true)
    try {
      const payload = buildPayload(status)
      const url = mode === 'edit' && courseId ? `/api/teacher/courses/${courseId}` : '/api/teacher/courses'
      const method = mode === 'edit' && courseId ? 'PATCH' : 'POST'
      const body =
        method === 'PATCH'
          ? JSON.stringify({ ...payload, status })
          : JSON.stringify(payload)
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(data.error || 'حدث خطأ')
        setSubmitting(false)
        return
      }
      onSuccess?.() ?? router.push('/dashboard/teacher/courses')
    } catch (err) {
      setSubmitError('حدث خطأ في الاتصال')
      setSubmitting(false)
    }
  }

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(e, submitStatusRef.current)
  }

  const handleArchive = async () => {
    if (mode !== 'edit' || !courseId || submitting) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSubmitError(data.error || 'حدث خطأ')
        setSubmitting(false)
        return
      }
      onSuccess?.() ?? router.push('/dashboard/teacher/courses')
    } catch (err) {
      setSubmitError('حدث خطأ في الاتصال')
      setSubmitting(false)
    }
  }

  const totalItems = form.sections.reduce((sum, s) => sum + s.items.length, 0)
  const videoAudioCount = form.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => ['video', 'audio'].includes(i.type)).length,
    0
  )
  const documentCount = form.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => ['document', 'pdf'].includes(i.type)).length,
    0
  )

  return (
    <div className="flex flex-1 flex-col gap-6 min-w-0 px-2 sm:px-0" dir="rtl">
      {/* Header – same structure as content page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 break-words">
            <GradientText
              text={mode === 'edit' ? 'تحرير الدورة' : 'إنشاء دورة جديدة'}
              gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
            />
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {mode === 'edit'
              ? 'تعديل معلومات الدورة والأقسام والمحتوى'
              : 'أدخل معلومات الدورة وأضف الأقسام والمحتوى (فيديو، مستندات، روابط، إلخ)'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-shrink-0">
          {submitError && (
            <p className="text-sm text-red-600 col-span-full" role="alert">
              {submitError}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={submitting}
            onClick={() => {
              submitStatusRef.current = 'DRAFT'
              formRef.current?.requestSubmit()
            }}
          >
            حفظ كمسودة
          </Button>
          <button
            type="submit"
            className="relative inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white rounded-xl transition-all duration-200 group/btn w-full sm:w-auto disabled:opacity-70"
            disabled={submitting}
            onClick={() => {
              submitStatusRef.current = 'PUBLISHED'
            }}
          >
            <div className="absolute transition-all duration-200 rounded-xl -inset-px bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover/btn:shadow-lg group-hover/btn:shadow-yellow-500/50" />
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
            <span className="relative z-10">
              {mode === 'edit' ? 'حفظ ونشر' : 'إنشاء الدورة'}
            </span>
          </button>
          {mode === 'edit' && courseId && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50"
              disabled={submitting}
              onClick={handleArchive}
            >
              أرشفة
            </Button>
          )}
        </div>
      </div>

      {/* Stats – same grid as content page */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 min-w-0">
        <DashboardCard
          variant="blue"
          icon={Layers}
          title="عدد الأقسام"
          value={form.sections.length}
          description="قسم في المنهج"
        />
        <DashboardCard
          variant="green"
          icon={FileText}
          title="إجمالي العناصر"
          value={totalItems}
          description={`${totalItems} عنصر`}
        />
        <DashboardCard
          variant="yellow"
          icon={Video}
          title="فيديو / صوتي"
          value={videoAudioCount}
          description="عنصر"
        />
        <DashboardCard
          variant="purple"
          icon={FileText}
          title="مستندات / PDF"
          value={documentCount}
          description="عنصر"
        />
      </div>

      <form
        ref={formRef}
        id="create-course-form"
        onSubmit={onFormSubmit}
        className="space-y-6 min-w-0"
      >
        {/* Course info */}
        <DashboardContentCard
          title="معلومات الدورة"
          description="البيانات المعروضة في صفحة الدورة وقائمة الدورات"
          icon={BookOpen}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="title" className="mb-2 block">
                عنوان الدورة
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="مثال: مقدمة في البرمجة"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="category" className="mb-2 block">
                التصنيف
              </Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">اختر التصنيف</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="price" className="mb-2 block">
                السعر (د.ج)
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="mb-2 block">
                المدة
              </Label>
              <Input
                id="duration"
                value={form.duration}
                onChange={(e) => update('duration', e.target.value)}
                placeholder="مثال: 8 أسابيع"
              />
            </div>
            <div>
              <Label htmlFor="level" className="mb-2 block">
                المستوى
              </Label>
              <select
                id="level"
                value={form.level}
                onChange={(e) => update('level', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">اختر المستوى</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="language" className="mb-2 block">
                اللغة
              </Label>
              <select
                id="language"
                value={form.language}
                onChange={(e) => update('language', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="imageUrl" className="mb-2 block">
                رابط صورة الغلاف
              </Label>
              <Input
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) => update('imageUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="description" className="mb-2 block">
                نبذة عن الدورة
              </Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="وصف مختصر للدورة..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label className="mb-2 block">ستتعلّم (قائمة نقاط)</Label>
            <div className="space-y-2">
              {form.learningOutcomes.map((outcome, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => setLearningOutcome(i, e.target.value)}
                    placeholder={`نقطة ${i + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeLearningOutcome(i)}
                    disabled={form.learningOutcomes.length <= 1}
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLearningOutcome}>
                <Plus className="h-4 w-4 ml-1" />
                إضافة نقطة
              </Button>
            </div>
          </div>
        </DashboardContentCard>

        {/* Curriculum – same style as content page: "قائمة المحتوى" + list */}
        <DashboardContentCard
          title="قائمة المحتوى"
          description={
            form.sections.length === 0
              ? 'لم يُضف أي قسم بعد'
              : totalItems === 0
                ? `${form.sections.length} قسم`
                : `${totalItems} عنصر`
          }
          icon={FileText}
        >
          {form.sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <p className="text-sm text-gray-500">لم يُضف أي قسم بعد. انقر أدناه لإضافة قسم (عنوان فقط)، ثم أضف العناصر (فيديو، PDF، إلخ) داخل كل قسم.</p>
              <Button type="button" variant="outline" onClick={addSection}>
                <Plus className="h-4 w-4 ml-1" />
                إضافة قسم
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {form.sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    {/* Section header – compact, like a group label */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 first:pt-0">
                      <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, e.target.value)}
                        placeholder="عنوان القسم (مثال: الأساسيات)"
                        className="flex-1 min-w-0 max-w-xs h-8 text-sm font-medium bg-transparent border-dashed"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        onClick={() => removeSection(section.id)}
                        aria-label="حذف القسم"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Content items – same row style as content page */}
                    {section.items.map((item) => (
                      <ContentItemRow
                        key={item.id}
                        item={item}
                        sectionId={section.id}
                        onUpdate={(itemId, patch) =>
                          updateContentItem(section.id, itemId, patch)
                        }
                        onRemove={(itemId) =>
                          removeContentItem(section.id, itemId)
                        }
                      />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAddItemDialogSectionId(section.id)}
                      className="mr-0 sm:mr-6"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة عنصر (فيديو، PDF، كويز...)
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={addSection}>
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة قسم
                </Button>
              </div>

              {/* Dialog: pick content type to add to a section */}
              <Dialog
                open={addItemDialogSectionId !== null}
                onOpenChange={(open) => !open && setAddItemDialogSectionId(null)}
              >
                <DialogContent className="sm:max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>اختر نوع العنصر</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      انقر على نوع المحتوى لإضافته إلى هذا القسم (فيديو، PDF، كويز، إلخ)
                    </p>
                  </DialogHeader>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                    {CONTENT_TYPES.map((t) => {
                      const Icon = t.icon
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() =>
                            addItemDialogSectionId &&
                            addContentItemWithType(addItemDialogSectionId, t.value)
                          }
                          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-transparent p-4 transition-all ${t.bg} ${t.hover} hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500`}
                        >
                          <span className={`p-2.5 rounded-lg bg-white/80 ${t.color}`}>
                            <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                          </span>
                          <span className="text-xs font-medium text-gray-700 line-clamp-1">
                            {t.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </DashboardContentCard>
      </form>
    </div>
  )
}
