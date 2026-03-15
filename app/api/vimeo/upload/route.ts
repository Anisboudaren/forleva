import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserSession } from '@/lib/user-session'

// Ensure we run in the Node.js runtime (needed for Buffer, etc.)
export const runtime = 'nodejs'

const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024 // 500MB hard limit
const ALLOWED_MIME_PREFIX = 'video/'

// Very simple in-memory rate limiting per user (best-effort, not perfect across serverless instances).
// Limits each teacher to 5 uploads per rolling 10 minutes.
type UploadWindow = { timestamps: number[] }
const uploadWindows = new Map<string, UploadWindow>()
const UPLOAD_LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const window = uploadWindows.get(userId) ?? { timestamps: [] }
  // Remove old timestamps
  window.timestamps = window.timestamps.filter((t) => now - t < WINDOW_MS)
  if (window.timestamps.length >= UPLOAD_LIMIT) {
    uploadWindows.set(userId, window)
    return false
  }
  window.timestamps.push(now)
  uploadWindows.set(userId, window)
  return true
}

async function createVimeoUpload(
  token: string,
  fileSize: number,
  name: string
): Promise<{ uploadLink: string; videoUri: string; videoUrl: string }> {
  const res = await fetch('https://api.vimeo.com/me/videos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
    },
    body: JSON.stringify({
      upload: {
        approach: 'tus',
        size: fileSize,
      },
      name,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to initiate Vimeo upload: ${res.status} ${text}`)
  }

  const data = (await res.json()) as {
    upload?: { upload_link?: string }
    uri?: string
    link?: string
  }

  const uploadLink = data.upload?.upload_link
  const videoUri = data.uri
  const videoUrl = data.link

  if (!uploadLink || !videoUri || !videoUrl) {
    throw new Error('Vimeo response missing upload_link / uri / link')
  }

  return { uploadLink, videoUri, videoUrl }
}

async function uploadToVimeoTus(
  uploadLink: string,
  fileBuffer: Buffer,
  token: string
): Promise<void> {
  // For simplicity, we send the entire file in one PATCH request.
  // Vimeo TUS supports multiple PATCHes with offsets; a single PATCH works for most cases.
  const res = await fetch(uploadLink, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Tus-Resumable': '1.0.0',
      'Upload-Offset': '0',
      'Content-Type': 'application/offset+octet-stream',
      'Content-Length': String(fileBuffer.byteLength),
    },
    body: fileBuffer,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to upload video to Vimeo: ${res.status} ${text}`)
  }
}

async function waitForTranscodeComplete(
  token: string,
  videoUri: string
): Promise<void> {
  const maxAttempts = 10
  const delayMs = 3000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(`https://api.vimeo.com${videoUri}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Failed to check Vimeo transcode status: ${res.status} ${text}`)
    }

    const data = (await res.json()) as {
      transcode?: { status?: string }
    }

    const status = data.transcode?.status
    if (status === 'complete') return
    if (status === 'error') {
      throw new Error('Vimeo transcode failed')
    }

    // Still in progress
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  // If still not complete after maxAttempts, we return anyway;
  // the video may become playable shortly after.
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!checkRateLimit(session.userId)) {
    return NextResponse.json(
      { error: 'عدد كبير من عمليات الرفع، حاول لاحقاً' },
      { status: 429 }
    )
  }

  const token = process.env.VIMEO_ACCESS_TOKEN
  if (!token) {
    console.error('VIMEO_ACCESS_TOKEN is not configured')
    return NextResponse.json(
      { error: 'إعدادات الفيديو غير مفعّلة حالياً' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const name = (formData.get('name') as string | null) ?? 'Course video'
    const courseId = formData.get('courseId') as string | null

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'ملف الفيديو مطلوب' }, { status: 400 })
    }

    const size = file.size
    const mime = file.type || ''

    if (!mime.startsWith(ALLOWED_MIME_PREFIX)) {
      return NextResponse.json(
        { error: 'يجب أن يكون الملف فيديو صالحاً' },
        { status: 400 }
      )
    }
    if (size <= 0 || size > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'حجم الفيديو كبير جداً، الرجاء تقليصه' },
        { status: 400 }
      )
    }

    // Read file into memory buffer – for very large files you may want a streaming approach.
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 1) Create Vimeo upload and get TUS upload_link + video URI + public link
    const { uploadLink, videoUri, videoUrl } = await createVimeoUpload(
      token,
      buffer.byteLength,
      name
    )

    // 2) Upload file via TUS PATCH
    await uploadToVimeoTus(uploadLink, buffer, token)

    // 3) Optionally wait for transcode completion
    await waitForTranscodeComplete(token, videoUri).catch((err) => {
      // Log but don't fail the whole request; the video may still become playable.
      console.warn('Vimeo transcode polling error:', err)
    })

    // 4) If a courseId is provided, update that course's main promo video URL immediately.
    let updatedCourseId: string | null = null
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          teacherId: session.userId,
        },
        select: { id: true },
      })

      if (!course) {
        return NextResponse.json(
          { error: 'لم يتم العثور على الدورة' },
          { status: 404 }
        )
      }

      const updated = await prisma.course.update({
        where: { id: course.id },
        data: { videoUrl },
        select: { id: true },
      })
      updatedCourseId = updated.id
    }

    const vimeoId = videoUri.split('/').filter(Boolean).pop() ?? ''

    return NextResponse.json({
      videoUrl,
      vimeoId,
      courseId: updatedCourseId,
    })
  } catch (err) {
    console.error('POST /api/vimeo/upload error', err)
    return NextResponse.json(
      { error: 'فشل رفع الفيديو، حاول مرة أخرى' },
      { status: 500 }
    )
  }
}

