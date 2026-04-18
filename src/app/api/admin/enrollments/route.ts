import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const enrollments = await db.enrollment.findMany({
      take: limit,
      orderBy: { startedAt: "desc" },
      include: {
        user: {
          select: { id: true, prenom: true, nom: true, email: true, role: true },
        },
        course: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({
      enrollments: enrollments.map((e) => ({
        id: e.id,
        userName: `${e.user.prenom} ${e.user.nom}`,
        userEmail: e.user.email,
        userRole: e.user.role,
        courseTitle: e.course.title,
        status: e.status,
        progress: e.progress,
        createdAt: e.startedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin enrollments error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
