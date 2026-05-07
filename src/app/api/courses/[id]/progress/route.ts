import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    // Get enrollment
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Non inscrit" }, { status: 404 });
    }

    // Get all lessons for the course with their progress
    const lessons = await db.lesson.findMany({
      where: { section: { courseId: id } },
      select: {
        id: true,
        title: true,
        type: true,
        duration: true,
        order: true,
        section: { select: { order: true, title: true } },
        progress: {
          where: { enrollmentId: enrollment.id },
          select: {
            completed: true,
            lastPosition: true,
            timeSpent: true,
            watchPercentage: true,
            scrollPercentage: true,
            completionTrigger: true,
            viewedAt: true,
            completedAt: true,
          },
          take: 1,
        },
      },
      orderBy: [
        { section: { order: "asc" } },
        { order: "asc" },
      ],
    });

    const lessonsWithProgress = lessons.map((lesson) => {
      const prog = lesson.progress[0];
      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
        completed: prog?.completed ?? false,
        timeSpent: prog?.timeSpent ?? 0,
        watchPercentage: prog?.watchPercentage ?? 0,
        scrollPercentage: prog?.scrollPercentage ?? 0,
        completionTrigger: prog?.completionTrigger ?? "manual",
        completedAt: prog?.completedAt ?? null,
        viewedAt: prog?.viewedAt ?? null,
      };
    });

    const totalTimeSpent = lessonsWithProgress.reduce(
      (sum, l) => sum + l.timeSpent,
      0
    );
    const completedLessons = lessonsWithProgress.filter(
      (l) => l.completed
    ).length;

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        progress: enrollment.progress,
        status: enrollment.status,
        startedAt: enrollment.startedAt,
        completedAt: enrollment.completedAt,
      },
      lessons: lessonsWithProgress,
      totalTimeSpent,
      completedLessons,
      totalLessons: lessons.length,
    });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { error: "Erreur de récupération" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const {
      userId,
      lessonId,
      completed,
      lastPosition,
      timeSpent,
      watchPercentage,
      scrollPercentage,
      completionTrigger,
    } = body;

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    if (userId !== userInfo.userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Non inscrit" }, { status: 404 });
    }

    // Get lesson info for auto-completion logic
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { type: true, duration: true },
    });

    // Get existing progress to handle cumulative timeSpent
    const existingProgress = await db.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
    });

    const existingTimeSpent = existingProgress?.timeSpent ?? 0;

    // Auto-completion logic
    let autoCompleted = false;
    let autoTrigger: string | null = null;

    if (lesson) {
      // Video: 90% watch → auto complete
      if (
        lesson.type === "VIDEO" &&
        watchPercentage !== undefined &&
        watchPercentage >= 90
      ) {
        autoCompleted = true;
        autoTrigger = "auto_video";
      }

      // Text: 95% scroll → auto complete
      if (
        lesson.type === "TEXTE" &&
        scrollPercentage !== undefined &&
        scrollPercentage >= 95
      ) {
        autoCompleted = true;
        autoTrigger = "auto_scroll";
      }

      // Time-based: 80% of expected duration → auto complete
      if (lesson.duration > 0) {
        const totalTime = existingTimeSpent + (timeSpent ?? 0);
        const expectedSeconds = lesson.duration * 60 * 0.8;
        if (totalTime >= expectedSeconds) {
          autoCompleted = true;
          autoTrigger = "auto_time";
        }
      }
    }

    // If explicitly marked completed, respect that too
    const isCompleted = autoCompleted || completed || false;
    const finalTrigger = autoTrigger || completionTrigger || "manual";
    const now = new Date();

    // Build update data
    const updateData: Record<string, unknown> = {
      viewedAt: now,
    };

    if (completed !== undefined && !autoCompleted) {
      updateData.completed = completed;
    } else if (autoCompleted) {
      updateData.completed = true;
    }

    if (lastPosition !== undefined) {
      updateData.lastPosition = lastPosition;
    }

    if (timeSpent !== undefined) {
      // Cumulative: add to existing
      updateData.timeSpent = existingTimeSpent + timeSpent;
    }

    if (watchPercentage !== undefined) {
      updateData.watchPercentage = watchPercentage;
    }

    if (scrollPercentage !== undefined) {
      updateData.scrollPercentage = scrollPercentage;
    }

    if (finalTrigger) {
      updateData.completionTrigger = finalTrigger;
    }

    // Set completedAt when becoming completed (auto or manual)
    if (isCompleted && !existingProgress?.completed) {
      updateData.completedAt = now;
    }

    const progress = await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: updateData,
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        completed: isCompleted,
        lastPosition: lastPosition ?? 0,
        timeSpent: timeSpent ?? 0,
        watchPercentage: watchPercentage ?? 0,
        scrollPercentage: scrollPercentage ?? 0,
        completionTrigger: finalTrigger,
        completedAt: isCompleted ? now : null,
      },
    });

    // Recalculate enrollment progress
    const allLessons = await db.lesson.findMany({
      where: { section: { courseId: id } },
      select: { id: true },
    });

    const completedLessonsCount = await db.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    });

    const newProgress =
      allLessons.length > 0
        ? Math.round((completedLessonsCount / allLessons.length) * 100)
        : 0;

    const isCourseComplete = newProgress === 100;

    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: newProgress,
        lastAccessAt: now,
        ...(isCourseComplete && enrollment.status !== "termine"
          ? { status: "termine", completedAt: now }
          : {}),
      },
    });

    return NextResponse.json({
      progress,
      enrollmentProgress: newProgress,
      autoCompleted,
      autoTrigger,
    });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Erreur de mise à jour" },
      { status: 500 }
    );
  }
}
