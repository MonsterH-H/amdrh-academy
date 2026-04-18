import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

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
