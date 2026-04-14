import type { Metadata } from 'next'
import { VimeoUploadSandbox } from '@/components/dev/vimeo-upload-sandbox'

export const metadata: Metadata = {
  title: 'Vimeo Credentials Test',
  robots: {
    index: false,
    follow: false,
  },
}

export default function VimeoCredentialsTestPage() {
  return <VimeoUploadSandbox />
}
