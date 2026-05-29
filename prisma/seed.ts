import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Neon PostgreSQL connection
// Uses DIRECT_URL for migrations/seeding (bypasses pooler for DDL operations)
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});
