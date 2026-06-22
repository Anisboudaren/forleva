import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import {
  getCloudflareImageHosts,
  getCloudflareS3AccessKeyId,
  getCloudflareS3Endpoint,
  getCloudflareS3ForcePathStyle,
  getCloudflareS3SecretAccessKey,
  getCloudflareS3UseSsl,
  getPublicObjectUrl,
  isCloudflareS3Configured,
} from '@/lib/cloudflare-s3-config'

export {
  getCloudflareImageHosts,
  getPublicObjectUrl,
  isCloudflareS3Configured,
} from '@/lib/cloudflare-s3-config'

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

export const ALLOWED_IMAGE_MIME_TYPES = Object.keys(IMAGE_MIME_TO_EXT)

export function getS3Client(): S3Client {
  const accessKeyId = getCloudflareS3AccessKeyId()
  const secretAccessKey = getCloudflareS3SecretAccessKey()
  const endpoint = getCloudflareS3Endpoint()
  const region = process.env.CLOUDFLARE_S3_REGION?.trim() || 'auto'

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('Cloudflare S3 credentials are not configured')
  }

  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: getCloudflareS3ForcePathStyle(),
    tls: getCloudflareS3UseSsl(),
  })
}

function sanitizeFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  return base || randomUUID()
}

const FILE_MIME_TO_EXT: Record<string, string> = {
  ...IMAGE_MIME_TO_EXT,
  'application/pdf': 'pdf',
}

export const ALLOWED_CERTIFICATE_UPLOAD_MIMES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  'application/pdf',
]

export async function uploadFileToR2(
  buffer: Buffer,
  contentType: string,
  options: { prefix: string; filename?: string; key?: string }
): Promise<{ key: string; url: string }> {
  if (!isCloudflareS3Configured()) {
    throw new Error('Cloudflare S3 is not configured')
  }

  const bucket = process.env.CLOUDFLARE_S3_BUCKET!.trim()
  const prefix = options.prefix.replace(/^\//, '').replace(/\/$/, '')
  const ext = FILE_MIME_TO_EXT[contentType] ?? 'bin'
  const key =
    options.key ??
    `${prefix}/${options.filename ? `${sanitizeFilename(options.filename)}.${ext}` : `${randomUUID()}.${ext}`}`

  const client = getS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return { key, url: getPublicObjectUrl(key) }
}

export async function uploadImageToCloudflare(
  buffer: Buffer,
  contentType: string,
  options?: { prefix?: string; filename?: string }
): Promise<{ key: string; url: string }> {
  const prefix = (options?.prefix ?? 'images').replace(/^\//, '').replace(/\/$/, '')
  const baseName = options?.filename ? sanitizeFilename(options.filename) : randomUUID()
  const ext = IMAGE_MIME_TO_EXT[contentType] ?? 'bin'
  const key = `${prefix}/${baseName}.${ext}`

  return uploadFileToR2(buffer, contentType, { prefix, key })
}

const R2_MEDIA_PREFIXES = [
  'course-covers/',
  'course-content/',
  'images/',
  'test/',
  'students-certificates/',
]

export function isAllowedR2MediaKey(key: string): boolean {
  const normalized = key.replace(/^\//, '')
  return R2_MEDIA_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

export async function getR2Object(
  key: string
): Promise<{ body: ReadableStream; contentType: string; cacheControl?: string }> {
  if (!isCloudflareS3Configured()) {
    throw new Error('Cloudflare S3 is not configured')
  }
  if (!isAllowedR2MediaKey(key)) {
    throw new Error('Object key not allowed')
  }

  const bucket = process.env.CLOUDFLARE_S3_BUCKET!.trim()
  const client = getS3Client()
  const result = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key.replace(/^\//, ''),
    })
  )

  if (!result.Body) {
    throw new Error('Object body missing')
  }

  return {
    body: result.Body.transformToWebStream(),
    contentType: result.ContentType ?? 'application/octet-stream',
    cacheControl: result.CacheControl,
  }
}
