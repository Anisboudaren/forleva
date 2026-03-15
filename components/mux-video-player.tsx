'use client'

import dynamic from 'next/dynamic'

const Video = dynamic(
  () => import('next-video').then((m) => m.default),
  { ssr: false }
)

/** Extract Mux playback ID from a URL like https://stream.mux.com/PLAYBACK_ID.m3u8 */
export function getMuxPlaybackIdFromUrl(url: string | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const m = url.match(/stream\.mux\.com\/([^.]+)(\.m3u8)?/i)
  return m ? m[1] : null
}

export function isMuxPlaybackUrl(url: string | undefined): boolean {
  return getMuxPlaybackIdFromUrl(url ?? '') !== null
}

type MuxVideoPlayerProps = {
  /** Mux HLS URL (e.g. https://stream.mux.com/PLAYBACK_ID.m3u8) or playback ID */
  playbackUrlOrId: string
  title?: string
  className?: string
}

export function MuxVideoPlayer({ playbackUrlOrId, title, className }: MuxVideoPlayerProps) {
  const playbackId =
    playbackUrlOrId.includes('stream.mux.com') || playbackUrlOrId.endsWith('.m3u8')
      ? getMuxPlaybackIdFromUrl(playbackUrlOrId)
      : playbackUrlOrId

  if (!playbackId) return null

  return (
    <div className={className}>
      <Video
        playbackId={playbackId}
        title={title}
        controls
        style={{ width: '100%', aspectRatio: '16/9' }}
      />
    </div>
  )
}
