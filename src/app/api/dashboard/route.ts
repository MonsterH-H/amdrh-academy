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

    if (role === "ADMIN" || role === "FORMATEUR") {
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
        // Monthly enrollments for the last 6 months
        db.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*)::bigint as count
          FROM "Enrollment"
          WHERE "createdAt" >= NOW() - INTERVAL '6 months'
          GROUP BY month ORDER BY month
        `,
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

      const completionRate = totalCourses > 0
        ? Math.round(
            (await db.enrollment.count({ where: { status: "termine" } })) /
              (await db.enrollment.count()) *
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
        enrollmentsByMonth: enrollmentsByMonth.map((e) => ({
          month: e.month,
          count: Number(e.count),
        })),
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

    // Recommended courses
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
