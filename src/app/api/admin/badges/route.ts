import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BadgeLevel } from "@prisma/client";

// GET /api/admin/badges — list all badges with earned count
export async function GET() {
  try {
    const badges = await db.badge.findMany({
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Admin badges GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/admin/badges — create new badge
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, level, icon, criteria, points } = body;

    if (!name || !description || !level) {
      return NextResponse.json(
        { error: "name, description et level sont requis" },
        { status: 400 }
      );
    }

    // Validate level
    const validLevels = Object.values(BadgeLevel);
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: `Niveau invalide. Valeurs acceptées : ${validLevels.join(", ")}` },
        { status: 400 }
      );
    }

    const badge = await db.badge.create({
      data: {
        name,
        description,
        level,
        icon: icon || "🏆",
        criteria: criteria || "",
      },
    });

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    console.error("Admin badges POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
