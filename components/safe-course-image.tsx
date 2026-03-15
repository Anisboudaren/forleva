'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { getSafeCourseImageUrl } from '@/lib/safe-course-image'

type SafeCourseImageProps = {
  src: string | null | undefined
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  width?: number
  height?: number
  quality?: number
}

/**
 * Renders a course image that never breaks the page: invalid or unconfigured URLs
 * are replaced with a placeholder, and on load error (e.g. 404) a placeholder is shown.
 */
export function SafeCourseImage({
  src,
  alt,
  fill = false,
  className,
  sizes,
  priority,
  width,
  height,
  quality,
}: SafeCourseImageProps) {
  const safeSrc = getSafeCourseImageUrl(src)
  const [error, setError] = useState(false)

  if (error || !safeSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className ?? ''}`}
        style={
          fill
            ? { position: 'absolute', inset: 0 }
            : width && height
              ? { width, height, minHeight: 200 }
              : undefined
        }
      >
        <ImageIcon className="h-12 w-12" aria-hidden />
      </div>
    )
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      onError={() => setError(true)}
    />
  )
}
