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

export function getVimeoEmbedUrl(input: string | null | undefined): string | null {
  const id = getVimeoVideoId(input)
  if (!id) return null
  return `https://player.vimeo.com/video/${id}`
}
