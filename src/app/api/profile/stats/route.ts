import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

// GET /api/profile/stats?userId=xxx — Profile statistics + activity timeline
export async function GET(req: NextRequest) {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    // Only allow viewing own stats (or ADMIN)
    if (userId !== userInfo.userId && userInfo.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
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
      db.enrollment.count({ where: { userId } }),
      db.enrollment.count({ where: { userId, status: "termine" } }),
      db.certificate.count({ where: { userId, status: "ACTIVE" } }),
      db.userBadge.count({ where: { userId } }),
      db.quizAttempt.count({ where: { userId, status: { in: ["REUSSI", "ECHOUE"] } } }),
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

    const hasAvatar = !!user.avatar;
    completenessDetails.push({ field: "Photo de profil", done: hasAvatar, weight: 15 });
    if (hasAvatar) completeness += 15;

    const hasBio = !!user.bio && user.bio.trim().length > 0;
    completenessDetails.push({ field: "Biographie", done: hasBio, weight: 15 });
    if (hasBio) completeness += 15;

    const hasTelephone = !!user.telephone && user.telephone.trim().length > 0;
    completenessDetails.push({ field: "Téléphone", done: hasTelephone, weight: 10 });
    if (hasTelephone) completeness += 10;

    const hasClub = !!user.club && user.club.trim().length > 0;
    completenessDetails.push({ field: "Club", done: hasClub, weight: 10 });
    if (hasClub) completeness += 10;

    const hasRegion = !!user.region && user.region.trim().length > 0;
    completenessDetails.push({ field: "Région", done: hasRegion, weight: 10 });
    if (hasRegion) completeness += 10;

    const hasLicence = !!user.licenceNumber && user.licenceNumber.trim().length > 0;
    completenessDetails.push({ field: "Numéro de licence", done: hasLicence, weight: 15 });
    if (hasLicence) completeness += 15;

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
