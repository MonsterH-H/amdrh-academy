import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/auth/check — Diagnostic endpoint to verify DB connectivity
 * and list available users (without password hashes).
 */
export async function GET() {
  try {
    // Test DB connection
    await db.$queryRaw`SELECT 1 as ok`;

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const tables = await db.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    ` as { table_name: string }[];

    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount: users.length,
      users: users.map((u) => ({
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        lastLogin: u.lastLoginAt,
      })),
      tables: tables.map((t) => t.table_name),
      environment: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
  } catch (error) {
    console.error("[Auth Check] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : String(error),
        environment: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      { status: 503 }
    );
  }
}
