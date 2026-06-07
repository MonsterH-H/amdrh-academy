import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

/**
 * GET /api/learner/quizzes
 * Returns all quizzes from courses the learner is enrolled in,
 * along with their best attempt (if any) and attempt count.
 */
export async function GET(req: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const { userId } = userInfo;

    // Fetch enrollments with quiz data and attempt info
    const enrollments = await db.enrollment.findMany({
      where: {
        userId,
        status: { in: ["en_cours", "termine"] },
        course: {
          status: "PUBLIE",
          quiz: { isNot: null },
        },
      },
      select: {
        id: true,
        courseId: true,
        progress: true,
        status: true,
        startedAt: true,
        completedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            coverImage: true,
            isCertifying: true,
            passingScore: true,
            maxAttempts: true,
            quiz: {
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                passingScore: true,
                maxAttempts: true,
                shuffleQuestions: true,
                showAnswers: true,
                questions: {
                  select: { id: true, points: true },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
      orderBy: { lastAccessAt: "desc" },
    });

    // For each enrollment, get best attempt and total attempts
    const quizItems = await Promise.all(
      enrollments.map(async (enrollment) => {
        const quiz = enrollment.course.quiz!;
        const maxScore = quiz.questions.reduce((acc, q) => acc + q.points, 0);

        const attempts = await db.quizAttempt.findMany({
          where: { userId, quizId: quiz.id },
          select: {
            id: true,
            score: true,
            maxScore: true,
            status: true,
            startedAt: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: "desc" },
        });

        const completedAttempts = attempts.filter(
          (a) => a.status === "REUSSI" || a.status === "ECHOUE"
        );
        const bestAttempt =
          completedAttempts.length > 0
            ? completedAttempts.reduce((best, a) =>
                a.score > best.score ? a : best
              )
            : null;

        return {
          quizId: quiz.id,
          courseId: enrollment.course.id,
          quizTitle: quiz.title,
          quizDescription: quiz.description,
          courseTitle: enrollment.course.title,
          courseCategory: enrollment.course.category,
          courseDifficulty: enrollment.course.difficulty,
          courseCoverImage: enrollment.course.coverImage,
          courseIsCertifying: enrollment.course.isCertifying,
          duration: quiz.duration,
          passingScore: quiz.passingScore,
          maxAttempts: quiz.maxAttempts,
          totalQuestions: quiz.questions.length,
          maxScore,
          enrollmentStatus: enrollment.status,
          enrollmentProgress: enrollment.progress,
          attemptsUsed: completedAttempts.length,
          attemptsRemaining: Math.max(0, quiz.maxAttempts - completedAttempts.length),
          bestScore: bestAttempt?.score ?? null,
          bestScorePercentage: bestAttempt
            ? Math.round((bestAttempt.score / bestAttempt.maxScore) * 100)
            : null,
          bestStatus: bestAttempt?.status ?? null,
          lastAttemptDate: bestAttempt?.submittedAt ?? null,
        };
      })
    );

    return NextResponse.json({ quizzes: quizItems });
  } catch (error) {
    console.error("Learner quizzes fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des quiz" },
      { status: 500 }
    );
  }
}
