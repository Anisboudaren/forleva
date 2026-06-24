import { getCloudflarePublicBaseUrl, getMediaProxyUrl } from '@/lib/cloudflare-s3-config'

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

const PUBLIC_R2_HOST_SUFFIXES = ['.r2.dev']

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

function isPrivateR2StorageHost(host: string): boolean {
  return host.toLowerCase().endsWith('.r2.cloudflarestorage.com')
}

function isAllowedHost(host: string): boolean {
  const normalized = host.toLowerCase()
  if (isPrivateR2StorageHost(normalized)) return false
  if (ALLOWED_IMAGE_HOSTS.has(normalized)) return true
  if (getEnvCloudflareHosts().includes(normalized)) return true
  return PUBLIC_R2_HOST_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
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

function buildPublicR2ImageUrl(key: string): string | null {
  const base = getCloudflarePublicBaseUrl()
  if (!base) return null
  return `${base}/${key.replace(/^\//, '')}`
}

function resolveR2ObjectKey(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('/api/media/r2/')) {
    return trimmed.slice('/api/media/r2/'.length)
  }

  const proxyKey = extractMediaProxyKey(trimmed)
  if (proxyKey) return proxyKey

  return extractR2ObjectKeyFromUrl(trimmed)
}

/**
 * Returns a browser-loadable URL for course images.
 * Private R2 S3 API URLs are rewritten to /api/media/r2/... unless a public r2.dev base is set.
 */
export function getSafeCourseImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return PLACEHOLDER_COURSE_IMAGE
  const trimmed = url.trim()
  if (!trimmed) return PLACEHOLDER_COURSE_IMAGE

  const r2Key = resolveR2ObjectKey(trimmed)
  if (r2Key) {
    const publicUrl = buildPublicR2ImageUrl(r2Key)
    if (publicUrl) return publicUrl
    return getMediaProxyUrl(r2Key)
  }

  try {
    const parsed = new URL(trimmed)
    if (isAllowedHost(parsed.hostname)) return trimmed
  } catch {
    // not an absolute URL
  }

  return PLACEHOLDER_COURSE_IMAGE
}
