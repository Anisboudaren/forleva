import { prisma } from '@/lib/db'

export const SITE_SETTINGS_ID = 'global'

/** Current hardcoded defaults, used as fallback when a field is unset. */
export const SITE_SETTINGS_DEFAULTS = {
  siteTitle: 'Forleva',
  siteDescription: 'منصة تعليمية اجتماعية للمتعلمين',
  ogImageUrl: null as string | null,
  faviconUrl: null as string | null,
  logoUrl: '/logo with brand name (black colored ).png',
}

export type SiteSettingsValues = {
  siteTitle: string
  siteDescription: string
  ogImageUrl: string | null
  ogImageKey: string | null
  faviconUrl: string | null
  faviconKey: string | null
  logoUrl: string
  logoKey: string | null
}

/**
 * Read the singleton site settings row, merged with defaults.
 * Read directly (no cache) so admin changes always reflect immediately.
 */
export async function getSiteSettings(): Promise<SiteSettingsValues> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: SITE_SETTINGS_ID },
    })
    return {
      siteTitle: row?.siteTitle?.trim() || SITE_SETTINGS_DEFAULTS.siteTitle,
      siteDescription:
        row?.siteDescription?.trim() || SITE_SETTINGS_DEFAULTS.siteDescription,
      ogImageUrl: row?.ogImageUrl?.trim() || SITE_SETTINGS_DEFAULTS.ogImageUrl,
      ogImageKey: row?.ogImageKey ?? null,
      faviconUrl: row?.faviconUrl?.trim() || SITE_SETTINGS_DEFAULTS.faviconUrl,
      faviconKey: row?.faviconKey ?? null,
      logoUrl: row?.logoUrl?.trim() || SITE_SETTINGS_DEFAULTS.logoUrl,
      logoKey: row?.logoKey ?? null,
    }
  } catch {
    return {
      siteTitle: SITE_SETTINGS_DEFAULTS.siteTitle,
      siteDescription: SITE_SETTINGS_DEFAULTS.siteDescription,
      ogImageUrl: SITE_SETTINGS_DEFAULTS.ogImageUrl,
      ogImageKey: null,
      faviconUrl: SITE_SETTINGS_DEFAULTS.faviconUrl,
      faviconKey: null,
      logoUrl: SITE_SETTINGS_DEFAULTS.logoUrl,
      logoKey: null,
    }
  }
}
