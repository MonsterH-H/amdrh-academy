import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

const VALID_TYPES = ["INFO", "URGENT", "EVENEMENT", "FORMATION", "RESULTAT"];

export async function GET(req: NextRequest) {
  try {
    // Get user info from query params (lightweight auth check)
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return NextResponse.json(
        { error: "Paramètres utilisateur manquants" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const userRole = userInfo.role;

    // Build where clause
    const where: Record<string, unknown> = {
      isPublished: true,
    };

    // Filter by type
    if (type && VALID_TYPES.includes(type)) {
      where.type = type;
    }

    // Fetch all published announcements
    const allAnnouncements = await db.announcement.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        isPinned: true,
        targetRoles: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Filter by target roles on the server side
    // If targetRoles is empty array or not parseable, it's visible to everyone
    const filteredAnnouncements = allAnnouncements.filter((announcement) => {
      try {
        const targetRoles: string[] = JSON.parse(announcement.targetRoles);
        if (targetRoles.length === 0) return true; // Visible to all roles
        return targetRoles.includes(userRole);
      } catch {
        return true; // If can't parse, visible to all
      }
    });

    return NextResponse.json({
      announcements: filteredAnnouncements,
      total: filteredAnnouncements.length,
    });
  } catch (error) {
    console.error("Announcements GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
