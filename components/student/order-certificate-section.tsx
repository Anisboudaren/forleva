'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OrderCertificateDialog } from '@/components/student/order-certificate-dialog'
import { Award } from 'lucide-react'

export function OrderCertificateSection() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full"
        style={{
          background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        }}
      >
        <Award className="h-4 w-4 ml-2" />
        طلب شهادة
      </Button>
      <OrderCertificateDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
