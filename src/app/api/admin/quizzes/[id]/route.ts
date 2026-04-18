import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;

    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        course: { select: { title: true, category: true } },
        questions: { orderBy: { order: "asc" } },
        attempts: {
          select: { id: true, score: true, maxScore: true, status: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz introuvable" },
        { status: 404 }
      );
    }

    const submittedAttempts = quiz.attempts.filter(
      (a) => a.status === "REUSSI" || a.status === "ECHOUE"
    );
    const passedAttempts = quiz.attempts.filter((a) => a.status === "REUSSI");
    const totalScore = submittedAttempts.reduce((s, a) => s + a.score, 0);
    const totalMaxScore = submittedAttempts.reduce(
      (s, a) => s + a.maxScore,
      0
    );

    const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);

    return NextResponse.json({
      quiz: {
        ...quiz,
        totalPoints,
        stats: {
          passRate:
            submittedAttempts.length > 0
              ? Math.round(
                  (passedAttempts.length / submittedAttempts.length) * 100
                )
              : 0,
          avgScore:
            totalMaxScore > 0
              ? Math.round((totalScore / totalMaxScore) * 100)
              : 0,
          submittedCount: submittedAttempts.length,
        },
      },
    });
  } catch (error) {
    console.error("Admin quiz detail error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const body = await req.json();

    const { title, description, duration, passingScore, shuffleQuestions, showAnswers, maxAttempts } = body;

    // Build update data from provided fields
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (duration !== undefined) data.duration = duration;
    if (passingScore !== undefined) data.passingScore = passingScore;
    if (shuffleQuestions !== undefined) data.shuffleQuestions = shuffleQuestions;
    if (showAnswers !== undefined) data.showAnswers = showAnswers;
    if (maxAttempts !== undefined) data.maxAttempts = maxAttempts;

    const quiz = await db.quiz.update({
      where: { id },
      data,
      include: { course: { select: { title: true, category: true } } },
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Admin quiz update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;

    // Delete quiz answers first (through cascade), then attempts, then questions, then quiz
    await db.quizAnswer.deleteMany({
      where: { question: { quizId: id } },
    });
    await db.quizAttempt.deleteMany({ where: { quizId: id } });
    await db.question.deleteMany({ where: { quizId: id } });
    await db.quiz.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin quiz delete error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
