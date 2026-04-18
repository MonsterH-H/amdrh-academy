import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const [
      totalUsers,
      totalActiveUsers,
      totalCourses,
      totalPublishedCourses,
      totalEnrollments,
      completedEnrollments,
      totalCertificates,
      totalQuizAttempts,
      passedQuizAttempts,
      totalBadges,
      totalMessages,
      usersByRole,
      enrollmentsByMonth,
      certificatesByMonth,
      coursesByCategory,
    ] = await Promise.all([
      // Total users
      db.user.count(),
      // Active users (logged in last 30 days)
      db.user.count({
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
      // Total enrollments
      db.enrollment.count(),
      // Completed enrollments
      db.enrollment.count({ where: { status: "termine" } }),
      // Total certificates
      db.certificate.count(),
      // Total quiz attempts
      db.quizAttempt.count(),
      // Passed quiz attempts
      db.quizAttempt.count({ where: { status: "REUSSI" } }),
      // Total badges
      db.badge.count(),
      // Total messages
      db.message.count(),
      // Users by role
      db.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      // Enrollments by month (last 6 months)
      (async () => {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const enrollments = await db.enrollment.findMany({
          where: { startedAt: { gte: sixMonthsAgo } },
          select: { startedAt: true },
        })

        const monthMap: Record<string, number> = {}
        for (const e of enrollments) {
          const monthKey = `${e.startedAt.getFullYear()}-${String(e.startedAt.getMonth() + 1).padStart(2, "0")}`
          monthMap[monthKey] = (monthMap[monthKey] || 0) + 1
        }

        return Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }))
      })(),
      // Certificates by month (last 6 months)
      (async () => {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const certs = await db.certificate.findMany({
          where: { issuedAt: { gte: sixMonthsAgo } },
          select: { issuedAt: true },
        })

        const monthMap: Record<string, number> = {}
        for (const c of certs) {
          const monthKey = `${c.issuedAt.getFullYear()}-${String(c.issuedAt.getMonth() + 1).padStart(2, "0")}`
          monthMap[monthKey] = (monthMap[monthKey] || 0) + 1
        }

        return Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }))
      })(),
      // Courses by category
      db.course.groupBy({
        by: ["category"],
        _count: { category: true },
      }),
    ])

    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0

    const quizPassRate =
      totalQuizAttempts > 0
        ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100)
        : 0

    return NextResponse.json({
      overview: {
        totalUsers,
        totalActiveUsers,
        totalCourses,
        totalPublishedCourses,
        totalEnrollments,
        completedEnrollments,
        completionRate,
        totalCertificates,
        totalQuizAttempts,
        quizPassRate,
        totalBadges,
        totalMessages,
      },
      usersByRole,
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
