import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const course = await db.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, nom: true, prenom: true, avatar: true, bio: true } },
        sections: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        quiz: {
          include: {
            _count: { select: { questions: true, attempts: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    let enrollment = null;
    if (userId) {
      enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: id } },
        include: {
          lessonProgress: true,
        },
      });
    }

    return NextResponse.json({ course, enrollment });
  } catch (error) {
    console.error("Course detail error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du cours" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Check course exists
    const existing = await db.course.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    // Build update data from provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title", "description", "category", "difficulty",
      "duration", "status", "isCertifying", "passingScore", "maxAttempts",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour" },
        { status: 400 }
      );
    }

    // If title is being updated, regenerate slug
    if (updateData.title) {
      updateData.slug = (updateData.title as string)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        + "-" + Date.now().toString(36);
    }

    const course = await db.course.update({
      where: { id },
      data: updateData,
      include: {
        instructor: { select: { id: true, nom: true, prenom: true, avatar: true } },
        _count: {
          select: { enrollments: true, sections: true },
        },
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du cours" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check course exists
    const existing = await db.course.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    // Delete course - cascade will handle sections, lessons, quiz, questions, etc.
    await db.course.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Le cours "${existing.title}" a été supprimé avec succès`,
    });
  } catch (error) {
    console.error("Course delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du cours" },
      { status: 500 }
    );
  }
}
