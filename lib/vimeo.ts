export function getVimeoVideoId(input: string | null | undefined): string | null {
  if (!input) return null
  const value = input.trim()
  if (!value) return null

  if (/^\d+$/.test(value)) return value

  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const parts = url.pathname.split('/').filter(Boolean)

    if (host.endsWith('vimeo.com')) {
      const playerIndex = parts.indexOf('video')
      if (playerIndex >= 0 && parts[playerIndex + 1] && /^\d+$/.test(parts[playerIndex + 1])) {
        return parts[playerIndex + 1]
      }

      const last = parts[parts.length - 1]
      if (last && /^\d+$/.test(last)) return last
    }
  } catch {
    return null
  }

  return null
}

export function isVimeoUrl(input: string | null | undefined): boolean {
  return getVimeoEmbedUrl(input) !== null
}

export function getVimeoEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null
  const value = input.trim()
  if (!value) return null

  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const parts = url.pathname.split('/').filter(Boolean)

    if (host.endsWith('vimeo.com')) {
      const existingHash = url.searchParams.get('h')
      const playerIndex = parts.indexOf('video')
      if (playerIndex >= 0 && parts[playerIndex + 1] && /^\d+$/.test(parts[playerIndex + 1])) {
        const id = parts[playerIndex + 1]
        return existingHash
          ? `https://player.vimeo.com/video/${id}?h=${encodeURIComponent(existingHash)}`
          : `https://player.vimeo.com/video/${id}`
      }

      // Unlisted links often look like /{id}/{hash} and require ?h={hash} in embed URL.
      if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
        const id = parts[0]
        const hash = parts[1]
        return `https://player.vimeo.com/video/${id}?h=${encodeURIComponent(hash)}`
      }
    }
  } catch {
    // Fall through to ID-based fallback.
  }

  const id = getVimeoVideoId(value)
  if (!id) return null
  return `https://player.vimeo.com/video/${id}`
}

export type VimeoCleanEmbedOptions = {
  title?: boolean
  byline?: boolean
  portrait?: boolean
  logo?: boolean
  share?: boolean
  controls?: boolean
}

export const PRODUCTION_CLEAN_EMBED_OPTIONS: Required<VimeoCleanEmbedOptions> = {
  title: false,
  byline: false,
  portrait: false,
  logo: false,
  share: false,
  controls: true,
}

const DEFAULT_CLEAN_EMBED_OPTIONS = PRODUCTION_CLEAN_EMBED_OPTIONS

function booleanParam(value: boolean): '0' | '1' {
  return value ? '1' : '0'
}

export function getCleanVimeoEmbedUrl(
  input: string | null | undefined,
  options: VimeoCleanEmbedOptions = {}
): string | null {
  const embedUrl = getVimeoEmbedUrl(input)
  if (!embedUrl) return null

  const config = { ...DEFAULT_CLEAN_EMBED_OPTIONS, ...options }

  try {
    const url = new URL(embedUrl)
    url.searchParams.set('title', booleanParam(config.title))
    url.searchParams.set('byline', booleanParam(config.byline))
    url.searchParams.set('portrait', booleanParam(config.portrait))
    url.searchParams.set('logo', booleanParam(config.logo))
    url.searchParams.set('share', booleanParam(config.share))
    url.searchParams.set('controls', booleanParam(config.controls))
    url.searchParams.set('dnt', '1')
    url.searchParams.set('autopause', '1')
    url.searchParams.set('playsinline', '1')
    return url.toString()
  } catch {
    return embedUrl
  }
}
