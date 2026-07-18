/**
 * Course promotional pricing helpers.
 *
 * A discount is only ever shown when the course has a real `originalPrice`
 * greater than its current `price`. There is no fabricated/heuristic
 * compare-at price — when no original price is set, callers should show a
 * neutral "limited offer" treatment instead of a fake discount.
 */

/**
 * Returns the compare-at ("was") price when a real original price greater than
 * the current price is set, otherwise `null`.
 */
export function getCompareAtPrice(
  price: number,
  originalPrice?: number | null
): number | null {
  if (
    typeof originalPrice === 'number' &&
    Number.isFinite(originalPrice) &&
    Number.isFinite(price) &&
    originalPrice > price
  ) {
    return Math.round(originalPrice)
  }
  return null
}

/**
 * Computes the real promotional savings for a course. Only returns a value
 * when a real `originalPrice` greater than the current price is set, so the
 * displayed percentage is always the true discount.
 */
export function getRealPromoSavings(
  price: number,
  originalPrice?: number | null
): {
  compareAtPrice: number
  savedAmount: number
  discountPercent: number
} | null {
  const compareAtPrice = getCompareAtPrice(price, originalPrice)
  if (compareAtPrice === null) return null
  const savedAmount = compareAtPrice - price
  const discountPercent = Math.round((savedAmount / compareAtPrice) * 100)
  return { compareAtPrice, savedAmount, discountPercent }
}
