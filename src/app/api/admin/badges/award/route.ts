import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// POST /api/admin/badges/award — award a badge to a user
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const body = await req.json();
    const { userId, badgeId } = body;

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: "userId et badgeId sont requis" },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Check badge exists
    const badge = await db.badge.findUnique({ where: { id: badgeId } });
    if (!badge) {
      return NextResponse.json({ error: "Badge introuvable" }, { status: 404 });
    }

    // Check if already earned
    const existing = await db.userBadge.findUnique({
      where: {
        userId_badgeId: { userId, badgeId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cet utilisateur possède déjà ce badge" },
        { status: 409 }
      );
    }

    // Award badge
    const userBadge = await db.userBadge.create({
      data: { userId, badgeId },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId,
        type: "BADGE",
        title: "Nouveau badge obtenu !",
        message: `Vous avez obtenu le badge "${badge.name}". Félicitations !`,
      },
    });

    return NextResponse.json({ userBadge }, { status: 201 });
  } catch (error) {
    console.error("Admin badge award POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
