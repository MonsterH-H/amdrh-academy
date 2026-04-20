import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
  if (!auth.authorized) return auth.response;
  try {
    const courses = await db.course.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        difficulty: true,
        enrollments: {
          select: { status: true },
        },
        quiz: {
          select: {
            attempts: {
              select: { status: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const courseStats = courses.map((c) => {
      const totalEnrollments = c.enrollments.length;
      const completedEnrollments = c.enrollments.filter(
        (e) => e.status === "termine"
      ).length;
      const allQuizAttempts = c.quiz?.attempts.filter(
        (a) => a.status === "REUSSI" || a.status === "ECHOUE"
      ) ?? [];
      const passedQuizAttempts = c.quiz?.attempts.filter(
        (a) => a.status === "REUSSI"
      ) ?? [];

      return {
        id: c.id,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        enrollmentCount: totalEnrollments,
        completionRate:
          totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0,
        passRate:
          allQuizAttempts.length > 0
            ? Math.round((passedQuizAttempts.length / allQuizAttempts.length) * 100)
            : 0,
      };
    });

    // Sort by enrollment count descending, take top 10
    courseStats.sort((a, b) => b.enrollmentCount - a.enrollmentCount);

    return NextResponse.json({ courses: courseStats.slice(0, 10) });
  } catch (error) {
    console.error("Course stats error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
