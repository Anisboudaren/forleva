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

export const PLACEHOLDER_COURSE_IMAGE =
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'

/**
 * Returns a URL safe to use with next/image, or a placeholder if the URL's host is not allowed.
 * Prevents runtime errors from unconfigured or invalid image URLs (e.g. Google image search links).
 */
export function getSafeCourseImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return PLACEHOLDER_COURSE_IMAGE
  const trimmed = url.trim()
  if (!trimmed) return PLACEHOLDER_COURSE_IMAGE
  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.toLowerCase()
    if (ALLOWED_IMAGE_HOSTS.has(host)) return trimmed
  } catch {
    // Invalid URL
  }
  return PLACEHOLDER_COURSE_IMAGE
}
