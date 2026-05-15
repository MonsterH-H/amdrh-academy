import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth-helpers";

// ──────────────────────────────────────────────────
// GET: Single announcement
// ──────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const announcement = await db.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, prenom: true, nom: true, role: true } },
      },
    });

    if (!announcement) {
      return NextResponse.json({ error: "Annonce non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Announcement get error:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────
// PUT: Update announcement
// ──────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const body = await req.json();

    const existing = await db.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Annonce non trouvée" }, { status: 404 });
    }

    // FORMATEUR can only edit their own announcements
    if (auth.role === "FORMATEUR" && existing.authorId !== auth.userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const validTypes = ["INFO", "URGENT", "EVENEMENT", "MAINTENANCE"];
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    if (body.type !== undefined && validTypes.includes(body.type)) updates.type = body.type;
    if (body.targetRoles !== undefined) updates.targetRoles = body.targetRoles;
    if (body.isPinned !== undefined) updates.isPinned = body.isPinned;
    if (body.isPublished !== undefined) updates.isPublished = body.isPublished;
    if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    const announcement = await db.announcement.update({
      where: { id },
      data: updates,
      include: {
        author: { select: { id: true, prenom: true, nom: true, role: true } },
      },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Announcement update error:", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────
// DELETE: Delete announcement
// ──────────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    const existing = await db.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Annonce non trouvée" }, { status: 404 });
    }

    // FORMATEUR can only delete their own
    if (auth.role === "FORMATEUR" && existing.authorId !== auth.userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    await db.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Announcement delete error:", error);
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
