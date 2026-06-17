import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * GET /api/messages/users?search=...&limit=...
 * Search users for creating new conversations.
 * Accessible to ANY authenticated user (not just admins).
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "15"), 50);

    const where: Record<string, unknown> = {
      id: { not: auth.userId },
      isActive: true,
    };

    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { prenom: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        nom: true,
        prenom: true,
        role: true,
        club: true,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Messages user search error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
