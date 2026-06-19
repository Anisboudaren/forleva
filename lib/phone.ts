/** Algerian mobile: 05/06/07 + 8 digits */
export function normalizeAlgerianPhone(raw: string): string {
  return raw.trim().replace(/\s/g, '')
}

export function isValidAlgerianPhone(phone: string): boolean {
  return /^0[567][0-9]{8}$/.test(phone)
}
