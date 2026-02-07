'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateCourseForm } from '@/components/teacher/create-course-form'
import type { CourseFormData, ContentItem } from '@/components/teacher/create-course-form'

type CourseApi = {
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
  status: string
  sections: {
    id: string
    title: string
    position: number
    items: {
      id: string
      type: string
      title: string
      duration?: string
      url?: string
      position: number
      question?: string
      options?: string[]
      correctOptionIndices?: number[]
      description?: string
      fileUrl?: string
    }[]
  }[]
}

function mapApiToFormData(c: CourseApi): CourseFormData {
  return {
    title: c.title,
    category: c.category,
    price: String(c.price),
    imageUrl: c.imageUrl ?? '',
    duration: c.duration ?? '',
    level: c.level ?? '',
    language: c.language ?? 'العربية',
    description: c.description ?? '',
    learningOutcomes: Array.isArray(c.learningOutcomes) && c.learningOutcomes.length > 0 ? c.learningOutcomes : [''],
    sections: c.sections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      items: sec.items.map((item) => ({
        id: item.id,
        type: item.type as ContentItem['type'],
        title: item.title,
        duration: item.duration ?? '',
        url: item.url ?? '',
        question: item.question,
        options: item.options,
        correctOptionIndices: item.correctOptionIndices,
        description: item.description,
        fileUrl: item.fileUrl,
      })),
    })),
  }
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''
  const [course, setCourse] = useState<CourseApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    fetch(`/api/teacher/courses/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'الدورة غير موجودة' : 'حدث خطأ')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setCourse(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'حدث خطأ')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    )
  }
  if (error || !course) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="text-red-600">{error || 'الدورة غير موجودة'}</p>
        <Link href="/dashboard/teacher/courses" className="text-yellow-600 hover:underline">
          العودة إلى الدورات
        </Link>
      </div>
    )
  }

  return (
    <CreateCourseForm
      mode="edit"
      courseId={course.id}
      initialData={mapApiToFormData(course)}
      currentStatus={course.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'}
      onSuccess={() => router.push('/dashboard/teacher/courses')}
    />
  )
}
