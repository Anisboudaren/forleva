import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getUserSession } from "@/lib/user-session"
import { GradientText } from "@/components/text/gradient-text"
import { BookOpen, User, FileText } from "lucide-react"
import LearningStudioClient from "@/components/student/learning-studio-client"

export default async function LearningStudioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await getUserSession()
  if (!session || session.role !== "STUDENT") {
    redirect(`/courses/${id}`)
  }

  const [order, course] = await Promise.all([
    prisma.order.findFirst({
      where: { userId: session.userId, courseId: id, status: "CONFIRMED" },
    }),
    prisma.course.findFirst({
      where: { id, status: "PUBLISHED" },
      include: {
        teacher: { select: { id: true, fullName: true } },
        sections: {
          orderBy: { position: "asc" },
          include: { items: { orderBy: { position: "asc" } } },
        },
      },
    }),
  ])

  if (!order || !course) {
    redirect(`/courses/${id}`)
  }

  const learningOutcomes = Array.isArray(course.learningOutcomes)
    ? (course.learningOutcomes as string[])
    : []

  const mappedCourse = {
    id: course.id,
    title: course.title,
    category: course.category,
    price: course.price,
    imageUrl: course.imageUrl,
    duration: course.duration,
    level: course.level,
    language: course.language,
    description: course.description,
    learningOutcomes,
    teacher: course.teacher
      ? { id: course.teacher.id, fullName: course.teacher.fullName ?? "مدرّس" }
      : null,
    sections: course.sections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      position: sec.position,
      items: sec.items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        duration: item.duration ?? undefined,
        url: item.url ?? undefined,
        position: item.position,
        extraData: item.extraData ?? undefined,
      })),
    })),
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-amber-500" />
          <span>أنت تتعلّم الآن</span>
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          <GradientText
            text={course.title}
            gradient="linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)"
          />
        </h1>
        <p className="text-sm text-gray-600 flex items-center gap-3 mt-1">
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-gray-400" />
            {course.teacher?.fullName ?? "مدرّس"}
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-gray-400" />
            {course.category}
          </span>
        </p>
      </div>

      <LearningStudioClient course={mappedCourse} />
    </div>
  )
}

