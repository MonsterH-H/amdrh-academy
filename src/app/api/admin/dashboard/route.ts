import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

function groupByMonth(items: Array<{ dateField: Date | null }>, field: "dateField") {
  const map = new Map<string, number>();
  for (const item of items) {
    const val = item[field];
    if (!val) continue;
    const key = val.toISOString().slice(0, 7);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map, ([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));
}

async function getTopPerformers() {
  const attempts = await db.quizAttempt.findMany({
    where: { status: "REUSSI" },
    orderBy: { score: "desc" },
    include: { user: { select: { id: true, nom: true, prenom: true, avatar: true, role: true } } },
    take: 50,
  });
  const seen = new Set<string>();
  const results: typeof attempts = [];
  for (const a of attempts) {
    if (!seen.has(a.userId)) { seen.add(a.userId); results.push(a); }
    if (results.length >= 5) break;
  }
  return results;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalUsers, activeUsers, inactiveUsers,
      totalCourses, publishedCourses, draftCourses, coursesInReview,
      totalEnrollments, activeEnrollments, completedEnrollments,
      totalCertificates, recentCertificates,
      totalQuizAttempts, passedQuizAttempts,
      totalBadges, earnedBadges,
      totalResources, totalMessages,
      usersByRole, recentUsers,
      recentEnrollments, recentQuizAttempts,
      topPerformers, enrollmentsAll, usersAll, certificatesAll,
      topCourses, unreadMessages, unverifiedUsers,
      lastSync, learningPathCount, mandatoryPaths,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isActive: false } }),
      db.course.count(),
      db.course.count({ where: { status: "PUBLIE" } }),
      db.course.count({ where: { status: "BROUILLON" } }),
      db.course.count({ where: { status: "EN_REVISION" } }),
      db.enrollment.count(),
      db.enrollment.count({ where: { status: "en_cours" } }),
      db.enrollment.count({ where: { status: "termine" } }),
      db.certificate.count(),
      db.certificate.count({ where: { issuedAt: { gte: thirtyDaysAgo } } }),
      db.quizAttempt.count(),
      db.quizAttempt.count({ where: { status: "REUSSI" } }),
      db.badge.count(),
      db.userBadge.count(),
      db.resource.count(),
      db.message.count(),
      db.user.groupBy({ by: ["role"], _count: true }),
      db.user.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 8 }),
      db.enrollment.findMany({
        where: { startedAt: { gte: sevenDaysAgo } },
        include: { user: { select: { id: true, nom: true, prenom: true, avatar: true } }, course: { select: { id: true, title: true } } },
        orderBy: { startedAt: "desc" }, take: 10,
      }),
      db.quizAttempt.findMany({
        where: { submittedAt: { gte: sevenDaysAgo } },
        include: { user: { select: { id: true, nom: true, prenom: true, avatar: true } }, quiz: { select: { id: true, title: true, course: { select: { title: true } } } } },
        orderBy: { submittedAt: "desc" }, take: 10,
      }),
      getTopPerformers(),
      db.enrollment.findMany({ where: { startedAt: { gte: sixMonthsAgo } }, select: { startedAt: true } }),
      db.user.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true } }),
      db.certificate.findMany({ where: { issuedAt: { gte: sixMonthsAgo } }, select: { issuedAt: true } }),
      db.course.findMany({
        where: { status: "PUBLIE" },
        include: { _count: { select: { enrollments: true } } },
        orderBy: { enrollments: { _count: "desc" } }, take: 5,
      }),
      db.message.count({ where: { isRead: false } }),
      db.user.count({ where: { emailVerified: false, isActive: true } }),
      db.federationSync.findFirst({ orderBy: { startedAt: "desc" } }),
      db.learningPath.count(),
      db.learningPath.count({ where: { isMandatory: true } }),
    ]);

    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
    const quizPassRate = totalQuizAttempts > 0 ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100) : 0;

    const enrollmentsByMonth = groupByMonth(enrollmentsAll as unknown as Array<{ dateField: Date }>, "dateField").map((e) => ({ month: e.month, count: e.count }));
    const usersByMonth = groupByMonth(usersAll as unknown as Array<{ dateField: Date }>, "dateField").map((e) => ({ month: e.month, count: e.count }));
    const certsByMonth = (certificatesAll as Array<{ issuedAt: Date | null }>)
      .filter((c) => c.issuedAt)
      .map((c) => ({ month: (c.issuedAt as Date).toISOString().slice(0, 7), count: 1 }));
    const certMap = new Map<string, number>();
    for (const c of certsByMonth) certMap.set(c.month, (certMap.get(c.month) || 0) + 1);
    const certificatesByMonth = Array.from(certMap, ([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      kpi: {
        totalUsers, activeUsers, inactiveUsers,
        totalCourses, publishedCourses, draftCourses, coursesInReview,
        totalEnrollments, activeEnrollments, completedEnrollments,
        totalCertificates, recentCertificates,
        totalQuizAttempts, passedQuizAttempts, totalBadges, earnedBadges,
        totalResources, totalMessages, unreadMessages, unverifiedUsers,
        totalAnnouncements: 0, learningPathCount, mandatoryPaths,
        completionRate, quizPassRate,
      },
      charts: { enrollmentsByMonth, usersByMonth, certificatesByMonth },
      usersByRole: usersByRole.map((g) => ({ role: g.role, count: (g._count as unknown as number) })),
      recentUsers, recentEnrollments, recentQuizAttempts,
      topPerformers, topCourses,
      pinnedAnnouncements: [],
      lastSync: lastSync ?? null,
    });
  } catch (error) {
    console.error("[Admin Dashboard] Error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
