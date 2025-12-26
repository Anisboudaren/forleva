import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Note: Next.js automatically loads .env, .env.local, .env.development, etc.
// No need to manually load dotenv in Next.js runtime

// Configure Neon for Node.js environments
if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get DATABASE_URL from environment
// Next.js automatically loads .env files, but we also load dotenv as a fallback
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  const envKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('database'))
  console.error('❌ DATABASE_URL is missing!')
  console.error('Current working directory:', process.cwd())
  console.error('Available database-related env vars:', envKeys.length > 0 ? envKeys : 'none')
  console.error('All env vars with "DATABASE" in name:', envKeys)
  console.error('Make sure you have a .env file in the project root with DATABASE_URL set')
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please check your .env file exists in the project root and contains DATABASE_URL=...'
  )
}

// Log connection string preview for debugging (first 30 chars only)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ DATABASE_URL loaded:', connectionString.substring(0, 30) + '...')
  console.log('Connection string length:', connectionString.length)
}

// Create Neon connection pool with explicit connectionString property
// Make sure connectionString is a valid string
if (typeof connectionString !== 'string' || connectionString.trim().length === 0) {
  throw new Error('DATABASE_URL must be a non-empty string')
}

const trimmedConnectionString = connectionString.trim()

// PrismaNeon constructor expects a PoolConfig object from @neondatabase/serverless
// PoolConfig includes connectionString property
const poolConfig: { connectionString: string } = {
  connectionString: trimmedConnectionString
}

const adapter = new PrismaNeon(poolConfig)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma



