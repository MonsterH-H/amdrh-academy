import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Load .env file manually as fallback for the NEON_DATABASE_URL.
 * This handles cases where shell environment has a stale DATABASE_URL.
 */
function loadEnvValue(key: string): string | undefined {
  const envVal = process.env[key]
  if (envVal && envVal.startsWith('postgresql://')) return envVal

  try {
    const envPath = join(process.cwd(), '.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed.startsWith(`${key}=`)) {
        let value = trimmed.slice(key.length + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (value.startsWith('postgresql://')) return value
      }
    }
  } catch { /* ignore */ }
  return undefined
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const neonUrl = loadEnvValue('NEON_DATABASE_URL') || loadEnvValue('DATABASE_URL')

  if (neonUrl) {
    return new PrismaClient({
      datasources: {
        db: {
          url: neonUrl,
        },
      },
      // Reduce connection pool for serverless / dev environment
      // Prevents connection exhaustion with Neon's pooler
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    })
  }

  return new PrismaClient()
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
