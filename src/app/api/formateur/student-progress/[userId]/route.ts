import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const requestUserId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!requestUserId || !role) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Only FORMATEUR and ADMIN can access student progress
    if (role !== "FORMATEUR" && role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Fetch student profile
    const student = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, nom: true, prenom: true, telephone: true,
        avatar: true, role: true, licenceNumber: true, club: true, region: true,
        bio: true, isActive: true, emailVerified: true, lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Fetch enrollments with course data
    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true, title: true, category: true, difficulty: true,
            status: true, isCertifying: true,
          },
        },
        lessonProgress: {
          include: {
            lesson: { select: { id: true, title: true, type: true } },
          },
        },
      },
      orderBy: { lastAccessAt: "desc" },
    });

    // Fetch quiz attempts with quiz details
    const quizAttempts = await db.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true, title: true, passingScore: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 50,
    });

    // Fetch certificates
    const certificates = await db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
    });

    // Fetch badges
    const userBadges = await db.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });

    // Build activity timeline
    const timeline: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: number;
    }> = [];

    for (const enrollment of enrollments) {
      timeline.push({
        id: `enroll-${enrollment.id}`,
        type: "enrollment",
        title: "Inscription",
        description: enrollment.course.title,
        timestamp: enrollment.startedAt.getTime(),
      });
      if (enrollment.completedAt) {
        timeline.push({
          id: `complete-${enrollment.id}`,
          type: "completion",
          title: "Formation terminée",
          description: enrollment.course.title,
          timestamp: enrollment.completedAt.getTime(),
        });
      }
    }

    for (const attempt of quizAttempts) {
      const score = attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;
      timeline.push({
        id: `quiz-${attempt.id}`,
        type: "quiz",
        title: attempt.status === "REUSSI" ? "Quiz réussi" : attempt.status === "ECHOUE" ? "Quiz échoué" : "Quiz soumis",
        description: `${attempt.quiz.title} — Score: ${score}%`,
        timestamp: attempt.submittedAt?.getTime() || Date.now(),
      });
    }

    for (const cert of certificates) {
      timeline.push({
        id: `cert-${cert.id}`,
        type: "certificate",
        title: "Certificat obtenu",
        description: cert.courseTitle,
        timestamp: cert.issuedAt.getTime(),
      });
    }

    for (const ub of userBadges) {
      timeline.push({
        id: `badge-${ub.id}`,
        type: "badge",
        title: "Badge obtenu",
        description: ub.badge.name,
        timestamp: ub.earnedAt.getTime(),
      });
    }

    timeline.sort((a, b) => b.timestamp - a.timestamp);

    // Compute summary stats
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter((e) => e.status === "termine").length;
    const avgProgress = totalEnrollments > 0
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / totalEnrollments)
      : 0;
    const passedQuizzes = quizAttempts.filter((q) => q.status === "REUSSI").length;
    const avgQuizScore = quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((s, q) => s + (q.maxScore > 0 ? (q.score / q.maxScore) * 100 : 0), 0) /
            quizAttempts.length,
        )
      : 0;

    // Recommendations
    const recommendations: string[] = [];
    if (enrollments.filter((e) => e.status === "en_cours" && e.progress < 30).length > 0) {
      recommendations.push("L'apprenant a des formations peu avancées. Un rappel pourrait être utile.");
    }
    if (passedQuizzes < quizAttempts.length * 0.5 && quizAttempts.length > 2) {
      recommendations.push("Le taux de réussite aux quiz est faible. Un soutien supplémentaire est recommandé.");
    }
    if (completedEnrollments === 0 && totalEnrollments > 0) {
      recommendations.push("Aucune formation terminée. Encouragez l'apprenant à poursuivre ses cours.");
    }
    if (avgProgress >= 80 && completedEnrollments < totalEnrollments) {
      recommendations.push("Bonne progression globale ! L'apprenant est proche de terminer ses formations.");
    }

    return NextResponse.json({
      student,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        progress: e.progress,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        lastAccessAt: e.lastAccessAt,
        course: e.course,
        lessonCount: e.lessonProgress.length,
        completedLessons: e.lessonProgress.filter((lp) => lp.completed).length,
      })),
      quizAttempts: quizAttempts.map((q) => ({
        id: q.id,
        score: q.score,
        maxScore: q.maxScore,
        status: q.status,
        duration: q.duration,
        startedAt: q.startedAt,
        submittedAt: q.submittedAt,
        quiz: q.quiz,
      })),
      certificates,
      badges: userBadges.map((ub) => ({ ...ub.badge, earnedAt: ub.earnedAt })),
      timeline: timeline.slice(0, 30),
      summary: {
        totalEnrollments,
        completedEnrollments,
        avgProgress,
        passedQuizzes,
        totalQuizAttempts: quizAttempts.length,
        avgQuizScore,
        totalCertificates: certificates.length,
        totalBadges: userBadges.length,
      },
      recommendations,
    });
  } catch (error) {
    console.error("Student progress error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
