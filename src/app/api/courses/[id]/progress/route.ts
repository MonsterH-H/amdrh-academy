import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, lessonId, completed, lastPosition } = await req.json();

    if (!userId || !lessonId) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Non inscrit" }, { status: 404 });
    }

    const progress = await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        completed: completed || undefined,
        lastPosition: lastPosition !== undefined ? lastPosition : undefined,
        viewedAt: new Date(),
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        completed: completed || false,
        lastPosition: lastPosition || 0,
      },
    });

    // Recalculate enrollment progress
    const allLessons = await db.lesson.findMany({
      where: { section: { courseId: id } },
      select: { id: true },
    });

    const completedLessons = await db.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    });

    const newProgress = allLessons.length > 0
      ? Math.round((completedLessons / allLessons.length) * 100)
      : 0;

    const isComplete = newProgress === 100;

    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: newProgress,
        lastAccessAt: new Date(),
        ...(isComplete ? { status: "termine", completedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ progress, enrollmentProgress: newProgress });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}
