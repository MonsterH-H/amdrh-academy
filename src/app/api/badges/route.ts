import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

    const badges = await db.userBadge.findMany({
      where: { userId },
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
