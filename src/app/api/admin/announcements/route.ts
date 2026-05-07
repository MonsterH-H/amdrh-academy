import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

const VALID_TYPES = ["INFO", "URGENT", "EVENEMENT", "FORMATION", "RESULTAT"];

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type && VALID_TYPES.includes(type)) {
      where.type = type;
    }

    if (status === "PUBLISHED") {
      where.isPublished = true;
    } else if (status === "DRAFT") {
      where.isPublished = false;
    }

    // Fetch all announcements with author info
    const announcements = await db.announcement.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      announcements,
      total: announcements.length,
    });
  } catch (error) {
    console.error("Admin announcements GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { title, content, type, targetRoles, isPinned, authorId } = body;

    // Validate required fields
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Le titre et le contenu sont requis" },
        { status: 400 }
      );
    }

    // Validate type
    const announcementType = type || "INFO";
    if (!VALID_TYPES.includes(announcementType)) {
      return NextResponse.json(
        { error: `Type invalide. Types acceptés: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate targetRoles
    let parsedTargetRoles: string[] = [];
    if (Array.isArray(targetRoles)) {
      parsedTargetRoles = targetRoles;
    }

    // Create announcement
    const announcement = await db.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type: announcementType,
        targetRoles: JSON.stringify(parsedTargetRoles),
        isPinned: isPinned ?? false,
        isPublished: true, // Default to published on create
        authorId: authorId || auth.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      { announcement, message: "Annonce créée avec succès" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin announcements POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
