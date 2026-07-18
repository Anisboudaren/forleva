'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getSafeCourseImageUrl } from '@/lib/safe-course-image'

type BeforeAfterSliderProps = {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
}

/**
 * Draggable before/after image comparison slider.
 * The "after" image sits on top and is clipped by a vertical divider that the
 * user can drag left/right (mouse or touch).
 */
export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'قبل',
  afterLabel = 'بعد',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [position, setPosition] = useState(50)

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, ratio)))
  }, [])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      updateFromClientX(e.clientX)
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return
      const touch = e.touches[0]
      if (touch) updateFromClientX(touch.clientX)
    }
    const stop = () => {
      draggingRef.current = false
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', stop)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', stop)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', stop)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', stop)
    }
  }, [updateFromClientX])

  const startDrag = () => {
    draggingRef.current = true
  }

  const safeBefore = getSafeCourseImageUrl(beforeUrl)
  const safeAfter = getSafeCourseImageUrl(afterUrl)

  return (
    <div
      ref={containerRef}
      className='relative w-full aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 select-none'
      dir='ltr'
      onMouseDown={(e) => {
        startDrag()
        updateFromClientX(e.clientX)
      }}
      onTouchStart={(e) => {
        startDrag()
        const touch = e.touches[0]
        if (touch) updateFromClientX(touch.clientX)
      }}
    >
      {/* Before image (base layer) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeBefore}
        alt={beforeLabel}
        draggable={false}
        className='absolute inset-0 h-full w-full object-cover pointer-events-none'
      />
      <span className='absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white'>
        {beforeLabel}
      </span>

      {/* After image (top layer, clipped) */}
      <div
        className='absolute inset-0 overflow-hidden pointer-events-none'
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeAfter}
          alt={afterLabel}
          draggable={false}
          className='absolute inset-0 h-full w-full object-cover'
        />
        <span className='absolute bottom-3 right-3 rounded-full bg-emerald-600/80 px-3 py-1 text-xs font-bold text-white'>
          {afterLabel}
        </span>
      </div>

      {/* Divider + handle */}
      <div
        className='absolute top-0 bottom-0 z-20 w-1 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]'
        style={{ left: `${position}%` }}
      >
        <button
          type='button'
          aria-label='اسحب للمقارنة'
          onMouseDown={(e) => {
            e.stopPropagation()
            startDrag()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            startDrag()
          }}
          className='absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-gray-700 shadow-lg ring-1 ring-black/10'
        >
          <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth={2}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M9 6l-4 6 4 6M15 6l4 6-4 6' />
          </svg>
        </button>
      </div>
    </div>
  )
}
