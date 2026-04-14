import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { GradientText } from '@/components/text/gradient-text'

type Props = {
  searchParams: Promise<{ order_id?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const orderId = typeof params.order_id === 'string' ? params.order_id : undefined

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-gray-50" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          <GradientText
            text="تم الدفع بنجاح"
            gradient="linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)"
          />
        </h1>
        <p className="text-gray-600">
          تم استلام دفعتك. يجري تأكيد العملية تلقائياً عبر نظام الدفع، وستظهر الدورة في حسابك فور اكتمال التأكيد.
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
            href="/dashboard/student/my-courses"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
          >
            دوراتي
          </Link>
        </div>
        {orderId && (
          <p className="text-xs text-gray-400 font-mono">طلب #{orderId.slice(0, 8)}</p>
        )}
      </div>
    </div>
  )
}
