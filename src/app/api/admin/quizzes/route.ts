import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { course: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const [quizzes, total, courses] = await Promise.all([
      db.quiz.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          courseId: true,
          duration: true,
          passingScore: true,
          shuffleQuestions: true,
          showAnswers: true,
          maxAttempts: true,
          createdAt: true,
          course: {
            select: { title: true, category: true, slug: true },
          },
          questions: { select: { id: true }, orderBy: { order: "asc" } },
          attempts: {
            select: { id: true, score: true, maxScore: true, status: true },
          },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.quiz.count({ where }),
      db.course.findMany({
        select: { id: true, title: true, category: true },
        orderBy: { title: "asc" },
      }),
    ]);

    // Compute stats per quiz
    const enrichedQuizzes = quizzes.map((q) => {
      const attempts = q.attempts;
      const submittedAttempts = attempts.filter(
        (a) => a.status === "REUSSI" || a.status === "ECHOUE"
      );
      const passedAttempts = attempts.filter((a) => a.status === "REUSSI");
      const totalScore = submittedAttempts.reduce(
        (sum, a) => sum + a.score,
        0
      );
      const totalMaxScore = submittedAttempts.reduce(
        (sum, a) => sum + a.maxScore,
        0
      );

      return {
        id: q.id,
        title: q.title,
        description: q.description,
        courseId: q.courseId,
        duration: q.duration,
        passingScore: q.passingScore,
        shuffleQuestions: q.shuffleQuestions,
        showAnswers: q.showAnswers,
        maxAttempts: q.maxAttempts,
        createdAt: q.createdAt,
        course: q.course,
        questionCount: q._count.questions,
        attemptCount: q._count.attempts,
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
      };
    });

    return NextResponse.json({
      quizzes: enrichedQuizzes,
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin quizzes list error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, courseId, description, duration, passingScore, shuffleQuestions, showAnswers, maxAttempts } = body;

    if (!title || !courseId) {
      return NextResponse.json(
        { error: "Titre et cours sont requis" },
        { status: 400 }
      );
    }

    // Check if quiz already exists for this course
    const existing = await db.quiz.findUnique({ where: { courseId } });
    if (existing) {
      return NextResponse.json(
        { error: "Un quiz existe déjà pour ce cours" },
        { status: 409 }
      );
    }

    const quiz = await db.quiz.create({
      data: {
        title,
        courseId,
        description: description || null,
        duration: duration || 30,
        passingScore: passingScore || 70,
        shuffleQuestions: shuffleQuestions ?? true,
        showAnswers: showAnswers ?? true,
        maxAttempts: maxAttempts || 3,
      },
      include: {
        course: { select: { title: true, category: true } },
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error("Admin quiz create error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
