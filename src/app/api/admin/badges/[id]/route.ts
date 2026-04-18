import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BadgeLevel } from "@prisma/client";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/badges/[id] — get badge with users who earned it
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;

    const badge = await db.badge.findUnique({
      where: { id },
      include: {
        userBadges: {
          include: {
            user: {
              select: { id: true, nom: true, prenom: true, email: true, role: true, avatar: true },
            },
          },
          orderBy: { earnedAt: "desc" },
        },
        _count: {
          select: { userBadges: true },
        },
      },
    });

    if (!badge) {
      return NextResponse.json({ error: "Badge introuvable" }, { status: 404 });
    }

    return NextResponse.json({ badge });
  } catch (error) {
    console.error("Admin badge GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/admin/badges/[id] — update badge
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, level, icon, criteria, points } = body;

    const existing = await db.badge.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Badge introuvable" }, { status: 404 });
    }

    // Validate level if provided
    if (level) {
      const validLevels = Object.values(BadgeLevel);
      if (!validLevels.includes(level)) {
        return NextResponse.json(
          { error: `Niveau invalide. Valeurs acceptées : ${validLevels.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const badge = await db.badge.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(level && { level }),
        ...(icon !== undefined && { icon }),
        ...(criteria !== undefined && { criteria }),
      },
    });

    return NextResponse.json({ badge });
  } catch (error) {
    console.error("Admin badge PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/admin/badges/[id] — delete badge
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;

    const existing = await db.badge.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Badge introuvable" }, { status: 404 });
    }

    await db.badge.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin badge DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
