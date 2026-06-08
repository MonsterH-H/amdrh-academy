import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate: only allow viewing own quiz results (or ADMIN)
    const userInfo = await getUserFromRequest(request)
    if (!userInfo) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const attemptId = searchParams.get("attemptId")
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Identifiant utilisateur requis" },
        { status: 400 }
      )
    }

    // Enforce ownership: users can only see their own results (ADMIN can see all)
    if (userId !== userInfo.userId && userInfo.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    function safeJsonParse(str: string, fallback: unknown = []): unknown {
      try { return JSON.parse(str); } catch { return fallback; }
    }

    // Get quiz with full question data
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        course: {
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz non trouvé" },
        { status: 404 }
      )
    }

    // Get attempt
    const whereClause: Record<string, string> = {
      quizId: id,
      userId,
    }
    if (attemptId) {
      whereClause.id = attemptId
    }

    const attempt = await db.quizAttempt.findFirst({
      where: whereClause,
      orderBy: { submittedAt: "desc" },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json(
        { error: "Aucune tentative trouvée" },
        { status: 404 }
      )
    }

    // Build result with correct answers and explanations
    const results = attempt.answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId)
      return {
        questionId: answer.questionId,
        questionText: question?.text || "",
        questionType: question?.type || "",
        options: question ? safeJsonParse(question.options, []) : [],
        correctAnswer: question ? safeJsonParse(question.correctAnswer, []) : [],
        selectedAnswer: safeJsonParse(answer.selectedAnswer, []),
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        maxPoints: question?.points || 0,
        explanation: question?.explanation || null,
      }
    })

    // Get all attempts for this user on this quiz
    const allAttempts = await db.quizAttempt.findMany({
      where: { quizId: id, userId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        score: true,
        maxScore: true,
        status: true,
        duration: true,
        startedAt: true,
        submittedAt: true,
      },
    })

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        passingScore: quiz.passingScore,
        showAnswers: quiz.showAnswers,
        course: quiz.course,
      },
      attempt: {
        id: attempt.id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        status: attempt.status,
        duration: attempt.duration,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      },
      results,
      allAttempts,
    })
  } catch (error) {
    console.error("Quiz result error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des résultats" },
      { status: 500 }
    )
  }
}
