import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const quizId = searchParams.get("quizId");

    const where: Record<string, unknown> = {};
    if (quizId) where.quizId = quizId;

    const [attempts, total] = await Promise.all([
      db.quizAttempt.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startedAt: "desc" },
        include: {
          user: {
            select: { id: true, prenom: true, nom: true, avatar: true },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              course: { select: { title: true } },
            },
          },
        },
      }),
      db.quizAttempt.count({ where }),
    ]);

    // Compute attempt numbers: for each attempt, count how many attempts the same user has for the same quiz
    const attemptNumbers: Record<string, number> = {};
    // We need to get ALL attempt ids for the same user+quiz to compute the attempt number
    // But that's expensive. Instead, we fetch counts per (userId, quizId) pair from the DB
    const userQuizPairs = attempts.map((a) => ({
      userId: a.userId,
      quizId: a.quizId,
      attemptId: a.id,
      startedAt: a.startedAt,
    }));

    // For each attempt, count how many attempts exist for the same user+quiz with startedAt <= this attempt's startedAt
    const numberPromises = userQuizPairs.map(async ({ userId, quizId, attemptId, startedAt }) => {
      const count = await db.quizAttempt.count({
        where: {
          userId,
          quizId,
          startedAt: { lte: startedAt },
        },
      });
      return { attemptId, number: count };
    });

    const numbers = await Promise.all(numberPromises);
    for (const n of numbers) {
      attemptNumbers[n.attemptId] = n.number;
    }

    return NextResponse.json({
      attempts: attempts.map((a) => ({
        id: a.id,
        userId: a.user.id,
        userName: `${a.user.prenom} ${a.user.nom}`,
        userPrenom: a.user.prenom,
        userNom: a.user.nom,
        userAvatar: a.user.avatar,
        quizTitle: a.quiz.title,
        courseTitle: a.quiz.course?.title ?? "",
        score: a.score,
        maxScore: a.maxScore,
        scorePercent: a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0,
        status: a.status,
        duration: a.duration,
        startedAt: a.startedAt.toISOString(),
        submittedAt: a.submittedAt?.toISOString() ?? null,
        attemptNumber: attemptNumbers[a.id] || 1,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin quiz attempts error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
