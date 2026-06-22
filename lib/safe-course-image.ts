/**
 * Hostnames allowed in next.config images.remotePatterns.
 * User-provided course imageUrl must match one of these or we show a placeholder.
 */
const ALLOWED_IMAGE_HOSTS = new Set([
  'cdn.rareblocks.xyz',
  'd33wubrfki0l68.cloudfront.net',
  'images.unsplash.com',
  'landingfoliocom.imgix.net',
  'i.pravatar.cc',
  'encrypted-tbn0.gstatic.com',
  'bhaavyakapur.com',
  'i.ytimg.com',
])

const R2_HOST_SUFFIXES = ['.r2.dev', '.r2.cloudflarestorage.com']

export const PLACEHOLDER_COURSE_IMAGE =
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'

function getEnvCloudflareHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_HOSTS?.trim()
  if (!raw) return []
  return raw
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
}

function getR2ImageBaseUrl(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_IMAGE_BASE?.trim().replace(/\/$/, '')
  return fromEnv || null
}

function isAllowedHost(host: string): boolean {
  const normalized = host.toLowerCase()
  if (ALLOWED_IMAGE_HOSTS.has(normalized)) return true
  if (getEnvCloudflareHosts().includes(normalized)) return true
  return R2_HOST_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
}

/** Extract object key from R2 S3 API URLs (path-style or virtual-hosted). */
export function extractR2ObjectKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.toLowerCase()
    if (!host.endsWith('.r2.cloudflarestorage.com')) return null

    const parts = parsed.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return null

    if (host.startsWith(`${parts[0]}.`)) {
      return parts.join('/')
    }

    if (parts.length < 2) return null
    return parts.slice(1).join('/')
  } catch {
    return null
  }
}

function extractMediaProxyKey(url: string): string | null {
  const match = url.match(/\/api\/media\/r2\/(.+)$/i)
  if (!match?.[1]) return null
  return decodeURIComponent(match[1])
}

function buildCloudflareImageUrl(key: string): string | null {
  const base = getR2ImageBaseUrl()
  if (!base) return null
  return `${base}/${key.replace(/^\//, '')}`
}

/**
 * Returns an absolute Cloudflare (or other allowed CDN) URL for next/image.
 * Rewrites old localhost /api/media/r2/... paths to the R2 endpoint.
 */
export function getSafeCourseImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return PLACEHOLDER_COURSE_IMAGE
  const trimmed = url.trim()
  if (!trimmed) return PLACEHOLDER_COURSE_IMAGE

  const proxyKey =
    extractMediaProxyKey(trimmed) ??
    (trimmed.startsWith('/api/media/r2/')
      ? trimmed.slice('/api/media/r2/'.length)
      : null)

  if (proxyKey) {
    const cloudflareUrl = buildCloudflareImageUrl(proxyKey)
    if (cloudflareUrl) return cloudflareUrl
  }

  try {
    const parsed = new URL(trimmed)
    if (isAllowedHost(parsed.hostname)) return trimmed
  } catch {
    // not an absolute URL — try rebuilding from R2 key below
  }

  const r2Key = extractR2ObjectKeyFromUrl(trimmed)
  if (r2Key) {
    const cloudflareUrl = buildCloudflareImageUrl(r2Key)
    if (cloudflareUrl) return cloudflareUrl
    try {
      if (isAllowedHost(new URL(trimmed).hostname)) return trimmed
    } catch {
      // ignore
    }
  }

  return PLACEHOLDER_COURSE_IMAGE
}
