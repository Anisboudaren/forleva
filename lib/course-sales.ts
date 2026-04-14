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
}

export type BeforeAfterItem = {
  before: string
  after: string
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
}

export const EMPTY_SALES_PAGE_DATA: SalesPageData = {
  hook: { title: '', description: '' },
  cta: { primaryText: '', secondaryText: '', urgencyNote: '' },
  formationInfo: [],
  socialProof: [],
  beforeAfter: [],
  bonuses: [],
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
          return {
            name: asText(record.name),
            role: asText(record.role),
            quote: asText(record.quote),
            rating:
              Number.isFinite(ratingValue) && ratingValue >= 1 && ratingValue <= 5
                ? ratingValue
                : undefined,
          }
        })
        .filter((item) => item.name || item.role || item.quote)
    : []

  const beforeAfter = Array.isArray(data.beforeAfter)
    ? data.beforeAfter
        .map((item) => {
          const record = (item ?? {}) as Record<string, unknown>
          return { before: asText(record.before), after: asText(record.after) }
        })
        .filter((item) => item.before || item.after)
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
  }

  const hasAnyContent =
    normalized.hook.title ||
    normalized.hook.description ||
    normalized.cta.primaryText ||
    normalized.cta.secondaryText ||
    normalized.cta.urgencyNote ||
    normalized.formationInfo.length > 0 ||
    normalized.socialProof.length > 0 ||
    normalized.beforeAfter.length > 0 ||
    normalized.bonuses.length > 0

  return hasAnyContent ? normalized : null
}
