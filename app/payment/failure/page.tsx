import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'

type Props = {
  searchParams: Promise<{ order_id?: string }>
}

export default async function PaymentFailurePage({ searchParams }: Props) {
  const params = await searchParams
  const orderId = typeof params.order_id === 'string' ? params.order_id : undefined

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-gray-50" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          <GradientText
            text="لم يتم إتمام الدفع"
            gradient="linear-gradient(90deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)"
          />
        </h1>
        <p className="text-gray-600">
          لم تكتمل عملية الدفع أو تم إلغاؤها. يمكنك إعادة المحاولة من طلباتك أو من صفحة الدورة.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/dashboard/student/orders"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)' }}
          >
            عرض طلباتي
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
          >
            تصفح الدورات
          </Link>
        </div>
        {orderId && (
          <p className="text-xs text-gray-400 font-mono">طلب #{orderId.slice(0, 8)}</p>
        )}
      </div>
    </div>
  )
}
