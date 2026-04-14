import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Public API: list published courses (no auth).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q')?.trim() ?? ''
    const query = rawQuery.length > 0 ? rawQuery : null
    const parsedLimit = Number(searchParams.get('limit'))
    const take = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(Math.floor(parsedLimit), 1), 50)
      : query
        ? 5
        : 100

    // #region agent log
    fetch('http://127.0.0.1:7467/ingest/cc5c563b-a5bd-4c98-8111-1f8af986f108',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f2017b'},body:JSON.stringify({sessionId:'f2017b',runId:'run1',hypothesisId:'H5',location:'app/api/courses/route.ts:18',message:'api courses query params parsed',data:{hasQuery:Boolean(query),queryLength:query?.length ?? 0,take},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                {
                  teacher: {
                    fullName: { contains: query, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take,
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        imageUrl: true,
        duration: true,
        level: true,
        language: true,
        teacher: { select: { fullName: true } },
      },
    })
    // #region agent log
    fetch('http://127.0.0.1:7467/ingest/cc5c563b-a5bd-4c98-8111-1f8af986f108',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f2017b'},body:JSON.stringify({sessionId:'f2017b',runId:'run1',hypothesisId:'H5',location:'app/api/courses/route.ts:53',message:'api courses db result count',data:{resultCount:courses.length,hasQuery:Boolean(query)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      courses.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        price: c.price,
        imageUrl: c.imageUrl,
        duration: c.duration,
        level: c.level,
        language: c.language,
        instructor: c.teacher?.fullName ?? 'مدرّس',
      }))
    )
  } catch (e) {
    console.error('GET /api/courses', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
