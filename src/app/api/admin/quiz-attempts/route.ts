import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const attempts = await db.quizAttempt.findMany({
      where: {
        status: { in: ["REUSSI", "ECHOUE"] },
      },
      take: limit,
      orderBy: { submittedAt: "desc" },
      include: {
        user: {
          select: { id: true, prenom: true, nom: true },
        },
        quiz: {
          select: {
            id: true,
            title: true,
            course: { select: { title: true } },
          },
        },
      },
    });

    return NextResponse.json({
      attempts: attempts.map((a) => ({
        id: a.id,
        userName: `${a.user.prenom} ${a.user.nom}`,
        quizTitle: a.quiz.title,
        courseTitle: a.quiz.course?.title ?? "",
        score: a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0,
        status: a.status,
        submittedAt: a.submittedAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("Admin quiz attempts error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
