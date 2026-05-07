import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const { id } = await params;
    const bodyUserId = await req.json().then(b => b.userId).catch(() => null);

    if (!bodyUserId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

    if (bodyUserId !== userInfo.userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const userId = bodyUserId;

    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Déjà inscrit" }, { status: 409 });
    }

    const enrollment = await db.enrollment.create({
      data: { userId, courseId: id },
    });

    await db.notification.create({
      data: {
        userId,
        type: "COURS",
        title: "Nouvelle inscription",
        message: "Vous avez été inscrit avec succès au cours.",
        link: `/courses/${id}`,
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("Enroll error:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
