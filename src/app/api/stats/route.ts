import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-helpers"

function getPeriodDate(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "7":
      now.setDate(now.getDate() - 7);
      return now;
    case "30":
      now.setDate(now.getDate() - 30);
      return now;
    case "90":
      now.setMonth(now.getMonth() - 3);
      return now;
    default:
      return null; // "all" = no date filter
  }
}

function getActivePeriodDays(period: string): number {
  switch (period) {
    case "7": return 7;
    case "30": return 30;
    case "90": return 90;
    default: return 30;
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all";

  try {
    const periodDate = getPeriodDate(period);
    const activeDays = getActivePeriodDays(period);

    const dateFilter = periodDate ? { gte: periodDate } : undefined;
    const monthBack = period === "all" ? 6 : period === "90" ? 3 : period === "30" ? 1 : 0;

    const [
      totalUsers,
      activeUsersInPeriod,
      totalCourses,
      totalPublishedCourses,
      enrollmentsInPeriod,
      completedEnrollmentsAll,
      totalCertificates,
      totalQuizAttemptsInPeriod,
      passedQuizAttemptsInPeriod,
      failedQuizAttemptsInPeriod,
      totalBadges,
      totalMessages,
      usersByRole,
      usersByMonth,
      enrollmentsByMonth,
      certificatesByMonth,
      coursesByCategory,
    ] = await Promise.all([
      // Total users (all time, no date filter)
      db.user.count(),
      // Active users in period
      periodDate
        ? db.user.count({
            where: {
              lastLoginAt: { gte: periodDate },
            },
          })
        : db.user.count({
            where: {
              lastLoginAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30)),
              },
            },
          }),
      // Total courses
      db.course.count(),
      // Published courses
      db.course.count({ where: { status: "PUBLIE" } }),
      // Enrollments in period
      db.enrollment.count({
        where: dateFilter ? { startedAt: dateFilter } : undefined,
      }),
      // Completed enrollments (all time for completion rate)
      db.enrollment.count({ where: { status: "termine" } }),
      // Total certificates
      db.certificate.count(),
      // Quiz attempts in period
      db.quizAttempt.count({
        where: dateFilter
          ? { submittedAt: dateFilter }
          : undefined,
      }),
      // Passed quiz attempts in period
      db.quizAttempt.count({
        where: { ...(dateFilter && { submittedAt: dateFilter }), status: "REUSSI" },
      }),
      // Failed quiz attempts in period
      db.quizAttempt.count({
        where: { ...(dateFilter && { submittedAt: dateFilter }), status: "ECHOUE" },
      }),
      // Total badges
      db.badge.count(),
      // Total messages
      db.message.count(),
      // Users by role (always all)
      db.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      // User registrations by month
      (async () => {
        const monthsBack = Math.max(monthBack, 6);
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - monthsBack);

        const users = await db.user.findMany({
          where: { createdAt: { gte: cutoff } },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        });

        const monthMap: Record<string, number> = {};
        for (const u of users) {
          const monthKey = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, "0")}`;
          monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
        }

        return Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));
      })(),
      // Enrollments by month
      (async () => {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - Math.max(monthBack, 6));

        const enrollments = await db.enrollment.findMany({
          where: { startedAt: { gte: cutoff } },
          select: { startedAt: true },
        });

        const monthMap: Record<string, number> = {};
        for (const e of enrollments) {
          const monthKey = `${e.startedAt.getFullYear()}-${String(e.startedAt.getMonth() + 1).padStart(2, "0")}`;
          monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
        }

        return Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));
      })(),
      // Certificates by month
      (async () => {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - Math.max(monthBack, 6));

        const certs = await db.certificate.findMany({
          where: { issuedAt: { gte: cutoff } },
          select: { issuedAt: true },
        });

        const monthMap: Record<string, number> = {};
        for (const c of certs) {
          const monthKey = `${c.issuedAt.getFullYear()}-${String(c.issuedAt.getMonth() + 1).padStart(2, "0")}`;
          monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
        }

        return Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));
      })(),
      // Courses by category
      db.course.groupBy({
        by: ["category"],
        _count: { category: true },
      }),
    ]);

    const completionRate =
      completedEnrollmentsAll > 0 && totalUsers > 0
        ? Math.round((completedEnrollmentsAll / enrollmentsInPeriod) * 100)
        : 0

    // For period-specific completion rate
    const periodCompletionRate =
      enrollmentsInPeriod > 0
        ? Math.round((completedEnrollmentsAll / enrollmentsInPeriod) * 100)
        : completionRate;

    const quizPassRate =
      totalQuizAttemptsInPeriod > 0
        ? Math.round(
            (passedQuizAttemptsInPeriod / totalQuizAttemptsInPeriod) * 100
          )
        : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalActiveUsers: activeUsersInPeriod,
        activeDays,
        totalCourses,
        totalPublishedCourses,
        totalEnrollments: enrollmentsInPeriod,
        completedEnrollments: completedEnrollmentsAll,
        completionRate: periodCompletionRate,
        totalCertificates,
        totalQuizAttempts: totalQuizAttemptsInPeriod,
        quizPassRate,
        quizFailRate:
          totalQuizAttemptsInPeriod > 0
            ? Math.round((failedQuizAttemptsInPeriod / totalQuizAttemptsInPeriod) * 100)
            : 0,
        passedAttempts: passedQuizAttemptsInPeriod,
        failedAttempts: failedQuizAttemptsInPeriod,
        totalBadges,
        totalMessages,
      },
      usersByRole,
      usersByMonth,
      enrollmentsByMonth,
      certificatesByMonth,
      coursesByCategory,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  }
}
