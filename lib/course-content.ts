export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctOptionIndices: number[]
}

export type FormFieldType = 'text' | 'textarea' | 'single' | 'multi'

export type FormField = {
  id: string
  type: FormFieldType
  label: string
  options?: string[]
  required?: boolean
}

export type CourseItemExtraData = {
  questions?: QuizQuestion[]
  formFields?: FormField[]
  description?: string
  fileUrl?: string
  fileKey?: string
  /** @deprecated legacy single-question quiz */
  question?: string
  options?: string[]
  correctOptionIndices?: number[]
}

export function parseExtraData(raw: unknown): CourseItemExtraData {
  if (!raw || typeof raw !== 'object') return {}
  return raw as CourseItemExtraData
}

export function normalizeQuizQuestions(extra: CourseItemExtraData): QuizQuestion[] {
  if (Array.isArray(extra.questions) && extra.questions.length > 0) {
    return extra.questions.map((q, i) => ({
      id: q.id || `q${i + 1}`,
      question: q.question ?? '',
      options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['', ''],
      correctOptionIndices: Array.isArray(q.correctOptionIndices) ? q.correctOptionIndices : [],
    }))
  }
  if (extra.question) {
    return [
      {
        id: 'q1',
        question: extra.question,
        options: Array.isArray(extra.options) && extra.options.length > 0 ? extra.options : ['', ''],
        correctOptionIndices: Array.isArray(extra.correctOptionIndices) ? extra.correctOptionIndices : [],
      },
    ]
  }
  return []
}

export function sanitizeQuizForStudent(extra: CourseItemExtraData): {
  questions: Array<{ id: string; question: string; options: string[]; allowMultiple: boolean }>
} {
  const questions = normalizeQuizQuestions(extra).map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options.filter((o) => o.trim() !== ''),
    allowMultiple: (q.correctOptionIndices?.length ?? 0) > 1,
  }))
  return { questions }
}

export function sanitizeFormForStudent(extra: CourseItemExtraData): { formFields: FormField[] } {
  const fields = Array.isArray(extra.formFields) ? extra.formFields : []
  return {
    formFields: fields.map((f, i) => ({
      id: f.id || `f${i + 1}`,
      type: f.type ?? 'text',
      label: f.label ?? '',
      options: f.type === 'single' || f.type === 'multi' ? f.options ?? [''] : undefined,
      required: Boolean(f.required),
    })),
  }
}

export function buildExtraDataFromItem(item: {
  questions?: QuizQuestion[]
  formFields?: FormField[]
  description?: string
  fileUrl?: string
  fileKey?: string
}): Record<string, unknown> | null {
  const obj: Record<string, unknown> = {}
  if (item.questions && item.questions.length > 0) {
    obj.questions = item.questions
  }
  if (item.formFields && item.formFields.length > 0) {
    obj.formFields = item.formFields
  }
  if (item.description?.trim()) obj.description = item.description.trim()
  if (item.fileUrl?.trim()) obj.fileUrl = item.fileUrl.trim()
  if (item.fileKey?.trim()) obj.fileKey = item.fileKey.trim()
  return Object.keys(obj).length > 0 ? obj : null
}

export function defaultQuizQuestion(): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    question: '',
    options: ['', ''],
    correctOptionIndices: [],
  }
}

export function defaultFormField(type: FormFieldType = 'text'): FormField {
  return {
    id: crypto.randomUUID(),
    type,
    label: '',
    options: type === 'single' || type === 'multi' ? ['', ''] : undefined,
    required: false,
  }
}
