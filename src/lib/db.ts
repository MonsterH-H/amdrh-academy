import { PrismaClient } from '@prisma/client'

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
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
