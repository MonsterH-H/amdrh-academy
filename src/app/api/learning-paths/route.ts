import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    const where: Record<string, unknown> = {};
    if (role && role !== "ADMIN") {
      where.targetRole = role;
    }

    const paths = await db.learningPath.findMany({
      where,
      include: {
        courses: {
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
          orderBy: { order: "asc" },
        },
        ...(userId
          ? {
              enrollments: {
                where: { userId },
                select: { id: true, progress: true, status: true, currentCourseOrder: true, startedAt: true, completedAt: true },
              },
            }
          : {}),
      },
      orderBy: { order: "asc" },
    });

    // Add computed fields: totalDuration and courseCount
    const enrichedPaths = paths.map((path) => {
      const totalDuration = path.courses.reduce(
        (sum, pc) => sum + pc.course.duration,
        0
      );
      const courseCount = path.courses.length;
      return { ...path, totalDuration, courseCount };
    });

    return NextResponse.json({ paths: enrichedPaths });
  } catch (error) {
    console.error("Learning paths error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, learningPathId } = body;

    if (!userId || !learningPathId) {
      return NextResponse.json(
        { error: "Utilisateur et parcours requis" },
        { status: 400 }
      );
    }

    // Check if the learning path exists
    const learningPath = await db.learningPath.findUnique({
      where: { id: learningPathId },
    });

    if (!learningPath) {
      return NextResponse.json(
        { error: "Parcours de formation introuvable" },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, prenom: true, nom: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Check if user role matches targetRole
    if (user.role !== learningPath.targetRole && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Ce parcours n'est pas disponible pour votre profil" },
        { status: 403 }
      );
    }

    // Check if already enrolled
    const existing = await db.learningPathEnrollment.findUnique({
      where: {
        userId_learningPathId: { userId, learningPathId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vous êtes déjà inscrit à ce parcours" },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await db.learningPathEnrollment.create({
      data: {
        userId,
        learningPathId,
        status: "en_cours",
        progress: 0,
        currentCourseOrder: 0,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId,
        type: "COURS",
        title: "Inscription au parcours",
        message: `Vous êtes inscrit au parcours "${learningPath.title}". Bon apprentissage !`,
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("Learning path enrollment error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
