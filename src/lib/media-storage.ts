import type COS from 'cos-nodejs-sdk-v5'

export type MediaDriver = 'db' | 'cos'

export type MediaStoreInput = {
  id: string
  bytes: Buffer
  mimeType: string
  filename: string
}

export type MediaStoreResult = {
  storage: MediaDriver
  storageKey: string | null
  url: string
}

type CosConfig = {
  secretId: string
  secretKey: string
  bucket: string
  region: string
  keyPrefix: string
}

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
}

let cosClient: COS | null = null

export class MediaStorageError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'MediaStorageError'
    this.status = status
    this.code = code
  }
}

export function getMediaDriver(): MediaDriver {
  const value = (process.env.MEDIA_DRIVER || 'db').trim().toLowerCase()
  if (value === 'db' || value === 'cos') return value
  throw new MediaStorageError(
    503,
    'invalid_media_driver',
    'MEDIA_DRIVER must be either "db" or "cos".'
  )
}

function readCosBucketConfig() {
  const bucket = process.env.COS_BUCKET?.trim()
  const region = process.env.COS_REGION?.trim()
  const missing = [!bucket && 'COS_BUCKET', !region && 'COS_REGION'].filter(Boolean)

  if (missing.length > 0) {
    throw new MediaStorageError(
      503,
      'cos_not_configured',
      `COS storage is enabled but missing: ${missing.join(', ')}.`
    )
  }

  return {
    bucket: bucket as string,
    region: region as string
  }
}

function readCosConfig(): CosConfig {
  const bucketConfig = readCosBucketConfig()
  const secretId = process.env.COS_SECRET_ID?.trim()
  const secretKey = process.env.COS_SECRET_KEY?.trim()
  const missing = [!secretId && 'COS_SECRET_ID', !secretKey && 'COS_SECRET_KEY'].filter(Boolean)

  if (missing.length > 0) {
    throw new MediaStorageError(
      503,
      'cos_not_configured',
      `COS storage is enabled but missing: ${missing.join(', ')}.`
    )
  }

  return {
    ...bucketConfig,
    secretId: secretId as string,
    secretKey: secretKey as string,
    keyPrefix: (process.env.COS_KEY_PREFIX || 'rememoi/media')
      .trim()
      .replace(/^\/+|\/+$/g, '')
  }
}

function buildObjectKey(keyPrefix: string, id: string, mimeType: string) {
  const safeId = id.replace(/[^a-zA-Z0-9._-]/g, '')
  const extension = MIME_EXTENSION[mimeType] || 'bin'
  const now = new Date()
  const year = String(now.getUTCFullYear())
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return [keyPrefix, year, month, `${safeId}.${extension}`].filter(Boolean).join('/')
}

async function getCosClient(config: CosConfig) {
  if (!cosClient) {
    const { default: CosClient } = await import('cos-nodejs-sdk-v5')
    cosClient = new CosClient({
      SecretId: config.secretId,
      SecretKey: config.secretKey
    })
  }
  return cosClient
}

async function putCosObject(config: CosConfig, key: string, input: MediaStoreInput) {
  const client = await getCosClient(config)
  await new Promise<void>((resolve, reject) => {
    client.putObject(
      {
        Bucket: config.bucket,
        Region: config.region,
        Key: key,
        Body: input.bytes,
        ContentLength: input.bytes.length,
        ContentType: input.mimeType,
        CacheControl: 'public, max-age=31536000, immutable'
      },
      (error) => {
        if (error) reject(error)
        else resolve()
      }
    )
  })
}

export async function storeMedia(input: MediaStoreInput): Promise<MediaStoreResult> {
  const driver = getMediaDriver()
  if (driver === 'db') {
    return {
      storage: 'db',
      storageKey: null,
      url: `/api/media/${input.id}`
    }
  }

  const config = readCosConfig()
  const key = buildObjectKey(config.keyPrefix, input.id, input.mimeType)

  try {
    await putCosObject(config, key, input)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown COS error'
    console.error(`[media] COS upload failed: ${message}`)
    throw new MediaStorageError(
      502,
      'cos_upload_failed',
      'The image could not be uploaded to object storage.'
    )
  }

  return {
    storage: 'cos',
    storageKey: key,
    // COS objects are private; serve them through the authenticated app proxy.
    url: `/api/media/${input.id}`
  }
}

export type CosObject = {
  body: Buffer
  etag?: string
}

/** Read a private COS object for the media proxy. */
export async function getCosObject(storageKey: string): Promise<CosObject> {
  const config = readCosConfig()
  const client = await getCosClient(config)

  return new Promise<CosObject>((resolve, reject) => {
    client.getObject(
      {
        Bucket: config.bucket,
        Region: config.region,
        Key: storageKey
      },
      (error, data) => {
        if (error) {
          reject(error)
          return
        }

        resolve({
          body: data.Body as Buffer,
          etag: data.ETag
        })
      }
    )
  })
}

/** Used when a DB insert fails after an object has already been uploaded. */
export async function deleteMediaObject(storage: MediaDriver, storageKey: string | null) {
  if (storage !== 'cos' || !storageKey) return
  const config = readCosConfig()
  const client = await getCosClient(config)
  await new Promise<void>((resolve, reject) => {
    client.deleteObject(
      { Bucket: config.bucket, Region: config.region, Key: storageKey },
      (error) => {
        if (error) reject(error)
        else resolve()
      }
    )
  })
}
