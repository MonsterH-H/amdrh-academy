import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/traceability — detailed learner progress with audit trail
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const courseId = searchParams.get("courseId") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10")));
    const includeDetails = searchParams.get("includeDetails") === "true";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { user: { nom: { contains: search, mode: "insensitive" } } },
        { user: { prenom: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const include = {
      user: {
        select: { id: true, nom: true, prenom: true, email: true, role: true },
      },
      course: {
        select: { id: true, title: true, category: true },
      },
      lessonProgress: {
        include: {
          lesson: {
            select: { id: true, title: true, type: true, duration: true },
          },
        },
        orderBy: { viewedAt: "desc" },
      },
    };

    const [enrollments, total] = await Promise.all([
      db.enrollment.findMany({
        where,
        include,
        orderBy: { lastAccessAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.enrollment.count({ where }),
    ]);

    // Get quiz attempts for each enrollment
    const enrollmentIds = enrollments.map((e) => e.id);
    const courseIds = enrollments.map((e) => e.courseId);
    const userIds = enrollments.map((e) => e.userId);

    // Best quiz scores per enrollment
    const quizAttempts = await db.quizAttempt.findMany({
      where: {
        userId: { in: userIds },
        quiz: { courseId: { in: courseIds } },
        status: { in: ["REUSSI", "ECHOUE"] },
      },
      include: {
        quiz: { select: { courseId: true } },
      },
      orderBy: { score: "desc" },
    });

    // Group best attempts per user+course
    const bestAttempts: Record<string, { score: number; maxScore: number; status: string }> = {};
    for (const attempt of quizAttempts) {
      const key = `${attempt.userId}-${attempt.quiz.courseId}`;
      if (!bestAttempts[key]) {
        bestAttempts[key] = { score: attempt.score, maxScore: attempt.maxScore, status: attempt.status };
      }
    }

    // Certificates per user+course
    const certificates = await db.certificate.findMany({
      where: {
        userId: { in: userIds },
        courseId: { in: courseIds },
      },
      select: { id: true, userId: true, courseId: true, code: true, status: true },
    });

    const certMap: Record<string, { id: string; code: string; status: string }> = {};
    for (const cert of certificates) {
      const key = `${cert.userId}-${cert.courseId}`;
      if (!certMap[key]) {
        certMap[key] = { id: cert.id, code: cert.code, status: cert.status };
      }
    }

    // Total lessons per course
    const courseLessonCounts: Record<string, number> = {};
    const allCourses = await db.course.findMany({
      where: { id: { in: courseIds } },
      include: {
        sections: {
          include: { lessons: { select: { id: true } } },
        },
      },
    });
    for (const course of allCourses) {
      let totalLessons = 0;
      for (const section of course.sections) {
        totalLessons += section.lessons.length;
      }
      courseLessonCounts[course.id] = totalLessons;
    }

    // Stats
    const [totalEnrolled, totalCompleted, totalAbandoned] = await Promise.all([
      db.enrollment.count({ where: { status: "en_cours" } }),
      db.enrollment.count({ where: { status: "termine" } }),
      db.enrollment.count({ where: { status: "abandonne" } }),
    ]);

    // Average completion rate
    const avgProgress = await db.enrollment.aggregate({
      _avg: { progress: true },
    });

    // Average time per course (sum of timeSpent across all lesson progress / total enrollments)
    const totalTimeResult = await db.lessonProgress.aggregate({
      _sum: { timeSpent: true },
    });
    const totalEnrollmentsCount = await db.enrollment.count();
    const avgTimePerCourse = totalEnrollmentsCount > 0
      ? Math.round((totalTimeResult._sum.timeSpent || 0) / totalEnrollmentsCount)
      : 0;

    const items = enrollments.map((e) => {
      const completedLessons = e.lessonProgress.filter((lp) => lp.completed).length;
      const totalLessons = courseLessonCounts[e.courseId] || 0;
      const totalTimeSpent = e.lessonProgress.reduce((sum, lp) => sum + lp.timeSpent, 0);
      const quizKey = `${e.userId}-${e.courseId}`;
      const quiz = bestAttempts[quizKey];
      const cert = certMap[quizKey];

      return {
        id: e.id,
        userId: e.userId,
        courseId: e.courseId,
        userName: `${e.user.prenom} ${e.user.nom}`,
        userEmail: e.user.email,
        userRole: e.user.role,
        userInitials: `${e.user.prenom.charAt(0)}${e.user.nom.charAt(0)}`.toUpperCase(),
        courseTitle: e.course.title,
        courseCategory: e.course.category,
        progress: e.progress,
        status: e.status,
        completedLessons,
        totalLessons,
        totalTimeSpent,
        quizBestScore: quiz ? `${quiz.score}/${quiz.maxScore}` : null,
        quizStatus: quiz?.status || null,
        certificateId: cert?.id || null,
        certificateCode: cert?.code || null,
        certificateStatus: cert?.status || null,
        lastAccessAt: e.lastAccessAt.toISOString(),
        startedAt: e.startedAt.toISOString(),
        completedAt: e.completedAt?.toISOString() || null,
        // Include lesson details if requested
        lessonDetails: includeDetails
          ? e.lessonProgress.map((lp) => ({
              id: lp.id,
              lessonId: lp.lessonId,
              lessonTitle: lp.lesson.title,
              lessonType: lp.lesson.type,
              completed: lp.completed,
              timeSpent: lp.timeSpent,
              watchPercentage: lp.watchPercentage,
              scrollPercentage: lp.scrollPercentage,
              completionTrigger: lp.completionTrigger,
              completedAt: lp.completedAt?.toISOString() || null,
              viewedAt: lp.viewedAt.toISOString(),
            }))
          : [],
      };
    });

    return NextResponse.json({
      enrollments: items,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
      stats: {
        totalEnrolled,
        totalCompleted,
        totalAbandoned,
        avgCompletionRate: Math.round(avgProgress._avg.progress || 0),
        avgTimePerCourse,
      },
    });
  } catch (error) {
    console.error("Admin traceability error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
