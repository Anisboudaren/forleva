function envBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue
  return value === 'true' || value === '1'
}

function isPlaceholderValue(value: string): boolean {
  const lower = value.toLowerCase()
  return lower.includes('replace_with') || lower.includes('your_') || lower === 'changeme'
}

export function getCloudflareS3AccessKeyId(): string | undefined {
  const candidates = [
    process.env.CLOUDFLARE_S3_ACCESS_KEY_ID,
    process.env.ACCESS_KEY_ID,
    process.env.CLOUDFLARE_S3_API_KEY,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))

  const hex32 = candidates.find((value) => /^[a-f0-9]{32}$/i.test(value))
  if (hex32) return hex32

  return candidates.find((value) => !isPlaceholderValue(value))
}

export function getCloudflareS3SecretAccessKey(): string | undefined {
  const candidates = [
    process.env.CLOUDFLARE_S3_SECRET_ACCESS_KEY,
    process.env.SECRET_ACCESS_KEY,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))

  return candidates.find((value) => !isPlaceholderValue(value) && !value.startsWith('cfat_'))
}

export function getCloudflareAccountId(): string | undefined {
  return (
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ||
    process.env.ACCOUNT_ID?.trim() ||
    undefined
  )
}

/**
 * Resolves the S3 API endpoint for R2.
 * Uses CLOUDFLARE_S3_ENDPOINT when it already points at R2; otherwise builds from account id.
 */
export function getCloudflareS3Endpoint(): string | undefined {
  const explicit = process.env.CLOUDFLARE_S3_ENDPOINT?.trim().replace(/\/$/, '')
  if (explicit?.toLowerCase().includes('r2.cloudflarestorage.com')) {
    return explicit
  }

  const accountId = getCloudflareAccountId()
  if (accountId) {
    return `https://${accountId}.r2.cloudflarestorage.com`
  }

  if (explicit && !explicit.toLowerCase().includes('cloudflarestream.com')) {
    return explicit
  }

  return undefined
}

export type StorageConfigIssue = {
  code: string
  message: string
  hint?: string
}

export function getCloudflareS3ConfigIssues(): StorageConfigIssue[] {
  const issues: StorageConfigIssue[] = []

  const accessKey = getCloudflareS3AccessKeyId()
  if (!accessKey) {
    issues.push({
      code: 'MISSING_ACCESS_KEY',
      message: 'مفتاح الوصول مفقود',
      hint: 'أضف CLOUDFLARE_S3_ACCESS_KEY_ID أو ACCESS_KEY_ID (32 حرفاً من R2 API Token)',
    })
  } else if (!/^[a-f0-9]{32}$/i.test(accessKey)) {
    issues.push({
      code: 'INVALID_ACCESS_KEY_FORMAT',
      message: `Access Key ID غير صالح (الطول ${accessKey.length}، المطلوب 32 حرفاً hex)`,
      hint: 'انسخ Access Key ID من R2 → Manage R2 API Tokens (ليس API_TOKEN ولا REPLACE_WITH...)',
    })
  }

  const secretKey = getCloudflareS3SecretAccessKey()
  const rawSecret =
    process.env.CLOUDFLARE_S3_SECRET_ACCESS_KEY?.trim() ||
    process.env.SECRET_ACCESS_KEY?.trim()

  if (!secretKey) {
    if (rawSecret?.startsWith('cfat_') || process.env.API_TOKEN?.trim().startsWith('cfat_')) {
      issues.push({
        code: 'WRONG_SECRET_TYPE',
        message: 'API_TOKEN (cfat_) ليس Secret Access Key لـ R2',
        hint: 'عند إنشاء R2 API Token يظهر Secret Access Key طويل مرة واحدة — ضعه في CLOUDFLARE_S3_SECRET_ACCESS_KEY',
      })
    } else {
      issues.push({
        code: 'MISSING_SECRET_KEY',
        message: 'المفتاح السري مفقود',
        hint: 'أضف CLOUDFLARE_S3_SECRET_ACCESS_KEY (من نفس R2 API Token، ليس cfat_)',
      })
    }
  } else if (accessKey && accessKey === secretKey) {
    issues.push({
      code: 'INVALID_CREDENTIALS',
      message: 'مفتاح الوصول والمفتاح السري لا يمكن أن يكونا نفس القيمة',
      hint: 'من Cloudflare: R2 → Manage R2 API Tokens → Create API token (Object Read & Write)',
    })
  }

  if (!process.env.CLOUDFLARE_S3_BUCKET?.trim()) {
    issues.push({
      code: 'MISSING_BUCKET',
      message: 'اسم الدلو مفقود',
      hint: 'أضف CLOUDFLARE_S3_BUCKET',
    })
  }

  if (!getCloudflareS3Endpoint()) {
    const explicit = process.env.CLOUDFLARE_S3_ENDPOINT?.trim().toLowerCase()
    const hasStreamEndpoint = explicit?.includes('cloudflarestream.com')
    issues.push({
      code: hasStreamEndpoint ? 'WRONG_ENDPOINT' : 'MISSING_ENDPOINT',
      message: hasStreamEndpoint
        ? 'CLOUDFLARE_S3_ENDPOINT يشير إلى Stream وليس R2'
        : 'رابط نقطة النهاية مفقود',
      hint: hasStreamEndpoint
        ? 'أضف CLOUDFLARE_ACCOUNT_ID (من لوحة Cloudflare) أو غيّر CLOUDFLARE_S3_ENDPOINT إلى https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com'
        : 'أضف CLOUDFLARE_ACCOUNT_ID أو CLOUDFLARE_S3_ENDPOINT',
    })
  } else if (!process.env.CLOUDFLARE_S3_PUBLIC_BASE_URL?.trim()) {
    const endpoint = getCloudflareS3Endpoint()!.toLowerCase()
    if (endpoint.includes('r2.cloudflarestorage.com')) {
      issues.push({
        code: 'PUBLIC_URL_RECOMMENDED',
        message: 'يُنصح بإضافة رابط عام للصور',
        hint: 'أضف CLOUDFLARE_S3_PUBLIC_BASE_URL (مثل https://pub-xxxx.r2.dev)',
      })
    }
  }

  return issues
}

export function isCloudflareS3Configured(): boolean {
  return getCloudflareS3ConfigIssues().filter(
    (issue) => issue.code !== 'PUBLIC_URL_RECOMMENDED'
  ).length === 0
}

export function getCloudflareS3ForcePathStyle(): boolean {
  const explicit = process.env.CLOUDFLARE_S3_FORCE_PATH_STYLE
  if (explicit !== undefined && explicit !== '') {
    return envBool(explicit, true)
  }
  // R2 requires path-style requests; virtual-hosted bucket URLs do not resolve.
  const endpoint = getCloudflareS3Endpoint()?.toLowerCase() ?? ''
  return endpoint.includes('r2.cloudflarestorage.com')
}

export function getCloudflareS3UseSsl(): boolean {
  return envBool(process.env.CLOUDFLARE_S3_USE_SSL, true)
}

/** Hostnames used for next/image and safe URL checks (from env at build/runtime). */
export function getCloudflareImageHosts(): string[] {
  const hosts: string[] = []
  const add = (url: string | undefined) => {
    if (!url) return
    try {
      hosts.push(new URL(url).hostname.toLowerCase())
    } catch {
      // ignore invalid URL
    }
  }

  add(process.env.CLOUDFLARE_S3_PUBLIC_BASE_URL)
  add(getCloudflareS3Endpoint())

  const bucket = process.env.CLOUDFLARE_S3_BUCKET?.trim()
  const endpoint = getCloudflareS3Endpoint()
  if (bucket && endpoint && !getCloudflareS3ForcePathStyle()) {
    try {
      const ep = new URL(endpoint)
      hosts.push(`${bucket}.${ep.hostname}`.toLowerCase())
    } catch {
      // ignore
    }
  }

  return [...new Set(hosts)]
}

/** Base URL for publicly addressable course images (r2.dev or path-style R2 endpoint). */
export function getCloudflareR2ImageBaseUrl(): string | null {
  const publicBase = process.env.CLOUDFLARE_S3_PUBLIC_BASE_URL?.trim().replace(/\/$/, '')
  if (publicBase) return publicBase

  const bucket = process.env.CLOUDFLARE_S3_BUCKET?.trim()
  const endpoint = getCloudflareS3Endpoint()?.replace(/\/$/, '')
  if (!bucket || !endpoint) return null

  if (getCloudflareS3ForcePathStyle()) {
    return `${endpoint}/${bucket}`
  }

  try {
    const ep = new URL(endpoint)
    return `${ep.protocol}//${bucket}.${ep.host}`
  } catch {
    return `${endpoint}/${bucket}`
  }
}

export function getPublicObjectUrl(key: string): string {
  const normalizedKey = key.replace(/^\//, '')
  const base = getCloudflareR2ImageBaseUrl()
  if (!base) {
    throw new Error('Cloudflare R2 image base URL is not configured')
  }
  return `${base}/${normalizedKey}`
}
