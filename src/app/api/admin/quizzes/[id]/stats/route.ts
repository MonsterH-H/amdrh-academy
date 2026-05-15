import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;
    const { id } = await params;

    // Fetch quiz with questions and attempts
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        attempts: {
          orderBy: { submittedAt: "desc" },
          include: {
            user: { select: { id: true, prenom: true, nom: true } },
            answers: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
    }

    const submittedAttempts = quiz.attempts.filter(
      (a) => a.status === "REUSSI" || a.status === "ECHOUE"
    );
    const passedAttempts = submittedAttempts.filter((a) => a.status === "REUSSI");
    const totalAttempts = submittedAttempts.length;

    // Average score (percentage)
    const totalScorePercent = submittedAttempts.reduce((sum, a) => {
      return sum + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0);
    }, 0);
    const avgScorePercent = totalAttempts > 0 ? Math.round(totalScorePercent / totalAttempts) : 0;
    const avgScoreRaw = totalAttempts > 0
      ? Math.round(submittedAttempts.reduce((s, a) => s + a.score, 0) / totalAttempts)
      : 0;

    // Pass rate
    const passRate = totalAttempts > 0
      ? Math.round((passedAttempts.length / totalAttempts) * 100)
      : 0;

    // Completion rate (attempts started vs submitted)
    const startedAttempts = quiz.attempts.filter((a) => a.status === "EN_COURS");
    const completionRate =
      quiz.attempts.length > 0
        ? Math.round((submittedAttempts.length / quiz.attempts.length) * 100)
        : 0;

    // Average duration
    const avgDuration = totalAttempts > 0
      ? Math.round(submittedAttempts.reduce((s, a) => s + (a.duration || 0), 0) / totalAttempts)
      : 0;

    // Score distribution (buckets of 10)
    const distribution = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${(i + 1) * 10}`,
      count: 0,
    }));
    for (const a of submittedAttempts) {
      const pct = a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0;
      const bucket = Math.min(Math.floor(pct / 10), 9);
      distribution[bucket].count++;
    }

    // Most difficult questions (lowest correct rate)
    const questionCorrectCounts: Record<string, { total: number; correct: number }> = {};
    for (const q of quiz.questions) {
      questionCorrectCounts[q.id] = { total: 0, correct: 0 };
    }
    for (const a of submittedAttempts) {
      for (const answer of a.answers) {
        if (questionCorrectCounts[answer.questionId]) {
          questionCorrectCounts[answer.questionId].total++;
          if (answer.isCorrect) {
            questionCorrectCounts[answer.questionId].correct++;
          }
        }
      }
    }
    const difficultQuestions = quiz.questions
      .map((q) => {
        const counts = questionCorrectCounts[q.id] || { total: 0, correct: 0 };
        return {
          questionId: q.id,
          text: q.text,
          type: q.type,
          totalAttempts: counts.total,
          correctAttempts: counts.correct,
          correctRate: counts.total > 0 ? Math.round((counts.correct / counts.total) * 100) : 0,
          order: q.order,
        };
      })
      .filter((q) => q.totalAttempts > 0)
      .sort((a, b) => a.correctRate - b.correctRate);

    // Attempts list
    const attempts = submittedAttempts.map((a) => ({
      id: a.id,
      userName: `${a.user.prenom} ${a.user.nom}`,
      score: a.score,
      maxScore: a.maxScore,
      status: a.status,
      duration: a.duration,
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      totalAttempts,
      avgScore: avgScoreRaw,
      avgScorePercent,
      passRate,
      completionRate,
      avgDuration,
      scoreDistribution: distribution,
      difficultQuestions,
      attempts,
    });
  } catch (error) {
    console.error("Quiz stats error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
