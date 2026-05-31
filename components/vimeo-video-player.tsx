'use client'

import { useEffect, useMemo, useRef } from 'react'
import Player from '@vimeo/player'
import {
  getCleanVimeoEmbedUrl,
  isVimeoUrl,
  PRODUCTION_CLEAN_EMBED_OPTIONS,
} from '@/lib/vimeo'

type VimeoVideoPlayerProps = {
  videoUrl: string
  title?: string
  className?: string
  onEnded?: () => void
}

export function VimeoVideoPlayer({
  videoUrl,
  title = 'Course video',
  className,
  onEnded,
}: VimeoVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const embedSrc = useMemo(
    () => getCleanVimeoEmbedUrl(videoUrl, PRODUCTION_CLEAN_EMBED_OPTIONS),
    [videoUrl]
  )

  useEffect(() => {
    if (!onEnded || !embedSrc || !iframeRef.current) return

    let disposed = false
    const player = new Player(iframeRef.current)
    const handleEnded = () => {
      if (!disposed) onEnded()
    }
    player.on('ended', handleEnded)

    return () => {
      disposed = true
      player.off('ended', handleEnded)
    }
  }, [embedSrc, onEnded])

  if (!embedSrc || !isVimeoUrl(videoUrl)) {
    return (
      <div className={className}>
        <p className="flex aspect-video w-full items-center justify-center bg-slate-900 px-4 text-center text-sm text-slate-200">
          رابط الفيديو غير صالح أو ليس من Vimeo.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <iframe
          ref={iframeRef}
          className="absolute inset-0 h-full w-full"
          src={embedSrc}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          allowFullScreen
        />
      </div>
    </div>
  )
}
