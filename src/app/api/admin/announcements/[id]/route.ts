import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    // Check if announcement exists
    const existing = await db.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Annonce introuvable" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      content,
      type,
      targetRoles,
      isPinned,
      isPublished,
    } = body;

    // Build update data (only include provided fields)
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: "Le titre ne peut pas être vide" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json(
          { error: "Le contenu ne peut pas être vide" },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }

    if (type !== undefined) {
      const validTypes = ["INFO", "URGENT", "EVENEMENT", "FORMATION", "RESULTAT"];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Type invalide. Types acceptés: ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.type = type;
    }

    if (targetRoles !== undefined) {
      if (Array.isArray(targetRoles)) {
        updateData.targetRoles = JSON.stringify(targetRoles);
      }
    }

    if (isPinned !== undefined) {
      updateData.isPinned = Boolean(isPinned);
    }

    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished);
    }

    // Update announcement
    const announcement = await db.announcement.update({
      where: { id },
      data: updateData,
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
      announcement,
      message: "Annonce mise à jour avec succès",
    });
  } catch (error) {
    console.error("Admin announcements PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    // Check if announcement exists
    const existing = await db.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Annonce introuvable" },
        { status: 404 }
      );
    }

    // Delete announcement
    await db.announcement.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Annonce supprimée avec succès",
    });
  } catch (error) {
    console.error("Admin announcements DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
