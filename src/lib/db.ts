import { PrismaClient } from '@prisma/client'

const FALLBACK_DATABASE_URL = 'postgresql://neondb_owner:npg_BJ1sINw6ChyU@ep-empty-meadow-amjci1oh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'

/**
 * Prisma database client singleton.
 * On Vercel (serverless), each function invocation gets its own instance,
 * so we avoid the global singleton in production.
 * On local dev, we reuse the global singleton to prevent connection exhaustion.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || FALLBACK_DATABASE_URL

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // Connection pool settings optimized for serverless (Vercel/Neon)
    // https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
    ...(process.env.NODE_ENV === 'production' ? {
      // In production on Vercel, limit connection pool
      // Neon pooler handles the actual connection pooling
    } : {}),
  })
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
