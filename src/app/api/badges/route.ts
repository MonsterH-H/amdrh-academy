import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const badges = await db.userBadge.findMany({
      where: { userId: userInfo.userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });

    const allBadges = await db.badge.findMany({
      orderBy: { level: "asc" },
    });

    return NextResponse.json({
      earnedBadges: badges,
      allBadges,
    });
  } catch (error) {
    console.error("Badges error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
