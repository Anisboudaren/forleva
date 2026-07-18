export type SalesBonusType = 'free' | 'paid'

export type SalesHook = {
  title: string
  description: string
}

export type SalesCta = {
  primaryText: string
  secondaryText: string
  urgencyNote: string
}

export type FormationInfoItem = {
  title: string
  value: string
}

export type SocialProofItem = {
  name: string
  role: string
  quote: string
  rating?: number
  /** Optional screenshot image (e.g. a real review/DM) shown for this item. */
  imageUrl?: string
}

export type BeforeAfterItem = {
  before: string
  after: string
  /** Optional images for the draggable before/after comparison slider. */
  beforeImageUrl?: string
  afterImageUrl?: string
}

export type BonusItem = {
  title: string
  description: string
  type: SalesBonusType
  price?: number
}

export type SalesPageData = {
  hook: SalesHook
  cta: SalesCta
  formationInfo: FormationInfoItem[]
  socialProof: SocialProofItem[]
  beforeAfter: BeforeAfterItem[]
  bonuses: BonusItem[]
  /** Checklist items shown under the enroll CTA on the course landing page. */
  includedBenefits: string[]
}

export const DEFAULT_INCLUDED_BENEFITS = [
  'وصول لمدة 12 شهر',
  'شهادة مشاركة',
  'تحديثات مجانية للمحتوى',
] as const

export const EMPTY_SALES_PAGE_DATA: SalesPageData = {
  hook: { title: '', description: '' },
  cta: { primaryText: '', secondaryText: '', urgencyNote: '' },
  formationInfo: [],
  socialProof: [],
  beforeAfter: [],
  bonuses: [],
  includedBenefits: [...DEFAULT_INCLUDED_BENEFITS],
}

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeSalesPageData(input: unknown): SalesPageData | null {
  if (!input || typeof input !== 'object') return null
  const data = input as Record<string, unknown>

  const hookRaw = (data.hook ?? {}) as Record<string, unknown>
  const ctaRaw = (data.cta ?? {}) as Record<string, unknown>

  const formationInfo = Array.isArray(data.formationInfo)
    ? data.formationInfo
        .map((item) => {
          const record = (item ?? {}) as Record<string, unknown>
          return { title: asText(record.title), value: asText(record.value) }
        })
        .filter((item) => item.title || item.value)
    : []

  const socialProof = Array.isArray(data.socialProof)
    ? data.socialProof
        .map((item) => {
          const record = (item ?? {}) as Record<string, unknown>
          const ratingValue = Number(record.rating)
          const imageUrl = asText(record.imageUrl)
          return {
            name: asText(record.name),
            role: asText(record.role),
            quote: asText(record.quote),
            rating:
              Number.isFinite(ratingValue) && ratingValue >= 1 && ratingValue <= 5
                ? ratingValue
                : undefined,
            ...(imageUrl ? { imageUrl } : {}),
          }
        })
        .filter((item) => item.name || item.role || item.quote || item.imageUrl)
    : []

  const beforeAfter = Array.isArray(data.beforeAfter)
    ? data.beforeAfter
        .map((item) => {
          const record = (item ?? {}) as Record<string, unknown>
          const beforeImageUrl = asText(record.beforeImageUrl)
          const afterImageUrl = asText(record.afterImageUrl)
          return {
            before: asText(record.before),
            after: asText(record.after),
            ...(beforeImageUrl ? { beforeImageUrl } : {}),
            ...(afterImageUrl ? { afterImageUrl } : {}),
          }
        })
        .filter(
          (item) => item.before || item.after || item.beforeImageUrl || item.afterImageUrl
        )
    : []

  const bonuses = Array.isArray(data.bonuses)
    ? data.bonuses
        .map((item) => {
          const record = (item ?? {}) as Record<string, unknown>
          const bonusType: SalesBonusType = record.type === 'paid' ? 'paid' : 'free'
          const priceValue = Number(record.price)
          return {
            title: asText(record.title),
            description: asText(record.description),
            type: bonusType,
            price:
              bonusType === 'paid' && Number.isFinite(priceValue) && priceValue > 0
                ? Math.round(priceValue)
                : undefined,
          }
        })
        .filter((item) => item.title || item.description)
    : []

  const includedBenefits = Array.isArray(data.includedBenefits)
    ? data.includedBenefits
        .map((item) => asText(item))
        .filter(Boolean)
    : [...DEFAULT_INCLUDED_BENEFITS]

  const normalized: SalesPageData = {
    hook: {
      title: asText(hookRaw.title),
      description: asText(hookRaw.description),
    },
    cta: {
      primaryText: asText(ctaRaw.primaryText),
      secondaryText: asText(ctaRaw.secondaryText),
      urgencyNote: asText(ctaRaw.urgencyNote),
    },
    formationInfo,
    socialProof,
    beforeAfter,
    bonuses,
    includedBenefits:
      includedBenefits.length > 0 ? includedBenefits : [...DEFAULT_INCLUDED_BENEFITS],
  }

  const hasAnyContent =
    Boolean(normalized.hook.title) ||
    Boolean(normalized.hook.description) ||
    Boolean(normalized.cta.primaryText) ||
    Boolean(normalized.cta.secondaryText) ||
    Boolean(normalized.cta.urgencyNote) ||
    normalized.formationInfo.length > 0 ||
    normalized.socialProof.length > 0 ||
    normalized.beforeAfter.length > 0 ||
    normalized.bonuses.length > 0 ||
    Array.isArray(data.includedBenefits)

  return hasAnyContent ? normalized : null
}
