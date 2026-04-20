import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/profile/stats?userId=xxx — Profile statistics + activity timeline
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    // Fetch user profile info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        avatar: true,
        telephone: true,
        club: true,
        region: true,
        bio: true,
        licenceNumber: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Parallel queries for stats
    const [
      enrollments,
      completedEnrollments,
      certificates,
      badges,
      quizAttempts,
      recentNotifications,
    ] = await Promise.all([
      // Total enrollments
      db.enrollment.count({ where: { userId } }),
      // Completed enrollments
      db.enrollment.count({ where: { userId, status: "termine" } }),
      // Certificates earned
      db.certificate.count({ where: { userId, status: "ACTIVE" } }),
      // Badges earned
      db.userBadge.count({ where: { userId } }),
      // Total quiz attempts
      db.quizAttempt.count({ where: { userId, status: { in: ["REUSSI", "ECHOUE"] } } }),
      // Recent activity (last 10 notifications)
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate profile completeness
    let completeness = 0;
    const completenessDetails: { field: string; done: boolean; weight: number }[] = [];

    // Has avatar: 15%
    const hasAvatar = !!user.avatar;
    completenessDetails.push({ field: "Photo de profil", done: hasAvatar, weight: 15 });
    if (hasAvatar) completeness += 15;

    // Has bio: 15%
    const hasBio = !!user.bio && user.bio.trim().length > 0;
    completenessDetails.push({ field: "Biographie", done: hasBio, weight: 15 });
    if (hasBio) completeness += 15;

    // Has telephone: 10%
    const hasTelephone = !!user.telephone && user.telephone.trim().length > 0;
    completenessDetails.push({ field: "Téléphone", done: hasTelephone, weight: 10 });
    if (hasTelephone) completeness += 10;

    // Has club: 10%
    const hasClub = !!user.club && user.club.trim().length > 0;
    completenessDetails.push({ field: "Club", done: hasClub, weight: 10 });
    if (hasClub) completeness += 10;

    // Has region: 10%
    const hasRegion = !!user.region && user.region.trim().length > 0;
    completenessDetails.push({ field: "Région", done: hasRegion, weight: 10 });
    if (hasRegion) completeness += 10;

    // Has licence number: 15%
    const hasLicence = !!user.licenceNumber && user.licenceNumber.trim().length > 0;
    completenessDetails.push({ field: "Numéro de licence", done: hasLicence, weight: 15 });
    if (hasLicence) completeness += 15;

    // Email verified: 25%
    const emailVerified = user.emailVerified;
    completenessDetails.push({ field: "Email vérifié", done: emailVerified, weight: 25 });
    if (emailVerified) completeness += 25;

    return NextResponse.json({
      user,
      stats: {
        enrollments,
        completedEnrollments,
        certificates,
        badges,
        quizAttempts,
      },
      completeness: {
        percentage: completeness,
        details: completenessDetails,
      },
      recentActivity: recentNotifications,
    });
  } catch (error) {
    console.error("Profile stats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
