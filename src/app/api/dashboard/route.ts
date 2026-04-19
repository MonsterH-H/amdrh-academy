import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId || !role) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    if (role === "ADMIN") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [
        totalUsers,
        totalCourses,
        totalCertificates,
        recentUsers,
        enrollmentsByMonth,
        roleDistribution,
        completionByCategory,
        popularCourses,
      ] = await Promise.all([
        db.user.count({ where: { isActive: true } }),
        db.course.count({ where: { status: "PUBLIE" } }),
        db.certificate.count(),
        db.user.findMany({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, nom: true, prenom: true, email: true, role: true, createdAt: true },
        }),
        // Monthly enrollments for the last 6 months (SQLite compatible)
        db.enrollment.findMany({
          where: { startedAt: { gte: sixMonthsAgo } },
          select: { startedAt: true, id: true },
        }),
        db.user.groupBy({
          by: ["role"],
          _count: { role: true },
        }),
        db.course.findMany({
          where: { status: "PUBLIE" },
          select: {
            category: true,
            enrollments: { where: { status: "termine" }, select: { id: true } },
          },
        }),
        db.course.findMany({
          where: { status: "PUBLIE" },
          select: {
            id: true,
            title: true,
            category: true,
            _count: { select: { enrollments: true } },
          },
          orderBy: { enrollments: { _count: "desc" } },
          take: 5,
        }),
      ]);

      // Group enrollments by month
      const monthMap: Record<string, number> = {};
      for (const e of enrollmentsByMonth) {
        const month = e.startedAt.toISOString().slice(0, 7); // YYYY-MM
        monthMap[month] = (monthMap[month] || 0) + 1;
      }
      const enrollmentsMonthly = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }));

      const completionRate = totalCourses > 0
        ? Math.round(
            (await db.enrollment.count({ where: { status: "termine" } })) /
              Math.max(1, await db.enrollment.count()) *
              100
          )
        : 0;

      return NextResponse.json({
        type: "admin",
        stats: {
          totalUsers,
          totalCourses,
          totalCertificates,
          completionRate: Math.max(0, completionRate),
        },
        recentUsers,
        enrollmentsByMonth: enrollmentsMonthly,
        roleDistribution: roleDistribution.map((r) => ({
          role: r.role,
          count: r._count.role,
        })),
        completionByCategory: completionByCategory.map((c) => ({
          category: c.category,
          completed: c.enrollments.length,
        })),
        popularCourses,
      });
    }

    // Formateur dashboard
    if (role === "FORMATEUR") {
      const myCourses = await db.course.findMany({
        where: { instructorId: userId },
        include: {
          _count: { select: { enrollments: true } },
          enrollments: {
            select: {
              id: true,
              progress: true,
              status: true,
              startedAt: true,
              user: { select: { id: true, prenom: true, nom: true, avatar: true, role: true } },
            },
            orderBy: { lastAccessAt: "desc" },
            take: 20,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const allEnrollments = myCourses.flatMap((c) =>
        c.enrollments.map((e) => ({
          ...e,
          courseTitle: c.title,
          courseId: c.id,
        }))
      );
      const recentLearners = allEnrollments
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
        .slice(0, 8);

      const totalEnrollments = myCourses.reduce((sum, c) => sum + c._count.enrollments, 0);
      const allProgressValues = myCourses.flatMap((c) => c.enrollments.map((e) => e.progress));
      const avgCompletion = allProgressValues.length > 0
        ? Math.round(allProgressValues.reduce((s, p) => s + p, 0) / allProgressValues.length)
        : 0;

      const myCourseIds = myCourses.map((c) => c.id);
      const passedQuizzes = myCourseIds.length > 0
        ? await db.quizAttempt.count({
            where: {
              quiz: { courseId: { in: myCourseIds } },
              status: "REUSSI",
            },
          })
        : 0;

      const courseStatsMap = await Promise.all(
        myCourseIds.map(async (courseId) => {
          const attempts = await db.quizAttempt.findMany({
            where: { quiz: { courseId }, status: "REUSSI" },
            select: { score: true, maxScore: true },
          });
          const cAvgScore = attempts.length > 0
            ? Math.round(
                attempts.reduce((acc, a) => acc + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0), 0) /
                  attempts.length
              )
            : 0;
          const courseEnrollments = myCourses.find((c) => c.id === courseId)?.enrollments || [];
          const completionRate = courseEnrollments.length > 0
            ? Math.round(courseEnrollments.reduce((s, e) => s + e.progress, 0) / courseEnrollments.length)
            : 0;
          return { courseId, avgScore: cAvgScore, completionRate };
        })
      );

      const scoredCourses = courseStatsMap.filter((c) => c.avgScore > 0);
      const avgScore = scoredCourses.length > 0
        ? Math.round(scoredCourses.reduce((s, c) => s + c.avgScore, 0) / scoredCourses.length)
        : 0;

      return NextResponse.json({
        type: "formateur",
        stats: {
          totalCourses: myCourses.length,
          totalEnrollments,
          avgCompletion,
          passedQuizzes,
          avgScore,
        },
        myCourses: myCourses.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          difficulty: c.difficulty,
          duration: c.duration,
          status: c.status,
          isCertifying: c.isCertifying,
          enrollmentCount: c._count.enrollments,
          avgScore: courseStatsMap.find((cs) => cs.courseId === c.id)?.avgScore || 0,
          completionRate: courseStatsMap.find((cs) => cs.courseId === c.id)?.completionRate || 0,
        })),
        recentLearners,
      });
    }

    // Learner dashboard
    const [
      enrollments,
      certificates,
      badges,
      quizAttempts,
      recentActivity,
    ] = await Promise.all([
      db.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              difficulty: true,
              coverImage: true,
              duration: true,
              instructor: { select: { nom: true, prenom: true } },
            },
          },
        },
        orderBy: { lastAccessAt: "desc" },
      }),
      db.certificate.findMany({
        where: { userId },
        orderBy: { issuedAt: "desc" },
      }),
      db.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      }),
      db.quizAttempt.findMany({
        where: { userId },
        orderBy: { submittedAt: "desc" },
        take: 10,
        include: {
          quiz: { select: { title: true, course: { select: { title: true } } } },
        },
      }),
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const coursesEnCours = enrollments.filter((e) => e.status === "en_cours").length;
    const coursesTermines = enrollments.filter((e) => e.status === "termine").length;
    const avgScore =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((acc, a) => acc + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0), 0) /
              quizAttempts.length
          )
        : 0;

    const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const recommended = await db.course.findMany({
      where: {
        status: "PUBLIE",
        category:
          user?.role === "ARBITRE"
            ? "ARBITRAGE"
            : user?.role === "ENTRAINEUR"
            ? "ENTRAINEMENT"
            : user?.role === "JOUEUR"
            ? "JOUEURS"
            : undefined,
        id: { notIn: enrolledCourseIds },
      },
      take: 4,
      include: {
        instructor: { select: { nom: true, prenom: true } },
        _count: { select: { enrollments: true } },
      },
    });

    return NextResponse.json({
      type: "learner",
      stats: {
        coursesEnCours,
        coursesTermines,
        certificatesCount: certificates.length,
        avgScore,
      },
      enrollments,
      certificates,
      badges,
      quizAttempts,
      recommended,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Erreur dashboard" }, { status: 500 });
  }
}
