import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Required for Neon serverless driver in Node.js environment
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_URL

  if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
    // Neon PostgreSQL connection
    const pool = new Pool({ connectionString: directUrl || databaseUrl })
    const adapter = new PrismaNeon(pool)
    return new PrismaClient({ adapter } as any)
  }

  // Fallback for local SQLite or other databases
  return new PrismaClient()
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
